import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { WALLET_ADOPTION_TRACKER } from '../../src/data/walletAdoptionTracker'
import StandardsExplorer from '../../src/pages/StandardsExplorer'

describe('StandardsExplorer Wallet/mDL Adoption tab', () => {
  it('switches to the wallet adoption tab and lists every state', () => {
    renderWithProviders(<StandardsExplorer />)
    fireEvent.click(screen.getByRole('button', { name: /wallet\/mdl adoption/i }))
    for (const entry of WALLET_ADOPTION_TRACKER) {
      expect(screen.getByText(entry.state)).toBeInTheDocument()
    }
  })

  it('shows the mdlStatus badge for a live state', () => {
    renderWithProviders(<StandardsExplorer />)
    fireEvent.click(screen.getByRole('button', { name: /wallet\/mdl adoption/i }))
    expect(screen.getAllByText('live').length).toBeGreaterThan(0)
  })
})
