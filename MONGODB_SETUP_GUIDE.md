# 🔧 MongoDB Atlas Network Access Setup

## Vấn đề hiện tại
Backend không thể kết nối đến MongoDB Atlas vì IP của bạn chưa được whitelist.

## IP hiện tại của bạn
```
101.115.13.27
```

---

## 📋 Hướng dẫn từng bước

### Bước 1: Truy cập MongoDB Atlas
1. Mở trình duyệt và truy cập: https://cloud.mongodb.com
2. Đăng nhập bằng tài khoản của bạn

### Bước 2: Vào Network Access
1. Ở menu bên trái, click vào **"Network Access"** (trong mục Security)
2. Bạn sẽ thấy danh sách các IP đã được whitelist

### Bước 3: Thêm IP Address
1. Click nút **"ADD IP ADDRESS"** (màu xanh lá)
2. Một modal sẽ hiện ra với 2 lựa chọn:

#### Option A: Cho phép IP cụ thể (Khuyến nghị cho production)
- Chọn **"Add Current IP Address"** hoặc nhập thủ công:
  ```
  101.115.13.27
  ```
- Comment: `Development Machine`
- Click **"Confirm"**

#### Option B: Cho phép tất cả IP (Dễ nhất cho development)
- Click **"ALLOW ACCESS FROM ANYWHERE"**
- Hệ thống sẽ tự động điền: `0.0.0.0/0`
- Comment: `Allow all IPs for development`
- Click **"Confirm"**

### Bước 4: Đợi cập nhật
- MongoDB Atlas sẽ mất khoảng **30-60 giây** để cập nhật cấu hình
- Bạn sẽ thấy status chuyển từ "Pending" → "Active"

### Bước 5: Xác nhận kết nối
Sau khi IP được thêm vào whitelist, quay lại terminal và chạy:

```bash
cd /Users/kaytran/flowrite-app
npm run seed
```

Nếu thành công, bạn sẽ thấy:
```
✅ MongoDB Connected Successfully
Database seeded successfully!
```

---

## 🔍 Kiểm tra nhanh

Sau khi cấu hình xong, chạy lệnh này để test kết nối:

```bash
cd backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });"
```

---

## ⚠️ Lưu ý bảo mật

- **Development**: Sử dụng `0.0.0.0/0` (cho phép tất cả) để tiện test
- **Production**: CHỈ whitelist IP cụ thể của server production
- Nếu IP của bạn thay đổi (do ISP), bạn cần cập nhật lại whitelist

---

## 🆘 Nếu vẫn gặp lỗi

1. **Kiểm tra Connection String**: Đảm bảo `MONGODB_URI` trong `.env` đúng format
2. **Kiểm tra Username/Password**: Không có ký tự đặc biệt chưa được encode
3. **Kiểm tra Cluster**: Cluster phải ở trạng thái "Active"

---

**Sau khi hoàn tất, hãy cho tôi biết để tôi tiếp tục kiểm tra toàn bộ hệ thống!** ✅
