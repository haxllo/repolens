'use client'

import { authClient } from '@/lib/auth-client'
import { redirect, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Layers, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, Suspense } from 'react'

function SignInContent() {
  const { data: session, isPending: loading } = authClient.useSession()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (session) {
      redirect('/dashboard')
    }
  }, [session])

  const getErrorMessage = (error: string) => {
    return error ? 'Authentication protocols failed. Verify credentials and retry.' : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-lime-400/30">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:80px_80px] opacity-[0.03]" />
      
      <div className="relative z-10 max-w-sm w-full space-y-12 px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Layers className="h-6 w-6 text-black" />
            </div>
            <span className="font-black text-2xl uppercase tracking-[0.2em] text-white">RepoLens</span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/30 mb-2">Access Portal</h2>
          <p className="text-[11px] font-medium text-white/20 uppercase tracking-[0.2em]">Secure Architectural Index</p>
        </div>

        {error && (
          <div className="flex items-start gap-4 p-6 bg-black border border-red-500/20 text-red-500 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              <p className="mb-1">Protocol Error</p>
              <p className="opacity-60">{getErrorMessage(error)}</p>
            </div>
          </div>
        )}

        <div className="bg-black border border-white/5 p-10 shadow-2xl relative">
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
          <AuthCard />
        </div>

        <div className="flex flex-col items-center gap-4">
            <p className="text-center text-[9px] text-white/10 uppercase font-black tracking-[0.5em]">
              Encrypted Auth v2.0
            </p>
            <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}