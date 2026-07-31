import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import { CHORDED_SHORTCUTS } from '../data/chordedShortcuts'

interface ShortcutsOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const GENERAL_SHORTCUTS = [
  { keys: ['Ctrl', 'K'], label: 'Open the Command Palette (search everything)' },
  { keys: ['?'], label: 'Open this shortcuts overlay' },
]

const SLASH_COMMANDS = [
  { keys: ['/theme'], label: 'Toggle light/dark theme (inside the Command Palette)' },
  { keys: ['/reset'], label: 'Clear all local progress (inside the Command Palette)' },
  { keys: ['/ctf'], label: 'Jump to the Identity CTF arena (inside the Command Palette)' },
  { keys: ['/labs'], label: 'Filter to interactive simulators (inside the Command Palette)' },
  { keys: ['/tools'], label: 'Filter to security tools (inside the Command Palette)' },
]

function KeyChip({ label }: { label: string }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-bg-nested border border-border-subtle font-mono text-[10px] font-bold text-text-primary">
      {label}
    </kbd>
  )
}

export default function ShortcutsOverlay({ isOpen, onClose }: ShortcutsOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-sm font-black text-text-primary flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-accent-primary" /> Keyboard Shortcuts
                </span>
                <button onClick={onClose} aria-label="Close shortcuts overlay" className="text-text-muted hover:text-text-primary cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">General</span>
                {GENERAL_SHORTCUTS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                    <span>{s.label}</span>
                    <div className="flex gap-1 shrink-0">
                      {s.keys.map((k) => <KeyChip key={k} label={k} />)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Jump To (press g, then a letter)</span>
                {CHORDED_SHORTCUTS.map((s) => (
                  <div key={s.chord} className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                    <span>{s.label}</span>
                    <div className="flex gap-1 shrink-0">
                      <KeyChip label={s.chord.split(' ')[0]} />
                      <KeyChip label={s.chord.split(' ')[1]} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Console Slash Commands</span>
                {SLASH_COMMANDS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 text-xs text-text-secondary">
                    <span>{s.label}</span>
                    <div className="flex gap-1 shrink-0">
                      {s.keys.map((k) => <KeyChip key={k} label={k} />)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
