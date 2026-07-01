import { useState } from 'react'
import { CheckSquare, ShieldCheck } from 'lucide-react'

interface CheckItem {
  id: string
  task: string
  desc: string
}

interface Sheet {
  id: string
  title: string
  target: string
  checks: CheckItem[]
}

export default function CheatSheets() {
  const [activeSheet, setActiveSheet] = useState('spa')
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  const sheets: Sheet[] = [
    {
      id: 'spa',
      title: 'Single-Page App (SPA) Security Baseline',
      target: 'React, Angular, Vue Developers',
      checks: [
        { id: 'spa_1', task: 'Implement Authorization Code flow with PKCE', desc: 'Ensure you are NOT using the deprecated Implicit Grant. Generate a SHA-256 code challenge for every login request.' },
        { id: 'spa_2', task: 'Enforce exact Redirect URI matching', desc: 'The authorization server must validate the redirect URI via an exact string match, barring any wildcards.' },
        { id: 'spa_3', task: 'Avoid localStorage for sensitive tokens', desc: 'If possible, use a Backend-For-Frontend (BFF) pattern to store tokens in HttpOnly, Secure, SameSite=Strict cookies to defeat XSS.' },
        { id: 'spa_4', task: 'Verify ID Token Signatures & Claims', desc: 'If parsing the id_token locally, verify the JWT signature against the IdP JWKS and check the "aud" (audience) matches your client ID.' }
      ]
    },
    {
      id: 'm2m',
      title: 'Machine-to-Machine (M2M) API Hardening',
      target: 'Backend Microservices, Cron Jobs',
      checks: [
        { id: 'm2m_1', task: 'Use Client Credentials Grant', desc: 'Authenticate daemons using client_id and client_secret directly at the /token endpoint.' },
        { id: 'm2m_2', task: 'Enforce Scope Limitations (Least Privilege)', desc: 'Do not issue global admin tokens. Request exact scopes (e.g., `system.read` vs `system.write`).' },
        { id: 'm2m_3', task: 'Implement Token Exchange (RFC 8693) for internal hops', desc: 'If Service A calls Service B on behalf of a user, exchange the public token for a restricted internal token before the hop.' },
        { id: 'm2m_4', task: 'Store secrets in an encrypted vault', desc: 'Never hardcode `client_secret` in environments. Inject it dynamically via HashiCorp Vault or AWS Secrets Manager.' }
      ]
    }
  ]

  const toggleCheck = (id: string) => {
    setCompleted({ ...completed, [id]: !completed[id] })
  }

  const currentSheet = sheets.find(s => s.id === activeSheet) || sheets[0]
  const sheetCompletedCount = currentSheet.checks.filter(c => completed[c.id]).length
  const totalChecks = currentSheet.checks.length
  const pct = Math.round((sheetCompletedCount / totalChecks) * 100)

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-secondary uppercase tracking-wider bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
          <CheckSquare className="w-3.5 h-3.5 text-status-success" /> Developer Playbooks
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Security Cheat Sheets
        </h2>
        <p className="text-text-secondary">
          Interactive compliance checklists for software engineers. Check off remediation steps to calculate your application's real-time security posture before deployment.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Selectors */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Available Playbooks</span>
          <div className="space-y-2">
            {sheets.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSheet(s.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeSheet === s.id
                    ? 'bg-bg-card border-accent-primary shadow-sm'
                    : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                <span className={`block font-bold text-sm ${activeSheet === s.id ? 'text-accent-primary' : 'text-text-primary'}`}>{s.title}</span>
                <span className="block text-[10px] text-text-muted font-bold uppercase mt-1">Target: {s.target}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Checklist */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm animate-fadeIn relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-border-subtle relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text-primary">{currentSheet.title}</h3>
                <p className="text-sm text-text-secondary font-medium">Compliance target: {currentSheet.target}</p>
              </div>

              {/* Progress Gauge */}
              <div className="flex items-center gap-4 bg-bg-sidebar border border-border-subtle p-3 rounded-xl shrink-0">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" className="stroke-border-subtle" strokeWidth="4" />
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      fill="none" 
                      className="stroke-status-success transition-all duration-1000" 
                      strokeWidth="4" 
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - pct / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="relative z-10 text-[10px] font-black text-text-primary">{pct}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Security Posture</span>
                  <span className={`text-xs font-black uppercase ${pct === 100 ? 'text-status-success' : 'text-status-warning'}`}>
                    {pct === 100 ? 'Production Ready' : 'Vulnerable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="pt-6 space-y-4 relative z-10">
              {currentSheet.checks.map(chk => {
                const isChecked = !!completed[chk.id]
                return (
                  <button
                    key={chk.id}
                    onClick={() => toggleCheck(chk.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all ${
                      isChecked
                        ? 'bg-status-success/5 border-status-success/30 shadow-inner'
                        : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar hover:border-accent-primary/30'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                      isChecked ? 'bg-status-success border-status-success text-white' : 'bg-bg-card border-border-subtle'
                    }`}>
                      {isChecked && <ShieldCheck className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-sm font-bold ${isChecked ? 'text-text-primary line-through opacity-70' : 'text-text-primary'}`}>
                        {chk.task}
                      </span>
                      <p className={`text-xs font-medium leading-relaxed ${isChecked ? 'text-text-muted line-through opacity-70' : 'text-text-secondary'}`}>
                        {chk.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
