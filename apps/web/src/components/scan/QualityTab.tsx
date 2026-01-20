import { ReadmeAnalysisDisplay } from '@/components/analysis/ReadmeAnalysisDisplay'
import { DeadCodeDisplay } from '@/components/analysis/DeadCodeDisplay'
import { CircularDepsDisplay } from '@/components/analysis/CircularDepsDisplay'
import { Activity, FileCode, GitBranch, AlertTriangle } from 'lucide-react'

interface QualityTabProps {
  results: any
}

export default function QualityTab({ results }: QualityTabProps) {
  const readmeAnalysis = results?.readmeAnalysis
  const deadCode = results?.deadCode
  const circularDeps = results?.circularDependencies
  const callGraph = results?.callGraph
  const complexityMetrics = results?.complexityMetrics

  return (
    <div className="space-y-6">
      {/* Complexity Overview */}
      {complexityMetrics && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="font-semibold">Complexity Metrics</h3>
              <p className="text-sm text-white/50">Code complexity analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-lime-400">
                {complexityMetrics.statistics?.totalFunctions || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Total Functions</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-lime-400">
                {complexityMetrics.statistics?.avgCyclomatic?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Avg Cyclomatic</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {complexityMetrics.statistics?.highComplexityCount || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">High Complexity</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-white/70">
                {complexityMetrics.statistics?.avgCognitive?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Avg Cognitive</p>
            </div>
          </div>
        </div>
      )}

      {/* README Quality Analysis */}
      {readmeAnalysis && (
        <ReadmeAnalysisDisplay data={readmeAnalysis} />
      )}

      {/* Dead Code Analysis */}
      {deadCode && (
        <DeadCodeDisplay data={deadCode} />
      )}

      {/* Circular Dependencies */}
      {circularDeps && (
        <CircularDepsDisplay data={circularDeps} />
      )}

      {/* Call Graph Summary */}
      {callGraph && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="font-semibold">Call Graph Analysis</h3>
              <p className="text-sm text-white/50">Function call relationships</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-lime-400">
                {callGraph.total_functions || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Total Functions</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-lime-400">
                {callGraph.entry_points || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Entry Points</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {callGraph.unreachable_functions || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Unreachable</p>
            </div>
          </div>
        </div>
      )}

      {/* No Analysis Data */}
      {!readmeAnalysis && !deadCode && !circularDeps && !callGraph && !complexityMetrics && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white/30" />
          </div>
          <p className="text-white/50">No quality analysis data available</p>
        </div>
      )}
    </div>
  )
}
