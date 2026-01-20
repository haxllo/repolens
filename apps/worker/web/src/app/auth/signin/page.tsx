import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to RepoLens</h2>
          <p className="mt-2 text-muted-foreground">
            Analyze your GitHub repositories with AI-powered insights
          </p>
        </div>

        <div className="mt-8">
          <a href="/api/auth/signin/github">
            <Button size="lg" className="w-full">
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
          </a>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
