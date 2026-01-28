'use client'

import Link from 'next/link'
import Image from 'next/image'
import { authClient } from '@/lib/auth-client'
import { HeaderSignIn, HeroSignIn } from '@/components/HomeSignInButtons'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="flex min-h-screen flex-col bg-black text-foreground selection:bg-primary selection:text-white">
      {/* GLOBAL STATUS BAR */}
      <header className="w-full border-b border-white/10 px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="RepoLens" width={16} height={20} className="opacity-80" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">RepoLens // System_Online</span>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/docs" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors inline-flex items-center">Documentation</Link>
          {!isPending && (
            <>
              {session ? (
                <Link href="/dashboard" className="inline-flex items-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline cursor-pointer">Enter_Console [→]</span>
                </Link>
              ) : (
                <HeaderSignIn />
              )}
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-start justify-center px-6 md:px-24 py-24 max-w-7xl mx-auto w-full">
        <div className="space-y-12 w-full">
          {/* PRIMARY INTENT */}
          <div className="space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Architectural Diagnostic Engine</div>
            <h1 className="text-4xl md:text-7xl font-light tracking-tighter leading-none max-w-4xl">
              Precision indexing for <span className="text-primary italic">complex</span> software systems.
            </h1>
          </div>

          <div className="w-full h-[1px] bg-white/10" />

          {/* SECONDARY SPECS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
            <Spec 
              id="01" 
              label="Intake" 
              desc="Deep AST parsing and symbolic indexing for multi-language repositories." 
            />
            <Spec 
              id="02" 
              label="Process" 
              desc="Isolated sandbox execution for architectural verification and logic mapping." 
            />
            <Spec 
              id="03" 
              label="Output" 
              desc="Structured knowledge synthesis via high-dimensional thinking models." 
            />
          </div>

          <div className="pt-12">
            {!isPending && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="default" className="h-12 px-12 text-sm font-mono tracking-widest">
                      INITIALIZE_DASHBOARD
                    </Button>
                  </Link>
                ) : (
                  <HeroSignIn />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER METADATA */}
      <footer className="border-t border-white/10 px-6 h-16 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex gap-12">
          <span>v2.0.4-LTS</span>
          <span>Status: Optimal</span>
          <span>Buffer: 1024GB</span>
        </div>
        <div>
          © 2026 REPOLENS // ARCHITECTURAL_ARCHIVE
        </div>
      </footer>
    </div>
  )
}

function Spec({ id, label, desc }: { id: string, label: string, desc: string }) {
  return (
    <div className="space-y-4 group">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[10px] text-primary">{id}</span>
        <h3 className="font-mono text-xs uppercase tracking-widest">{label}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
        {desc}
      </p>
    </div>
  )
}
