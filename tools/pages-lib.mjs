/** Thư viện dùng chung cho build trang theo dịp: sinh HTML (có meta riêng) và HTML ảnh OG. */
import { getTheme } from '../js/data/themes.js';
import { CATEGORIES } from '../js/data/occasions.js';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** URL gốc của site, lấy từ og:url trong index.html (không hardcode ở nơi khác). */
export function siteUrl(template) {
  const m = template.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
  if (!m) throw new Error('index.html thiếu og:url');
  return m[1].endsWith('/') ? m[1] : `${m[1]}/`;
}

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`index.html thiếu meta ${key}`);
  return html.replace(re, (_, a, b) => `${a}${esc(value)}${b}`);
};

export const pagePath = (o) => `o/${o.slug}/index.html`;
export const ogPath = (o) => `assets/og/${o.slug}.png`;

/** Trang tĩnh cho một dịp: cùng app, khác metadata (crawler không chạy JS nên phải có sẵn trong HTML). */
export function renderPage(template, o) {
  const site = siteUrl(template);
  const title = `Thiệp ${o.name} — Wishora`;
  const desc = `${o.description} Tạo thiệp chúc mừng cá nhân hóa và gửi bằng một đường link.`;
  const url = `${site}o/${o.slug}/`;
  const image = `${site}${ogPath(o)}`;
  let h = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  h = h.replace(/(<meta charset="utf-8" \/>)/, `$1\n    <base href="../../" />\n    <meta name="wishora-occasion" content="${esc(o.id)}" />`);
  for (const [attr, key, v] of [
    ['name', 'description', desc], ['property', 'og:title', title], ['property', 'og:description', desc], ['property', 'og:url', url],
    ['property', 'og:image', image], ['property', 'og:image:alt', `${o.name} — thiệp chúc mừng Wishora`],
    ['name', 'twitter:title', title], ['name', 'twitter:description', desc], ['name', 'twitter:image', image],
  ]) h = setMeta(h, attr, key, v);
  return h;
}

const LOGO = `<svg viewBox="0 0 32 32" width="56" height="56"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b8f"/><stop offset=".55" stop-color="#d62f5c"/><stop offset="1" stop-color="#8b2fc9"/></linearGradient></defs><rect width="32" height="32" rx="10" fill="url(#g)"/><path d="M7 12.5l4.4 11 4.6-9.2 4.6 9.2 4.4-11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4.6c.5 2 1.1 2.6 3 3.1-1.9.5-2.5 1.1-3 3.1-.5-2-1.1-2.6-3-3.1 1.9-.5 2.5-1.1 3-3.1z" fill="#ffd166"/></svg>`;

/** HTML 1200×630 của ảnh OG một dịp, dùng biến CSS của chính theme đại diện. `root` là đường dẫn file:// tới thư mục dự án. */
export function ogHtml(o, root) {
  const theme = getTheme(o.cover.theme);
  const [a = '', b = ''] = theme.decor ?? [];
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Cormorant+Garamond:wght@500;600&family=Dancing+Script:wght@600;700&family=Lora:wght@500;600&family=Pacifico&family=Playfair+Display:wght@600;700&family=Quicksand:wght@500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}/css/themes.css">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;display:grid;place-items:center;padding-bottom:70px;font-family:var(--font-body,"Be Vietnam Pro",sans-serif);background:var(--bg);color:var(--ink)}
.art{position:absolute;font-size:130px;line-height:1;opacity:.9}
.a1{left:60px;top:40px;transform:rotate(-12deg)} .a2{right:60px;bottom:90px;transform:rotate(10deg)}
.panel{position:relative;width:840px;padding:36px 60px 40px;text-align:center;background:var(--panel-bg);border:var(--panel-border);border-radius:var(--panel-radius);box-shadow:var(--panel-shadow)}
.glyph{font-size:104px;line-height:1;margin-bottom:6px;height:124px;display:grid;place-items:center}
.glyph img{height:124px;width:auto;filter:drop-shadow(0 8px 14px rgba(0,0,0,.35))}
.cat{font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--ink-soft)}
h1{font-family:var(--font-display);font-size:62px;line-height:1.12;margin:8px 0 12px;font-weight:700;color:var(--name-color,var(--ink));background-image:var(--name-fill,none);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:var(--name-fill-color,currentColor);text-shadow:var(--name-shadow,none)}
.sub{font-size:30px;color:var(--ink-soft)}
.brand{position:absolute;left:0;right:0;bottom:30px;display:flex;justify-content:center;align-items:center;gap:14px;color:var(--ink-soft);font-size:26px}
.brand b{font-size:34px;font-weight:800;letter-spacing:-.5px;color:var(--ink)}
</style></head>
<body data-theme="${esc(theme.id)}">
<span class="art a1">${esc(a)}</span><span class="art a2">${esc(b)}</span>
<div class="panel"><div class="glyph">${o.cover.image ? `<img src="${root}/${esc(o.cover.image)}" height="124">` : esc(o.cover.glyph)}</div><div class="cat">${esc(CATEGORIES[o.category])}</div><h1>${esc(o.name)}</h1><p class="sub">Một lời chúc dành cho bạn</p></div>
<div class="brand">${LOGO}<b>Wishora</b><span>· Gửi lời thương, trao niềm vui</span></div>
</body></html>`;
}
