# 🎴 Hướng Dẫn Shoe System

## Shoe Là Gì?

**Shoe** (giày bài) là thiết bị chứa bài trong Baccarat. Mỗi shoe chứa:
- **8 bộ bài × 52 lá = 416 lá bài**
- Mỗi shoe thường có **60-80 phiên chơi** (hands)
- Trung bình: **~68 phiên/shoe**

## Tại Sao Phải Theo Dõi Shoe?

### 1. Pattern Chỉ Có Ý Nghĩa Trong 1 Shoe
- Các lá bài còn lại ảnh hưởng đến kết quả
- Pattern trong shoe A không liên quan gì đến shoe B
- Sau khi shuffle → bắt đầu lại từ đầu

### 2. Composition-Dependent
Baccarat có một chút card counting:
- Nhiều lá nhỏ (A,2,3,4) → Banker có lợi thế
- Nhiều lá to (6,7,8,9,10,J,Q,K) → Player có lợi thế
- Tuy nhiên, tác động rất nhỏ (~0.5%)

### 3. Phân Tích Chính Xác Hơn
- Đầu shoe (0-15 phiên): Ít data, dự đoán kém
- Giữa shoe (15-55 phiên): Đủ data, pattern rõ
- Cuối shoe (55-80 phiên): Data nhiều nhưng sắp reset

## Cách Sử Dụng

### Bắt Đầu Shoe Mới
1. Khi vào casino/bắt đầu chơi
2. Khi thấy dealer shuffle bài
3. Nhấn **🎴 Shoe Mới** trong app

### Trong Quá Trình Chơi
- Nhập từng kết quả B/P/T
- Theo dõi progress bar (X/80 phiên)
- Xem dự đoán cập nhật theo thời gian thực

### Khi Gần Hết Shoe
**Màu cảnh báo:**
- 🟦 Xanh (0-59): Bình thường
- 🟧 Cam (60-79): Sắp hết shoe
- 🟥 Đỏ (80+): Nên reset ngay

**Lưu ý:** Một số casino cut 14-20 lá cuối → shoe có thể ngắn hơn

### Khi Shuffle
1. Nhấn **🎴 Shoe Mới**
2. Data cũ tự động lưu vào lịch sử
3. Bắt đầu shoe mới từ phiên 1

## Thống Kê Shoe

### Xem Lịch Sử
Phần **🎴 Lịch Sử Các Shoe** hiển thị:
- 5 shoe gần nhất
- Số phiên mỗi shoe
- Tỷ lệ B/P/T từng shoe
- Shoe đang chơi (highlight)

### So Sánh Shoes
Bạn có thể:
- So sánh tỷ lệ B/P giữa các shoe
- Tìm xu hướng chung
- Phát hiện shoe "nóng" (hot shoe)

## Tips Thực Tế

### 1. Đầu Shoe (Phiên 1-20)
- ❌ Không nên tin dự đoán quá nhiều
- ✅ Chỉ theo dõi và ghi chép
- ✅ Chờ pattern rõ ràng hơn

### 2. Giữa Shoe (Phiên 20-55)
- ✅ Thời điểm tốt nhất để dựa vào dự đoán
- ✅ Pattern đã rõ ràng
- ✅ Còn nhiều phiên để chơi

### 3. Cuối Shoe (Phiên 55-80)
- ⚠️ Sắp shuffle, pattern có thể thay đổi
- ⚠️ Dealers thường "burn" thêm bài
- ✅ Tốt cho backtesting (đã có đủ data)

## FAQ

### Q: Có cần reset đúng 60 hay 80 phiên?
**A:** Không! Chỉ reset khi **dealer shuffle bài**. Mỗi casino khác nhau, có thể 55-80 phiên.

### Q: Quên reset shoe thì sao?
**A:** Có thể reset ngay, data cũ vẫn được lưu. Hoặc tiếp tục nhập, app vẫn cảnh báo.

### Q: Nên xóa shoe cũ không?
**A:** Không! Giữ lịch sử để:
- So sánh xu hướng
- Backtesting
- Phân tích độ chính xác

### Q: Import data từ shoe khác được không?
**A:** Được! Dùng Import/Export để:
- Backup data
- Chia sẻ với team
- Phân tích offline

### Q: App có tự động reset shoe không?
**A:** Không! Bạn phải nhấn **🎴 Shoe Mới** thủ công khi thấy shuffle.

## Chiến Lược Theo Shoe

### Chiến Lược 1: Wait & See
```
Phiên 1-20:   Chỉ quan sát, bet tối thiểu
Phiên 20-55:  Bet theo dự đoán tổng hợp
Phiên 55+:    Giảm bet, chuẩn bị shoe mới
```

### Chiến Lược 2: Pattern Following
```
Tìm pattern trong 10-20 phiên đầu
Nếu pattern rõ → follow
Nếu pattern không rõ → chờ shoe khác
```

### Chiến Lược 3: Shoe Comparison
```
So sánh shoe hiện tại với 3-5 shoe trước
Nếu tương tự → áp dụng strategy từ shoe trước
Nếu khác → điều chỉnh strategy
```

## Công Thức Tính

### Số Phiên Trung Bình/Shoe
```
Cards per shoe: 416
Cards per hand: ~4.94 (average)
Burned cards: ~14
Usable cards: ~402

Average hands = 402 / 4.94 ≈ 81 hands

Thực tế: 60-80 hands (casino thường cut sớm hơn)
```

### Xác Suất Trong Shoe
```
P(Banker) = Hands với B / Total hands trong shoe
P(Player) = Hands với P / Total hands trong shoe
P(Tie) = Hands với T / Total hands trong shoe

Lưu ý: Chỉ tính trong shoe hiện tại!
```

## Tóm Tắt

✅ **LUÔN** reset khi shuffle
✅ **THEO DÕI** progress bar
✅ **LƯU** lịch sử shoes
✅ **SO SÁNH** các shoes với nhau
❌ **KHÔNG** dùng data từ shoe khác
❌ **KHÔNG** tin dự đoán ở đầu shoe
❌ **KHÔNG** quên xuất backup

---

**Chúc bạn chơi may mắn và có trách nhiệm! 🍀**
