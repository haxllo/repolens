import { useMemo } from 'react'

export interface GraphNode {
  id: string
  name: string
  group: string
  size: number
  color: string
}

export interface GraphLink {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e', // Bright Yellow
  typescript: '#3178c6', // Clear Blue
  python: '#3776ab',     // Python Blue
  java: '#eb2027',       // Red
  go: '#00add8',         // Cyan
  rust: '#f04000',       // Orange
  ruby: '#cc342d',       // Ruby Red
  php: '#777bb4',        // Purple
  css: '#1572b6',
  html: '#e34f26',
  default: '#a2e435',    // Lime (our brand color)
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    root: '#a2e435',      // Lime
    module: '#3b82f6',    // Bright Blue
    package: '#f59e0b',   // Amber
    file: '#8b5cf6',      // Purple
    external: '#ec4899',  // Pink
    npm: '#cb3837',       // npm Red
    pip: '#3776ab',       // pip Blue
    default: '#6366f1',   // Indigo
  }
  return colors[type] || colors[type.toLowerCase()] || LANGUAGE_COLORS[type.toLowerCase()] || colors.default
}

export function useGraphData(dependencies: any): GraphData {
  return useMemo(() => {
    console.log('useGraphData: input', dependencies);
    if (!dependencies || !dependencies.graph) {
      console.log('useGraphData: No graph data');
      return { nodes: [], links: [] }
    }

    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    
    // Check for new format { nodes: [], edges: [] } with defensive checks
    const backendNodes = dependencies?.graph?.nodes;
    if (Array.isArray(backendNodes)) {
      console.log('useGraphData: Detected new format {nodes, edges}');
      // Calculate in-degree (how many things depend on this node)
      const inDegree: Record<string, number> = {};
      if (Array.isArray(dependencies.graph.edges)) {
        dependencies.graph.edges.forEach((e: any) => {
          if (e && e.target) {
            inDegree[e.target] = (inDegree[e.target] || 0) + 1;
          }
        });
      }

      backendNodes.forEach((n: any) => {
        if (!n) return;
        const group = n.type || 'default';
        const degree = inDegree[n.id] || 0;
        nodes.push({
          id: n.id,
          name: n.label || n.id,
          group: group,
          // Scale size based on connectivity + base size
          size: (n.size || 10) + (degree * 2), 
          color: getNodeColor(group),
        });
      });

      if (Array.isArray(dependencies.graph.edges)) {
        links.push(...dependencies.graph.edges.filter((e: any) => e && e.source && e.target));
      }

      console.log('useGraphData: new format result', { nodes: nodes.length, links: links.length });
      return { nodes, links };
    }

    console.log('useGraphData: Falling back to legacy format (adjacency list)');
    const nodeMap = new Map<string, boolean>()

    // Process legacy dependency graph (adjacency list)
    Object.entries(dependencies.graph || {}).forEach(([sourceFile, deps]: [string, any]) => {
      // Add source node if not exists
      if (!nodeMap.has(sourceFile)) {
        const language = getFileLanguage(sourceFile)
        const size = (deps.metrics?.complexity || 1) * 2

        nodes.push({
          id: sourceFile,
          name: sourceFile.split('/').pop() || sourceFile,
          group: language,
          size: Math.max(size, 3),
          color: LANGUAGE_COLORS[language.toLowerCase()] || LANGUAGE_COLORS.default,
        })
        nodeMap.set(sourceFile, true)
      }

      // Add target nodes and links
      if (Array.isArray(deps.imports)) {
        deps.imports.forEach((targetFile: string) => {
          if (!nodeMap.has(targetFile)) {
            const language = getFileLanguage(targetFile)

            nodes.push({
              id: targetFile,
              name: targetFile.split('/').pop() || targetFile,
              group: language,
              size: 3,
              color: LANGUAGE_COLORS[language.toLowerCase()] || LANGUAGE_COLORS.default,
            })
            nodeMap.set(targetFile, true)
          }

          links.push({
            source: sourceFile,
            target: targetFile,
          })
        })
      }
    })

    return { nodes, links }
  }, [dependencies])
}

function getFileLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const extMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
  }
  return extMap[ext || ''] || 'default'
}
