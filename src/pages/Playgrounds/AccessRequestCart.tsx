import { useMemo, useState } from 'react'
import { ShoppingCart, Plus, Trash2, ShieldAlert, CheckCircle2, Clock } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { ACCESS_REQUEST_CATALOG, getCatalogItem, type PrivilegeLevel } from '../../data/accessRequestCatalog'
import { evaluateAccessRequest } from '../../lib/games/accessRequestApproval'

const EXISTING_ACCESS = ['app-read']

const LEVEL_COLOR: Record<PrivilegeLevel, string> = {
  standard: 'bg-status-success/10 text-status-success border-status-success/20',
  elevated: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  privileged: 'bg-status-danger/10 text-status-danger border-status-danger/20',
}

export default function AccessRequestCart() {
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
  } = usePlayground({ moduleId: 'access_request_cart', initialScore: 100, maxHints: 3 })

  const [cartIds, setCartIds] = useState<string[]>([])
  const [submittedResult, setSubmittedResult] = useState<ReturnType<typeof evaluateAccessRequest> | null>(null)

  const cartItems = cartIds.map((id) => getCatalogItem(id)!)

  const addToCart = (id: string) => {
    if (cartIds.includes(id)) return
    setCartIds((prev) => [...prev, id])
    log('info', `Added "${getCatalogItem(id)!.name}" to cart.`)
    setSubmittedResult(null)
  }

  const removeFromCart = (id: string) => {
    setCartIds((prev) => prev.filter((c) => c !== id))
    setSubmittedResult(null)
  }

  const handleSubmit = () => {
    if (cartItems.length === 0) return
    const result = evaluateAccessRequest(cartItems, EXISTING_ACCESS)
    setSubmittedResult(result)

    for (const step of result.steps) {
      log(step.status === 'approved' ? 'success' : 'warning', `[${step.approver}] ${step.reason} — ${step.status.toUpperCase()}`)
    }

    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: submitted your first access request for routing.')
    }

    if (result.autoApproved) {
      adjustScore(15, 'Clean request auto-approved with no privilege escalation or SoD conflict.')
    } else if (result.hasConflict) {
      adjustScore(-10, 'Request blocked pending compliance override — an SoD conflict was detected.')
    } else {
      adjustScore(5, 'Request requires app-owner sign-off for a privileged entitlement.')
    }

    if (currentStep === 1) {
      completeStep(1, 'Checkpoint 2 verified: observed how the approval chain adapts to privilege level and conflicts.')
    }
  }

  const canFinish = useMemo(() => {
    return submittedResult !== null && currentStep <= 2
  }, [submittedResult, currentStep])

  const handleFinish = () => {
    if (!submittedResult) return
    finishPlayground(
      submittedResult.hasConflict
        ? '🎉 You triggered and observed a real Separation-of-Duties conflict escalation — exactly the workflow IGA platforms automate in production.'
        : '🎉 You routed a request through the deterministic approval chain and saw it resolve correctly.'
    )
  }

  const handleRevealHint = () => {
    const hints = [
      'Every request starts with manager approval — that never changes. Add a "privileged" item (red badge) to see an app-owner approval step get added.',
      'Try adding both "Invoice Approver" and "Payment Issuer" to the same cart — they are a classic Separation-of-Duties conflict pair and will trigger a compliance-officer override requirement.',
      'A request with only "standard" items and no conflicts auto-approves immediately — no human review needed.',
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="Access Request Cart Simulator"
      description="Shop a mock entitlement catalog, submit your cart, and watch a deterministic approval chain route it — manager approval, then app-owner sign-off for privileged items, then a compliance-officer override if a Separation-of-Duties conflict is detected."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setCartIds([])
        setSubmittedResult(null)
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Entitlement Catalog</h4>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {ACCESS_REQUEST_CATALOG.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">{item.name}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${LEVEL_COLOR[item.privilegeLevel]}`}>{item.privilegeLevel}</span>
                </div>
                <p className="text-[10px] text-text-muted">{item.system}</p>
                <p className="text-[10px] text-text-secondary leading-relaxed">{item.description}</p>
                <button
                  onClick={() => addToCart(item.id)}
                  disabled={cartIds.includes(item.id)}
                  data-testid={`add-to-cart-${item.id}`}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-[10px] font-bold text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" /> {cartIds.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-nested border border-border-subtle space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-accent-primary" /> Your Cart ({cartItems.length})
          </h4>
          {cartItems.length === 0 ? (
            <p className="text-xs text-text-muted">Add entitlements above to build a request.</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-bg-card border border-border-subtle/50 text-xs">
                  <span className="text-text-primary font-semibold">{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="text-text-muted hover:text-status-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={cartItems.length === 0}
            className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Submit Access Request
          </button>
        </div>

        {submittedResult && (
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Approval Chain Result</h4>
            {submittedResult.steps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border ${step.status === 'approved' ? 'bg-status-success/5 border-status-success/20' : 'bg-status-warning/5 border-status-warning/20'}`}>
                {step.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" /> : <Clock className="w-4 h-4 text-status-warning shrink-0" />}
                <div>
                  <span className="font-bold text-text-primary capitalize">{step.approver.replace('-', ' ')}</span>
                  <p className="text-text-secondary">{step.reason}</p>
                </div>
              </div>
            ))}
            {submittedResult.hasConflict && (
              <div className="p-2.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-[11px] text-status-danger flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>SoD conflict: requesting "{submittedResult.conflicts[0]?.requestedId}" conflicts with held/requested "{submittedResult.conflicts[0]?.conflictsWithId}".</span>
              </div>
            )}
            {canFinish && !isCompleted && (
              <button
                onClick={handleFinish}
                className="w-full py-2 rounded-xl border border-accent-primary/30 text-accent-primary hover:bg-accent-glow/50 text-xs font-bold transition-all"
              >
                Complete Session
              </button>
            )}
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
