# Frontend Setup for Vercel Backend

## After Backend is Deployed

### Step 1: Get Your Backend URL
After deploying the API to Vercel, you'll get a URL like:
```
https://disasterconnect-api.vercel.app
```

### Step 2: Update Frontend API Configuration

#### Option A: Hardcode (Quick)
Edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://disasterconnect-api.vercel.app';
```

#### Option B: Environment Variable (Recommended)
1. Edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

2. Create `.env.local` for local development:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. In Vercel (frontend project) → Settings → Environment Variables:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://disasterconnect-api.vercel.app`

4. Redeploy frontend

### Step 3: Test
Visit your frontend and try logging in!

---

## Local Development

### Terminal 1 - Backend
```bash
cd API
npm run dev
```
Runs on http://localhost:5000

### Terminal 2 - Frontend
```bash
npm run dev
```
Runs on http://localhost:5173

Make sure `.env.local` has:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend API URL updated
- [ ] Environment variables set in Vercel
- [ ] Test registration/login
- [ ] Check browser console for errors
