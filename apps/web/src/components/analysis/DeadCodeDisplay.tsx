'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

interface DeadCodeDisplayProps {
  data: {
    has_dead_code: boolean
    unused_exports: Record<string, string[]>
    unused_imports?: Record<string, string[]>
    statistics: {
      total_exports: number
      total_imports?: number
      total_unused_exports: number
      total_unused_imports?: number
      unused_export_percentage: number
      unused_import_percentage?: number
      affected_files: number
    }
    risk_score: number
  }
}

export function DeadCodeDisplay({ data }: DeadCodeDisplayProps) {
  if (!data) return null

  const { statistics } = data

  if (!data.has_dead_code) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-none bg-lime-400/10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold">Dead Code Analysis</h3>
            <p className="text-sm text-white/50">No unused exports detected</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-none bg-yellow-400/10 flex items-center justify-center">
          <Trash2 className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold">Dead Code Analysis</h3>
          <p className="text-sm text-white/50">
            {statistics.total_unused_exports} unused exports in {statistics.affected_files} files
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
          <p className="text-2xl font-bold">{statistics.total_exports}</p>
          <p className="text-xs text-white/40 mt-1">Total Exports</p>
        </div>
        <div className="p-4 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
          <p className="text-2xl font-bold text-yellow-400">{statistics.total_unused_exports}</p>
          <p className="text-xs text-white/40 mt-1">Unused Exports</p>
        </div>
        <div className="p-4 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
          <p className="text-2xl font-bold text-red-400">{statistics.total_unused_imports || 0}</p>
          <p className="text-xs text-white/40 mt-1">Unused Imports</p>
        </div>
        <div className="p-4 rounded-none bg-white/[0.02] border border-white/[0.06] text-center">
          <p className="text-2xl font-bold">{data.risk_score}</p>
          <p className="text-xs text-white/40 mt-1">Risk Score</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/50">Unused Code Percentage</span>
          <span className="font-medium text-yellow-400">
            {statistics.unused_export_percentage?.toFixed(1) || 0}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-none h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(statistics.unused_export_percentage || 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Unused Exports List */}
      {Object.keys(data.unused_exports || {}).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3 text-white/70">Unused Exports by File</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {Object.entries(data.unused_exports)
              .slice(0, 10)
              .map(([file, exports]) => (
                <div key={file} className="p-3 rounded-none bg-white/[0.02] border border-white/[0.06]">
                  <code className="text-xs text-lime-400/70 block truncate mb-2">{file}</code>
                  <div className="flex flex-wrap gap-1">
                    {exports.map((exp) => (
                      <Badge 
                        key={exp} 
                        className="text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/20"
                      >
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            {Object.keys(data.unused_exports).length > 10 && (
              <p className="text-xs text-white/40 text-center py-2">
                +{Object.keys(data.unused_exports).length - 10} more files
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
