/**
 * Router tối giản dựa trên query string (?page=...), phù hợp static hosting: không cần rewrite.
 * Thiệp được chia sẻ (có tham số type/name/message/theme... mà không có ?page=) do app.js xử lý trước.
 */
export const PAGES = Object.freeze(['home', 'occasions', 'collections', 'guide', 'create']);

/** Đọc route từ query string. Page lạ → 'home'. */
export function parseRoute(search = location.search) {
  const params = new URLSearchParams(search);
  const raw = params.get('page');
  const page = PAGES.includes(raw) ? raw : 'home';
  params.delete('page');
  return { page, params, unknown: Boolean(raw) && !PAGES.includes(raw) };
}

/** Tạo href tương đối (query-only) — giữ nguyên đường dẫn host, hợp với GitHub Pages dưới /<repo>/. */
export function routeHref(page, params = {}) {
  if (page === 'home') return './';
  const q = new URLSearchParams({ page });
  for (const [k, v] of Object.entries(params)) if (v !== '' && v != null) q.set(k, String(v));
  return `?${q.toString()}`;
}

let onRoute = () => {};
let internalDepth = 0; // số lần điều hướng nội bộ — để biết nút "Quay lại" có thể dùng history.back()

export function navigate(href, { replace = false } = {}) {
  // Giải quyết theo document.baseURI: trang theo dịp (/o/<dịp>/) có <base> trỏ về gốc site.
  const url = new URL(href, document.baseURI);
  if (replace) history.replaceState({ wishora: internalDepth }, '', url);
  else history.pushState({ wishora: ++internalDepth }, '', url);
  onRoute(parseRoute(url.search), { replace });
}

export function goBack(fallbackHref = routeHref('occasions')) {
  if (history.state?.wishora > 0) history.back();
  else navigate(fallbackHref);
}

export function initRouter(handler) {
  onRoute = handler;
  history.replaceState({ wishora: 0 }, '');
  addEventListener('popstate', () => {
    internalDepth = history.state?.wishora ?? 0;
    handler(parseRoute(), { pop: true });
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[data-nav]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(a.getAttribute('href'));
  });
  handler(parseRoute(), { initial: true });
}
