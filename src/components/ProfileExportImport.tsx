import { useRef, useState } from 'react'
import { FileJson, Download, Upload, Loader2 } from 'lucide-react'
import { buildProfileBackup, buildProfileBackupBlob, buildProfileBackupFilename, parseProfileBackup, applyProfileBackup, reloadPage } from '../lib/backup/profileBackup'
import { downloadBlob } from '../lib/studyPackExport'

export default function ProfileExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingImport, setConfirmingImport] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const handleExport = () => {
    setError(null)
    const backup = buildProfileBackup()
    downloadBlob(buildProfileBackupBlob(backup), buildProfileBackupFilename())
  }

  const handleFileSelected = (file: File | null) => {
    if (!file) return
    setError(null)
    setPendingFile(file)
    setConfirmingImport(true)
  }

  const handleConfirmImport = async () => {
    if (!pendingFile) return
    setConfirmingImport(false)
    setIsImporting(true)
    setError(null)
    try {
      const text = await pendingFile.text()
      const backup = parseProfileBackup(text)
      applyProfileBackup(backup)
      reloadPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import this profile file')
      setIsImporting(false)
    } finally {
      setPendingFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCancelImport = () => {
    setConfirmingImport(false)
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div id="export-import-profile" className="rounded-2xl border border-border-subtle bg-bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0">
          <FileJson className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-text-primary">Export / Import My Profile</h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Bundle your Academy progress, playground completions, bookmarks, badges, and personalization into a
            single downloadable <code>.json</code> file — no account needed. Great for moving to another browser or
            device, or backing up before clearing cookies. This does not sync automatically — use the Google Drive
            Backup card above for that.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Profile
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Import Profile
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
        />
      </div>

      {confirmingImport && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-xs text-text-secondary">
          <span>This will overwrite your current progress on this device with the imported file. Continue?</span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-3 py-1 rounded-md bg-status-warning text-white font-bold cursor-pointer"
            >
              Confirm Import
            </button>
            <button
              type="button"
              onClick={handleCancelImport}
              className="px-3 py-1 rounded-md border border-border-subtle text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-status-danger">{error}</p>}
    </div>
  )
}
