/**
 * Nhạc nền tạo bằng Web Audio (giai điệu Happy Birthday), không cần file âm thanh.
 * Mặc định tắt; chỉ bắt đầu khi người dùng chủ động bật (cử chỉ người dùng).
 */
const BEAT = 0.42; // giây / phách
const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const MELODY = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
];
const CYCLE = MELODY.reduce((s, [, b]) => s + b, 0) * BEAT + 1.6;

let ctx = null;
let master = null;
let timer = 0;
let on = false;
const listeners = new Set();

function scheduleCycle() {
  let t = ctx.currentTime + 0.1;
  for (const [note, beats] of MELODY) {
    const dur = beats * BEAT;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = N[note];
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur);
    t += dur;
  }
  timer = setTimeout(scheduleCycle, CYCLE * 1000);
}

function emit() {
  listeners.forEach((fn) => fn(on));
}

export function isOn() {
  return on;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setOn(next) {
  if (next === on) return;
  if (next) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    on = true;
    scheduleCycle();
  } else {
    on = false;
    clearTimeout(timer);
    const old = ctx;
    master?.gain.setTargetAtTime(0, old.currentTime, 0.05);
    setTimeout(() => old.close().catch(() => {}), 300);
    ctx = master = null;
  }
  emit();
}

export const toggle = () => setOn(!on);
