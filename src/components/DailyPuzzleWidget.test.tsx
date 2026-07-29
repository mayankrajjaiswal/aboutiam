// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DailyPuzzleWidget from './DailyPuzzleWidget'
import { getDailyPuzzle } from '../lib/games/dailyPuzzle'

describe('DailyPuzzleWidget', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      writable: true,
      configurable: true,
    })
  })

  it('renders the format label and today\'s date', () => {
    render(<DailyPuzzleWidget />)
    const today = new Date().toISOString().slice(0, 10)
    expect(screen.getByText(today)).toBeInTheDocument()
  })

  it('clicking the correct choice immediately shows the win state and explanation', () => {
    render(<DailyPuzzleWidget />)
    const today = new Date().toISOString().slice(0, 10)
    const puzzle = getDailyPuzzle(today)

    fireEvent.click(screen.getByText(puzzle.choices[puzzle.correctIndex]))

    expect(screen.getByText(puzzle.explanation)).toBeInTheDocument()
    expect(screen.getByText(/share result/i)).toBeInTheDocument()
  })

  it('clicking a wrong choice allows another attempt, and 3 wrong attempts ends the round', () => {
    render(<DailyPuzzleWidget />)
    const today = new Date().toISOString().slice(0, 10)
    const puzzle = getDailyPuzzle(today)
    const wrongIndex = puzzle.choices.findIndex((_, i) => i !== puzzle.correctIndex)

    fireEvent.click(screen.getByText(puzzle.choices[wrongIndex]))
    expect(screen.getByText(/attempt 2 of 3/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(puzzle.choices[wrongIndex]))
    expect(screen.getByText(/attempt 3 of 3/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(puzzle.choices[wrongIndex]))
    expect(screen.getByText(puzzle.explanation)).toBeInTheDocument()
  })

  it('disables all choice buttons once the round is over', () => {
    render(<DailyPuzzleWidget />)
    const today = new Date().toISOString().slice(0, 10)
    const puzzle = getDailyPuzzle(today)

    fireEvent.click(screen.getByText(puzzle.choices[puzzle.correctIndex]))

    for (const choice of puzzle.choices) {
      expect(screen.getByText(choice).closest('button')).toBeDisabled()
    }
  })

  it('copies a shareable result to the clipboard when "Share Result" is clicked', () => {
    render(<DailyPuzzleWidget />)
    const today = new Date().toISOString().slice(0, 10)
    const puzzle = getDailyPuzzle(today)

    fireEvent.click(screen.getByText(puzzle.choices[puzzle.correctIndex]))
    fireEvent.click(screen.getByText(/share result/i))

    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
    const [sharedText] = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(sharedText).toContain('/daily-puzzle?r=')
  })
})
