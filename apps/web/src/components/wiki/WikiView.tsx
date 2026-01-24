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
  GitBranch,
  Activity,
  Layers,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-4">
        System Intelligence
      </h3>
      <div className="glass rounded-2xl p-4 space-y-4 border border-white/5">
        {/* Infrastructure */}
        {system.infrastructure && system.infrastructure.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Cpu className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Infrastructure</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {system.infrastructure.map(item => (
                <span key={item} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[8px] font-mono border border-blue-500/20">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CI/CD Workflows */}
        {system.ci_workflows && system.ci_workflows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lime-400">
              <Activity className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">CI Workflows</span>
            </div>
            <div className="space-y-1">
              {system.ci_workflows.map(wf => (
                <div key={wf.name} className="flex items-center justify-between text-[10px] text-white/50">
                  <span className="truncate max-w-[120px]">{wf.name}</span>
                  <div className="flex gap-1">
                    {wf.events?.slice(0, 1).map((e: string) => (
                      <span key={e} className="text-[8px] text-lime-400/60 uppercase">{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Major Scripts */}
        {system.scripts && Object.keys(system.scripts).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400">
              <Settings className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Operational Scripts</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.keys(system.scripts).slice(0, 6).map(script => (
                <div key={script} className="px-1.5 py-1 rounded bg-white/5 text-[9px] text-white/40 truncate font-mono border border-white/5">
                  {script}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CodeBlock = ({ className, children, ...props }: any) => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const code = String(children).replace(/\n$/, '');
  
  // Extract language from className (e.g., "language-python")
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
      
      // Poll for results
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
      
      // Timeout after 10s
      setTimeout(() => {
        clearInterval(poll);
        if (isRunning) {
             setIsRunning(false);
             setOutput('Execution timed out (Frontend limit)');
        }
      }, 10000);

    } catch (e) {
      setIsRunning(false);
      setOutput("Failed to initiate execution");
    }
  };

  return (
    <div className="relative group my-8">
      <div className="absolute -inset-px bg-gradient-to-r from-lime-400/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        {/* Header with Run Button */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500/50" />
             <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
             <div className="w-2 h-2 rounded-full bg-green-500/50" />
             <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-2">
               {language || 'text'}
             </span>
           </div>
           {isRunnable && (
             <button 
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {isRunning ? 'Running...' : 'Run Code'}
             </button>
           )}
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-x-auto">
          <code className="text-sm font-mono text-white/80 leading-relaxed">
            {children}
          </code>
        </div>

        {/* Execution Output */}
        <AnimatePresence>
            {output && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 bg-black/50"
                >
                    <div className="p-4 font-mono text-xs text-white/70">
                        <div className="flex items-center gap-2 mb-2 text-white/30 uppercase tracking-widest text-[10px]">
                            <Terminal className="w-3 h-3" />
                            Output
                        </div>
                        <pre className="whitespace-pre-wrap">{output}</pre>
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
  // Interactive Blueprint Map embedded in text
  Blueprint: ({ filter }: { filter?: string }) => (
    <div className="my-8 h-[400px] border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-[#050505] relative group">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-lime-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          Interactive Architecture {filter ? `: ${filter}` : ''}
        </span>
      </div>
      <div className="h-full flex items-center justify-center relative">
        <div className="text-center space-y-2">
          <Sparkles className="w-6 h-6 text-lime-400/40 mx-auto animate-pulse" />
          <p className="text-[10px] text-white/30 italic">Interactive Blueprint Contextualized</p>
        </div>
      </div>
    </div>
  ),
  // Inline Risk Badge
  Risk: ({ level }: { level: string }) => (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase mx-1 border",
      level === 'high' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
      level === 'medium' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
      "bg-lime-500/10 text-lime-400 border-lime-500/20"
    )}>
      {level} RISK
    </span>
  ),
  // Modern code block with syntax styling
  code: ({ inline, className, children, ...props }: any) => {
    return !inline ? (
      <CodeBlock className={className} {...props}>
          {children}
      </CodeBlock>
    ) : (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-lime-300 font-mono text-xs" {...props}>
        {children}
      </code>
    )
  },
  // Custom headers
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
      <div className="w-1 h-6 bg-lime-400 rounded-full" />
      {children}
    </h2>
  )
});

export function WikiView({ data, repoUrl }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(0)
  const chapters = data.chapters || []
  const components = useMemo(() => WikiComponents(), []);

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border border-white/5">
        <BookOpen className="w-12 h-12 text-white/20 mb-4" />
        <h3 className="text-xl font-semibold text-white">No Knowledge Base Available</h3>
        <p className="text-white/40 max-w-xs mt-2">
          We couldn't generate a structured wiki for this repository.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[800px] animate-in fade-in duration-700">
      {/* Wiki Navigation Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-4">
              Documentation
            </h3>
            <nav className="space-y-1">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.title}
                  onClick={() => setActiveView(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    activeChapter === index
                      ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(162,228,53,0.15)]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <FileText className={cn(
                    "w-4 h-4 flex-shrink-0",
                    activeChapter === index ? "text-black" : "text-white/30 group-hover:text-white"
                  )} />
                  <span className="truncate">{chapter.title}</span>
                  {activeChapter === index && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <SystemWidget system={data.system} />

          <div className="pt-6 border-t border-white/[0.06] space-y-4">
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-lime-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Synthesis</span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/50">
                This knowledge base was synthesized using deep AST analysis and Gemini 1.5 Flash.
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
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
          >
            {/* Wiki Header */}
            <header className="p-8 lg:p-12 border-b border-white/[0.06] bg-gradient-to-br from-white/[0.03] via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-2 py-1 rounded bg-white/[0.05] border border-white/[0.1] text-[10px] font-mono text-white/40">
                  {repoUrl.replace('https://github.com/', '')}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                  Chapter {activeChapter + 1}
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-6">
                {chapters[activeChapter].title}
              </h1>
              {activeChapter === 0 && data.summary && (
                <p className="text-xl text-white/60 leading-relaxed max-w-3xl">
                  {data.summary}
                </p>
              )}
            </header>

            {/* Wiki Body */}
            <article className="p-8 lg:p-12 prose prose-invert prose-lime max-w-none prose-p:text-white/70 prose-p:leading-loose prose-li:text-white/70 prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components as any}
              >
                {chapters[activeChapter].content}
              </ReactMarkdown>
            </article>

            {/* Footer Navigation */}
            <footer className="px-12 py-8 bg-white/[0.01] border-t border-white/[0.06] flex justify-between items-center">
              <div className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                RepoLens Knowledge Base v1.0
              </div>
              <div className="flex items-center gap-6">
                {activeChapter > 0 && (
                  <button 
                    onClick={() => setActiveView(activeChapter - 1)}
                    className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    Previous
                  </button>
                )}
                {activeChapter < chapters.length - 1 && (
                  <button 
                    onClick={() => setActiveView(activeChapter + 1)}
                    className="group text-xs text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest"
                  >
                    Next Chapter
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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