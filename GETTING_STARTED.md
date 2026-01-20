# Getting Started with RepoLens

This guide will help you get RepoLens running locally in under 10 minutes.

---

## What You'll Build

By the end of this guide, you'll have:
- ✅ Full-stack RepoLens running locally
- ✅ Working GitHub authentication
- ✅ Ability to scan any public repository
- ✅ 3D dependency visualization
- ✅ AI-powered repository insights

---

## Step 1: Prerequisites (5 minutes)

### Install Required Software

**macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js, Python, and Docker
brew install node python@3.11 docker
brew install --cask docker
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3.11 python3-pip docker.io docker-compose

# Start Docker
sudo systemctl start docker
```

**Windows:**
- Install [Node.js 18+](https://nodejs.org/)
- Install [Python 3.11+](https://www.python.org/downloads/)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Verify Installation

```bash
node --version   # Should be >= 18.17.0
python3 --version # Should be >= 3.11
docker --version  # Any recent version
```

---

## Step 2: Clone and Install (2 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd repolens

# Install Node dependencies
npm install

# Install Python dependencies
cd apps/worker
pip3 install -r requirements.txt
cd ../..
```

---

## Step 3: Configure Services (2 minutes)

### Get GitHub OAuth Credentials

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: RepoLens Local
   - **Homepage URL**: http://localhost:3000
   - **Callback URL**: http://localhost:3000/api/auth/callback/github
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### Get Gemini API Key (Free)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Set Up Environment Variables

```bash
# Copy example files
cp .env.example.web apps/web/.env.local
cp .env.example.api apps/api/.env
cp .env.example.worker apps/worker/.env
```

**Edit `apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Run this command to generate
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

**Edit `apps/worker/.env`:**
```env
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
SANDBOX_DIR=/tmp/repolens-sandboxes
```

The `apps/api/.env` file has good defaults for local development.

---

## Step 4: Start Infrastructure (1 minute)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Wait for services to be ready (about 30 seconds)
docker-compose ps

# Should show postgres and redis as "healthy"
```

---

## Step 5: Initialize Database (1 minute)

```bash
cd packages/database

# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push

cd ../..
```

---

## Step 6: Start Development Servers (3 terminals)

**Terminal 1 - Frontend (Next.js):**
```bash
npm run dev --filter=@repolens/web

# Should start on http://localhost:3000
```

**Terminal 2 - API Gateway (NestJS):**
```bash
npm run dev --filter=@repolens/api

# Should start on http://localhost:3001
```

**Terminal 3 - Worker (Python):**
```bash
cd apps/worker
python3 worker.py

# Should show "Listening for jobs..."
```

---

## Step 7: Test the Application

1. **Open http://localhost:3000** in your browser
2. Click "Sign in with GitHub"
3. Authorize the application
4. You should be redirected to the dashboard
5. Try scanning a repository:
   - Enter a GitHub URL (e.g., `https://github.com/facebook/react`)
   - Click "Scan Repository"
   - Watch the progress (1-5 minutes depending on repo size)
   - View 3D dependency graph and AI insights

---

## Troubleshooting

### "Port 3000 already in use"

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev --filter=@repolens/web
```

### "Cannot connect to database"

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart if needed
docker-compose restart postgres

# Wait 30 seconds and try again
```

### "Worker not processing jobs"

```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli ping
# Should return "PONG"

# Check queue status
redis-cli LLEN bull:repo-analysis:wait
```

### "GitHub OAuth not working"

- Verify callback URL is exactly: `http://localhost:3000/api/auth/callback/github`
- Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in `.env.local`
- Make sure NEXTAUTH_SECRET is set

### "Python dependencies failed to install"

```bash
# Use virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r apps/worker/requirements.txt
```

---

## Next Steps

Now that you have RepoLens running:

1. **Explore the Code:**
   - Frontend: `apps/web/src/app/`
   - API: `apps/api/src/`
   - Worker: `apps/worker/src/`

2. **Add Features:**
   - Implement 3D dependency graph visualization
   - Enhance AI prompts for better explanations
   - Add support for more programming languages

3. **Customize:**
   - Modify risk scoring rules: `apps/worker/src/analysis/risk_scorer.py`
   - Add new analysis metrics
   - Customize UI theme

4. **Deploy:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

## Useful Commands

```bash
# View database in browser
cd packages/database
npx prisma studio
# Opens at http://localhost:5555

# Reset database
npx prisma migrate reset

# View logs (Docker services)
docker-compose logs -f postgres
docker-compose logs -f redis

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

---

## Development Tips

### Hot Reload

All services support hot reload:
- **Frontend**: Auto-refreshes on file changes
- **API**: Watches TypeScript files
- **Worker**: Restart manually for changes

### Debugging

**Frontend:**
- Use React DevTools
- Check browser console

**API:**
- Add breakpoints in VSCode
- Use NestJS logger

**Worker:**
- Add `print()` statements
- Check worker terminal output

### Database Queries

```bash
# View all scans
psql "postgresql://repolens:repolens_dev_password@localhost:5432/repolens" \
  -c "SELECT id, \"repoUrl\", status, \"createdAt\" FROM scans ORDER BY \"createdAt\" DESC LIMIT 10;"
```

---

## Common Development Workflows

### Adding a New API Endpoint

1. Create controller method in `apps/api/src/scan/scan.controller.ts`
2. Add service logic in `apps/api/src/scan/scan.service.ts`
3. Update types in `packages/shared/types.ts`
4. Call from frontend in `apps/web/src/lib/api-client.ts`

### Adding a New Analysis Feature

1. Create analyzer in `apps/worker/src/analysis/`
2. Add to orchestrator in `apps/worker/src/analysis/orchestrator.py`
3. Update result types in `packages/shared/types.ts`
4. Display in frontend dashboard

### Updating the Database Schema

1. Edit `packages/database/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Regenerate client: `npx prisma generate`
4. Restart API server

---

## Resources

- **Documentation**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: http://localhost:3001/api (when running)

---

## Getting Help

If you're stuck:

1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed information
2. Search existing GitHub issues
3. Create a new issue with:
   - What you're trying to do
   - What error you're seeing
   - Your environment (OS, Node version, etc.)

---

**Happy coding!** 🚀
