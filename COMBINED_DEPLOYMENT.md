# Combined API + Worker Deployment (FREE)

## Overview

Since Render charges for Background Workers, this setup runs **both the API and Worker in a single container** to stay on the free tier.

### Architecture:
```
┌─────────────────────────────────────┐
│   Render Web Service (FREE)         │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  NestJS API  │  │   Python    │ │
│  │  (Port 3001) │  │   Worker    │ │
│  └──────────────┘  └─────────────┘ │
│         │                 │         │
│         └────────┬────────┘         │
└──────────────────┼──────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐        ┌─────▼────┐
    │  Neon   │        │ Upstash  │
    │  (DB)   │        │ (Redis)  │
    └─────────┘        └──────────┘
```

---

## How It Works

1. **Dockerfile.combined**: Installs both Node.js AND Python
2. **start-combined.sh**: Runs both services simultaneously
3. **Health monitoring**: Auto-restarts worker if it crashes
4. **Shared Redis**: Both API and Worker use the same Upstash instance

---

## Deployment Steps

### Option 1: Via Render Dashboard

1. **Delete old API service** (if exists)

2. **Create new Web Service**:
   - Name: `repolens-combined`
   - Runtime: Docker
   - Dockerfile Path: `./Dockerfile.combined`
   - Plan: Free

3. **Add Environment Variables** (from Render dashboard):

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require

   # Redis (for both API and Worker)
   REDIS_HOST=crisp-fawn-19109.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=AUqlAAIncD...
   REDIS_URL=redis://default:AUqlAAIncD...@crisp-fawn-19109.upstash.io:6379

   # AI
   OPENROUTER_API_KEY=sk-or-v1-ed1c37c90bd6...
   OPENROUTER_MODEL=mistralai/devstral-2512:free
   GEMINI_API_KEY=AIzaSy... (optional)

   # API Config
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.vercel.app

   # Worker Config
   API_URL=http://localhost:3001
   SANDBOX_DIR=/tmp/repolens-sandboxes
   ```

4. **Deploy**

### Option 2: Via Blueprint (render-combined.yaml)

1. Go to Render Dashboard → "New +" → "Blueprint"
2. Connect your repo
3. Select `render-combined.yaml`
4. Fill in the secret environment variables
5. Deploy

---

## Monitoring

### View Logs:
You'll see both API and Worker logs in the same stream:

```bash
🚀 Starting RepoLens Combined Service...
========================================
📡 Starting API Gateway (Port 3001)...
✅ API started with PID: 123
⏳ Waiting for API to initialize...
🔧 Starting Analysis Worker...
✅ Worker started with PID: 456
========================================
✨ All services running!
========================================
```

### Check Status:
```bash
# From Render dashboard logs, you should see:
[Nest] 123  - LOG [NestFactory] Starting Nest application...
[Nest] 123  - LOG [RoutesResolver] Mapped {/api/health, GET}...
Worker connected to Redis: crisp-fawn-19109.upstash.io:6379
Worker listening for jobs on queue: repo-analysis
```

---

## Pros & Cons

### ✅ Pros:
- **100% FREE** - No worker charges
- **Simple deployment** - One service to manage
- **Fast communication** - API and Worker on localhost
- **Shared resources** - More efficient memory usage

### ⚠️ Cons:
- **Less scalable** - Can't scale API and Worker independently
- **Single point of failure** - If container crashes, both services down
- **Resource competition** - API and Worker share CPU/RAM
- **Restart time** - Both services restart together

---

## Troubleshooting

### Worker not processing jobs:

Check logs for:
```
✅ Worker started with PID: xxx
Worker connected to Redis
```

If missing, check:
- `REDIS_URL` environment variable
- Upstash Redis is accessible

### API not responding:

Check logs for:
```
✅ API started with PID: xxx
[Nest] xxx - LOG [NestApplication] Nest application successfully started
```

### Out of Memory:

Free tier has 512MB RAM. If both services exceed this:
1. Check logs for `OOMKilled` errors
2. Consider upgrading Render plan ($7/month for 1GB)
3. Or split services (pay for worker)

### Worker keeps crashing:

The startup script auto-restarts the worker:
```
⚠️  Worker crashed! Restarting...
✅ Worker restarted with PID: xxx
```

If it crashes repeatedly, check:
- Python dependencies installed correctly
- Redis connection is valid
- Sandbox directory permissions

---

## Scaling Later

When you outgrow the free tier, you can:

1. **Upgrade to paid plan** ($7/month)
   - More RAM/CPU for combined service

2. **Split into separate services**:
   - Keep API on Render Web Service (free)
   - Move Worker to Railway/Koyeb/paid tier

3. **Add auto-scaling** (paid plans):
   - Scale API during high traffic
   - Scale Worker during analysis spikes

---

## Comparison with Split Architecture

| Feature | Combined (FREE) | Split (PAID) |
|---------|-----------------|--------------|
| Cost | $0/month | ~$7/month |
| Services | 1 | 2 |
| Scaling | Together | Independent |
| Complexity | Simple | More complex |
| Reliability | Single point | More resilient |
| Resource | Shared | Dedicated |

For **MVP/testing**, combined is perfect! For **production scale**, consider splitting.

---

## Files Created

- ✅ `Dockerfile.combined` - Multi-runtime container
- ✅ `start-combined.sh` - Startup orchestration
- ✅ `render-combined.yaml` - Render blueprint
- ✅ `COMBINED_DEPLOYMENT.md` - This guide

---

## Next Steps

1. **Commit files**:
   ```bash
   git add Dockerfile.combined start-combined.sh render-combined.yaml COMBINED_DEPLOYMENT.md
   git commit -m "feat: add combined API+Worker deployment for Render free tier"
   git push
   ```

2. **Deploy to Render** (choose one):
   - Dashboard: Manual setup
   - Blueprint: Use `render-combined.yaml`

3. **Update frontend** to point to new API URL

4. **Test end-to-end**:
   - Submit a repo analysis
   - Check logs show both services working
   - Verify results appear

🎉 **You're running a full analysis platform on FREE tier!**
