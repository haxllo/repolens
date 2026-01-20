'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function SignInButton() {
  return (
    <Button
      size="lg"
      className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold h-12"
      onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
    >
      <Github className="mr-2 h-5 w-5" />
      Continue with GitHub
    </Button>
  )
}
