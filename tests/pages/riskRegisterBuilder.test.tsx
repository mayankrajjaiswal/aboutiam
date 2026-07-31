import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { STARTER_RISK_REGISTER } from '../../src/lib/tools/riskRegisterScoring'
import RiskRegisterBuilder from '../../src/pages/Tools/RiskRegisterBuilder'

describe('RiskRegisterBuilder page', () => {
  it('renders every starter risk with a score/tier badge', () => {
    renderWithProviders(<RiskRegisterBuilder />)
    for (const entry of STARTER_RISK_REGISTER) {
      expect(screen.getByDisplayValue(entry.risk)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/·/).length).toBe(STARTER_RISK_REGISTER.length)
  })

  it('adds a new blank risk row on click', () => {
    renderWithProviders(<RiskRegisterBuilder />)
    const before = screen.getAllByPlaceholderText('Describe the risk').length
    fireEvent.click(screen.getByRole('button', { name: /add risk/i }))
    expect(screen.getAllByPlaceholderText('Describe the risk').length).toBe(before + 1)
  })

  it('removes a risk row on delete', () => {
    renderWithProviders(<RiskRegisterBuilder />)
    const before = screen.getAllByPlaceholderText('Describe the risk').length
    fireEvent.click(screen.getAllByRole('button', { name: /remove risk/i })[0])
    expect(screen.getAllByPlaceholderText('Describe the risk').length).toBe(before - 1)
  })
})
