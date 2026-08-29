import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AutonomousAgentLab from '../../src/pages/Playgrounds/AutonomousAgentLab'
import { AGENT_BATTLE_SCENARIOS } from '../../src/data/autonomousAgentScenarios'

describe('Autonomous Security Agent Simulation Playground page', () => {
  it('should contain robust attack and defense scenarios in data', () => {
    expect(AGENT_BATTLE_SCENARIOS.length).toBe(2)
    const first = AGENT_BATTLE_SCENARIOS[0]
    expect(first.id).toBe('token_hijacking')
    expect(first.steps.length).toBeGreaterThan(0)
    
    first.steps.forEach(step => {
      expect(step.name).toBeDefined()
      expect(step.redAction).toBeDefined()
      expect(step.blueReaction).toBeDefined()
      expect(['SUCCESS', 'BLOCKED']).toContain(step.result)
    })
  })

  it('renders correctly and lets user trigger agentic battle', async () => {
    renderWithProviders(<AutonomousAgentLab />)
    expect(screen.getByRole('heading', { name: /Autonomous Security Agent Simulation Playground/i })).toBeInTheDocument()
    expect(screen.getByText(/🔴 Red Team AI \(Malicious Agent\)/i)).toBeInTheDocument()

    // Trigger next step
    const nextBtn = screen.getByText(/Advance Autonomous Battle/i)
    fireEvent.click(nextBtn)

    await waitFor(() => {
      expect(screen.getByText(/Switched Agentic Battle arena/i)).toBeInTheDocument()
    })
  })
})
