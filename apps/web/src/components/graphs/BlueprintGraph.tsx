'use client'

import React, { useMemo, useCallback, useEffect } from 'react'

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

  MarkerType,

  useReactFlow,

  ReactFlowProvider

} from 'reactflow'

// ...

export function BlueprintGraph(props: BlueprintGraphProps) {

  return (

    <ReactFlowProvider>

      <BlueprintFlow {...props} />

    </ReactFlowProvider>

  )

}

// ...

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);



  // 3. Sync internal state with props

  useEffect(() => {

    setNodes(initialNodes);

    setEdges(initialEdges);

    // Force fit view after a small delay to allow ReactFlow to measure nodes

    const timer = setTimeout(() => fitView(), 100);

    return () => clearTimeout(timer);

  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);



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
