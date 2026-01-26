# RepoLens Product Requirements Document (PRD)

## Product Vision
Transform complex software repositories into an **Interactive Architectural Operating System**—a high-performance, navigable, and executable knowledge base.

---

## Problem Statement
- Developers spend hours navigating unfamiliar repos without a ground-truth mental model.
- Static documentation is passive and quickly becomes decoupled from source reality.
- Traditional AI tools lack the deterministic grounding of AST-aware analysis.

---

## Features

### Core: Architectural Intelligence
- **Intake Protocol**: Public/Private repository synchronization.
- **Deep Analysis**: AST-aware parsing, symbolic dependency mapping, and circular reference detection.
- **Risk Assessment**: Deterministic scoring for maintainability, dead code, and architectural complexity.
- **Entry-point Mapping**: Automated discovery of system initialization paths.

### HUD: Interaction Layer
- **Command Center**: A high-density dashboard for managing repository archives.
- **Spatial Mapping**: 2D/3D interactive visualization of module hierarchies and hotspots.
- **Technical Wiki**: Neural-synthesized documentation with embedded executable code modules.
- **Protocol Registry**: Historical tracking and favoritism of verified architectures.

### Runtime: Verification Layer
- **Native Sandbox**: Isolated Docker-based environment for real-time snippet execution.
- **Logic Verification**: Automated validation of code logic via sandboxed test runs.

---

## MVP Scope

### Phase 1 (✅ Complete)
- Public repos
- JS, TS, Python analysis
- Basic web dashboard
- Static analysis + AI explanations
- 3D dependency visualization

### Phase 2 (🚀 Current)
- Private repository support
- Enhanced AST analysis (circular deps, dead code, call graphs)
- README quality scoring and improvement suggestions
- Historical tracking and trend analysis
- Advanced visualizations (2D fallback, heatmaps)
- User dashboard with history and favorites

---

## Success Metrics
- 70% reduction in time-to-understanding
- % users exporting reports
- Adoption from new contributors / indie developers

---

## Constraints
- No speculative AI outputs
- Sandbox all repos
- Chunk large repos for async analysis

---

## Roadmap
1. **Intelligence Base:** Public repo indexing, AST parsing, and neural-synthesized summaries.
2. **Diagnostic Core:** Private repo support, dead code detection, circular dependency analysis, and native sandbox execution.
3. **Oxidized Engine:** Porting analysis to Rust (OXC/SCIP) for 100x performance and multi-million line repository support.
4. **Spatial OS:** Full integration of spatial hotspots, refactor suggestions, and automated test generation.
