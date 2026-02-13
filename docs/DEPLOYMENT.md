# 🚀 Deployment Guide - Flowrite

Complete step-by-step deployment guide for production.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Railway account (for backend)
- Firebase account (for frontend)
- Node.js 20+ installed locally

## Part 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Click "Build a Database"
4. Choose FREE tier (M0)
5. Select your preferred region (closest to your users)
6. Name your cluster: `flowrite-cluster`
7. Click "Create Cluster"

### 1.2 Configure Database Access

1. Go to "Database Access" tab
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `flowrite-admin`
5. Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" tab
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Database" tab
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `flowrite`

Example: `mongodb+srv://flowrite-admin:YOUR_PASSWORD@flowrite-cluster.xxxxx.mongodb.net/flowrite?retryWrites=true&w=majority`

## Part 2: Backend Deployment (Railway)

### 2.1 Prepare Repository

1. Initialize git in your project:
```bash
cd flowrite-app
git init
git add .
git commit -m "Initial commit"
```

2. Create GitHub repository:
```bash
# On GitHub.com: Create new repository "flowrite-app"
git remote add origin https://github.com/YOUR_USERNAME/flowrite-app.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `flowrite-app` repository
6. Railway will detect the monorepo

### 2.3 Configure Backend Service

1. Click "Add variables" or "Variables" tab
2. Add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string_from_step_1.4
JWT_SECRET=generate_with_command_below
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-app.web.app,https://your-app.firebaseapp.com
BCRYPT_ROUNDS=10
```

3. Generate JWT_SECRET:
```bash
openssl rand -base64 64
```

4. Set Root Directory: `/backend`
5. Set Build Command: `npm install`
6. Set Start Command: `npm start`

### 2.4 Deploy

1. Railway will automatically deploy
2. Wait for deployment to complete
3. Copy your backend URL: `https://flowrite-api.railway.app`
4. Test: `https://YOUR_BACKEND_URL/health`

## Part 3: Frontend Deployment (Firebase)

### 3.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 3.2 Login to Firebase

```bash
firebase login
```

### 3.3 Initialize Firebase Project

```bash
cd frontend

# Initialize hosting
firebase init hosting

# Answers:
# ? Please select an option: Use an existing project
# ? Select a default Firebase project: (select your Firebase project)
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app? Yes
# ? Set up automatic builds and deploys with GitHub? No
```

### 3.4 Configure Environment Variables

Create `frontend/.env.production`:
```env
VITE_API_URL=https://YOUR_RAILWAY_BACKEND_URL/api
VITE_APP_NAME=Flowrite
VITE_APP_VERSION=1.0.0
```

### 3.5 Build and Deploy

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy

# Your app will be live at:
# https://YOUR_PROJECT_ID.web.app
# https://YOUR_PROJECT_ID.firebaseapp.com
```

### 3.6 Configure Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning

## Part 4: Environment Configuration

### 4.1 Update CORS in Backend

After deploying frontend, update Railway environment variables:

```env
CORS_ORIGIN=https://your-app.web.app,https://your-app.firebaseapp.com
```

### 4.2 Redeploy Backend

Railway will automatically redeploy when you save environment variables.

## Part 5: Setup CI/CD (Optional but Recommended)

### 5.1 Configure GitHub Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:

**Railway:**
- `RAILWAY_TOKEN`: Get from Railway dashboard → Account → Tokens

**Firebase:**
- `FIREBASE_SERVICE_ACCOUNT`: Get from Firebase → Project Settings → Service Accounts
- `VITE_API_URL`: Your Railway backend URL

### 5.2 Enable GitHub Actions

The `.github/workflows` files are already in your repo. Push any changes to trigger automatic deployment:

```bash
git add .
git commit -m "Update configuration"
git push
```

## Part 6: Testing Production Deployment

### 6.1 Test Backend API

```bash
# Health check
curl https://YOUR_BACKEND_URL/health

# Register test user
curl -X POST https://YOUR_BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
```

### 6.2 Test Frontend

1. Open your Firebase URL
2. Register a new account
3. Test all features:
   - Login/Logout
   - Create customer
   - Create submission
   - Generate docket
   - Print docket

## Part 7: Monitoring and Maintenance

### 7.1 Railway Monitoring

- Check logs: Railway dashboard → Your service → Deployments
- Monitor usage: Railway dashboard → Usage
- Set up alerts: Railway dashboard → Settings

### 7.2 Firebase Monitoring

- Check hosting status: Firebase Console → Hosting
- Monitor bandwidth: Firebase Console → Usage
- View analytics: Firebase Console → Analytics

### 7.3 MongoDB Monitoring

- Monitor cluster: MongoDB Atlas → Clusters
- View metrics: MongoDB Atlas → Metrics
- Set up alerts: MongoDB Atlas → Alerts

## Troubleshooting

### Backend not connecting to MongoDB

1. Check MongoDB Atlas network access allows all IPs
2. Verify connection string in Railway environment variables
3. Check Railway logs for connection errors

### Frontend can't reach backend

1. Verify CORS_ORIGIN in backend includes your Firebase URLs
2. Check VITE_API_URL in frontend build
3. Test backend health endpoint directly

### Deploy failures

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Check Railway/Firebase quotas

## Scaling Considerations

### When to scale:

- **Backend:** Upgrade Railway plan for more RAM/CPU
- **Database:** Upgrade MongoDB Atlas cluster tier
- **Frontend:** Firebase auto-scales, monitor bandwidth

### Cost Optimization:

- **Free Tiers:**
  - Railway: $5 credit/month
  - MongoDB Atlas: 512MB storage
  - Firebase: 10GB/month bandwidth

- **Paid Plans:**
  - Railway: $20/month for 8GB RAM
  - MongoDB Atlas: $57/month for M10
  - Firebase: Pay as you go

## Security Checklist

- [ ] Changed all default passwords
- [ ] Using strong JWT_SECRET (64+ characters)
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] MongoDB network access configured
- [ ] Environment variables secured
- [ ] Error messages don't leak sensitive info

## Backup Strategy

### Database Backups

MongoDB Atlas automatic backups:
- Go to Clusters → Backup
- Configure backup schedule
- Test restore procedure

### Code Backups

- GitHub repository with all code
- Tag releases: `git tag v1.0.0`
- Create releases on GitHub

## Support

- **Issues:** https://github.com/your-username/flowrite-app/issues
- **Email:** support@flowrite.com
- **Docs:** https://flowrite.com/docs

---

🎉 **Congratulations!** Your Flowrite application is now live in production!
