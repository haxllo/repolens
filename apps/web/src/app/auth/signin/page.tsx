import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignInButton } from '@/components/SignInButton'
import { Zap } from 'lucide-react'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-lime-400 flex items-center justify-center">
              <Zap className="h-7 w-7 text-black" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Sign in to RepoLens</h2>
          <p className="text-white/50">
            Analyze your GitHub repositories with AI-powered insights
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <SignInButton />
        </div>

        <p className="text-center text-sm text-white/30">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
