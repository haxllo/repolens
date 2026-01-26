'use client'

import React, { useState, useMemo, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { 
  FileText, 
  Play,
  Loader2,
  Terminal,
  Cpu,
  Activity,
  Zap,
  Command,
  Maximize2,
  X,
  Plus,
  Minus,
  Box,
  Layout,
  Globe,
  GitBranch,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MermaidBlock from './MermaidBlock'
import { HUDCard } from '@/components/ui/HUDCard'

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
  initialChapter?: number
}

const SystemSpecHeader = ({ system }: { system: WikiViewProps['data']['system'] }) => {
  if (!system) return null;

  return (
    <div className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
      {/* Stack */}
      <div className="bg-black p-8 group hover:bg-white/[0.01] transition-colors">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-white/20 uppercase tracking-[0.3em] text-[9px] font-black">
                <Cpu className="w-4 h-4 text-lime-400" />
                Infrastructure
            </div>
            <div className="w-1.5 h-1.5 bg-white/10 group-hover:bg-lime-400 transition-colors" />
        </div>
        <div className="flex flex-wrap gap-2">
          {system.infrastructure?.map(item => (
            <span key={item} className="text-[10px] font-mono text-white/50 border border-white/5 bg-white/[0.02] px-3 py-1 uppercase tracking-widest">
              {item}
            </span>
          ))}
          {system.governance?.map(item => (
            <span key={item} className="text-[10px] font-mono text-white/50 border border-white/5 bg-white/[0.02] px-3 py-1 uppercase tracking-widest">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Operations */}
      <div className="bg-black p-8 group hover:bg-white/[0.01] transition-colors">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-white/20 uppercase tracking-[0.3em] text-[9px] font-black">
                <Terminal className="w-4 h-4 text-lime-400" />
                Runtime_Ops
            </div>
            <div className="w-1.5 h-1.5 bg-white/10 group-hover:bg-lime-400 transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-y-3">
          {Object.keys(system.scripts || {}).slice(0, 6).map(script => (
            <div key={script} className="flex items-center gap-2 group/item">
                <div className="w-1 h-1 bg-white/10 group-hover/item:bg-lime-400 transition-colors" />
                <span className="text-[10px] font-mono text-white/40 group-hover/item:text-white transition-colors uppercase truncate">
                    {script}
                </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-black p-8 group hover:bg-white/[0.01] transition-colors">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-white/20 uppercase tracking-[0.3em] text-[9px] font-black">
                <Activity className="w-4 h-4 text-lime-400" />
                Automation
            </div>
            <div className="w-1.5 h-1.5 bg-white/10 group-hover:bg-lime-400 transition-colors" />
        </div>
        <div className="space-y-4">
          {system.ci_workflows?.slice(0, 3).map(wf => (
            <div key={wf.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{wf.name}</span>
                <span className="text-[8px] font-mono text-white/20">YAML_CORE</span>
              </div>
              <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                <motion.div 
                    initial={{ x: '-100%' }}
                    whileInView={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-y-0 w-1/3 bg-lime-400/20" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WikiImage = ({ src, alt }: { src: string, alt: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scale, setScale] = useState(1);

    return (
        <>
            <motion.div 
                whileHover={{ scale: 1.01 }}
                className="my-16 relative group cursor-zoom-in border border-white/10 bg-black overflow-hidden" 
                onClick={() => { setIsOpen(true); setScale(1); }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[600px] grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000" />
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-lime-400 uppercase tracking-[0.3em]">Visual_Reference</span>
                        <span className="text-xl font-black text-white uppercase tracking-tighter">{alt || 'ARCHITECTURAL_SCAN'}</span>
                    </div>
                    <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-black" />
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-md p-10"
                    >
                        <div className="absolute top-12 right-12">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-14 h-14 bg-white flex items-center justify-center hover:bg-lime-400 transition-colors"
                            >
                                <X className="w-6 h-6 text-black" />
                            </button>
                        </div>

                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="relative max-w-[90vw] max-h-[90vh] overflow-hidden border border-white/10"
                        >
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={alt} className="w-full h-full object-contain" />
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
            setOutput('Network error');
        }
      }, 1000);
    } catch (e) {
      setIsRunning(false);
      setOutput("Failed to initiate");
    }
  };

  return (
    <HUDCard className="my-10 border-white/5 bg-black" noPadding title={language.toUpperCase() || 'CORE_CODE'}>
      <div className="absolute top-4 right-6 flex items-center gap-6">
        {isRunnable && (
          <button 
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-lime-400 hover:text-white transition-colors disabled:opacity-30"
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Executing' : 'Execute_Native'}
          </button>
        )}
      </div>
      <div className="p-8 overflow-x-auto bg-white/[0.01]">
        <code className="text-[12px] font-mono text-white/60 leading-relaxed block">{children}</code>
      </div>
      <AnimatePresence>
        {output && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }}
            className="border-t border-white/5 bg-[#030303] p-8 font-mono text-[11px] text-white/40"
          >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-lime-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Standard_Output</span>
                </div>
                <div className="w-1.5 h-1.5 bg-lime-400/20" />
            </div>
            <pre className="whitespace-pre-wrap text-lime-400/60 leading-relaxed">{output}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </HUDCard>
  )
}

const WikiComponents = () => ({
  Blueprint: ({ filter }: { filter?: string }) => (
    <HUDCard className="my-16 h-[500px] border-white/5 flex flex-col items-center justify-center bg-black" title="SPATIAL_MAPPING_LAYER">
        <div className="relative">
            <div className="absolute -inset-10 bg-lime-400/5 blur-3xl rounded-full" />
            <div className="w-20 h-20 border border-white/10 flex items-center justify-center relative bg-black">
                <Layout className="w-10 h-10 text-white/10 animate-pulse" />
            </div>
        </div>
        <span className="mt-8 text-[11px] font-black uppercase tracking-[0.5em] text-white/20">Interactive Layer Offline</span>
        <button className="mt-8 px-6 py-2 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white transition-all">Initialize Spatial_Engine</button>
    </HUDCard>
  ),
  Risk: ({ level }: { level: string }) => (
    <span className={cn(
      "inline-flex items-center px-3 py-1 border text-[9px] font-black uppercase tracking-widest mx-1",
      level === 'high' ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]" : "bg-lime-500/10 text-lime-400 border-lime-400/30 shadow-[0_0_15px_-5px_rgba(163,230,53,0.3)]"
    )}>
      <div className={cn("w-1 h-1 mr-2", level === 'high' ? "bg-red-500" : "bg-lime-400")} />
      {level}_Risk_Detected
    </span>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    if (language === 'mermaid') return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
    return !inline ? <CodeBlock className={className} {...props}>{children}</CodeBlock> : 
    <code className="bg-white/10 px-2 py-0.5 font-mono text-xs text-lime-400/80" {...props}>{children}</code>;
  },
  img: ({ src, alt }: any) => <WikiImage src={src} alt={alt} />,
  h2: ({ children }: any) => (
    <div className="mt-32 mb-12 flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-lime-400" />
            <span className="text-[10px] font-black text-lime-400 tracking-[0.4em] uppercase">Section_Header</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">{children}</h2>
    </div>
  ),
  h3: ({ children }: any) => (
    <div className="mt-20 mb-8 border-l-4 border-white/10 pl-8">
        <h3 className="text-2xl font-black text-white/80 tracking-tight uppercase">{children}</h3>
    </div>
  ),
  p: ({ children }: any) => <p className="text-lg md:text-xl text-white/40 leading-relaxed mb-10 font-light tracking-tight">{children}</p>,
  li: ({ children }: any) => (
    <li className="flex gap-4 text-lg text-white/40 leading-relaxed mb-4 group">
        <span className="text-lime-400/40 group-hover:text-lime-400 transition-colors mt-1.5">•</span>
        {children}
    </li>
  ),
  ul: ({ children }: any) => <ul className="mb-12 space-y-2">{children}</ul>
});

export function WikiView({ data, repoUrl, initialChapter = 0 }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(initialChapter)
  const chapters = data.chapters || []
  const components = useMemo(() => WikiComponents(), []);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (chapters.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto py-32 min-h-screen selection:bg-lime-400/30">
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-16 left-0 right-0 h-[2px] bg-lime-400 z-[70] origin-left shadow-[0_0_10px_#a3e635]" 
        style={{ scaleX }}
      />

      {/* Enhanced Chapter Navigator (Docked) */}
      <nav className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] h-16 bg-black/80 backdrop-blur-2xl border border-white/10 flex items-center px-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4 px-6 border-r border-white/10 h-full">
          <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center">
            <Box className="w-4 h-4 text-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Archive_Nav</span>
            <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">{activeChapter + 1} / {chapters.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4">
          {chapters.map((chapter, i) => (
            <button 
              key={chapter.title}
              onClick={() => setActiveView(i)}
              className={cn(
                "relative group w-10 h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all",
                activeChapter === i ? "text-lime-400" : "text-white/20 hover:text-white"
              )}
            >
              <div className={cn(
                  "absolute inset-0 border transition-all duration-500",
                  activeChapter === i ? "border-lime-400 bg-lime-400/5" : "border-transparent group-hover:border-white/20"
              )} />
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
        <div className="px-6 border-l border-white/10 h-full flex items-center">
            <button className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
                Export_Spec
                <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
        </div>
      </nav>

      <main className="pb-64">
        <AnimatePresence mode="wait">
          <motion.article
            key={activeChapter}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Context Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">System_Chapter_Ref:0{activeChapter + 1}</span>
                    <div className="h-px w-12 bg-white/10" />
                    <span className="text-[10px] font-mono text-lime-400 uppercase tracking-[0.3em]">Verified_Scan</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono text-white/10 uppercase tracking-widest">
                    <Clock3 className="w-3 h-3" />
                    Read_Time: ~12min
                </div>
            </div>

            {/* Title Block */}
            <header className="mb-24">
              <h1 className="text-7xl md:text-[8rem] font-black text-white tracking-tighter mb-16 leading-[0.85] uppercase">
                {chapters[activeChapter].title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 === 1 ? 'text-white/10 italic' : ''}>
                        {word}{' '}
                    </span>
                ))}
              </h1>
              {activeChapter === 0 && data.summary && (
                <div className="relative group">
                    <div className="absolute -inset-4 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <p className="text-2xl md:text-3xl text-white/40 leading-relaxed font-light tracking-tight max-w-4xl italic">
                    "{data.summary}"
                    </p>
                </div>
              )}
            </header>

            {/* System Intelligence Feed */}
            {activeChapter === 0 && <SystemSpecHeader system={data.system} />}

            {/* Technical Narrative */}
            <div className="prose prose-invert prose-lime max-w-none 
              prose-h2:hidden
              prose-p:text-xl prose-p:leading-relaxed prose-p:text-white/40 prose-p:font-light prose-p:tracking-tight
              prose-table:border prose-table:border-white/10 prose-table:bg-white/[0.01] 
              prose-th:px-8 prose-th:py-4 prose-th:text-[10px] prose-th:uppercase prose-th:tracking-[0.4em] prose-th:text-white/20 prose-th:border-white/10
              prose-td:px-8 prose-td:py-6 prose-td:text-[12px] prose-td:font-mono prose-td:text-white/40 prose-td:border-white/10">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components as any}
              >
                {chapters[activeChapter].content}
              </ReactMarkdown>
            </div>
          </motion.article>
        </AnimatePresence>
      </main>

      {/* Aesthetic Border Accents */}
      <div className="fixed top-0 left-12 bottom-0 w-px bg-white/5 pointer-events-none" />
      <div className="fixed top-0 right-12 bottom-0 w-px bg-white/5 pointer-events-none" />
    </div>
  )
}

function Clock3(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}