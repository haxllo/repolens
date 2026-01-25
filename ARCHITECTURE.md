# SYSTEM_ARCHITECTURE_SPECIFICATION

RepoLens is transitioning to a high-performance, semantic-aware architecture optimized for massive repositories and industrial-grade diagnostics.

---

### CORE_SERVICES

#### 1. API_GATEWAY (NESTJS)
- **Protocol**: REST / JSON.
- **Responsibility**: User authentication, scan orchestration, and result delivery.
- **Queue Management**: Dispatches jobs to the Analysis Core via BullMQ / Redis.

#### 2. OXIDIZED_ANALYSIS_ENGINE (RUST)
- **Language**: Rust 1.75+.
- **Parsing Core**: OXC (Oxidation Compiler) for JS/TS; Tree-sitter for secondary languages.
- **Semantic Layer**: SCIP (Symbolic Code Index Protocol) for definition-reference mapping.
- **Intelligence**: Integrated with Gemini 2.0 via async Rust handlers.
- **Sandbox**: Native Docker Engine integration for code execution.

#### 3. KNOWLEDGE_INDEX (DATABASE)
- **Metadata**: PostgreSQL (Neon).
- **Queue**: Redis (Upstash).
- **Semantic**: Vectorize (Cloudflare) for RAG-based architectural queries.

---

### DATA_FLOW_PROTOCOL (OXIDIZED)

1. **INGESTION**: User submits repository coordinates.
2. **PARALLEL_FETCH**: Worker clones source to an ephemeral local buffer.
3. **SEMANTIC_INDEXING**: 
   - **OXC** parses syntax and resolves symbols.
   - **SCIP** generates a symbolic dependency graph.
4. **SYNTHESIS**: Gemini LLM generates structural Wiki chapters based on semantic symbols (not just text).
5. **PERSISTENCE**: Results stored in PostgreSQL; symbolic map cached in Redis.

---

### ROBUSTNESS_FEATURES

- **Zero-GIL Concurrency**: Multi-threaded parsing using Rust's Rayon.
- **Compiler-Grade Accuracy**: Exact definition-to-reference mapping via SCIP.
- **Memory Safety**: Arena-allocated ASTs for zero-leak performance.
- **Isolated Runtimes**: Network-less Docker containers for verification.