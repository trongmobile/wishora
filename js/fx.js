/**
 * Tạo hạt trang trí nền và confetti từ cấu hình theme — dùng chung cho thiệp (greeting.js) và hình hero (pages.js).
 * Kiểu chuyển động nằm ở css/animations.css (.amb-*, .cf); đơn vị cqh/cqw yêu cầu phần tử cha có container-type.
 */
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function span(className, text) {
  const n = document.createElement('span');
  n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

/**
 * Hạt trang trí nền (hoa rơi, tim bay, tuyết, sao nhấp nháy…).
 * @param {{chars:string[],count:number,motion:'rise'|'fall'|'twinkle'|'drift'}} amb  theme.ambient
 * @param {{count?:number, scale?:number}} opts  scale < 1 để thu nhỏ hạt (khung nhỏ như hero)
 */
export function ambientFragment(amb, { count = amb.count, scale = 1 } = {}) {
  const { chars, motion } = amb;
  const twinkle = motion === 'twinkle';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = span(`amb amb-${motion}`, pick(chars));
    p.style.setProperty('--x', `${rand(2, 96).toFixed(1)}%`);
    p.style.setProperty('--y', `${rand(2, 94).toFixed(1)}%`);
    p.style.setProperty('--sz', `${(rand(0.9, 2) * scale).toFixed(2)}rem`);
    p.style.setProperty('--dur', `${rand(twinkle ? 2.5 : 9, twinkle ? 6 : 18).toFixed(1)}s`);
    p.style.setProperty('--delay', `${(-rand(0, 14)).toFixed(1)}s`);
    p.style.setProperty('--dx', `${(rand(-60, 60) * scale).toFixed(0)}px`);
    p.style.setProperty('--rot', `${rand(-40, 40).toFixed(0)}deg`);
    frag.append(p);
  }
  return frag;
}

/**
 * Một đợt confetti rơi từ trên xuống; mỗi mảnh tự xóa khi hết animation.
 * @param {{colors:string[],chars:string[],charRatio:number}} cfg  theme.confetti (khác null)
 */
export function confettiFragment(cfg, n, { scale = 1 } = {}) {
  const { colors, chars, charRatio } = cfg;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const useChar = chars.length > 0 && Math.random() < charRatio;
    const p = span(useChar ? 'cf cf-char' : `cf ${Math.random() < 0.4 ? 'cf-round' : ''}`, useChar ? pick(chars) : null);
    const w = rand(6, 11) * scale;
    p.style.setProperty('--x', `${rand(0, 100).toFixed(1)}%`);
    p.style.setProperty('--dx', `${(rand(-90, 90) * scale).toFixed(0)}px`);
    p.style.setProperty('--rot', `${rand(-720, 720).toFixed(0)}deg`);
    p.style.setProperty('--dur', `${rand(2.6, 4.6).toFixed(2)}s`);
    p.style.setProperty('--delay', `${rand(0, 0.7).toFixed(2)}s`);
    p.style.setProperty('--w', `${w.toFixed(1)}px`);
    p.style.setProperty('--h', `${(w * rand(0.6, 1.6)).toFixed(1)}px`);
    p.style.setProperty('--c', pick(colors));
    p.addEventListener('animationend', () => p.remove(), { once: true });
    frag.append(p);
  }
  return frag;
}
