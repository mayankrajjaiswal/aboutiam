import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { base64Decode, base64Encode, base64UrlDecode, base64UrlEncode, bytesToBase64 } from '../../lib/tools/base64'

const tool = getToolBySlug('base64-encoder-decoder')!

type Mode = 'encode' | 'decode'
type Variant = 'standard' | 'urlsafe'

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState<Mode>('encode')
  const [variant, setVariant] = useState<Variant>('standard')
  const [input, setInput] = useState('Hello, AboutIAM!')
  const [fileResult, setFileResult] = useState<{ name: string; base64: string } | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  const output = useMemo(() => {
    try {
      if (mode === 'encode') {
        return variant === 'standard' ? base64Encode(input) : base64UrlEncode(input)
      }
      return variant === 'standard' ? base64Decode(input) : base64UrlDecode(input)
    } catch {
      return mode === 'decode' ? 'Could not decode — check the input is valid Base64.' : ''
    }
  }, [mode, variant, input])

  return (
    <ToolPageShell tool={tool}>
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
          {(['encode', 'decode'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${mode === m ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
          {(['standard', 'urlsafe'] as Variant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${variant === v ? 'bg-accent-secondary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
            >
              {v === 'standard' ? 'Standard' : 'URL-Safe'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{mode === 'encode' ? 'Plain Text' : 'Base64 Input'}</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
            placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste Base64 or Base64URL text…'}
            className="w-full h-48 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
        </div>

        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            <button
              type="button"
              onClick={() => copy(output, 'output')}
              aria-label="Copy output"
              className="text-text-muted hover:text-text-primary"
            >
              {copiedId === 'output' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="w-full h-48 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono border border-border-subtle overflow-y-auto break-all whitespace-pre-wrap">
            {output}
          </p>
        </div>
      </div>

      {mode === 'encode' && (
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Or Base64-Encode a File</span>
          <FileDropInput
            accept="*"
            onFile={(file, bytes) => setFileResult({ name: file.name, base64: bytesToBase64(new Uint8Array(bytes)) })}
          />
          {fileResult && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-text-secondary">{fileResult.name}</span>
                <button
                  type="button"
                  onClick={() => copy(fileResult.base64, 'file')}
                  aria-label="Copy file Base64"
                  className="text-text-muted hover:text-text-primary"
                >
                  {copiedId === 'file' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-32 overflow-y-auto">
                {fileResult.base64}
              </p>
            </div>
          )}
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
