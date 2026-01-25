# RepoLens - Development Setup Guide

## Overview

RepoLens is a hybrid static-analysis + AI-powered developer tool built with:
- **Frontend**: Next.js 14 (App Router) + ReactFlow for spatial maps
- **API Gateway**: NestJS + BullMQ for job orchestration
- **Worker**: Python + tree-sitter for AST parsing
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: Redis + BullMQ
- **AI**: Google Gemini (free tier)

---

## Prerequisites

- **Node.js**: >= 18.17.0
- **pnpm**: >= 9.0.0 (Required for package management)
- **Python**: >= 3.11
- **Docker** & **Docker Compose**: Latest versions
- **PostgreSQL**: 16+ (or use Docker)
- **Redis**: 7+ (or use Docker)

---

## Quick Start (Development)

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd repolens

# Install Node dependencies using pnpm
pnpm install

# Install Python dependencies (worker)
cd apps/worker
pip install -r requirements.txt
cd ../..
```

### 2. Set Up Environment Variables

```bash
# Frontend
cp .env.example.web apps/web/.env.local

# API
cp .env.example.api apps/api/.env

# Worker
cp .env.example.worker apps/worker/.env
```

---

### 3. Start Infrastructure (Docker)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

### 4. Initialize Database

```bash
# Using pnpm dlx for prisma
pnpm dlx prisma generate --schema=./packages/database/prisma/schema.prisma
pnpm dlx prisma db push --schema=./packages/database/prisma/schema.prisma
```

### 5. Start Development Servers

**Terminal 1: Frontend**
```bash
pnpm dev --filter=@repolens/web
# Runs on http://localhost:3000
```

**Terminal 2: API Gateway**
```bash
pnpm dev --filter=@repolens/api
# Runs on http://localhost:3001
```

**Terminal 3: Python Worker**
```bash
cd apps/worker
python worker.py
```

---

## Project Structure

```
repolens/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # NestJS API Gateway
│   └── worker/              # Python worker
│
├── packages/
│   ├── database/            # Prisma schema
│   └── shared/              # Shared TypeScript types
│
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

---

## Development Workflow

### Running Tests

```bash
pnpm test
pnpm test --filter=@repolens/api
```

### Linting & Formatting

```bash
pnpm lint
pnpm format
```

### Adding Dependencies

```bash
# Add to specific app
pnpm add <package> --filter @repolens/web

# Add to root
pnpm add -w <package>
```

---

## Useful Commands

```bash
# Clean all build artifacts
pnpm clean

# Rebuild all packages
pnpm build

# View logs (Docker)
docker compose logs -f worker
```

---

## License

MIT