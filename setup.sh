#!/bin/bash

# RepoLens - Quick Setup Script
# This script helps you get RepoLens running quickly

set -e

echo "🚀 RepoLens Quick Setup"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if environment files exist
echo "🔧 Checking environment files..."
if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating apps/web/.env.local from template${NC}"
    cp .env.example.web apps/web/.env.local
fi

if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating apps/api/.env from template${NC}"
    cp .env.example.api apps/api/.env
fi

if [ ! -f "apps/worker/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating apps/worker/.env from template${NC}"
    cp .env.example.worker apps/worker/.env
fi

if [ ! -f "packages/database/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating packages/database/.env${NC}"
    echo 'DATABASE_URL="postgresql://repolens:repolens_dev_password@localhost:5432/repolens"' > packages/database/.env
fi
echo -e "${GREEN}✅ Environment files ready${NC}"
echo ""

# Start infrastructure
echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are healthy
if docker-compose ps postgres | grep -q "healthy"; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not healthy${NC}"
fi

if docker-compose ps redis | grep -q "healthy"; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not healthy${NC}"
fi
echo ""

# Initialize database
echo "🗄️  Initializing database..."
cd packages/database
npx prisma generate > /dev/null 2>&1
npx prisma db push > /dev/null 2>&1
cd ../..
echo -e "${GREEN}✅ Database initialized${NC}"
echo ""

# Check if GitHub OAuth is configured
echo "🔐 Checking GitHub OAuth configuration..."
if grep -q "your-github-client-id" apps/web/.env.local; then
    echo -e "${YELLOW}⚠️  GitHub OAuth not configured yet${NC}"
    echo ""
    echo "To enable GitHub OAuth:"
    echo "1. Go to https://github.com/settings/developers"
    echo "2. Create a new OAuth App"
    echo "3. Set callback URL: http://localhost:3000/api/auth/callback/github"
    echo "4. Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in apps/web/.env.local"
    echo ""
else
    echo -e "${GREEN}✅ GitHub OAuth appears to be configured${NC}"
fi

# Check if Gemini API key is configured
if grep -q "your-gemini-api-key" apps/worker/.env; then
    echo -e "${YELLOW}⚠️  Gemini API key not configured yet${NC}"
    echo ""
    echo "To enable AI explanations:"
    echo "1. Go to https://makersuite.google.com/app/apikey"
    echo "2. Create an API key"
    echo "3. Update GEMINI_API_KEY in apps/worker/.env"
    echo ""
else
    echo -e "${GREEN}✅ Gemini API key appears to be configured${NC}"
fi

echo ""
echo "✨ Setup complete! Next steps:"
echo ""
echo "To start the development servers, open 3 terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 - Frontend:${NC}"
echo "  npm run dev --filter=@repolens/web"
echo ""
echo -e "${YELLOW}Terminal 2 - API:${NC}"
echo "  npm run dev --filter=@repolens/api"
echo ""
echo -e "${YELLOW}Terminal 3 - Worker:${NC}"
echo "  cd apps/worker && python3 worker.py"
echo ""
echo -e "${GREEN}Then open http://localhost:3000 in your browser${NC}"
echo ""
