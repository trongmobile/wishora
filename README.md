# Wishora — A greeting for every special moment

**Gửi lời thương, trao niềm vui.** Wishora là website tĩnh (HTML + CSS + JavaScript thuần) giúp tạo thiệp chúc mừng cá nhân hóa cho nhiều dịp trong năm — sinh nhật, Tết, 8/3, 20/10, 20/11, Giáng sinh… — và chia sẻ bằng một đường link. Không backend, không database, không đăng nhập.

## Tính năng

- **Trang chủ đa dịp**: hero, "Sắp đến ngày đặc biệt" (đếm ngược theo ngày hiện tại, múi giờ `Asia/Ho_Chi_Minh`), dịp nổi bật, bộ sưu tập theme.
- **34 dịp** chia thành 8 danh mục, **35 theme** (6 theme sinh nhật cũ được giữ nguyên + 29 theme mới), mỗi dịp có lời chúc, tiêu đề, nút mở thiệp và tông (vui / trang trọng / lãng mạn) riêng.
- **Khám phá dịp lễ**: tìm kiếm có dấu/không dấu, lọc theo danh mục, tháng, khu vực, quốc gia (cho Ngày của Mẹ/Cha).
- **Tạo thiệp**: chọn dịp → nhập người nhận → chọn mối quan hệ để nhận lời chúc gợi ý (sửa tự do) → tiêu đề tùy chọn → theme tương thích → live preview (điện thoại/máy tính, toàn màn hình) → tạo link, sao chép, chia sẻ.
- **Hiệu ứng âm thanh** (`js/sfx.js`, Web Audio, không cần file): tiếng mở hộp quà/phong bì, rồi tiếng khi lời chúc hiện ra — mỗi tông có âm riêng (vui: chuông lấp lánh + pháo giấy; ấm áp: chuông nhẹ; lãng mạn: hạc cầm; trang trọng: chuông trầm, không pháo). Người gửi bật/tắt trong form (`effects=mute` trong link), người nhận có nút "Âm thanh" để tắt; chỉ phát sau khi người nhận bấm mở/phát lại (không tự phát). Live preview không phát tiếng, nghe thử bằng "Xem trước thiệp".
- **Dropdown tự dựng** (`js/dropdown.js`): các ô chọn (Dịp chúc mừng, Tháng, Khu vực, Quốc gia) thay `<select>` gốc bằng danh sách có biểu tượng, dòng phụ (ngày/đếm ngược) và radio chọn; desktop là popover có ô tìm kiếm (không dấu cũng được), điện thoại là bottom-sheet. `<select>` gốc vẫn nằm ẩn trong DOM nên `.value`/`change` hoạt động như cũ. Bàn phím: ↑ ↓ Home End Enter Esc. Dùng cho select mới: `enhanceSelect(select)`; tuỳ chọn có `data-icon`, `data-theme`, `data-sub` sẽ hiện tương ứng.
- **Xuất GIF khổ điện thoại** (`js/gif-export.js`): nút "Xuất GIF (điện thoại)" trong form tạo thiệp tạo ảnh GIF động 360×640 (~5 giây, 12 khung/giây, ~0,5–1,8 MB) ngay trên trình duyệt, rồi tải về hoặc gửi bằng Web Share (có trên điện thoại). GIF được **vẽ lại trên canvas** từ cấu hình theme/dịp (nền, khung chữ, font, hạt trang trí, confetti, câu chữ hiện lần lượt, ký tự trang trí; dịp trang trọng không confetti) — giống thiệp về màu/bố cục/kiểu chữ nhưng **không phải bản quay màn hình**: không có hộp quà/phong bì mở, hiệu ứng mờ kính và âm thanh. Mã hóa bằng [gifenc](https://github.com/mattdesl/gifenc) (MIT, đã đặt sẵn trong `js/vendor/`, không cần CDN). Khung đầu tiên (ảnh xem trước trong một số ứng dụng) là lúc chữ chưa hiện.
- Dịp trang trọng (20/11, 27/2, 13/10…) không dùng confetti/trái tim; dịp tình yêu chỉ có theme tình yêu khi người tạo chủ động chọn dịp đó; Tết có câu đối.
- Tương thích ngược: link sinh nhật cũ `?name=…&message=…&theme=…[&anim=0]` vẫn mở đúng.
- Hỗ trợ `prefers-reduced-motion`, bàn phím, skip link, `aria-current`, focus chuyển trang.

## Kiến trúc

```
wishora/
├── index.html              # một trang HTML duy nhất, các "trang" bật/tắt bằng JS
├── css/
│   ├── main.css            # design tokens, form tạo thiệp, cấu trúc thiệp (.stage)
│   ├── occasions.css       # header/nav, trang chủ, danh sách dịp, bộ sưu tập
│   ├── themes.css          # mỗi theme = một khối [data-theme="<id>"] (biến CSS)
│   └── animations.css      # keyframes, hộp quà, phong bì
├── js/
│   ├── app.js              # điểm vào: thiệp chia sẻ hoặc website nhiều trang
│   ├── router.js           # router query string (?page=...), history, nút quay lại
│   ├── url-state.js        # tạo/đọc/kiểm tra URL thiệp (nơi DUY NHẤT đụng vào query của thiệp)
│   ├── creator.js          # form tạo thiệp, gợi ý lời chúc, preview, chia sẻ
│   ├── greeting.js         # render thiệp (intro + màn chúc mừng + hiệu ứng), dùng chung
│   ├── pages.js            # render trang chủ / dịp lễ / bộ sưu tập
│   ├── occasion-engine.js  # truy vấn dịp: tìm kiếm, lọc, sắp tới, gợi ý
│   ├── calendar.js         # tính ngày kế tiếp (cố định / âm lịch / theo quy tắc)
│   ├── music.js            # nhạc Happy Birthday (Web Audio, chỉ dịp sinh nhật)
│   ├── analytics.js        # đếm lượt nhấn nút (GoatCounter events)
│   ├── fx.js               # hạt trang trí nền + confetti dùng chung (thiệp và hero)
│   ├── dropdown.js         # dropdown tự dựng thay <select> (popover / bottom-sheet)
│   ├── sfx.js              # hiệu ứng âm thanh (Web Audio)
│   ├── gif-export.js       # xuất GIF khổ điện thoại (vẽ canvas + gifenc)
│   ├── vendor/gifenc.esm.js  # thư viện mã hóa GIF (MIT)
│   └── data/
│       ├── occasions.js    # danh mục dịp lễ
│       ├── themes.js       # cấu hình JS của theme
│       ├── messages.js     # lời chúc mẫu + danh sách mối quan hệ
│       └── lunar-calendar.js  # bảng ngày âm lịch đã xác minh
├── o/<dịp>/index.html      # trang tĩnh theo dịp (SINH RA, xem "Metadata theo dịp")
├── assets/illustrations/   # tranh SVG minh họa riêng (ví dụ bao lì xì Việt Nam với hoa mai cho Tết)
├── assets/og/              # og-image chung + ảnh OG theo dịp (SINH RA)
├── sitemap.xml, robots.txt # SINH RA, xem "SEO"
├── tools/                  # build-pages.mjs (sinh trang + ảnh OG), gen-lunar.mjs
├── tests/                  # node:test
└── package.json            # chỉ để chạy test (`"type": "module"`)
```

Dữ liệu (dịp, theme, lời chúc, lịch) tách khỏi logic; thêm dịp/theme/lời chúc không cần sửa JS logic.

## URL

| Mục đích | URL |
|---|---|
| Trang chủ | `./` |
| Danh sách dịp | `?page=occasions` (`&category=vietnamese\|international\|family\|love\|birthday\|tet\|women\|custom\|upcoming`, `&month=10`, `&region=VN`, `&country=US`, `&q=phu+nu`, `&themes=1`) |
| Bộ sưu tập / Hướng dẫn | `?page=collections`, `?page=guide` |
| Tạo thiệp | `?page=create&occasion=women-day-20-10[&theme=floral-garden]` |
| **Thiệp chia sẻ** | `o/<occasion>/?type=greeting&occasion=<id>&name=&message=&theme=[&title=][&effects=off,mute]` (trang tĩnh của dịp, xem "Metadata theo dịp") |
| Thiệp sinh nhật | `o/birthday/?type=birthday&name=&message=&theme=[&effects=off]` |
| Thiệp sinh nhật cũ / link ở gốc site | `?name=&message=&theme=[&anim=0]`, `?type=greeting&occasion=…` (vẫn hợp lệ, chỉ không có ảnh xem trước riêng) |

Có tham số thiệp mà **không có** `?page=` → hiện thiệp. Có `?page=` → hiện website. Quy tắc kiểm tra: `occasion` phải là dịp đang `enabled`, `theme` phải nằm trong `themes.js`, tên ≤ 60, tiêu đề ≤ 80, lời chúc ≤ 1.000 ký tự, ký tự điều khiển bị loại bỏ. Nội dung luôn gán bằng `textContent` (không `innerHTML`/`eval`). Link sai → quay về trang chủ kèm thông báo thân thiện. URL không phụ thuộc `localStorage`. `theme` không bắt buộc tương thích với `occasion` khi *đọc* link (để link luôn mở được); chỉ trang tạo thiệp giới hạn theme theo dịp.

## Danh sách dịp

- **Sinh nhật & kỷ niệm**: Sinh nhật · Ngày kỷ niệm cá nhân · Kỷ niệm yêu nhau
- **Tết & năm mới**: Tết Dương lịch 01/01 · Tết Nguyên Đán (âm lịch) · Giao thừa (âm lịch) · Chúc mừng năm mới · Khai xuân đầu năm
- **Ngày của phụ nữ**: Quốc tế Phụ nữ 08/03 · Phụ nữ Việt Nam 20/10
- **Gia đình**: Ngày của Mẹ · Ngày của Cha (theo quy tắc, chọn quốc gia) · Gia đình Việt Nam 28/06 · Quốc tế Thiếu nhi 01/06
- **Tình yêu & tình bạn**: Valentine 14/02 · White Day 14/03 · Quốc tế Tình bạn 30/07
- **Ngày lễ Việt Nam**: Nhà giáo 20/11 · Thầy thuốc 27/02 · Doanh nhân 13/10
- **Quốc tế & lễ hội**: Giáng sinh 25/12 · Halloween 31/10 · Quốc tế Hạnh phúc 20/03
- **Cá nhân hóa** (không countdown): tốt nghiệp, thăng chức, khai trương, tân gia, em bé chào đời, thành công, cảm ơn, xin lỗi, chúc mau khỏe, chúc may mắn, lời chúc tự do

## Cách thêm dịp lễ mới

Thêm một `make({...})` vào mảng `OCCASIONS` trong `js/data/occasions.js`:

```js
make({
  id: 'ngay-moi', name: 'Tên dịp', category: 'family', ...fixed(9, 15),   // fixed(tháng, ngày) | lunar(key) | none | rule
  description: 'Mô tả ngắn.', headline: 'Dòng đầu của thiệp', introTitle: 'Tiêu đề màn mở đầu',
  tone: 'warm',                       // warm | festive | romantic | solemn (solemn: theme nên có confetti: null)
  themeIds: ['family-warmth', 'sunny-bright'], suggestedRecipients: ['family', 'friend'],
  keywords: ['tu khoa khong dau'], cover: { glyph: '🎁', theme: 'sunny-bright' },
}),
```

Rồi thêm lời chúc cho cùng `id` trong `js/data/messages.js`. `id` là khóa ổn định đi vào URL — **không đổi id** của dịp đã phát hành. Đặt `enabled: false` để tắt một dịp (link cũ sẽ báo không hợp lệ).

## Cách thêm theme

1. `js/data/themes.js`: thêm `g(group, id, name, description, colors, 'gift' | 'envelope', { sample, seal, decor, ambient, confetti })` (`confetti: null` cho dịp trang trọng).
2. `css/themes.css`: thêm khối `[data-theme="<id>"]` với các biến (`--bg`, `--ink`, `--panel-*`, `--font-display`, `--btn-*`, `--gift-*` hoặc `--env-*`, `--emoji`…) — sao chép từ một theme có sẵn. Ký tự trang trí góc và huy hiệu lấy từ `decor`, không cần CSS riêng.
3. Thêm `id` vào `themeIds` của các dịp tương thích. Dùng font mới thì thêm vào link Google Fonts trong `index.html`.

## Cách thêm lời chúc mẫu

Trong `js/data/messages.js`: `MESSAGES['<occasion-id>'] = { default: [...], <relationId>: [...] }`. Khi người dùng chọn mối quan hệ có danh sách riêng thì dùng danh sách đó, nếu không dùng `default`. Mối quan hệ mới: thêm vào `RELATIONS` rồi vào `suggestedRecipients` của dịp.

## Cách cấu hình ngày âm lịch

Không có công thức đổi lịch trong runtime. Ngày dương của các dịp âm lịch nằm trong bảng `js/data/lunar-calendar.js`, theo từng năm. **Năm chưa có trong bảng → không countdown** (dịp vẫn hiển thị trong danh mục).

1. Sinh dữ liệu tham khảo: `node tools/gen-lunar.mjs 2030 2035` (thuật toán Hồ Ngọc Đức, UTC+7).
2. **Đối chiếu với lịch chính thức/lịch nghỉ lễ do Nhà nước công bố** rồi mới thêm vào bảng. (Thuật toán cho ra 02/02/2030 cho Tết 2030 trong khi nguồn tham khảo là 03/02/2030, nên 2030+ chưa được đưa vào bảng.)
3. Thêm test đối chiếu trong `tests/calendar.test.js`.

Hiện có: Tết 2025–2029 (đã đối chiếu với lịch chính thức). Dịp âm lịch khác (ví dụ 10/3 âm) cần thêm khóa mới vào bảng và `lunar('<khóa>')` ở dịp tương ứng. Giao thừa = Tết − 1 ngày. Dịp có ngày theo quốc gia (Mẹ/Cha) cấu hình trong `dateConfig.byCountry`; quốc gia chưa có quy tắc → không countdown.

## Chạy local và kiểm thử

```bash
python3 -m http.server 8000      # hoặc: npm start / npx serve .
```

Mở `http://localhost:8000`. Dự án dùng ES modules nên **không mở bằng `file://`**.

```bash
npm test      # node --test tests/*.test.js: lịch, URL, dữ liệu, tìm kiếm, trang tĩnh theo dịp, SEO (40 test)
```

## Triển khai

**GitHub Pages**: workflow `.github/workflows/pages.yml` triển khai thư mục gốc khi push `main` (hoặc Settings → Pages → Deploy from a branch). Liên kết tự dùng đúng đường dẫn `/<repo>/` vì mọi link nội bộ đều là query-only (`?page=…`), không cần rewrite.

**Netlify**: kéo thả thư mục, hoặc nối repo với Build command để trống, Publish directory là `.`.

**Vercel / domain riêng**: không cần build; code không hardcode domain khi tạo link thiệp.

## Metadata theo dịp (prerender)

Crawler của Zalo/Facebook/Messenger không chạy JavaScript, nên mỗi dịp có một **trang tĩnh riêng** `o/<slug>/index.html` (cùng app, chỉ khác `<title>`, mô tả, `og:*`, `twitter:*` và có `<base href="../../">`) cùng **ảnh OG riêng** `assets/og/<slug>.png` (1200×630, vẽ bằng màu/font/hình của theme đại diện của dịp). Link chia sẻ do trang tạo thiệp sinh ra trỏ vào trang này (`shareBase()` trong `js/url-state.js`, gốc site lấy từ `document.baseURI`, không hardcode domain). Mở `o/<slug>/` trần (không kèm thiệp) sẽ vào thẳng form tạo thiệp của dịp đó.

Các file này được **sinh ra và commit vào repo** (GitHub Pages/Netlify chỉ phát file tĩnh, không cần bước build):

```bash
npm i                    # lần đầu: cài playwright-core
npm run build:pages      # sinh o/*/index.html + assets/og/*.png (cần Chrome; đặt CHROME_PATH nếu không phải macOS)
npm run build:pages -- --html   # chỉ sinh HTML, không cần trình duyệt
```

Chạy lại mỗi khi sửa `index.html`, thêm/đổi dịp hoặc theme. `npm test` sẽ báo đỏ nếu trang tĩnh đã cũ hoặc thiếu ảnh. Gốc site (dùng cho `og:url`, `og:image`, canonical, sitemap) lấy từ `og:url` trong `index.html` — đổi domain/tên repo thì sửa chỗ đó, 2 URL ảnh, `<link rel="canonical">` và các `url` trong JSON-LD (test sẽ báo nếu lệch) rồi build lại. Link cũ ở gốc site vẫn hoạt động, chỉ dùng ảnh xem trước chung.

## SEO

- **Trang theo dịp là trang đích cho Google.** Mỗi `o/<dịp>/` có `<title>` theo từ khóa (`Thiệp … online miễn phí — Wishora`), meta description, `<link rel="canonical">` trỏ về chính nó, JSON-LD `BreadcrumbList`, và **nội dung tĩnh ngay trong HTML**: tiêu đề `Tạo thiệp <dịp>` cùng khối "Lời chúc … hay, ý nghĩa" liệt kê toàn bộ lời chúc mẫu của dịp, nhóm theo người nhận ("… cho mẹ", "… cho đồng nghiệp"). Nút "Dùng lời chúc này" điền lời chúc vào form. Khối chỉ hiện khi form đang ở đúng dịp đó. `og:title`/`og:description` vẫn ngắn gọn vì người nhận thiệp thấy chúng trên Zalo/Facebook.
- `js/app.js` không ghi đè tiêu đề SEO của trang dịp khi chạy JS (Google đọc tiêu đề sau khi render).
- **Trang chủ**: canonical về gốc site, JSON-LD `WebSite` + `WebApplication`. Các trang `?page=…` dùng chung canonical của trang chủ. Chân trang có danh sách link tĩnh tới mọi trang dịp (vùng `occasion-links` trong `index.html`, do build sinh ra) để Google tìm thấy chúng.
- **Link thiệp không được lập chỉ mục**: script đầu trang thêm `<meta name="robots" content="noindex">` và gỡ canonical khi URL có tham số thiệp (tên, lời chúc là nội dung riêng tư).
- `npm run build:pages` sinh `sitemap.xml` (trang chủ + mọi trang dịp) và `robots.txt`. Khai báo `<gốc site>/sitemap.xml` trong Google Search Console. `robots.txt` chỉ có tác dụng khi site nằm ở gốc domain (domain riêng). Trên `<user>.github.io/<repo>/`, Google chỉ đọc `robots.txt` ở gốc `<user>.github.io`.

## Thống kê lượt truy cập và lượt nhấn

Site dùng [GoatCounter](https://www.goatcounter.com) (không cookie, không lưu dữ liệu cá nhân; script nhúng trong `index.html`, tài khoản `hpbd.goatcounter.com` — đổi `data-goatcounter` nếu bạn dùng tài khoản khác). Lượt xem trang được đếm theo `/`, `/occasions`, `/create`, `/collections`, `/guide`, `/greeting` (link thiệp không bao giờ bị ghi kèm tên hay lời chúc).

Lượt nhấn nút được đếm bằng *event* (`js/analytics.js`), xem trong GoatCounter ở bảng đường dẫn bằng cách bật hiển thị events:

| Event (đường dẫn) | Khi nào |
|---|---|
| `click/create-card/<id dịp>` | nhấn "Tạo thiệp" trên thẻ dịp (Khám phá dịp lễ, Dịp nổi bật, Sắp đến ngày đặc biệt) — đếm riêng theo từng dịp |
| `click/share` | nhấn "Chia sẻ…" |
| `click/copy-link` | nhấn "Sao chép liên kết" |
| `click/gif-download` | nhấn "Tải GIF về máy" |
| `click/gif-export` | nhấn "Xuất GIF (điện thoại)" (bắt đầu tạo GIF) |
| `click/share-gif` | nhấn "Gửi GIF…" |

Event chỉ mang tên nút và id dịp (chữ, số, gạch ngang), không có tên người nhận, lời chúc hay link thiệp. Đây là số lần *nhấn* nút, không phải số lần chia sẻ/sao chép thành công. GoatCounter bỏ qua `localhost` và người dùng bật trình chặn quảng cáo, nên số liệu thấp hơn thực tế. Thêm event mới: khai báo trong `EVENTS` của `js/analytics.js` rồi gọi `track('<tên>')`.

## Giới hạn

- **URL dài**: lời chúc dài → link dài; có cảnh báo > 1.800 ký tự, một số app chat có thể cắt link.
- **Ai có link đều xem được**, không thể thu hồi hay sửa thiệp đã gửi.
- **Metadata mạng xã hội chỉ riêng theo dịp, không riêng theo từng thiệp**: ảnh/tiêu đề xem trước là của dịp (ví dụ Tết, 20/10), không có tên người nhận hay lời chúc. Muốn theo từng thiệp cần edge function (Cloudflare Workers/Netlify Edge) — chưa làm.
- Nhạc nền chỉ có cho dịp sinh nhật.
- GIF: tối đa 256 màu nên nền gradient có thể thấy vạch màu nhẹ (đã dither); lời chúc quá dài sẽ được thu nhỏ chữ (tối thiểu 10px) rồi cắt bằng "…"; tạo GIF mất khoảng 1–3 giây trên máy tính, có thể lâu hơn trên điện thoại cũ.
- Ngày âm lịch chỉ có trong khoảng đã xác minh (xem trên); không có mã QR; `og:url`/`og:image`/canonical đang trỏ domain GitHub Pages hiện tại.
- Hình minh họa dùng emoji + CSS (không tải ảnh ngoài); hiển thị emoji phụ thuộc hệ điều hành.
