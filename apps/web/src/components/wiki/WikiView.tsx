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
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {/* Infrastructure */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Cpu className="h-4 w-4" /> Infrastructure
        </h4>
        <div className="flex flex-wrap gap-2">
          {system.infrastructure?.map(item => (
            <Badge key={item} variant="secondary" className="font-mono text-xs">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Terminal className="h-4 w-4" /> Scripts
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.keys(system.scripts || {}).slice(0, 4).map(script => (
            <Badge key={script} variant="outline" className="font-mono text-xs">
              {script}
            </Badge>
          ))}
        </div>
      </div>

      {/* CI/CD */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" /> Workflows
        </h4>
        <div className="space-y-1">
          {system.ci_workflows?.slice(0, 3).map(wf => (
            <div key={wf.name} className="text-sm flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {wf.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WikiComponents = () => ({
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    if (language === 'mermaid') return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
    
    return !inline ? (
      <div className="my-4 rounded-lg border bg-muted/50 p-4 overflow-x-auto">
        <code className={cn("font-mono text-sm", className)} {...props}>
          {children}
        </code>
      </div>
    ) : (
      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
        {children}
      </code>
    )
  },
  h1: ({ children }: any) => <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 mt-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4">{children}</h2>,
  h3: ({ children }: any) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4">{children}</h3>,
  p: ({ children }: any) => <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">{children}</p>,
  ul: ({ children }: any) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
  li: ({ children }: any) => <li>{children}</li>,
});

export function WikiView({ data, initialChapter = 0 }: WikiViewProps) {
  const [activeChapter, setActiveView] = useState(initialChapter)
  const chapters = data.chapters || []
  
  if (chapters.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1">
        <div className="sticky top-20 space-y-4">
          <div className="font-semibold text-lg px-2">Documentation</div>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <nav className="flex flex-col gap-1 pr-4">
              {chapters.map((chapter, i) => (
                <Button
                  key={chapter.title}
                  variant={activeChapter === i ? "secondary" : "ghost"}
                  className="justify-start text-left h-auto py-2 px-3 whitespace-normal"
                  onClick={() => setActiveView(i)}
                >
                  <span className="mr-2 text-muted-foreground text-xs font-mono">{(i + 1).toString().padStart(2, '0')}</span>
                  {chapter.title}
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:col-span-3 min-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeChapter === 0 && (
              <>
                <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <h1 className="text-3xl font-bold mb-4">{chapters[activeChapter].title}</h1>
                  {data.summary && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {data.summary}
                    </p>
                  )}
                </div>
                <SystemSpecHeader system={data.system} />
              </>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={WikiComponents() as any}
              >
                {chapters[activeChapter].content}
              </ReactMarkdown>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
