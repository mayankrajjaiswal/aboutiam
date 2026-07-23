import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface Entitlement {
  id: string
  user: string
  role: string
  system: string
  lastUsed: string
  sodTag?: string
  decision: 'pending' | 'approved' | 'revoked'
}

const SOD_CONFLICTS: Record<string, string> = {
  'invoice-approver': 'payment-issuer',
  'payment-issuer': 'invoice-approver',
}

const INITIAL: Entitlement[] = [
  { id: 'e1', user: 'alice@company.com', role: 'invoice-approver', system: 'SAP Finance', lastUsed: '3 days ago', sodTag: 'invoice-approver', decision: 'pending' },
  { id: 'e2', user: 'alice@company.com', role: 'payment-issuer', system: 'SAP Finance', lastUsed: '2 days ago', sodTag: 'payment-issuer', decision: 'pending' },
  { id: 'e3', user: 'bob@company.com', role: 'read-only-analyst', system: 'Snowflake', lastUsed: '1 day ago', decision: 'pending' },
  { id: 'e4', user: 'carol@company.com', role: 'domain-admin', system: 'Active Directory', lastUsed: '214 days ago', decision: 'pending' },
  { id: 'e5', user: 'dave@company.com', role: 'hr-record-editor', system: 'Workday', lastUsed: '5 days ago', decision: 'pending' },
]

export default function AccessCertificationLab() {
  const [rows, setRows] = useState<Entitlement[]>(INITIAL)
  const [logs, setLogs] = useState<string[]>(['[IGA Campaign] Q3 Access Recertification Campaign started — 5 entitlements assigned to reviewers.'])

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg])

  const decide = (id: string, decision: 'approved' | 'revoked') => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, decision } : r)))
    addLog(`[Reviewer] ${row.user}'s "${row.role}" on ${row.system} ${decision === 'approved' ? 'APPROVED — access confirmed still needed.' : 'REVOKED — access removed from ' + row.system + '.'}`)
  }

  const sodConflicts = useMemo(() => {
    const byUser: Record<string, Entitlement[]> = {}
    rows.forEach((r) => {
      if (!r.sodTag) return
      byUser[r.user] = [...(byUser[r.user] || []), r]
    })
    const conflicts: string[] = []
    Object.entries(byUser).forEach(([user, ents]) => {
      const roles = ents.filter((e) => e.decision !== 'revoked').map((e) => e.sodTag!)
      roles.forEach((role) => {
        const conflictRole = SOD_CONFLICTS[role]
        if (conflictRole && roles.includes(conflictRole) && role < conflictRole) {
          conflicts.push(`${user} holds both "${role}" and "${conflictRole}" — a toxic combination that lets one person both approve and pay an invoice.`)
        }
      })
    })
    return conflicts
  }, [rows])

  const pendingCount = rows.filter((r) => r.decision === 'pending').length
  const progress = Math.round(((rows.length - pendingCount) / rows.length) * 100)

  const reset = () => {
    setRows(INITIAL)
    setLogs(['[IGA Campaign] Q3 Access Recertification Campaign started — 5 entitlements assigned to reviewers.'])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-bg-card to-bg-sidebar rounded-2xl border border-border-subtle/50 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <ClipboardCheck className="w-3.5 h-3.5" /> Identity Governance Intermediate Lab
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">Access Certification Campaign Simulator</h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Play the reviewer role in a quarterly access recertification campaign. Approve or revoke each user-to-entitlement row, and watch the engine flag Separation-of-Duties (SoD) conflicts automatically.
          </p>
        </div>
        <Link to="/playground" className="text-sm bg-bg-card hover:bg-bg-sidebar border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
        <span className="text-xs font-bold text-text-secondary shrink-0">Campaign progress: {progress}%</span>
        <div className="flex-grow h-2.5 rounded-full bg-bg-sidebar overflow-hidden">
          <div className="h-full bg-accent-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={reset} className="px-2.5 py-1.5 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle text-text-secondary text-xs font-bold rounded-lg transition flex items-center gap-1 shrink-0">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {sodConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 space-y-2">
          {sodConflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs font-bold text-status-danger">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {c}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-bg-card border border-border-subtle shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-bg-sidebar text-text-muted uppercase text-[9px] font-bold">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Entitlement</th>
              <th className="text-left p-3">System</th>
              <th className="text-left p-3">Last Used</th>
              <th className="text-left p-3">Decision</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border-subtle/50">
                <td className="p-3 font-semibold text-text-primary">{r.user}</td>
                <td className="p-3 text-text-secondary">{r.role}</td>
                <td className="p-3 text-text-secondary">{r.system}</td>
                <td className={`p-3 ${r.lastUsed.includes('214') ? 'text-status-danger font-bold' : 'text-text-secondary'}`}>{r.lastUsed}</td>
                <td className="p-3">
                  {r.decision === 'pending' && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">Pending</span>}
                  {r.decision === 'approved' && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-status-success/10 text-status-success flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                  {r.decision === 'revoked' && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-status-danger/10 text-status-danger flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Revoked</span>}
                </td>
                <td className="p-3 text-right">
                  {r.decision === 'pending' && (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => decide(r.id, 'approved')} className="px-2.5 py-1 bg-status-success/10 hover:bg-status-success/20 text-status-success font-bold rounded text-[10px]">Approve</button>
                      <button onClick={() => decide(r.id, 'revoked')} className="px-2.5 py-1 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger font-bold rounded text-[10px]">Revoke</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px]">
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5">Campaign Audit Trail</span>
        <div className="h-40 overflow-y-auto text-emerald-400 space-y-1.5 mt-3 pr-1 leading-relaxed">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  )
}
