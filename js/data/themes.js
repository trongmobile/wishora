/**
 * Cấu hình theme (phần JS). Phần giao diện tương ứng nằm ở css/themes.css
 * trong khối [data-theme="<id>"]. Thêm theme mới: xem README.
 *
 * group   : nhóm theme (birthday | tet | women | love | vietnam | intl | general) — dùng cho bộ sưu tập
 * seal    : ký tự trên con dấu phong bì (mặc định ♥)
 * decor   : [góc trên-trái, góc dưới-phải, huy hiệu trên khung chữ] — ký tự trang trí tĩnh
 * confetti: null = không bắn confetti (dành cho dịp trang trọng)
 * reducedMotion.staticAmbient: khi tắt hiệu ứng / giảm chuyển động vẫn hiện hạt trang trí đứng yên
 * sample  : chữ hiển thị trong ảnh thu nhỏ
 * intro   : 'gift' | 'envelope'  — vật thể ở màn hình mở đầu
 * ambient : hạt trang trí nền  (motion: rise | fall | twinkle | drift)
 * confetti: màu + ký tự dùng cho confetti khi mở thiệp
 */
const BIRTHDAY_THEMES = [
  {
    id: 'rose',
    name: 'Rose Romance',
    description: 'Hồng pastel, hoa hồng, trái tim và ánh sáng dịu dàng.',
    colors: ['#ffb8cd', '#d62f5c', '#fff5f8'],
    intro: 'envelope',
    ambient: { chars: ['🌹', '💗', '🌸', '✨'], count: 16, motion: 'rise' },
    confetti: { colors: ['#ff7aa2', '#ffc2d4', '#d62f5c', '#fff'], chars: ['💗', '🌹', '🌸'], charRatio: 0.35 },
  },
  {
    id: 'galaxy',
    name: 'Midnight Galaxy',
    description: 'Nền xanh đêm, sao lấp lánh và ánh sáng vũ trụ.',
    colors: ['#0b1030', '#7c6cff', '#7dd3fc'],
    intro: 'gift',
    ambient: { chars: ['✦', '✧', '⋆', '★', '·'], count: 34, motion: 'twinkle' },
    confetti: { colors: ['#7dd3fc', '#c4b5fd', '#f0abfc', '#fde68a'], chars: ['✦', '★'], charRatio: 0.4 },
  },
  {
    id: 'candy',
    name: 'Candy Party',
    description: 'Màu sắc rực rỡ, bóng bay và confetti vui nhộn.',
    colors: ['#ffd23f', '#ff3d81', '#2ec4ff'],
    intro: 'gift',
    ambient: { chars: ['🎈', '🎈', '🍭', '🍬', '⭐'], count: 14, motion: 'rise' },
    confetti: { colors: ['#ff3d81', '#ffd23f', '#2ec4ff', '#7bd957', '#a36bff'], chars: ['🎉', '⭐'], charRatio: 0.12 },
  },
  {
    id: 'gold',
    name: 'Elegant Gold',
    description: 'Đen và vàng gold sang trọng, pháo sáng tinh tế.',
    colors: ['#0d0b08', '#d4af37', '#f6e7b4'],
    intro: 'gift',
    ambient: { chars: ['✦', '✧', '·', '✨'], count: 24, motion: 'twinkle' },
    confetti: { colors: ['#d4af37', '#f6e7b4', '#b8902b', '#fff6d6'], chars: [], charRatio: 0 },
  },
  {
    id: 'pastel',
    name: 'Cute Pastel',
    description: 'Lavender và mint, mây bồng bềnh cùng hình minh họa dễ thương.',
    colors: ['#d9ccff', '#a7ecd5', '#fff'],
    intro: 'envelope',
    ambient: { chars: ['☁️', '⭐', '🌈', '🧸', '💜', '🍬'], count: 12, motion: 'drift' },
    confetti: { colors: ['#c9b6ff', '#a7ecd5', '#ffd6e8', '#fff3a8'], chars: ['⭐', '💜'], charRatio: 0.2 },
  },
  {
    id: 'floral',
    name: 'Floral Garden',
    description: 'Hoa lá xanh mát, những cánh hoa nở nhẹ nhàng.',
    colors: ['#cfe8c8', '#3f7d4e', '#ffe3ea'],
    intro: 'envelope',
    ambient: { chars: ['🌸', '🌼', '🍃', '🌿', '🌷'], count: 16, motion: 'fall' },
    confetti: { colors: ['#8fc58a', '#ffb3c6', '#fff3b0', '#3f7d4e'], chars: ['🌸', '🍃'], charRatio: 0.5 },
  },
].map((t) => ({ group: 'birthday', sample: 'Happy Birthday', ...t }));

const NONE = null;
const rm = { staticAmbient: true };
const g = (group, id, name, description, colors, intro, extra) => ({
  id, name, description, colors, intro, group, reducedMotion: rm, seal: '♥', ...extra,
});
const amb = (chars, count, motion) => ({ chars, count, motion });
const cf = (colors, chars = [], charRatio = 0) => ({ colors, chars, charRatio });

const GREETING_THEMES = [
  // ---- Tết & năm mới ----
  g('tet', 'tet-traditional', 'Traditional Tet', 'Đỏ và vàng truyền thống, hoa mai, hoa đào và lì xì.', ['#b3122a', '#f5c542', '#fff3d6'], 'envelope', {
    seal: '❀', sample: 'Chúc Mừng Năm Mới', decor: ['🏮', '🌸', '🌼'],
    ambient: amb(['🌼', '🌸', '🌼', '✨'], 16, 'fall'), confetti: cf(['#d4202f', '#f5c542', '#fff3d6'], ['🌼', '🌸'], 0.35),
  }),
  g('tet', 'golden-prosperity', 'Golden Prosperity', 'Vàng kim sang trọng, ánh sáng lấp lánh của sự thịnh vượng.', ['#1a1206', '#e8b923', '#fff1b8'], 'gift', {
    sample: 'Vạn Sự Như Ý', seal: '✦', decor: ['✨', '✨', '✦'],
    ambient: amb(['✦', '✧', '✨', '·'], 26, 'twinkle'), confetti: cf(['#e8b923', '#fff1b8', '#c99a12', '#fff'], [], 0),
  }),
  g('tet', 'spring-blossom', 'Spring Blossom', 'Hoa xuân pastel, cánh hoa nhẹ nhàng bay trong gió.', ['#ffd9e4', '#8fcf9d', '#fffaf3'], 'envelope', {
    sample: 'Xuân An Khang', seal: '❀', decor: ['🌸', '🌿', '🌸'],
    ambient: amb(['🌸', '🌷', '🍃', '🌼'], 18, 'fall'), confetti: cf(['#ffb3c6', '#fff3b0', '#a8dba8', '#fff'], ['🌸', '🍃'], 0.5),
  }),
  g('tet', 'modern-lunar', 'Modern Lunar New Year', 'Tết tối giản, hiện đại với mảng đỏ và nhiều khoảng trắng.', ['#fbf7f2', '#c8202f', '#2a1a1a'], 'gift', {
    sample: 'Chúc Mừng Năm Mới', seal: '❀', decor: ['🌼', '', '🌼'],
    ambient: amb(['·', '✦'], 8, 'drift'), confetti: cf(['#c8202f', '#2a1a1a', '#e8d9c8'], [], 0),
  }),

  // ---- Ngày dành cho phụ nữ ----
  g('women', 'elegant-pink', 'Elegant Pink', 'Hồng thanh lịch, nhẹ nhàng và trân trọng.', ['#ffc9da', '#c2185b', '#fff5f8'], 'envelope', {
    sample: 'Gửi Người Phụ Nữ Tuyệt Vời', decor: ['🌸', '🌷', '🌸'],
    ambient: amb(['🌸', '💗', '✨'], 14, 'rise'), confetti: cf(['#ff9fbd', '#ffd1e0', '#c2185b', '#fff'], ['🌸', '💗'], 0.3),
  }),
  g('women', 'floral-garden', 'Floral Garden', 'Khu vườn hoa xanh mát, tươi tắn và dịu dàng.', ['#d8efd2', '#3f7d4e', '#fff0f4'], 'envelope', {
    sample: 'Hoa Tặng Người Thương', seal: '❀', decor: ['🌷', '🌿', '🌼'],
    ambient: amb(['🌷', '🌿', '🌼', '🌸'], 16, 'fall'), confetti: cf(['#8fc58a', '#ffb3c6', '#fff3b0', '#3f7d4e'], ['🌸', '🍃'], 0.5),
  }),
  g('women', 'soft-lavender', 'Soft Lavender', 'Tím lavender mềm mại, mơ màng như buổi chiều êm.', ['#e3d8ff', '#7e57c2', '#faf7ff'], 'envelope', {
    sample: 'Dịu Dàng Như Hoa', decor: ['💜', '🌸', '💜'],
    ambient: amb(['💜', '🌸', '✨', '☁️'], 12, 'drift'), confetti: cf(['#c9b6ff', '#e8defa', '#7e57c2', '#fff'], ['💜'], 0.2),
  }),
  g('women', 'blooming-flowers', 'Blooming Flowers', 'Bó hoa rực rỡ, tràn đầy sức sống.', ['#ffb199', '#e8456b', '#fff4e6'], 'gift', {
    sample: 'Rạng Rỡ Như Hoa', decor: ['🌺', '🌻', '💐'],
    ambient: amb(['🌺', '🌻', '🌷', '🌹'], 14, 'rise'), confetti: cf(['#ff6f91', '#ffb199', '#ffd166', '#fff'], ['🌺', '🌷'], 0.4),
  }),
  g('women', 'minimalist-appreciation', 'Minimalist Appreciation', 'Tối giản tinh tế, lời cảm ơn chân thành.', ['#faf6f4', '#d98a99', '#3a2e30'], 'envelope', {
    sample: 'Trân Trọng Bạn', seal: '✦', decor: ['', '', '✦'],
    ambient: amb(['·', '✦'], 8, 'twinkle'), confetti: NONE,
  }),

  // ---- Tình yêu & tình bạn ----
  g('love', 'romantic-rose', 'Romantic Rose', 'Hoa hồng đỏ thắm và những trái tim lãng mạn.', ['#7a0f2b', '#e0285a', '#ffe3ea'], 'envelope', {
    sample: 'Yêu Em / Yêu Anh', decor: ['🌹', '🌹', '❤️'],
    ambient: amb(['🌹', '❤️', '✨', '💗'], 16, 'rise'), confetti: cf(['#e0285a', '#ff7a9c', '#ffd1dc', '#fff'], ['❤️', '🌹'], 0.4),
  }),
  g('love', 'love-letter', 'Love Letter', 'Lá thư tình trên giấy cổ điển, nét chữ viết tay.', ['#f4e4c8', '#a4343a', '#5b3a29'], 'envelope', {
    sample: 'Thư Tình', decor: ['💌', '🕯️', '💌'],
    ambient: amb(['💌', '♥', '✉️'], 10, 'drift'), confetti: cf(['#a4343a', '#e8c9a0', '#fff'], ['♥'], 0.3),
  }),
  g('love', 'pastel-hearts', 'Pastel Hearts', 'Trái tim pastel ngọt ngào và đáng yêu.', ['#ffd1e8', '#a5c8ff', '#fff'], 'gift', {
    sample: 'Thương Thương', decor: ['💗', '💙', '💖'],
    ambient: amb(['💗', '💙', '💜', '💛'], 16, 'rise'), confetti: cf(['#ff9fc9', '#a5c8ff', '#d9c4ff', '#fff3a8'], ['💗', '💙'], 0.4),
  }),
  g('love', 'dreamy-night', 'Dreamy Night', 'Bầu trời đêm mơ màng với trăng và sao.', ['#1b1646', '#8a7cff', '#ffd6f0'], 'gift', {
    sample: 'Đêm Mộng Mơ', decor: ['🌙', '⭐', '✨'],
    ambient: amb(['⭐', '🌙', '✨', '💫'], 24, 'twinkle'), confetti: cf(['#c4b5fd', '#f0abfc', '#fde68a', '#fff'], ['⭐', '💫'], 0.35),
  }),
  g('love', 'friendship-memories', 'Friendship Memories', 'Ấm áp như những tấm ảnh kỷ niệm của hai đứa.', ['#ffe8c2', '#e8923a', '#fff8ec'], 'gift', {
    sample: 'Bạn Bè Mãi Mãi', seal: '★', decor: ['📸', '🌟', '💛'],
    ambient: amb(['💛', '🌟', '📸', '☀️'], 12, 'drift'), confetti: cf(['#ffb347', '#ffd166', '#7bd3c4', '#fff'], ['🌟', '💛'], 0.3),
  }),

  // ---- Ngày lễ Việt Nam (trang trọng, không confetti) ----
  g('vietnam', 'vietnamese-heritage', 'Vietnamese Heritage', 'Đỏ trầm và vàng đồng, đậm bản sắc văn hóa Việt.', ['#8f1d21', '#d9a441', '#fdf3dc'], 'envelope', {
    seal: '★', sample: 'Tự Hào Việt Nam', decor: ['', '', '★'],
    ambient: amb(['✦', '·', '🌾'], 10, 'drift'), confetti: NONE,
  }),
  g('vietnam', 'gratitude-respect', 'Gratitude & Respect', 'Xanh navy và kem ấm, lời tri ân đầy kính trọng.', ['#1f2a44', '#c9a76a', '#f7f0e2'], 'envelope', {
    seal: '✦', sample: 'Tri Ân Và Kính Trọng', decor: ['', '', '✦'],
    ambient: amb(['·', '✦'], 8, 'drift'), confetti: NONE,
  }),
  g('vietnam', 'professional-appreciation', 'Professional Appreciation', 'Xanh ngọc điềm tĩnh, ghi nhận những người làm nghề.', ['#0f4c5c', '#5fb8a8', '#f1faf8'], 'envelope', {
    seal: '✦', sample: 'Tôn Vinh Nghề Nghiệp', decor: ['', '', '✦'],
    ambient: amb(['✦', '·'], 8, 'drift'), confetti: NONE,
  }),
  g('vietnam', 'education-knowledge', 'Education & Knowledge', 'Giấy sách và xanh mực, tri thức và biết ơn.', ['#243b6b', '#e0b84c', '#f8f3e6'], 'envelope', {
    seal: '✎', sample: 'Tôn Sư Trọng Đạo', decor: ['📚', '🎓', '✎'],
    ambient: amb(['✦', '📖', '✎'], 10, 'drift'), confetti: NONE,
  }),

  // ---- Lễ hội quốc tế ----
  g('intl', 'christmas-wonderland', 'Christmas Wonderland', 'Tuyết rơi, cây thông và ánh đèn lấp lánh.', ['#0f5132', '#c0392b', '#fff3d6'], 'gift', {
    sample: 'Merry Christmas', decor: ['🎄', '🎁', '⭐'],
    ambient: amb(['❄️', '✨', '⭐', '🎄'], 22, 'fall'), confetti: cf(['#c0392b', '#2e8b57', '#f5c542', '#fff'], ['❄️', '⭐'], 0.3),
  }),
  g('intl', 'snowy-night', 'Snowy Night', 'Đêm đông xanh thẳm, tuyết trắng yên bình.', ['#0b1f3f', '#9ad1ff', '#f1f8ff'], 'gift', {
    sample: 'Đêm Đông Ấm Áp', decor: ['☃️', '🌲', '❄️'],
    ambient: amb(['❄️', '❅', '✦'], 26, 'fall'), confetti: cf(['#9ad1ff', '#dff1ff', '#fff'], ['❄️'], 0.5),
  }),
  g('intl', 'halloween-magic', 'Halloween Magic', 'Tím và cam huyền bí, bí ngô cùng dơi bay.', ['#2a1245', '#ff7a18', '#ffe3b3'], 'gift', {
    sample: 'Happy Halloween', decor: ['🎃', '🦇', '👻'],
    ambient: amb(['🎃', '🦇', '👻', '✨'], 14, 'drift'), confetti: cf(['#ff7a18', '#8a3ffc', '#ffd166'], ['🎃', '🦇'], 0.3),
  }),
  g('intl', 'earth-nature', 'Earth & Nature', 'Xanh lá và xanh biển, thiên nhiên trong lành.', ['#d7f0dd', '#2e7d5b', '#e6f4ff'], 'envelope', {
    seal: '♻', sample: 'Hành Tinh Xanh', decor: ['🌍', '🌱', '🦋'],
    ambient: amb(['🍃', '🌿', '🌍', '🦋'], 14, 'drift'), confetti: cf(['#6cc08b', '#4aa3df', '#fff3b0'], ['🍃'], 0.4),
  }),
  g('intl', 'colorful-celebration', 'Colorful Celebration', 'Rực rỡ sắc màu, bóng bay và pháo giấy.', ['#ffd23f', '#ff3d81', '#2ec4ff'], 'gift', {
    sample: 'Cùng Ăn Mừng', decor: ['🎈', '🎉', '🎊'],
    ambient: amb(['🎈', '🎉', '🎊', '⭐'], 14, 'rise'), confetti: cf(['#ff3d81', '#ffd23f', '#2ec4ff', '#7bd957', '#a36bff'], ['🎉', '⭐'], 0.12),
  }),
  g('intl', 'cozy-autumn', 'Cozy Autumn', 'Lá thu vàng cam, ấm áp như tách trà chiều.', ['#f4c78a', '#b3541e', '#fff1dd'], 'envelope', {
    seal: '🍁', sample: 'Mùa Thu Ấm Áp', decor: ['🍁', '🍂', '🍂'],
    ambient: amb(['🍂', '🍁', '🍃', '🌰'], 16, 'fall'), confetti: cf(['#e8923a', '#b3541e', '#f4c78a', '#fff'], ['🍂', '🍁'], 0.5),
  }),

  // ---- Theme tổng quát (dịp cá nhân hóa, gia đình) ----
  g('general', 'classic-elegance', 'Classic Elegance', 'Kem ngà và xanh đêm, cổ điển và lịch lãm.', ['#f7f1e6', '#1f2a44', '#b8902b'], 'envelope', {
    seal: '✦', sample: 'Lời Chúc Gửi Bạn', decor: ['', '', '✦'],
    ambient: amb(['✦', '·'], 10, 'twinkle'), confetti: cf(['#b8902b', '#1f2a44', '#f1e3bd'], [], 0),
  }),
  g('general', 'sunny-bright', 'Sunny Bright', 'Vàng cam tươi sáng, tràn đầy năng lượng.', ['#ffe27a', '#ff8a3d', '#fffbe6'], 'gift', {
    sample: 'Chúc Mừng Bạn', decor: ['☀️', '🌼', '⭐'],
    ambient: amb(['☀️', '🌼', '⭐', '✨'], 14, 'rise'), confetti: cf(['#ff8a3d', '#ffd23f', '#fff', '#ff5d73'], ['⭐'], 0.15),
  }),
  g('general', 'calm-sky', 'Calm Sky', 'Xanh da trời và mây trắng, nhẹ nhõm và bình yên.', ['#cfe8ff', '#4a90d9', '#f6fbff'], 'envelope', {
    sample: 'Bình An Nhé', decor: ['☁️', '🕊️', '☁️'],
    ambient: amb(['☁️', '✨', '🕊️'], 10, 'drift'), confetti: cf(['#4a90d9', '#cfe8ff', '#fff'], ['☁️'], 0.15),
  }),
  g('general', 'family-warmth', 'Family Warmth', 'Cam đào ấm áp như bữa cơm gia đình.', ['#ffd9bf', '#d9693a', '#fff6ec'], 'envelope', {
    sample: 'Yêu Thương Gia Đình', decor: ['🏡', '🌻', '💛'],
    ambient: amb(['💛', '🌻', '✨', '🍃'], 12, 'drift'), confetti: cf(['#ff9f6b', '#ffd166', '#ffb3c6', '#fff'], ['💛', '🌻'], 0.3),
  }),
  g('general', 'fresh-mint', 'Fresh Mint', 'Xanh bạc hà thanh mát, nhẹ nhàng và chân thành.', ['#cdf2e4', '#2f9e82', '#f4fffb'], 'gift', {
    sample: 'Gửi Đến Bạn', decor: ['🌱', '🍃', '✨'],
    ambient: amb(['🍃', '🌱', '✨'], 12, 'fall'), confetti: cf(['#2f9e82', '#a7ecd5', '#fff'], ['🍃'], 0.3),
  }),
];

export const THEMES = [...BIRTHDAY_THEMES, ...GREETING_THEMES];
export const BIRTHDAY_THEME_IDS = BIRTHDAY_THEMES.map((t) => t.id);

export const THEME_GROUPS = Object.freeze({
  birthday: 'Sinh nhật',
  tet: 'Tết & năm mới',
  women: 'Ngày của phụ nữ',
  love: 'Tình yêu & tình bạn',
  vietnam: 'Ngày lễ Việt Nam',
  intl: 'Lễ hội quốc tế',
  general: 'Tổng quát',
});

export const DEFAULT_THEME = BIRTHDAY_THEMES[0].id;
export const THEME_IDS = THEMES.map((t) => t.id);

export const isThemeId = (id) => THEME_IDS.includes(id);
export const getTheme = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0];
export const themesByGroup = (group) => THEMES.filter((t) => t.group === group);
