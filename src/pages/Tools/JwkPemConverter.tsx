import { useEffect, useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { computeJwkThumbprint, jwkToPem, pemToJwk } from '../../lib/tools/jwk'

const tool = getToolBySlug('jwk-pem-converter')!

// RFC 7638 Appendix A.1's own published test JWK — a canonical spec example,
// not a real-world credential, so it's safe to ship as the default input.
const SAMPLE_JWK = JSON.stringify(
  {
    kty: 'RSA',
    n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
    e: 'AQAB',
  },
  null,
  2
)

const SAMPLE_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0vx7agoebGcQSuuPiLJX
ZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tS
oc/BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ/2W+5JsGY4Hc5n9yBXArwl93lqt
7/RN5w6Cf0h4QyQ5v+65YGjQR0/FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0
zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt+bFTWhAI4vMQFh6WeZu0f
M4lFd2NcRwr3XPksINHaQ+G/xBniIqbw0Ls1jF44+csFCur+kEgU8awapJzKnqDK
gwIDAQAB
-----END PUBLIC KEY-----`

type Tab = 'jwk-to-pem' | 'pem-to-jwk'

export default function JwkPemConverter() {
  const [tab, setTab] = useState<Tab>('jwk-to-pem')
  const [jwkInput, setJwkInput] = useState(SAMPLE_JWK)
  const [pemInput, setPemInput] = useState(SAMPLE_PEM)
  const [pem, setPem] = useState('')
  const [jwkOut, setJwkOut] = useState('')
  const [keyInfo, setKeyInfo] = useState('')
  const [thumbprint, setThumbprint] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setError(null)
      setPem('')
      setJwkOut('')
      setKeyInfo('')
      setThumbprint('')
      try {
        if (tab === 'jwk-to-pem') {
          const parsed = JSON.parse(jwkInput)
          const { pem: outPem, kind, label } = await jwkToPem(parsed)
          const tp = await computeJwkThumbprint(parsed)
          if (cancelled) return
          setPem(outPem)
          setKeyInfo(`${label} ${kind} key`)
          setThumbprint(tp)
        } else {
          const { jwk, kind, label } = await pemToJwk(pemInput)
          const tp = await computeJwkThumbprint(jwk)
          if (cancelled) return
          setJwkOut(JSON.stringify(jwk, null, 2))
          setKeyInfo(`${label} ${kind} key`)
          setThumbprint(tp)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not convert this key.')
      }
    }
    run()
    return () => { cancelled = true }
  }, [tab, jwkInput, pemInput])

  return (
    <ToolPageShell tool={tool}>
      <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
        {([
          { id: 'jwk-to-pem' as Tab, label: 'JWK → PEM' },
          { id: 'pem-to-jwk' as Tab, label: 'PEM → JWK' },
        ]).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === id ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-w-0">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {tab === 'jwk-to-pem' ? 'JWK (JSON)' : 'PEM'}
          </span>
          <textarea
            value={tab === 'jwk-to-pem' ? jwkInput : pemInput}
            onChange={(e) => (tab === 'jwk-to-pem' ? setJwkInput(e.target.value) : setPemInput(e.target.value))}
            aria-label={tab === 'jwk-to-pem' ? 'JWK JSON input' : 'PEM input'}
            className="w-full h-64 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
            spellCheck={false}
          />
        </div>

        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {tab === 'jwk-to-pem' ? 'PEM Output' : 'JWK Output'}
            </span>
            {(pem || jwkOut) && (
              <button
                type="button"
                onClick={() => copy(pem || jwkOut, 'output')}
                aria-label="Copy output"
                className="text-text-muted hover:text-text-primary"
              >
                {copiedId === 'output' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          {error ? (
            <p className="text-xs text-status-danger font-semibold flex items-start gap-2">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </p>
          ) : (
            <pre className="w-full h-64 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono border border-border-subtle overflow-auto whitespace-pre-wrap break-all">
              {pem || jwkOut || '…'}
            </pre>
          )}
          {keyInfo && !error && <p className="text-[11px] font-semibold text-text-secondary">{keyInfo}</p>}
        </div>
      </div>

      {thumbprint && !error && (
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">RFC 7638 JWK Thumbprint (SHA-256)</span>
            <button
              type="button"
              onClick={() => copy(thumbprint, 'thumbprint')}
              aria-label="Copy thumbprint"
              className="text-text-muted hover:text-text-primary"
            >
              {copiedId === 'thumbprint' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">{thumbprint}</p>
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
