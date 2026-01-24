import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/dashboard/TopNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative selection:bg-lime-400/30">
      {/* Top Navigator (Floating) */}
      <TopNav user={session.user} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 pt-32 px-12 pb-32">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Aesthetic Border Accents */}
      <div className="fixed inset-y-0 left-0 w-px bg-white/5 pointer-events-none" />
      <div className="fixed inset-y-0 right-0 w-px bg-white/5 pointer-events-none" />
    </div>
  )
}