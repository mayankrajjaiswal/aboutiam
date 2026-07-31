import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import KnowledgeChatPanel from './KnowledgeChatPanel'

describe('KnowledgeChatPanel', () => {
  it('renders the welcome message and its starter resources', () => {
    renderWithProviders(<KnowledgeChatPanel />)
    expect(screen.getByText(/AI Knowledge Assistant 2.0/)).toBeInTheDocument()
    expect(screen.getByText('OAuth Visualizer')).toBeInTheDocument()
  })

  it('does not render the desktop context sidebar by default', () => {
    renderWithProviders(<KnowledgeChatPanel />)
    expect(screen.queryByText('Active Context Resources')).not.toBeInTheDocument()
  })

  it('renders the desktop context sidebar when showSidebar is set', () => {
    renderWithProviders(<KnowledgeChatPanel showSidebar />)
    expect(screen.getByText('Active Context Resources')).toBeInTheDocument()
  })

  it('sends a quick-prompt and shows a simulated response', async () => {
    renderWithProviders(<KnowledgeChatPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Explain OAuth vs SAML' }))

    expect(screen.getAllByText('Explain OAuth vs SAML').length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getByText(/OAuth 2.0.*is an authorization framework/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('sends a typed message via the input box and Enter key', async () => {
    renderWithProviders(<KnowledgeChatPanel />)
    const input = screen.getByPlaceholderText(/Ask about OAuth/)
    fireEvent.change(input, { target: { value: 'Tell me about passkeys' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText(/WebAuthn Passkey Registration Challenge/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('exposes the opt-in local AI toggle collapsed by default', () => {
    renderWithProviders(<KnowledgeChatPanel />)
    expect(screen.getByText(/Experimental: Enable Local AI/)).toBeInTheDocument()
    expect(screen.getByText(/Download & Enable/)).toBeInTheDocument()
  })
})
