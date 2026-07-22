import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, Eye, Lock } from 'lucide-react'
import { useDisclaimerStore } from '../store/disclaimerStore'
import { useTourStore } from '../store/tourStore'

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Show, Don\'t Tell',
    body: 'Playgrounds let you trigger real redirects, sign real tokens, and inspect raw HTTP — not just read about them.',
  },
  {
    icon: ShieldCheck,
    title: 'Beginner to Expert',
    body: 'Every module pairs a plain-English analogy with an official expert specification.',
  },
  {
    icon: Lock,
    title: 'Zero Backend, Complete Privacy',
    body: 'Everything — including simulated attack techniques like SAML Signature Wrapping — runs 100% in your browser against local mock data. Nothing you enter ever leaves your device.',
  },
]

export default function DisclaimerModal() {
  const isOpen = useDisclaimerStore((s) => s.isOpen)
  const closeDisclaimer = useDisclaimerStore((s) => s.closeDisclaimer)
  const navigate = useNavigate()

  useEffect(() => {
    if (!useDisclaimerStore.getState().hasSeenDisclaimer) {
      setTimeout(() => useDisclaimerStore.getState().openDisclaimer(), 300)
    }
  }, [])

  const dismiss = () => {
    closeDisclaimer()
    if (!useTourStore.getState().hasSeenTour) {
      setTimeout(() => useTourStore.getState().openTour(), 400)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-bg-card shadow-2xl p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block">
                Welcome to AboutIAM
              </span>
              <h3 className="text-xl font-black text-text-primary">A browser-native Identity security academy</h3>
            </div>

            <div className="space-y-3">
              {PRINCIPLES.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.title} className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">{p.title}</span>
                      <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">{p.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed border-t border-border-subtle pt-4">
              The attack-technique Playgrounds (SAML Signature Wrapping, JWT cracking, and similar) are for authorized
              education and practice only. Full details in the{' '}
              <button
                type="button"
                onClick={() => {
                  navigate('/terms')
                  dismiss()
                }}
                className="text-accent-primary hover:text-accent-hover underline font-semibold cursor-pointer"
              >
                Terms &amp; Disclaimer
              </button>
              .
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Got it, let's go
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
