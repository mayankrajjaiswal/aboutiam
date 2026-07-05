import { useState, useMemo } from 'react'
import { KeySquare, AlertTriangle, FileCode } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('jwks-inspector')!

const SAMPLE_JWKS = `{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "keys-auth-rsa-01",
      "n": "u1W95F6...[truncated for example]...Kz3PzQ",
      "e": "AQAB"
    },
    {
      "kty": "EC",
      "use": "sig",
      "alg": "ES256",
      "crv": "P-256",
      "kid": "keys-auth-ec-02",
      "x": "f83OJ3D2xF1Bg8vub9t61dvO-yP517U4G-C5rQ2y78s",
      "y": "x_9o6K5_N14W8T9g8f1Bf7aO0D1G2H3I4J5K6L7M8N"
    }
  ]
}`

interface ParsedKey {
  kid: string
  kty: string
  alg?: string
  use?: string
  crv?: string
  extraFields: Record<string, string>
  isValid: boolean
  error?: string
}

export default function JwksInspector() {
  const [rawJwks, setRawJwks] = useState(SAMPLE_JWKS)

  // Parse and validate the incoming JWKS JSON
  const parsedResult = useMemo(() => {
    if (!rawJwks.trim()) {
      return { keys: [], error: 'Payload is empty. Please enter a valid JWKS JSON document.' }
    }

    try {
      const parsed = JSON.parse(rawJwks)
      
      if (!parsed || typeof parsed !== 'object') {
        return { keys: [], error: 'JWKS root must be a valid JSON object.' }
      }

      if (!parsed.keys || !Array.isArray(parsed.keys)) {
        return { keys: [], error: 'JWKS document is missing the required top-level "keys" array.' }
      }

      const keysList: ParsedKey[] = parsed.keys.map((key: Record<string, unknown>, index: number) => {
        const kid = (key.kid as string) || `Unnamed Key [Index ${index}]`
        const kty = key.kty as string
        const alg = key.alg as string | undefined
        const use = key.use as string | undefined
        const crv = key.crv as string | undefined

        // Check validation rules
        let isValid = true
        let error = ''

        if (!kty) {
          isValid = false
          error = 'Missing required "kty" (Key Type) parameter.'
        } else if (kty === 'RSA' && (!key.n || !key.e)) {
          isValid = false
          error = 'RSA keys must include both "n" (modulus) and "e" (exponent) parameters.'
        } else if (kty === 'EC' && (!key.crv || !key.x || !key.y)) {
          isValid = false
          error = 'EC (Elliptic Curve) keys must include "crv" (curve name), "x", and "y" coordinate parameters.'
        }

        // Collect other extra attributes for detail inspection
        const extraFields: Record<string, string> = {}
        Object.keys(key).forEach(attr => {
          if (!['kid', 'kty', 'alg', 'use', 'crv'].includes(attr)) {
            extraFields[attr] = typeof key[attr] === 'object' ? JSON.stringify(key[attr]) : String(key[attr])
          }
        })

        return {
          kid,
          kty,
          alg,
          use,
          crv,
          extraFields,
          isValid,
          error
        }
      })

      return { keys: keysList, error: null }

    } catch (e) {
      return { keys: [], error: `Invalid JSON syntax: ${e instanceof Error ? e.message : String(e)}` }
    }
  }, [rawJwks])

  const loadSample = () => {
    setRawJwks(SAMPLE_JWKS)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: JWKS JSON Text input */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle flex-1 flex flex-col justify-between shadow-sm min-h-[350px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-accent-primary" /> Paste Raw JWKS JSON
                </span>
                <button 
                  onClick={loadSample}
                  className="text-[10px] text-accent-primary border border-accent-primary/20 bg-accent-primary/5 hover:bg-accent-primary/10 px-2 py-1 rounded font-bold transition"
                >
                  Load Sample
                </button>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed mb-3">
                Paste the JSON payload retrieved from your Identity Provider's `well-known` configuration URL (e.g. `/.well-known/jwks.json`).
              </p>
            </div>

            <textarea
              value={rawJwks}
              onChange={e => setRawJwks(e.target.value)}
              placeholder="Paste JWKS JSON here..."
              className="flex-1 w-full bg-bg-sidebar border border-border-subtle/80 rounded-lg p-3 text-[11px] font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none h-[220px]"
            />
          </div>
        </div>

        {/* Right column: Validated inspection result lists */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Global verification status badge */}
          {parsedResult.error ? (
            <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-sm block">Validation Failure</span>
                <span className="text-xs text-text-primary leading-normal">{parsedResult.error}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
              <KeySquare className="w-5 h-5 shrink-0 mt-0.5 text-status-success" />
              <div>
                <span className="font-extrabold text-sm block">JWKS Document Decoded Successfully!</span>
                <span className="text-xs text-text-primary leading-normal">
                  Found <strong className="font-bold text-status-success">{parsedResult.keys.length} cryptographic keys</strong> registered in this set.
                </span>
              </div>
            </div>
          )}

          {/* Key cards renderer */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {parsedResult.keys.map((key, index) => (
              <div 
                key={key.kid || index} 
                className={`p-4 rounded-xl border transition shadow ${key.isValid ? 'bg-bg-card border-border-subtle' : 'bg-status-danger/5 border-status-danger/40'}`}
              >
                <div className="flex justify-between items-start mb-3 border-b border-border-subtle/50 pb-2">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase font-mono mb-0.5">KEY IDENTIFIER (KID)</span>
                    <span className="font-mono text-xs font-extrabold text-text-primary">{key.kid}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {key.kty && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-accent-primary/20 text-accent-primary border border-accent-primary/30 px-2 py-0.5 rounded-full">
                        {key.kty} Key
                      </span>
                    )}
                    {key.use && (
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-bg-sidebar border border-border-subtle px-1.5 py-0.5 rounded text-text-secondary">
                        {key.use === 'sig' ? 'Signature (sig)' : key.use === 'enc' ? 'Encryption (enc)' : key.use}
                      </span>
                    )}
                  </div>
                </div>

                {!key.isValid ? (
                  <div className="text-[10px] text-status-danger font-mono bg-status-danger/10 p-2 rounded border border-status-danger/25">
                    ⚠️ {key.error}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-mono leading-normal">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-text-muted block text-[9px] uppercase font-bold">Algorithm (alg)</span>
                        <span className="text-text-primary">{key.alg || 'Unspecified'}</span>
                      </div>
                      {key.crv && (
                        <div>
                          <span className="text-text-muted block text-[9px] uppercase font-bold">Curve (crv)</span>
                          <span className="text-text-primary">{key.crv}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {Object.entries(key.extraFields).map(([attr, val]) => (
                        <div key={attr} className="min-w-0">
                          <span className="text-text-muted block text-[9px] uppercase font-bold truncate">{attr}</span>
                          <span className="text-text-primary block truncate max-w-full" title={val}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
