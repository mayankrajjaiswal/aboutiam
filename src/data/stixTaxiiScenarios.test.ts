import { describe, it, expect } from 'vitest'
import {
  STIX_BUNDLE_SCENARIOS,
  TAXII_SUBSCRIBERS,
  matchesSubscriberFilter,
  buildStixBundle,
} from './stixTaxiiScenarios'

describe('STIX_BUNDLE_SCENARIOS', () => {
  it('has no duplicate scenario ids', () => {
    const ids = STIX_BUNDLE_SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every scenario has at least one tag', () => {
    for (const scenario of STIX_BUNDLE_SCENARIOS) {
      expect(scenario.tags.length).toBeGreaterThan(0)
    }
  })
})

describe('buildStixBundle', () => {
  it('every scenario bundle is valid against the minimal STIX object shape the simulator supports', () => {
    for (const scenario of STIX_BUNDLE_SCENARIOS) {
      const bundle = buildStixBundle(scenario)
      expect(bundle.type).toBe('bundle')
      expect(bundle.id).toMatch(/^bundle--/)
      expect(bundle.objects).toHaveLength(3)

      const [indicator, related, relationship] = bundle.objects
      expect(indicator.type).toBe('indicator')
      expect(indicator.spec_version).toBe('2.1')
      expect(indicator.id).toBe(scenario.indicator.id)
      expect(typeof indicator.pattern).toBe('string')

      expect(related.type).toBe(scenario.relatedObject.type)
      expect(related.spec_version).toBe('2.1')
      expect(related.id).toBe(scenario.relatedObject.id)

      expect(relationship.type).toBe('relationship')
      expect(relationship.source_ref).toBe(scenario.indicator.id)
      expect(relationship.target_ref).toBe(scenario.relatedObject.id)
      expect(relationship.relationship_type).toBe(scenario.relationshipType)
    }
  })

  it('every object id is unique within a bundle', () => {
    for (const scenario of STIX_BUNDLE_SCENARIOS) {
      const bundle = buildStixBundle(scenario)
      const ids = bundle.objects.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('matchesSubscriberFilter', () => {
  it('fan-out delivery correctly matches each subscriber\'s filter for the credential-leak scenario', () => {
    const scenario = STIX_BUNDLE_SCENARIOS.find((s) => s.id === 'leaked-credential-hash')!
    const alpha = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-alpha')!
    const beta = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-beta')!
    const gamma = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-gamma')!

    expect(matchesSubscriberFilter(scenario, alpha)).toBe(true)
    expect(matchesSubscriberFilter(scenario, beta)).toBe(false)
    expect(matchesSubscriberFilter(scenario, gamma)).toBe(true)
  })

  it('fan-out delivery correctly matches each subscriber\'s filter for the token-compromise scenario', () => {
    const scenario = STIX_BUNDLE_SCENARIOS.find((s) => s.id === 'compromised-token-identity')!
    const alpha = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-alpha')!
    const beta = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-beta')!
    const gamma = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-gamma')!

    expect(matchesSubscriberFilter(scenario, alpha)).toBe(false)
    expect(matchesSubscriberFilter(scenario, beta)).toBe(true)
    expect(matchesSubscriberFilter(scenario, gamma)).toBe(true)
  })

  it('the malware scenario reaches subscribers filtering on either credential-leak or malware', () => {
    const scenario = STIX_BUNDLE_SCENARIOS.find((s) => s.id === 'credential-stealer-malware')!
    const alpha = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-alpha')!
    const beta = TAXII_SUBSCRIBERS.find((s) => s.id === 'soc-beta')!

    expect(matchesSubscriberFilter(scenario, alpha)).toBe(true)
    expect(matchesSubscriberFilter(scenario, beta)).toBe(false)
  })

  it('a subscriber with no overlapping tags never receives the bundle', () => {
    const scenario = STIX_BUNDLE_SCENARIOS[0]
    const noMatch = { id: 'soc-empty', name: 'Empty', filterTags: [] }
    expect(matchesSubscriberFilter(scenario, noMatch)).toBe(false)
  })
})
