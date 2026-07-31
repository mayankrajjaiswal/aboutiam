import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useStartHereStore } from '../store/startHereStore'
import { START_HERE_GOALS } from '../data/startHereRoutes'
import StartHereWizard from './StartHereWizard'

describe('StartHereWizard', () => {
  beforeEach(() => {
    useStartHereStore.setState({ selectedGoalId: null, completedPaths: [] })
  })

  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<StartHereWizard isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows every goal question when open with no goal selected', () => {
    renderWithProviders(<StartHereWizard isOpen={true} onClose={() => {}} />)
    for (const goal of START_HERE_GOALS) {
      expect(screen.getByText(goal.question)).toBeInTheDocument()
    }
  })

  it('selecting a goal shows its ordered checklist', () => {
    renderWithProviders(<StartHereWizard isOpen={true} onClose={() => {}} />)
    const goal = START_HERE_GOALS[0]
    fireEvent.click(screen.getByText(goal.question))
    for (const step of goal.steps) {
      expect(screen.getByText(new RegExp(step.label))).toBeInTheDocument()
    }
  })

  it('toggling a step marks it complete and persists via the store', () => {
    renderWithProviders(<StartHereWizard isOpen={true} onClose={() => {}} />)
    const goal = START_HERE_GOALS[0]
    fireEvent.click(screen.getByText(goal.question))
    const firstStep = goal.steps[0]
    fireEvent.click(screen.getByRole('button', { name: `Mark "${firstStep.label}" complete` }))
    expect(useStartHereStore.getState().isStepComplete(firstStep.path)).toBe(true)
  })

  it('"Change goal" resets back to the question list', () => {
    renderWithProviders(<StartHereWizard isOpen={true} onClose={() => {}} />)
    fireEvent.click(screen.getByText(START_HERE_GOALS[0].question))
    fireEvent.click(screen.getByRole('button', { name: /change goal/i }))
    expect(screen.getByText('What brings you here today?')).toBeInTheDocument()
  })
})
