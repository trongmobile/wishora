/**
 * Lớp xử lý lịch: xác định ngày diễn ra kế tiếp của một dịp. Thuần hàm, không đụng DOM,
 * `today` luôn được truyền vào để dễ kiểm thử. Múi giờ mặc định: Asia/Ho_Chi_Minh.
 */
import { LUNAR_DATES } from './data/lunar-calendar.js';

export const TIMEZONE = 'Asia/Ho_Chi_Minh';
const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const parse = (s) => s.split('-').map(Number);
const dayNumber = (s) => {
  const [y, m, d] = parse(s);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
};

/** Ngày hiện tại (YYYY-MM-DD) theo múi giờ chỉ định. */
export function todayYMD(now = new Date(), timeZone = TIMEZONE) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    return ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

export const daysBetween = (from, to) => dayNumber(to) - dayNumber(from);

export function addDays(s, n) {
  const d = new Date((dayNumber(s) + n) * DAY_MS);
  return ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Ngày thứ `nth` của `weekday` (0 = Chủ nhật) trong tháng. */
export function nthWeekdayOfMonth(year, { month, weekday, nth }) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= last ? ymd(year, month, day) : null;
}

/** Ngày của dịp trong năm dương lịch `year`; null nếu chưa có dữ liệu chính xác. */
export function dateInYear(occasion, year, { country = 'VN' } = {}) {
  const cfg = occasion.dateConfig;
  switch (occasion.dateType) {
    case 'fixed': {
      const probe = new Date(Date.UTC(year, cfg.month - 1, cfg.day));
      return probe.getUTCMonth() === cfg.month - 1 ? ymd(year, cfg.month, cfg.day) : null; // 29/2 năm không nhuận
    }
    case 'lunar': {
      const base = LUNAR_DATES[cfg.key]?.[year];
      return base ? addDays(base, cfg.offsetDays ?? 0) : null;
    }
    case 'rule': {
      const rule = cfg.byCountry?.[country];
      return rule ? nthWeekdayOfMonth(year, rule) : null;
    }
    default:
      return null;
  }
}

/**
 * Lần diễn ra kế tiếp (bao gồm hôm nay). Trả về { date, days } hoặc null nếu không có dữ liệu.
 * Dịp đã qua trong năm nay tự chuyển sang năm sau.
 */
export function nextOccurrence(occasion, today = todayYMD(), opts = {}) {
  if (occasion.dateType === 'none') return null;
  const year = parse(today)[0];
  for (let y = year; y <= year + 2; y++) {
    const date = dateInYear(occasion, y, opts);
    if (date && date >= today) return { date, days: daysBetween(today, date) };
  }
  return null;
}

export function countdownLabel(days) {
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Ngày mai';
  return `Còn ${days} ngày`;
}

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export function formatDate(s) {
  const [y, m, d] = parse(s);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd}, ${pad(d)}/${pad(m)}/${y}`;
}
export const monthOf = (s) => parse(s)[1];
