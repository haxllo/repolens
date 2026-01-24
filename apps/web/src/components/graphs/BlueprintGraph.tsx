'use client'

import React, { useMemo, useCallback } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { BlueprintData, BlueprintNode as IBlueprintNode } from '@/hooks/useBlueprintData'
import { cn } from '@/lib/utils'

// 1. Custom Node Component
const BlueprintNode = ({ data }: NodeProps<IBlueprintNode>) => {
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border bg-black/80 backdrop-blur-xl shadow-2xl min-w-[180px] transition-all group hover:scale-105",
      data.group === 'root' ? "border-lime-400/50" : "border-white/10 hover:border-white/20"
    )}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-white/20 border-none" />
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            {data.group}
          </span>
          {data.impact > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
              {data.impact} dependents
            </span>
          )}
        </div>
        <h4 className="text-sm font-semibold text-white truncate max-w-[200px]">
          {data.name}
        </h4>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-[10px] text-white/30 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {data.id}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-white/20 border-none" />
    </div>
  )
}

const nodeTypes = {
  blueprintNode: BlueprintNode,
}

interface BlueprintGraphProps {
  data: BlueprintData
}

export function BlueprintGraph({ data }: BlueprintGraphProps) {
  // 2. Transform BlueprintData to ReactFlow elements
  const { initialNodes, initialEdges } = useMemo(() => {
    // Layout logic: Rank determines X, vertical spread determines Y
    const columnWidth = 350;
    const rowHeight = 120;
    const nodesByRank: Record<number, string[]> = {};
    
    data.nodes.forEach(node => {
      if (!nodesByRank[node.rank]) nodesByRank[node.rank] = [];
      nodesByRank[node.rank].push(node.id);
    });

    const rfNodes: Node[] = data.nodes.map(node => {
      const rankIndex = nodesByRank[node.rank].indexOf(node.id);
      const totalInRank = nodesByRank[node.rank].length;
      
      // Center the column vertically
      const yOffset = (rankIndex - (totalInRank - 1) / 2) * rowHeight;

      return {
        id: node.id,
        type: 'blueprintNode',
        data: node,
        position: { 
          x: node.rank * columnWidth, 
          y: yOffset + 300 // Offset from top
        },
      };
    });

    const rfEdges: Edge[] = data.links.map((link, idx) => ({
      id: `e-${idx}`,
      source: link.source,
      target: link.target,
      animated: true,
      type: ConnectionLineType.SmoothStep,
      style: { stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'rgba(255, 255, 255, 0.1)',
      },
    }));

    return { initialNodes: rfNodes, initialEdges: rfEdges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 3. Sync internal state with props
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/50 italic bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
        No architectural data available
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] rounded-2xl border border-white/5 overflow-hidden shadow-inner relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        className="blueprint-flow"
      >
        <Background color="rgba(255, 255, 255, 0.03)" gap={40} size={1} />
        <Controls className="!bg-black/80 !border-white/10 !fill-white" />
        <MiniMap 
          nodeColor={(n) => (n.data as IBlueprintNode).color}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-black/80 !border-white/10 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
      
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-lime-400 mb-3">Blueprint Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <span className="text-[10px] text-white/60">ENTRY POINTS (LEFT)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] text-white/60">BUSINESS LOGIC (MIDDLE)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] text-white/60">UTILITIES / EXTERNAL (RIGHT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
