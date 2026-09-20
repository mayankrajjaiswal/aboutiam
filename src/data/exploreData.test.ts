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

describe('Next-Gen IAM landscape entries', () => {
  it('includes an Agentic Identity Platform entry', () => {
    const product = EXPLORE_PRODUCTS.find((p) => p.id === 'entra-agent-id')
    expect(product).toBeTruthy()
    expect(product?.type).toBe('Agentic Identity Platform')
  })

  it('includes a Wallet Infrastructure entry', () => {
    const product = EXPLORE_PRODUCTS.find((p) => p.id === 'thales-digital-id-wallet')
    expect(product).toBeTruthy()
    expect(product?.type).toBe('Wallet Infrastructure')
  })

  it('every product has a non-empty integrationSnippet', () => {
    for (const product of EXPLORE_PRODUCTS) {
      expect(product.integrationSnippet.length).toBeGreaterThan(0)
    }
  })
})
