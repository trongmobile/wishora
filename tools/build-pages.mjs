/**
 * Sinh trang tĩnh + ảnh OG cho từng dịp (hướng "prerender theo dịp").
 *   npm i          # lần đầu (playwright-core)
 *   npm run build:pages            # sinh o/<slug>/index.html, assets/og/<slug>.png, sitemap.xml, robots.txt
 *                                  # và cập nhật danh sách link tới các dịp ở chân trang index.html
 *   npm run build:pages -- --html  # chỉ sinh HTML, bỏ qua ảnh (không cần trình duyệt)
 * Cũng vẽ lại assets/og/og-image.png (ảnh chung) từ tools/og-home.html.
 * Cần Chrome/Chromium: đặt CHROME_PATH nếu không ở vị trí mặc định của macOS.
 * Chạy lại mỗi khi sửa index.html, danh sách dịp hoặc theme, rồi commit kết quả.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { OCCASIONS } from '../js/data/occasions.js';
import { renderPage, ogHtml, pagePath, ogPath, injectOccasionLinks, sitemapXml, robotsTxt } from './pages-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlOnly = process.argv.includes('--html');
const list = OCCASIONS.filter((o) => o.enabled);

// Cập nhật danh sách link tới các trang dịp ở chân trang index.html trước, vì index.html là khuôn của mọi trang dịp.
const indexFile = resolve(root, 'index.html');
const template = injectOccasionLinks(readFileSync(indexFile, 'utf8'), list);
writeFileSync(indexFile, template);
writeFileSync(resolve(root, 'sitemap.xml'), sitemapXml(template, list));
writeFileSync(resolve(root, 'robots.txt'), robotsTxt(template));

for (const o of list) {
  const file = resolve(root, pagePath(o));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderPage(template, o));
}
// Dọn trang/ảnh của dịp đã bị xóa hoặc tắt (không đụng og-image.png chung).
const slugs = new Set(list.map((o) => o.slug));
for (const dir of existsSync(resolve(root, 'o')) ? readdirSync(resolve(root, 'o')) : []) {
  if (!slugs.has(dir)) rmSync(resolve(root, 'o', dir), { recursive: true, force: true });
}
for (const f of existsSync(resolve(root, 'assets/og')) ? readdirSync(resolve(root, 'assets/og')) : []) {
  if (f.endsWith('.png') && f !== 'og-image.png' && !slugs.has(f.slice(0, -4))) rmSync(resolve(root, 'assets/og', f));
}
console.log(`Đã sinh ${list.length} trang HTML trong o/, sitemap.xml, robots.txt`);

if (!htmlOnly) {
  const { chromium } = await import('playwright-core');
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executablePath = process.env.CHROME_PATH || (existsSync(mac) ? mac : undefined);
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const tmp = resolve(root, 'tools/.og-tmp.html');
  mkdirSync(resolve(root, 'assets/og'), { recursive: true });
  for (const o of list) {
    writeFileSync(tmp, ogHtml(o, pathToFileURL(root).href.replace(/\/$/, '')));
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: resolve(root, ogPath(o)) });
  }
  // Ảnh OG chung của trang chủ (tools/og-home.html)
  await page.goto(pathToFileURL(resolve(root, 'tools/og-home.html')).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(root, 'assets/og/og-image.png') });
  await browser.close();
  (await import('node:fs')).rmSync(tmp, { force: true });
  console.log(`Đã sinh ${list.length} ảnh OG theo dịp + og-image.png trong assets/og/`);
}
