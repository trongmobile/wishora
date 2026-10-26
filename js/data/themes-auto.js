/**
 * Theme thiệp do workflow SEO hằng tuần sinh bằng Gemini (.github/workflows/weekly-seo.yml). File do tools/marketing/weekly-seo.mjs
 * ghi lại mỗi lần chạy, mỗi mục kèm `occasionId` (dịp được thêm theme này vào themeIds). Phần CSS tương ứng nằm trong
 * css/themes.css, giữa hai dòng AUTO-THEMES:START / AUTO-THEMES:END. Sửa hoặc xóa trực tiếp ở đây (kể cả ngay trong PR) là được;
 * xóa theme thì xóa luôn khối CSS của nó.
 */
export const AUTO_THEMES = [
  {
    "id": "spooky-night",
    "name": "Spooky Night",
    "description": "Đêm Halloween ma mị với sắc xanh tím và ánh nến lung linh.",
    "colors": [
      "#110b26",
      "#ff6b18",
      "#1f143d"
    ],
    "intro": "gift",
    "group": "intl",
    "occasionId": "halloween",
    "sample": "Chúc Mừng Halloween",
    "seal": "🎃",
    "decor": [
      "🦇",
      "🕷️",
      "🍬"
    ],
    "ambient": {
      "chars": [
        "🦇",
        "👻",
        "🕸️",
        "✨"
      ],
      "count": 16,
      "motion": "drift"
    },
    "confetti": {
      "colors": [
        "#ff6b18",
        "#9b5de5",
        "#00f5d4",
        "#f15bb5"
      ],
      "chars": [
        "🍬",
        "👻"
      ],
      "charRatio": 0.2
    }
  }
];
