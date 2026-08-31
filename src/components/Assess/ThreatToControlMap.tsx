import { Link } from 'react-router-dom'
import { ShieldAlert, Crosshair, ArrowRight } from 'lucide-react'
import { questions } from '../../lib/assess/scoring'
import { CVE_DATABASE } from '../../data/researchData'
import { BULLETINS } from '../../data/bulletinsData'
import { ROUTE_META } from '../../routeMeta'

interface ThreatToControlMapProps {
  answers: Record<number, number>
}

// Hardcoded map connecting a low score in an assess dimension to a relevant CVE, Bulletin, and Playground
const MAPPING: Record<string, { cveId?: string, bulletinId?: string, playgroundPath: string, remediationTitle: string }> = {
  'Identity Governance (IGA)': {
    bulletinId: 'incident-okta-har',
    playgroundPath: '/playground/nhi-sprawl',
    remediationTitle: 'Automate Deprovisioning & NHI Cleanup'
  },
  'Privileged Access (PAM)': {
    cveId: 'CVE-2020-1472', // Zerologon
    bulletinId: 'incident-solarwinds', // Golden SAML / Cloud Admin
    playgroundPath: '/playground/pam-vaulting',
    remediationTitle: 'Enforce JIT & Vault Credentials'
  },
  'Authentication (MFA & Passkeys)': {
    bulletinId: 'incident-push-fatigue',
    playgroundPath: '/playground/fido2-conditional-ui',
    remediationTitle: 'Migrate to Phishing-Resistant MFA (FIDO2)'
  },
  'Endpoint & Device Trust': {
    cveId: 'CVE-2024-21626',
    playgroundPath: '/playground/device-trust',
    remediationTitle: 'Enforce Endpoint Posture Checks'
  },
  'Audit & Detection (ITDR)': {
    playgroundPath: '/playground/itdr',
    remediationTitle: 'Deploy Identity Threat Detection (ITDR)'
  }
}

export default function ThreatToControlMap({ answers }: ThreatToControlMapProps) {
  // Find dimensions where the user scored 1 or 2
  const criticalGaps = questions
    .map((q, i) => ({ dimension: q.dimension, score: answers[i] ?? 1 }))
    .filter(res => res.score < 3)

  if (criticalGaps.length === 0) {
    return (
      <div className="mt-8 p-6 bg-status-success/10 border border-status-success/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-1">
          <h3 className="font-bold text-status-success flex items-center gap-2">
            <Crosshair className="w-5 h-5" /> Threat-to-Control Posture Optimized
          </h3>
          <p className="text-xs text-text-secondary">Your baseline maturity successfully mitigates common tier-1 and tier-2 threats.</p>
        </div>
        <Link to="/playground" className="px-4 py-2 bg-status-success hover:bg-status-success/90 text-slate-950 font-bold rounded-lg text-xs transition">
          Continue Practice →
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
        <Crosshair className="w-5 h-5 text-accent-primary" />
        <h3 className="font-bold text-text-primary text-lg">Continuous Threat-to-Control Map</h3>
      </div>
      <p className="text-xs text-text-secondary">
        Based on your maturity gaps, here are the real-world attacks your organization is currently susceptible to, and the interactive playgrounds to practice implementing the required defenses.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {criticalGaps.map(gap => {
          const mapping = MAPPING[gap.dimension]
          if (!mapping) return null

          const playgroundMeta = ROUTE_META.find(r => r.path === mapping.playgroundPath)
          const cve = mapping.cveId ? CVE_DATABASE.find(c => c.id === mapping.cveId) : null
          const bulletin = mapping.bulletinId ? BULLETINS.find(b => b.id === mapping.bulletinId) : null

          return (
            <div key={gap.dimension} className="flex flex-col p-4 rounded-xl border border-status-danger/30 bg-bg-card shadow-sm hover:border-status-danger/50 transition">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-status-danger shrink-0" />
                <span className="font-bold text-text-primary text-sm">{gap.dimension} Gap</span>
              </div>

              <div className="flex-1 space-y-3">
                {(cve || bulletin) && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-bg-sidebar border border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Historical Threat Vector</span>
                    {cve && (
                      <Link to={`/research?cve=${cve.id}`} className="text-xs text-text-primary hover:text-accent-primary transition-colors block">
                        • {cve.id}: {cve.title}
                      </Link>
                    )}
                    {bulletin && (
                      <Link to={`/bulletins?bulletin=${bulletin.id}`} className="text-xs text-text-primary hover:text-accent-primary transition-colors block">
                        • {bulletin.title} (Bulletin)
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border-subtle">
                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider block mb-2">Recommended Training</span>
                {playgroundMeta && (
                  <Link
                    to={playgroundMeta.path}
                    className="group w-full flex items-center justify-between p-3 rounded-lg bg-accent-glow border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/10 transition"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs">{mapping.remediationTitle}</span>
                      <span className="text-[10px] text-text-secondary line-clamp-1">{playgroundMeta.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
