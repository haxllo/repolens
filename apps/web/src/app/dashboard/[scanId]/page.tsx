'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OverviewTab from '@/components/scan/OverviewTab'
import { SymbolArchive } from '@/components/dashboard/SymbolArchive'
import { 
  GitBranch, 
  Loader2, 
  AlertCircle, 
  Clock3,
  BookOpen,
  ChevronRight,
  Box,
  Bookmark,
  Hash,
  Activity,
  ShieldCheck
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
  }

  const checkBookmarkStatus = async (repoId: string) => {
    try {
      const favorites = await apiClient.get<any[]>('/favorites')
      setIsBookmarked(favorites.some(f => f.repositoryId === repoId))
    } catch (e) {
      // Quiet fail
    }
  }

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
    } catch (e) {
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
  }, [scanId, scan?.status])

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
    <div className="space-y-12 pb-24">
      {/* PANE_HEADER: ARCHIVE_METADATA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Console</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Archive_{scan.scanId.slice(0, 8)}</span>
          </div>
          <h1 className="text-4xl font-light tracking-tighter leading-none">
            {getRepoName(scan.repoUrl)}
          </h1>
          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              <span>REF: {scan.branch}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              <span>VERIFIED: {new Date(scan.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-6">
            <div className="flex items-center gap-1">
                {isCompleted && (
                    <button 
                        onClick={toggleBookmark}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center border transition-all",
                            isBookmarked 
                                ? "bg-primary border-primary text-white" 
                                : "bg-black border-white/10 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    </button>
                )}
                {isCompleted && (
                    <div className="flex h-10 border border-white/10 bg-black p-0.5">
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
            <div className="h-10 flex items-center gap-3 px-6 border border-white/10 bg-white/[0.02]">
                <StatusIcon status={scan.status} />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
                    {scan.status}
                </span>
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
                 <OverviewTab results={scan.results} repoUrl={scan.repoUrl} />
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