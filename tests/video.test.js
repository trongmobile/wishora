import test from 'node:test';
import assert from 'node:assert/strict';
import { splitTopLevel, gradientStops, baseGradient, hardShadow, gifFileName } from '../js/gif-export.js';
import { GIFEncoder, quantize, applyPalette } from '../js/vendor/gifenc.esm.js';
import { THEMES } from '../js/data/themes.js';
import { readFileSync } from 'node:fs';

test('tách lớp gradient và lấy lớp nền thật của mọi theme', () => {
  const css = readFileSync(new URL('../css/themes.css', import.meta.url), 'utf8');
  for (const t of THEMES) {
    const block = css.match(new RegExp(`\\[data-theme="${t.id}"\\] \\{([^}]*)\\}`))?.[1] ?? '';
    const bg = /--bg:\s*([^;]+);/.exec(block)?.[1];
    assert.ok(bg, `${t.id}: thiếu --bg`);
    const g = baseGradient(bg);
    assert.ok(g && g.stops.length >= 2, `${t.id}: không tìm được màu nền`);
  }
});

test('phân tích gradient / bóng đổ', () => {
  assert.deepEqual(splitTopLevel('a(1,2), b(3,4)'), ['a(1,2)', 'b(3,4)']);
  assert.deepEqual(gradientStops('linear-gradient(135deg, #fff2c2, #e8b923 55%, rgba(0,0,0,.5))').map((s) => s.pos), [0, 0.55, 1]);
  const g = baseGradient('radial-gradient(rgba(255,255,255,.5) 16%, transparent 17%) 0 0 / 46px 46px, linear-gradient(160deg, #ffe066, #ff9ccb)');
  assert.equal(g.angle, 160);
  assert.equal(g.stops.length, 2);
  assert.deepEqual(hardShadow('8px 8px 0 #2b1d33'), { x: 8, y: 8, color: '#2b1d33' });
  assert.equal(hardShadow('0 24px 60px rgba(0,0,0,.4)'), null);
});

test('tên file GIF không dấu, an toàn', () => {
  assert.equal(gifFileName('women-day-20-10', 'Mẹ yêu 🌸'), 'wishora-women-day-20-10-me-yeu.gif');
  assert.equal(gifFileName('tet', '🌸🌸'), 'wishora-tet.gif');
  assert.equal(gifFileName('tet', 'Đặng Thị / ..'), 'wishora-tet-dang-thi.gif');
});

test('bộ mã hóa GIF (gifenc) tạo file GIF89a hợp lệ, lặp vô hạn, có nhiều khung hình', () => {
  const w = 8, h = 8;
  const make = (r) => {
    const px = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) px.set([r, 40, 90, 255], i * 4);
    return px;
  };
  const palette = quantize(make(200), 16);
  const enc = GIFEncoder();
  for (const r of [200, 100]) enc.writeFrame(applyPalette(make(r), palette), w, h, { palette, delay: 100, repeat: 0 });
  enc.finish();
  const b = enc.bytes();
  assert.equal(String.fromCharCode(...b.slice(0, 6)), 'GIF89a');
  assert.equal(b.at(-1), 0x3b);
  assert.equal(String.fromCharCode(...b.slice(b.indexOf(0x4e), b.indexOf(0x4e) + 11)), 'NETSCAPE2.0');
  assert.equal([...b].filter((x, i, a) => x === 0x21 && a[i + 1] === 0xf9).length, 2);
});
