import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { OCCASIONS } from '../js/data/occasions.js';
import { renderPage, pagePath, ogPath, siteUrl } from '../tools/pages-lib.mjs';
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
  assert.match(html, /<title>Thiệp Ngày Phụ nữ Việt Nam 20\/10 — Wishora<\/title>/);
  assert.ok(html.includes(`content="${site}o/women-day-20-10/"`));
  assert.ok(html.includes(`content="${site}assets/og/women-day-20-10.png"`));
  assert.ok(html.includes('<base href="../../" />'));
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
