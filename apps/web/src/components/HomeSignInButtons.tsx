'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, LogIn, Sparkles } from 'lucide-react'

export function HeaderSignIn() {
  return (
    <Link href="/auth/signin">
      <Button 
        className="bg-white hover:bg-white/90 text-black font-semibold rounded-full px-6"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign in
      </Button>
    </Link>
  )
}

export function HeroSignIn() {
  return (
    <Link href="/auth/signin">
      <button
        className="group relative h-12 px-8 text-base font-semibold overflow-hidden bg-white text-black transition-all duration-300 hover:bg-white/90 rounded-full flex items-center gap-2"
      >
        <span className="relative flex items-center gap-2">
          Get Started Free
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </Link>
  )
}
