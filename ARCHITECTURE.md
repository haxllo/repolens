# SYSTEM_ARCHITECTURE_SPECIFICATION

RepoLens follows a distributed analysis pattern optimized for deep repository indexing and secure code execution.

---

### CORE_SERVICES

#### 1. API_GATEWAY (NESTJS)
- Protocol: REST / JSON.
- Responsibility: User authentication, scan job orchestration, and results distribution.
- Auth: Better Auth (Frontend) + JWT (Backend).

#### 2. ANALYSIS_CORE (PYTHON)
- Language: Python 3.11+.
- Primary Engine: Tree-sitter for AST parsing.
- Intelligence: Gemini 2.0 via Google Generative AI SDK.
- Sandbox: Native Docker Engine (Mounted /var/run/docker.sock).

#### 3. KNOWLEDGE_INDEX (DATABASE)
- Metadata: PostgreSQL (Neon).
- Queue: Redis (Upstash).
- Semantic: Vectorize (Cloudflare).

---

### DATA_FLOW_PROTOCOL

1. **INTAKE**: User submits GitHub URL.
2. **ORCHESTRATION**: API adds job to BullMQ.
3. **CLONING**: Worker clones source to ephemeral /tmp sandbox.
4. **ANALYSIS**: Tree-sitter parses syntax; SystemAnalyzer parses workflows.
5. **SYNTHESIS**: Gemini LLM generates structural Wiki chapters.
6. **INDEXING**: Embeddings generated and pushed to Cloudflare Vectorize.
7. **PERSISTENCE**: Results stored in PostgreSQL; cleanup initiated.

---

### SECURITY_MODEL

- Ephemeral storage for all code clones.
- Isolated container runtime for all code execution (Sandbox).
- Zero internet access for sandbox containers.
- Encrypted secrets at rest.
