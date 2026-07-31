import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { INCIDENT_COMMANDER_SCENARIOS } from '../../src/data/incidentCommanderScenarios'
import IncidentCommanderSim from '../../src/pages/Playgrounds/IncidentCommanderSim'

describe('IncidentCommanderSim page', () => {
  it('renders the briefing for the first scenario and begins on click', () => {
    renderWithProviders(<IncidentCommanderSim />)
    const scenario = INCIDENT_COMMANDER_SCENARIOS[0]
    expect(screen.getByText(scenario.briefing)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Begin Incident Response' }))
    const startNode = scenario.nodes.find((n) => n.id === scenario.startNodeId)!
    expect(screen.getByText(startNode.prompt)).toBeInTheDocument()
  })

  it('walks the best-path decisions to a contained-fast outcome with its post-mortem', () => {
    renderWithProviders(<IncidentCommanderSim />)
    fireEvent.click(screen.getByRole('button', { name: 'Begin Incident Response' }))

    // The scenario is authored so the first-listed decision at every node is the
    // "correct" path leading to contained-fast — walk it end to end.
    for (let i = 0; i < 5; i++) {
      const buttons = screen.queryAllByRole('button').filter((b) => !['Begin Incident Response', 'Run Another Incident'].includes(b.textContent ?? ''))
      const decisionButton = buttons.find((b) => b.className.includes('text-left'))
      if (!decisionButton) break
      fireEvent.click(decisionButton)
    }

    expect(screen.getByText('Contained — Fast')).toBeInTheDocument()
  })

  it('switching scenarios resets the in-progress decision tree', () => {
    renderWithProviders(<IncidentCommanderSim />)
    fireEvent.click(screen.getByRole('button', { name: 'Begin Incident Response' }))

    const secondScenario = INCIDENT_COMMANDER_SCENARIOS[1]
    fireEvent.click(screen.getByRole('button', { name: secondScenario.title }))
    expect(screen.getByText(secondScenario.briefing)).toBeInTheDocument()
  })
})
