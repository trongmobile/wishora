# Quy tắc thiết kế theme thiệp

Phần "Quy tắc" dưới đây được đưa nguyên văn vào prompt gửi Gemini khi workflow SEO hằng tuần thêm theme mới (`tools/marketing/weekly-seo.mjs`). Sửa ở đây để đổi gu thiết kế, không cần sửa code. Script vẫn tự loại theme có chữ khó đọc (độ tương phản < 4.5), màu sai dạng `#rrggbb`, emoji không hợp lệ, font ngoài danh sách hoặc tên trùng theme đã có.

## Quy tắc

- Theme phải gợi đúng cảm xúc của dịp ngay từ màu nền và emoji: nhìn thoáng qua là biết dịp gì. Không dùng lại bảng màu của theme dịp này đã có.
- Màu nền: `bgTop` và `bgBottom` là hai màu của một dải chuyển màu dọc, gần nhau về sắc độ (không chọi màu). `ink` là màu chữ chính, phải đọc rõ trên cả hai màu nền: nền sáng thì chữ tối, nền tối thì chữ sáng.
- `accent` là màu nhấn đậm (nút bấm, tên người nhận, hộp quà/phong bì); `accentSoft` là bản nhạt hơn của cùng tông, dùng cho nắp hộp và mặt trong phong bì.
- Tên theme: 2–3 từ tiếng Anh, viết hoa chữ đầu, như "Autumn Lantern" hay "Pastel Meadow"; không trùng tên theme đã có. Mô tả: một câu tiếng Việt có dấu, 30–80 ký tự, tả màu sắc và cảm giác. Chữ mẫu (`sample`): 2–4 từ tiếng Việt viết hoa chữ đầu, là câu chúc ngắn của dịp, hiện trong ảnh thu nhỏ.
- Emoji hợp dịp và nhất quán với nhau: `ambientChars` (3–5 emoji rơi/bay nền), `decor` (đúng 3 mục: góc trên-trái, góc dưới-phải, huy hiệu trên khung chữ; được để chuỗi rỗng), `seal` (1 ký tự trên con dấu phong bì), `emoji` (biểu tượng đại diện).
- Dịp vui (festive, warm): `ambientCount` 12–22, confetti rực rỡ 4–5 màu cùng tông. Dịp lãng mạn (romantic): ít hạt hơn (10–16), màu ngọt, không chói. Dịp trang trọng (solemn): hệ thống tự bỏ confetti và để hạt trôi chậm, nên chỉ chọn màu nghiêm trang và emoji tối giản.
- `confettiChars` là 0–3 emoji lẫn trong confetti; để mảng rỗng nếu muốn confetti chỉ là mảnh giấy màu. `confettiRatio` 0–0.5 là tỉ lệ hạt confetti dùng emoji.
- Font: chữ thảo (Dancing Script, Pacifico) cho dịp tình cảm, vui; Playfair Display, Cormorant Garamond cho dịp sang trọng, trang trọng; Quicksand, Lora cho dịp ấm áp, gần gũi; Space Grotesk cho dịp hiện đại.
- Kiểu mở đầu: `gift` (hộp quà) hợp dịp vui, bất ngờ; `envelope` (phong bì) hợp dịp tình cảm, lời cảm ơn, dịp trang trọng.
- Không dùng cờ, biểu tượng tôn giáo, chính trị, logo hay nhân vật có bản quyền.
