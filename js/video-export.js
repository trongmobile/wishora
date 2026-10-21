/**
 * Xuất thiệp thành video MP4 (H.264) khổ điện thoại 720×1280 ngay trên trình duyệt — không cần máy chủ.
 *
 * Video được VẼ LẠI trên canvas từ chính cấu hình theme/dịp (màu nền, khung chữ, font, hạt trang trí,
 * confetti, ký tự trang trí) chứ không phải quay màn hình, nên giống thiệp về màu sắc/bố cục/kiểu chữ
 * nhưng không giống từng điểm ảnh (không có hộp quà/phong bì mở, hiệu ứng mờ kính, âm thanh).
 * Mã hóa bằng WebCodecs (VideoEncoder, H.264) và đóng gói MP4 bằng mp4-muxer (js/vendor/mp4-muxer.esm.js).
 */
import { Muxer, ArrayBufferTarget } from './vendor/mp4-muxer.esm.js';
import { getTheme } from './data/themes.js';
import { getOccasion } from './occasion-engine.js';

export const VIDEO_WIDTH = 360; // khổ vẽ (px logic); video thật là VIDEO_SCALE lần
export const VIDEO_HEIGHT = 640;
const VIDEO_SCALE = 2;
const FPS = 30;
const DURATION = 5; // giây: hoạt cảnh
const HOLD = 1.2; // giây: giữ khung cuối
const BITRATE = 2_500_000;
// Thử lần lượt: High 4.0, Main 4.0, Baseline 3.1 (thiết bị nào hỗ trợ cái nào dùng cái đó).
const CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.42001f'];

// ------------------------------------------------------------------ Phân tích CSS (hàm thuần, có test)

/** Tách chuỗi theo dấu phẩy ở cấp ngoài cùng (bỏ qua dấu phẩy trong ngoặc). */
export function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of String(str)) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const COLOR_RE = /(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\))(?:\s+(-?\d+(?:\.\d+)?)%)?/gi;

/** Các điểm dừng màu của một lớp gradient: [{ color: chuỗi CSS, pos: 0..1 }]. `transparent` bị bỏ qua. */
export function gradientStops(layer) {
  const raw = [...String(layer).matchAll(COLOR_RE)].map((m) => ({ color: m[1], pos: m[2] != null ? Number(m[2]) / 100 : null }));
  return raw.map((s, i) => ({ color: s.color, pos: s.pos ?? (raw.length > 1 ? i / (raw.length - 1) : 0) }));
}

/** Lớp nền "cái nền thật" của --bg (lớp cuối cùng có ≥ 2 màu) và góc của nó. */
export function baseGradient(bg) {
  const found = splitLayers(bg);
  const layers = found.length ? found : [String(bg)];
  for (let i = layers.length - 1; i >= 0; i--) {
    const stops = gradientStops(layers[i]);
    if (stops.length >= 2) {
      const angle = /linear-gradient\(\s*(-?\d+(?:\.\d+)?)deg/i.exec(layers[i]);
      return { stops, angle: angle ? Number(angle[1]) : 180 };
    }
  }
  const solid = gradientStops(String(bg))[0];
  return solid ? { stops: [solid, { ...solid, pos: 1 }], angle: 180 } : null;
}

/** Tách các lớp `xxx-gradient(...)` ở cấp ngoài cùng. */
function splitLayers(bg) {
  const layers = [];
  let depth = 0;
  let start = 0;
  const s = String(bg);
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') {
      depth--;
      if (depth === 0) {
        layers.push(s.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  return layers.map((l) => l.replace(/^[\s,]+/, '')).filter((l) => /gradient\(/i.test(l));
}

/** `9px 9px 0 #2b1d33` → bóng đổ cứng (kiểu Candy); các bóng mềm trả về null. */
export function hardShadow(shadow) {
  const first = splitTopLevel(shadow)[0] ?? '';
  const m = /^(-?\d+)px\s+(-?\d+)px\s+0(?:px)?\s+(#[0-9a-f]{3,8}\b|rgba?\([^)]*\))/i.exec(first.trim());
  return m ? { x: Number(m[1]), y: Number(m[2]), color: m[3] } : null;
}

// ------------------------------------------------------------------ Tiện ích

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashSeed = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.codePointAt(0)) >>> 0, 7);

let colorCtx = null;
function parseColor(str, fallback = '#000000') {
  colorCtx ??= document.createElement('canvas').getContext('2d');
  colorCtx.fillStyle = '#000000';
  colorCtx.fillStyle = str || fallback;
  return colorCtx.fillStyle;
}

function readTokens(themeId) {
  const probe = document.createElement('div');
  probe.dataset.theme = themeId;
  probe.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none';
  document.body.append(probe);
  const cs = getComputedStyle(probe);
  const v = (name) => cs.getPropertyValue(name).trim();
  const t = {
    bg: v('--bg'),
    ink: parseColor(v('--ink'), '#222'),
    soft: parseColor(v('--ink-soft'), '#555'),
    accent: parseColor(v('--accent'), '#d62f5c'),
    panelBg: parseColor(v('--panel-bg'), 'rgba(255,255,255,.8)'),
    panelBorder: v('--panel-border'),
    panelShadow: v('--panel-shadow'),
    panelRadius: parseFloat(v('--panel-radius')) || 24,
    fontDisplay: v('--font-display') || 'serif',
    fontBody: v('--font-body') || 'sans-serif',
    nameColor: v('--name-color'),
    nameFill: v('--name-fill'),
    divider: v('--divider-glyph').replace(/^["']|["']$/g, '') || '♥',
    upper: v('--hb-transform') === 'uppercase',
    spacingEm: parseFloat(v('--hb-spacing')) || 0,
  };
  probe.remove();
  return t;
}

function linearLine(w, h, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = w / 2;
  const cy = h / 2;
  return [cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2];
}

// ------------------------------------------------------------------ Bố cục chữ

function makeTextTools(ctx) {
  const width = (text, font, spacing) => {
    ctx.font = font;
    return ctx.measureText(text).width + spacing * [...text].length;
  };
  /** Ngắt dòng theo từ; từ quá dài thì ngắt theo ký tự. Giữ nguyên xuống dòng trong nội dung. */
  const wrap = (text, font, spacing, maxW) => {
    const lines = [];
    for (const para of String(text).split('\n')) {
      if (!para.trim()) {
        lines.push('');
        continue;
      }
      let line = '';
      for (const word of para.split(/\s+/)) {
        const tryLine = line ? `${line} ${word}` : word;
        if (width(tryLine, font, spacing) <= maxW) {
          line = tryLine;
          continue;
        }
        if (line) lines.push(line);
        line = '';
        let chunk = '';
        for (const ch of word) {
          if (width(chunk + ch, font, spacing) > maxW && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        line = chunk;
      }
      if (line) lines.push(line);
    }
    return lines;
  };
  /** Chọn cỡ chữ lớn nhất (từ `from` giảm tới `to`) mà số dòng ≤ maxLines; không được thì cắt và thêm "…". */
  const fit = (text, fontFor, spacingFor, maxW, from, to, maxLines) => {
    let size = from;
    for (; size >= to; size -= 1) {
      const lines = wrap(text, fontFor(size), spacingFor(size), maxW);
      if (lines.length <= maxLines) return { size, lines };
    }
    size = to;
    const lines = wrap(text, fontFor(size), spacingFor(size), maxW).slice(0, maxLines);
    let last = lines[maxLines - 1] ?? '';
    while (last && width(`${last}…`, fontFor(size), spacingFor(size)) > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
    return { size, lines };
  };
  return { width, wrap, fit };
}

function drawSpaced(ctx, text, cx, y, spacing) {
  if (!spacing) {
    ctx.fillText(text, cx, y);
    return;
  }
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width + spacing);
  let x = cx - (widths.reduce((a, b) => a + b, 0) - spacing) / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i];
  });
  ctx.textAlign = align;
}

// ------------------------------------------------------------------ Renderer

/**
 * Tạo renderer: `await r.ready()` rồi `r.draw(t)` (t giây) trả về canvas. Dùng chung cho xuất video và kiểm thử.
 * @param {{occasion:string,name:string,message:string,theme:string,title?:string}} data
 */
export function createCardRenderer(data, { width = VIDEO_WIDTH, height = VIDEO_HEIGHT, scale = 1 } = {}) {
  const theme = getTheme(data.theme);
  const occ = getOccasion(data.occasion) ?? getOccasion('birthday');
  const tk = readTokens(theme.id);
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0); // mọi lệnh vẽ dùng toạ độ logic width×height
  const tools = makeTextTools(ctx);
  const rnd = mulberry32(hashSeed(`${data.occasion}|${data.theme}|${data.name}`));

  const headline = (data.title?.trim() || occ.headline).trim();
  const hbText = tk.upper ? headline.toUpperCase() : headline;
  const fontDisplay = (size, weight = 700) => `${weight} ${size}px ${tk.fontDisplay}`;
  const fontBody = (size, weight = 400) => `${weight} ${size}px ${tk.fontBody}`;

  const base = baseGradient(tk.bg);
  const baseStops = base?.stops.map((s) => ({ ...s, color: parseColor(s.color) })) ?? [
    { pos: 0, color: parseColor(theme.colors[0]) },
    { pos: 1, color: parseColor(theme.colors[2]) },
  ];

  const nameStops = gradientStops(tk.nameFill).map((s) => ({ ...s, color: parseColor(s.color) }));
  const nameColor = tk.nameColor ? parseColor(tk.nameColor) : tk.ink;

  const border = /(\d+(?:\.\d+)?)px\s+solid\s+(#[0-9a-f]{3,8}\b|rgba?\([^)]*\))/i.exec(tk.panelBorder);
  const borderW = border ? Math.min(6, Number(border[1])) : 0;
  const borderColor = border ? parseColor(border[2]) : null;
  const hard = hardShadow(tk.panelShadow);

  // ----- bố cục (tính một lần)
  const M = 18;
  const panelW = width - M * 2;
  const innerW = panelW - 52;
  let L = null;

  function layout() {
    const hb = tools.fit(hbText, (s) => fontDisplay(s, 600), (s) => s * tk.spacingEm, innerW, 22, 13, 2);
    const nm = tools.fit(data.name, (s) => fontDisplay(s, 700), () => 0, innerW, 44, 24, 2);
    const maxPanelH = height - 2 * 56;
    const fixed = 30 /*pad top*/ + hb.lines.length * (hb.size * 1.25) + 8 + nm.lines.length * (nm.size * 1.15) + 8 + 34 /*divider*/ + 26 /*signoff*/ + 30; /*pad bottom*/
    const availWish = maxPanelH - fixed;
    let wish = null;
    for (let size = 18; size >= 10; size -= 0.5) {
      const lines = tools.wrap(data.message, fontBody(size), 0, innerW);
      if (lines.length * size * 1.55 <= availWish) {
        wish = { size, lines };
        break;
      }
    }
    if (!wish) {
      const size = 10;
      const max = Math.max(1, Math.floor(availWish / (size * 1.55)));
      const lines = tools.wrap(data.message, fontBody(size), 0, innerW).slice(0, max);
      let last = lines[max - 1] ?? '';
      while (last && tools.width(`${last}…`, fontBody(size), 0) > innerW) last = last.slice(0, -1);
      lines[max - 1] = `${last.trimEnd()}…`;
      wish = { size, lines };
    }
    const wishH = wish.lines.length * wish.size * 1.55;
    const panelH = fixed + wishH;
    const top = Math.round((height - panelH) / 2);
    let y = top + 30;
    const rows = {};
    rows.hb = { y: y + hb.size * 0.95, ...hb };
    y += hb.lines.length * hb.size * 1.25 + 8;
    rows.name = { y: y + nm.size * 0.9, ...nm };
    y += nm.lines.length * nm.size * 1.15 + 8;
    rows.divider = { y: y + 14 };
    y += 34;
    rows.wish = { y, ...wish };
    y += wishH;
    rows.sign = { y: y + 22 };
    return { top, panelH, rows };
  }

  // ----- hạt trang trí & confetti (xác định bằng seed → mỗi lần vẽ giống nhau)
  const amb = theme.ambient;
  const ambient = Array.from({ length: Math.min(amb.count, 16) }, () => ({
    ch: amb.chars[Math.floor(rnd() * amb.chars.length)],
    x: rnd() * width,
    y0: rnd() * (height + 80),
    size: 15 + rnd() * 16,
    speed: 28 + rnd() * 40,
    phase: rnd(),
    dx: 14 + rnd() * 26,
  }));

  const cfg = theme.confetti;
  const bursts = [
    { at: 0.75, n: 34 },
    { at: 1.75, n: 20 },
  ];
  const confetti = cfg
    ? bursts.flatMap((b) =>
        Array.from({ length: b.n }, () => {
          const useChar = cfg.chars.length > 0 && rnd() < cfg.charRatio;
          return {
            at: b.at + rnd() * 0.6,
            x: rnd() * width,
            sway: (rnd() - 0.5) * 120,
            vy: 170 + rnd() * 130,
            rot: (rnd() - 0.5) * 12,
            w: 6 + rnd() * 5,
            h: (6 + rnd() * 5) * (0.6 + rnd()),
            round: rnd() < 0.4,
            ch: useChar ? cfg.chars[Math.floor(rnd() * cfg.chars.length)] : null,
            color: parseColor(cfg.colors[Math.floor(rnd() * cfg.colors.length)]),
          };
        }),
      )
    : [];

  // ----- vẽ từng lớp
  function drawBackground() {
    const [x0, y0, x1, y1] = linearLine(width, height, base?.angle ?? 180);
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    baseStops.forEach((s) => g.addColorStop(clamp(s.pos), s.color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  function emoji(ch, x, y, size, alpha = 1, rot = 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }

  function drawDecor(t) {
    const [a, b] = theme.decor ?? [];
    if (a) emoji(a, 44, 46 + Math.sin((t / 7) * Math.PI * 2) * 4, 52, 0.9, -0.2);
    if (b) emoji(b, width - 44, height - 52 + Math.sin((t / 7 + 0.4) * Math.PI * 2) * 4, 52, 0.9, 0.17);
  }

  function drawAmbient(t) {
    for (const p of ambient) {
      let x = p.x;
      let y = p.y0;
      let alpha = 0.85;
      const span = height + 80;
      if (amb.motion === 'rise') {
        y = height + 40 - ((p.y0 + t * p.speed) % span);
        x += Math.sin(t * 0.9 + p.phase * 6) * 10;
      } else if (amb.motion === 'fall') {
        y = ((p.y0 + t * p.speed) % span) - 40;
        x += Math.sin(t * 0.9 + p.phase * 6) * p.dx * 0.5;
      } else if (amb.motion === 'drift') {
        x = ((p.x + t * 10 + p.phase * 40) % (width + 60)) - 30;
        y += Math.sin(t * 0.6 + p.phase * 6) * 12;
        alpha = 0.7;
      } else {
        alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin((t * 0.9 + p.phase) * Math.PI * 2));
      }
      emoji(p.ch, x, y, p.size, alpha, Math.sin(t * 0.5 + p.phase * 5) * 0.3);
    }
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawPanel(t) {
    const p = easeOut((t - 0.25) / 0.5);
    if (p <= 0) return;
    const x = M;
    const { top, panelH } = L;
    const cx = width / 2;
    const cy = top + panelH / 2;
    const radius = Math.min(tk.panelRadius, 32);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(cx, cy);
    ctx.scale(0.94 + 0.06 * p, 0.94 + 0.06 * p);
    ctx.translate(-cx, -cy);
    if (hard) {
      ctx.fillStyle = parseColor(hard.color);
      roundRect(x + hard.x, top + hard.y, panelW, panelH, radius);
      ctx.fill();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.28)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
    }
    ctx.fillStyle = tk.panelBg;
    roundRect(x, top, panelW, panelH, radius);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (borderColor) {
      ctx.lineWidth = borderW;
      ctx.strokeStyle = borderColor;
      roundRect(x + borderW / 2, top + borderW / 2, panelW - borderW, panelH - borderW, radius);
      ctx.stroke();
    }
    const glyph = theme.decor?.[2];
    if (glyph) emoji(glyph, cx, top, 30, 1);
    ctx.restore();
  }

  /** Mỗi dòng nội dung hiện lần lượt: mờ dần + trượt lên. */
  const step = (t, start) => easeOut((t - start) / 0.5);

  function withStep(a, fn) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(0, (1 - a) * 14);
    fn();
    ctx.restore();
  }

  function drawText(t) {
    const cx = width / 2;
    const { rows } = L;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    withStep(step(t, 0.7), () => {
      ctx.font = fontDisplay(rows.hb.size, 600);
      ctx.fillStyle = tk.soft;
      rows.hb.lines.forEach((line, i) => drawSpaced(ctx, line, cx, rows.hb.y + i * rows.hb.size * 1.25, rows.hb.size * tk.spacingEm));
    });

    withStep(step(t, 1.1), () => {
      ctx.font = fontDisplay(rows.name.size, 700);
      let fill = nameColor;
      if (nameStops.length >= 2) {
        const w = Math.max(...rows.name.lines.map((l) => ctx.measureText(l).width));
        const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
        nameStops.forEach((s) => g.addColorStop(clamp(s.pos), s.color));
        fill = g;
      }
      ctx.fillStyle = fill;
      rows.name.lines.forEach((line, i) => ctx.fillText(line, cx, rows.name.y + i * rows.name.size * 1.15));
    });

    withStep(step(t, 1.5), () => {
      const y = rows.divider.y;
      const half = Math.min(105, innerW / 2.6);
      ctx.fillStyle = tk.accent;
      ctx.strokeStyle = tk.accent;
      ctx.lineWidth = 1.5;
      for (const dir of [-1, 1]) {
        const g = ctx.createLinearGradient(cx + dir * 14, 0, cx + dir * (14 + half), 0);
        g.addColorStop(0, tk.accent);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx + dir * 14, y);
        ctx.lineTo(cx + dir * (14 + half), y);
        ctx.stroke();
      }
      if (/\p{Extended_Pictographic}/u.test(tk.divider)) emoji(tk.divider, cx, y, 18, 1);
      else {
        ctx.font = fontDisplay(18, 700);
        ctx.textBaseline = 'middle';
        ctx.fillText(tk.divider, cx, y);
      }
    });

    withStep(step(t, 1.9), () => {
      ctx.font = fontBody(rows.wish.size, 400);
      ctx.fillStyle = tk.ink;
      ctx.textBaseline = 'alphabetic';
      rows.wish.lines.forEach((line, i) => ctx.fillText(line, cx, rows.wish.y + (i + 0.8) * rows.wish.size * 1.55));
    });

    withStep(step(t, 2.6), () => {
      ctx.font = fontBody(13, 600);
      ctx.fillStyle = tk.soft;
      ctx.fillText(occ.signoff, cx, rows.sign.y);
    });
  }

  function drawConfetti(t) {
    for (const c of confetti) {
      const tau = t - c.at;
      if (tau < 0) continue;
      const y = -24 + tau * c.vy;
      if (y > height + 24) continue;
      const x = c.x + Math.sin(tau * 2.2) * c.sway * 0.4 + tau * c.sway * 0.3;
      const alpha = clamp((height - y) / 120);
      if (c.ch) emoji(c.ch, x, y, 18, alpha, tau * c.rot);
      else {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(tau * c.rot);
        ctx.fillStyle = c.color;
        if (c.round) {
          ctx.beginPath();
          ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
    }
  }

  function drawWatermark() {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.font = fontBody(11, 600);
    ctx.fillStyle = tk.soft;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Wishora · Gửi lời thương, trao niềm vui', width / 2, height - 18);
    ctx.restore();
  }

  return {
    canvas,
    width,
    height,
    duration: DURATION,
    /** Đợi font tải xong (canvas chỉ dùng được font đã nạp) rồi tính bố cục. */
    async ready() {
      const fonts = [fontDisplay(24, 600), fontDisplay(24, 700), fontBody(14, 400), fontBody(14, 600)];
      try {
        await Promise.all(fonts.map((f) => document.fonts.load(f, data.name + data.message + headline)));
        await document.fonts.ready;
      } catch {
        /* dùng font dự phòng */
      }
      L = layout();
    },
    draw(t) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawBackground();
      drawDecor(t);
      drawAmbient(t);
      drawPanel(t);
      drawText(t);
      drawConfetti(t);
      drawWatermark();
      return canvas;
    },
  };
}

// ------------------------------------------------------------------ Mã hóa MP4

const tick = () => new Promise((r) => setTimeout(r, 0));

/** Trình duyệt có WebCodecs (Chrome/Edge 94+, Safari 16.4+, Firefox 130+) để mã hóa H.264 không. */
export const videoSupported = () => typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';

async function pickCodec(width, height) {
  for (const codec of CODECS) {
    try {
      const cfg = { codec, width, height, bitrate: BITRATE, framerate: FPS };
      if ((await VideoEncoder.isConfigSupported(cfg)).supported) return cfg;
    } catch {
      /* thử codec kế tiếp */
    }
  }
  return null;
}

/**
 * Xuất video MP4. Trả về { blob, width, height, frames, seconds, bytes }.
 * @param {object} data  { occasion, name, message, theme, title? }
 * @param {{onProgress?:(fraction:number)=>void, signal?:AbortSignal}} opts
 */
export async function exportVideo(data, { onProgress, signal } = {}) {
  if (!videoSupported()) throw new Error('unsupported');
  const r = createCardRenderer(data, { scale: VIDEO_SCALE });
  await r.ready();
  const w = r.width * VIDEO_SCALE;
  const h = r.height * VIDEO_SCALE;
  const config = await pickCodec(w, h);
  if (!config) throw new Error('unsupported');

  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: w, height: h }, fastStart: 'in-memory' });
  let failure = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { failure = e; },
  });
  encoder.configure(config);

  const total = Math.round((DURATION + HOLD) * FPS);
  try {
    for (let i = 0; i < total; i++) {
      if (signal?.aborted) throw new DOMException('Đã hủy', 'AbortError');
      if (failure) throw failure;
      const canvas = r.draw(Math.min(i / FPS, DURATION));
      const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      encoder.encode(frame, { keyFrame: i % FPS === 0 });
      frame.close();
      onProgress?.((i + 1) / total);
      while (encoder.encodeQueueSize > 6) await tick(); // đừng dồn khung hình vào hàng đợi của bộ mã hóa
      if (i % 3 === 2) await tick();
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
  muxer.finalize();
  const { buffer } = muxer.target;
  return { blob: new Blob([buffer], { type: 'video/mp4' }), width: w, height: h, frames: total, seconds: total / FPS, bytes: buffer.byteLength };
}

/** Tên file gợi ý: wishora-<dịp>-<tên không dấu>.mp4 */
export function videoFileName(occasionId, name) {
  const slug = String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `wishora-${occasionId}${slug ? `-${slug}` : ''}.mp4`;
}
