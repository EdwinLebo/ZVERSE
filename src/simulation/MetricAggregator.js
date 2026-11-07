export function summarize({ time, history, totals, recent, busyWork, capacityWork, queued, active, ingress, workers, queueLimit }) {
  const seconds = Math.min(5, time)
  return {
    tps: seconds ? recent.length / seconds : 0,
    latency: recent.length ? 1000 * recent.reduce((sum, item) => sum + item.duration, 0) / recent.length : 0,
    cpu: capacityWork ? Math.min(100, 100 * busyWork / capacityWork) : 0,
    memory: Math.min(100, (queued + active.length + ingress) / (queueLimit + workers) * 100),
    active: active.length,
    workloadTypes: new Set(active.map(job => job.kind)).size,
    queue: queued,
    success: totals.finished ? 100 * totals.completed / totals.finished : null,
    completed: totals.completed,
    rejected: totals.rejected,
    failed: totals.failed,
    security: totals.security,
    dropped: totals.dropped,
    history,
  }
}
