import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import NextGenIamCenter from '../../src/pages/NextGenIamCenter'
import { NEXT_GEN_THEMES } from '../../src/data/nextGenThemes'

describe('NextGenIamCenter page', () => {
  it('renders the hero heading and all 5 theme cards', () => {
    renderWithProviders(<NextGenIamCenter />)
    expect(screen.getByRole('heading', { name: /the next generation of identity/i })).toBeInTheDocument()
    for (const theme of NEXT_GEN_THEMES) {
      expect(screen.getAllByText(theme.title).length).toBeGreaterThan(0)
    }
  })

  it('links each theme card to its own route', () => {
    renderWithProviders(<NextGenIamCenter />)
    for (const theme of NEXT_GEN_THEMES) {
      const matches = screen.getAllByText(theme.title)
      const cardLink = matches.map((el) => el.closest('a')).find((a) => a?.getAttribute('href') === theme.route)
      expect(cardLink, `expected a card link to ${theme.route}`).toBeTruthy()
    }
  })

  it('expands a maturity ladder to show all 4 bands', () => {
    renderWithProviders(<NextGenIamCenter />)
    const firstTheme = NEXT_GEN_THEMES[0]
    const summaries = screen.getAllByText(firstTheme.title)
    const summary = summaries.find((el) => el.tagName.toLowerCase() === 'summary')
    expect(summary).toBeTruthy()
    fireEvent.click(summary!)
    for (const band of firstTheme.maturityBands) {
      expect(screen.getByText(band.label)).toBeInTheDocument()
    }
  })

  it('shows the regulatory clock with at least one deadline', () => {
    renderWithProviders(<NextGenIamCenter />)
    expect(screen.getByText(/the regulatory clock/i)).toBeInTheDocument()
  })

  it('expands a Start Here path to reveal its steps', () => {
    renderWithProviders(<NextGenIamCenter />)
    const showStepsButtons = screen.getAllByText(/show steps/i)
    fireEvent.click(showStepsButtons[0])
    expect(screen.getAllByText(/hide steps/i).length).toBeGreaterThan(0)
  })

  it('renders the cross-theme dependency diagram', () => {
    renderWithProviders(<NextGenIamCenter />)
    expect(screen.getByText(/how the five themes depend on each other/i)).toBeInTheDocument()
  })

  // The pillar landing page is the entry point for all 5 theme hubs, each of
  // which already carries this assertion -- it should not be the one page in
  // the pillar without it.
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<NextGenIamCenter />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
