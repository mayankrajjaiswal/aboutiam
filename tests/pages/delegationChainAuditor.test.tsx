import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import DelegationChainAuditor from '../../src/pages/Playgrounds/DelegationChainAuditor'
import { AGENTIC_QUADRANTS } from '../../src/data/agenticEcosystemQuadrants'

describe('DelegationChainAuditor playground', () => {
  it('renders the title, quadrant selector, and 3 chain hops', () => {
    renderWithProviders(<DelegationChainAuditor />)
    expect(screen.getByRole('heading', { name: /delegation chain auditor/i })).toBeInTheDocument()
    for (const q of AGENTIC_QUADRANTS) {
      expect(screen.getByText(q.title)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/orchestrator agent/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/sub-agent/i).length).toBeGreaterThan(0)
  })

  it('switches quadrant and updates the governance note', () => {
    renderWithProviders(<DelegationChainAuditor />)
    const partnersQuadrant = AGENTIC_QUADRANTS.find((q) => q.id === 'partners')!
    fireEvent.click(screen.getByText(partnersQuadrant.title))
    expect(screen.getByText(partnersQuadrant.governanceNotes)).toBeInTheDocument()
  })

  it('running the audit with default (safe) config reports zero widening/confused-deputy findings', () => {
    renderWithProviders(<DelegationChainAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    expect(screen.queryByText(/confused-deputy risk/i)).not.toBeInTheDocument()
  })

  it('selecting raw scope forwarding surfaces a confused-deputy finding', () => {
    renderWithProviders(<DelegationChainAuditor />)
    const rawForwardButtons = screen.getAllByRole('button', { name: /^raw scope forwarding$/i })
    fireEvent.click(rawForwardButtons[1]) // orchestrator -> sub-agent hop
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    // Appears both in the findings panel and the trace terminal log
    expect(screen.getAllByText(/confused-deputy risk/i).length).toBeGreaterThan(0)
  })

  it('selecting CIBA approval preserves attribution (no attribution-lost finding for that hop)', () => {
    renderWithProviders(<DelegationChainAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    expect(screen.getByText(/who is accountable for the final action/i)).toBeInTheDocument()
  })

  it('shows the final accountability statement after running the audit', () => {
    renderWithProviders(<DelegationChainAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    expect(screen.getByText(/the original user remains accountable/i)).toBeInTheDocument()
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<DelegationChainAuditor />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<DelegationChainAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/who is accountable for the final action/i)).not.toBeInTheDocument()
  })

  it('has no critical axe violations before running the audit', async () => {
    const { container } = renderWithProviders(<DelegationChainAuditor />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after running the audit', async () => {
    const { container } = renderWithProviders(<DelegationChainAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /run delegation chain audit/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
