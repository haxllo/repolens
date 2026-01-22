# Fly.io Deployment Guide for RepoLens Worker

## Prerequisites

- Fly.io account (sign up at https://fly.io/app/sign-up)
- flyctl CLI installed

## Step 1: Install flyctl

### macOS/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows (PowerShell):
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### Verify Installation:
```bash
flyctl version
```

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser for authentication.

## Step 3: Deploy Worker

### Navigate to worker directory:
```bash
cd apps/worker
```

### Create Fly.io app (first time only):
```bash
flyctl launch --no-deploy
```

When prompted:
- **App name**: Press Enter (uses `repolens-worker` from fly.toml)
- **Region**: Choose closest to your users (e.g., `sin` for Singapore, `iad` for US East)
- **PostgreSQL**: No (we're using Neon)
- **Redis**: No (we're using Upstash)

### Set Environment Variables:

```bash
# Redis connection
flyctl secrets set REDIS_URL="redis://default:your-password@your-host.upstash.io:6379"

# API endpoint
flyctl secrets set API_URL="https://repolens-api.onrender.com"

# OpenRouter API key
flyctl secrets set OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxx"

# Optional: Gemini API key (fallback)
flyctl secrets set GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxx"
```

### Deploy:
```bash
flyctl deploy
```

## Step 4: Monitor

### View logs:
```bash
flyctl logs
```

### Check status:
```bash
flyctl status
```

### SSH into instance (if needed):
```bash
flyctl ssh console
```

## Step 5: Verify Worker is Running

Check your API logs or Redis queue to verify the worker is processing jobs.

---

## Free Tier Details

- **3 shared-cpu-1x VMs** free (256MB RAM each)
- **160GB outbound data transfer** per month
- **Automatic sleep** after inactivity (wakes on new jobs)

**This is perfect for the worker!** 🎉

---

## Scaling (If Needed Later)

### Scale RAM:
```bash
flyctl scale memory 512
```

### Scale CPU:
```bash
flyctl scale vm shared-cpu-2x
```

### Multiple instances:
```bash
flyctl scale count 2
```

---

## Troubleshooting

### Worker not processing jobs:
```bash
# Check logs
flyctl logs

# Restart worker
flyctl apps restart repolens-worker

# Check Redis connection
flyctl ssh console
> python -c "import redis; r=redis.from_url('redis://...'); print(r.ping())"
```

### Out of memory:
```bash
# Check current memory
flyctl status

# Increase if needed (paid tier required for >256MB)
flyctl scale memory 512
```

### Connection issues:
- Verify REDIS_URL is correct
- Check API_URL is accessible
- Ensure Upstash allows connections from Fly.io IPs

---

## Updating Deployment

After code changes:

```bash
git push origin main
cd apps/worker
flyctl deploy
```

---

## Cost Monitoring

### View current usage:
```bash
flyctl dashboard billing
```

### Set spending limit:
Go to https://fly.io/dashboard → Billing → Set limit

---

## Cleanup (If Needed)

### Delete app:
```bash
flyctl apps destroy repolens-worker
```

---

## Alternative Regions

Common regions:
- `sin` - Singapore
- `iad` - US East (Virginia)
- `sjc` - US West (California)
- `lhr` - London
- `fra` - Frankfurt
- `syd` - Sydney

Choose the region closest to your Render API for lower latency.

---

## Support

- Fly.io Docs: https://fly.io/docs
- Community: https://community.fly.io
- Status: https://status.fly.io
