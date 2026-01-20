# RepoLens Product Requirements Document (PRD)

## Product Vision
Provide developers a **structured, explainable understanding of any repository** via static analysis + AI-assisted explanations.

---

## Problem Statement
- Developers spend hours navigating unfamiliar repos.
- READMEs are often incomplete or misleading.
- AI-only tools may hallucinate architecture or purpose.

---

## Users
- Primary: Developers, open-source contributors
- Secondary: Hiring managers, tech leads, recruiters

---

## User Stories
1. Understand repo purpose in minutes
2. See which files to read first
3. Detect tech debt & risk
4. Receive actionable README improvement suggestions

---

## Features

### Core
- Repo intake (public / private repos)
- Static analysis (AST parsing, dependency graphs)
- Risk & maintainability scoring
- Entry-point mapping

### AI-augmented
- Explain deterministic outputs in natural language
- Suggest README improvements
- Confidence-tagged explanations

### Outputs
- Overview summary
- Dependency visualization
- Risk dashboard
- README improvement report

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
1. **MVP:** Public repos, basic analysis, AI explanations
2. **Pro:** Private repos, CI/CD integration, architecture diagrams
3. **Enterprise:** Org-wide dashboards, historical analysis, audit reports
