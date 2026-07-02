import { useState } from 'react'
import { Check, Copy, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { hashPassword, comparePassword } from '../../lib/tools/bcrypt'

const tool = getToolBySlug('bcrypt-generator')!

type Tab = 'hash' | 'verify'

export default function BcryptGenerator() {
  const [activeTab, setActiveTab] = useState<Tab>('hash')

  // Hash State
  const [password, setPassword] = useState('AboutIAM-Secret-123!')
  const [costFactor, setCostFactor] = useState(10)
  const [hashResult, setHashResult] = useState('')
  const [isHashing, setIsHashing] = useState(false)
  const [hashError, setHashError] = useState('')

  // Verify State
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState('')

  const { copy, copiedId } = useClipboardCopy()

  const handleHash = async () => {
    if (!password) {
      setHashError('Please enter a password to hash.')
      return
    }
    setHashError('')
    setIsHashing(true)
    try {
      // Small timeout to allow the spinner to render before the JS main-loop is occupied
      await new Promise((resolve) => setTimeout(resolve, 50))
      const hash = await hashPassword(password, costFactor)
      setHashResult(hash)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setHashError(message || 'An error occurred while hashing.')
    } finally {
      setIsHashing(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyPassword || !verifyHash) {
      setVerifyError('Please enter both the password and the bcrypt hash.')
      setVerifyResult(null)
      return
    }
    setVerifyError('')
    setVerifyResult(null)
    setIsVerifying(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 50))
      const isMatch = await comparePassword(verifyPassword, verifyHash)
      setVerifyResult(isMatch)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setVerifyError(message || 'Invalid bcrypt hash format or comparison error.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <ToolPageShell tool={tool}>
      {/* Tab Switcher */}
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
            {tab === 'hash' ? '🔑 Hash Password' : '🔍 Verify Hash'}
          </button>
        ))}
      </div>

      {activeTab === 'hash' ? (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-1 gap-6">
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Password to Hash
              </span>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password to hash"
                placeholder="Enter password here..."
                className="w-full p-3.5 rounded-lg bg-bg-sidebar text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle"
                spellCheck={false}
              />

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Cost Factor (Rounds): <span className="text-accent-primary font-mono">{costFactor}</span>
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">
                    {Math.pow(2, costFactor).toLocaleString()} iterations
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  value={costFactor}
                  onChange={(e) => setCostFactor(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-bg-sidebar rounded-lg appearance-none cursor-pointer accent-accent-primary border border-border-subtle"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                  <span>4 (Fastest)</span>
                  <span>10 (Default)</span>
                  <span>14 (Secured but Slower)</span>
                </div>
              </div>

              {costFactor >= 12 && (
                <div className="p-3.5 rounded-lg bg-status-warning/10 border border-status-warning/20 flex gap-2.5 items-start">
                  <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-text-primary">
                    <strong className="text-status-warning font-semibold">High Cost Factor Notice:</strong> Cost factors of 12 or above double the computation time for each increment, taking up to several seconds in-browser (especially on mobile devices). This is expected as part of bcrypt's designed resistance to brute-force attacks!
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleHash}
                disabled={isHashing}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:bg-accent-primary/60 text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/10 cursor-pointer"
              >
                {isHashing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Computing bcrypt Hash...
                  </>
                ) : (
                  'Generate bcrypt Hash'
                )}
              </button>

              {hashError && (
                <p className="text-xs text-status-error font-medium">{hashError}</p>
              )}
            </div>
          </div>

          {hashResult && (
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Generated bcrypt Hash
                </span>
                <button
                  type="button"
                  onClick={() => copy(hashResult, 'hash-result')}
                  aria-label="Copy hash result"
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {copiedId === 'hash-result' ? (
                    <Check className="w-4 h-4 text-status-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono border border-border-subtle break-all">
                {hashResult}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-text-muted font-mono leading-relaxed">
                <span>Format dissected:</span>
                <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle/50 text-accent-primary">
                  $2b$
                </span>
                <span>(version)</span>
                <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle/50 text-accent-primary">
                  {costFactor.toString().padStart(2, '0')}$
                </span>
                <span>(rounds)</span>
                <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle/50 text-text-primary">
                  {hashResult.slice(7, 29)}
                </span>
                <span>(salt)</span>
                <span className="bg-bg-sidebar px-1.5 py-0.5 rounded border border-border-subtle/50 text-text-primary">
                  {hashResult.slice(29)}
                </span>
                <span>(hash)</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Plaintext Password
              </span>
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
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Existing bcrypt Hash
              </span>
              <input
                type="text"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                aria-label="Existing bcrypt hash to match"
                placeholder="Paste the bcrypt hash here (e.g. $2a$... or $2b$...)"
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
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying bcrypt Hash...
                </>
              ) : (
                'Verify Password'
              )}
            </button>

            {verifyError && (
              <p className="text-xs text-status-error font-medium">{verifyError}</p>
            )}
          </div>

          {verifyResult !== null && (
            <div
              className={`p-6 rounded-xl border flex gap-4 items-start shadow-sm transition-all ${
                verifyResult
                  ? 'bg-status-success/10 border-status-success/20'
                  : 'bg-status-error/10 border-status-error/20'
              }`}
            >
              {verifyResult ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-status-success shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-status-success uppercase tracking-wide">
                      Password Verification Successful!
                    </h4>
                    <p className="text-xs text-text-primary mt-1 leading-relaxed">
                      The plaintext password matches the cryptographic hash signature. This means the credentials are 100% correct according to bcrypt verification.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6 text-status-error shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-status-error uppercase tracking-wide">
                      Verification Failed
                    </h4>
                    <p className="text-xs text-text-primary mt-1 leading-relaxed">
                      The plaintext password does NOT match the provided bcrypt hash. Ensure there are no typos, and that the password and hash are accurate.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explainer Block */}
      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
