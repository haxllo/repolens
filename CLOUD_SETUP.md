# RepoLens Cloud Setup Guide (FREE Stack)
# ==========================================

## Stack Overview
- Frontend: Vercel (FREE)
- API: Render (FREE)
- Worker: Render (FREE)
- Database: Neon PostgreSQL (FREE)
- Redis: Upstash (FREE)

---

## ✅ STEP 1: Database Setup (Neon)

### Create Neon Account
1. Go to: https://neon.tech
2. Click "Sign up" (GitHub/Google/Email)
3. Click "Create Project"
   - Name: `repolens-db`
   - Region: Choose closest (e.g., US East, EU West)
4. Click "Create"

### Get Connection String
After creation, copy the connection string shown:
```
postgresql://username:password@ep-xxx-123.region.aws.neon.tech/neondb?sslmode=require
```

### Update Environment Files
Replace `DATABASE_URL` in:
- `apps/web/.env.local`
- `apps/api/.env`

---

## ✅ STEP 2: Redis Setup (Upstash)

### Create Upstash Account
1. Go to: https://upstash.com
2. Click "Sign up" (GitHub/Google/Email)
3. Click "Create Database"
   - Name: `repolens-redis`
   - Region: Same as Neon or closest
   - Type: Regional
4. Click "Create"

### Get Connection Details
Copy these values:
- **Endpoint**: `xxx-xxx.upstash.io`
- **Port**: `6379`
- **Password**: `AxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ`
- **Full URL**: `redis://default:password@xxx.upstash.io:6379`

### Update Environment Files
In `apps/api/.env`:
```env
REDIS_HOST=xxx-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password-here
```

In `apps/worker/.env`:
```env
REDIS_URL=redis://default:password@xxx.upstash.io:6379
```

---

## ✅ STEP 3: Initialize Database Schema

Run this from project root:

```bash
# Set DATABASE_URL temporarily for migration
$env:DATABASE_URL="your-neon-connection-string"

# Generate Prisma client
cd packages/database
npx prisma generate

# Push schema to database
npx prisma db push

# Verify tables created
npx prisma studio
```

---

## ✅ STEP 4: Get API Keys

### GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   ```
   Application name: RepoLens Local Dev
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```
4. Click "Register application"
5. Copy **Client ID**
6. Click "Generate a new client secret"
7. Copy **Client Secret**
8. Update `apps/web/.env.local`:
   ```env
   GITHUB_CLIENT_ID=Iv23xxxxxxxxxxxx
   GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Google Gemini API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Update `apps/worker/.env`:
   ```env
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## ✅ STEP 5: Test Locally

### Start Services

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Worker:**
```bash
cd apps/worker
python worker.py
```

**Terminal 3 - Frontend:**
```bash
cd apps/web
npm run dev
```

### Test the App
1. Open: http://localhost:3000
2. Click "Sign in with GitHub"
3. Submit a repo URL (try: https://github.com/vercel/next.js)
4. Wait for analysis
5. View results!

---

## ✅ STEP 6: Deploy to Vercel (Frontend)

### Via Vercel Dashboard
1. Go to: https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://repolens-api.onrender.com
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=c94fa6fdab2646297cc9db22b77978ad462839e91bc6cb8227abdbcc46b21905
   GITHUB_CLIENT_ID=Iv23xxxxxxxxxxxx
   GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
   DATABASE_URL=your-neon-connection-string
   ```

6. Click "Deploy"

### Update GitHub OAuth
After deployment:
1. Go to GitHub OAuth app settings
2. Update callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

---

## ✅ STEP 7: Deploy to Render (Backend)

### Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub

### Deploy API Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `repolens-api`
   - **Region**: Same as Neon/Upstash
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Node
   - **Build Command**: `npm install && npx turbo build --filter=@repolens/api`
   - **Start Command**: `node apps/api/dist/main.js`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   DATABASE_URL=your-neon-connection-string
   REDIS_HOST=xxx-xxx.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-upstash-password
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.vercel.app
   ```

5. Click "Create Web Service"

### Deploy Worker Service

1. Click "New" → "Background Worker"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `repolens-worker`
   - **Region**: Same as API
   - **Branch**: `main`
   - **Runtime**: Python
   - **Build Command**: `pip install -r apps/worker/requirements.txt`
   - **Start Command**: `python apps/worker/worker.py`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   REDIS_URL=redis://default:password@xxx.upstash.io:6379
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
   API_URL=https://repolens-api.onrender.com
   SANDBOX_DIR=/tmp/repolens-sandboxes
   ```

5. Click "Create Worker"

---

## ✅ STEP 8: Update Frontend API URL

After Render gives you the API URL (e.g., `https://repolens-api.onrender.com`):

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update `NEXT_PUBLIC_API_URL` to: `https://repolens-api.onrender.com`
5. Redeploy

---

## 🎉 Done! Your App is Live!

### Test Production
1. Visit your Vercel URL
2. Sign in with GitHub
3. Submit a repository
4. View analysis results

### Monitor Services
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Neon**: https://console.neon.tech
- **Upstash**: https://console.upstash.com

---

## 💰 Free Tier Limits

| Service | Limit |
|---------|-------|
| Vercel | 100GB bandwidth/month |
| Render | 750 hours/month (per service) |
| Neon | 3GB storage, 191 compute hours |
| Upstash | 10K commands/day, 256MB |

**This is more than enough for MVP testing!**

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify Neon database is active
- Check SSL mode: `?sslmode=require`

### "Redis connection failed"
- Check REDIS_URL format
- Verify Upstash password is correct
- Check if Upstash database is active

### "Worker not processing jobs"
- Check Render worker logs
- Verify REDIS_URL matches API's Redis
- Check GEMINI_API_KEY is valid

### "API 502/503 errors"
- Render free tier sleeps after inactivity
- First request takes ~30s to wake up
- Upgrade to paid tier ($7/month) for always-on

---

## 📞 Need Help?

Check these files for reference:
- `DEVELOPMENT.md` - Local development guide
- `DEPLOYMENT.md` - Detailed deployment docs
- `ARCHITECTURE.md` - System architecture
- `PROJECT_STATUS.md` - Feature status

---

**Ready to deploy? Let's do this! 🚀**
