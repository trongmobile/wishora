import test from 'node:test';
import assert from 'node:assert/strict';
import { planRun, acceptMessages, renderAutoFile, messagePrompt, captionTarget, prBody, LIMITS } from '../tools/marketing/seo-lib.mjs';
import { mergeMessages } from '../js/data/messages.js';

const occ = (id, messageTemplates, suggestedRecipients = ['friend', 'family']) => ({
  id, name: id, slug: id, tone: 'festive', description: 'Mô tả', suggestedRecipients, messageTemplates,
});
const at = (occasion, days) => ({ occasion, next: { date: '2026-11-01', days } });
const msgs = (n, tag) => Array.from({ length: n }, (_, i) => `Lời chúc ${tag} số ${i} thật dài cho đủ độ dài tối thiểu nhé`);

test('planRun: chỉ chọn dịp còn 5–45 ngày, ưu tiên dịp có người nhận thiếu lời chúc, giới hạn số lượng', () => {
  const full = occ('full', { default: msgs(2, 'a'), friend: msgs(2, 'b'), family: msgs(2, 'c') }); // còn thiếu nhưng không có chỗ trống
  const gap = occ('gap', { default: msgs(2, 'd') }); // friend, family chưa có lời chúc nào
  const plan = planRun([at(full, 10), at(gap, 30), at(occ('soon', {}), 3), at(occ('far', {}), 60)]);
  assert.deepEqual(plan.map((p) => p.occasion.id), ['gap', 'full']);
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
