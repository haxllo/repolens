'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import OverviewTab from '@/components/scan/OverviewTab'
import { SymbolArchive } from '@/components/dashboard/SymbolArchive'
import { 
  GitBranch, 
  AlertCircle, 
  BookOpen,
  ChevronRight,
  Box,
  Bookmark,
  Hash,
  Activity,
  ShieldCheck,
  Github
} from 'lucide-react'
import { useCallback } from 'react'
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

  const checkBookmarkStatus = useCallback(async (repoId: string) => {
    try {
      const favorites = await apiClient.get<any[]>('/favorites')
      setIsBookmarked(favorites.some(f => f.repositoryId === repoId))
    } catch {
      // Quiet fail
    }
  }, [])

  const fetchScanData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scan/${scanId}`
      )
      if (!response.ok) throw new Error('Query_Failure: Connection_Terminated')
      const data = await response.json()
      setScan(data)
      setError('')
      
      if (data.repositoryId) {
        checkBookmarkStatus(data.repositoryId)
      }
    } catch (err: any) {
      setError(err.message || 'Error: Archive_Sync_Interrupted')
    } finally {
      setLoading(false)
    }
  }, [scanId, checkBookmarkStatus])

  const toggleBookmark = async () => {
    if (!scan?.repositoryId) return
    try {
      if (isBookmarked) {
        await apiClient.delete(`/favorites/${scan.repositoryId}`)
        toast.info('VAULT_RECORD_PURGED')
      } else {
        await apiClient.post(`/favorites/${scan.repositoryId}`, {})
        toast.success('VAULT_RECORD_SECURED')
      }
      setIsBookmarked(!isBookmarked)
    } catch {
      toast.error('VAULT_PROTOCOL_FAILURE')
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
  }, [fetchScanData, scan?.status])

  const getRepoName = (url: string) => {
    try {
      return url.replace('https://github.com/', '')
    } catch {
      return url
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <Activity className="w-6 h-6 animate-pulse text-primary" />
      <span className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Retrieving_Archive_Segment...</span>
    </div>
  )

  if (error || !scan) return (
    <div className="py-24 max-w-2xl mx-auto border border-dashed border-white/10 p-12 text-center">
      <AlertCircle className="w-8 h-8 text-primary mx-auto mb-6" />
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-foreground mb-4">{error || 'ARCHIVE_SEGMENT_MISSING'}</h2>
      <Link href="/dashboard" className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Return_to_Console_Root [←]</Link>
    </div>
  )

  const isProcessing = scan.status === 'queued' || scan.status === 'processing'
  const isCompleted = scan.status === 'completed'
  const isFailed = scan.status === 'failed'

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-6">
      {/* PANE_HEADER: ARCHIVE_METADATA */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 border-b border-white/5 pb-16">
        <div className="space-y-8 flex-1 min-w-0">
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.5em] text-white/20">
            <Link href="/dashboard" className="hover:text-lime-400 transition-colors">Console</Link>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-white/40 italic">Archive_Sequence_{scan.scanId.slice(0, 8)}</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white italic truncate">
                {getRepoName(scan.repoUrl)}
              </h1>
              <div className="flex items-center gap-3">
                <a 
                  href={scan.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-white/20 transition-all rounded-full"
                >
                  <Github className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">Powered by Gemini</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-none" />
                <span className="text-white/10">REF:</span>
                <span className="text-white/60 font-bold">{scan.branch}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-none" />
                <span className="text-white/10">VERIFIED:</span>
                <span className="text-white/60 font-bold tracking-widest">{new Date(scan.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-8 shrink-0">
            <div className="flex items-center gap-2">
                {isCompleted && (
                    <button 
                        onClick={toggleBookmark}
                        className={cn(
                            "h-12 w-12 flex items-center justify-center border transition-all duration-500",
                            isBookmarked 
                                ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(162,228,53,0.2)]" 
                                : "bg-black border-white/5 text-white/20 hover:text-white hover:border-white/20"
                        )}
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    </button>
                )}
                {isCompleted && (
                    <div className="flex h-12 border border-white/5 bg-black p-1 shadow-2xl">
                        <ViewToggle 
                          active={activeView === 'archive'} 
                          onClick={() => setActiveView('archive')}
                          icon={BookOpen}
                          label="ARCHIVE"
                        />
                        <ViewToggle 
                          active={activeView === 'spatial'} 
                          onClick={() => setActiveView('spatial')}
                          icon={Box}
                          label="SPATIAL"
                        />
                        <ViewToggle 
                          active={activeView === 'symbols'} 
                          onClick={() => setActiveView('symbols')}
                          icon={Hash}
                          label="SYMBOLS"
                        />
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <div className="h-10 flex items-center gap-4 px-6 border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-xl">
                    <StatusIcon status={scan.status} />
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                        SYSTEM_STATUS // {scan.status}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* EXECUTION_PANE: OUTPUT_CONTENT */}
      <div className="min-h-[400px]">
        {isProcessing && (
          <div className="py-48 flex flex-col items-center justify-center text-center space-y-12">
            <Activity className="w-8 h-8 text-primary animate-pulse" />
            <div className="space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.4em]">Processing_Data_Stream</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Synthesizing architectural knowledge graph...</p>
            </div>
            <div className="w-96 h-1 bg-white/5 relative overflow-hidden">
               <div 
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                  style={{ width: `${scan.progress || 30}%` }}
               />
            </div>
          </div>
        )}

        {isFailed && (
          <div className="p-12 border border-primary/20 bg-black space-y-8">
            <div className="flex items-center gap-4 text-primary">
              <AlertCircle className="w-6 h-6" />
              <span className="font-mono text-xs uppercase tracking-[0.4em]">Protocol_Interrupted</span>
            </div>
            <div className="font-mono text-[10px] text-primary/60 leading-relaxed uppercase tracking-widest bg-primary/5 p-8 border border-primary/10">
              STDOUT // ERROR_REPORT: {scan.error || 'Unknown system validation failure'}
            </div>
            <Link href="/dashboard" className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground underline underline-offset-8">
              INITIALIZE_NEW_SEQUENCE
            </Link>
          </div>
        )}

        {isCompleted && scan.results && (
          <div className="space-y-12">
             {activeView === 'archive' ? (
                 <OverviewTab results={scan.results} />
             ) : activeView === 'symbols' ? (
                 <SymbolArchive data={scan.results} />
             ) : (
                 <BlueprintCanvas data={scan.results} />
             )}
          </div>
        )}
      </div>
    </div>
  )
}

function ViewToggle({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest transition-colors",
        active ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  )
}

function StatusIcon({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  if (s === 'completed') return <div className="w-2 h-2 bg-foreground" />
  if (s === 'processing' || s === 'queued') return <div className="w-2 h-2 bg-primary animate-pulse" />
  if (s === 'failed') return <AlertCircle className="h-3 w-3 text-primary" />
  return <div className="w-2 h-2 bg-muted-foreground" />
}