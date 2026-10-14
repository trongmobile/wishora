/**
 * Đếm lượt nhấn nút bằng GoatCounter (đã nhúng trong index.html, không cookie, không lưu dữ liệu cá nhân).
 * Mỗi lượt nhấn là một "event" với đường dẫn cố định dạng click/<tên>[/<dịp>]:
 *   click/create-card/<id dịp>   nhấn "Tạo thiệp" trên thẻ dịp (Khám phá, Dịp nổi bật, Sắp đến ngày đặc biệt)
 *   click/share                  nhấn "Chia sẻ…" (hộp thoại chia sẻ của thiết bị)
 *   click/copy-link              nhấn "Sao chép liên kết"
 *   click/gif-export             nhấn "Xuất GIF (điện thoại)"
 *   click/gif-download           nhấn "Tải GIF về máy"
 *   click/share-gif              nhấn "Gửi GIF…"
 * Không bao giờ gửi tên người nhận, lời chúc hay liên kết thiệp. Script GoatCounter chưa tải xong/bị chặn → bỏ qua, không lỗi.
 */
export const EVENTS = Object.freeze({
  'create-card': 'Nhấn Tạo thiệp trên thẻ dịp',
  share: 'Nhấn Chia sẻ',
  'copy-link': 'Nhấn Sao chép liên kết',
  'gif-export': 'Nhấn Xuất GIF',
  'gif-download': 'Nhấn Tải GIF về máy',
  'share-gif': 'Nhấn Gửi GIF',
});

/** @param {keyof typeof EVENTS} name @param {string} [detail] ví dụ id dịp */
export function track(name, detail = '') {
  if (!(name in EVENTS)) return;
  const safe = String(detail).replace(/[^a-z0-9-]/gi, '').slice(0, 60);
  const path = `click/${name}${safe ? `/${safe}` : ''}`;
  try {
    globalThis.goatcounter?.count?.({ path, title: EVENTS[name], event: true });
  } catch {
    /* thống kê không được làm hỏng chức năng */
  }
}
