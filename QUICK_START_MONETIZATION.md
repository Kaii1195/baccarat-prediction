# 🚀 QUICK START - Bán Tool & Quản Lý Thành Viên

## 📁 FILES MỚI ĐÃ TẠO:

1. **contact.html** - Trang liên hệ & bảng giá
   - 📱 Telegram, Zalo, Email, Facebook
   - 💎 3 gói: FREE, PRO, VIP
   - 🎁 Promotion section

2. **login.html** - Trang đăng nhập/đăng ký
   - Email/Password auth
   - Google/Facebook login (sẵn sàng)
   - UI đẹp, responsive

3. **MONETIZATION_GUIDE.md** - Hướng dẫn chi tiết setup
   - Firebase Authentication
   - Stripe Payment
   - License Key System
   - VNPay/Momo integration

---

## 🎯 3 CÁCH BÁN TOOL (TỪ DỄ → KHÓ):

### **CÁCH 1: MANUAL (Dễ nhất - Làm ngay được)**
```
1. User inbox Telegram/Zalo
2. Bạn gửi banking info
3. User chuyển khoản
4. Bạn gửi License Key
5. User nhập key vào tool
```

**Ưu điểm:** Không cần code gì thêm, làm ngay  
**Nhược điểm:** Thủ công, không scale

---

### **CÁCH 2: LICENSE KEY + FIREBASE (Khuyên dùng)**
```
1. Setup Firebase (30 phút)
2. Lưu license keys trong database
3. User mua → auto generate key
4. Key có hạn (1 tháng/1 năm)
5. Tool auto check key hợp lệ
```

**Ưu điểm:** Semi-auto, FREE, dễ setup  
**Nhược điểm:** Vẫn cần manual confirm payment

**Files cần:**
- `firebase-config.js` (tạo theo guide)
- Update `app.js` để check license
- Firebase Console setup (FREE)

---

### **CÁCH 3: FULL AUTO (Chuyên nghiệp)**
```
1. Firebase Auth (Đăng nhập/Đăng ký)
2. Stripe/VNPay (Thanh toán online)
3. Auto activate subscription
4. Auto renew hàng tháng
5. Dashboard quản lý users
```

**Ưu điểm:** 100% tự động, scale tốt  
**Nhược điểm:** Phức tạp, cần backend

---

## 💰 BẢNG GIÁ ĐỀ XUẤT:

```
🆓 FREE TIER
├─ 30 predictions/ngày
├─ 3 phương pháp cơ bản
├─ Lưu 1 shoe
└─ Không export

💎 PRO - $9.99/tháng
├─ Unlimited predictions
├─ Tất cả 6 phương pháp
├─ Advanced statistics
├─ Export CSV/JSON
└─ Priority support

👑 VIP - $29.99/tháng
├─ Tất cả PRO
├─ AI predictions
├─ Live signals
├─ Telegram VIP group
└─ 1-on-1 coaching
```

---

## 📱 THÔNG TIN LIÊN HỆ CẦN CẬP NHẬT:

Sửa trong `contact.html`:

```html
<!-- Line 37-40: Telegram -->
<a href="https://t.me/YOUR_USERNAME">@YOUR_TELEGRAM</a>

<!-- Line 46: Zalo -->
<a href="https://zalo.me/YOUR_NUMBER">YOUR_PHONE</a>

<!-- Line 54: Email -->
<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a>

<!-- Line 62: Facebook -->
<a href="https://fb.com/YOUR_PAGE">YOUR_FB_PAGE</a>
```

---

## 🔑 SETUP NHANH LICENSE KEY (5 PHÚT):

### **Bước 1:** Thêm vào đầu `app.js`:

```javascript
// Check license on load
window.addEventListener('DOMContentLoaded', () => {
    const licenseKey = localStorage.getItem('dadoLicenseKey');
    
    if (!licenseKey) {
        showLicensePopup();
    } else {
        validateLicense(licenseKey);
    }
});

function showLicensePopup() {
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    overlay.innerHTML = `
        <div style="background: var(--bg-card); padding: 40px; border-radius: 20px; max-width: 500px; text-align: center;">
            <h2 style="color: var(--tie-color); margin-bottom: 20px;">🔐 Nhập License Key</h2>
            <p style="color: var(--text-secondary); margin-bottom: 30px;">
                Liên hệ <strong style="color: white;">Telegram: @DADO_Support</strong><br>
                để mua License Key
            </p>
            <input type="text" id="licenseInput" placeholder="DADO-PRO-XXXX-XXXX" 
                style="width: 100%; padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 10px; color: white; font-size: 1.1em; margin-bottom: 20px;">
            <button onclick="submitLicense()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, var(--banker-color), var(--player-color)); border: none; border-radius: 10px; color: white; font-size: 1.1em; cursor: pointer;">
                ✅ Kích Hoạt
            </button>
            <div style="margin-top: 20px;">
                <a href="contact.html" style="color: var(--tie-color); text-decoration: none;">📞 Liên hệ mua key</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function submitLicense() {
    const key = document.getElementById('licenseInput').value.trim();
    
    if (!key) {
        alert('❌ Vui lòng nhập License Key!');
        return;
    }
    
    validateLicense(key);
}

function validateLicense(key) {
    // Valid license keys
    const validKeys = {
        'DADO-FREE-2025-DEMO': { plan: 'free', expires: '2025-12-31' },
        'DADO-PRO-2025-ABC123': { plan: 'pro', expires: '2025-12-31' },
        'DADO-VIP-2025-XYZ789': { plan: 'vip', expires: '2025-12-31' },
    };
    
    if (validKeys[key]) {
        const license = validKeys[key];
        const expireDate = new Date(license.expires);
        
        if (expireDate > new Date()) {
            localStorage.setItem('dadoLicenseKey', key);
            localStorage.setItem('dadoPlan', license.plan);
            
            alert(`✅ Kích hoạt thành công!\nGói: ${license.plan.toUpperCase()}\nHạn đến: ${license.expires}`);
            
            // Remove popup
            document.querySelector('div[style*="rgba(0,0,0,0.9)"]')?.remove();
            
            // Apply plan features
            applyPlanFeatures(license.plan);
        } else {
            alert('⚠️ License Key đã hết hạn!\nLiên hệ Telegram: @DADO_Support');
        }
    } else {
        alert('❌ License Key không hợp lệ!\n\nLiên hệ Telegram: @DADO_Support để mua key chính hãng.');
    }
}

function applyPlanFeatures(plan) {
    if (plan === 'free') {
        // Giới hạn 30 predictions/ngày
        console.log('FREE plan activated - Limited to 30 predictions/day');
    } else if (plan === 'pro') {
        console.log('PRO plan activated - Unlimited predictions');
    } else if (plan === 'vip') {
        console.log('VIP plan activated - All features unlocked');
    }
}
```

### **Bước 2:** Test với demo keys:
```
FREE: DADO-FREE-2025-DEMO
PRO:  DADO-PRO-2025-ABC123
VIP:  DADO-VIP-2025-XYZ789
```

---

## 🎯 NEXT STEPS:

### **Ngay bây giờ:**
1. ✅ Sửa thông tin liên hệ trong `contact.html`
2. ✅ Deploy lên GitHub Pages (chạy `deploy.ps1`)
3. ✅ Test tool trên website online

### **Tuần tới:**
1. ⬜ Setup Firebase (nếu muốn auto)
2. ⬜ Tạo Telegram group support
3. ⬜ Marketing - share link trong groups

### **Tháng tới:**
1. ⬜ Thu thập feedback từ users
2. ⬜ Improve features
3. ⬜ Scale up với payment gateway

---

## 📞 LIÊN HỆ CHUẨN BỊ:

Cần chuẩn bị:
- ✅ Telegram account để support
- ✅ Zalo account
- ✅ Email riêng cho business
- ✅ Facebook page (optional)
- ✅ Tài khoản ngân hàng nhận tiền

---

## 💡 TIPS BÁN HÀNG:

1. **Offer trial** - Cho dùng thử 7 ngày PRO
2. **Guarantee** - "Không hài lòng hoàn tiền 100%"
3. **Testimonials** - Nhờ bạn bè review
4. **Support tốt** - Reply nhanh, nhiệt tình
5. **Updates thường xuyên** - Thêm features mới

---

**Cần giúp thêm gì không?** 🚀
