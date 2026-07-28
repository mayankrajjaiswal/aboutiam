import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGoogleDriveSyncStore } from './googleDriveSyncStore'

describe('useGoogleDriveSyncStore', () => {
  beforeEach(() => {
    useGoogleDriveSyncStore.setState({ lastBackupAt: null })
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('initializes with no recorded backup', () => {
    expect(useGoogleDriveSyncStore.getState().lastBackupAt).toBeNull()
  })

  it('records the last backup timestamp', () => {
    useGoogleDriveSyncStore.getState().setLastBackupAt('2026-07-28T12:00:00.000Z')
    expect(useGoogleDriveSyncStore.getState().lastBackupAt).toBe('2026-07-28T12:00:00.000Z')
  })
})
