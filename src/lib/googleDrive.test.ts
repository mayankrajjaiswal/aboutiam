// @vitest-environment jsdom
// This module touches window/document/localStorage/fetch — genuinely
// browser-dependent, unlike the rest of src/lib which is pure/SSR-safe logic
// (see vitest.config.ts's "unit" project comment) — so it opts into jsdom
// per-file rather than moving the whole "unit" project off node.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getGoogleClientId,
  requestAccessToken,
  collectLocalBackupPayload,
  applyRestoredPayload,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  reloadPage,
  DRIVE_APPDATA_SCOPE,
} from './googleDrive'

describe('getGoogleClientId', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns null when VITE_GOOGLE_CLIENT_ID is not configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    expect(getGoogleClientId()).toBeNull()
  })

  it('returns the configured client id', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id.apps.googleusercontent.com')
    expect(getGoogleClientId()).toBe('test-client-id.apps.googleusercontent.com')
  })
})

describe('requestAccessToken', () => {
  afterEach(() => {
    delete window.google
  })

  it('resolves with the access token when the token client succeeds', async () => {
    const requestAccessTokenMock = vi.fn()
    const initTokenClient = vi.fn((config: { callback: (r: { access_token?: string; error?: string }) => void }) => {
      requestAccessTokenMock.mockImplementation(() => config.callback({ access_token: 'fake-token' }))
      return { requestAccessToken: requestAccessTokenMock }
    })
    window.google = { accounts: { oauth2: { initTokenClient } } }

    const token = await requestAccessToken('client-id')
    expect(token).toBe('fake-token')
    expect(initTokenClient).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-id', scope: DRIVE_APPDATA_SCOPE })
    )
  })

  it('rejects when the token client reports an error', async () => {
    const initTokenClient = vi.fn((config: { callback: (r: { access_token?: string; error?: string }) => void }) => ({
      requestAccessToken: () => config.callback({ error: 'access_denied' }),
    }))
    window.google = { accounts: { oauth2: { initTokenClient } } }

    await expect(requestAccessToken('client-id')).rejects.toThrow('access_denied')
  })
})

describe('collectLocalBackupPayload / applyRestoredPayload', () => {
  beforeEach(() => window.localStorage.clear())

  it('only collects AboutIAM-namespaced localStorage keys', () => {
    window.localStorage.setItem('aboutiam-bookmarks', '{"a":1}')
    window.localStorage.setItem('aboutiam-guided-tour', '{"hasSeenTour":true}')
    window.localStorage.setItem('some-other-app-key', 'should-not-be-collected')

    const payload = collectLocalBackupPayload()
    expect(payload).toEqual({
      'aboutiam-bookmarks': '{"a":1}',
      'aboutiam-guided-tour': '{"hasSeenTour":true}',
    })
  })

  it('restores only AboutIAM-namespaced keys and leaves everything else untouched', () => {
    window.localStorage.setItem('some-other-app-key', 'untouched')

    applyRestoredPayload({
      'aboutiam-bookmarks': '{"restored":true}',
      'not-aboutiam-key': 'should-be-ignored',
    })

    expect(window.localStorage.getItem('aboutiam-bookmarks')).toBe('{"restored":true}')
    expect(window.localStorage.getItem('not-aboutiam-key')).toBeNull()
    expect(window.localStorage.getItem('some-other-app-key')).toBe('untouched')
  })
})

describe('uploadBackupToDrive / downloadBackupFromDrive', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('creates a new backup file via multipart upload when none exists yet', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) }) // lookup
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // create
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await uploadBackupToDrive('token-123', { 'aboutiam-bookmarks': '{}' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const createCall = fetchMock.mock.calls[1]
    expect(createCall[0]).toContain('uploadType=multipart')
    expect(createCall[1].method).toBe('POST')
  })

  it('overwrites the existing backup file via a media PATCH when one is found', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'existing-file-id' }] }) }) // lookup
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // patch
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await uploadBackupToDrive('token-123', { 'aboutiam-bookmarks': '{}' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const patchCall = fetchMock.mock.calls[1]
    expect(patchCall[0]).toBe('https://www.googleapis.com/upload/drive/v3/files/existing-file-id?uploadType=media')
    expect(patchCall[1].method).toBe('PATCH')
  })

  it('throws a descriptive error when the Drive lookup fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }) as unknown as typeof fetch
    await expect(uploadBackupToDrive('token-123', {})).rejects.toThrow('403')
  })

  it('returns null from downloadBackupFromDrive when no backup file exists', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) }) as unknown as typeof fetch
    const result = await downloadBackupFromDrive('token-123')
    expect(result).toBeNull()
  })

  it('returns the parsed payload from downloadBackupFromDrive when a backup exists', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'file-1' }] }) }) // lookup
      .mockResolvedValueOnce({ ok: true, json: async () => ({ 'aboutiam-bookmarks': '{"x":1}' }) }) // media
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await downloadBackupFromDrive('token-123')
    expect(result).toEqual({ 'aboutiam-bookmarks': '{"x":1}' })
    expect(fetchMock.mock.calls[1][0]).toBe('https://www.googleapis.com/drive/v3/files/file-1?alt=media')
  })
})

describe('reloadPage', () => {
  it('calls window.location.reload', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    })

    reloadPage()
    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })
})
