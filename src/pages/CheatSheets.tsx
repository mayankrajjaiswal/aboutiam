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
    },
    {
      id: 'soc2',
      title: 'SOC 2 Type II - Trust Services Criteria (Identity Controls)',
      target: 'Security Auditors, CTOs, and Compliance Managers',
      checks: [
        { id: 'soc2_1', task: 'CC6.1: Automated Directory Provisioning (SCIM)', desc: 'Configure automated directory lifecycle synchronization (SCIM) to immediately de-provision terminated employees, preventing unauthorized residual access.' },
        { id: 'soc2_2', task: 'CC6.2: Phishing-Proof Multi-Factor Authentication', desc: 'Mandate phishing-resistant Multi-Factor Authentication (FIDO2 / WebAuthn passkeys) for all administrative logins and core workforce endpoints.' },
        { id: 'soc2_3', task: 'CC6.3: Just-In-Time role elevation (PIM)', desc: 'Enforce Role-Based Access Control (RBAC) backed by Just-In-Time role elevation (PIM) to prevent permanent, static administrator credential keys.' },
        { id: 'soc2_4', task: 'CC6.8: API Gateway Authorization & Scope Validation', desc: 'Secure API endpoints by terminating connections at an API Gateway, validating JWT scopes, and blocking unauthenticated backchannel hops.' }
      ]
    },
    {
      id: 'iso27001',
      title: 'ISO/IEC 27001:2022 - Access Control (A.5.15 - A.5.18)',
      target: 'Information Security Officers, Compliance Auditors',
      checks: [
        { id: 'iso_1', task: 'Control A.5.15: Access Rights Lifecycle Workflows', desc: 'Implement automated, documented Joiner-Mover-Leaver workflows with mandatory quarterly user access entitlement reviews.' },
        { id: 'iso_2', task: 'Control A.5.16: Secure Identity & Secrets Management', desc: 'Enforce unique identifier bindings (disallowing shared admin credentials) and store secrets vaulted with automated CPM rotation cycles.' },
        { id: 'iso_3', task: 'Control A.5.17: Privileged Session Monitoring & Vaulting', desc: 'Maintain complete session recordings, command logs, and credential masking for all privileged sessions accessing production clusters.' },
        { id: 'iso_4', task: 'Control A.5.18: Dynamic Departmental Group Re-evaluation', desc: 'Establish automated triggers to re-evaluate and reclaim security group memberships when users transfer departments or change roles.' }
      ]
    },
    {
      id: 'hipaa',
      title: 'HIPAA Security Rule - Technical Safeguards (§ 164.312)',
      target: 'Healthcare App Developers, Compliance Officers',
      checks: [
        { id: 'hipaa_1', task: '§164.312(a)(1): Unique User Identification', desc: 'Configure distinct, cryptographically-bound identifiers for every workforce member accessing systems that store or process Protected Health Information (PHI).' },
        { id: 'hipaa_2', task: '§164.312(a)(2)(iv): Encryption-at-Rest & In-Transit', desc: 'Mandate TLS 1.3 for all PHI transit pipelines (mTLS) and encrypt database partitions-at-rest using AES-256 keys.' },
        { id: 'hipaa_3', task: '§164.312(d): Person or Entity Authentication', desc: 'Disable standard IP-based or static API key authentication, requiring dynamic cryptographic user and system-to-system validations.' },
        { id: 'hipaa_4', task: '§164.312(e): Transmission Security (Integrity)', desc: 'Block unauthorized message modification in transit by signing all API payload parameters with asymmetric cryptographic hashes.' }
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
          Security & Compliance Cheat Sheets
        </h2>
        <p className="text-text-secondary">
          Interactive compliance checklists for software engineers and auditors. Check off remediation steps to calculate your application's real-time security posture and regulatory compliance rating.
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
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  activeSheet === s.id
                    ? 'bg-bg-card border-accent-primary shadow-sm'
                    : 'bg-bg-nested border-border-subtle hover:bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                <span className={`block font-bold text-sm ${activeSheet === s.id ? 'text-accent-primary' : 'text-text-primary'}`}>{s.title.split(' - ')[0]}</span>
                <span className="block text-[10px] text-text-muted font-bold uppercase mt-1">Target: {s.target.split(', ')[0]}</span>
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
                    {pct === 100 ? 'Audit Compliant' : 'Uncertified'}
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
                    className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all cursor-pointer ${
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
