'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Github, Loader2, ArrowRight } from 'lucide-react'
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
      toast.success('Scan created successfully!', {
        description: 'Redirecting to analysis dashboard...',
      })
      
      setRepoUrl('')
      setBranch('main')

      // Redirect to scan detail page
      setTimeout(() => {
        router.push(`/dashboard/${data.scanId}`)
      }, 1000)
    } catch (err: any) {
      toast.error('Failed to create scan', {
        description: err.message || 'Please check the URL and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
          <Github className="h-5 w-5 text-lime-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Analyze Repository</h2>
          <p className="text-sm text-white/50">Enter a GitHub URL to start</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repoUrl" className="text-sm text-white/70">Repository URL</Label>
          <Input
            id="repoUrl"
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={loading}
            className="bg-white/[0.03] border-white/10 focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-white/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch" className="text-sm text-white/70">Branch</Label>
          <Input
            id="branch"
            type="text"
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
            className="bg-white/[0.03] border-white/10 focus:border-lime-400/50 focus:ring-lime-400/20 placeholder:text-white/30"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold h-11" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Repository
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
