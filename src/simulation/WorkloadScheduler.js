export const policies = {
  fifo: 'First in, first out',
  priority: 'Priority based',
  service: 'Service classes',
}

export const presets = [
  { name: 'Normal business day', rate: 12, capacity: 28, workers: 5, highShare: 20, priority: 'normal', kind: null },
  { name: 'Salary payment rush', rate: 42, capacity: 30, workers: 6, highShare: 50, priority: 'normal', kind: 'transfer' },
  { name: 'Black Friday retail activity', rate: 78, capacity: 43, workers: 8, highShare: 28, priority: 'normal', kind: 'retail' },
  { name: 'Airline booking surge', rate: 46, capacity: 32, workers: 6, highShare: 43, priority: 'normal', kind: 'airline' },
  { name: 'Unexpected capacity reduction', rate: 34, capacity: 8, workers: 2, highShare: 30, priority: 'normal', kind: null },
]

export const QUEUE_LIMIT = 160
export const AGE_LIMIT = 5
const weightedSlots = ['high', 'high', 'normal', 'high', 'normal', 'low']

export function nextRequestIndex(queue, policy, time, cursor) {
  if (queue.length < 2 || policy === 'fifo' || time - queue[0].arrival >= AGE_LIMIT) {
    return { index: 0, cursor }
  }
  if (policy === 'priority') {
    const high = queue.findIndex(job => job.priority === 'high')
    const normal = queue.findIndex(job => job.priority === 'normal')
    return { index: high >= 0 ? high : Math.max(normal, 0), cursor }
  }
  for (let offset = 0; offset < weightedSlots.length; offset++) {
    const slot = (cursor + offset) % weightedSlots.length
    const index = queue.findIndex(job => job.priority === weightedSlots[slot])
    if (index >= 0) return { index, cursor: (slot + 1) % weightedSlots.length }
  }
  return { index: 0, cursor }
}
