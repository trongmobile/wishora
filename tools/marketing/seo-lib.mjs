/**
 * Phần thuần (không gọi mạng, không ghi file) của workflow SEO hằng tuần: chọn dịp, dựng prompt cho Gemini,
 * lọc lời chúc trả về, sinh lại js/data/messages-auto.js và nội dung PR. CLI: tools/marketing/weekly-seo.mjs.
 */
import { RELATIONS } from '../../js/data/messages.js';
import { normalize } from '../../js/occasion-engine.js';
import { formatDate } from '../../js/calendar.js';

export const LIMITS = Object.freeze({
  minDays: 5, // dịp còn ít ngày hơn thì Google không kịp lập chỉ mục
  maxDays: 45,
  occasions: 3, // số dịp mỗi lần chạy
  perRelation: 3, // số lời chúc thêm tối đa cho một người nhận mỗi lần
  perOccasion: 8,
  total: 20, // cả lần chạy, để chủ site duyệt kịp
  target: 5, // người nhận đã có chừng này lời chúc thì thôi thêm
  targetDefault: 6, // riêng nhóm "default"
});

export const relationLabel = (r) => (r === 'default' ? 'Chung (không chọn người nhận)' : RELATIONS[r]);

/** Số lời chúc cần thêm cho từng người nhận của một dịp; người nhận đang có ít lời chúc nhất đứng trước. */
export function wantsFor(occasion, limits = LIMITS) {
  return ['default', ...occasion.suggestedRecipients]
    .map((relation) => {
      const count = occasion.messageTemplates[relation]?.length ?? 0;
      const target = relation === 'default' ? limits.targetDefault : limits.target;
      return { relation, count, want: Math.min(limits.perRelation, target - count) };
    })
    .filter((w) => w.want > 0)
    .sort((a, b) => a.count - b.count);
}

/**
 * Chọn dịp cho lần chạy từ kết quả upcoming(): dịp còn minDays–maxDays ngày, ưu tiên dịp có người nhận
 * mới có 0–1 lời chúc, rồi tới dịp gần hơn. Trả về [{ occasion, next, wants: [{ relation, count, want }] }].
 */
export function planRun(list, limits = LIMITS) {
  const hasGap = (x) => (x.wants.some((w) => w.count <= 1) ? 1 : 0);
  const candidates = list
    .filter((x) => x.next && x.next.days >= limits.minDays && x.next.days <= limits.maxDays)
    .map((x) => ({ ...x, wants: wantsFor(x.occasion, limits) }))
    .filter((x) => x.wants.length)
    .sort((a, b) => hasGap(b) - hasGap(a) || a.next.days - b.next.days);
  const plan = [];
  let left = limits.total;
  for (const x of candidates) {
    if (plan.length === limits.occasions || left === 0) break;
    let room = Math.min(limits.perOccasion, left);
    const wants = [];
    for (const w of x.wants) {
      if (room === 0) break;
      const want = Math.min(w.want, room);
      wants.push({ ...w, want });
      room -= want;
    }
    left -= wants.reduce((s, w) => s + w.want, 0);
    plan.push({ ...x, wants });
  }
  return plan;
}

/** Prompt nhờ Gemini viết lời chúc cho một dịp. Xin dư một lời cho mỗi người nhận vì acceptMessages có thể loại bớt. */
export function messagePrompt({ occasion, next, wants }, rules) {
  const existing = Object.entries(occasion.messageTemplates)
    .filter(([, list]) => list.length)
    .map(([r, list]) => `${relationLabel(r)} (${r}):\n${list.map((m) => `- ${m}`).join('\n')}`)
    .join('\n\n');
  return [
    'Bạn viết lời chúc mẫu cho Wishora, website tạo thiệp chúc mừng online cho người Việt. Lời chúc mẫu hiện trên trang của dịp; người dùng chọn một lời, sửa lại cho hợp rồi gửi cho người nhận.',
    `## Dịp\n${occasion.name} — ${formatDate(next.date)}\nTông: ${occasion.tone}\nMô tả: ${occasion.description}`,
    `## Quy tắc\n${rules}`,
    `## Lời chúc đã có (không viết trùng ý)\n${existing || '(chưa có)'}`,
    `## Cần viết\n${wants.map((w) => `- ${w.relation} (${relationLabel(w.relation)}): ${w.want + 1} lời chúc`).join('\n')}`,
    'Trả về một mảng JSON, mỗi phần tử là {"relation": "<khóa người nhận ở mục Cần viết>", "message": "<lời chúc>"}.',
  ].join('\n\n');
}

export const messageSchema = (wants) => ({
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { relation: { type: 'STRING', enum: wants.map((w) => w.relation) }, message: { type: 'STRING' } },
    required: ['relation', 'message'],
  },
});

const VIETNAMESE = /[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i;

/** Lý do loại một lời chúc, hoặc null nếu dùng được. `seen`: các lời chúc đã có, đã qua normalize(). */
export function rejectReason(message, seen) {
  if (message.length < 40 || message.length > 300) return `dài ${message.length} ký tự (cần 40–300)`;
  if (/[\u0000-\u001f\u007f]/.test(message)) return 'có ký tự điều khiển';
  if (/\p{Extended_Pictographic}/u.test(message)) return 'có emoji';
  if (/#\S/.test(message)) return 'có hashtag';
  if (/wishora/i.test(message)) return 'nhắc tên Wishora';
  if (!VIETNAMESE.test(message)) return 'không phải tiếng Việt có dấu';
  if (seen.has(normalize(message))) return 'trùng lời chúc đã có';
  return null;
}

/** Lọc lời chúc Gemini trả về theo kế hoạch của dịp: đúng người nhận, không quá số lượng, không trùng. */
export function acceptMessages(items, { occasion, wants }) {
  const seen = new Set(Object.values(occasion.messageTemplates).flat().map(normalize));
  const room = new Map(wants.map((w) => [w.relation, w.want]));
  const accepted = {};
  const rejected = [];
  for (const item of Array.isArray(items) ? items : []) {
    const relation = String(item?.relation ?? '');
    const message = String(item?.message ?? '').replace(/\s+/g, ' ').replace(/^["“'‘]+|["”'’]+$/g, '').trim();
    if (!room.has(relation)) {
      rejected.push({ relation, message, reason: 'người nhận không có trong kế hoạch' });
      continue;
    }
    if (room.get(relation) === 0) continue; // đã đủ — Gemini được xin dư
    const reason = rejectReason(message, seen);
    if (reason) {
      rejected.push({ relation, message, reason });
      continue;
    }
    seen.add(normalize(message));
    (accepted[relation] ??= []).push(message);
    room.set(relation, room.get(relation) - 1);
  }
  return { accepted, rejected };
}

/** Nội dung mới của messages-auto.js: giữ nguyên phần chú thích đầu file, thay đối tượng AUTO_MESSAGES. */
export function renderAutoFile(source, auto) {
  const at = source.indexOf('export const AUTO_MESSAGES');
  if (at < 0) throw new Error('messages-auto.js thiếu "export const AUTO_MESSAGES"');
  return `${source.slice(0, at)}export const AUTO_MESSAGES = ${JSON.stringify(auto, null, 2)};\n`;
}

/** Dịp gần nhất còn 3–10 ngày để đăng tay (wishora-marketing.md: đăng trước dịp 3–5 ngày). `list` đã sắp theo ngày. */
export const captionTarget = (list) => list.find((x) => x.next && x.next.days >= 3 && x.next.days <= 10) ?? null;

export function captionPrompt({ occasion, next }, url, styleGuide) {
  return [
    'Bạn viết bài đăng mạng xã hội giới thiệu Wishora, website tạo thiệp chúc mừng online miễn phí: chọn dịp, nhập tên người nhận, chọn lời chúc gợi ý theo mối quan hệ, rồi gửi thiệp bằng một đường link qua Zalo/Messenger. Người nhận mở link thấy hộp quà hoặc phong bì, bấm mở và xem lời chúc hiện ra cùng hiệu ứng. Không cài app, không đăng ký.',
    `## Dịp\n${occasion.name} — ${formatDate(next.date)} (còn ${next.days} ngày)\nMô tả: ${occasion.description}\nLink tạo thiệp cho dịp này: ${url}`,
    `## Giọng văn mẫu (bài cho một dịp khác: chỉ học giọng văn và độ dài, không chép nội dung)\n${styleGuide}`,
    '## Cần viết\n- "long": bài cho nhóm Facebook, 60–120 từ, mở đầu bằng một câu chạm vào cảm xúc của dịp, vài dòng ✅ lợi ích, kết bằng link ở trên và 3–4 hashtag.\n- "short": bài cho Zalo, 1–2 câu, có link ở trên.\nViết như một người dùng giới thiệu công cụ hữu ích cho bạn bè: không giật tít, không hứa tính năng không có ở trên.',
    'Trả về JSON {"long": "...", "short": "..."}.',
  ].join('\n\n');
}

export const captionSchema = {
  type: 'OBJECT',
  properties: { long: { type: 'STRING' }, short: { type: 'STRING' } },
  required: ['long', 'short'],
};

/**
 * Nội dung PR. results: [{ occasion, next, accepted, rejected }]; stats: markdown số liệu (hoặc lý do không có);
 * caption: { occasion, next, long, short } | { occasion, next, error } | null.
 */
export function prBody({ model, site, results, stats, caption }) {
  const total = results.reduce((s, r) => s + Object.values(r.accepted).flat().length, 0);
  const out = [
    `Workflow SEO hằng tuần nhờ Gemini (\`${model}\`) viết ${total} lời chúc mẫu mới cho các dịp sắp tới, thêm vào \`js/data/messages-auto.js\`. Lời chúc mẫu hiện trên trang của dịp (nội dung cho Google) và trong gợi ý của form tạo thiệp.`,
    'Đọc từng lời chúc bên dưới. Lời nào chưa ổn thì sửa hoặc xóa trong file đó ngay trên PR, rồi merge.',
    '## Lời chúc mới',
  ];
  for (const r of results) {
    out.push(`### ${r.occasion.name} — ${formatDate(r.next.date)}, còn ${r.next.days} ngày · [trang dịp](${site}o/${r.occasion.slug}/)`);
    const groups = Object.entries(r.accepted);
    for (const [relation, list] of groups) out.push(`**${relationLabel(relation)}**\n${list.map((m) => `- ${m}`).join('\n')}`);
    if (!groups.length) out.push('_Không có lời chúc nào đạt yêu cầu._');
    if (r.rejected.length) {
      out.push(`<details><summary>Tự động loại ${r.rejected.length} lời chúc</summary>\n\n${r.rejected.map((x) => `- (${x.reason}) ${x.message}`).join('\n')}\n</details>`);
    }
  }
  out.push('## Số liệu 7 ngày qua', stats);
  out.push('## Gợi ý đăng tay tuần này');
  if (!caption) out.push('_Không có dịp nào còn 3–10 ngày._');
  else if (caption.error) out.push(`_Không tạo được caption cho ${caption.occasion.name}: ${caption.error}_`);
  else {
    out.push(
      `### ${caption.occasion.name} — còn ${caption.next.days} ngày`,
      `**Nhóm Facebook**\n\n\`\`\`text\n${caption.long}\n\`\`\``,
      `**Zalo**\n\n\`\`\`text\n${caption.short}\n\`\`\``,
    );
  }
  out.push('## Kiểm tra\n\n- [x] `npm run build:pages -- --html`\n- [x] `npm test`');
  return `${out.join('\n\n')}\n`;
}
