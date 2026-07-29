import { useState } from 'react'
import { Radio, ShieldCheck, ShieldOff, WifiOff, Send } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'
import { CAEP_EVENT_TYPES, CAEP_SUBSCRIBERS, type CaepEventType } from '../../data/caepEventScenarios'

const CHAOS_SUBSCRIBER_ID = 'rp-github'

// Fixed layout coordinates (percentages) for the pub-sub diagram — a static
// declarative diagram is enough for 1 hub + 4 spokes and keeps this feature
// dependency-free, matching the site's zero-heavy-lib ethos.
const HUB_POSITION = { x: 50, y: 12 }
const SUBSCRIBER_POSITIONS = [
  { x: 12, y: 82 },
  { x: 38, y: 82 },
  { x: 62, y: 82 },
  { x: 88, y: 82 }
]

type SubscriberStatus = 'idle' | 'delivered' | 'ignored' | 'dropped'

export default function CaepEventStorm() {
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
    resetPlayground
  } = usePlayground({
    moduleId: 'caep_event_storm',
    initialScore: 100,
    maxHints: 3
  })

  const chaosEnabled = useAirplaneModeStore((s) => s.isEnabled)
  const setChaosEnabled = useAirplaneModeStore((s) => s.setEnabled)

  const [statuses, setStatuses] = useState<Record<string, SubscriberStatus>>(
    Object.fromEntries(CAEP_SUBSCRIBERS.map((s) => [s.id, 'idle']))
  )
  const [firedEventTypes, setFiredEventTypes] = useState<Set<CaepEventType>>(new Set())

  const fireEvent = (eventType: CaepEventType) => {
    const event = CAEP_EVENT_TYPES.find((e) => e.type === eventType)!
    log('info', `[IdP Event Bus] Broadcasting "${event.label}" to all subscribers...`)

    const nextStatuses: Record<string, SubscriberStatus> = { ...statuses }

    for (const subscriber of CAEP_SUBSCRIBERS) {
      const isSubscribed = subscriber.subscribedEventTypes.includes(eventType)
      if (!isSubscribed) {
        nextStatuses[subscriber.id] = 'ignored'
        log('info', `${subscriber.name} ignored the event — not subscribed to "${event.label}".`)
        continue
      }

      const isChaosVictim = chaosEnabled && subscriber.id === CHAOS_SUBSCRIBER_ID
      if (isChaosVictim) {
        nextStatuses[subscriber.id] = 'dropped'
        log('error', `🚨 ${subscriber.name} is offline (Airplane Mode chaos toggle) — event never delivered.`)
        continue
      }

      nextStatuses[subscriber.id] = 'delivered'
      log('success', `${subscriber.name} received the event in ${subscriber.simulatedLatencyMs}ms. Enforcement: ${subscriber.enforcement[eventType]}`)
    }

    setStatuses(nextStatuses)
    const nextFired = new Set(firedEventTypes)
    nextFired.add(eventType)
    setFiredEventTypes(nextFired)

    if (currentStep === 0 && nextFired.size >= 1) {
      completeStep(0, 'Checkpoint 1 verified: Fired a CAEP event and watched it fan out to subscribers.')
    }
    if (currentStep === 1 && Object.values(nextStatuses).includes('ignored')) {
      completeStep(1, 'Checkpoint 2 verified: Observed a subscriber correctly ignore an event it never subscribed to.')
    }
    if (currentStep <= 2 && chaosEnabled && Object.values(nextStatuses).includes('dropped')) {
      finishPlayground('🎉 You observed the real-world CAEP enforcement gap: even with signed, real-time events, an offline subscriber creates an enforcement blind spot until it reconnects.')
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Fire "Session Revoked" first — it has the most subscribers, so you\'ll see the clearest fan-out across multiple relying parties at once.',
      'Fire an event type that GitHub (RP-4) doesn\'t subscribe to (like "Session Revoked") and watch it get explicitly marked as ignored rather than silently dropped.',
      'Turn on the ✈️ Air-Gap & Resilience Console in the header, then fire any event GitHub (RP-4) is subscribed to — it will show as dropped instead of delivered, simulating a relying party that is temporarily unreachable.'
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="CAEP Event Storm Visualizer"
      description="Fire a Continuous Access Evaluation Protocol (CAEP) event from a mock IdP and watch it fan out to multiple subscribed relying parties in real time — each with its own subscription list, latency, and enforcement decision."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setStatuses(Object.fromEntries(CAEP_SUBSCRIBERS.map((s) => [s.id, 'idle'])))
        setFiredEventTypes(new Set())
        resetPlayground()
        log('info', 'Event storm reset. All subscribers idle.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {CAEP_EVENT_TYPES.map((event) => (
            <button
              key={event.type}
              onClick={() => fireEvent(event.type)}
              className="px-3.5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Fire "{event.label}"
            </button>
          ))}
          <button
            onClick={() => setChaosEnabled(!chaosEnabled)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              chaosEnabled ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' : 'bg-bg-nested border-border-subtle text-text-secondary'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" /> Chaos (GitHub offline): {chaosEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="relative h-80 rounded-2xl bg-bg-nested border border-border-subtle overflow-hidden">
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
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-text-primary bg-bg-card px-1.5 py-0.5 rounded border border-border-subtle">IdP Event Bus</span>
          </div>

          {CAEP_SUBSCRIBERS.map((subscriber, idx) => {
            const pos = SUBSCRIBER_POSITIONS[idx]
            const status = statuses[subscriber.id]
            return (
              <div
                key={subscriber.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className={`p-2.5 rounded-xl border shadow-sm ${
                  status === 'delivered' ? 'bg-status-success/15 border-status-success/40 text-status-success animate-pulse' :
                  status === 'dropped' ? 'bg-status-danger/15 border-status-danger/40 text-status-danger' :
                  status === 'ignored' ? 'bg-bg-card border-border-subtle text-text-muted' :
                  'bg-bg-card border-border-subtle text-text-secondary'
                }`}>
                  {status === 'dropped' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold text-text-primary bg-bg-card px-1.5 py-0.5 rounded border border-border-subtle whitespace-nowrap">{subscriber.name}</span>
                <span className="text-[9px] text-text-muted uppercase font-bold">{status}</span>
              </div>
            )
          })}
        </div>

        <div className="p-5 rounded-2xl bg-bg-nested border border-border-subtle space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Why CAEP / Shared Signals Matters</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            OAuth tokens are normally trusted until they expire — sometimes hours later. CAEP (a profile of the Shared Signals Framework) lets an IdP push a signed, real-time event the instant something changes, so relying parties can react in milliseconds instead of waiting for the next token refresh. But it's a genuinely distributed pub-sub system: each relying party independently decides what it's subscribed to, and any one of them can be slow, offline, or simply not listening for a given event type — which is exactly the enforcement inconsistency this simulator makes visible.
          </p>
        </div>
      </div>
    </PlaygroundShell>
  )
}
