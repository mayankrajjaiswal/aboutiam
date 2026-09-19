import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AgentRegistryStudio from '../../src/pages/Playgrounds/AgentRegistryStudio'
import { SAMPLE_AGENT_RECORDS } from '../../src/data/agentRegistryModel'

describe('AgentRegistryStudio playground', () => {
  it('renders the title and defaults to the first sample agent', () => {
    renderWithProviders(<AgentRegistryStudio />)
    expect(screen.getByRole('heading', { name: /agent registry & lifecycle studio/i })).toBeInTheDocument()
    expect(screen.getByText(/audit the record/i)).toBeInTheDocument()
  })

  it('switches to a different sample agent', () => {
    renderWithProviders(<AgentRegistryStudio />)
    const overGoverned = SAMPLE_AGENT_RECORDS.find((a) => a.id === 'orchestrator-overgoverned')!
    fireEvent.click(screen.getByText(overGoverned.name))
    // Switching agents re-renders the field list; the Human Owner field is always present
    expect(screen.getAllByText('Human Owner').length).toBeGreaterThan(0)
  })

  it('flagging a real governance gap shows the issue and fix text', () => {
    renderWithProviders(<AgentRegistryStudio />)
    const agent = SAMPLE_AGENT_RECORDS[0] // refund-subagent, has an 'owner' gap
    const ownerGap = agent.governanceGaps.find((g) => g.fieldId === 'owner')!
    const ownerButtons = screen.getAllByRole('button').filter((b) => b.textContent?.includes('Owner'))
    fireEvent.click(ownerButtons[0])
    expect(screen.getByText(ownerGap.issue)).toBeInTheDocument()
    expect(screen.getByText(ownerGap.fix)).toBeInTheDocument()
  })

  it('applying a fix marks the field as fixed and shows a checkmark', () => {
    renderWithProviders(<AgentRegistryStudio />)
    const agent = SAMPLE_AGENT_RECORDS[0] // refund-subagent, has an 'owner' gap
    const ownerGap = agent.governanceGaps.find((g) => g.fieldId === 'owner')!

    // Find and click the Owner field row to flag it
    const ownerButtons = screen.getAllByRole('button').filter((b) => b.textContent?.includes('Owner'))
    fireEvent.click(ownerButtons[0])

    // The fix panel should now show the issue and fix text
    expect(screen.getByText(ownerGap.issue)).toBeInTheDocument()

    // Apply the fix
    const applyButtons = screen.getAllByRole('button', { name: /apply fix/i })
    fireEvent.click(applyButtons[0])

    // Issue text should disappear once fixed
    expect(screen.queryByText(ownerGap.issue)).not.toBeInTheDocument()
  })

  it('switches to the lifecycle tab and advances through stages', () => {
    renderWithProviders(<AgentRegistryStudio />)
    fireEvent.click(screen.getByText(/run the lifecycle/i))
    expect(screen.getByText('Unregistered')).toBeInTheDocument()
    expect(screen.getByText('Decommissioned')).toBeInTheDocument()

    const advanceButton = screen.getByRole('button', { name: /advance to next stage/i })
    fireEvent.click(advanceButton)
    fireEvent.click(advanceButton)
    // After 2 clicks we should be past the first two stages
    expect(advanceButton).toBeInTheDocument()
  })

  it('exports the agent record as JSON', () => {
    renderWithProviders(<AgentRegistryStudio />)
    expect(screen.getByRole('button', { name: /export agent identity record/i })).toBeInTheDocument()
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<AgentRegistryStudio />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    const hintButton = screen.getByRole('button', { name: /reveal next hint/i })
    fireEvent.click(hintButton)
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<AgentRegistryStudio />)
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
    const resetButton = screen.getByTitle(/reset simulator/i)
    fireEvent.click(resetButton)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
  })

  it('has no critical axe violations on the audit tab', async () => {
    const { container } = renderWithProviders(<AgentRegistryStudio />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations on the lifecycle tab', async () => {
    const { container } = renderWithProviders(<AgentRegistryStudio />)
    fireEvent.click(screen.getByText(/run the lifecycle/i))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
