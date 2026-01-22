"use client";

import { FileTreeHeatmap } from "@/components/visualizations/FileTreeHeatmap";
import { ComplexityCharts } from "@/components/visualizations/ComplexityCharts";
import DependencyGraph3D from "@/components/graphs/DependencyGraph3D";
import { DependencyGraph2D } from "@/components/graphs/DependencyGraph2D";
import { useState } from "react";
import { Grid3X3, BarChart3, GitBranch, Box, Layers } from "lucide-react";

interface VisualizationsTabProps {
  scanData: any;
}

export function VisualizationsTab({ scanData }: VisualizationsTabProps) {
  const [activeView, setActiveView] = useState<'heatmap' | 'charts' | 'graph'>('heatmap');
  const [use3D, setUse3D] = useState(true);
  
  // Access files from AST data
  const files = scanData?.ast?.files || [];
  const riskScores: Record<string, number> = {};
  
  // Access risk scores (camelCase from backend) with defensive checks
  const fileRisks = scanData?.riskScores?.file_risks;
  if (Array.isArray(fileRisks)) {
    fileRisks.forEach((risk: any) => {
      if (risk && risk.file_path) {
        riskScores[risk.file_path] = risk.risk_score;
      }
    });
  }

  const dependencies = scanData?.dependencies || {};
  
  const graphData = {
    nodes: (Array.isArray(dependencies.graph?.nodes) ? dependencies.graph.nodes : []).map((n: any) => ({
      ...n,
      name: n.label || n.id || 'Unknown',
      size: n.size || 10,
      color: n.type === 'root' ? '#a2e435' : '#3b82f6'
    })),
    links: (Array.isArray(dependencies.graph?.edges) ? dependencies.graph.edges : []).map((e: any) => ({
      source: e.source,
      target: e.target,
    })),
  };

  const tabs = [
    { id: 'heatmap', label: 'File Heatmap', icon: Grid3X3 },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
    { id: 'graph', label: 'Dependency Graph', icon: GitBranch },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/[0.03]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeView === tab.id
                ? 'bg-lime-400 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass p-6">
        {activeView === 'heatmap' && (
          <FileTreeHeatmap files={files} riskScores={riskScores} />
        )}

        {activeView === 'charts' && (
          <ComplexityCharts files={files} riskScores={riskScores} />
        )}

        {activeView === 'graph' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setUse3D(!use3D)}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
              >
                {use3D ? <Layers className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                Switch to {use3D ? "2D" : "3D"} View
              </button>
            </div>
            <div className="h-[500px]">
              {use3D ? (
                <DependencyGraph3D data={graphData} />
              ) : (
                <DependencyGraph2D
                  nodes={graphData.nodes}
                  edges={graphData.links}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
