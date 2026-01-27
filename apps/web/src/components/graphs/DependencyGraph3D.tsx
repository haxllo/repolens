'use client'

import { useRef, useState, Suspense, useMemo } from 'react'
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
  // Using a flat array of coordinates is more stable for the Line component
  const points = useMemo(() => [
    start[0], start[1], start[2],
    end[0], end[1], end[2]
  ], [start, end])

  return (
    <Line 
      points={points as any} 
      color={color || "#ffffff"} 
      lineWidth={1} 
      opacity={0.2} 
      transparent 
    />
  )
}

function GraphScene({ data, onNodeClick }: DependencyGraph3DProps) {
  const positions = useMemo(() => {
    const posMap = new Map<string, [number, number, number]>()
    if (!data.nodes || data.nodes.length === 0) return posMap

    // Initial stable distribution
    const nodes = data.nodes.map((node, i) => {
      // Use a more distributed initial state than purely random
      const nCount = data.nodes.length
      const phi = Math.acos(-1 + (2 * i) / Math.max(1, nCount - 1))
      const theta = Math.sqrt(nCount * Math.PI) * phi
      const r = 15
      
      // Deterministic jitter based on index
      const jitter = (i: number) => ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5
      
      return {
        ...node,
        x: r * Math.cos(theta) * Math.sin(phi) || jitter(i) * 2,
        y: r * Math.sin(theta) * Math.sin(phi) || jitter(i + 1) * 2,
        z: r * Math.cos(phi) || jitter(i + 2) * 2,
        vx: 0, vy: 0, vz: 0,
      }
    })

    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    let alpha = 1.0 // Cooling factor
    const iterations = 120

    for (let i = 0; i < iterations; i++) {
      // 1. Repulsion (Many-Body)
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const n1 = nodes[j]; const n2 = nodes[k]
          let dx = n2.x - n1.x; let dy = n2.y - n1.y; let dz = n2.z - n1.z
          
          // Jitter for identical positions
          if (dx === 0 && dy === 0 && dz === 0) {
            dx = 0.1; dy = 0.1; dz = 0.1
          }

          const distSq = dx * dx + dy * dy + dz * dz
          const dist = Math.sqrt(distSq)
          
          // Repulsion force inversely proportional to distance
          const strength = (n1.group === n2.group ? 20 : 40) * alpha
          const force = strength / Math.max(1, distSq)
          
          const fx = (dx / dist) * force; const fy = (dy / dist) * force; const fz = (dz / dist) * force
          n1.vx -= fx; n1.vy -= fy; n1.vz -= fz
          n2.vx += fx; n2.vy += fy; n2.vz += fz
        }
      }

      // 2. Attraction (Links)
      for (const link of data.links) {
        const s = nodeMap.get(link.source); const t = nodeMap.get(link.target)
        if (!s || !t) continue
        
        const dx = t.x - s.x; const dy = t.y - s.y; const dz = t.z - s.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 0.1) continue

        // Spring force proportional to distance
        const strength = 0.04 * alpha
        const fx = dx * strength; const fy = dy * strength; const fz = dz * strength
        
        s.vx += fx; s.vy += fy; s.vz += fz
        t.vx -= fx; t.vy -= fy; t.vz -= fz
      }

      // 3. Update positions and apply gravity/damping
      for (const n of nodes) {
        // Center gravity
        n.vx -= n.x * 0.01 * alpha
        n.vy -= n.y * 0.01 * alpha
        n.vz -= n.z * 0.01 * alpha
        
        // Final position update
        n.x += n.vx; n.y += n.vy; n.z += n.vz
        
        // Heavy Damping
        n.vx *= 0.4; n.vy *= 0.4; n.vz *= 0.4
        
        // Absolute NaN/Infinity protection
        if (!isFinite(n.x)) n.x = ((nodes.indexOf(n) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 5
        if (!isFinite(n.y)) n.y = (((nodes.indexOf(n) + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 5
        if (!isFinite(n.z)) n.z = (((nodes.indexOf(n) + 2) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 5
      }
      
      alpha *= 0.96 // Cool down
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
        if (!start || !end) return null
        
        // Final sanity check for NaN values in positions
        if (start.some(isNaN) || end.some(isNaN)) return null

        const sourceNode = data.nodes.find(n => n.id === link.source)
        return <Edge key={index} start={start} end={end} color={sourceNode?.color} />
      })}

      {/* Render nodes */}
      {data.nodes.map((node) => {
        const pos = positions.get(node.id)
        if (!pos || pos.some(isNaN)) return null
        
        return (
          <Node
            key={node.id}
            node={node}
            position={pos}
            onClick={() => onNodeClick?.(node)}
          />
        )
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
        shadows={false} 
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance" 
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('REPOLENS_GRAPH: WebGL Context Lost. Attempting recovery...');
          }, false);
        }}
      >
        <Suspense fallback={null}>
          <GraphScene data={data} onNodeClick={onNodeClick} />
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-none text-[10px] text-white/60 space-y-1">
          <p>• Drag to rotate</p>
          <p>• Scroll to zoom</p>
          <p>• Hover nodes for names</p>
        </div>
      </div>
    </div>
  )
}
