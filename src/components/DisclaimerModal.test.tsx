import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useDisclaimerStore } from '../store/disclaimerStore'
import { useTourStore } from '../store/tourStore'
import DisclaimerModal from './DisclaimerModal'

describe('DisclaimerModal (GEMINI §4N first-visit sequencing)', () => {
  it('auto-opens on first mount when hasSeenDisclaimer is false', async () => {
    renderWithProviders(<DisclaimerModal />)
    await waitFor(() => expect(useDisclaimerStore.getState().isOpen).toBe(true))
    expect(screen.getByText(/welcome to aboutiam/i)).toBeInTheDocument()
  })

  it('does not auto-open again once hasSeenDisclaimer is already true', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: true, isOpen: false })
    renderWithProviders(<DisclaimerModal />)
    await new Promise((r) => setTimeout(r, 350))
    expect(useDisclaimerStore.getState().isOpen).toBe(false)
  })

  it('dismissing sets hasSeenDisclaimer and opens the tour only if the tour has not been seen yet', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: false, isOpen: true })
    useTourStore.setState({ hasSeenTour: false, isOpen: false })
    renderWithProviders(<DisclaimerModal />)

    fireEvent.click(screen.getByRole('button', { name: /got it, let's go/i }))
    expect(useDisclaimerStore.getState().hasSeenDisclaimer).toBe(true)

    await waitFor(() => expect(useTourStore.getState().isOpen).toBe(true))
  })

  it('does not re-open the tour on dismiss if it has already been seen', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: false, isOpen: true })
    useTourStore.setState({ hasSeenTour: true, isOpen: false })
    renderWithProviders(<DisclaimerModal />)

    fireEvent.click(screen.getByRole('button', { name: /got it, let's go/i }))
    await new Promise((r) => setTimeout(r, 450))
    expect(useTourStore.getState().isOpen).toBe(false)
  })
})
