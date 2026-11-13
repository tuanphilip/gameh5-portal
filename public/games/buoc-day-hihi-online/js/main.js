// Khởi động game: bố cục, render, âm thanh, input, menu; điều phối chế độ cùng máy & online.
import { buildCourse, updateTimePlats, DT, STAGE_COUNT } from './shared/sim.js';
import { View } from './view.js';
import { GameAudio } from './audio.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { Tags } from './common.js';
import { initLayout } from './layout.js';
import { LocalGame, loadSave } from './local.js';
import { OnlineGame } from './online.js';
import { CHARS, CHAR_COUNT, validSkin } from './shared/chars.js';

const $ = id => document.getElementById(id);
const TOKEN_KEY = 'bdh_token_v1';
const app = {};
if (!window.THREE) { document.body.innerHTML = '<p style="font:18px sans-serif;padding:20px">Không tải được Three.js – kiểm tra kết nối mạng rồi tải lại trang.</p>'; throw new Error('THREE missing'); }

app.isTouch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0 && !matchMedia('(pointer: fine)').matches;
document.getElementById('root').classList.toggle('touch', app.isTouch);
app.audio = new GameAudio();
const menuCourse = buildCourse();
app.view = new View($('stage'), menuCourse);
app.tags = new Tags($('tags'));
app.layout = initLayout($('root'), $('stage'), (w, h, W, H) => {
  app.view.setSize(w, h);
  const joy = Math.round(Math.max(96, Math.min(150, Math.min(W, H) * .26)));
  $('root').style.setProperty('--joy', joy + 'px');
  updateRotateHint();
  if (app.ui) app.ui.fit();
}, { autoRotate: () => app.isTouch && app.prefRotate !== false, fillAlways: () => app.isTouch });
app.view.toStage = (x, y) => app.layout.toStage(x, y);
app.input = new Input({ layout: app.layout, camFree: () => app.cam && app.cam.free, joyL: $('joyL'), joyR: $('joyR'), jumpL: $('jumpL'), jumpR: $('jumpR'), actBtn: $('actBtn'), canvas: app.view.renderer.domElement });
app.ui = new UI(app);
app.token = (() => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } })();
app.player = null; app.game = null;
const params = new URLSearchParams(location.search);
app.link = { room: (params.get('room') || '').toUpperCase(), with: params.get('with') };
if (/^[A-HJ-NP-Z2-9]{6}$/.test(app.link.room)) { const b = $('bJoinLink'); b.textContent = `🔗 Vào phòng ${app.link.room} (được mời)`; b.classList.remove('hidden'); $('codeIn').value = app.link.room; }
else app.link.room = '';

function refreshMenu() {
  const v = loadSave(), b = $('bCont');
  if (v) { b.classList.remove('hidden'); b.textContent = '▶ Chơi tiếp – Chặng ' + (v.cp + 1) + '/' + STAGE_COUNT + ' (' + (v.mode === 'solo' ? '1 người' : '2 người') + ')'; } else b.classList.add('hidden');
  $('meInfo').textContent = app.player ? `Mã người chơi: ${app.player.publicId}` : 'Chưa có tài khoản khách';
  app.ui.profileChip();
}
function updateRotateHint() {
  const port = $('root').classList.contains('portrait') && !(app.layout && app.layout.rotated);
  $('rotateHint').classList.toggle('hidden', !(port && app.isTouch && app.game));
}

/* ---------- tài khoản khách ---------- */
async function api(path, opts = {}) {
  const h = { 'Content-Type': 'application/json' }; if (app.token) h.Authorization = 'Bearer ' + app.token;
  const r = await fetch(path, { ...opts, headers: { ...h, ...(opts.headers || {}) } });
  let d = null; try { d = await r.json(); } catch { }
  if (!r.ok || !d || d.ok === false) { const e = new Error(d && d.error ? d.error.message : 'Lỗi mạng (' + r.status + ')'); e.code = d && d.error && d.error.code; e.status = r.status; throw e; }
  return d;
}
async function ensureGuest() {
  const name = app.profile.name;
  if (app.token) {
    try {
      let d = await api('/api/me'); app.player = d.player;
      if (d.player.name !== name) { try { d = await api('/api/me', { method: 'POST', body: JSON.stringify({ name }) }); app.player = d.player; } catch { app.setProfileLocal({ name: d.player.name }); } }
      return;
    } catch (e) { if (e.status !== 401) throw e; app.token = null; }
  }
  const d = await api('/api/guest', { method: 'POST', body: JSON.stringify({ name }) });
  app.token = d.token; app.player = d.player; try { localStorage.setItem(TOKEN_KEY, d.token); } catch { }
}
/* ---------- nhân vật & tên (tên ngẫu nhiên, đổi được bất cứ lúc nào) ---------- */
const NA = ['Mèo', 'Cún', 'Gấu', 'Thỏ', 'Cáo', 'Vịt', 'Heo', 'Sóc', 'Khỉ', 'Cú', 'Nai', 'Rùa', 'Ếch', 'Gà', 'Hổ', 'Cá', 'Voi', 'Chim'];
const NB = ['Lém', 'Mũm Mĩm', 'Xinh', 'Nhanh', 'Ngộ', 'Tròn', 'Vui', 'Siêu', 'Lắc', 'Tinh', 'Lanh', 'Dũng Cảm', 'Ham Ăn', 'Ngoan', 'Lắm Lời', 'Bông'];
const pick = a => a[(Math.random() * a.length) | 0];
app.randomName = () => `${pick(NA)} ${pick(NB)} ${10 + ((Math.random() * 90) | 0)}`;
app.cleanName = raw => { let s = String(raw || '').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu, '').replace(/\s+/g, ' ').trim(); s = [...s].slice(0, 20).join(''); return [...s].length >= 2 ? s : null; };
app.profile = { name: app.cleanName(app.ui.prefs.name) || app.randomName(), skin: validSkin(app.ui.prefs.skin) ? app.ui.prefs.skin : (Math.random() * CHAR_COUNT) | 0 };
app.setProfileLocal = ({ name, skin }) => {
  if (name) app.profile.name = name; if (validSkin(skin)) app.profile.skin = skin;
  app.ui.prefs.name = app.profile.name; app.ui.prefs.skin = app.profile.skin; app.ui.savePrefs(); app.ui.profileChip();
};
app.setProfileLocal({});
app.setProfile = async ({ name, skin }) => {
  const nm = app.cleanName(name); if (!nm) { app.ui.toast('Tên cần 2–20 ký tự'); return false; }
  const changedName = nm !== app.profile.name;
  app.setProfileLocal({ name: nm, skin });
  const g = app.game;
  if (g && g.kind === 'online') g.send({ t: 'profile', name: nm, skin: app.profile.skin });
  else {
    if (g && g.kind === 'local') g.applySkins();
    if (app.token && changedName) { try { const d = await api('/api/me', { method: 'POST', body: JSON.stringify({ name: nm }) }); app.player = d.player; app.setProfileLocal({ name: d.player.name }); } catch (e) { app.ui.toast('⚠ ' + e.message, 3000); } }
  }
  app.ui.toast(`✔ Đã lưu: ${CHARS[app.profile.skin].name} · ${app.profile.name}`, 2000); refreshMenu();
  return true;
};
/* ---------- khu vực ---------- */
app.areas = [];
app.loadAreas = async () => { try { const d = await api('/api/areas'); app.areas = d.areas || []; } catch { } return app.areas; };
app.areaOf = code => { const a = app.areas.find(x => x.code === code); return a ? a.area : null; };
app.switchArea = target => busy(null, async () => {
  const g = app.game, cur = g && g.kind === 'online' ? g.code : null;
  if (g && g.kind === 'online' && !g.inLobby()) { app.ui.toast('Chỉ đổi khu được khi đang chờ ở sảnh khởi đầu'); return; }
  let code = target;
  if (target === 'new') { const d = await api('/api/quickplay', { method: 'POST', body: JSON.stringify({ fresh: true }) }); code = d.room; }
  if (!code || code === cur) return;
  app.ui.close('areas'); app.startOnline(code, null);
  app.ui.toast('🔀 Đang chuyển khu…', 1800);
});
async function busy(btnId, fn) {
  const b = btnId && $(btnId); if (b) b.disabled = true;
  try { await fn(); } catch (e) { app.ui.toast('⚠ ' + e.message, 3500); } finally { if (b) b.disabled = false; refreshMenu(); }
}
app.quickPlay = () => busy('bQuick', async () => { await ensureGuest(); const d = await api('/api/quickplay', { method: 'POST', body: '{}' }); app.startOnline(d.room, null); });
app.createRoom = opts => busy('bCreate', async () => { await ensureGuest(); const d = await api('/api/rooms', { method: 'POST', body: JSON.stringify(opts) }); app.startOnline(d.room, null); });
app.joinRoom = (code, withPub) => busy('bJoinLink', async () => { await ensureGuest(); const d = await api('/api/rooms/' + code); if (!d.ok) throw new Error('Phòng không tồn tại'); app.startOnline(code, withPub); });
/* ---------- vào thẳng game: mặc định online ở sảnh khởi đầu ---------- */
app.boot = async () => {
  app.bootCancel = false; $('bBootRetry').classList.add('hidden'); $('bootText').textContent = app.link.room ? `Đang vào phòng ${app.link.room}…` : 'Đang vào sảnh khởi đầu…';
  $('boot').classList.remove('hidden'); $('menu').classList.add('hidden'); app.ui.fit();
  try {
    await ensureGuest(); if (app.bootCancel) return;
    if (app.link.room) {
      const code = app.link.room, w = app.link.with; app.link.room = ''; $('bJoinLink').classList.add('hidden');
      try { const d = await api('/api/rooms/' + code); if (d.ok) { if (!app.bootCancel) app.startOnline(code, w); return; } } catch { }
      app.ui.toast('Phòng được mời không còn – vào sảnh chơi nhanh', 3500);
    }
    const d = await api('/api/quickplay', { method: 'POST', body: '{}' }); if (app.bootCancel) return;
    app.startOnline(d.room, null);
  } catch (e) {
    if (app.bootCancel) return;
    $('bootText').textContent = '⚠ Chưa vào được online: ' + e.message; $('bBootRetry').classList.remove('hidden'); app.ui.fit();
  } finally { refreshMenu(); }
};
app.bootToMenu = () => { app.bootCancel = true; $('boot').classList.add('hidden'); $('menu').classList.remove('hidden'); refreshMenu(); app.ui.fit(); };

/* ---------- chế độ chơi ---------- */
function stopGame() { if (app.game) { app.game.destroy(); app.game = null; } app.input.reset(); }
app.startLocal = (mode, sv) => {
  stopGame(); app.audio.unlock(); app.fullscreen('enter'); $('boot').classList.add('hidden');
  app.input.setMode(mode); app.ui.enterGame('local', mode);
  app.game = new LocalGame(app, mode, sv); updateRotateHint();
};
app.continueLocal = () => { const v = loadSave(); if (v) app.startLocal(v.mode || '2p', v); };
app.startOnline = (code, withPub) => {
  stopGame(); app.audio.unlock(); $('boot').classList.add('hidden');
  app.input.setMode('online'); app.ui.enterGame('online', 'online');
  app.game = new OnlineGame(app, code, app.token, withPub); updateRotateHint();
  try { history.replaceState(null, '', '/?room=' + code); } catch { }
};
app.leaveOnline = msg => { app.toMenu(); if (msg) app.ui.toast(msg, 4000); };
app.toMenu = () => {
  stopGame(); app.ui.leaveGame(); app.input.setMode('menu'); refreshMenu(); updateRotateHint();
  try { history.replaceState(null, '', '/'); } catch { }
  app.view.camera.position.set(0, 8, -14);
};
app.restart = () => {
  const g = app.game; if (!g) return;
  if (g.kind === 'local') { app.startLocal(g.mode); return; }
  g.send({ t: 'restart' }); app.ui.hideWin(); app.ui.togglePause(false); app.ui.toast('↺ Đã gửi yêu cầu chơi lại – đồng đội người thật cần đồng ý', 2500);
};
app.skip = () => {
  const g = app.game; if (!g) return;
  if (g.kind === 'local') { if (confirm('Bỏ qua chặng này? (chỉ dùng khi luyện tập)')) g.skip(); return; }
  if (g.room && g.room.practice) g.send({ t: 'skip' }); else app.ui.toast('Chỉ phòng luyện tập mới được bỏ qua chặng');
};
// Toàn màn hình + khoá ngang (nếu trình duyệt cho phép). Gọi ĐỒNG BỘ trong sự kiện bấm (yêu cầu của trình duyệt).
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
const fsTarget = document.documentElement;
const canFS = () => !!(fsTarget.requestFullscreen || fsTarget.webkitRequestFullscreen) && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false;
app.fullscreen = mode => {          // mode: 'toggle' (nút ⛶) | 'enter' (khi bắt đầu chơi trên điện thoại)
  if (mode !== 'toggle' && !app.isTouch) return;
  if (fsEl()) { if (mode === 'toggle') { const ex = document.exitFullscreen || document.webkitExitFullscreen; if (ex) Promise.resolve(ex.call(document)).catch(() => { }); } return; }
  if (!canFS()) {
    if (mode === 'toggle') app.ui.toast(window.parent !== window ? 'Trang nhúng chưa cho phép toàn màn hình (cần allow="fullscreen" trên iframe)' : '📱 iPhone chưa hỗ trợ nút này: bấm Chia sẻ ⎋ → “Thêm vào MH chính”, rồi mở game từ biểu tượng để chơi toàn màn hình (không còn thanh trình duyệt)', 7000);
    return;
  }
  let p; try { p = fsTarget.requestFullscreen ? fsTarget.requestFullscreen({ navigationUI: 'hide' }) : fsTarget.webkitRequestFullscreen(); } catch (e) { p = Promise.reject(e); }
  Promise.resolve(p).then(() => { try { if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').catch(() => { }); } catch { } })
    .catch(() => { if (mode === 'toggle') app.ui.toast('Trình duyệt không cho bật toàn màn hình ở đây', 2500); })
    .finally(updateRotateHint);
};
const syncFsBtn = () => { const on = !!fsEl(); $('bFull').textContent = on ? '🗗' : '⛶'; $('bFull').title = on ? 'Thoát toàn màn hình' : 'Toàn màn hình'; $('bFull2').textContent = on ? '🗗 Thoát toàn màn hình' : '⛶ Toàn màn hình (ẩn thanh trình duyệt)'; updateRotateHint(); setTimeout(() => app.layout.apply(), 60); };
document.addEventListener('fullscreenchange', syncFsBtn); document.addEventListener('webkitfullscreenchange', syncFsBtn);

const standalone = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
// Chặn zoom khi bấm nút / chạm 2 lần / chụm ngón trên điện thoại
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { const now = Date.now(); const t = e.target; if (now - lastTouchEnd < 350 && !(t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA'))) e.preventDefault(); lastTouchEnd = now; }, { passive: false });
document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
// ---------- camera xoay 3D ----------
app.cam = app.view.camCtl = { yaw: 0, pitch: 0, zoom: 1, free: false };
let camClickAt = 0;
app.toggleCam = () => {
  const c = app.cam, now = performance.now();
  if (now - camClickAt < 400) { c.yaw = 0; c.pitch = 0; c.zoom = 1; c.free = false; camClickAt = 0; $('bCam').classList.remove('on'); app.ui.toast('🎥 Đã về góc nhìn mặc định', 1500); return; }
  camClickAt = now; c.free = !c.free; $('bCam').classList.toggle('on', c.free);
  app.ui.toast(c.free ? '🎥 Xoay 3D: kéo trên màn hình để xoay, chụm 2 ngón (hoặc lăn chuột) để phóng to/thu nhỏ. Bấm 🎥 để khoá góc, bấm đúp 🎥 để về góc mặc định.' : '🎥 Đã giữ góc nhìn này (bấm đúp 🎥 để về góc mặc định)', c.free ? 4500 : 2200);
};
/* ---------- input → hành động ---------- */
app.input.onAction = (name, arg) => {
  app.audio.unlock();
  if (name === 'esc') return app.ui.escape();
  if (name === 'camDrag') { const c = app.cam; c.yaw -= arg.dx * .009; c.pitch = Math.max(-.55, Math.min(.75, c.pitch + arg.dy * .006)); return; }
  if (name === 'camZoom') { const c = app.cam; c.zoom = Math.max(.5, Math.min(1.9, c.zoom * arg)); return; }
  if (name === 'enter') { if (app.game && app.game.kind === 'online') app.ui.chatEnter(); return; }
  if (app.ui.menuOpen && name !== 'tap') return;
  if (name === 'tap' && app.ui.menuOpen) return;
  if (app.game) app.game.action(name, arg);
};
app.view.renderer.domElement.addEventListener('pointermove', e => { if (app.game) app.game.lastPointer = { x: e.clientX, y: e.clientY }; });
// mở khoá âm thanh ở thao tác đầu tiên (tránh lỗi autoplay)
for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => app.audio.unlock(), { capture: true });
document.addEventListener('visibilitychange', () => { if (app.audio.ctx) { if (document.hidden) app.audio.ctx.suspend().catch(() => { }); else app.audio.ctx.resume().catch(() => { }); } });

/* ---------- số người online ---------- */
const cid = (() => { try { let c = sessionStorage.getItem('bdh_cid'); if (!c) { c = Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4); sessionStorage.setItem('bdh_cid', c); } return c; } catch { return Math.random().toString(36).slice(2, 14); } })();
const nfmt = new Intl.NumberFormat('vi-VN');
app.online = null;
function showOnline() {
  const o = app.online; if (!o) return;
  for (const id of ['onlineInfo', 'onlineInfo2']) {
    const b = $(id); b.textContent = '';
    const dot = document.createElement('span'); dot.className = 'dot'; b.append(dot, document.createTextNode(`${nfmt.format(o.online)} người online` + (o.playing ? ` · ${nfmt.format(o.playing)} đang chơi` : '')));
  }
  $('hOnline').textContent = '🟢 ' + nfmt.format(o.online); $('hOnline').title = `${o.online} người online · ${o.playing} đang chơi online trong ${o.rooms} phòng`;
}
async function pollOnline() {
  if (document.hidden) return;
  try { const r = await fetch('/api/online?cid=' + cid); if (r.ok) { app.online = await r.json(); showOnline(); } } catch { }
}
pollOnline(); setInterval(pollOnline, 25000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) pollOnline(); });

/* ---------- vòng lặp ---------- */
let last = performance.now(), menuT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, .1); last = now;
  try {
    if (app.game) app.game.frame(dt);
    else { menuT += dt; updateTimePlats(menuCourse, menuT, dt); app.view.syncWorld(menuT, dt); app.view.follow(null, 0, dt, true, menuT); app.view.updateParts(dt); app.audio.setZone(0); }
    app.view.render();
  } catch (e) { console.error(e); }
}
requestAnimationFrame(frame);
refreshMenu();
app.boot();
// Chế độ debug chỉ bật trên localhost với ?debug=1 – production không lộ trạng thái game ra window
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && params.get('debug') === '1') window.__game = app;
