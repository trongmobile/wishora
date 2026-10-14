/**
 * Dropdown tự dựng thay cho <select> gốc (không style được phần danh sách).
 *  - Desktop: popover bám dưới nút (tự lật lên khi thiếu chỗ), có ô tìm kiếm khi danh sách dài.
 *  - Điện thoại (≤ 640px): bottom-sheet có nền mờ, tiêu đề và nút đóng.
 *  - Mỗi hàng: biểu tượng (data-icon + data-theme), tiêu đề, dòng phụ (data-sub), radio chọn; optgroup → tiêu đề nhóm.
 * <select> gốc vẫn nằm trong DOM (ẩn) nên .value / sự kiện 'change' / form hoạt động như cũ,
 * và gán select.value bằng code sẽ tự cập nhật giao diện.
 * Bàn phím: ↑ ↓ Home End Enter/Space chọn, Esc đóng, gõ để tìm (khi có ô tìm kiếm).
 */
const SHEET_QUERY = '(max-width: 640px)';
const SEARCH_MIN_OPTIONS = 10;

const normalize = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

function h(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

/** Biểu tượng: ảnh (data-img) nếu có, không thì ký tự (data-icon). */
function fillIcon(el, icon, img) {
  if (img) {
    const i = document.createElement('img');
    i.src = img;
    i.alt = '';
    i.decoding = 'async';
    el.replaceChildren(i);
  } else el.textContent = icon;
}

let uid = 0;
let openInstance = null;

/** @param {HTMLSelectElement} select @param {{title?:string, searchable?:boolean, searchPlaceholder?:string}} opts */
export function enhanceSelect(select, opts = {}) {
  if (select.dataset.ddReady) return select._dd;
  select.dataset.ddReady = '1';

  const id = `dd${++uid}`;
  const labelEl = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
  const title = opts.title ?? labelEl?.textContent.replace('*', '').trim() ?? '';
  const searchable = opts.searchable ?? select.options.length > SEARCH_MIN_OPTIONS;

  // ----- DOM
  const root = h('div', 'dd');
  select.before(root);
  root.append(select);
  select.classList.add('dd-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const trigger = h('button', 'dd-trigger');
  trigger.type = 'button';
  trigger.id = `${id}-btn`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', `${id}-panel`);
  if (title) trigger.setAttribute('aria-label', title);
  const tIcon = h('span', 'dd-icon');
  tIcon.setAttribute('aria-hidden', 'true');
  const tText = h('span', 'dd-value');
  const tChev = h('span', 'dd-chev');
  tChev.setAttribute('aria-hidden', 'true');
  trigger.append(tIcon, tText, tChev);

  const backdrop = h('div', 'dd-backdrop');
  backdrop.hidden = true;

  const panel = h('div', 'dd-panel');
  panel.id = `${id}-panel`;
  panel.hidden = true;
  const head = h('div', 'dd-head');
  const headTitle = h('span', 'dd-title', title);
  const closeBtn = h('button', 'dd-close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Đóng');
  head.append(headTitle, closeBtn);

  let search = null;
  if (searchable) {
    search = h('input', 'dd-search');
    search.type = 'search';
    search.placeholder = opts.searchPlaceholder ?? 'Tìm…';
    search.setAttribute('aria-label', `Tìm trong ${title || 'danh sách'}`);
    search.autocomplete = 'off';
    search.setAttribute('aria-controls', `${id}-list`);
  }
  const list = h('div', 'dd-list');
  list.id = `${id}-list`;
  list.setAttribute('role', 'listbox');
  list.tabIndex = -1;
  if (title) list.setAttribute('aria-label', title);
  const empty = h('p', 'dd-empty', 'Không tìm thấy kết quả');
  empty.hidden = true;
  panel.append(head, ...(search ? [search] : []), list, empty);
  root.append(trigger, backdrop, panel);

  // ----- Dữ liệu
  const readItems = () => {
    const items = [];
    for (const child of select.children) {
      if (child.tagName === 'OPTGROUP') {
        const group = child.label;
        for (const o of child.children) items.push(toItem(o, group));
      } else if (child.tagName === 'OPTION') items.push(toItem(child, ''));
    }
    return items;
  };
  const toItem = (o, group) => ({
    value: o.value, text: o.textContent, group, disabled: o.disabled,
    icon: o.dataset.icon ?? '', img: o.dataset.img ?? '', theme: o.dataset.theme ?? '', sub: o.dataset.sub ?? '',
  });

  let rows = []; // các phần tử option đang hiển thị
  let active = -1;

  function renderTrigger() {
    const o = select.options[select.selectedIndex];
    const icon = o?.dataset.icon ?? '';
    tIcon.hidden = !icon;
    fillIcon(tIcon, icon, o?.dataset.img);
    if (o?.dataset.theme) tIcon.dataset.theme = o.dataset.theme;
    else delete tIcon.dataset.theme;
    tText.textContent = o?.textContent ?? '';
  }

  function renderList(filter = '') {
    const q = normalize(filter);
    const items = readItems().filter((it) => !q || normalize(`${it.text} ${it.sub} ${it.group}`).includes(q));
    list.replaceChildren();
    rows = [];
    let group = null;
    let box = list;
    items.forEach((it, i) => {
      if (it.group !== group) {
        group = it.group;
        if (group) {
          box = h('div', 'dd-group');
          box.setAttribute('role', 'group');
          const gl = h('div', 'dd-group-label', group);
          gl.id = `${id}-g${i}`;
          box.setAttribute('aria-labelledby', gl.id);
          box.append(gl);
          list.append(box);
        } else box = list;
      }
      const row = h('div', 'dd-option');
      row.id = `${id}-o${i}`;
      row.setAttribute('role', 'option');
      row.dataset.value = it.value;
      const selected = it.value === select.value;
      row.setAttribute('aria-selected', String(selected));
      if (it.disabled) row.setAttribute('aria-disabled', 'true');
      if (it.icon) {
        const ic = h('span', 'dd-icon');
        fillIcon(ic, it.icon, it.img);
        ic.setAttribute('aria-hidden', 'true');
        if (it.theme) ic.dataset.theme = it.theme;
        row.append(ic);
      }
      const body = h('span', 'dd-body');
      body.append(h('span', 'dd-text', it.text));
      if (it.sub) body.append(h('span', 'dd-sub', it.sub));
      const radio = h('span', 'dd-radio');
      radio.setAttribute('aria-hidden', 'true');
      row.append(body, radio);
      box.append(row);
      rows.push(row);
    });
    empty.hidden = rows.length > 0;
    setActive(Math.max(0, rows.findIndex((r) => r.getAttribute('aria-selected') === 'true')), false);
  }

  function setActive(i, scroll = true) {
    if (!rows.length) {
      active = -1;
      return;
    }
    active = Math.min(rows.length - 1, Math.max(0, i));
    rows.forEach((r, k) => r.classList.toggle('is-active', k === active));
    const el = rows[active];
    (search ?? list).setAttribute('aria-activedescendant', el.id);
    if (scroll) el.scrollIntoView({ block: 'nearest' });
  }

  function choose(i) {
    const row = rows[i];
    if (!row || row.getAttribute('aria-disabled') === 'true') return;
    const changed = select.value !== row.dataset.value;
    nativeSet.call(select, row.dataset.value);
    renderTrigger();
    close();
    if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ----- Mở / đóng
  const isSheet = () => window.matchMedia(SHEET_QUERY).matches;

  function place() {
    const r = trigger.getBoundingClientRect();
    const below = innerHeight - r.bottom - 14;
    const above = r.top - 14;
    const up = below < 260 && above > below;
    panel.dataset.place = up ? 'top' : 'bottom';
    const room = Math.max(160, up ? above : below);
    panel.style.setProperty('--dd-max', `${Math.min(440, room)}px`);
    const w = Math.max(r.width, 260);
    panel.dataset.align = r.left + w > innerWidth - 8 ? 'right' : 'left';
  }

  function open() {
    if (!panel.hidden) return;
    openInstance?.close();
    openInstance = api;
    const sheet = isSheet();
    panel.dataset.mode = sheet ? 'sheet' : 'popover';
    renderList('');
    if (search) search.value = '';
    panel.hidden = false;
    backdrop.hidden = !sheet;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (sheet) document.body.classList.add('dd-lock');
    else place();
    setActive(active);
    // Màn hình cảm ứng: không tự bật bàn phím; desktop: focus ô tìm kiếm.
    if (search && !matchMedia('(pointer: coarse)').matches) search.focus({ preventScroll: true });
    else list.focus({ preventScroll: true });
    document.addEventListener('pointerdown', onOutside, true);
    addEventListener('resize', onResize);
  }

  function close({ restoreFocus = true } = {}) {
    if (panel.hidden) return;
    panel.hidden = true;
    backdrop.hidden = true;
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('dd-lock');
    document.removeEventListener('pointerdown', onOutside, true);
    removeEventListener('resize', onResize);
    if (openInstance === api) openInstance = null;
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  const onOutside = (e) => {
    if (!root.contains(e.target) || e.target === backdrop) close({ restoreFocus: e.target === backdrop });
  };
  const onResize = () => close({ restoreFocus: false });

  // ----- Sự kiện
  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  trigger.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      open();
    }
  });
  closeBtn.addEventListener('click', () => close());
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.dd-option');
    if (row) choose(rows.indexOf(row));
  });
  list.addEventListener('pointermove', (e) => {
    const row = e.target.closest('.dd-option');
    if (row && rows.indexOf(row) !== active) setActive(rows.indexOf(row), false);
  });
  search?.addEventListener('input', () => renderList(search.value));

  panel.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
      case 'ArrowUp': e.preventDefault(); setActive(active - 1); break;
      case 'Home': if (e.target !== search) { e.preventDefault(); setActive(0); } break;
      case 'End': if (e.target !== search) { e.preventDefault(); setActive(rows.length - 1); } break;
      case 'Enter': e.preventDefault(); choose(active); break;
      case ' ': if (e.target !== search) { e.preventDefault(); choose(active); } break;
      case 'Escape': e.preventDefault(); e.stopPropagation(); close(); break;
      case 'Tab': close({ restoreFocus: false }); break;
      default:
        // Đang ở danh sách mà gõ chữ → chuyển sang ô tìm kiếm để lọc.
        if (search && e.target !== search && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) search.focus();
    }
  });

  labelEl?.addEventListener('click', (e) => {
    e.preventDefault();
    trigger.focus();
  });

  // Gán select.value bằng code → cập nhật giao diện.
  const nativeDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const nativeSet = nativeDesc.set;
  Object.defineProperty(select, 'value', {
    configurable: true,
    get() { return nativeDesc.get.call(this); },
    set(v) { nativeSet.call(this, v); renderTrigger(); },
  });

  renderTrigger();
  const api = { root, trigger, open, close, refresh: renderTrigger };
  select._dd = api;
  return api;
}
