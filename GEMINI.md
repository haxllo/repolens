# GEMINI_INSTRUCTIONAL_CONTEXT // REPOLENS

This document serves as the primary instructional context for Gemini AI agents interacting with the RepoLens codebase. It defines the architectural mental model, development protocols, and engineering standards of the project.

---

## PROJECT_OVERVIEW

RepoLens is a high-performance **Architectural Diagnostic Engine**. It transforms complex software repositories into structured, navigable, and executable knowledge bases.

### CORE_MISSION
Surpass traditional documentation tools (like CodeWiki) by transitioning from a passive "Reader" to an **Interactive Architectural Operating System**.

### KEY_TECHNOLOGIES
- **Frontend**: Next.js 14 (App Router), ReactFlow (Spatial Mapping), Tailwind CSS.
- **API Gateway**: NestJS, BullMQ (Job Orchestration).
- **Analysis Core**: Python 3.11 (Tree-sitter), transitioning to **Rust (OXC, SCIP)** for 100x performance.
- **Intelligence**: Google Gemini 2.0 Thinking Models.
- **Execution**: Native Docker Sandboxing (on AWS EC2).
- **Data Layer**: Neon (PostgreSQL), Upstash (Redis), Cloudflare (Vectorize).

---

## SYSTEM_ARCHITECTURE

RepoLens uses a distributed analysis pipeline:
1. **Intake**: User submits a GitHub URL via the Next.js frontend.
2. **Orchestration**: The NestJS API validates the request and dispatches a job to BullMQ.
3. **Analysis**: 
   - **Static**: Tree-sitter (current) / OXC (future) parses AST and identifies patterns (Zustand, Radix, etc.).
   - **System**: Parses CI/CD workflows, Makefiles, and build scripts.
   - **Semantic**: Generates symbolic indexes (SCIP) for cross-file navigation.
4. **Synthesis**: Gemini 2.0 generates structured Wiki chapters and architectural summaries.
5. **Memory**: Embeddings are generated and stored in Cloudflare Vectorize for RAG-based queries.
6. **Execution**: Snippets are verified in an isolated Docker sandbox.

---

## ENGINEERING_STANDARDS // ROBUST_MONOTONE_PREMIUM

The project adheres to a strict visual and technical protocol:

### AESTHETIC_PROTOCOL
- **Monotone Focus**: Pure black (#000000), architectural grays, and sharp white text.
- **Accent**: Singular use of **Lime-400 (#a3e635)** for active functional states and primary actions.
- **Sharp Geometry**: 0px border-radius globally. No rounded corners.
- **Zero-Emoji Protocol**: No emojis in source code, documentation, or UI. Use Lucide icons or technical labels.
- **Typography**: High-contrast, bold uppercase headers. Monospace for all technical metadata (IDs, Logs, Metrics).

### TECHNICAL_PROTOCOL
- **Robustness First**: All components must handle failure modes gracefully (e.g., 429 Quota limits, missing Docker socket).
- **Security**: Native execution must be isolated. No internet access for sandboxed containers.
- **Concurrency**: Parallel parsing and asynchronous job handling.

---

## BUILDING_AND_RUNNING

### PREREQUISITES
- Node.js >= 18.17.0
- Python >= 3.11
- Docker & Docker Compose (V2)

### COMMAND_INDEX
| Task | Command |
| :--- | :--- |
| **Initialize** | `pnpm install` |
| **Development** | `pnpm dev` |
| **Build** | `pnpm build` |
| **Database Sync** | `pnpm dlx prisma db push` |
| **Backend Deploy** | `docker compose up -d --build` |
| **Cleanup** | `pnpm clean` |

---

## DEVELOPMENT_CONVENTIONS

- **Monorepo Management**: Powered by **Turborepo**. Use `--filter` to target specific apps (e.g., `npm run dev --filter=@repolens/web`).
- **Data Access**: Use the **Prisma Client** directly for database operations.
- **AI Integration**: AI-related logic resides in `apps/worker/src/ai/explainer.py`.
- **Roadmap Alignment**: Always consult `BLUEPRINT_PLAN.md` before initiating major refactors.

---

## AGENT_INTERACTION_GUIDELINES

When acting as an agent within this repository:
1. **Maintain the Tone**: Be analytical, authoritative, and visionary. Avoid conversational filler.
2. **Respect the Aesthetic**: Ensure any new UI components follow the 0px radius, monotone, sharp-edged protocol.
3. **Verify Robustness**: Always run `npm run build` after UI changes.
4. **Purge Informalism**: Never introduce emojis or "startup-style" indigo/purple gradients.

(C) 2026 REPOLENS // ARCHITECTURAL_ARCHIVE_VAULT
