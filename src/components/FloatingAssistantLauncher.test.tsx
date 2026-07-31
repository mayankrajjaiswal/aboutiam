import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import FloatingAssistantLauncher from './FloatingAssistantLauncher'

describe('FloatingAssistantLauncher', () => {
  it('renders collapsed by default with no chat interface visible', () => {
    renderWithProviders(<FloatingAssistantLauncher />)
    expect(screen.getByRole('button', { name: /open ask ai assistant/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/Ask about OAuth/)).not.toBeInTheDocument()
  })

  it('expanding shows the same shared KnowledgeChatPanel chat interface', () => {
    renderWithProviders(<FloatingAssistantLauncher />)
    fireEvent.click(screen.getByRole('button', { name: /open ask ai assistant/i }))

    expect(screen.getByRole('dialog', { name: /ask ai knowledge assistant/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ask about OAuth/)).toBeInTheDocument()
    expect(screen.getByText(/AI Knowledge Assistant 2.0/)).toBeInTheDocument()
  })

  it('links to the full Assistant page', () => {
    renderWithProviders(<FloatingAssistantLauncher />)
    fireEvent.click(screen.getByRole('button', { name: /open ask ai assistant/i }))

    expect(screen.getByRole('link', { name: /full page/i })).toHaveAttribute('href', '/assistant')
  })

  it('closes via the close button', () => {
    renderWithProviders(<FloatingAssistantLauncher />)
    fireEvent.click(screen.getByRole('button', { name: /open ask ai assistant/i }))
    fireEvent.click(screen.getByRole('button', { name: /dismiss ask ai panel/i }))

    expect(screen.queryByPlaceholderText(/Ask about OAuth/)).not.toBeInTheDocument()
  })
})
