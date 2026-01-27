'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  Activity,
  Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MermaidBlock from './MermaidBlock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Chapter {
  title: string
  content: string
}

interface WikiViewProps {
  data: {
    summary?: string
    chapters: Chapter[]
    system?: {
      scripts?: Record<string, string>
      ci_workflows?: any[]
      infrastructure?: string[]
      governance?: string[]
    }
  }
  initialChapter?: number
}

const SystemSpecHeader = ({ system }: { system: WikiViewProps['data']['system'] }) => {
  if (!system) return null;

  return (
    <div className="grid gap-px bg-white/5 border border-white/5 md:grid-cols-3 shadow-2xl mb-12">
      {/* Infrastructure */}
      <div className="bg-black p-6 space-y-4 hover:bg-white/[0.01] transition-colors">
        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white/30">
          <Cpu className="h-3 w-3 text-lime-400" /> Infrastructure
        </h4>
        <div className="flex flex-wrap gap-2">
          {system.infrastructure?.map(item => (
            <div key={item} className="px-2 py-1 bg-white/5 border border-white/5 font-mono text-[9px] text-white/60 uppercase tracking-widest leading-none">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div className="bg-black p-6 space-y-4 hover:bg-white/[0.01] transition-colors">
        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white/30">
          <Terminal className="h-3 w-3 text-lime-400" /> Scripts_Vault
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.keys(system.scripts || {}).slice(0, 6).map(script => (
            <div key={script} className="px-2 py-1 border border-white/5 font-mono text-[9px] text-lime-400/40 uppercase tracking-widest leading-none italic">
              {script}
            </div>
          ))}
        </div>
      </div>

      {/* CI/CD */}
      <div className="bg-black p-6 space-y-4 hover:bg-white/[0.01] transition-colors">
        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white/30">
          <Activity className="h-3 w-3 text-lime-400" /> CI_Workflows
        </h4>
        <div className="space-y-2">
          {system.ci_workflows?.slice(0, 3).map(wf => (
            <div key={wf.name} className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-3 text-white/60">
              <div className="h-px w-3 bg-lime-400/30" />
              {wf.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WikiComponents = () => ({
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto border border-white/5 bg-[#050505] shadow-2xl">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-white/[0.03] border-b border-white/10">{children}</thead>,
  th: ({ children }: any) => (
    <th className="p-4 text-left font-black uppercase tracking-[0.2em] text-[9px] text-white/40">{children}</th>
  ),
  td: ({ children }: any) => <td className="p-4 border-b border-white/5 text-white/60 font-mono text-[10px] leading-relaxed">{children}</td>,
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    if (language === 'mermaid') return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
    
    return !inline ? (
      <div className="my-6 rounded-none border border-white/5 bg-black/40 p-6 overflow-x-auto shadow-inner relative">
        <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-white/10 uppercase tracking-[0.3em] pointer-events-none">
          {language || 'code_segment'}
        </div>
        <code className={cn("font-mono text-[11px] leading-relaxed text-lime-400/70 block", className)} {...props}>
          {children}
        </code>
      </div>
    ) : (
      <code className="rounded-none bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-lime-300/80 border border-white/5" {...props}>
        {children}
      </code>
    )
  },
  h1: ({ children }: any) => <h1 className="text-3xl font-black uppercase tracking-tighter text-white mt-10 mb-6 italic">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-black uppercase tracking-widest text-white/90 mt-10 mb-4 flex items-center gap-4">
    <div className="w-1 h-4 bg-lime-400" />
    {children}
  </h2>,
  h3: ({ children }: any) => <h3 className="text-base font-black uppercase tracking-[0.2em] text-white/70 mt-8 mb-3 italic">{children}</h3>,
  p: ({ children }: any) => <p className="text-[13px] leading-relaxed text-white/50 mb-6 font-medium tracking-wide">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-3 mb-8 ml-2">{children}</ul>,
  li: ({ children }: any) => (
    <li className="flex items-start gap-4 text-[13px] text-white/50">
      <div className="mt-2 h-px w-2 bg-lime-400/40 shrink-0" />
      <span>{children}</span>
    </li>
  ),
});

export function WikiView({ data, initialChapter = 0 }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(initialChapter)
  const chapters = data.chapters || []
  
  if (chapters.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
      {/* Sidebar Navigation: "On this page" style */}
      <div className="lg:col-span-3">
        <div className="sticky top-24 space-y-8">
          <div className="space-y-2 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Navigation_Protocol</h3>
            <div className="h-px w-full bg-white/5" />
          </div>
          
          <nav className="flex flex-col">
            {chapters.map((chapter, i) => (
              <button
                key={chapter.title}
                className={cn(
                  "group flex items-start py-3 px-4 text-left transition-all border-l-2 relative",
                  activeChapter === i 
                    ? "border-lime-400 text-white bg-white/[0.02]" 
                    : "border-transparent text-white/30 hover:text-white/60 hover:border-white/10"
                )}
                onClick={() => setActiveView(i)}
              >
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-tighter text-xs leading-tight">
                    {chapter.title}
                  </div>
                  <div className="font-mono text-[8px] opacity-30 uppercase tracking-widest">
                    Sequence_0{i + 1}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          <div className="px-4 pt-12 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-none">
              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(162,228,53,0.5)]" />
              <span className="font-mono text-[8px] uppercase tracking-widest text-white/40 leading-none">
                AI_SYNTHESIS_ACTIVE
              </span>
            </div>
            <p className="px-1 text-[9px] font-medium leading-relaxed text-white/20 uppercase tracking-wider">
              This archival record was autonomously generated by Gemini 2.0. Verified logic mapping applied.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Card-based focal point */}
      <main className="lg:col-span-9 min-h-[70vh]">
        <div className="bg-[#080808] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="px-10 py-8 border-b border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">
                {chapters[activeChapter].title}
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Powered by Gemini</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20">
                 Archival_Index_{activeChapter + 1}
               </div>
            </div>
          </div>

          <div className="p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {activeChapter === 0 && (
                  <div className="mb-16 space-y-10">
                    {data.summary && (
                      <p className="text-2xl text-white/60 leading-tight tracking-tight font-medium italic border-l-4 border-white/5 pl-8">
                        {data.summary}
                      </p>
                    )}
                    <SystemSpecHeader system={data.system} />
                  </div>
                )}

                <div className="max-w-none prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={WikiComponents() as any}
                  >
                    {chapters[activeChapter].content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Footer */}
          <div className="px-10 py-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/10">
              REPOLENS_INTERNAL // SEC_LVL_04
            </span>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-white/10" />
              <div className="w-1 h-1 bg-white/10" />
              <div className="w-1 h-1 bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
