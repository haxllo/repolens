'use client'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function SignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dashboard'
    })
  }

  return (
    <Button
      size="lg"
      className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold h-12"
      onClick={handleSignIn}
    >
      <Github className="mr-2 h-5 w-5" />
      Continue with GitHub
    </Button>
  )
}
