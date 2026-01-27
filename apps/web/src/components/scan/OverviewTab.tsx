'use client'

import { 
  FileCode, 
  Package, 
  Activity,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { useState } from 'react'
import { WikiView } from '../wiki/WikiView'

interface OverviewTabProps {
  results: any
}

export default function OverviewTab({ results }: OverviewTabProps) {
  const [view, setView] = useState<'index' | 'wiki'>('index')

  const explanations = results?.explanations || {}
  const riskScores = results?.riskScores || {}
  const dependencies = results?.dependencies || {}
  
  const chapters = explanations?.chapters || []
  const summary = explanations?.summary || 'No summary available.'
  const onboarding = explanations?.onboarding_flow || { guided_paths: [] }
  
  const totalFiles = results?.ast?.files?.length || 0
  const depCount = dependencies?.statistics?.total || 0
  const riskLevel = riskScores?.level || 'N/A'

  if (view === 'wiki') {
    return (
      <div className="animate-in fade-in duration-700">
        <WikiView data={{ ...explanations, chapters }} />
        <div className="mt-20 flex justify-center">
           <button 
            onClick={() => setView('index')}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-lime-400 transition-colors"
           >
             Return to Index
           </button>
        </div>
      </div>
    )
  }

      return (

        <div className="space-y-16 max-w-5xl mx-auto">

          {/* Metrics Header */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 shadow-2xl">

            {[

              { label: 'Artifacts', value: totalFiles, icon: FileCode, unit: 'Objects' },

              { label: 'Dependencies', value: depCount, icon: Package, unit: 'Nodes' },

              { label: 'Health Score', value: Math.round(riskScores?.overall || 0), icon: Activity, unit: 'Points' },

              { label: 'Trust Level', value: riskLevel, icon: ShieldCheck, unit: 'Class' },

            ].map((stat, i) => (

              <div key={i} className="bg-[#050505] p-8 flex flex-col justify-between h-40 group hover:bg-black transition-colors">

                <div className="flex justify-between items-start">

                  <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-lime-400 transition-colors">{stat.label}</div>

                  <stat.icon className="w-3 h-3 text-white/10 group-hover:text-lime-400/40 transition-colors" />

                </div>

                <div className="space-y-1">

                  <div className="text-3xl font-black tabular-nums text-white leading-none tracking-tighter">

                    {stat.value}

                  </div>

                  <div className="font-mono text-[8px] uppercase tracking-widest text-white/10">

                    Unit_{stat.unit} // OK

                  </div>

                </div>

              </div>

            ))}

          </div>

    

  

        {/* Abstract */}

        <section className="space-y-6">

          <div className="flex items-center gap-4 text-lime-400">

            <div className="w-6 h-px bg-lime-400/30" />

            <span className="text-[9px] font-black uppercase tracking-[0.4em]">System Abstract</span>

          </div>

          <p className="text-2xl md:text-3xl font-bold text-white/80 leading-tight tracking-tight max-w-4xl italic">

            {summary}

          </p>

        </section>

  

        {/* Knowledge Index (The 'Menu') */}

        <section className="space-y-8">

          <div className="flex items-center gap-4 text-white/20">

            <div className="w-6 h-px bg-white/10" />

            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Knowledge Index</span>

          </div>

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 shadow-2xl">

            {chapters.map((chapter: any, idx: number) => (

              <button

                key={idx}

                onClick={() => {

                  setView('wiki')

                }}

                className="group bg-black p-8 text-left hover:bg-white/[0.02] transition-all relative overflow-hidden"

              >

                <div className="flex justify-between items-start mb-6">

                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Section 0{idx + 1}</span>

                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-lime-400 group-hover:translate-x-1 transition-all" />

                </div>

                <h3 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-lime-400 transition-colors leading-none mb-3">

                  {chapter.title}

                </h3>

                <p className="text-xs text-white/30 font-medium leading-relaxed line-clamp-2">

                  Explore the architectural nuances and implementation strategies of this module.

                </p>

              </button>

            ))}

          </div>

        </section>

  

        {/* Guided Paths */}

        {onboarding.guided_paths?.length > 0 && (

          <section className="space-y-8 pb-16">

            <div className="flex items-center gap-4 text-white/20">

              <div className="w-6 h-px bg-white/10" />

              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Guided Journeys</span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5">

              {onboarding.guided_paths.map((path: any, idx: number) => (

                <div key={idx} className="bg-black p-8 space-y-4 hover:bg-white/[0.01] transition-colors">

                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400 italic leading-none">{path.title}</h4>

                  <p className="text-[11px] text-white/40 font-medium leading-relaxed line-clamp-3">{path.description}</p>

                  <button 

                    onClick={() => {

                      setView('wiki')

                    }}

                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"

                  >

                    Initiate <ArrowRight className="w-2.5 h-2.5" />

                  </button>

                </div>

              ))}

            </div>

          </section>

        )}

      </div>

    )

  }

  