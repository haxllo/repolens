'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import OverviewTab from '@/components/scan/OverviewTab'
import DependenciesTab from '@/components/scan/DependenciesTab'
import RiskTab from '@/components/scan/RiskTab'
import FilesTab from '@/components/scan/FilesTab'
import QualityTab from '@/components/scan/QualityTab'
import { VisualizationsTab } from '@/components/scan/VisualizationsTab'
import { 
  ArrowLeft, 
  GitBranch, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Clock3,
  LayoutDashboard,
  Activity,
  Network,
  FileCode,
  ShieldAlert,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface ScanData {
  scanId: string
  status: string
  repoUrl: string
  branch: string
  createdAt: string
  completedAt?: string
  results?: any
  progress?: number
  error?: string
}

export default function ScanDetailPage() {
  const params = useParams()
  const scanId = params.scanId as string
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchScanData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scan/${scanId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch scan data')
      }

      const data = await response.json()
      setScan(data)
      setError('')
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch scan data'
      setError(msg)
      toast.error('Error loading scan', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScanData()

    // Poll every 3 seconds if scan is still processing
    const interval = setInterval(() => {
      if (scan?.status === 'queued' || scan?.status === 'processing') {
        fetchScanData()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [scanId, scan?.status])

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-lime-400" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
      case 'queued':
        return <Clock3 className="h-5 w-5 text-yellow-400" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      default:
        return <Clock3 className="h-5 w-5 text-white/50" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'completed':
        return 'text-lime-400 bg-lime-400/10 border-lime-400/20'
      case 'processing':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'queued':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-white/50 bg-white/5 border-white/10'
    }
  }

  const getRepoName = (url: string) => {
    try {
      return url.replace('https://github.com/', '')
    } catch {
      return url
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32 bg-white/10" /> {/* Back link */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 w-1/2">
              <Skeleton className="h-8 w-3/4 bg-white/10" /> {/* Title */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24 bg-white/5" /> {/* Branch */}
                <Skeleton className="h-4 w-20 bg-white/5" /> {/* ID */}
              </div>
            </div>
            <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" /> {/* Status Badge */}
          </div>
        </div>
        <div className="glass rounded-2xl p-6 h-64">
           <Skeleton className="h-full w-full bg-white/5" />
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="space-y-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error || 'Scan not found'}</span>
          </div>
        </div>
      </div>
    )
  }

  const isProcessing = scan.status === 'queued' || scan.status === 'processing'
  const isCompleted = scan.status === 'completed'
  const isFailed = scan.status === 'failed'

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{getRepoName(scan.repoUrl)}</h1>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" />
                {scan.branch}
              </span>
              <span className="font-mono text-xs">{scan.scanId.slice(0, 8)}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(scan.status)}`}>
            {getStatusIcon(scan.status)}
            {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
            <div>
              <h2 className="font-semibold">Analysis in Progress</h2>
              <p className="text-sm text-white/50">Your repository is being analyzed...</p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={scan.progress || 0} className="h-2 bg-white/5" />
            <p className="text-sm text-white/40">
              {scan.progress ? `${scan.progress}% complete` : 'Starting analysis...'}
            </p>
          </div>
        </div>
      )}

      {/* Failed Status */}
      {isFailed && (
        <div className="glass rounded-2xl p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Analysis Failed</p>
              <p className="text-sm text-red-400/70">{scan.error || 'Unknown error occurred'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Tabs */}
      {isCompleted && scan.results && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass rounded-xl p-1 h-auto flex-wrap gap-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="quality"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Quality
            </TabsTrigger>
            <TabsTrigger 
              value="visualizations"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger 
              value="dependencies"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <Network className="h-4 w-4 mr-2" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger 
              value="risk"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger 
              value="files"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black rounded-lg px-4 py-2 text-sm"
            >
              <FileCode className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab results={scan.results} repoUrl={scan.repoUrl} />
          </TabsContent>

          <TabsContent value="quality" className="mt-6">
            <QualityTab results={scan.results} />
          </TabsContent>

          <TabsContent value="visualizations" className="mt-6">
            <VisualizationsTab scanData={scan.results} />
          </TabsContent>

          <TabsContent value="dependencies" className="mt-6">
            <DependenciesTab results={scan.results} />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskTab results={scan.results} />
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <FilesTab results={scan.results} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
