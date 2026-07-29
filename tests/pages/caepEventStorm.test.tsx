import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CaepEventStorm from '../../src/pages/Playgrounds/CaepEventStorm'
import { useAirplaneModeStore } from '../../src/store/airplaneModeStore'
import { CAEP_SUBSCRIBERS } from '../../src/data/caepEventScenarios'

describe('CaepEventStorm page', () => {
  beforeEach(() => {
    useAirplaneModeStore.setState({ isEnabled: false, isManual: false })
  })

  it('renders the heading, event-fire buttons, and every subscriber node idle', () => {
    renderWithProviders(<CaepEventStorm />)
    expect(screen.getByRole('heading', { name: /caep event storm visualizer/i })).toBeInTheDocument()
    for (const subscriber of CAEP_SUBSCRIBERS) {
      expect(screen.getByText(subscriber.name)).toBeInTheDocument()
    }
    expect(screen.getAllByText('idle').length).toBe(CAEP_SUBSCRIBERS.length)
  })

  it('firing "Session Revoked" delivers to every subscribed node and leaves unsubscribed nodes untouched', () => {
    renderWithProviders(<CaepEventStorm />)
    fireEvent.click(screen.getByRole('button', { name: /fire "session revoked"/i }))

    // rp-slack, rp-salesforce, rp-aws all subscribe to session-revoked
    expect(screen.getAllByText('delivered').length).toBe(3)
    // rp-github does not subscribe to session-revoked, so it must be marked ignored, not delivered
    expect(screen.getAllByText('ignored').length).toBe(1)
  })

  it('the offline-chaos toggle drops delivery only to the affected subscriber, leaving others delivered normally', () => {
    renderWithProviders(<CaepEventStorm />)
    fireEvent.click(screen.getByRole('button', { name: /chaos \(github offline\)/i }))
    // Fire an event GitHub (RP-4) actually subscribes to
    fireEvent.click(screen.getByRole('button', { name: /fire "token claims changed"/i }))

    expect(screen.getAllByText('dropped').length).toBe(1)
    // rp-slack, rp-salesforce, rp-aws don't subscribe to token-claims-changed at all
    expect(screen.getAllByText('ignored').length).toBe(3)
  })

  it('without chaos enabled, the same event delivers normally to its subscriber instead of dropping', () => {
    renderWithProviders(<CaepEventStorm />)
    fireEvent.click(screen.getByRole('button', { name: /fire "token claims changed"/i }))

    expect(screen.getAllByText('delivered').length).toBe(1)
    expect(screen.queryByText('dropped')).not.toBeInTheDocument()
  })

  it('resets every subscriber back to idle when Reset is clicked', () => {
    renderWithProviders(<CaepEventStorm />)
    fireEvent.click(screen.getByRole('button', { name: /fire "session revoked"/i }))
    expect(screen.queryAllByText('idle').length).toBeLessThan(CAEP_SUBSCRIBERS.length)

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getAllByText('idle').length).toBe(CAEP_SUBSCRIBERS.length)
  })
})
