import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { SimulationEngine } from '../simulation/SimulationEngine'

const Context = createContext(null)

export function SimulationProvider({ children }) {
  const [engine] = useState(() => new SimulationEngine())
  useEffect(() => {
    let last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      engine.advance(Math.min(0.25, (now - last) / 1000))
      last = now
    }, 100)
    return () => clearInterval(timer)
  }, [engine])
  return <Context.Provider value={engine}>{children}</Context.Provider>
}

export function useSimulation() {
  const engine = useContext(Context)
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot)
  return [engine, snapshot]
}
