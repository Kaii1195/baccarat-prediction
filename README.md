# 🎰 Baccarat Prediction System

Hệ thống dự đoán kết quả Baccarat sử dụng nhiều phương pháp thống kê và xác suất.

## 🎴 Về Baccarat và Shoe System

### Cấu trúc Game Baccarat
- **8 bộ bài × 52 lá = 416 lá bài**
- Mỗi **shoe** (ván chơi) có khoảng **60-80 phiên** (hands)
- Sau mỗi shoe → Shuffle lại → Pattern reset
- Hệ thống này theo dõi từng shoe riêng biệt

### Tại Sao Shoe Quan Trọng?
- Mỗi shoe là một "phiên chơi" độc lập
- Pattern chỉ có ý nghĩa trong cùng 1 shoe
- Khi shuffle → Dữ liệu cũ không còn liên quan
- Phân tích đúng shoe giúp dự đoán chính xác hơn

## ✨ Tính Năng

### 📊 Phân Tích Đa Phương Pháp
1. **Phân Tích Tần Suất** - Dựa trên tỷ lệ xuất hiện tổng thể
2. **Nhận Dạng Mẫu** - Tìm kiếm pattern lặp lại trong lịch sử
3. **Phân Tích Chuỗi** - Dự đoán dựa trên streak hiện tại
4. **Chuỗi Markov** - Xác suất chuyển trạng thái
5. **Hot/Cold Analysis** - Xu hướng trong 10 ván gần nhất
6. **Dự Đoán Tổng Hợp** - Kết hợp tất cả phương pháp

### ✨ Tính Năng Khác
- ✅ Nhập kết quả nhanh chóng (B/P/T)
- ✅ **Shoe Tracking** - Theo dõi từng shoe riêng biệt
- ✅ **Progress Bar** - Hiển thị tiến độ shoe (X/80 phiên)
- ✅ **Reset Shoe** - Bắt đầu shoe mới khi shuffle
- ✅ **Shoe History** - Xem thống kê 5 shoe gần nhất
- ✅ Lưu tự động trong trình duyệt (LocalStorage)
- ✅ Thống kê chi tiết
- ✅ Hiển thị lịch sử trực quan
- ✅ Import/Export dữ liệu JSON
- ✅ Tính toán độ chính xác dự đoán
- ✅ Giao diện responsive (mobile-friendly)
- ✅ Dark theme chuyên nghiệp

## 🚀 Cách Sử Dụng

### Bước 1: Mở File
1. Tìm file `index.html` trong thư mục
2. Nhấp đúp để mở bằng trình duyệt
3. **HOẶC** kéo thả file vào cửa sổ trình duyệt

### Bước 2: Nhập Dữ Liệu

**Theo dõi Shoe:**
- Màn hình hiển thị **Shoe #X** và **Y/80 phiên**
- Progress bar cho biết % hoàn thành shoe
- Màu thay đổi khi gần hết shoe:
  - Xanh (0-59 phiên): Bình thường
  - Cam (60-79 phiên): Cảnh báo gần hết
  - Đỏ (80+ phiên): Nên reset

**Nhập kết quả:**
- Nhấn **🔵 Banker (B)** nếu Banker thắng
- Nhấn **🔴 Player (P)** nếu Player thắng  
- Nhấn **🟢 Tie (T)** nếu hòa

**Khi shuffle (shoe mới):**
- Nhấn **🎴 Shoe Mới** để bắt đầu shoe tiếp theo
- Dữ liệu cũ được lưu vào lịch sử
- Bắt đầu phân tích từ đầu với shoe mới

### Bước 3: Xem Dự Đoán
- Sau khi nhập ít nhất **3 kết quả**, hệ thống sẽ bắt đầu dự đoán
- Mỗi phương pháp hiển thị:
  - Kết quả dự đoán (B/P/T)
  - Độ tin cậy (%)

### Bước 4: Theo Dõi Thống Kê
- **Thống Kê**: Tổng số ván, tỷ lệ B/P/T
- **Lịch Sử**: Xem tất cả kết quả đã nhập
- **Phân Tích Chi Tiết**: Chuỗi dài nhất, mẫu phổ biến, độ chính xác

## 📋 Các Phương Pháp Dự Đoán

### 1️⃣ Phân Tích Tần Suất
**Cách hoạt động:** Dự đoán kết quả xuất hiện nhiều nhất trong toàn bộ lịch sử.

**Ví dụ:** 
- Nếu Banker thắng 60 lần, Player 40 lần → Dự đoán: Banker
- Độ tin cậy: 60%

**Ưu điểm:** Đơn giản, ổn định  
**Nhược điểm:** Không xét xu hướng gần đây

---

### 2️⃣ Nhận Dạng Mẫu (Pattern Recognition)
**Cách hoạt động:** Tìm các mẫu 3 ván gần đây giống với mẫu đã xuất hiện trước đó.

**Ví dụ:**
- Lịch sử: `...B-P-P-B-P-P-?`
- Tìm thấy mẫu `B-P-P` đã xuất hiện 3 lần trước đó
- Sau `B-P-P`: 2 lần là B, 1 lần là P
- Dự đoán: Banker (confidence 67%)

**Ưu điểm:** Tốt khi có pattern rõ ràng  
**Nhược điểm:** Cần nhiều dữ liệu

---

### 3️⃣ Phân Tích Chuỗi (Streak Analysis)
**Cách hoạt động:** 
- Nếu chuỗi ngắn (1-2): Dự đoán tiếp tục
- Nếu chuỗi dài (≥3): Dự đoán đảo chiều

**Ví dụ:**
- Chuỗi hiện tại: `B-B` → Dự đoán: B (tiếp tục)
- Chuỗi hiện tại: `B-B-B-B` → Dự đoán: P (đảo chiều)

**Ưu điểm:** Phản ánh xu hướng ngắn hạn  
**Nhược điểm:** Chỉ xét yếu tố streak

---

### 4️⃣ Chuỗi Markov (Markov Chain)
**Cách hoạt động:** Tính xác suất chuyển đổi từ trạng thái này sang trạng thái khác.

**Ví dụ:**
- Sau B: 30 lần → B, 20 lần → P, 5 lần → T
- Xác suất: B→B (54%), B→P (36%), B→T (10%)
- Nếu ván cuối là B → Dự đoán: B (54%)

**Ưu điểm:** Xác suất có cơ sở toán học  
**Nhược điểm:** Cần nhiều dữ liệu transition

---

### 5️⃣ Hot/Cold Analysis
**Cách hoạt động:** Xét 10 ván gần nhất, dự đoán kết quả "nóng" (xuất hiện nhiều).

**Ví dụ:**
- 10 ván gần nhất: B-B-P-B-B-B-P-B-P-B
- Banker: 7 lần (70%), Player: 3 lần (30%)
- Dự đoán: Banker

**Ưu điểm:** Nắm bắt xu hướng ngắn hạn  
**Nhược điểm:** Bị ảnh hưởng nhiều bởi noise

---

### 6️⃣ Dự Đoán Tổng Hợp (Composite)
**Cách hoạt động:** Kết hợp tất cả 5 phương pháp trên với trọng số.

**Công thức:**
```
Score(X) = Σ (Vote(X) × Confidence(X))
Kết quả = argmax(Score)
```

**Ví dụ:**
- Frequency: B (60%), Pattern: B (70%), Streak: P (65%), Markov: B (54%), HotCold: B (70%)
- Vote B: 4/5, avg confidence: 63.5%
- Vote P: 1/5, confidence: 65%
- → Dự đoán: Banker

**Ưu điểm:** Cân bằng nhiều góc nhìn  
**Nhược điểm:** Phức tạp hơn

## 🛠️ Các Chức Năng Bổ Sung

### ↩️ Hoàn Tác
Xóa kết quả vừa nhập (nếu nhập nhầm)

### 🎴 Shoe Mới
- Bắt đầu shoe mới khi casino shuffle bài
- Lưu thống kê shoe cũ vào lịch sử
- Reset các prediction cho shoe mới
- **Quan trọng:** Luôn reset khi shuffle!

### 🗑️ Xóa Tất Cả
Xóa toàn bộ dữ liệu (tất cả shoes) và bắt đầu lại từ đầu

### 💾 Xuất Dữ Liệu
Lưu lịch sử (bao gồm tất cả shoes) thành file JSON để backup hoặc chia sẻ

### 📂 Nhập Dữ Liệu
Import file JSON đã xuất trước đó

## 📱 Responsive Design

Giao diện tự động điều chỉnh cho:
- 💻 Desktop (full features)
- 📱 Tablet (optimized layout)
- 📱 Mobile (one column)

## 🔒 Bảo Mật & Riêng Tư

- ✅ **100% Local** - Không gửi dữ liệu lên server
- ✅ **LocalStorage** - Lưu trong trình duyệt của bạn
- ✅ **Không cần đăng nhập**
- ✅ **Hoạt động offline**

## ⚠️ Lưu Ý Quan Trọng

### 1. Baccarat là trò chơi may rủi
- Mỗi ván bài là **độc lập**
- Không có phương pháp nào đảm bảo 100% chính xác
- Casino luôn có lợi thế (house edge)

### 2. Công cụ này chỉ mang tính tham khảo
- Dùng để **phân tích thống kê**
- Không nên dựa hoàn toàn vào dự đoán
- Chơi có trách nhiệm

### 3. Về Shoe System
- **Luôn reset** khi casino shuffle bài
- Phân tích chỉ có ý nghĩa trong **cùng 1 shoe**
- Pattern từ shoe cũ **không áp dụng** cho shoe mới
- Mỗi shoe: 60-80 phiên (trung bình ~68 phiên)

### 4. Nguyên tắc xác suất
- **Banker**: ~45.86% (house edge 1.06%)
- **Player**: ~44.62% (house edge 1.24%)
- **Tie**: ~9.52% (house edge 14.36%)

### 5. Độ chính xác
- Với ít dữ liệu (<10 phiên): Độ chính xác thấp
- Với nhiều dữ liệu (>30 phiên trong shoe): Xu hướng rõ hơn
- Thường đạt 45-55% accuracy (tương đương random nếu game fair)
- Độ chính xác cao nhất ở giữa shoe (phiên 20-50)

## 🎨 Tùy Chỉnh

### Thay đổi màu sắc
Mở file `style.css`, tìm `:root` và chỉnh:
```css
:root {
    --banker-color: #3498db;  /* Màu Banker */
    --player-color: #e74c3c;  /* Màu Player */
    --tie-color: #2ecc71;     /* Màu Tie */
}
```

### Thay đổi số ván cho Hot/Cold
Mở file `app.js`, tìm hàm `predictByHotCold()`:
```javascript
const recentGames = 10; // Đổi thành 15, 20, etc.
```

## 🐛 Xử Lý Lỗi

### Dữ liệu bị mất?
- Dữ liệu lưu trong **LocalStorage** của trình duyệt
- Nếu xóa cache/cookies → mất dữ liệu
- **Giải pháp**: Xuất dữ liệu thường xuyên (💾 Xuất Dữ Liệu)

### Khi nào nên Reset Shoe?
- Khi casino shuffle bài (bắt đầu shoe mới)
- Khi đã đạt 70-80 phiên (gần hết bài)
- Khi muốn bắt đầu phân tích mới

### Dự đoán không chính xác?
- Kiểm tra xem có đủ dữ liệu không (cần ≥3 phiên)
- Đảm bảo đang trong cùng 1 shoe (chưa shuffle)
- Lưu ý: Accuracy thấp ở đầu shoe là bình thường

### Dự đoán không hiển thị?
- Cần ít nhất **3 kết quả** để bắt đầu dự đoán
- Kiểm tra Console (F12) xem có lỗi không

### File không mở được?
- Đảm bảo 3 file (`index.html`, `style.css`, `app.js`) trong cùng thư mục
- Thử trình duyệt khác (Chrome, Firefox, Edge)

## 🚀 Nâng Cấp Sau Này

### Có thể thêm:
- 📊 Biểu đồ trực quan (Chart.js) - Roadmap, Bead Plate
- 🤖 Machine Learning model (TensorFlow.js)
- 🎵 Âm thanh thông báo
- 🌐 Ngôn ngữ đa quốc gia
- 💾 Lưu nhiều session khác nhau
- 📈 Backtesting (test độ chính xác với data cũ)
- 🔔 Cảnh báo thông minh (hot streak, pattern match)
- 📱 PWA (Progressive Web App) - cài đặt như app
- 🎴 Roadmap visualization (Big Road, Big Eye Boy, etc.)

### Giải thích Roadmap:
Trong casino thực, có nhiều loại roadmap:
- **Big Road** - Hiển thị kết quả theo cột
- **Bead Plate** - Lưới 6 hàng
- **Big Eye Boy / Small Road / Cockroach Pig** - Pattern derivatives

→ Có thể implement sau nếu cần!

### Deploy lên web:
1. **GitHub Pages** (miễn phí):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
   Sau đó bật GitHub Pages trong Settings

2. **Netlify/Vercel** (miễn phí):
   - Kéo thả thư mục vào trang web
   - Tự động deploy

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12 → Console)
2. Đảm bảo đã nhập đủ dữ liệu (≥3 ván)
3. Thử xóa LocalStorage: `localStorage.clear()`

## 📄 License

MIT License - Sử dụng tự do cho mục đích cá nhân và học tập.

---

**Chúc bạn may mắn! 🍀**

*Nhớ: Chơi có trách nhiệm - Đừng đánh bạc quá khả năng của bạn!*
