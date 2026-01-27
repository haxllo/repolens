'use client'

import { authClient } from '@/lib/auth-client'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Github, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default function SignInPage() {
  const { data: session, isPending } = authClient.useSession()

  if (session) {
    redirect('/dashboard')
  }

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard"
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-foreground selection:bg-primary selection:text-white">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ed4b0010,transparent_50%)]" />
      </div>

      <div className="max-w-[320px] w-full space-y-12 relative">
        <div className="flex flex-col items-center gap-6">
          <Image src="/LOGO.svg" alt="RepoLens" width={32} height={40} className="opacity-80" />
          <div className="space-y-2 text-center">
            <h1 className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">System_Authorization</h1>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
              Verify credentials to access the architectural diagnostic console.
            </p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        <div className="space-y-4">
          <Button 
            onClick={handleSignIn}
            disabled={isPending}
            className="w-full h-12 flex justify-between px-4 group"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {isPending ? 'Verifying...' : 'Authenticate_Github'}
            </span>
            <Github className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3 justify-center suppress">
            <ShieldCheck className="w-3 h-3 text-primary" />
            <span className="font-mono text-[8px] uppercase tracking-widest">Encrypted_Endpoint_Active</span>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5">
           <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground text-center leading-loose">
            By proceeding, you agree to comply with<br/>
            the [Security_Protocol] and [Data_Policy].
           </p>
        </div>
      </div>

      {/* FOOTER METADATA */}
      <footer className="fixed bottom-0 w-full h-12 px-6 flex items-center justify-between border-t border-white/5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
        <span>Region: Global_Buffer</span>
        <span>Secure_Node: 0x42f9</span>
      </footer>
    </div>
  )
}