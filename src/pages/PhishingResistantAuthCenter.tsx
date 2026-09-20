import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Fingerprint, ArrowLeft, HelpCircle, Layers, GitBranch, BadgeCheck,
  Calculator, Leaf, Atom, FlaskConical,
} from 'lucide-react'
import { FIDO_FORM_FACTORS, type AalCeiling } from '../data/fidoFormFactors'
import { FIDO_FLEET_LIFECYCLE } from '../data/fidoFleetLifecycle'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'
import BookmarkButton from '../components/BookmarkButton'
import { useDeepLinkedItem, itemDomId } from '../lib/nextgen/useDeepLinkedItem'

type TabId = 'why' | 'form-factors' | 'fleet-lifecycle' | 'attestation' | 'economics' | 'sustainability' | 'crypto-agility' | 'labs'

const TABS: { id: TabId; label: string; icon: typeof HelpCircle }[] = [
  { id: 'why', label: 'Why Phishing-Resistant', icon: HelpCircle },
  { id: 'form-factors', label: 'Form Factors', icon: Layers },
  { id: 'fleet-lifecycle', label: 'Fleet Lifecycle', icon: GitBranch },
  { id: 'attestation', label: 'Attestation', icon: BadgeCheck },
  { id: 'economics', label: 'Economics', icon: Calculator },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf },
  { id: 'crypto-agility', label: 'Crypto Agility', icon: Atom },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
]

const AAL_COLOR: Record<AalCeiling, string> = {
  AAL2: 'bg-status-info/10 border-status-info/30 text-status-info',
  AAL3: 'bg-status-success/10 border-status-success/30 text-status-success',
}

export default function PhishingResistantAuthCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('why')
  const highlightedFactor = useDeepLinkedItem('factor', FIDO_FORM_FACTORS.map((f) => f.id))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && TABS.some((t) => t.id === tab)) {
      setTimeout(() => setActiveTab(tab as TabId), 0)
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Fingerprint className="w-3.5 h-3.5" /> Next-Gen IAM
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Phishing-Resistant Auth & Device Fleets
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            FIDO is the settled answer to phishing. The unsolved problem is operating it at fleet scale.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton item={{ id: 'nextgen-phishing-resistant-auth', title: 'Phishing-Resistant Auth Center', link: '/next-gen/phishing-resistant-auth' }} />
          <Link to="/next-gen" className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Next-Gen IAM Center
          </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-1.5 border-b border-border-subtle pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                isActive ? 'bg-accent-primary text-white' : 'bg-bg-nested/30 text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB: WHY */}
      {activeTab === 'why' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Why Phishing-Resistant, Why Now</h2>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            NIST SP 800-63-4 (final, July 2025) explicitly states that passwords are not phishing-resistant, and now
            expects phishing-resistant methods at AAL2 and requires them at AAL3. "Phishing-resistant" has a precise
            cryptographic meaning: the protocol establishes an authenticated protected channel and strongly,
            irreversibly binds a channel identifier to the authenticator output — so a fraudulent verifier cannot
            successfully replay what it captured.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">What It Solves</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex gap-1.5"><span className="text-accent-primary">•</span>Credential replay against a fraudulent look-alike site</li>
                <li className="flex gap-1.5"><span className="text-accent-primary">•</span>Man-in-the-middle relay of a login flow</li>
                <li className="flex gap-1.5"><span className="text-accent-primary">•</span>Shared-secret theft (there is no shared secret to steal)</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">What It Does Not Solve</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex gap-1.5"><span className="text-status-warning">•</span>Device compromise (malware on an already-authenticated session)</li>
                <li className="flex gap-1.5"><span className="text-status-warning">•</span>Social-engineering the user into approving a legitimate-looking prompt</li>
                <li className="flex gap-1.5"><span className="text-status-warning">•</span>Fleet operations — procurement, distribution, and lifecycle at scale</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* TAB: FORM FACTORS */}
      {activeTab === 'form-factors' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">FIDO Form Factors — A Fleet Decision</h2>
          <p className="text-sm text-text-secondary max-w-3xl">No single form factor fits a whole organization — segmentation is the skill.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {FIDO_FORM_FACTORS.map((f) => (
              <div key={f.id} id={itemDomId('factor', f.id)} className={`p-5 rounded-2xl bg-bg-card border shadow-sm space-y-2 transition-colors ${highlightedFactor === f.id ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border-subtle'}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-text-primary">{f.name}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${AAL_COLOR[f.aalCeiling]}`}>
                    {f.aalCeiling}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{f.description}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle/40 text-[10px]">
                  <div><span className="font-black text-text-muted uppercase">Attestation: </span><span className="text-text-secondary">{f.attestationSupport}</span></div>
                  <div><span className="font-black text-text-muted uppercase">Cost: </span><span className="text-text-secondary">{f.costBand}</span></div>
                  <div><span className="font-black text-text-muted uppercase">Syncable: </span><span className="text-text-secondary">{f.syncable ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-black text-text-muted uppercase">Shared device: </span><span className="text-text-secondary">{f.sharedDeviceFriendly ? 'Yes' : 'No'}</span></div>
                </div>
                <div className="text-[11px] text-text-secondary"><span className="font-black text-text-muted uppercase text-[10px]">Best fit: </span>{f.bestFitPopulations.join(', ')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: FLEET LIFECYCLE */}
      {activeTab === 'fleet-lifecycle' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The FIDO Fleet Lifecycle</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Procure through recycle — the content nothing else on the portal covers today.
          </p>
          <div className="space-y-2">
            {FIDO_FLEET_LIFECYCLE.map((stage) => (
              <details key={stage.id} className="group rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer text-xs font-black text-text-primary flex items-center justify-between hover:bg-bg-nested/30 transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-[10px]">{stage.order}</span>
                    {stage.title}
                  </span>
                  <GitBranch className="w-3.5 h-3.5 text-text-muted group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 space-y-3 text-xs">
                  <p className="text-text-secondary">{stage.objective}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-wider">What Goes Wrong</div>
                      <ul className="mt-1 space-y-0.5">
                        {stage.whatGoesWrong.map((w, i) => <li key={i} className="text-[11px] text-status-warning flex gap-1.5"><span className="shrink-0">•</span>{w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-wider">Controls</div>
                      <ul className="mt-1 space-y-0.5">
                        {stage.controls.map((c, i) => <li key={i} className="text-[11px] text-text-secondary flex gap-1.5"><span className="text-accent-primary shrink-0">•</span>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle/40">
                    {stage.kpis.map((kpi) => (
                      <span key={kpi.name} title={kpi.definition} className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-bold px-2 py-0.5 rounded">
                        {kpi.name}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* TAB: ATTESTATION */}
      {activeTab === 'attestation' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Enterprise Attestation & AAGUID Policy</h2>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            Enterprise attestation lets a relying party verify the specific make and model of an authenticator before
            trusting it. An AAGUID identifies the authenticator's make/model (not the individual device) and serves
            as the lookup value in the FIDO Metadata Service — devices supporting enterprise attestation carry a
            distinct AAGUID from non-capable devices.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/playground/attestation-policy" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the AAGUID & Attestation Policy Lab →
            </Link>
          </div>
          <div className="flex justify-center">
            <Link to="/tools/webauthn-decoder" className="text-xs font-bold text-accent-primary hover:underline">
              Decode a sample attestation object →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: ECONOMICS */}
      {activeTab === 'economics' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Helpdesk / ROI Argument</h2>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            Password-reset ticket volume and cost, lockout time, and MFA-fatigue incident cost, versus device unit,
            fulfillment, and support cost. Model it transparently — every default must be sourced or clearly labeled
            as an illustrative assumption.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/tools/passwordless-roi-calculator" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Passwordless ROI & Helpdesk Cost Calculator →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: SUSTAINABILITY */}
      {activeTab === 'sustainability' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Eco-Design of a Device Fleet</h2>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            A genuine and under-covered enterprise procurement criterion: packaging, transport, multi-use/multi-protocol
            devices reducing device count, and refurbishment/end-of-life.
          </p>
          <div className="space-y-2">
            {FIDO_FORM_FACTORS.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-bg-card border border-border-subtle flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-bold text-text-primary shrink-0 sm:w-48">{f.name}</span>
                <span className="text-[11px] text-text-secondary">{f.sustainability}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: CRYPTO AGILITY */}
      {activeTab === 'crypto-agility' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Authenticator Crypto Has a Shelf Life Too</h2>
          <div className="space-y-2">
            {FIDO_FORM_FACTORS.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-bg-card border border-border-subtle flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-bold text-text-primary shrink-0 sm:w-48">{f.name}</span>
                <span className="text-[11px] text-text-secondary">{f.cryptoAgility}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/next-gen/crypto-agility" className="text-xs font-bold text-accent-primary hover:underline">
              Explore the Crypto Agility & Root of Trust Center →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: LABS */}
      {activeTab === 'labs' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Labs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { path: '/playground/fido-fleet-ops', label: 'FIDO Fleet Operations Simulator' },
              { path: '/playground/attestation-policy', label: 'AAGUID & Attestation Policy Lab' },
              { path: '/playground/fido2', label: 'FIDO2 & WebAuthn Playground' },
              { path: '/playground/passkey-internals', label: 'Passkey Internals' },
              { path: '/playground/passkey-policy', label: 'Passkey Policy Lab' },
              { path: '/playground/passkey-rollout-strategist', label: 'Passkey Rollout Strategist' },
              { path: '/playground/fido2-conditional-ui', label: 'Passkey Conditional UI' },
              { path: '/tools/webauthn-decoder', label: 'WebAuthn Decoder' },
            ].map((lab) => (
              <Link key={lab.path} to={lab.path} className="p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors text-xs font-bold text-text-primary flex items-center justify-between">
                {lab.label} <span className="text-accent-primary">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Was this page useful?</h3>
        <ContentFeedback id="nextgen-phishing-resistant-auth" title="Phishing-Resistant Auth Center" />
      </section>
      <RelatedContentRail nodeId="term:phishing_resistant_mfa" />
    </div>
  )
}
