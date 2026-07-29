import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import TrustRegistryExplorer from '../../src/pages/Playgrounds/TrustRegistryExplorer'

describe('TrustRegistryExplorer page', () => {
  it('renders the heading and the registry browser', () => {
    renderWithProviders(<TrustRegistryExplorer />)
    expect(screen.getByRole('heading', { name: /trust registry & issuer governance explorer/i })).toBeInTheDocument()
    expect(screen.getAllByText('German Federal Trust Registry (DE)').length).toBeGreaterThan(0)
  })

  it('verifying the diploma credential against the DE registry authorizes it', () => {
    renderWithProviders(<TrustRegistryExplorer />)
    fireEvent.change(screen.getByLabelText(/presented credential/i), { target: { value: 'university-diploma' } })
    fireEvent.change(screen.getByLabelText(/verifier's trusted registry/i), { target: { value: 'de-registry' } })
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }))
    expect(screen.getByText(/issuer authorized in trusted registry: yes/i)).toBeInTheDocument()
  })

  it('verifying the same credential against the FR registry demonstrates the cross-border recognition gap', () => {
    renderWithProviders(<TrustRegistryExplorer />)
    fireEvent.change(screen.getByLabelText(/presented credential/i), { target: { value: 'university-diploma' } })
    fireEvent.change(screen.getByLabelText(/verifier's trusted registry/i), { target: { value: 'fr-registry' } })
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }))
    expect(screen.getByText(/issuer authorized in trusted registry: no/i)).toBeInTheDocument()
  })

  it('revoking an issuer mid-session flips a previously-authorized verification to fail', () => {
    renderWithProviders(<TrustRegistryExplorer />)
    fireEvent.change(screen.getByLabelText(/presented credential/i), { target: { value: 'university-diploma' } })
    fireEvent.change(screen.getByLabelText(/verifier's trusted registry/i), { target: { value: 'de-registry' } })
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }))
    expect(screen.getByText(/issuer authorized in trusted registry: yes/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /revoke state university registrar/i }))
    expect(screen.getByText(/issuer authorized in trusted registry: no/i)).toBeInTheDocument()
    expect(screen.getByText(/"revoked"/i)).toBeInTheDocument()
  })
})
