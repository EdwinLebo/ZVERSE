import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Home from './components/Home'
import { Brand, exhibits, Footer } from './components/UI'
import { SimulationProvider } from './hooks/SimulationContext'

const routes = {
  architecture: lazy(() => import('./pages/Architecture.jsx')),
  transaction: lazy(() => import('./pages/Transaction.jsx')),
  operations: lazy(() => import('./pages/Operations.jsx')),
  workload: lazy(() => import('./pages/Workload.jsx')),
  security: lazy(() => import('./pages/Security.jsx')),
  learn: lazy(() => import('./pages/Learn.jsx')),
  tour: lazy(() => import('./pages/Tour.jsx')),
  quiz: lazy(() => import('./pages/Quiz.jsx')),
  project: lazy(() => import('./pages/Project.jsx')),
}

const getRoute = () => location.hash.startsWith('#/') ? location.hash.slice(2).split('?')[0] : ''

function Header({ route }) {
  const [open, setOpen] = useState(false)
  const navRoute = ['tour', 'quiz'].includes(route) ? 'learn' : route
  return <header className="site-header">
    <div className="shell header-inner"><Brand />
      <button type="button" className="icon-button menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      <nav id="primary-navigation" aria-label="Main navigation" className={open ? 'nav-open' : ''} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); document.querySelector('.menu-button')?.focus() } }}>
        {exhibits.map(item => <a key={item.path} href={`#/${item.path}`} aria-current={item.path === navRoute ? 'page' : undefined} onClick={() => setOpen(false)}>{item.name}</a>)}
        <a href="#/project" className="project-nav" aria-current={route === 'project' ? 'page' : undefined} onClick={() => setOpen(false)}>Project <ArrowUpRight size={15} /></a>
      </nav>
    </div>
  </header>
}

function NotFound() {
  return <div className="shell exhibit-page"><h1>Exhibit unavailable</h1><p>Choose an exhibit from the navigation.</p><a className="button primary" href="#/">Exhibition home</a></div>
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    function navigate() {
      setRoute(getRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
      requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }))
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  useEffect(() => {
    const title = exhibits.find(item => item.path === route)?.title ?? { tour: 'A Day in the Life of a Transaction', quiz: 'Test Your Mainframe Knowledge', project: 'Project notes' }[route]
    document.title = title ? `${title} · ZVERSE` : 'ZVERSE — Inside the Mainframe'
  }, [route])
  const Page = !route ? Home : Object.hasOwn(routes, route) ? routes[route] : NotFound
  return <SimulationProvider>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a>
    <Header key={route} route={route} />
    <main id="main-content" tabIndex={-1}><Suspense fallback={<div className="shell route-loading" role="status">Loading exhibit…</div>}><Page /></Suspense></main>
    <Footer />
  </SimulationProvider>
}
