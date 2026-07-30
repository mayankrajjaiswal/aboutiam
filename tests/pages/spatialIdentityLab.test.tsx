import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import SpatialIdentityLab from '../../src/pages/Playgrounds/SpatialIdentityLab'

describe('SpatialIdentityLab page', () => {
  it('renders the heading and a default matchup', () => {
    renderWithProviders(<SpatialIdentityLab />)
    expect(screen.getByRole('heading', { name: /avatar & spatial identity verification lab/i })).toBeInTheDocument()
  })

  it('running the default matchup (handoff vs no verification) shows a missed result', () => {
    renderWithProviders(<SpatialIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/risk missed/i)).toBeInTheDocument()
  })

  it('selecting continuous behavioral telemetry against handoff shows a caught result', () => {
    renderWithProviders(<SpatialIdentityLab />)
    fireEvent.change(screen.getByLabelText(/verification approach/i), { target: { value: 'continuous-behavioral' } })
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/risk caught/i)).toBeInTheDocument()
  })

  it('the same continuous behavioral defense fails against the motion-capture replay bot', () => {
    renderWithProviders(<SpatialIdentityLab />)
    fireEvent.change(screen.getByLabelText(/risk scenario/i), { target: { value: 'motion-capture-replay-bot' } })
    fireEvent.change(screen.getByLabelText(/verification approach/i), { target: { value: 'continuous-behavioral' } })
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/risk missed/i)).toBeInTheDocument()
  })

  it('wallet-based attestation alone never catches a risk', () => {
    renderWithProviders(<SpatialIdentityLab />)
    fireEvent.change(screen.getByLabelText(/verification approach/i), { target: { value: 'wallet-attestation' } })
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/risk missed/i)).toBeInTheDocument()
  })

  it('tracks the count of unique combinations explored', () => {
    renderWithProviders(<SpatialIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/combinations explored: 1/i)).toBeInTheDocument()
  })
})
