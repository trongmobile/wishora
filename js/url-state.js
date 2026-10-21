/**
 * Toàn bộ dữ liệu thiệp nằm trong query string. Module này là nơi DUY NHẤT
 * đọc/ghi query string của thiệp: dùng URLSearchParams, không ghép chuỗi thủ công.
 *
 * Định dạng mới : ?type=greeting&occasion=<id>&name=&message=&theme=[&title=][&effects=off,mute]
 *   effects: off = tắt hiệu ứng động, mute = tắt hiệu ứng âm thanh (mặc định bật cả hai)
 * Sinh nhật     : ?type=birthday&name=&message=&theme=            (occasion mặc định = birthday)
 * Định dạng cũ  : ?name=&message=&theme=[&anim=0]                  (vẫn đọc được — coi là sinh nhật)
 */
import { isThemeId } from './data/themes.js';
import { isOccasionId } from './occasion-engine.js';

export const LIMITS = Object.freeze({ name: 60, message: 1000, title: 80 });
export const BIRTHDAY = 'birthday';

// Ký tự điều khiển (trừ \n và \t) không có nghĩa trong lời chúc.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SINGLE_LINE = (s) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').replace(CONTROL_CHARS, '').trim();

export const cleanName = SINGLE_LINE;
export const cleanTitle = SINGLE_LINE;
export const cleanMessage = (s) => String(s ?? '').replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, '').trim();

/** Tham số tạo nên một thiệp. Nếu có bất kỳ tham số nào trong số này (không kèm `page`) → coi là thiệp. */
export const CARD_KEYS = ['type', 'name', 'message', 'theme', 'occasion', 'title', 'effects', 'anim'];

/** Kiểm tra dữ liệu. Trả về { ok, data, errors } — errors có khóa name/message/theme/occasion/title. */
export function validateCard({ occasion = BIRTHDAY, name, message, theme, title }) {
  const data = {
    occasion: String(occasion ?? ''),
    name: cleanName(name),
    message: cleanMessage(message),
    theme: String(theme ?? ''),
    title: cleanTitle(title),
  };
  const errors = {};

  if (!isOccasionId(data.occasion)) errors.occasion = 'Dịp chúc mừng không được hỗ trợ.';

  if (!data.name) errors.name = 'Hãy nhập tên người nhận nhé.';
  else if (data.name.length > LIMITS.name) errors.name = `Tên tối đa ${LIMITS.name} ký tự.`;

  if (!data.message) errors.message = 'Hãy viết một lời chúc thật đặc biệt nhé.';
  else if (data.message.length > LIMITS.message) errors.message = `Lời chúc tối đa ${LIMITS.message.toLocaleString('vi-VN')} ký tự.`;

  if (data.title.length > LIMITS.title) errors.title = `Tiêu đề tối đa ${LIMITS.title} ký tự.`;

  if (!isThemeId(data.theme)) errors.theme = 'Theme không được hỗ trợ.';

  return { ok: Object.keys(errors).length === 0, data, errors };
}

export const hasCardParams = (search) => {
  const p = new URLSearchParams(search);
  return !p.has('page') && CARD_KEYS.some((k) => p.has(k));
};

/**
 * Đọc thiệp từ location.search.
 *  - kind 'none'   : không có tham số thiệp
 *  - kind 'card'   : hợp lệ → data { occasion, name, message, theme, title, anim:boolean, sound:boolean }
 *  - kind 'invalid': có tham số nhưng sai → error là câu thông báo thân thiện
 */
export function parseCardUrl(search) {
  const params = new URLSearchParams(search);
  if (!hasCardParams(search)) return { kind: 'none' };

  const type = params.get('type');
  if (type && type !== 'birthday' && type !== 'greeting') {
    return { kind: 'invalid', error: 'Liên kết thiệp không hợp lệ: loại thiệp không được hỗ trợ.' };
  }
  // Link cũ không có type/occasion → sinh nhật. type=greeting bắt buộc có occasion.
  const occasion = params.get('occasion') ?? (type === 'greeting' ? '' : BIRTHDAY);

  const missing = ['name', 'message', 'theme'].filter((k) => !params.get(k)?.trim());
  if (missing.length || !occasion) {
    return { kind: 'invalid', error: 'Liên kết thiệp bị thiếu thông tin. Có thể liên kết đã bị cắt ngắn khi gửi.' };
  }

  const { ok, data, errors } = validateCard({
    occasion,
    name: params.get('name'),
    message: params.get('message'),
    theme: params.get('theme'),
    title: params.get('title'),
  });
  if (!ok) {
    const reason = errors.occasion ?? errors.theme ?? errors.name ?? errors.message ?? errors.title;
    return { kind: 'invalid', error: `Liên kết thiệp không hợp lệ. ${reason}` };
  }

  const effects = (params.get('effects') ?? '').split(',');
  const anim = !(effects.includes('off') || params.get('anim') === '0');
  return { kind: 'card', data: { ...data, anim, sound: !effects.includes('mute') } };
}

/**
 * Địa chỉ trang tĩnh của dịp: <gốc site>/o/<dịp>/ — trang này có metadata (tiêu đề, ảnh OG) riêng
 * cho từng dịp để Zalo/Facebook/Messenger hiển thị xem trước đúng. Gốc site lấy từ document.baseURI
 * (không hardcode domain); không có DOM thì dùng location.href.
 */
export function shareBase(occasion, root = globalThis.document?.baseURI ?? globalThis.location.href) {
  return new URL(`o/${occasion}/`, root).href;
}

/** Tạo URL chia sẻ từ dữ liệu đã hợp lệ. `base` mặc định là trang theo dịp (xem shareBase). */
export function buildCardUrl({ occasion = BIRTHDAY, name, message, theme, title = '', anim = true, sound = true }, base = shareBase(occasion)) {
  const url = new URL(base);
  const params = new URLSearchParams({ type: occasion === BIRTHDAY ? 'birthday' : 'greeting' });
  if (occasion !== BIRTHDAY) params.set('occasion', occasion);
  params.set('name', name);
  params.set('message', message);
  params.set('theme', theme);
  if (title) params.set('title', title);
  const effects = [anim ? '' : 'off', sound ? '' : 'mute'].filter(Boolean);
  if (effects.length) params.set('effects', effects.join(','));
  url.hash = '';
  // URLSearchParams mã hóa khoảng trắng thành '+'; %20 được các ứng dụng chat xử lý ổn định hơn.
  // '+' thật trong dữ liệu đã được mã hóa thành %2B nên phép thay này an toàn.
  url.search = params.toString().replace(/\+/g, '%20');
  return url.toString();
}

/**
 * Gắn utm_campaign vào link chia sẻ để GoatCounter (tab Campaigns) biết người nhận đến từ nút nào.
 * Dùng utm_campaign thay vì utm_source: utm_source sẽ ghi đè referrer thật (Zalo, TikTok…).
 */
export function withCampaign(url, campaign) {
  const u = new URL(url);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString().replace(/\+/g, '%20');
}
