export interface ScanRequest {
  repoUrl: string
  branch?: string
}

export interface ScanResponse {
  scanId: string
  status: ScanStatus
  message?: string
}

export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface ScanResult {
  scanId: string
  repoUrl: string
  branch: string
  languages: LanguageInfo
  ast: ASTData
  dependencies: DependencyData
  riskScores: RiskScores
  explanations: AIExplanations
  analyzedAt: string
}

export interface LanguageInfo {
  primary: string
  languages: Record<string, number>
  frameworks: string[]
  totalFiles: number
}

export interface ASTData {
  files: FileData[]
  summary: {
    totalFunctions: number
    totalClasses: number
    totalImports: number
    totalExports: number
  }
  entryPoints: string[]
}

export interface FileData {
  path: string
  language: string
  functions: number
  classes: number
  imports: number
  exports: number
  lines: number
}

export interface DependencyData {
  packages: Package[]
  graph: DependencyGraph
  statistics: {
    total: number
    direct: number
    dev: number
  }
}

export interface Package {
  name: string
  version: string
  type: 'npm' | 'pip'
  isDev: boolean
}

export interface DependencyGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphNode {
  id: string
  label: string
  type: string
  isDev?: boolean
}

export interface GraphEdge {
  source: string
  target: string
}

export interface RiskScores {
  overall: number
  complexity: number
  maintainability: number
  security: number
  level: 'low' | 'medium' | 'high'
  breakdown: Record<string, RiskBreakdown>
}

export interface RiskBreakdown {
  score: number
  value: number
  threshold: number
  description: string
}

export interface AIExplanations {
  summary: string
  confidence: 'low' | 'medium' | 'high'
  provider: string
}
