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

    return (
        <>
            <div className="my-12 relative group cursor-zoom-in border border-white/5 bg-black rounded-lg overflow-hidden" onClick={() => setIsOpen(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[600px] grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black p-10 cursor-zoom-out"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.98 }}
                            className="relative max-w-7xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={alt} className="w-full h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
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
    <div className="my-12 border border-white/10 bg-[#050505] rounded-lg overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/5">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{language || 'code'}</span>
        {isRunnable && (
          <button 
            onClick={runCode}
            disabled={isRunning}
            className="text-[10px] font-bold uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-30"
          >
            {isRunning ? 'Executing...' : 'Run Snippet'}
          </button>
        )}
      </div>
      <div className="p-6 overflow-x-auto">
        <code className="text-sm font-mono text-white/70 leading-relaxed">{children}</code>
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
    <div className="my-16 h-[400px] border border-white/5 bg-black rounded-lg flex flex-col items-center justify-center relative">
      <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-4">
        <Zap className="w-4 h-4 text-white/20" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Interactive Diagram Layer</span>
    </div>
  ),
  Risk: ({ level }: { level: string }) => (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase mx-1 border",
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
    <code className="bg-white/5 px-1 py-0.5 rounded text-white/80 font-mono text-xs" {...props}>{children}</code>
  },
  img: ({ src, alt }: any) => <WikiImage src={src} alt={alt} />,
  h2: ({ children }: any) => <h2 className="text-3xl font-bold text-white mt-24 mb-8 tracking-tight">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-bold text-white/80 mt-16 mb-6 tracking-tight">{children}</h3>,
  p: ({ children }: any) => <p className="text-lg text-white/50 leading-[1.8] mb-8">{children}</p>,
  li: ({ children }: any) => <li className="text-lg text-white/40 leading-[1.8] mb-3 list-disc ml-6">{children}</li>,
  ul: ({ children }: any) => <ul className="mb-8">{children}</ul>
});

export function WikiView({ data, repoUrl, initialChapter = 0 }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(initialChapter)
  const chapters = data.chapters || []
  const components = useMemo(() => WikiComponents(), []);

  if (chapters.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto py-20 min-h-screen">
      {/* Chapter Navigator (Floating Minimal) */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-black border border-white/10 rounded-none flex items-center gap-8 shadow-2xl">
        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
          <FileText className="w-4 h-4 text-lime-400" />
          <span className="text-[11px] font-bold text-white tracking-widest uppercase truncate max-w-[150px]">
            {repoUrl.split('/').pop()}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {chapters.map((chapter, i) => (
            <button 
              key={chapter.title}
              onClick={() => setActiveView(i)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                activeChapter === i ? "text-lime-400" : "text-white/30 hover:text-white/50"
              )}
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </nav>

      <main className="mt-20">
        <AnimatePresence mode="wait">
          <motion.article
            key={activeChapter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <header className="mb-20">
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-6">
                Chapter 0{activeChapter + 1} / {chapters.length}
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-12 leading-[0.85]">
                {chapters[activeChapter].title}
              </h1>
              {activeChapter === 0 && data.summary && (
                <p className="text-2xl text-white/40 leading-relaxed font-medium max-w-2xl italic">
                  {data.summary}
                </p>
              )}
            </header>

            {/* System Context */}
            <SystemSpecHeader system={data.system} />

            {/* Content */}
            <div className="prose prose-invert prose-lime max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components as any}
              >
                {chapters[activeChapter].content}
              </ReactMarkdown>
            </div>

            {/* Footer Pagination */}
            <footer className="mt-32 pt-12 border-t border-white/5 flex justify-between items-center">
              <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/10">
                Architectural Knowledge Core
              </div>
              <div className="flex gap-12">
                {activeChapter > 0 && (
                  <button onClick={() => setActiveView(activeChapter - 1)} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                    Previous
                  </button>
                )}
                {activeChapter < chapters.length - 1 && (
                  <button onClick={() => setActiveView(activeChapter + 1)} className="text-[10px] font-black uppercase tracking-widest text-lime-400 hover:text-lime-300">
                    Next Chapter
                  </button>
                )}
              </div>
            </footer>
          </motion.article>
        </AnimatePresence>
      </main>
    </div>
  )
}