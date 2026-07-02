import { useEffect, useState } from 'react'
import { AlertOctagon, Check, CheckCircle2, Copy } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import type { HashAlgorithm } from '../../lib/tools/hash'
import { HASH_ALGORITHMS } from '../../lib/tools/hash'
import { bytesToBase64 } from '../../lib/tools/base64'
import { hmacSign, hmacSignHex, timingSafeEqualHex } from '../../lib/tools/hmac'

const tool = getToolBySlug('hmac-generator')!

export default function HmacGenerator() {
  const [message, setMessage] = useState('Hello, AboutIAM!')
  const [key, setKey] = useState('shared-secret-key')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hex, setHex] = useState('')
  const [base64, setBase64] = useState('')
  const [compareValue, setCompareValue] = useState('')
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const bytes = await hmacSign(algorithm, key, message)
      if (!cancelled) {
        setHex(await hmacSignHex(algorithm, key, message))
        setBase64(bytesToBase64(bytes))
      }
    }
    run()
    return () => { cancelled = true }
  }, [algorithm, key, message])

  const matches = compareValue.trim() !== '' && timingSafeEqualHex(compareValue, hex)

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <label htmlFor="hmac-alg" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Algorithm</label>
          <select
            id="hmac-alg"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
            className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-bold text-sm focus:outline-none focus:border-accent-primary"
          >
            {HASH_ALGORITHMS.map((alg) => <option key={alg} value={alg}>{alg}</option>)}
          </select>

          <label htmlFor="hmac-key" className="block text-xs font-bold text-text-secondary uppercase tracking-wider pt-2">Secret Key</label>
          <input
            id="hmac-key"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
          />

          <label htmlFor="hmac-message" className="block text-xs font-bold text-text-secondary uppercase tracking-wider pt-2">Message</label>
          <textarea
            id="hmac-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-28 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <ResultCard label="Hex" value={hex} onCopy={() => copy(hex, 'hex')} copied={copiedId === 'hex'} />
          <ResultCard label="Base64" value={base64} onCopy={() => copy(base64, 'base64')} copied={copiedId === 'base64'} />

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <label htmlFor="hmac-compare" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Verify Against an Existing HMAC (hex)</label>
            <input
              id="hmac-compare"
              type="text"
              value={compareValue}
              onChange={(e) => setCompareValue(e.target.value)}
              placeholder="Paste a hex-encoded HMAC to compare…"
              className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
            />
            {compareValue.trim() !== '' && (
              matches ? (
                <p className="text-[11px] text-status-success font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Matches — the message, key, and algorithm all agree.</p>
              ) : (
                <p className="text-[11px] text-status-danger font-bold flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> Does not match.</p>
              )
            )}
          </div>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function ResultCard({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="text-text-muted hover:text-text-primary">
          {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">{value || '…'}</p>
    </div>
  )
}
