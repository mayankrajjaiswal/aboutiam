import { Link } from 'react-router-dom'
import { HelpCircle, Lightbulb, ShieldCheck } from 'lucide-react'
import type { ToolMeta } from '../../data/toolsRegistry'

export default function BeginnerExpertExplainer({ tool }: { tool: ToolMeta }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-subtle space-y-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary">Understanding This Tool</h3>

      <div className="grid md:grid-cols-2 gap-6 min-w-0">
        <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4 min-w-0">
          <span className="text-[11px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> The Beginner Analogy
          </span>
          <p className="text-sm text-text-secondary leading-relaxed font-medium wrap-break-word">"{tool.analogy}"</p>
        </div>

        <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4 min-w-0">
          <span className="text-[11px] font-black text-accent-secondary uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Expert Technical Specification
          </span>
          <p className="text-[12px] text-text-primary leading-relaxed font-mono bg-bg-nested p-3.5 rounded border border-border-subtle/50 wrap-break-word min-w-0">
            {tool.expert}
          </p>
        </div>
      </div>

      {tool.faqs.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border-subtle/50">
          <span className="text-[11px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2 pt-4">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </span>
          <div className="space-y-3">
            {tool.faqs.map((faq) => (
              <div key={faq.q} className="p-4 rounded-lg bg-bg-sidebar/30 border border-border-subtle/50">
                <p className="text-sm font-bold text-text-primary">{faq.q}</p>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tool.relatedLinks && tool.relatedLinks.length > 0 && (
        <div className="pt-4 border-t border-border-subtle/50 flex flex-wrap gap-x-6 gap-y-2">
          {tool.relatedLinks.map((link) => (
            <Link key={link.href} to={link.href} className="text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
