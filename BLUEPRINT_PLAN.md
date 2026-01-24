# RepoLens: "Architectural Blueprint" Transition Plan

**Project Status:** Planning / Research Phase
**Goal:** Replace 3D "Exploration" sphere with a structured 2D "Diagnostic" blueprint.

## 1. Requirements & User Stories
- **The "GPS" Experience:** Users should know exactly where they are in the project hierarchy.
- **Layered Clarity:** Automatically separate UI, Logic, and Data layers.
- **Risk Hotspots:** Immediate visual identification of complex/untested files.
- **Blast Radius:** Understand the ripple effect of changing a specific file.

## 2. Technical Stack
- **Engine:** ReactFlow (for high interactivity and custom node rendering).
- **Layout Math:** D3-dag or a custom Sugiyama implementation.
- **Data Flow:** Extract "In-degree" and "Out-degree" from existing dependency data to calculate "Rank".

## 3. Architecture Change
Current: `scanData.dependencies.graph` -> `DependencyGraph3D` (Random/Spherical)
Future: `scanData.dependencies.graph` -> `DependencyFlowProcessor` -> `ArchitecturalBlueprint` (Hierarchical)

## 4. Feature Roadmap

### Phase 1: Hierarchical Ranking (Week 1)
- [ ] Implement a Topological Sort algorithm to identify "Levels".
- [ ] Group nodes by their depth in the dependency tree.
- [ ] Handle circular dependencies gracefully (detect and highlight as "Risk").

### Phase 2: ReactFlow Implementation (Week 2)
- [ ] Create custom Node components (FileNode, FolderNode).
- [ ] Implement smooth edge paths with "Flow" direction.
- [ ] Replace 3D Tab with the new Blueprint View.

### Phase 3: Diagnostic Overlays (Week 3)
- [ ] Add "Heatmap mode" toggle directly on the graph.
- [ ] Implement "Blast Radius" highlighting on hover.
- [ ] Add AI-generated "Feature Grouping" boundaries.

## 5. Risk Assessment
- **Layout Jitter:** Ensuring the graph doesn't jump around when filters change.
- **Scale:** Handling repos with >1000 nodes without performance degradation.
- **Mobile Support:** Ensuring the 2D map is usable on touch devices.
