"use client";

import { FileTreeHeatmap } from "@/components/visualizations/FileTreeHeatmap";
import { ComplexityCharts } from "@/components/visualizations/ComplexityCharts";
import DependencyGraph3D from "@/components/graphs/DependencyGraph3D";
import { DependencyGraph2D } from "@/components/graphs/DependencyGraph2D";
import { BlueprintGraph } from "@/components/graphs/BlueprintGraph";
import { useState } from "react";
import { Grid3X3, BarChart3, GitBranch, Box, Layers, Map as MapIcon, Globe } from "lucide-react";
import { useBlueprintData } from "@/hooks/useBlueprintData";

interface VisualizationsTabProps {
  scanData: any;
}

export function VisualizationsTab({ scanData }: VisualizationsTabProps) {
  const [activeView, setActiveView] = useState<'blueprint' | 'heatmap' | 'charts'>('blueprint');
  const [graphMode, setGraphMode] = useState<'blueprint' | '3d' | '2d'>('blueprint');
  
  if (!scanData) {
    return (
      <div className="flex items-center justify-center h-64 glass rounded-2xl">
        <p className="text-white/50 text-sm italic">Waiting for analysis results...</p>
      </div>
    );
  }

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

  const blueprintData = useBlueprintData(graphData);

  const tabs = [
    { id: 'blueprint', label: 'Architecture', icon: MapIcon },
    { id: 'heatmap', label: 'Hotspots', icon: Grid3X3 },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg ${
              activeView === tab.id
                ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(162,228,53,0.3)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass p-6 min-h-[700px] flex flex-col">
        {activeView === 'blueprint' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-white">Project Blueprint</h3>
                <p className="text-sm text-white/40">Hierarchical mapping of project structure and impact</p>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'blueprint', label: 'Map', icon: MapIcon },
                  { id: '3d', label: 'Sphere', icon: Globe },
                  { id: '2d', label: 'Flow', icon: GitBranch },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setGraphMode(mode.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${
                      graphMode === mode.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <mode.icon className="w-3 h-3" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-[600px]">
              {graphMode === 'blueprint' && <BlueprintGraph data={blueprintData} />}
              {graphMode === '3d' && <DependencyGraph3D data={graphData} />}
              {graphMode === '2d' && <DependencyGraph2D nodes={graphData.nodes} edges={graphData.links} />}
            </div>
          </div>
        )}

        {activeView === 'heatmap' && (
          <FileTreeHeatmap files={files} riskScores={riskScores} />
        )}

        {activeView === 'charts' && (
          <ComplexityCharts files={files} riskScores={riskScores} />
        )}
      </div>
    </div>
  );
}
