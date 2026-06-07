'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, Environment, Float, Sparkles, Text3D } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { MathUtils } from 'three'

const FONT_URL = '/fonts/helvetiker_bold.typeface.json'

type LetterProps = {
  char: string
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
  emissive: string
  scale?: number
  floatSpeed?: number
}

function GlossyLetter({
  char,
  position,
  rotation = [0, 0, 0],
  color,
  emissive,
  scale = 1,
  floatSpeed = 1.2,
}: LetterProps) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.18
    ref.current.rotation.x = rotation[0] + Math.cos(t * 0.25) * 0.08
  })

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.4}
      floatIntensity={0.7}
      floatingRange={[-0.12, 0.12]}
    >
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        <Center>
          <Text3D
            font={FONT_URL}
            size={1}
            height={0.45}
            bevelEnabled
            bevelThickness={0.06}
            bevelSize={0.045}
            bevelSegments={10}
            curveSegments={28}
          >
            {char}
            <meshPhysicalMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={0.18}
              metalness={0.25}
              roughness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.06}
              reflectivity={0.85}
              iridescence={0.45}
              iridescenceIOR={1.45}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  )
}

type ShapeProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color?: string
  floatSpeed?: number
  rotateSpeed?: number
}

function GlassCube({ position, rotation = [0, 0, 0], scale = 1, color = '#bfdbfe', floatSpeed = 1, rotateSpeed = 0.3 }: ShapeProps) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x += 0.002 * rotateSpeed
    ref.current.rotation.y += 0.003 * rotateSpeed
  })
  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.05}
          transmission={0.85}
          thickness={0.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  )
}

function GlossySphere({ position, scale = 1, color = '#dbeafe', floatSpeed = 1 }: ShapeProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.05}
          transmission={0.95}
          thickness={0.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.03}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  )
}

function GlossyCylinder({ position, rotation = [0, 0, 0], scale = 1, color = '#bfdbfe', floatSpeed = 1 }: ShapeProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 36]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  )
}

function GlossyTorus({ position, rotation = [0, 0, 0], scale = 1, color = '#dbeafe', floatSpeed = 1, rotateSpeed = 0.4 }: ShapeProps) {
  const ref = useRef<Mesh>(null)
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.z += 0.004 * rotateSpeed
  })
  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <torusGeometry args={[0.55, 0.18, 24, 64]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.05}
          transmission={0.92}
          thickness={0.4}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  )
}

function GlossyOcta({ position, scale = 1, color = '#a5c8ff', floatSpeed = 1 }: ShapeProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.6} floatIntensity={0.6}>
      <mesh position={position} scale={scale}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.2}
          roughness={0.08}
          transmission={0.6}
          thickness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
          ior={1.5}
        />
      </mesh>
    </Float>
  )
}

function ParallaxCamera() {
  const { camera, mouse } = useThree()
  useFrame(() => {
    camera.position.x = MathUtils.lerp(camera.position.x, mouse.x * 0.6, 0.05)
    camera.position.y = MathUtils.lerp(camera.position.y, mouse.y * 0.4, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export function IBKScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ParallaxCamera />

        <ambientLight intensity={1.1} color="#ffffff" />
        <pointLight position={[6, 6, 8]} intensity={1.2} color="#bae6fd" />
        <pointLight position={[-8, -3, 6]} intensity={1.4} color="#e0f2fe" />
        <pointLight position={[0, 8, -4]} intensity={0.9} color="#bae6fd" />
        <directionalLight position={[5, 10, 5]} intensity={0.6} color="#ffffff" />

        {/* IBK 글자 — I는 헤드라인-B 사이 갭, B는 중앙, K는 우하단 */}
        <GlossyLetter
          char="I"
          position={[-1.3, 1.6, -1.5]}
          rotation={[0.1, -0.25, -0.05]}
          color="#bae6fd"
          emissive="#7dd3fc"
          scale={1.5}
          floatSpeed={0.95}
        />
        <GlossyLetter
          char="B"
          position={[0.8, 1.0, -0.8]}
          rotation={[-0.05, -0.28, 0.04]}
          color="#93c5fd"
          emissive="#60a5fa"
          scale={1.3}
          floatSpeed={0.85}
        />
        <GlossyLetter
          char="K"
          position={[5.5, -1.9, -0.5]}
          rotation={[0.18, -0.4, 0.06]}
          color="#60a5fa"
          emissive="#3b82f6"
          scale={1.5}
          floatSpeed={1.0}
        />

        {/* 글래스 큐브 ×2 — 밝은 하늘 톤 */}
        <GlassCube position={[-6.0, -1.5, 0]} scale={0.95} color="#bae6fd" floatSpeed={1.2} />
        <GlassCube position={[5.2, 2.5, -0.5]} scale={0.75} color="#7dd3fc" rotation={[0.2, 0.6, 0]} floatSpeed={1.0} />

        {/* 얼음 구 ×2 */}
        <GlossySphere position={[-5.5, -3.0, 0]} scale={0.95} color="#93c5fd" floatSpeed={1.3} />
        <GlossySphere position={[6.5, 1.0, -2]} scale={0.65} color="#bae6fd" floatSpeed={1.1} />

        {/* 얼음 토러스 — 좌측 상단 (살짝 왼쪽 아래로) */}
        <GlossyTorus position={[-6.5, 2.8, -1.5]} rotation={[0.5, 0.2, 0]} scale={0.7} color="#7dd3fc" floatSpeed={0.95} />

        {/* 얼음 크리스털 */}
        <GlossyOcta position={[-2.5, 3.2, -1.5]} scale={0.75} color="#f0f9ff" floatSpeed={1.3} />

        {/* 떠다니는 입자 */}
        <Sparkles
          count={60}
          scale={[18, 12, 6]}
          size={2.2}
          speed={0.25}
          opacity={0.55}
          color="#3b82f6"
        />

        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
