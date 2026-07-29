import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import OtIcsIdentityLab from '../../src/pages/Playgrounds/OtIcsIdentityLab'

describe('OtIcsIdentityLab page', () => {
  it('renders the heading and defaults to Flat Network mode', () => {
    renderWithProviders(<OtIcsIdentityLab />)
    expect(screen.getByRole('heading', { name: /ot\/ics device identity & segmentation simulator/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Flat Network' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('triggering ransomware in flat mode reaches every node', () => {
    renderWithProviders(<OtIcsIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: /hmi — production line 1/i }))
    expect(screen.getAllByText(/lateral movement reached 8 of 8 nodes/i).length).toBeGreaterThan(0)
  })

  it('the same attack in microsegmentation mode reaches strictly fewer nodes', () => {
    renderWithProviders(<OtIcsIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Identity-Based Microsegmentation' }))
    fireEvent.click(screen.getByRole('button', { name: /hmi — production line 1/i }))
    expect(screen.getAllByText(/lateral movement reached 3 of 8 nodes/i).length).toBeGreaterThan(0)
  })
})
