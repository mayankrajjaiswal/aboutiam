import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@testing-library/react'
import { useCoachMarkStore } from '../store/coachMarkStore'
import CoachMark from './CoachMark'

describe('CoachMark', () => {
  beforeEach(() => {
    useCoachMarkStore.setState({ seenFeatureIds: [] })
  })

  it('renders on first render for an unseen featureId', () => {
    render(<CoachMark featureId="attack-path-graph" message="Click a node to begin." />)
    expect(screen.getByText('Click a node to begin.')).toBeInTheDocument()
  })

  it('does not render for a featureId already marked seen', () => {
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    render(<CoachMark featureId="attack-path-graph" message="Click a node to begin." />)
    expect(screen.queryByText('Click a node to begin.')).not.toBeInTheDocument()
  })

  it('dismissing hides it and marks the feature seen for good', () => {
    render(<CoachMark featureId="attack-path-graph" message="Click a node to begin." />)
    fireEvent.click(screen.getByLabelText('Dismiss tip'))
    expect(screen.queryByText('Click a node to begin.')).not.toBeInTheDocument()
    expect(useCoachMarkStore.getState().isSeen('attack-path-graph')).toBe(true)
  })

  it('tracks independent features separately', () => {
    useCoachMarkStore.getState().markSeen('attack-path-graph')
    render(<CoachMark featureId="role-mining-workbench" message="Drag to cluster." />)
    expect(screen.getByText('Drag to cluster.')).toBeInTheDocument()
  })
})
