import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import LivenessInjectionLab from '../../src/pages/Playgrounds/LivenessInjectionLab'

describe('LivenessInjectionLab page', () => {
  it('renders the heading and a default matchup', () => {
    renderWithProviders(<LivenessInjectionLab />)
    expect(screen.getByRole('heading', { name: /liveness detection & injection attack lab/i })).toBeInTheDocument()
  })

  it('running the default matchup (replay vs static-photo) shows a bypassed result', () => {
    renderWithProviders(<LivenessInjectionLab />)
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/attack bypassed defense/i)).toBeInTheDocument()
  })

  it('selecting the flash-challenge defense against replay shows a blocked result', () => {
    renderWithProviders(<LivenessInjectionLab />)
    fireEvent.change(screen.getByLabelText(/defense stack/i), { target: { value: 'flash-challenge' } })
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/attack blocked/i)).toBeInTheDocument()
  })

  it('the same flash-challenge defense fails against camera-feed injection', () => {
    renderWithProviders(<LivenessInjectionLab />)
    fireEvent.change(screen.getByLabelText(/attack vector/i), { target: { value: 'camera-injection' } })
    fireEvent.change(screen.getByLabelText(/defense stack/i), { target: { value: 'flash-challenge' } })
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/attack bypassed defense/i)).toBeInTheDocument()
  })

  it('tracks the count of unique combinations explored', () => {
    renderWithProviders(<LivenessInjectionLab />)
    fireEvent.click(screen.getByRole('button', { name: /run matchup/i }))
    expect(screen.getByText(/combinations explored: 1/i)).toBeInTheDocument()
  })
})
