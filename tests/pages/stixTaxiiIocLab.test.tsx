import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import StixTaxiiIocLab from '../../src/pages/Playgrounds/StixTaxiiIocLab'
import { TAXII_SUBSCRIBERS } from '../../src/data/stixTaxiiScenarios'

describe('StixTaxiiIocLab page', () => {
  it('renders the heading and every subscriber node idle', () => {
    renderWithProviders(<StixTaxiiIocLab />)
    expect(screen.getByRole('heading', { name: /stix\/taxii identity-ioc fan-out simulator/i })).toBeInTheDocument()
    for (const subscriber of TAXII_SUBSCRIBERS) {
      expect(screen.getByText(subscriber.name)).toBeInTheDocument()
    }
    expect(screen.getAllByText('idle').length).toBe(TAXII_SUBSCRIBERS.length)
  })

  it('publishing the credential-leak bundle delivers only to subscribers filtering on that tag', () => {
    renderWithProviders(<StixTaxiiIocLab />)
    fireEvent.click(screen.getByRole('button', { name: /publish to taxii collection/i }))

    // soc-alpha and soc-gamma filter on credential-leak; soc-beta (token-compromise only) does not
    expect(screen.getAllByText('delivered').length).toBe(2)
    expect(screen.getAllByText('not-subscribed').length).toBe(1)
  })

  it('switching to the compromised-token scenario and publishing reaches the token-compromise subscribers instead', () => {
    renderWithProviders(<StixTaxiiIocLab />)
    fireEvent.click(screen.getByRole('button', { name: /compromised oauth token → identity/i }))
    fireEvent.click(screen.getByRole('button', { name: /publish to taxii collection/i }))

    // soc-beta and soc-gamma filter on token-compromise; soc-alpha (credential-leak only) does not
    expect(screen.getAllByText('delivered').length).toBe(2)
    expect(screen.getAllByText('not-subscribed').length).toBe(1)
  })

  it('toggling "View Raw STIX JSON" renders the assembled bundle with an Indicator and a Relationship object', () => {
    renderWithProviders(<StixTaxiiIocLab />)
    fireEvent.click(screen.getByRole('button', { name: /view raw stix json/i }))

    expect(screen.getByText(/"type": "indicator"/)).toBeInTheDocument()
    expect(screen.getByText(/"type": "relationship"/)).toBeInTheDocument()
  })

  it('resets every subscriber back to idle when Reset is clicked', () => {
    renderWithProviders(<StixTaxiiIocLab />)
    fireEvent.click(screen.getByRole('button', { name: /publish to taxii collection/i }))
    expect(screen.queryAllByText('idle').length).toBeLessThan(TAXII_SUBSCRIBERS.length)

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getAllByText('idle').length).toBe(TAXII_SUBSCRIBERS.length)
  })
})
