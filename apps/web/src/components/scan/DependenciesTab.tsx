'use client'

import { useState } from 'react'
import { Package, GitBranch, FileCode, Search } from 'lucide-react'
import DependencyGraph3D from '@/components/graphs/DependencyGraph3D'
import GraphControls, { GraphFilters } from '@/components/graphs/GraphControls'
import { useGraphData, GraphNode } from '@/hooks/useGraphData'

interface DependenciesTabProps {
  results: any
}

export default function DependenciesTab({ results }: DependenciesTabProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [filters, setFilters] = useState<GraphFilters>({ searchTerm: '', selectedLanguages: [] })

  const dependencies = results?.dependencies || {}
  const graphData = useGraphData(dependencies)

  const filteredGraphData = {
    nodes: graphData.nodes.filter((node) => {
      const matchesSearch =
        node.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesLanguage =
        filters.selectedLanguages.length === 0 || filters.selectedLanguages.includes(node.group)
      return matchesSearch && matchesLanguage
    }),
    links: graphData.links,
  }

  const languages = Array.from(new Set(graphData.nodes.map((n) => n.group)))

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cinematic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Files', value: graphData.nodes.length, icon: FileCode, color: 'text-lime-400', bg: 'bg-lime-400/5' },
          { label: 'Dependencies', value: graphData.links.length, icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-400/5' },
          { label: 'Languages', value: languages.length, icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/5' },
        ].map((stat, idx) => (
          <div key={idx} className="relative group overflow-hidden">
            <div className={`absolute inset-0 ${stat.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative glass p-6 border-white/5 group-hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{stat.label}</span>
              </div>
              <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="glass p-6 border-white/5 space-y-6">
            <GraphControls languages={languages} onFilterChange={setFilters} />
          </div>

          {selectedNode && (
            <div className="glass p-6 border-lime-400/20 bg-lime-400/[0.02] animate-in slide-in-from-left duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(162,228,53,0.8)]" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Node Inspection</h4>
              </div>
              
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Identifier</p>
                  <p className="text-sm font-mono text-lime-400 truncate bg-black/40 p-2 rounded border border-white/5">
                    {selectedNode.name}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Type</p>
                    <span className="inline-block px-2 py-1 text-[10px] font-bold bg-white/5 text-white/70 rounded uppercase border border-white/5">
                      {selectedNode.group}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Impact Score</p>
                    <p className="text-xl font-bold">{selectedNode.size}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-9">
          <div className="relative glass h-[650px] border-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10" />
            <DependencyGraph3D data={filteredGraphData} onNodeClick={handleNodeClick} />
            
            {/* View HUD */}
            <div className="absolute top-6 right-6 z-20 flex gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="glass px-3 py-1.5 border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                3D Force-Directed Mode
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Dependencies */}
      {dependencies.packages && dependencies.packages.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-4">External Dependencies</h3>
          <div className="space-y-2">
            {dependencies.packages.map((pkg: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div>
                  <code className="text-sm font-mono text-lime-400">{pkg.name}</code>
                  {pkg.description && (
                    <p className="text-xs text-white/40 mt-1">{pkg.description}</p>
                  )}
                </div>
                {pkg.version && (
                  <span className="text-xs px-2 py-1 bg-white/10 text-white/60">{pkg.version}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
