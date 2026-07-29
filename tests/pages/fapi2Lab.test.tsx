import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Fapi2Lab from '../../src/pages/Playgrounds/Fapi2Lab'
import { FAPI2_SCENARIOS } from '../../src/data/fapi2Scenarios'

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('Fapi2Lab page', () => {
  it('renders the heading and all 3 control steps', () => {
    renderWithProviders(<Fapi2Lab />)
    expect(screen.getByRole('heading', { name: /fapi 2\.0 \/ open banking security profile playground/i })).toBeInTheDocument()
    for (const scenario of FAPI2_SCENARIOS) {
      expect(screen.getByText(new RegExp(escapeRegex(scenario.title)))).toBeInTheDocument()
    }
  })

  it('an attack succeeds (with a warning) when its control is disabled — the default state', () => {
    renderWithProviders(<Fapi2Lab />)
    const simulateButtons = screen.getAllByRole('button', { name: /simulate attack/i })
    fireEvent.click(simulateButtons[0])

    expect(screen.getAllByText(FAPI2_SCENARIOS[0].attackSuccessLog).length).toBeGreaterThan(0)
  })

  it('the same attack is blocked once its control is toggled on — proving both branches actually render', () => {
    renderWithProviders(<Fapi2Lab />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(escapeRegex(FAPI2_SCENARIOS[0].controlName)) }))
    const simulateButtons = screen.getAllByRole('button', { name: /simulate attack/i })
    fireEvent.click(simulateButtons[0])

    expect(screen.getAllByText(FAPI2_SCENARIOS[0].attackBlockedLog).length).toBeGreaterThan(0)
  })

  it('completing all 3 steps with their controls enabled finishes the playground', () => {
    renderWithProviders(<Fapi2Lab />)
    for (const scenario of FAPI2_SCENARIOS) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(escapeRegex(scenario.controlName)) }))
    }
    const simulateButtons = screen.getAllByRole('button', { name: /simulate attack/i })
    simulateButtons.forEach((btn) => fireEvent.click(btn))

    expect(screen.getByText(/All three FAPI 2\.0 controls verified/i)).toBeInTheDocument()
  })

  it('resets all controls and results when Reset is clicked', () => {
    renderWithProviders(<Fapi2Lab />)
    const simulateButtons = screen.getAllByRole('button', { name: /simulate attack/i })
    fireEvent.click(simulateButtons[0])
    expect(screen.getAllByText(FAPI2_SCENARIOS[0].attackSuccessLog).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryAllByText(FAPI2_SCENARIOS[0].attackSuccessLog)).toHaveLength(0)
  })
})
