import { useEffect, useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { HASH_ALGORITHMS, bytesToHex, digest, digestText } from '../../lib/tools/hash'
import type { HashAlgorithm } from '../../lib/tools/hash'

const tool = getToolBySlug('sha256-hash-generator')!

export default function Sha256HashGenerator() {
  const [text, setText] = useState('AboutIAM')
  const [textHashes, setTextHashes] = useState<Record<HashAlgorithm, string>>({} as Record<HashAlgorithm, string>)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileHashes, setFileHashes] = useState<Record<HashAlgorithm, string> | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const entries = await Promise.all(HASH_ALGORITHMS.map(async (alg) => [alg, bytesToHex(await digestText(alg, text))] as const))
      if (!cancelled) setTextHashes(Object.fromEntries(entries) as Record<HashAlgorithm, string>)
    }
    run()
    return () => { cancelled = true }
  }, [text])

  const handleFile = async (file: File, bytes: ArrayBuffer) => {
    setFileName(file.name)
    const entries = await Promise.all(HASH_ALGORITHMS.map(async (alg) => [alg, bytesToHex(await digest(alg, bytes))] as const))
    setFileHashes(Object.fromEntries(entries) as Record<HashAlgorithm, string>)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Text Input</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Text to hash"
          placeholder="Type or paste text to hash…"
          className="w-full h-28 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
          spellCheck={false}
        />
      </div>

      <HashResultGrid hashes={textHashes} copy={copy} copiedId={copiedId} idPrefix="text" />

      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Or Hash a File</span>
        <FileDropInput accept="*" onFile={handleFile} />
        {fileName && <p className="text-[11px] font-semibold text-text-secondary">{fileName}</p>}
      </div>

      {fileHashes && <HashResultGrid hashes={fileHashes} copy={copy} copiedId={copiedId} idPrefix="file" />}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function HashResultGrid({
  hashes,
  copy,
  copiedId,
  idPrefix,
}: {
  hashes: Partial<Record<HashAlgorithm, string>>
  copy: (text: string, id: string) => void
  copiedId: string | null
  idPrefix: string
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {HASH_ALGORITHMS.map((alg) => {
        const id = `${idPrefix}-${alg}`
        return (
          <div key={alg} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                {alg}
                {alg === 'SHA-1' && (
                  <span title="Legacy — cryptographically broken for security purposes, kept only for checksum compatibility.">
                    <TriangleAlert className="w-3.5 h-3.5 text-status-warning" />
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => copy(hashes[alg] ?? '', id)}
                aria-label={`Copy ${alg} hash`}
                className="text-text-muted hover:text-text-primary"
              >
                {copiedId === id ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">
              {hashes[alg] ?? '…'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
