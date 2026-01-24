import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ScanForm from '@/components/dashboard/ScanForm'
import ScanList from '@/components/dashboard/ScanList'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userIdentifier = session?.user.id || session?.user.email

  return (
    <div className="space-y-24 max-w-6xl mx-auto">
      {/* System Header */}
      <div className="border-b border-white/5 pb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">Command Center</h2>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">Console</h1>
        <p className="mt-6 text-sm font-medium uppercase tracking-widest text-white/30">Architectural analysis and repository indexing protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Initialization Module */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-8">
            <div className="flex items-center gap-4 text-lime-400">
              <div className="w-8 h-px bg-lime-400/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Scan</span>
            </div>
            <ScanForm userId={userIdentifier} />
          </div>
        </div>

        {/* Records Module */}
        <div className="lg:col-span-7">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-white/20">
              <div className="w-8 h-px bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Recent Activity</span>
            </div>
            <ScanList userId={userIdentifier} />
          </div>
        </div>
      </div>
    </div>
  )
}