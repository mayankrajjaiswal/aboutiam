import { describe, it, expect } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Explore from '../../src/pages/Explore'

describe('Explore contribution guide callout', () => {
  function openProductBlueprint(productName: string) {
    const title = screen.getByText(productName)
    const card = title.closest('div[class*="rounded-2xl"]') ?? title.closest('div')!
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: /view product blueprint/i }))
  }

  it("shows the Contribute callout with a good-first-issue link for Keycloak", () => {
    renderWithProviders(<Explore />)
    openProductBlueprint('Keycloak')

    expect(screen.getByText('Contribute to Keycloak')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /good first issue/i })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/github\.com\/keycloak\/keycloak/))
  })

  it('does not show the callout for a product with no contributionGuide', () => {
    renderWithProviders(<Explore />)
    openProductBlueprint('Authentik')
    expect(screen.queryByText(/Contribute to Authentik/)).not.toBeInTheDocument()
  })
})
