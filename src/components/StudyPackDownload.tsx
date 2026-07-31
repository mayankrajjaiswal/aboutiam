import { useState } from 'react'
import { Package, Download, Loader2, FileText } from 'lucide-react'
import { buildStudyPackZipBlob, downloadBlob } from '../lib/studyPackExport'
import { buildFieldGuidePdfBlob } from '../lib/export/fieldGuidePdf'

export default function StudyPackDownload() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [isBuildingPdf, setIsBuildingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setError(null)
    setIsBuilding(true)
    try {
      const blob = await buildStudyPackZipBlob()
      downloadBlob(blob, 'aboutiam-study-pack.zip')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the study pack')
    } finally {
      setIsBuilding(false)
    }
  }

  const handleDownloadPdf = async () => {
    setError(null)
    setIsBuildingPdf(true)
    try {
      const blob = await buildFieldGuidePdfBlob()
      downloadBlob(blob, 'aboutiam-field-guide.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the field guide PDF')
    } finally {
      setIsBuildingPdf(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10 shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-text-primary">Offline Study Pack</h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Download the Encyclopedia, Standards, Architecture Center, and Developer Playbooks as a single Markdown
            bundle — great for offline review or feeding into your own notes app or AI tool. Or grab the same
            Encyclopedia/Standards/Cheat Sheets content as a polished, genuinely searchable-text PDF field guide for
            printing or reading offline. Both built entirely in your browser; nothing is uploaded anywhere.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isBuilding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Study Pack (.zip)
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isBuildingPdf}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isBuildingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Download IAM Field Guide (PDF)
        </button>
      </div>

      {error && <p className="text-[11px] text-status-danger">{error}</p>}
    </div>
  )
}
