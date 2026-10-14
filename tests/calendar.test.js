import test from 'node:test';
import assert from 'node:assert/strict';
import { nextOccurrence, dateInYear, nthWeekdayOfMonth, countdownLabel, daysBetween, addDays, todayYMD } from '../js/calendar.js';
import { getOccasion, upcoming } from '../js/occasion-engine.js';

const occ = (id) => getOccasion(id);

test('ngày cố định: hôm nay → "Hôm nay"', () => {
  const r = nextOccurrence(occ('women-day-20-10'), '2026-10-20');
  assert.deepEqual(r, { date: '2026-10-20', days: 0 });
  assert.equal(countdownLabel(0), 'Hôm nay');
  assert.equal(countdownLabel(1), 'Ngày mai');
  assert.equal(countdownLabel(3), 'Còn 3 ngày');
});

test('ngày cố định đã qua trong năm → chuyển sang năm sau', () => {
  const r = nextOccurrence(occ('women-day-20-10'), '2026-10-21');
  assert.equal(r.date, '2027-10-20');
  assert.equal(r.days, 364);
});

test('chuyển năm: 31/12 → 01/01', () => {
  assert.equal(nextOccurrence(occ('new-year'), '2026-12-31').days, 1);
  assert.equal(nextOccurrence(occ('new-year'), '2027-01-01').days, 0);
  assert.equal(nextOccurrence(occ('christmas'), '2026-12-26').date, '2027-12-25');
});

test('Tết Nguyên Đán và Tết Dương lịch là hai dịp riêng, Tết lấy từ bảng âm lịch', () => {
  assert.equal(nextOccurrence(occ('tet'), '2026-10-15').date, '2027-02-06');
  assert.equal(nextOccurrence(occ('new-year'), '2026-10-15').date, '2027-01-01');
  assert.equal(nextOccurrence(occ('giao-thua'), '2026-10-15').date, '2027-02-05');
  // ngày Tết kiểm chứng (lịch chính thức đã công bố)
  const tets = { 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13' };
  for (const [y, d] of Object.entries(tets)) assert.equal(dateInYear(occ('tet'), Number(y)), d);
});

test('âm lịch: qua Tết năm nay thì lấy Tết năm sau; thiếu dữ liệu → null (không countdown)', () => {
  assert.equal(nextOccurrence(occ('tet'), '2026-02-18').date, '2027-02-06');
  assert.equal(nextOccurrence(occ('tet'), '2029-02-14'), null);
  assert.equal(dateInYear(occ('tet'), 2040), null);
});

test('dịp không có lịch cố định không có countdown', () => {
  for (const id of ['birthday', 'graduation', 'apology', 'free-wish', 'anniversary-love', 'khai-xuan', 'new-year-wish']) {
    assert.equal(nextOccurrence(occ(id), '2026-10-15'), null, id);
  }
});

test('ngày theo quy tắc phụ thuộc quốc gia', () => {
  assert.equal(nthWeekdayOfMonth(2026, { month: 5, weekday: 0, nth: 2 }), '2026-05-10'); // CN thứ 2 tháng 5/2026
  assert.equal(nextOccurrence(occ('mothers-day'), '2026-05-11').date, '2027-05-09');
  assert.equal(dateInYear(occ('fathers-day'), 2026), '2026-06-21');
  assert.equal(dateInYear(occ('fathers-day'), 2026, { country: 'AU' }), '2026-09-06');
  assert.equal(dateInYear(occ('fathers-day'), 2026, { country: 'US' }), '2026-06-21');
  assert.equal(dateInYear(occ('mothers-day'), 2026, { country: 'AU' }), '2026-05-10');
  assert.equal(dateInYear(occ('fathers-day'), 2026, { country: 'XX' }), null); // quốc gia chưa có quy tắc → không countdown
  // chuyển năm với quy tắc: Ngày của Cha 2026 (21/6) đã qua → năm sau
  assert.equal(nextOccurrence(occ('fathers-day'), '2026-06-22').date, '2027-06-20');
});

test('tiện ích ngày', () => {
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
  assert.equal(addDays('2027-03-01', -1), '2027-02-28');
  assert.equal(todayYMD(new Date('2026-12-31T20:00:00Z')), '2027-01-01'); // đã sang ngày mới ở giờ Việt Nam
});

test('danh sách sắp tới tăng dần và không chứa dịp thiếu ngày', () => {
  const list = upcoming(50, { today: '2026-10-15' });
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].next.days <= list[i].next.days);
  assert.ok(list.every((x) => x.next && x.next.days >= 0));
  assert.ok(!list.some((x) => x.occasion.id === 'graduation'));
});
