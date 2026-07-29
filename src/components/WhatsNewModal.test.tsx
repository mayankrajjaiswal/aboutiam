import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useWhatsNewStore } from '../store/whatsNewStore'
import { useDisclaimerStore } from '../store/disclaimerStore'
import { WHATS_NEW_VERSION, WHATS_NEW_RELEASES } from '../data/whatsNewData'
import WhatsNewModal from './WhatsNewModal'

describe('WhatsNewModal (returning-visitor changelog)', () => {
  beforeEach(() => {
    useWhatsNewStore.setState({ lastSeenVersion: null, isOpen: false })
    useDisclaimerStore.setState({ hasSeenDisclaimer: false, isOpen: false })
  })

  it('auto-opens for a returning visitor who has not seen the latest release', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: true })
    renderWithProviders(<WhatsNewModal />)
    await waitFor(() => expect(useWhatsNewStore.getState().isOpen).toBe(true))
    expect(screen.getByText(/what's new/i)).toBeInTheDocument()
    expect(screen.getByText(WHATS_NEW_RELEASES[0].items[0].title)).toBeInTheDocument()
  })

  it('does not auto-open for a first-time visitor who has not seen the disclaimer yet', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: false })
    renderWithProviders(<WhatsNewModal />)
    await new Promise((r) => setTimeout(r, 350))
    expect(useWhatsNewStore.getState().isOpen).toBe(false)
  })

  it('does not re-open once the latest version has already been seen', async () => {
    useDisclaimerStore.setState({ hasSeenDisclaimer: true })
    useWhatsNewStore.setState({ lastSeenVersion: WHATS_NEW_VERSION })
    renderWithProviders(<WhatsNewModal />)
    await new Promise((r) => setTimeout(r, 350))
    expect(useWhatsNewStore.getState().isOpen).toBe(false)
  })

  it('dismissing via "Got it" marks the latest version as seen and closes', async () => {
    useWhatsNewStore.setState({ isOpen: true, lastSeenVersion: null })
    renderWithProviders(<WhatsNewModal />)

    fireEvent.click(screen.getByRole('button', { name: /got it/i }))
    expect(useWhatsNewStore.getState().isOpen).toBe(false)
    expect(useWhatsNewStore.getState().lastSeenVersion).toBe(WHATS_NEW_VERSION)
  })

  it('dismissing via the close (X) button also marks the latest version as seen', async () => {
    useWhatsNewStore.setState({ isOpen: true, lastSeenVersion: null })
    renderWithProviders(<WhatsNewModal />)

    fireEvent.click(screen.getByRole('button', { name: /close what's new/i }))
    expect(useWhatsNewStore.getState().isOpen).toBe(false)
    expect(useWhatsNewStore.getState().lastSeenVersion).toBe(WHATS_NEW_VERSION)
  })
})
