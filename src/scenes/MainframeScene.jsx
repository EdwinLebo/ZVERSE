import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import MainframeModel, { modulePositions } from './MainframeModel'
import { moduleById } from '../data/architecture'

function CameraRig({ mode, selected, reduced, compact, cameraAction }) {
  const controls = useRef()
  const { camera, invalidate } = useThree()
  const intro = useRef(true)
  const overview = useMemo(() => mode === 'hero'
    ? { position: [5.8, 4.08, compact ? 9.1 : 8.05], target: [0.04, 1.86, 0] }
    : { position: [6.1, 3.9, compact ? 11.5 : 8.5], target: [0, 1.79, 0] }, [mode, compact])
  const fly = useRef(null)

  useEffect(() => () => fly.current?.kill(), [])
  useEffect(() => {
    const control = controls.current
    const focus = modulePositions[selected]
    const target = focus ? [focus[0], focus[1] * 0.56 + 0.86, 0.24] : overview.target
    const position = focus ? [focus[0] + 3.1, target[1] + 1.48, compact ? 8.7 : 6.7] : overview.position
    fly.current?.kill()
    const duration = reduced || intro.current ? 0 : 0.85
    intro.current = false
    fly.current = gsap.timeline({ defaults: { duration, ease: 'power3.out' }, onUpdate: () => { control.update(); invalidate() } })
      .to(camera.position, { x: position[0], y: position[1], z: position[2] }, 0)
      .to(control.target, { x: target[0], y: target[1], z: target[2] }, 0)
    control.update()
    return () => fly.current?.kill()
  }, [camera, invalidate, overview, selected, compact, reduced])

  useEffect(() => {
    if (!cameraAction.id) return
    const control = controls.current
    const offset = camera.position.clone().sub(control.target)
    let target = control.target.toArray()
    if (cameraAction.type === 'rotate') offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 5)
    if (cameraAction.type === 'in') offset.setLength(Math.max(4.2, offset.length() * 0.79))
    if (cameraAction.type === 'out') offset.setLength(Math.min(17, offset.length() * 1.26))
    if (cameraAction.type === 'reset') target = overview.target
    const position = cameraAction.type === 'reset' ? overview.position : offset.add(control.target).toArray()
    fly.current?.kill()
    fly.current = gsap.timeline({ defaults: { duration: reduced ? 0 : 0.55, ease: 'power2.out' }, onUpdate: () => { control.update(); invalidate() } })
      .to(camera.position, { x: position[0], y: position[1], z: position[2] }, 0)
      .to(control.target, { x: target[0], y: target[1], z: target[2] }, 0)
  }, [cameraAction, camera, invalidate, overview, reduced])
  return <OrbitControls ref={controls} makeDefault enableDamping={!reduced} enablePan={false}
    enableZoom={true} minDistance={4.2} maxDistance={17} minPolarAngle={0.66} maxPolarAngle={1.56}
    rotateSpeed={compact ? 0.55 : 0.8} zoomSpeed={0.55} onStart={() => fly.current?.kill()} />
}

function Particles({ count, reduced }) {
  const group = useRef()
  const array = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const phase = i * 2.39996
      const radius = 2.25 + (i % 11) * 0.17
      data.set([Math.sin(phase) * radius, 0.17 + ((i * 37) % 101) * 0.043, Math.cos(phase) * radius], i * 3)
    }
    return data
  }, [count])
  useFrame((_, delta) => { if (!reduced) group.current.rotation.y += delta * 0.065 })
  return <points ref={group}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[array, 3]} /></bufferGeometry>
    <pointsMaterial color="#77f4dd" size={0.028} transparent opacity={0.74} depthWrite={false} toneMapped={false} />
  </points>
}

function Platform() {
  return <group>
    <mesh position-y={0.012} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[2.67, 2.68, 112]} /><meshBasicMaterial color="#398577" transparent opacity={0.64} />
    </mesh>
    <mesh position-y={0.012} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[3.11, 3.12, 112]} /><meshBasicMaterial color="#356172" transparent opacity={0.52} />
    </mesh>
    <gridHelper args={[10, 32, '#28515e', '#1b3c49']} material-transparent material-opacity={0.3} />
  </group>
}

function Connections({ selected }) {
  const lines = useMemo(() => (moduleById[selected]?.links ?? []).map(key => {
    const from = new THREE.Vector3(...modulePositions[selected])
    const to = new THREE.Vector3(...modulePositions[key])
    const middle = from.clone().lerp(to, 0.5)
    middle.z += 0.42
    return new Float32Array(new THREE.QuadraticBezierCurve3(from, middle, to).getPoints(22).flatMap(point => point.toArray()))
  }), [selected])
  return lines.map((array, index) => <line key={index}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[array, 3]} /></bufferGeometry>
    <lineBasicMaterial color="#73f5d7" transparent opacity={0.74} depthTest={false} />
  </line>)
}

function FirstFrame({ onReady }) {
  const requested = useRef(false)
  const frame = useRef(0)
  useFrame(() => {
    if (requested.current) return
    requested.current = true
    frame.current = requestAnimationFrame(() => onReady(true))
  })
  useEffect(() => () => {
    cancelAnimationFrame(frame.current)
    requested.current = false
  }, [])
  return null
}

export default function MainframeScene({ mode, selected, onSelect, exploded, reduced, compact, cameraAction }) {
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const container = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(container.current)
    return () => { observer.disconnect(); document.body.style.cursor = '' }
  }, [])
  return <div ref={container} className="canvas-wrap" role="img" aria-label="Interactive 3D rendering of a three-rack mainframe concept cabinet. Use camera controls and the architecture diagram for keyboard interaction.">
    <Canvas dpr={[1, compact ? 1.25 : 1.6]} frameloop={visible ? 'always' : 'demand'}
      camera={{ position: [6.4, 4.2, 8.9], fov: 32, near: 0.1, far: 55 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.75} />
      <hemisphereLight args={['#c2e3ff', '#243645', 1.7]} />
      <directionalLight position={[2, 6, 4]} intensity={3.9} color="#c1deff" />
      <directionalLight position={[-4, 2.4, 1]} intensity={2.5} color="#6dfbe1" />
      <pointLight position={[2, 2.3, -2]} color="#8a8bff" intensity={24} distance={11} />
      <Platform />
      <MainframeModel selected={selected} onSelect={onSelect} exploded={exploded} reduced={reduced} />
      {!exploded && selected && <Connections selected={selected} />}
      <Particles count={reduced ? 14 : compact ? 25 : 64} reduced={reduced} />
      <CameraRig mode={mode} selected={selected} compact={compact} reduced={reduced} cameraAction={cameraAction} />
      <FirstFrame onReady={setReady} />
    </Canvas>
    {!ready && <div className="scene-illustration scene-boot" aria-hidden="true"><img src={import.meta.env.BASE_URL + 'cabinet.svg'} alt="" /></div>}
  </div>
}
