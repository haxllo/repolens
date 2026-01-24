'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, ArrowRight, LogIn } from 'lucide-react'

export function HeaderSignIn() {
  return (
    <Link href="/auth/signin">
      <Button 
        className="bg-lime-400 hover:bg-lime-500 text-black font-medium"
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
        className="group relative h-12 px-8 text-base font-semibold overflow-hidden bg-transparent border-2 border-lime-400 text-lime-400 transition-all duration-300 hover:text-black rounded-lg"
      >
        <span className="absolute inset-0 bg-lime-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
        <span className="relative flex items-center gap-2">
          Get Started Free
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </Link>
  )
}
