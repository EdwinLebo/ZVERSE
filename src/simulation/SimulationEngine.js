import { summarize } from './MetricAggregator'
import { authorize, actions, roles } from './SecurityEngine'
import { evaluateCommit, prepareRequest } from './TransactionEngine'
import { nextRequestIndex, presets, QUEUE_LIMIT } from './WorkloadScheduler'

export const STEP = 0.05
const TERMINAL = new Set(['completed', 'rejected', 'failed'])
const BACKGROUND_KINDS = ['atm', 'transfer', 'retail', 'airline', 'batch']

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let mix = Math.imul(value ^ (value >>> 15), value | 1)
    mix ^= mix + Math.imul(mix ^ (mix >>> 7), mix | 61)
    return ((mix ^ (mix >>> 14)) >>> 0) / 4294967296
  }
}

export class SimulationEngine {
  constructor(seed = 2049) {
    this.seed = seed >>> 0
    this.listeners = new Set()
    this.reset()
  }

  subscribe = listener => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.snapshot

  publish() {
    const metrics = this.metrics()
    this.snapshot = {
      time: this.time, running: this.running, speed: this.speed, seed: this.seed, config: { ...this.config },
      metrics, audit: this.audit.slice(), accounts: new Map(this.accounts), latest: this.latest ? { ...this.latest } : null,
      queue: this.queue.slice(0, 24).map(({ id, priority }) => ({ id, priority })),
      workers: this.active.map(({ id, priority, progress, work }) => ({ id, priority, ratio: progress / work })),
      seats: this.seats.available, burst: this.burstRemaining,
    }
    for (const listener of this.listeners) listener()
  }

  reset = (seed = this.seed) => {
    this.seed = seed >>> 0
    this.random = seededRandom(this.seed)
    this.running = false
    this.started = false
    this.speed = 1
    this.time = 0
    this.ticks = 0
    this.remainder = 0
    this.arrivalRemainder = 0
    this.id = 0
    this.auditId = 0
    this.cursor = 0
    this.config = { ...presets[0], policy: 'fifo', traffic: false }
    this.queue = []
    this.active = []
    this.incoming = []
    this.outgoing = []
    this.recent = []
    this.history = []
    this.usage = []
    this.busyWork = 0
    this.capacityWork = 0
    this.accounts = new Map()
    this.seats = { available: 6 }
    this.latest = null
    this.audit = []
    this.failedLogins = []
    this.burstRemaining = 0
    this.totals = { finished: 0, completed: 0, rejected: 0, failed: 0, security: 0, dropped: 0 }
    this.publish()
  }

  start = () => { this.started = true; this.running = true; this.publish() }
  pause = () => { this.running = false; this.publish() }
  setSpeed = speed => {
    if (![0.5, 1, 2, 5].includes(speed)) return
    this.speed = speed
    this.publish()
  }

  configure = options => {
    this.config = { ...this.config, ...options }
    this.publish()
  }

  submit(fields) {
    if (this.latest && !TERMINAL.has(this.latest.state)) return null
    const job = this.create({ ...prepareRequest(fields), background: false }, 1)
    this.latest = job
    this.incoming.push(job)
    if (!this.started) { this.started = true; this.running = true }
    this.publish()
    return job.id
  }

  create(fields, work) {
    return { ...fields, id: `ZX-${String(++this.id).padStart(4, '0')}`, arrival: this.time, state: 'created',
      stage: 0, visited: 1, work, progress: 0, checkAt: this.time + 0.45, stageAt: this.time, result: '', detail: '' }
  }

  changeStage(job, stage) {
    job.stage = stage
    job.visited |= 1 << stage
    job.stageAt = this.time
  }

  enqueue(job) {
    if (this.queue.length >= QUEUE_LIMIT) {
      this.totals.dropped++
      this.respond(job, { state: 'rejected', result: 'Queue capacity reached', detail: 'The admission queue was full. No changes were committed.' })
      return
    }
    job.state = 'queued'
    this.changeStage(job, 3)
    job.readyAt = this.time + (job.background ? 0 : 0.4)
    this.queue.push(job)
  }

  respond(job, outcome) {
    if (job.background) {
      this.finish(job, outcome)
      return
    }
    if (outcome.state !== 'completed') job.errorStage = job.stage
    job.pending = outcome
    this.changeStage(job, 6)
    job.respondAt = this.time + 0.5
    this.outgoing.push(job)
  }

  finish(job, outcome) {
    if (TERMINAL.has(job.state)) return
    Object.assign(job, outcome)
    delete job.pending
    this.changeStage(job, 7)
    job.finishedAt = this.time
    this.totals.finished++
    this.totals[job.state]++
    if (job.progress >= job.work - 1e-9) this.recent.push({ at: this.time, duration: this.time - job.arrival })
    if (!job.background) this.record('transaction', job.result, `${job.id} · ${job.detail}`, job.state === 'completed' ? 'allow' : 'deny')
  }

  record(category, label, detail, level) {
    this.audit.unshift({ id: ++this.auditId, at: this.time, category, label, detail, level })
    if (this.audit.length > 80) this.audit.pop()
  }

  securityCheck({ role, authenticated, action }, publish = true) {
    const result = authorize({ role, authenticated, action })
    this.record('security', result.label, `${roles[role]?.name ?? 'Unknown identity'} · ${actions[action] ?? 'Unknown action'}`, result.allowed ? 'allow' : 'deny')
    if (!result.allowed) this.totals.security++
    if (!authenticated) {
      this.failedLogins = this.failedLogins.filter(at => this.time - at <= 10)
      this.failedLogins.push(this.time)
      if (this.failedLogins.length === 3) this.alert('Repeated failed logins', 'Three failed identity checks within ten simulated seconds.')
    }
    if (publish) this.publish()
    return result
  }

  alert(label, detail) {
    this.totals.security++
    this.record('security', label, detail, 'alert')
  }

  triggerSecurity(scenario) {
    if (scenario === 'logins') {
      this.failedLogins = []
      for (let attempt = 0; attempt < 3; attempt++) this.securityCheck({ role: 'visitor', authenticated: false, action: 'view' }, false)
    } else if (scenario === 'access') {
      this.securityCheck({ role: 'visitor', authenticated: true, action: 'configure' }, false)
      this.alert('Protected resource access', 'A visitor attempted a privileged configuration action.')
    } else if (scenario === 'volume') {
      this.burstRemaining += 30
      this.alert('Suspicious request volume', 'A synthetic burst of 30 requests crossed the demonstration threshold.')
    }
    this.publish()
  }

  admit() {
    this.incoming = this.incoming.filter(job => {
      if (this.time < job.checkAt - 1e-8) return true
      if (job.stage === 0) {
        this.changeStage(job, 1)
      } else if (job.stage === 1) {
        if (!job.valid) {
          this.respond(job, { state: 'rejected', result: 'Invalid input', detail: 'Check the account IDs, amount and starting balance.' })
          return false
        }
        this.changeStage(job, 2)
      } else {
        if (!this.securityCheck({ role: job.role, authenticated: job.authenticated, action: 'process' }, false).allowed) {
          this.respond(job, { state: 'rejected', result: 'Unauthorized request', detail: 'The identity or resource permission check failed.' })
        } else {
          this.enqueue(job)
          if (job.kind === 'batch' && job.state === 'queued') this.burstRemaining += job.batchCount
        }
        return false
      }
      job.checkAt += 0.45
      return true
    })
  }

  arrive() {
    this.arrivalRemainder += (this.config.traffic ? this.config.rate : 0) * STEP
    const baseline = Math.floor(this.arrivalRemainder + 1e-8)
    this.arrivalRemainder -= baseline
    const burst = Math.min(2, this.burstRemaining)
    this.burstRemaining -= burst
    for (let index = 0; index < baseline + burst; index++) {
      const draw = this.random() * 100
      const priority = draw < this.config.highShare ? 'high' : this.config.priority
      this.enqueue(this.create({
        background: true, priority, kind: index >= baseline ? 'retail' : this.config.kind ?? BACKGROUND_KINDS[Math.floor(this.random() * BACKGROUND_KINDS.length)],
        forceFailure: this.random() < 0.008,
      }, 1 + this.random() * 0.28))
    }
  }

  work() {
    while (this.queue.length && this.active.length < this.config.workers) {
      const { index, cursor } = nextRequestIndex(this.queue, this.config.policy, this.time, this.cursor)
      if (this.queue[index].readyAt > this.time + 1e-8) break
      this.cursor = cursor
      const [job] = this.queue.splice(index, 1)
      job.state = 'processing'
      this.changeStage(job, 4)
      this.active.push(job)
    }
    const budget = this.config.capacity * STEP
    const share = budget / Math.max(1, this.active.length)
    let used = 0
    this.active = this.active.filter(job => {
      const processed = Math.min(share, job.work - job.progress, STEP * (job.background ? 9 : 0.45))
      job.progress += processed
      used += processed
      if (job.progress >= job.work - 1e-9) {
        this.changeStage(job, 5)
        this.respond(job, evaluateCommit(job, this.accounts, this.seats))
        return false
      }
      if (job.progress / job.work >= 0.71 && job.stage === 4) this.changeStage(job, 5)
      return true
    })
    this.usage.push({ budget, used })
    this.busyWork += used
    this.capacityWork += budget
    if (this.usage.length > 20) {
      const expired = this.usage.shift()
      this.busyWork -= expired.used
      this.capacityWork -= expired.budget
    }
  }

  metrics() {
    return summarize({ time: this.time, history: this.history.slice(), totals: this.totals, recent: this.recent,
      busyWork: this.busyWork, capacityWork: this.capacityWork, queued: this.queue.length, active: this.active,
      ingress: this.incoming.length + this.outgoing.length, workers: this.config.workers, queueLimit: QUEUE_LIMIT })
  }

  step() {
    this.time = ++this.ticks * STEP
    this.admit()
    this.arrive()
    this.work()
    this.outgoing = this.outgoing.filter(job => {
      if (job.respondAt > this.time + 1e-8) return true
      this.finish(job, job.pending)
      return false
    })
    while (this.recent.length && this.recent[0].at <= this.time - 5) this.recent.shift()
    if (this.ticks % 20 === 0) {
      const { tps, latency, cpu } = this.metrics()
      this.history.push({ time: this.time, tps, latency, cpu })
      if (this.history.length > 36) this.history.shift()
    }
  }

  advance = elapsed => {
    if (!this.running || !Number.isFinite(elapsed) || elapsed <= 0) return
    this.remainder += elapsed * this.speed
    while (this.remainder >= STEP - 1e-8) {
      this.remainder -= STEP
      this.step()
    }
    this.publish()
  }
}
