# Chùa Tịnh Tâm – Live + Tour 360°

Ứng dụng gồm giao diện React/Vite, máy chủ Express + Socket.IO và bộ kết nối TikTok LIVE. Dữ liệu công đức hiện được lưu trên trình duyệt đang sử dụng (localStorage), chưa phải dữ liệu đồng bộ nhiều thiết bị.

## Yêu cầu
- Node.js 20 trở lên
- npm
- Tài khoản TikTok đang phát LIVE nếu muốn thử kết nối LIVE thật

## Chạy trên máy tính

Mở Terminal tại thư mục dự án.

### Terminal 1 – Giao diện
```bash
npm install
npm run dev
```
Mở http://localhost:3000

### Terminal 2 – Máy chủ Socket.IO và TikTok LIVE
Mở Terminal thứ hai, vào cùng thư mục dự án:
```bash
npm run dev:server
```
Máy chủ chạy tại http://localhost:3001. Kiểm tra tình trạng tại http://localhost:3001/health.

> Chỉ chạy `npm run dev` thì giao diện vẫn mở được, nhưng các chức năng kết nối TikTok LIVE sẽ không hoạt động vì máy chủ Socket.IO chưa chạy.

## Cấu hình Tour 360° thật
1. Sao chép `.env.example` thành `.env`.
2. Gán `VITE_TEMPLE_PANORAMA_URL` bằng URL ảnh panorama equirectangular 2:1 hoặc video 360° (`.mp4`, `.webm`, `.mov`).
3. Khởi động lại Vite sau khi đổi biến môi trường. Nếu để trống, ứng dụng dùng ảnh demo và phải coi đó là nội dung minh họa.

Ví dụ:
\`\`\`env
VITE_TEMPLE_PANORAMA_URL=https://cdn.example.com/chua-tinh-tam-360.jpg
\`\`\`

## Kết nối TikTok LIVE
1. Mở một tài khoản TikTok đang phát LIVE.
2. Trong ứng dụng, mở tab **Live & Điều khiển**.
3. Nhập username TikTok (có thể có hoặc không có dấu @), sau đó bấm **Kết Nối**.
4. Khi trạng thái hiển thị `connected`, thử bình luận, thả tim hoặc gửi quà trên LIVE.

TikTok Live Connector là thư viện không chính thức; TikTok có thể thay đổi giao thức hoặc giới hạn kết nối. Không đảm bảo kết nối được với mọi phiên LIVE.

## Build và chạy production
```bash
npm install
npm run build
npm start
```
Lệnh `npm start` chạy máy chủ Express tại cổng `PORT` (mặc định 3001), phục vụ thư mục `dist` và Socket.IO trên cùng origin. Trên nền tảng hosting, cần cấu hình một dịch vụ Node.js có thể giữ kết nối WebSocket lâu dài; hosting static-only không thể chạy TikTok connector.

Nếu frontend và backend được host ở hai domain khác nhau, đặt biến môi trường frontend:
```bash
VITE_TIKTOK_SERVER_URL=https://your-socket-server.example.com
```

## Tính năng hiện có
- Giao diện chính điện và bảng điều khiển
- Quy tắc tương tác: like, follow/share, từ khóa bình luận và quà
- Nghi thức, công đức, bảng xếp hạng và nhật ký
- Đọc lời chúc tiếng Việt qua Web Speech API
- Tour 360° (cần thay ảnh panorama demo bằng ảnh 360° thực tế của chùa)

## Giới hạn cần biết
- Công đức và nhật ký được lưu trên localStorage của trình duyệt; chưa có tài khoản, database hoặc đồng bộ đa thiết bị.
- Danh sách Phật tử minh họa trên chính điện hiện là dữ liệu mẫu; chưa phải danh sách người xem LIVE thật.
- Tour hiện dùng panorama minh họa; cần nội dung 360° do chùa cung cấp để phản ánh đúng địa điểm.
- Thanh âm lượng chỉ điều chỉnh giọng đọc TTS; ứng dụng chưa tích hợp nhạc nền.
