import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AccessRequestCart from '../../src/pages/Playgrounds/AccessRequestCart'

describe('AccessRequestCart page', () => {
  it('renders the heading and an empty cart', () => {
    renderWithProviders(<AccessRequestCart />)
    expect(screen.getByRole('heading', { name: /access request cart simulator/i })).toBeInTheDocument()
    expect(screen.getByText(/your cart \(0\)/i)).toBeInTheDocument()
  })

  it('adding an item to the cart shows it in the cart list', () => {
    renderWithProviders(<AccessRequestCart />)
    fireEvent.click(screen.getByTestId('add-to-cart-app-read'))
    expect(screen.getByText(/your cart \(1\)/i)).toBeInTheDocument()
  })

  it('submitting a clean standard-level request auto-approves', () => {
    renderWithProviders(<AccessRequestCart />)
    fireEvent.click(screen.getByTestId('add-to-cart-vpn-access'))
    fireEvent.click(screen.getByText(/submit access request/i))
    expect(screen.getAllByText(/manager/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/compliance officer/i)).not.toBeInTheDocument()
  })

  it('submitting a conflicting combination shows the SoD conflict warning', () => {
    renderWithProviders(<AccessRequestCart />)
    fireEvent.click(screen.getByTestId('add-to-cart-invoice-approver'))
    fireEvent.click(screen.getByTestId('add-to-cart-payment-issuer'))
    fireEvent.click(screen.getByText(/submit access request/i))
    expect(screen.getAllByText(/sod conflict/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/compliance officer/i).length).toBeGreaterThan(0)
  })

  it('removing an item from the cart updates the count', () => {
    renderWithProviders(<AccessRequestCart />)
    fireEvent.click(screen.getByTestId('add-to-cart-app-read'))
    expect(screen.getByText(/your cart \(1\)/i)).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/remove application read access/i))
    expect(screen.getByText(/your cart \(0\)/i)).toBeInTheDocument()
  })

  it('resets the cart and result when the shell reset button is clicked', () => {
    renderWithProviders(<AccessRequestCart />)
    fireEvent.click(screen.getByTestId('add-to-cart-app-read'))
    fireEvent.click(screen.getByText(/submit access request/i))
    expect(screen.getByText(/approval chain result/i)).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/approval chain result/i)).not.toBeInTheDocument()
    expect(screen.getByText(/your cart \(0\)/i)).toBeInTheDocument()
  })
})
