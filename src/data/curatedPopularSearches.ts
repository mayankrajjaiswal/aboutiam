export interface CuratedPopularSearch {
  id: string
  label: string
  link: string
}

/**
 * A hand-maintained "commonly searched" shortlist shown in the Command Palette's
 * empty-query state, below Recent Queries. True cross-user trending search isn't
 * possible on a zero-backend static site, so this is the honest substitute —
 * explicitly labeled "Popular," not "Trending," and refreshed periodically
 * (e.g. quarterly, alongside the Wallet/mDL tracker's own refresh cadence).
 * Last reviewed: 2026-07-31.
 */
export const CURATED_POPULAR_SEARCHES: CuratedPopularSearch[] = [
  { id: 'popular-jwt-decoder', label: 'JWT Decoder', link: '/tools/jwt-decoder' },
  { id: 'popular-oauth-flow', label: 'OAuth 2.0 / OIDC Flow Visualizer', link: '/playground/oauth' },
  { id: 'popular-saml-decoder', label: 'SAML Decoder', link: '/tools/saml-decoder' },
  { id: 'popular-encyclopedia', label: 'A-Z IAM Encyclopedia', link: '/encyclopedia' },
  { id: 'popular-zero-trust', label: 'Zero Trust Architecture', link: '/architecture?arch=zero_trust' },
  { id: 'popular-assess', label: 'GRC Maturity Wizard', link: '/assess' },
]
