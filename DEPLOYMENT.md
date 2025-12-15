# 🚀 Deployment Guide

This guide will help you deploy the Smart Day Assistant to production using:
- **Frontend**: Vercel
- **Backend**: Railway (or alternative)
- **Database**: Supabase

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] A GitHub account
- [ ] A Vercel account (free tier works)
- [ ] A Railway account (free tier works) - [railway.app](https://railway.app)
- [ ] A Supabase project with your database set up
- [ ] A Groq API key - [console.groq.com](https://console.groq.com)

---

## Part 1: Push Code to GitHub

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. **DO NOT** initialize with README (we already have code)
3. Copy the repository URL

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

⚠️ **IMPORTANT**: The `.env` file is gitignored and won't be pushed (this is correct - it contains secrets!)

---

## Part 2: Deploy Backend to Railway

### 1. Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub

### 2. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway will auto-detect it's a Node.js app

### 3. Configure Backend Directory

Railway needs to know your backend is in the `backend/` folder:

1. Go to **Settings** → **Root Directory**
2. Set it to: `backend`
3. Click **Save**

### 4. Add Environment Variables

In Railway project settings → **Variables**, add:

```
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=https://your-app-name.vercel.app
PORT=3001
```

**Where to get these:**
- `GROQ_API_KEY`: Get from [console.groq.com](https://console.groq.com)
- `FRONTEND_URL`: Your Vercel URL (we'll get this in Part 3, you can add it after)
- `PORT`: Railway will override this, but 3001 is the default

### 5. Deploy

1. Railway will automatically deploy
2. Once deployed, click **"Settings"** → **"Generate Domain"**
3. Copy your Railway URL (e.g., `https://smart-day-backend.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend!

---

## Part 3: Deploy Frontend to Vercel

### 1. Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub

### 2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. Vercel will auto-detect it's a Vite project

### 3. Configure Build Settings

Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_LANGCHAIN_API_ENDPOINT=https://your-backend.up.railway.app
```

**Where to get these:**
- Supabase values: From your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
- `VITE_LANGCHAIN_API_ENDPOINT`: Your Railway backend URL from Part 2, Step 5

⚠️ **Make sure all variable names start with `VITE_`** (except in backend)

### 5. Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2 minutes)
3. Once deployed, copy your Vercel URL (e.g., `https://smart-day-assistant.vercel.app`)

### 6. Update Backend CORS

Now go back to **Railway** and update the `FRONTEND_URL` variable:

```
FRONTEND_URL=https://your-app-name.vercel.app
```

Railway will automatically redeploy with the updated CORS settings.

---

## Part 4: Verify Deployment

### 1. Test Frontend

Visit your Vercel URL and verify:
- [ ] App loads without errors
- [ ] You can sign up/login
- [ ] Dashboard displays

### 2. Test Backend Connection

In the app:
- [ ] Create a new task (should get AI prioritization)
- [ ] Create a new event (should get AI analysis)
- [ ] Click "Generate AI Tasks" on Tasks page

If these work, your backend is connected! 🎉

### 3. Check Browser Console

Open DevTools (F12) and check for any errors:
- No CORS errors
- No 404s for API calls
- All features working

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Solution**: Make sure `FRONTEND_URL` in Railway matches your Vercel domain exactly.

### Issue: API calls failing

**Check:**
1. Railway backend is running (check Railway dashboard)
2. `VITE_LANGCHAIN_API_ENDPOINT` in Vercel points to your Railway URL
3. `GROQ_API_KEY` is set correctly in Railway

### Issue: Authentication not working

**Check:**
1. Supabase environment variables are set correctly in Vercel
2. Your Supabase project has RLS policies enabled
3. Check Supabase logs for auth errors

### Issue: Tasks/Events not saving

**Check:**
1. Supabase connection is working
2. Database tables exist (check Supabase Table Editor)
3. RLS policies allow INSERT/UPDATE operations

---

## 🔄 Future Deployments

### Update Frontend

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

### Update Backend

```bash
git add .
git commit -m "Your update message"
git push
```

Railway will automatically redeploy!

---

## 🎯 Alternative Backend Hosting

Don't want to use Railway? Here are alternatives:

### Render.com
- Free tier available
- Similar to Railway
- [render.com](https://render.com)

### Fly.io
- Free tier with 3 VMs
- More technical setup
- [fly.io](https://fly.io)

### Heroku
- Paid (no free tier anymore)
- Very reliable
- [heroku.com](https://heroku.com)

All of these support Node.js apps and work similarly to Railway.

---

## 📝 Environment Variables Reference

### Frontend (.env)
```bash
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_LANGCHAIN_API_ENDPOINT=
```

### Backend (backend/.env or Railway Variables)
```bash
GROQ_API_KEY=
FRONTEND_URL=
PORT=3001
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` file NOT in GitHub (gitignored)
- [ ] Backend deployed to Railway
- [ ] Railway environment variables set
- [ ] Railway domain generated
- [ ] Frontend deployed to Vercel
- [ ] Vercel environment variables set
- [ ] CORS configured correctly
- [ ] App tested and working
- [ ] No console errors

---

## 🎉 You're Live!

Your app is now publicly accessible at your Vercel URL. Share it with anyone!

**Need help?** Check the troubleshooting section above or open an issue on GitHub.
