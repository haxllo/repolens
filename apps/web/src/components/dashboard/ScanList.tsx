'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Activity, Terminal, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Scan {
  id: string
  repoUrl: string
  branch: string
  status: string
  createdAt: string
}

export default function ScanList({ userId }: { userId?: string }) {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/scans?userId=${userId || 'guest'}&limit=10`
      )
      if (response.ok) {
        const data = await response.json()
        setScans(data.scans || [])
      }
    } catch (err) {
      console.error('Failed to fetch scans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScans()
    const interval = setInterval(() => {
      if (scans.some(s => ['queued', 'processing'].includes(s.status.toLowerCase()))) {
        fetchScans()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [userId, scans])

  return (
    <div className="w-full">
      {loading ? (
        <div className="py-12 flex flex-col items-center gap-4 suppress">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Polling_Archive...</span>
        </div>
      ) : scans.length === 0 ? (
        <div className="py-12 border border-dashed border-white/5 flex flex-col items-center gap-4 suppress">
          <Terminal className="w-4 h-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">No_History_Found</span>
        </div>
      ) : (
        <div className="border border-white/10 divide-y divide-white/10">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[1fr_120px_100px_40px] px-4 py-2 bg-white/[0.02] font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <div>Repository_Source</div>
            <div>Status</div>
            <div>Timestamp</div>
            <div />
          </div>

          {scans.map((scan) => (
            <div 
              key={scan.id} 
              className="grid grid-cols-[1fr_120px_100px_40px] items-center px-4 py-3 hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-mono text-xs truncate">
                  {scan.repoUrl.replace('https://github.com/', '')}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground suppress">
                  REF: {scan.branch}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <StatusIndicator status={scan.status} />
              </div>

              <div className="font-mono text-[10px] text-muted-foreground">
                {new Date(scan.createdAt).toLocaleDateString(undefined, {
                  month: '2-digit',
                  day: '2-digit',
                  year: '2-digit'
                })}
              </div>

              <Link href={`/dashboard/${scan.id}`} className="flex justify-end">
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const s = status.toLowerCase()
  
  const config = {
    completed: { icon: Circle, color: "text-foreground", fill: "fill-foreground" },
    failed: { icon: Circle, color: "text-muted-foreground/30", fill: "" },
    processing: { icon: Circle, color: "text-primary animate-pulse", fill: "fill-primary" },
    queued: { icon: Circle, color: "text-muted-foreground", fill: "" },
  }[s] || { icon: Circle, color: "text-muted-foreground", fill: "" }

  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-2 h-2 ${config.color} ${config.fill}`} />
      <span className="font-mono text-[10px] uppercase tracking-widest truncate">{s}</span>
    </div>
  )
}

