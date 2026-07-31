// @vitest-environment jsdom
// This module touches window/localStorage — genuinely browser-dependent, same
// per-file opt-in pattern as src/lib/googleDrive.test.ts (see vitest.config.ts's
// "unit" project comment).
import { describe, it, expect, beforeEach } from 'vitest'
import {
  collectProfileData,
  buildProfileBackup,
  buildProfileBackupBlob,
  buildProfileBackupFilename,
  parseProfileBackup,
  applyProfileBackup,
  PROFILE_BACKUP_SCHEMA_VERSION,
} from './profileBackup'
import { KNOWN_STORAGE_KEYS } from './knownStorageKeys'

beforeEach(() => {
  window.localStorage.clear()
})

describe('collectProfileData', () => {
  it('collects every known key present in localStorage', () => {
    window.localStorage.setItem('aboutiam-bookmarks', '{"a":1}')
    window.localStorage.setItem('aboutiam_labs_completed', '["lab-oauth"]')
    window.localStorage.setItem('some-other-app-key', 'should-not-be-collected')

    const data = collectProfileData()
    expect(data['aboutiam-bookmarks']).toBe('{"a":1}')
    expect(data['aboutiam_labs_completed']).toBe('["lab-oauth"]')
    expect(data['some-other-app-key']).toBeUndefined()
  })

  it('collects dynamic per-item feedback keys via the known prefix', () => {
    window.localStorage.setItem('aboutiam-feedback-term-oauth', 'helpful')
    window.localStorage.setItem('aboutiam-feedback-breach-solarwinds', 'flag')

    const data = collectProfileData()
    expect(data['aboutiam-feedback-term-oauth']).toBe('helpful')
    expect(data['aboutiam-feedback-breach-solarwinds']).toBe('flag')
  })
})

describe('round trip: export then import', () => {
  it('restores every known key exactly', () => {
    for (const key of KNOWN_STORAGE_KEYS) {
      window.localStorage.setItem(key, JSON.stringify({ seeded: key }))
    }
    window.localStorage.setItem('aboutiam-feedback-term-jwt', 'helpful')

    const backup = buildProfileBackup()
    expect(backup.schemaVersion).toBe(PROFILE_BACKUP_SCHEMA_VERSION)
    expect(typeof backup.exportedAt).toBe('string')

    window.localStorage.clear()
    applyProfileBackup(backup)

    for (const key of KNOWN_STORAGE_KEYS) {
      expect(window.localStorage.getItem(key)).toBe(JSON.stringify({ seeded: key }))
    }
    expect(window.localStorage.getItem('aboutiam-feedback-term-jwt')).toBe('helpful')
  })

  it('round-trips through the serialized JSON blob text', async () => {
    window.localStorage.setItem('aboutiam-theme-preference', '{"theme":"dark"}')
    const blob = buildProfileBackupBlob()
    const text = await blob.text()

    window.localStorage.clear()
    const parsed = parseProfileBackup(text)
    applyProfileBackup(parsed)

    expect(window.localStorage.getItem('aboutiam-theme-preference')).toBe('{"theme":"dark"}')
  })
})

describe('buildProfileBackupFilename', () => {
  it('embeds the ISO date', () => {
    expect(buildProfileBackupFilename(new Date('2026-07-31T12:00:00Z'))).toBe('aboutiam-profile-2026-07-31.json')
  })
})

describe('parseProfileBackup', () => {
  it('rejects malformed/non-JSON input with a clear error, not a crash', () => {
    expect(() => parseProfileBackup('not json at all {{{')).toThrow(/not valid JSON/)
  })

  it('rejects a well-formed JSON file with a missing/wrong schemaVersion', () => {
    expect(() => parseProfileBackup(JSON.stringify({ hello: 'world' }))).toThrow(/Unrecognized profile backup version/)
  })

  it('rejects a correct-version file whose data field is not an object', () => {
    const malformed = JSON.stringify({ schemaVersion: PROFILE_BACKUP_SCHEMA_VERSION, exportedAt: '2026-07-31T00:00:00.000Z', data: 'not-an-object' })
    expect(() => parseProfileBackup(malformed)).toThrow(/not a valid AboutIAM profile export/)
  })

  it('rejects an unrecognized schemaVersion rather than silently importing it', () => {
    const future = JSON.stringify({ schemaVersion: 999, exportedAt: '2030-01-01T00:00:00.000Z', data: {} })
    expect(() => parseProfileBackup(future)).toThrow(/Unrecognized profile backup version/)
  })

  it('accepts a well-formed current-version export', () => {
    const valid = JSON.stringify({ schemaVersion: PROFILE_BACKUP_SCHEMA_VERSION, exportedAt: '2026-07-31T00:00:00.000Z', data: { 'aboutiam-bookmarks': '{}' } })
    const parsed = parseProfileBackup(valid)
    expect(parsed.data['aboutiam-bookmarks']).toBe('{}')
  })
})

describe('applyProfileBackup', () => {
  it('only writes known keys, ignoring anything unexpected in the file', () => {
    applyProfileBackup({
      schemaVersion: PROFILE_BACKUP_SCHEMA_VERSION,
      exportedAt: '2026-07-31T00:00:00.000Z',
      data: { 'aboutiam-bookmarks': '{"x":1}', 'not-an-aboutiam-key': 'malicious' },
    })
    expect(window.localStorage.getItem('aboutiam-bookmarks')).toBe('{"x":1}')
    expect(window.localStorage.getItem('not-an-aboutiam-key')).toBeNull()
  })
})
