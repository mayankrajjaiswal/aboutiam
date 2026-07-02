import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { ToolMeta } from '../../data/toolsRegistry'

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = tool.icon
  const isLive = tool.status === 'live'
  const shortTitle = tool.title.split(' — ')[0].split(' (')[0]

  return (
    <div className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            isLive
              ? 'bg-status-success/10 border-status-success/20 text-status-success'
              : 'bg-text-muted/10 border-border-subtle text-text-secondary'
          }`}>
            {isLive ? 'Live' : 'Coming Soon'}
          </span>
        </div>
        <h4 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors">
          {shortTitle}
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
      </div>
      <div className="pt-6 border-t border-border-subtle/50 mt-6">
        {isLive ? (
          <Link
            to={`/tools/${tool.slug}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bg-sidebar hover:bg-accent-glow hover:text-accent-primary text-text-primary text-sm font-semibold transition-colors border border-border-subtle"
          >
            Open Tool <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bg-sidebar/50 text-text-muted text-sm font-semibold border border-border-subtle/50 cursor-not-allowed">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  )
}
