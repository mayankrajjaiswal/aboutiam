import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { itemDomId } from '../../src/lib/nextgen/useDeepLinkedItem'

import AgenticIdentityCenter from '../../src/pages/AgenticIdentityCenter'
import AiSecurityFabricCenter from '../../src/pages/AiSecurityFabricCenter'
import PhishingResistantAuthCenter from '../../src/pages/PhishingResistantAuthCenter'
import DigitalWalletsCenter from '../../src/pages/DigitalWalletsCenter'
import CryptoAgilityCenter from '../../src/pages/CryptoAgilityCenter'

import { AGENTIC_QUADRANTS } from '../../src/data/agenticEcosystemQuadrants'
import { AGENT_THREAT_CATALOG } from '../../src/data/agentThreatCatalog'
import { FIDO_FORM_FACTORS } from '../../src/data/fidoFormFactors'
import { BUSINESS_WALLET_USE_CASES } from '../../src/data/businessWalletUseCases'
import { WALLET_PROGRAMMES } from '../../src/data/walletProgrammes'
import { HSM_ROOT_OF_TRUST_CONCEPTS } from '../../src/data/hsmRootOfTrust'
import { CRYPTO_MIGRATION_WORKSTREAMS } from '../../src/data/cryptoAgilityRoadmap'

/**
 * The search index deep-links into these hubs with BOTH a tab and a specific
 * item id (see the registry loops in `src/lib/search/searchService.ts`). These
 * tests are the invariant that the item half of that link is actually honoured
 * -- it used to be silently dropped, landing the searcher on the right tab with
 * no indication which card they had searched for.
 */
const CASES = [
  { name: 'Agentic Identity / quadrant', Page: AgenticIdentityCenter, path: '/next-gen/agentic-identity', tab: 'quadrants', param: 'quadrant', id: AGENTIC_QUADRANTS[0].id },
  { name: 'AI Security Fabric / threat', Page: AiSecurityFabricCenter, path: '/next-gen/ai-security-fabric', tab: 'threats', param: 'threat', id: AGENT_THREAT_CATALOG[0].id },
  { name: 'Phishing-Resistant Auth / form factor', Page: PhishingResistantAuthCenter, path: '/next-gen/phishing-resistant-auth', tab: 'form-factors', param: 'factor', id: FIDO_FORM_FACTORS[0].id },
  { name: 'Digital Wallets / business use case', Page: DigitalWalletsCenter, path: '/next-gen/digital-wallets', tab: 'business-wallet', param: 'usecase', id: BUSINESS_WALLET_USE_CASES[0].id },
  { name: 'Digital Wallets / programme', Page: DigitalWalletsCenter, path: '/next-gen/digital-wallets', tab: 'programmes', param: 'programme', id: WALLET_PROGRAMMES[0].id },
  { name: 'Crypto Agility / root-of-trust concept', Page: CryptoAgilityCenter, path: '/next-gen/crypto-agility', tab: 'root-of-trust', param: 'concept', id: HSM_ROOT_OF_TRUST_CONCEPTS[0].id },
  { name: 'Crypto Agility / migration workstream', Page: CryptoAgilityCenter, path: '/next-gen/crypto-agility', tab: 'migration', param: 'workstream', id: CRYPTO_MIGRATION_WORKSTREAMS[0].id },
] as const

describe('Next-Gen hub item deep links', () => {
  beforeEach(() => {
    // jsdom has no layout engine, so scrollIntoView is not implemented on
    // HTMLElement -- stub it rather than let the hook throw.
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
    vi.restoreAllMocks()
  })

  for (const c of CASES) {
    it(`highlights the deep-linked item: ${c.name}`, async () => {
      window.history.pushState({}, '', `${c.path}?tab=${c.tab}&${c.param}=${c.id}`)
      const { container } = renderWithProviders(<c.Page />)

      await waitFor(() => {
        const el = container.querySelector(`#${CSS.escape(itemDomId(c.param, c.id))}`)
        expect(el, `expected #${itemDomId(c.param, c.id)} to be rendered`).toBeTruthy()
        expect(
          el!.className,
          `expected the deep-linked ${c.param} card to carry the highlight ring`,
        ).toContain('ring-accent-primary')
      })
    })

    it(`scrolls the deep-linked item into view: ${c.name}`, async () => {
      window.history.pushState({}, '', `${c.path}?tab=${c.tab}&${c.param}=${c.id}`)
      renderWithProviders(<c.Page />)
      await waitFor(() => {
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
      })
    })
  }

  it('ignores an unknown item id rather than highlighting nothing at all', async () => {
    window.history.pushState({}, '', '/next-gen/ai-security-fabric?tab=threats&threat=not-a-real-threat')
    const { container } = renderWithProviders(<AiSecurityFabricCenter />)
    await waitFor(() => {
      expect(container.querySelectorAll('.ring-accent-primary')).toHaveLength(0)
    })
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
