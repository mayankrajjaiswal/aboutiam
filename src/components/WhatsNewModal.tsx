import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, ArrowRight } from 'lucide-react'
import { useWhatsNewStore } from '../store/whatsNewStore'
import { useDisclaimerStore } from '../store/disclaimerStore'
import { WHATS_NEW_RELEASES, WHATS_NEW_VERSION } from '../data/whatsNewData'

export default function WhatsNewModal() {
  const isOpen = useWhatsNewStore((s) => s.isOpen)
  const closeWhatsNew = useWhatsNewStore((s) => s.closeWhatsNew)
  const navigate = useNavigate()

  useEffect(() => {
    const { hasSeenDisclaimer } = useDisclaimerStore.getState()
    const { lastSeenVersion } = useWhatsNewStore.getState()
    // Only surface this to returning visitors who already made it past the
    // first-visit disclaimer/tour sequence — first-time visitors get enough
    // modals already, and will simply see the latest release next time.
    if (hasSeenDisclaimer && lastSeenVersion !== WHATS_NEW_VERSION) {
      setTimeout(() => useWhatsNewStore.getState().openWhatsNew(), 300)
    }
  }, [])

  const dismiss = () => closeWhatsNew(WHATS_NEW_VERSION)

  const goTo = (path: string) => {
    navigate(path)
    dismiss()
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
            onClick={dismiss}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
            className="relative flex w-full max-w-lg max-h-[80vh] flex-col rounded-2xl border border-border-subtle bg-bg-card shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-4 sm:p-6 sm:pb-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block">
                    Recently on AboutIAM
                  </span>
                  <h3 id="whats-new-title" className="text-lg sm:text-xl font-black text-text-primary">
                    What&apos;s New
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close what's new"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-nested transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-4 space-y-5">
              {WHATS_NEW_RELEASES.map((release) => (
                <div key={release.version} className="space-y-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    {release.date}
                  </span>
                  <div className="space-y-3">
                    {release.items.map((item) => (
                      <div key={item.title} className="border-l-2 border-border-subtle pl-3">
                        <span className="text-xs sm:text-sm font-bold text-text-primary block">{item.title}</span>
                        <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                        {item.path && (
                          <button
                            type="button"
                            onClick={() => goTo(item.path!)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-primary hover:text-accent-hover cursor-pointer"
                          >
                            Take a look
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle p-4 sm:p-6 sm:pt-4">
              <button
                type="button"
                onClick={dismiss}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
