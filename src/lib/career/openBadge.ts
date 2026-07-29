export interface OpenBadgeInput {
  recipientName: string
  badgeName: string
  badgeDescription: string
  criteriaText: string
  issuedOn: string
  badgeId: string
}

/** Minimal, spec-shaped Open Badges 2.0 Assertion (self-contained — no hosted verification endpoint). */
export function buildOpenBadgeAssertion(input: OpenBadgeInput) {
  const issuer = {
    id: 'https://www.aboutiam.com',
    type: 'Issuer',
    name: 'AboutIAM',
    url: 'https://www.aboutiam.com',
  }

  const badgeClass = {
    id: `https://www.aboutiam.com/badges/${input.badgeId}`,
    type: 'BadgeClass',
    name: input.badgeName,
    description: input.badgeDescription,
    criteria: { narrative: input.criteriaText },
    issuer,
  }

  return {
    '@context': 'https://w3id.org/openbadges/v2',
    id: `https://www.aboutiam.com/badges/assertions/${input.badgeId}-${encodeURIComponent(input.recipientName)}`,
    type: 'Assertion',
    recipient: { type: 'email', hashed: false, identity: input.recipientName },
    badge: badgeClass,
    issuedOn: input.issuedOn,
    verification: { type: 'HostedBadge' },
  }
}

/**
 * "Bakes" the Open Badges 2.0 assertion into an SVG per the IMS Global baking convention —
 * a self-contained <metadata> block a badge-verification tool can extract, with no hosted
 * backend required. Fully offline-generatable: no fetch, no server round-trip.
 */
export function buildBadgeSvg(input: OpenBadgeInput): string {
  const assertion = buildOpenBadgeAssertion(input)
  const assertionJson = JSON.stringify(assertion).replace(/</g, '\\u003c')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <metadata id="openbadges-assertion">${assertionJson}</metadata>
  <circle cx="150" cy="150" r="140" fill="#0d1222" stroke="#3b82f6" stroke-width="4" />
  <circle cx="150" cy="150" r="120" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4 4" />
  <text x="150" y="130" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="bold" font-family="sans-serif">${escapeXml(input.badgeName)}</text>
  <text x="150" y="160" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">AboutIAM Verified Badge</text>
  <text x="150" y="185" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif">${escapeXml(input.issuedOn)}</text>
</svg>`
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
