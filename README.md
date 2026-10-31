# Chùa Tịnh Tâm 🙏

**Phiên đi chùa online đa người dùng** — mô phỏng trải nghiệm live TikTok chùa.

## Tính năng

### Cơ bản
- Không gian chánh điện **3D** (Three.js) với tượng Phật vàng, hào quang, lò hương khói bay
- **Đa người dùng realtime** (Socket.io)
- Chat live kiểu TikTok
- Nút cầu nguyện nhanh (Nam Mô, Cầu an, Cầu lộc, Sức khỏe)
- Badge LIVE + đếm số người online

### Mới nâng cấp
- **Hệ thống Cúng dường**
  - 1 Coin → Đăng hương
  - 2 Coins → Lễ Phật
  - 10+ Coins → Hoa sen
  - Hiệu ứng bay lên khi cúng
- **Bảng xếp hạng “TẤM LÒNG THÀNH”** (realtime)
- **Vai trò Host** (người đầu tiên vào làm chủ trì)
- Avatar áo lam + tóc búi

## Cách chạy

```bash
git clone https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam.git
cd chua-tinh-tam
npm install
npm start
```

Mở `http://localhost:3000`  
Mở nhiều tab / điện thoại để thấy realtime multi-user.

## Công nghệ
- Backend: Node.js + Express + Socket.io
- Frontend: Three.js + vanilla JS + CSS

## Repo
https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam

Nam Mô A Di Đà Phật 🙏
