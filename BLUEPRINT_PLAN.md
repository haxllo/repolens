# RepoLens: Living Roadmap (The "CodeWiki" Pivot)

**Core Vision:** Transform RepoLens from a static analysis tool into an **Interactive, AI-Powered Operating System for Codebases**.
**North Star:** Surpass the capabilities of "CodeWiki" by adding deep system intelligence and live code execution.

---

## 🏗️ Phase 1: The "System Intelligence" Backend (Status: IN PROGRESS)
**Goal:** Understand the "How" (Workflows/Infra), not just the "What" (Code).

- [x] **SystemAnalyzer**: Parse `scripts`, `Makefile`, `.github/workflows`. (`apps/worker/src/analysis/system_analyzer.py`)
- [x] **Orchestrator Integration**: Inject system data into the AI context.
- [x] **Context-Aware Prompt**: Teach AI to write "Development Workflow" & "Infrastructure" chapters.
- [ ] **Infrastructure Categorizer**: Detect Docker, K8s, Terraform and group them intelligently.

## ⚡ Phase 2: The "Live Execution" Engine (Status: STARTED)
**Goal:** Allow users to verify code and AI explanations instantly.

- [x] **SandboxService (Worker)**: Secure Docker execution environment. (`apps/worker/src/analysis/sandbox_service.py`)
- [ ] **API Gateway**: New endpoint `POST /scan/:id/execute` to trigger worker jobs.
- [ ] **Frontend**: `WikiView` component with "Run Code" buttons on code blocks.
- [ ] **Streaming**: Real-time stdout/stderr streaming via WebSockets/Redis PubSub.

## 🗺️ Phase 3: The "Architectural Blueprint" (Status: PLANNED)
**Goal:** Replace the chaotic 3D sphere with a structured, engineer-friendly map.

- [ ] **ReactFlow Integration**: Move from Three.js to ReactFlow for 2D, readable diagrams.
- [ ] **Layered Layout**: Automatically sort nodes by responsibility (UI -> Logic -> Data).
- [ ] **Interactive Overlays**: Toggle "Risk Heatmap", "Data Flow", "Test Coverage".

## 🧠 Phase 4: The "Second Brain" (Status: RESEARCH)
**Goal:** Personalized AI that learns your specific coding style.

- [ ] **Vector Database**: Store embeddings of all code files (pgvector).
- [ ] **RAG Pipeline**: "Retrieval Augmented Generation" for answering generic questions ("How do we handle auth?").
- [ ] **User Context**: "Train" the model on the user's past PRs to mimic their tone.

---

## 📈 Current Focus: Phase 2 (Live Execution)
**Objective:** Connect the frontend "Run" button to the backend Sandbox.

### Technical Tasks
1.  **Apps/API**: Create `ExecutionController` and `ExecutionQueue`.
2.  **Apps/Web**: Update `WikiView` to parse ````python` blocks.
3.  **Apps/Worker**: Implement the job processor for `execution` queue.

---

*This document is a living artifact. Update it as we learn and pivot.*