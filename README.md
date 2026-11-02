# Chùa Tịnh Tâm

Pháp hội trực tuyến + TikTok LIVE (nghi thức, công đức, overlay).

## Link

- Web: https://chua-tinh-tam.vercel.app
- Repo: https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam

## Hai phần

### 1. Web app (repo này)

Giao diện chánh điện + bảng công đức + nút nghi lễ.  
Nền dùng ảnh chánh điện từ bản [Chánh Điện Tịnh Tâm](https://github.com/kentjuno/chanh-dien-online).

```bash
npm install
npm run dev          # frontend
npm run dev:all      # frontend + server TikTok
```

### 2. LIVE TikTok thật (khuyên dùng — bản đã ổn định)

Để phát LIVE có người ngồi, quà, TTS xướng tên, overlay 9:16:

```bash
git clone https://github.com/kentjuno/chanh-dien-online.git
cd chanh-dien-online/live
npm install
npm start
```

1. Mở http://localhost:3000/live/control.html  
2. Bấm **Mở overlay 9:16** → bật âm thanh 1 lần  
3. OBS / TikTok LIVE Studio: Browser source → `http://localhost:3000/live/overlay.html` (1080×1920)  
4. Nhập `@username` TikTok → **Kết nối**

Người xem bình luận → vào ngồi. Tặng quà → xướng tên + công đức.

Nguồn: [kentjuno/chanh-dien-online](https://github.com/kentjuno/chanh-dien-online) (MIT).

## Tài khoản LIVE mặc định

Có thể dùng `@lonelyking011` hoặc tài khoản anh trong bảng điều khiển.

## Ghi chú

- Bản web trên Vercel dùng ảnh nền hall.jpg (raw GitHub).  
- Bản LIVE đầy đủ (100 chỗ, sprite Phật tử, TTS) chạy **local** theo hướng dẫn trên.  
- Không cần repo mới — giữ `chua-tinh-tam` cho web; dùng `chanh-dien-online/live` khi phát sóng.
