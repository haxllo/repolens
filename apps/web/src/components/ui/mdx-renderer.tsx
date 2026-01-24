'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Info, Lightbulb } from 'lucide-react'

const components = {
  Badge,
  Callout: ({ children, type = 'info' }: { children: React.ReactNode, type?: 'info' | 'warning' | 'success' | 'tip' }) => {
    const icons = {
      info: <Info className="h-4 w-4 text-blue-400" />,
      warning: <AlertCircle className="h-4 w-4 text-yellow-400" />,
      success: <CheckCircle2 className="h-4 w-4 text-lime-400" />,
      tip: <Lightbulb className="h-4 w-4 text-purple-400" />,
    }
    const colors = {
      info: 'bg-blue-400/10 border-blue-400/20 text-blue-200',
      warning: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-200',
      success: 'bg-lime-400/10 border-lime-400/20 text-lime-200',
      tip: 'bg-purple-400/10 border-purple-400/20 text-purple-200',
    }
    return (
      <div className={`flex gap-3 p-4 rounded-xl border my-4 ${colors[type]}`}>
        <div className="mt-0.5">{icons[type]}</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    )
  },
  h1: (props: any) => <h1 className="text-2xl font-bold mt-8 mb-4 text-white" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mt-6 mb-3 text-white/90" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-medium mt-4 mb-2 text-white/80" {...props} />,
  p: (props: any) => <p className="text-white/70 leading-relaxed mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside space-y-2 mb-4 text-white/70" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside space-y-2 mb-4 text-white/70" {...props} />,
  code: (props: any) => (
    <code className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-sm text-lime-300" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto mb-4 font-mono text-sm" {...props} />
  ),
}

interface MDXRendererProps {
  content: string
}

export function MDXRenderer({ content }: MDXRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    const prepareMDX = async () => {
      try {
        const mdxSource = await serialize(content)
        setMdxSource(mdxSource)
      } catch (error) {
        console.error('MDX serialization failed:', error)
      }
    }
    prepareMDX()
  }, [content])

  if (!mdxSource) return <div className="animate-pulse space-y-2"><div className="h-4 bg-white/5 rounded w-3/4"></div><div className="h-4 bg-white/5 rounded w-1/2"></div></div>

  return <MDXRemote {...mdxSource} components={components} />
}
