import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { OCCASIONS } from '../js/data/occasions.js';
import { renderPage, pagePath, ogPath, siteUrl, injectOccasionLinks, sitemapXml, robotsTxt, wishPhrase, seoTitle } from '../tools/pages-lib.mjs';
import { shareBase, buildCardUrl, parseCardUrl } from '../js/url-state.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const template = read('index.html');
const enabled = OCCASIONS.filter((o) => o.enabled);

test('mỗi dịp có trang tĩnh khớp index.html hiện tại (chạy `npm run build:pages` nếu test này đỏ)', () => {
  for (const o of enabled) {
    assert.ok(existsSync(new URL(`../${pagePath(o)}`, import.meta.url)), `thiếu ${pagePath(o)}`);
    assert.equal(read(pagePath(o)), renderPage(template, o), `${pagePath(o)} đã cũ`);
  }
});

test('mỗi dịp có ảnh OG 1200×630 riêng', () => {
  for (const o of enabled) {
    const f = new URL(`../${ogPath(o)}`, import.meta.url);
    assert.ok(existsSync(f) && statSync(f).size > 5000, `thiếu ${ogPath(o)}`);
    const buf = readFileSync(f);
    assert.equal(buf.readUInt32BE(16), 1200);
    assert.equal(buf.readUInt32BE(20), 630);
  }
});

test('metadata theo dịp: tiêu đề, ảnh, url trỏ đúng dịp', () => {
  const o = enabled.find((x) => x.id === 'women-day-20-10');
  const html = read(pagePath(o));
  const site = siteUrl(template);
  assert.match(html, /<title>Thiệp Ngày Phụ nữ Việt Nam 20\/10 online miễn phí — Wishora<\/title>/);
  assert.match(html, /property="og:title"\s+content="Thiệp Ngày Phụ nữ Việt Nam 20\/10 — Wishora"/, 'og:title giữ tên dịp gọn cho Zalo/Facebook');
  assert.ok(html.includes(`content="${site}o/women-day-20-10/"`));
  assert.ok(html.includes(`<link rel="canonical" href="${site}o/women-day-20-10/" />`));
  assert.ok(html.includes(`content="${site}assets/og/women-day-20-10.png"`));
  assert.ok(html.includes('<base href="../../" />'));
  assert.ok(html.includes('"@type":"BreadcrumbList"'));
});

test('trang theo dịp có sẵn nội dung của dịp trong HTML (không cần JS)', () => {
  for (const o of enabled) {
    const html = read(pagePath(o));
    assert.ok(html.includes(`<section class="prose occ-seo" data-occasion="${o.id}"`), o.id);
    assert.ok(html.includes('<div data-page="create">') && html.includes('<div data-page="home" hidden>'), `${o.id}: HTML ban đầu phải là form tạo thiệp`);
    for (const m of Object.values(o.messageTemplates).flat()) assert.ok(html.includes(m.replace(/&/g, '&amp;')), `${o.id}: thiếu lời chúc mẫu`);
  }
  const byId = (id) => enabled.find((o) => o.id === id);
  assert.equal(wishPhrase(byId('birthday')), 'Lời chúc sinh nhật');
  assert.equal(wishPhrase(byId('graduation')), 'Lời chúc mừng tốt nghiệp');
  assert.equal(wishPhrase(byId('thank-you')), 'Lời cảm ơn');
  assert.equal(wishPhrase(byId('free-wish')), 'Lời chúc tự do');
  assert.equal(seoTitle(byId('tet')), 'Thiệp Tết Nguyên Đán online miễn phí — Wishora');
});

test('index.html: link tới mọi trang dịp, sitemap.xml và robots.txt khớp dữ liệu (chạy `npm run build:pages` nếu đỏ)', () => {
  assert.equal(template, injectOccasionLinks(template, enabled), 'vùng occasion-links của index.html đã cũ');
  for (const o of enabled) assert.ok(template.includes(`<a href="o/${o.slug}/">`), o.id);
  assert.equal(read('sitemap.xml'), sitemapXml(template, enabled));
  assert.equal(read('robots.txt'), robotsTxt(template));
});

test('index.html: canonical, JSON-LD và tiêu đề dùng đúng gốc site', () => {
  const site = siteUrl(template);
  assert.ok(template.includes(`<link rel="canonical" href="${site}" />`));
  const ld = JSON.parse(template.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  for (const node of ld['@graph']) assert.ok(node.url.startsWith(site), `${node['@type']}: ${node.url}`);
  // app.js đặt lại document.title khi về trang chủ: phải trùng <title> của index.html.
  const title = template.match(/<title>([^<]*)<\/title>/)[1];
  assert.ok(read('js/app.js').includes(`home: '${title}'`), 'TITLES.home trong js/app.js khác <title> của index.html');
  // Link thiệp (có tên, lời chúc) được đánh dấu noindex ngay trong script đầu trang.
  assert.match(template, /if \(isCard\) \{[\s\S]*?robots\.content = "noindex"/);
});

test('link chia sẻ trỏ vào trang của dịp và vẫn đọc lại được', () => {
  assert.equal(shareBase('tet', 'https://x.test/wishora/'), 'https://x.test/wishora/o/tet/');
  const url = buildCardUrl({ occasion: 'tet', name: 'An', message: 'Chúc', theme: 'tet-traditional' }, shareBase('tet', 'https://x.test/wishora/'));
  assert.ok(url.startsWith('https://x.test/wishora/o/tet/?'));
  assert.equal(parseCardUrl(new URL(url).search).data.occasion, 'tet');
});

test('không còn trang/ảnh OG của dịp đã xóa', () => {
  const slugs = new Set(enabled.map((o) => o.slug));
  for (const d of readdirSync(new URL('../o/', import.meta.url))) assert.ok(slugs.has(d), `o/${d} thừa`);
  for (const f of readdirSync(new URL('../assets/og/', import.meta.url))) {
    if (f !== 'og-image.png') assert.ok(slugs.has(f.replace(/\.png$/, '')), `assets/og/${f} thừa`);
  }
});
