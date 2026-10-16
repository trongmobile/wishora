/**
 * Lời chúc mẫu do workflow SEO hằng tuần sinh bằng Gemini (.github/workflows/weekly-seo.yml), nối sau lời chúc viết tay trong messages.js.
 * File do tools/marketing/weekly-seo.mjs ghi lại mỗi lần chạy; lần chạy sau giữ nguyên mọi lời chúc đang có,
 * nên sửa hoặc xóa trực tiếp ở đây (kể cả ngay trong PR) là được.
 * Cấu trúc giống MESSAGES: { <id dịp>: { <người nhận>: [...] } }.
 */
export const AUTO_MESSAGES = {};
