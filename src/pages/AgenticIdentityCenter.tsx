import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot, ArrowLeft, HelpCircle, Layers, FileText, Scale, BookOpen,
  FlaskConical, Building2, AlertTriangle, ExternalLink, CheckCircle2,
} from 'lucide-react'
import { AGENTIC_QUADRANTS, type AgenticQuadrantId } from '../data/agenticEcosystemQuadrants'
import { AGENT_RECORD_FIELDS, type AgentRecordFieldGroup } from '../data/agentRegistryModel'
import { AGENT_GOVERNANCE_CAPABILITIES, getCapabilitiesByColumn } from '../data/agentGovernanceCapabilities'
import { STANDARDS } from '../data/standardsData'
import { VENDOR_CATALOG, type VendorType } from '../data/vendorCatalog'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'
import BookmarkButton from '../components/BookmarkButton'

type TabId = 'why' | 'quadrants' | 'job-description' | 'governance' | 'standards' | 'labs' | 'vendors'

const TABS: { id: TabId; label: string; icon: typeof HelpCircle }[] = [
  { id: 'why', label: 'Why Agents Break IAM', icon: HelpCircle },
  { id: 'quadrants', label: 'Four Ecosystems', icon: Layers },
  { id: 'job-description', label: 'Job Description', icon: FileText },
  { id: 'governance', label: 'Design vs Runtime', icon: Scale },
  { id: 'standards', label: 'Standards', icon: BookOpen },
  { id: 'labs', label: 'Hands-On Path', icon: FlaskConical },
  { id: 'vendors', label: 'Vendor Landscape', icon: Building2 },
]

const BROKEN_ASSUMPTIONS: { assumption: string; howBroken: string; consequence: string; labPath: string; labLabel: string }[] = [
  {
    assumption: 'A principal is a human or a static workload',
    howBroken: 'An agent is autonomous, non-deterministic, and spawns sub-agents',
    consequence: 'No stable subject to bind policy to',
    labPath: '/playground/agent-identity',
    labLabel: 'Agent Identity Lab',
  },
  {
    assumption: 'Authority is granted once at login',
    howBroken: 'An agent accumulates authority across many hops',
    consequence: 'Privilege creep within a single task',
    labPath: '/playground/delegation-chain',
    labLabel: 'Delegation Chain Auditor',
  },
  {
    assumption: 'Intent is implicit in the request',
    howBroken: 'An agent\'s intent is generated, and can be manipulated',
    consequence: 'A syntactically valid request may be semantically hostile',
    labPath: '/playground/prompt-injection-escalation',
    labLabel: 'Prompt Injection Escalation Lab',
  },
  {
    assumption: 'Audit means "who did what"',
    howBroken: 'Agent action chains span services and models',
    consequence: 'Attribution collapses without chain propagation',
    labPath: '/playground/agent-observability',
    labLabel: 'Agent Behavior Observability Lab',
  },
  {
    assumption: 'Revocation means disabling an account',
    howBroken: 'Agent authority is embedded in live tasks, tokens, and caches',
    consequence: 'Revocation must be event-driven (CAEP/SSF)',
    labPath: '/playground/caep-event-storm',
    labLabel: 'CAEP Event Storm',
  },
]

const QUADRANT_STANDARDS_EMPHASIS: Record<AgenticQuadrantId, { standards: string; threats: string }> = {
  enterprise: { standards: 'SPIFFE/SPIRE, workload identity, short-lived credentials, RFC 8693', threats: 'Lateral movement, over-broad service accounts, secret sprawl' },
  workforce: { standards: 'OIDC CIBA (human approval), step-up auth, RAR (RFC 9396)', threats: 'Consent fatigue, approval rubber-stamping, accountability gaps' },
  partners: { standards: 'Federation, trust registries, on-behalf-of chains, VCs for org identity', threats: 'Chain-of-custody loss, cross-tenant confusion, impersonation' },
  consumers: { standards: 'OAuth scoped delegation, consent receipts, revocation, wallets', threats: 'Over-broad consent, dark patterns, no revocation path, liability' },
}

const HANDS_ON_PATH: { order: number; path: string; label: string; note: string }[] = [
  { order: 1, path: '/playground/agent-identity', label: 'Agent Identity Lab', note: 'Least privilege for one agent' },
  { order: 2, path: '/playground/token-exchange', label: 'Token Exchange Broker Lab', note: 'The delegation primitive (RFC 8693)' },
  { order: 3, path: '/playground/agent-registry', label: 'Agent Registry & Lifecycle Studio', note: 'Register, own, declare intent' },
  { order: 4, path: '/playground/delegation-chain', label: 'Delegation Chain Auditor', note: 'Multi-hop on-behalf-of' },
  { order: 5, path: '/playground/mcp-server', label: 'MCP Server Playground', note: 'How agents reach tools' },
  { order: 6, path: '/playground/prompt-injection-escalation', label: 'Prompt Injection → Privilege Escalation Lab', note: 'When intent is hijacked' },
  { order: 7, path: '/playground/autonomous-agent', label: 'Autonomous Agent Lab', note: 'Adversarial dynamics' },
  { order: 8, path: '/playground/nhi-sprawl', label: 'NHI Sprawl Lab', note: 'The inventory problem at scale' },
  { order: 9, path: '/playground/ai-swarm', label: 'AI Swarm Orchestrator', note: 'Multi-agent coordination' },
]

const RELEVANT_STANDARD_IDS = ['mcp', 'rfc9396-rar', 'ciba', 'agent-authz-emerging', 'rfc8693', 'gnap', 'caep-ssf', 'spiffe-spire']

// Vendors shown here per the neutral-first, Thales-as-flagship contract
// (NextGenIAM.md §2.6): capabilities only where already publicly documented
// in vendorCatalog.ts, Thales named alongside peers, never alone.
const AGENTIC_VENDOR_KEYS: VendorType[] = ['thales', 'entra_id', 'okta', 'ping_identity']

const FIELD_GROUP_ORDER: AgentRecordFieldGroup[] = [
  'Identity', 'Ownership', 'Principal', 'Intent', 'Authority', 'Conditions', 'Provenance', 'Lifecycle',
]

export default function AgenticIdentityCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('why')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && TABS.some((t) => t.id === tab)) {
      setTimeout(() => {
        setActiveTab(tab as TabId)
      }, 0)
    }
  }, [])

  const relevantStandards = useMemo(
    () => RELEVANT_STANDARD_IDS.map((id) => STANDARDS.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [],
  )

  const identityCapabilities = getCapabilitiesByColumn('identity')
  const fabricCapabilities = getCapabilitiesByColumn('fabric')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Bot className="w-3.5 h-3.5" /> Next-Gen IAM — Flagship
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Agentic Identity Center
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Give an AI agent an identity, an owner, declared limits, and a lifecycle — and see how nine hands-on labs
            connect into one governance model.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton item={{ id: 'nextgen-agentic-identity', title: 'Agentic Identity Center', link: '/next-gen/agentic-identity' }} />
          <Link
            to="/next-gen"
            className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm"
          >
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
          <h2 className="text-lg font-black text-text-primary">Why Agents Break Classic IAM</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Five concrete ways an autonomous agent violates assumptions baked into existing IAM.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="py-2 pr-4 font-black text-text-primary">Classic Assumption</th>
                  <th className="py-2 pr-4 font-black text-text-primary">How an Agent Breaks It</th>
                  <th className="py-2 pr-4 font-black text-text-primary">Consequence</th>
                  <th className="py-2 font-black text-text-primary">Lab</th>
                </tr>
              </thead>
              <tbody>
                {BROKEN_ASSUMPTIONS.map((row, idx) => (
                  <tr key={idx} className="border-b border-border-subtle/40">
                    <td className="py-3 pr-4 text-text-secondary wrap-break-word">{row.assumption}</td>
                    <td className="py-3 pr-4 text-text-secondary wrap-break-word">{row.howBroken}</td>
                    <td className="py-3 pr-4 text-text-secondary wrap-break-word">{row.consequence}</td>
                    <td className="py-3">
                      <Link to={row.labPath} className="text-accent-primary font-bold hover:underline whitespace-nowrap">
                        {row.labLabel} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: QUADRANTS */}
      {activeTab === 'quadrants' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Four Agentic Ecosystems</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Every agent acts within one of four ecosystems, each with a distinct trust boundary and threat profile.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENTIC_QUADRANTS.map((q) => (
              <div key={q.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                <h3 className="text-sm font-black text-text-primary">{q.title}</h3>
                <p className="text-xs text-text-secondary">{q.whoActs}</p>
                <div className="p-3 rounded-xl bg-bg-nested/30 text-[11px] text-text-secondary italic">
                  "{q.exampleAsk}"
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-wider">Identity Problems</div>
                  <ul className="space-y-1">
                    {q.identityProblems.map((p, i) => (
                      <li key={i} className="text-[11px] text-text-secondary flex gap-1.5">
                        <span className="text-accent-primary shrink-0">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-subtle/40 text-[10px]">
                  <div>
                    <span className="font-black text-text-muted uppercase tracking-wider">Standards: </span>
                    <span className="text-text-secondary">{QUADRANT_STANDARDS_EMPHASIS[q.id].standards}</span>
                  </div>
                  <div>
                    <span className="font-black text-text-muted uppercase tracking-wider">Threats: </span>
                    <span className="text-text-secondary">{QUADRANT_STANDARDS_EMPHASIS[q.id].threats}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {q.relatedLabs.map((lab) => (
                    <Link key={lab} to={lab} className="text-[10px] font-bold text-accent-primary hover:underline">
                      {lab.replace('/playground/', '')} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: JOB DESCRIPTION */}
      {activeTab === 'job-description' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">An Agent Needs a Job Description</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Every field below maps to a classic IAM concept a practitioner already knows — that mapping is the point.
          </p>
          <div className="space-y-4">
            {FIELD_GROUP_ORDER.map((group) => {
              const fields = AGENT_RECORD_FIELDS.filter((f) => f.group === group)
              return (
                <div key={group} className="rounded-2xl bg-bg-card border border-border-subtle shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-bg-nested/30 border-b border-border-subtle text-xs font-black text-text-primary uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="divide-y divide-border-subtle/40">
                    {fields.map((field) => (
                      <div key={field.id} className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="font-bold text-text-primary flex items-center gap-1.5">
                          {field.label}
                          {field.required && <span className="text-status-danger text-[9px]">*</span>}
                        </div>
                        <div className="text-text-secondary">{field.purpose}</div>
                        <div className="text-accent-primary text-[11px]">
                          <span className="text-text-muted">IAM equivalent: </span>{field.iamEquivalent}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center pt-2">
            <Link
              to="/playground/agent-registry"
              className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
            >
              Try the Agent Registry & Lifecycle Studio →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: GOVERNANCE */}
      {activeTab === 'governance' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Design-Time vs Run-Time Governance</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Identity answers <em>"who and what may"</em>. The fabric answers <em>"what actually happened and should we intervene."</em> Neither is sufficient alone.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
              <h3 className="text-sm font-black text-text-primary">Agent Identity (design-time)</h3>
              <div className="space-y-2">
                {identityCapabilities.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-bg-nested/30 text-xs">
                    <div className="font-bold text-text-primary">{c.question}</div>
                    <div className="text-accent-primary font-semibold">{c.capability}</div>
                    <div className="text-text-secondary text-[11px]">{c.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
              <h3 className="text-sm font-black text-text-primary">AI Security Fabric (run-time)</h3>
              <div className="space-y-2">
                {fabricCapabilities.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-bg-nested/30 text-xs">
                    <div className="font-bold text-text-primary">{c.question}</div>
                    <div className="text-accent-primary font-semibold">{c.capability}</div>
                    <div className="text-text-secondary text-[11px]">{c.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/next-gen/ai-security-fabric" className="text-xs font-bold text-accent-primary hover:underline">
              Explore the AI Security Fabric Center →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: STANDARDS */}
      {activeTab === 'standards' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">The Standards Landscape for Agent Authorization</h2>
          <div className="p-3 rounded-xl bg-status-warning/5 border border-status-warning/20 flex items-start gap-2 text-xs text-text-secondary">
            <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            This area is moving fast — several entries below are explicitly labeled as evolving drafts, not finalized standards.
          </div>
          <div className="space-y-3">
            {relevantStandards.map((std) => (
              <Link
                key={std.id}
                to={`/standards?standard=${std.id}`}
                className="block p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-black text-text-primary">{std.title}</span>
                  <span className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    {std.year}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{std.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TAB: LABS */}
      {activeTab === 'labs' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Hands-On Path</h2>
          <p className="text-sm text-text-secondary max-w-3xl">A curated, ordered path through 9 labs.</p>
          <div className="space-y-2">
            {HANDS_ON_PATH.map((step) => (
              <Link
                key={step.order}
                to={step.path}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[11px]">
                  {step.order}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text-primary wrap-break-word">{step.label}</div>
                  <div className="text-[11px] text-text-secondary">{step.note}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-text-muted shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TAB: VENDORS */}
      {activeTab === 'vendors' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Implementation Landscape</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            How agent-identity capability is being addressed across the market, using only publicly-documented capabilities.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGENTIC_VENDOR_KEYS.map((key) => {
              const v = VENDOR_CATALOG[key]
              return (
                <Link
                  key={key}
                  to={`/vendor?v=${key}`}
                  className={`p-4 rounded-xl border shadow-sm hover:border-accent-primary/40 transition-colors ${
                    v.isFeatured ? 'bg-accent-glow border-accent-primary/20' : 'bg-bg-card border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {v.logo && <span className="text-lg">{v.logo}</span>}
                    <span className="text-sm font-black text-text-primary">{key === 'thales' ? 'Thales (OneWelcome & SafeNet)' : v.fullName}</span>
                    {v.isFeatured && (
                      <span className="text-[9px] bg-accent-primary text-white font-black px-1.5 py-0.5 rounded uppercase">Flagship</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">{v.category}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* SHARED: capabilities matrix always visible as reference */}
      {activeTab !== 'governance' && (
        <div className="text-[10px] text-text-muted flex items-center gap-1.5 pt-2 border-t border-border-subtle/40">
          <FileText className="w-3 h-3" /> {AGENT_GOVERNANCE_CAPABILITIES.length} governance capabilities modeled across identity and fabric —
          see the <button type="button" onClick={() => setActiveTab('governance')} className="text-accent-primary font-bold hover:underline">Design vs Runtime</button> tab.
        </div>
      )}

      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Was this page useful?</h3>
        <ContentFeedback id="nextgen-agentic-identity" title="Agentic Identity Center" />
      </section>
      <RelatedContentRail nodeId="term:ai_agent_identity" />

      <div className="text-[10px] text-text-muted flex items-center gap-1 justify-end">
        <ExternalLink className="w-3 h-3" /> All content vendor-neutral by default — see the Vendors tab for market landscape.
      </div>
    </div>
  )
}
