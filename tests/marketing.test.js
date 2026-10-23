import test from 'node:test';
import assert from 'node:assert/strict';
import { planRun, acceptMessages, renderAutoFile, messagePrompt, captionTarget, prBody, LIMITS } from '../tools/marketing/seo-lib.mjs';
import { mergeMessages } from '../js/data/messages.js';

const occ = (id, messageTemplates, suggestedRecipients = ['friend', 'family']) => ({
  id, name: id, slug: id, tone: 'festive', description: 'Mô tả', suggestedRecipients, messageTemplates,
});
const at = (occasion, days) => ({ occasion, next: { date: '2026-11-01', days } });
const msgs = (n, tag) => Array.from({ length: n }, (_, i) => `Lời chúc ${tag} số ${i} thật dài cho đủ độ dài tối thiểu nhé`);

test('planRun: chỉ chọn dịp còn 5–90 ngày, dịp trong 45 ngày làm trước (người nhận thiếu lời chúc trước), giới hạn số lượng', () => {
  const full = occ('full', { default: msgs(2, 'a'), friend: msgs(2, 'b'), family: msgs(2, 'c') }); // còn thiếu nhưng không có chỗ trống
  const gap = occ('gap', { default: msgs(2, 'd') }); // friend, family chưa có lời chúc nào
  // 'far' (60 ngày) trống hoàn toàn nhưng vẫn xếp sau mọi dịp trong 45 ngày; 'toofar' (100 ngày) và 'soon' (3 ngày) bị loại.
  const plan = planRun([at(occ('far', {}), 60), at(full, 10), at(gap, 30), at(occ('soon', {}), 3), at(occ('toofar', {}), 100)]);
  assert.deepEqual(plan.map((p) => p.occasion.id), ['gap', 'full', 'far']);
  assert.deepEqual(plan[0].wants.map((w) => [w.relation, w.want]), [['friend', 3], ['family', 3], ['default', 2]]); // ít lời chúc nhất trước
  assert.ok(plan.every((p) => p.wants.reduce((s, w) => s + w.want, 0) <= LIMITS.perOccasion));

  const capped = planRun([at(full, 10), at(gap, 30)], { ...LIMITS, total: 10 });
  assert.equal(capped.flatMap((p) => p.wants).reduce((s, w) => s + w.want, 0), 10);

  const done = occ('done', { default: msgs(6, 'e'), friend: msgs(5, 'f'), family: msgs(5, 'g') });
  assert.deepEqual(planRun([at(done, 10)]), [], 'đủ lời chúc thì không thêm nữa');
});

test('acceptMessages: loại lời chúc sai quy tắc, trùng, sai người nhận; không nhận quá số cần', () => {
  const existing = 'Chúc bạn một ngày thật vui vẻ và tràn đầy năng lượng tích cực nhé!';
  const plan = { occasion: occ('x', { default: [existing] }), wants: [{ relation: 'friend', want: 2 }] };
  const good = ['Chúc bạn hiền Halloween thật vui, hóa trang thật ngầu và nhận được thật nhiều kẹo ngọt nhé!',
    'Đêm nay đừng sợ ma nhé, vì con ma đáng sợ nhất là deadline sáng mai. Halloween vui vẻ!',
    'Thêm một lời chúc hợp lệ nữa nhưng đã đủ số lượng cần nên sẽ bị bỏ qua thôi bạn ơi.'];
  const { accepted, rejected } = acceptMessages([
    { relation: 'friend', message: `  ${good[0]}\n` },
    { relation: 'friend', message: existing.toUpperCase() },
    { relation: 'friend', message: 'Halloween vui vẻ nhé bạn ơi, nhiều kẹo thật nhiều kẹo nha 🎃🎃🎃' },
    { relation: 'friend', message: 'Tạo thiệp Halloween trên Wishora để gửi bạn bè thật vui nhé bạn ơi!' },
    { relation: 'friend', message: 'Happy Halloween to you and your family, have a spooky fun night!' },
    { relation: 'boss', message: good[1] },
    { relation: 'friend', message: 'Vui nhé!' },
    { relation: 'friend', message: good[1] },
    { relation: 'friend', message: good[2] },
  ], plan);
  assert.deepEqual(accepted, { friend: [good[0], good[1]] });
  assert.deepEqual(rejected.map((r) => r.reason), [
    'trùng lời chúc đã có', 'có emoji', 'nhắc tên Wishora', 'không phải tiếng Việt có dấu', 'người nhận không có trong kế hoạch', 'dài 8 ký tự (cần 40–300)',
  ]);
  assert.deepEqual(acceptMessages('không phải mảng', plan), { accepted: {}, rejected: [] });
});

test('renderAutoFile giữ chú thích đầu file và sinh module import được', async () => {
  const source = '/** chú thích */\nexport const AUTO_MESSAGES = {};\n';
  const auto = { halloween: { family: ['Chúc cả nhà một đêm Halloween thật vui, cùng nhau khắc bí ngô nhé!'] } };
  const out = renderAutoFile(source, auto);
  assert.ok(out.startsWith('/** chú thích */\n'));
  const mod = await import(`data:text/javascript;base64,${Buffer.from(out).toString('base64')}`);
  assert.deepEqual(mod.AUTO_MESSAGES, auto);
  assert.throws(() => renderAutoFile('export const X = {};', auto));
});

test('mergeMessages nối lời chúc tự sinh sau lời chúc viết tay, không sửa dữ liệu gốc', () => {
  const base = { a: { default: ['1'], friend: ['2'] } };
  const extra = { a: { friend: ['3'], family: ['4'] }, b: { default: ['5'] } };
  assert.deepEqual(mergeMessages(base, extra), { a: { default: ['1'], friend: ['2', '3'], family: ['4'] }, b: { default: ['5'] } });
  assert.deepEqual(base, { a: { default: ['1'], friend: ['2'] } });
});

test('prompt, caption và nội dung PR', () => {
  const p = { ...at(occ('x', { default: ['Lời chúc cũ'] }), 12), wants: [{ relation: 'family', count: 0, want: 2 }] };
  const prompt = messagePrompt(p, '- quy tắc A');
  assert.ok(prompt.includes('- quy tắc A') && prompt.includes('- Lời chúc cũ') && prompt.includes('family (Gia đình): 3 lời chúc'));

  assert.equal(captionTarget([at(occ('a', {}), 1), at(occ('b', {}), 5), at(occ('c', {}), 8)]).occasion.id, 'b');
  assert.equal(captionTarget([at(occ('a', {}), 20)]), null);

  const body = prBody({
    model: 'gemini-test', site: 'https://example.com/', stats: 'Chưa có số liệu: thiếu token',
    results: [{ ...p, accepted: { family: ['Lời chúc mới cho gia đình'] }, rejected: [{ message: 'xấu', reason: 'có emoji' }] }],
    caption: { ...at(occ('b', {}), 5), long: 'Bài dài', short: 'Bài ngắn' },
  });
  for (const s of ['1 lời chúc mẫu mới', '- Lời chúc mới cho gia đình', 'https://example.com/o/x/', 'Tự động loại 1', 'thiếu token', 'Bài dài', 'Bài ngắn']) {
    assert.ok(body.includes(s), s);
  }
});

// ---- Theme tự sinh ----
import { pickThemeTarget, acceptTheme, renderThemeCss, insertThemeCss, renderThemesFile, themeSection, CSS_START, CSS_END, contrast } from '../tools/marketing/theme-lib.mjs';

const themeRaw = (over = {}) => ({
  name: 'Pumpkin Lantern', description: 'Cam bí ngô trên nền tím than, ấm và hơi huyền bí.', sample: 'Đêm Hội Ma Quái',
  bgTop: '#2a1245', bgBottom: '#150826', ink: '#fff1dc', accent: '#ff7a18', accentSoft: '#ffb066',
  font: 'Playfair Display', intro: 'gift', seal: '🎃', emoji: '🎃', divider: '✦',
  decor: ['🎃', '🦇', '🕸️'], ambientChars: ['🎃', '🦇', '✨'], ambientCount: 14, ambientMotion: 'drift',
  confettiColors: ['#ff7a18', '#8a3ffc', '#ffd166'], confettiChars: ['🎃'], confettiRatio: 0.3, ...over,
});
const hOcc = { ...occ('halloween', {}), category: 'international', enabled: true, themeIds: ['a', 'b', 'c'] };

test('pickThemeTarget: dịp 5–90 ngày có ít theme nhất, dịp trong 45 ngày được xét trước, bỏ dịp đã đủ theme', () => {
  const few = { ...hOcc, id: 'few', themeIds: ['a', 'b'] };
  const full = { ...hOcc, id: 'full', themeIds: ['a', 'b', 'c', 'd', 'e', 'f'] };
  assert.equal(pickThemeTarget([at(hOcc, 10), at(few, 30), at(full, 6), at({ ...few, id: 'soon' }, 3)]).occasion.id, 'few');
  assert.equal(pickThemeTarget([at(full, 6)]), null);
  const fewer = { ...hOcc, id: 'fewer', themeIds: ['a'] };
  assert.equal(pickThemeTarget([at(fewer, 70), at(hOcc, 10)]).occasion.id, 'halloween', 'dịp gần trước dù dịp xa có ít theme hơn');
  assert.equal(pickThemeTarget([at(fewer, 70)]).occasion.id, 'fewer', 'không có dịp gần thì làm dịp xa');
  assert.equal(pickThemeTarget([at(fewer, 100)]), null, 'quá 90 ngày thì chưa làm');
});

test('acceptTheme: nhận theme hợp lệ và sinh CSS đủ biến; dịp trang trọng không confetti', () => {
  const { theme } = acceptTheme(themeRaw(), { occasion: hOcc }, []);
  assert.equal(theme.id, 'pumpkin-lantern');
  assert.equal(theme.group, 'intl');
  assert.equal(theme.occasionId, 'halloween');
  assert.deepEqual(theme.confetti.chars, ['🎃']);
  const css = renderThemeCss(theme);
  for (const v of ['--bg', '--ink', '--panel-bg', '--font-display', '--btn-bg', '--gift-1', '--env-1', '--emoji']) assert.ok(css.includes(v), v);
  assert.ok(css.includes('[data-theme="pumpkin-lantern"] {'));
  const solemn = acceptTheme(themeRaw(), { occasion: { ...hOcc, tone: 'solemn' } }, []).theme;
  assert.equal(solemn.confetti, null);
  assert.equal(solemn.ambient.motion, 'drift');
});

test('acceptTheme: loại theme chữ khó đọc, màu/emoji/font sai, tên trùng', () => {
  const reason = (over, existing = []) => acceptTheme(themeRaw(over), { occasion: hOcc }, existing).reason;
  assert.match(reason({ ink: '#3a2a55' }), /khó đọc/);
  assert.match(reason({ accent: 'orange' }), /#rrggbb/);
  assert.match(reason({ ambientChars: ['abc', '🎃', '🦇'] }), /emoji/);
  assert.match(reason({ font: 'Comic Sans' }), /danh sách/);
  assert.match(reason({ name: 'Pumpkin "Lantern"' }), /ký tự không cho phép/);
  assert.match(reason({ description: 'Orange pumpkins on a dark purple background.' }), /tiếng Việt/);
  assert.match(reason({}, [{ id: 'pumpkin-lantern', name: 'X' }]), /trùng/);
  assert.match(acceptTheme(null, { occasion: hOcc }, []).reason, /độ dài/);
  assert.ok(contrast('#000000', '#ffffff') > 20);
});

test('insertThemeCss / renderThemesFile: ghi giữa dấu, không chèn hai lần, bỏ tham số css', () => {
  const { theme } = acceptTheme(themeRaw(), { occasion: hOcc }, []);
  const source = `a {}\n${CSS_START}\n${CSS_END}\nb {}\n`;
  const once = insertThemeCss(source, [theme]);
  assert.ok(once.indexOf('[data-theme="pumpkin-lantern"] {') > once.indexOf(CSS_START));
  assert.ok(once.indexOf('[data-theme="pumpkin-lantern"] {') < once.indexOf(CSS_END));
  assert.equal(insertThemeCss(once, [theme]), once);
  assert.throws(() => insertThemeCss('không có dấu', [theme]));
  const file = renderThemesFile('// chú thích\nexport const AUTO_THEMES = [];\n', [theme]);
  assert.ok(file.startsWith('// chú thích\n'));
  assert.ok(!file.includes('"css"') && file.includes('"occasionId": "halloween"'));
});

test('prBody có mục Theme mới khi có theme', () => {
  const { theme } = acceptTheme(themeRaw(), { occasion: hOcc }, []);
  const md = themeSection({ occasion: hOcc, next: { date: '2026-10-31', days: 10 }, theme }, 'https://x.vn/');
  assert.ok(md.includes('Pumpkin Lantern') && md.includes('https://x.vn/?page=create&occasion=halloween&theme=pumpkin-lantern') && md.includes('localhost:8000'));
  const body = prBody({ model: 'm', site: 'https://x.vn/', results: [], stats: 's', caption: null, themeMd: md });
  assert.ok(body.includes('## Theme mới'));
  assert.ok(!prBody({ model: 'm', site: 's', results: [], stats: 's', caption: null }).includes('## Theme mới'));
  assert.match(themeSection({ occasion: hOcc, next: { date: '2026-10-31', days: 10 }, reason: 'x' }, 's'), /bị loại: x/);
});
