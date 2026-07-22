import type { ReactNode } from 'react'
import type { ToolMeta } from '../../data/toolsRegistry'
import PrivacyNotice from './PrivacyNotice'
import BookmarkButton from '../BookmarkButton'

const SITE_URL = 'https://www.aboutiam.com'

// Derives a clean <h2> from the longer, SEO-optimized route title
// ("JWT Decoder — Inspect & Verify Tokens Online" -> "JWT Decoder").
function shortTitle(title: string): string {
  return title.split(' — ')[0].split(' (')[0]
}

function buildJsonLd(tool: ToolMeta) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: shortTitle(tool.title),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any (runs in browser)',
        description: tool.description,
        url: `${SITE_URL}/tools/${tool.slug}/`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      ...(tool.faqs.length > 0
        ? [{
            '@type': 'FAQPage',
            mainEntity: tool.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }]
        : []),
    ],
  }
}

interface ToolPageShellProps {
  tool: ToolMeta
  children: ReactNode
}

export default function ToolPageShell({ tool, children }: ToolPageShellProps) {
  const Icon = tool.icon

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(tool)).replace(/</g, '\\u003c') }} />

      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Icon className="w-3.5 h-3.5" /> {tool.category}
          </div>
          <BookmarkButton
            item={{ id: `tool-${tool.slug}`, title: shortTitle(tool.title), link: `/tools/${tool.slug}` }}
            className="p-1.5 rounded-lg border border-border-subtle bg-bg-card hover:border-accent-primary/30"
          />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          {shortTitle(tool.title)}
        </h2>
        <p className="text-text-secondary">{tool.description}</p>
      </div>

      <PrivacyNotice />

      {children}
    </div>
  )
}
