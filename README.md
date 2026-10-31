# Chùa Tịnh Tâm 🙏

**Phiên đi chùa online đa người dùng** — mô phỏng trải nghiệm live TikTok chùa như ảnh, nhưng đầy đủ tính năng thực tế.

## Tính năng chính

- **Không gian chùa 3D** (Three.js) với tượng Phật vàng, ánh sáng, lư hương
- **Đa người dùng realtime** (Socket.io): thấy avatar người khác đang quỳ, số người online
- **Chat live** kiểu TikTok: gửi lời cầu nguyện, Nam Mô A Di Đà Phật, emoji
- **Hệ thống cầu nguyện** nhanh (nút “Nam Mô”, “Cầu an”, “Cầu lộc”…)
- **Hệ thống cúng dường / coin** mô phỏng (tăng điểm thành tâm)
- **Trạng thái LIVE** + hiện thị người đang online
- Giao diện tiếng Việt, responsive, đẹp như live chùa

## Cách chạy

```bash
npm install
npm start
```

Mở `http://localhost:3000` — mở nhiều tab/điện thoại để thấy realtime multi-user.

## Công nghệ

- Backend: Node.js + Express + Socket.io
- Frontend: Three.js (scene 3D) + vanilla JS + CSS
- Realtime presence + chat

## Repo

https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam

Nam Mô A Di Đà Phật 🙏
