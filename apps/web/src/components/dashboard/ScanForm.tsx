'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Github, Loader2, GitBranch, ArrowRight, Shield, Globe, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { HUDCard } from '@/components/ui/HUDCard'
import { motion, AnimatePresence } from 'framer-motion'

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
      toast.success('PROTOCOL INITIATED', {
        description: `Target established: ${repoUrl}`,
      })
      
      setRepoUrl('')
      setBranch('main')

      setTimeout(() => {
        router.push(`/dashboard/${data.scanId}`)
      }, 1000)
    } catch (err: any) {
      toast.error('CONNECTION_REJECTED', {
        description: err.message || 'Verification failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <HUDCard 
      className="h-full border-white/5" 
      title="Protocol_Initialization"
      action={
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5">
          <div className="w-1.5 h-1.5 rounded-none bg-lime-400 animate-pulse" />
          <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">Auth_Verified</span>
        </div>
      }
    >
      <div className="mb-10 flex gap-12">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Stage_01</span>
            <span className="text-[14px] font-black text-white uppercase tracking-tighter">Connection</span>
        </div>
        <div className="h-10 w-px bg-white/5" />
        <div className="flex flex-col gap-2 opacity-30">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Stage_02</span>
            <span className="text-[14px] font-black text-white uppercase tracking-tighter">Diagnostic</span>
        </div>
        <div className="h-10 w-px bg-white/5" />
        <div className="flex flex-col gap-2 opacity-30">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Stage_03</span>
            <span className="text-[14px] font-black text-white uppercase tracking-tighter">Archive</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* URL Input Group */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <Label htmlFor="repoUrl" className="text-[9px] uppercase font-black tracking-[0.3em] text-white/40">
              Source_URL
            </Label>
            <span className="text-[8px] font-mono text-white/10 uppercase">HTTPS_REQUIRED</span>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-white/10 bg-white/[0.01] group-focus-within:border-lime-400/50 transition-colors">
              <Github className="w-4 h-4 text-white/20 group-focus-within:text-lime-400 transition-colors" />
            </div>
            <Input
              id="repoUrl"
              type="url"
              placeholder="github.com/org/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              disabled={loading}
              className="h-14 bg-white/[0.01] border-white/10 text-white font-mono text-sm focus:border-lime-400/50 focus:ring-0 rounded-none pl-16 pr-6 transition-all placeholder:text-white/5"
            />
          </div>
        </div>

        {/* Branch Input Group */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <Label htmlFor="branch" className="text-[9px] uppercase font-black tracking-[0.3em] text-white/40">
              Branch_Ref
            </Label>
            <span className="text-[8px] font-mono text-white/10 uppercase">Default: main</span>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-white/10 bg-white/[0.01] group-focus-within:border-lime-400/50 transition-colors">
              <GitBranch className="w-4 h-4 text-white/20 group-focus-within:text-lime-400 transition-colors" />
            </div>
            <Input
              id="branch"
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={loading}
              className="h-14 bg-white/[0.01] border-white/10 text-white font-mono text-sm focus:border-lime-400/50 focus:ring-0 rounded-none pl-16 pr-6 transition-all placeholder:text-white/5"
            />
          </div>
        </div>

        {/* Security / Quality Flags */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-white/5 bg-white/[0.01] flex items-center gap-3 grayscale opacity-40">
                <Shield className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Isolated_ENV</span>
            </div>
            <div className="p-4 border border-white/5 bg-white/[0.01] flex items-center gap-3 grayscale opacity-40">
                <Terminal className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">AST_Parsing</span>
            </div>
        </div>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-white text-black hover:bg-lime-400 hover:text-black rounded-none border-0 uppercase font-black tracking-[0.4em] text-[11px] transition-all relative overflow-hidden group shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]"
            >
                <div className="relative flex items-center justify-center gap-4">
                {loading ? (
                    <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="animate-pulse">Handshaking...</span>
                    </>
                ) : (
                    <>
                    Initiate_Diagnostic
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
                    </>
                )}
                </div>
            </Button>
        </motion.div>

        {/* Technical Footer */}
        <div className="flex justify-between items-center px-2 pt-4 border-t border-white/5">
            <div className="flex flex-col">
                <span className="text-[7px] font-mono text-white/20 uppercase mb-1">Compute_Load</span>
                <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-1/2 bg-lime-400" 
                    />
                </div>
            </div>
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">Ready_For_Input</span>
        </div>
      </form>
    </HUDCard>
  )
}