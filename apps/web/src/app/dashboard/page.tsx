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
    <div className="flex h-[calc(100vh-3rem)] w-full overflow-hidden bg-black text-foreground">
      {/* LEFT PANE: PRIMARY CONTROLS */}
      <div className="w-[320px] flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="h-12 border-b border-white/10 px-6 flex items-center">
          <span className="promote text-primary">Control_Plane_01</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-12">
          <section>
            <div className="mb-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Session_ID</div>
              <div className="font-mono text-[10px] truncate">{userIdentifier}</div>
            </div>
            <ScanForm userId={userIdentifier} />
          </section>
        </div>
      </div>

      {/* RIGHT PANE: MAIN OBSERVABILITY VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* INSTRUMENTATION BAR */}
        <div className="h-12 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex gap-8">
            <Metric label="CPU" value="0.04" unit="%" />
            <Metric label="MEM" value="1.2" unit="GB" />
            <Metric label="SIG" value="STABLE" color="text-primary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-32 bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/20 w-1/3 animate-pulse" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Stream_Active</span>
          </div>
        </div>
        
        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl">
            <div className="mb-8">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-white/10 pb-2 mb-6">Execution_Archive</h2>
              <ScanList userId={userIdentifier} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, unit, color }: { label: string, value: string, unit?: string, color?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className={`font-mono text-xs ${color || "text-foreground"}`}>{value}</span>
        {unit && <span className="font-mono text-[9px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}
