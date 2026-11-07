import { ArrowLeft, ArrowRight, Box, CircleHelp, Database, Gauge, Layers3, ShieldCheck, Workflow } from 'lucide-react'

export const exhibits = [
  { path: 'architecture', name: 'Architecture', title: 'Inside the Mainframe', description: 'Open the cabinet and trace how hardware and software work together.', icon: Box, colour: 'mint' },
  { path: 'transaction', name: 'Transaction Lab', title: 'Process a Transaction', description: 'Send a banking request through a live, stage-by-stage simulation.', icon: Workflow, colour: 'blue' },
  { path: 'operations', name: 'Operations', title: 'Mainframe Operations Center', description: 'Watch throughput, latency and resource use respond to the same workload.', icon: Gauge, colour: 'violet' },
  { path: 'workload', name: 'Workload Lab', title: 'Control the Workload', description: 'Turn up the demand and see which requests get served first.', icon: Layers3, colour: 'mint' },
  { path: 'security', name: 'Security Lab', title: 'Protect the Mainframe', description: 'Test access policies and see which actions leave an audit trail.', icon: ShieldCheck, colour: 'blue' },
  { path: 'learn', name: 'Learn', title: 'Learn the Fundamentals', description: 'Take a guided tour, look up a term or put your knowledge to the test.', icon: CircleHelp, colour: 'violet' },
]

export function Brand() {
  return <a href="#/" className="brand">
    <img src={import.meta.env.BASE_URL + 'zverse.svg'} width="38" height="38" alt="" />
    <span>ZVERSE<small>INSIDE THE MAINFRAME</small></span>
  </a>
}

export function Eyebrow({ children }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>
}

export function ExhibitHeading({ code, title, description, children }) {
  return <header className="exhibit-heading">
    <a className="back-link" href="#/"><ArrowLeft size={15} /> Exhibition home</a>
    <div className="heading-row"><div><Eyebrow>{code}</Eyebrow><h1 tabIndex={-1}>{title}</h1><p>{description}</p></div>{children}</div>
  </header>
}

export function Badge({ children, tone = 'mint' }) {
  return <span className={`badge badge-${tone}`}><i aria-hidden="true" />{children}</span>
}

export function ExhibitCard({ item, number }) {
  const Icon = item.icon
  return <a href={`#/${item.path}`} className={`exhibit-card theme-${item.colour}`}>
    <div className="card-top"><span className="module-icon"><Icon size={23} strokeWidth={1.6} /></span><span className="card-index">MODULE / {String(number).padStart(2, '0')}</span></div>
    <h3>{item.title}</h3><p>{item.description}</p><span className="card-link">Open exhibit <ArrowRight size={16} /></span>
  </a>
}

export function Footer() {
  return <footer className="site-footer"><div className="shell footer-inner"><Brand />
    <p>Independent educational simulation. No affiliation with or endorsement by IBM.</p>
    <a href="#/project"><Database size={15} /> Project notes <ArrowRight size={14} /></a>
  </div></footer>
}
