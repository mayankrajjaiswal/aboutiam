import { useMemo, useState } from 'react'
import { AlertTriangle, Check, Copy } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { base64Decode } from '../../lib/tools/base64'
import { decodeJwt } from '../../lib/tools/jwt'

const tool = getToolBySlug('basic-auth-decoder')!

function parseHeader(raw: string) {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(Basic|Bearer)\s+(.+)$/i)
  const scheme = match ? match[1].toLowerCase() : (trimmed.split('.').length === 3 ? 'bearer' : 'basic')
  const value = match ? match[2].trim() : trimmed

  if (scheme === 'basic') {
    try {
      const decoded = base64Decode(value)
      const separatorIndex = decoded.indexOf(':')
      if (separatorIndex === -1) return { scheme: 'basic' as const, error: 'Decoded value has no ":" separating username and password.' }
      return {
        scheme: 'basic' as const,
        username: decoded.slice(0, separatorIndex),
        password: decoded.slice(separatorIndex + 1),
      }
    } catch {
      return { scheme: 'basic' as const, error: 'Could not Base64-decode this value.' }
    }
  }

  const decodedJwt = decodeJwt(value)
  if (decodedJwt.isStructurallyValid && decodedJwt.header) {
    return { scheme: 'bearer' as const, isJwt: true as const, decodedJwt, raw: value }
  }
  return { scheme: 'bearer' as const, isJwt: false as const, raw: value }
}

export default function BasicAuthDecoder() {
  const [input, setInput] = useState('Basic ZGVtby11c2VyOnN1cGVyLXNlY3JldC1kZW1vLXBhc3N3b3Jk')
  const { copy, copiedId } = useClipboardCopy()

  const result = useMemo(() => parseHeader(input), [input])

  return (
    <ToolPageShell tool={tool}>
      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Authorization Header (or just the value)</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Authorization header value"
          placeholder="Basic <base64> or Bearer <token>"
          className="w-full h-24 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
          spellCheck={false}
        />
      </div>

      <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 flex gap-3 items-start">
        <AlertTriangle className="w-4.5 h-4.5 text-status-warning shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed font-medium">
          If this is a real password or token from a live system, rotate it after debugging — treat anything pasted into any online tool as potentially compromised.
        </p>
      </div>

      {result.scheme === 'basic' ? (
        result.error ? (
          <p className="text-sm text-status-danger font-semibold">{result.error}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldCard label="Username" value={result.username ?? ''} onCopy={() => copy(result.username ?? '', 'user')} copied={copiedId === 'user'} />
            <FieldCard label="Password" value={result.password ?? ''} onCopy={() => copy(result.password ?? '', 'pass')} copied={copiedId === 'pass'} />
          </div>
        )
      ) : result.isJwt ? (
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">This Bearer token is structurally a JWT — decoded below.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldCard label="Header" value={JSON.stringify(result.decodedJwt.header, null, 2)} onCopy={() => copy(JSON.stringify(result.decodedJwt.header), 'jwth')} copied={copiedId === 'jwth'} mono />
            <FieldCard label="Payload" value={JSON.stringify(result.decodedJwt.payload, null, 2)} onCopy={() => copy(JSON.stringify(result.decodedJwt.payload), 'jwtp')} copied={copiedId === 'jwtp'} mono />
          </div>
        </div>
      ) : (
        <FieldCard label="Bearer Token (opaque)" value={result.raw} onCopy={() => copy(result.raw, 'opaque')} copied={copiedId === 'opaque'} />
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function FieldCard({ label, value, onCopy, copied, mono }: { label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean }) {
  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="text-text-muted hover:text-text-primary">
          {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className={`text-xs text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto ${mono ? 'font-mono whitespace-pre-wrap' : 'font-mono'}`}>
        {value || '…'}
      </p>
    </div>
  )
}
