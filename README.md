# RepoLens

**Understand any GitHub repository in minutes, not days.**

RepoLens is an AI-powered developer tool that produces:
- AI-generated repository summaries and architecture insights
- Deep code analysis with AST parsing
- Code quality metrics and tech stack detection
- Historical tracking and repository evolution
- User favorites and scan history

---

## ✨ Features

- **Smart Analysis:** AST parsing with tree-sitter for JavaScript, TypeScript, Python
- **AI Insights:** OpenRouter/Gemini-powered explanations and architecture summaries
- **Quality Metrics:** Code patterns, complexity analysis, maintainability scoring
- **GitHub Integration:** OAuth authentication for seamless repository access
- **Historical Tracking:** Compare scans over time, track repository changes
- **User Dashboard:** Favorites, recent scans, and analytics

---

## 🏗️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React, TypeScript
- TailwindCSS
- NextAuth.js

### Backend (Combined API + Worker)
- NestJS (API Gateway)
- Python 3.11 (Analysis Worker)
- BullMQ (Job Queue)
- PostgreSQL + Prisma
- Redis (IORedis)

### Analysis
- tree-sitter (AST parsing)
- OpenRouter (free tier: `mistralai/devstral-2512:free`)
- Google Gemini (alternative)

### Infrastructure (100% FREE Tier)
- **Frontend**: Vercel
- **Backend**: Render (Combined API + Worker in single container)
- **Database**: Neon PostgreSQL
- **Cache/Queue**: Upstash Redis

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.17.0
- Python >= 3.11
- Docker & Docker Compose (optional, for local dev)

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/repolens.git
cd repolens

# Install dependencies
npm install

# Set up environment
cp .env.example.web apps/web/.env.local
cp .env.example.api apps/api/.env
cp .env.example.worker apps/worker/.env
# Edit files with your credentials

# Start infrastructure (local)
docker-compose up -d

# Initialize database
cd packages/database
npx prisma generate
npx prisma db push
cd ../..

# Start services (3 terminals)
cd apps/api && npm run dev           # Terminal 1: API (http://localhost:3001)
cd apps/worker && python worker.py   # Terminal 2: Worker
cd apps/web && npm run dev           # Terminal 3: Frontend (http://localhost:3000)
```

See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for detailed setup.

---

## ☁️ Cloud Deployment (FREE)

Deploy the entire platform on **100% free tier**:

**Total Cost: $0/month** 🎉

**Setup Steps:**
1. Database (Neon) + Redis (Upstash)
2. Combined Backend (Render) - API + Worker in one container
3. Frontend (Vercel)

Follow the step-by-step guide: **[CLOUD_SETUP.md](./CLOUD_SETUP.md)**

**Why Combined Deployment?**
Render charges for Background Workers, so we run both API and Worker in a single container to stay free. See **[COMBINED_DEPLOYMENT.md](./COMBINED_DEPLOYMENT.md)** for details.

---

## 🔑 Required API Keys

### GitHub OAuth
1. https://github.com/settings/developers
2. Create OAuth App
3. Callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

### OpenRouter (Recommended - Free)
1. https://openrouter.ai/keys
2. Free model: `mistralai/devstral-2512:free`

### Google Gemini (Alternative)
1. https://aistudio.google.com/app/apikey

---

## 📂 Project Structure

```
repolens/
├── apps/
│   ├── web/          # Next.js frontend (Vercel)
│   ├── api/          # NestJS API Gateway (Render)
│   └── worker/       # Python analysis worker (Render - same container)
├── packages/
│   ├── database/     # Prisma schema & migrations
│   └── shared/       # Shared TypeScript types
├── Dockerfile.combined     # Combined API+Worker container
├── start-combined.sh       # Startup orchestration script
└── render-combined.yaml    # Render deployment blueprint
```

---

## 🗺️ Roadmap

**Phase 1 (MVP - ✅ COMPLETE):**
- ✅ Monorepo setup (Turborepo)
- ✅ Next.js frontend with NextAuth
- ✅ NestJS API + BullMQ queue
- ✅ Python worker with tree-sitter
- ✅ GitHub OAuth
- ✅ Prisma database schema
- ✅ AST parsing and analysis
- ✅ AI explanation integration (OpenRouter/Gemini)
- ✅ Combined deployment for free tier
- ✅ Production deployment

**Phase 2 (Enhanced Features - 📋 PLANNED):**
- 📋 Private repository support
- 📋 More language support (Java, Go, Rust)
- 📋 Enhanced dependency analysis
- 📋 Pull request analysis
- 📋 Team collaboration features
- 📋 Advanced metrics dashboard
- 📋 Webhooks for auto-analysis

**Future (Enterprise):**
- Multi-repo analytics
- Custom rule engines
- Architecture diagram generation
- Audit reports
- SSO integration
- Team dashboards

See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** for detailed status.

---

## 🛡️ Security

- 🔒 Sandboxed repository analysis (temporary clones in `/tmp`)
- 🔒 GitHub OAuth with minimal scopes
- 🔒 Rate limiting and CORS protection
- 🔒 Encrypted secrets and tokens
- 🔒 Auto-cleanup of cloned repositories
- 🔒 TLS for all external connections (Neon, Upstash)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Submit a pull request

See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for setup and **[ARCHITECTURE.md](./ARCHITECTURE.md)** for design principles.

---

## 📚 Documentation

- **[START_HERE.md](./START_HERE.md)** - Project overview
- **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** - Cloud deployment (FREE tier)
- **[COMBINED_DEPLOYMENT.md](./COMBINED_DEPLOYMENT.md)** - Combined API+Worker setup
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current status & roadmap

---

## 🐛 Troubleshooting

### "Connection closed by server" (Redis)
- Ensure using TLS: `rediss://` (note the extra 's')
- Check Upstash credentials are correct

### "@prisma/client not initialized"
- Run: `npx prisma generate --schema=packages/database/prisma/schema.prisma`

### CORS errors
- Verify `FRONTEND_URL` has no trailing slash
- Must match your Vercel domain exactly

### Worker not processing jobs
- Check both API and Worker are running (combined logs)
- Verify Redis URL is correct with TLS
- Check OpenRouter/Gemini API key is valid

See **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** Troubleshooting section for more.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

- **Documentation**: Check the docs above
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ using Next.js, NestJS, and Python**

---

## Features

- **3D Dependency Graphs:** Interactive Three.js visualizations of module relationships
- **Smart Analysis:** AST parsing with tree-sitter for JavaScript, TypeScript, Python
- **Risk Assessment:** Automated scoring for tech debt, complexity, and maintainability
- **AI Explanations:** Gemini-powered insights based on deterministic analysis (no hallucinations)
- **Secure Sandboxing:** All repositories analyzed in isolated Docker containers
- **GitHub Integration:** OAuth authentication for seamless repository access

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Three.js + React Three Fiber (3D visualizations)
- TailwindCSS + Shadcn/ui
- React Query + Zustand

### Backend
- NestJS (API Gateway)
- Python (Analysis Worker)
- BullMQ (Job Queue)
- PostgreSQL + Prisma
- Redis

### Analysis
- tree-sitter (AST parsing)
- Google Gemini (AI explanations)
- Custom rules engine (risk scoring)

---

## Quick Start

### Prerequisites

- Node.js >= 18.17.0
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd repolens

# Install dependencies
npm install

# Set up environment
cp .env.example.web apps/web/.env.local
cp .env.example.api apps/api/.env
cp .env.example.worker apps/worker/.env

# Start infrastructure
docker-compose up -d postgres redis

# Initialize database
cd packages/database
npx prisma generate
npx prisma db push
cd ../..

# Start services (3 terminals)
npm run dev --filter=@repolens/web    # Terminal 1: http://localhost:3000
npm run dev --filter=@repolens/api    # Terminal 2: http://localhost:3001
cd apps/worker && python worker.py    # Terminal 3: Worker
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

---

## Usage

1. **Sign in** with GitHub OAuth
2. **Submit** a repository URL
3. **Wait** for async analysis (1-5 minutes)
4. **Explore** 3D dependency graphs and AI insights
5. **Export** reports and visualizations

---

## Project Structure

```
repolens/
├── apps/
│   ├── web/         # Next.js frontend (Vercel)
│   ├── api/         # NestJS API Gateway (Railway)
│   └── worker/      # Python analysis worker (Railway)
├── packages/
│   ├── database/    # Prisma schema
│   └── shared/      # Shared TypeScript types
└── docker/          # Docker configurations
```

---

## Architecture

RepoLens separates **deterministic static analysis** from **AI explanations** to ensure:
- No hallucinated insights
- Reproducible results
- Explainable scoring
- Secure sandboxed execution

**Data Flow:**
```
User → API Gateway → Job Queue → Python Worker → {
  1. Clone repo (sandboxed)
  2. Detect languages
  3. Parse AST (tree-sitter)
  4. Analyze dependencies
  5. Calculate risk scores
  6. Generate AI explanations (Gemini)
} → Results → 3D Visualization
```

---

## Roadmap

**Phase 1 (MVP Foundation - ✅ COMPLETE):**
- ✅ Monorepo setup (Turborepo)
- ✅ Next.js frontend with Three.js
- ✅ NestJS API + BullMQ queue
- ✅ Python worker with tree-sitter
- ✅ GitHub OAuth
- ✅ Prisma database schema
- ✅ AST parsing and dependency analysis
- ✅ Risk scoring engine
- ✅ AI explanation integration

**Phase 2 (Enhanced Features - 🚀 IN PROGRESS):**
- 🚧 Private repository support
- 🚧 Enhanced AST analysis (circular deps, dead code)
- 🚧 README quality scoring and improvements
- 🚧 Historical tracking and comparisons
- 🚧 Advanced visualizations (2D fallback, heatmaps)
- 🚧 User dashboard enhancements

**Phase 3 (Production Ready - 📋 PLANNED):**
- 📋 Security hardening and audit
- 📋 Performance optimization
- 📋 Monitoring and logging
- 📋 Production deployment (Vercel, Railway, Neon, Upstash)
- 📋 CI/CD pipeline

**Future (Enterprise Features):**
- Multi-repo analytics
- Custom rule engines
- Architecture diagram generation
- Audit reports
- SSO integration
- Team dashboards

---

## Deployment

### Production Stack
- **Frontend**: Vercel
- **Backend**: Railway (API + Worker)
- **Database**: Neon (Serverless PostgreSQL)
- **Cache**: Upstash (Serverless Redis)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

---

## Security

- 🔒 Sandboxed repository analysis (Docker containers)
- 🔒 No arbitrary code execution
- 🔒 GitHub OAuth with minimal scopes
- 🔒 Rate limiting and abuse prevention
- 🔒 Encrypted secrets and tokens
- 🔒 Auto-cleanup of cloned repositories

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm test`
5. Submit a pull request

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [DECISIONS.md](./DECISIONS.md) for design principles.

---

## License

MIT License - see [LICENSE](./LICENSE) for details

---

## Support

- **Documentation**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ for developers who want to understand code faster**