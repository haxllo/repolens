'use client'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Github, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function HeaderSignIn() {
  const handleSignIn = async () => {
    console.log('Initiating Header GitHub sign in...');
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard'
      })
    } catch (error: any) {
      console.error('Header Sign in error:', error);
      toast.error('Failed to sign in: ' + (error.message || 'Unknown error'))
    }
  }

  return (
    <Button 
      onClick={handleSignIn}
      className="bg-lime-400 hover:bg-lime-500 text-black font-medium"
    >
      <Github className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  )
}

export function HeroSignIn() {
  const handleSignIn = async () => {
    console.log('Initiating Hero GitHub sign in...');
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard'
      })
    } catch (error: any) {
      console.error('Hero Sign in error:', error);
      toast.error('Failed to sign in: ' + (error.message || 'Unknown error'))
    }
  }

  return (
    <button
      onClick={handleSignIn}
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
