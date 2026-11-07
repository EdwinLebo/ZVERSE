import { modules, moduleById } from '../data/architecture'

export function ArchitectureDiagram({ selected, onSelect }) {
  const linked = moduleById[selected]?.links ?? []
  return <section className="panel diagram-panel" id="architecture-diagram" tabIndex={-1} aria-labelledby="diagram-title">
    <div className="panel-header"><div><div className="meta">SYSTEM MAP / 10 MODULES</div><h2 id="diagram-title">2D architecture diagram</h2></div></div>
    {['Hardware', 'Software'].map(group => <div key={group} className="diagram-group">
      <div className="meta">{group} layer</div>
      <div className="module-grid">{modules.filter(module => module.group === group).map(module => <button key={module.id}
        type="button" className={`module-choice ${linked.includes(module.id) ? 'connected' : ''}`}
        aria-pressed={selected === module.id} onClick={() => onSelect(module.id)}>
        <span>{module.label}</span><small>{module.name}</small>{linked.includes(module.id) && <i className="linked-dot" aria-label="Connected module" />}
      </button>)}</div>
    </div>)}
    <p className="muted small">Select any module to read its role. Dotted borders mark connections to the selected module.</p>
  </section>
}
