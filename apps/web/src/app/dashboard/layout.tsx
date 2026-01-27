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
    <div className="min-h-screen bg-black flex flex-col relative selection:bg-primary selection:text-white">
      {/* FIXED TOP NAV */}
      <TopNav user={session.user} />

      {/* MAIN PANE */}
      <main className="flex-1 min-w-0 pt-12 overflow-hidden">
        {children}
      </main>

      {/* SYSTEM PERIMETER */}
      <div className="fixed inset-y-0 left-0 w-[1px] bg-white/5 pointer-events-none" />
      <div className="fixed inset-y-0 right-0 w-[1px] bg-white/5 pointer-events-none" />
      <div className="fixed inset-x-0 bottom-0 h-[1px] bg-white/5 pointer-events-none" />
    </div>
  )
}
