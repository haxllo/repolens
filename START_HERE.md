# ✅ RepoLens - Quick Start Commands

## All Systems Ready!

Your RepoLens setup is complete. Follow these steps to run the full application:

---

## 🚀 Start All Services (3 Terminals Required)

### Terminal 1: Worker (Python)

```bash
cd apps/worker
./start.sh
```

**Expected output:**

```
Starting RepoLens worker...
INFO - Connected to Redis
INFO - Listening for jobs on bull:repo-analysis:wait
```

---

### Terminal 2: Frontend (Next.js)

```bash
npm run dev --filter=@repolens/web
```

**Expected output:**

```
> @repolens/web@0.1.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
```

---

### Terminal 3: API Gateway (NestJS)

```bash
npm run dev --filter=@repolens/api
```

**Expected output:**

```
[Nest] INFO [NestApplication] Nest application successfully started
🚀 API Gateway running on http://localhost:3001/api
```

---

## ⚙️ Before You Can Sign In

You need to configure GitHub OAuth:

### 1. Create GitHub OAuth App

Visit: https://github.com/settings/developers

- Click **"New OAuth App"**
- Fill in:
  - **Application name**: `RepoLens Local Dev`
  - **Homepage URL**: `http://localhost:3000`
  - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
- Click **"Register application"**
- Copy the **Client ID**
- Generate and copy a **Client Secret**

### 2. Update Environment File

Edit `apps/web/.env.local`:

```bash
# Replace these values:
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here

# Generate a secret:
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

Run this to generate the secret:

```bash
openssl rand -base64 32
```

### 3. (Optional) Add Gemini API Key

For AI-powered explanations, edit `apps/worker/.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free key at: https://makersuite.google.com/app/apikey

---

## 🎉 Test the Application

1. **Open your browser**: http://localhost:3000
2. **Click "Sign in with GitHub"**
3. **Authorize the app**
4. **Try scanning a repository**:
   - Enter a GitHub URL (e.g., `https://github.com/vercel/next.js`)
   - Click "Scan Repository"
   - Wait for analysis (1-5 minutes)
   - View results!

---

## 🔍 Health Checks

Verify everything is working:

```bash
# Check API health
curl http://localhost:3001/api/health

# Check PostgreSQL
docker exec repolens-postgres psql -U repolens -d repolens -c "SELECT 'OK' as status;"

# Check Redis
docker exec repolens-redis redis-cli ping

# Check services
docker-compose ps
```

---

## 🛑 Stopping Services

**Stop Docker containers:**

```bash
docker-compose down
```

**Stop dev servers:**
Press `Ctrl+C` in each terminal

---

## 📁 Useful Commands

```bash
# View database in browser
cd packages/database && npx prisma studio
# Opens at http://localhost:5555

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart database
docker-compose restart postgres

# Clean everything
npm run clean
docker-compose down -v
```

---

## 🐛 Common Issues

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3002 npm run dev --filter=@repolens/web
```

### Database connection failed

```bash
# Restart PostgreSQL
docker-compose restart postgres
sleep 5

# Re-push schema
cd packages/database && npx prisma db push
```

### Worker not processing jobs

```bash
# Check Redis
redis-cli ping

# Restart worker
# Stop with Ctrl+C, then:
cd apps/worker && ./start.sh
```

---

## 📚 Documentation

- **Setup Guide**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Development**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Project Status**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## ✨ What's Next?

Once you have it running, you can:

1. **Build the 3D dependency graph visualization**
2. **Create the dashboard UI**
3. **Add more language support**
4. **Enhance AI prompts**
5. **Deploy to production**

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for the full roadmap!

---

**Happy coding! 🚀**

_If you encounter any issues, check the documentation or create an issue on GitHub._
