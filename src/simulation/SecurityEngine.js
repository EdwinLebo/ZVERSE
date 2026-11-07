export const roles = {
  admin: { name: 'Administrator', grants: ['view', 'process', 'audit', 'configure'] },
  teller: { name: 'Bank teller', grants: ['view', 'process'] },
  auditor: { name: 'Auditor', grants: ['audit'] },
  visitor: { name: 'Unauthorized visitor', grants: [] },
}

export const actions = {
  view: 'View an account',
  process: 'Process a transaction',
  audit: 'Read an audit report',
  configure: 'Change system settings',
}

export function authorize({ role, authenticated, action }) {
  if (!authenticated || !Object.hasOwn(roles, role)) {
    return { allowed: false, label: 'Authentication failed', detail: 'The simulated identity could not be verified.' }
  }
  if (!roles[role].grants.includes(action)) {
    return { allowed: false, label: 'Authorization denied', detail: `${roles[role].name} has no grant for this resource.` }
  }
  return { allowed: true, label: 'Access allowed', detail: `${roles[role].name} has the required resource permission.` }
}
