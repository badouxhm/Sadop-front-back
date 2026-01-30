"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Icosahedron, Environment, ContactShadows } from "@react-three/drei"
import { useRef } from "react"
import type * as THREE from "three"

function BotCore({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5
      meshRef.current.position.y = Math.sin(time) * 0.1
      if (active) {
        meshRef.current.scale.setScalar(1 + Math.sin(time * 10) * 0.05)
      }
    }
  })

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1, 15]} scale={1.5}>
        <MeshDistortMaterial
          color={active ? "#60a5fa" : "#3b82f6"}
          speed={active ? 5 : 2}
          distort={active ? 0.6 : 0.3}
          radius={1}
          emissive={active ? "#3b82f6" : "#1d4ed8"}
          emissiveIntensity={active ? 2 : 0.5}
        />
      </Icosahedron>
    </Float>
  )
}

export function AssistantBot3D({ isListening }: { isListening: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        <BotCore active={isListening} />
        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  )
}
