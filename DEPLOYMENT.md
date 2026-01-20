# Deployment Guide

## Overview

This guide covers deploying RepoLens to production using:
- **Frontend**: Vercel
- **API Gateway**: Railway
- **Worker**: Railway
- **Database**: Neon (Serverless PostgreSQL)
- **Cache/Queue**: Upstash (Serverless Redis)

---

## Pre-Deployment Checklist

- [ ] GitHub OAuth app configured for production URLs
- [ ] Gemini API key obtained
- [ ] Domain name configured (optional)
- [ ] Production secrets generated

---

## 1. Database Setup (Neon)

### Create Database

1. Go to https://neon.tech
2. Create new project
3. Copy connection string (looks like: \`postgresql://user:pass@host.neon.tech/db?sslmode=require\`)

### Initialize Schema

\`\`\`bash
# Set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
cd packages/database
npx prisma migrate deploy
\`\`\`

---

## 2. Redis Setup (Upstash)

1. Go to https://upstash.com
2. Create Redis database
3. Copy connection URL (format: \`redis://default:password@host.upstash.io:6379\`)

---

## 3. Frontend Deployment (Vercel)

### Via Vercel CLI

\`\`\`bash
npm install -g vercel
cd apps/web
vercel
\`\`\`

### Via GitHub Integration

1. Go to https://vercel.com
2. Import GitHub repository
3. Set root directory: \`apps/web\`
4. Configure environment variables:

\`\`\`env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generated-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
\`\`\`

5. Deploy

### Update GitHub OAuth

- Go to GitHub OAuth app settings
- Update callback URL: \`https://your-domain.vercel.app/api/auth/callback/github\`

---

## 4. API Gateway Deployment (Railway)

### Create Railway Project

\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init
\`\`\`

### Configure Service

1. Create new service from \`apps/api\`
2. Set build command: \`npm run build\`
3. Set start command: \`node dist/main.js\`

### Environment Variables

\`\`\`env
DATABASE_URL=<neon-connection-string>
REDIS_HOST=<upstash-host>
REDIS_PORT=6379
REDIS_PASSWORD=<upstash-password>
PORT=3001
FRONTEND_URL=https://your-domain.vercel.app
\`\`\`

### Deploy

\`\`\`bash
cd apps/api
railway up
\`\`\`

---

## 5. Worker Deployment (Railway)

### Create Worker Service

1. Create new service from \`apps/worker\`
2. Set Dockerfile path: \`apps/worker/Dockerfile\`

### Environment Variables

\`\`\`env
REDIS_URL=<upstash-redis-url>
GEMINI_API_KEY=<your-gemini-key>
SANDBOX_DIR=/tmp/repolens-sandboxes
\`\`\`

### Deploy

\`\`\`bash
cd apps/worker
railway up
\`\`\`

---

## 6. Post-Deployment

### Verify Services

\`\`\`bash
# Check API health
curl https://your-api.railway.app/api/health

# Check frontend
open https://your-domain.vercel.app
\`\`\`

### Monitor Logs

**Vercel:**
\`\`\`bash
vercel logs
\`\`\`

**Railway:**
\`\`\`bash
railway logs
\`\`\`

### Set Up Monitoring

1. **Sentry** for error tracking
2. **LogTail** for centralized logging
3. **UptimeRobot** for uptime monitoring

---

## Scaling Considerations

### Horizontal Scaling

- **API**: Railway auto-scales based on load
- **Worker**: Add more worker instances in Railway
- **Database**: Neon auto-scales (pay per use)

### Cost Optimization

- Set job timeout limits (5 minutes max)
- Implement repository size limits (500MB)
- Cache common repository analyses
- Use Redis TTL for temporary data

### Performance

- Enable Vercel Edge caching
- Use CDN for static assets
- Implement database connection pooling
- Add Redis caching layer

---

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database SSL enabled
- [ ] Secrets rotation configured
- [ ] DDoS protection enabled (Vercel)
- [ ] Security headers set (Helmet.js)

---

## Rollback Procedure

### Vercel (Frontend)

\`\`\`bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-url>
\`\`\`

### Railway (Backend)

1. Go to Railway dashboard
2. Select deployment
3. Click "Redeploy"

---

## Troubleshooting

### Database Connection Issues

\`\`\`bash
# Test connection
psql "postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Check connection pool
# Add to DATABASE_URL: ?connection_limit=10
\`\`\`

### Worker Not Processing

\`\`\`bash
# Check Redis connection
redis-cli -u <upstash-redis-url> ping

# View queue
redis-cli -u <upstash-redis-url> LLEN bull:repo-analysis:wait
\`\`\`

### High Memory Usage

- Increase Railway service memory
- Add cleanup jobs for old scans
- Implement pagination for large results

---

## Maintenance

### Database Backups

Neon provides automatic backups. To manually backup:

\`\`\`bash
pg_dump "postgresql://..." > backup.sql
\`\`\`

### Update Dependencies

\`\`\`bash
# Check for updates
npm outdated

# Update all
npm update

# Rebuild and deploy
\`\`\`

### Monitor Costs

- Neon: Pay per compute time
- Upstash: Pay per request
- Railway: Pay per resource usage
- Vercel: Free for hobby projects

---

## Custom Domain Setup

### Vercel

1. Go to project settings
2. Add custom domain
3. Configure DNS (CNAME or A record)

### Railway

1. Go to service settings
2. Add custom domain
3. Configure DNS

---

## Support

For deployment issues:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Neon: https://neon.tech/docs
- Upstash: https://upstash.com/docs
