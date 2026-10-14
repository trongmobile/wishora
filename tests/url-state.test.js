import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCardUrl, buildCardUrl, validateCard, hasCardParams } from '../js/url-state.js';

const BASE = 'https://example.test/hpbd/?page=create';

test('URL sinh nhật cũ (không type/occasion) vẫn hoạt động', () => {
  const r = parseCardUrl('?name=Minh%20Anh&message=Ch%C3%BAc%20m%E1%BB%ABng&theme=rose');
  assert.equal(r.kind, 'card');
  assert.equal(r.data.occasion, 'birthday');
  assert.equal(r.data.name, 'Minh Anh');
  assert.equal(r.data.theme, 'rose');
  assert.equal(r.data.anim, true);
  assert.equal(parseCardUrl('?name=a&message=b&theme=gold&anim=0').data.anim, false);
});

test('mọi theme sinh nhật cũ đều hợp lệ', () => {
  for (const t of ['rose', 'galaxy', 'candy', 'gold', 'pastel', 'floral']) {
    assert.equal(parseCardUrl(`?name=a&message=b&theme=${t}`).kind, 'card', t);
  }
});

test('round-trip Unicode, emoji, ký tự đặc biệt, xuống dòng', () => {
  const message = 'Chúc mừng 🎉 & vui nhé?\nDòng 2 #tag +1 "ok" \'x\' <b>';
  const url = buildCardUrl({ occasion: 'women-day-20-10', name: 'Lan Phương 🌸', message, theme: 'floral-garden', title: 'Gửi mẹ' }, BASE);
  assert.ok(url.startsWith('https://example.test/hpbd/?'));
  assert.ok(!url.includes('page=create'));
  const r = parseCardUrl(new URL(url).search);
  assert.equal(r.kind, 'card');
  assert.deepEqual(
    { ...r.data, anim: undefined, sound: undefined },
    { occasion: 'women-day-20-10', name: 'Lan Phương 🌸', message, theme: 'floral-garden', title: 'Gửi mẹ', anim: undefined, sound: undefined },
  );
});

test('sinh nhật mới dùng type=birthday; dịp khác dùng type=greeting', () => {
  const b = new URL(buildCardUrl({ occasion: 'birthday', name: 'A', message: 'B', theme: 'rose' }, BASE)).searchParams;
  assert.equal(b.get('type'), 'birthday');
  assert.equal(b.has('occasion'), false);
  const g = new URL(buildCardUrl({ occasion: 'tet', name: 'A', message: 'B', theme: 'tet-traditional', anim: false }, BASE)).searchParams;
  assert.equal(g.get('type'), 'greeting');
  assert.equal(g.get('occasion'), 'tet');
  assert.equal(g.get('effects'), 'off');
  assert.equal(parseCardUrl('?' + g.toString()).data.anim, false);
});

test('URL không hợp lệ → thông báo thân thiện, không ném lỗi', () => {
  const bad = [
    '?type=greeting&name=a&message=b&theme=rose',                       // thiếu occasion
    '?type=greeting&occasion=khong-co&name=a&message=b&theme=rose',     // occasion lạ
    '?type=greeting&occasion=tet&name=a&message=b&theme=javascript:1',  // theme lạ
    '?type=other&name=a&message=b&theme=rose',                          // type lạ
    '?name=a',                                                          // thiếu dữ liệu
    '?type=greeting',
    '?occasion=tet&name=a&message=b&theme=rose&title=' + 'x'.repeat(200),
  ];
  for (const q of bad) {
    const r = parseCardUrl(q);
    assert.equal(r.kind, 'invalid', q);
    assert.ok(r.error.length > 10);
  }
});

test('không có tham số thiệp / có ?page= → không phải thiệp', () => {
  assert.equal(parseCardUrl('').kind, 'none');
  assert.equal(parseCardUrl('?page=occasions&category=vietnamese').kind, 'none');
  assert.equal(hasCardParams('?page=create&occasion=tet&theme=tet-traditional&name=x'), false);
  assert.equal(hasCardParams('?occasion=tet'), true);
});

test('làm sạch ký tự điều khiển; giới hạn độ dài', () => {
  const { data } = validateCard({ occasion: 'tet', name: ' A\u0000B\n ', message: ' hi\u0007 ', theme: 'modern-lunar', title: '' });
  assert.equal(data.name, 'AB');
  assert.equal(data.message, 'hi');
  assert.equal(validateCard({ occasion: 'tet', name: 'a', message: 'x'.repeat(1001), theme: 'modern-lunar' }).ok, false);
});

test('effects: off tắt hiệu ứng động, mute tắt âm thanh; mặc định bật cả hai', () => {
  const q = (x) => parseCardUrl(`?type=greeting&occasion=tet&name=a&message=b&theme=modern-lunar${x}`).data;
  assert.deepEqual([q('').anim, q('').sound], [true, true]);
  assert.deepEqual([q('&effects=mute').anim, q('&effects=mute').sound], [true, false]);
  assert.deepEqual([q('&effects=off,mute').anim, q('&effects=off,mute').sound], [false, false]);
  const url = buildCardUrl({ occasion: 'tet', name: 'a', message: 'b', theme: 'modern-lunar', anim: false, sound: false }, BASE);
  assert.equal(new URL(url).searchParams.get('effects'), 'off,mute');
  assert.equal(new URL(buildCardUrl({ occasion: 'tet', name: 'a', message: 'b', theme: 'modern-lunar' }, BASE)).searchParams.has('effects'), false);
  assert.equal(parseCardUrl('?name=a&message=b&theme=rose').data.sound, true); // link sinh nhật cũ
});
