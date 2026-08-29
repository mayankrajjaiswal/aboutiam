import { type StateStorage } from 'zustand/middleware'

export interface TelemetryErrorEvent {
  storeName: string
  errorName: string
  errorMessage: string
  timestamp: string
}

const telemetryLog: TelemetryErrorEvent[] = []

export function logStoreHydrationError(storeName: string, error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error))
  const event: TelemetryErrorEvent = {
    storeName,
    errorName: err.name,
    errorMessage: err.message,
    timestamp: new Date().toISOString()
  }
  telemetryLog.push(event)
  console.warn(`[Zustand Telemetry] [Store: ${storeName}] Hydration/Persistence Error:`, err)
}

export function getTelemetryLogs(): TelemetryErrorEvent[] {
  return [...telemetryLog]
}

export function clearTelemetryLogs() {
  telemetryLog.length = 0
}

export function createTelemetryStorage(storeName: string, baseStorage: StateStorage): StateStorage {
  return {
    getItem: (name: string) => {
      try {
        return baseStorage.getItem(name)
      } catch (error) {
        logStoreHydrationError(storeName, error)
        return null
      }
    },
    setItem: (name: string, value: string) => {
      try {
        baseStorage.setItem(name, value)
      } catch (error) {
        logStoreHydrationError(storeName, error)
      }
    },
    removeItem: (name: string) => {
      try {
        baseStorage.removeItem(name)
      } catch (error) {
        logStoreHydrationError(storeName, error)
      }
    }
  }
}
