import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  computeWalletReadiness,
  type WalletRole,
  type WalletSector,
  type WalletJurisdictionFootprint,
} from '../../lib/tools/walletReadiness'

const tool = getToolBySlug('wallet-readiness-assessor')!

const ROLE_OPTIONS: { value: WalletRole; label: string; hint: string }[] = [
  { value: 'verifier', label: 'Verifier', hint: 'You need to accept and check wallet-presented credentials from others.' },
  { value: 'issuer', label: 'Issuer', hint: 'You need to create and sign credentials that go into someone else\'s wallet.' },
  { value: 'holder', label: 'Holder', hint: 'You need to operate or use a wallet that stores and presents credentials.' },
]

const SECTOR_OPTIONS: { value: WalletSector; label: string }[] = [
  { value: 'banking-financial-services', label: 'Banking & Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'large-online-platform', label: 'Large Online Platform' },
  { value: 'government-public-sector', label: 'Government / Public Sector' },
  { value: 'other-private-sector', label: 'Other Private Sector' },
]

const JURISDICTION_OPTIONS: { value: WalletJurisdictionFootprint; label: string }[] = [
  { value: 'eu-only', label: 'European Union only' },
  { value: 'us-only', label: 'United States only' },
  { value: 'eu-and-us', label: 'EU and US' },
  { value: 'global', label: 'Global footprint' },
]

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function WalletReadinessAssessor() {
  const [roles, setRoles] = useState<WalletRole[]>([])
  const [sectors, setSectors] = useState<WalletSector[]>([])
  const [jurisdictions, setJurisdictions] = useState<WalletJurisdictionFootprint[]>([])

  const report = useMemo(() => computeWalletReadiness({ roles, sectors, jurisdictions }), [roles, sectors, jurisdictions])

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/30 flex items-start gap-2 text-xs text-text-secondary">
          <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-text-primary block mb-1">Educational, not legal advice.</span>
            This is a planning starting point. Always verify every deadline and obligation against the official source link and your own legal/compliance counsel before acting.
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Which wallet roles apply to you?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`p-3 rounded-lg border cursor-pointer text-xs ${roles.includes(opt.value) ? 'bg-accent-glow border-accent-primary/40' : 'bg-bg-card border-border-subtle'}`}
              >
                <span className="flex items-center gap-2 font-bold text-text-primary">
                  <input
                    type="checkbox"
                    checked={roles.includes(opt.value)}
                    onChange={() => setRoles((prev) => toggle(prev, opt.value))}
                    className="accent-accent-primary"
                  />
                  {opt.label}
                </span>
                <span className="block mt-1 text-text-secondary">{opt.hint}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Sector</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTOR_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`p-2.5 rounded-lg border cursor-pointer text-xs font-bold text-text-primary flex items-center gap-2 ${sectors.includes(opt.value) ? 'bg-accent-glow border-accent-primary/40' : 'bg-bg-card border-border-subtle'}`}
              >
                <input
                  type="checkbox"
                  checked={sectors.includes(opt.value)}
                  onChange={() => setSectors((prev) => toggle(prev, opt.value))}
                  className="accent-accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Jurisdiction footprint</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {JURISDICTION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`p-2.5 rounded-lg border cursor-pointer text-xs font-bold text-text-primary flex items-center gap-2 ${jurisdictions.includes(opt.value) ? 'bg-accent-glow border-accent-primary/40' : 'bg-bg-card border-border-subtle'}`}
              >
                <input
                  type="checkbox"
                  checked={jurisdictions.includes(opt.value)}
                  onChange={() => setJurisdictions((prev) => toggle(prev, opt.value))}
                  className="accent-accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-secondary">
          {report.summary}
        </div>

        {report.acceptanceObligationLikely && (
          <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/30 flex items-start gap-2 text-xs text-text-secondary">
            <AlertTriangle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <span>
              <strong className="text-text-primary block mb-1">Likely EU relying-party wallet-acceptance obligation.</strong>
              Your sector and jurisdiction selections match the profile of organizations expected to accept the EU Digital Identity Wallet on a fixed regulatory timeline. Confirm the exact deadline with your compliance team.
            </span>
          </div>
        )}

        {roles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider">Readiness Checklist</h2>
            <div className="space-y-2">
              {report.applicableChecklist.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-bg-card border border-border-subtle">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">{item.role}</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{item.task}</p>
                      <p className="text-[11px] text-text-secondary mt-1">{item.rationale}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {roles.length > 0 && report.standardsProfile.length > 0 && (
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Applicable Standards Profile</h2>
            <ul className="space-y-1">
              {report.standardsProfile.map((s) => (
                <li key={s.standardId} className="text-[11px] text-text-secondary">
                  <Link to={`/standards?highlight=${s.standardId}`} className="font-bold text-accent-primary hover:underline inline-flex items-center gap-1">
                    {s.label} <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.relevantDeadlines.length > 0 && (
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Relevant Compliance Deadlines</h2>
            <div className="space-y-2">
              {report.relevantDeadlines.map((d) => (
                <div key={d.id} className="text-[11px] text-text-secondary">
                  <span className="font-bold text-text-primary">{d.deadlineDate}</span> — {d.regulation} ({d.jurisdiction})
                  <p className="mt-0.5">{d.description}</p>
                  <a href={d.officialLink} target="_blank" rel="noreferrer" className="text-accent-primary hover:underline text-[10px] inline-flex items-center gap-1 mt-0.5">
                    Official source <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
