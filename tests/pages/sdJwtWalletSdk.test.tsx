import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import SdJwtWalletSdk from '../../src/pages/Tools/SdJwtWalletSdk'

describe('SdJwtWalletSdk page', () => {
  it('renders correctly and has standard sections', async () => {
    renderWithProviders(<SdJwtWalletSdk />)
    expect(screen.getByRole('heading', { name: /Holder Claims Config/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Verifiable Presentation Cryptographic Assembly/i })).toBeInTheDocument()
  })

  it('allows toggling redaction of a claim', async () => {
    renderWithProviders(<SdJwtWalletSdk />)
    
    // Check initial count of Disclosed claims is 3
    expect(screen.getAllByRole('button', { name: /Disclosed/i })).toHaveLength(3)
    
    // Check for birthdate claim which is redacted by default
    const redactBtn = screen.getAllByRole('button', { name: /Redacted/i })[0]
    expect(redactBtn).toBeInTheDocument()
    
    fireEvent.click(redactBtn)
    
    await waitFor(() => {
      // Disclosed claims count should now be 4
      expect(screen.getAllByRole('button', { name: /Disclosed/i })).toHaveLength(4)
    })
  })
})
