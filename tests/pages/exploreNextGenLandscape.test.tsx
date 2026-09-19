import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Explore from '../../src/pages/Explore'

describe('Explore Next-Gen IAM landscape entries', () => {
  it('renders an Agentic Identity Platform filter chip and product card', () => {
    renderWithProviders(<Explore />)
    fireEvent.click(screen.getByRole('button', { name: 'Agentic Identity Platform' }))
    expect(screen.getByText('Microsoft Entra Agent ID')).toBeInTheDocument()
    expect(screen.queryByText('Keycloak')).not.toBeInTheDocument()
  })

  it('renders a Wallet Infrastructure filter chip and product card', () => {
    renderWithProviders(<Explore />)
    fireEvent.click(screen.getByRole('button', { name: 'Wallet Infrastructure' }))
    expect(screen.getByText('Thales Digital ID Wallet')).toBeInTheDocument()
    expect(screen.queryByText('Microsoft Entra Agent ID')).not.toBeInTheDocument()
  })

  it('finds both new entries via search regardless of the active type filter', () => {
    renderWithProviders(<Explore />)
    fireEvent.change(screen.getByPlaceholderText(/search products/i), { target: { value: 'agent id' } })
    expect(screen.getByText('Microsoft Entra Agent ID')).toBeInTheDocument()
  })
})
