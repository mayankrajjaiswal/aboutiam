import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  Check,
  Copy,
  FlaskConical,
  LayoutDashboard,
  Send,
  Terminal,
} from 'lucide-react'
import { useKnowledgeChat } from '../lib/ai/useKnowledgeChat'
import type { ResourceLink } from '../data/aiKnowledgeGraph'
import { Wrench, Gamepad2, BookOpen, Layers, Award, ShieldCheck } from 'lucide-react'

const QUICK_PROMPTS = ['Explain OAuth vs SAML', 'How do Passkeys work?', 'Write an OPA Rego policy']

const RESOURCE_ICONS: Record<string, ReactNode> = {
  tool: <Wrench className="w-4 h-4 text-blue-500" />,
  playground: <Gamepad2 className="w-4 h-4 text-purple-500" />,
  lab: <FlaskConical className="w-4 h-4 text-green-500" />,
  encyclopedia: <BookOpen className="w-4 h-4 text-orange-500" />,
  architecture: <Layers className="w-4 h-4 text-teal-500" />,
  certification: <Award className="w-4 h-4 text-yellow-500" />,
}

export function ResourceCard({ resource }: { resource: ResourceLink }) {
  return (
    <Link
      to={resource.path}
      className="flex items-start gap-3 p-3 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/50 transition-all group"
    >
      <div className="p-2 rounded-lg bg-bg-nested border border-border-subtle group-hover:bg-bg-sidebar">
        {RESOURCE_ICONS[resource.type] ?? <ShieldCheck className="w-4 h-4 text-gray-500" />}
      </div>
      <div>
        <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
          {resource.title}
          <span className="text-[9px] uppercase tracking-wider text-text-muted font-semibold bg-bg-nested px-1.5 py-0.5 rounded">
            {resource.type}
          </span>
        </h4>
        {resource.desc && <p className="text-[11px] text-text-secondary mt-1">{resource.desc}</p>}
      </div>
    </Link>
  )
}

export interface KnowledgeChatPanelProps {
  /** Renders the "Active Context Resources" desktop column next to the chat. Off by default for compact/floating hosts. */
  showSidebar?: boolean
  className?: string
}

/**
 * The Knowledge Chat interface shared by the full Assistant page and the
 * FloatingAssistantLauncher — both mount this so their behavior can never drift apart.
 */
export default function KnowledgeChatPanel({ showSidebar = false, className = '' }: KnowledgeChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    isTyping,
    isCopied,
    chatEndRef,
    localAiStatus,
    localAiProgress,
    localAiError,
    copyToClipboard,
    handleSendMessage,
    handleEnableLocalAi,
    handleDisableLocalAi,
  } = useKnowledgeChat()

  return (
    <div className={`h-full flex flex-col lg:flex-row gap-6 ${className}`}>
      <div className="@container flex-grow flex flex-col rounded-2xl bg-bg-card border border-border-subtle shadow-sm overflow-hidden relative min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="flex-grow overflow-y-auto p-5 space-y-6 scroll-smooth z-10">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'assistant'
            return (
              <div key={idx} className={`flex gap-4 items-start ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/15 shrink-0 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`space-y-4 max-w-[85%] text-sm leading-relaxed p-4 rounded-2xl border ${
                    isAI
                      ? m.source === 'local-ai'
                        ? 'bg-bg-sidebar/50 border-purple-400/60 ring-1 ring-purple-400/30 text-text-primary'
                        : 'bg-bg-sidebar/50 border-border-subtle text-text-primary'
                      : 'bg-accent-primary border-accent-primary text-white shadow-md'
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isAI ? (m.source === 'local-ai' ? 'text-purple-400' : 'text-accent-primary') : 'text-white/70'
                    }`}
                  >
                    {isAI ? (
                      m.source === 'local-ai' ? (
                        <>
                          <FlaskConical className="w-3 h-3" /> Local AI (Experimental)
                        </>
                      ) : (
                        'AboutIAM AI Architect'
                      )
                    ) : (
                      'Your Query'
                    )}
                  </span>
                  <p className="whitespace-pre-line">{m.text || (isAI && m.source === 'local-ai' ? '…' : '')}</p>

                  {m.code && (
                    <div className="space-y-2 mt-4 font-mono relative">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-text-secondary pb-1 border-b border-border-subtle/30">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" /> {m.codeLang}
                        </span>
                        <button
                          onClick={() => copyToClipboard(m.code || '', idx)}
                          className="inline-flex items-center gap-1 hover:text-text-primary"
                        >
                          {isCopied === idx ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                          {isCopied === idx ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl bg-bg-nested/80 border border-border-subtle text-xs text-text-primary overflow-x-auto">
                        {m.code}
                      </pre>
                    </div>
                  )}

                  {isAI && m.resources && m.resources.length > 0 && (
                    <div className={`${showSidebar ? 'lg:hidden' : ''} mt-4 space-y-2 border-t border-border-subtle pt-3`}>
                      <span className="text-[10px] uppercase font-bold text-text-muted">Recommended Resources</span>
                      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
                        {m.resources.map((res, i) => (
                          <ResourceCard key={i} resource={res} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex gap-4 items-start justify-start animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-text-muted" />
              </div>
              <div className="p-4 rounded-2xl bg-bg-sidebar/30 border border-border-subtle/50 text-xs text-text-muted font-bold uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-200"></span>
                Analyzing Platform Context
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-4 pt-3 border-t border-border-subtle bg-bg-sidebar/40 z-10 shrink-0">
          <details className="group" open={localAiStatus !== 'off'}>
            <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 select-none">
              <FlaskConical className="w-3.5 h-3.5" /> Experimental: Enable Local AI (Spike)
            </summary>
            <div className="mt-2 pb-3 text-xs text-text-secondary space-y-2">
              {localAiStatus === 'off' && (
                <>
                  <p>
                    Downloads a small open-weight language model (~200MB) and runs it fully client-side in a
                    Web Worker — nothing leaves your browser. Requires WebGPU. This is an early technical
                    spike, not the finished feature: quality and speed are unpolished.
                  </p>
                  <button
                    onClick={handleEnableLocalAi}
                    className="px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold transition-colors"
                  >
                    Download &amp; Enable
                  </button>
                </>
              )}
              {localAiStatus === 'loading' && (
                <p className="animate-pulse">
                  Loading model{localAiProgress ? `: ${localAiProgress.text} (${localAiProgress.percent}%)` : '…'}
                </p>
              )}
              {localAiStatus === 'error' && (
                <>
                  <p className="text-status-error">{localAiError}</p>
                  <button
                    onClick={handleDisableLocalAi}
                    className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-nested text-text-secondary text-[11px] font-bold transition-colors"
                  >
                    Reset
                  </button>
                </>
              )}
              {localAiStatus === 'ready' && (
                <>
                  <p className="text-status-success">
                    Local model loaded. New messages are now answered by the on-device model (see the purple
                    badge).
                  </p>
                  <button
                    onClick={handleDisableLocalAi}
                    className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-nested text-text-secondary text-[11px] font-bold transition-colors"
                  >
                    Disable
                  </button>
                </>
              )}
            </div>
          </details>
        </div>

        <div className="p-4 border-t border-border-subtle bg-bg-card z-10 shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              disabled={isTyping}
              className="flex-grow p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              placeholder="Ask about OAuth, JWT, Zero Trust, Passkeys..."
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={isTyping || !input.trim()}
              className="p-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary text-[11px] font-semibold whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSidebar && (
        <div className="hidden lg:flex w-80 flex-col gap-4 shrink-0">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm sticky top-0">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-text-primary border-b border-border-subtle pb-3">
              <LayoutDashboard className="w-4 h-4 text-accent-primary" />
              Active Context Resources
            </div>
            <div className="space-y-3">
              {messages.length > 0 && messages[messages.length - 1].resources ? (
                messages[messages.length - 1].resources!.map((res, i) => <ResourceCard key={i} resource={res} />)
              ) : (
                <div className="text-xs text-text-muted text-center py-8">
                  Ask a question to dynamically load related tools and playgrounds here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
