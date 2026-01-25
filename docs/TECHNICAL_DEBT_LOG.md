# TECHNICAL_DEBT_LOG // REPOLENS

This log tracks unresolved technical blockers, API mismatches, and infrastructure issues identified during development.

---

## 🔴 BLOCKER: OXC_SEMANTIC API MISMATCH (2026-01-25)

**Component**: `apps/oxidizer` (Rust)  
**File**: `src/analyzer.rs`  
**Error**: `error[E0609]: no field symbols on type Semantic<'_>`  
**Context**: 
During the integration of SCIP-style symbol resolution, the `oxc_semantic` (v0.110.0) API was found to be inconsistent with expected field access for the symbol table.

**Attempted Fixes**:
1. Tried `semantic.symbols()` (Method not found).
2. Tried `&semantic.symbols` (Field not found).

**Next Steps**:
- Investigate the `oxc` 0.110.0 source code or docs to find the correct accessor for the `SymbolTable`.
- Verify if `semantic.symbols` was moved to a different struct or requires a specific feature flag.
- **Temporary Workaround**: The Python worker currently falls back to `tree-sitter` if the Rust binary fails to build, so the system remains functional but slower for JS/TS.

---

## 🟡 DEBT: PYTHON ENVIRONMENT BUILD TOOLS (2026-01-25)

**Component**: `apps/worker`  
**Issue**: Missing C++ Build Tools on host Windows environment prevents native compilation of `tree-sitter` and `aiohttp`.
**Impact**: full `pip install` only works inside the Docker container.
**Recommendation**: Install "Microsoft C++ Build Tools" on the host if local (non-Docker) development is required.

---

## 🟢 COMPLETED TODAY
- [x] **Pinecone v6 Migration**: Fully updated across API and Worker.
- [x] **Google GenAI SDK Migration**: Switched to modern `google-genai` (v1.0+).
- [x] **Spatial Map V2 UI**: Enhanced risk visualization and dynamic legends.
- [x] **High-Density Wiki Prompt**: Overhauled AI persona to "Principal Architect" with Mermaid/Table support.
- [x] **Multi-Stage Docker**: Integrated Rust compilation into the worker build pipeline.
