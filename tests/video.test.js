import test from 'node:test';
import assert from 'node:assert/strict';
import { splitTopLevel, gradientStops, baseGradient, hardShadow, videoFileName } from '../js/video-export.js';
import { Muxer, ArrayBufferTarget } from '../js/vendor/mp4-muxer.esm.js';
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

test('tên file video không dấu, an toàn', () => {
  assert.equal(videoFileName('women-day-20-10', 'Mẹ yêu 🌸'), 'wishora-women-day-20-10-me-yeu.mp4');
  assert.equal(videoFileName('tet', '🌸🌸'), 'wishora-tet.mp4');
  assert.equal(videoFileName('tet', 'Đặng Thị / ..'), 'wishora-tet-dang-thi.mp4');
});

test('thư viện đóng gói MP4 (mp4-muxer) đã vendor sẵn, dựng được Muxer', () => {
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: 720, height: 1280 }, fastStart: 'in-memory' });
  assert.equal(typeof muxer.addVideoChunk, 'function');
  assert.equal(typeof muxer.finalize, 'function');
});
