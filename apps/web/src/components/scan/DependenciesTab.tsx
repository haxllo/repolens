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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileCode className="w-5 h-5 text-lime-400" />
            <span className="text-sm text-white/50">Total Files</span>
          </div>
          <p className="text-3xl font-bold">{graphData.nodes.length}</p>
        </div>
        <div className="glass p-6">
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/50">Dependencies</span>
          </div>
          <p className="text-3xl font-bold">{graphData.links.length}</p>
        </div>
        <div className="glass p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-white/50">Languages</span>
          </div>
          <p className="text-3xl font-bold">{languages.length}</p>
        </div>
      </div>

      {/* Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <GraphControls languages={languages} onFilterChange={setFilters} />

          {selectedNode && (
            <div className="glass p-4 space-y-3">
              <h4 className="text-sm font-medium text-white/70">Selected File</h4>
              <div>
                <p className="text-xs text-white/40 mb-1">Name</p>
                <code className="text-sm font-mono text-lime-400">{selectedNode.name}</code>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Language</p>
                <span className="inline-block px-2 py-1 text-xs bg-white/10 text-white/70">{selectedNode.group}</span>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Complexity</p>
                <p className="text-sm">{selectedNode.size}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="glass p-4 h-[500px]">
            <DependencyGraph3D data={filteredGraphData} onNodeClick={handleNodeClick} />
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
