import { useState, useEffect } from 'react'
import { Wallet, Eye, EyeOff, Sparkles, AlertTriangle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

interface SdClaim {
  id: string
  name: string
  value: string
  salt: string
  hash: string
  disclosed: boolean
}

export default function SdJwtWalletSdk() {
  const tool = getToolBySlug('sd-jwt-wallet-sdk')!

  const initialClaims: SdClaim[] = [
    { id: '1', name: 'given_name', value: 'John', salt: '8_char_random_s1', hash: '', disclosed: true },
    { id: '2', name: 'family_name', value: 'Doe', salt: '8_char_random_s2', hash: '', disclosed: true },
    { id: '3', name: 'birthdate', value: '1995-05-15', salt: '8_char_random_s3', hash: '', disclosed: false },
    { id: '4', name: 'is_over_21', value: 'true', salt: '8_char_random_s4', hash: '', disclosed: true },
    { id: '5', name: 'nationality', value: 'US', salt: '8_char_random_s5', hash: '', disclosed: false }
  ]

  const [claims, setClaims] = useState<SdClaim[]>(initialClaims)
  const [computing, setComputing] = useState(false)
  const [sdJwt, setSdJwt] = useState<string | null>(null)
  const [disclosureBlock, setDisclosureBlock] = useState<string | null>(null)

  const byteToHex = (uint8: Uint8Array) => {
    return Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const computeSdHashesAndJwt = async () => {
    setComputing(true)
    try {
      const updatedClaims = [...claims]
      const hashesList: string[] = []

      for (const claim of updatedClaims) {
        // 1. Generate real random salt if not set
        if (claim.salt.includes('random')) {
          const randBytes = new Uint8Array(8)
          window.crypto.getRandomValues(randBytes)
          claim.salt = byteToHex(randBytes)
        }

        // 2. Assemble disclosure array: [salt, name, value]
        const disclosureArr = [claim.salt, claim.name, claim.value]
        const disclosureStr = JSON.stringify(disclosureArr)
        const base64UrlDisclosure = btoa(disclosureStr)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')

        // 3. Compute SHA-256 hash of the base64url disclosure string
        const encoder = new TextEncoder()
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(base64UrlDisclosure))
        const rawHash = new Uint8Array(hashBuffer)
        const base64UrlHash = btoa(String.fromCharCode(...rawHash))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')

        claim.hash = base64UrlHash
        hashesList.push(base64UrlHash)
      }

      setClaims(updatedClaims)

      // 4. Build mock Issuer signed JWT envelope containing the list of hashes under "_sd"
      const header = btoa(JSON.stringify({ alg: 'ES256', typ: 'sd+jwt' })).replace(/=/g, '')
      // eslint-disable-next-line react-hooks/purity -- Timestamp generated on mount / state change
      const iatTime = Math.floor(Date.now() / 1000)
      const payload = btoa(JSON.stringify({
        iss: 'https://issuer.aboutiam.com',
        iat: iatTime,
        exp: iatTime + 3600,
        _sd: hashesList,
        cnf: {
          jwk: { kty: 'EC', crv: 'P-256', x: 'abc', y: 'def' }
        }
      })).replace(/=/g, '')

      const mockSignature = 'mock_signature_of_the_sd_jwt_envelope'

      // 5. Generate disclosures segment based on "disclosed" status
      const activeDisclosures = updatedClaims
        .filter(c => c.disclosed)
        .map(c => {
          const disArr = [c.salt, c.name, c.value]
          return btoa(JSON.stringify(disArr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        })

      const formattedDisclosures = activeDisclosures.join('~')
      setDisclosureBlock(formattedDisclosures)

      // Combined presentation: JWT + "~" + disclosures + "~"
      const completeToken = `${header}.${payload}.${mockSignature}~${formattedDisclosures}~`
      setSdJwt(completeToken)

    } catch (e) {
      console.error(e)
    }
    setComputing(false)
  }

  const toggleDisclosure = (id: string) => {
    const updated = claims.map(c => {
      if (c.id === id) return { ...c, disclosed: !c.disclosed }
      return c
    })
    setClaims(updated)
    // Recalculate
    setTimeout(() => computeSdHashesAndJwt(), 0)
  }

  // Trigger on mount safely in useEffect, avoiding purity issues during render
  useEffect(() => {
    setTimeout(() => {
      computeSdHashesAndJwt()
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        
        {/* Claims Config & Salting Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-accent-primary" />
                <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Holder Claims Config</h3>
              </div>
              <span className="text-[10px] bg-accent-glow border border-accent-primary/20 px-2 py-0.5 rounded-full font-bold text-accent-primary uppercase font-mono">{computing ? 'Computing...' : 'SHA-256 Salting'}</span>
            </div>

            <div className="space-y-3.5">
              {claims.map((claim) => (
                <div key={claim.id} className="p-3.5 bg-bg-sidebar/50 rounded-xl border border-border-subtle flex items-center justify-between gap-4 text-xs font-semibold">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-text-primary bg-bg-nested px-1.5 py-0.5 rounded border border-border-subtle">{claim.name}</span>
                      <span className="font-bold text-text-secondary truncate">{claim.value}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] pt-1.5 font-mono text-text-muted">
                      <div className="truncate">Salt: <span className="text-accent-secondary font-bold">{claim.salt}</span></div>
                      <div className="truncate">Hash: <span className="text-emerald-500 font-bold">{claim.hash ? claim.hash.substring(0, 12) + '...' : 'pending'}</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDisclosure(claim.id)}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 text-[10px] uppercase transition-all ${
                      claim.disclosed
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm shadow-accent-primary/5'
                        : 'border-border-subtle bg-bg-nested text-text-muted'
                    }`}
                  >
                    {claim.disclosed ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Disclosed
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Redacted
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output SD-JWT Envelope and Disclosures */}
        <div className="space-y-6">
          
          {/* JWT Envelope & Verification Diagram */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              Verifiable Presentation Cryptographic Assembly
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              {/* Signed JWT Envelope */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-text-muted font-bold block uppercase">Issuer-Signed JWT Envelope (containing _sd array)</span>
                <pre className="text-[9px] font-mono bg-black text-text-secondary border border-zinc-800 rounded-xl p-3.5 overflow-x-auto leading-normal whitespace-pre-wrap truncate">
                  {sdJwt ? sdJwt.split('~')[0] : 'generating...'}
                </pre>
              </div>

              {/* Active Disclosure Blocks */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-text-muted font-bold block uppercase">Active Presentation Disclosure Strings (tilde separated)</span>
                {disclosureBlock ? (
                  <pre className="text-[9px] font-mono bg-black text-accent-secondary border border-zinc-800 rounded-xl p-3.5 overflow-x-auto leading-normal whitespace-pre-wrap break-all">
                    {disclosureBlock}
                  </pre>
                ) : (
                  <div className="p-3 bg-status-warning/5 border border-status-warning/20 rounded-xl text-status-warning flex gap-2 items-center text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>No disclosures selected. Presenting zero claims to verifier.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-8 space-y-6">
        <BeginnerExpertExplainer tool={tool} />
      </div>
    </ToolPageShell>
  )
}
