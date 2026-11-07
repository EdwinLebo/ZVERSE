export const scenarios = {
  atm: { name: 'ATM withdrawal', action: 'Withdrawal amount', initialAmount: '250', detail: 'Check the account, commit a debit, then return an approval to the ATM.' },
  transfer: { name: 'Online banking transfer', action: 'Transfer amount', initialAmount: '400', detail: 'Debit the sender and credit the recipient together in one simulated commit.' },
  retail: { name: 'Retail card payment', action: 'Purchase amount', initialAmount: '180', detail: 'Authorize a purchase against the available account balance.' },
  airline: { name: 'Airline booking', action: 'Booking amount', initialAmount: '900', detail: 'Reserve one seat from the flight inventory when the account debit commits.' },
  batch: { name: 'High-volume retail', action: 'Amount per purchase', initialAmount: '35', detail: 'Follow one debit representing a batch of purchases while a repeatable retail burst enters the queue.' },
}

export const stages = [
  { name: 'Receive', description: 'The request arrives and gets a unique trace ID.', system: 'I/O subsystem' },
  { name: 'Validate', description: 'The engine checks the account, amount and scenario fields.', system: 'Input validation' },
  { name: 'Authorize', description: 'The simulated identity must have permission to process a transaction.', system: 'RACF concepts' },
  { name: 'Schedule', description: 'The request waits for an available worker under the selected policy.', system: 'WLM concepts' },
  { name: 'Execute', description: 'Application logic evaluates the requested operation.', system: 'CICS concepts' },
  { name: 'Commit', description: 'The engine checks the latest balances and applies the changes together.', system: 'Db2 concepts' },
  { name: 'Respond', description: 'The client receives the simulated decision.', system: 'I/O subsystem' },
  { name: 'Audit', description: 'The outcome is added to the event log.', system: 'Monitoring' },
]

export function toCents(value) {
  const input = String(value ?? '').trim()
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(input)) return NaN
  const [whole, fraction = ''] = input.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

export function accountId(value) {
  return String(value ?? '').trim().toUpperCase()
}

const validId = value => /^[A-Z0-9][A-Z0-9-]{2,19}$/.test(value)

export function prepareRequest(fields) {
  const kind = fields.kind ?? 'atm'
  const source = accountId(fields.account)
  const destination = accountId(fields.destination)
  const batchCount = kind === 'batch' ? Number(fields.batchCount) : 1
  const amount = toCents(fields.amount)
  const startingBalance = toCents(fields.balance)
  const valid = Object.hasOwn(scenarios, kind) && validId(source) && amount > 0 && Number.isFinite(startingBalance)
    && Number.isInteger(batchCount) && batchCount >= 1 && batchCount <= 100
    && (kind !== 'transfer' || (validId(destination) && destination !== source))
  return { kind, source, destination, amount: amount * batchCount, startingBalance, batchCount, valid,
    priority: fields.priority ?? 'normal', role: fields.role ?? 'teller', authenticated: fields.authenticated ?? true,
    forceFailure: Boolean(fields.forceFailure) }
}

export function evaluateCommit(job, accounts, seats) {
  if (job.forceFailure) return { state: 'failed', result: 'Processing failure', detail: 'An injected write failure rolled back the simulated operation.' }
  if (job.background) return { state: 'completed', result: 'Approved', detail: 'Synthetic workload completed.' }
  const balance = accounts.get(job.source) ?? job.startingBalance
  if (job.amount > balance) return { state: 'rejected', result: 'Insufficient funds', detail: 'The account balance was preserved.' }
  if (job.kind === 'airline' && seats.available === 0) return { state: 'rejected', result: 'Flight sold out', detail: 'No debit was committed.' }
  const remaining = balance - job.amount
  accounts.set(job.source, remaining)
  if (job.kind === 'transfer') accounts.set(job.destination, (accounts.get(job.destination) ?? 0) + job.amount)
  if (job.kind === 'airline') seats.available--
  return { state: 'completed', result: 'Approved', detail: 'The balance change was committed.', balance: remaining }
}
