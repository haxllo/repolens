import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Zap, Shield, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">RepoLens</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/api/auth/signin">
              <Button>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight">
            Understand Any Repository
            <br />
            <span className="text-primary">in Minutes, Not Days</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            RepoLens combines static analysis with AI-powered explanations to give you a complete
            understanding of any codebase through interactive 3D visualizations.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/api/auth/signin">
              <Button size="lg" className="text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg border bg-card">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure Analysis</h3>
              <p className="text-muted-foreground">
                All repositories analyzed in isolated sandboxes with no code execution
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Deep Insights</h3>
              <p className="text-muted-foreground">
                Risk scoring, dependency graphs, and tech debt detection
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Natural language explanations based on deterministic analysis
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
