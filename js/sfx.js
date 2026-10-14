/**
 * Hiệu ứng âm thanh tạo bằng Web Audio (không cần file âm thanh).
 * Chỉ phát khi người dùng đã tương tác (bấm "Mở thiệp"/"Phát lại") — AudioContext được tạo lười ở lần đầu.
 * Mỗi tông của dịp có âm thanh riêng: festive (chuông lấp lánh + pháo giấy), warm (chuông nhẹ),
 * romantic (hạc cầm), solemn (chuông trầm, không tiếng pháo).
 */
let ctx = null;
let out = null;
let noiseBuf = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
    const comp = ctx.createDynamicsCompressor();
    out = ctx.createGain();
    out.gain.value = 0.55;
    out.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Một nốt có đường bao âm lượng: lên nhanh, tắt dần theo hàm mũ. */
function note(freq, t, { type = 'sine', gain = 0.25, attack = 0.01, decay = 0.5, glideTo } = {}) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + decay);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

/** Tiếng chuông: nốt chính + hai họa âm không nguyên. */
function bell(freq, t, { gain = 0.22, decay = 1.1 } = {}) {
  note(freq, t, { gain, decay });
  note(freq * 2.01, t, { gain: gain * 0.35, decay: decay * 0.6 });
  note(freq * 3.9, t, { gain: gain * 0.12, decay: decay * 0.3 });
}

/** Tiếng ồn qua bộ lọc (giấy sột soạt, pháo giấy). */
function noise(t, dur, { gain = 0.15, type = 'bandpass', from = 1000, to = from, q = 0.8 } = {}) {
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = noiseBuf;
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Mở khóa AudioContext trong một cử chỉ người dùng. */
export function unlock() {
  ensure();
}

/** Tiếng mở vật thể mở đầu: hộp quà (pop + lấp lánh) hoặc phong bì (giấy + chuông). */
export function playOpen(intro = 'gift', tone = 'warm') {
  if (!ensure()) return;
  const t = ctx.currentTime + 0.02;
  if (intro === 'envelope') {
    noise(t, 0.4, { gain: 0.12, from: 700, to: 3200 });
    bell(tone === 'solemn' ? 523 : 880, t + 0.32, { gain: 0.12, decay: 0.8 });
  } else {
    note(280, t, { type: 'triangle', gain: 0.3, decay: 0.14, glideTo: 760 });
    [1319, 1760, 2093].forEach((f, i) => bell(f, t + 0.3 + i * 0.07, { gain: 0.08, decay: 0.7 }));
  }
}

const PENTA = [523.25, 659.25, 783.99, 1046.5, 1318.5];
const HARP = [392, 493.88, 587.33, 783.99, 987.77];

/** Tiếng khi lời chúc hiện ra, theo tông của dịp. */
export function playReveal(tone = 'warm') {
  if (!ensure()) return;
  const t = ctx.currentTime + 0.05;
  switch (tone) {
    case 'festive':
      noise(t, 0.18, { gain: 0.22, type: 'highpass', from: 1800, to: 6000, q: 0.5 }); // pháo giấy
      PENTA.forEach((f, i) => bell(f, t + 0.05 + i * 0.09, { gain: 0.2, decay: 0.9 }));
      bell(2093, t + 0.6, { gain: 0.08, decay: 1.2 });
      break;
    case 'romantic':
      HARP.forEach((f, i) => note(f, t + i * 0.14, { type: 'triangle', gain: 0.2, decay: 1.4 }));
      bell(1174.7, t + 0.8, { gain: 0.08, decay: 1.4 });
      break;
    case 'solemn':
      bell(196, t, { gain: 0.3, decay: 3 });
      bell(294, t + 0.25, { gain: 0.12, decay: 2.4 });
      break;
    default: // warm
      bell(659.25, t, { gain: 0.2, decay: 1.1 });
      bell(987.77, t + 0.2, { gain: 0.16, decay: 1.2 });
  }
}
