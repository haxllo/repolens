'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, GitBranch, ExternalLink, CheckCircle2, Loader2, AlertCircle, Clock3 } from 'lucide-react'

interface Scan {
  id: string
  repoUrl: string
  branch: string
  status: string
  createdAt: string
  completedAt?: string
  errorMessage?: string
}

export default function ScanList({ userId }: { userId?: string }) {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchScans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/scans?userId=${userId || 'guest'}&limit=20`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch scans')
      }

      const data = await response.json()
      setScans(data.scans || [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScans()

    // Poll every 5 seconds if there are active scans
    const interval = setInterval(() => {
      const hasActiveScans = scans.some(
        (scan) => scan.status === 'QUEUED' || scan.status === 'PROCESSING'
      )
      if (hasActiveScans) {
        fetchScans()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [userId, scans])

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-lime-400" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'queued':
        return <Clock3 className="h-4 w-4 text-yellow-400" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock3 className="h-4 w-4 text-white/50" />
    }
  }

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'queued':
        return 'Queued'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'completed':
        return 'text-lime-400 bg-lime-400/10 border-lime-400/20'
      case 'processing':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'queued':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
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

  const getRepoName = (url: string) => {
    try {
      const parts = url.replace('https://github.com/', '').split('/')
      return parts.slice(0, 2).join('/')
    } catch {
      return url
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <Skeleton className="h-4 w-3/4 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Recent Scans</h2>
          <p className="text-sm text-white/50">
            {scans.length} {scans.length === 1 ? 'scan' : 'scans'} found
          </p>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <GitBranch className="h-8 w-8 text-white/30" />
          </div>
          <p className="text-white/50 mb-2">No scans yet</p>
          <p className="text-sm text-white/30">Create your first scan to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/dashboard/${scan.id}`}
              className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{getRepoName(scan.repoUrl)}</p>
                    <ExternalLink className="h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {scan.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(scan.createdAt)}
                    </span>
                  </div>
                  {scan.errorMessage && (
                    <p className="text-sm text-red-400 mt-2 truncate">{scan.errorMessage}</p>
                  )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(scan.status)}`}>
                  {getStatusIcon(scan.status)}
                  {getStatusText(scan.status)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
