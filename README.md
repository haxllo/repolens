# RepoLens

**Understand any GitHub repository in minutes, not days.**

RepoLens is a hybrid static-analysis + AI-powered developer tool that produces:
- 3D interactive dependency visualizations
- AI-generated repository summaries
- Entry-point "read this first" guides
- Risk and maintainability scoring
- Architecture insights based on deterministic analysis

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