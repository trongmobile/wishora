/**
 * Gọi Gemini (generateContent, trả JSON theo schema) cho workflow SEO hằng tuần, sao cho một trục trặc tạm thời của Gemini
 * không làm hỏng cả lần chạy: mỗi request có hạn chờ; request treo, lỗi mạng, quá tải, hết hạn mức thì thử lại rồi đổi sang
 * model kế tiếp; mọi lần gọi dùng chung một tổng hạn chờ để job còn kịp build, test và mở PR.
 * fetch/sleep/now truyền vào được để test (tests/marketing.test.js). CLI: tools/marketing/weekly-seo.mjs.
 */
export const GEMINI_LIMITS = Object.freeze({
  requestMs: 90_000, // một request thường mất 5–15 giây; không có hạn này thì request treo chờ đủ 5 phút (mặc định của Node) rồi ném lỗi
  totalMs: 9 * 60_000, // cho mọi lần gọi của một lần chạy; job trong weekly-seo.yml bị hủy sau 15 phút
  maxWaitMs: 60_000, // chờ tối đa trước khi thử lại
});

/** Thời gian chờ Google gợi ý trong lỗi 429 (RetryInfo.retryDelay, ví dụ "37s"); không có thì 20 giây. */
const retryDelayMs = (err) => (Number.parseFloat(err?.error?.details?.find((d) => d.retryDelay)?.retryDelay) || 20) * 1000;

/**
 * models: thứ tự ưu tiên; hạn mức miễn phí tính riêng cho từng model nên model này lỗi thì thử model sau.
 * Trả về { generate(prompt, schema) → JSON đã parse, model: model dùng được gần nhất }.
 */
export function createGemini({
  key, models, fetch = globalThis.fetch, limits = GEMINI_LIMITS, now = Date.now,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)), log = console.warn,
}) {
  const deadline = now() + limits.totalMs;
  let model = models[0]; // các lần gọi sau bắt đầu từ model dùng được gần nhất

  /** Một request tới model `m`. Trả { value } hoặc { why, action: 'retry' | 'next', waitMs }. */
  async function once(m, body, timeoutMs) {
    let res;
    let raw;
    // setTimeout thường chứ không dùng AbortSignal.timeout: timer của nó không giữ tiến trình sống, nên nếu trong lúc chờ
    // không còn gì khác đang mở thì Node thoát luôn (mã 13) trước khi hạn chờ kịp nổ.
    const abort = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; abort.abort(); }, timeoutMs);
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body, signal: abort.signal,
      });
      raw = await res.text();
    } catch (err) {
      // Model đang treo thì thử lại cũng treo → sang model sau. Lỗi mạng khác (DNS, đứt kết nối) thường thoáng qua → thử lại.
      if (timedOut) return { why: `${m}: không trả lời sau ${Math.round(timeoutMs / 1000)} giây`, action: 'next' };
      return { why: `${m}: lỗi mạng (${err?.cause?.code ?? err?.cause?.message ?? err?.message ?? err})`, action: 'retry', waitMs: 5000 };
    } finally {
      clearTimeout(timer);
    }
    let data = null;
    try { data = JSON.parse(raw); } catch { /* không phải JSON */ }
    if (!res.ok) {
      const why = `${m}: HTTP ${res.status} ${data?.error?.status ?? ''} ${(data?.error?.message ?? raw).slice(0, 300)}`;
      if (res.status === 429 || res.status >= 500) return { why, action: 'retry', waitMs: retryDelayMs(data) };
      // 4xx khác: model không tồn tại (404), model không nhận kiểu request này (400, ví dụ model mới bỏ một tham số) hoặc key sai.
      // Thử lại vô ích → sang model sau; key sai thì model nào cũng lỗi ngay và lý do nằm trong thông báo cuối.
      return { why, action: 'next' };
    }
    const text = data?.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? '').join('');
    try {
      if (text) return { value: JSON.parse(text) };
    } catch { /* JSON bị cắt giữa chừng */ }
    return { why: `${m}: không trả JSON dùng được (${raw.slice(0, 200)})`, action: 'retry', waitMs: 2000 };
  }

  async function generate(prompt, schema) {
    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1, responseMimeType: 'application/json', responseSchema: schema },
    });
    const failures = [];
    const fail = (head) => new Error([head, ...new Set(failures)].join('\n')); // hai lần thử cùng lỗi thì ghi một dòng
    for (const m of models.slice(models.indexOf(model))) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const left = deadline - now();
        if (left <= 0) throw fail(`Gemini: hết ${limits.totalMs / 60_000} phút dành cho một lần chạy`);
        const r = await once(m, body, Math.min(limits.requestMs, left));
        if (!r.why) {
          model = m;
          return r.value;
        }
        log(`Gemini lỗi (lần ${attempt}) — ${r.why}`);
        failures.push(r.why);
        if (r.action === 'next' || attempt === 2) break;
        await sleep(Math.max(0, Math.min(r.waitMs, limits.maxWaitMs, deadline - now())));
      }
    }
    throw fail('Gemini: mọi model đều lỗi');
  }

  return { generate, get model() { return model; } };
}
