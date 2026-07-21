import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IDENTITY_NEWS_FEED, IDENTITY_CVE_DIRECTORY } from '../src/data/identityIntelligence.ts'
import { TOOLS } from '../src/data/toolsRegistry.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface FeedItem {
  title: string
  link: string
  guid: string
  pubDate: Date
  description: string
  category: string
}

/**
 * Programmatically constructs a standard-compliant RSS 2.0 feed from identity news, CVEs, and security tools.
 */
export function buildRssXml(
  newsFeed: typeof IDENTITY_NEWS_FEED,
  cveDir: typeof IDENTITY_CVE_DIRECTORY,
  tools: typeof TOOLS,
  buildDate: Date = new Date()
): { rssXml: string; totalCount: number } {
  const feedItems: FeedItem[] = []

  // 1. Ingest News items
  for (const news of newsFeed) {
    feedItems.push({
      title: news.title,
      link: news.url || 'https://www.aboutiam.com/vendor',
      guid: `aboutiam-news-${news.id}`,
      pubDate: new Date(news.date),
      description: `${news.summary} (Source: ${news.source})`,
      category: news.category || 'News'
    })
  }

  // 2. Ingest CVE items
  for (const cve of cveDir) {
    feedItems.push({
      title: `${cve.cveId}: ${cve.title}`,
      link: 'https://www.aboutiam.com/research',
      guid: `aboutiam-cve-${cve.id}`,
      pubDate: new Date(cve.publishDate),
      description: `Vulnerability score: ${cve.score}/10. ${cve.description}\n\nRemediation: ${cve.remediationSteps}`,
      category: 'Vulnerability Advisory'
    })
  }

  // 3. Ingest Tools (only live ones)
  for (const tool of tools) {
    if (tool.status === 'live') {
      feedItems.push({
        title: `New Security Tool: ${tool.title}`,
        link: `https://www.aboutiam.com/tools/${tool.slug}`,
        guid: `https://www.aboutiam.com/tools/${tool.slug}`,
        pubDate: new Date('2026-07-21'), // Baseline release date
        description: tool.description,
        category: 'Security Tool'
      })
    }
  }

  // Sort newest first
  feedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

  // Build RSS XML (using CDATA to escape HTML inside XML fields)
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AboutIAM - Identity &amp; Access Management Academy</title>
    <link>https://www.aboutiam.com</link>
    <description>Latest browser-native identity security simulators, vulnerability post-mortems, and standard CVE analysis.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <atom:link href="https://www.aboutiam.com/rss.xml" rel="self" type="application/rss+xml" />
    ${feedItems.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="${item.guid.startsWith('http') ? 'true' : 'false'}">${item.guid}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <category>${item.category}</category>
    </item>`).join('').trim()}
  </channel>
</rss>
`

  return { rssXml, totalCount: feedItems.length }
}

// Self-execute if run directly via node command line
if (process.argv[1] && process.argv[1].endsWith('generate-rss.ts')) {
  try {
    const { rssXml, totalCount } = buildRssXml(IDENTITY_NEWS_FEED, IDENTITY_CVE_DIRECTORY, TOOLS)

    // Write to public/rss.xml (acts as the repository source of truth & dev fallback)
    const publicPath = join(__dirname, '../public/rss.xml')
    writeFileSync(publicPath, rssXml, 'utf8')
    console.log(`✓ RSS Feed generated successfully at: public/rss.xml (${totalCount} items)`)

    // Write to dist/rss.xml (if dist directory exists during standard production builds)
    const distDir = join(__dirname, '../dist')
    if (existsSync(distDir)) {
      const distPath = join(distDir, 'rss.xml')
      writeFileSync(distPath, rssXml, 'utf8')
      console.log(`✓ RSS Feed copied to build output: dist/rss.xml`)
    }
  } catch (error) {
    console.error('💥 Failed to generate RSS feed:', error)
    process.exit(1)
  }
}
