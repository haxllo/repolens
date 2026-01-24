# RepoLens Architecture

## Overview

RepoLens is a **modular, layered SaaS system** designed for scalability, explainability, and low-risk AI integration. The system separates **deterministic static analysis** from the **AI explanation layer**, preventing hallucinations or tunnel vision.

---

## Layers

### 1. Repository Intake
- **Responsibilities:** Clone, sanitize, and sandbox repos
- **Tech:** Node.js / Python
- **Security:** Read-only, auto-cleanup

### 2. Language & Project Detection
- Auto-detect language(s), framework, package manager
- Extract runtime metadata
- Output structured JSON for downstream analysis

### 3. Static Analysis
- AST parsing for JS/TS, Python
- Directory classification: entry points, core, config, tests
- Dependency graph generation
- Dead code detection, circular dependency analysis

### 4. Risk & Health Scoring
- JSON-based rules engine
- Maintains explainable metrics:
  - Tech debt
  - Test coverage
  - Complexity
  - Maintenance risk score

### 5. AI Explanation Layer
- Inputs only deterministic outputs
- Provides human-readable summaries:
  - Purpose
  - Entry points
  - Risk explanations
- Confidence-tagged
- No speculative or hallucinated outputs

### 6. Output / Reporting Layer
- Web dashboard + CLI
- Exportable:
  - Architecture diagrams (SVG)
  - Risk reports
  - README improvement reports

### 7. API Layer
- REST endpoints:
  - `POST /scan` → submit repo
  - `GET /status/:id` → scan status
  - `GET /results/:id` → scan results
- Async job processing for large repos

---

## Technology Stack

- Backend: Node.js / Python
- AI: OpenAI API (explanation-only)
- Frontend: Next.js
- Auth: Better Auth (with Prisma adapter)
- Job Queue: BullMQ / RabbitMQ
- Storage: Temp sandbox, optional DB for history

---

## Data Flow

```
[User submits repo URL]
          |
          v
[Repo Intake & Sandbox]
          |
          v
[Language Detection & Metadata Extraction]
          |
          v
[Static Analysis Layer] --> [Rules Engine] --> [Structured JSON]
          |
          v
[AI Explanation Layer] --> [Readable Summaries & Insights]
          |
          v
[Output Layer] --> CLI / Dashboard / Reports
```

---

## Design Principles

- **Explainable AI:** Never infer outside analysis
- **Modular & Extensible:** Add new language parsers or heuristics easily
- **Security-first:** No arbitrary code execution
- **Performance-aware:** Async processing for large repos