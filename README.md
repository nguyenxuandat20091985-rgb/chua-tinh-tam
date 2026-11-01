# Chùa Tịnh Tâm – Live + TikTok thật

## Tính năng
- Bảng quy tắc tương tác (Like, Follow, comment từ khóa, quà)
- Nghi thức + công đức + TTS
- **Kết nối TikTok Live thật** (`tiktok-live-connector`)
- Tour 360°

## Chạy (2 process)

### Terminal 1 – Frontend
```bash
npm install
npm run dev
```
→ http://localhost:3000

### Terminal 2 – Server TikTok Live
```bash
npm run dev:server
```
→ http://localhost:3001 (Socket.io)

## Kết nối Live thật
1. Mở LIVE trên TikTok (@lonelyking011 hoặc acc khác)
2. Vào tab **Live & Điều khiển**
3. Ô username: `lonelyking011` → **Kết Nối Live**
4. Comment / like / quà trên TikTok → nghi thức + công đức chạy trên hệ thống

## Lưu ý
- Acc **phải đang LIVE** mới connect được
- Thư viện dùng API không chính thức của TikTok → có thể đổi theo thời gian
- Like nhiều có thể bị giới hạn (em đã cap xử lý)

## Repo
https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam
