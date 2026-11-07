import { useRef, useState } from 'react'
import { ArrowRight, Fingerprint, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge, ExhibitHeading } from '../components/UI'
import { AuditList } from '../components/SimulationUI'
import { useSimulation } from '../hooks/SimulationContext'
import { actions, roles } from '../simulation/SecurityEngine'

const demonstrations = [
  ['logins', 'Repeated failed logins', 'Trigger the failed sign-in threshold.'],
  ['access', 'Unauthorized resource access', 'Attempt to change settings as a visitor.'],
  ['volume', 'Suspicious transaction volume', 'Flag a synthetic burst and send it to the workload queue.'],
]

const example = 'TRACE=ZX-2049 | ACCOUNT=DEMO-01 | AMOUNT=250.00'

function EncryptionDemo() {
  const [mode, setMode] = useState('transit')
  const [data, setData] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState('')
  const busy = useRef(false)
  async function encrypt() {
    if (busy.current) return
    busy.current = true
    setStatus('Encrypting fictional record…')
    setRevealed(false)
    try {
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const bytes = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(example))
      setData({ key, iv, bytes, hex: Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('') })
      setStatus('Encrypted with a temporary browser key.')
    } catch {
      setStatus('Encryption requires a secure browser context, such as HTTPS or localhost.')
    } finally {
      busy.current = false
    }
  }
  async function decrypt() {
    if (busy.current || !data) return
    busy.current = true
    try {
      const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.iv }, data.key, data.bytes)
      setRevealed(new TextDecoder().decode(bytes))
      setStatus('Authorized decryption returned the original record.')
    } catch {
      setStatus('The browser could not decrypt the record.')
    } finally {
      busy.current = false
    }
  }
  return <section className="panel form-panel">
    <div className="panel-header"><div><div className="meta">DATA CONFIDENTIALITY</div><h2>Encryption demonstration</h2></div><LockKeyhole size={22} /></div>
    <div className="segmented" aria-label="Encryption context"><button type="button" aria-pressed={mode === 'transit'} onClick={() => setMode('transit')}>In transit</button>
      <button type="button" aria-pressed={mode === 'rest'} onClick={() => setMode('rest')}>At rest</button></div>
    <p className="muted">{mode === 'transit' ? 'A protected connection such as TLS encrypts data while it moves between endpoints.' : 'Storage encryption protects stored bytes. Key access and the surrounding system determine who can recover the record.'}</p>
    <div className="cipher-block"><span>{data && !revealed ? 'CIPHERTEXT' : 'PLAINTEXT'}</span><code>{revealed || data?.hex || example}</code></div>
    <div className="toolbar"><button type="button" className="button compact-button primary" onClick={encrypt}><LockKeyhole size={15} /> Encrypt record</button>
      <button type="button" className="button compact-button secondary" onClick={decrypt} disabled={!data || Boolean(revealed)}><KeyRound size={15} /> Decrypt as key holder</button></div>
    <p className="muted small" role="status">{status || 'The browser encrypts this sample with AES-GCM. The two views explain where encryption can apply.'}</p>
  </section>
}

export default function Security() {
  const [engine, snapshot] = useSimulation()
  const [role, setRole] = useState('teller')
  const [action, setAction] = useState('process')
  const [authenticated, setAuthenticated] = useState(true)
  const [result, setResult] = useState(null)
  function attempt(event) {
    event.preventDefault()
    setResult(engine.securityCheck({ role, authenticated, action }))
  }
  return <div className="shell exhibit-page">
    <ExhibitHeading code="MODULE 05 / SECURITY LAB" title="Protect the Mainframe" description="Explore how layered security controls protect enterprise workloads.">
      <Badge>SIMULATED IDENTITIES</Badge>
    </ExhibitHeading>
    <div className="lab-grid">
      <form className="panel form-panel" onSubmit={attempt}>
        <div className="panel-header"><div><div className="meta">POLICY SANDBOX</div><h2>Security Challenge</h2></div><Fingerprint size={25} /></div>
        <div className="form-grid">
          <label>Simulated identity<select value={role} onChange={event => setRole(event.target.value)}>{Object.entries(roles).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label>
          <label>Protected action<select value={action} onChange={event => setAction(event.target.value)}>{Object.entries(actions).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        </div>
        <label className="check-field"><input type="checkbox" checked={authenticated} onChange={event => setAuthenticated(event.target.checked)} /> Provide valid simulated credentials</label>
        <div className="permission-box"><div className="meta">GRANTED ACTIONS / {roles[role].name}</div>
          <p>{roles[role].grants.map(grant => actions[grant]).join(' · ') || 'No permissions granted'}</p></div>
        <button className="button primary wide-button" type="submit">Evaluate request <ArrowRight size={17} /></button>
        {result && <div className={`inline-result ${result.allowed ? 'result-allow' : 'result-deny'}`} role="status">
          {result.allowed ? <ShieldCheck size={21} /> : <ShieldAlert size={21} />}<div><strong>{result.label}</strong><p>{result.detail}</p></div>
        </div>}
      </form>
      <EncryptionDemo />
    </div>
    <div className="lab-grid lower-grid">
      <section className="panel form-panel"><div className="panel-header"><div><div className="meta">DETECTION DEMOS</div><h2>Suspicious activity</h2></div></div>
        <div className="demo-list">{demonstrations.map(([id, label, detail]) => <button type="button" key={id} onClick={() => engine.triggerSecurity(id)}><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={17} /></button>)}</div>
      </section>
      <section className="panel audit-panel"><div className="panel-header"><div><div className="meta">SECURITY EVENTS</div><h2>Audit timeline</h2></div><Badge tone="amber">{snapshot.metrics.security} ALERTS & DENIALS</Badge></div>
        <AuditList events={snapshot.audit.filter(event => event.category === 'security')} limit={8} />
      </section>
    </div>
    <section className="panel explainer-panel"><div className="meta">SECURITY LAYERS</div><h2>Identity, permission and evidence</h2>
      <p>IBM Z hardware can provide cryptographic facilities. In a z/OS environment, a security manager such as RACF can verify identities and check access to protected resources. Here, JavaScript evaluates a small role table, and the shared audit log records the decision.</p>
    </section>
  </div>
}
