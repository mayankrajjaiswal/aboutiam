import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'
import AirplaneSelector from './AirplaneSelector'

describe('AirplaneSelector', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<AirplaneSelector isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows ONLINE by default and toggles the shared airplaneModeStore on click', () => {
    renderWithProviders(<AirplaneSelector isOpen onClose={() => {}} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(useAirplaneModeStore.getState().isEnabled).toBe(true)
  })

  it('labels latency presets correctly across the range', () => {
    renderWithProviders(<AirplaneSelector isOpen onClose={() => {}} />)
    const [latencySlider] = screen.getAllByRole('slider')

    fireEvent.change(latencySlider, { target: { value: '150' } })
    expect(useAirplaneModeStore.getState().simulateLatency).toBe(150)
    expect(screen.getByText('150ms (4G/5G mobile)')).toBeInTheDocument()

    fireEvent.change(latencySlider, { target: { value: '500' } })
    expect(screen.getByText('500ms (Broadband Jitter)')).toBeInTheDocument()

    fireEvent.change(latencySlider, { target: { value: '1500' } })
    expect(screen.getByText('1500ms (Satellite / VPN)')).toBeInTheDocument()

    fireEvent.change(latencySlider, { target: { value: '0' } })
    expect(screen.getByText('Instant (Local)')).toBeInTheDocument()
  })

  it('updates simulated packet loss', () => {
    renderWithProviders(<AirplaneSelector isOpen onClose={() => {}} />)
    const [, lossSlider] = screen.getAllByRole('slider')
    fireEvent.change(lossSlider, { target: { value: '25' } })
    expect(useAirplaneModeStore.getState().simulatePacketLoss).toBe(25)
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('calls onClose on an outside click', () => {
    const onClose = vi.fn()
    renderWithProviders(
      <div>
        <div data-testid="outside">outside</div>
        <AirplaneSelector isOpen onClose={onClose} />
      </div>
    )
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onClose).toHaveBeenCalled()
  })
})
