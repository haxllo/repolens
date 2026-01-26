'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import OverviewTab from '@/components/scan/OverviewTab'
import { SymbolArchive } from '@/components/dashboard/SymbolArchive'
import { 
  ArrowLeft, 
  GitBranch, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Clock3,
  BookOpen,
  ChevronRight,
  Maximize2,
  Box,
  Bookmark,
  Hash
} from 'lucide-react'
import { toast } from 'sonner'
import { BlueprintCanvas } from '@/components/blueprint/BlueprintCanvas'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface ScanData {
  id: string
  scanId: string
  status: string
  repoUrl: string
  branch: string
  createdAt: string
  completedAt?: string
  results?: any
  progress?: number
  error?: string
  repositoryId?: string
}

export default function ScanDetailPage() {
  const params = useParams()
  const scanId = params.scanId as string
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState<'archive' | 'spatial' | 'symbols'>('archive')
  const [isBookmarked, setIsBookmarked] = useState(false)

  const fetchScanData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scan/${scanId}`
      )
      if (!response.ok) throw new Error('System query failed')
      const data = await response.json()
      setScan(data)
      setError('')
      
      // Check if already bookmarked
      if (data.repositoryId) {
        checkBookmarkStatus(data.repositoryId)
      }
    } catch (err: any) {
      setError(err.message || 'Connection interrupted')
    } finally {
      setLoading(false)
    }
  }

  const checkBookmarkStatus = async (repoId: string) => {
    try {
      const favorites = await apiClient.get<any[]>('/favorites')
      setIsBookmarked(favorites.some(f => f.repositoryId === repoId))
    } catch (e) {
      console.error('Status check failed')
    }
  }

  const toggleBookmark = async () => {
    if (!scan?.repositoryId) return
    try {
      if (isBookmarked) {
        await apiClient.delete(`/favorites/${scan.repositoryId}`)
        toast.success('Record removed from vault.')
      } else {
        await apiClient.post(`/favorites/${scan.repositoryId}`, {})
        toast.success('Record verified and vaulted.')
      }
      setIsBookmarked(!isBookmarked)
    } catch (e) {
      toast.error('Vault protocol failed.')
    }
  }

  useEffect(() => {
    fetchScanData()
    const interval = setInterval(() => {
      if (scan?.status === 'queued' || scan?.status === 'processing') {
        fetchScanData()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [scanId, scan?.status])

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s === 'completed') return <CheckCircle2 className="h-4 w-4 text-lime-400" />
    if (s === 'processing' || s === 'queued') return <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
    if (s === 'failed') return <AlertCircle className="h-4 w-4 text-red-500" />
    return <Clock3 className="h-4 w-4 text-white/20" />
  }

  const getRepoName = (url: string) => {
    try {
      return url.replace('https://github.com/', '')
    } catch {
      return url
    }
  }

  if (loading) return (
    <div className="space-y-12">
      <div className="h-8 w-48 bg-white/5 animate-pulse" />
      <div className="h-64 bg-white/5 animate-pulse border border-white/5" />
    </div>
  )

  if (error || !scan) return (
    <div className="py-24 text-center">
      <AlertCircle className="w-12 h-12 text-red-500/20 mx-auto mb-6" />
      <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4">Archive Not Found</h2>
      <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">Return to Console</Link>
    </div>
  )

  const isProcessing = scan.status === 'queued' || scan.status === 'processing'
  const isCompleted = scan.status === 'completed'
  const isFailed = scan.status === 'failed'

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <Link href="/dashboard" className="hover:text-white transition-colors">Console</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/40">Archive Details</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none">
            {getRepoName(scan.repoUrl).split('/').pop()}
          </h1>
          <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-white/30">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              {scan.branch}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/10">IDX:</span>
              {scan.scanId.slice(0, 12)}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-6">
            <div className="flex items-center gap-4">
                {isCompleted && (
                    <button 
                        onClick={toggleBookmark}
                        className={cn(
                            "p-3 border transition-all",
                            isBookmarked 
                                ? "bg-lime-400 border-lime-400 text-black" 
                                : "bg-black border-white/10 text-white/20 hover:text-white"
                        )}
                        title={isBookmarked ? "Erase from Vault" : "Vault Record"}
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    </button>
                )}
                {isCompleted && (
                    <div className="flex bg-black border border-white/10 p-1">
                        <button 
                            onClick={() => setActiveView('archive')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'archive' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
                        >
                            <BookOpen className="w-3 h-3" />
                            Archive View
                        </button>
                        <button 
                            onClick={() => setActiveView('spatial')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'spatial' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
                        >
                            <Box className="w-3 h-3" />
                            Spatial Map
                        </button>
                        <button 
                            onClick={() => setActiveView('symbols')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'symbols' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
                        >
                            <Hash className="w-3 h-3" />
                            Symbol Registry
                        </button>
                    </div>
                )}
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 border border-white/10 bg-black`}>
                {getStatusIcon(scan.status)}
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
                    {scan.status}
                </span>
            </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="py-32 border border-white/5 bg-black flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
             <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
             <div className="absolute inset-0 blur-xl bg-lime-400/20 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">Neural Indexing</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Parsing architectural constructs...</p>
          </div>
          <div className="w-64 h-px bg-white/5 relative">
             <motion.div 
                className="absolute inset-y-0 left-0 bg-lime-400 shadow-[0_0_10px_rgba(162,228,53,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${scan.progress || 30}%` }}
             />
          </div>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="p-12 border border-red-500/20 bg-black space-y-6">
          <div className="flex items-center gap-4 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm font-black uppercase tracking-[0.3em]">Protocol Aborted</span>
          </div>
          <p className="font-mono text-xs text-red-400/60 leading-relaxed uppercase tracking-widest bg-red-500/5 p-6 border border-red-500/10">
            ERROR_LOG: {scan.error || 'System validation failed'}
          </p>
          <Link href="/dashboard" className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
            Re-initialize Process
          </Link>
        </div>
      )}

      {/* Completed Content */}
      {isCompleted && scan.results && (
        <div className="animate-in fade-in duration-1000">
           {activeView === 'archive' ? (
               <OverviewTab results={scan.results} repoUrl={scan.repoUrl} />
           ) : activeView === 'symbols' ? (
               <SymbolArchive data={scan.results} />
           ) : (
               <BlueprintCanvas data={scan.results} />
           )}
        </div>
      )}
    </div>
  )
}