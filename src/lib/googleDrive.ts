// Optional Google Drive backup/restore for locally-persisted progress
// (Academy completion, bookmarks, badges, personalization, etc). Every
// AboutIAM Zustand `persist` store is namespaced "aboutiam-*" in
// localStorage — that shared prefix is the entire sync contract, so a
// newly added store is automatically included without touching this file.
//
// Privacy: uses the least-privileged `drive.appdata` scope (a hidden,
// per-app folder the user can't browse in their normal Drive UI), talks
// directly to Google's APIs from the browser (no AboutIAM server involved),
// and never persists the access token — it lives only in React state for
// the duration of one backup/restore action.

export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const BACKUP_FILE_NAME = 'aboutiam-backup.json'
const BACKUP_KEY_PREFIX = 'aboutiam-'

interface GoogleTokenResponse {
  access_token?: string
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
          }) => GoogleTokenClient
        }
      }
    }
  }
}

/** Reads the configured OAuth client id, or null if Drive sync hasn't been set up for this deployment. */
export function getGoogleClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return typeof id === 'string' && id.length > 0 ? id : null
}

let gisLoadPromise: Promise<void> | null = null

/** Injects the Google Identity Services script exactly once and resolves once it's ready. */
export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity Services requires a browser environment'))
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisLoadPromise) return gisLoadPromise

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      gisLoadPromise = null
      reject(new Error('Failed to load Google Identity Services'))
    }
    document.head.appendChild(script)
  })
  return gisLoadPromise
}

/** Opens the Google consent popup and resolves with a short-lived access token. */
export async function requestAccessToken(clientId: string, scope: string = DRIVE_APPDATA_SCOPE): Promise<string> {
  await loadGoogleIdentityServices()
  if (!window.google) throw new Error('Google Identity Services unavailable')

  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'Google authorization failed'))
          return
        }
        resolve(response.access_token)
      },
    })
    client.requestAccessToken()
  })
}

/** Every AboutIAM-namespaced localStorage entry, ready to serialize as a backup. */
export function collectLocalBackupPayload(): Record<string, string> {
  const payload: Record<string, string> = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key || !key.startsWith(BACKUP_KEY_PREFIX)) continue
    const value = window.localStorage.getItem(key)
    if (value !== null) payload[key] = value
  }
  return payload
}

/** Writes a restored payload back into localStorage. Only AboutIAM-namespaced keys are honored. */
export function applyRestoredPayload(payload: Record<string, string>): void {
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith(BACKUP_KEY_PREFIX)) {
      window.localStorage.setItem(key, value)
    }
  }
}

async function findBackupFile(accessToken: string): Promise<{ id: string } | null> {
  const query = encodeURIComponent(`name='${BACKUP_FILE_NAME}'`)
  const fields = encodeURIComponent('files(id)')
  const res = await fetch(`${DRIVE_FILES_URL}?spaces=appDataFolder&q=${query}&fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google Drive lookup failed (${res.status})`)
  const data = await res.json()
  return data.files?.[0] ?? null
}

/** Creates or overwrites the single hidden backup file in the user's Drive `appDataFolder`. */
export async function uploadBackupToDrive(accessToken: string, payload: Record<string, string>): Promise<void> {
  const existing = await findBackupFile(accessToken)
  const body = JSON.stringify(payload)

  if (existing) {
    const res = await fetch(`${DRIVE_UPLOAD_URL}/${existing.id}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body,
    })
    if (!res.ok) throw new Error(`Google Drive upload failed (${res.status})`)
    return
  }

  const boundary = 'aboutiam-backup-boundary'
  const metadata = { name: BACKUP_FILE_NAME, parents: ['appDataFolder'] }
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n${body}\r\n` +
    `--${boundary}--`

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipartBody,
  })
  if (!res.ok) throw new Error(`Google Drive upload failed (${res.status})`)
}

/** Reads the backup file back, or null if none has been created yet. */
export async function downloadBackupFromDrive(accessToken: string): Promise<Record<string, string> | null> {
  const existing = await findBackupFile(accessToken)
  if (!existing) return null
  const res = await fetch(`${DRIVE_FILES_URL}/${existing.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google Drive download failed (${res.status})`)
  return res.json()
}

/** Restored Zustand stores only rehydrate from localStorage on creation, so a full reload is required to pick up restored data. Wrapped for testability. */
export function reloadPage(): void {
  window.location.reload()
}
