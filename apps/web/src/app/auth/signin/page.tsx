'use client'

import { authClient } from '@/lib/auth-client'
import { redirect, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Zap, AlertCircle } from 'lucide-react'
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
    return error ? 'Authentication failed. Please try again.' : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-lime-400 flex items-center justify-center">
              <Zap className="h-7 w-7 text-black" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm font-medium">
              <p className="font-bold mb-0.5">Authentication Error</p>
              <p className="opacity-80">{getErrorMessage(error)}</p>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl border border-white/10 p-1">
          <div className="bg-[#0a0a0a] rounded-[22px] p-8">
            <AuthCard />
          </div>
        </div>

        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest">
          Secured by Better Auth
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
