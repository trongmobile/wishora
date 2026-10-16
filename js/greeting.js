/**
 * Hiển thị thiệp (màn hình mở đầu + màn hình chúc mừng).
 * Dùng chung cho trang người nhận, xem trước toàn màn hình và live preview.
 * Mọi nội dung người dùng nhập đều đi qua textContent — không dùng innerHTML.
 */
import { getTheme } from './data/themes.js';
import { getOccasion } from './occasion-engine.js';
import * as music from './music.js';
import * as sfx from './sfx.js';
import { ambientFragment, confettiFragment } from './fx.js';
import { track } from './analytics.js';

const OPEN_MS = 900;
const MAX_CONFETTI = 140;

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function buildGift() {
  const gift = h('div', 'gift');
  const lid = h('div', 'gift-lid');
  lid.append(h('div', 'gift-bow'));
  gift.append(h('div', 'gift-glow'), h('div', 'gift-box'), lid);
  return gift;
}

function buildEnvelope(seal = '♥') {
  const env = h('div', 'envelope');
  const letter = h('div', 'env-letter');
  letter.append(h('span', 'line'), h('span', 'line'), h('span', 'line short'));
  env.append(
    h('div', 'gift-glow'),
    h('div', 'env-back'),
    letter,
    h('div', 'env-front'),
    h('div', 'env-flap'),
    h('div', 'env-seal', seal),
  );
  return env;
}

/**
 * @param {HTMLElement} host
 * @param {{name:string,message:string,theme:string,occasion?:string,title?:string}} data
 * @param {{animations?:boolean, sound?:boolean, autofocus?:boolean, setTitle?:boolean, onClose?:Function}} opts
 * sound: bật hiệu ứng âm thanh (mặc định true). Âm thanh chỉ phát sau thao tác của người dùng.
 */
export function mountCard(host, data, opts = {}) {
  let current = { name: '', message: '', theme: '', occasion: 'birthday', title: '' };
  let animOn = opts.animations ?? !reduceMotion();
  let soundOn = opts.sound ?? true;
  let phase = 'intro'; // intro | opening | reveal
  const timers = new Set();

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  // ---------- DOM ----------
  const stage = h('div', 'stage');
  const bg = h('div', 'stage-bg');
  bg.append(h('div', 'stage-art'));
  const ambient = h('div', 'ambient');
  const confettiLayer = h('div', 'confetti-layer');

  const intro = h('section', 'intro');
  const introObj = h('div', 'intro-obj');
  introObj.setAttribute('aria-hidden', 'true');
  const introFor = h('p', 'intro-for');
  const introTitle = h('h2', 'intro-title', 'A Special Surprise For You');
  const btnOpen = h('button', 'btn-open', 'Mở món quà');
  btnOpen.type = 'button';
  intro.append(introObj, introFor, introTitle, btnOpen);

  const reveal = h('section', 'reveal');
  const panel = h('div', 'panel');
  const hb = h('p', 'hb step', 'Happy Birthday');
  const coupletL = h('div', 'couplet couplet-l');
  const coupletR = h('div', 'couplet couplet-r');
  [coupletL, coupletR].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  const recipient = h('h1', 'recipient step');
  recipient.tabIndex = -1;
  const divider = h('div', 'divider step');
  divider.setAttribute('aria-hidden', 'true');
  divider.append(h('span'));
  const wish = h('p', 'wish step');
  const made = h('p', 'made step', 'Made with love ❤️');
  [hb, recipient, divider, wish, made].forEach((el, i) => el.style.setProperty('--i', i));
  panel.append(hb, recipient, divider, wish, made);
  const makeOwn = h('a', 'make-own', 'Tạo thiệp cho người thân của bạn');
  makeOwn.href = '?page=create';
  if (opts.hideMakeOwn) makeOwn.hidden = true;
  reveal.append(panel, makeOwn);

  const controls = h('div', 'controls');
  const mkBtn = (cls, icon, label) => {
    const b = h('button', `ctl ${cls}`);
    b.type = 'button';
    b.append(h('span', 'ctl-icon', icon), h('span', 'ctl-label', label));
    return b;
  };
  const btnReplay = mkBtn('ctl-replay', '↻', 'Phát lại');
  const btnAnim = mkBtn('ctl-anim', '✨', 'Hiệu ứng');
  const btnSound = mkBtn('ctl-sound', '🔔', 'Âm thanh');
  const btnMusic = mkBtn('ctl-music', '♪', 'Nhạc');
  controls.append(btnReplay, btnAnim, btnSound, btnMusic);

  stage.append(bg, ambient, coupletL, coupletR, intro, reveal, controls, confettiLayer);
  host.replaceChildren(stage);

  // ---------- Hiệu ứng ----------
  function renderAmbient() {
    ambient.replaceChildren();
    const theme = getTheme(current.theme);
    // Tắt hiệu ứng / giảm chuyển động: theme có staticAmbient vẫn giữ vài hạt trang trí đứng yên.
    const still = !animOn && theme.reducedMotion?.staticAmbient;
    if (!animOn && !still) return;
    const count = still ? Math.ceil(theme.ambient.count / 2) : theme.ambient.count;
    ambient.append(ambientFragment(theme.ambient, { count }));
  }

  function burst(n) {
    const cfg = getTheme(current.theme).confetti;
    if (!animOn || !cfg) return; // confetti: null → dịp trang trọng, không bắn confetti
    const room = MAX_CONFETTI - confettiLayer.childElementCount;
    confettiLayer.append(confettiFragment(cfg, Math.max(0, Math.min(n, room))));
  }

  function playReveal() {
    reveal.classList.remove('play');
    void reveal.offsetWidth; // khởi động lại animation
    reveal.classList.add('play');
    reveal.scrollTop = 0;
    confettiLayer.replaceChildren();
    if (soundOn) sfx.playReveal(toneOf());
    burst(60);
    later(() => burst(36), 800);
    later(() => burst(28), 1800);
  }

  // ---------- Trạng thái ----------
  function setPhase(next) {
    phase = next;
    stage.dataset.state = next;
  }

  function showIntro() {
    clearTimers();
    confettiLayer.replaceChildren();
    reveal.classList.remove('play');
    setPhase('intro');
  }

  function showReveal() {
    clearTimers();
    setPhase('reveal');
    playReveal();
    if (opts.autofocus) recipient.focus({ preventScroll: true });
  }

  function open() {
    if (phase !== 'intro') return;
    if (soundOn) sfx.unlock();
    if (!animOn) return showReveal();
    if (soundOn) sfx.playOpen(getTheme(current.theme).intro, toneOf());
    setPhase('opening');
    later(showReveal, OPEN_MS);
  }

  function replay() {
    if (phase === 'reveal') {
      clearTimers();
      playReveal();
    } else if (phase === 'intro') {
      open();
    }
  }

  function setAnimations(on) {
    animOn = on;
    stage.dataset.anim = on ? 'on' : 'off';
    if (!on) confettiLayer.replaceChildren();
    renderAmbient();
    syncControls();
    opts.onAnimationsChange?.(on);
    if (on && phase === 'reveal') playReveal();
    if (!on && phase === 'opening') showReveal();
  }

  function toneOf() {
    return (getOccasion(current.occasion) ?? getOccasion('birthday')).tone;
  }

  function setSound(on) {
    soundOn = on;
    if (on) sfx.unlock();
    syncControls();
  }

  function syncControls() {
    btnSound.setAttribute('aria-pressed', String(soundOn));
    btnSound.querySelector('.ctl-label').textContent = soundOn ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
    btnAnim.setAttribute('aria-pressed', String(animOn));
    btnAnim.querySelector('.ctl-label').textContent = animOn ? 'Hiệu ứng: Bật' : 'Hiệu ứng: Tắt';
    const m = music.isOn();
    btnMusic.setAttribute('aria-pressed', String(m));
    btnMusic.querySelector('.ctl-label').textContent = m ? 'Nhạc: Bật' : 'Nhạc: Tắt';
  }

  // ---------- Dữ liệu ----------
  const quote = (ch) => `"${String(ch).replace(/["\\]/g, '')}"`;

  function update(next) {
    const prev = { theme: current.theme, occasion: current.occasion };
    current = { ...current, ...next };
    const name = current.name?.trim();
    const msg = current.message;
    const occ = getOccasion(current.occasion) ?? getOccasion('birthday');
    const isBirthday = occ.id === 'birthday';
    const headline = current.title?.trim() || occ.headline;

    hb.textContent = headline;
    recipient.textContent = name || 'Tên người nhận';
    recipient.classList.toggle('is-placeholder', !name);
    wish.textContent = msg?.trim() ? msg : 'Lời chúc của bạn sẽ hiện ở đây…';
    wish.classList.toggle('is-placeholder', !msg?.trim());
    introFor.textContent = name ? `Dành cho ${name}` : 'Dành cho người đặc biệt';
    introTitle.textContent = occ.introTitle;
    btnOpen.textContent = occ.openLabel;
    made.textContent = occ.signoff;
    stage.dataset.kind = isBirthday ? 'birthday' : 'greeting';
    stage.dataset.tone = occ.tone;
    btnMusic.hidden = !occ.music;

    const couplet = occ.couplet;
    coupletL.textContent = couplet?.[0] ?? '';
    coupletR.textContent = couplet?.[1] ?? '';
    stage.classList.toggle('has-couplet', Boolean(couplet));

    if (current.theme !== prev.theme || current.occasion !== prev.occasion) {
      const theme = getTheme(current.theme);
      stage.dataset.theme = theme.id;
      stage.dataset.intro = theme.intro;
      const [a, b, glyph] = theme.decor ?? [];
      stage.style.setProperty('--art-1', quote(a ?? ''));
      stage.style.setProperty('--art-2', quote(b ?? ''));
      stage.style.setProperty('--panel-glyph', quote(glyph ?? ''));
      introObj.replaceChildren(theme.intro === 'gift' ? buildGift() : buildEnvelope(theme.seal));
      renderAmbient();
      if (phase === 'reveal') playReveal();
    }
    if (opts.setTitle && name) document.title = isBirthday ? `Happy Birthday ${name} 🎂` : `${headline} — ${name}`;
    makeOwn.href = `?page=create&occasion=${encodeURIComponent(occ.id)}`;
    makeOwn.dataset.occasion = occ.id;
  }

  // ---------- Sự kiện ----------
  btnOpen.addEventListener('click', open);
  btnReplay.addEventListener('click', replay);
  btnAnim.addEventListener('click', () => setAnimations(!animOn));
  btnSound.addEventListener('click', () => setSound(!soundOn));
  btnMusic.addEventListener('click', music.toggle);
  makeOwn.addEventListener('click', () => track('make-own', makeOwn.dataset.occasion));
  const unsubscribe = music.subscribe(syncControls);

  stage.dataset.anim = animOn ? 'on' : 'off';
  setPhase('intro');
  update(data);
  syncControls();

  return {
    el: stage,
    update,
    open,
    replay,
    showIntro,
    showReveal,
    setAnimations,
    setSound,
    get phase() {
      return phase;
    },
    destroy() {
      clearTimers();
      unsubscribe();
      host.replaceChildren();
    },
  };
}
