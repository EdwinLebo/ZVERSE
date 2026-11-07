import { describe, expect, it } from 'vitest'
import { SimulationEngine } from '../src/simulation/SimulationEngine'
import { authorize, roles } from '../src/simulation/SecurityEngine'
import { nextRequestIndex, QUEUE_LIMIT } from '../src/simulation/WorkloadScheduler'

const withdrawal = { account: 'ZA-1001', balance: '2500', amount: '250', role: 'teller', authenticated: true }
const run = (engine, request = {}) => {
  engine.submit({ ...withdrawal, ...request })
  engine.advance(8)
  return engine.getSnapshot()
}

describe('transaction processing', () => {
  it('debits a successful withdrawal once and records its result', () => {
    const engine = new SimulationEngine()
    const result = run(engine)
    expect(result.latest).toMatchObject({ state: 'completed', balance: 225000, visited: 255 })
    expect(result.accounts.get('ZA-1001')).toBe(225000)
    engine.advance(20)
    expect(engine.getSnapshot().accounts.get('ZA-1001')).toBe(225000)
    expect(engine.getSnapshot().audit.filter(event => event.category === 'transaction')).toHaveLength(1)
  })

  it.each([
    [{ amount: '3000' }, 'Insufficient funds', 'rejected'],
    [{ role: 'visitor' }, 'Unauthorized request', 'rejected'],
    [{ authenticated: false }, 'Unauthorized request', 'rejected'],
    [{ amount: 'NaN' }, 'Invalid input', 'rejected'],
    [{ forceFailure: true }, 'Processing failure', 'failed'],
  ])('preserves the ledger on rejected or failed requests (%j)', (request, label, state) => {
    const engine = new SimulationEngine()
    run(engine)
    const result = run(engine, request)
    expect(result.latest).toMatchObject({ state, result: label })
    expect(result.accounts.get('ZA-1001')).toBe(225000)
    expect(result.audit.find(event => event.category === 'transaction')).toMatchObject({ level: 'deny', label })
    expect(result.metrics.completed).toBe(1)
  })

  it('traces created, queued, processing and completed states in order', () => {
    const engine = new SimulationEngine()
    const states = []
    engine.submit(withdrawal)
    expect(engine.submit(withdrawal)).toBeNull()
    for (let i = 0; i < 110; i++) {
      engine.advance(0.05)
      const { state } = engine.getSnapshot().latest
      if (states.at(-1) !== state) states.push(state)
    }
    expect(states).toEqual(['created', 'queued', 'processing', 'completed'])
  })

  it('commits both sides of a transfer and uses the current ledger on repeat submissions', () => {
    const engine = new SimulationEngine()
    let result = run(engine, { kind: 'transfer', destination: 'ZA-2002' })
    expect(result.accounts.get('ZA-1001')).toBe(225000)
    expect(result.accounts.get('ZA-2002')).toBe(25000)
    result = run(engine, { amount: '2300', balance: '5000' })
    expect(result.latest.result).toBe('Insufficient funds')
    expect(result.accounts.get('ZA-1001')).toBe(225000)
  })

  it('reserves inventory only after a successful booking', () => {
    const engine = new SimulationEngine()
    expect(run(engine, { kind: 'airline', forceFailure: true }).seats).toBe(6)
    expect(run(engine, { kind: 'airline' }).seats).toBe(5)
  })

  it('does not generate a retail burst from an unauthorized request', () => {
    const engine = new SimulationEngine()
    const result = run(engine, { kind: 'batch', amount: '2', batchCount: '25', role: 'visitor' })
    expect(result.latest.result).toBe('Unauthorized request')
    expect(result.metrics).toMatchObject({ completed: 0, rejected: 1, queue: 0 })
  })

  it('keeps a large retail debit exact to the cent', () => {
    const engine = new SimulationEngine()
    const result = run(engine, { kind: 'batch', amount: '0.01', batchCount: '67', balance: '0.70' })
    expect(result.accounts.get('ZA-1001')).toBe(3)
  })
})

describe('workload and telemetry', () => {
  it('grows a bounded queue under excess arrivals without counting overflow as throughput', () => {
    const engine = new SimulationEngine()
    engine.configure({ traffic: true, rate: 80, workers: 2, capacity: 6 })
    engine.start()
    engine.advance(15)
    const { metrics } = engine.getSnapshot()
    expect(metrics.queue).toBe(QUEUE_LIMIT)
    expect(metrics.dropped).toBeGreaterThan(0)
    expect(metrics.tps).toBeGreaterThan(0)
    expect(metrics.tps).toBeLessThanOrEqual(6)
    expect(metrics.cpu).toBeGreaterThan(90)
    expect(metrics.cpu).toBeLessThanOrEqual(100)
    expect(metrics.latency).toBeGreaterThan(1000)
    expect(metrics.rejected).toBe(metrics.dropped)
  })

  it('honors scheduling priority, service rotation, and queue aging', () => {
    const queue = [{ priority: 'low', arrival: 0 }, { priority: 'normal', arrival: 0 }, { priority: 'high', arrival: 0 }]
    expect(nextRequestIndex(queue, 'fifo', 1, 0).index).toBe(0)
    expect(nextRequestIndex(queue, 'priority', 1, 0).index).toBe(2)
    expect(nextRequestIndex(queue, 'service', 1, 2)).toEqual({ index: 1, cursor: 3 })
    expect(nextRequestIndex(queue, 'priority', 6, 0).index).toBe(0)
  })

  it('pauses without advancing time and applies the selected speed on resume', () => {
    const engine = new SimulationEngine()
    engine.start()
    engine.advance(1)
    engine.pause()
    engine.advance(6)
    expect(engine.getSnapshot().time).toBe(1)
    engine.setSpeed(5)
    engine.start()
    engine.advance(0.4)
    expect(engine.getSnapshot().time).toBe(3)
  })

  it('does not resume a deliberately paused clock when a request is submitted', () => {
    const engine = new SimulationEngine()
    engine.start()
    engine.pause()
    engine.submit(withdrawal)
    engine.advance(1)
    expect(engine.getSnapshot()).toMatchObject({ time: 0, running: false, latest: { state: 'created' } })
    engine.start()
    engine.advance(5)
    expect(engine.getSnapshot().latest.state).toBe('completed')
  })

  it('restores initial state and reproduces a seeded scenario after reset', () => {
    const engine = new SimulationEngine(17)
    function scenario() {
      engine.configure({ traffic: true, rate: 45, policy: 'service' })
      engine.start()
      return run(engine)
    }
    const first = scenario()
    engine.reset()
    expect(engine.getSnapshot()).toMatchObject({ time: 0, running: false, latest: null, audit: [], seats: 6 })
    expect(engine.getSnapshot().accounts.size).toBe(0)
    const second = scenario()
    expect(second.metrics).toEqual(first.metrics)
    expect(second.audit).toEqual(first.audit)
  })

  it('derives latency, outcome counts and success rate from terminal results', () => {
    const engine = new SimulationEngine()
    engine.submit(withdrawal)
    engine.advance(5)
    const state = engine.getSnapshot()
    expect(state.metrics.tps).toBe(0.2)
    expect(state.metrics.latency).toBeCloseTo(state.latest.finishedAt * 1000)
    expect(state.metrics.success).toBe(100)
    const mixed = run(engine, { role: 'auditor' })
    expect(mixed.metrics).toMatchObject({ completed: 1, rejected: 1, success: 50, security: 1 })
  })
})

describe('security decisions', () => {
  it.each(Object.entries(roles))('enforces the %s grant set', (role, { grants }) => {
    for (const action of ['view', 'process', 'audit', 'configure']) {
      expect(authorize({ role, authenticated: true, action }).allowed).toBe(grants.includes(action))
      expect(authorize({ role, authenticated: false, action }).allowed).toBe(false)
    }
  })

  it('records repeated logins as three denials and an alert', () => {
    const engine = new SimulationEngine()
    engine.triggerSecurity('logins')
    const result = engine.getSnapshot()
    expect(result.audit).toHaveLength(4)
    expect(result.audit[0]).toMatchObject({ level: 'alert', label: 'Repeated failed logins' })
    expect(result.metrics.security).toBe(4)
  })
})
