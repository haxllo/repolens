'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface CircularDepsDisplayProps {
  data: {
    has_circular_dependencies: boolean
    total_cycles: number
    cycles: Array<{
      chain: string[]
      length: number
      severity: 'high' | 'medium' | 'low'
    }>
    affected_files: string[]
    risk_score: number
  }
}

export function CircularDepsDisplay({ data }: CircularDepsDisplayProps) {
  if (!data || !data.has_circular_dependencies) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Circular Dependencies</CardTitle>
          </div>
          <CardDescription>No circular dependencies detected</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <CardTitle>Circular Dependencies</CardTitle>
        </div>
        <CardDescription>
          Found {data.total_cycles} circular dependency {data.total_cycles === 1 ? 'chain' : 'chains'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-bold">{data.risk_score}</div>
            <div className="text-sm text-muted-foreground">Risk Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{data.affected_files.length}</div>
            <div className="text-sm text-muted-foreground">Affected Files</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Dependency Chains:</h4>
          {data.cycles.slice(0, 5).map((cycle, idx) => (
            <div key={idx} className="p-3 border rounded-none space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={getSeverityColor(cycle.severity) as any}>
                  {cycle.severity} severity
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {cycle.length} files in cycle
                </span>
              </div>
              <div className="text-sm font-mono text-muted-foreground space-y-1">
                {cycle.chain.slice(0, 4).map((file, fileIdx) => (
                  <div key={fileIdx} className="flex items-center gap-2">
                    <span>→</span>
                    <span className="truncate">{file}</span>
                  </div>
                ))}
                {cycle.chain.length > 4 && (
                  <div className="text-xs text-muted-foreground">
                    ... and {cycle.chain.length - 4} more files
                  </div>
                )}
              </div>
            </div>
          ))}
          {data.cycles.length > 5 && (
            <p className="text-sm text-muted-foreground">
              ... and {data.cycles.length - 5} more cycles
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
