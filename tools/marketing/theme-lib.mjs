/**
 * Phần thuần (không gọi mạng, không ghi file) của bước "thêm theme thiệp" trong workflow SEO hằng tuần:
 * chọn dịp cần thêm theme, dựng prompt cho Gemini, kiểm tra tham số Gemini trả về rồi sinh cấu hình JS
 * (js/data/themes-auto.js) và khối CSS (css/themes.css). Gemini chỉ chọn màu, emoji, font trong danh sách có sẵn;
 * CSS do template ở đây viết ra nên không có chuyện Gemini chèn CSS tùy ý vào site.
 */
import { LIMITS, isFar } from './seo-lib.mjs';
import { normalize } from '../../js/occasion-engine.js';
import { formatDate } from '../../js/calendar.js';

export const THEME_LIMITS = Object.freeze({
  perRun: 1,
  target: 6, // dịp đã có chừng này theme thì thôi thêm
});

/** Font đã nạp trong index.html → chuỗi font-family dùng trong CSS. */
export const FONTS = Object.freeze({
  'Dancing Script': '"Dancing Script", cursive',
  Quicksand: '"Quicksand", "Be Vietnam Pro", sans-serif',
  'Playfair Display': '"Playfair Display", Georgia, serif',
  'Space Grotesk': '"Space Grotesk", system-ui, sans-serif',
  'Cormorant Garamond': '"Cormorant Garamond", Georgia, serif',
  Lora: '"Lora", Georgia, serif',
  Pacifico: '"Pacifico", cursive',
});
export const MOTIONS = ['rise', 'fall', 'twinkle', 'drift'];
export const DIVIDERS = ['♥', '✦', '✿', '❀', '☁', '✧', '★'];

/** Nhóm theme (THEME_GROUPS) theo danh mục dịp. Nhóm 'love' chỉ dành cho dịp tình yêu (tests/data.test.js). */
const GROUP_BY_CATEGORY = { tet: 'tet', women: 'women', love: 'love', vietnamese: 'vietnam', international: 'intl' };
export const groupFor = (occasion) => GROUP_BY_CATEGORY[occasion.category] ?? 'general';

/**
 * Chọn dịp để thêm theme từ kết quả upcoming(): dịp còn minDays–maxDays ngày, đang có ít theme nhất
 * (dưới THEME_LIMITS.target), rồi tới dịp gần hơn; dịp còn trong nearDays ngày luôn được xét trước dịp xa hơn.
 * Trả về { occasion, next } hoặc null.
 */
export function pickThemeTarget(list, limits = THEME_LIMITS) {
  return list
    .filter((x) => x.next && x.occasion.enabled && x.next.days >= LIMITS.minDays && x.next.days <= LIMITS.maxDays && x.occasion.themeIds.length < limits.target)
    .sort((a, b) => isFar(a) - isFar(b) || a.occasion.themeIds.length - b.occasion.themeIds.length || a.next.days - b.next.days)[0] ?? null;
}

export function themePrompt({ occasion, next }, existing, rules) {
  const own = existing.filter((t) => occasion.themeIds.includes(t.id));
  const list = (ts) => ts.map((t) => `- ${t.name}: ${t.description} (màu ${t.colors.join(', ')})`).join('\n') || '(chưa có)';
  return [
    'Bạn thiết kế theme (giao diện) thiệp cho Wishora, website tạo thiệp chúc mừng online cho người Việt. Người nhận mở link thấy hộp quà hoặc phong bì, bấm mở và xem lời chúc hiện ra giữa nền màu, hạt trang trí rơi/bay và confetti. Bạn chỉ chọn màu, emoji và font; code do hệ thống dựng.',
    `## Dịp\n${occasion.name} — ${formatDate(next.date)}\nTông: ${occasion.tone}\nMô tả: ${occasion.description}`,
    `## Quy tắc\n${rules}`,
    `## Theme dịp này đã có (thiết kế theme khác hẳn về màu và cảm giác)\n${list(own)}`,
    `## Font được dùng\n${Object.keys(FONTS).join(', ')}`,
    `## Ký tự phân cách được dùng\n${DIVIDERS.join(' ')}`,
    'Trả về một đối tượng JSON theo schema.',
  ].join('\n\n');
}

const STR = { type: 'STRING' };
const strs = (n) => ({ type: 'ARRAY', items: STR, minItems: n[0], maxItems: n[1] });
export const themeSchema = {
  type: 'OBJECT',
  properties: {
    name: STR, description: STR, sample: STR,
    bgTop: STR, bgBottom: STR, ink: STR, accent: STR, accentSoft: STR,
    font: { type: 'STRING', enum: Object.keys(FONTS) },
    intro: { type: 'STRING', enum: ['gift', 'envelope'] },
    seal: STR, emoji: STR, divider: { type: 'STRING', enum: DIVIDERS },
    decor: strs([3, 3]),
    ambientChars: strs([3, 5]), ambientCount: { type: 'INTEGER' }, ambientMotion: { type: 'STRING', enum: MOTIONS },
    confettiColors: strs([3, 5]), confettiChars: strs([0, 3]), confettiRatio: { type: 'NUMBER' },
  },
  required: ['name', 'description', 'sample', 'bgTop', 'bgBottom', 'ink', 'accent', 'accentSoft', 'font', 'intro', 'seal', 'emoji', 'divider', 'decor', 'ambientChars', 'ambientCount', 'ambientMotion', 'confettiColors', 'confettiChars', 'confettiRatio'],
};

// ---- Màu ----
const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const hex = (c) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => { const [x, y] = [rgb(a), rgb(b)]; return hex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const rgba = (h, a) => `rgba(${rgb(h).join(', ')}, ${a})`;

const GLYPH = /^\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*$/u;
const isGlyph = (s) => typeof s === 'string' && s.length <= 12 && GLYPH.test(s);
const slug = (s) => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Kiểm tra tham số Gemini trả về cho dịp `target`. `existing`: THEMES hiện có (để tránh trùng id/tên).
 * Trả về { theme } (cấu hình theme, đã kèm occasionId) hoặc { reason }.
 */
export function acceptTheme(raw, { occasion }, existing) {
  const t = raw && typeof raw === 'object' ? raw : {};
  const text = (v, min, max) => { const s = String(v ?? '').replace(/\s+/g, ' ').trim(); return s.length >= min && s.length <= max && !/[<>{}"\\;]/.test(s) ? s : null; };
  const name = text(t.name, 3, 28);
  const description = text(t.description, 20, 90);
  const sample = text(t.sample, 4, 30);
  if (!name || !description || !sample) return { reason: 'tên, mô tả hoặc chữ mẫu sai độ dài hoặc có ký tự không cho phép' };
  if (!/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(description)) return { reason: 'mô tả không phải tiếng Việt có dấu' };
  const id = slug(name);
  if (!id || existing.some((x) => x.id === id || normalize(x.name) === normalize(name))) return { reason: `tên hoặc id "${id}" trùng theme đã có` };

  const colors = Object.fromEntries(['bgTop', 'bgBottom', 'ink', 'accent', 'accentSoft'].map((k) => [k, String(t[k] ?? '').toLowerCase()]));
  const bad = Object.entries(colors).find(([, v]) => !HEX.test(v));
  if (bad) return { reason: `màu ${bad[0]} không phải dạng #rrggbb` };
  const mid = mix(colors.bgTop, colors.bgBottom, 0.5);
  const dark = lum(mid) < 0.25;
  const panel = dark ? mix(colors.bgBottom, '#000000', 0.3) : '#ffffff';
  const panelAlpha = dark ? 0.66 : 0.84;
  const panelSeen = mix(mid, panel, panelAlpha);
  for (const [label, bg] of [['nền trên', colors.bgTop], ['nền dưới', colors.bgBottom], ['khung chữ', panelSeen]]) {
    const c = contrast(colors.ink, bg);
    if (c < 4.5) return { reason: `chữ khó đọc trên ${label} (độ tương phản ${c.toFixed(1)}, cần ≥ 4.5)` };
  }
  if (!FONTS[t.font] || !['gift', 'envelope'].includes(t.intro) || !DIVIDERS.includes(t.divider) || !MOTIONS.includes(t.ambientMotion)) return { reason: 'font, kiểu mở đầu, ký tự phân cách hoặc kiểu chuyển động ngoài danh sách' };

  const emojis = (list, min, max) => Array.isArray(list) && list.length >= min && list.length <= max && list.every(isGlyph) ? list : null;
  const ambientChars = emojis(t.ambientChars, 3, 5);
  const confettiChars = emojis(t.confettiChars, 0, 3);
  const decor = Array.isArray(t.decor) && t.decor.length === 3 && t.decor.every((s) => s === '' || isGlyph(s)) ? t.decor : null;
  if (!ambientChars || !confettiChars || !decor || !isGlyph(t.seal) || !isGlyph(t.emoji)) return { reason: 'emoji trang trí không hợp lệ' };
  const confettiColors = Array.isArray(t.confettiColors) ? t.confettiColors.map((c) => String(c).toLowerCase()) : [];
  if (confettiColors.length < 3 || confettiColors.length > 5 || !confettiColors.every((c) => HEX.test(c))) return { reason: 'màu confetti không hợp lệ' };

  const solemn = occasion.tone === 'solemn';
  const count = Math.round(Number(t.ambientCount));
  const ratio = Math.min(0.5, Math.max(0, Number(t.confettiRatio) || 0));
  return {
    theme: {
      id, name, description,
      colors: [colors.bgTop, colors.accent, colors.bgBottom],
      intro: t.intro, group: groupFor(occasion), occasionId: occasion.id,
      sample, seal: t.seal, decor,
      ambient: { chars: ambientChars, count: Math.min(solemn ? 10 : 26, Math.max(8, Number.isFinite(count) ? count : 14)), motion: solemn ? 'drift' : t.ambientMotion },
      confetti: solemn ? null : { colors: confettiColors, chars: confettiChars, charRatio: confettiChars.length ? ratio : 0 },
      // Tham số chỉ dùng để dựng CSS, không đi vào js/data/themes.js.
      css: { ...colors, font: t.font, emoji: t.emoji, divider: t.divider },
    },
  };
}

/** Khối CSS [data-theme="<id>"] của theme (cùng bộ biến với các theme viết tay trong css/themes.css). */
export function renderThemeCss({ id, name, css: c }) {
  const mid = mix(c.bgTop, c.bgBottom, 0.5);
  const dark = lum(mid) < 0.25;
  const panel = dark ? mix(c.bgBottom, '#000000', 0.3) : '#ffffff';
  const btnInk = contrast('#ffffff', c.accent) >= contrast('#1a1a1a', c.accent) ? '#ffffff' : '#1a1a1a';
  const btnTo = mix(c.accent, btnInk === '#ffffff' ? '#000000' : '#ffffff', 0.14);
  const nameColor = contrast(c.accent, mid) >= 3 ? c.accent : c.ink;
  const lines = [
    `/* ${name} */`,
    `[data-theme="${id}"] {`,
    `  --bg: linear-gradient(160deg, ${c.bgTop}, ${c.bgBottom});`,
    `  --ink: ${c.ink}; --ink-soft: ${mix(c.ink, mid, 0.3)}; --accent: ${c.accent};`,
    `  --panel-bg: ${rgba(panel, dark ? 0.66 : 0.84)}; --panel-border: 1px solid ${dark ? rgba(c.accent, 0.5) : 'rgba(255, 255, 255, 0.95)'}; --panel-radius: 28px;`,
    `  --panel-shadow: 0 24px 60px ${rgba(c.accent, 0.3)}, inset 0 0 0 6px ${rgba('#ffffff', dark ? 0.06 : 0.5)};`,
    `  --font-display: ${FONTS[c.font]};`,
    `  --btn-bg: linear-gradient(135deg, ${c.accent}, ${btnTo}); --btn-ink: ${btnInk}; --btn-shadow: 0 10px 26px ${rgba(c.accent, 0.4)};`,
    `  --name-color: ${nameColor};`,
    `  --divider-glyph: "${c.divider}"; --emoji: "${c.emoji}";`,
    `  --gift-1: ${c.accentSoft}; --gift-2: ${c.accent}; --ribbon: ${contrast('#ffffff', c.accentSoft) >= 1.5 ? '#ffffff' : c.ink}; --gift-border: 0; --glow: ${rgba(c.accentSoft, 0.9)};`,
    `  --env-1: ${c.accentSoft}; --env-2: ${c.accent}; --env-3: ${mix(c.accentSoft, '#ffffff', 0.35)}; --seal: ${mix(c.accent, '#000000', 0.2)};`,
    '}',
  ];
  return lines.join('\n');
}

export const CSS_START = '/* AUTO-THEMES:START — do tools/marketing/weekly-seo.mjs ghi, sửa tay được */';
export const CSS_END = '/* AUTO-THEMES:END */';

/** Thêm khối CSS của các theme chưa có vào giữa hai dòng đánh dấu trong css/themes.css. */
export function insertThemeCss(source, themes) {
  const a = source.indexOf(CSS_START);
  const b = source.indexOf(CSS_END);
  if (a < 0 || b < a) throw new Error('css/themes.css thiếu cặp dòng AUTO-THEMES:START / AUTO-THEMES:END');
  const blocks = themes.filter((t) => t.css && !source.includes(`[data-theme="${t.id}"] {`)).map(renderThemeCss);
  if (!blocks.length) return source;
  return `${source.slice(0, b)}${blocks.join('\n')}\n${source.slice(b)}`;
}

/** Nội dung mới của js/data/themes-auto.js: giữ phần chú thích đầu file, thay mảng AUTO_THEMES. */
export function renderThemesFile(source, themes) {
  const at = source.indexOf('export const AUTO_THEMES');
  if (at < 0) throw new Error('themes-auto.js thiếu "export const AUTO_THEMES"');
  const clean = themes.map(({ css, ...t }) => t);
  return `${source.slice(0, at)}export const AUTO_THEMES = ${JSON.stringify(clean, null, 2)};\n`;
}

/** Mục "Theme mới" của PR. result: { occasion, next, theme } | { occasion, next, reason } | { error } | null. */
export function themeSection(result, site) {
  if (!result) return '_Không có dịp nào còn 5–45 ngày cần thêm theme._';
  if (result.error) return `_Không tạo được theme: ${result.error}_`;
  const head = `${result.occasion.name} — ${formatDate(result.next.date)}, còn ${result.next.days} ngày`;
  if (!result.theme) return `**${head}**\n\n_Theme Gemini đề xuất bị loại: ${result.reason}._`;
  const t = result.theme;
  const q = `?page=create&occasion=${result.occasion.id}&theme=${t.id}`;
  return [
    `**${t.name}** cho ${head}`,
    `${t.description}\n\nMàu: ${t.colors.map((c) => `\`${c}\``).join(' ')} · nhóm \`${t.group}\` · mở bằng ${t.intro === 'gift' ? 'hộp quà' : 'phong bì'}`,
    `Xem thử trước khi merge: checkout nhánh PR, chạy \`npm start\` rồi mở \`http://localhost:8000/${q}\` (sau khi merge: ${site}${q}). Chưa ưng thì chỉnh màu trong khối CSS của theme trong \`css/themes.css\` (giữa \`AUTO-THEMES:START/END\`) hoặc xóa theme khỏi \`js/data/themes-auto.js\` rồi merge.`,
  ].join('\n\n');
}
