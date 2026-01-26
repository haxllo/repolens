import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ScanForm from '@/components/dashboard/ScanForm'
import ScanList from '@/components/dashboard/ScanList'
import { Activity, Database, Server, Cpu, Box, Shield, Zap, Globe } from 'lucide-react'
import { HUDCard } from '@/components/ui/HUDCard'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userIdentifier = session?.user.id || session?.user.email

  const metrics = [
    { label: 'System_Runtime', value: 'Active', sub: '99.9% Uptime', icon: Server, color: 'text-lime-400', glow: 'bg-lime-400' },
    { label: 'Total_Archives', value: '1,284', sub: '+12 This Week', icon: Database, color: 'text-white', glow: 'bg-white/20' },
    { label: 'Node_Performance', value: 'Optimum', sub: '42ms Latency', icon: Activity, color: 'text-white', glow: 'bg-white/20' },
    { label: 'Compute_Load', value: 'Low', sub: '14% Utilization', icon: Cpu, color: 'text-white', glow: 'bg-white/20' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-10 border-b border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] font-black text-lime-400 tracking-[0.4em] uppercase">Executive_Dashboard</span>
            <div className="h-px w-24 bg-lime-400/20" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85]">
            Command <br />
            <span className="text-white/20 italic">Center.</span>
          </h1>
        </div>

        <div className="flex items-center gap-8 relative z-10 pb-2">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Session_Ref</span>
                <span className="text-[12px] font-black text-white uppercase tracking-widest bg-white/5 px-4 py-2 border border-white/10 tabular-nums">
                    {userIdentifier?.slice(0, 12)}
                </span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Sync_Status</span>
                <div className="flex items-center gap-2 px-4 py-2 border border-lime-400/20 bg-lime-400/5">
                    <div className="w-1.5 h-1.5 rounded-none bg-lime-400 animate-pulse" />
                    <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Live</span>
                </div>
            </div>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Globe className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
            <HUDCard key={i} className="border-white/5 group hover:bg-white/[0.02] transition-all" noPadding>
                <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-lime-400 transition-colors duration-500">
                            <metric.icon className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                        </div>
                        <div className={`w-2 h-2 ${metric.glow} ${i === 0 ? 'shadow-[0_0_10px_#a3e635] animate-pulse' : ''}`} />
                    </div>
                    <div className="space-y-1">
                        <div className={`text-3xl font-black tracking-tighter ${metric.color} uppercase`}>{metric.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{metric.label}</div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-white/20 uppercase">{metric.sub}</span>
                        <Zap className="w-3 h-3 text-white/10" />
                    </div>
                </div>
            </HUDCard>
        ))}
      </div>

      {/* Main Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
        {/* Left Column: Input & Protocols */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <ScanForm userId={userIdentifier} />
          
          {/* Protocol Integrity Card */}
          <HUDCard title="System_Security_Protocols" className="border-white/5 bg-white/[0.01]">
            <div className="space-y-6">
                {[
                    { label: 'Sandbox_Isolation', status: 'Active', icon: Shield },
                    { label: 'Neural_Handshake', status: 'Secured', icon: Zap },
                    { label: 'Data_Encryption', status: 'AES-256', icon: Box },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-white/5 bg-black">
                        <div className="flex items-center gap-4">
                            <item.icon className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-mono text-lime-400 uppercase tracking-widest">{item.status}</span>
                    </div>
                ))}
            </div>
          </HUDCard>
        </div>

        {/* Right Column: Data Feed */}
        <div className="lg:col-span-8 h-full">
          <ScanList userId={userIdentifier} />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-20 pb-10 flex flex-col items-center justify-center gap-6 opacity-30">
        <div className="flex items-center gap-4">
            <div className="h-px w-32 bg-white/20" />
            <div className="w-6 h-6 border border-white flex items-center justify-center">
                <Layers className="w-3 h-3 text-white" />
            </div>
            <div className="h-px w-32 bg-white/20" />
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[1em] text-white">REPOLENS_SYSTEMS_2026</div>
      </div>
    </div>
  )
}