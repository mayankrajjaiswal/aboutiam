import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { FileWarning, UploadCloud } from 'lucide-react'

// Soft cap purely for UI responsiveness on low-end/mobile devices — not a
// security boundary, since the file is never uploaded anywhere either way.
const MAX_BYTES = 10 * 1024 * 1024

interface FileDropInputProps {
  onFile: (file: File, bytes: ArrayBuffer) => void
  accept?: string
  hint?: string
}

export default function FileDropInput({ onFile, accept, hint }: FileDropInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      setError(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — please choose a file under 10 MB for smooth in-browser processing.`)
      return
    }
    setError(null)
    setFileName(file.name)
    const bytes = await file.arrayBuffer()
    onFile(file, bytes)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors focus:outline-none focus:border-accent-primary ${
          isDragging ? 'border-accent-primary bg-accent-glow' : 'border-border-subtle hover:border-accent-primary/50'
        }`}
      >
        <UploadCloud className="w-6 h-6 mx-auto text-text-muted mb-2" />
        <p className="text-xs font-semibold text-text-primary">
          {fileName ?? 'Drag & drop a file here, or click to browse'}
        </p>
        <p className="text-[10px] text-text-muted mt-1">{hint ?? 'Processed entirely in your browser — never uploaded.'}</p>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>
      {error && (
        <p className="text-[11px] text-status-danger font-semibold flex items-center gap-1.5">
          <FileWarning className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}
