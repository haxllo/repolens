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
  
  // State for onboarding vs chapter view
  const [activeChapter, setActiveChapter] = useState<number | 'onboarding'>('onboarding')

  // Get AI data
  const chapters = explanations?.chapters || []
  const moduleMap = explanations?.module_map || []
  const summary = explanations?.summary || 'Analyzing architectural patterns...'
  const onboarding = explanations?.onboarding_flow || {
    welcome_message: "Welcome to your CodeWiki. I've mapped the system's architecture and modules to help you get started.",
    guided_paths: [],
    first_steps: []
  }
  
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
            <button
              onClick={() => setActiveChapter('onboarding')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all mb-4 ${
                activeChapter === 'onboarding' 
                  ? 'bg-lime-400 text-black font-medium shadow-lg shadow-lime-400/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white border border-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Discovery Home
              </span>
              <ChevronRight className={`h-4 w-4 opacity-50 ${activeChapter === 'onboarding' ? 'text-black' : ''}`} />
            </button>
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

        {/* Main Wiki Chapter or Discovery Dashboard */}
        <div className="glass rounded-2xl p-8 min-h-[600px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Sparkles className="w-64 h-64 text-lime-400" />
          </div>

          <div className="relative">
            {activeChapter === 'onboarding' ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Discovery Welcome */}
                <div>
                  <div className="flex items-center gap-2 text-lime-400 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Repository Discovery</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Hello, Architect.</h2>
                  <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
                    {onboarding.welcome_message}
                  </p>
                </div>

                {/* Guided Exploration Paths */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    What would you like to explore first?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onboarding.guided_paths.length > 0 ? (
                      onboarding.guided_paths.map((path: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveChapter(path.chapter_index)}
                          className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all group"
                        >
                          <h4 className="font-bold text-white mb-1 group-hover:text-lime-400">{path.title}</h4>
                          <p className="text-sm text-white/50 leading-snug">{path.description}</p>
                          <div className="mt-4 flex items-center gap-1 text-xs text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Start Journey <ChevronRight className="h-3 w-3" />
                          </div>
                        </button>
                      ))
                    ) : (
                      // Fallback cards if AI didn't generate them yet
                      [0, 1].map((idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveChapter(idx)}
                          className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all"
                        >
                          <h4 className="font-bold text-white mb-1">{chapters[idx]?.title}</h4>
                          <p className="text-sm text-white/50 leading-snug">Explore this architectural chapter.</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* First Steps: Critical Files */}
                {onboarding.first_steps.length > 0 && (
                  <div className="p-6 rounded-2xl bg-blue-400/5 border border-blue-400/10">
                    <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Recommended "First Reads"
                    </h3>
                    <div className="space-y-4">
                      {onboarding.first_steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="px-2 py-1 rounded bg-blue-400/10 text-[10px] font-mono text-blue-400 shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/80">{step.file}</p>
                            <p className="text-xs text-white/40 mt-0.5">{step.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-lime-400 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Architectural Insight</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">{chapters[activeChapter]?.title}</h2>
                
                <div className="prose prose-invert max-w-none">
                  {chapters[activeChapter] && (
                    <MDXRenderer content={chapters[activeChapter].content} />
                  )}
                </div>
              </div>
            )}
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
