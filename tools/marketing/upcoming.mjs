/**
 * Các dịp có ngày trong N ngày tới (giờ Việt Nam) kèm số lời chúc mẫu đang có theo từng người nhận.
 * Đầu vào cho agent SEO hằng tuần (tools/marketing/weekly-seo.md).
 *   node tools/marketing/upcoming.mjs        # 45 ngày tới
 *   node tools/marketing/upcoming.mjs 60
 * Dịp không có ngày cố định (sinh nhật, khoảnh khắc riêng) không nằm trong danh sách.
 */
import { readFileSync } from 'node:fs';
import { upcoming } from '../../js/occasion-engine.js';
import { RELATIONS } from '../../js/data/messages.js';
import { formatDate, todayYMD } from '../../js/calendar.js';
import { siteUrl } from '../pages-lib.mjs';

const days = Number(process.argv[2] ?? 45);
const site = siteUrl(readFileSync(new URL('../../index.html', import.meta.url), 'utf8'));
const list = upcoming(Infinity).filter((x) => x.next.days <= days);

console.log(`# Dịp sắp tới (${days} ngày kể từ ${formatDate(todayYMD())})\n`);
if (!list.length) console.log('Không có dịp nào.');
for (const { occasion: o, next } of list) {
  const t = o.messageTemplates;
  const counts = ['default', ...o.suggestedRecipients].map((r) => `${r === 'default' ? 'default' : `${r} (${RELATIONS[r]})`}: ${t[r]?.length ?? 0}`);
  console.log(`## ${o.name} — id \`${o.id}\``);
  console.log(`- Ngày: ${formatDate(next.date)}, còn ${next.days} ngày · tông: ${o.tone}`);
  console.log(`- Trang dịp: ${site}o/${o.slug}/`);
  console.log(`- Lời chúc đang có: ${counts.join(' · ')}\n`);
}
