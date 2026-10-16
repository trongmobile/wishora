# Agent SEO hằng tuần — hướng dẫn

File này là "việc cần làm" của agent Claude Code chạy theo lịch mỗi tuần trên cloud. Sửa file này để đổi cách agent làm việc, không cần sửa routine.

## Mục tiêu

Mỗi trang dịp `o/<slug>/` hiển thị toàn bộ lời chúc mẫu của dịp thành nội dung tĩnh ("Lời chúc 20/11 cho thầy cô…"). Đây là nội dung Google lập chỉ mục. Mỗi tuần, thêm lời chúc mẫu **chất lượng** cho vài dịp sắp tới để trang dịp có thêm nội dung trước mùa tìm kiếm, rồi mở PR cho chủ site duyệt.

## Các bước

### 1. Đọc dữ liệu

```bash
node tools/marketing/upcoming.mjs 45   # dịp trong 45 ngày tới + số lời chúc theo từng người nhận
node tools/marketing/stats.mjs         # số liệu GoatCounter 7 ngày (cần GOATCOUNTER_TOKEN)
```

`stats.mjs` báo không có token hoặc lỗi → ghi "Chưa có số liệu: <lý do>" trong PR rồi làm tiếp. Không cần `npm install`.

### 2. Chọn dịp

Chọn **tối đa 3 dịp**, ưu tiên theo thứ tự:

1. Còn từ 5 đến 45 ngày (dịp còn dưới 5 ngày thì Google không kịp lập chỉ mục, bỏ qua).
2. Có người nhận đang có 0–1 lời chúc.
3. Có nhiều lượt `click/create-card/<id>` hoặc `click/make-own/<id>` trong số liệu.

### 3. Viết lời chúc trong `js/data/messages.js`

Đọc hết lời chúc đang có của dịp trước khi viết. Quy tắc:

- Tiếng Việt có dấu, tự nhiên như người thật viết cho người thân; 1–3 câu, khoảng 60–250 ký tự.
- **Đúng xưng hô** theo người nhận: mẹ/ba/ông bà → "con"; thầy cô → "em" hoặc "con"; sếp/đối tác → "em"/"tôi", "kính chúc"; người yêu → "anh/em"; bạn bè → thân mật, đùa nhẹ được.
- **Đúng tông** của dịp (`upcoming.mjs` in ra): `solemn` → trang trọng, biết ơn, không đùa; `festive` → vui, rộn ràng; `romantic` → ngọt nhưng không sến; `warm` → ấm áp.
- Không emoji, không hashtag, không nhắc tên Wishora, không tên người cụ thể, không chính trị/tôn giáo, không nói về tiền/quà.
- Không trùng ý với lời chúc đã có. Mỗi lời chúc phải nói một điều khác (một kỷ niệm, một lời cảm ơn cụ thể, một mong ước khác).
- Chỉ dùng khóa người nhận có trong danh sách của dịp mà `upcoming.mjs` in ra (`default` + `suggestedRecipients`). Người nhận chưa có mảng thì tạo mảng mới trong khối của dịp.
- Mỗi người nhận thêm 1–3 lời chúc; mỗi dịp tối đa 8; **cả lần chạy tối đa 20** để chủ site duyệt kịp.
- Không sửa, không xóa lời chúc cũ. Không đổi gì ngoài nội dung các mảng lời chúc.

### 4. Build và test

```bash
npm run build:pages -- --html   # sinh lại o/*/index.html (không cần trình duyệt)
npm test
```

Test hỏng thì sửa lời chúc trong `messages.js` cho đúng quy tắc, **không sửa test**. Không sửa được thì không mở PR, báo lỗi trong tin nhắn cuối.

Trước khi commit, chạy `git status`: chỉ được thay đổi `js/data/messages.js` và các file `o/*/index.html`. File khác thay đổi thì khôi phục (`git checkout -- <file>`).

### 5. Mở PR

- Nhánh `claude/seo-YYYY-MM-DD` (ngày chạy), commit `SEO: thêm lời chúc mẫu cho <tên các dịp>`.
- Mở PR vào `main`. **Không push thẳng `main`, không tự merge.** Không tạo được PR thì push nhánh và ghi tên nhánh trong tin nhắn cuối.
- Không có dịp nào đáng thêm → không tạo PR, chỉ báo lý do.

Nội dung PR (tiếng Việt):

```markdown
## Lời chúc mới
| Dịp | Người nhận | Số lời chúc thêm |
|---|---|---|

## Số liệu 7 ngày qua
3–5 dòng: tổng lượt truy cập so với tuần trước, dịp được nhấn "Tạo thiệp" nhiều nhất,
số lượt make-own (người nhận tạo thiệp tiếp), nguồn truy cập chính. Hoặc "Chưa có số liệu: <lý do>".

## Gợi ý đăng tay tuần này
Cho dịp gần nhất còn 3–10 ngày: một caption dài (nhóm Facebook) và một caption ngắn (Zalo),
kèm link trang dịp. Theo giọng văn trong wishora-marketing.md.

## Kiểm tra
- [x] npm test: pass
```
