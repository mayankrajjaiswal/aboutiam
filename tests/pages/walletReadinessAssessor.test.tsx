import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import WalletReadinessAssessor from '../../src/pages/Tools/WalletReadinessAssessor'

const verifierCheckbox = () => screen.getByRole('checkbox', { name: /^verifier/i })
const issuerCheckbox = () => screen.getByRole('checkbox', { name: /^issuer/i })
const bankingCheckbox = () => screen.getByRole('checkbox', { name: /banking & financial services/i })
const euOnlyCheckbox = () => screen.getByRole('checkbox', { name: /european union only/i })
const usOnlyCheckbox = () => screen.getByRole('checkbox', { name: /united states only/i })

describe('WalletReadinessAssessor tool page', () => {
  it('renders the title and the "educational, not legal advice" notice', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    expect(screen.getByRole('heading', { name: /wallet readiness assessor/i })).toBeInTheDocument()
    expect(screen.getByText(/educational, not legal advice/i)).toBeInTheDocument()
  })

  it('shows no checklist before any role is selected', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    expect(screen.queryByRole('heading', { name: /readiness checklist/i })).not.toBeInTheDocument()
  })

  it('shows the verifier checklist after selecting the verifier role', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    expect(screen.getByRole('heading', { name: /readiness checklist/i })).toBeInTheDocument()
    expect(screen.getAllByText(/verifier/i).length).toBeGreaterThan(0)
  })

  it('combines checklists when multiple roles are selected', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    fireEvent.click(issuerCheckbox())
    expect(screen.getAllByText(/verifier/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/issuer/i).length).toBeGreaterThan(0)
  })

  it('flags a likely acceptance obligation for verifier + banking + EU', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    fireEvent.click(bankingCheckbox())
    fireEvent.click(euOnlyCheckbox())
    expect(screen.getByText(/likely eu relying-party wallet-acceptance obligation/i)).toBeInTheDocument()
  })

  it('does not flag an acceptance obligation for a US-only footprint', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    fireEvent.click(bankingCheckbox())
    fireEvent.click(usOnlyCheckbox())
    expect(screen.queryByText(/likely eu relying-party wallet-acceptance obligation/i)).not.toBeInTheDocument()
  })

  it('shows relevant compliance deadlines once EU jurisdiction is selected', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    fireEvent.click(euOnlyCheckbox())
    expect(screen.getByRole('heading', { name: /relevant compliance deadlines/i })).toBeInTheDocument()
  })

  it('unchecking a role removes it from the checklist', () => {
    renderWithProviders(<WalletReadinessAssessor />)
    const checkbox = verifierCheckbox()
    fireEvent.click(checkbox)
    expect(screen.getByRole('heading', { name: /readiness checklist/i })).toBeInTheDocument()
    fireEvent.click(checkbox)
    expect(screen.queryByRole('heading', { name: /readiness checklist/i })).not.toBeInTheDocument()
  })

  it('has no critical axe violations with default (no selection) state', async () => {
    const { container } = renderWithProviders(<WalletReadinessAssessor />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after selecting roles and filters', async () => {
    const { container } = renderWithProviders(<WalletReadinessAssessor />)
    fireEvent.click(verifierCheckbox())
    fireEvent.click(issuerCheckbox())
    fireEvent.click(bankingCheckbox())
    fireEvent.click(euOnlyCheckbox())
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
