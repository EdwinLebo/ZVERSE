import { ArrowRight, Code2, ExternalLink } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'

const features = [
  ['Procedural cabinet', 'Three.js assembles reusable metal enclosures, trays and instanced vents. A selectable 2D diagram maps the same concepts.'],
  ['Deterministic engine', 'A seeded generator feeds a fixed-step queue. Worker capacity, scheduling and transaction outcomes drive the metrics.'],
  ['Learning experience', 'A guided tour, searchable glossary and locally saved quiz connect the labs to enterprise computing concepts.'],
]
const links = [['GitHub repository', import.meta.env.VITE_GITHUB_URL], ['Back to portfolio', import.meta.env.VITE_PORTFOLIO_URL]]
const screenshots = [
  ['exhibition', 'Exhibition home', 'The exhibition home with the interactive three-rack cabinet and links to the labs.'],
  ['trace', 'Transaction trace', 'The transaction lab shows an approved debit and its completed processing stages.'],
]

export default function Project() {
  return <div className="shell exhibit-page">
    <ExhibitHeading code="PORTFOLIO / PROJECT NOTES" title="ZVERSE — Interactive Mainframe Simulator"
      description="An immersive educational web application that visualizes enterprise mainframe architecture, transaction processing, workload management and cybersecurity through interactive 3D experiences and real-time simulations.">
      <Badge>INDEPENDENT EDUCATIONAL PROJECT</Badge>
    </ExhibitHeading>
    <div className="lab-grid">
      <article className="panel explainer-panel"><div className="meta">PROJECT OVERVIEW</div><h2>Make invisible work visible</h2>
        <p>Most users see a cash withdrawal as a receipt or a balance change. The systems behind it can be difficult for a student to observe directly. ZVERSE gives visitors a fictional system they can inspect and change safely.</p>
        <h3>Objectives</h3><p>Connect hardware and software concepts to one request, show how contention changes system behavior, and make security decisions visible in a shared audit log.</p>
      </article>
      <article className="panel explainer-panel"><div className="meta">PORTFOLIO CONTEXT</div><h2>Multimedia meets enterprise computing</h2>
        <p>Interactive Multimedia / Software Engineering / Enterprise Computing</p>
        <p>Portfolio project for a Multimedia Computing student and IBM Z Student Ambassador at Tshwane University of Technology, South Africa.</p>
        <div className="tech-tags">{['JavaScript', 'React', 'Three.js', 'GSAP', 'Tailwind CSS'].map(tech => <span key={tech}>{tech}</span>)}</div>
      </article>
    </div>
    <div className="reading-grid">{features.map(([title, description]) => <article className="panel explainer-panel" key={title}><h2>{title}</h2><p>{description}</p></article>)}</div>
    <section className="panel explainer-panel"><div className="panel-header"><div><div className="meta">IMPLEMENTATION</div><h2>Technical architecture</h2></div><Code2 size={23} /></div>
      <ol className="implementation"><li><strong>Presentation</strong><span>React routes and shared controls</span></li><li><strong>Simulation</strong><span>Fixed clock, queue, work budget and security policy</span></li><li><strong>Views</strong><span>Three.js scenes, transaction trace, charts and audit</span></li></ol>
      <h3>What I learned</h3><p>One clock keeps the transaction trace and telemetry in agreement. A commit boundary protects account state, and an independent 2D diagram keeps the architecture explorable when a 3D renderer is unavailable.</p>
    </section>
    <section className="panel explainer-panel"><div className="meta">GALLERY</div><h2>Screenshots</h2>
      <div className="screenshot-grid">{screenshots.map(([key, caption, alt]) => <figure key={key}><img src={`${import.meta.env.BASE_URL}screenshots/${key}.jpg`} alt={alt} loading="lazy" width="1440" height={key === 'exhibition' ? 900 : 1120} /><figcaption>{caption}</figcaption></figure>)}</div>
    </section>
    <section className="panel explainer-panel"><h2>Project links</h2><div className="project-links">
      {links.map(([label, url]) => url && /^https?:\/\//i.test(url) ? <a className="button secondary" href={url} key={label}>{label} <ExternalLink size={16} /></a> : <div className="unconfigured-link" key={label}><strong>{label}</strong><span>Link pending configuration</span></div>)}
    </div><p className="muted small">ZVERSE is independently developed for education. IBM has no affiliation with or endorsement of this project. All operational figures are simulated.</p>
      <a className="text-link" href="#/">Return to the exhibition <ArrowRight size={16} /></a>
    </section>
  </div>
}
