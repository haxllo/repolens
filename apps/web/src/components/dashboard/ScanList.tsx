'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, GitBranch, ExternalLink, CheckCircle2, Loader2, AlertCircle, Clock3, Archive } from 'lucide-react'
import { toast } from 'sonner'

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
      if (!response.ok) throw new Error('Query failed')
      const data = await response.json()
      setScans(data.scans || [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScans()
    const interval = setInterval(() => {
      if (scans.some(s => s.status === 'QUEUED' || s.status === 'PROCESSING')) {
        fetchScans()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [userId, scans])

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed') return <CheckCircle2 className="h-3 w-3 text-lime-400" />
    if (s === 'processing') return <Loader2 className="h-3 w-3 text-white/40 animate-spin" />
    if (s === 'failed') return <AlertCircle className="h-3 w-3 text-red-500" />
    return <Clock3 className="h-3 w-3 text-white/20" />
  }

  const getRepoName = (url: string) => {
    try {
      return url.replace('https://github.com/', '').split('/').slice(0, 2).join('/')
    } catch {
      return url
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Records</h2>
          <div className="text-2xl font-black uppercase tracking-tighter text-white mt-1">Archive History</div>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest tabular-nums">
          Records: {scans.length}
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="py-24 border border-dashed border-white/10 flex flex-col items-center justify-center">
          <Archive className="w-8 h-8 text-white/5 mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">No Data Indexed</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5">
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/dashboard/${scan.id}`}
              className="group block p-8 bg-black hover:bg-white/[0.02] transition-all relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-lime-400 transition-colors" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-black uppercase tracking-tight text-white group-hover:text-lime-400 transition-colors truncate max-w-md">
                        {getRepoName(scan.repoUrl)}
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

                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <div className={`flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 bg-white/[0.02]`}>
                        {getStatusIcon(scan.status)}
                        {scan.status}
                      </div>
                   </div>
                </div>
              </div>
              {scan.errorMessage && (
                <div className="mt-4 ml-10 p-3 bg-red-500/5 border border-red-500/10 text-[10px] font-mono text-red-400 uppercase tracking-widest">
                  ERR: {scan.errorMessage}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}