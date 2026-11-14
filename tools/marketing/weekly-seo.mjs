/**
 * Bước "viết" của workflow SEO hằng tuần (.github/workflows/weekly-seo.yml): chọn vài dịp sắp tới, nhờ Gemini viết thêm
 * lời chúc mẫu, lọc rồi ghi vào js/data/messages-auto.js; thiết kế thêm một theme thiệp cho dịp ít theme nhất (ghi vào
 * js/data/themes-auto.js và css/themes.css); soạn nội dung PR (lời chúc và theme mới, số liệu GoatCounter, caption đăng tay). Build trang, chạy test và mở PR là các bước sau trong workflow.
 *   node tools/marketing/weekly-seo.mjs --plan                         # chỉ in kế hoạch: không gọi Gemini, không ghi file
 *   GEMINI_API_KEY=... node tools/marketing/weekly-seo.mjs [--pr-body <file>]
 * Model: gemini-3.8-flash; request treo, lỗi mạng, hết hạn mức, quá tải thì thử gemini-3.5-flash-lite rồi gemini-2.5-flash
 * (tools/marketing/gemini.mjs); GEMINI_MODEL thêm model ưu tiên. Quy tắc viết lời chúc: tools/marketing/message-rules.md.
 * Quy tắc thiết kế theme: tools/marketing/theme-rules.md.
 * Không có dịp nào cần thêm, hoặc không lời chúc/theme nào đạt yêu cầu → thoát 0 và không ghi gì (workflow sẽ không mở PR).
 * Gemini lỗi ở một dịp, theme hay caption → bỏ qua phần đó, phần còn lại vẫn vào PR, lỗi ghi trong PR và thành cảnh báo của
 * lần chạy. Gemini lỗi mà không thêm được gì → thoát 1, lý do hiện ngay ở trang của lần chạy (annotation), không cần mở log.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { upcoming } from '../../js/occasion-engine.js';
import { mergeMessages } from '../../js/data/messages.js';
import { AUTO_MESSAGES } from '../../js/data/messages-auto.js';
import { AUTO_THEMES } from '../../js/data/themes-auto.js';
import { THEMES } from '../../js/data/themes.js';
import { siteUrl } from '../pages-lib.mjs';
import { createGemini } from './gemini.mjs';
import {
  planRun, messagePrompt, messageSchema, acceptMessages, renderAutoFile, captionTarget, captionPrompt, captionSchema, prBody,
} from './seo-lib.mjs';
import {
  pickThemeTarget, themePrompt, themeSchema, acceptTheme, insertThemeCss, renderThemesFile, themeSection,
} from './theme-lib.mjs';

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

/** In lỗi/cảnh báo. Trên GitHub Actions, dòng ::error::/::warning:: thành ghi chú (annotation) hiện ngay ở trang của lần chạy. */
function annotate(level, message) {
  if (process.env.GITHUB_ACTIONS) console.log(`::${level}::${String(message).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  else console.error(message);
}
process.on('uncaughtException', (err) => {
  annotate('error', `weekly-seo.mjs dừng vì lỗi: ${err?.stack ?? err}`);
  process.exit(1);
});

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
const themeTarget = pickThemeTarget(list);
if (themeTarget) console.log(`Theme mới: ${themeTarget.occasion.name} (còn ${themeTarget.next.days} ngày, đang có ${themeTarget.occasion.themeIds.length} theme)`);
if (args.includes('--plan') || (!plan.length && !themeTarget)) process.exit(0);

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Thiếu GEMINI_API_KEY (GitHub: Settings › Secrets and variables › Actions).');
  process.exit(1);
}

const gemini = createGemini({ key, models: MODELS });
const problems = []; // phần Gemini không làm được; phần đó bị bỏ qua, các phần còn lại vẫn vào PR

const rules = section(read('tools/marketing/message-rules.md'), '## Quy tắc');
let auto = AUTO_MESSAGES;
const results = [];
for (const p of plan) {
  try {
    const { accepted, rejected } = acceptMessages(await gemini.generate(messagePrompt(p, rules), messageSchema(p.wants)), p);
    if (Object.keys(accepted).length) auto = mergeMessages(auto, { [p.occasion.id]: accepted });
    results.push({ ...p, accepted, rejected });
    console.log(`${p.occasion.id}: nhận ${Object.values(accepted).flat().length}, loại ${rejected.length}`);
  } catch (err) {
    results.push({ ...p, accepted: {}, rejected: [], error: err.message });
    problems.push(`Lời chúc ${p.occasion.name} — ${err.message}`);
    console.warn(`${p.occasion.id}: bỏ qua — ${err.message}`);
  }
}
const hasMessages = results.some((r) => Object.keys(r.accepted).length);

let themeResult = null;
let themes = AUTO_THEMES;
if (themeTarget) {
  try {
    const raw = await gemini.generate(themePrompt(themeTarget, THEMES, section(read('tools/marketing/theme-rules.md'), '## Quy tắc')), themeSchema);
    const { theme, reason } = acceptTheme(raw, themeTarget, THEMES);
    themeResult = { ...themeTarget, theme, reason };
    if (theme) {
      themes = [...AUTO_THEMES, theme];
      console.log(`Theme: nhận "${theme.name}" (${theme.id}) cho ${themeTarget.occasion.id}`);
    } else console.log(`Theme: loại — ${reason}`);
  } catch (err) {
    themeResult = { error: err.message };
    problems.push(`Theme ${themeTarget.occasion.name} — ${err.message}`);
    console.warn(`Theme: ${err.message}`);
  }
}
const hasTheme = themes !== AUTO_THEMES;

if (!hasMessages && !hasTheme) {
  if (problems.length) {
    annotate('error', `Gemini lỗi nên lần chạy này không thêm được gì.\n${problems.join('\n')}`);
    process.exit(1);
  }
  console.log('Không có lời chúc hay theme nào đạt yêu cầu — không ghi file.');
  process.exit(0);
}
if (hasMessages) writeFileSync(file('js/data/messages-auto.js'), renderAutoFile(read('js/data/messages-auto.js'), auto));
if (hasTheme) {
  writeFileSync(file('js/data/themes-auto.js'), renderThemesFile(read('js/data/themes-auto.js'), themes));
  writeFileSync(file('css/themes.css'), insertThemeCss(read('css/themes.css'), themes));
}

let stats;
try {
  // timeout: GoatCounter treo thì PR chỉ thiếu số liệu, không kéo cả job tới hạn 15 phút.
  const out = execFileSync(process.execPath, [fileURLToPath(file('tools/marketing/stats.mjs'))], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60_000 });
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
    const c = await gemini.generate(captionPrompt(target, url, section(read('tools/marketing/caption-style.md'), '## Giọng văn')), captionSchema);
    caption = { ...target, long: withLink(c.long), short: withLink(c.short) };
  } catch (err) {
    caption = { ...target, error: err.message };
    problems.push(`Caption ${target.occasion.name} — ${err.message}`);
  }
}

const body = prBody({ model: gemini.model, site, results, stats, caption, themeMd: themeResult ? themeSection(themeResult, site) : '' });
if (prBodyPath) writeFileSync(prBodyPath, body);
else console.log(`\n${body}`);
if (problems.length) annotate('warning', `Gemini lỗi ở một phần, phần còn lại vẫn vào PR.\n${problems.join('\n')}`);
