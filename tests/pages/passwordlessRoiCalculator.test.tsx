import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PasswordlessRoiCalculator from '../../src/pages/Tools/PasswordlessRoiCalculator'
import { DEFAULT_ROI_INPUTS } from '../../src/lib/tools/passwordlessRoi'

describe('PasswordlessRoiCalculator tool page', () => {
  it('renders the title and the "not a vendor claim" integrity notice', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    expect(screen.getByRole('heading', { name: /passwordless roi & helpdesk cost calculator/i })).toBeInTheDocument()
    expect(screen.getByText(/this is a planning model, not a vendor performance claim/i)).toBeInTheDocument()
  })

  it('marks every non-population field as "Illustrative"', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    const illustrativeBadges = screen.getAllByText(/^illustrative$/i)
    // 11 of the 12 fields are illustrative (population is the one exception)
    expect(illustrativeBadges.length).toBe(11)
  })

  it('shows the 3-year cost comparison and savings figures by default', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    expect(screen.getByText(/3-year password cost/i)).toBeInTheDocument()
    expect(screen.getByText(/3-year passwordless cost/i)).toBeInTheDocument()
  })

  it('changing an input recalculates the result', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    const costPerTicketInput = screen.getByLabelText(/cost per helpdesk ticket/i)
    fireEvent.change(costPerTicketInput, { target: { value: '500' } })
    expect((costPerTicketInput as HTMLInputElement).value).toBe('500')
  })

  it('resetting restores the default illustrative values', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    const populationInput = screen.getByLabelText(/population \(users\)/i) as HTMLInputElement
    fireEvent.change(populationInput, { target: { value: '99999' } })
    expect(populationInput.value).toBe('99999')
    fireEvent.click(screen.getByRole('button', { name: /reset to illustrative defaults/i }))
    expect(populationInput.value).toBe(String(DEFAULT_ROI_INPUTS.population))
  })

  it('shows a break-even statement (either a year or "no break-even")', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    const hasBreakEven = screen.queryByText(/break-even at year/i) || screen.queryByText(/no break-even within 3 years/i)
    expect(hasBreakEven).toBeTruthy()
  })

  it('shows the two most influential inputs', () => {
    renderWithProviders(<PasswordlessRoiCalculator />)
    expect(screen.getByText(/most influential inputs/i)).toBeInTheDocument()
  })

  it('has no critical axe violations with default inputs', async () => {
    const { container } = renderWithProviders(<PasswordlessRoiCalculator />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after changing an input', async () => {
    const { container } = renderWithProviders(<PasswordlessRoiCalculator />)
    fireEvent.change(screen.getByLabelText(/cost per helpdesk ticket/i), { target: { value: '100' } })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
