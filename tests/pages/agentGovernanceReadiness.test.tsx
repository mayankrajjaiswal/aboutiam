import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AgentGovernanceReadiness from '../../src/pages/Tools/AgentGovernanceReadiness'
import { READINESS_QUESTIONS } from '../../src/lib/tools/agentGovernanceReadiness'

function answerAll(value: 0 | 1 | 2 | 3) {
  const labels = { 0: 'Not started', 1: 'Ad hoc', 2: 'Defined', 3: 'Fully mature' }[value]
  const buttons = screen.getAllByRole('button', { name: new RegExp(`^${labels}$`, 'i') })
  for (const b of buttons) fireEvent.click(b)
}

describe('AgentGovernanceReadiness tool page', () => {
  it('renders the title and all questions, with the results button disabled', () => {
    renderWithProviders(<AgentGovernanceReadiness />)
    expect(screen.getByRole('heading', { name: /agent governance readiness assessor/i })).toBeInTheDocument()
    for (const q of READINESS_QUESTIONS) {
      expect(screen.getByText(q.question)).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /answer all/i })).toBeDisabled()
  })

  it('answering all questions enables viewing results, showing a 0% score for the lowest answer', () => {
    renderWithProviders(<AgentGovernanceReadiness />)
    answerAll(0)
    const viewResultsButton = screen.getByRole('button', { name: /view results/i })
    expect(viewResultsButton).not.toBeDisabled()
    fireEvent.click(viewResultsButton)
    // Every dimension is also 0%, so the overall score (a distinct, larger heading) is matched specifically.
    expect(screen.getByText('0%', { selector: '.text-4xl' })).toBeInTheDocument()
    expect(screen.getByText('Unmanaged')).toBeInTheDocument()
  })

  it('answering all questions at max maturity shows a 100% score and the Adaptive band', () => {
    renderWithProviders(<AgentGovernanceReadiness />)
    answerAll(3)
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    // Every dimension is also 100%, so scope to the overall-score heading specifically.
    expect(screen.getByText('100%', { selector: '.text-4xl' })).toBeInTheDocument()
    expect(screen.getByText('Adaptive')).toBeInTheDocument()
  })

  it('shows per-dimension scores and a prioritized gap list at 0%', () => {
    renderWithProviders(<AgentGovernanceReadiness />)
    answerAll(0)
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    expect(screen.getByText(/per-dimension scores/i)).toBeInTheDocument()
    expect(screen.getByText(/prioritized gaps/i)).toBeInTheDocument()
  })

  it('resetting clears all answers and returns to the question view', () => {
    renderWithProviders(<AgentGovernanceReadiness />)
    answerAll(2)
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    expect(screen.getByText(/per-dimension scores/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(screen.getByRole('button', { name: /answer all/i })).toBeDisabled()
  })

  it('has no critical axe violations on the question view', async () => {
    const { container } = renderWithProviders(<AgentGovernanceReadiness />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations on the results view', async () => {
    const { container } = renderWithProviders(<AgentGovernanceReadiness />)
    answerAll(1)
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
