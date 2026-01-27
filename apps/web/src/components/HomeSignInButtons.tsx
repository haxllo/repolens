'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeaderSignIn() {
  return (
    <Link href="/auth/signin" className="inline-flex items-center">
      <span 
        className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer"
      >
        Sign in
      </span>
    </Link>
  )
}

export function HeroSignIn() {
  return (
    <Link href="/auth/signin">
      <Button
        size="lg"
        className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.4em] gap-4"
      >
        Execute System Sync
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  )
}