import { useState } from 'react'
import { ArrowRight, Box, Layers3, Network } from 'lucide-react'
import { SceneView } from '../components/SceneView'
import { ArchitectureDiagram } from '../components/ArchitectureDiagram'
import { Badge, ExhibitHeading } from '../components/UI'
import { moduleById } from '../data/architecture'

export default function Architecture() {
  const fromHero = new URLSearchParams(location.hash.split('?')[1]).get('module')
  const [selected, select] = useState(Object.hasOwn(moduleById, fromHero) ? fromHero : 'processors')
  const [technical, setTechnical] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [diagram, setDiagram] = useState(false)
  const module = moduleById[selected]

  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 01 / SYSTEM ARCHITECTURE" title="Inside the Mainframe"
      description="Explore ten hardware and software concepts and see how they support a transaction.">
      <div className="segmented" aria-label="Explanation level">
        <button type="button" aria-pressed={!technical} onClick={() => setTechnical(false)}>Beginner</button>
        <button type="button" aria-pressed={technical} onClick={() => setTechnical(true)}>Technical</button>
      </div>
    </ExhibitHeading>
    <div className="architecture-layout">
      <section className="panel viewport-panel" aria-label="Cabinet visualization">
        <div className="panel-header"><Badge>{diagram ? 'SYSTEM MAP' : 'CABINET VIEW'}</Badge><div className="toolbar">
          <button type="button" className="button compact-button secondary" disabled={diagram} aria-pressed={exploded} onClick={() => setExploded(value => !value)}><Layers3 size={16} /> {exploded ? 'Assemble' : 'Explode'}</button>
          <button type="button" className="button compact-button secondary" aria-pressed={diagram} onClick={() => setDiagram(value => !value)}>{diagram ? <Box size={16} /> : <Network size={16} />} {diagram ? 'Show 3D' : 'Show 2D'}</button>
        </div></div>
        {diagram ? <ArchitectureDiagram selected={selected} onSelect={select} /> : <SceneView selected={selected} onSelect={select} exploded={exploded} />}
        <p className="viewport-note">The cabinet is an original concept. Software services are represented as trays for teaching.</p>
      </section>
      <section className="panel detail-panel" aria-label="Selected component">
        <div className="meta" aria-live="polite">{module.group} / {module.label}</div>
        <h2>{module.name}</h2><p>{technical ? module.technical : module.beginner}</p>
        <h3>Why it matters</h3><p>{module.why}</p>
        <h3>In a transaction</h3><p>{module.example}</p>
        <details key={module.id + technical}><summary>{technical ? 'Beginner analogy' : 'Technical details'}</summary><p>{technical ? module.beginner : module.technical}</p></details>
        <div className="connections"><div className="meta">CONNECTED MODULES</div>{module.links.map(link => <button type="button" key={link} onClick={() => select(link)}>{moduleById[link].name} <ArrowRight size={14} /></button>)}</div>
      </section>
    </div>
    {!diagram && <ArchitectureDiagram selected={selected} onSelect={select} />}
  </div>
}
