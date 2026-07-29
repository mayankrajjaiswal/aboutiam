import { describe, it, expect } from 'vitest'
import { buildOpenBadgeAssertion, buildBadgeSvg, type OpenBadgeInput } from './openBadge'

const SAMPLE_INPUT: OpenBadgeInput = {
  recipientName: 'alex@example.com',
  badgeName: 'Zero Trust Track Graduate',
  badgeDescription: 'Completed the Zero Trust learning track on AboutIAM.',
  criteriaText: 'Complete all 6 modules in the Zero Trust track.',
  issuedOn: '2026-07-29',
  badgeId: 'zero-trust-track',
}

describe('buildOpenBadgeAssertion', () => {
  it('includes the required OB2.0 @context', () => {
    const assertion = buildOpenBadgeAssertion(SAMPLE_INPUT)
    expect(assertion['@context']).toBe('https://w3id.org/openbadges/v2')
  })

  it('has type Assertion', () => {
    expect(buildOpenBadgeAssertion(SAMPLE_INPUT).type).toBe('Assertion')
  })

  it('embeds a nested BadgeClass with name, description, criteria, and issuer', () => {
    const assertion = buildOpenBadgeAssertion(SAMPLE_INPUT)
    expect(assertion.badge.type).toBe('BadgeClass')
    expect(assertion.badge.name).toBe(SAMPLE_INPUT.badgeName)
    expect(assertion.badge.description).toBe(SAMPLE_INPUT.badgeDescription)
    expect(assertion.badge.criteria.narrative).toBe(SAMPLE_INPUT.criteriaText)
    expect(assertion.badge.issuer.type).toBe('Issuer')
  })

  it('includes issuedOn and a verification block', () => {
    const assertion = buildOpenBadgeAssertion(SAMPLE_INPUT)
    expect(assertion.issuedOn).toBe(SAMPLE_INPUT.issuedOn)
    expect(assertion.verification).toBeDefined()
  })

  it('identifies the recipient', () => {
    const assertion = buildOpenBadgeAssertion(SAMPLE_INPUT)
    expect(assertion.recipient.identity).toBe(SAMPLE_INPUT.recipientName)
  })
})

describe('buildBadgeSvg', () => {
  it('produces valid SVG markup', () => {
    const svg = buildBadgeSvg(SAMPLE_INPUT)
    expect(svg.trim().startsWith('<svg')).toBe(true)
    expect(svg.trim().endsWith('</svg>')).toBe(true)
  })

  it('embeds a metadata block containing valid, parseable JSON matching the assertion', () => {
    const svg = buildBadgeSvg(SAMPLE_INPUT)
    const match = svg.match(/<metadata id="openbadges-assertion">([\s\S]*?)<\/metadata>/)
    expect(match).not.toBeNull()
    const parsed = JSON.parse(match![1])
    expect(parsed['@context']).toBe('https://w3id.org/openbadges/v2')
    expect(parsed.badge.name).toBe(SAMPLE_INPUT.badgeName)
  })

  it('escapes XML special characters in the visible badge name', () => {
    const svg = buildBadgeSvg({ ...SAMPLE_INPUT, badgeName: 'A & B <Track>' })
    expect(svg).toContain('A &amp; B &lt;Track&gt;')
  })

  it('never includes a literal unescaped < in the JSON metadata payload', () => {
    const svg = buildBadgeSvg({ ...SAMPLE_INPUT, badgeDescription: 'Contains <script>alert(1)</script>' })
    const match = svg.match(/<metadata id="openbadges-assertion">([\s\S]*?)<\/metadata>/)!
    expect(match[1]).not.toContain('<script>')
  })
})
