import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, FileJson, Users, ShieldCheck, Play, CheckCircle2, ExternalLink } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { generateRsaKeyPair, exportPublicKeyPem, exportPublicKeyJwk, signJwtRsa, verifyJwtRsa } from '../../lib/tools/jwt'
import { generateCodeVerifier, deriveCodeChallengeS256, buildAuthorizationUrl } from '../../lib/tools/pkce'

const KEY_ID = 'demo-key-1'
const WIZARD_STEPS = ['Generate Keys', 'Discovery Document', 'Configure Client', 'Consent Screen', 'Run It'] as const

const AVAILABLE_SCOPES = ['openid', 'profile', 'email', 'offline_access'] as const
type AvailableScope = typeof AVAILABLE_SCOPES[number]

interface RunResult {
  codeChallenge: string
  authorizationUrl: string
  authorizationCode: string
  idToken: string
  idTokenPayload: Record<string, unknown>
  verified: boolean
}

export default function BuildYourIdp() {
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'build_your_idp',
    initialScore: 100,
    maxHints: 3
  })

  const [wizardStep, setWizardStep] = useState(0)

  // Step 1: Keys
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [publicJwk, setPublicJwk] = useState<JsonWebKey | null>(null)
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)

  // Step 2: Discovery
  const [issuerUrl, setIssuerUrl] = useState('https://demo-idp.aboutiam.local')
  const [selectedScopes, setSelectedScopes] = useState<AvailableScope[]>(['openid', 'profile', 'email'])

  // Step 3: Client
  const [clientId, setClientId] = useState('demo-app')
  const [redirectUri, setRedirectUri] = useState('https://demo-app.aboutiam.local/callback')
  const [scopeGrants, setScopeGrants] = useState<AvailableScope[]>(['openid', 'profile', 'email'])

  // Step 4: Consent
  const [consentRequired, setConsentRequired] = useState<AvailableScope[]>(['email'])

  // Step 5: Run
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const discoveryDocument = useMemo(() => ({
    issuer: issuerUrl,
    authorization_endpoint: `${issuerUrl}/authorize`,
    token_endpoint: `${issuerUrl}/token`,
    jwks_uri: `${issuerUrl}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: selectedScopes,
    code_challenge_methods_supported: ['S256']
  }), [issuerUrl, selectedScopes])

  const jwksDocument = useMemo(() => ({ keys: publicJwk ? [publicJwk] : [] }), [publicJwk])

  const toggleScope = (setter: typeof setSelectedScopes, list: AvailableScope[], scope: AvailableScope) => {
    setter(list.includes(scope) ? list.filter((s) => s !== scope) : [...list, scope])
  }

  const handleGenerateKeys = async () => {
    setIsGeneratingKeys(true)
    log('info', 'Generating a 2048-bit RS256 keypair via Web Crypto...')
    const pair = await generateRsaKeyPair()
    const pem = await exportPublicKeyPem(pair.publicKey)
    const jwk = await exportPublicKeyJwk(pair.publicKey, KEY_ID)
    setKeyPair(pair)
    setPublicKeyPem(pem)
    setPublicJwk(jwk)
    setIsGeneratingKeys(false)
    log('success', `Keypair generated. Public key exported as PEM and as a JWKS-ready JWK (kid: ${KEY_ID}).`)
    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: Generated the IdP\'s RS256 signing keypair.')
    }
  }

  const handleRun = async () => {
    if (!keyPair) return
    setIsRunning(true)

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await deriveCodeChallengeS256(codeVerifier)
    const authorizationUrl = buildAuthorizationUrl({
      authorizationEndpoint: discoveryDocument.authorization_endpoint,
      clientId,
      redirectUri,
      scope: scopeGrants.join(' '),
      codeChallenge
    })
    log('info', `[Front-channel] Demo App redirects the browser to: ${authorizationUrl}`)

    const consentedScopes = scopeGrants.filter((s) => consentRequired.includes(s))
    if (consentedScopes.length > 0) {
      log('info', `[Consent] User is shown an explicit consent screen for: ${consentedScopes.join(', ')}.`)
    }

    const codeBytes = crypto.getRandomValues(new Uint8Array(12))
    const authorizationCode = `AUTH_${Array.from(codeBytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`
    log('success', `[Front-channel] Authorization granted. IdP redirects back to ${redirectUri} with code=${authorizationCode}`)

    const now = Math.floor(Date.now() / 1000)
    const idTokenPayload: Record<string, unknown> = {
      iss: issuerUrl,
      sub: 'demo-user-42',
      aud: clientId,
      iat: now,
      exp: now + 3600
    }
    if (scopeGrants.includes('profile')) idTokenPayload.name = 'Demo User'
    if (scopeGrants.includes('email')) idTokenPayload.email = 'demo.user@example.com'

    const idToken = await signJwtRsa({ alg: 'RS256', typ: 'JWT', kid: KEY_ID }, idTokenPayload, keyPair.privateKey)
    log('info', `[Back-channel] Demo App POSTs code=${authorizationCode} + code_verifier to ${discoveryDocument.token_endpoint}.`)
    log('success', `[Back-channel] IdP mints and returns a real RS256-signed ID token.`)

    const verified = await verifyJwtRsa(idToken, keyPair.publicKey)
    log(verified ? 'success' : 'error', verified
      ? 'Demo App fetched the JWKS and verified the ID token signature successfully.'
      : 'ID token signature verification against the JWKS failed.')

    setRunResult({ codeChallenge, authorizationUrl, authorizationCode, idToken, idTokenPayload, verified })
    setIsRunning(false)

    if (currentStep === 1) {
      completeStep(1, 'Checkpoint 2 verified: Configured a discovery document, client, and consent screen.')
    }
    if (verified && currentStep <= 2) {
      finishPlayground('🎉 Your minimal OIDC Provider is complete! The mock Relying Party consumed your discovery document, ran the full authorization-code + PKCE flow, and verified a real RS256-signed ID token against your own JWKS.')
    }
  }

  const handleRevealHint = () => {
    const hints = [
      'Start by generating the keypair in Step 1 — every later step (the discovery document\'s JWKS, and the signed ID token) depends on it.',
      'The scopes you select in the Discovery Document step become the pool of scopes your Demo App client can actually request in Step 3 — configure the discovery document\'s scopes first.',
      'In the Consent Screen step, toggling a scope "on" means the user must explicitly approve it before the Demo App receives it — try requiring consent for "email" to see it called out in the Run It trace log.'
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="Build-Your-Own-IdP Sandbox"
      description="Assemble a minimal OIDC Provider step by step — generate signing keys, configure the discovery document, register a client, build a consent screen — then watch a mock Relying Party consume it and complete a real signed login, entirely offline."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setWizardStep(0)
        setKeyPair(null)
        setPublicKeyPem('')
        setPublicJwk(null)
        setRunResult(null)
        resetPlayground()
        log('info', 'IdP sandbox reset. Start again from Step 1.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {WIZARD_STEPS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setWizardStep(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                wizardStep === idx ? 'bg-accent-primary text-white shadow-sm' : 'bg-bg-nested text-text-secondary hover:bg-bg-card'
              }`}
            >
              {idx + 1}. {label}
            </button>
          ))}
        </div>

        {wizardStep === 0 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-accent-primary" /> Step 1 — Generate Signing Keys</h3>
            <p className="text-xs text-text-secondary">Every OIDC Provider needs an asymmetric keypair to sign ID tokens. Generate a real RS256 keypair using your browser's Web Crypto API.</p>
            <button
              onClick={handleGenerateKeys}
              disabled={isGeneratingKeys}
              className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              {isGeneratingKeys ? 'Generating...' : keyPair ? 'Regenerate Keypair' : 'Generate RS256 Keypair'}
            </button>
            {publicKeyPem && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Public Key (PEM)</div>
                  <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto break-all">{publicKeyPem}</pre>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Public Key (JWK)</div>
                  <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto break-all">{JSON.stringify(publicJwk, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><FileJson className="w-4 h-4 text-accent-primary" /> Step 2 — Configure the Discovery Document</h3>
            <label className="block text-xs font-bold text-text-secondary">Issuer URL</label>
            <input value={issuerUrl} onChange={(e) => setIssuerUrl(e.target.value)} className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary" />
            <label className="block text-xs font-bold text-text-secondary">Supported Scopes</label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_SCOPES.map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-bg-nested border border-border-subtle">
                  <input type="checkbox" disabled={scope === 'openid'} checked={selectedScopes.includes(scope)} onChange={() => toggleScope(setSelectedScopes, selectedScopes, scope)} />
                  {scope}
                </label>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">openid-configuration</div>
                <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-56 overflow-y-auto">{JSON.stringify(discoveryDocument, null, 2)}</pre>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase mb-1">JWKS ({discoveryDocument.jwks_uri})</div>
                <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-56 overflow-y-auto">{JSON.stringify(jwksDocument, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Users className="w-4 h-4 text-accent-primary" /> Step 3 — Configure a Client</h3>
            <label className="block text-xs font-bold text-text-secondary">Client ID</label>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary" />
            <label className="block text-xs font-bold text-text-secondary">Redirect URI</label>
            <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} className="w-full p-2.5 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary" />
            <label className="block text-xs font-bold text-text-secondary">Scope Grants</label>
            <div className="flex gap-2 flex-wrap">
              {discoveryDocument.scopes_supported.map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-bg-nested border border-border-subtle">
                  <input type="checkbox" checked={scopeGrants.includes(scope as AvailableScope)} onChange={() => toggleScope(setScopeGrants, scopeGrants, scope as AvailableScope)} />
                  {scope}
                </label>
              ))}
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-primary" /> Step 4 — Consent Screen Builder</h3>
            <p className="text-xs text-text-secondary">Toggle which of the client's granted scopes require an explicit user consent prompt.</p>
            <div className="flex gap-2 flex-wrap">
              {scopeGrants.map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-bg-nested border border-border-subtle">
                  <input type="checkbox" checked={consentRequired.includes(scope)} onChange={() => toggleScope(setConsentRequired, consentRequired, scope)} />
                  Require consent for {scope}
                </label>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-bg-nested border border-dashed border-border-subtle">
              <div className="text-xs font-bold text-text-primary mb-2">Consent Screen Preview — "{clientId}" is requesting:</div>
              <ul className="space-y-1" data-testid="consent-preview-list">
                {scopeGrants.filter((s) => consentRequired.includes(s)).map((s) => (
                  <li key={s} className="text-xs text-text-secondary flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" /> {s}</li>
                ))}
                {scopeGrants.filter((s) => consentRequired.includes(s)).length === 0 && (
                  <li className="text-xs text-text-muted italic">No scopes flagged for explicit consent — all granted scopes are issued silently.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Play className="w-4 h-4 text-accent-primary" /> Step 5 — Run It</h3>
            <p className="text-xs text-text-secondary">"{clientId}" performs a full authorization-code + PKCE flow against your just-built IdP, entirely in-memory.</p>
            <button
              onClick={handleRun}
              disabled={!keyPair || isRunning}
              className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
            >
              {!keyPair ? 'Generate keys in Step 1 first' : isRunning ? 'Running flow...' : 'Run Authorization Code + PKCE Flow'}
            </button>

            {runResult && (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Minted & Signed ID Token</div>
                  <p className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/50 break-all">{runResult.idToken}</p>
                </div>
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${runResult.verified ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
                  <ShieldCheck className="w-4 h-4" />
                  {runResult.verified ? 'ID token signature verified against the JWKS.' : 'ID token signature verification failed.'}
                </div>
                <Link
                  to={`/tools/jwt-decoder?token=${runResult.idToken}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline"
                >
                  Send to JWT Decoder <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </PlaygroundShell>
  )
}
