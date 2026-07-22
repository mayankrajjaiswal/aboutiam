// Single source of truth for the /reports page — hardcoded, hand-curated list of
// major third-party IAM analyst reports and industry research. Analyst reports
// (Magic Quadrant / Wave / Leadership Compass) themselves sit behind paywalls, so
// every entry's `verifiedVia` records the specific public page (publisher's own
// site, or an official vendor press release/landing page quoting the report) it
// was cross-checked against as of `verifiedDate` — re-verify there before citing
// further, since these reports are re-published annually/quarterly and rankings
// shift. `confidence: 'partial'` marks entries corroborated by only a single
// vendor's self-reported claim rather than two or more independent sources.
import type { LucideIcon } from 'lucide-react'
import { Compass, Waves, Building2, ShieldCheck } from 'lucide-react'
import type { VendorType } from './vendorCatalog'

export interface IamReport {
  slug: string
  title: string
  publisher: 'Gartner' | 'Forrester' | 'KuppingerCole' | 'Thales'
  reportType: 'Magic Quadrant' | 'Wave' | 'Leadership Compass' | 'Industry Research'
  year: string
  summary: string
  leaders?: string[]
  keyStats?: string[]
  link: string
  verifiedVia: string
  verifiedDate: string
  icon: LucideIcon
  confidence: 'confirmed' | 'partial'
}

export const IAM_REPORTS: IamReport[] = [
  {
    slug: 'gartner-mq-access-management-2025',
    title: 'Magic Quadrant for Access Management',
    publisher: 'Gartner',
    reportType: 'Magic Quadrant',
    year: '2025',
    summary: 'Gartner\'s annual evaluation of Access Management vendors on Ability to Execute and Completeness of Vision, covering authentication, authorization, SSO, and adaptive access across web apps and APIs. Published 11 Nov 2025 by analysts Brian Guthrie, Nathan Harris, Yemi Davies, and Steve Wessels. 12 vendors evaluated: Alibaba Cloud, CyberArk, Entrust, IBM, Microsoft, Okta, One Identity, OpenText, Ping Identity, RSA, Thales, and Transmit Security.',
    leaders: ['Microsoft', 'Okta', 'Ping Identity'],
    link: 'https://www.okta.com/resources/research/gartner-magic-quadrant-access-management/',
    verifiedVia: 'Cross-checked against Okta\'s and Microsoft\'s official Nov 2025 announcements, plus Gartner\'s own public report-listing page naming all 12 evaluated vendors.',
    verifiedDate: '2026-07-21',
    icon: Compass,
    confidence: 'confirmed',
  },
  {
    slug: 'gartner-mq-pam-2025',
    title: 'Magic Quadrant for Privileged Access Management',
    publisher: 'Gartner',
    reportType: 'Magic Quadrant',
    year: '2025',
    summary: 'Gartner\'s companion evaluation of Privileged Access Management (PAM) vendors, published 13 Oct 2025. CyberArk — now rebranded Idira after its acquisition by Palo Alto Networks — was named a Leader for the 7th consecutive time and cited for having the furthest completeness of vision.',
    leaders: ['Idira (formerly CyberArk)'],
    link: 'https://www.paloaltonetworks.com/idira/2025-magic-quadrant-report-for-pam',
    verifiedVia: 'Fetched directly from Palo Alto Networks\' official Idira (formerly CyberArk) analyst-report page.',
    verifiedDate: '2026-07-21',
    icon: Compass,
    confidence: 'confirmed',
  },
  {
    slug: 'forrester-wave-workforce-identity-2024',
    title: 'The Forrester Wave: Workforce Identity Platforms',
    publisher: 'Forrester',
    reportType: 'Wave',
    year: 'Q1 2024',
    summary: 'Forrester\'s evaluation of workforce identity platform providers against 24 criteria spanning authentication, lifecycle management, and orchestration.',
    leaders: ['CyberArk', 'Okta', 'Microsoft'],
    link: 'https://www.cyberark.com/resources/analyst-reports/the-forrester-wave-workforce-identity-platforms-q1-2024-en',
    verifiedVia: 'Cross-checked across CyberArk\'s, Okta\'s, Microsoft\'s, and Saviynt\'s (Strong Performer) independent official announcements.',
    verifiedDate: '2026-07-21',
    icon: Waves,
    confidence: 'confirmed',
  },
  {
    slug: 'forrester-wave-ciam-2024',
    title: 'The Forrester Wave: Customer Identity & Access Management (CIAM) Solutions',
    publisher: 'Forrester',
    reportType: 'Wave',
    year: 'Q4 2024',
    summary: 'A 15-vendor evaluation of Customer Identity and Access Management (CIAM) solutions across security, scalability, and consumer experience criteria, published December 2024.',
    leaders: ['Ping Identity', 'Strivacity', 'Transmit Security'],
    link: 'https://content.transmitsecurity.com/forrester-wave-dec-2024',
    verifiedVia: 'Cross-checked against Transmit Security\'s official report landing page and Ping Identity\'s and Strivacity\'s independent official announcements.',
    verifiedDate: '2026-07-21',
    icon: Waves,
    confidence: 'confirmed',
  },
  {
    slug: 'forrester-wave-pim-2025',
    title: 'The Forrester Wave: Privileged Identity Management Solutions',
    publisher: 'Forrester',
    reportType: 'Wave',
    year: '2025',
    summary: 'Forrester\'s evaluation of privileged identity management vendors, published 8 Aug 2025, framed around securing both human and machine/AI-agent identities across hybrid and multi-cloud infrastructure.',
    leaders: ['Idira (formerly CyberArk)'],
    link: 'https://www.cyberark.com/resources/analyst-reports/2025-forrester-wave-privileged-identity-management-solutions',
    verifiedVia: 'Only independently corroborated via CyberArk/Idira\'s own analyst-report page — no second vendor confirmation found yet.',
    verifiedDate: '2026-07-21',
    icon: Waves,
    confidence: 'partial',
  },
  {
    slug: 'kuppingercole-lc-access-management-2025',
    title: 'Leadership Compass: Access Management',
    publisher: 'KuppingerCole',
    reportType: 'Leadership Compass',
    year: '2025',
    summary: 'KuppingerCole\'s market overview of Access Management products and services, rating vendors across Product, Innovation, Market, and Overall Leadership categories.',
    leaders: ['OneLogin (Overall, Product & Market Leader)', 'Ping Identity', 'Thales (OneWelcome)'],
    link: 'https://www.onelogin.com/resource-center/analyst-reports/2025-kuppingercole-access-management-leadership-compass',
    verifiedVia: 'Cross-checked against OneLogin\'s and Thales\'s independent official resource pages, plus Ping Identity\'s announcement.',
    verifiedDate: '2026-07-21',
    icon: Building2,
    confidence: 'confirmed',
  },
  {
    slug: 'kuppingercole-lc-ciam-2024',
    title: 'Leadership Compass: Market Report and Guide for CIAM Solutions',
    publisher: 'KuppingerCole',
    reportType: 'Leadership Compass',
    year: '2024',
    summary: 'A market and technology overview of Customer Identity and Access Management (CIAM) platforms for B2C, B2B, and G2C use cases, evaluating registration, authentication, authorization, and privacy compliance.',
    leaders: ['Thales (OneWelcome)'],
    link: 'https://cpl.thalesgroup.com/resources/access-management/2024-leadership-compass-market-report-and-guide-ciam-solutions-analyst-report',
    verifiedVia: 'Only independently corroborated via Thales\'s own resource page — no second vendor confirmation found yet.',
    verifiedDate: '2026-07-21',
    icon: Building2,
    confidence: 'partial',
  },
  {
    slug: 'kuppingercole-lc-passwordless-2024',
    title: 'Leadership Compass: Passwordless Authentication for Consumers',
    publisher: 'KuppingerCole',
    reportType: 'Leadership Compass',
    year: '2024',
    summary: 'An evaluation of passwordless and passkey-based consumer authentication vendors on security, usability, and standards compliance.',
    leaders: ['Thales (OneWelcome)'],
    link: 'https://cpl.thalesgroup.com/resources/access-management/2024-leadership-compass-passwordless-authentication-leaders-analyst-report',
    verifiedVia: 'Only independently corroborated via Thales\'s own resource page — no second vendor confirmation found yet.',
    verifiedDate: '2026-07-21',
    icon: Building2,
    confidence: 'partial',
  },
  {
    slug: 'thales-data-threat-report-2026',
    title: 'Data Threat Report',
    publisher: 'Thales',
    reportType: 'Industry Research',
    year: '2026',
    summary: 'Thales\'s annual global security survey (via S&P Market Intelligence, 3,120 respondents) tracking how enterprises rank identity, credential theft, and AI-driven risk against their data security priorities.',
    keyStats: [
      '52% rank identity and access management as their most pressing security discipline',
      '67% report credential theft and misappropriated secrets are increasing',
      'Only 47% of sensitive cloud data is encrypted',
      '70% rank AI as their top data security risk',
    ],
    link: 'https://cpl.thalesgroup.com/data-threat-report',
    verifiedVia: 'Fetched directly from Thales\'s official report landing page.',
    verifiedDate: '2026-07-21',
    icon: ShieldCheck,
    confidence: 'confirmed',
  },
]

export function getReportsByPublisher(): Array<{ publisher: IamReport['publisher']; reports: IamReport[] }> {
  const order: IamReport['publisher'][] = ['Gartner', 'Forrester', 'KuppingerCole', 'Thales']
  return order
    .map((publisher) => ({ publisher, reports: IAM_REPORTS.filter((r) => r.publisher === publisher) }))
    .filter((group) => group.reports.length > 0)
}

// Some reports name the same vendor under a different display label (e.g. a
// pre- vs. post-acquisition brand, or a label suffixed with the specific
// leadership category it won) — canonicalize before grouping so the
// leaderboard doesn't double-count the same company as two rows.
const CANONICAL_LEADER_NAME: Record<string, string> = {
  'CyberArk': 'Idira (formerly CyberArk)',
  'OneLogin (Overall, Product & Market Leader)': 'OneLogin',
}

export function canonicalLeaderName(leader: string): string {
  return CANONICAL_LEADER_NAME[leader] ?? leader
}

// Maps a canonical leader display name to its deep-link key in VENDOR_CATALOG
// (src/data/vendorCatalog.ts), so the UI can link straight to that vendor's
// full profile. Vendors with no dedicated AboutIAM profile (e.g. Strivacity,
// Transmit Security, RSA) are intentionally omitted — they render as plain text.
export const LEADER_VENDOR_LINKS: Partial<Record<string, VendorType>> = {
  'Microsoft': 'entra_id',
  'Okta': 'okta',
  'Ping Identity': 'ping_identity',
  'Idira (formerly CyberArk)': 'cyberark',
  'Thales (OneWelcome)': 'thales',
  'OneLogin': 'onelogin',
}

export interface VendorLeaderboardEntry {
  vendor: string
  count: number
  reports: Array<Pick<IamReport, 'slug' | 'title' | 'publisher' | 'reportType' | 'year'>>
}

/** Vendors recognized as a Leader across two or more independent analyst reports, ranked by breadth of recognition. */
export function getVendorLeaderboard(): VendorLeaderboardEntry[] {
  const byVendor = new Map<string, VendorLeaderboardEntry>()

  for (const report of IAM_REPORTS) {
    for (const rawLeader of report.leaders ?? []) {
      const vendor = canonicalLeaderName(rawLeader)
      const entry = byVendor.get(vendor) ?? { vendor, count: 0, reports: [] }
      entry.count += 1
      entry.reports.push({ slug: report.slug, title: report.title, publisher: report.publisher, reportType: report.reportType, year: report.year })
      byVendor.set(vendor, entry)
    }
  }

  return Array.from(byVendor.values())
    .filter((entry) => entry.count >= 2)
    .sort((a, b) => b.count - a.count || a.vendor.localeCompare(b.vendor))
}
