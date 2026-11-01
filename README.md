# Chùa Tịnh Tâm – Hệ thống Live hoàn chỉnh

## Đã có đủ

### Bảng quy tắc tương tác (như ảnh)
| Sự kiện | Nghi thức | Công đức |
|---------|-----------|----------|
| Thả tim | Gõ mõ + sóng Phật tử | +1 |
| Follow / Share | Thỉnh Đại Hồng Chung | +10 |
| Comment thắp hương / bái phật | Thắp hương, 3 lạy | +15 |
| Comment cầu nguyện / nam mô | Thả Đèn Hoa Đăng | +10 |
| Comment xin xăm / gieo quẻ | Lắc ống xăm | +10 |
| Quà 1–4 xu | Hoa sen vàng | theo xu |
| Quà 5–99 xu | Mâm ngũ quả + chuông | theo xu |
| Quà ≥100 xu | Đại Lễ Kim Long | theo xu |

### Bảng điều khiển
- Giả lập Like / Follow / Comment / Tặng quà
- Nhận diện từ khóa trong bình luận
- Nút RPC nghi thức (Thắp hương, Thả đèn, Gõ mõ, Thỉnh chuông, Xin xăm, Đại Lễ…)
- Bảng **TẤM LÒNG THÀNH** realtime
- Nhật ký nghi thức
- TTS giọng đọc (Web Speech API)

### Khác
- Tab **Tour 360°** (VirtualTour360)
- Scene chánh điện + hiệu ứng nghi thức

## Chạy

```bash
git clone https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam.git
cd chua-tinh-tam
npm install
npm run dev
```

Mở http://localhost:3000

## Repo
https://github.com/nguyenxuandat20091985-rgb/chua-tinh-tam

## Ghi chú TikTok Live thật
Phần kết nối phòng TikTok Live realtime (like/comment/gift từ API) cần connector bên ngoài (Bun + TikTok Live library / service). Code hiện tại đã có **engine quy tắc + RPC + giả lập** sẵn sàng gắn connector: mỗi sự kiện TikTok gọi `processLike` / `processComment` / `processGift` là chạy đủ nghi thức + công đức.
