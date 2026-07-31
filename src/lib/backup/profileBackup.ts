import { isKnownStorageKey } from './knownStorageKeys'

export const PROFILE_BACKUP_SCHEMA_VERSION = 1

export interface ProfileBackup {
  schemaVersion: number
  exportedAt: string
  data: Record<string, string>
}

/** Every known AboutIAM localStorage entry present right now (see knownStorageKeys.ts). */
export function collectProfileData(): Record<string, string> {
  const data: Record<string, string> = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key || !isKnownStorageKey(key)) continue
    const value = window.localStorage.getItem(key)
    if (value !== null) data[key] = value
  }
  return data
}

/** Builds the full exportable payload: current data plus a schema version and timestamp. */
export function buildProfileBackup(): ProfileBackup {
  return {
    schemaVersion: PROFILE_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: collectProfileData(),
  }
}

/** Serializes a backup into a downloadable JSON Blob. */
export function buildProfileBackupBlob(backup: ProfileBackup = buildProfileBackup()): Blob {
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
}

/** Builds a timestamped filename, e.g. `aboutiam-profile-2026-07-31.json`. */
export function buildProfileBackupFilename(date: Date = new Date()): string {
  return `aboutiam-profile-${date.toISOString().slice(0, 10)}.json`
}

/**
 * Parses and validates a raw backup file's text contents. Throws a clear,
 * user-facing Error rather than letting a malformed/non-JSON file crash the
 * import flow, and rejects an unrecognized `schemaVersion` rather than
 * silently writing data this version of the app doesn't understand.
 */
export function parseProfileBackup(text: string): ProfileBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON — it may be corrupted or not an AboutIAM profile export.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('This file is not a valid AboutIAM profile export.')
  }

  const candidate = parsed as Partial<ProfileBackup>
  if (candidate.schemaVersion !== PROFILE_BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Unrecognized profile backup version (${String(candidate.schemaVersion ?? 'missing')}) — this file was likely exported by an incompatible version of AboutIAM.`
    )
  }
  if (typeof candidate.data !== 'object' || candidate.data === null || Array.isArray(candidate.data)) {
    throw new Error('This file is not a valid AboutIAM profile export.')
  }

  return { schemaVersion: candidate.schemaVersion, exportedAt: String(candidate.exportedAt ?? ''), data: candidate.data as Record<string, string> }
}

/** Writes a validated backup's data back into localStorage. Only known keys are honored, even on a well-formed file. */
export function applyProfileBackup(backup: ProfileBackup): void {
  for (const [key, value] of Object.entries(backup.data)) {
    if (isKnownStorageKey(key)) {
      window.localStorage.setItem(key, value)
    }
  }
}

/** Zustand stores only rehydrate from localStorage on creation, so a full reload is required after import. */
export function reloadPage(): void {
  window.location.reload()
}
