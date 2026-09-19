import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import FidoFleetOps from '../../src/pages/Playgrounds/FidoFleetOps'
import { FIDO_FORM_FACTORS } from '../../src/data/fidoFormFactors'

describe('FidoFleetOps playground', () => {
  it('renders the title and round 1 of 5', () => {
    renderWithProviders(<FidoFleetOps />)
    expect(screen.getByRole('heading', { name: /fido fleet operations simulator/i })).toBeInTheDocument()
    expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument()
  })

  it('shows all 5 segments with form-factor selectors', () => {
    renderWithProviders(<FidoFleetOps />)
    expect(screen.getAllByText('Office Workforce').length).toBeGreaterThan(0)
    expect(screen.getByText('Remote Workforce')).toBeInTheDocument()
    expect(screen.getByText(/shared-device \/ shift workers/i)).toBeInTheDocument()
    expect(screen.getByText(/privileged \/ admin accounts/i)).toBeInTheDocument()
    expect(screen.getByText('Contractors')).toBeInTheDocument()
  })

  it('every form factor appears as a selectable option', () => {
    renderWithProviders(<FidoFleetOps />)
    const selects = screen.getAllByRole('combobox')
    for (const select of selects) {
      for (const f of FIDO_FORM_FACTORS) {
        expect(select.querySelector(`option[value="${f.id}"]`)).toBeTruthy()
      }
    }
  })

  it('advancing a round progresses to round 2 and logs the outcome', () => {
    renderWithProviders(<FidoFleetOps />)
    fireEvent.click(screen.getByRole('button', { name: /advance to next round/i }))
    expect(screen.getByText(/round 2 of 5/i)).toBeInTheDocument()
  })

  it('completing all 5 rounds shows the final summary', () => {
    renderWithProviders(<FidoFleetOps />)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /advance to next round/i }))
    }
    expect(screen.getAllByText(/fleet run complete/i).length).toBeGreaterThan(0)
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<FidoFleetOps />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<FidoFleetOps />)
    fireEvent.click(screen.getByRole('button', { name: /advance to next round/i }))
    expect(screen.getByText(/round 2 of 5/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument()
  })

  it('has no critical axe violations on round 1', async () => {
    const { container } = renderWithProviders(<FidoFleetOps />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations on the final summary screen', async () => {
    const { container } = renderWithProviders(<FidoFleetOps />)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /advance to next round/i }))
    }
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
