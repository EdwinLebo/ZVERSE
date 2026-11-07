import { Pause, Play, RotateCcw, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Badge } from './UI'

export const money = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
export const formatMoney = cents => money.format(cents / 100)
export const formatTime = seconds => seconds.toFixed(2) + ' s'

export function EngineControls({ engine, snapshot, withSeed = false }) {
  const [seed, setSeed] = useState(String(snapshot.seed))
  const validSeed = /^\d{1,10}$/.test(seed) && Number(seed) <= 4294967295
  function start() {
    if (snapshot.running) engine.pause()
    else {
      if (snapshot.time === 0 && !snapshot.latest) engine.configure({ traffic: true })
      engine.start()
    }
  }
  return <div className="engine-controls">
    <div className="toolbar">
      <Badge tone={snapshot.running ? 'mint' : 'neutral'}>{snapshot.running ? 'RUNNING' : snapshot.time ? 'PAUSED' : 'READY'}</Badge>
      <button type="button" className="button compact-button primary" onClick={start}>
        {snapshot.running ? <Pause size={15} /> : <Play size={15} />}
        {snapshot.running ? 'Pause' : snapshot.time ? 'Resume' : 'Start'}
      </button>
      <button type="button" className="button compact-button secondary" onClick={() => { engine.reset(); setSeed(String(snapshot.seed)) }}><RotateCcw size={15} /> Reset</button>
      <label className="inline-field">Speed<select value={snapshot.speed} onChange={event => engine.setSpeed(Number(event.target.value))}>
        {[0.5, 1, 2, 5].map(speed => <option value={speed} key={speed}>{speed}×</option>)}
      </select></label>
      <output className="clock" aria-label="Simulation time">{formatTime(snapshot.time)}</output>
    </div>
    {withSeed && <form className="seed-form" onSubmit={event => { event.preventDefault(); if (validSeed) engine.reset(Number(seed)) }}>
      <label htmlFor="simulation-seed">Random seed</label><input id="simulation-seed" inputMode="numeric" value={seed} onChange={event => setSeed(event.target.value)} aria-invalid={!validSeed} />
      <button type="submit" className="button secondary compact-button" disabled={!validSeed}>Apply and reset</button>
    </form>}
  </div>
}

export function AuditList({ events, empty = 'No events recorded. Run a demonstration to add an entry.', limit = 10 }) {
  if (!events.length) return <div className="empty-state">{empty}</div>
  return <ol className="audit-list" aria-label="Newest audit events first">
    {events.slice(0, limit).map(event => {
      const Icon = event.level === 'allow' ? ShieldCheck : event.level === 'alert' ? TriangleAlert : ShieldAlert
      return <li key={event.id}><span className={`audit-icon tone-${event.level}`}><Icon size={17} /></span>
        <div><strong>{event.label}</strong><p>{event.detail}</p></div><time>{formatTime(event.at)}</time></li>
    })}
  </ol>
}
