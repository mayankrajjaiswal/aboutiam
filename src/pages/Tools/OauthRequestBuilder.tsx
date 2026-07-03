import { useState, useMemo } from 'react'
import { Check, Copy, Link as LinkIcon, Terminal, Play } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('oauth-builder')!

export default function OauthRequestBuilder() {
  const { copy, copiedId } = useClipboardCopy()

  // Form states
  const [authEndpoint, setAuthEndpoint] = useState('https://idp.example.com/oauth2/v1/authorize')
  const [tokenEndpoint, setTokenEndpoint] = useState('https://idp.example.com/oauth2/v1/token')
  const [clientId, setClientId] = useState('aboutiam-demo-client')
  const [clientSecret, setClientSecret] = useState('sec_super_secret_key_882')
  const [redirectUri, setRedirectUri] = useState('https://aboutiam.com/callback')
  const [scope, setScope] = useState('openid profile email')
  const [state, setState] = useState('state_9a8b7c6d')
  const [nonce, setNonce] = useState('nonce_1e2f3g4h')
  const [authCode, setAuthCode] = useState('code_authorization_92817')
  const [responseType, setResponseType] = useState('code')
  
  // PKCE
  const [usePkce, setUsePkce] = useState(true)
  const [codeVerifier, setCodeVerifier] = useState('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')
  const [codeChallenge, setCodeChallenge] = useState('E9Melhoa2OwvFrGMTJguCHaoeK1t8URWbuGJSstw-cM')

  // Visual simulation popup
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null)

  // Generate Authorize GET Request URL
  const authorizationUrl = useMemo(() => {
    try {
      const url = new URL(authEndpoint)
      url.searchParams.set('client_id', clientId)
      url.searchParams.set('redirect_uri', redirectUri)
      url.searchParams.set('response_type', responseType)
      url.searchParams.set('scope', scope)
      url.searchParams.set('state', state)
      if (responseType.includes('id_token') || scope.includes('openid')) {
        url.searchParams.set('nonce', nonce)
      }
      if (usePkce) {
        url.searchParams.set('code_challenge', codeChallenge)
        url.searchParams.set('code_challenge_method', 'S256')
      }
      return url.toString()
    } catch {
      return ''
    }
  }, [authEndpoint, clientId, redirectUri, responseType, scope, state, nonce, usePkce, codeChallenge])

  // Generate curl payload (client_secret_post)
  const postCurlCommand = useMemo(() => {
    const bodyParams = new URLSearchParams()
    bodyParams.set('grant_type', 'authorization_code')
    bodyParams.set('code', authCode)
    bodyParams.set('redirect_uri', redirectUri)
    bodyParams.set('client_id', clientId)
    bodyParams.set('client_secret', clientSecret)
    if (usePkce) {
      bodyParams.set('code_verifier', codeVerifier)
    }

    return `curl -X POST "${tokenEndpoint}" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "${bodyParams.toString()}"`
  }, [tokenEndpoint, authCode, redirectUri, clientId, clientSecret, usePkce, codeVerifier])

  // Generate curl payload (client_secret_basic)
  const basicCurlCommand = useMemo(() => {
    const bodyParams = new URLSearchParams()
    bodyParams.set('grant_type', 'authorization_code')
    bodyParams.set('code', authCode)
    bodyParams.set('redirect_uri', redirectUri)
    if (usePkce) {
      bodyParams.set('code_verifier', codeVerifier)
    }

    const b64Auth = btoa(`${encodeURIComponent(clientId)}:${btoa(clientSecret).substring(0, 10)}`) // Simulated safe encode
    return `curl -X POST "${tokenEndpoint}" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -H "Authorization: Basic ${b64Auth}" \\\n  -d "${bodyParams.toString()}"`
  }, [tokenEndpoint, authCode, redirectUri, clientId, clientSecret, usePkce, codeVerifier])

  const generateRandomState = () => {
    const rand = Math.random().toString(36).substring(2, 10)
    setState(`state_${rand}`)
  }

  const generateRandomNonce = () => {
    const rand = Math.random().toString(36).substring(2, 10)
    setNonce(`nonce_${rand}`)
  }

  const simulateHandshake = () => {
    // Generate mock OIDC response values based on requested response_type
    if (responseType === 'code') {
      setSimulatedResponse(
        `HTTP/1.1 302 Found\nLocation: ${redirectUri}?code=${authCode}&state=${state}`
      )
    } else if (responseType === 'token') {
      setSimulatedResponse(
        `HTTP/1.1 302 Found\nLocation: ${redirectUri}#access_token=at_demo_token_88921&token_type=Bearer&expires_in=3600&state=${state}`
      )
    } else {
      setSimulatedResponse(
        `HTTP/1.1 302 Found\nLocation: ${redirectUri}#id_token=eyJhbGciOiJSUzI1NiIs...&state=${state}`
      )
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Form configuration fields */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 border-b border-border-subtle pb-1">
            Endpoint & Client Configuration
          </span>

          <LabeledInput label="Authorization Endpoint" value={authEndpoint} onChange={setAuthEndpoint} />
          <LabeledInput label="Token Endpoint" value={tokenEndpoint} onChange={setTokenEndpoint} />
          
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label="Client ID" value={clientId} onChange={setClientId} />
            <LabeledInput label="Client Secret" value={clientSecret} onChange={setClientSecret} />
          </div>

          <LabeledInput label="Redirect URI" value={redirectUri} onChange={setRedirectUri} />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Response Type</label>
              <select 
                value={responseType} 
                onChange={e => setResponseType(e.target.value)}
                className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2 py-1 text-[11px] text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="code">code (Auth Code Flow)</option>
                <option value="token">token (Implicit Flow - Access Token)</option>
                <option value="id_token">id_token (Implicit Flow - ID Token)</option>
                <option value="code id_token">code id_token (Hybrid Flow)</option>
              </select>
            </div>
            <LabeledInput label="Scope" value={scope} onChange={setScope} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">State Parameter</label>
                <button type="button" onClick={generateRandomState} className="text-[9px] text-accent-primary hover:underline">Rand</button>
              </div>
              <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2.5 py-1 text-[11px] text-text-primary focus:outline-none" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Nonce Parameter</label>
                <button type="button" onClick={generateRandomNonce} className="text-[9px] text-accent-primary hover:underline">Rand</button>
              </div>
              <input type="text" value={nonce} onChange={e => setNonce(e.target.value)} className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2.5 py-1 text-[11px] text-text-primary focus:outline-none" />
            </div>
          </div>

          {/* PKCE fields */}
          <div className="border border-border-subtle/60 rounded-lg p-3 bg-bg-sidebar/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={usePkce} onChange={e => setUsePkce(e.target.checked)} className="rounded text-accent-primary focus:ring-accent-primary" />
                Include PKCE Parameters
              </label>
              <span className="text-[8px] uppercase tracking-wider font-extrabold bg-accent-primary/20 text-accent-primary border border-accent-primary/30 px-1.5 py-0.5 rounded-full">
                RFC 7636
              </span>
            </div>

            {usePkce && (
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <span className="block text-text-muted font-bold mb-1">code_verifier</span>
                  <input type="text" value={codeVerifier} onChange={e => setCodeVerifier(e.target.value)} className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2 py-0.5 text-[10px] text-text-primary" />
                </div>
                <div>
                  <span className="block text-text-muted font-bold mb-1">code_challenge (S256)</span>
                  <input type="text" value={codeChallenge} onChange={e => setCodeChallenge(e.target.value)} className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2 py-0.5 text-[10px] text-text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Code Exchange parameter (for token endpoint curl commands) */}
          <LabeledInput label="Simulated Authorization Code (for Token swap)" value={authCode} onChange={setAuthCode} />

        </div>

        {/* Right column: Formatted Output URI & Curl blocks */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Authorization Request URL block */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm flex flex-col justify-between h-[210px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-accent-primary" /> 1. Authorization Request GET URL
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={simulateHandshake}
                    className="inline-flex items-center gap-1 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-[10px] font-bold px-2 py-1 rounded hover:bg-accent-primary/35 transition"
                  >
                    <Play className="w-3 h-3 fill-current" /> Simulated Redirect
                  </button>
                  <button type="button" onClick={() => copy(authorizationUrl, 'authUrl')} className="text-text-muted hover:text-text-primary">
                    {copiedId === 'authUrl' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Send the client's browser to this endpoint to initiate user authentication and scope consent.
              </p>
            </div>

            <p className="flex-1 text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 mt-2 overflow-y-auto max-h-24 select-all">
              {authorizationUrl || 'Configure your endpoint parameters on the left.'}
            </p>
          </div>

          {/* Token Backchannel Request CURL blocks */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
              2. Backchannel Token Request Curl commands (HTTP POST)
            </span>
            <p className="text-[10px] text-text-muted leading-relaxed mb-2">
              For security, the Authorization Code is exchanged for the Access Token on a server-to-server backchannel.
            </p>

            {/* Tab selection for Secret Post vs Secret Basic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-muted uppercase">client_secret_post (Credentials in Body)</span>
                  <button type="button" onClick={() => copy(postCurlCommand, 'curlPost')} className="text-text-muted hover:text-text-primary">
                    {copiedId === 'curlPost' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/40 overflow-x-auto select-all h-28 leading-normal">
                  {postCurlCommand}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-muted uppercase">client_secret_basic (HTTP Basic Auth Header)</span>
                  <button type="button" onClick={() => copy(basicCurlCommand, 'curlBasic')} className="text-text-muted hover:text-text-primary">
                    {copiedId === 'curlBasic' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-text-primary bg-bg-sidebar p-3 rounded border border-border-subtle/40 overflow-x-auto select-all h-28 leading-normal">
                  {basicCurlCommand}
                </pre>
              </div>
            </div>
          </div>

          {/* Simulated Redirect endpoint popup result */}
          {simulatedResponse && (
            <div className="p-4 rounded-xl bg-bg-sidebar border border-accent-primary/45 space-y-2 animate-fadeIn relative">
              <button 
                onClick={() => setSimulatedResponse(null)}
                className="absolute top-2 right-2 text-text-muted hover:text-text-primary text-[10px] font-bold px-1.5 py-0.5"
              >
                ✕
              </button>
              <div className="flex items-center gap-1.5 text-xs text-accent-primary font-bold uppercase tracking-wider border-b border-border-subtle/50 pb-1 mb-1">
                <Terminal className="w-4 h-4" /> HTTP 302 Authorization Response redirection header
              </div>
              <pre className="text-[10px] font-mono text-text-primary leading-normal whitespace-pre-wrap select-all">
                {simulatedResponse}
              </pre>
            </div>
          )}

        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-2.5 py-1 text-[11px] text-text-primary focus:outline-none focus:border-accent-primary"
      />
    </div>
  )
}
