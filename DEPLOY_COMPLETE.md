# 🚀 Complete Deployment Guide - Vercel (FREE)

Deploy both backend and frontend on Vercel for **100% FREE**!

---

## Part 1: Deploy Backend API

### 1. Navigate to API folder
```bash
cd API
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Backend ready for Vercel"

# Create new repo at https://github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/disasterconnect-api.git
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to **https://vercel.com/dashboard**
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `disasterconnect-api`
4. Settings:
   - Framework: **Other**
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. **Environment Variables** - Click "Add":
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value:** Copy entire content of `dissasterconnect-firebase-adminsdk-fbsvc-36d786c346.json`
   
   Get one-line JSON (PowerShell):
   ```powershell
   Get-Content dissasterconnect-firebase-adminsdk-fbsvc-36d786c346.json -Raw | ForEach-Object { $_ -replace '\s+', ' ' }
   ```

6. Click **"Deploy"**
7. Wait ~2 minutes
8. **Copy your backend URL**: `https://disasterconnect-api.vercel.app`

### 4. Test Backend
```bash
curl https://disasterconnect-api.vercel.app/
# Expected: {"message":"Backend is running on Vercel!"}
```

---

## Part 2: Deploy Frontend

### 1. Update Frontend API URL

Edit `src/lib/api.ts` - change line 2:
```typescript
const API_BASE_URL = 'https://disasterconnect-api.vercel.app';
```

Replace `disasterconnect-api` with your actual Vercel backend URL.

### 2. Push Frontend to GitHub (if not already)
```bash
cd ..  # Back to root
git add .
git commit -m "Update API URL for production"
git push
```

If you haven't set up Git yet:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/disasterconnect.git
git push -u origin main
```

### 3. Deploy Frontend on Vercel
1. Go to **https://vercel.com/dashboard**
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `disasterconnect`
4. Settings:
   - Framework: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **"Deploy"**
6. Wait ~2 minutes
7. **Your app is live!** 🎉

---

## Part 3: Test Everything

### 1. Visit Your Frontend
Go to your Vercel frontend URL (e.g., `https://disasterconnect.vercel.app`)

### 2. Test Registration
1. Click "Register" or "Sign Up"
2. Create a new account
3. Check if it works!

### 3. Test Login
1. Login with your credentials
2. Verify you're logged in

### 4. Check Browser Console
- Press F12
- Look for any errors
- All API calls should succeed

---

## 🎯 Quick Reference

### Backend URL
```
https://disasterconnect-api.vercel.app
```

### Frontend URL
```
https://disasterconnect.vercel.app
```

### API Endpoints
- Register: `POST https://disasterconnect-api.vercel.app/api/auth/register`
- Login: `POST https://disasterconnect-api.vercel.app/api/auth/login`

---

## 🛠️ Local Development

### Backend (Terminal 1)
```bash
cd API
npm run dev
```
Runs on: http://localhost:5000

### Frontend (Terminal 2)
```bash
npm run dev
```
Runs on: http://localhost:5173

**Important:** For local dev, change `src/lib/api.ts` back to:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

Or use environment variables (see FRONTEND_SETUP.md).

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** "Module not found" error
- Check all import paths in `api/index.js`
- Ensure `package.json` has all dependencies

**Problem:** Firebase Admin errors
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is set in Vercel
- Check JSON is valid (no line breaks)
- Redeploy after adding env vars

**Problem:** CORS errors
- Backend has CORS enabled with `origin: true`
- If issues persist, check browser console for exact error

### Frontend Issues

**Problem:** API calls fail
- Verify backend URL in `src/lib/api.ts` is correct
- Check backend is deployed and running
- Test backend URL directly in browser

**Problem:** 404 errors
- Ensure API endpoints match: `/api/auth/register`, `/api/auth/login`
- Check Vercel function logs for errors

### Deployment Issues

**Problem:** Vercel build fails
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct dependencies
- Try deploying again

**Problem:** Environment variables not working
- Redeploy after adding env vars
- Check spelling of variable names
- Verify values are correct

---

## 📊 Monitor Your Apps

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check logs: Click deployment → Functions tab
- Monitor usage: Settings → Usage

### View Logs
```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs
```

---

## 💰 Cost

**Everything is FREE!**
- Vercel Hobby plan: Free forever
- Includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions
  - SSL certificates
  - Custom domains

---

## 🎉 You're Done!

Your full-stack DisasterConnect app is now deployed for FREE on Vercel!

### What You've Accomplished:
✅ Backend API deployed as serverless functions
✅ Frontend deployed with Vite
✅ Firebase integration working
✅ Authentication system live
✅ All on the same platform (Vercel)
✅ Zero cost!

### Next Steps:
- 🔒 Add custom domain (optional)
- 📊 Set up analytics
- 🚀 Add more features
- 📱 Share with users!

---

## 📚 Additional Resources

- **API/VERCEL_DEPLOY.md** - Detailed backend deployment
- **FRONTEND_SETUP.md** - Frontend configuration
- Vercel Docs: https://vercel.com/docs
- Vercel Serverless: https://vercel.com/docs/functions

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Test backend URL directly
4. Verify environment variables are set
5. Redeploy both frontend and backend

Good luck! 🚀
