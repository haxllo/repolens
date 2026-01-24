'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.1
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#ffffff"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={1}
          wireframe={true}
          opacity={0.15}
          transparent={true}
        />
      </Sphere>
      {/* Inner geometric core */}
      <Sphere args={[0.8, 4, 4]} scale={1.8}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05} />
      </Sphere>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#ffffff" />
        <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={0.5} />
        <AnimatedSphere />
      </Canvas>
    </div>
  )
}