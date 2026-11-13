/* GameHiHi Scores SDK — game gửi điểm về GameHiHi Game Manager (lưu trong D1). Tài liệu: docs/SCORES_API.md
 *
 *   <script src="https://<manager>/sdk/gamehihi-scores.js"></script>
 *   GameHiHiScores.submit(1234).then(function (r) { console.log('Hạng', r.rank, '/', r.players); });
 *
 * Tự nhận game từ URL: /games/<slug>/ -> kênh live, /preview/<deploymentId>/ -> kênh preview.
 * Người chơi mặc định là ID ẩn danh lưu trong localStorage; game gọi setPlayer(), hoặc trang cha gửi
 * postMessage({ type: 'gamehihi:player', id, name }) để đặt lại.
 */
(function (root) {
  'use strict';
  if (root.GameHiHiScores) return;

  var VERSION = '1.0.0';
  // Worker manager thay chuỗi này bằng origin của chính nó khi phục vụ file.
  var API_BASE = 'https://gamehihi-game-manager.joydigicoder.workers.dev';
  var KEY_ID = 'gamehihi.scores.playerId';
  var KEY_NAME = 'gamehihi.scores.playerName';
  var PLAYER_ID_RE = /^[A-Za-z0-9_.:-]{1,64}$/;
  var script = document.currentScript;

  function attr(name) {
    return (script && script.getAttribute(name)) || '';
  }
  function trimSlash(s) {
    return String(s || '').replace(/\/+$/, '');
  }
  function defaultApiBase() {
    if (attr('data-api')) return trimSlash(attr('data-api'));
    if (/^https?:\/\//.test(API_BASE)) return trimSlash(API_BASE);
    try { return new URL(script.src).origin; } catch (e) { return ''; }
  }
  function detectTarget() {
    if (attr('data-game')) return { game: attr('data-game').toLowerCase() };
    var path = (root.location && root.location.pathname) || '';
    var g = /^\/games\/([a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?)(\/|$)/.exec(path);
    if (g) return { game: g[1] };
    var p = /^\/preview\/([A-Za-z0-9_-]{8,100})(\/|$)/.exec(path);
    if (p) return { deployment: p[1] };
    return {};
  }
  function storageGet(key) {
    try { return root.localStorage.getItem(key) || ''; } catch (e) { return ''; }
  }
  function storageSet(key, value) {
    try { root.localStorage.setItem(key, value); } catch (e) {}
  }
  function randomId() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789', out = 'anon_', bytes = new Uint8Array(20);
    root.crypto.getRandomValues(bytes);
    for (var i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
    return out;
  }
  function cleanName(v) {
    return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }
  function makeError(code, message, status) {
    var e = new Error(message);
    e.code = code;
    e.status = status || 0;
    return e;
  }

  var target = detectTarget();
  var state = {
    apiBase: defaultApiBase(),
    game: target.game || '',
    deployment: target.deployment || '',
    board: attr('data-board') || 'default',
    player: { id: storageGet(KEY_ID), name: storageGet(KEY_NAME) }
  };
  if (!PLAYER_ID_RE.test(state.player.id)) {
    state.player.id = randomId();
    storageSet(KEY_ID, state.player.id);
  }

  function targetParams() {
    if (state.deployment) return { deployment: state.deployment };
    if (state.game) return { game: state.game };
    throw makeError('no_game', 'Không xác định được game: chạy game tại /games/<slug>/ hoặc gọi GameHiHiScores.init({ game: "<slug>" }).');
  }
  function query(params) {
    var parts = [];
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k) && params[k] !== undefined && params[k] !== null && params[k] !== '') {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    return parts.length ? '?' + parts.join('&') : '';
  }
  function request(method, path, body) {
    if (!state.apiBase) return Promise.reject(makeError('no_api', 'Chưa có địa chỉ API: gọi GameHiHiScores.init({ apiBase: "https://..." }).'));
    var init = { method: method, credentials: 'omit', headers: { Accept: 'application/json' } };
    if (body !== undefined) {
      // text/plain là "simple request": trình duyệt không phải gửi preflight OPTIONS.
      init.headers['Content-Type'] = 'text/plain;charset=UTF-8';
      init.body = JSON.stringify(body);
    }
    return fetch(state.apiBase + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data;
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { ok: false, code: 'bad_response', message: text.slice(0, 200) }; }
        if (!res.ok || data.ok === false) throw makeError(data.code || 'http_' + res.status, data.message || 'HTTP ' + res.status, res.status);
        return data;
      });
    });
  }
  /** Thử lại khi lỗi mạng hoặc 5xx; lỗi 4xx (dữ liệu sai, bị chặn, gửi quá nhanh) trả về ngay. */
  function withRetry(fn, attempts, delayMs) {
    return fn().catch(function (err) {
      if (attempts <= 1 || (err.status && err.status < 500)) throw err;
      return new Promise(function (resolve) { setTimeout(resolve, delayMs); }).then(function () {
        return withRetry(fn, attempts - 1, delayMs * 2);
      });
    });
  }
  function notifyParent(message) {
    try { if (root.parent && root.parent !== root) root.parent.postMessage(message, '*'); } catch (e) {}
  }

  function getPlayer() {
    return { id: state.player.id, name: state.player.name };
  }
  function setPlayer(player, options) {
    player = player || {};
    var persist = !options || options.persist !== false;
    if (player.id !== undefined && player.id !== null && player.id !== '') {
      var id = String(player.id);
      if (!PLAYER_ID_RE.test(id)) throw makeError('invalid_player_id', 'player id: 1–64 ký tự gồm chữ, số và . _ : - (không dùng email).');
      state.player.id = id;
      if (persist) storageSet(KEY_ID, id);
    }
    if (player.name !== undefined) {
      state.player.name = cleanName(player.name);
      if (persist) storageSet(KEY_NAME, state.player.name);
    }
    return getPlayer();
  }
  function config() {
    return { version: VERSION, apiBase: state.apiBase, game: state.game, deployment: state.deployment, channel: state.deployment ? 'preview' : 'live', board: state.board, player: getPlayer() };
  }
  function init(options) {
    options = options || {};
    if (options.apiBase) state.apiBase = trimSlash(options.apiBase);
    if (options.game) {
      state.game = String(options.game).toLowerCase();
      state.deployment = '';
    }
    if (options.deployment) state.deployment = String(options.deployment);
    if (options.board) state.board = String(options.board);
    if (options.player) setPlayer(options.player, { persist: options.persistPlayer !== false });
    return config();
  }

  /** Gửi một lượt điểm. opts: { board, durationMs, meta, beacon }. */
  function submit(score, opts) {
    opts = opts || {};
    var body;
    try { body = targetParams(); } catch (e) { return Promise.reject(e); }
    body.score = score;
    body.board = opts.board || state.board;
    body.player_id = state.player.id;
    body.player_name = state.player.name;
    if (opts.durationMs !== undefined && opts.durationMs !== null) body.duration_ms = Math.max(0, Math.round(opts.durationMs));
    if (opts.meta) body.meta = opts.meta;
    if (opts.beacon && root.navigator && root.navigator.sendBeacon && state.apiBase) {
      // Gửi khi trang sắp đóng: không chờ được kết quả.
      var queued = root.navigator.sendBeacon(state.apiBase + '/api/public/v1/scores', new Blob([JSON.stringify(body)], { type: 'text/plain;charset=UTF-8' }));
      return Promise.resolve({ ok: queued, queued: true });
    }
    return withRetry(function () { return request('POST', '/api/public/v1/scores', body); }, 3, 600).then(function (r) {
      notifyParent({ type: 'gamehihi:score', game: r.game, board: r.board, channel: r.channel, score: r.score, best: r.best, isBest: r.is_best, rank: r.rank, players: r.players });
      return r;
    });
  }
  /** Bảng xếp hạng (điểm tốt nhất mỗi người). opts: { board, period: 'all'|'day'|'week'|'month', limit }. */
  function getLeaderboard(opts) {
    opts = opts || {};
    var params;
    try { params = targetParams(); } catch (e) { return Promise.reject(e); }
    params.board = opts.board || state.board;
    params.period = opts.period;
    params.limit = opts.limit;
    params.player_id = state.player.id;
    return withRetry(function () { return request('GET', '/api/public/v1/leaderboard' + query(params)); }, 2, 600);
  }
  /** Điểm tốt nhất, hạng, số lượt và 10 lượt gần nhất của người chơi hiện tại. opts: { board }. */
  function getPlayerStats(opts) {
    opts = opts || {};
    var params;
    try { params = targetParams(); } catch (e) { return Promise.reject(e); }
    params.board = opts.board || state.board;
    params.player_id = state.player.id;
    return withRetry(function () { return request('GET', '/api/public/v1/player' + query(params)); }, 2, 600);
  }

  // Trang cha (ví dụ WordPress) có thể gán người chơi đã đăng nhập; chỉ giữ trong bộ nhớ.
  root.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || typeof d !== 'object' || d.type !== 'gamehihi:player' || ev.source !== root.parent) return;
    try { setPlayer({ id: d.id, name: d.name }, { persist: false }); } catch (e) {}
  });

  root.GameHiHiScores = {
    version: VERSION,
    init: init,
    config: config,
    submit: submit,
    getLeaderboard: getLeaderboard,
    getPlayerStats: getPlayerStats,
    setPlayer: setPlayer,
    getPlayer: getPlayer
  };
  notifyParent({ type: 'gamehihi:scores-ready', version: VERSION, game: state.game, deployment: state.deployment });
})(window);
