/** Thư viện dùng chung cho build trang theo dịp: sinh HTML (có meta riêng, nội dung SEO), HTML ảnh OG, sitemap. */
import { getTheme } from '../js/data/themes.js';
import { CATEGORIES } from '../js/data/occasions.js';
import { RELATIONS } from '../js/data/messages.js';

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

/** Thay đúng một chuỗi cố định của index.html; thiếu thì báo lỗi thay vì âm thầm sinh trang sai. */
const swap = (html, from, to) => {
  if (!html.includes(from)) throw new Error(`index.html thiếu: ${from}`);
  return html.replace(from, () => to);
};

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export const pagePath = (o) => `o/${o.slug}/index.html`;
export const ogPath = (o) => `assets/og/${o.slug}.png`;

// Tên dịp đứng giữa câu ("Thiệp …", "Lời chúc …"): tên riêng giữ nguyên, tên chung viết thường chữ đầu.
const PROPER_NAME = /^(Tết|Ngày|Quốc tế|Valentine|White Day|Halloween|Giáng sinh)/;
export const topicOf = (o) => (PROPER_NAME.test(o.name) ? o.name : o.name[0].toLowerCase() + o.name.slice(1));

/** "Lời chúc sinh nhật", "Lời chúc mừng tốt nghiệp", "Lời cảm ơn", "Lời chúc tự do"… */
export function wishPhrase(o) {
  const t = topicOf(o);
  if (t.startsWith('lời ')) return `L${t.slice(1)}`;
  return /^(chúc|cảm ơn|xin lỗi)/.test(t) ? `Lời ${t}` : `Lời chúc ${t}`;
}

/** Tiêu đề trang cho Google (từ khóa trước, thương hiệu sau). og:title vẫn là tên dịp gọn vì người nhận thiệp thấy nó trên Zalo/Facebook. */
export const seoTitle = (o) => `Thiệp ${topicOf(o)} online miễn phí — Wishora`;

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const NTH = ['', 'đầu tiên', 'thứ hai', 'thứ ba', 'thứ tư'];

/** Câu mô tả ngày của dịp, không phụ thuộc năm (trang tĩnh không được cũ theo thời gian). */
function dateText(o) {
  const c = o.dateConfig;
  if (o.dateType === 'fixed') return `Diễn ra ngày ${c.day}/${c.month} hằng năm.`;
  if (o.dateType === 'lunar') return 'Tính theo âm lịch nên ngày dương lịch thay đổi mỗi năm.';
  if (o.dateType === 'rule' && c.byCountry.VN) {
    const r = c.byCountry.VN;
    return `Tại Việt Nam là ${WEEKDAYS[r.weekday]} ${NTH[r.nth]} của tháng ${r.month}.`;
  }
  if (o.dateType === 'rule') return 'Ngày thay đổi theo từng quốc gia.';
  return 'Gửi bất cứ lúc nào bạn muốn.';
}

/**
 * Khối nội dung tĩnh của trang theo dịp: lời chúc mẫu nhóm theo người nhận (khớp cách người dùng tìm trên Google,
 * ví dụ "lời chúc 20/10 cho mẹ"). Nằm ngay trong HTML để Google đọc được mà không cần chạy JS.
 */
export function occasionContent(o) {
  const phrase = wishPhrase(o);
  // Mô tả đã nêu ngày (01/01, Mùng 1, tháng 5…) thì không lặp lại câu về ngày.
  const intro = /\d/.test(o.description) ? o.description : `${o.description} ${dateText(o)}`;
  const list = (items) =>
    `<ul class="wish-list">${items.map((m) => `\n              <li><p>${esc(m)}</p><button type="button" class="btn btn-text btn-sm" data-use-wish>Dùng lời chúc này</button></li>`).join('')}\n            </ul>`;
  const groups = Object.entries(o.messageTemplates)
    .filter(([rel, items]) => rel !== 'default' && RELATIONS[rel] && items.length)
    .map(([rel, items]) => `\n            <h3>${esc(`${phrase} cho ${RELATIONS[rel].toLowerCase()}`)}</h3>\n            ${list(items)}`);
  return `<section class="prose occ-seo" data-occasion="${esc(o.id)}" aria-labelledby="occ-seo-title">
            <h2 id="occ-seo-title">${esc(phrase)} hay, ý nghĩa</h2>
            <p>${esc(intro)} Chọn một mẫu bên dưới để dùng ngay, sửa lại cho đúng giọng của bạn rồi gửi thiệp bằng một đường link qua Zalo, Messenger — miễn phí, không cần đăng ký.</p>
            ${list(o.messageTemplates.default ?? [])}${groups.join('')}
          </section>`;
}

/** Trang tĩnh cho một dịp: cùng app, khác metadata và có sẵn nội dung của dịp (crawler không chạy JS nên phải có sẵn trong HTML). */
export function renderPage(template, o) {
  const site = siteUrl(template);
  const title = `Thiệp ${o.name} — Wishora`;
  const desc = `${o.description} Tạo thiệp chúc mừng cá nhân hóa và gửi bằng một đường link.`;
  const seoDesc = `${o.description} Lời chúc mẫu có sẵn, tạo thiệp online miễn phí, gửi bằng một link.`;
  const url = `${site}o/${o.slug}/`;
  const image = `${site}${ogPath(o)}`;
  let h = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(seoTitle(o))}</title>`);
  h = h.replace(/(<meta charset="utf-8" \/>)/, `$1\n    <base href="../../" />\n    <meta name="wishora-occasion" content="${esc(o.id)}" />`);
  for (const [attr, key, v] of [
    ['name', 'description', seoDesc], ['property', 'og:title', title], ['property', 'og:description', desc], ['property', 'og:url', url],
    ['property', 'og:image', image], ['property', 'og:image:alt', `${o.name} — thiệp chúc mừng Wishora`],
    ['name', 'twitter:title', title], ['name', 'twitter:description', desc], ['name', 'twitter:image', image],
  ]) h = setMeta(h, attr, key, v);

  if (!/<link rel="canonical" href="[^"]*" \/>/.test(h)) throw new Error('index.html thiếu link canonical');
  h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(url)}" />`);
  if (!/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(h)) throw new Error('index.html thiếu JSON-LD');
  h = h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () =>
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Wishora', item: site },
        { '@type': 'ListItem', position: 2, name: title.replace(/ — Wishora$/, ''), item: url },
      ],
    }),
  );

  // HTML ban đầu đã là form tạo thiệp của dịp (không nháy trang chủ, crawler không chạy JS cũng thấy đúng nội dung).
  h = swap(h, '<div data-page="home">', '<div data-page="home" hidden>');
  h = swap(h, '<div data-page="create" hidden>', '<div data-page="create">');
  h = swap(h, '<h1 id="create-title" tabindex="-1">Tạo thiệp của bạn</h1>', `<h1 id="create-title" tabindex="-1">Tạo thiệp ${esc(o.name)}</h1>`);
  h = swap(h, '<!-- occasion-content -->', occasionContent(o));
  return h;
}

// ---------------------------------------------------------------- Liên kết tới mọi trang dịp (chân trang của index.html)
const LINKS_RE = /(<!-- occasion-links:start[^>]*-->)[\s\S]*?(\n[ \t]*<!-- occasion-links:end -->)/;

/** Danh sách link tĩnh tới o/<dịp>/ theo danh mục, để Google tìm thấy và truyền liên kết nội bộ cho từng trang dịp. */
export function occasionLinks(list) {
  return Object.entries(CATEGORIES)
    .map(([cat, label]) => [label, list.filter((o) => o.category === cat)])
    .filter(([, items]) => items.length)
    .map(
      ([label, items]) =>
        `          <div class="fl-group">\n            <p class="fl-cat">${esc(label)}</p>\n            <ul>\n${items
          .map((o) => `              <li><a href="o/${esc(o.slug)}/">${esc(o.name)}</a></li>`)
          .join('\n')}\n            </ul>\n          </div>`,
    )
    .join('\n');
}

/** Ghi lại vùng occasion-links trong index.html (giữ nguyên phần còn lại). */
export function injectOccasionLinks(template, list) {
  if (!LINKS_RE.test(template)) throw new Error('index.html thiếu vùng occasion-links');
  return template.replace(LINKS_RE, (_, start, end) => `${start}\n${occasionLinks(list)}${end}`);
}

// ---------------------------------------------------------------- sitemap.xml + robots.txt
export function sitemapXml(template, list) {
  const site = siteUrl(template);
  const urls = [site, ...list.map((o) => `${site}o/${o.slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}
</urlset>
`;
}

/** Chỉ có hiệu lực khi site nằm ở gốc domain (domain riêng); trên <user>.github.io/<repo>/ Google đọc robots.txt ở gốc domain. */
export const robotsTxt = (template) => `User-agent: *
Allow: /

Sitemap: ${siteUrl(template)}sitemap.xml
`;

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
