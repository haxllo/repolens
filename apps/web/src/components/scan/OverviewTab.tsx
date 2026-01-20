import { Badge } from '@/components/ui/badge'
import { Code, FileCode, Layers, Sparkles, Package, AlertTriangle, Zap } from 'lucide-react'

interface OverviewTabProps {
  results: any
  repoUrl: string
}

export default function OverviewTab({ results, repoUrl }: OverviewTabProps) {
  const languages = results?.languages || {}
  const explanations = results?.explanations || {}
  const riskScores = results?.riskScores || {}
  const dependencies = results?.dependencies || {}
  const ast = results?.ast || {}
  
  // Get AI summary from explanations
  const aiSummary = explanations?.summary || 'No AI summary available.'
  const aiModel = explanations?.model || ''
  const aiConfidence = explanations?.confidence || ''
  
  // Calculate totals from languages
  const totalFiles = languages?.totalFiles || 0
  
  // Get language breakdown
  const languageBreakdown = languages?.languages || {}
  const totalLanguageFiles = Object.values(languageBreakdown).reduce(
    (sum: number, count: any) => sum + (typeof count === 'number' ? count : 0), 0
  )
  
  // Get primary language and frameworks
  const primaryLanguage = languages?.primary || Object.keys(languageBreakdown)[0] || 'Unknown'
  const frameworks = languages?.frameworks || []
  
  // Get dependency count
  const depCount = dependencies?.dependencies?.length || dependencies?.count || 0

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-lime-400'
      default: return 'text-white/50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Repository Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
            <FileCode className="h-6 w-6 text-lime-400" />
          </div>
          <p className="text-3xl font-bold">{totalFiles}</p>
          <p className="text-sm text-white/50 mt-1">Total Files</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-6 w-6 text-lime-400" />
          </div>
          <p className="text-3xl font-bold">{Object.keys(languageBreakdown).length}</p>
          <p className="text-sm text-white/50 mt-1">Languages</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6 text-lime-400" />
          </div>
          <p className="text-3xl font-bold">{depCount}</p>
          <p className="text-sm text-white/50 mt-1">Dependencies</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className={`h-6 w-6 ${getRiskColor(riskScores?.level)}`} />
          </div>
          <p className={`text-3xl font-bold ${getRiskColor(riskScores?.level)}`}>
            {Math.round(riskScores?.overall || 0)}
          </p>
          <p className="text-sm text-white/50 mt-1">Risk Score</p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-sm px-3 py-1">
            {primaryLanguage}
          </Badge>
          {frameworks.map((fw: string) => (
            <Badge key={fw} className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-sm px-3 py-1">
              {fw}
            </Badge>
          ))}
          {Object.entries(languageBreakdown)
            .filter(([lang]) => lang.toLowerCase() !== primaryLanguage.toLowerCase())
            .map(([lang, count]: [string, any]) => (
              <Badge key={lang} className="bg-white/5 text-white/60 border-white/10 text-sm px-3 py-1">
                {lang} ({count})
              </Badge>
            ))}
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Language Distribution</h3>
        <div className="space-y-4">
          {Object.entries(languageBreakdown)
            .sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))
            .map(([lang, count]: [string, any]) => {
              const percentage = totalLanguageFiles > 0 
                ? ((count as number) / totalLanguageFiles * 100).toFixed(1) 
                : 0
              return (
                <div key={lang} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/20">
                        {lang}
                      </Badge>
                      <span className="text-sm text-white/40">{count} files</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-lime-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* AI Summary */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Analysis Summary</h3>
              <p className="text-sm text-white/50">Generated insights about the repository</p>
            </div>
          </div>
          {aiConfidence && (
            <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20">
              {aiConfidence} confidence
            </Badge>
          )}
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
        </div>
        {aiModel && (
          <p className="text-xs text-white/30 mt-4 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Powered by {aiModel}
          </p>
        )}
      </div>

      {/* Quick Stats from Risk */}
      {riskScores?.breakdown && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Health Check</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(riskScores.breakdown).map(([key, data]: [string, any]) => (
              <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-white/40 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                <p className={`text-xl font-bold ${
                  data.score > 75 ? 'text-red-400' : 
                  data.score > 50 ? 'text-yellow-400' : 'text-lime-400'
                }`}>
                  {Math.round(data.score)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
