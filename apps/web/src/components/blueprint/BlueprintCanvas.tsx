'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import BlueprintNode from './BlueprintNode';
import { useAutoLayout } from './useAutoLayout';
import { Layers, Activity, Filter } from 'lucide-react';

const nodeTypes = {
  blueprintNode: BlueprintNode,
};

interface BlueprintCanvasProps {
  data: any; // Full scan results
}

export function BlueprintCanvas({ data }: BlueprintCanvasProps) {
  const [filter, setFilter] = useState<'all' | 'high-risk' | 'entry'>('all');

  // Transform Scan Data into Nodes/Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const files = data?.ast?.files || [];
    const deps = data?.dependencies?.graph?.edges || [];

    // Create Nodes
    files.forEach((file: any) => {
      // Filter logic
      if (filter === 'high-risk' && (file.riskScore || 0) < 50) return;
      if (filter === 'entry' && !data?.ast?.entryPoints?.includes(file.path)) return;

      nodes.push({
        id: file.path,
        type: 'blueprintNode',
        data: { 
            label: file.path.split('/').pop(),
            type: 'file',
            riskScore: file.riskScore || 0,
            loc: file.loc || 0,
            isEntryPoint: data?.ast?.entryPoints?.includes(file.path)
        },
        position: { x: 0, y: 0 } // Layout handles position
      });
    });

    // Create Edges
    // Note: In a real implementation, we need to map the dependency graph IDs 
    // back to file paths. This is a simplified mapping.
    deps.forEach((edge: any, i: number) => {
        // Simplified edge creation
        const source = nodes.find(n => n.id.includes(edge.source));
        const target = nodes.find(n => n.id.includes(edge.target));
        
        if (source && target) {
            edges.push({
                id: `e-${i}`,
                source: source.id,
                target: target.id,
                animated: true,
                style: { stroke: '#3f3f46' }
            });
        }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, filter]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useAutoLayout(initialNodes, initialEdges);
  
  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync layout changes
  React.useEffect(() => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[800px] bg-[#020202] relative rounded-3xl overflow-hidden border border-white/5">
      
      {/* HUD / Overlay Controls */}
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <div className="glass px-1 p-1 rounded-xl border border-white/10 flex gap-1">
            <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-lime-400 text-black' : 'text-white/40 hover:text-white'}`}
            >
                Full Map
            </button>
            <button 
                onClick={() => setFilter('high-risk')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'high-risk' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
                Critical Paths
            </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        className="bg-[#020202]"
      >
        <Background color="#222" gap={20} size={1} />
        <Controls className="!bg-[#111] !border-white/10 !fill-white/50" />
        <MiniMap 
            nodeColor={(n) => {
                if (n.data.riskScore > 70) return '#ef4444';
                return '#3f3f46';
            }}
            maskColor="rgba(0,0,0, 0.7)"
            className="!bg-[#050505] !border-white/5 rounded-xl overflow-hidden" 
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 glass px-4 py-3 rounded-xl border border-white/10 text-[10px] text-white/40 space-y-2">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-400 rounded-full" />
            <span>Healthy Module</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>High Risk / Complex</span>
         </div>
      </div>
    </div>
  );
}
