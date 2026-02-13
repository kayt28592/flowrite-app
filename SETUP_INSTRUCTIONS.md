# 📋 SETUP INSTRUCTIONS - FLOWRITE

## 🎯 Hướng Dẫn Cài Đặt Chi Tiết (Tiếng Việt)

### Bước 1: Chuẩn Bị Môi Trường

**Yêu cầu hệ thống:**
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- Tài khoản MongoDB Atlas (miễn phí)

**Kiểm tra version:**
```bash
node --version  # Phải >= v20.0.0
npm --version   # Phải >= 10.0.0
git --version   # Bất kỳ version nào
```

### Bước 2: Clone và Cài Đặt Dependencies

```bash
# Clone repository (hoặc unzip file đã tải)
cd flowrite-app

# Cài đặt Backend
cd backend
npm install

# Cài đặt Frontend  
cd ../frontend
npm install
```

### Bước 3: Tạo MongoDB Database

**3.1. Đăng ký MongoDB Atlas:**
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

**3.2. Tạo Cluster:**
1. Chọn "Build a Database"
2. Chọn FREE tier (M0 Sandbox)
3. Chọn Region gần nhất (Singapore cho VN)
4. Đặt tên cluster: `flowrite-cluster`
5. Click "Create"

**3.3. Tạo Database User:**
1. Vào "Database Access"
2. Click "Add New Database User"
3. Username: `flowrite-admin`
4. Password: Tạo password mạnh (LƯU LẠI!)
5. Privileges: "Read and write to any database"
6. Click "Add User"

**3.4. Cấu hình Network:**
1. Vào "Network Access"
2. Click "Add IP Address"
3. Chọn "Allow Access from Anywhere"
4. Click "Confirm"

**3.5. Lấy Connection String:**
1. Vào "Database" → Click "Connect"
2. Chọn "Connect your application"
3. Copy connection string
4. Thay `<password>` bằng password của bạn
5. Thay `<dbname>` bằng `flowrite`

Ví dụ:
```
mongodb+srv://flowrite-admin:YOUR_PASSWORD@flowrite-cluster.xxxxx.mongodb.net/flowrite?retryWrites=true&w=majority
```

### Bước 4: Cấu Hình Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env

# Chỉnh sửa file .env:
nano .env  # hoặc code .env

# Điền các giá trị:
NODE_ENV=development
PORT=5000
MONGODB_URI=<connection_string_từ_bước_3.5>
JWT_SECRET=<generate_bằng_lệnh_dưới>
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=10
```

**Tạo JWT_SECRET ngẫu nhiên:**
```bash
# Trên Mac/Linux:
openssl rand -base64 64

# Trên Windows (PowerShell):
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Copy output và paste vào JWT_SECRET
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env

# File .env mặc định đã OK cho local development
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Flowrite
VITE_APP_VERSION=1.0.0
```

### Bước 5: Chạy Ứng Dụng

**Mở 2 terminal:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Bạn sẽ thấy:
# 🚀 Flowrite API Server
# 📡 Environment: development
# 🌐 Server running on port 5000
# 📦 MongoDB Connected: flowrite-cluster.xxxxx.mongodb.net
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Bạn sẽ thấy:
# VITE v5.2.0  ready in 500 ms
# ➜  Local:   http://localhost:5173/
```

### Bước 6: Truy Cập Ứng Dụng

1. Mở browser: **http://localhost:5173**
2. Tạo tài khoản mới hoặc sử dụng tài khoản test:
   - Email: `admin@flowrite.com`
   - Password: `Admin123!`

### Bước 7: Test Các Tính Năng

**7.1. Tạo Customer:**
- Click "Customers" → "Add Customer"
- Điền thông tin
- Click "Save"

**7.2. Tạo Submission:**
- Click "Submissions" → "New Submission"
- Chọn customer
- Điền các field
- Ký tên (signature)
- Submit

**7.3. Generate Docket:**
- Click "Dockets" → "Generate Docket"
- Chọn customer và date range
- Click "Generate"
- Print hoặc Save PDF

## 🚀 Deploy Lên Production

### Option 1: Deploy Nhanh (Khuyến Nghị)

**A. Deploy Backend lên Railway:**

1. Tạo GitHub repo:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/flowrite-app.git
git push -u origin main
```

2. Vào https://railway.app
3. Login với GitHub
4. "New Project" → "Deploy from GitHub repo"
5. Chọn repository `flowrite-app`
6. Add variables (giống file .env nhưng production):
   - `NODE_ENV=production`
   - `MONGODB_URI=<your_mongodb_uri>`
   - `JWT_SECRET=<strong_secret>`
   - `CORS_ORIGIN=<your_firebase_url>`
7. Set Root Directory: `/backend`
8. Deploy! → Copy backend URL

**B. Deploy Frontend lên Firebase:**

```bash
cd frontend

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init
firebase init hosting
# ? Public directory: dist
# ? Single-page app: Yes

# Build
npm run build

# Deploy
firebase deploy

# Copy URL từ output
```

**C. Update URLs:**

1. Update backend CORS_ORIGIN với Firebase URL
2. Update frontend .env.production với Railway URL
3. Rebuild và redeploy cả 2

### Option 2: Manual Deploy

Xem chi tiết: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to MongoDB"

**Nguyên nhân:** Connection string sai hoặc IP chưa được whitelist

**Giải pháp:**
1. Kiểm tra MONGODB_URI trong .env
2. Đảm bảo password không có ký tự đặc biệt
3. Kiểm tra MongoDB Atlas Network Access

### Lỗi: "Port 5000 already in use"

**Giải pháp:**
```bash
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
```

### Lỗi: "CORS policy"

**Giải pháp:**
- Kiểm tra CORS_ORIGIN trong backend/.env
- Phải match với frontend URL
- Restart backend sau khi sửa

### Lỗi: "npm install fails"

**Giải pháp:**
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📚 Tài Liệu Thêm

- **API Documentation:** [docs/API.md](docs/API.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)

## 📞 Hỗ Trợ

- **GitHub Issues:** [Link to Issues]
- **Email:** support@flowrite.com

## ✅ Checklist Hoàn Thành

- [ ] Node.js và npm đã cài
- [ ] MongoDB Atlas account tạo xong
- [ ] Database cluster đã setup
- [ ] Connection string có sẵn
- [ ] Backend .env đã config
- [ ] Frontend .env đã config
- [ ] Dependencies đã install
- [ ] Backend chạy OK (port 5000)
- [ ] Frontend chạy OK (port 5173)
- [ ] Đăng nhập thành công
- [ ] Test tạo customer OK
- [ ] Test tạo submission OK
- [ ] Test generate docket OK

---

🎉 **CHÚC MỪNG!** Bạn đã setup thành công Flowrite!
