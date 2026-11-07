import { useState } from 'react'
import { ArrowRight, CheckCircle2, CircleAlert, Play, WalletCards } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'
import { AuditList, EngineControls, formatMoney } from '../components/SimulationUI'
import { TransactionFlow } from '../components/TransactionFlow'
import { useSimulation } from '../hooks/SimulationContext'
import { roles } from '../simulation/SecurityEngine'
import { accountId, scenarios } from '../simulation/TransactionEngine'

export default function Transaction() {
  const [engine, snapshot] = useSimulation()
  const [fields, setFields] = useState({
    kind: 'atm', amount: scenarios.atm.initialAmount, balance: '2500', account: 'ZA-1001', destination: 'ZA-2002',
    priority: 'normal', role: 'teller', authenticated: true, forceFailure: false, batchCount: '12',
  })
  const change = (key, value) => setFields(previous => ({ ...previous, [key]: value }))
  const scenario = scenarios[fields.kind]
  const current = snapshot.accounts.get(accountId(fields.account))
  const job = snapshot.latest
  const terminal = ['completed', 'rejected', 'failed'].includes(job?.state)
  const busy = job && !terminal
  const transferBalance = snapshot.accounts.get(accountId(fields.destination))

  function submit(event) {
    event.preventDefault()
    engine.submit({ ...fields, balance: current === undefined ? fields.balance : (current / 100).toFixed(2) })
  }

  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 02 / TRANSACTION LAB" title="Process a Transaction" description="Follow a simulated banking transaction through the mainframe.">
      <Badge>FICTIONAL ACCOUNTS / ZAR</Badge>
    </ExhibitHeading>
    <EngineControls engine={engine} snapshot={snapshot} />
    <div className="lab-grid">
      <div className="stack">
        <form className="panel form-panel" onSubmit={submit} noValidate>
          <div className="panel-header"><div><div className="meta">INPUT CONSOLE</div><h2>Build a request</h2></div><WalletCards size={25} /></div>
          <fieldset disabled={Boolean(busy)}>
            <label>Transaction scenario<select value={fields.kind} onChange={event => {
              const kind = event.target.value
              setFields(previous => ({ ...previous, kind, amount: scenarios[kind].initialAmount }))
            }}>{Object.entries(scenarios).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select></label>
            <p className="muted small">{scenario.detail}</p>
            <div className="form-grid">
              <label>{scenario.action} (ZAR)<input inputMode="decimal" value={fields.amount} onChange={event => change('amount', event.target.value)} /></label>
              <label>{current === undefined ? 'Simulated starting balance (ZAR)' : 'Committed balance (ZAR)'}<input inputMode="decimal" readOnly={current !== undefined}
                value={current === undefined ? fields.balance : (current / 100).toFixed(2)} onChange={event => change('balance', event.target.value)} /></label>
              <label>Account identifier<input value={fields.account} onChange={event => change('account', event.target.value)} spellCheck="false" aria-describedby="account-note" /></label>
              <label>Transaction priority<select value={fields.priority} onChange={event => change('priority', event.target.value)}>
                <option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label>
              {fields.kind === 'transfer' && <label>Destination account<input value={fields.destination} onChange={event => change('destination', event.target.value)} spellCheck="false" /></label>}
              {fields.kind === 'batch' && <label>Purchases (1–100)<input inputMode="numeric" value={fields.batchCount} onChange={event => change('batchCount', event.target.value)} /></label>}
            </div>
            <p id="account-note" className="muted small">Use a fictional ID with 3–20 letters, digits or hyphens. Choose a new ID to set a different starting balance.</p>
            {fields.kind === 'transfer' && <p className="muted small">Destination balance {formatMoney(transferBalance ?? 0)}</p>}
            {fields.kind === 'airline' && <p className="muted small">Available seats on simulated flight ZX 101: {snapshot.seats}</p>}
            <details><summary>Identity and failure injection</summary>
              <label>Simulated identity<select value={fields.role} onChange={event => change('role', event.target.value)}>{Object.entries(roles).map(([key, role]) => <option key={key} value={key}>{role.name}</option>)}</select></label>
              <label className="check-field"><input type="checkbox" checked={fields.authenticated} onChange={event => change('authenticated', event.target.checked)} /> Verified credentials</label>
              <label className="check-field"><input type="checkbox" checked={fields.forceFailure} onChange={event => change('forceFailure', event.target.checked)} /> Simulate a write failure</label>
            </details>
          </fieldset>
          <button type="submit" className="button primary wide-button" disabled={Boolean(busy)}><Play size={17} fill="currentColor" /> {busy ? snapshot.running ? 'PROCESSING REQUEST' : 'REQUEST PAUSED' : 'PROCESS TRANSACTION'} <ArrowRight size={17} /></button>
        </form>
        {terminal && <section className={`panel result-panel ${job.state === 'completed' ? 'result-allow' : 'result-deny'}`} role="status">
          {job.state === 'completed' ? <CheckCircle2 /> : <CircleAlert />}<div><div className="meta">{job.id} / DECISION</div><h2>{job.result}</h2><p>{job.detail}</p>
            {job.balance !== undefined && <p><strong>Remaining balance {formatMoney(job.balance)}</strong></p>}</div>
        </section>}
      </div>
      <TransactionFlow job={job} running={snapshot.running} />
    </div>
    <section className="panel audit-panel"><div className="panel-header"><div><div className="meta">EVENT LOG</div><h2>Transaction audit</h2></div><a className="text-link" href="#/operations">View operations <ArrowRight size={15} /></a></div>
      <AuditList events={snapshot.audit.filter(event => event.category === 'transaction')} />
    </section>
  </div>
}
