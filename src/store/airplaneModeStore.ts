import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AirplaneModeState {
  isEnabled: boolean
  isManual: boolean
  simulateLatency: number // Simulated network delay in milliseconds
  simulatePacketLoss: number // Simulated packet loss percentage (0 - 100)
  setEnabled: (value: boolean, manual?: boolean) => void
  setLatency: (ms: number) => void
  setPacketLoss: (percent: number) => void
}

export const useAirplaneModeStore = create<AirplaneModeState>()(
  persist(
    (set) => ({
      isEnabled: false,
      isManual: false,
      simulateLatency: 0,
      simulatePacketLoss: 0,
      setEnabled: (enabled, manual = true) => set({ isEnabled: enabled, isManual: manual }),
      setLatency: (ms) => set({ simulateLatency: ms }),
      setPacketLoss: (percent) => set({ simulatePacketLoss: percent }),
    }),
    {
      name: 'aboutiam-airplane-mode',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
    }
  )
)
