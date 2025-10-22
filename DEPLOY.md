# 🚀 Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Cài đặt Git (nếu chưa có)

Download Git tại: https://git-scm.com/download/win

## Bước 2: Tạo GitHub Account

Đăng ký tại: https://github.com/signup

## Bước 3: Tạo Repository mới

1. Vào https://github.com/new
2. Repository name: `Baccarat-Prediction`
3. Description: `🎰 Baccarat Prediction System with AI Statistics`
4. Chọn **Public** (bắt buộc cho GitHub Pages free)
5. **KHÔNG** chọn "Add README" (đã có sẵn)
6. Click **Create repository**

## Bước 4: Upload Code

### Cách 1: Command Line (Khuyến nghị)

Mở PowerShell tại thư mục `E:\CODE.DEV\Prediction`:

```powershell
# Khởi tạo git
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "🎰 Initial commit - Baccarat Prediction System"

# Thêm remote (thay YOUR-USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR-USERNAME/Baccarat-Prediction.git

# Đổi branch sang main
git branch -M main

# Push lên GitHub
git push -u origin main
```

**Lưu ý:** Nếu hỏi username/password:
- Username: Tên GitHub của bạn
- Password: Dùng **Personal Access Token** (không phải password GitHub)
  - Tạo token tại: https://github.com/settings/tokens
  - Chọn: `repo` permissions
  - Copy token và paste vào terminal

### Cách 2: GitHub Desktop (Dễ hơn)

1. Download GitHub Desktop: https://desktop.github.com/
2. Đăng nhập GitHub
3. Click **Add** → **Add Existing Repository**
4. Chọn folder `E:\CODE.DEV\Prediction`
5. Click **Publish repository**

### Cách 3: Upload trực tiếp (Đơn giản nhất)

1. Vào repo vừa tạo
2. Click **Add file** → **Upload files**
3. Kéo thả 3 files: `index.html`, `style.css`, `app.js`
4. Commit changes

## Bước 5: Enable GitHub Pages

1. Vào repo: `https://github.com/YOUR-USERNAME/Baccarat-Prediction`
2. Click tab **Settings** (⚙️)
3. Sidebar trái → Click **Pages**
4. **Source**: Chọn **Deploy from a branch**
5. **Branch**: Chọn `main` và folder `/ (root)`
6. Click **Save**
7. Đợi 1-2 phút

## Bước 6: Truy cập Website

Link của bạn sẽ là:
```
https://YOUR-USERNAME.github.io/Baccarat-Prediction/
```

Ví dụ: 
- Username: `john-doe`
- Link: `https://john-doe.github.io/Baccarat-Prediction/`

## 🎉 Xong rồi!

Website đã online và ai cũng có thể truy cập!

## 📱 Chia sẻ

Gửi link cho bạn bè:
```
🎰 Baccarat Prediction System
https://YOUR-USERNAME.github.io/Baccarat-Prediction/

✨ Dự đoán Baccarat với AI
📊 6 phương pháp thống kê
🔒 100% miễn phí & an toàn
```

## 🔄 Update Code

Khi có thay đổi, chỉ cần:

```powershell
git add .
git commit -m "Update: thêm tính năng mới"
git push
```

Website tự động update sau 1-2 phút!

## ⚙️ Tùy chỉnh Domain (Optional)

Muốn domain riêng (VD: `baccarat-prediction.com`)?

1. Mua domain ở: Namecheap, GoDaddy, CloudFlare...
2. Settings → Pages → Custom domain
3. Nhập domain của bạn
4. Config DNS theo hướng dẫn GitHub

## 🆘 Troubleshooting

### Lỗi: "Permission denied"
→ Dùng Personal Access Token thay vì password

### Lỗi: "Repository not found"
→ Check lại username trong URL

### Website hiển thị 404
→ Đợi 5 phút, clear cache browser (Ctrl+F5)

### Code không update
→ Clear cache hoặc mở Incognito mode

## 📞 Cần hỗ trợ?

- GitHub Pages Docs: https://pages.github.com/
- GitHub Support: https://support.github.com/

---

**Good luck! 🚀**
