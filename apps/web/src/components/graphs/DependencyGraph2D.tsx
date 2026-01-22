'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3-force'

interface Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  type?: string
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string
  target: string
}

interface DependencyGraph2DProps {
  nodes: { id: string; label: string; type?: string }[]
  edges: { source: string; target: string }[]
  onNodeClick?: (nodeId: string) => void
}

export function DependencyGraph2D({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: DependencyGraph2DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Simulation state
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Edge[]>([])

  // Handle resizing
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Initialize simulation
  useEffect(() => {
    if (initialNodes.length === 0 || dimensions.width === 0) return

    const nodesData: Node[] = initialNodes.map(n => ({ ...n }))
    const linksData: Edge[] = initialEdges.map(e => ({ ...e }))

    const simulation = d3.forceSimulation<Node>(nodesData)
      .force('link', d3.forceLink<Node, Edge>(linksData).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(40))

    simulation.on('tick', () => {
      setNodes([...nodesData])
      setLinks([...linksData])
    })

    return () => {
      simulation.stop()
    }
  }, [initialNodes, initialEdges, dimensions])

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

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0 || dimensions.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup High DPI
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    // Draw edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1.5 / scale

    for (const edge of links) {
      const source = edge.source as unknown as Node
      const target = edge.target as unknown as Node
      if (!source.x || !source.y || !target.x || !target.y) continue

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
      ctx.stroke()

      // Draw arrow head
      const angle = Math.atan2(target.y - source.y, target.x - source.x)
      const arrowSize = 6 / scale
      const arrowX = target.x - (15 / scale) * Math.cos(angle)
      const arrowY = target.y - (15 / scale) * Math.sin(angle)
      
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()
    }

    // Draw nodes
    for (const node of nodes) {
      if (!node.x || !node.y) continue
      const isHovered = hoveredNode === node.id
      const radius = (isHovered ? 12 : 8) / scale

      // Shadow for nodes
      ctx.shadowBlur = 10 / scale
      ctx.shadowColor = 'rgba(0,0,0,0.5)'

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
      
      if (isHovered) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2 / scale
        ctx.stroke()
      }
      
      ctx.shadowBlur = 0 // Reset shadow

      // Improved Label Rendering
      if (scale > 0.4 || isHovered) {
        const label = node.label.length > 20 && !isHovered ? node.label.slice(0, 17) + '...' : node.label
        ctx.font = `${isHovered ? 'bold ' : ''}${Math.max(10, 12 / scale)}px sans-serif`
        const textWidth = ctx.measureText(label).width
        const padding = 4 / scale
        const rectX = node.x - textWidth / 2 - padding
        const rectY = node.y + radius + (4 / scale)
        const rectW = textWidth + padding * 2
        const rectH = (16 / scale)
        const radiusVal = 4 / scale
        
        // Label background with fallback for roundRect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(rectX, rectY, rectW, rectH, radiusVal)
        } else {
          // Fallback to simple rect if roundRect is not supported
          ctx.rect(rectX, rectY, rectW, rectH)
        }
        ctx.fill()

        // Label text
        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.8)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(label, node.x, node.y + radius + (6 / scale))
      }
    }

    ctx.restore()
  }, [nodes, links, hoveredNode, dimensions, offset, scale])

  // Helper: Find node at position
  const getNodeAtPosition = useCallback((x: number, y: number) => {
    const adjustedX = (x - offset.x) / scale
    const adjustedY = (y - offset.y) / scale
    
    for (const node of nodes) {
      if (!node.x || !node.y) continue
      const dx = node.x - adjustedX
      const dy = node.y - adjustedY
      if (Math.sqrt(dx * dx + dy * dy) < (15 / scale)) {
        return node
      }
    }
    return null
  }, [nodes, offset, scale])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isDragging && draggedNode) {
      draggedNode.fx = (x - offset.x) / scale
      draggedNode.fy = (y - offset.y) / scale
      setNodes([...nodes])
    } else if (isDragging) {
      setOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }))
    } else {
      const node = getNodeAtPosition(x, y)
      setHoveredNode(node?.id || null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const node = getNodeAtPosition(x, y)
    
    setIsDragging(true)
    if (node) {
      setDraggedNode(node)
      node.fx = node.x
      node.fy = node.y
    }
  }

  const handleMouseUp = () => {
    if (draggedNode) {
      if (onNodeClick && !isDragging) onNodeClick(draggedNode.id)
      draggedNode.fx = null
      draggedNode.fy = null
    }
    setIsDragging(false)
    setDraggedNode(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#050505]">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="block cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Legend & Controls UI remains similar but polished */}
      <div className="absolute bottom-4 left-4 flex gap-4 items-center">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex gap-4 text-[10px]">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-lime-400" /> <span className="text-white/60">Root</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-white/60">Module</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-white/60">Package</span></div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={() => setScale(s => Math.min(5, s * 1.2))} className="w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-lg hover:bg-white/10">+</button>
        <button onClick={() => setScale(s => Math.max(0.1, s / 1.2))} className="w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-lg hover:bg-white/10">-</button>
        <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }} className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] rounded-lg hover:bg-white/10">Reset</button>
      </div>
    </div>
  )
}

export default DependencyGraph2D
