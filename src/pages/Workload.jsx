import { Activity, ArrowRight, Boxes, Layers3 } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'
import { EngineControls } from '../components/SimulationUI'
import { useSimulation } from '../hooks/SimulationContext'
import { AGE_LIMIT, policies, presets, QUEUE_LIMIT } from '../simulation/WorkloadScheduler'

const sliders = [
  ['rate', 'Incoming rate', 0, 100, ' req/s'],
  ['capacity', 'Processing capacity', 1, 90, ' work/s'],
  ['workers', 'Available workers', 1, 12, ''],
  ['highShare', 'High-priority requests', 0, 100, '%'],
]

export default function Workload() {
  const [engine, snapshot] = useSimulation()
  const { config, metrics, queue, workers } = snapshot
  function startTraffic() { engine.configure({ traffic: true }); engine.start() }
  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 04 / WORKLOAD LAB" title="Control the Workload" description="Change arrival demand, worker capacity and scheduling. Then watch the queue respond.">
      <Badge>SHARED SIMULATION CLOCK</Badge>
    </ExhibitHeading>
    <EngineControls engine={engine} snapshot={snapshot} />
    <div className="lab-grid workload-grid">
      <section className="panel form-panel">
        <div className="panel-header"><div><div className="meta">DEMAND PROFILE</div><h2>Workload controls</h2></div><Layers3 size={23} /></div>
        <label>Scenario<select value={config.name} onChange={event => engine.configure(presets.find(item => item.name === event.target.value))}>
          {presets.map(item => <option key={item.name}>{item.name}</option>)}
        </select></label>
        {sliders.map(([key, label, min, max, unit]) => <label className="range-field" key={key}>
          <span>{label}<output>{config[key]}{unit}</output></span>
          <input type="range" min={min} max={max} value={config[key]} onChange={event => engine.configure({ [key]: Number(event.target.value) })} />
        </label>)}
        <div className="form-grid">
          <label>Priority for remaining requests<select value={config.priority} onChange={event => engine.configure({ priority: event.target.value })}>
            <option value="normal">Normal</option><option value="low">Low</option></select></label>
          <label>Scheduling policy<select value={config.policy} onChange={event => engine.configure({ policy: event.target.value })}>
            {Object.entries(policies).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
        </div>
        <button className="button primary wide-button" type="button" onClick={config.traffic ? () => engine.configure({ traffic: false }) : startTraffic}>
          <Activity size={17} /> {config.traffic ? 'Stop background arrivals' : 'Run background traffic'} <ArrowRight size={17} />
        </button>
      </section>
      <div className="stack">
        <section className="panel workload-panel" aria-labelledby="queue-title">
          <div className="panel-header"><div><div className="meta">ADMISSION QUEUE</div><h2 id="queue-title">Waiting requests</h2></div><span className="trace-id">{metrics.queue} / {QUEUE_LIMIT}</span></div>
          <div className="queue-visual" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <span key={index} className={queue[index] ? `packet packet-${queue[index].priority}` : 'empty-packet'} />)}</div>
          <div className="queue-legend"><span><i className="packet-high" />High</span><span><i className="packet-normal" />Normal</span><span><i className="packet-low" />Low</span></div>
          <p className="muted small">{metrics.queue > 24 ? 'Showing the first 24 requests. ' : ''}{metrics.dropped} rejected at the admission limit since reset.</p>
          <div className="workload-readouts"><div><span>THROUGHPUT</span><strong>{metrics.tps.toFixed(1)} <small>tx/s</small></strong></div><div><span>AVERAGE LATENCY</span><strong>{metrics.latency.toFixed(0)} <small>ms</small></strong></div></div>
        </section>
        <section className="panel workload-panel"><div className="panel-header"><div><div className="meta">WORKER POOL</div><h2>Processing slots</h2></div><Boxes size={21} /></div>
          <div className="worker-grid">{Array.from({ length: Math.max(config.workers, workers.length) }, (_, index) => {
            const job = workers[index]
            return <div className="worker" key={index}><span>Slot {String(index + 1).padStart(2, '0')}</span>
              <strong>{job?.id ?? 'Idle'}</strong><progress max="1" value={job?.ratio ?? 0} aria-label={`Slot ${index + 1} progress`} /></div>
          })}</div>
          <p className="muted small">{workers.length} active requests. In-flight requests finish if worker capacity drops.</p>
        </section>
      </div>
    </div>
    <section className="panel explainer-panel"><div className="meta">SCHEDULING MODEL</div><h2>{policies[config.policy]}</h2>
      <p>{config.policy === 'fifo' ? 'Requests enter processing in arrival order as workers become available.' :
        config.policy === 'priority' ? `High priority goes first, followed by normal and low. Requests waiting at least ${AGE_LIMIT} simulated seconds advance from the head of the queue.` :
          `Workers draw from a repeating 3:2:1 high, normal and low class rotation. The oldest request takes precedence after ${AGE_LIMIT} simulated seconds.`}</p>
      <p className="muted small">These teaching policies illustrate contention and priority. Real z/OS WLM manages resources against service goals.</p>
      <a className="text-link" href="#/operations">Compare live telemetry <ArrowRight size={16} /></a>
    </section>
  </div>
}
