import { useState } from 'react'
import { Check, Copy, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { derivePbkdf2, verifyPbkdf2 } from '../../lib/tools/pbkdf2'
import type { Pbkdf2HashAlgorithm } from '../../lib/tools/pbkdf2'

const tool = getToolBySlug('pbkdf2-generator')!

type Tab = 'hash' | 'verify'
const HASH_OPTIONS: Pbkdf2HashAlgorithm[] = ['SHA-256', 'SHA-384', 'SHA-512']

export default function Pbkdf2Generator() {
  const [activeTab, setActiveTab] = useState<Tab>('hash')

  const [password, setPassword] = useState('AboutIAM-Secret-123!')
  const [iterations, setIterations] = useState(600_000)
  const [hashAlg, setHashAlg] = useState<Pbkdf2HashAlgorithm>('SHA-256')
  const [hashResult, setHashResult] = useState('')
  const [isHashing, setIsHashing] = useState(false)
  const [hashError, setHashError] = useState('')

  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyEncoded, setVerifyEncoded] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState('')

  const { copy, copiedId } = useClipboardCopy()

  const handleHash = async () => {
    if (!password) {
      setHashError('Please enter a password to derive a key from.')
      return
    }
    setHashError('')
    setIsHashing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 50))
      const result = await derivePbkdf2(password, { iterations, hash: hashAlg })
      setHashResult(result.encoded)
    } catch (err: unknown) {
      setHashError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsHashing(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyPassword || !verifyEncoded) {
      setVerifyError('Please enter both the password and the encoded PBKDF2 hash.')
      setVerifyResult(null)
      return
    }
    setVerifyError('')
    setVerifyResult(null)
    setIsVerifying(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setVerifyResult(await verifyPbkdf2(verifyPassword, verifyEncoded))
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Invalid PBKDF2 hash format or verification error.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="flex border-b border-border-subtle mb-6">
        {(['hash', 'verify'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'hash' ? '🔑 Derive Key' : '🔍 Verify Password'}
          </button>
        ))}
      </div>

      {activeTab === 'hash' ? (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Password</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password to derive"
              placeholder="Enter password here..."
              className="w-full p-3.5 rounded-lg bg-bg-sidebar text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle"
              spellCheck={false}
            />

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Hash Function</span>
                <select
                  value={hashAlg}
                  onChange={(e) => setHashAlg(e.target.value as Pbkdf2HashAlgorithm)}
                  className="w-full p-3 rounded-lg bg-bg-sidebar text-sm text-text-primary border border-border-subtle focus:outline-none focus:border-accent-primary"
                >
                  {HASH_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Iterations: <span className="text-accent-primary font-mono">{iterations.toLocaleString()}</span>
                </span>
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-bg-sidebar rounded-lg appearance-none cursor-pointer accent-accent-primary border border-border-subtle mt-3"
                />
              </div>
            </div>

            {iterations >= 500_000 && (
              <div className="p-3.5 rounded-lg bg-status-warning/10 border border-status-warning/20 flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-text-primary">
                  <strong className="text-status-warning font-semibold">High Iteration Notice:</strong> 600,000 is OWASP's current minimum recommendation for PBKDF2-HMAC-SHA256 — computation may take a moment in-browser, which is intentional slowness working in your favor against brute force.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleHash}
              disabled={isHashing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:bg-accent-primary/60 text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/10 cursor-pointer"
            >
              {isHashing ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Deriving Key...</>) : 'Derive PBKDF2 Key'}
            </button>

            {hashError && <p className="text-xs text-status-error font-medium">{hashError}</p>}
          </div>

          {hashResult && (
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Encoded PBKDF2 Hash</span>
                <button
                  type="button"
                  onClick={() => copy(hashResult, 'hash-result')}
                  aria-label="Copy hash result"
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {copiedId === 'hash-result' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono border border-border-subtle break-all">
                {hashResult}
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Format: <span className="font-mono text-accent-primary">pbkdf2$hash$iterations$saltHex$hashHex</span> — store this whole string; the salt and parameters travel with it so verification never needs them supplied separately.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Plaintext Password</span>
              <input
                type="text"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                aria-label="Plaintext password to verify"
                placeholder="Enter the password..."
                className="w-full p-3.5 rounded-lg bg-bg-sidebar text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Encoded PBKDF2 Hash</span>
              <input
                type="text"
                value={verifyEncoded}
                onChange={(e) => setVerifyEncoded(e.target.value)}
                aria-label="Encoded PBKDF2 hash to match"
                placeholder="pbkdf2$SHA-256$600000$...$..."
                className="w-full p-3.5 rounded-lg bg-bg-sidebar text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent-secondary hover:bg-teal-700 disabled:bg-accent-secondary/60 text-white text-xs font-bold transition-all shadow-md shadow-accent-secondary/10 cursor-pointer"
            >
              {isVerifying ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</>) : 'Verify Password'}
            </button>
            {verifyError && <p className="text-xs text-status-error font-medium">{verifyError}</p>}
          </div>

          {verifyResult !== null && (
            <div className={`p-6 rounded-xl border flex gap-4 items-start shadow-sm transition-all ${
              verifyResult ? 'bg-status-success/10 border-status-success/20' : 'bg-status-error/10 border-status-error/20'
            }`}>
              {verifyResult ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-status-success shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-status-success uppercase tracking-wide">Password Verification Successful!</h4>
                    <p className="text-xs text-text-primary mt-1 leading-relaxed">The plaintext password re-derives to the exact same key using the parameters embedded in the encoded hash.</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6 text-status-error shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-status-error uppercase tracking-wide">Verification Failed</h4>
                    <p className="text-xs text-text-primary mt-1 leading-relaxed">The plaintext password does NOT match the provided PBKDF2 hash.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
