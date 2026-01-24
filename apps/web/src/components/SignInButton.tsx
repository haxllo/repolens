'use client'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { toast } from 'sonner'

export function SignInButton() {
  const handleSignIn = async () => {
    console.log('Initiating GitHub sign in...');
    try {
      const res = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard'
      });
      console.log('Sign in result:', res);
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in with GitHub: ' + (error.message || 'Unknown error'));
    }
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
