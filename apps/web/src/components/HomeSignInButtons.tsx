'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, LogIn } from 'lucide-react'

export function HeaderSignIn() {
  return (
    <Link href="/auth/signin">
      <button 
        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
      >
        Sign in
      </button>
    </Link>
  )
}

export function HeroSignIn() {
  return (
    <Link href="/auth/signin">
      <button
        className="group relative h-16 px-12 text-[11px] font-black uppercase tracking-[0.4em] overflow-hidden bg-white text-black transition-all duration-500 hover:bg-lime-400 active:scale-95 flex items-center gap-4"
      >
        Execute System Sync
        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
      </button>
    </Link>
  )
}