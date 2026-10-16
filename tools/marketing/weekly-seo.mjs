/**
 * Bước "viết" của workflow SEO hằng tuần (.github/workflows/weekly-seo.yml): chọn vài dịp sắp tới, nhờ Gemini viết thêm
 * lời chúc mẫu, lọc rồi ghi vào js/data/messages-auto.js, và soạn nội dung PR (lời chúc mới, số liệu GoatCounter,
 * caption đăng tay). Build trang, chạy test và mở PR là các bước sau trong workflow.
 *   node tools/marketing/weekly-seo.mjs --plan                         # chỉ in kế hoạch: không gọi Gemini, không ghi file
 *   GEMINI_API_KEY=... node tools/marketing/weekly-seo.mjs [--pr-body <file>]
 * Model: gemini-3.8-flash, lỗi hạn mức/quá tải thì thử gemini-3.5-flash-lite rồi gemini-2.5-flash; GEMINI_MODEL thêm model ưu tiên. Quy tắc viết lời chúc: tools/marketing/message-rules.md.
 * Không có dịp nào cần thêm, hoặc không lời chúc nào đạt yêu cầu → thoát 0 và không ghi gì (workflow sẽ không mở PR).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { upcoming } from '../../js/occasion-engine.js';
import { mergeMessages } from '../../js/data/messages.js';
import { AUTO_MESSAGES } from '../../js/data/messages-auto.js';
import { siteUrl } from '../pages-lib.mjs';
import {
  planRun, messagePrompt, messageSchema, acceptMessages, renderAutoFile, captionTarget, captionPrompt, captionSchema, prBody,
} from './seo-lib.mjs';

const file = (p) => new URL(`../../${p}`, import.meta.url);
const read = (p) => readFileSync(file(p), 'utf8');
/** Nội dung sau dòng tiêu đề `heading` cho tới tiêu đề "## " kế tiếp. */
function section(md, heading) {
  const start = md.indexOf(heading);
  if (start < 0) throw new Error(`Không tìm thấy "${heading}"`);
  const rest = md.slice(start + heading.length);
  const end = rest.search(/^## /m);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

const args = process.argv.slice(2);
const prBodyPath = args.includes('--pr-body') ? args[args.indexOf('--pr-body') + 1] : null;
// Hạn mức miễn phí tính riêng cho từng model: model đầu hết hạn mức/quá tải/không có thì thử model sau.
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'].filter(Boolean))];
const site = siteUrl(read('index.html'));
const list = upcoming(Infinity);
const plan = planRun(list);

console.log(plan.length ? 'Kế hoạch:' : 'Không có dịp nào cần thêm lời chúc.');
for (const p of plan) {
  console.log(`- ${p.occasion.name} (còn ${p.next.days} ngày): ${p.wants.map((w) => `${w.relation} +${w.want} (đang có ${w.count})`).join(', ')}`);
}
if (args.includes('--plan') || !plan.length) process.exit(0);

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Thiếu GEMINI_API_KEY (GitHub: Settings › Secrets and variables › Actions).');
  process.exit(1);
}

let model = MODELS[0]; // model dùng được gần nhất; các lần gọi sau bắt đầu từ đó

/** Thời gian chờ Google gợi ý trong lỗi 429 (RetryInfo.retryDelay, ví dụ "37s"), tối đa 60 giây. */
const retryDelayMs = (err) => {
  const s = err?.error?.details?.find((d) => d.retryDelay)?.retryDelay;
  return Math.min(60, Number.parseFloat(s) || 20) * 1000;
};

async function gemini(prompt, schema) {
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 1, responseMimeType: 'application/json', responseSchema: schema },
  });
  const failures = [];
  for (const m of MODELS.slice(MODELS.indexOf(model))) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body,
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? '').join('');
        if (!text) throw new Error(`Gemini ${m} không trả nội dung: ${JSON.stringify(data).slice(0, 300)}`);
        model = m;
        return JSON.parse(text);
      }
      const raw = await res.text();
      let err = null;
      try { err = JSON.parse(raw); } catch { /* không phải JSON */ }
      const why = `${m}: HTTP ${res.status} ${err?.error?.status ?? ''} ${(err?.error?.message ?? raw).slice(0, 300)}`;
      console.warn(`Gemini lỗi (lần ${attempt}) — ${why}`);
      failures.push(why);
      if (res.status === 404) break; // model không tồn tại hoặc key không dùng được model này → thử model sau
      if (res.status !== 429 && res.status < 500) throw new Error(`Gemini ${why}`); // key sai, request sai: đổi model không giúp được
      if (attempt === 1) await new Promise((r) => setTimeout(r, retryDelayMs(err)));
    }
  }
  throw new Error(`Gemini: mọi model đều lỗi\n${failures.join('\n')}`);
}

const rules = section(read('tools/marketing/message-rules.md'), '## Quy tắc');
let auto = AUTO_MESSAGES;
const results = [];
for (const p of plan) {
  const { accepted, rejected } = acceptMessages(await gemini(messagePrompt(p, rules), messageSchema(p.wants)), p);
  if (Object.keys(accepted).length) auto = mergeMessages(auto, { [p.occasion.id]: accepted });
  results.push({ ...p, accepted, rejected });
  console.log(`${p.occasion.id}: nhận ${Object.values(accepted).flat().length}, loại ${rejected.length}`);
}
if (!results.some((r) => Object.keys(r.accepted).length)) {
  console.log('Không có lời chúc nào đạt yêu cầu — không ghi file.');
  process.exit(0);
}
writeFileSync(file('js/data/messages-auto.js'), renderAutoFile(read('js/data/messages-auto.js'), auto));

let stats;
try {
  const out = execFileSync(process.execPath, [fileURLToPath(file('tools/marketing/stats.mjs'))], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  stats = out.trim().replace(/^# .*\n+/, '').replace(/^## /gm, '### '); // lồng dưới tiêu đề "Số liệu" của PR
} catch (err) {
  stats = `Chưa có số liệu: ${(err.stderr || err.message).trim()}`;
}

const target = captionTarget(list);
let caption = null;
if (target) {
  const url = `${site}o/${target.occasion.slug}/`;
  const withLink = (s) => (String(s).includes(url) ? String(s).trim() : `${String(s).trim()}\n${url}`);
  try {
    const c = await gemini(captionPrompt(target, url, section(read('tools/marketing/caption-style.md'), '## Giọng văn')), captionSchema);
    caption = { ...target, long: withLink(c.long), short: withLink(c.short) };
  } catch (err) {
    caption = { ...target, error: err.message };
  }
}

const body = prBody({ model, site, results, stats, caption });
if (prBodyPath) writeFileSync(prBodyPath, body);
else console.log(`\n${body}`);
