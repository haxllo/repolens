'use client';

import React, { useState, useMemo } from 'react';
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
import { Command } from 'lucide-react';

const nodeTypes = {
  blueprintNode: BlueprintNode,
};

interface BlueprintCanvasProps {
  data: any; 
}

export function BlueprintCanvas({ data }: BlueprintCanvasProps) {
  const [filter, setFilter] = useState<'all' | 'high-risk'>('all');

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const files = data?.ast?.files || [];
    const deps = data?.dependencies?.graph?.edges || [];

    files.forEach((file: any) => {
      if (filter === 'high-risk' && (file.riskScore || 0) < 50) return;

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
        position: { x: 0, y: 0 }
      });
    });

    deps.forEach((edge: any, i: number) => {
        const source = nodes.find(n => n.id.includes(edge.source));
        const target = nodes.find(n => n.id.includes(edge.target));
        
        if (source && target) {
            edges.push({
                id: `e-${i}`,
                source: source.id,
                target: target.id,
                animated: true,
                style: { stroke: '#1a1a1a', strokeWidth: 1 }
            });
        }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, filter]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useAutoLayout(initialNodes, initialEdges);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  React.useEffect(() => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[800px] bg-black relative rounded-none overflow-hidden border border-white/5">
      
      {/* HUD Controls */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-black border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white">
          <Command className="w-3 h-3" />
          Spatial Map v2.0
        </div>
        
        <div className="flex bg-black border border-white/10 p-1">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
            >
                Full Archive
            </button>
            <button 
                onClick={() => setFilter('high-risk')}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'high-risk' ? 'bg-red-500 text-white' : 'text-white/30 hover:text-white'}`}
            >
                Risk Hotspots
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
        minZoom={0.05}
        maxZoom={2}
        className="bg-black"
      >
        <Background color="#111" gap={40} size={1} />
        <Controls className="!bg-black !border-white/10 !fill-white/20 !rounded-none" />
        <MiniMap 
            nodeColor={(n) => {
                if (n.data.riskScore > 70) return '#ef4444';
                return '#1a1a1a';
            }}
            maskColor="rgba(0,0,0, 0.8)"
            className="!bg-black !border-white/10 !rounded-none" 
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-black p-6 border border-white/10 space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-lime-400 rounded-none" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Healthy Record</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-none" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Complexity Warning</span>
         </div>
      </div>
    </div>
  );
}