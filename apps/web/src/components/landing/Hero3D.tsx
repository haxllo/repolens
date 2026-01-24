'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#4f46e5"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      {/* Inner glowing core */}
      <Sphere args={[0.6, 32, 32]} scale={2}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} />
      </Sphere>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a5b4fc" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AnimatedSphere />
      </Canvas>
    </div>
  )
}
