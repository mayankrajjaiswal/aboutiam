import { useEffect, useRef, useState } from 'react'
import { MessageSquare, AlertTriangle } from 'lucide-react'
import { getGiscusConfig } from '../lib/giscusConfig'
import { useThemeStore } from '../store/themeStore'

interface GiscusCommentsProps {
  /** Stable per-page identifier for giscus's "specific term" discussion mapping — e.g. `term-<id>`, `standard-<id>`, `breach-<id>`. */
  term: string
}

/**
 * Threaded comments backed entirely by GitHub Discussions via the third-party
 * giscus embed — no AboutIAM-run server involved. Same "opt-in, inert until
 * configured" pattern as GoogleDriveSync.tsx: renders a disabled notice
 * instead of the embed for any deployment that hasn't set up a giscus GitHub
 * App installation (see .env.example).
 */
export default function GiscusComments({ term }: GiscusCommentsProps) {
  const config = getGiscusConfig()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!config || !containerRef.current) return
    const container = containerRef.current
    container.innerHTML = ''
    setLoadFailed(false)

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', config.repo)
    script.setAttribute('data-repo-id', config.repoId)
    script.setAttribute('data-category', config.category)
    script.setAttribute('data-category-id', config.categoryId)
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', theme === 'system' ? 'preferred_color_scheme' : theme)
    script.setAttribute('data-lang', 'en')
    script.onerror = () => setLoadFailed(true)
    container.appendChild(script)
  }, [config, term, theme])

  if (!config) {
    return (
      <div className="p-4 rounded-xl border border-border-subtle bg-bg-nested text-xs text-text-muted flex items-center gap-2">
        <MessageSquare className="w-4 h-4 shrink-0" />
        Comments aren't configured for this deployment yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
        <MessageSquare className="w-3.5 h-3.5" /> Discussion (via GitHub Discussions)
      </div>
      <div ref={containerRef} data-testid="giscus-container" />
      {loadFailed && (
        <div className="p-3 rounded-lg border border-status-warning/30 bg-status-warning/10 text-xs text-text-secondary flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-status-warning" />
          Comments failed to load — this can happen if your network or browser blocks third-party embeds.
        </div>
      )}
    </div>
  )
}
