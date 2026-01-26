'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, AlertCircle, Clock3, ExternalLink, ShieldCheck, ChevronRight, Terminal, Search, Filter, Database, Code } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HUDCard } from '@/components/ui/HUDCard'
import { motion, AnimatePresence } from 'framer-motion'

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

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed') return { color: 'text-lime-400', bg: 'bg-lime-400', label: 'SUCCESS' }
    if (s === 'failed') return { color: 'text-red-500', bg: 'bg-red-500', label: 'FAILURE' }
    if (s === 'processing') return { color: 'text-white', bg: 'bg-white', label: 'ANALYZING' }
    return { color: 'text-white/40', bg: 'bg-white/40', label: 'QUEUED' }
  }

  const filteredScans = scans.filter(s => 
    s.repoUrl.toLowerCase().includes(query.toLowerCase()) || 
    s.id.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <HUDCard 
      className="h-full border-white/5" 
      noPadding 
      title="System_Archive_Records"
      action={
        <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest tabular-nums">{scans.length}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-lime-400" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest tabular-nums">{scans.filter(s => s.status === 'PROCESSING').length}</span>
            </div>
        </div>
      }
    >
      {/* Enhanced Toolbar */}
      <div className="p-6 border-b border-white/5 flex items-center gap-6 bg-white/[0.01]">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-lime-400 text-white/20">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search records by source or ID..."
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-black border border-white/10 pl-12 pr-4 text-[11px] font-mono text-white placeholder:text-white/10 uppercase tracking-widest focus:border-lime-400/50 focus:bg-white/[0.02] outline-none transition-all"
          />
        </div>
        <button className="h-12 px-6 border border-white/10 hover:border-white/30 hover:bg-white/[0.05] flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all">
          <Filter className="w-3.5 h-3.5" />
          Protocol_Filter
        </button>
      </div>

      {/* Grid Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
            <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Index</th>
                    <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Source_Repository</th>
                    <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Status</th>
                    <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Timestamp</th>
                    <th className="px-8 py-4 text-right text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                    <tr>
                        <td colSpan={5} className="p-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-white/10">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em] animate-pulse">Syncing_Records</span>
                            </div>
                        </td>
                    </tr>
                    ) : filteredScans.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-white/5">
                                <Terminal className="w-12 h-12" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Registry_Empty</span>
                            </div>
                        </td>
                    </tr>
                    ) : (
                    filteredScans.map((scan, idx) => {
                        const status = getStatusConfig(scan.status)
                        return (
                        <motion.tr 
                            key={scan.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-white/[0.02] transition-colors"
                        >
                            <td className="px-8 py-6">
                                <span className="text-[10px] font-mono text-white/20 uppercase tabular-nums">
                                    # {scan.id.slice(0, 8)}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[13px] font-black text-white group-hover:text-lime-400 transition-colors tracking-tight uppercase">
                                        {scan.repoUrl.replace('https://github.com/', '')}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <Code className="w-3 h-3 text-white/10" />
                                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-widest">{scan.branch}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className={cn("inline-flex items-center gap-3 px-3 py-1 border border-white/5 bg-white/[0.01]", status.color)}>
                                    <div className={cn("w-1 h-1 rounded-none", status.bg, scan.status === 'PROCESSING' && "animate-pulse")} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                        {status.label}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-white/40 tabular-nums">
                                        {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                    </span>
                                    <span className="text-[8px] font-mono text-white/20 tabular-nums">
                                        {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <Link 
                                    href={`/dashboard/${scan.id}`}
                                    className="inline-flex items-center gap-3 px-5 py-2 border border-white/10 hover:border-lime-400 hover:bg-lime-400 text-white/40 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest group/link"
                                >
                                    Access
                                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </td>
                        </motion.tr>
                        )
                    })
                    )}
                </AnimatePresence>
            </tbody>
        </table>
      </div>

      {/* Technical Footer */}
      <div className="p-6 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
        <div className="flex gap-8">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Verified_Registry</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white/20" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">System_Idle</span>
            </div>
        </div>
        <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">RepoLens_Vault_V2.0</span>
      </div>
    </HUDCard>
  )
}
