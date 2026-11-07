import { Component, Suspense, lazy, useEffect, useState } from 'react'
import { Box, Minus, Plus, RotateCcw, Scan } from 'lucide-react'

const MainframeScene = lazy(() => import('../scenes/MainframeScene.jsx'))

export function useMedia(query) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const media = matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function Illustration({ status }) {
  return <div className="scene-illustration"><img src={import.meta.env.BASE_URL + 'cabinet.svg'} alt="Three-quarter illustration of a modular cabinet with illuminated server trays and ventilation panels" />{status && <span>{status}</span>}</div>
}

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <Illustration status="Illustrated view" /> : this.props.children
  }
}

function canRenderWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export function SceneView({ mode = 'architecture', selected, onSelect, exploded = false, diagram = false }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const compact = useMedia('(max-width: 700px)')
  const [webGL] = useState(canRenderWebGL)
  const [cameraAction, setCameraAction] = useState({ type: '', id: 0 })
  const act = type => setCameraAction(previous => ({ type, id: previous.id + 1 }))
  const interactive = webGL && !diagram

  return <div className={`scene-view scene-${mode}`}>
    {!interactive ? <Illustration status="Illustrated view" /> :
      <SceneBoundary><Suspense fallback={<Illustration status="Loading 3D view" />}>
        <MainframeScene mode={mode} selected={selected} onSelect={onSelect} exploded={exploded} reduced={reduced}
          compact={compact} cameraAction={cameraAction} />
      </Suspense></SceneBoundary>}
    {interactive && mode !== 'tour' && <div className="scene-controls" aria-label="Camera controls">
      <button className="icon-button" type="button" title="Rotate camera" aria-label="Rotate camera" onClick={() => act('rotate')}><Scan size={16} /></button>
      <button className="icon-button" type="button" title="Zoom in" aria-label="Zoom in" onClick={() => act('in')}><Plus size={16} /></button>
      <button className="icon-button" type="button" title="Zoom out" aria-label="Zoom out" onClick={() => act('out')}><Minus size={16} /></button>
      <button className="icon-button" type="button" title="Reset camera" aria-label="Reset camera" onClick={() => act('reset')}><RotateCcw size={15} /></button>
    </div>}
    {!interactive && mode === 'architecture' && <a className="scene-fallback-link" href="#/architecture" onClick={event => { event.preventDefault(); document.getElementById('architecture-diagram')?.focus() }}><Box size={15} /> Explore the 2D diagram</a>}
  </div>
}
