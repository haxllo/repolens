# RepoLens

## Project Overview

RepoLens is an AI-powered developer tool designed to provide structured, explainable insights into GitHub repositories. It combines deterministic static analysis (AST parsing) with AI-generated explanations to help developers understand codebases quickly.

**Key Features:**
*   **3D Dependency Graphs:** Interactive visualizations using Three.js.
*   **Smart Analysis:** AST parsing for JavaScript, TypeScript, and Python.
*   **AI Explanations:** Powered by Google Gemini and OpenRouter.
*   **Architecture:** Monorepo using Turborepo.

**Tech Stack:**
*   **Frontend:** Next.js 14 (App Router), TailwindCSS, React Three Fiber. (`apps/web`)
*   **Backend API:** NestJS, BullMQ. (`apps/api`)
*   **Worker:** Python 3.11, Tree-sitter. (`apps/worker`)
*   **Database:** PostgreSQL, Prisma. (`packages/database`)
*   **Queue:** Redis.

## Building and Running

### Prerequisites
*   Node.js >= 18.17.0
*   Python >= 3.11
*   Docker & Docker Compose (for Postgres/Redis)

### Installation
1.  **Install Node dependencies:**
    ```bash
    npm install
    ```
2.  **Install Python dependencies (Worker):**
    ```bash
    cd apps/worker
    pip install -r requirements.txt
    cd ../..
    ```

### Configuration
Copy the example environment files and configure them (especially database URLs and API keys):
```bash
cp .env.example.web apps/web/.env.local
cp .env.example.api apps/api/.env
cp .env.example.worker apps/worker/.env
```

### Database Setup
Initialize the database using Prisma:
```bash
# Ensure Postgres and Redis are running (e.g., via docker-compose up -d postgres redis)
cd packages/database
npx prisma generate
npx prisma db push
cd ../..
```

### Running Development Servers
The services are best run in separate terminals:

*   **Frontend (http://localhost:3000):**
    ```bash
    npm run dev --filter=@repolens/web
    ```
*   **API (http://localhost:3001):**
    ```bash
    npm run dev --filter=@repolens/api
    ```
*   **Worker:**
    ```bash
    cd apps/worker
    python worker.py
    ```

*   **Full Stack (Docker):**
    ```bash
    docker-compose up --build
    ```

### Other Commands
*   **Build:** `npm run build` (uses Turbo to build all apps)
*   **Test:** `npm test`
*   **Lint:** `npm run lint`
*   **Clean:** `npm run clean`

## Development Conventions

*   **Monorepo:** Managed by Turborepo. Shared packages are in `packages/`.
*   **Workspaces:** Use `npm install <pkg> --workspace=@repolens/<app>` to add dependencies to specific apps.
*   **Styling:** TailwindCSS is used for the frontend.
*   **Database:** Schema changes are managed via Prisma in `packages/database`. Run `npx prisma migrate dev` to apply changes.
*   **Testing:** Jest is used for TypeScript/JavaScript.
