import { Link } from 'react-router-dom'
import { Compass, X, Check, RotateCcw, ArrowRight } from 'lucide-react'
import { START_HERE_GOALS } from '../data/startHereRoutes'
import { useStartHereStore } from '../store/startHereStore'

interface StartHereWizardProps {
  isOpen: boolean
  onClose: () => void
}

export default function StartHereWizard({ isOpen, onClose }: StartHereWizardProps) {
  const selectedGoalId = useStartHereStore((s) => s.selectedGoalId)
  const selectGoal = useStartHereStore((s) => s.selectGoal)
  const toggleStepComplete = useStartHereStore((s) => s.toggleStepComplete)
  const isStepComplete = useStartHereStore((s) => s.isStepComplete)
  const reset = useStartHereStore((s) => s.reset)

  if (!isOpen) return null

  const selectedGoal = START_HERE_GOALS.find((g) => g.id === selectedGoalId)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-bg-card shadow-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-sm font-black text-text-primary flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent-primary" /> Not Sure Where to Start?
            </span>
            <button onClick={onClose} aria-label="Close start here wizard" className="text-text-muted hover:text-text-primary cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!selectedGoal ? (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">What brings you here today?</p>
              <div className="grid gap-2">
                {START_HERE_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => selectGoal(goal.id)}
                    className="w-full text-left p-3 rounded-xl border border-border-subtle bg-bg-nested hover:border-accent-primary/40 hover:bg-accent-glow text-sm font-bold text-text-primary hover:text-accent-primary transition-all"
                  >
                    {goal.question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">Your path: <span className="font-bold text-text-primary">{selectedGoal.question}</span></p>
                <button onClick={reset} className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted hover:text-text-primary">
                  <RotateCcw className="w-3 h-3" /> Change goal
                </button>
              </div>
              <div className="space-y-2">
                {selectedGoal.steps.map((step, idx) => {
                  const done = isStepComplete(step.path)
                  return (
                    <div
                      key={step.path}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${done ? 'bg-status-success/5 border-status-success/20' : 'bg-bg-nested border-border-subtle'}`}
                    >
                      <button
                        onClick={() => toggleStepComplete(step.path)}
                        aria-label={done ? `Mark "${step.label}" incomplete` : `Mark "${step.label}" complete`}
                        aria-pressed={done}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${done ? 'bg-status-success border-status-success text-white' : 'border-border-subtle bg-bg-card'}`}
                      >
                        {done && <Check className="w-3 h-3" />}
                      </button>
                      <Link
                        to={step.path}
                        onClick={onClose}
                        className={`flex-1 text-xs font-semibold flex items-center justify-between gap-1.5 ${done ? 'text-text-muted line-through' : 'text-text-primary hover:text-accent-primary'}`}
                      >
                        <span>{idx + 1}. {step.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
