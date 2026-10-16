/** Điểm vào: thiệp được chia sẻ (ưu tiên, giữ tương thích link cũ) hoặc website nhiều trang theo ?page=. */
import { parseCardUrl, hasCardParams } from './url-state.js';
import { mountCard } from './greeting.js';
import { initCreator } from './creator.js';
import { initRouter, routeHref, navigate } from './router.js';
import { renderHome, renderOccasions, renderCollections } from './pages.js';
import { getOccasion } from './occasion-engine.js';

const root = document.documentElement;
const $ = (sel) => document.querySelector(sel);

const TITLES = {
  home: 'Tạo thiệp chúc mừng online miễn phí cho mọi dịp — Wishora', // giữ khớp <title> của index.html
  occasions: 'Khám phá dịp lễ — Wishora',
  collections: 'Bộ sưu tập thiệp — Wishora',
  guide: 'Hướng dẫn — Wishora',
  create: 'Tạo thiệp — Wishora',
};
const HEADINGS = { home: null, occasions: '#occasions-title', collections: '#collections-title', guide: '#guide-title', create: '#create-title' };

function showAlert(text) {
  $('#url-alert-text').textContent = text;
  $('#url-alert').hidden = false;
}

const card = hasCardParams(location.search) ? parseCardUrl(location.search) : { kind: 'none' };

if (card.kind === 'card') {
  root.dataset.view = 'greeting';
  const { anim, sound, ...data } = card.data;
  mountCard($('#greeting-view'), data, { animations: anim, sound, autofocus: true, setTitle: true });
} else {
  root.dataset.view = 'site';
  let notice = card.kind === 'invalid' ? card.error : '';
  // Link thiệp hỏng: bỏ tham số lỗi khỏi thanh địa chỉ rồi hiện trang chủ kèm thông báo thân thiện.
  if (notice) history.replaceState(null, '', location.pathname);

  // Trang tĩnh theo dịp (/o/<dịp>/) mở trần, không kèm thiệp → vào thẳng form tạo thiệp của dịp đó.
  const landing = document.querySelector('meta[name="wishora-occasion"]')?.content;
  const landingTitle = document.title; // tiêu đề SEO của trang tĩnh, Google đọc sau khi chạy JS nên không được ghi đè
  if (landing && !location.search && notice === '') {
    history.replaceState(null, '', new URL(routeHref('create', { occasion: landing }), document.baseURI));
  }
  const pageTitle = (page, params) => {
    if (page !== 'create') return TITLES[page];
    const id = params.get('occasion');
    if (landing && id === landing) return landingTitle;
    const o = id && getOccasion(id);
    return o ? `Tạo thiệp ${o.name} — Wishora` : TITLES.create;
  };

  const creator = initCreator();
  const navToggle = $('#nav-toggle');
  const nav = $('#site-nav');
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  $('#url-alert .alert-close').addEventListener('click', () => ($('#url-alert').hidden = true));

  initRouter(({ page, params, unknown }, ctx = {}) => {
    setNav(false);
    if (unknown) {
      navigate(routeHref('home'), { replace: true });
      return;
    }
    document.querySelectorAll('main [data-page]').forEach((s) => (s.hidden = s.dataset.page !== page));
    document.querySelectorAll('[data-page-link]').forEach((a) =>
      a.dataset.pageLink === page ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'),
    );
    root.dataset.page = page;
    document.title = pageTitle(page, params);

    if (page === 'home') renderHome();
    if (page === 'occasions') renderOccasions(params);
    if (page === 'collections') renderCollections();
    if (page === 'create') creator.enter(params.get('occasion'), params.get('theme'));

    if (notice) {
      showAlert(notice);
      notice = '';
    } else if (!ctx.initial && !ctx.replace) {
      $('#url-alert').hidden = true;
    }
    // Chuyển trang: về đầu trang và đưa focus tới tiêu đề (trừ khi chỉ đang gõ bộ lọc).
    if (!ctx.initial && !ctx.replace) {
      scrollTo({ top: 0 });
      const h = HEADINGS[page] ? $(HEADINGS[page]) : $('#main');
      h?.focus({ preventScroll: true });
    }
  });
}
