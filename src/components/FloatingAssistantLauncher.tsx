import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, ExternalLink, Sparkles, X } from 'lucide-react'
import KnowledgeChatPanel from './KnowledgeChatPanel'

export default function FloatingAssistantLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-accent-primary hover:bg-accent-hover text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
        title={isOpen ? 'Close Ask AI' : 'Ask AI'}
        aria-label={isOpen ? 'Close Ask AI assistant' : 'Open Ask AI assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Ask AI Knowledge Assistant"
          className="fixed bottom-24 right-5 z-40 w-[min(24rem,calc(100vw-2.5rem))] h-[min(32rem,calc(100vh-8rem))] rounded-2xl border border-border-subtle bg-bg-card shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-border-subtle bg-bg-sidebar/40">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary"
                title="Open the full AI Knowledge Assistant page"
              >
                Full page <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:bg-bg-nested hover:text-text-primary"
                aria-label="Dismiss Ask AI panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-grow min-h-0">
            <KnowledgeChatPanel className="h-full" />
          </div>
        </div>
      )}
    </>
  )
}
