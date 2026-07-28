import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PasskeyRolloutStrategist from '../../src/pages/Playgrounds/PasskeyRolloutStrategist'

describe('PasskeyRolloutStrategist page', () => {
  it('renders the heading and a fully-allocated starting budget', () => {
    renderWithProviders(<PasskeyRolloutStrategist />)
    expect(screen.getByRole('heading', { name: /passkey fleet rollout strategist/i })).toBeInTheDocument()
    expect(screen.getByText(/100 \/ 100 points allocated/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /run annual simulation/i })).not.toBeDisabled()
  })

  it('disables the run button when the allocation does not sum to 100', () => {
    renderWithProviders(<PasskeyRolloutStrategist />)
    const sdkSlider = screen.getByLabelText(/platform sdk rollout/i)
    fireEvent.change(sdkSlider, { target: { value: '50' } })

    expect(screen.getByText(/125 \/ 100 points allocated/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /allocate exactly 100 points/i })).toBeDisabled()
  })

  it('runs a simulation and renders 4 quarterly outcome rows plus an end-of-year report', () => {
    renderWithProviders(<PasskeyRolloutStrategist />)
    fireEvent.click(screen.getByRole('button', { name: /run annual simulation/i }))

    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
    expect(screen.getByText('Q3')).toBeInTheDocument()
    expect(screen.getByText('Q4')).toBeInTheDocument()
    expect(screen.getByText(/End-of-Year Report Card/i)).toBeInTheDocument()
  })

  it('flags a support escalation when recovery investment is zeroed out', () => {
    renderWithProviders(<PasskeyRolloutStrategist />)

    // Zero out recovery investment and push the freed-up points into platform SDK
    fireEvent.change(screen.getByLabelText(/account recovery flow/i), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText(/platform sdk rollout/i), { target: { value: '50' } })

    fireEvent.click(screen.getByRole('button', { name: /run annual simulation/i }))

    expect(screen.getAllByText(/Yes/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/single most common real-world rollout mistake/i)).toBeInTheDocument()
  })

  it('resets the allocation and clears results on reset', () => {
    renderWithProviders(<PasskeyRolloutStrategist />)
    fireEvent.click(screen.getByRole('button', { name: /run annual simulation/i }))
    expect(screen.getByText(/End-of-Year Report Card/i)).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/End-of-Year Report Card/i)).not.toBeInTheDocument()
    expect(screen.getByText(/100 \/ 100 points allocated/i)).toBeInTheDocument()
  })
})
