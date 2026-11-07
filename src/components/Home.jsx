import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Box, Cpu, Move, Play, Radio, ScanLine, Workflow } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Badge, ExhibitCard, Eyebrow, exhibits } from './UI'
import { moduleById } from '../data/architecture'
import { SceneView } from './SceneView'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const page = useRef(null)
  const [selected, select] = useState(null)
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.from('.hero-copy > *', { y: 15, opacity: 0, duration: 0.65, stagger: 0.07, ease: 'power2.out', clearProps: 'all' })
      gsap.from('.exhibit-card', { y: 22, opacity: 0, stagger: 0.075, duration: 0.48, clearProps: 'all',
        scrollTrigger: { trigger: '.exhibit-grid', start: 'top 94%', once: true } })
    }, page)
    return () => context.revert()
  }, [])

  return <div ref={page}>
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <Eyebrow>INTERACTIVE IBM Z EXHIBITION</Eyebrow>
        <h1 id="hero-title" tabIndex={-1}>THE WORLD RUNS<br className="wide-break" /> ON SYSTEMS YOU<br className="wide-break" /> <em>RARELY SEE.</em></h1>
        <p>Step inside an interactive educational simulation of IBM Z mainframe computing. Discover how enterprise systems process transactions, manage workloads and protect critical information.</p>
        <div className="hero-actions"><a className="button primary" href="#/transaction">Enter the Mainframe <ArrowRight size={18} /></a>
          <a className="button secondary" href="#/architecture"><Box size={17} /> Explore Architecture</a></div>
        <a className="tour-link" href="#/tour"><span><Play size={12} fill="currentColor" /></span> How It Works <ArrowRight size={14} /></a>
      </div>
      <div className="hero-display">
        <div className="display-corners" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="display-head"><span><ScanLine size={16} /> HARDWARE VIEWPORT</span><Badge>INTERACTIVE</Badge></div>
        <SceneView mode="hero" selected={selected} onSelect={select} />
        {selected && <a className="hero-module" href={"#/architecture?module=" + selected}><span className="meta">SELECTED MODULE</span><strong>{moduleById[selected].name} <ArrowRight size={15} /></strong></a>}
        <div className="figure-label"><span>FIG. 01</span><strong>MAINFRAME / Z–01</strong><span>CONCEPT CABINET</span></div>
        <div className="display-foot"><span><Move size={13} /> Drag to orbit <b>·</b> Scroll or pinch to zoom</span><a href="#/architecture" aria-label="Open full architecture viewport"><ArrowRight size={17} /></a></div>
      </div>
    </section>
    <div className="strip-wrap"><div className="shell info-strip">
      <span><Cpu size={17} /> <b>10</b> Architecture layers</span>
      <span><Workflow size={17} /> <b>05</b> Transaction scenarios</span>
      <span><Radio size={17} /> Seeded simulation</span>
      <a href="#exhibits" onClick={event => { event.preventDefault(); document.getElementById('exhibits').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }}>View exhibits <ArrowDown size={15} /></a>
    </div></div>
    <section className="shell exhibition" id="exhibits" aria-labelledby="exhibit-title">
      <div className="section-head"><div><Eyebrow>THE EXHIBITION</Eyebrow><h2 id="exhibit-title">Explore the system</h2></div><p>Follow a single request or zoom out to see what happens when thousands arrive.</p></div>
      <div className="exhibit-grid">{exhibits.map((item, index) => <ExhibitCard key={item.path} item={item} number={index + 1} />)}</div>
      <div className="end-note"><span>BUILT FOR THE CURIOUS</span><a href="#/project">Read the project notes <ArrowRight size={16} /></a></div>
    </section>
  </div>
}
