import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { EXECUTIVE_JOURNEY_STEPS } from '../data/executiveJourneySteps'
import JourneyBreadcrumb from './JourneyBreadcrumb'

describe('JourneyBreadcrumb', () => {
  it('renders every step label', () => {
    renderWithProviders(<JourneyBreadcrumb currentPath="/assess" />)
    for (const step of EXECUTIVE_JOURNEY_STEPS) {
      expect(screen.getByText(step.label)).toBeInTheDocument()
    }
  })

  it('marks the current step as non-clickable text, not a link', () => {
    renderWithProviders(<JourneyBreadcrumb currentPath="/assess" />)
    const current = screen.getByText('Assess')
    expect(current.tagName).not.toBe('A')
    expect(current).toHaveAttribute('aria-current', 'step')
  })

  it('renders every other step as a clickable link to its real path', () => {
    renderWithProviders(<JourneyBreadcrumb currentPath="/assess" />)
    const link = screen.getByRole('link', { name: 'Compliance Deadlines' })
    expect(link).toHaveAttribute('href', '/standards?view=deadlines')
  })
})
