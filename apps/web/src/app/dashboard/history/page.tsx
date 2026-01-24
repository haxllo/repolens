'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Clock, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  History,
  ExternalLink,
  AlertCircle,
  Clock3
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
      setError('Failed to load scan history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-lime-400" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'QUEUED':
        return <Clock3 className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock3 className="h-4 w-4 text-white/50" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'text-lime-400 bg-lime-400/10 border-lime-400/20'
      case 'FAILED':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'PROCESSING':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'QUEUED':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default:
        return 'text-white/50 bg-white/5 border-white/10'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/)
    return match ? match[1] : url
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Please sign in to view your scan history</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan History</h1>
          <p className="text-white/50 mt-2">
            {history ? `${history.pagination.total} total scans` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass rounded-lg px-4 py-2 text-sm bg-white/[0.03] border border-white/10 focus:border-lime-400/50 focus:outline-none"
          >
            <option value="all" className="bg-[#0a0a0a]">All Status</option>
            <option value="COMPLETED" className="bg-[#0a0a0a]">Completed</option>
            <option value="PROCESSING" className="bg-[#0a0a0a]">Processing</option>
            <option value="FAILED" className="bg-[#0a0a0a]">Failed</option>
            <option value="QUEUED" className="bg-[#0a0a0a]">Queued</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 bg-white/10" />
                  <Skeleton className="h-4 w-32 bg-white/5" />
                </div>
                <Skeleton className="h-8 w-24 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-white/50 mb-4">{error}</p>
          <Button 
            onClick={fetchHistory} 
            className="bg-lime-400 hover:bg-lime-500 text-black"
          >
            Retry
          </Button>
        </div>
      ) : history?.scans.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium mb-2">No scan history</h3>
          <p className="text-white/40 mb-6">
            Start analyzing repositories to see your scan history here
          </p>
          <Link href="/dashboard">
            <Button className="bg-lime-400 hover:bg-lime-500 text-black">
              Start New Scan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history?.scans.map((scan) => (
            <Link key={scan.id} href={`/dashboard/${scan.id}`}>
              <div className="glass glass-hover rounded-xl p-4 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{extractRepoName(scan.repoUrl)}</span>
                      <ExternalLink className="h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {scan.branch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(scan.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(scan.status)}`}>
                    {getStatusIcon(scan.status)}
                    {scan.status.charAt(0) + scan.status.slice(1).toLowerCase()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
