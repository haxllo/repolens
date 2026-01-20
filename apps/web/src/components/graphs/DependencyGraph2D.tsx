'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Node {
  id: string
  label: string
  type?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface Edge {
  source: string
  target: string
}

interface DependencyGraph2DProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick?: (nodeId: string) => void
  width?: number
  height?: number
}

export function DependencyGraph2D({
  nodes,
  edges,
  onNodeClick,
  width = 800,
  height = 600,
}: DependencyGraph2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [positionedNodes, setPositionedNodes] = useState<Node[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Color mapping for node types
  const getNodeColor = (type?: string) => {
    const colors: Record<string, string> = {
      root: '#a2e435',      // lime
      module: '#3b82f6',    // blue
      package: '#f59e0b',   // amber
      file: '#8b5cf6',      // purple
      external: '#6b7280',  // gray
      default: '#10b981',   // green
    }
    return colors[type || 'default'] || colors.default
  }

  // Initialize node positions using force-directed layout
  useEffect(() => {
    if (nodes.length === 0) return

    // Initialize positions in a circle
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const initialNodes = nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      }
    })

    // Run simple force simulation
    const nodeMap = new Map(initialNodes.map(n => [n.id, n]))
    const iterations = 100

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between nodes
      for (let i = 0; i < initialNodes.length; i++) {
        for (let j = i + 1; j < initialNodes.length; j++) {
          const n1 = initialNodes[i]
          const n2 = initialNodes[j]
          const dx = n2.x! - n1.x!
          const dy = n2.y! - n1.y!
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 5000 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          n1.vx! -= fx
          n1.vy! -= fy
          n2.vx! += fx
          n2.vy! += fy
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        if (!source || !target) continue
        
        const dx = target.x! - source.x!
        const dy = target.y! - source.y!
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        source.vx! += fx
        source.vy! += fy
        target.vx! -= fx
        target.vy! -= fy
      }

      // Center gravity
      for (const node of initialNodes) {
        const dx = centerX - node.x!
        const dy = centerY - node.y!
        node.vx! += dx * 0.001
        node.vy! += dy * 0.001
      }

      // Apply velocities with damping
      for (const node of initialNodes) {
        node.x! += node.vx! * 0.1
        node.y! += node.vy! * 0.1
        node.vx! *= 0.9
        node.vy! *= 0.9
        // Keep in bounds
        node.x = Math.max(50, Math.min(width - 50, node.x!))
        node.y = Math.max(50, Math.min(height - 50, node.y!))
      }
    }

    setPositionedNodes(initialNodes)
  }, [nodes, edges, width, height])

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || positionedNodes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    // Draw edges
    const nodeMap = new Map(positionedNodes.map(n => [n.id, n]))
    ctx.strokeStyle = '#404040'
    ctx.lineWidth = 1

    for (const edge of edges) {
      const source = nodeMap.get(edge.source)
      const target = nodeMap.get(edge.target)
      if (!source || !target) continue

      ctx.beginPath()
      ctx.moveTo(source.x!, source.y!)
      ctx.lineTo(target.x!, target.y!)
      ctx.stroke()

      // Draw arrow
      const angle = Math.atan2(target.y! - source.y!, target.x! - source.x!)
      const arrowSize = 8
      const arrowX = target.x! - 20 * Math.cos(angle)
      const arrowY = target.y! - 20 * Math.sin(angle)
      
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = '#404040'
      ctx.fill()
    }

    // Draw nodes
    for (const node of positionedNodes) {
      const isHovered = hoveredNode === node.id
      const radius = isHovered ? 18 : 15

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
      
      if (isHovered) {
        ctx.strokeStyle = '#a2e435'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Label
      ctx.fillStyle = '#ffffff'
      ctx.font = isHovered ? 'bold 12px sans-serif' : '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const label = node.label.length > 15 ? node.label.slice(0, 12) + '...' : node.label
      ctx.fillText(label, node.x!, node.y! + radius + 12)
    }

    ctx.restore()
  }, [positionedNodes, edges, hoveredNode, width, height, offset, scale])

  // Handle mouse events
  const getNodeAtPosition = useCallback((x: number, y: number) => {
    const adjustedX = (x - offset.x) / scale
    const adjustedY = (y - offset.y) / scale
    
    for (const node of positionedNodes) {
      const dx = node.x! - adjustedX
      const dy = node.y! - adjustedY
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        return node.id
      }
    }
    return null
  }, [positionedNodes, offset, scale])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isDragging && draggedNode) {
      setPositionedNodes(prev => prev.map(n => 
        n.id === draggedNode 
          ? { ...n, x: (x - offset.x) / scale, y: (y - offset.y) / scale }
          : n
      ))
    } else {
      setHoveredNode(getNodeAtPosition(x, y))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nodeId = getNodeAtPosition(x, y)
    
    if (nodeId) {
      setIsDragging(true)
      setDraggedNode(nodeId)
    }
  }

  const handleMouseUp = () => {
    if (isDragging && draggedNode && onNodeClick) {
      onNodeClick(draggedNode)
    }
    setIsDragging(false)
    setDraggedNode(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.5, Math.min(2, prev * delta)))
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/50">
        No dependency data available
      </div>
    )
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-[#0a0a0a] cursor-grab"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredNode(null)
          setIsDragging(false)
        }}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : hoveredNode ? 'pointer' : 'grab' }}
      />
      <div className="absolute bottom-4 right-4 bg-white/[0.05] px-3 py-2 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-lime-400" />
          <span className="text-white/60">Root</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500" />
          <span className="text-white/60">Module</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500" />
          <span className="text-white/60">Package</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setScale(s => Math.min(2, s * 1.2))}
          className="p-2 bg-white/[0.05] hover:bg-white/[0.1] text-white"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.5, s / 1.2))}
          className="p-2 bg-white/[0.05] hover:bg-white/[0.1] text-white"
        >
          -
        </button>
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="p-2 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default DependencyGraph2D
