import { describe, it, expect, beforeEach } from 'vitest'
import { logStoreHydrationError, getTelemetryLogs, clearTelemetryLogs, createTelemetryStorage } from './zustandTelemetry'

describe('Zustand Telemetry Logs', () => {
  beforeEach(() => {
    clearTelemetryLogs()
  })

  it('should capture hydration error events and register them in the registry log', () => {
    expect(getTelemetryLogs()).toHaveLength(0)

    logStoreHydrationError('themeStore', new Error('QuotaExceededError: localStorage full'))

    const logs = getTelemetryLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].storeName).toBe('themeStore')
    expect(logs[0].errorName).toBe('Error')
    expect(logs[0].errorMessage).toContain('QuotaExceededError')
  })

  it('should wrap a base storage engine and catch thrown exceptions gracefully', () => {
    const mockStorage = {
      getItem: () => { throw new Error('Mock Storage Read Fail') },
      setItem: () => { throw new Error('Mock Storage Write Fail') },
      removeItem: () => { throw new Error('Mock Storage Remove Fail') }
    }

    const telemetryStorage = createTelemetryStorage('mockStore', mockStorage)

    const value = telemetryStorage.getItem('foo')
    expect(value).toBeNull()
    expect(getTelemetryLogs()).toHaveLength(1)
    expect(getTelemetryLogs()[0].errorMessage).toBe('Mock Storage Read Fail')

    telemetryStorage.setItem('foo', 'bar')
    expect(getTelemetryLogs()).toHaveLength(2)

    telemetryStorage.removeItem('foo')
    expect(getTelemetryLogs()).toHaveLength(3)
  })
})
