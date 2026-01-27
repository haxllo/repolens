'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function ScanForm({ userId }: { userId?: string }) {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl, branch }),
        }
      )

      if (!response.ok) throw new Error('Failed to create scan')
      const data = await response.json()
      
      setRepoUrl('')
      router.push(`/dashboard/${data.scanId}`)
      
    } catch (err: any) {
      toast.error('FAILURE_DETECTED', { 
        description: err.message,
        className: 'font-mono text-[10px]'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* TARGET CONFIG */}
      <div className="space-y-6">
        <div className="promote">01_Source_Intake</div>
        
        <div className="space-y-2">
          <label htmlFor="repoUrl" className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Repository_URL
          </label>
          <Input
            id="repoUrl"
            type="url"
            placeholder="GITHUB.COM/OWNER/REPO"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={loading}
            className="font-mono text-xs placeholder:text-white/10 uppercase"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="branch" className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Reference_Point
          </label>
          <Input
            id="branch"
            type="text"
            placeholder="MAIN"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
            className="font-mono text-xs placeholder:text-white/10 uppercase"
          />
        </div>
      </div>

      {/* ADVANCED PARAMETERS (SUPPRESSED) */}
      <div className="space-y-6 suppress">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-1">
          02_Expert_Override
        </div>
        
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-1">
              <label className="font-mono text-[8px] uppercase text-muted-foreground">Depth</label>
              <div className="text-[10px] font-mono">PARALLEL_MAX</div>
           </div>
           <div className="space-y-1">
              <label className="font-mono text-[8px] uppercase text-muted-foreground">Sandbox</label>
              <div className="text-[10px] font-mono">ISOLATED_V8</div>
           </div>
        </div>
      </div>

      {/* EXECUTION TRIGGER */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={loading || !repoUrl} 
          className="w-full h-12 flex justify-between px-4 group"
        >
          <span className="font-mono text-xs tracking-[0.2em]">
            {loading ? 'INITIALIZING...' : 'EXECUTE_SEQUENCE'}
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

