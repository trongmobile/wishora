/**
 * Đếm lượt nhấn nút bằng GoatCounter (đã nhúng trong index.html, không cookie, không lưu dữ liệu cá nhân).
 * Mỗi lượt nhấn là một "event" với đường dẫn cố định dạng click/<tên>[/<dịp>]:
 *   click/create-card/<id dịp>   nhấn "Tạo thiệp" trên thẻ dịp (Khám phá, Dịp nổi bật, Sắp đến ngày đặc biệt)
 *   click/share                  nhấn "Chia sẻ…" (hộp thoại chia sẻ của thiết bị)
 *   click/copy-link              nhấn "Sao chép liên kết"
 *   click/video-export           nhấn "Xuất video MP4 (điện thoại)"
 *   click/video-download         nhấn "Tải video về máy"
 *   click/share-video            nhấn "Gửi video…"
 *   click/make-own/<id dịp>      người nhận nhấn "Tạo thiệp cho người thân của bạn" trên thiệp được gửi
 * Không bao giờ gửi tên người nhận, lời chúc hay liên kết thiệp. Script GoatCounter chưa tải xong/bị chặn → bỏ qua, không lỗi.
 */
export const EVENTS = Object.freeze({
  'create-card': 'Nhấn Tạo thiệp trên thẻ dịp',
  share: 'Nhấn Chia sẻ',
  'copy-link': 'Nhấn Sao chép liên kết',
  'video-export': 'Nhấn Xuất video',
  'video-download': 'Nhấn Tải video về máy',
  'share-video': 'Nhấn Gửi video',
  'make-own': 'Người nhận nhấn Tạo thiệp cho người thân',
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
