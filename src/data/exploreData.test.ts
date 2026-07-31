import { describe, it, expect } from 'vitest'
import { EXPLORE_PRODUCTS } from './exploreData'

describe('EXPLORE_PRODUCTS contributionGuide', () => {
  it('every entry with a contributionGuide has a non-empty primer/whereToStart and a valid-looking URL', () => {
    const withGuide = EXPLORE_PRODUCTS.filter((p) => p.contributionGuide)
    expect(withGuide.length).toBeGreaterThan(0)
    for (const product of withGuide) {
      const guide = product.contributionGuide!
      expect(guide.primer.length).toBeGreaterThan(0)
      expect(guide.whereToStart.length).toBeGreaterThan(0)
      expect(guide.goodFirstIssueUrl).toMatch(/^https:\/\/github\.com\//)
    }
  })

  it('Keycloak, Ory, and Zitadel each have a contribution guide', () => {
    for (const id of ['keycloak', 'ory', 'zitadel']) {
      const product = EXPLORE_PRODUCTS.find((p) => p.id === id)
      expect(product?.contributionGuide).toBeTruthy()
    }
  })
})
