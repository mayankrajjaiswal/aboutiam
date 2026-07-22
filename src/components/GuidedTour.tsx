import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Cpu, Wrench, CheckSquare, Search, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTourStore } from '../store/tourStore'
import { useDisclaimerStore } from '../store/disclaimerStore'

interface TourStep {
  title: string
  description: string
  icon: typeof GraduationCap
  link?: string
  linkLabel?: string
}

const STEPS: TourStep[] = [
  {
    title: 'IAM Academy',
    description: '6 guided course tracks, 36 modules, each pairing a beginner analogy with an expert-grade spec. Your progress is saved right in your browser.',
    icon: GraduationCap,
    link: '/learn',
    linkLabel: 'Open the Academy',
  },
  {
    title: 'Interactive Playgrounds',
    description: 'Run real cryptographic handshakes, decode tokens, and simulate exploits like SAML Signature Wrapping — entirely client-side.',
    icon: Cpu,
    link: '/playground',
    linkLabel: 'Browse Playgrounds',
  },
  {
    title: 'Security Tools',
    description: 'Free, 100% client-side utilities for everyday IAM work: JWT decoding, SCIM validation, OIDC discovery auditing, and more.',
    icon: Wrench,
    link: '/tools',
    linkLabel: 'Browse Tools',
  },
  {
    title: 'GRC Maturity Wizard',
    description: 'Self-assess your organization\'s IAM posture and get a shareable, downloadable roadmap.',
    icon: CheckSquare,
    link: '/assess',
    linkLabel: 'Start the Assessment',
  },
  {
    title: 'Global Search (⌘K)',
    description: 'Jump anywhere instantly — tools, glossary terms, playgrounds, vendors — from anywhere on the site with the command palette.',
    icon: Search,
  },
]

export default function GuidedTour() {
  const isOpen = useTourStore((s) => s.isOpen)
  const closeTour = useTourStore((s) => s.closeTour)
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const { hasSeenTour, openTour } = useTourStore.getState()
    const { hasSeenDisclaimer } = useDisclaimerStore.getState()
    // The disclaimer (if unseen) triggers the tour itself once dismissed —
    // skip auto-opening here to avoid stacking two first-visit modals at once.
    if (!hasSeenTour && hasSeenDisclaimer) {
      setTimeout(() => openTour(), 600)
    }
  }, [])

  const finish = () => {
    closeTour()
    setStep(0)
  }

  const current = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const Icon = current.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={finish}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card shadow-2xl p-6 space-y-5"
          >
            <button
              type="button"
              onClick={finish}
              aria-label="Skip tour"
              className="absolute top-4 right-4 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-nested transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">
                  Step {step + 1} of {STEPS.length}
                </span>
                <h3 className="text-lg font-black text-text-primary">{current.title}</h3>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">{current.description}</p>

            {current.link && (
              <button
                type="button"
                onClick={() => {
                  navigate(current.link!)
                  finish()
                }}
                className="text-xs font-bold text-accent-primary hover:text-accent-hover transition-colors cursor-pointer"
              >
                {current.linkLabel} →
              </button>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-accent-primary' : 'bg-border-subtle'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-nested text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (isLastStep ? finish() : setStep((s) => s + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isLastStep ? 'Get Started' : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
