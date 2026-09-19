import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert, ArrowLeft, Layers, ScanSearch, Filter, ArrowUpRight,
  Eye, Siren, AlertOctagon, FlaskConical,
} from 'lucide-react'
import { AI_CONTROL_PLANE_FUNCTIONS } from '../data/aiControlPlaneFunctions'
import { AGENT_THREAT_CATALOG, type AgentThreatCategory } from '../data/agentThreatCatalog'
import ContentFeedback from '../components/ContentFeedback'
import RelatedContentRail from '../components/RelatedContentRail'
import BookmarkButton from '../components/BookmarkButton'

type TabId = 'concept' | 'discovery' | 'guardrails' | 'egress' | 'observability' | 'intervene' | 'threats' | 'labs'

const TABS: { id: TabId; label: string; icon: typeof Layers }[] = [
  { id: 'concept', label: 'The Control Plane', icon: Layers },
  { id: 'discovery', label: 'Discovery', icon: ScanSearch },
  { id: 'guardrails', label: 'Guardrails', icon: Filter },
  { id: 'egress', label: 'Egress', icon: ArrowUpRight },
  { id: 'observability', label: 'Observability', icon: Eye },
  { id: 'intervene', label: 'Intervene', icon: Siren },
  { id: 'threats', label: 'Threat Catalogue', icon: AlertOctagon },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
]

const INTERVENTION_LADDER = [
  { rung: 1, action: 'Log', cost: 'Near zero', signal: 'Baseline telemetry, no behavioral change' },
  { rung: 2, action: 'Warn', cost: 'Low — a notification, no blocking', signal: 'Minor deviation from declared intent' },
  { rung: 3, action: 'Require Human Approval', cost: 'Adds latency, needs a human available', signal: 'Action crosses a defined risk threshold' },
  { rung: 4, action: 'Throttle', cost: 'Degrades legitimate throughput too', signal: 'Sustained anomalous volume or rate' },
  { rung: 5, action: 'Block', cost: 'May break a legitimate in-flight task', signal: 'High-confidence policy violation' },
  { rung: 6, action: 'Revoke Session (CAEP/SSF event)', cost: 'Full task interruption, requires re-authorization', signal: 'Confirmed compromise or critical drift' },
  { rung: 7, action: 'Decommission Agent', cost: 'Permanent — requires re-registration', signal: 'Repeated critical violations or unrecoverable trust loss' },
]

const THREAT_CATEGORIES: AgentThreatCategory[] = [
  'Intent Manipulation', 'Privilege Abuse', 'Data Exfiltration', 'Identity & Attribution', 'Supply Chain', 'Availability & Cost',
]

export default function AiSecurityFabricCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('concept')
  const [threatCategoryFilter, setThreatCategoryFilter] = useState<AgentThreatCategory | 'All'>('All')

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

  const filteredThreats = threatCategoryFilter === 'All'
    ? AGENT_THREAT_CATALOG
    : AGENT_THREAT_CATALOG.filter((t) => t.category === threatCategoryFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <ShieldAlert className="w-3.5 h-3.5" /> Next-Gen IAM — Flagship
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            AI Security Fabric Center
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Identity alone cannot catch an agent whose task has been hijacked mid-session. A runtime control plane
            watches what an agent actually does — and can step in.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton item={{ id: 'nextgen-ai-security-fabric', title: 'AI Security Fabric Center', link: '/next-gen/ai-security-fabric' }} />
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

      {/* TAB: CONCEPT */}
      {activeTab === 'concept' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">What Is an AI Control Plane?</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            A continuous four-function loop — the same PEP/PDP split that network security already uses, applied to
            agent traffic instead of network packets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_CONTROL_PLANE_FUNCTIONS.map((fn, idx) => (
              <div key={fn.id} className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-2 relative">
                <div className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[11px]">
                  {fn.order}
                </div>
                <h3 className="text-sm font-black text-text-primary">{fn.title}</h3>
                <p className="text-[11px] text-accent-primary font-semibold italic">{fn.question}</p>
                <p className="text-xs text-text-secondary">{fn.description}</p>
                <div className="pt-2 border-t border-border-subtle/40 text-[10px] text-text-muted">
                  <span className="font-black uppercase tracking-wider">Classic analogue: </span>{fn.classicAnalogue}
                </div>
                {idx < AI_CONTROL_PLANE_FUNCTIONS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-text-muted">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 text-xs text-text-secondary">
            The loop closes: {AI_CONTROL_PLANE_FUNCTIONS[3].title}'s output feeds back into {AI_CONTROL_PLANE_FUNCTIONS[0].title} —
            {' '}{AI_CONTROL_PLANE_FUNCTIONS[3].feedsFrom}
          </div>
        </section>
      )}

      {/* TAB: DISCOVERY */}
      {activeTab === 'discovery' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">You Cannot Govern What You Cannot See</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Shadow AI, unregistered agents, and undeclared MCP tool exposure are the starting failure mode of every
            AI security fabric.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/tools/identity-sbom-analyzer" className="p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors">
              <h3 className="text-sm font-black text-text-primary">Identity SBOM Analyzer</h3>
              <p className="text-xs text-text-secondary mt-1">Find risky auth libraries and dependencies hiding in your codebase.</p>
            </Link>
            <Link to="/tools/mcp-manifest-auditor" className="p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/40 transition-colors">
              <h3 className="text-sm font-black text-text-primary">MCP Manifest & Tool-Permission Auditor</h3>
              <p className="text-xs text-text-secondary mt-1">Audit MCP tool manifests for unbounded parameters and ambiguous descriptions.</p>
            </Link>
          </div>
        </section>
      )}

      {/* TAB: GUARDRAILS */}
      {activeTab === 'guardrails' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Semantic Guardrails vs Classic Policy</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Classic policy evaluates <strong>structured attributes</strong> (subject, resource, action). Semantic
            guardrails evaluate <strong>meaning and intent</strong> in natural-language and tool-call payloads. Both
            are needed; they fail differently.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">Classic Policy (ABAC/RBAC)</h3>
              <p className="text-xs text-text-secondary">Deterministic. Evaluates a fixed set of attributes against a rule set. Fails predictably — you can enumerate every input it will misclassify.</p>
            </div>
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
              <h3 className="text-sm font-black text-text-primary">Semantic Guardrail</h3>
              <p className="text-xs text-text-secondary">Probabilistic. A tuned classifier, not a boolean policy — tightening it raises false positives as it lowers false negatives. Be honest about this trade-off; it never becomes deterministic.</p>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Link to="/playground/ai-guardrails" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the AI Guardrail Policy Studio →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: EGRESS */}
      {activeTab === 'egress' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Is Sensitive Information Leaving?</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            DLP applied to agent outputs and tool calls: data classification, and the confidentiality risk of tool
            responses flowing into a model's context.
          </p>
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle text-xs text-text-secondary leading-relaxed">
            A tool response is not automatically trustworthy just because the agent was permitted to call the tool —
            the response's <em>content</em> still needs to pass egress inspection before it reaches the model context
            or an outbound channel. See the "Sensitive Data Egress via Tool Call" threat in the{' '}
            <button type="button" onClick={() => setActiveTab('threats')} className="text-accent-primary font-bold hover:underline">
              Threat Catalogue
            </button> tab.
          </div>
        </section>
      )}

      {/* TAB: OBSERVABILITY */}
      {activeTab === 'observability' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">What Is the Agent Actually Doing?</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            Task-drift detection compares declared intent against observed action — the central signal that drives
            the intervention ladder.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/playground/agent-observability" className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors">
              Try the Agent Behavior Observability Lab →
            </Link>
          </div>
        </section>
      )}

      {/* TAB: INTERVENE */}
      {activeTab === 'intervene' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">When Should We Step In?</h2>
          <p className="text-sm text-text-secondary max-w-3xl">
            The intervention ladder: each rung maps to a cost and a triggering signal. Intervene too early and you
            break a legitimate task; too late and the damage is done.
          </p>
          <div className="space-y-2">
            {INTERVENTION_LADDER.map((rung) => (
              <div key={rung.rung} className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-subtle">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary font-black flex items-center justify-center text-[11px]">
                  {rung.rung}
                </span>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <div className="text-xs font-bold text-text-primary">{rung.action}</div>
                  <div className="text-[11px] text-text-secondary">{rung.cost}</div>
                  <div className="text-[11px] text-accent-primary">{rung.signal}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: THREATS */}
      {activeTab === 'threats' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Agent-Specific Threat Catalogue</h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setThreatCategoryFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                threatCategoryFilter === 'All' ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              All
            </button>
            {THREAT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setThreatCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                  threatCategoryFilter === cat ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredThreats.map((threat) => (
              <div key={threat.id} className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-black text-text-primary">{threat.title}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                    threat.severity === 'critical' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' :
                    threat.severity === 'high' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning' :
                    'bg-bg-nested border-border-subtle text-text-secondary'
                  }`}>
                    {threat.severity}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{threat.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle/40">
                  <div>
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-wider">Identity Controls</div>
                    <ul className="mt-1 space-y-0.5">
                      {threat.identityControls.map((c, i) => (
                        <li key={i} className="text-[11px] text-text-secondary flex gap-1.5"><span className="text-accent-primary shrink-0">•</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-wider">Fabric Controls</div>
                    <ul className="mt-1 space-y-0.5">
                      {threat.fabricControls.map((c, i) => (
                        <li key={i} className="text-[11px] text-text-secondary flex gap-1.5"><span className="text-accent-primary shrink-0">•</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {threat.frameworkMapping.map((m) => (
                    <span key={m} className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-bold px-2 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: LABS */}
      {activeTab === 'labs' && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-text-primary">Labs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { path: '/playground/ai-guardrails', label: 'AI Guardrail Policy Studio' },
              { path: '/playground/agent-observability', label: 'Agent Behavior Observability Lab' },
              { path: '/playground/prompt-injection-escalation', label: 'Prompt Injection → Privilege Escalation Lab' },
              { path: '/playground/ai-threat-lab', label: 'AI Threat Lab' },
              { path: '/playground/rag-authorization', label: 'RAG Authorization' },
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
        <ContentFeedback id="nextgen-ai-security-fabric" title="AI Security Fabric Center" />
      </section>
      <RelatedContentRail nodeId="term:ai_control_plane" />
    </div>
  )
}
