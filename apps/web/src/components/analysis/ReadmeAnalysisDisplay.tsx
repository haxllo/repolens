'use client'

import { Badge } from '@/components/ui/badge'
import { FileText, Code, Link as LinkIcon, FileCode } from 'lucide-react'

interface ReadmeAnalysisDisplayProps {
  data: {
    quality_score: number
    grade: string
    suggestions: Array<{
      priority: 'high' | 'medium' | 'low'
      message: string
      impact: number
    }>
    statistics: {
      total_lines: number
      code_blocks: number
      links: { total_links: number }
    }
  }
}

export function ReadmeAnalysisDisplay({ data }: ReadmeAnalysisDisplayProps) {
  if (!data) return null

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-lime-400 bg-lime-400/10 border-lime-400/20'
      case 'B': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'C': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'D': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      default: return 'text-red-400 bg-red-400/10 border-red-400/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-none bg-lime-400/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-lime-400" />
        </div>
        <div>
          <h3 className="font-semibold">README Quality</h3>
          <p className="text-sm text-white/50">Documentation assessment</p>
        </div>
      </div>

      {/* Grade and Score */}
      <div className="flex items-center gap-6 mb-6">
        <div className={`w-20 h-20 rounded-2xl ${getGradeColor(data.grade)} border flex items-center justify-center`}>
          <span className="text-3xl font-bold">{data.grade}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/50">Quality Score</span>
            <span className="font-medium">{data.quality_score?.toFixed(1) || 0}/100</span>
          </div>
          <div className="w-full bg-white/5 rounded-none h-3">
            <div
              className="bg-lime-400 h-3 rounded-none transition-all"
              style={{ width: `${data.quality_score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {data.statistics && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
            <FileCode className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.statistics.total_lines || 0}</p>
            <p className="text-xs text-white/40">Lines</p>
          </div>
          <div className="p-3 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
            <Code className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.statistics.code_blocks || 0}</p>
            <p className="text-xs text-white/40">Code Blocks</p>
          </div>
          <div className="p-3 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
            <LinkIcon className="h-4 w-4 text-white/40 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.statistics.links?.total_links || 0}</p>
            <p className="text-xs text-white/40">Links</p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3 text-white/70">Improvement Suggestions</h4>
          <div className="space-y-2">
            {data.suggestions.slice(0, 5).map((suggestion, idx) => (
              <div key={idx} className="p-3 rounded-none bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <Badge className={`text-xs shrink-0 ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority}
                </Badge>
                <span className="text-sm text-white/70">{suggestion.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
