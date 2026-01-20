import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ShieldAlert, AlertTriangle, Activity, Wrench, FileWarning } from 'lucide-react'

interface RiskTabProps {
  results: any
}

export default function RiskTab({ results }: RiskTabProps) {
  const riskScores = results?.riskScores || {}
  const aiRiskAnalysis = results?.explanations?.risk_analysis || results?.ai?.riskAnalysis || 'No risk analysis available.'
  const complexityMetrics = results?.complexityMetrics || {}
  
  // Get values from riskScores structure
  const overallRisk = riskScores.overall || 0
  const complexityRisk = riskScores.complexity || 0
  const securityRisk = riskScores.security || 0
  const maintainabilityRisk = riskScores.maintainability || 0
  const breakdown = riskScores.breakdown || {}

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-400' }
    if (score >= 50) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400' }
    return { level: 'Low', color: 'text-lime-400', bgColor: 'bg-lime-400' }
  }

  const overallRiskLevel = getRiskLevel(overallRisk)

  // Get high complexity files
  const highComplexityFiles = complexityMetrics.fileSummaries?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold">Overall Risk Assessment</h3>
            <p className="text-sm text-white/50">Comprehensive risk analysis</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-36 h-36">
              <svg className="transform -rotate-90 w-36 h-36">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - overallRisk / 100)}`}
                  className={overallRiskLevel.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute">
                <p className="text-4xl font-bold">{Math.round(overallRisk)}</p>
                <p className="text-sm text-white/40">/ 100</p>
              </div>
            </div>
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${overallRiskLevel.color} bg-white/5 border border-white/10`}>
              <AlertTriangle className="h-4 w-4" />
              {overallRiskLevel.level} Risk
            </div>
          </div>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-6">Risk Breakdown</h3>
        <div className="space-y-6">
          {/* Complexity Risk */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-white/50" />
                <div>
                  <h4 className="font-medium">Complexity</h4>
                  <p className="text-xs text-white/40">Cyclomatic & cognitive complexity</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getRiskLevel(complexityRisk).color}`}>
                {Math.round(complexityRisk)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getRiskLevel(complexityRisk).bgColor}`}
                style={{ width: `${Math.min(complexityRisk, 100)}%` }}
              />
            </div>
          </div>

          {/* Security Risk */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-white/50" />
                <div>
                  <h4 className="font-medium">Security</h4>
                  <p className="text-xs text-white/40">Potential vulnerabilities</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getRiskLevel(securityRisk).color}`}>
                {Math.round(securityRisk)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getRiskLevel(securityRisk).bgColor}`}
                style={{ width: `${Math.min(securityRisk, 100)}%` }}
              />
            </div>
          </div>

          {/* Maintainability Risk */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-white/50" />
                <div>
                  <h4 className="font-medium">Maintainability</h4>
                  <p className="text-xs text-white/40">Technical debt indicators</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getRiskLevel(maintainabilityRisk).color}`}>
                {Math.round(maintainabilityRisk)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getRiskLevel(maintainabilityRisk).bgColor}`}
                style={{ width: `${Math.min(maintainabilityRisk, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown Details */}
      {Object.keys(breakdown).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Risk Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(breakdown).map(([key, data]: [string, any]) => (
              <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-sm font-medium ${getRiskLevel(data.score).color}`}>
                    {Math.round(data.score)}
                  </span>
                </div>
                <p className="text-xs text-white/40">{data.description}</p>
                <p className="text-xs text-white/30 mt-1">
                  Value: {typeof data.value === 'number' ? data.value.toFixed(1) : data.value} (threshold: {data.threshold})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Complexity Files */}
      {highComplexityFiles.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileWarning className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold">High Complexity Files</h3>
          </div>
          <div className="space-y-2">
            {highComplexityFiles.map((file: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm font-mono text-lime-400">{file.path}</code>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskLevel(file.maxCyclomatic > 20 ? 75 : file.maxCyclomatic > 10 ? 50 : 25).color} bg-white/5`}>
                    Cyclomatic: {file.maxCyclomatic}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>{file.functionCount} functions</span>
                  <span>Avg cognitive: {file.avgCognitive?.toFixed(1)}</span>
                  <span>Max cognitive: {file.maxCognitive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Risk Analysis */}
      {aiRiskAnalysis && aiRiskAnalysis !== 'No risk analysis available.' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">AI Risk Analysis</h3>
          <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{aiRiskAnalysis}</p>
        </div>
      )}
    </div>
  )
}
