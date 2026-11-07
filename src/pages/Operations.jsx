import { Activity, CheckCircle2, Clock3, Cpu, Gauge, Layers3, MemoryStick, ShieldAlert, Workflow } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'
import { AuditList, EngineControls } from '../components/SimulationUI'
import { useSimulation } from '../hooks/SimulationContext'

const stats = [
  ['tps', 'Transactions / second', Gauge, ' tx/s', 1], ['latency', 'Average latency', Clock3, ' ms', 0],
  ['cpu', 'CPU utilization', Cpu, '%', 0], ['memory', 'Memory utilization', MemoryStick, '%', 0],
  ['workloadTypes', 'Active workload types', Layers3, '', 0], ['queue', 'Queue length', Workflow, '', 0],
  ['success', 'Success rate', CheckCircle2, '%', 1], ['rejected', 'Rejected transactions', Activity, '', 0],
  ['security', 'Security alerts & denials', ShieldAlert, '', 0],
]

function Trend({ history, metric, label, color, unit, fixedMax }) {
  const last = history.at(-1)
  const values = history.map(point => point[metric])
  const max = fixedMax ?? Math.max(1, ...values)
  const coordinates = values.map((value, index) => [13 + index * 294 / Math.max(1, values.length - 1), 92 - 78 * value / max])
  const path = coordinates.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return <section className="panel chart-panel">
    <div className="panel-header"><h3>{label}</h3><span>{last ? last[metric].toFixed(1) + unit : '—'}</span></div>
    {last ? <svg viewBox="0 0 320 103" role="img" aria-label={`${label}: latest ${last[metric].toFixed(1)}${unit}, across ${history.length} simulated one-second samples`} preserveAspectRatio="none">
      <defs><linearGradient id={`fill-${metric}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor={color} stopOpacity=".27" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[14, 40, 66, 92].map(y => <path d={`M13 ${y}H307`} key={y} stroke="#26374a" strokeDasharray="3 4" />)}
      {coordinates.length > 1 && <path d={`${path} L307 92 H13 Z`} fill={`url(#fill-${metric})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={coordinates.at(-1)[0]} cy={coordinates.at(-1)[1]} r="3" fill={color} />
    </svg> : <div className="chart-empty">Awaiting first simulated second</div>}
    <div className="chart-axis"><span>{history[0]?.time ?? 0} s</span><span>SIMULATED TIME</span><span>{last?.time ?? 0} s</span></div>
  </section>
}

function Outcomes({ metrics }) {
  const outcomes = [['Approved', metrics.completed, '#6ce7c8'], ['Rejected', metrics.rejected, '#f2ac66'], ['Failed', metrics.failed, '#ff808e']]
  const total = outcomes.reduce((sum, [, count]) => sum + count, 0)
  let position = 0
  const stops = outcomes.map(([, count, color]) => {
    const start = position
    position += total ? count / total * 100 : 0
    return `${color} ${start}% ${position}%`
  })
  return <section className="panel chart-panel outcome-panel">
    <div className="panel-header"><h3>Outcome distribution</h3><span>{total} decisions</span></div>
    <div className="outcome-body">
      <div className="donut" aria-hidden="true" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#253347' }}><span>{total}</span></div>
      <dl>{outcomes.map(([label, count, color]) => <div key={label}><dt><i style={{ background: color }} />{label}</dt><dd>{count}</dd></div>)}</dl>
    </div>
  </section>
}

export default function Operations() {
  const [engine, snapshot] = useSimulation()
  const metrics = snapshot.metrics
  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 03 / LIVE TELEMETRY" title="Mainframe Operations Center" description="Watch workload, performance and access decisions on a shared simulation clock.">
      <Badge tone="amber">SIMULATED DATA — NOT LIVE IBM SYSTEM METRICS</Badge>
    </ExhibitHeading>
    <EngineControls engine={engine} snapshot={snapshot} withSeed />
    <div className="panel load-bar"><div><strong>Synthetic background traffic</strong><p>{snapshot.config.traffic ? `${snapshot.config.rate} arrivals / simulated second` : 'Off. Manual requests still appear in telemetry.'}</p></div>
      <button className="button compact-button secondary" type="button" aria-pressed={snapshot.config.traffic} onClick={() => engine.configure({ traffic: !snapshot.config.traffic })}>{snapshot.config.traffic ? 'Disable traffic' : 'Enable traffic'}</button></div>
    <div className="metric-grid">{stats.map(([key, label, Icon, unit, precision]) => <section className="panel stat" key={key}>
      <div><span>{label}</span><Icon size={18} /></div><strong>{metrics[key] === null ? '—' : metrics[key].toFixed(precision)}<small>{metrics[key] === null ? '' : unit}</small></strong>
    </section>)}</div>
    <div className="chart-grid">
      <Trend history={metrics.history} metric="tps" label="Transactions over time" color="#6ce7c8" unit=" tx/s" />
      <Trend history={metrics.history} metric="latency" label="Request latency" color="#8baeff" unit=" ms" />
      <Trend history={metrics.history} metric="cpu" label="CPU workload" color="#b99afc" unit="%" fixedMax={100} />
      <Outcomes metrics={metrics} />
    </div>
    <p className="muted small">Throughput and latency describe processed requests over the last five simulated seconds. CPU measures work consumed against its budget, and memory represents occupied queue and worker slots. Outcomes count all decisions, including admission rejections.</p>
    <section className="panel audit-panel"><div className="panel-header"><div><div className="meta">SHARED TELEMETRY</div><h2>Operational activity</h2></div></div><AuditList events={snapshot.audit} /></section>
  </div>
}
