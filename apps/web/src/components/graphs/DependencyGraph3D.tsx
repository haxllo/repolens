'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { GraphData, GraphNode, GraphLink } from '@/hooks/useGraphData'
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
      meshRef.current.scale.setScalar(1.2)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[node.size / 10, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={hovered ? node.color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {hovered && (
        <Text
          position={[0, node.size / 8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {node.name}
        </Text>
      )}
    </group>
  )
}

function Edge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  return <Line points={[start, end]} color="#888888" lineWidth={1} opacity={0.3} transparent />
}

function GraphScene({ data, onNodeClick }: DependencyGraph3DProps) {
  // Create a force-directed layout simulation
  const positions = new Map<string, [number, number, number]>()

  // Simple circular layout for demonstration
  data.nodes.forEach((node, index) => {
    const angle = (index / data.nodes.length) * Math.PI * 2
    const radius = 10
    positions.set(node.id, [Math.cos(angle) * radius, Math.sin(angle) * radius, 0])
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Render edges */}
      {data.links.map((link, index) => {
        const sourcePos = positions.get(link.source)
        const targetPos = positions.get(link.target)
        if (sourcePos && targetPos) {
          return <Edge key={index} start={sourcePos} end={targetPos} />
        }
        return null
      })}

      {/* Render nodes */}
      {data.nodes.map((node) => {
        const position = positions.get(node.id)
        if (position) {
          return (
            <Node
              key={node.id}
              node={node}
              position={position}
              onClick={() => onNodeClick?.(node)}
            />
          )
        }
        return null
      })}

      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  )
}

export default function DependencyGraph3D({ data, onNodeClick }: DependencyGraph3DProps) {
  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/50">No dependency data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
        <Suspense fallback={null}>
          <GraphScene data={data} onNodeClick={onNodeClick} />
        </Suspense>
      </Canvas>
    </div>
  )
}
