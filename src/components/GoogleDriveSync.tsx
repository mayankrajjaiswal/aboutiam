import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cloud, UploadCloud, DownloadCloud, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import {
  getGoogleClientId,
  requestAccessToken,
  collectLocalBackupPayload,
  applyRestoredPayload,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  reloadPage,
} from '../lib/googleDrive'
import { useGoogleDriveSyncStore } from '../store/googleDriveSyncStore'

type SyncStatus = 'idle' | 'backing-up' | 'restoring'

export default function GoogleDriveSync() {
  const clientId = getGoogleClientId()
  const lastBackupAt = useGoogleDriveSyncStore((s) => s.lastBackupAt)
  const setLastBackupAt = useGoogleDriveSyncStore((s) => s.setLastBackupAt)

  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [confirmingRestore, setConfirmingRestore] = useState(false)
  const [restoreResult, setRestoreResult] = useState<'none-found' | null>(null)

  const handleBackup = async () => {
    if (!clientId) return
    setError(null)
    setStatus('backing-up')
    try {
      const token = await requestAccessToken(clientId)
      const payload = collectLocalBackupPayload()
      await uploadBackupToDrive(token, payload)
      setLastBackupAt(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed')
    } finally {
      setStatus('idle')
    }
  }

  const handleRestore = async () => {
    if (!clientId) return
    setConfirmingRestore(false)
    setError(null)
    setRestoreResult(null)
    setStatus('restoring')
    try {
      const token = await requestAccessToken(clientId)
      const payload = await downloadBackupFromDrive(token)
      if (!payload) {
        setRestoreResult('none-found')
        setStatus('idle')
        return
      }
      applyRestoredPayload(payload)
      reloadPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed')
      setStatus('idle')
    }
  }

  const isBusy = status !== 'idle'

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-text-primary">Backup & Restore</h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Your Academy progress, bookmarks, and badges live only in this browser. Optionally back them up to a
            hidden folder in your own Google Drive — AboutIAM's server never sees this data; the sync happens
            directly between your browser and Google.{' '}
            <Link to="/terms#cloud-sync-privacy" className="text-accent-primary hover:text-accent-hover underline font-semibold">
              Read the privacy details
            </Link>
            .
          </p>
        </div>
      </div>

      {!clientId ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-muted">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Cloud backup isn't configured for this deployment yet — check back soon.</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBackup}
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              {status === 'backing-up' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Back Up to Google Drive
            </button>
            <button
              type="button"
              onClick={() => setConfirmingRestore(true)}
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              {status === 'restoring' ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
              Restore from Google Drive
            </button>
          </div>

          {confirmingRestore && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-xs text-text-secondary">
              <span>This will overwrite your current progress on this device with your last backup. Continue?</span>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleRestore}
                  className="px-3 py-1 rounded-md bg-status-warning text-white font-bold cursor-pointer"
                >
                  Confirm Restore
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRestore(false)}
                  className="px-3 py-1 rounded-md border border-border-subtle text-text-secondary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {lastBackupAt && (
            <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
              Last backed up {new Date(lastBackupAt).toLocaleString()}
            </p>
          )}
          {restoreResult === 'none-found' && (
            <p className="text-[11px] text-text-muted">No backup was found in your Google Drive yet.</p>
          )}
          {error && <p className="text-[11px] text-status-danger">{error}</p>}
        </div>
      )}
    </div>
  )
}
