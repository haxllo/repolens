# 🚀 START HERE - RepoLens

Welcome! This is your starting point for RepoLens setup.

---

## 📋 What is RepoLens?

**AI-powered GitHub repository analysis platform**
- Deep code analysis with AST parsing  
- AI-generated architecture summaries
- Code quality metrics and tech stack detection
- Historical tracking and comparisons

---

## 🎯 Quick Links

### 🌐 Cloud Deployment (Recommended)
**Deploy to production in 30 minutes - 100% FREE tier!**

📖 **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** - Complete cloud deployment guide

**Stack:**
- Frontend: Vercel (FREE)
- Backend: Render - Combined API+Worker (FREE)
- Database: Neon PostgreSQL (FREE)
- Redis: Upstash (FREE)

---

### 💻 Local Development  
**Run locally for development/testing**

📖 **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup

**Requirements:**
- Node.js 18+
- Python 3.11+
- Docker (optional)

---

## 📚 All Documentation

- **[README.md](./README.md)** - Project overview
- **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** - Cloud deployment (FREE tier)
- **[COMBINED_DEPLOYMENT.md](./COMBINED_DEPLOYMENT.md)** - Combined API+Worker details
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture  
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Roadmap & status
- **[DECISIONS.md](./DECISIONS.md)** - Design decisions
- **[PRD.md](./PRD.md)** - Product requirements

---

## 🔑 What You Need

### API Keys Required

1. **GitHub OAuth** → https://github.com/settings/developers
2. **OpenRouter** (FREE) → https://openrouter.ai/keys  
3. **Gemini** (Alternative) → https://aistudio.google.com/app/apikey

---

## 🏗️ Architecture

```
Frontend (Vercel) → API + Worker (Render) → Neon (DB) + Upstash (Redis)
```

Why combined? Render charges for workers, so we run API + Worker in one container = FREE!

---

## ⚡ Quick Start

**Cloud Deployment (5 steps):**
1. Create Neon database
2. Create Upstash Redis
3. Deploy to Render (combined)
4. Deploy to Vercel (frontend)
5. Initialize database schema

📖 Full guide: [CLOUD_SETUP.md](./CLOUD_SETUP.md)

---

## 🐛 Common Issues

- **Redis errors**: Use `rediss://` (with TLS)
- **CORS errors**: Remove trailing slash from FRONTEND_URL
- **Worker not processing**: Check both API+Worker started in logs

More: [CLOUD_SETUP.md Troubleshooting](./CLOUD_SETUP.md#troubleshooting)

---

## 🎓 Next Steps

1. Choose deployment method (Cloud or Local)
2. Follow the relevant guide
3. Test with a repository analysis
4. Customize and contribute!

---

**Ready?** → [CLOUD_SETUP.md](./CLOUD_SETUP.md) | [DEVELOPMENT.md](./DEVELOPMENT.md)
