import { useEffect, useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import type { SupportedHmacAlg } from '../../lib/tools/jwt'
import { exportPublicKeyPem, generateRsaKeyPair, signJwtHmac, signJwtRsa } from '../../lib/tools/jwt'

const tool = getToolBySlug('jwt-generator')!

type Alg = SupportedHmacAlg | 'RS256'

export default function JwtGenerator() {
  const [alg, setAlg] = useState<Alg>('HS256')
  const [headerJson, setHeaderJson] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payloadJson, setPayloadJson] = useState('{\n  "sub": "aboutiam-user-889",\n  "name": "Alex Example",\n  "iat": 1516239022\n}')
  const [secret, setSecret] = useState('super-secret-security-key-2026')
  const [token, setToken] = useState('')
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      let header: object
      let payload: object
      try {
        header = { ...JSON.parse(headerJson), alg }
        payload = JSON.parse(payloadJson)
      } catch {
        if (!cancelled) setError('Header and payload must both be valid JSON.')
        return
      }

      try {
        if (alg === 'RS256') {
          const keyPair = await generateRsaKeyPair()
          const signed = await signJwtRsa(header, payload, keyPair.privateKey)
          const pem = await exportPublicKeyPem(keyPair.publicKey)
          if (!cancelled) {
            setToken(signed)
            setPublicKeyPem(pem)
            setError(null)
          }
        } else {
          const signed = await signJwtHmac(alg, header, payload, secret)
          if (!cancelled) {
            setToken(signed)
            setPublicKeyPem('')
            setError(null)
          }
        }
      } catch {
        if (!cancelled) setError('Could not sign this token — check your inputs.')
      }
    }

    run()
    return () => { cancelled = true }
  }, [alg, headerJson, payloadJson, secret])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
            <label htmlFor="jwt-gen-alg" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Signature Algorithm</label>
            <select
              id="jwt-gen-alg"
              value={alg}
              onChange={(e) => setAlg(e.target.value as Alg)}
              className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-bold text-sm focus:outline-none focus:border-accent-primary"
            >
              <option value="HS256">HS256 (HMAC-SHA256)</option>
              <option value="HS384">HS384 (HMAC-SHA384)</option>
              <option value="HS512">HS512 (HMAC-SHA512)</option>
              <option value="RS256">RS256 (RSA-SHA256, ephemeral key)</option>
            </select>

            {alg !== 'RS256' ? (
              <>
                <label htmlFor="jwt-gen-secret" className="block text-xs font-bold text-text-secondary uppercase tracking-wider pt-2">Shared HMAC Secret</label>
                <input
                  id="jwt-gen-secret"
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                />
              </>
            ) : (
              <p className="text-[11px] text-text-muted leading-relaxed pt-1">
                A fresh 2048-bit RSA keypair is generated in your browser for every change. The matching public key is shown below the token so you can verify it elsewhere.
              </p>
            )}
          </div>

          {publicKeyPem && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Public Key (PEM)</span>
              <pre className="text-[10px] font-mono text-text-primary break-all whitespace-pre-wrap bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto">
                {publicKeyPem}
              </pre>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Header (JSON)</span>
              <textarea
                value={headerJson}
                onChange={(e) => setHeaderJson(e.target.value)}
                aria-label="JWT header JSON"
                className="w-full h-36 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                spellCheck={false}
              />
            </div>
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Payload (Claims)</span>
              <textarea
                value={payloadJson}
                onChange={(e) => setPayloadJson(e.target.value)}
                aria-label="JWT payload JSON"
                className="w-full h-36 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          {error && <p className="text-xs text-status-danger font-semibold">{error}</p>}

          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-accent-secondary" /> Signed Token
              </span>
              <button
                type="button"
                onClick={() => copy(token, 'token')}
                aria-label="Copy signed token"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-bg-sidebar hover:bg-bg-nested text-xs text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
              >
                {copiedId === 'token' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">Copy</span>
              </button>
            </div>
            <p className="p-4 rounded-lg bg-bg-sidebar border border-border-subtle/50 text-[11px] text-text-primary break-all leading-relaxed max-h-32 overflow-y-auto font-mono">
              {token || 'Signing…'}
            </p>
          </div>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
