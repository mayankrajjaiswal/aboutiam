import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { saveLastAssessment } from '../../src/lib/assess/assessHistory'
import { usePreferenceStore } from '../../src/store/preferenceStore'
import CommandCenter from '../../src/pages/CommandCenter'

describe('CommandCenter', () => {
  beforeEach(() => {
    window.localStorage.clear()
    usePreferenceStore.setState({ depthMode: 'both' })
  })

  it('renders all four question cards linking to real, currently-registered routes', () => {
    renderWithProviders(<CommandCenter />)
    expect(screen.getByRole('link', { name: /What's at risk\?/ })).toHaveAttribute('href', '/assess')
    expect(screen.getByRole('link', { name: /What's the deadline\?/ })).toHaveAttribute('href', '/standards?view=deadlines')
    expect(screen.getByRole('link', { name: /What will it cost\?/ })).toHaveAttribute('href', '/tools/iam-tco-calculator')
    expect(screen.getByRole('link', { name: /Who owns it\?/ })).toHaveAttribute('href', '/tools/raci-builder')
  })

  it('prompts to complete the assessment first when no assessment is on file', () => {
    renderWithProviders(<CommandCenter />)
    expect(screen.getByText(/No assessment on file yet/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Download Board Summary/ })).not.toBeInTheDocument()
  })

  it('offers the board summary download once an assessment has been saved', () => {
    saveLastAssessment({ 0: 1, 1: 3, 2: 5, 3: 3, 4: 1 })
    renderWithProviders(<CommandCenter />)
    expect(screen.getByRole('button', { name: /Download Board Summary/ })).toBeInTheDocument()
  })

  it('toggling density to Compact ties into the shared preference store depth mode', () => {
    renderWithProviders(<CommandCenter />)
    fireEvent.click(screen.getByRole('button', { name: /Compact/ }))
    expect(usePreferenceStore.getState().depthMode).toBe('expert')

    fireEvent.click(screen.getByRole('button', { name: /Narrative/ }))
    expect(usePreferenceStore.getState().depthMode).toBe('beginner')
  })

  it('renders the executive journey breadcrumb', () => {
    renderWithProviders(<CommandCenter />)
    expect(screen.getByRole('navigation', { name: /executive grc journey/i })).toBeInTheDocument()
  })
})
