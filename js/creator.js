/** Trang tạo thiệp: chọn dịp, mối quan hệ, lời chúc gợi ý, theme tương thích, live preview, tạo & chia sẻ liên kết. */
import { CATEGORIES, OCCASIONS } from './data/occasions.js';
import { LIMITS, validateCard, buildCardUrl } from './url-state.js';
import { mountCard } from './greeting.js';
import { getOccasion, themesFor, defaultThemeFor, suggestionsFor, relationsFor } from './occasion-engine.js';
import { nextOccurrence, formatDate, countdownLabel } from './calendar.js';
import { goBack, routeHref, navigate } from './router.js';
import { exportGif, gifFileName } from './gif-export.js';
import { enhanceSelect } from './dropdown.js';
import { track } from './analytics.js';
import * as music from './music.js';

const $ = (sel) => document.querySelector(sel);
const LONG_URL = 1800;
const fmt = (n) => n.toLocaleString('vi-VN');

/** Khởi tạo một lần; trả về { enter(occasionId) } để mở lại trang với dịp khác. */
export function initCreator() {
  const form = $('#card-form');
  const occSelect = $('#occasion');
  const occNote = $('#occasion-note');
  const nameInput = $('#name');
  const titleInput = $('#title');
  const msgInput = $('#message');
  const counter = $('#msg-count');
  const grid = $('#theme-grid');
  const relChips = $('#relation-chips');
  const relField = $('#relation-field');
  const suggestList = $('#suggest-list');
  const suggestBox = $('#suggest-box');
  const suggestFor = $('#suggest-for');
  const optAnim = $('#opt-anim');
  const optSfx = $('#opt-sfx');
  const optMusic = $('#opt-music');
  const musicRow = $('#music-row');
  const result = $('#result');
  const shareUrl = $('#share-url');
  const urlNote = $('#url-note');
  const toast = $('#toast');

  let occasion = getOccasion('birthday');
  let theme = defaultThemeFor(occasion);
  let relation = '';
  let toastTimer = 0;

  // ---------- Danh sách dịp (nhóm theo danh mục) ----------
  for (const [cat, label] of Object.entries(CATEGORIES)) {
    const items = OCCASIONS.filter((o) => o.enabled && o.category === cat);
    if (!items.length) continue;
    const group = document.createElement('optgroup');
    group.label = label;
    items.forEach((o) => {
      const opt = new Option(o.name, o.id);
      const next = nextOccurrence(o);
      opt.dataset.icon = o.cover.glyph;
      if (o.cover.image) opt.dataset.img = o.cover.image;
      opt.dataset.theme = o.cover.theme;
      opt.dataset.sub = next ? `${formatDate(next.date).split(', ')[1]} · ${countdownLabel(next.days)}` : o.dateType === 'none' ? 'Gửi bất cứ lúc nào' : 'Chưa có dữ liệu ngày';
      group.append(opt);
    });
    occSelect.append(group);
  }

  enhanceSelect(occSelect, { searchPlaceholder: 'Tìm dịp… (có dấu hoặc không dấu)' });

  // ---------- Live preview ----------
  const getData = () => ({ occasion: occasion.id, name: nameInput.value, message: msgInput.value, theme, title: titleInput.value });
  // Live preview không tự phát âm thanh (mỗi lần đổi theme/dịp sẽ ồn); nghe thử bằng "Xem trước thiệp" toàn màn hình.
  const preview = mountCard($('#preview-host'), { name: '', message: '', theme, occasion: occasion.id }, { hideMakeOwn: true, sound: false });
  const syncPreview = () => preview.update(getData());

  // ---------- Theme picker (chỉ theme tương thích với dịp) ----------
  let cards = [];
  function renderThemes() {
    grid.replaceChildren();
    cards = themesFor(occasion).map((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-card';
      btn.setAttribute('role', 'radio');
      btn.dataset.id = t.id;

      const mini = document.createElement('div');
      mini.className = 'theme-mini';
      mini.dataset.theme = t.id;
      mini.setAttribute('aria-hidden', 'true');
      const sample = document.createElement('span');
      sample.className = 'mini-title';
      sample.textContent = t.sample;
      mini.append(sample);

      const meta = document.createElement('div');
      meta.className = 'theme-meta';
      const title = document.createElement('strong');
      title.textContent = t.name;
      const dots = document.createElement('span');
      dots.className = 'dots';
      t.colors.forEach((c) => {
        const d = document.createElement('i');
        d.style.background = c;
        dots.append(d);
      });
      const desc = document.createElement('small');
      desc.textContent = t.description;
      const head = document.createElement('div');
      head.className = 'theme-head';
      head.append(title, dots);
      meta.append(head, desc);

      btn.append(mini, meta);
      btn.addEventListener('click', () => selectTheme(t.id));
      grid.append(btn);
      return btn;
    });
  }

  function selectTheme(id, { focus = false } = {}) {
    theme = id;
    cards.forEach((c) => {
      const on = c.dataset.id === id;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
      if (on && focus) c.focus();
    });
    syncPreview();
    hideResult();
  }
  grid.addEventListener('keydown', (e) => {
    const list = cards.map((c) => c.dataset.id);
    const i = list.indexOf(theme);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    selectTheme(list[(i + step + list.length) % list.length], { focus: true });
  });

  // ---------- Mối quan hệ & lời chúc gợi ý ----------
  function renderRelations() {
    relChips.replaceChildren();
    const rels = relationsFor(occasion);
    relField.hidden = rels.length === 0;
    [{ id: '', label: 'Không chọn' }, ...rels].forEach((r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.id = r.id;
      b.setAttribute('role', 'radio');
      b.textContent = r.label;
      b.addEventListener('click', () => selectRelation(r.id));
      relChips.append(b);
    });
    selectRelation(rels.some((r) => r.id === relation) ? relation : '');
  }

  function selectRelation(id) {
    relation = id;
    relChips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-checked', String(c.dataset.id === id)));
    renderSuggestions();
  }

  function renderSuggestions() {
    const list = suggestionsFor(occasion, relation);
    suggestBox.hidden = list.length === 0;
    suggestFor.textContent = relation ? `· dành cho ${relChips.querySelector(`[data-id="${relation}"]`)?.textContent.toLowerCase()}` : '';
    suggestList.replaceChildren();
    list.forEach((text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'suggest-item';
      b.textContent = text;
      b.addEventListener('click', () => {
        msgInput.value = text.slice(0, LIMITS.message);
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.focus();
        showToast('Đã chọn lời chúc — bạn có thể chỉnh sửa tùy ý.');
      });
      suggestList.append(b);
    });
  }

  // ---------- Đổi dịp ----------
  function setOccasion(id, { syncUrl = false } = {}) {
    occasion = getOccasion(id) ?? getOccasion('birthday');
    occSelect.value = occasion.id;
    titleInput.placeholder = occasion.headline;
    // Giữ tên, tiêu đề và lời chúc người dùng đã nhập; chỉ đổi theme nếu không tương thích.
    if (!occasion.themeIds.includes(theme)) theme = defaultThemeFor(occasion);
    renderThemes();
    renderRelations();
    musicRow.hidden = !occasion.music;
    if (!occasion.music && music.isOn()) music.setOn(false);

    const next = nextOccurrence(occasion);
    occNote.textContent = next
      ? `${formatDate(next.date)} · ${countdownLabel(next.days)}`
      : occasion.dateType === 'none' ? 'Dịp không có ngày cố định.' : 'Chưa có dữ liệu ngày chính xác cho dịp này.';
    selectTheme(theme);
    if (syncUrl) navigate(routeHref('create', { occasion: occasion.id }), { replace: true });
  }
  occSelect.addEventListener('change', () => setOccasion(occSelect.value, { syncUrl: true }));

  // ---------- Form ----------
  function updateCounter() {
    const n = msgInput.value.length;
    counter.textContent = `${fmt(n)} / ${fmt(LIMITS.message)}`;
    counter.classList.toggle('is-near', n > LIMITS.message * 0.9);
  }
  const fieldInput = { name: nameInput, message: msgInput, title: titleInput };
  function setError(field, text) {
    $(`#${field}-error`).textContent = text ?? '';
    fieldInput[field].toggleAttribute('aria-invalid', Boolean(text));
  }

  nameInput.addEventListener('input', () => { setError('name'); syncPreview(); hideResult(); });
  titleInput.addEventListener('input', () => { setError('title'); syncPreview(); hideResult(); });
  msgInput.addEventListener('input', () => { setError('message'); updateCounter(); syncPreview(); hideResult(); });
  optAnim.addEventListener('change', () => { preview.setAnimations(optAnim.checked); hideResult(); });
  optSfx.addEventListener('change', hideResult);
  optMusic.addEventListener('change', () => music.setOn(optMusic.checked));
  music.subscribe((on) => (optMusic.checked = on));

  function validate() {
    const { ok, data, errors } = validateCard(getData());
    setError('name', errors.name);
    setError('message', errors.message);
    setError('title', errors.title);
    if (!ok) (errors.name ? nameInput : errors.title ? titleInput : msgInput).focus();
    return ok ? data : null;
  }

  // ---------- Xem trước toàn màn hình ----------
  const modal = $('#preview-modal');
  const modalHost = $('#modal-host');
  let modalCard = null;
  let opener = null;

  function openModal(data) {
    opener = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalCard = mountCard(modalHost, data, { animations: optAnim.checked, sound: optSfx.checked, autofocus: false, hideMakeOwn: true });
    $('#modal-close').focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modalCard?.destroy();
    modalCard = null;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    opener?.focus?.();
  }
  $('#btn-preview').addEventListener('click', () => {
    const data = validate();
    if (data) openModal(data);
  });
  $('#modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeModal());

  // ---------- Kích thước & trạng thái preview ----------
  const frame = $('#preview-frame');
  document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => {
      frame.dataset.size = b.dataset.size;
      document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }),
  );
  const stageToggle = $('#btn-stage-toggle');
  stageToggle.addEventListener('click', () => {
    if (preview.phase === 'reveal') {
      preview.showIntro();
      stageToggle.textContent = 'Xem màn hình chúc mừng →';
    } else {
      preview.showReveal();
      stageToggle.textContent = '← Về màn hình mở đầu';
    }
  });
  preview.el.querySelector('.btn-open').addEventListener('click', () => {
    stageToggle.textContent = '← Về màn hình mở đầu';
  });
  $('#btn-back').addEventListener('click', () => goBack());

  // ---------- Tạo liên kết ----------
  function hideResult() {
    result.hidden = true;
    resetGif();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    const url = buildCardUrl({ ...data, anim: optAnim.checked, sound: optSfx.checked });
    shareUrl.value = url;
    $('#btn-open').href = url;
    const long = url.length > LONG_URL;
    urlNote.hidden = !long;
    urlNote.textContent = long
      ? `Liên kết khá dài (${fmt(url.length)} ký tự). Một số ứng dụng có thể cắt ngắn liên kết — hãy rút gọn lời chúc nếu bạn gặp sự cố.`
      : '';
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ---------- Xuất GIF (khổ điện thoại) ----------
  const gifBtn = $('#btn-gif');
  const gifPanel = $('#gif-panel');
  const gifProgress = $('#gif-progress');
  const gifStatus = $('#gif-status');
  const gifDone = $('#gif-done');
  const gifShare = $('#gif-share');
  let gifUrl = '';
  let gifFile = null;
  let gifRun = 0;

  function resetGif() {
    gifRun++; // hủy kết quả của lần chạy đang dở (nếu có)
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    gifUrl = '';
    gifFile = null;
    gifPanel.hidden = true;
    gifDone.hidden = true;
    gifBtn.disabled = false;
  }

  gifBtn.addEventListener('click', async () => {
    const data = validate();
    if (!data) return;
    track('gif-export');
    resetGif();
    const run = gifRun;
    gifBtn.disabled = true;
    gifPanel.hidden = false;
    $('#gif-progress-wrap').hidden = false;
    gifProgress.value = 0;
    gifStatus.textContent = 'Đang tạo GIF…';
    gifPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    try {
      const out = await exportGif(data, {
        onProgress: (f) => {
          if (run === gifRun) {
            gifProgress.value = Math.round(f * 100);
            gifStatus.textContent = `Đang tạo GIF… ${Math.round(f * 100)}%`;
          }
        },
      });
      if (run !== gifRun) return;
      gifFile = new File([out.blob], gifFileName(data.occasion, data.name), { type: 'image/gif' });
      gifUrl = URL.createObjectURL(out.blob);
      $('#gif-preview').src = gifUrl;
      $('#gif-download').href = gifUrl;
      $('#gif-download').download = gifFile.name;
      $('#gif-info').textContent = `${out.width}×${out.height} · ${out.frames} khung hình · ${(out.bytes / 1024 / 1024).toFixed(2)} MB`;
      gifShare.hidden = !(navigator.canShare?.({ files: [gifFile] }) ?? false);
      $('#gif-progress-wrap').hidden = true;
      gifDone.hidden = false;
      gifBtn.disabled = false;
    } catch (err) {
      if (run !== gifRun) return;
      console.error(err);
      gifStatus.textContent = 'Không thể tạo GIF trên thiết bị này. Hãy thử lại hoặc dùng trình duyệt khác.';
      gifBtn.disabled = false;
    }
  });

  $('#gif-download').addEventListener('click', () => track('gif-download'));

  gifShare.addEventListener('click', async () => {
    if (!gifFile) return;
    track('share-gif');
    try {
      await navigator.share({ files: [gifFile], title: `Thiệp ${occasion.name}`, text: `Một lời chúc dành cho ${nameInput.value.trim()} 🎁` });
    } catch (err) {
      if (err?.name !== 'AbortError') showToast('Không thể mở hộp thoại chia sẻ.');
    }
  });

  shareUrl.addEventListener('focus', () => shareUrl.select());

  $('#btn-copy').addEventListener('click', async () => {
    track('copy-link');
    if (await copyText(shareUrl.value)) showToast('Đã sao chép liên kết!');
    else {
      shareUrl.select();
      showToast('Không thể tự sao chép — hãy nhấn Ctrl/Cmd + C.');
    }
  });

  const btnShare = $('#btn-share');
  if (typeof navigator.share === 'function') {
    btnShare.hidden = false;
    btnShare.addEventListener('click', async () => {
      track('share');
      try {
        await navigator.share({
          title: `Thiệp ${occasion.name}`,
          text: `Một lời chúc dành cho ${nameInput.value.trim()} 🎁`,
          url: shareUrl.value,
        });
      } catch (err) {
        if (err?.name !== 'AbortError') showToast('Không thể mở hộp thoại chia sẻ.');
      }
    });
  }

  $('#btn-edit').addEventListener('click', () => {
    hideResult();
    nameInput.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#btn-new').addEventListener('click', () => {
    form.reset();
    optAnim.checked = true;
    optSfx.checked = true;
    preview.setAnimations(true);
    ['name', 'message', 'title'].forEach((f) => setError(f));
    updateCounter();
    occSelect.value = occasion.id;
    selectRelation('');
    selectTheme(defaultThemeFor(occasion));
    nameInput.focus();
  });

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  updateCounter();
  setOccasion('birthday');

  return {
    /** Mở trang với một dịp (id không hợp lệ → giữ dịp hiện tại, mặc định sinh nhật). */
    enter(id, themeId) {
      if (id && getOccasion(id)) setOccasion(id);
      if (themeId && occasion.themeIds.includes(themeId)) selectTheme(themeId);
      hideResult();
    },
  };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* rơi xuống phương án dự phòng */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
