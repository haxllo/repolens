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

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse effect for important nodes (root or highly connected)
      if (node.group === 'root') {
        const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
        meshRef.current.scale.setScalar(hovered ? 1.4 : s)
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.3)
      } else {
        meshRef.current.scale.setScalar(1)
      }
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
        <sphereGeometry args={[node.size / 15 + 0.3, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 1.5 : 0.4}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Dynamic Label */}
      {(hovered || node.group === 'root') && (
        <Float speed={3} rotationIntensity={0.1} floatIntensity={0.5}>
          <Text
            position={[0, node.size / 10 + 0.8, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor="#000000"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          >
            {node.name}
          </Text>
          {hovered && (
            <Text
              position={[0, node.size / 10 + 0.3, 0]}
              fontSize={0.25}
              color={node.color}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {node.group.toUpperCase()}
            </Text>
          )}
        </Float>
      )}
      
      {/* Subtle Glow Ring */}
      {node.group === 'root' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.6, 64]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

function Edge({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color?: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  return (
    <Line 
      points={points} 
      color={color || "#ffffff"} 
      lineWidth={0.8} 
      opacity={0.2} 
      transparent 
    />
  )
}

function GraphScene({ data, onNodeClick }: DependencyGraph3DProps) {
  const positions = useMemo(() => {
    const posMap = new Map<string, [number, number, number]>()
    if (data.nodes.length === 0) return posMap

    const nodes = data.nodes.map((node) => ({
      ...node,
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
      vx: 0, vy: 0, vz: 0,
    }))

    // Advanced 3D Force Simulation with Clustering
    const iterations = 200
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    for (let i = 0; i < iterations; i++) {
      // Repulsion (Many-Body)
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const n1 = nodes[j]; const n2 = nodes[k]
          const dx = n2.x - n1.x; const dy = n2.y - n1.y; const dz = n2.z - n1.z
          const distSq = dx * dx + dy * dy + dz * dz || 1
          const force = (n1.group === n2.group ? 1.0 : 2.5) / distSq // Repel different groups more
          n1.vx -= dx * force; n1.vy -= dy * force; n1.vz -= dz * force
          n2.vx += dx * force; n2.vy += dy * force; n2.vz += dz * force
        }
      }

      // Attraction (Links)
      for (const link of data.links) {
        const s = nodeMap.get(link.source); const t = nodeMap.get(link.target)
        if (!s || !t) continue
        const dx = t.x - s.x; const dy = t.y - s.y; const dz = t.z - s.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
        const force = dist * 0.08
        s.vx += dx * force; s.vy += dy * force; s.vz += dz * force
        t.vx -= dx * force; t.vy -= dy * force; t.vz -= dz * force
      }

      // Type-based Gravity (Clustering)
      const groupCenters: Record<string, {x: number, y: number, z: number}> = {
        'root': {x: 0, y: 0, z: 0},
        'npm': {x: 15, y: 10, z: 0},
        'pip': {x: -15, y: 10, z: 0},
        'module': {x: 0, y: -15, z: 10},
        'file': {x: 0, y: -15, z: -10},
      }

      for (const n of nodes) {
        const target = groupCenters[n.group] || {x: 0, y: 0, z: 0}
        n.vx += (target.x - n.x) * 0.01
        n.vy += (target.y - n.y) * 0.01
        n.vz += (target.z - n.z) * 0.01
        
        // Universal Gravity
        n.vx -= n.x * 0.01; n.vy -= n.y * 0.01; n.vz -= n.z * 0.01
        
        n.x += n.vx; n.y += n.vy; n.z += n.vz
        n.vx *= 0.5; n.vy *= 0.5; n.vz *= 0.5 // Heavy damping
      }
    }

    nodes.forEach(n => posMap.set(n.id, [n.x, n.y, n.z]))
    return posMap
  }, [data])

  return (
    <>
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#020202', 20, 70]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[20, 20, 20]} intensity={2} color="#ffffff" />
      <pointLight position={[-20, -20, -20]} intensity={1} color="#3b82f6" />
      <spotLight position={[0, 40, 0]} intensity={1.5} angle={0.5} penumbra={1} castShadow />

      {/* Grid Floor for depth */}
      <gridHelper args={[100, 20, '#ffffff05', '#ffffff02']} position={[0, -20, 0]} />

      {/* Render links */}
      {data.links.map((link, index) => {
        const start = positions.get(link.source)
        const end = positions.get(link.target)
        const sourceNode = data.nodes.find(n => n.id === link.source)
        if (start && end) return <Edge key={index} start={start} end={end} color={sourceNode?.color} />
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
        rotateSpeed={0.4} 
        zoomSpeed={1.5}
        minDistance={5}
        maxDistance={100}
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
