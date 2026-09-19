import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, ArrowLeft, Users, Building2, RefreshCw, Scale,
  Globe2, ShieldCheck, FlaskConical, ExternalLink,
} from 'lucide-react'
import { BUSINESS_WALLET_USE_CASES } from '../data/businessWalletUseCases'
import { WALLET_PROGRAMMES, type WalletRegion } from '../data/walletProgrammes'
import { COMPLIANCE_DEADLINES } from '../data/complianceDeadlines'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'
import BookmarkButton from '../components/BookmarkButton'

type TabId = 'roles' | 'business-wallet' | 'lifecycle' | 'regulation' | 'programmes' | 'trust-models' | 'labs'

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'roles', label: 'Three Roles', icon: Users },
  { id: 'business-wallet', label: 'Business Wallet', icon: Building2 },
  { id: 'lifecycle', label: 'Lifecycle', icon: RefreshCw },
  { id: 'regulation', label: 'Regulation', icon: Scale },
  { id: 'programmes', label: 'Programmes', icon: Globe2 },
  { id: 'trust-models', label: 'Trust Models', icon: ShieldCheck },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
]

const WALLET_ROLES = [
  {
    id: 'verifier',
    title: 'Verifier / Relying Party',
    tagline: '"I need to check a credential."',
    barrier: 'Lowest barrier; first regulatory obligation',
    responsibilities: ['Validate issuer trust against a trust registry', 'Check revocation status', 'Verify holder binding'],
    standards: 'OpenID4VP, ISO/IEC 18013-5 (mdoc) presentation',
  },
  {
    id: 'issuer',
    title: 'Issuer',
    tagline: '"I need to issue credentials about my subjects."',
    barrier: 'Requires trust-registry presence, key management, revocation infrastructure',
    responsibilities: ['Operate a Credential Endpoint (OpenID4VCI)', 'Manage signing keys (root-of-trust grade)', 'Maintain a revocation/status-list mechanism'],
    standards: 'OpenID4VCI',
  },
  {
    id: 'holder',
    title: 'Holder (incl. Organizational Wallet)',
    tagline: '"I need to hold and present credentials."',
    barrier: 'The under-served enterprise case',
    responsibilities: ['Store credentials securely', 'Present selectively on request', 'Manage custody and delegation (for a business wallet)'],
    standards: 'SD-JWT VC, OpenID4VP (as the presenting party)',
  },
]

const REGION_LABELS: Record<WalletRegion, string> = {
  EU: 'European Union',
  'North America': 'North America',
  APAC: 'Asia-Pacific',
  LATAM: 'Latin America',
  MEA: 'Middle East & Africa',
  Global: 'Global',
}

const WALLET_DEADLINE_IDS = new Set(['eidas2-wallet-rollout', 'eidas2-relying-party-acceptance'])

export default function DigitalWalletsCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('roles')
  const [regionFilter, setRegionFilter] = useState<WalletRegion | 'All'>('All')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && TABS.some((t) => t.id === tab)) {
      setTimeout(() => setActiveTab(tab as TabId), 0)
    }
  }, [])

  const filteredProgrammes = regionFilter === 'All' ? WALLET_PROGRAMMES : WALLET_PROGRAMMES.filter((p) => p.region === regionFilter)
  const walletDeadlines = COMPLIANCE_DEADLINES.filter((d) => WALLET_DEADLINE_IDS.has(d.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Wallet className="w-3.5 h-3.5" /> Next-Gen IAM
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Digital Wallets & Verifiable Credentials
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Wallet-based identity is proven at national scale and becoming a legal obligation. The full lifecycle
            matters — verification, issuance, and the under-served organizational wallet.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton item={{ id: 'nextgen-digital-wallets', title: 'Digital Wallets Center', link: '/next-gen/digital-wallets' }} />
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

      {/* TAB: ROLES */}
      {activeTab === 'roles' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Credential Triangle</h2>
          <p className="text-sm text-text-secondary max-w-3xl">Three distinct businesses to be in — each with its own standards, key management, and failure modes.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {WALLET_ROLES.map((role) => (
              <div key={role.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <h3 className="text-sm font-black text-text-primary">{role.title}</h3>
                <p className="text-xs text-accent-primary italic">{role.tagline}</p>
                <p className="text-[11px] text-text-secondary">{role.barrier}</p>
                <ul className="space-y-1">
                  {role.responsibilities.map((r, i) => (
                    <li key={i} className="text-[11px] text-text-secondary flex gap-1.5"><span className="text-accent-primary shrink-0">•</span>{r}</li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-border-subtle/40 text-[10px] text-text-muted">
                  <span className="font-black uppercase">Standards: </span>{role.standards}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: BUSINESS WALLET */}
      {activeTab === 'business-wallet' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Organizations as Credential Holders</h2>
          <p className="text-sm text-text-secondary max-w-3xl">The biggest single gap: custody, delegation, multi-signer authority, and audit at scale — different from a personal wallet.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUSINESS_WALLET_USE_CASES.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-text-primary">{u.title}</h3>
                  <span className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-black px-2 py-0.5 rounded uppercase">{u.role}</span>
                </div>
                <p className="text-[11px] text-text-secondary">{u.sector}</p>
                <p className="text-xs text-text-secondary">{u.walletApproach}</p>
                <div className="text-[10px] text-text-muted"><span className="font-black uppercase">Governance: </span>{u.governanceChallenges[0]}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/playground/business-wallet" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Business Wallet Studio →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Credential Lifecycle</h2>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {['Issue (OpenID4VCI)', 'Hold', 'Present (OpenID4VP)', 'Verify', 'Revoke / Refresh (Status List)'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex-1 p-3 rounded-xl bg-bg-card border border-border-subtle text-xs font-bold text-text-primary text-center">
                  {step}
                </div>
                {i < arr.length - 1 && <span className="text-text-muted shrink-0">→</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/playground/credential-issuance" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Credential Issuance Studio →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: REGULATION */}
      {activeTab === 'regulation' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Regulatory Obligation</h2>
          <div className="p-3 rounded-xl bg-status-warning/5 border border-status-warning/20 text-xs text-text-secondary">
            Educational, not legal advice. Verify against each entry's official source before relying on it for compliance planning.
          </div>
          <div className="space-y-3">
            {walletDeadlines.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-black text-text-primary">{d.regulation}</span>
                  <span className="text-xs font-mono font-bold text-accent-primary">{d.deadlineDate}</span>
                </div>
                <p className="text-xs text-text-secondary">{d.description}</p>
                <a href={d.officialLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1 w-fit">
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/tools/wallet-readiness-assessor" className="text-xs font-bold text-accent-primary hover:underline">
              Try the Wallet Readiness Assessor →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: PROGRAMMES */}
      {activeTab === 'programmes' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Global Wallet Programmes</h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setRegionFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                regionFilter === 'All' ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              All
            </button>
            {(Object.keys(REGION_LABELS) as WalletRegion[]).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setRegionFilter(region)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                  regionFilter === region ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {REGION_LABELS[region]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProgrammes.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-black text-text-primary">{p.name}</span>
                  <span className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-black px-2 py-0.5 rounded uppercase">{p.status}</span>
                </div>
                <p className="text-[11px] text-text-secondary">{p.jurisdiction}</p>
                <p className="text-[11px] text-text-secondary">{p.relyingPartyNotes}</p>
                <a href={p.sourceLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1 w-fit">
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: TRUST MODELS */}
      {activeTab === 'trust-models' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Trust Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">Government</h3>
              <p className="text-xs text-text-secondary">A national authority issues and vouches for the credential (e.g. EUDI Wallet PID, DigiLocker).</p>
            </div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">Bank-Backed</h3>
              <p className="text-xs text-text-secondary">A bank consortium operates the trust framework (e.g. BankID, itsme) — high domestic adoption via existing KYC relationships.</p>
            </div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">Private Federation</h3>
              <p className="text-xs text-text-secondary">A consortium of private issuers agrees on a shared trust framework without a government or bank anchor.</p>
            </div>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            A verifier must check the issuer's trust anchor matches its accepted trust model before honoring a
            presented credential — accepting an unfamiliar trust model without verification is the same mistake as
            trusting an unfamiliar certificate authority.
          </p>
        </section>
      )}

      {/* TAB: LABS */}
      {activeTab === 'labs' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Labs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { path: '/playground/business-wallet', label: 'Business Wallet Studio' },
              { path: '/playground/credential-issuance', label: 'Credential Issuance Studio' },
              { path: '/playground/openid4vc-wallet', label: 'OpenID4VC Wallet Studio' },
              { path: '/playground/vc-did', label: 'VC & DID Lab' },
              { path: '/playground/federated-vp', label: 'Federated Verifiable Presentation Playground' },
              { path: '/playground/mdl-proximity', label: 'mDL Proximity Playground' },
              { path: '/playground/trust-registry', label: 'Trust Registry Explorer' },
              { path: '/playground/zkp-wallet', label: 'ZKP Wallet' },
              { path: '/tools/sd-jwt-decoder', label: 'SD-JWT Decoder' },
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
        <ContentFeedback id="nextgen-digital-wallets" title="Digital Wallets Center" />
      </section>
      <RelatedContentRail nodeId="term:business_wallet" />
    </div>
  )
}
