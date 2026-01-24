'use client'

import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'motion/react'
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Sparkles,
  Play,
  Loader2,
  Terminal,
  Cpu,
  Activity,
  Settings,
  Shield,
  Zap,
  Command,
  Maximize2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MermaidBlock from './MermaidBlock'

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
  repoUrl: string
}

const SystemWidget = ({ system }: { system: WikiViewProps['data']['system'] }) => {
  if (!system) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 px-4">
        Technical Specification
      </h3>
      <div className="space-y-4 px-2">
        {/* Infrastructure & Stack */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Environment</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {system.infrastructure?.map(item => (
                <span key={item} className="px-2 py-0.5 rounded-md bg-blue-500/5 text-blue-300/70 text-[9px] font-mono border border-blue-500/10">
                  {item}
                </span>
              ))}
              {system.governance?.map(item => (
                <span key={item} className="px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-300/70 text-[9px] font-mono border border-purple-500/10">
                  {item}
                </span>
              ))}
            </div>
        </div>

        {/* Pipelines */}
        {system.ci_workflows && system.ci_workflows.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-lime-400">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">CI Pipelines</span>
            </div>
            <div className="space-y-2">
              {system.ci_workflows.map(wf => (
                <div key={wf.name} className="flex flex-col gap-1">
                  <div className="text-[11px] text-white/80 font-medium truncate">{wf.name}</div>
                  <div className="flex gap-2">
                    {wf.events?.map((e: string) => (
                      <span key={e} className="text-[8px] text-white/30 uppercase font-bold tabular-nums">on:{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operational Commands */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-orange-400/80">
              <Command className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Workflows</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.keys(system.scripts || {}).slice(0, 5).map(script => (
                <div key={script} className="group/script flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <span className="text-[10px] text-white/50 font-mono truncate">{script}</span>
                  <Zap className="w-2.5 h-2.5 text-orange-400/20 group-hover/script:text-orange-400 transition-colors" />
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const WikiImage = ({ src, alt }: { src: string, alt: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="my-10 relative group cursor-zoom-in" onClick={() => setIsOpen(true)}>
                <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[500px]" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-white/50" />
                    </div>
                </div>
                {alt && (
                    <div className="mt-3 flex items-center gap-3 px-2">
                        <div className="w-4 h-px bg-lime-400/50" />
                        <span className="text-[10px] font-mono text-lime-400/70 uppercase tracking-widest">{alt}</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-10 cursor-zoom-out"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-7xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={alt} className="w-full h-full object-contain rounded-lg shadow-2xl" />
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            {alt && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                     <p className="text-sm font-mono text-white/80">{alt}</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const CodeBlock = ({ className, children, ...props }: any) => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const code = String(children).replace(/\n$/, '');
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const isRunnable = language === 'python' || language === 'javascript' || language === 'typescript';

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/execution`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language === 'python' ? 'python' : 'javascript', code })
      });
      
      const { jobId } = await res.json();
      
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/execution/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId })
          });
          const data = await statusRes.json();
          
          if (data.status === 'completed') {
            clearInterval(poll);
            setIsRunning(false);
            setOutput(data.result?.stdout || data.result?.stderr || "No output");
          } else if (data.status === 'failed') {
            clearInterval(poll);
            setIsRunning(false);
            setOutput(`Error: ${data.error || 'Execution failed'}`);
          }
        } catch (e) {
            clearInterval(poll);
            setIsRunning(false);
            setOutput('Network error during polling');
        }
      }, 1000);
      
      setTimeout(() => {
        clearInterval(poll);
        if (isRunning) {
             setIsRunning(false);
             setOutput('Execution timed out');
        }
      }, 10000);

    } catch (e) {
      setIsRunning(false);
      setOutput("Failed to initiate execution");
    }
  };

  return (
    <div className="relative group my-10">
      <div className="absolute -inset-2 bg-gradient-to-r from-lime-400/10 via-transparent to-blue-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative bg-[#080808] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
           <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
               <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
               <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 font-mono ml-4">
               {language || 'text'}
             </span>
           </div>
           {isRunnable && (
             <button 
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400 text-black text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-50"
             >
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                {isRunning ? 'Executing' : 'Run'}
             </button>
           )}
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar">
          <code className="text-[13px] font-mono text-white/70 leading-relaxed">
            {children}
          </code>
        </div>

        <AnimatePresence>
            {output && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.08] bg-black/40 backdrop-blur-md"
                >
                    <div className="p-6 font-mono text-[11px] text-white/60">
                        <div className="flex items-center gap-2 mb-4 text-white/20 uppercase tracking-[0.2em] text-[9px] font-bold">
                            <Terminal className="w-3.5 h-3.5 text-lime-400/50" />
                            Console Output
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Custom components for Wiki embedding (Simulated MDX)
const WikiComponents = () => ({
  Blueprint: ({ filter }: { filter?: string }) => (
    <div className="my-12 h-[500px] border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-2xl bg-[#050505] relative group">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            Dynamic Blueprint {filter ? `: ${filter}` : ''}
          </span>
        </div>
      </div>
      <div className="h-full flex items-center justify-center relative">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-white/20 animate-pulse" />
          </div>
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.2em]">Graph Layer Contextualized</p>
        </div>
      </div>
    </div>
  ),
  Risk: ({ level }: { level: string }) => (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase mx-1.5 border tracking-tighter",
      level === 'high' ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : 
      level === 'medium' ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      :
      "bg-lime-500/10 text-lime-400 border-lime-500/20"
    )}>
      {level} RISK
    </span>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (language === 'mermaid') {
      return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
    }

    return !inline ? (
      <CodeBlock className={className} {...props}>
          {children}
      </CodeBlock>
    ) : (
      <code className="bg-white/5 px-1.5 py-0.5 rounded text-lime-300 font-mono text-xs border border-white/5" {...props}>
        {children}
      </code>
    )
  },
  img: ({ src, alt }: any) => (
    <WikiImage src={src} alt={alt} />
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold text-white/90 mt-20 mb-8 flex items-center gap-4 tracking-tight">
      <div className="w-1.5 h-8 bg-lime-400 rounded-full shadow-[0_0_15px_rgba(162,228,53,0.3)]" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-bold text-white/90 mt-12 mb-4 tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-base text-white/60 leading-[1.8] mb-6 font-medium">
      {children}
    </p>
  ),
  li: ({ children }: any) => (
    <li className="text-base text-white/50 leading-[1.8] mb-2 font-medium">
      {children}
    </li>
  )
});

export function WikiView({ data, repoUrl }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(0)
  const chapters = data.chapters || []
  const components = useMemo(() => WikiComponents(), []);

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[2.5rem] border border-white/5 bg-white/[0.01]">
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
           <BookOpen className="w-6 h-6 text-white/10" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Archives Unavailable</h3>
        <p className="text-white/30 max-w-xs mt-3 text-sm leading-relaxed">
          The synthetic analysis engine could not generate a coherent knowledge base for this artifact.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 min-h-[900px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Wiki Navigation Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-24 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 px-4">
              Knowledge Map
            </h3>
            <nav className="space-y-1.5">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.title}
                  onClick={() => setActiveView(index)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group",
                    activeChapter === index
                      ? "bg-lime-400 text-black shadow-[0_20px_40px_rgba(162,228,53,0.1)] scale-[1.02]"
                      : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <FileText className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    activeChapter === index ? "text-black" : "text-white/20 group-hover:text-white/60"
                  )} />
                  <span className="truncate">{chapter.title}</span>
                  {activeChapter === index && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                    </motion.div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <SystemWidget system={data.system} />

          <div className="pt-8 border-t border-white/[0.04] space-y-4">
            <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-3xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-lime-400">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(162,228,53,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Synthesis</span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/30 font-medium">
                Deep repository context reconstructed via AST heuristics and Gemini 2.0 Thinking models.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Wiki Content */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-white/[0.01] rounded-[3rem] border border-white/[0.05] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Wiki Header */}
            <header className="p-12 lg:p-20 pb-0 border-b border-white/[0.04]">
              <div className="flex items-center gap-4 mb-10">
                <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[9px] font-bold font-mono text-white/30 uppercase tracking-widest">
                  Artifact: {repoUrl.replace('https://github.com/', '')}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                  Chapter 0{activeChapter + 1}
                </div>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter mb-12 leading-[0.9]">
                {chapters[activeChapter].title}
              </h1>
              {activeChapter === 0 && data.summary && (
                <p className="text-xl lg:text-2xl text-white/40 leading-relaxed max-w-4xl font-medium tracking-tight border-l-2 border-lime-400/30 pl-8 mb-16">
                  {data.summary}
                </p>
              )}
            </header>

            {/* Wiki Body */}
            <article className="p-12 lg:p-20 pt-12 prose prose-invert prose-lime max-w-none prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components as any}
              >
                {chapters[activeChapter].content}
              </ReactMarkdown>
            </article>

            {/* Footer Navigation */}
            <footer className="px-12 lg:px-20 py-12 bg-black/20 border-t border-white/[0.04] flex justify-between items-center">
              <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
                RepoLens Knowledge Core v2.0
              </div>
              <div className="flex items-center gap-10">
                {activeChapter > 0 && (
                  <button 
                    onClick={() => setActiveView(activeChapter - 1)}
                    className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    Back
                  </button>
                )}
                {activeChapter < chapters.length - 1 && (
                  <button 
                    onClick={() => setActiveView(activeChapter + 1)}
                    className="group text-[10px] text-lime-400 hover:text-lime-300 transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em]"
                  >
                    Advance
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                )}
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}