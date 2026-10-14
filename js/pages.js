/** Render các trang tĩnh-động: trang chủ, khám phá dịp lễ (tìm kiếm + lọc), bộ sưu tập theme. */
import { CATEGORIES, COUNTRIES, DEFAULT_COUNTRY } from './data/occasions.js';
import { THEMES, THEME_GROUPS, themesByGroup } from './data/themes.js';
import { FILTERS, search, upcoming, getEnabled } from './occasion-engine.js';
import { countdownLabel, formatDate } from './calendar.js';
import { routeHref, navigate } from './router.js';
import { enhanceSelect } from './dropdown.js';
import { getTheme } from './data/themes.js';
import { ambientFragment, confettiFragment } from './fx.js';

const $ = (sel) => document.querySelector(sel);

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function link(text, href, className) {
  const a = el('a', className, text);
  a.href = href;
  a.dataset.nav = '';
  return a;
}

const createHref = (occasionId, themeId) => routeHref('create', { occasion: occasionId, theme: themeId });

/** Minh họa của dịp: ảnh riêng (cover.image) hoặc ký tự lớn (cover.glyph). */
function coverArt(o, glyphClass, imgClass) {
  if (!o.cover.image) return el('span', glyphClass, o.cover.glyph);
  const img = el('img', imgClass);
  img.src = o.cover.image;
  img.alt = '';
  img.decoding = 'async';
  img.width = 120;
  img.height = 120;
  return img;
}

/** Thẻ dịp: minh họa (glyph trên nền theme), tên, mô tả, ngày/countdown, nút tạo thiệp. */
export function occasionCard({ occasion: o, next }) {
  const card = el('article', 'occ-card');
  const cover = el('div', 'occ-cover');
  cover.dataset.theme = o.cover.theme;
  cover.setAttribute('aria-hidden', 'true');
  cover.append(coverArt(o, 'occ-glyph', 'occ-img'));
  if (next) cover.append(el('span', `occ-badge${next.days <= 7 ? ' is-soon' : ''}`, countdownLabel(next.days)));

  const body = el('div', 'occ-body');
  body.append(el('span', 'occ-cat', CATEGORIES[o.category]), el('h3', null, o.name), el('p', 'occ-desc', o.description));

  const foot = el('div', 'occ-foot');
  let when;
  if (next) when = formatDate(next.date);
  else if (o.dateType === 'none') when = 'Gửi bất cứ lúc nào';
  else if (o.dateType === 'rule') when = 'Chọn quốc gia để xem ngày';
  else when = 'Chưa có dữ liệu ngày chính xác';
  foot.append(el('span', 'occ-date', when), link('Tạo thiệp', createHref(o.id), 'btn btn-ghost btn-sm'));
  foot.lastChild.setAttribute('aria-label', `Tạo thiệp ${o.name}`);

  card.append(cover, body, foot);
  return card;
}

// ---------------------------------------------------------------- Hero: thiệp trong khung điện thoại có hiệu ứng như thiệp thật
const HERO_SWITCH_MS = 4200;
let heroBuilt = false;
let heroTimer = 0;

function initHeroFx() {
  const screens = [...document.querySelectorAll('.hv-screen')];
  if (!screens.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!heroBuilt) {
    heroBuilt = true;
    for (const s of screens) {
      const theme = getTheme(s.dataset.theme);
      const fx = el('div', 'ambient hv-fx');
      fx.setAttribute('aria-hidden', 'true');
      fx.append(ambientFragment(theme.ambient, { count: 8, scale: 0.55 }));
      const cf = el('div', 'confetti-layer hv-cf');
      cf.setAttribute('aria-hidden', 'true');
      s.prepend(fx);
      s.append(cf);
    }
  }

  const burst = (screen) => {
    const cfg = getTheme(screen.dataset.theme).confetti;
    if (cfg) setTimeout(() => screen.classList.contains('is-active') && screen.querySelector('.hv-cf')?.append(confettiFragment(cfg, 20, { scale: 0.6 })), 700);
  };
  let current = 0;
  const show = (n) => {
    screens.forEach((s, k) => s.classList.toggle('is-active', k === n));
    burst(screens[n]);
  };
  show(0);
  clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    // Chỉ chạy khi đang ở trang chủ, tab đang hiển thị và hero còn trong khung nhìn.
    const box = document.querySelector('.hero-visual')?.getBoundingClientRect();
    if (document.hidden || document.documentElement.dataset.page !== 'home' || !box || box.bottom < 0 || box.top > innerHeight) return;
    current = (current + 1) % screens.length;
    show(current);
  }, HERO_SWITCH_MS);
}

// ---------------------------------------------------------------- Trang chủ
export function renderHome() {
  initHeroFx();
  const list = $('#upcoming-list');
  list.replaceChildren();
  const items = upcoming(6);
  items.forEach(({ occasion: o, next }) => {
    const li = el('li', 'upcoming-item');
    const left = el('div', `up-count${next.days <= 7 ? ' is-soon' : ''}`);
    left.append(el('strong', null, next.days === 0 ? 'Hôm nay' : next.days === 1 ? 'Ngày mai' : String(next.days)), next.days > 1 ? el('span', null, 'ngày nữa') : el('span', null, formatDate(next.date).split(', ')[1]));
    const mid = el('div', 'up-info');
    mid.append(el('h3', null, o.name), el('p', null, `${formatDate(next.date)} · ${countdownLabel(next.days)}`));
    const glyph = el('span', 'up-glyph');
    glyph.append(coverArt(o, 'up-emoji', 'up-img'));
    glyph.dataset.theme = o.cover.theme;
    glyph.setAttribute('aria-hidden', 'true');
    li.append(glyph, mid, left, link('Tạo thiệp', createHref(o.id), 'btn btn-primary btn-sm'));
    list.append(li);
  });
  $('#upcoming-list').closest('section').hidden = items.length === 0;

  const grid = $('#featured-grid');
  grid.replaceChildren(...search({ }).filter((r) => r.occasion.featured).map(occasionCard));

  const strip = $('#theme-strip');
  strip.replaceChildren();
  ['tet-traditional', 'elegant-pink', 'floral-garden', 'romantic-rose', 'vietnamese-heritage', 'education-knowledge', 'christmas-wonderland', 'rose', 'colorful-celebration', 'cozy-autumn']
    .map((id) => THEMES.find((t) => t.id === id))
    .forEach((t) => strip.append(themeThumb(t)));
}

function themeThumb(t) {
  const d = el('div', 'theme-thumb');
  const mini = el('div', 'theme-mini');
  mini.dataset.theme = t.id;
  mini.setAttribute('aria-hidden', 'true');
  mini.append(el('span', 'mini-title', t.sample));
  d.append(mini, el('strong', null, t.name));
  return d;
}

// ---------------------------------------------------------------- Khám phá dịp lễ
const MONTHS = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
let occInit = false;

function readFilters(params) {
  const country = params.get('country');
  return {
    q: params.get('q') ?? '',
    category: Object.hasOwn(FILTERS, params.get('category')) ? params.get('category') : '',
    month: Number(params.get('month')) >= 1 && Number(params.get('month')) <= 12 ? Number(params.get('month')) : 0,
    region: ['VN', 'international'].includes(params.get('region')) ? params.get('region') : '',
    country: Object.hasOwn(COUNTRIES, country) ? country : DEFAULT_COUNTRY,
    hasThemes: params.get('themes') === '1',
  };
}

const filtersToParams = (f) => ({
  q: f.q.trim(),
  category: f.category,
  month: f.month || '',
  region: f.region,
  country: f.country === DEFAULT_COUNTRY ? '' : f.country,
  themes: f.hasThemes ? 1 : '',
});

export function renderOccasions(params) {
  const f = readFilters(params);
  const q = $('#occ-q');
  const month = $('#occ-month');
  const region = $('#occ-region');
  const country = $('#occ-country');
  const chips = $('#occ-chips');
  const themes = $('#occ-themes');

  if (!occInit) {
    occInit = true;
    month.append(new Option('Mọi tháng', ''));
    MONTHS.forEach((m, i) => month.append(new Option(m, String(i + 1))));
    Object.entries(COUNTRIES).forEach(([k, v]) => country.append(new Option(`Lịch: ${v}`, k)));
    [month, region, country].forEach((sel) => enhanceSelect(sel, { searchable: false }));

    const read = () => ({
      q: q.value,
      category: chips.querySelector('[aria-pressed="true"]')?.dataset.id ?? '',
      month: Number(month.value) || 0,
      region: region.value,
      country: country.value,
      hasThemes: themes.checked,
    });
    const go = (next, replace) => navigate(routeHref('occasions', filtersToParams(next)), { replace });
    $('#occ-filter').addEventListener('submit', (e) => e.preventDefault());
    q.addEventListener('input', () => go(read(), true));
    [month, region, country, themes].forEach((c) => c.addEventListener('change', () => go(read(), true)));
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      go({ ...read(), category: b.dataset.id === read().category ? '' : b.dataset.id }, false);
    });
    $('#occ-reset').addEventListener('click', () => navigate(routeHref('occasions')));

    [['', 'Tất cả'], ...Object.entries(FILTERS)].forEach(([id, label]) => {
      const b = el('button', 'chip', label);
      b.type = 'button';
      b.dataset.id = id;
      chips.append(b);
    });
  }

  // Đồng bộ điều khiển với URL (không ghi đè khi người dùng đang gõ cùng giá trị).
  if (q.value !== f.q) q.value = f.q;
  month.value = f.month ? String(f.month) : '';
  region.value = f.region;
  country.value = f.country;
  themes.checked = f.hasThemes;
  chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === f.category)));

  const rows = search(f);
  $('#occ-grid').replaceChildren(...rows.map(occasionCard));
  $('#occ-empty').hidden = rows.length > 0;
  $('#occ-count').textContent = rows.length ? `${rows.length} / ${getEnabled().length} dịp` : '';
}

// ---------------------------------------------------------------- Bộ sưu tập
let collectionsDone = false;
export function renderCollections() {
  if (collectionsDone) return;
  collectionsDone = true;
  const body = $('#collections-body');
  const occasions = getEnabled();
  for (const [group, label] of Object.entries(THEME_GROUPS)) {
    const section = el('section', 'band');
    section.append(el('h2', null, label));
    const grid = el('div', 'collection-grid');
    themesByGroup(group).forEach((t) => {
      const card = el('article', 'collection-card');
      const mini = el('div', 'theme-mini');
      mini.dataset.theme = t.id;
      mini.setAttribute('aria-hidden', 'true');
      mini.append(el('span', 'mini-title', t.sample));
      const meta = el('div', 'collection-meta');
      meta.append(el('strong', null, t.name), el('small', null, t.description));
      const target = occasions.find((o) => o.themeIds.includes(t.id));
      const a = link('Dùng mẫu này', createHref(target?.id, t.id), 'btn btn-ghost btn-sm');
      a.setAttribute('aria-label', `Dùng mẫu ${t.name}`);
      card.append(mini, meta, a);
      grid.append(card);
    });
    section.append(grid);
    body.append(section);
  }
}
