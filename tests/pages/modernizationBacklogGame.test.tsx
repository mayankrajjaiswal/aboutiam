import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import ModernizationBacklogGame from '../../src/pages/Playgrounds/ModernizationBacklogGame'
import { MODERNIZATION_BACKLOG_ITEMS, MAX_POSSIBLE_RISK_REDUCTION } from '../../src/data/modernizationBacklogItems'

describe('ModernizationBacklogGame page', () => {
  it('renders the heading and starts with nothing scheduled', () => {
    renderWithProviders(<ModernizationBacklogGame />)
    expect(screen.getByRole('heading', { name: /iam modernization backlog game/i })).toBeInTheDocument()
    expect(screen.getByText(`0 / ${MAX_POSSIBLE_RISK_REDUCTION}`)).toBeInTheDocument()
    expect(screen.getByText(`0 / ${MODERNIZATION_BACKLOG_ITEMS.length} items`)).toBeInTheDocument()
  })

  it('scheduling an item updates the live scorecard', () => {
    renderWithProviders(<ModernizationBacklogGame />)
    const firstItem = MODERNIZATION_BACKLOG_ITEMS[0]
    const select = screen.getByText(firstItem.title).closest('tr')!.querySelector('select')!
    fireEvent.change(select, { target: { value: '1' } })

    expect(screen.getByText(`1 / ${MODERNIZATION_BACKLOG_ITEMS.length} items`)).toBeInTheDocument()
    expect(screen.getByText(`${firstItem.riskScore} / ${MAX_POSSIBLE_RISK_REDUCTION}`)).toBeInTheDocument()
  })

  it('flags a dependency violation when a dependent item is scheduled before its dependency', () => {
    renderWithProviders(<ModernizationBacklogGame />)

    const dependent = MODERNIZATION_BACKLOG_ITEMS.find((i) => i.dependsOn?.length)!
    const select = screen.getByText(dependent.title).closest('tr')!.querySelector('select')!
    // Schedule the dependent in Q1 without ever scheduling its dependency — an unmet dependency
    fireEvent.change(select, { target: { value: '1' } })

    expect(screen.getByText(/dependency violation detected/i)).toBeInTheDocument()
  })

  it('flags a budget overage when a quarter exceeds the per-quarter cap', () => {
    renderWithProviders(<ModernizationBacklogGame />)

    // Stack every item into Q1 — guaranteed to blow past the per-quarter budget
    for (const item of MODERNIZATION_BACKLOG_ITEMS) {
      const select = screen.getByText(item.title).closest('tr')!.querySelector('select')!
      fireEvent.change(select, { target: { value: '1' } })
    }

    expect(screen.getAllByText(/exceeds the \$\d+ budget cap/i).length).toBeGreaterThan(0)
  })

  it('resets the roadmap when the reset button is clicked', () => {
    renderWithProviders(<ModernizationBacklogGame />)
    const firstItem = MODERNIZATION_BACKLOG_ITEMS[0]
    const select = screen.getByText(firstItem.title).closest('tr')!.querySelector('select')!
    fireEvent.change(select, { target: { value: '1' } })
    expect(screen.getByText(`1 / ${MODERNIZATION_BACKLOG_ITEMS.length} items`)).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByText(`0 / ${MODERNIZATION_BACKLOG_ITEMS.length} items`)).toBeInTheDocument()
  })
})
