import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AdvancedOauthHackDefend from '../../src/pages/Playgrounds/AdvancedOauthHackDefend'

describe('AdvancedOauthHackDefend page', () => {
  it('renders correctly and has standard sections', async () => {
    renderWithProviders(<AdvancedOauthHackDefend />)
    expect(screen.getByRole('heading', { name: /Exploit Target Console/i })).toBeInTheDocument()
  })

  it('allows selecting different exploits and simulating them', async () => {
    renderWithProviders(<AdvancedOauthHackDefend />)
    
    // Select PKCE Injection Bypass
    const pkceBtn = screen.getByRole('button', { name: /PKCE Injection Bypass/i })
    fireEvent.click(pkceBtn)
    
    // Simulate exploit
    const simulateBtn = screen.getByRole('button', { name: /Simulate Exploit Execution/i })
    fireEvent.click(simulateBtn)
    
    await waitFor(() => {
      // Trace log should include successful exploit message
      expect(screen.getByText(/PKCE Authorization Code Injection Exploit/i)).toBeInTheDocument()
    })
  })
})
