import { describe, it, expect } from 'vitest'
import { buildRssXml } from './generate-rss'

describe('RSS Feed Generator', () => {
  const dummyNews = [
    {
      id: 'news-1',
      title: 'Active Directory Exploits on the Rise',
      source: 'Microsoft Security',
      url: 'https://example.com/ad-rise',
      date: '2026-07-10',
      summary: 'A new surge of social engineering attacks targets domain controllers.',
      category: 'Advisory' as const,
      tags: ['Active Directory', 'AD']
    },
    {
      id: 'news-2',
      title: 'FIDO2 Passwordless Adoption Milestones',
      source: 'Yubico News',
      url: 'https://example.com/fido2-news',
      date: '2026-07-15',
      summary: 'Over 80% of surveyed enterprises have deployed passkeys.',
      category: 'News' as const,
      tags: ['Passkeys', 'FIDO2']
    }
  ]

  const dummyCVEs = [
    {
      id: 'cve-1',
      cveId: 'CVE-2026-99999',
      title: 'XML Injection in SAML Parser',
      score: 9.8,
      vendor: 'OpenSAML',
      publishDate: '2026-06-01',
      description: 'An issue allows attackers to execute arbitrary XML entities.',
      remediationPatch: 'N/A',
      securePatch: 'N/A',
      remediationSteps: 'Upgrade to version 3.2.1.'
    }
  ]

  const dummyTools = [
    {
      slug: 'mock-tool-1',
      title: 'JWT Decoder',
      description: 'A mock live tool.',
      category: 'Tokens & Assertions' as const,
      icon: null as unknown as import('lucide-react').LucideIcon,
      phase: 1 as const,
      status: 'live' as const,
      keywords: [],
      analogy: '',
      expert: '',
      faqs: []
    },
    {
      slug: 'mock-tool-2',
      title: 'Future Tool',
      description: 'A mock planned tool that should not be in the feed.',
      category: 'PKI & Certificates' as const,
      icon: null as unknown as import('lucide-react').LucideIcon,
      phase: 2 as const,
      status: 'planned' as const,
      keywords: [],
      analogy: '',
      expert: '',
      faqs: []
    }
  ]

  it('should build a structurally valid RSS 2.0 feed', () => {
    const buildDate = new Date('2026-07-21T12:00:00Z')
    const { rssXml, totalCount } = buildRssXml(dummyNews, dummyCVEs, dummyTools, buildDate)

    expect(totalCount).toBe(4) // 2 news + 1 cve + 1 live tool (planned tool excluded)
    expect(rssXml).toContain('<?xml version="1.0" encoding="UTF-8" ?>')
    expect(rssXml).toContain('<rss version="2.0"')
    expect(rssXml).toContain('<title>AboutIAM - Identity &amp; Access Management Academy</title>')
    expect(rssXml).toContain('<lastBuildDate>Tue, 21 Jul 2026 12:00:00 GMT</lastBuildDate>')
  })

  it('should correctly format feed item nodes with CDATA blocks', () => {
    const { rssXml } = buildRssXml(dummyNews, dummyCVEs, dummyTools)

    expect(rssXml).toContain('<title><![CDATA[FIDO2 Passwordless Adoption Milestones]]></title>')
    expect(rssXml).toContain('<title><![CDATA[CVE-2026-99999: XML Injection in SAML Parser]]></title>')
    expect(rssXml).toContain('<title><![CDATA[New Security Tool: JWT Decoder]]></title>')
  })

  it('should exclude tools marked as planned from the feed', () => {
    const { rssXml } = buildRssXml(dummyNews, dummyCVEs, dummyTools)

    expect(rssXml).not.toContain('Future Tool')
    expect(rssXml).not.toContain('mock-tool-2')
  })

  it('should sort feed items chronologically with the newest item first', () => {
    const { rssXml } = buildRssXml(dummyNews, dummyCVEs, dummyTools)

    // Find the relative ordering of our dates:
    // Tool is set to 2026-07-21
    // news-2 is 2026-07-15
    // news-1 is 2026-07-10
    // cve-1 is 2026-06-01
    // The feed items must appear in that chronological sequence.

    const idxTool = rssXml.indexOf('New Security Tool: JWT Decoder')
    const idxNews2 = rssXml.indexOf('FIDO2 Passwordless Adoption Milestones')
    const idxNews1 = rssXml.indexOf('Active Directory Exploits on the Rise')
    const idxCVE = rssXml.indexOf('CVE-2026-99999')

    expect(idxTool).toBeLessThan(idxNews2)
    expect(idxNews2).toBeLessThan(idxNews1)
    expect(idxNews1).toBeLessThan(idxCVE)
  })
})
