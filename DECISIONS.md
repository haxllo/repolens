# RepoLens Key Architectural & Design Decisions

## 1. Deterministic Core First
- **Decision:** Separate static analysis from AI explanations
- **Rationale:** Ensures reproducibility and avoids hallucinations
- **Alternative:** Full AI repo understanding (rejected for risk of tunnel vision)

## 2. AI as Explainable Layer Only
- **Decision:** AI can only translate deterministic insights into human-readable language
- **Rationale:** Maintains trust, reduces speculative outputs
- **Confidence:** High

## 3. Sandbox Isolation
- **Decision:** All repo scans occur in isolated, temporary environments
- **Rationale:** Security, avoids host contamination
- **Alternative:** Direct local analysis (rejected)

## 4. Rules Engine
- **Decision:** JSON-defined heuristics for scoring maintainability and risk
- **Rationale:** Easily updated, deterministic, language-agnostic
- **Future:** Can evolve into policy-based enterprise rules

## 5. MVP Language Scope
- **Decision:** Start with Node.js, Python, TypeScript
- **Rationale:** Covers majority of active repos, minimizes parser complexity
- **Confidence:** Medium-High

## 6. Output Design
- **Decision:** Reports must be actionable + clickable, not abstract scores
- **Rationale:** Developers need file-level traceability

## 7. Async Processing
- **Decision:** Large repos processed asynchronously
- **Rationale:** Avoid timeouts, enable queueing for multiple scans

## 8. Repository Size Limits
- **Decision:** Limit repo size for MVP
- **Rationale:** Cost and performance