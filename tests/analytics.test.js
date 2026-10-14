import test from 'node:test';
import assert from 'node:assert/strict';
import { track, EVENTS } from '../js/analytics.js';

test('track gửi event GoatCounter với đường dẫn click/<tên>[/<dịp>] và không chứa dữ liệu người dùng', () => {
  const calls = [];
  globalThis.goatcounter = { count: (o) => calls.push(o) };
  track('copy-link');
  track('create-card', 'women-day-20-10');
  track('create-card', 'x/../?name=Lan&message=bí mật'); // detail lạ bị làm sạch
  track('khong-co-event');
  assert.deepEqual(calls.map((c) => c.path), ['click/copy-link', 'click/create-card/women-day-20-10', 'click/create-card/xnameLanmessagebmt']);
  assert.ok(calls.every((c) => c.event === true && c.title === EVENTS[c.path.split('/')[1]]));
  assert.ok(calls.every((c) => /^click\/[a-z-]+(\/[a-z0-9-]+)?$/i.test(c.path))); // chỉ chữ, số, gạch ngang — không thể mang theo dữ liệu tự do
});

test('GoatCounter chưa tải hoặc ném lỗi thì không làm hỏng ứng dụng', () => {
  delete globalThis.goatcounter;
  assert.doesNotThrow(() => track('share'));
  globalThis.goatcounter = { count() { throw new Error('boom'); } };
  assert.doesNotThrow(() => track('share'));
  delete globalThis.goatcounter;
});
