/**
 * Tóm tắt số liệu GoatCounter 7 ngày qua so với 7 ngày trước đó: lượt xem trang, lượt nhấn nút (event), nguồn truy cập.
 * Dùng trong nội dung PR của workflow SEO hằng tuần (tools/marketing/weekly-seo.mjs), chạy riêng cũng được.
 *   GOATCOUNTER_TOKEN=... node tools/marketing/stats.mjs
 * Token: đăng nhập GoatCounter → tên người dùng ở menu trên → API → tạo key có quyền đọc thống kê.
 * Site lấy từ data-goatcounter trong index.html (đặt GOATCOUNTER_SITE để ghi đè, ví dụ https://hpbd.goatcounter.com).
 * Không có token → in thông báo, thoát 0. Gọi API lỗi → in lỗi, thoát 1.
 */
import { readFileSync } from 'node:fs';

const token = process.env.GOATCOUNTER_TOKEN;
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const site = process.env.GOATCOUNTER_SITE ?? html.match(/data-goatcounter="(https:\/\/[^/"]+)\/count"/)?.[1];

if (!token) {
  console.log('Không có GOATCOUNTER_TOKEN — bỏ qua số liệu GoatCounter.');
  process.exit(0);
}
if (!site) throw new Error('Không tìm thấy data-goatcounter trong index.html; đặt GOATCOUNTER_SITE');

async function get(path, params) {
  const url = new URL(`/api/v0/${path}`, site);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`${url.pathname}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const HOUR = 3600e3;
const now = Math.floor(Date.now() / HOUR) * HOUR; // API yêu cầu mốc thời gian tròn giờ
const iso = (ms) => new Date(ms).toISOString().replace('.000Z', 'Z');
const week = { start: iso(now - 7 * 24 * HOUR), end: iso(now) };
const prevWeek = { start: iso(now - 14 * 24 * HOUR), end: week.start };
const vnDate = (s) => new Date(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' });

try {
  // API giới hạn 4 request/giây — gọi lần lượt.
  const cur = await get('stats/hits', { ...week, limit: 100 });
  const prev = await get('stats/hits', { ...prevWeek, limit: 100 });
  const refs = await get('stats/toprefs', { ...week, limit: 20 });
  const before = new Map(prev.hits.map((h) => [h.path, h.count]));
  const rows = (hits) => hits.map((h) => `| ${h.path} | ${h.count} | ${before.get(h.path) ?? 0} |`).join('\n') || '| (không có) | | |';

  console.log(`# GoatCounter ${vnDate(week.start)}–${vnDate(week.end)} (so với 7 ngày trước)\n`);
  console.log(`Tổng lượt truy cập: ${cur.total} (7 ngày trước: ${prev.total})${cur.more ? ' — chỉ hiện 100 đường dẫn đầu' : ''}\n`);
  console.log(`## Trang\n\n| Đường dẫn | 7 ngày | 7 ngày trước |\n|---|---|---|\n${rows(cur.hits.filter((h) => !h.event))}\n`);
  console.log(`## Lượt nhấn nút (event)\n\n| Event | 7 ngày | 7 ngày trước |\n|---|---|---|\n${rows(cur.hits.filter((h) => h.event))}\n`);
  console.log(`## Nguồn truy cập (7 ngày)\n\n| Nguồn | Lượt |\n|---|---|\n${refs.stats.map((r) => `| ${r.name || '(trực tiếp)'} | ${r.count} |`).join('\n') || '| (không có) | |'}`);
} catch (err) {
  console.error(`Không lấy được số liệu GoatCounter: ${err.message}`);
  process.exit(1);
}
