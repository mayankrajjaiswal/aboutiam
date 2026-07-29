import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import WallOfShame from '../../src/pages/WallOfShame'
import { BREACHES } from '../../src/data/breachesData'
import { useSpacedRepetitionStore } from '../../src/store/spacedRepetitionStore'

describe('WallOfShame — Quiz Mode tab', () => {
  beforeEach(() => {
    useSpacedRepetitionStore.setState({ schedules: {} })
  })

  it('renders the Quiz Mode tab and shows a first-session starter-card count', () => {
    renderWithProviders(<WallOfShame />)
    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))

    expect(screen.getByText(/Active Recall Review/i)).toBeInTheDocument()
    expect(screen.getByText(/starter cards ready — first session/i)).toBeInTheDocument()
  })

  it('starts a review session and flips a card to reveal root cause & remediation', () => {
    renderWithProviders(<WallOfShame />)
    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /start review/i }))

    // Front of the first card should show the breach title
    expect(screen.getByText(BREACHES[0].title)).toBeInTheDocument()
    expect(screen.queryByText(/Grade the card/i)).not.toBeInTheDocument()

    // Flip the card
    fireEvent.click(screen.getByText(/Click card to reveal/i))
    expect(screen.getByText(BREACHES[0].rootCause)).toBeInTheDocument()
  })

  it('grading a card removes it from the current session queue', () => {
    renderWithProviders(<WallOfShame />)
    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /start review/i }))

    fireEvent.click(screen.getByText(/Click card to reveal/i))
    expect(screen.getByText(/10 cards remaining in this session/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^good$/i }))
    expect(screen.getByText(/9 cards remaining in this session/i)).toBeInTheDocument()
    // Should show the next card's title (not the first one anymore)
    expect(screen.getByText(BREACHES[1].title)).toBeInTheDocument()
  })

  it('shows a completion message once every queued card has been graded', () => {
    renderWithProviders(<WallOfShame />)
    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /start review/i }))

    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText(/Click card to reveal/i))
      fireEvent.click(screen.getByRole('button', { name: /^easy$/i }))
    }

    expect(screen.getByText(/Session complete!/i)).toBeInTheDocument()
  })

  it('disables Start Review when nothing is due after the first session', () => {
    renderWithProviders(<WallOfShame />)
    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))

    // Simulate having already studied every card with a future due date
    const farFuture = '2099-01-01T00:00:00.000Z'
    for (const breach of BREACHES) {
      useSpacedRepetitionStore.getState().recordReview(breach.id, 'easy', farFuture)
    }

    fireEvent.click(screen.getByRole('button', { name: /quiz mode/i }))
    expect(screen.getByText(/0 of \d+ breach cards due today/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restart review|start review/i })).toBeDisabled()
  })
})
