import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Compass, Wrench, Briefcase, CalendarClock,
  ExternalLink, CheckCircle2, Circle,
} from 'lucide-react'
import { NEXT_GEN_THEMES, type NextGenThemeId } from '../data/nextGenThemes'
import { COMPLIANCE_DEADLINES } from '../data/complianceDeadlines'
import BookmarkButton from '../components/BookmarkButton'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'

// The set of complianceDeadlines.ts ids that are directly relevant to the
// five Next-Gen IAM themes -- filtered rather than duplicated, per
// NextGenIAM.md §5.2 point 4 ("renders from the existing registry; do not
// duplicate the data").
const NEXT_GEN_DEADLINE_IDS = new Set([
  'eidas2-wallet-rollout',
  'eidas2-relying-party-acceptance',
  'eu-ai-act-biometric',
  'eu-ai-act-annex-iii-high-risk',
  'nist-800-63-4-final',
  'nist-pqc-federal-key-establishment',
  'nist-pqc-federal-signatures',
  'cnsa-2-0-legacy-systems',
])

interface StartHerePath {
  id: 'architect' | 'engineer' | 'leader'
  title: string
  icon: typeof Compass
  description: string
  steps: { themeId: NextGenThemeId; label: string }[]
}

const START_HERE_PATHS: StartHerePath[] = [
  {
    id: 'architect',
    title: 'Architect',
    icon: Compass,
    description: 'Design the target state: governance models, control-plane architecture, and the crypto substrate underneath.',
    steps: [
      { themeId: 'agentic-identity', label: 'Study the four-quadrant agentic ecosystem model' },
      { themeId: 'ai-security-fabric', label: 'Understand the Discover-Decide-Enforce-Observe control-plane loop' },
      { themeId: 'crypto-agility', label: 'Review the hardware root-of-trust dependency chain' },
    ],
  },
  {
    id: 'engineer',
    title: 'Engineer',
    icon: Wrench,
    description: 'Build and test: hands-on labs for agent registries, delegation chains, FIDO fleets, and credential issuance.',
    steps: [
      { themeId: 'agentic-identity', label: 'Run the Agent Registry & Lifecycle Studio' },
      { themeId: 'phishing-resistant-auth', label: 'Explore FIDO form factors and fleet lifecycle stages' },
      { themeId: 'digital-wallets', label: 'Try the Business Wallet Studio' },
    ],
  },
  {
    id: 'leader',
    title: 'Leader',
    icon: Briefcase,
    description: 'Assess risk, economics, and compliance exposure before committing budget.',
    steps: [
      { themeId: 'agentic-identity', label: 'Read the agent governance maturity ladder' },
      { themeId: 'digital-wallets', label: 'Check the eIDAS 2.0 relying-party acceptance obligation' },
      { themeId: 'crypto-agility', label: 'Understand harvest-now-decrypt-later exposure' },
    ],
  },
]

export default function NextGenIamCenter() {
  const [expandedPath, setExpandedPath] = useState<StartHerePath['id'] | null>(null)

  const nextGenDeadlines = useMemo(() => {
    return COMPLIANCE_DEADLINES
      .filter((d) => NEXT_GEN_DEADLINE_IDS.has(d.id))
      .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* HERO */}
      <div className="space-y-4 border-b border-border-subtle pb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen IAM
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          The Next Generation of Identity
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl leading-relaxed">
          Identity is being redefined by three forces at once: a new principal type (AI agents that act autonomously),
          a new credential model (wallets that carry verifiable, portable proof), and a new cryptographic baseline
          (post-quantum algorithms with a finite migration window). This center teaches all five resulting shifts
          vendor-neutrally, with hands-on labs for each.
        </p>
      </div>

      {/* THE FIVE SHIFTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-text-primary">The Five Shifts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEXT_GEN_THEMES.map((theme) => {
            const Icon = theme.icon
            return (
              <Link
                key={theme.id}
                to={theme.route}
                className="group p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm hover:border-accent-primary/40 hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-accent-glow text-accent-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <BookmarkButton item={{ id: `nextgen-theme-${theme.id}`, title: theme.title, link: theme.route }} />
                </div>
                <h3 className="text-sm font-black text-text-primary group-hover:text-accent-primary transition-colors">
                  {theme.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed flex-1">{theme.thesis}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/40 text-[10px] font-bold text-text-muted">
                  <span>{theme.relatedLabs.length} labs · {theme.relatedTools.length} tools</span>
                  <span className="text-accent-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* WHERE ARE YOU ON THE CURVE */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-text-primary">Where Are You on the Curve?</h2>
        <p className="text-xs text-text-secondary max-w-2xl">
          Each theme has a 4-level maturity ladder. Pick the theme most relevant to you and find your current band —
          every level names a concrete next step.
        </p>
        <div className="space-y-3">
          {NEXT_GEN_THEMES.map((theme) => (
            <details key={theme.id} className="group rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
              <summary className="px-4 py-3 cursor-pointer text-xs font-black text-text-primary flex items-center justify-between hover:bg-bg-nested/30 transition-colors">
                {theme.title}
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {theme.maturityBands.map((band) => (
                  <div key={band.level} className="flex items-start gap-3 p-2.5 rounded-lg bg-bg-nested/30 text-xs">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[10px]">
                      {band.level}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-text-primary">{band.label}</div>
                      <div className="text-text-secondary">{band.description}</div>
                      <div className="text-accent-primary font-semibold">Next: {band.nextStep}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* REGULATORY CLOCK */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-accent-primary" /> The Regulatory Clock
        </h2>
        <p className="text-xs text-text-secondary max-w-2xl">
          Deadlines specifically relevant to the five Next-Gen IAM themes, pulled from the same registry that powers
          the full <Link to="/standards?view=deadlines" className="text-accent-primary font-semibold hover:underline">Compliance Deadlines tracker</Link>.
        </p>
        <div className="space-y-3">
          {nextGenDeadlines.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs font-mono font-bold text-accent-primary shrink-0">{d.deadlineDate}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-text-primary wrap-break-word">{d.regulation}</div>
                <div className="text-[11px] text-text-secondary wrap-break-word">{d.description}</div>
              </div>
              {d.confidence === 'estimated' && (
                <span className="shrink-0 text-[9px] bg-status-warning/10 border border-status-warning/30 text-status-warning font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Estimated
                </span>
              )}
              <a href={d.officialLink} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1">
                Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* START HERE PATHS */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-text-primary">Start Here</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {START_HERE_PATHS.map((path) => {
            const Icon = path.icon
            const isExpanded = expandedPath === path.id
            return (
              <div key={path.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent-glow text-accent-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-text-primary">{path.title}</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{path.description}</p>
                <button
                  type="button"
                  onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                  className="text-[10px] font-bold text-accent-primary hover:text-accent-hover"
                >
                  {isExpanded ? 'Hide steps' : 'Show steps'}
                </button>
                {isExpanded && (
                  <ul className="space-y-2 pt-2 border-t border-border-subtle/40">
                    {path.steps.map((step, idx) => {
                      const theme = NEXT_GEN_THEMES.find((t) => t.id === step.themeId)
                      return (
                        <li key={idx}>
                          <Link
                            to={theme?.route ?? '/next-gen'}
                            className="flex items-start gap-2 text-[11px] text-text-secondary hover:text-accent-primary group"
                          >
                            <Circle className="w-3 h-3 mt-0.5 shrink-0 group-hover:hidden" />
                            <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 hidden group-hover:block text-accent-primary" />
                            {step.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* CROSS-THEME DEPENDENCY DIAGRAM */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-text-primary">How the Five Themes Depend on Each Other</h2>
        <div className="p-6 rounded-2xl bg-bg-nested/30 border border-border-subtle overflow-x-auto">
          <pre className="text-[11px] font-mono text-text-secondary leading-relaxed whitespace-pre">
{`                     ┌─────────────────────────────────────────┐
                     │   T5: Crypto Agility, PQC & Root of      │
                     │   Trust  (the substrate — every layer    │
                     │   above ultimately signs with a key      │
                     │   this layer protects)                   │
                     └───────────────────┬───────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
   ┌──────────▼──────────┐   ┌──────────▼──────────┐               │
   │ T3: Phishing-        │   │ T4: Digital Wallets  │               │
   │ Resistant Auth &     │   │ & Verifiable         │               │
   │ FIDO Device Fleets   │   │ Credentials          │               │
   │ (the credential      │   │ (the credential      │               │
   │  layer for humans)   │   │  layer for orgs/data) │               │
   └──────────┬──────────┘   └──────────┬──────────┘               │
              │                          │                          │
              └──────────────┬───────────┘                          │
                             │                                      │
                  ┌──────────▼──────────┐            ┌──────────────▼──────┐
                  │ T1: Agentic Identity │◄──────────►│ T2: AI Security      │
                  │ & Governance         │  design vs  │ Fabric                │
                  │ (the new principal   │  runtime    │ (the runtime control │
                  │  type)               │  pairing    │  plane over it)       │
                  └──────────────────────┘            └───────────────────────┘`}
          </pre>
        </div>
      </section>

      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Was this page useful?</h3>
        <ContentFeedback id="nextgen-center" title="Next-Gen IAM Center" />
      </section>
      <RelatedContentRail nodeId="term:agentic_ai" />
    </div>
  )
}
