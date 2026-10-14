/**
 * Sinh bảng ngày dương lịch của các dịp âm lịch (UTC+7) theo thuật toán Hồ Ngọc Đức.
 * Chạy: node tools/gen-lunar.mjs 2025 2035
 * Kết quả dán vào js/data/lunar-calendar.js. Tết 2025–2030 được đối chiếu trong tests/calendar.test.js.
 */
const INT = Math.floor, PI = Math.PI, TZ = 7;
const jdFromDate = (dd, mm, yy) => {
  const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  return dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
};
const jdToDate = (jd) => {
  const a = jd + 32044, b = INT((4 * a + 3) / 146097), c = a - INT((b * 146097) / 4);
  const d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
  return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
};
function newMoon(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  const s = (x) => Math.sin(x * dr);
  let C1 = (0.1734 - 0.000393 * T) * s(M) + 0.0021 * s(2 * M);
  C1 += -0.4068 * s(Mpr) + 0.0161 * s(2 * Mpr) - 0.0004 * s(3 * Mpr);
  C1 += 0.0104 * s(2 * F) - 0.0051 * s(M + Mpr) - 0.0074 * s(M - Mpr) + 0.0004 * s(2 * F + M);
  C1 += -0.0004 * s(2 * F - M) - 0.0006 * s(2 * F + Mpr) + 0.001 * s(2 * F - Mpr) + 0.0005 * s(2 * Mpr + M);
  const dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - dt;
}
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * dr);
  L *= dr;
  return L - PI * 2 * INT(L / (PI * 2));
}
const sunLong = (day) => INT((sunLongitude(day - 0.5 - TZ / 24) / PI) * 6);
const newMoonDay = (k) => INT(newMoon(k) + 0.5 + TZ / 24);
function lunarMonth11(yy) {
  const k = INT((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
  let nm = newMoonDay(k);
  if (sunLong(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}
function leapOffset(a11) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let i = 1, last, arc = sunLong(newMoonDay(k + i));
  do { last = arc; i++; arc = sunLong(newMoonDay(k + i)); } while (arc !== last && i < 14);
  return i - 1;
}
function solarToLunar(dd, mm, yy) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);
  let a11 = lunarMonth11(yy), b11 = a11, lunarYear;
  if (a11 >= monthStart) { lunarYear = yy; a11 = lunarMonth11(yy - 1); } else { lunarYear = yy + 1; b11 = lunarMonth11(yy + 1); }
  const lunarDay = dayNumber - monthStart + 1, diff = INT((monthStart - a11) / 29);
  let leap = 0, lunarMonthN = diff + 11;
  if (b11 - a11 > 365) {
    const ld = leapOffset(a11);
    if (diff >= ld) { lunarMonthN = diff + 10; if (diff === ld) leap = 1; }
  }
  if (lunarMonthN > 12) lunarMonthN -= 12;
  if (lunarMonthN >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonthN, year: lunarYear, leap };
}

const [from, to] = process.argv.slice(2).map(Number);
const pad = (n) => String(n).padStart(2, '0');
const find = (y, lm, ld) => {
  for (let jd = jdFromDate(1, 1, y); jd <= jdFromDate(31, 12, y); jd++) {
    const [d, m, yy] = jdToDate(jd);
    const l = solarToLunar(d, m, yy);
    if (l.day === ld && l.month === lm && !l.leap && l.year === y - (lm >= 11 && m < 6 ? 1 : 0)) return `${yy}-${pad(m)}-${pad(d)}`;
  }
};
// find(năm, tháng âm, ngày âm) — thêm khóa khác (ví dụ 10/3 âm) khi có dịp âm lịch mới.
const out = { tet: {} };
for (let y = from; y <= to; y++) out.tet[y] = find(y, 1, 1);
console.log(JSON.stringify(out, null, 2));
