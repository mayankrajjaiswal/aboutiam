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
    version: '2026.09.19',
    date: '2026-09-19',
    items: [
      {
        title: 'Next-Gen IAM pillar',
        description:
          'A new pillar covering where identity is heading: AI agents as a new principal type, runtime AI security governance, phishing-resistant FIDO fleets, digital wallets & verifiable credentials, and crypto agility for the post-quantum transition. 6 hub pages, 10 interactive playgrounds, and 6 tools.',
        path: '/next-gen',
      },
      {
        title: 'Agentic Identity & AI Security Fabric playgrounds',
        description:
          'Build and audit AI agent identity records, trace multi-hop delegation chains, tune semantic guardrails against real hostile/drifting request corpora, and escalate a prompt-injection attack step by step.',
        path: '/playground/agent-registry',
      },
      {
        title: 'FIDO fleets, wallets & crypto agility playgrounds',
        description:
          'Simulate FIDO device fleet operations at scale, tune enterprise attestation policy, issue and present verifiable credentials, and plan a dependency-ordered post-quantum cryptography migration.',
        path: '/playground/fido-fleet-ops',
      },
      {
        title: 'IAM Academy Track 7: Next-Generation Identity',
        description:
          'A new 6-module Academy track covering agent job descriptions, delegation chains, runtime AI governance, wallets, and crypto agility -- bringing the Academy to 7 tracks and 42 modules total.',
        path: '/learn',
      },
    ],
  },
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
