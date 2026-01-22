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
  javascript: '#f1e05a',
  typescript: '#2b7489',
  python: '#3572A5',
  java: '#b07219',
  go: '#00ADD8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4F5D95',
  default: '#808080',
}

export function useGraphData(dependencies: any): GraphData {
  return useMemo(() => {
    if (!dependencies || !dependencies.graph) {
      return { nodes: [], links: [] }
    }

    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const nodeMap = new Map<string, boolean>()

    // Check for new format { nodes: [], edges: [] }
    if (dependencies.graph.nodes && Array.isArray(dependencies.graph.nodes)) {
      dependencies.graph.nodes.forEach((n: any) => {
        const group = n.type || 'default';
        nodes.push({
          id: n.id,
          name: n.label || n.id,
          group: group,
          size: n.size || 10,
          color: getNodeColor(group),
        });
      });

      if (dependencies.graph.edges && Array.isArray(dependencies.graph.edges)) {
        links.push(...dependencies.graph.edges);
      }

      return { nodes, links };
    }

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

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    root: '#a2e435',      // lime
    module: '#3b82f6',    // blue
    package: '#f59e0b',   // amber
    file: '#8b5cf6',      // purple
    external: '#6b7280',  // gray
    default: '#10b981',   // green
    ...LANGUAGE_COLORS,   // Include language colors as fallback
  }
  return colors[type] || colors[type.toLowerCase()] || colors.default
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
