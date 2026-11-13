# 🎮 GameH5 Pro - Nền Tảng Game Web H5 & 3D WebGL

Dự án Cổng trò chơi trực tuyến tích hợp:
- **43 Game Việt (JOYDIGI Studio)** tự host độc lập (bao gồm *Nhà Tù Online*, *Đi Chùa Online*, *Cờ Tướng*, *Đám Cưới Online*...).
- **212 Game Online phổ thông** (GameMonetize, GameDistribution...) nhúng iframe responsive.
- Giao diện Web Portal chuẩn phong cách **GameH5.io / Kizi Theme** (tối ưu Desktop, Mobile, tìm kiếm realtime, phân loại thông minh).

---

## 📁 Cấu Trúc Dự Án

```
game-portal-project/
├── public/
│   ├── index.html         # Giao diện Web Portal chuẩn GameH5.io
│   ├── data/
│   │   └── games.json     # Metadata của toàn bộ 255 game
│   ├── thumbnails/        # Ảnh thumbnail của các game
│   └── games/             # Toàn bộ mã nguồn & asset của 43 Game Việt
│       ├── nha-tu-online/ # Game Nhà Tù Online (Client + Server)
│       ├── di-chua-online/# Game Đi Chùa Online
│       └── ...
└── scripts/               # Bộ công cụ crawl và patch asset
```

---

## 🚀 Hướng Dẫn Triển Khai (Deployment)

### Cách 1: Deploy lên Vercel / Cloudflare Pages (Khuyên Dùng)
1. Tạo Repo mới trên GitHub cá nhân của bạn (ví dụ: `gameh5-portal`).
2. Đẩy toàn bộ thư mục `public/` hoặc cả dự án lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial game portal with 255 games"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. Kết nối repo với **Vercel** hoặc **Cloudflare Pages**:
   - **Root Directory**: `public` (hoặc để mặc định).
   - Trang web sẽ chạy với CDN toàn cầu, băng thông không giới hạn và hỗ trợ HTTPS tự động.

### Cách 2: Chạy trực tiếp trên VPS (Nginx / Caddy / Coolify)
Chỉ cần trỏ Web Server tĩnh về thư mục `/root/game-portal-project/public`.
Ví dụ Caddy:
```caddy
game.yourdomain.com {
    root * /root/game-portal-project/public
    file_server
}
```
