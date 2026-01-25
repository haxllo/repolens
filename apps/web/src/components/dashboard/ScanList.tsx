'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, AlertCircle, Clock3, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [query, setSearchQuery] = useState('')

  const fetchScans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/scans?userId=${userId || 'guest'}&limit=50`
      )
      if (!response.ok) throw new Error('Query failed')
      const data = await response.json()
      setScans(data.scans || [])
    } catch (err) {
      console.error('Record sync failed')
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

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed') return 'text-lime-400'
    if (s === 'failed') return 'text-red-500'
    return 'text-white/40 animate-pulse'
  }

  const filteredScans = scans.filter(s => 
    s.repoUrl.toLowerCase().includes(query.toLowerCase()) || 
    s.id.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return (
    <div className="space-y-4 border border-white/5 bg-black p-8">
      <div className="h-4 w-1/4 bg-white/5 animate-pulse" />
      <div className="h-32 w-full bg-white/5 animate-pulse" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Search / Filter Protocol */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Query Archive by Source or Index ID..."
          value={query}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 bg-black border border-white/10 rounded-none px-4 text-[10px] font-mono uppercase tracking-widest focus:border-white/30 outline-none transition-colors"
        />
      </div>

      <div className="border border-white/10 bg-black overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Index_ID</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Remote_Source</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Protocol_Status</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Timestamp</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Entry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredScans.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">No matching records found in system core</span>
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => (
                <tr key={scan.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter tabular-nums">
                      {scan.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-black uppercase tracking-tight text-white group-hover:text-lime-400 transition-colors">
                        {scan.repoUrl.replace('https://github.com/', '')}
                      </span>
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                        branch: {scan.branch}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2", getStatusStyle(scan.status))}>
                      <div className={cn("w-1 h-1 rounded-none", scan.status.toLowerCase() === 'completed' ? 'bg-lime-400' : 'bg-current')} />
                      {scan.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-white/20 uppercase tabular-nums">
                      {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/dashboard/${scan.id}`}
                      className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 hover:border-lime-400/50 hover:bg-lime-400/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                    >
                      Access
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.4em]">Core Archive v2.0 // System_Records</span>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-lime-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Verified</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/10" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Idle</span>
           </div>
        </div>
      </div>
    </div>
  )
}
