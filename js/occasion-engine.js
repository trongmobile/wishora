/** Truy vấn danh mục dịp lễ: tra cứu, tìm kiếm không dấu, lọc, dịp sắp tới, lời chúc gợi ý. */
import { OCCASIONS, CATEGORIES } from './data/occasions.js';
import { RELATIONS } from './data/messages.js';
import { THEMES, getTheme } from './data/themes.js';
import { nextOccurrence, todayYMD, monthOf } from './calendar.js';

export const getEnabled = () => OCCASIONS.filter((o) => o.enabled);
export const getOccasion = (id) => getEnabled().find((o) => o.id === id) ?? null;
export const getOccasionBySlug = (slug) => getEnabled().find((o) => o.slug === slug) ?? null;
export const isOccasionId = (id) => Boolean(getOccasion(id));

/** Bỏ dấu tiếng Việt, chữ thường: "Phụ nữ" → "phu nu". */
export const normalize = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

export const themesFor = (occasion) => occasion.themeIds.map((id) => THEMES.find((t) => t.id === id)).filter(Boolean);
export const defaultThemeFor = (occasion) => getTheme(occasion.themeIds[0]).id;

export function suggestionsFor(occasion, relation) {
  const t = occasion.messageTemplates;
  return (relation && t[relation]) || t.default || [];
}
export const relationsFor = (occasion) => occasion.suggestedRecipients.map((id) => ({ id, label: RELATIONS[id] })).filter((r) => r.label);

/** Gắn ngày kế tiếp vào mỗi dịp. */
export function withDates(list, { today = todayYMD(), country = 'VN' } = {}) {
  return list.map((o) => ({ occasion: o, next: nextOccurrence(o, today, { country }) }));
}

export function upcoming(limit = 6, opts = {}) {
  return withDates(getEnabled(), opts)
    .filter((x) => x.next)
    .sort((a, b) => a.next.days - b.next.days)
    .slice(0, limit);
}

const matchesCategory = (o, cat) => {
  switch (cat) {
    case 'vietnamese': return o.category === 'vietnamese' || o.region.includes('VN') && o.category !== 'custom' && o.category !== 'birthday';
    case 'international': return o.category === 'international' || o.region.includes('international') && o.category !== 'custom' && o.category !== 'birthday';
    case 'birthday': return o.category === 'birthday' || o.tags.includes('anniversary');
    default: return o.category === cat;
  }
};

export const FILTERS = Object.freeze({
  upcoming: 'Sắp diễn ra',
  vietnamese: 'Ngày lễ Việt Nam',
  international: 'Ngày lễ quốc tế',
  family: 'Dịp gia đình',
  love: 'Tình bạn & tình yêu',
  birthday: 'Sinh nhật & kỷ niệm',
  tet: 'Tết & năm mới',
  women: 'Ngày của phụ nữ',
  custom: 'Dịp cá nhân hóa',
});
export const UPCOMING_DAYS = 60;

/**
 * @param {{q?:string, category?:string, month?:number|string, region?:string, hasThemes?:boolean, country?:string, today?:string}} f
 * Trả về mảng { occasion, next } đã sắp xếp: có ngày gần nhất trước, không có ngày sau cùng.
 */
export function search(f = {}) {
  const today = f.today ?? todayYMD();
  const q = normalize(f.q);
  const month = Number(f.month) || 0;
  let rows = withDates(getEnabled(), { today, country: f.country ?? 'VN' });

  if (q) {
    const terms = q.split(/\s+/);
    rows = rows.filter(({ occasion: o }) => {
      const hay = normalize([o.name, o.description, CATEGORIES[o.category], o.keywords.join(' ')].join(' '));
      return terms.every((t) => hay.includes(t));
    });
  }
  if (f.category === 'upcoming') rows = rows.filter((r) => r.next && r.next.days <= UPCOMING_DAYS);
  else if (f.category) rows = rows.filter((r) => matchesCategory(r.occasion, f.category));
  if (month) rows = rows.filter((r) => r.next && monthOf(r.next.date) === month || fixedMonth(r.occasion) === month);
  if (f.region) rows = rows.filter((r) => r.occasion.region.includes(f.region));
  if (f.hasThemes) rows = rows.filter((r) => r.occasion.themeIds.length > 0);

  return rows.sort((a, b) => (a.next?.days ?? 1e9) - (b.next?.days ?? 1e9));
}

// Tháng của dịp có ngày dương cố định (không phụ thuộc "hôm nay").
const fixedMonth = (o) => (o.dateType === 'fixed' ? o.dateConfig.month : 0);
