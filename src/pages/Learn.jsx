import { useState } from 'react'
import { ArrowRight, BookOpen, CircleHelp, Search } from 'lucide-react'
import { ExhibitHeading } from '../components/UI'
import { comparison, glossary, topics } from '../data/learning'
import { references } from '../data/architecture'

export default function Learn() {
  const [query, setQuery] = useState('')
  const matches = glossary.filter(term => term.join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 06 / FIELD GUIDE" title="Learn the Fundamentals" description="Read the field guide, take the seven-stop tour and check what you remember." />
    <div className="learn-launch lab-grid">
      <a className="panel learn-link" href="#/tour"><BookOpen size={25} /><div><span className="meta">07 STOPS</span><h2>A Day in the Life of a Transaction</h2><p>Follow an ATM withdrawal through the concept cabinet.</p></div><ArrowRight size={22} /></a>
      <a className="panel learn-link" href="#/quiz"><CircleHelp size={25} /><div><span className="meta">18 QUESTIONS</span><h2>Test Your Mainframe Knowledge</h2><p>Practice at either level and see an explanation after each answer.</p></div><ArrowRight size={22} /></a>
    </div>
    <div className="reading-grid">{topics.map(({ title, text }) => <article className="panel explainer-panel" key={title}><h2>{title}</h2><p>{text}</p></article>)}</div>
    <section className="panel explainer-panel"><h2>Mainframes vs traditional servers</h2>
      <table className="comparison"><thead><tr><th scope="col">Consideration</th><th scope="col">Mainframe environments</th><th scope="col">Traditional server environments</th></tr></thead>
        <tbody>{comparison.map(([label, mainframe, server]) => <tr key={label}><th scope="row">{label}</th><td>{mainframe}</td><td>{server}</td></tr>)}</tbody></table>
    </section>
    <section className="panel explainer-panel"><div className="panel-header"><div><div className="meta">REFERENCE / {glossary.length} TERMS</div><h2>Glossary</h2></div></div>
      <label className="search-field"><Search size={17} /><span className="sr-only">Search glossary</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search terms or definitions" /></label>
      <p className="muted small" role="status">{matches.length} matching {matches.length === 1 ? 'term' : 'terms'}</p>
      <dl className="glossary">{matches.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
    </section>
    <section className="panel explainer-panel"><h2>Continue with IBM documentation</h2><ul className="reference-list">
      {references.map(([label, url]) => <li key={url}><a className="text-link" href={url}>{label} <ArrowRight size={14} /></a></li>)}
    </ul></section>
  </div>
}
