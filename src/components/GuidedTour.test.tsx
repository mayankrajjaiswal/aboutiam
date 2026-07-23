import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useTourStore } from '../store/tourStore'
import { useDisclaimerStore } from '../store/disclaimerStore'
import GuidedTour from './GuidedTour'

describe('GuidedTour', () => {
  it('auto-opens once the disclaimer has already been seen, and not before', async () => {
    useTourStore.setState({ hasSeenTour: false, isOpen: false })
    useDisclaimerStore.setState({ hasSeenDisclaimer: true })
    renderWithProviders(<GuidedTour />)
    await waitFor(() => expect(useTourStore.getState().isOpen).toBe(true))
  })

  it('does not auto-open while the disclaimer is still unseen (avoids stacking two first-visit modals)', async () => {
    useTourStore.setState({ hasSeenTour: false, isOpen: false })
    useDisclaimerStore.setState({ hasSeenDisclaimer: false })
    renderWithProviders(<GuidedTour />)
    await new Promise((r) => setTimeout(r, 700))
    expect(useTourStore.getState().isOpen).toBe(false)
  })

  it('steps forward through all 5 steps and marks hasSeenTour on the final "Get Started" click', () => {
    useTourStore.setState({ hasSeenTour: false, isOpen: true })
    useDisclaimerStore.setState({ hasSeenDisclaimer: true })
    renderWithProviders(<GuidedTour />)

    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument()
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(useTourStore.getState().hasSeenTour).toBe(true)
    expect(useTourStore.getState().isOpen).toBe(false)
  })

  it('the "Skip tour" (X) button also closes the modal and marks hasSeenTour (closeTour has no separate skip variant)', () => {
    useTourStore.setState({ hasSeenTour: false, isOpen: true })
    useDisclaimerStore.setState({ hasSeenDisclaimer: true })
    renderWithProviders(<GuidedTour />)

    fireEvent.click(screen.getByRole('button', { name: /skip tour/i }))
    expect(useTourStore.getState().isOpen).toBe(false)
    expect(useTourStore.getState().hasSeenTour).toBe(true)
  })
})
