import { Badge } from '@/components/ui/badge'
import { 
  FileCode, 
  Layers, 
  Sparkles, 
  Package, 
  AlertTriangle, 
  Zap,
  BookOpen,
  ChevronRight,
  FolderTree,
  Activity,
  ShieldCheck
} from 'lucide-react'
import { MDXRenderer } from '@/components/ui/mdx-renderer'
import { useState } from 'react'

interface OverviewTabProps {
  results: any
  repoUrl: string
}

export default function OverviewTab({ results, repoUrl }: OverviewTabProps) {
  const languages = results?.languages || {}
  const explanations = results?.explanations || {}
  const riskScores = results?.riskScores || {}
  const dependencies = results?.dependencies || {}
  
  const [activeChapter, setActiveChapter] = useState(0)

  // Get AI data
  const chapters = explanations?.chapters || []
  const moduleMap = explanations?.module_map || []
  const summary = explanations?.summary || 'Analyzing architectural patterns...'
  
  // Stats
  const totalFiles = languages?.totalFiles || 0
  const depCount = dependencies?.statistics?.total || 0
  const riskLevel = riskScores?.level || 'Unknown'

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-lime-400'
      default: return 'text-white/50'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar: Knowledge Index */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass rounded-2xl p-4 sticky top-6">
          <div className="flex items-center gap-2 mb-4 px-2">
            <BookOpen className="h-4 w-4 text-lime-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Knowledge Index</h3>
          </div>
          <nav className="space-y-1">
            {chapters.map((chapter: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeChapter === idx 
                    ? 'bg-lime-400 text-black font-medium shadow-lg shadow-lime-400/20' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="truncate">{chapter.title}</span>
                <ChevronRight className={`h-4 w-4 opacity-50 ${activeChapter === idx ? 'text-black' : ''}`} />
              </button>
            ))}
          </nav>

          {moduleMap.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 px-2">
                <FolderTree className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Module Map</h3>
              </div>
              <div className="space-y-3 px-2">
                {moduleMap.slice(0, 6).map((mod: any, idx: number) => (
                  <div key={idx} className="group">
                    <p className="text-xs font-mono text-blue-400 truncate">{mod.path}</p>
                    <p className="text-[10px] text-white/40 leading-tight group-hover:text-white/60 transition-colors">
                      {mod.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-6">
        {/* Pulse Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
              <FileCode className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{totalFiles}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Files</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{depCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Deps</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{Math.round(riskScores?.overall || 0)}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Health</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className={`text-lg font-bold ${getRiskColor(riskLevel)}`}>{riskLevel}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Trust</p>
            </div>
          </div>
        </div>

        {/* Main Wiki Chapter */}
        <div className="glass rounded-2xl p-8 min-h-[500px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Sparkles className="w-64 h-64 text-lime-400" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 text-lime-400 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Architectural Insight</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">{chapters[activeChapter]?.title}</h2>
            
            <div className="prose prose-invert max-w-none">
              {chapters[activeChapter] ? (
                <MDXRenderer content={chapters[activeChapter].content} />
              ) : (
                <p className="text-white/50">Select a chapter to begin exploring the codebase knowledge.</p>
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="glass rounded-2xl p-6 bg-lime-400/5 border-lime-400/10">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <h4 className="font-semibold text-lime-400 mb-1">Executive Summary</h4>
              <p className="text-white/70 italic text-sm leading-relaxed">
                "{summary}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
