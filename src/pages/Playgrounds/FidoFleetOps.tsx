import { useState } from 'react'
import { Users, DollarSign, Smile, ShieldCheck, TicketCheck, Play } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { FIDO_FORM_FACTORS } from '../../data/fidoFormFactors'

type SegmentId = 'office' | 'remote' | 'shared-device' | 'privileged' | 'contractor'

interface Segment {
  id: SegmentId
  label: string
  population: number
  /** Form factor ids well-suited to this segment (informational, not enforced). */
  wellSuited: string[]
}

const SEGMENTS: Segment[] = [
  { id: 'office', label: 'Office Workforce', population: 2200, wellSuited: ['platform-passkey-device-bound', 'usb-nfc-security-key'] },
  { id: 'remote', label: 'Remote Workforce', population: 1400, wellSuited: ['synced-passkey', 'phone-as-authenticator-hybrid'] },
  { id: 'shared-device', label: 'Shared-Device / Shift Workers', population: 600, wellSuited: ['wearable-badge-authenticator', 'usb-nfc-security-key'] },
  { id: 'privileged', label: 'Privileged / Admin Accounts', population: 200, wellSuited: ['usb-nfc-security-key', 'smart-card-piv'] },
  { id: 'contractor', label: 'Contractors', population: 600, wellSuited: ['phone-as-authenticator-hybrid'] },
]

const TOTAL_POPULATION = SEGMENTS.reduce((sum, s) => sum + s.population, 0)

interface RoundEvent {
  id: string
  title: string
  description: string
  /** How this event modifies outcomes if the assigned form factor is NOT well-suited for the affected segment. */
  penaltyIfMismatched: { coverage?: number; helpdesk?: number; satisfaction?: number; cost?: number }
  affectedSegment: SegmentId
}

const ROUND_EVENTS: RoundEvent[] = [
  { id: 'onboarding-wave', title: 'Bulk Onboarding Wave', description: 'A large batch of new hires joins the office workforce this round.', affectedSegment: 'office', penaltyIfMismatched: { coverage: -8, helpdesk: 15 } },
  { id: 'lost-device-spike', title: 'Lost-Device Spike', description: 'Remote workers report an unusually high rate of lost roaming authenticators.', affectedSegment: 'remote', penaltyIfMismatched: { helpdesk: 20, satisfaction: -10 } },
  { id: 'certification-loss', title: 'Authenticator Model Loses Certification', description: 'A previously-approved authenticator model for privileged accounts loses FIDO certification.', affectedSegment: 'privileged', penaltyIfMismatched: { coverage: -15 } },
  { id: 'shift-work-friction', title: 'Shared-Device Shift-Work Friction', description: 'Shared terminals see long queues as shift workers struggle to authenticate quickly.', affectedSegment: 'shared-device', penaltyIfMismatched: { satisfaction: -15, helpdesk: 10 } },
  { id: 'contractor-surge', title: 'Contractor Surge', description: 'A short-term project brings a wave of new contractors needing fast enrollment.', affectedSegment: 'contractor', penaltyIfMismatched: { coverage: -10, cost: 15 } },
]

interface RoundOutcome {
  round: number
  eventTitle: string
  segmentLabel: string
  formFactorName: string
  wasWellSuited: boolean
  coverageDelta: number
  helpdeskDelta: number
  satisfactionDelta: number
  costDelta: number
}

const TOTAL_ROUNDS = 5

export default function FidoFleetOps() {
  const [round, setRound] = useState(1)
  const [assignments, setAssignments] = useState<Record<SegmentId, string>>({
    office: FIDO_FORM_FACTORS[0].id,
    remote: FIDO_FORM_FACTORS[0].id,
    'shared-device': FIDO_FORM_FACTORS[0].id,
    privileged: FIDO_FORM_FACTORS[0].id,
    contractor: FIDO_FORM_FACTORS[0].id,
  })
  const [coverage, setCoverage] = useState(20)
  const [privilegedPhishingResistantCoverage, setPrivilegedPhishingResistantCoverage] = useState(20)
  const [helpdeskTickets, setHelpdeskTickets] = useState(50)
  const [satisfaction, setSatisfaction] = useState(70)
  const [cost, setCost] = useState(0)
  const [history, setHistory] = useState<RoundOutcome[]>([])
  const [gameOver, setGameOver] = useState(false)

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    adjustScore,
    completeStep,
    finishPlayground,
    resetPlayground,
  } = usePlayground({
    moduleId: 'fido_fleet_ops',
    initialScore: 100,
    maxHints: 3,
  })

  const currentEvent = ROUND_EVENTS[(round - 1) % ROUND_EVENTS.length]
  const affectedSegment = SEGMENTS.find((s) => s.id === currentEvent.affectedSegment)!

  const handleAssign = (segmentId: SegmentId, formFactorId: string) => {
    setAssignments((prev) => ({ ...prev, [segmentId]: formFactorId }))
  }

  const handleAdvanceRound = () => {
    const assignedFactorId = assignments[currentEvent.affectedSegment]
    const assignedFactor = FIDO_FORM_FACTORS.find((f) => f.id === assignedFactorId)!
    const wasWellSuited = affectedSegment.wellSuited.includes(assignedFactorId)

    const penalty = wasWellSuited ? {} : currentEvent.penaltyIfMismatched
    const coverageDelta = (wasWellSuited ? 18 : 18 + (penalty.coverage ?? 0))
    const helpdeskDelta = (wasWellSuited ? 3 : 3 + (penalty.helpdesk ?? 0))
    const satisfactionDelta = (wasWellSuited ? 2 : 2 + (penalty.satisfaction ?? 0))
    const costDelta = (assignedFactor.costBand === 'high' ? 15 : assignedFactor.costBand === 'medium' ? 8 : 3) + (penalty.cost ?? 0)

    const isPrivilegedRound = currentEvent.affectedSegment === 'privileged'
    const privilegedDelta = isPrivilegedRound ? (wasWellSuited ? 20 : 5) : 0

    setCoverage((prev) => Math.min(100, prev + coverageDelta))
    setPrivilegedPhishingResistantCoverage((prev) => Math.min(100, prev + privilegedDelta))
    setHelpdeskTickets((prev) => Math.max(0, prev - 3 + helpdeskDelta))
    setSatisfaction((prev) => Math.max(0, Math.min(100, prev + satisfactionDelta)))
    setCost((prev) => prev + costDelta)

    log(wasWellSuited ? 'success' : 'warning',
      `Round ${round}: "${currentEvent.title}" hit ${affectedSegment.label}. Assigned "${assignedFactor.name}" — ${wasWellSuited ? 'a well-suited choice.' : 'not ideal for this segment.'}`)

    setHistory((prev) => [...prev, {
      round,
      eventTitle: currentEvent.title,
      segmentLabel: affectedSegment.label,
      formFactorName: assignedFactor.name,
      wasWellSuited,
      coverageDelta,
      helpdeskDelta,
      satisfactionDelta,
      costDelta,
    }])

    if (wasWellSuited) {
      adjustScore(5, `Round ${round}: matched the right form factor to ${affectedSegment.label}.`)
    } else {
      adjustScore(-5, `Round ${round}: form factor mismatch cost extra helpdesk load and satisfaction.`)
    }

    if (round >= TOTAL_ROUNDS) {
      setGameOver(true)
      completeStep(0, 'All 5 rounds complete.')
      const wellSuitedCount = [...history, { wasWellSuited } as RoundOutcome].filter((h) => h.wasWellSuited).length
      if (wellSuitedCount >= 4) {
        finishPlayground('Excellent fleet segmentation — you matched the right form factor to nearly every population.')
      } else {
        log('info', 'Fleet run complete. No single form factor fits a whole organization — segmentation is the skill.')
      }
    } else {
      setRound((prev) => prev + 1)
    }
  }

  const privilegedCoverageColor = privilegedPhishingResistantCoverage >= 90 ? 'text-status-success' : privilegedPhishingResistantCoverage >= 60 ? 'text-status-warning' : 'text-status-danger'

  return (
    <PlaygroundShell
      title="FIDO Fleet Operations Simulator"
      description={`Run a 5-round FIDO authenticator fleet across a ${TOTAL_POPULATION.toLocaleString()}-user population spanning office, remote, shared-device, privileged, and contractor segments. Allocate form factors per segment, respond to events, and track coverage, helpdesk load, cost, and satisfaction.`}
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Match each segment to a form factor from its "well-suited" list — a USB security key that works great for privileged admins is a poor fit for shared shift-work terminals.')}
      onReset={() => {
        setRound(1)
        setAssignments({
          office: FIDO_FORM_FACTORS[0].id,
          remote: FIDO_FORM_FACTORS[0].id,
          'shared-device': FIDO_FORM_FACTORS[0].id,
          privileged: FIDO_FORM_FACTORS[0].id,
          contractor: FIDO_FORM_FACTORS[0].id,
        })
        setCoverage(20)
        setPrivilegedPhishingResistantCoverage(20)
        setHelpdeskTickets(50)
        setSatisfaction(70)
        setCost(0)
        setHistory([])
        setGameOver(false)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* OUTCOME DASHBOARD */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
            <Users className="w-4 h-4 text-accent-primary mx-auto mb-1" />
            <div className="text-sm font-black text-text-primary">{coverage}%</div>
            <div className="text-[9px] text-text-muted uppercase">Coverage</div>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
            <ShieldCheck className={`w-4 h-4 mx-auto mb-1 ${privilegedCoverageColor}`} />
            <div className={`text-sm font-black ${privilegedCoverageColor}`}>{privilegedPhishingResistantCoverage}%</div>
            <div className="text-[9px] text-text-muted uppercase">Privileged AAL3</div>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
            <TicketCheck className="w-4 h-4 text-accent-primary mx-auto mb-1" />
            <div className="text-sm font-black text-text-primary">{helpdeskTickets}</div>
            <div className="text-[9px] text-text-muted uppercase">Helpdesk/wk</div>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
            <DollarSign className="w-4 h-4 text-accent-primary mx-auto mb-1" />
            <div className="text-sm font-black text-text-primary">${cost}k</div>
            <div className="text-[9px] text-text-muted uppercase">Spend</div>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
            <Smile className="w-4 h-4 text-accent-primary mx-auto mb-1" />
            <div className="text-sm font-black text-text-primary">{satisfaction}%</div>
            <div className="text-[9px] text-text-muted uppercase">Satisfaction</div>
          </div>
        </div>

        {!gameOver ? (
          <>
            {/* CURRENT EVENT */}
            <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 space-y-1">
              <div className="text-[10px] font-black text-accent-primary uppercase tracking-wider">Round {round} of {TOTAL_ROUNDS} — Event</div>
              <h2 className="text-sm font-black text-text-primary">{currentEvent.title}</h2>
              <p className="text-xs text-text-secondary">{currentEvent.description}</p>
              <p className="text-[11px] text-text-muted">Affected segment: <strong>{affectedSegment.label}</strong> ({affectedSegment.population.toLocaleString()} users)</p>
            </div>

            {/* FORM FACTOR ASSIGNMENT FOR ALL SEGMENTS */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Assign Form Factors Per Segment</label>
              {SEGMENTS.map((segment) => (
                <div key={segment.id} className={`p-3 rounded-xl border space-y-2 ${segment.id === currentEvent.affectedSegment ? 'bg-accent-glow/40 border-accent-primary/40' : 'bg-bg-card border-border-subtle'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{segment.label}</span>
                    <span className="text-text-muted">{segment.population.toLocaleString()} users</span>
                  </div>
                  <select
                    aria-label={`Assign a form factor to ${segment.label}`}
                    value={assignments[segment.id]}
                    onChange={(e) => handleAssign(segment.id, e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary"
                  >
                    {FIDO_FORM_FACTORS.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={handleAdvanceRound}
              className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Advance to Next Round
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/30 text-xs text-text-secondary">
              <span className="font-black text-status-success block mb-1">Fleet run complete.</span>
              No single form factor fits a whole organization — segmentation is the skill. Final coverage: {coverage}%, privileged AAL3 coverage: {privilegedPhishingResistantCoverage}%.
            </div>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] flex items-center justify-between gap-2">
                  <span className="text-text-secondary">R{h.round}: {h.eventTitle} → {h.segmentLabel} got "{h.formFactorName}"</span>
                  <span className={h.wasWellSuited ? 'text-status-success font-bold' : 'text-status-warning font-bold'}>{h.wasWellSuited ? 'Good fit' : 'Mismatch'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
