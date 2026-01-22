'use client'

import { useRef, useState, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, Float } from '@react-three/drei'
import { GraphData, GraphNode } from '@/hooks/useGraphData'
import * as THREE from 'three'

interface DependencyGraph3DProps {
  data: GraphData
  onNodeClick?: (node: GraphNode) => void
}

function Node({
  node,
  position,
  onClick,
}: {
  node: GraphNode
  position: [number, number, number]
  onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.setScalar(1.3)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[node.size / 15 + 0.2, 24, 24]} />
        <meshStandardMaterial
          color={node.color}
          emissive={hovered ? node.color : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {(hovered || node.group === 'root') && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Text
            position={[0, node.size / 10 + 0.5, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {node.name}
          </Text>
        </Float>
      )}
    </group>
  )
}

function Edge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  return (
    <Line 
      points={points} 
      color="#ffffff" 
      lineWidth={0.5} 
      opacity={0.15} 
      transparent 
    />
  )
}

function GraphScene({ data, onNodeClick }: DependencyGraph3DProps) {
  const positions = useMemo(() => {
    const posMap = new Map<string, [number, number, number]>()
    if (data.nodes.length === 0) return posMap

    // Initialize with better distribution
    const nodes = data.nodes.map((node, i) => ({
      ...node,
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      vx: 0,
      vy: 0,
      vz: 0,
    }))

    // Simple 3D force simulation
    const iterations = 150
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    for (let i = 0; i < iterations; i++) {
      // Repulsion
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const n1 = nodes[j]
          const n2 = nodes[k]
          const dx = n2.x - n1.x
          const dy = n2.y - n1.y
          const dz = n2.z - n1.z
          const distSq = dx * dx + dy * dy + dz * dz || 1
          const dist = Math.sqrt(distSq)
          const force = 1.5 / distSq
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          const fz = (dz / dist) * force
          n1.vx -= fx; n1.vy -= fy; n1.vz -= fz
          n2.vx += fx; n2.vy += fy; n2.vz += fz
        }
      }

      // Attraction (edges)
      for (const link of data.links) {
        const s = nodeMap.get(link.source)
        const t = nodeMap.get(link.target)
        if (!s || !t) continue
        const dx = t.x - s.x; const dy = t.y - s.y; const dz = t.z - s.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
        const force = dist * 0.05
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const fz = (dz / dist) * force
        s.vx += fx; s.vy += fy; s.vz += fz
        t.vx -= fx; t.vy -= fy; t.vz -= fz
      }

      // Center gravity
      for (const n of nodes) {
        n.vx -= n.x * 0.02; n.vy -= n.y * 0.02; n.vz -= n.z * 0.02
        
        // Apply velocity
        n.x += n.vx; n.y += n.vy; n.z += n.vz
        // Damping
        n.vx *= 0.6; n.vy *= 0.6; n.vz *= 0.6
      }
    }

    nodes.forEach(n => posMap.set(n.id, [n.x, n.y, n.z]))
    return posMap
  }, [data])

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-20, -20, -20]} intensity={0.8} color="#3b82f6" />
      <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />

      {/* Render edges */}
      {data.links.map((link, index) => {
        const start = positions.get(link.source)
        const end = positions.get(link.target)
        if (start && end) return <Edge key={index} start={start} end={end} />
        return null
      })}

      {/* Render nodes */}
      {data.nodes.map((node) => {
        const pos = positions.get(node.id)
        if (pos) return (
          <Node
            key={node.id}
            node={node}
            position={pos}
            onClick={() => onNodeClick?.(node)}
          />
        )
        return null
      })}

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5} 
        zoomSpeed={1.2}
        makeDefault
      />
    </>
  )
}

export default function DependencyGraph3D({ data, onNodeClick }: DependencyGraph3DProps) {
  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/50">No dependency data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative group">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <GraphScene data={data} onNodeClick={onNodeClick} />
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl text-[10px] text-white/60 space-y-1">
          <p>• Drag to rotate</p>
          <p>• Scroll to zoom</p>
          <p>• Hover nodes for names</p>
        </div>
      </div>
    </div>
  )
}
