/**
 * Danh mục dịp lễ / sự kiện. Thêm dịp mới: thêm một mục vào mảng ở cuối file (xem README).
 *
 * dateType:
 *   'fixed' → dateConfig { month, day }
 *   'lunar' → dateConfig { key, offsetDays? } — tra bảng js/data/lunar-calendar.js; thiếu năm thì không countdown
 *   'rule'  → dateConfig { byCountry: { VN: { month, weekday, nth }, ... } } — weekday 0 = Chủ nhật
 *   'none'  → dịp không có lịch cố định (không countdown)
 * region : mảng gồm 'VN' và/hoặc 'international'
 * cover  : { glyph, theme, image? } — minh họa thẻ dịp: ký tự lớn trên nền theme, hoặc ảnh SVG riêng trong assets/illustrations/ (nếu có `image`)
 */
import { MESSAGES } from './messages.js';
import { AUTO_THEMES } from './themes-auto.js';

export const CATEGORIES = Object.freeze({
  birthday: 'Sinh nhật & kỷ niệm',
  tet: 'Tết & năm mới',
  women: 'Ngày của phụ nữ',
  family: 'Gia đình & tình thân',
  love: 'Tình yêu & tình bạn',
  vietnamese: 'Ngày lễ Việt Nam',
  international: 'Lễ hội quốc tế',
  custom: 'Dịp cá nhân hóa',
});

export const COUNTRIES = Object.freeze({ VN: 'Việt Nam', US: 'Hoa Kỳ', CA: 'Canada', AU: 'Úc' });
export const DEFAULT_COUNTRY = 'VN';

const BIRTHDAY_THEMES = ['rose', 'galaxy', 'candy', 'gold', 'pastel', 'floral'];
const TET = ['tet-traditional', 'golden-prosperity', 'spring-blossom', 'modern-lunar'];
const WOMEN = ['elegant-pink', 'floral-garden', 'soft-lavender', 'blooming-flowers', 'minimalist-appreciation'];
const LOVE = ['romantic-rose', 'love-letter', 'pastel-hearts', 'dreamy-night', 'friendship-memories'];
const GENERAL = ['classic-elegance', 'sunny-bright', 'calm-sky', 'family-warmth', 'fresh-mint'];

const fixed = (month, day) => ({ dateType: 'fixed', dateConfig: { month, day } });
const lunar = (key, offsetDays = 0) => ({ dateType: 'lunar', dateConfig: { key, offsetDays } });
const none = { dateType: 'none', dateConfig: null };
const nth = (month, weekday, n) => ({ month, weekday, nth: n });

const SOLEMN_SIGNOFF = 'Gửi với lòng trân trọng';

const make = (o) => ({
  slug: o.id,
  region: ['VN'],
  tags: [],
  keywords: [],
  tone: 'warm',
  introTitle: 'Một lời chúc dành cho bạn',
  openLabel: 'Mở thiệp',
  signoff: 'Gửi với tất cả yêu thương',
  couplet: null,
  music: false,
  featured: false,
  enabled: true,
  ...o,
  themeIds: [...o.themeIds, ...AUTO_THEMES.filter((t) => t.occasionId === o.id).map((t) => t.id)],
  messageTemplates: MESSAGES[o.id] ?? { default: [] },
});

export const OCCASIONS = [
  // ---------- Sinh nhật ----------
  make({
    id: 'birthday', name: 'Sinh nhật', category: 'birthday', ...none, region: ['VN', 'international'],
    description: 'Mở quà, bánh sinh nhật, confetti — thiệp sinh nhật cá nhân hóa.',
    headline: 'Happy Birthday', introTitle: 'A Special Surprise For You', openLabel: 'Mở món quà', signoff: 'Made with love ❤️',
    tone: 'festive', music: true, featured: true, keywords: ['birthday', 'wishora', 'sinh nhat', 'tuoi moi'],
    themeIds: BIRTHDAY_THEMES, suggestedRecipients: ['mother', 'father', 'lover', 'friend', 'colleague'],
    cover: { glyph: '🎂', theme: 'candy' },
  }),

  // ---------- Tết & năm mới ----------
  make({
    id: 'new-year', name: 'Tết Dương lịch', category: 'tet', ...fixed(1, 1), region: ['VN', 'international'],
    description: 'Chào năm mới dương lịch 01/01 với những lời chúc khởi đầu tốt đẹp.',
    headline: 'Chúc Mừng Năm Mới', introTitle: 'Chào Năm Mới', tone: 'festive', featured: true,
    keywords: ['tet duong lich', 'nam moi', 'new year', '1/1'],
    themeIds: ['golden-prosperity', 'modern-lunar', 'colorful-celebration', 'classic-elegance', 'sunny-bright'],
    suggestedRecipients: ['family', 'lover', 'friend', 'colleague'], cover: { glyph: '🎆', theme: 'golden-prosperity' },
  }),
  make({
    id: 'tet', name: 'Tết Nguyên Đán', category: 'tet', ...lunar('tet'),
    description: 'Mùng 1 Tết âm lịch — hoa mai, hoa đào, câu đối và ánh vàng may mắn.',
    headline: 'Chúc Mừng Năm Mới', introTitle: 'Xuân Về Chúc Phúc', openLabel: 'Mở lì xì', signoff: 'Vạn sự như ý 🌼',
    couplet: ['Vạn sự như ý', 'Tấn tài tấn lộc'], tone: 'festive', featured: true,
    keywords: ['tet nguyen dan', 'tet am lich', 'nam moi', 'li xi', 'xuan', 'mung 1'],
    themeIds: TET, suggestedRecipients: ['parents', 'grandparents', 'family', 'relatives', 'boss', 'partner', 'friend'],
    cover: { glyph: '🌼', theme: 'tet-traditional', image: 'assets/illustrations/li-xi-vn.svg' }, // image: tranh minh họa riêng (ưu tiên hơn glyph)
  }),
  make({
    id: 'giao-thua', name: 'Giao thừa', category: 'tet', ...lunar('tet', -1),
    description: 'Khoảnh khắc thiêng liêng chuyển giao giữa năm cũ và năm mới âm lịch.',
    headline: 'Đêm Giao Thừa', introTitle: 'Khoảnh Khắc Giao Thừa', openLabel: 'Mở thiệp', tone: 'festive',
    keywords: ['giao thua', 'dem 30', 'tat nien'],
    themeIds: TET, suggestedRecipients: ['family', 'parents', 'lover', 'friend'], cover: { glyph: '🎇', theme: 'golden-prosperity' },
  }),
  make({
    id: 'new-year-wish', name: 'Chúc mừng năm mới', category: 'tet', ...none, region: ['VN', 'international'],
    description: 'Lời chúc năm mới gửi bất cứ lúc nào, không gắn với một ngày cụ thể.',
    headline: 'Chúc Mừng Năm Mới', introTitle: 'Năm Mới Bình An', tone: 'festive',
    keywords: ['chuc mung nam moi', 'nam moi'],
    themeIds: [...TET, 'classic-elegance'], suggestedRecipients: ['family', 'friend', 'colleague', 'boss'],
    cover: { glyph: '🎊', theme: 'spring-blossom' },
  }),
  make({
    id: 'khai-xuan', name: 'Khai xuân đầu năm', category: 'tet', ...none,
    description: 'Lời chúc khai xuân, mở hàng, khai bút đầu năm may mắn.',
    headline: 'Khai Xuân Đại Cát', introTitle: 'Xuân Mới Khởi Đầu', tone: 'festive',
    keywords: ['khai xuan', 'khai but', 'mo hang', 'dau nam'],
    themeIds: TET, suggestedRecipients: ['boss', 'colleague', 'partner', 'friend'], cover: { glyph: '🌸', theme: 'spring-blossom' },
  }),

  // ---------- Ngày của phụ nữ ----------
  make({
    id: 'women-day-08-03', name: 'Quốc tế Phụ nữ 8/3', category: 'women', ...fixed(3, 8), region: ['international', 'VN'],
    description: 'Gửi hoa và lời yêu thương đến những người phụ nữ bạn trân quý.',
    headline: 'Chúc Mừng 8/3', introTitle: 'Gửi Người Phụ Nữ Tuyệt Vời', tone: 'festive', featured: true,
    keywords: ['quoc te phu nu', '8/3', 'phu nu', 'womens day'],
    themeIds: WOMEN, suggestedRecipients: ['mother', 'wife', 'lover', 'friend', 'colleague', 'teacher'],
    cover: { glyph: '🌷', theme: 'elegant-pink' },
  }),
  make({
    id: 'women-day-20-10', name: 'Ngày Phụ nữ Việt Nam 20/10', category: 'women', ...fixed(10, 20),
    description: 'Tôn vinh người phụ nữ Việt Nam: mẹ, vợ, người yêu, bạn bè, đồng nghiệp, cô giáo.',
    headline: 'Chúc Mừng 20/10', introTitle: 'Gửi Người Phụ Nữ Việt Nam', tone: 'festive', featured: true,
    keywords: ['phu nu viet nam', '20/10', 'phu nu', 'hoa'],
    themeIds: WOMEN, suggestedRecipients: ['mother', 'wife', 'lover', 'friend', 'colleague', 'teacher'],
    cover: { glyph: '🌸', theme: 'floral-garden' },
  }),

  // ---------- Gia đình ----------
  make({
    id: 'mothers-day', name: 'Ngày của Mẹ', category: 'family', region: ['VN', 'international'],
    dateType: 'rule', dateConfig: { byCountry: { VN: nth(5, 0, 2), US: nth(5, 0, 2), CA: nth(5, 0, 2), AU: nth(5, 0, 2) } },
    description: 'Lời cảm ơn dành cho mẹ — Chủ nhật thứ hai của tháng 5 (có thể đổi quốc gia).',
    headline: 'Ngày Của Mẹ', introTitle: 'Gửi Mẹ Yêu', tone: 'warm', keywords: ['ngay cua me', 'me', 'mother'],
    themeIds: ['elegant-pink', 'floral-garden', 'soft-lavender', 'family-warmth', 'classic-elegance', 'calm-sky'],
    suggestedRecipients: ['mother', 'grandparents', 'wife'], cover: { glyph: '💐', theme: 'soft-lavender' },
  }),
  make({
    id: 'fathers-day', name: 'Ngày của Cha', category: 'family', region: ['VN', 'international'],
    dateType: 'rule', dateConfig: { byCountry: { VN: nth(6, 0, 3), US: nth(6, 0, 3), CA: nth(6, 0, 3), AU: nth(9, 0, 1) } },
    description: 'Lời cảm ơn dành cho ba — Chủ nhật thứ ba của tháng 6 (Úc: Chủ nhật đầu tháng 9).',
    headline: 'Ngày Của Cha', introTitle: 'Gửi Ba Yêu', tone: 'warm', keywords: ['ngay cua cha', 'ba', 'bo', 'father'],
    themeIds: ['family-warmth', 'classic-elegance', 'calm-sky', 'gratitude-respect'],
    suggestedRecipients: ['father', 'grandparents', 'husband'], cover: { glyph: '👔', theme: 'calm-sky' },
  }),
  make({
    id: 'family-day-28-06', name: 'Ngày Gia đình Việt Nam 28/6', category: 'family', ...fixed(6, 28),
    description: 'Gửi lời yêu thương đến mái ấm của bạn nhân Ngày Gia đình Việt Nam.',
    headline: 'Ngày Gia Đình Việt Nam', introTitle: 'Gửi Cả Nhà Yêu Thương', keywords: ['gia dinh', '28/6'],
    themeIds: ['family-warmth', 'spring-blossom', 'sunny-bright', 'calm-sky'],
    suggestedRecipients: ['family', 'parents', 'child', 'sibling'], cover: { glyph: '🏡', theme: 'family-warmth' },
  }),
  make({
    id: 'children-day-01-06', name: 'Quốc tế Thiếu nhi 1/6', category: 'family', ...fixed(6, 1), region: ['VN', 'international'],
    description: 'Gửi những lời chúc vui tươi cho các bé nhân ngày 1/6.',
    headline: 'Ngày Quốc Tế Thiếu Nhi', introTitle: 'Quà Cho Bé Yêu', openLabel: 'Mở món quà', tone: 'festive',
    keywords: ['thieu nhi', '1/6', 'tre em', 'be'],
    themeIds: ['colorful-celebration', 'sunny-bright', 'fresh-mint', 'family-warmth'],
    suggestedRecipients: ['child', 'friend', 'family'], cover: { glyph: '🎈', theme: 'colorful-celebration' },
  }),

  // ---------- Tình yêu & tình bạn ----------
  make({
    id: 'valentine', name: 'Valentine 14/2', category: 'love', ...fixed(2, 14), region: ['international', 'VN'],
    description: 'Gửi lời yêu thương đến người đặc biệt nhân ngày lễ tình yêu.',
    headline: 'Happy Valentine', introTitle: 'Một Lá Thư Gửi Người Thương', tone: 'romantic', featured: true,
    keywords: ['valentine', '14/2', 'tinh yeu', 'ngay le tinh nhan'],
    themeIds: LOVE, suggestedRecipients: ['lover', 'wife', 'husband', 'friend'], cover: { glyph: '💝', theme: 'romantic-rose' },
  }),
  make({
    id: 'white-day', name: 'White Day 14/3', category: 'love', ...fixed(3, 14), region: ['international'],
    description: 'Ngày đáp lại tình cảm — phổ biến ở Hàn Quốc, Nhật Bản và giới trẻ Việt Nam.',
    headline: 'Happy White Day', introTitle: 'Gửi Chút Ngọt Ngào', tone: 'romantic', keywords: ['white day', '14/3', 'valentine trang'],
    themeIds: ['pastel-hearts', 'romantic-rose', 'love-letter', 'dreamy-night'], suggestedRecipients: ['lover', 'friend'],
    cover: { glyph: '🤍', theme: 'pastel-hearts' },
  }),
  make({
    id: 'friendship-day-30-07', name: 'Ngày Quốc tế Tình bạn 30/7', category: 'love', ...fixed(7, 30), region: ['international'],
    description: 'Cảm ơn những người bạn đã luôn ở bên bạn.',
    headline: 'Ngày Của Tình Bạn', introTitle: 'Gửi Người Bạn Của Mình', openLabel: 'Mở món quà', tone: 'warm',
    keywords: ['tinh ban', '30/7', 'ban be', 'friendship'],
    themeIds: ['friendship-memories', 'colorful-celebration', 'sunny-bright', 'dreamy-night'],
    suggestedRecipients: ['bestfriend', 'friend'], cover: { glyph: '🤝', theme: 'friendship-memories' },
  }),
  make({
    id: 'anniversary-personal', name: 'Ngày kỷ niệm cá nhân', category: 'love', ...none, tags: ['anniversary'], region: ['VN', 'international'],
    description: 'Kỷ niệm một cột mốc riêng của bạn — nhập tiêu đề và lời chúc theo ý bạn.',
    headline: 'Ngày Kỷ Niệm', introTitle: 'Một Cột Mốc Đáng Nhớ', openLabel: 'Mở món quà', keywords: ['ky niem', 'cot moc', 'anniversary'],
    themeIds: ['friendship-memories', 'classic-elegance', 'golden-prosperity', 'dreamy-night'],
    suggestedRecipients: ['friend', 'colleague', 'partner', 'family'], cover: { glyph: '🎞️', theme: 'friendship-memories' },
  }),
  make({
    id: 'anniversary-love', name: 'Kỷ niệm yêu nhau', category: 'love', ...none, tags: ['anniversary'], region: ['VN', 'international'],
    description: 'Kỷ niệm ngày yêu nhau hoặc ngày cưới của hai người.',
    headline: 'Kỷ Niệm Của Chúng Mình', introTitle: 'Gửi Người Thương', tone: 'romantic',
    keywords: ['yeu nhau', 'ky niem', 'ngay cuoi', 'anniversary'],
    themeIds: LOVE, suggestedRecipients: ['lover', 'wife', 'husband'], cover: { glyph: '💞', theme: 'love-letter' },
  }),

  // ---------- Ngày lễ Việt Nam ----------
  make({
    id: 'teachers-day-20-11', name: 'Ngày Nhà giáo Việt Nam 20/11', category: 'vietnamese', ...fixed(11, 20),
    description: 'Gửi lời tri ân đến thầy cô, giảng viên và những người làm nghề giáo.',
    headline: 'Tri Ân Thầy Cô', introTitle: 'Gửi Người Lái Đò', signoff: SOLEMN_SIGNOFF, tone: 'solemn', featured: true,
    keywords: ['nha giao', '20/11', 'thay co', 'giao vien', 'giang vien'],
    themeIds: ['education-knowledge', 'vietnamese-heritage', 'gratitude-respect'],
    suggestedRecipients: ['teacher', 'homeroom', 'lecturer', 'edu', 'friend'], cover: { glyph: '📚', theme: 'education-knowledge' },
  }),
  make({
    id: 'doctors-day-27-02', name: 'Ngày Thầy thuốc Việt Nam 27/2', category: 'vietnamese', ...fixed(2, 27),
    description: 'Cảm ơn những người thầy thuốc tận tâm vì sức khỏe cộng đồng.',
    headline: 'Ngày Thầy Thuốc Việt Nam', introTitle: 'Cảm Ơn Người Thầy Thuốc', signoff: SOLEMN_SIGNOFF, tone: 'solemn',
    keywords: ['thay thuoc', '27/2', 'bac si', 'y te'],
    themeIds: ['professional-appreciation', 'gratitude-respect'], suggestedRecipients: ['doctor', 'friend', 'family'],
    cover: { glyph: '🩺', theme: 'professional-appreciation' },
  }),
  make({
    id: 'entrepreneurs-day-13-10', name: 'Ngày Doanh nhân Việt Nam 13/10', category: 'vietnamese', ...fixed(10, 13),
    description: 'Chúc mừng các doanh nhân và những người đang gây dựng sự nghiệp.',
    headline: 'Ngày Doanh Nhân Việt Nam', introTitle: 'Tôn Vinh Doanh Nhân', signoff: SOLEMN_SIGNOFF, tone: 'solemn',
    keywords: ['doanh nhan', '13/10', 'kinh doanh'],
    themeIds: ['professional-appreciation', 'gratitude-respect'], suggestedRecipients: ['boss', 'partner', 'colleague', 'friend'],
    cover: { glyph: '💼', theme: 'classic-elegance' },
  }),

  // ---------- Quốc tế & lễ hội ----------
  make({
    id: 'christmas', name: 'Giáng sinh 25/12', category: 'international', ...fixed(12, 25), region: ['international', 'VN'],
    description: 'Tuyết rơi, cây thông và ánh đèn Noel — lời chúc Giáng sinh an lành.',
    headline: 'Merry Christmas', introTitle: 'Giáng Sinh An Lành', openLabel: 'Mở món quà', signoff: 'Merry Christmas 🎄', tone: 'festive', featured: true,
    keywords: ['giang sinh', 'noel', 'christmas', '25/12'],
    themeIds: ['christmas-wonderland', 'snowy-night', 'colorful-celebration'], suggestedRecipients: ['family', 'lover', 'friend', 'colleague'],
    cover: { glyph: '🎄', theme: 'christmas-wonderland' },
  }),
  make({
    id: 'halloween', name: 'Halloween 31/10', category: 'international', ...fixed(10, 31), region: ['international'],
    description: 'Bí ngô, dơi bay và những lời chúc vui nhộn đêm Halloween.',
    headline: 'Happy Halloween', introTitle: 'Trick or Treat!', openLabel: 'Mở món quà', tone: 'festive',
    keywords: ['halloween', '31/10', 'bi ngo', 'ma', 'hoa trang', 'trick or treat'],
    themeIds: ['halloween-magic', 'colorful-celebration', 'cozy-autumn'], suggestedRecipients: ['friend', 'bestfriend', 'lover', 'colleague', 'child', 'family'],
    cover: { glyph: '🎃', theme: 'halloween-magic' },
  }),
  make({
    id: 'happiness-day-20-03', name: 'Quốc tế Hạnh phúc 20/3', category: 'international', ...fixed(3, 20), region: ['international'],
    description: 'Ngày của những niềm vui giản dị — gửi lời chúc hạnh phúc cho ai đó.',
    headline: 'Ngày Quốc Tế Hạnh Phúc', introTitle: 'Hạnh Phúc Giản Dị', tone: 'warm',
    keywords: ['hanh phuc', '20/3', 'happiness'],
    themeIds: ['colorful-celebration', 'sunny-bright', 'calm-sky', 'fresh-mint', 'earth-nature'], suggestedRecipients: ['friend', 'family', 'lover', 'colleague'],
    cover: { glyph: '😊', theme: 'sunny-bright' },
  }),

  // ---------- Dịp cá nhân hóa (không có countdown) ----------
  ...[
    ['graduation', 'Chúc mừng tốt nghiệp', 'Chúc mừng ngày tốt nghiệp — cột mốc đáng tự hào.', 'Chúc Mừng Tốt Nghiệp', '🎓', ['classic-elegance', 'education-knowledge', 'sunny-bright', 'colorful-celebration', 'golden-prosperity'], ['child', 'friend', 'sibling', 'lover'], ['tot nghiep', 'graduation']],
    ['promotion', 'Chúc mừng thăng chức', 'Chúc mừng vị trí mới và thành quả xứng đáng.', 'Chúc Mừng Thăng Chức', '📈', ['classic-elegance', 'golden-prosperity', 'professional-appreciation', 'sunny-bright'], ['colleague', 'boss', 'friend', 'family'], ['thang chuc', 'promotion']],
    ['grand-opening', 'Chúc mừng khai trương', 'Chúc cửa hàng, công ty mới buôn may bán đắt.', 'Chúc Mừng Khai Trương', '🎊', ['golden-prosperity', 'colorful-celebration', 'classic-elegance', 'sunny-bright'], ['partner', 'friend', 'boss'], ['khai truong', 'mo cua']],
    ['housewarming', 'Chúc mừng tân gia', 'Chúc mừng mái ấm mới đầy tiếng cười.', 'Chúc Mừng Tân Gia', '🏠', ['family-warmth', 'sunny-bright', 'fresh-mint', 'classic-elegance'], ['friend', 'family', 'relatives', 'colleague'], ['tan gia', 'nha moi']],
    ['newborn', 'Chúc mừng em bé chào đời', 'Chào đón thành viên nhỏ của gia đình.', 'Chào Đón Em Bé', '👶', ['calm-sky', 'fresh-mint', 'sunny-bright', 'family-warmth'], ['friend', 'family', 'colleague', 'relatives'], ['em be', 'chao doi', 'sinh con']],
    ['success', 'Chúc mừng thành công', 'Chúc mừng một thành tựu đáng nhớ.', 'Chúc Mừng Thành Công', '🏆', ['golden-prosperity', 'colorful-celebration', 'sunny-bright', 'classic-elegance'], ['friend', 'colleague', 'family', 'boss'], ['thanh cong', 'thanh tich']],
    ['thank-you', 'Cảm ơn', 'Gửi một lời cảm ơn chân thành.', 'Lời Cảm Ơn', '🙏', ['gratitude-respect', 'classic-elegance', 'fresh-mint', 'calm-sky', 'family-warmth'], ['friend', 'colleague', 'teacher', 'partner', 'family'], ['cam on', 'thank you']],
    ['apology', 'Xin lỗi', 'Một lời xin lỗi nhẹ nhàng và chân thành.', 'Lời Xin Lỗi', '🕊️', ['calm-sky', 'fresh-mint', 'classic-elegance', 'gratitude-respect'], ['lover', 'friend', 'family', 'colleague'], ['xin loi', 'sorry']],
    ['get-well', 'Chúc mau khỏe', 'Gửi lời động viên đến người đang ốm.', 'Chúc Mau Khỏe', '🌿', ['fresh-mint', 'calm-sky', 'sunny-bright', 'family-warmth'], ['parents', 'friend', 'colleague', 'family'], ['mau khoe', 'om', 'get well']],
    ['good-luck', 'Chúc may mắn', 'Tiếp thêm may mắn cho kỳ thi, buổi phỏng vấn hay chặng đường mới.', 'Chúc May Mắn', '🍀', ['sunny-bright', 'colorful-celebration', 'golden-prosperity', 'fresh-mint'], ['child', 'friend', 'colleague', 'lover'], ['may man', 'good luck', 'thi cu']],
    ['free-wish', 'Lời chúc tự do', 'Tự viết tiêu đề và lời chúc theo ý bạn.', 'Gửi Bạn Một Lời Chúc', '✨', [...GENERAL, 'earth-nature', 'vietnamese-heritage'], ['friend', 'family', 'lover', 'colleague', 'everyone'], ['loi chuc', 'tu do', 'bat ky']],
  ].map(([id, name, description, headline, glyph, themeIds, suggestedRecipients, keywords]) =>
    make({
      id, name, description, headline, themeIds, suggestedRecipients, keywords, category: 'custom', ...none,
      region: ['VN', 'international'], cover: { glyph, theme: themeIds[0] },
      featured: id === 'thank-you' || id === 'graduation',
    }),
  ),
];
