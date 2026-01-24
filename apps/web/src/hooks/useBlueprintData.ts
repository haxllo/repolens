import { useMemo } from 'react'
import { GraphData, GraphNode, GraphLink } from './useGraphData'

export interface BlueprintNode extends GraphNode {
  rank: number;      // Hierarchical level (0 = Top/Entry, N = Bottom/Utility)
  impact: number;    // Count of downstream dependencies
  dependents: string[]; // IDs of nodes that depend on this one
}

export interface BlueprintData {
  nodes: BlueprintNode[];
  links: GraphLink[];
  layers: number;    // Total number of ranks detected
}

export function useBlueprintData(graphData: GraphData): BlueprintData {
  return useMemo(() => {
    console.log('useBlueprintData: input', { nodes: graphData.nodes.length, links: graphData.links.length });
    const { nodes, links } = graphData;
    if (nodes.length === 0) {
      return { nodes: [], links: [], layers: 0 };
    }

    const blueprintNodes: BlueprintNode[] = nodes.map(n => ({
      ...n,
      rank: 0,
      impact: 0,
      dependents: []
    }));

    const nodeMap = new Map<string, BlueprintNode>(
      blueprintNodes.map(n => [n.id, n])
    );

    // 1. Build Adjacency Maps
    const adj = new Map<string, string[]>(); // node -> what it depends on
    const revAdj = new Map<string, string[]>(); // node -> what depends on it

    links.forEach(link => {
      if (!adj.has(link.source)) adj.set(link.source, []);
      if (!revAdj.has(link.target)) revAdj.set(link.target, []);
      
      adj.get(link.source)?.push(link.target);
      revAdj.get(link.target)?.push(link.source);
      
      // Track dependents for impact analysis
      const targetNode = nodeMap.get(link.target);
      if (targetNode) targetNode.dependents.push(link.source);
    });

    // 2. Calculate Ranks (Layering)
    // We use a longest-path-based ranking
    // Roots (In-degree 0) are Rank 0
    const roots = blueprintNodes.filter(n => (revAdj.get(n.id)?.length || 0) === 0);
    
    const queue: { id: string, rank: number }[] = roots.map(r => ({ id: r.id, rank: 0 }));
    const visited = new Map<string, number>();

    while (queue.length > 0) {
      const { id, rank } = queue.shift()!;
      const node = nodeMap.get(id);
      if (!node) continue;

      // If we find a longer path, update rank
      if (visited.has(id) && visited.get(id)! >= rank) continue;
      visited.set(id, rank);
      node.rank = rank;

      const children = adj.get(id) || [];
      children.forEach(childId => {
        queue.push({ id: childId, rank: rank + 1 });
      });
    }

    // 3. Calculate Impact (Recursive downstream count)
    const calculateImpact = (id: string, cache: Set<string>): number => {
      const dependents = revAdj.get(id) || [];
      dependents.forEach(depId => {
        if (!cache.has(depId)) {
          cache.add(depId);
          calculateImpact(depId, cache);
        }
      });
      return cache.size;
    };

    blueprintNodes.forEach(node => {
      node.impact = calculateImpact(node.id, new Set<string>());
    });

    const maxRank = Math.max(...blueprintNodes.map(n => n.rank), 0);
    console.log('useBlueprintData: layers detected', maxRank + 1);

    return {
      nodes: blueprintNodes,
      links,
      layers: maxRank + 1
    };
  }, [graphData]);
}
