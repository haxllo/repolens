'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github, ArrowRight } from 'lucide-react'

export function HeaderSignIn() {
  return (
    <Button 
      onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      className="bg-lime-400 hover:bg-lime-500 text-black font-medium"
    >
      <Github className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  )
}

export function HeroSignIn() {
  return (
    <button
      onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      className="group relative h-12 px-8 text-base font-semibold overflow-hidden bg-transparent border-2 border-lime-400 text-lime-400 transition-all duration-300 hover:text-black"
    >
      <span className="absolute inset-0 bg-lime-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
      <span className="relative flex items-center gap-2">
        Get Started Free
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </button>
  )
}
