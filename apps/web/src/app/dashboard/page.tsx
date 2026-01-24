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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/50">Analyze repositories and view insights</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Scan Form */}
        <div className="xl:col-span-1">
          <ScanForm userId={userIdentifier} />
        </div>

        {/* Scan List */}
        <div className="xl:col-span-2">
          <ScanList userId={userIdentifier} />
        </div>
      </div>
    </div>
  )
}
