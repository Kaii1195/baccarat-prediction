# 🔐 Hướng Dẫn Setup Authentication & Payment

## 📋 TỔNG QUAN

Để bán tool và quản lý thành viên, bạn cần:
1. **Authentication** - Đăng nhập/đăng ký
2. **Payment Gateway** - Thanh toán online
3. **Database** - Lưu thông tin user
4. **License Management** - Quản lý license key

---

## 🚀 PHƯƠNG ÁN 1: FIREBASE (KHUYÊN DÙNG - FREE & DỄ)

### **Ưu điểm:**
- ✅ **FREE** cho dự án nhỏ (<10K users)
- ✅ Không cần code backend
- ✅ Setup nhanh (30 phút)
- ✅ Google bảo mật
- ✅ Email, Google, Facebook login

### **Bước 1: Tạo Firebase Project**

1. Vào https://console.firebase.google.com/
2. Click "Add Project" → Đặt tên "DADO-Prediction"
3. Disable Google Analytics (không cần)
4. Click "Create Project"

### **Bước 2: Enable Authentication**

```bash
# Trong Firebase Console:
1. Sidebar → Build → Authentication
2. Click "Get Started"
3. Sign-in method → Enable:
   - Email/Password ✅
   - Google ✅
   - Facebook ✅ (optional)
```

### **Bước 3: Setup Firestore Database**

```bash
1. Sidebar → Build → Firestore Database
2. Click "Create Database"
3. Chọn: Start in PRODUCTION mode
4. Location: asia-southeast1 (Singapore - gần VN nhất)
5. Click "Enable"
```

### **Bước 4: Add Firebase SDK vào website**

Trong Firebase Console:
```
1. Project Settings (⚙️) → General
2. Scroll xuống "Your apps"
3. Click Web icon (</>)
4. Đặt nickname: "DADO Web App"
5. Copy config code
```

Tạo file `firebase-config.js`:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dado-prediction.firebaseapp.com",
  projectId: "dado-prediction",
  storageBucket: "dado-prediction.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, doc, setDoc, getDoc };
```

### **Bước 5: Update login.html**

Thêm vào `<head>`:
```html
<script type="module" src="firebase-config.js"></script>
```

Thay code trong `<script>`:
```javascript
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc } from './firebase-config.js';

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            plan: "free",
            createdAt: new Date(),
            predictionsToday: 0,
            maxPredictions: 30
        });
        
        alert('✅ Đăng ký thành công!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('✅ Đăng nhập thành công!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
});
```

### **Bước 6: Protect Tool - Chỉ user đăng nhập mới dùng được**

Thêm vào đầu `app.js`:
```javascript
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;
let userPlan = 'free';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Load user plan from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        userPlan = userDoc.data().plan;
        
        // Show/hide features based on plan
        applyPlanLimitations();
    } else {
        // Redirect to login
        window.location.href = 'login.html';
    }
});

function applyPlanLimitations() {
    if (userPlan === 'free') {
        // Giới hạn 30 predictions/ngày
        // Ẩn advanced features
        document.querySelector('.advanced-stats').style.display = 'none';
    } else if (userPlan === 'pro') {
        // Unlimited
    }
}
```

---

## 💳 PHƯƠNG ÁN 2: STRIPE PAYMENT

### **Setup Stripe:**

1. Đăng ký: https://dashboard.stripe.com/register
2. Verify tài khoản (cần passport)
3. Get API keys

### **Tạo Checkout Page:**

```html
<!-- pricing.html -->
<button class="buy-btn" onclick="buyPro()">Mua PRO - $9.99/tháng</button>

<script src="https://js.stripe.com/v3/"></script>
<script>
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

async function buyPro() {
    const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
    });
    
    const session = await response.json();
    
    // Redirect to Stripe Checkout
    stripe.redirectToCheckout({ sessionId: session.id });
}
</script>
```

**Backend (Node.js):**
```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'DADO PRO Plan',
                },
                unit_amount: 999, // $9.99
            },
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://yourdomain.com/cancel',
    });
    
    res.json({ id: session.id });
});
```

---

## 🔑 PHƯƠNG ÁN 3: LICENSE KEY SYSTEM (ĐƠN GIẢN NHẤT)

Nếu không muốn tích hợp phức tạp:

### **Cách hoạt động:**
1. User liên hệ Telegram/Zalo
2. User chuyển khoản
3. Bạn gửi License Key qua chat
4. User nhập key vào tool
5. Tool check key hợp lệ → unlock features

### **Code:**

```javascript
// In app.js
function checkLicense() {
    const licenseKey = localStorage.getItem('licenseKey');
    
    if (!licenseKey) {
        showLicensePopup();
        return false;
    }
    
    // Validate license key
    const validKeys = [
        'DADO-PRO-2024-ABC123',
        'DADO-VIP-2024-XYZ789',
        // Load from Firebase or API
    ];
    
    if (validKeys.includes(licenseKey)) {
        return true;
    }
    
    showLicensePopup();
    return false;
}

function showLicensePopup() {
    const key = prompt('Nhập License Key để sử dụng:\n\nLiên hệ Telegram @DADO_Support để mua key');
    
    if (key) {
        localStorage.setItem('licenseKey', key);
        location.reload();
    }
}

// Check on load
if (!checkLicense()) {
    // Giới hạn tính năng
    document.querySelector('.advanced-features').style.display = 'none';
}
```

**Lưu license keys trong Firebase:**
```javascript
// Firebase Firestore structure:
licenses/
  ├─ DADO-PRO-2024-ABC123/
  │   ├─ plan: "pro"
  │   ├─ validUntil: "2025-01-01"
  │   ├─ activations: 1
  │   └─ maxActivations: 3
  │
  └─ DADO-VIP-2024-XYZ789/
      ├─ plan: "vip"
      └─ ...
```

---

## 📊 SO SÁNH CÁC PHƯƠNG ÁN

| Tiêu Chí | Firebase + Stripe | License Key | Email/Zalo Manual |
|----------|-------------------|-------------|-------------------|
| **Độ khó** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Chi phí** | Free → $25/tháng | Free | Free |
| **Tự động** | ✅ 100% | ⚠️ 50% | ❌ 0% |
| **Bảo mật** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Scale** | 10K+ users | 1K users | 100 users |
| **Payment** | Card/Banking | Manual | Manual |

---

## 🎯 KHUYẾN NGHỊ

### **Bắt đầu (0-100 users):**
1. Dùng **License Key System**
2. Thanh toán qua Zalo/Telegram
3. Gửi key thủ công

### **Scale lên (100-1000 users):**
1. Add **Firebase Authentication**
2. Keep License Key
3. Auto-generate key sau khi payment

### **Chuyên nghiệp (1000+ users):**
1. Full **Firebase + Stripe**
2. Auto subscription
3. Dashboard quản lý

---

## 📱 CÁC KÊNH THANH TOÁN TẠI VIỆT NAM

1. **Momo** - API: https://developers.momo.vn/
2. **ZaloPay** - API: https://docs.zalopay.vn/
3. **VNPay** - API: https://sandbox.vnpayment.vn/apis/
4. **Chuyển khoản ngân hàng** (thủ công)
5. **Thẻ cào điện thoại** (qua API của bên thứ 3)

---

## 🔒 BẢO MẬT & PHÁP LÝ

⚠️ **LƯU Ý:**
- Tool liên quan gambling → Cẩn thận với pháp luật VN
- Nên có **Disclaimer** rõ ràng
- Không khuyến khích cá cược
- Chỉ là "công cụ thống kê"

**Disclaimer mẫu:**
```
⚠️ CẢNH BÁO
Tool này chỉ mang tính chất THỐNG KÊ và THAM KHẢO.
Không đảm bảo kết quả chính xác 100%.
Người dùng tự chịu trách nhiệm về quyết định của mình.
Vui lòng tuân thủ pháp luật địa phương.
```

---

## 🚀 ROADMAP PHÁT TRIỂN

### **Phase 1 (Tháng 1):**
- ✅ Tool hoàn chỉnh
- ✅ Landing page
- ⬜ License Key System
- ⬜ Telegram bot support

### **Phase 2 (Tháng 2-3):**
- ⬜ Firebase Auth
- ⬜ User Dashboard
- ⬜ Payment (Momo/ZaloPay)
- ⬜ Subscription plans

### **Phase 3 (Tháng 4-6):**
- ⬜ AI Predictions
- ⬜ Live Signals
- ⬜ Mobile App
- ⬜ Community Forum

---

## 📞 HỖ TRỢ

Cần giúp setup? Liên hệ:
- 📱 Telegram: @DADO_Support
- 📧 Email: support@dado-prediction.com
- 💬 Discord: DADO Community

---

**Created by DADO - 2025**
