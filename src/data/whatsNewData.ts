export interface WhatsNewItem {
  title: string
  description: string
  path?: string
}

export interface WhatsNewRelease {
  /** Monotonically increasing identifier — bump this whenever a new release entry is added. */
  version: string
  date: string
  items: WhatsNewItem[]
}

/**
 * Hand-maintained changelog surfaced to returning visitors via the "What's New" modal.
 * Newest release first. `WHATS_NEW_VERSION` (the first entry's `version`) is the value
 * persisted in `whatsNewStore` — bump it whenever a release entry is prepended here so
 * returning visitors see the update exactly once.
 */
export const WHATS_NEW_RELEASES: WhatsNewRelease[] = [
  {
    version: '2026.07.28',
    date: '2026-07-28',
    items: [
      {
        title: 'Component & integration test layer',
        description:
          'Added React Testing Library component tests and cross-file integration checks across the site, and resolved every React hooks lint warning.',
      },
      {
        title: 'SEO, AEO & performance hardening',
        description:
          'Automated sitemap and llms.txt generation, JSON-LD structured data on every hub page, and route-level code-splitting for faster loads.',
      },
      {
        title: 'Architecture Center expansion',
        description: 'Grew from 14 to 24 reference architectures spanning beginner, intermediate, and advanced tiers.',
        path: '/architecture',
      },
    ],
  },
  {
    version: '2026.07.05',
    date: '2026-07-05',
    items: [
      {
        title: 'Developer Playbooks expanded',
        description: 'Cheat Sheets grew from 9 to 24 beginner-to-advanced interactive checklists with live compliance gauges.',
        path: '/cheat-sheets',
      },
      {
        title: 'AI Knowledge Assistant 2.0',
        description: 'Expanded /assistant into a four-tab hub: Knowledge Chat, Comparison Engine, Learning Planner, and Interview Prep.',
        path: '/assistant',
      },
      {
        title: 'Security & transparency hardening',
        description: 'Shipped CSP, Referrer-Policy, SHA-pinned GitHub Actions, Dependabot, and a CI npm audit gate.',
        path: '/contributors',
      },
    ],
  },
]

export const WHATS_NEW_VERSION = WHATS_NEW_RELEASES[0]?.version ?? 'none'
