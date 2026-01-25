'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Github, Loader2, Command } from 'lucide-react'
import { toast } from 'sonner'

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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoUrl,
            branch,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create scan')
      }

      const data = await response.json()
      toast.success('Protocol initiated.', {
        description: 'Synchronizing with remote source...',
      })
      
      setRepoUrl('')
      setBranch('main')

      setTimeout(() => {
        router.push(`/dashboard/${data.scanId}`)
      }, 1000)
    } catch (err: any) {
      toast.error('System failure', {
        description: err.message || 'Verification of remote source failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black border border-white/10 p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-white/5 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-12">
        <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
          <Command className="h-5 w-5 text-white/40" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Initialize Archive</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">Remote Index Sync</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="repoUrl" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Source URL</Label>
          <Input
            id="repoUrl"
            type="url"
            placeholder="https://github.com/archive/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="branch" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Archive Branch</Label>
          <Input
            id="branch"
            type="text"
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : (
            'Run Diagnostic'
          )}
        </Button>
      </form>
    </div>
  )
}