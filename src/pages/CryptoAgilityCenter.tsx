import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Atom, ArrowLeft, RefreshCw, ScanSearch, ShieldCheck, Lock,
  GitBranch, Layers, FlaskConical,
} from 'lucide-react'
import { CRYPTO_MIGRATION_WORKSTREAMS, type HndlExposure } from '../data/cryptoAgilityRoadmap'
import { HSM_ROOT_OF_TRUST_CONCEPTS } from '../data/hsmRootOfTrust'
import { NEXT_GEN_THEMES, type NextGenThemeId } from '../data/nextGenThemes'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'
import BookmarkButton from '../components/BookmarkButton'
import { useDeepLinkedItem, itemDomId } from '../lib/nextgen/useDeepLinkedItem'

type TabId = 'agility' | 'inventory' | 'pqc' | 'root-of-trust' | 'migration' | 'cross-cutting' | 'labs'

const TABS: { id: TabId; label: string; icon: typeof RefreshCw }[] = [
  { id: 'agility', label: 'Crypto Agility', icon: RefreshCw },
  { id: 'inventory', label: 'Inventory', icon: ScanSearch },
  { id: 'pqc', label: 'PQC Standards', icon: Lock },
  { id: 'root-of-trust', label: 'Root of Trust', icon: ShieldCheck },
  { id: 'migration', label: 'Migration', icon: GitBranch },
  { id: 'cross-cutting', label: 'Cross-Cutting', icon: Layers },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
]

const HNDL_COLOR: Record<HndlExposure, string> = {
  none: 'bg-bg-nested border-border-subtle text-text-secondary',
  low: 'bg-status-info/10 border-status-info/30 text-status-info',
  medium: 'bg-status-warning/10 border-status-warning/30 text-status-warning',
  high: 'bg-status-danger/10 border-status-danger/30 text-status-danger',
}

const THEME_CRYPTO_DEPENDENCY: { themeId: NextGenThemeId; dependency: string; pqcExposure: string }[] = [
  { themeId: 'agentic-identity', dependency: 'Token signing (JWT/JWS), mTLS, workload SVIDs', pqcExposure: 'Signature agility in token formats' },
  { themeId: 'ai-security-fabric', dependency: 'TLS to model/tool endpoints, log integrity', pqcExposure: 'Transport + integrity' },
  { themeId: 'phishing-resistant-auth', dependency: 'Authenticator key algorithms, attestation certs', pqcExposure: 'Hardware refresh cycle is the constraint' },
  { themeId: 'digital-wallets', dependency: 'Credential signatures, holder binding, status lists', pqcExposure: 'Long-lived credential validity windows' },
]

export default function CryptoAgilityCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('agility')
  const highlightedConcept = useDeepLinkedItem('concept', HSM_ROOT_OF_TRUST_CONCEPTS.map((c) => c.id))
  const highlightedWorkstream = useDeepLinkedItem('workstream', CRYPTO_MIGRATION_WORKSTREAMS.map((w) => w.id))

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
            <Atom className="w-3.5 h-3.5" /> Next-Gen IAM
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Crypto Agility & Root of Trust
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Every theme above rests on cryptography with a finite shelf life. This is the substrate binding all four
            other Next-Gen IAM themes together.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton item={{ id: 'nextgen-crypto-agility', title: 'Crypto Agility Center', link: '/next-gen/crypto-agility' }} />
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

      {/* TAB: AGILITY */}
      {activeTab === 'agility' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Crypto Agility as a Discipline</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Can you inventory, swap, and verify an algorithm without re-architecting? The four-step discipline:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {['Inventory', 'Prioritize by Exposure', 'Migrate', 'Verify & Monitor'].map((step, i) => (
              <div key={step} className="p-4 rounded-xl bg-bg-card border border-border-subtle text-center space-y-1">
                <div className="w-6 h-6 mx-auto rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[11px]">{i + 1}</div>
                <div className="text-xs font-bold text-text-primary">{step}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: INVENTORY */}
      {activeTab === 'inventory' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Finding Cryptography in an Identity Estate</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Token signing keys, TLS, directory channel security, authenticator attestation, credential signatures,
            HSM-held roots, code signing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/tools/identity-sbom-analyzer" className="p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors">
              <h3 className="text-sm font-black text-text-primary">Identity SBOM Analyzer</h3>
              <p className="text-xs text-text-secondary mt-1">Inventory cryptographic dependencies hiding in your codebase.</p>
            </Link>
            <Link to="/tools/pqc-readiness-auditor" className="p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors">
              <h3 className="text-sm font-black text-text-primary">PQC Readiness Auditor</h3>
              <p className="text-xs text-text-secondary mt-1">Assess post-quantum migration readiness.</p>
            </Link>
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/tools/crypto-agility-inventory" className="text-xs font-bold text-accent-primary hover:underline">
              Try the Crypto Agility Inventory Builder →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: PQC */}
      {activeTab === 'pqc' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Post-Quantum Standards</h2>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            NIST finalized FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) in August 2024. "Harvest-now-decrypt-later"
            means data encrypted today is already exposed to a future quantum adversary who stored it. Hybrid modes
            (classical + PQC) hedge the transition; be honest about larger signature sizes and performance trade-offs.
          </p>
          <Link to="/standards?standard=pqc-fips203-205" className="block p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors w-fit">
            <span className="text-sm font-black text-accent-primary">NIST FIPS 203/204/205 →</span>
          </Link>
          <div className="flex justify-center pt-2">
            <Link to="/playground/pqc-handshake" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Post-Quantum Handshake Lab →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: ROOT OF TRUST */}
      {activeTab === 'root-of-trust' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Hardware Root of Trust</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            What an HSM guarantees that software key storage cannot — every theme above ultimately terminates in a
            root key.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HSM_ROOT_OF_TRUST_CONCEPTS.map((c) => (
              <div key={c.id} id={itemDomId('concept', c.id)} className={`p-4 rounded-2xl bg-bg-card border shadow-sm space-y-2 transition-colors ${highlightedConcept === c.id ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border-subtle'}`}>
                <h3 className="text-sm font-black text-text-primary">{c.title}</h3>
                <p className="text-[11px] text-accent-primary italic">{c.analogy}</p>
                <p className="text-xs text-text-secondary">{c.expert}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: MIGRATION */}
      {activeTab === 'migration' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Dependency-Ordered Migration</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            You cannot migrate credential signatures before the issuing CA, nor authenticator attestation before the
            authenticators support it. Root-level workstreams (no dependencies) come first.
          </p>
          <div className="space-y-2">
            {CRYPTO_MIGRATION_WORKSTREAMS.map((w) => (
              <div key={w.id} id={itemDomId('workstream', w.id)} className={`p-4 rounded-xl bg-bg-card border space-y-2 transition-colors ${highlightedWorkstream === w.id ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border-subtle'}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-black text-text-primary">{w.title}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${HNDL_COLOR[w.hndlExposure]}`}>
                    HNDL: {w.hndlExposure}
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary">
                  <span className="font-black text-text-muted uppercase">{w.domain}: </span>
                  {w.currentAlgorithms.join(', ')} → {w.targetAlgorithms.join(', ')}
                </div>
                {w.dependsOn.length > 0 ? (
                  <div className="text-[10px] text-status-warning">
                    Depends on: {w.dependsOn.map((depId) => CRYPTO_MIGRATION_WORKSTREAMS.find((x) => x.id === depId)?.title ?? depId).join(', ')}
                  </div>
                ) : (
                  <div className="text-[10px] text-status-success">No dependencies — a root workstream</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/playground/crypto-migration" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Crypto Migration Planner →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: CROSS-CUTTING */}
      {activeTab === 'cross-cutting' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Matrix Binding All Five Themes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="py-2 pr-4 font-black text-text-primary">Theme</th>
                  <th className="py-2 pr-4 font-black text-text-primary">Crypto Dependency</th>
                  <th className="py-2 font-black text-text-primary">PQC Exposure</th>
                </tr>
              </thead>
              <tbody>
                {THEME_CRYPTO_DEPENDENCY.map((row) => {
                  const theme = NEXT_GEN_THEMES.find((t) => t.id === row.themeId)
                  return (
                    <tr key={row.themeId} className="border-b border-border-subtle/40">
                      <td className="py-3 pr-4">
                        <Link to={theme?.route ?? '/next-gen'} className="font-bold text-accent-primary hover:underline whitespace-nowrap">
                          {theme?.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-text-secondary wrap-break-word">{row.dependency}</td>
                      <td className="py-3 text-text-secondary wrap-break-word">{row.pqcExposure}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: LABS */}
      {activeTab === 'labs' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Labs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { path: '/playground/crypto-migration', label: 'Crypto Migration Planner' },
              { path: '/playground/pqc-handshake', label: 'Post-Quantum Handshake Lab' },
              { path: '/playground/cert-chain', label: 'Certificate Chain Validator' },
              { path: '/playground/mpc-threshold', label: 'MPC Threshold Sandbox' },
              { path: '/tools/pqc-readiness-auditor', label: 'PQC Readiness Auditor' },
              { path: '/tools/pki-ca-workbench', label: 'PKI CA Workbench' },
              { path: '/tools/crypto-agility-inventory', label: 'Crypto Agility Inventory Builder' },
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
        <ContentFeedback id="nextgen-crypto-agility" title="Crypto Agility Center" />
      </section>
      <RelatedContentRail nodeId="term:crypto_agility" />
    </div>
  )
}
