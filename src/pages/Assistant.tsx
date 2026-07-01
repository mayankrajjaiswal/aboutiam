import { Send, Bot } from 'lucide-react'

export default function Assistant() {
  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100svh-120px)] flex flex-col justify-between">
      <div className="space-y-3 shrink-0">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Bot className="w-3.5 h-3.5" /> Client-Side AI Assistant
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
          IAM AI Architect
        </h2>
        <p className="text-text-secondary text-sm">
          A dedicated security chatbot indexed across key RFC blueprints to write AWS JSON policy structures, OPA Rego blocks, or suggest standard identity integrations.
        </p>
      </div>

      {/* Mock Chat View */}
      <div className="flex-grow my-6 p-6 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 overflow-y-auto max-h-[400px] text-sm pr-2">
          {/* Assistant Message */}
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center shrink-0 border border-accent-primary/10">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-1 leading-relaxed">
              <p className="text-text-primary font-medium text-xs">AboutIAM AI Architect</p>
              <p className="text-text-secondary text-xs">
                Welcome! I can write secure AWS JSON policies, help you understand OAuth 2.1 changes, configure multi-tenant CIAM architectures, or compile OPA policies. What are we designing today?
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex gap-3 pt-4 border-t border-border-subtle mt-4">
          <input type="text" className="flex-grow p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" placeholder="Ask AI Architect (e.g. 'Write an AWS S3 read-only policy')..." />
          <button className="p-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
