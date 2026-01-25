'use client'

import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'motion/react'
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
  Minus
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
  initialChapter?: number
}

const SystemSpecHeader = ({ system }: { system: WikiViewProps['data']['system'] }) => {
  if (!system) return null;

  return (
    <div className="mb-16 border-y border-white/5 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Stack */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/20 uppercase tracking-[0.2em] text-[9px] font-bold">
          <Cpu className="w-3 h-3" />
          System Stack
        </div>
        <div className="flex flex-wrap gap-1">
          {system.infrastructure?.map(item => (
            <span key={item} className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {item}
            </span>
          ))}
          {system.governance?.map(item => (
            <span key={item} className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Operations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/20 uppercase tracking-[0.2em] text-[9px] font-bold">
          <Command className="w-3 h-3" />
          Runtime Ops
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.keys(system.scripts || {}).slice(0, 4).map(script => (
            <span key={script} className="text-[10px] font-mono text-white/40">
              {script}
            </span>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/20 uppercase tracking-[0.2em] text-[9px] font-bold">
          <Activity className="w-3 h-3" />
          Automation
        </div>
        <div className="space-y-1">
          {system.ci_workflows?.slice(0, 2).map(wf => (
            <div key={wf.name} className="text-[10px] font-mono text-white/60 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-lime-400/50" />
              {wf.name}
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

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    return (
        <>
            <div className="my-12 relative group cursor-zoom-in border border-white/5 bg-black rounded-none overflow-hidden" onClick={() => { setIsOpen(true); setScale(1); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[600px] grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-black border border-white/10 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-white/50" />
                </div>
                {alt && (
                    <div className="p-4 bg-black border-t border-white/5">
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{alt}</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-10"
                    >
                        {/* Control Bar (Top) */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black border border-white/10 p-1 z-[110]">
                            <button 
                                onClick={handleZoomOut}
                                className="p-3 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                title="Zoom Out"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-2" />
                            <button 
                                onClick={handleZoomIn}
                                className="p-3 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                title="Zoom In"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-2" />
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-3 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <motion.div 
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.98 }}
                            className="relative w-full h-full flex items-center justify-center overflow-auto cursor-zoom-out"
                            onClick={() => setIsOpen(false)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <motion.img 
                                src={src} 
                                alt={alt} 
                                style={{ scale }}
                                className="max-w-full max-h-full object-contain transition-transform duration-200"
                                onClick={(e) => e.stopPropagation()}
                            />
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
      setTimeout(() => { clearInterval(poll); if (isRunning) setIsRunning(false); }, 10000);
    } catch (e) {
      setIsRunning(false);
      setOutput("Failed to initiate");
    }
  };

  return (
    <div className="my-6 border border-white/10 bg-[#050505] rounded-none overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-1.5 bg-white/[0.02] border-b border-white/5">
        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{language || 'code'}</span>
        {isRunnable && (
          <button 
            onClick={runCode}
            disabled={isRunning}
            className="text-[9px] font-black uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-30"
          >
            {isRunning ? '...' : 'RUN'}
          </button>
        )}
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="text-[11px] font-mono text-white/60 leading-relaxed">{children}</code>
      </div>
      <AnimatePresence>
        {output && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }}
            className="border-t border-white/5 bg-black p-6 font-mono text-[11px] text-white/40"
          >
            <div className="text-[9px] uppercase tracking-[0.2em] mb-4 text-white/20">System Output</div>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const WikiComponents = () => ({
  Blueprint: ({ filter }: { filter?: string }) => (
    <div className="my-16 h-[400px] border border-white/5 bg-black rounded-none flex flex-col items-center justify-center relative">
      <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-4">
        <Zap className="w-4 h-4 text-white/20" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Interactive Diagram Layer</span>
    </div>
  ),
  Risk: ({ level }: { level: string }) => (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase mx-1 border",
      level === 'high' ? "bg-red-500/5 text-red-500/70 border-red-500/10" : "bg-lime-500/5 text-lime-500/70 border-lime-500/10"
    )}>
      {level} Risk
    </span>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    if (language === 'mermaid') return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
    return !inline ? <CodeBlock className={className} {...props}>{children}</CodeBlock> : 
    <code className="bg-white/5 px-1 py-0.5 rounded-none text-white/80 font-mono text-xs" {...props}>{children}</code>
  },
  img: ({ src, alt }: any) => <WikiImage src={src} alt={alt} />,
  h2: ({ children }: any) => <h2 className="text-3xl font-bold text-white mt-24 mb-8 tracking-tight uppercase tracking-[0.1em]">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-bold text-white/80 mt-16 mb-6 tracking-tight uppercase tracking-[0.1em]">{children}</h3>,
  p: ({ children }: any) => <p className="text-lg text-white/50 leading-[1.8] mb-8 font-medium">{children}</p>,
  li: ({ children }: any) => <li className="text-lg text-white/40 leading-[1.8] mb-3 list-disc ml-6">{children}</li>,
  ul: ({ children }: any) => <ul className="mb-8">{children}</ul>
});

export function WikiView({ data, repoUrl, initialChapter = 0 }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(initialChapter)
  const chapters = data.chapters || []
  const components = useMemo(() => WikiComponents(), []);

  if (chapters.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 min-h-screen">
      {/* Chapter Navigator (Docked to Bottom) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-black border border-white/10 rounded-none flex items-center gap-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
          <FileText className="w-4 h-4 text-lime-400" />
          <span className="text-[10px] font-black text-white tracking-widest uppercase truncate max-w-[120px]">
            Archive_Index
          </span>
        </div>
        <div className="flex items-center gap-4">
          {chapters.map((chapter, i) => (
            <button 
              key={chapter.title}
              onClick={() => setActiveView(i)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all w-8 h-8 border flex items-center justify-center",
                activeChapter === i ? "bg-white text-black border-white" : "text-white/20 border-white/5 hover:border-white/20 hover:text-white"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </nav>

      <main className="mt-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.article
            key={activeChapter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <header className="mb-12">
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] mb-4">
                PROTOCOL_CHAPTER_0{activeChapter + 1}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase">
                {chapters[activeChapter].title}
              </h1>
              {activeChapter === 0 && data.summary && (
                <p className="text-xl text-white/40 leading-relaxed font-medium max-w-2xl border-l border-lime-400/30 pl-8">
                  {data.summary}
                </p>
              )}
            </header>

            {/* System Context */}
            <SystemSpecHeader system={data.system} />

            {/* Content */}
            <div className="prose prose-invert prose-lime max-w-none 
              prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-2xl prose-h2:font-black prose-h2:tracking-[0.2em]
              prose-p:text-base prose-p:leading-relaxed prose-p:text-white/50
              prose-table:border prose-table:border-white/5 prose-th:text-[10px] prose-th:uppercase prose-th:tracking-widest prose-th:text-white/20
              prose-td:text-[11px] prose-td:font-mono prose-td:text-white/40 prose-td:py-3">
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
    </div>
  )
}
