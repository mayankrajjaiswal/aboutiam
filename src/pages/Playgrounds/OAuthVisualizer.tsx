import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  RefreshCw, Server, Globe, User, CheckCircle, 
  HelpCircle, Terminal, ArrowRight, Copy, Check
} from 'lucide-react'

type GrantType = 'pkce' | 'client_credentials' | 'implicit' | 'device'

interface FlowStep {
  title: string
  desc: string
  sender: 'client' | 'browser' | 'auth_server'
  receiver: 'client' | 'browser' | 'auth_server'
  channel: 'front' | 'back' | 'none'
  requestSnippet: string
  responseSnippet: string
  explanation: string
}

export default function OAuthVisualizer() {
  const [grant, setGrant] = useState<GrantType>('pkce')
  const [step, setStep] = useState(0)
  const [clientId, setClientId] = useState('aboutiam-spa-app')
  const [clientSecret, setClientSecret] = useState('sec_99a8b77c1d2e3f4g')
  const [scopes, setScopes] = useState('openid profile email offline_access')
  const [redirectUri, setRedirectUri] = useState('https://aboutiam.com/callback')
  
  // PKCE Generated Parameters
  const [codeVerifier, setCodeVerifier] = useState('')
  const [codeChallenge, setCodeChallenge] = useState('')
  const [isCopied, setIsCopied] = useState<string | null>(null)

  // Auth States
  const [authCode] = useState('auth_code_9a8b7c')
  const [username, setUsername] = useState('security_expert')
  const [password, setPassword] = useState('password123')
  const [isApproved, setIsApproved] = useState(false)

  // Generate high-entropy PKCE Verifier & SHA-256 Challenge natively
  const generatePKCEPair = async () => {
    // Generate a high-entropy verifier (43 to 128 chars)
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let verifier = ''
    for (let i = 0; i < 64; i++) {
      verifier += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setCodeVerifier(verifier)

    // Compute SHA-256 hash using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await window.crypto.subtle.digest('SHA-256', data)
    
    // Base64Url encode without padding
    const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    
    setCodeChallenge(base64)
  }

  // Initialize PKCE values on mount or grant switch
  useEffect(() => {
    setTimeout(() => {
      generatePKCEPair()
      setStep(0)
      setIsApproved(false)
    }, 0)
  }, [grant])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(id)
    setTimeout(() => setIsCopied(null), 1500)
  }

  // --- STEP blue-prints ---
  const pkceSteps: FlowStep[] = [
    {
      title: '1. Initialize Authorization Request (Front-Channel)',
      desc: 'The Client App generates a PKCE code_verifier and computes its code_challenge. It redirects the browser to the Authorization Endpoint.',
      sender: 'client',
      receiver: 'browser',
      channel: 'front',
      requestSnippet: `GET /authorize?
  response_type=code
  &client_id=${clientId}
  &redirect_uri=${encodeURIComponent(redirectUri)}
  &scope=${encodeURIComponent(scopes)}
  &state=xyz987
  &code_challenge=${codeChallenge}
  &code_challenge_method=S256 HTTP/1.1
Host: auth.aboutiam.com`,
      responseSnippet: `HTTP/1.1 302 Found
Location: https://auth.aboutiam.com/login?client_id=${clientId}&state=xyz987...`,
      explanation: 'Security Benefit: By computing a SHA-256 challenge, the client commits to a secret that can only be verified in Step 4. Even if an attacker intercepts the authorization code, they cannot exchange it for a token without knowing the original unhashed code_verifier.'
    },
    {
      title: '2. User Authentication & Consent (Auth Server)',
      desc: 'The User interacts with the Authorization Server directly inside the browser, enters credentials, and consents to the requested scopes.',
      sender: 'browser',
      receiver: 'auth_server',
      channel: 'front',
      requestSnippet: `POST /login HTTP/1.1
Host: auth.aboutiam.com
Content-Type: application/x-www-form-urlencoded

username=${username}&password=********&consent=approved`,
      responseSnippet: `HTTP/1.1 302 Found
Location: ${redirectUri}?code=${authCode}&state=xyz987`,
      explanation: 'Identity Concept: The client app never sees the user\'s password. The user logs in directly with the identity provider (IdP). Upon successful login, the server issues a temporary, single-use Authorization Code.'
    },
    {
      title: '3. Return Authorization Code via Redirect',
      desc: 'The Authorization Server redirects the user\'s browser back to the Client\'s redirect_uri, carrying the temporary Authorization Code in the URL query string.',
      sender: 'auth_server',
      receiver: 'browser',
      channel: 'front',
      requestSnippet: `GET /callback?code=${authCode}&state=xyz987 HTTP/1.1
Host: aboutiam.com`,
      responseSnippet: `HTTP/1.1 200 OK
Content-Type: text/html

<!-- SPA/App code loads and reads the query parameters -->`,
      explanation: 'Architecture Note: This represents the end of the Front-Channel flow. The Authorization Code is exposed in the browser history and URL bar, which is why it is considered "untrusted" and cannot be used directly as an access token.'
    },
    {
      title: '4. Token Exchange Request (Back-Channel)',
      desc: 'The Client App extracts the code from the URL and makes a secure direct POST request (Back-Channel) to the Token Endpoint, sending the code and the raw unhashed code_verifier.',
      sender: 'client',
      receiver: 'auth_server',
      channel: 'back',
      requestSnippet: `POST /token HTTP/1.1
Host: auth.aboutiam.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=${authCode}
&client_id=${clientId}
&redirect_uri=${encodeURIComponent(redirectUri)}
&code_verifier=${codeVerifier}`,
      responseSnippet: `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store`,
      explanation: 'Cryptographic Check: The Authorization Server takes the code_verifier sent in this step, hashes it with SHA-256, and compares it to the code_challenge received in Step 1. Since only the true client knows the verifier, this proves the app requesting the token is the exact same app that initiated the login.'
    },
    {
      title: '5. Tokens Issued Successfully!',
      desc: 'The Authorization Server verifies the PKCE handshake and returns the secure Token Package (Access Token, ID Token JWT, and Refresh Token) directly to the Client App.',
      sender: 'auth_server',
      receiver: 'client',
      channel: 'back',
      requestSnippet: `Response received on backchannel connection (Direct secure HTTP)`,
      responseSnippet: `{
  "access_token": "at_aboutiam_session_77b8c9d...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_aboutiam_persistent_02a3b...",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJzdWIiOiI5OGI3YyIsIm5hbWUiOiJzZWN1cml0eV9leHBlcnQiLCJlbWFpbCI6ImV4cGVydEBpYW0uY29tIiwiaWF0IjoxNzEzNTY4MDB9.sig..."
}`,
      explanation: 'OIDC Advantage: The "id_token" is a JSON Web Token (JWT) that encodes user profile details (subject, name, email). The Client App can verify the signature and log the user in immediately without requesting another profile API.'
    }
  ]

  const clientCredentialsSteps: FlowStep[] = [
    {
      title: '1. Machine-to-Machine Token Request (Back-Channel)',
      desc: 'The Client Service requests an access token directly from the Token Endpoint, authenticating itself with its client_id and client_secret.',
      sender: 'client',
      receiver: 'auth_server',
      channel: 'back',
      requestSnippet: `POST /token HTTP/1.1
Host: auth.aboutiam.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=${clientId}
&client_secret=${clientSecret}
&scope=system.write`,
      responseSnippet: `HTTP/1.1 200 OK
Content-Type: application/json`,
      explanation: 'Use Case: This flow is strictly for Machine-to-Machine (M2M) communications (e.g., cron-jobs, background microservices, or APIs). There is no User, Browser, or Consent screen involved. Because the secret is sent, this must only be used in secure backends.'
    },
    {
      title: '2. Access Token Issued',
      desc: 'The Authorization Server validates the client_secret and returns a Bearer access token containing scoped backend credentials.',
      sender: 'auth_server',
      receiver: 'client',
      channel: 'back',
      requestSnippet: `Secure API transaction completed`,
      responseSnippet: `{
  "access_token": "at_m2m_service_99a8b...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "scope": "system.write"
}`,
      explanation: 'No ID Token: Notice that there is no "id_token" returned. Because there is no human user context in Client Credentials, OIDC identity claims do not apply.'
    }
  ]

  const implicitSteps: FlowStep[] = [
    {
      title: '1. Authorization Redirect (Front-Channel)',
      desc: 'The Client SPA requests tokens directly in the redirect, bypasses authorization codes, and requests tokens immediately.',
      sender: 'client',
      receiver: 'browser',
      channel: 'front',
      requestSnippet: `GET /authorize?
  response_type=token+id_token
  &client_id=${clientId}
  &redirect_uri=${encodeURIComponent(redirectUri)}
  &scope=${encodeURIComponent(scopes)}
  &state=abc321 HTTP/1.1
Host: auth.aboutiam.com`,
      responseSnippet: `HTTP/1.1 302 Found
Location: https://auth.aboutiam.com/login?...`,
      explanation: 'Historical Context: Implicit flow was created when browsers couldn\'t execute secure cross-origin (CORS) POST requests. It is now strongly DEPRECATED in OAuth 2.1 due to security risks.'
    },
    {
      title: '2. User Authentication (Browser)',
      desc: 'The user logs in with their credentials directly at the authorization server.',
      sender: 'browser',
      receiver: 'auth_server',
      channel: 'front',
      requestSnippet: `POST /login HTTP/1.1
Host: auth.aboutiam.com`,
      responseSnippet: `HTTP/1.1 302 Found
Location: ${redirectUri}#access_token=at_implicit_112&id_token=eyJhbGci...&state=abc321`,
      explanation: 'Vulnerability: The authorization server returns the raw active access_token in the URL fragment (`#`). This means the token is leaked directly to browser history, logs, or potential rogue browser extensions.'
    },
    {
      title: '3. Token Delivered in URL Fragment',
      desc: "The browser receives the redirect, and the single-page app parses the URL fragment to extract the tokens directly from '#'.",
      sender: 'auth_server',
      receiver: 'browser',
      channel: 'front',
      requestSnippet: `Browser loads the redirect URI fragment`,
      responseSnippet: `Token extracted: at_implicit_112`,
      explanation: 'OAuth 2.1 Upgrade: If you are building a modern SPA, always use the **Authorization Code flow with PKCE** instead of Implicit. PKCE keeps tokens completely out of the front-channel URL redirects!'
    }
  ]

  const deviceSteps: FlowStep[] = [
    {
      title: '1. Request Device Code (Back-Channel)',
      desc: 'The constrained device (e.g. Smart TV or terminal CLI) requests pairing codes from the Device Authorization Endpoint.',
      sender: 'client',
      receiver: 'auth_server',
      channel: 'back',
      requestSnippet: `POST /device/authorize HTTP/1.1
Host: auth.aboutiam.com
Content-Type: application/x-www-form-urlencoded

client_id=${clientId}&scope=openid+offline_access`,
      responseSnippet: `HTTP/1.1 200 OK
Content-Type: application/json`,
      explanation: 'Use Case: Used for internet-connected devices that have no screen, have limited keyboards, or cannot run a local browser. The device requests pairing codes, displaying one to the user.'
    },
    {
      title: '2. Display Codes & Poll (CLI / Smart TV)',
      desc: 'The device displays the user_code and verification_uri. Simultaneously, the device begins polling the token endpoint in the background.',
      sender: 'client',
      receiver: 'auth_server',
      channel: 'back',
      requestSnippet: `POST /token HTTP/1.1
Host: auth.aboutiam.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:device_code
&device_code=dc_tv_pair_889a2
&client_id=${clientId}`,
      responseSnippet: `HTTP/1.1 400 Bad Request
{ "error": "authorization_pending" }`,
      explanation: 'Device Polling: The device repeatedly hits the token endpoint (e.g. every 5 seconds). The server returns "authorization_pending" until the user enters the code in their phone or browser.'
    },
    {
      title: '3. User Authenticates & Pairs Device (Browser)',
      desc: 'The User opens their phone or computer, loads the verification_uri, enters the pairing code, and approves the connection.',
      sender: 'browser',
      receiver: 'auth_server',
      channel: 'front',
      requestSnippet: `POST /device/verify HTTP/1.1
Host: auth.aboutiam.com

user_code=ABCD-WXYZ&status=approved`,
      responseSnippet: `HTTP/1.1 200 OK
{ "message": "Device successfully authenticated!" }`,
      explanation: 'Security Concept: This bridges a browserless device with a secure browser. The user performs the actual login and MFA safely on their trusted personal smartphone.'
    },
    {
      title: '4. Device Poll Succeeds & Tokens Issued',
      desc: 'On the next polling tick, the server sees that the user authorized the pairing code and returns the token package to the device.',
      sender: 'client',
      receiver: 'auth_server',
      channel: 'back',
      requestSnippet: `POST /token HTTP/1.1 (Polling Tick)`,
      responseSnippet: `{
  "access_token": "at_device_tv_88a...",
  "token_type": "Bearer",
  "expires_in": 3600
}`,
      explanation: 'Completion: The background CLI or Smart TV is now successfully authorized under the user\'s identity context without ever typing their password on the TV screen.'
    }
  ]

  const getActiveSteps = () => {
    if (grant === 'client_credentials') return clientCredentialsSteps
    if (grant === 'implicit') return implicitSteps
    if (grant === 'device') return deviceSteps
    return pkceSteps
  }

  const activeSteps = getActiveSteps()
  const currentStepData = activeSteps[step] || activeSteps[0]

  const nextStep = () => {
    if (step < activeSteps.length - 1) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const resetFlow = () => {
    setStep(0)
    setIsApproved(false)
  }

  // Determine SVG connection animation classes
  const getLineGlow = (fromNode: string, toNode: string) => {
    if (step === 0 && fromNode === 'client' && toNode === 'browser') return 'stroke-accent-primary animate-pulse stroke-[3px]'
    const s = currentStepData.sender
    const r = currentStepData.receiver
    const channel = currentStepData.channel

    if (channel === 'front') {
      if (fromNode === 'client' && toNode === 'browser' && s === 'client' && r === 'browser') return 'stroke-accent-primary stroke-[3px]'
      if (fromNode === 'browser' && toNode === 'auth_server' && s === 'browser' && r === 'auth_server') return 'stroke-accent-primary stroke-[3px]'
      if (fromNode === 'browser' && toNode === 'auth_server' && s === 'auth_server' && r === 'browser') return 'stroke-accent-primary stroke-[3px]'
      if (fromNode === 'client' && toNode === 'browser' && s === 'auth_server' && r === 'browser') return 'stroke-accent-primary stroke-[3px]'
    } else if (channel === 'back') {
      if (fromNode === 'client' && toNode === 'auth_server' && ((s === 'client' && r === 'auth_server') || (s === 'auth_server' && r === 'client'))) {
        return 'stroke-accent-secondary stroke-[3px] stroke-dasharray-[5,5] animate-dash'
      }
    }
    return 'stroke-border-subtle stroke-[1.5px]'
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <RefreshCw className="w-3.5 h-3.5" /> Handshake Studio
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          OIDC & OAuth 2.0 Flow Visualizer
        </h2>
        <p className="text-text-secondary">
          Configure authentication endpoints, scopes, and cryptographic PKCE verifiers. Step through the handshakes to visualize Front-Channel and Back-Channel communications.
        </p>
        <p className="text-xs text-text-muted">
          Just need a code_verifier/code_challenge pair? Try the <Link to="/tools/oauth-pkce-generator" className="text-accent-primary font-semibold hover:text-accent-hover">OAuth PKCE Generator</Link> tool.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Parameters Console */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-5 h-fit shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Terminal className="w-4 h-4 text-accent-primary" /> Parameters Config
            </h4>
            
            <div className="space-y-4 text-xs">
              {/* Grant Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-text-secondary uppercase tracking-wider">Grant Type</label>
                <select 
                  value={grant}
                  onChange={(e) => setGrant(e.target.value as GrantType)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary font-semibold"
                >
                  <option value="pkce">Authorization Code + PKCE</option>
                  <option value="client_credentials">Client Credentials (M2M)</option>
                  <option value="implicit">Implicit Flow (Deprecated)</option>
                  <option value="device">Device Authorization</option>
                </select>
              </div>

              {/* Client ID */}
              <div className="space-y-1.5">
                <label className="block font-bold text-text-secondary uppercase tracking-wider">Client ID</label>
                <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono" 
                />
              </div>

              {/* Conditional Client Secret */}
              {grant === 'client_credentials' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary uppercase tracking-wider">Client Secret</label>
                  <input 
                    type="password" 
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono" 
                  />
                </div>
              )}

              {/* Scopes */}
              {grant !== 'client_credentials' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary uppercase tracking-wider">Requested Scopes</label>
                  <input 
                    type="text" 
                    value={scopes}
                    onChange={(e) => setScopes(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono" 
                  />
                </div>
              )}

              {/* Redirect URI */}
              {grant !== 'client_credentials' && grant !== 'device' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-text-secondary uppercase tracking-wider">Redirect URI</label>
                  <input 
                    type="text" 
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono" 
                  />
                </div>
              )}

              {/* PKCE Secret Keys Preview */}
              {grant === 'pkce' && (
                <div className="pt-4 border-t border-border-subtle/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-secondary uppercase">PKCE Pair</span>
                    <button 
                      onClick={generatePKCEPair}
                      className="text-[10px] text-accent-primary hover:underline font-bold"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="p-3 bg-bg-nested rounded-lg space-y-2 font-mono text-[10px]">
                    <div>
                      <span className="text-text-muted">verifier:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-text-primary truncate max-w-[120px]">{codeVerifier}</span>
                        <button onClick={() => copyToClipboard(codeVerifier, 'verifier')} className="text-text-muted hover:text-text-primary">
                          {isCopied === 'verifier' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-text-muted">challenge (S256):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-accent-secondary truncate max-w-[120px]">{codeChallenge}</span>
                        <button onClick={() => copyToClipboard(codeChallenge, 'challenge')} className="text-text-muted hover:text-text-primary">
                          {isCopied === 'challenge' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Map & Interactive Steps Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Node Interaction Diagram */}
          <div className="p-8 rounded-xl bg-bg-card border border-border-subtle relative overflow-hidden shadow-sm">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:16px_1px] pointer-events-none"></div>
            
            {/* Channel Labels */}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle/50 pb-4 mb-8">
              <span>Front-Channel (Untrusted Redirects)</span>
              <span>Back-Channel (Trusted Secure POSTs)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center justify-center min-h-[160px] relative z-10">
              {/* Node 1: Client SPA */}
              <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                currentStepData.sender === 'client' || currentStepData.receiver === 'client'
                  ? 'border-accent-primary bg-accent-glow/5 shadow-md shadow-accent-primary/5 scale-105'
                  : 'border-border-subtle bg-bg-sidebar/50'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  currentStepData.sender === 'client' || currentStepData.receiver === 'client'
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : 'bg-bg-nested text-text-secondary border-border-subtle'
                }`}>
                  <Globe className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h5 className="text-xs font-bold text-text-primary">Client SPA</h5>
                  <p className="text-[10px] text-text-muted font-mono">{clientId}</p>
                </div>
              </div>

              {/* SVG Link Connections */}
              <div className="relative h-full flex items-center justify-center col-span-1">
                {/* Visual Front Channel Pathway */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  {/* Client <-> Browser */}
                  <path d="M 0,80 Q 50,40 100,80" fill="none" className={getLineGlow('client', 'browser')} />
                  {/* Browser <-> Auth Server */}
                  <path d="M 120,80 Q 170,40 220,80" fill="none" className={getLineGlow('browser', 'auth_server')} />
                  {/* Direct Client <-> Auth Server (Backchannel) */}
                  <path d="M 0,110 L 220,110" fill="none" className={getLineGlow('client', 'auth_server')} />
                </svg>
                
                {/* Node 2: User Browser */}
                {grant !== 'client_credentials' ? (
                  <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all relative z-10 bg-bg-card ${
                    currentStepData.sender === 'browser' || currentStepData.receiver === 'browser'
                      ? 'border-accent-primary shadow-md'
                      : 'border-border-subtle'
                  }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                      currentStepData.sender === 'browser' || currentStepData.receiver === 'browser'
                        ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
                        : 'bg-bg-sidebar text-text-muted border-border-subtle'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-text-primary">Browser</span>
                  </div>
                ) : (
                  <div className="p-2 border border-border-subtle/50 rounded-lg bg-bg-sidebar/50 text-[10px] font-bold text-text-muted">
                    No Browser
                  </div>
                )}
              </div>

              {/* Node 3: Auth Server */}
              <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                currentStepData.sender === 'auth_server' || currentStepData.receiver === 'auth_server'
                  ? 'border-accent-primary bg-accent-glow/5 shadow-md shadow-accent-primary/5 scale-105'
                  : 'border-border-subtle bg-bg-sidebar/50'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  currentStepData.sender === 'auth_server' || currentStepData.receiver === 'auth_server'
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : 'bg-bg-nested text-text-secondary border-border-subtle'
                }`}>
                  <Server className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h5 className="text-xs font-bold text-text-primary">Identity Server</h5>
                  <p className="text-[10px] text-text-muted font-mono">auth.aboutiam.com</p>
                </div>
              </div>
            </div>

            {/* Stepper Controllers */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle/50">
              <span className="text-xs font-bold text-text-secondary">
                Step {step + 1} of {activeSteps.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className="px-3.5 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar text-text-secondary hover:text-text-primary text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {step < activeSteps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-md shadow-accent-primary/10 flex items-center gap-1"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={resetFlow}
                    className="px-4 py-1.5 rounded-lg border border-accent-primary bg-accent-glow hover:bg-accent-primary/20 text-accent-primary text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    Reset Flow <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Core Interactive Stepper Explanation Block */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step Explanation */}
            <div className="md:col-span-1 p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-accent-primary shrink-0" />
                  {currentStepData.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  {currentStepData.desc}
                </p>
                <div className="p-3.5 bg-bg-sidebar border border-border-subtle rounded-lg flex gap-2.5 items-start">
                  <HelpCircle className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                    {currentStepData.explanation}
                  </p>
                </div>
              </div>

              {/* Special Feature: Mock Interactive Login form in Step 2 */}
              {grant === 'pkce' && step === 1 && (
                <div className="pt-6 mt-6 border-t border-border-subtle/50 space-y-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Live Node Interaction</span>
                  <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs space-y-2.5 shadow-inner">
                    <span className="font-bold text-text-primary text-[10px] uppercase block text-center pb-1.5 border-b border-border-subtle/30">Mock Login Endpoint</span>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-text-secondary">Username</label>
                      <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-1.5 rounded bg-bg-card border border-border-subtle text-text-primary font-mono text-[10px]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-text-secondary">Password</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-1.5 rounded bg-bg-card border border-border-subtle text-text-primary font-mono text-[10px]" 
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1.5">
                      <input 
                        type="checkbox" 
                        id="consent-check" 
                        checked={isApproved} 
                        onChange={(e) => setIsApproved(e.target.checked)}
                        className="rounded border-border-subtle" 
                      />
                      <label htmlFor="consent-check" className="text-[9px] font-bold text-text-secondary">Approve scopes: OpenID, Profile</label>
                    </div>
                    <button
                      onClick={nextStep}
                      disabled={!isApproved}
                      className="w-full py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-[10px] font-bold rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Authenticate & Authorize
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Network Packet Inspector */}
            <div className="md:col-span-2 p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-secondary" /> Packet inspector
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase">HTTP Raw Packets</span>
              </div>

              <div className="space-y-4">
                {/* Request */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-accent-primary uppercase">
                    <span>HTTP Request</span>
                    <button onClick={() => copyToClipboard(currentStepData.requestSnippet, 'request')} className="text-text-muted hover:text-text-primary">
                      {isCopied === 'request' ? <span className="text-status-success text-[9px]">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-bg-sidebar border border-border-subtle/50 text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre-wrap break-all max-h-[160px] overflow-y-auto">
                    {currentStepData.requestSnippet}
                  </pre>
                </div>

                {/* Response */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-accent-secondary uppercase">
                    <span>HTTP Response</span>
                    <button onClick={() => copyToClipboard(currentStepData.responseSnippet, 'response')} className="text-text-muted hover:text-text-primary">
                      {isCopied === 'response' ? <span className="text-status-success text-[9px]">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-bg-sidebar border border-border-subtle/50 text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre-wrap break-all max-h-[160px] overflow-y-auto">
                    {currentStepData.responseSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
