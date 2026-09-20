import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import IdentityTimeline from '../../src/pages/IdentityTimeline'

describe('IdentityTimeline Next-Gen IAM era', () => {
  it('lists the Agentic Identity & Post-Quantum Migration era on the timeline', () => {
    renderWithProviders(<IdentityTimeline />)
    expect(screen.getByText('Agentic Identity & Post-Quantum Migration')).toBeInTheDocument()
  })

  it('shows the era detail with its sourced milestones when selected', async () => {
    renderWithProviders(<IdentityTimeline />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to Agentic Identity & Post-Quantum Migration' }))
    await waitFor(() => {
      expect(screen.getAllByText(/Model Context Protocol/i).length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText(/FIPS 203/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/eIDAS 2\.0/i).length).toBeGreaterThan(0)
  })

  it('still lists the pre-existing Continuous Ambient Trust era after the new one', () => {
    renderWithProviders(<IdentityTimeline />)
    expect(screen.getByText('Continuous Ambient Trust & SSI')).toBeInTheDocument()
  })
})
