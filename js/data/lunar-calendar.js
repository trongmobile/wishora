/**
 * Ngày dương lịch của các dịp tính theo âm lịch (múi giờ Việt Nam, UTC+7).
 * KHÔNG suy đoán năm chưa có trong bảng — calendar.js sẽ trả về null và giao diện
 * không hiển thị countdown. Thêm năm mới: chạy `node tools/gen-lunar.mjs <từ> <đến>`,
 * đối chiếu với lịch chính thức rồi bổ sung vào đây.
 *
 * Nguồn / mức xác minh:
 *  - tet 2025–2029: lịch chính thức đã công bố (29/01/2025, 17/02/2026, 06/02/2027, 26/01/2028, 13/02/2029).
 *  - Năm 2030 trở đi chưa đưa vào vì chưa đối chiếu được (thuật toán và nguồn tham khảo lệch 1 ngày ở 2030).
 */
export const LUNAR_DATES = Object.freeze({
  tet: {
    2025: '2025-01-29',
    2026: '2026-02-17',
    2027: '2027-02-06',
    2028: '2028-01-26',
    2029: '2029-02-13',
  },
});
