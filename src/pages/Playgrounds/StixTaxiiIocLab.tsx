import { useState } from 'react'
import { Share2, GitBranch, ShieldCheck, ShieldOff, Send } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  STIX_BUNDLE_SCENARIOS,
  TAXII_SUBSCRIBERS,
  matchesSubscriberFilter,
  buildStixBundle,
} from '../../data/stixTaxiiScenarios'

// Fixed layout coordinates (percentages), same "static declarative diagram" pattern as
// the CAEP Event Storm Visualizer — the fan-out shape is conceptually similar even
// though the payload/protocol here (STIX/TAXII) is entirely different.
const HUB_POSITION = { x: 50, y: 12 }
const SUBSCRIBER_POSITIONS = [
  { x: 18, y: 82 },
  { x: 50, y: 82 },
  { x: 82, y: 82 },
]

type DeliveryStatus = 'idle' | 'delivered' | 'not-subscribed'

export default function StixTaxiiIocLab() {
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground,
  } = usePlayground({ moduleId: 'stix_taxii_ioc_lab', initialScore: 100, maxHints: 3 })

  const [publishedScenarioIds, setPublishedScenarioIds] = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Record<string, DeliveryStatus>>(
    Object.fromEntries(TAXII_SUBSCRIBERS.map((s) => [s.id, 'idle']))
  )
  const [selectedScenarioId, setSelectedScenarioId] = useState(STIX_BUNDLE_SCENARIOS[0].id)
  const [showJson, setShowJson] = useState(false)

  const selectedScenario = STIX_BUNDLE_SCENARIOS.find((s) => s.id === selectedScenarioId)!
  const bundle = buildStixBundle(selectedScenario)

  const publishBundle = () => {
    log('info', `[TAXII Collection] Publishing bundle "${selectedScenario.title}"...`)

    const nextStatuses: Record<string, DeliveryStatus> = { ...statuses }
    let deliveredCount = 0
    for (const subscriber of TAXII_SUBSCRIBERS) {
      const matches = matchesSubscriberFilter(selectedScenario, subscriber)
      nextStatuses[subscriber.id] = matches ? 'delivered' : 'not-subscribed'
      if (matches) {
        deliveredCount += 1
        log('success', `${subscriber.name} received the bundle (filter matched tag: ${selectedScenario.tags.find((t) => subscriber.filterTags.includes(t))}).`)
      } else {
        log('info', `${subscriber.name} did not receive the bundle — no overlapping subscription tag.`)
      }
    }
    setStatuses(nextStatuses)

    const nextPublished = new Set(publishedScenarioIds)
    nextPublished.add(selectedScenario.id)
    setPublishedScenarioIds(nextPublished)

    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: assembled and published a STIX bundle (Indicator + related SDO + Relationship).')
    }
    if (currentStep === 1 && deliveredCount > 0 && deliveredCount < TAXII_SUBSCRIBERS.length) {
      completeStep(1, 'Checkpoint 2 verified: observed subscription filtering — some subscribers received the bundle, others correctly did not.')
    }
    if (currentStep <= 1 && nextPublished.size >= STIX_BUNDLE_SCENARIOS.length) {
      finishPlayground('🕸️ You published every scenario and observed how TAXII subscription filters shape identity-IOC fan-out delivery.')
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Publish the "Leaked Credential Hash → Threat Actor" bundle first — it has the simplest single-tag filter match to observe.',
      'Publish the "Compromised OAuth Token → Identity" bundle and compare which subscribers receive it versus the credential-leak bundles — the filters don\'t overlap.',
      'Toggle "View Raw STIX JSON" to see that the Relationship object\'s source_ref/target_ref are what actually links the Indicator to the Malware/Threat-Actor/Identity SDO — the graph view is just a rendering of that same relationship.',
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="STIX/TAXII Identity-IOC Fan-Out Simulator"
      description="Assemble a STIX 2.1 object bundle for an identity-relevant indicator of compromise, publish it to a mock TAXII 2.1 collection, and watch subscriber organizations receive — or correctly not receive — it based on their own subscription filters."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setPublishedScenarioIds(new Set())
        setStatuses(Object.fromEntries(TAXII_SUBSCRIBERS.map((s) => [s.id, 'idle'])))
        resetPlayground()
        log('info', 'Simulator reset. No bundles published.')
      }}
      sidebarContent={<TraceTerminal logs={logs} title="TAXII Exchange Log" />}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {STIX_BUNDLE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedScenarioId === scenario.id
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {publishedScenarioIds.has(scenario.id) && <ShieldCheck className="w-3.5 h-3.5" />}
              {scenario.title}
            </button>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed">{selectedScenario.narrative}</p>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-text-primary">
              {selectedScenario.indicator.label}
            </span>
            <GitBranch className="w-4 h-4 text-accent-primary shrink-0" />
            <span className="px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-text-primary uppercase">
              {selectedScenario.relatedObject.type}: {selectedScenario.relatedObject.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={publishBundle}
              className="px-3.5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Publish to TAXII Collection
            </button>
            <button
              onClick={() => setShowJson((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-text-secondary hover:text-text-primary text-xs font-bold transition-all"
            >
              {showJson ? 'Hide Raw STIX JSON' : 'View Raw STIX JSON'}
            </button>
          </div>

          {showJson && (
            <pre className="p-3.5 rounded-xl bg-bg-nested/80 border border-border-subtle text-[11px] text-text-primary overflow-x-auto font-mono">
              {JSON.stringify(bundle, null, 2)}
            </pre>
          )}
        </div>

        <div className="relative h-60 sm:h-72 rounded-2xl bg-bg-nested border border-border-subtle overflow-hidden max-h-[50vh] sm:max-h-none">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {SUBSCRIBER_POSITIONS.map((pos, idx) => (
              <line
                key={idx}
                x1={HUB_POSITION.x}
                y1={HUB_POSITION.y}
                x2={pos.x}
                y2={pos.y}
                stroke="currentColor"
                strokeWidth={0.4}
                className="text-border-subtle"
              />
            ))}
          </svg>

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${HUB_POSITION.x}%`, top: `${HUB_POSITION.y}%` }}
          >
            <div className="p-3 rounded-xl bg-accent-primary text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-primary bg-bg-card px-1.5 py-0.5 rounded border border-border-subtle">TAXII Collection</span>
          </div>

          {TAXII_SUBSCRIBERS.map((subscriber, idx) => {
            const pos = SUBSCRIBER_POSITIONS[idx]
            const status = statuses[subscriber.id]
            return (
              <div
                key={subscriber.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div
                  className={`p-2.5 rounded-xl border shadow-sm ${
                    status === 'delivered'
                      ? 'bg-status-success/15 border-status-success/40 text-status-success animate-pulse'
                      : status === 'not-subscribed'
                        ? 'bg-bg-card border-border-subtle text-text-muted'
                        : 'bg-bg-card border-border-subtle text-text-secondary'
                  }`}
                >
                  {status === 'not-subscribed' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold text-text-primary bg-bg-card px-1.5 py-0.5 rounded border border-border-subtle whitespace-nowrap">
                  {subscriber.name}
                </span>
                <span className="text-[9px] text-text-muted uppercase font-bold">{status}</span>
              </div>
            )
          })}
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Format & Protocol, Not Detection</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            STIX (Structured Threat Information eXpression) defines how threat objects relate to each other —
            here, an Indicator "indicates" a Malware/Threat-Actor/Identity object via an explicit Relationship
            object with a source_ref and target_ref. TAXII (Trusted Automated eXchange of Indicator Information)
            defines how those STIX bundles actually move between organizations — a collection publishes bundles,
            and each subscriber's own filter decides what it receives. Neither format tells you how to detect the
            indicator in the first place; that's a separate concern this simulator deliberately doesn't model.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
