import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PqcHandshakeLab from '../../src/pages/Playgrounds/PqcHandshakeLab'

describe('PqcHandshakeLab page', () => {
  it('renders correctly and allows choosing a handshake scenario', async () => {
    renderWithProviders(<PqcHandshakeLab />)
    expect(screen.getByRole('heading', { name: /Post-Quantum Cryptography \(PQC\) Handshake Simulator/i })).toBeInTheDocument()
    
    // Select Hybrid Transition Scenario
    const hybridBtn = screen.getByText(/Hybrid Transition/i)
    fireEvent.click(hybridBtn)
    
    // Check that alg specifications and descriptions update
    await waitFor(() => {
      expect(screen.getByText(/X25519 \+ ML-KEM-768/i)).toBeInTheDocument()
    })
  })

  it('can step through the handshake and updates packet sizes', async () => {
    renderWithProviders(<PqcHandshakeLab />)
    
    const advanceBtn = screen.getByText(/Advance Handshake Step/i)
    fireEvent.click(advanceBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/TOTAL HANDSHAKE PACKETS:/i)).toBeInTheDocument()
    })
  })
})
