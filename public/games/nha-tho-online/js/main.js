// Điểm khởi động phần Online: chờ game 3D sẵn sàng rồi gắn mạng, chat, mini game, xếp hạng.
import { $, store, clock } from './util.js';
import { Net } from './net.js';
import { Roster } from './roster.js';
import { Chat } from './chat.js';
import { Invites } from './invites.js';
import { Games } from './games.js';
import { Rankings } from './rankings.js';
import { Fx } from './fx.js';

const QUIET_ERRORS = new Set(['muted', 'auto_muted', 'rate_limited', 'duplicate', 'not_your_turn']);

HiHi.ready((game) => {
  const net = new Net();
  const app = { game, net, me: null, rules: null, honor: null, blocks: new Set(), robe: 0 };
  app.notice = (text) => {
    game.toast('');
    $('#toast').textContent = text;
  };
  app.fx = new Fx(app);
  app.roster = new Roster(app);
  app.chat = new Chat(app);
  app.invites = new Invites(app);
  app.games = new Games(app);
  app.rank = new Rankings(app);
  window.HiHiOnline = app; // tiện gỡ lỗi từ console

  // Điền lại tên & màu áo lần trước.
  const lastName = store.get('name', '');
  if (lastName && !$('#nameIn').value) $('#nameIn').value = lastName;
  const lastRobe = store.get('robe', 0);
  $('#robeSw').children[lastRobe]?.click();

  // Nút mini game trên toolbar.
  const needIn = () => {
    if (!game.needPlayer()) return false;
    if (!HiHi.online) {
      game.toast(net.available() ? 'Đang kết nối máy chủ, thử lại sau giây lát…' : 'Cần mở game từ máy chủ để chơi online.');
      return false;
    }
    return true;
  };
  document.querySelector('[data-a=caro]').addEventListener('click', () => needIn() && (app.games.cur && app.games.busy ? app.games.setMin(false) : app.roster.openList('caro')));
  document.querySelector('[data-a=rps]').addEventListener('click', () => needIn() && (app.games.cur && app.games.busy ? app.games.setMin(false) : app.roster.openList('rps')));
  document.querySelector('[data-a=rank]').addEventListener('click', () => game.needPlayer() && app.rank.open());

  HiHi.on('look', () => net.send({ t: 'look', look: app.roster.myLook() }));
  HiHi.on('emote', (k) => net.send({ t: 'emote', k }));

  HiHi.on('enter', (info) => {
    app.robe = info.robe >= 0 ? info.robe : 0;
    store.set('name', info.name);
    store.set('robe', app.robe);
    if (!net.available()) {
      app.offlineReason = 'Bạn đang mở file trực tiếp nên game chạy chế độ một mình. Mở từ máy chủ để chơi online.';
      return;
    }
    net.start(() => ({ token: store.get('token', ''), name: game.playerName, look: app.roster.myLook(), pose: app.roster.myPose() }));
  });

  net.on('welcome', (m) => {
    const first = !HiHi.online;
    HiHi.online = true;
    clock.sync(m.server_time);
    store.set('token', m.token);
    app.me = m.you;
    app.rules = m.rules;
    app.blocks = new Set(m.blocks);
    app.chat.setMe(m.you);
    if (m.you.name !== game.playerName) game.setPlayerName(m.you.name);
    app.roster.sync(m.online);
    if (first) $('#typing').textContent = '';
    app.chat.loadHistory(m.history);
    app.rank.setHonor(m.honor, first);
    app.invites.restore(m.invites);
    app.games.restore(m.matches);
    if (first) app.chat.sys('🟢 Đã vào Chat Online — tin nhắn ở đây được gửi tới mọi người đang online.');
  });

  net.on('error', (m) => {
    if (QUIET_ERRORS.has(m.code)) return;
    app.notice('⚠️ ' + m.msg);
  });

  net.on('kicked', (m) => {
    app.chat.sys(m.reason === 'banned' ? '⛔ Tài khoản đã bị chặn khỏi phòng.' : '🔁 Bạn vừa mở game ở một tab khác nên tab này đã ngắt kết nối.');
  });

  net.on('stopped', ({ code }) => {
    if (code !== 4001) return;
    game.openModal('<h2>Đang chơi ở tab khác</h2><p>Mỗi người chơi chỉ kết nối từ một tab. Tab này đã tạm ngắt để tránh trùng lặp.</p><button class="btn" id="resumeHere">Chơi ở tab này</button>');
    $('#resumeHere').onclick = () => {
      game.closeModal();
      net.resume();
    };
  });
});
