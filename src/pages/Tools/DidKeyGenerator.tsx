import { useEffect, useState } from 'react'
import { Check, Copy, RefreshCw, ShieldAlert, TriangleAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { bytesToHex } from '../../lib/tools/hash'
import {
  buildDidDocument, encodeDidKey, exportRawPublicKey, generateEd25519KeyPair, isEd25519Supported,
} from '../../lib/tools/didKey'
import type { DidDocument } from '../../lib/tools/didKey'

const tool = getToolBySlug('did-key-generator')!

export default function DidKeyGenerator() {
  const [supportChecked, setSupportChecked] = useState(false)
  const [supported, setSupported] = useState(false)
  const [did, setDid] = useState<string | null>(null)
  const [didDoc, setDidDoc] = useState<DidDocument | null>(null)
  const [publicKeyHex, setPublicKeyHex] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const { copy, copiedId } = useClipboardCopy()

  const generate = async () => {
    setGenerating(true)
    try {
      const { publicKey } = await generateEd25519KeyPair()
      const raw = await exportRawPublicKey(publicKey)
      const newDid = encodeDidKey(raw)
      setDid(newDid)
      setDidDoc(buildDidDocument(newDid))
      setPublicKeyHex(bytesToHex(raw))
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    isEd25519Supported().then((ok) => {
      if (cancelled) return
      setSupported(ok)
      setSupportChecked(true)
      if (ok) generate()
    })
    return () => { cancelled = true }
  }, [])

  return (
    <ToolPageShell tool={tool}>
      {!supportChecked ? (
        <p className="text-sm text-text-muted">Checking Ed25519 support…</p>
      ) : !supported ? (
        <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
          <TriangleAlert className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary font-medium">
            Your browser doesn't yet support Ed25519 key generation (needs a recent Chrome, Edge, or Safari) — try a Chromium-based browser.
          </p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 flex items-start gap-3">
            <ShieldAlert className="w-4.5 h-4.5 text-status-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              The private key exists only in this page's memory for the current session — it is <strong>never</strong> persisted or transmitted. This is a learning/prototyping tool, not a wallet. Reloading the page discards it permanently.
            </p>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-accent-primary/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Generate New Keypair
          </button>

          {did && didDoc && (
            <div className="grid lg:grid-cols-2 gap-4 min-w-0">
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">did:key Identifier</span>
                  <button type="button" onClick={() => copy(did, 'did')} aria-label="Copy did:key" className="text-text-muted hover:text-text-primary">
                    {copiedId === 'did' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">{did}</p>

                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Raw Ed25519 Public Key (hex)</span>
                  <p className="text-[11px] font-mono text-text-secondary break-all">{publicKeyHex}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">DID Document</span>
                  <button
                    type="button"
                    onClick={() => copy(JSON.stringify(didDoc, null, 2), 'doc')}
                    aria-label="Copy DID document"
                    className="text-text-muted hover:text-text-primary"
                  >
                    {copiedId === 'doc' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-72 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(didDoc, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
