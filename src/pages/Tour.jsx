import { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { ExhibitHeading } from '../components/UI'
import { SceneView } from '../components/SceneView'
import { moduleById } from '../data/architecture'
import { tour } from '../data/tour'

export default function Tour() {
  const [index, setIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const step = tour[index]
  function next() {
    if (index === tour.length - 1) setCompleted(true)
    else setIndex(index + 1)
  }
  function restart() { setCompleted(false); setIndex(0) }
  return <div className="shell exhibit-page">
    <ExhibitHeading code="GUIDED EXPERIENCE / 07 STOPS" title="A Day in the Life of a Transaction" description="Follow a cash withdrawal from the ATM to the account ledger and back.">
      <a className="button secondary" href="#/learn">Skip tour <ArrowRight size={17} /></a>
    </ExhibitHeading>
    <div className="architecture-layout tour-layout">
      <div className="panel viewport-panel"><div className="panel-header"><div className="meta">FOCUS / {moduleById[step.module].label}</div></div>
        <SceneView mode="tour" selected={step.module} />
        <ol className="tour-route" aria-label="Tour stops">{tour.map((stop, position) => <li key={stop.module}>
          <button type="button" aria-current={position === index ? 'step' : undefined} aria-label={`${String(position + 1).padStart(2, '0')} · ${stop.title}`} onClick={() => { setIndex(position); setCompleted(false) }}>{String(position + 1).padStart(2, '0')}</button>
        </li>)}</ol>
      </div>
      <section className="panel detail-panel tour-detail" aria-live="polite">
        <div className="meta">{completed ? 'TOUR COMPLETE' : `STOP ${String(index + 1).padStart(2, '0')} / 07`}</div>
        <h2>{completed ? 'Follow your own request' : step.title}</h2>
        <p>{completed ? 'Build a fictional request in the transaction lab and see how changes to the amount, identity or workload affect its outcome.' : step.text}</p>
        {!completed && <details key={index}><summary>Technical details</summary><p>{step.tech}</p></details>}
        <div className="toolbar tour-controls">{completed ? <>
          <button type="button" className="button secondary" onClick={restart}><RotateCcw size={16} /> Replay</button><a className="button primary" href="#/transaction">Open transaction lab <ArrowRight size={16} /></a>
        </> : <><button type="button" className="button secondary" disabled={!index} onClick={() => setIndex(index - 1)}><ArrowLeft size={16} /> Previous</button>
          <button type="button" className="button primary" onClick={next}>{index === tour.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} /></button></>}</div>
      </section>
    </div>
  </div>
}
