import test from 'node:test';
import assert from 'node:assert/strict';
import { OCCASIONS, CATEGORIES } from '../js/data/occasions.js';
import { THEMES } from '../js/data/themes.js';
import { RELATIONS } from '../js/data/messages.js';
import { search, normalize, themesFor } from '../js/occasion-engine.js';
import { readFileSync, existsSync } from 'node:fs';

test('ID và slug duy nhất; category hợp lệ', () => {
  assert.equal(new Set(OCCASIONS.map((o) => o.id)).size, OCCASIONS.length);
  assert.equal(new Set(OCCASIONS.map((o) => o.slug)).size, OCCASIONS.length);
  assert.equal(new Set(THEMES.map((t) => t.id)).size, THEMES.length);
  for (const o of OCCASIONS) assert.ok(CATEGORIES[o.category], o.id);
});

test('mỗi dịp có theme tồn tại, lời chúc, mối quan hệ hợp lệ', () => {
  for (const o of OCCASIONS) {
    assert.ok(o.themeIds.length > 0, o.id);
    assert.equal(themesFor(o).length, o.themeIds.length, `${o.id}: theme không tồn tại`);
    assert.ok(o.messageTemplates.default?.length >= 2, `${o.id}: thiếu lời chúc mặc định`);
    for (const r of o.suggestedRecipients) assert.ok(RELATIONS[r], `${o.id}: quan hệ ${r}`);
    for (const r of Object.keys(o.messageTemplates)) assert.ok(r === 'default' || RELATIONS[r], `${o.id}: lời chúc cho quan hệ lạ ${r}`);
  }
});

test('mỗi theme có khối CSS tương ứng', () => {
  const css = readFileSync(new URL('../css/themes.css', import.meta.url), 'utf8');
  for (const t of THEMES) assert.ok(css.includes(`[data-theme="${t.id}"] {`), t.id);
});

test('theme tình yêu chỉ xuất hiện ở các dịp tình yêu', () => {
  const love = THEMES.filter((t) => t.group === 'love').map((t) => t.id);
  for (const o of OCCASIONS) if (o.category !== 'love') assert.ok(!o.themeIds.some((id) => love.includes(id)), o.id);
});

test('dịp trang trọng không dùng confetti', () => {
  for (const o of OCCASIONS.filter((x) => x.tone === 'solemn')) {
    for (const t of themesFor(o)) assert.equal(t.confetti, null, `${o.id}/${t.id}`);
  }
});

test('tìm kiếm tiếng Việt có dấu và không dấu', () => {
  assert.equal(normalize('Phụ nữ Đẹp'), 'phu nu dep');
  for (const q of ['phu nu', 'Phụ nữ', 'PHU NU']) {
    const ids = search({ q }).map((r) => r.occasion.id);
    assert.ok(ids.includes('women-day-20-10') && ids.includes('women-day-08-03'), q);
  }
  assert.ok(search({ q: 'giang sinh' }).some((r) => r.occasion.id === 'christmas'));
  assert.ok(search({ q: 'nha giao' }).some((r) => r.occasion.id === 'teachers-day-20-11'));
  assert.equal(search({ q: 'zzzkhongco' }).length, 0);
});

test('lọc theo danh mục và tháng', () => {
  assert.ok(search({ category: 'vietnamese' }).every((r) => r.occasion.category === 'vietnamese' || r.occasion.region.includes('VN')));
  assert.ok(search({ category: 'international' }).some((r) => r.occasion.id === 'christmas'));
  assert.ok(search({ month: 10, today: '2026-10-15' }).some((r) => r.occasion.id === 'women-day-20-10'));
  assert.ok(search({ category: 'upcoming', today: '2026-10-15' }).every((r) => r.next.days <= 60));
});

test('mọi theme đều được ít nhất một dịp sử dụng (bộ sưu tập không có mẫu "mồ côi")', () => {
  const used = new Set(OCCASIONS.filter((o) => o.enabled).flatMap((o) => o.themeIds));
  for (const t of THEMES) assert.ok(used.has(t.id), `theme ${t.id} không thuộc dịp nào`);
});

test('ảnh minh họa riêng của dịp (cover.image) tồn tại', () => {
  for (const o of OCCASIONS) {
    if (o.cover.image) assert.ok(existsSync(new URL(`../${o.cover.image}`, import.meta.url)), `${o.id}: thiếu ${o.cover.image}`);
  }
});
