import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import FederatedVpPlayground from '../../src/pages/Playgrounds/FederatedVpPlayground'

describe('FederatedVpPlayground page', () => {
  it('renders correctly and lists wallet selective disclosures', () => {
    renderWithProviders(<FederatedVpPlayground />)
    expect(screen.getByRole('heading', { name: /Dynamic Trust Framework & Verifiable Presentation Playground/i })).toBeInTheDocument()
    expect(screen.getByText(/EUDI Identity Wallet/i)).toBeInTheDocument()
  })

  it('can trigger presentation validation', async () => {
    renderWithProviders(<FederatedVpPlayground />)

    // Click Send Verifiable Presentation
    const sendBtn = screen.getByText(/Send Verifiable Presentation/i)
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(screen.getByText(/Disclosed claims parsed/i)).toBeInTheDocument()
    })
  })
})
