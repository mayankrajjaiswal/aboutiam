import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import BusinessWalletStudio from '../../src/pages/Playgrounds/BusinessWalletStudio'
import { BUSINESS_WALLET_USE_CASES } from '../../src/data/businessWalletUseCases'

describe('BusinessWalletStudio playground', () => {
  it('renders the title and use case selector', () => {
    renderWithProviders(<BusinessWalletStudio />)
    expect(screen.getByRole('heading', { name: /business wallet studio/i })).toBeInTheDocument()
    const select = screen.getByLabelText(/select a business wallet use case/i) as HTMLSelectElement
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(select.querySelector(`option[value="${u.id}"]`)).toBeTruthy()
    }
  })

  it('receiving a credential reveals the delegation/presentation controls', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    expect(screen.getByText(/credential received under/i)).toBeInTheDocument()
    expect(screen.getByText('Alicia Chen')).toBeInTheDocument()
  })

  it('presenting through an active employee with no issues succeeds', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    // Turn off the high-value threshold requirement to isolate the success path
    fireEvent.click(screen.getByLabelText(/high-value presentation/i))
    const delegateButtons = screen.getAllByRole('button', { name: /delegate authority/i })
    fireEvent.click(delegateButtons[0])
    const presentButtons = screen.getAllByRole('button', { name: /present to verifier/i })
    fireEvent.click(presentButtons[0])
    expect(screen.getByText(/presentation succeeded: issuer trust/i)).toBeInTheDocument()
  })

  it('presenting through the departed employee is blocked', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    const delegateButtons = screen.getAllByRole('button', { name: /delegate authority/i })
    fireEvent.click(delegateButtons[2]) // Priya Anand, departed
    const presentButtons = screen.getAllByRole('button', { name: /present to verifier/i })
    fireEvent.click(presentButtons[2])
    expect(screen.getByText(/blocked: the presenting employee has departed/i)).toBeInTheDocument()
  })

  it('revoking the credential mid-transaction blocks a subsequent presentation', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    // Turn off the high-value threshold requirement to isolate the revocation check
    fireEvent.click(screen.getByLabelText(/high-value presentation/i))
    const delegateButtons = screen.getAllByRole('button', { name: /delegate authority/i })
    fireEvent.click(delegateButtons[0])
    fireEvent.click(screen.getByRole('button', { name: /simulate mid-transaction revocation/i }))
    const presentButtons = screen.getAllByRole('button', { name: /present to verifier/i })
    fireEvent.click(presentButtons[0])
    expect(screen.getAllByText(/blocked: the underlying credential was revoked/i).length).toBeGreaterThan(0)
  })

  it('a high-value presentation under single-admin custody is flagged for missing the threshold', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /single administrator/i }))
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    const delegateButtons = screen.getAllByRole('button', { name: /delegate authority/i })
    fireEvent.click(delegateButtons[0])
    const presentButtons = screen.getAllByRole('button', { name: /present to verifier/i })
    fireEvent.click(presentButtons[0])
    expect(screen.getByText(/flagged: a high-value presentation bypassed/i)).toBeInTheDocument()
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<BusinessWalletStudio />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    expect(screen.getByText(/credential received under/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/credential received under/i)).not.toBeInTheDocument()
  })

  it('has no critical axe violations before receiving a credential', async () => {
    const { container } = renderWithProviders(<BusinessWalletStudio />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after a successful presentation', async () => {
    const { container } = renderWithProviders(<BusinessWalletStudio />)
    fireEvent.click(screen.getByRole('button', { name: /receive credential into wallet/i }))
    fireEvent.click(screen.getByLabelText(/high-value presentation/i))
    const delegateButtons = screen.getAllByRole('button', { name: /delegate authority/i })
    fireEvent.click(delegateButtons[0])
    const presentButtons = screen.getAllByRole('button', { name: /present to verifier/i })
    fireEvent.click(presentButtons[0])
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
