import { Check, CircleDot, Radio, X } from 'lucide-react'
import { Badge } from './UI'
import { stages } from '../simulation/TransactionEngine'

export function TransactionFlow({ job, running }) {
  const terminal = ['completed', 'rejected', 'failed'].includes(job?.state)
  const description = job ? terminal ? job.detail : stages[job.stage].description : 'Submit a request to follow its path from intake to the audit log.'
  return <section className="panel flow-panel" aria-labelledby="flow-title">
    <div className="panel-header"><div><div className="meta">SYSTEM TRACE</div><h2 id="flow-title">Transaction flow</h2></div><div className="trace-labels"><span className="trace-id">{job?.id ?? 'AWAITING REQUEST'}</span>{terminal && <Badge tone={job.state === 'completed' ? 'mint' : 'amber'}>{job.result}</Badge>}</div></div>
    <ol className={`transaction-stages ${running ? 'trace-running' : ''}`}>
      {stages.map((stage, index) => {
        const active = Boolean(job && !terminal && job.stage === index)
        const visited = Boolean(job && job.visited & (1 << index))
        const skipped = Boolean(job && job.stage > index && !visited)
        const denied = terminal && job.state !== 'completed' && index === job.errorStage
        return <li key={stage.name} className={`${active ? 'stage-active' : visited ? 'stage-visited' : skipped ? 'stage-skipped' : ''} ${denied ? 'stage-denied' : ''}`} aria-current={active ? 'step' : undefined}>
          <div className="stage-dot">{denied ? <X size={14} /> : active ? <Radio size={15} /> : visited ? <Check size={14} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div>
          <div><strong>{stage.name}</strong><small>{stage.system}</small></div>
          <span className="stage-status">{denied ? 'Stopped' : active ? 'In progress' : visited ? 'Done' : skipped ? 'Skipped' : 'Waiting'}</span>
        </li>
      })}
    </ol>
    <div className="trace-caption" role="status"><CircleDot size={16} /> {description}</div>
    <p className="muted small">Illustrative path. Actual processing sequences depend on the application and installation.</p>
  </section>
}
