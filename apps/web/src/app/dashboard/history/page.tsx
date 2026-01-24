'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Clock, 
  GitBranch, 
  CheckCircle2, 
  Loader2, 
  History,
  ExternalLink,
  AlertCircle,
  Clock3,
  Archive
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Scan {
  id: string
  repoUrl: string
  branch: string
  status: string
  createdAt: string
  completedAt?: string
  repository?: {
    name: string
    owner: string
  }
}

interface HistoryResponse {
  scans: Scan[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function HistoryPage() {
  const { data: session } = authClient.useSession()
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchHistory()
  }, [statusFilter])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '50', offset: '0' })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const data = await apiClient.get<HistoryResponse>(`/history?${params}`)
      setHistory(data)
    } catch (err) {
      setError('Failed to load system records.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'COMPLETED') return <CheckCircle2 className="h-3 w-3 text-lime-400" />
    if (s === 'PROCESSING' || s === 'QUEUED') return <Loader2 className="h-3 w-3 text-white/40 animate-spin" />
    return <AlertCircle className="h-3 w-3 text-red-500" />
  }

  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/)
    return match ? match[1] : url
  }

  if (!session) return null

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Logs</h2>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">Archive History</h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest tabular-nums">
            Total Records: {history?.pagination.total || 0}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mr-2">Filter Protocol:</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-lime-400 outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px bg-white/5 border border-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-black p-8 h-24 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 border border-red-500/20 bg-black text-center space-y-6">
          <AlertCircle className="w-10 h-10 text-red-500/20 mx-auto" />
          <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
          <button 
            onClick={fetchHistory} 
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-lime-400 transition-colors"
          >
            Execute Retry
          </button>
        </div>
      ) : history?.scans.length === 0 ? (
        <div className="py-32 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
          <Archive className="w-10 h-10 text-white/5" />
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20">No Records Indexed</h3>
            <Link href="/dashboard" className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">
              Initialize First Scan
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5">
          {history?.scans.map((scan) => (
            <Link key={scan.id} href={`/dashboard/${scan.id}`} className="group block p-8 bg-black hover:bg-white/[0.02] transition-all relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-lime-400 transition-colors" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-black uppercase tracking-tight text-white group-hover:text-lime-400 transition-colors truncate max-w-md">
                        {extractRepoName(scan.repoUrl)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-3 w-3" />
                        {scan.branch}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-1 border border-white/5 bg-white/[0.01] flex items-center gap-3">
                  {getStatusIcon(scan.status)}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                    {scan.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}