import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'

export const modulePositions = {
  io: [-1.18, 2.66, 0.53], storage: [-1.18, 1.2, 0.53],
  processors: [0, 3.16, 0.53], memory: [0, 2.57, 0.53], zos: [0, 1.92, 0.53],
  cics: [0, 1.25, 0.53], db2: [0, 0.59, 0.53],
  racf: [1.18, 2.72, 0.53], wlm: [1.18, 1.88, 0.53], monitoring: [1.18, 0.96, 0.53],
}

const box = new THREE.BoxGeometry()
const material = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness })
const metal = material('#445b72', 0.54, 0.37)
const dark = material('#111c2b', 0.61, 0.41)
const frame = material('#2e435a', 0.55, 0.38)
const slot = material('#071322', 0.23, 0.57)
const copper = material('#57677c', 0.56, 0.39)
const tinted = material('#2b5161', 0.45, 0.36)
const highlight = new THREE.MeshStandardMaterial({ color: '#3c9c9c', emissive: '#176659', emissiveIntensity: 0.72, metalness: 0.43, roughness: 0.28 })
const mint = new THREE.MeshStandardMaterial({ color: '#94ffee', emissive: '#59ffdc', emissiveIntensity: 2.1, toneMapped: false })
const violet = new THREE.MeshStandardMaterial({ color: '#b8b0ff', emissive: '#9179fa', emissiveIntensity: 1.25, toneMapped: false })
const dim = new THREE.MeshStandardMaterial({ color: '#55a69f', emissive: '#36a497', emissiveIntensity: 0.6 })
const signal = new THREE.MeshStandardMaterial({ color: '#8ee5c3', emissive: '#72ffcf', emissiveIntensity: 1.4, toneMapped: false })

const bays = [
  { x: -1.18, h: 3.24, keys: ['io', 'storage'], accent: violet },
  { x: 0, h: 3.82, keys: ['processors', 'memory', 'zos', 'cics', 'db2'], accent: mint },
  { x: 1.18, h: 3.38, keys: ['racf', 'wlm', 'monitoring'], accent: mint },
]

function Block({ position, size, surface }) {
  return <mesh position={position} scale={size} geometry={box} material={surface} dispose={null} />
}

function RepeatedBlocks({ items, surface }) {
  const mesh = useRef()
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    items.forEach(([position, size], index) => {
      dummy.position.set(...position)
      dummy.scale.set(...size)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={mesh} args={[box, surface, items.length]} dispose={null} />
}

function Cabinet({ bay, selected, onSelect, exploded, reduced }) {
  const rack = useRef()
  const { x, h, keys, accent } = bay
  useLayoutEffect(() => {
    const animation = gsap.to(rack.current.position, {
      x: exploded ? x * 1.33 : x, z: exploded ? Math.abs(x) * -0.23 : 0,
      duration: reduced ? 0 : 0.75, ease: 'power3.inOut',
    })
    return () => animation.kill()
  }, [x, exploded, reduced])
  return <group ref={rack} position-x={x}>
    <Block position={[0, h / 2 + 0.11, -0.05]} size={[1.08, h, 1.03]} surface={dark} />
    <Block position={[0, h + 0.12, -0.025]} size={[1.12, 0.085, 1.13]} surface={metal} />
    <Block position={[0, 0.14, -0.015]} size={[1.1, 0.16, 1.11]} surface={metal} />
    <Block position={[-0.506, h / 2 + 0.14, 0.50]} size={[0.052, h - 0.13, 0.08]} surface={metal} />
    <Block position={[0.506, h / 2 + 0.14, 0.50]} size={[0.052, h - 0.13, 0.08]} surface={metal} />
    <Block position={[0, h - 0.09, 0.497]} size={[0.96, 0.29, 0.075]} surface={frame} />
    <Block position={[-0.30, h - 0.065, 0.544]} size={[0.20, 0.062, 0.028]} surface={copper} />
    <Block position={[0.36, h - 0.04, 0.542]} size={[0.047, 0.012, 0.016]} surface={signal} />
    <Block position={[0, 0.30, 0.498]} size={[0.95, 0.11, 0.075]} surface={frame} />
    <RepeatedBlocks surface={frame} items={Array.from({ length: 24 }, (_, index) => [
      [0.548, 0.25 + index * (h - 0.38) / 24, -0.075], [0.021, 0.041, 0.78],
    ])} />
    <RepeatedBlocks surface={slot} items={Array.from({ length: 12 }, (_, index) => [
      [-0.42 + index * 0.076, h + 0.166, -0.19], [0.033, 0.008, 0.54],
    ])} />
    {keys.map((key, index) => <Tray key={key} id={key} y={modulePositions[key][1]} size={x === 0 ? 0.53 : keys.length === 2 ? 0.68 : 0.64}
      open={exploded} index={index} active={selected === key} accent={accent} onSelect={onSelect} reduced={reduced} />)}
    {x < 0 && <Block position={[0, 1.92, 0.51]} size={[0.91, 0.47, 0.12]} surface={frame} />}
    {x < 0 && <Block position={[0, 0.63, 0.51]} size={[0.91, 0.32, 0.12]} surface={tinted} />}
  </group>
}

function Tray({ id, y, size, open, index, active, accent, onSelect, reduced }) {
  const tray = useRef()
  useLayoutEffect(() => {
    const animation = gsap.to(tray.current.position, {
      z: open ? 0.36 + (index % 3) * 0.23 : 0, duration: reduced ? 0 : 0.7, ease: 'power3.inOut',
    })
    return () => animation.kill()
  }, [open, index, reduced])
  return <group ref={tray} position-y={y}
    onClick={onSelect ? event => { event.stopPropagation(); if (event.delta < 5) onSelect(id) } : undefined}
    onPointerOver={onSelect ? event => { event.stopPropagation(); document.body.style.cursor = 'pointer' } : undefined}
    onPointerOut={onSelect ? () => { document.body.style.cursor = '' } : undefined}>
    <Block position={[0, 0, 0.14]} size={[0.92, size, 0.8]} surface={active ? highlight : index % 2 ? tinted : frame} />
    <Block position={[0, 0, 0.556]} size={[0.91, size * 0.75, 0.046]} surface={active ? tinted : dark} />
    <Block position={[0, size * 0.46, 0.547]} size={[0.9, 0.019, 0.025]} surface={active ? mint : index % 2 === 0 ? dim : metal} />
    <Block position={[-0.396, 0, 0.595]} size={[0.027, size * 0.62, 0.047]} surface={copper} />
    <RepeatedBlocks surface={metal} items={Array.from({ length: 8 }, (_, i) => [
      [-0.062, (i - 3.5) * size * 0.08, 0.585], [0.55, 0.011, 0.016],
    ])} />
    <RepeatedBlocks surface={active ? mint : accent} items={Array.from({ length: 4 }, (_, i) => [
      [0.348, (i - 1.5) * 0.055, 0.59], [i % 2 ? 0.025 : 0.043, 0.009, 0.02],
    ])} />
    {open && <RepeatedBlocks surface={dim} items={Array.from({ length: 6 }, (_, i) => [
      [(i % 3 - 1) * 0.24, size / 2 + 0.01, Math.floor(i / 3) * 0.26], [0.16, 0.039, 0.17],
    ])} />}
  </group>
}

export default function MainframeModel(props) {
  const phase = useRef(0)
  useFrame((_, delta) => {
    if (!props.reduced) phase.current += delta
    signal.emissiveIntensity = 1.1 + (props.reduced ? 0 : Math.sin(phase.current * 2.3) * 0.7)
  })
  return <group>
    <Block position={[0, 0.037, -0.035]} size={[3.74, 0.074, 1.6]} surface={metal} />
    <Block position={[0, 0.08, 0.76]} size={[3.54, 0.014, 0.018]} surface={dim} />
    {bays.map(bay => <Cabinet key={bay.x} bay={bay} {...props} />)}
  </group>
}
