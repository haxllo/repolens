# RepoLens - Development Setup Guide

## Overview

RepoLens is a hybrid static-analysis + AI-powered developer tool built with:
- **Frontend**: Next.js 14 (App Router) + Three.js for 3D visualizations
- **API Gateway**: NestJS + BullMQ for job orchestration
- **Worker**: Python + tree-sitter for AST parsing
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: Redis + BullMQ
- **AI**: Google Gemini (free tier)

---

## Prerequisites

- **Node.js**: >= 18.17.0
- **Python**: >= 3.11
- **Docker** & **Docker Compose**: Latest versions
- **PostgreSQL**: 16+ (or use Docker)
- **Redis**: 7+ (or use Docker)

---

## Quick Start (Development)

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <your-repo-url>
cd repolens

# Install Node dependencies
npm install

# Install Python dependencies (worker)
cd apps/worker
pip install -r requirements.txt
cd ../..
\`\`\`

### 2. Set Up Environment Variables

\`\`\`bash
# Frontend
cp .env.example.web apps/web/.env.local

# API
cp .env.example.api apps/api/.env

# Worker
cp .env.example.worker apps/worker/.env
\`\`\`

**Configure these values:**

1. **GitHub OAuth** (apps/web/.env.local):
   - Go to https://github.com/settings/developers
   - Create new OAuth App
   - Set callback URL: \`http://localhost:3000/api/auth/callback/github\`
   - Copy Client ID and Secret

2. **Gemini API** (apps/worker/.env):
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Add to \`GEMINI_API_KEY\`

3. **NextAuth Secret** (apps/web/.env.local):
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`

### 3. Start Infrastructure (Docker)

\`\`\`bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
\`\`\`

### 4. Initialize Database

\`\`\`bash
cd packages/database
npx prisma generate
npx prisma db push
cd ../..
\`\`\`

### 5. Start Development Servers

**Terminal 1: Frontend**
\`\`\`bash
npm run dev --filter=@repolens/web
# Runs on http://localhost:3000
\`\`\`

**Terminal 2: API Gateway**
\`\`\`bash
npm run dev --filter=@repolens/api
# Runs on http://localhost:3001
\`\`\`

**Terminal 3: Python Worker**
\`\`\`bash
cd apps/worker
python worker.py
\`\`\`

---

## Docker Development (Full Stack)

\`\`\`bash
# Build and start all services
docker-compose up --build

# Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
\`\`\`

---

## Project Structure

\`\`\`
repolens/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities
│   │   └── package.json
│   │
│   ├── api/                 # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── scan/        # Scan endpoints
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── worker/              # Python worker
│       ├── src/
│       │   ├── analysis/    # Analysis orchestration
│       │   ├── parsers/     # AST parsers
│       │   └── ai/          # AI explanations
│       └── worker.py
│
├── packages/
│   ├── database/            # Prisma schema
│   └── shared/              # Shared TypeScript types
│
└── docker-compose.yml
\`\`\`

---

## Development Workflow

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Test specific package
npm test --filter=@repolens/api
\`\`\`

### Linting & Formatting

\`\`\`bash
# Lint all packages
npm run lint

# Format code
npm run format
\`\`\`

### Database Changes

\`\`\`bash
cd packages/database

# Create migration
npx prisma migrate dev --name your_migration_name

# View database
npx prisma studio
\`\`\`

### Adding Dependencies

\`\`\`bash
# Add to specific app
npm install <package> --workspace=@repolens/web

# Add to root (dev dependencies)
npm install -D <package>
\`\`\`

---

## Environment Variables Reference

### Frontend (apps/web/.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| \`NEXT_PUBLIC_API_URL\` | API Gateway URL | \`http://localhost:3001\` |
| \`NEXTAUTH_URL\` | NextAuth base URL | \`http://localhost:3000\` |
| \`NEXTAUTH_SECRET\` | NextAuth secret key | Generated with openssl |
| \`GITHUB_CLIENT_ID\` | GitHub OAuth Client ID | From GitHub settings |
| \`GITHUB_CLIENT_SECRET\` | GitHub OAuth Secret | From GitHub settings |

### API (apps/api/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| \`DATABASE_URL\` | PostgreSQL connection | \`postgresql://user:pass@localhost:5432/db\` |
| \`REDIS_HOST\` | Redis hostname | \`localhost\` |
| \`REDIS_PORT\` | Redis port | \`6379\` |
| \`PORT\` | API server port | \`3001\` |
| \`FRONTEND_URL\` | Frontend URL for CORS | \`http://localhost:3000\` |

### Worker (apps/worker/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| \`REDIS_URL\` | Redis connection URL | \`redis://localhost:6379\` |
| \`GEMINI_API_KEY\` | Google Gemini API key | From Google AI Studio |
| \`SANDBOX_DIR\` | Temp directory for clones | \`/tmp/repolens-sandboxes\` |

---

## Troubleshooting

### Port Already in Use

\`\`\`bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
PORT=3002 npm run dev
\`\`\`

### Database Connection Issues

\`\`\`bash
# Check PostgreSQL is running
docker-compose ps postgres

# Reset database
cd packages/database
npx prisma migrate reset
\`\`\`

### Worker Not Processing Jobs

\`\`\`bash
# Check Redis connection
redis-cli ping

# View queue status
redis-cli LLEN bull:repo-analysis:wait
\`\`\`

### Tree-sitter Installation Issues

\`\`\`bash
# Reinstall with verbose output
pip install tree-sitter --verbose

# Install language parsers individually
pip install tree-sitter-javascript tree-sitter-typescript tree-sitter-python
\`\`\`

---

## Next Steps

1. **Add 3D Visualization**: Implement Three.js dependency graph in \`apps/web/src/components/graphs/\`
2. **Enhance AI Prompts**: Improve prompts in \`apps/worker/src/ai/explainer.py\`
3. **Add More Languages**: Extend parsers in \`apps/worker/src/parsers/\`
4. **Deploy**: See deployment guides for Vercel (frontend) and Railway (backend)

---

## Useful Commands

\`\`\`bash
# Clean all build artifacts
npm run clean

# Rebuild all packages
npm run build

# View Prisma Studio
npm run db:studio --filter=@repolens/database

# View logs (Docker)
docker-compose logs -f worker
\`\`\`

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Three.js Documentation](https://threejs.org/docs)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter)

---

## License

MIT
