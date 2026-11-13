/* Joydigi — Bảng xếp hạng online + ngôn ngữ (vi · en · id · es).
   Gửi điểm lên /api/public/v1/score khi game phát sự kiện gamehihi:garage-score
   và đọc /api/public/v1/leaderboard (day | week | month | all).
   Ngôn ngữ do Worker chọn (?lang= → cookie → quốc gia theo IP → mặc định), truyền qua window.__JOYDIGI_I18N__. */
(function () {
  'use strict';
  var GAME = 'tiem-sua-xe-hihi', LANGS = ['vi', 'en', 'id', 'es'];
  var LANG_NAMES = { vi: '🇻🇳 Tiếng Việt', en: '🇬🇧 English', id: '🇮🇩 Bahasa Indonesia', es: '🇪🇸 Español' };
  var S = {
    vi: {
      btn: 'Bảng xếp hạng online', title: 'Bảng xếp hạng', sub: 'Số xe đã giao thành công',
      p: { day: 'Hôm nay', week: 'Tuần', month: 'Tháng', all: 'Mọi lúc' },
      pl: { day: 'hôm nay', week: 'tuần này', month: 'tháng này', all: 'mọi lúc' },
      loading: 'Đang tải bảng xếp hạng…', empty: 'Chưa có ai ghi điểm. Giao một chiếc xe để đứng đầu bảng nhé!',
      error: 'Chưa tải được bảng xếp hạng. Kiểm tra mạng rồi thử lại.',
      offline: 'Mở game qua đường link online để xem bảng xếp hạng.', you: 'bạn', unit: 'xe',
      note: '{n} người chơi có điểm · mỗi người lấy điểm cao nhất trong {p}',
      name: 'Tên hiển thị', save: 'Lưu', saved: 'Đã lưu tên', lang: 'Ngôn ngữ',
      auto: '🌐 Tự động theo quốc gia (IP)', detected: 'Quốc gia: {c}', close: 'Đóng', defName: 'Thợ'
    },
    en: {
      btn: 'Online leaderboard', title: 'Leaderboard', sub: 'Vehicles delivered',
      p: { day: 'Today', week: 'Week', month: 'Month', all: 'All time' },
      pl: { day: 'today', week: 'this week', month: 'this month', all: 'all time' },
      loading: 'Loading leaderboard…', empty: 'No scores yet. Deliver a vehicle to top the board!',
      error: 'Could not load the leaderboard. Check your connection and try again.',
      offline: 'Open the game from its online link to see the leaderboard.', you: 'you', unit: 'vehicles',
      note: '{n} players with scores · each player’s best score {p}',
      name: 'Display name', save: 'Save', saved: 'Name saved', lang: 'Language',
      auto: '🌐 Automatic by country (IP)', detected: 'Country: {c}', close: 'Close', defName: 'Mechanic'
    },
    id: {
      btn: 'Papan peringkat online', title: 'Papan peringkat', sub: 'Kendaraan berhasil diserahkan',
      p: { day: 'Hari ini', week: 'Minggu', month: 'Bulan', all: 'Semua' },
      pl: { day: 'hari ini', week: 'minggu ini', month: 'bulan ini', all: 'sepanjang masa' },
      loading: 'Memuat papan peringkat…', empty: 'Belum ada skor. Serahkan satu kendaraan untuk jadi nomor satu!',
      error: 'Papan peringkat gagal dimuat. Periksa koneksi lalu coba lagi.',
      offline: 'Buka game lewat tautan online untuk melihat papan peringkat.', you: 'kamu', unit: 'kendaraan',
      note: '{n} pemain punya skor · skor tertinggi tiap pemain {p}',
      name: 'Nama tampilan', save: 'Simpan', saved: 'Nama tersimpan', lang: 'Bahasa',
      auto: '🌐 Otomatis sesuai negara (IP)', detected: 'Negara: {c}', close: 'Tutup', defName: 'Montir'
    },
    es: {
      btn: 'Clasificación online', title: 'Clasificación', sub: 'Vehículos entregados',
      p: { day: 'Hoy', week: 'Semana', month: 'Mes', all: 'Siempre' },
      pl: { day: 'hoy', week: 'esta semana', month: 'este mes', all: 'de todos los tiempos' },
      loading: 'Cargando clasificación…', empty: 'Aún no hay puntuaciones. ¡Entrega un vehículo para liderar!',
      error: 'No se pudo cargar la clasificación. Revisa tu conexión e inténtalo de nuevo.',
      offline: 'Abre el juego desde su enlace online para ver la clasificación.', you: 'tú', unit: 'vehículos',
      note: '{n} jugadores con puntuación · mejor puntuación de cada uno {p}',
      name: 'Nombre visible', save: 'Guardar', saved: 'Nombre guardado', lang: 'Idioma',
      auto: '🌐 Automático por país (IP)', detected: 'País: {c}', close: 'Cerrar', defName: 'Mecánico'
    }
  };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  var boot = window.__JOYDIGI_I18N__ || null;
  var BASE = location.protocol === 'file:' && !window.GAME_SERVER ? null : (window.GAME_SERVER || location.origin).replace(/\/$/, '');
  // Không có Worker (chạy bằng python -m http.server): dùng lựa chọn đã lưu hoặc ngôn ngữ trình duyệt.
  var L = boot && boot.lang;
  if (!L) {
    var saved = store('tsx_lang'), nav = String(navigator.language || 'vi').slice(0, 2).toLowerCase();
    L = LANGS.indexOf(saved) >= 0 ? saved : (LANGS.indexOf(nav) >= 0 ? nav : 'vi');
  }
  if (LANGS.indexOf(L) < 0) L = 'vi';
  var t = S[L];
  window.JoydigiLang = L;

  var PID = (function () {
    var p = store('tsx_pid');
    if (!p || !/^[a-z0-9-]{8,64}$/i.test(p)) {
      p = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      store('tsx_pid', p);
    }
    return p;
  })();
  function playerName() {
    var n = store('tsx_name');
    if (n && n.trim()) return n.trim().slice(0, 24);
    return t.defName + ' ' + PID.replace(/[^0-9a-f]/gi, '').slice(-4).toUpperCase();
  }
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  var fmt = function (n) { try { return Number(n).toLocaleString(L); } catch (e) { return String(n); } };

  /* ---------- Gửi điểm ---------- */
  var startedAt = Date.now(), pending = 0, sent = 0, timer = null;
  function submit(keepalive) {
    timer = null;
    if (BASE === null || !(pending > sent)) return;
    var score = pending;
    var body = JSON.stringify({
      game: GAME, board: 'default', player_id: PID, player_name: playerName(), score: score,
      duration_ms: Math.max(0, Date.now() - startedAt)
    });
    fetch(BASE + '/api/public/v1/score?lang=' + L, {
      method: 'POST', keepalive: !!keepalive, headers: { 'content-type': 'application/json' }, body: body
    }).then(function (r) {
      if (r.ok) sent = Math.max(sent, score);
      else if (r.status === 429) schedule(4000);
    }).catch(function () { });
  }
  function schedule(ms) { if (!timer) timer = setTimeout(submit, ms); }
  window.addEventListener('gamehihi:garage-score', function (ev) {
    var s = Math.floor(Number(ev.detail && ev.detail.score) || 0);
    if (s > pending) { pending = s; schedule(3000); }
  });
  var flush = function () { if (pending > sent) { clearTimeout(timer); submit(true); } };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

  /* ---------- Giao diện ---------- */
  var css = '' +
    '#jdRankOverlay{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;padding:16px;background:rgba(21,58,67,.72)}' +
    '#jdRankOverlay[hidden]{display:none!important}' +
    '#jdRankOverlay .jd-card{width:min(420px,100%);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;gap:10px;' +
    'padding:14px;box-sizing:border-box;background:#fbf7ee;color:#2a1e1c;border:3px solid #2a1e1c;box-shadow:0 6px 0 #2a1e1c;' +
    'font-family:"Be Vietnam Pro",system-ui,sans-serif}' +
    '#jdRankOverlay .jd-head{display:flex;align-items:flex-start;gap:8px}' +
    '#jdRankOverlay h2{margin:0;font-size:20px;font-weight:800;line-height:1.1;flex:1}' +
    '#jdRankOverlay h2 small{display:block;font-size:12px;font-weight:600;color:#5b686b;margin-top:3px}' +
    '#jdRankOverlay button{font:inherit;cursor:pointer}' +
    '#jdRankOverlay .jd-x{border:2px solid #2a1e1c;background:#e3eaeb;width:34px;height:34px;font-weight:800;font-size:16px;color:#2a1e1c}' +
    '#jdRankOverlay .jd-chips{display:flex;gap:6px}' +
    '#jdRankOverlay .jd-chip{flex:1;padding:7px 4px;border:2px solid #2a1e1c;background:#fff;color:#2a1e1c;font-weight:700;font-size:13px}' +
    '#jdRankOverlay .jd-chip.on{background:#f2c641}' +
    '#jdRankOverlay .jd-list{overflow:auto;min-height:120px;display:flex;flex-direction:column;gap:4px}' +
    '#jdRankOverlay .jd-row{display:flex;gap:8px;align-items:center;padding:7px 9px;background:#fff;border:1px solid #c3cfd1;font-size:14px}' +
    '#jdRankOverlay .jd-row b{min-width:28px;font-weight:800}' +
    '#jdRankOverlay .jd-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#jdRankOverlay .jd-row i{font-style:normal;font-weight:800;font-variant-numeric:tabular-nums}' +
    '#jdRankOverlay .jd-row.me{background:#fff3c4;border-color:#c9962a}' +
    '#jdRankOverlay .jd-row.top1 b{color:#c9962a}' +
    '#jdRankOverlay .jd-msg{padding:16px 8px;text-align:center;color:#5b686b;font-size:14px}' +
    '#jdRankOverlay .jd-gap{text-align:center;color:#5b686b;line-height:1}' +
    '#jdRankOverlay .jd-note{margin:0;font-size:12px;color:#5b686b}' +
    '#jdRankOverlay .jd-field{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12px;font-weight:700;color:#4a3b36}' +
    '#jdRankOverlay select{width:100%;box-sizing:border-box}' +
    '#jdRankOverlay .jd-inline{display:flex;gap:6px}' +
    '#jdRankOverlay input,#jdRankOverlay select{flex:1;min-width:0;padding:8px;border:2px solid #2a1e1c;background:#fff;color:#2a1e1c;font:inherit;font-size:14px;font-weight:600}' +
    '#jdRankOverlay .jd-save{padding:8px 12px;border:2px solid #2a1e1c;background:#4f9e3f;color:#fff;font-weight:800}' +
    '#jdRankOverlay .jd-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '@media (max-width:380px){#jdRankOverlay .jd-foot{grid-template-columns:1fr}}' +
    'html.joydigi #hud.jd-has-rank{grid-template-columns:minmax(0,1.25fr) minmax(0,.85fr) minmax(0,1fr) auto auto}';

  var period = store('tsx_rank_period');
  if (['day', 'week', 'month', 'all'].indexOf(period) < 0) period = 'week';
  var overlay = null, tok = 0;

  function build() {
    overlay = document.createElement('div');
    overlay.id = 'jdRankOverlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'jdRankTitle');
    var langOpts = '<option value="auto">' + esc(t.auto) + '</option>' + LANGS.map(function (c) {
      return '<option value="' + c + '">' + esc(LANG_NAMES[c]) + '</option>';
    }).join('');
    overlay.innerHTML =
      '<div class="jd-card">' +
      '<div class="jd-head"><h2 id="jdRankTitle">🏆 ' + esc(t.title) + '<small>' + esc(t.sub) + '</small></h2>' +
      '<button type="button" class="jd-x" data-jd="close" aria-label="' + esc(t.close) + '">✕</button></div>' +
      '<div class="jd-chips" role="tablist">' + ['day', 'week', 'month', 'all'].map(function (p) {
        return '<button type="button" role="tab" class="jd-chip" data-period="' + p + '">' + esc(t.p[p]) + '</button>';
      }).join('') + '</div>' +
      '<div class="jd-list" id="jdRankList" translate="no"></div>' +
      '<p class="jd-note" id="jdRankNote"></p>' +
      '<div class="jd-foot">' +
      '<label class="jd-field">' + esc(t.name) + '<span class="jd-inline"><input id="jdRankName" maxlength="24" autocomplete="nickname">' +
      '<button type="button" class="jd-save" data-jd="save">' + esc(t.save) + '</button></span></label>' +
      '<label class="jd-field">' + esc(t.lang) + '<select id="jdRankLang">' + langOpts + '</select></label>' +
      '</div></div>';
    document.body.appendChild(overlay);
    var sel = overlay.querySelector('#jdRankLang');
    sel.value = boot && boot.source !== 'cookie' && boot.source !== 'query' ? 'auto' : L;
    if (!boot && !store('tsx_lang')) sel.value = 'auto';
    if (boot && boot.country) sel.title = t.detected.replace('{c}', boot.country);
    sel.addEventListener('change', function () {
      var v = sel.value;
      if (boot) { location.href = '/lang/' + v; return; }
      store('tsx_lang', v === 'auto' ? null : v);
      location.reload();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) return close();
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.period) { period = b.dataset.period; store('tsx_rank_period', period); load(); }
      else if (b.dataset.jd === 'close') close();
      else if (b.dataset.jd === 'save') saveName(b);
    });
    overlay.querySelector('#jdRankName').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveName(overlay.querySelector('[data-jd="save"]'));
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
  }
  function saveName(btn) {
    var v = overlay.querySelector('#jdRankName').value.replace(/\s+/g, ' ').trim().slice(0, 24);
    store('tsx_name', v || null);
    overlay.querySelector('#jdRankName').value = playerName();
    btn.textContent = '✓';
    setTimeout(function () { btn.textContent = t.save; }, 1200);
    if (sent > 0) { sent = 0; pending = Math.max(pending, Number(store('gamehihi-garage-completed-v1')) || 0); schedule(500); }
  }
  function row(e) {
    return '<div class="jd-row' + (e.me ? ' me' : '') + (e.rank === 1 ? ' top1' : '') + '"><b>' + e.rank + '.</b><span>' +
      esc(e.player_name) + (e.me ? ' (' + esc(t.you) + ')' : '') + '</span><i>' + fmt(e.score) + ' ' + esc(t.unit) + '</i></div>';
  }
  function load() {
    var list = overlay.querySelector('#jdRankList'), note = overlay.querySelector('#jdRankNote');
    overlay.querySelectorAll('.jd-chip').forEach(function (c) {
      var on = c.dataset.period === period;
      c.classList.toggle('on', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    note.textContent = '';
    if (BASE === null) { list.innerHTML = '<div class="jd-msg">' + esc(t.offline) + '</div>'; return; }
    list.innerHTML = '<div class="jd-msg">' + esc(t.loading) + '</div>';
    var my = ++tok;
    fetch(BASE + '/api/public/v1/leaderboard?game=' + GAME + '&board=default&period=' + period + '&limit=20&group=player&player_id=' +
      encodeURIComponent(PID) + '&lang=' + L, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (my !== tok) return;
        if (!j || !j.ok) throw new Error(j && j.error);
        var h = j.entries.length ? j.entries.map(row).join('') : '<div class="jd-msg">' + esc(t.empty) + '</div>';
        if (j.me && !j.entries.some(function (e) { return e.me; })) h += '<div class="jd-gap">⋯</div>' + row(j.me);
        list.innerHTML = h;
        note.textContent = t.note.replace('{n}', fmt(j.players)).replace('{p}', t.pl[period]);
      })
      .catch(function () { if (my === tok) list.innerHTML = '<div class="jd-msg">' + esc(t.error) + '</div>'; });
  }
  function open() {
    if (!overlay) build();
    overlay.querySelector('#jdRankName').value = playerName();
    overlay.hidden = false;
    flush();
    load();
    setTimeout(function () { var c = overlay.querySelector('.jd-chip.on'); if (c) c.focus(); }, 0);
  }
  function close() { overlay.hidden = true; var b = document.getElementById('btnRank'); if (b) b.focus(); }
  window.JoydigiOpenLeaderboard = open;

  function init() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var btn = document.getElementById('btnRank');
    if (!btn) return;
    btn.setAttribute('aria-label', t.btn);
    btn.title = t.btn;
    var hud = document.getElementById('hud');
    if (hud) hud.classList.add('jd-has-rank');
    btn.addEventListener('click', open);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
