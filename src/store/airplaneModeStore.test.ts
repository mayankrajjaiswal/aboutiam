import { describe, it, expect, beforeEach } from 'vitest'
import { useAirplaneModeStore } from './airplaneModeStore'

describe('useAirplaneModeStore (Zustand Resilience Engine)', () => {
  // Reset state before each test run
  beforeEach(() => {
    const state = useAirplaneModeStore.getState()
    state.setEnabled(false, false)
    state.setLatency(0)
    state.setPacketLoss(0)
  })

  it('should initialize with online and zero network penalties by default', () => {
    const state = useAirplaneModeStore.getState()
    expect(state.isEnabled).toBe(false)
    expect(state.isManual).toBe(false)
    expect(state.simulateLatency).toBe(0)
    expect(state.simulatePacketLoss).toBe(0)
  })

  it('should dynamically update airplane mode enabled and manual toggle indicators', () => {
    // Enable airplane mode manually
    useAirplaneModeStore.getState().setEnabled(true, true)
    expect(useAirplaneModeStore.getState().isEnabled).toBe(true)
    expect(useAirplaneModeStore.getState().isManual).toBe(true)

    // Disable airplane mode
    useAirplaneModeStore.getState().setEnabled(false, false)
    expect(useAirplaneModeStore.getState().isEnabled).toBe(false)
    expect(useAirplaneModeStore.getState().isManual).toBe(false)
  })

  it('should support modifying latency bounds surgically', () => {
    useAirplaneModeStore.getState().setLatency(500)
    expect(useAirplaneModeStore.getState().simulateLatency).toBe(500)

    useAirplaneModeStore.getState().setLatency(0)
    expect(useAirplaneModeStore.getState().simulateLatency).toBe(0)
  })

  it('should support modifying packet loss ratio percentages', () => {
    useAirplaneModeStore.getState().setPacketLoss(25)
    expect(useAirplaneModeStore.getState().simulatePacketLoss).toBe(25)

    useAirplaneModeStore.getState().setPacketLoss(0)
    expect(useAirplaneModeStore.getState().simulatePacketLoss).toBe(0)
  })
})
