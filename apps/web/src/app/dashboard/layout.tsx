import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardBackground } from '@/components/dashboard/DashboardBackground'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      <DashboardBackground />
      
      {/* Sidebar (Client Component) */}
      <Sidebar user={session.user} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
