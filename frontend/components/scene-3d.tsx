"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Environment } from "@react-three/drei"
import { useRef } from "react"
import type * as THREE from "three"

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.x = time * 0.2
    meshRef.current.rotation.y = time * 0.3
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color="#3b82f6"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  )
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas frameloop="always" dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <AnimatedSphere />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
