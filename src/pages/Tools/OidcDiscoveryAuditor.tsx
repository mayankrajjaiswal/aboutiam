import { useState, useMemo } from 'react'
import { FileJson, Check, Copy, Server, Globe, ShieldCheck, Key } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('oidc-discovery')!

const SAMPLES = {
  google: {
    name: 'Google Accounts OIDC',
    json: `{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code id_token"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "email",
    "profile"
  ],
  "claims_supported": [
    "aud",
    "email",
    "email_verified",
    "exp",
    "family_name",
    "given_name",
    "sub"
  ]
}`
  },
  entra: {
    name: 'Microsoft Entra ID Common',
    json: `{
  "issuer": "https://login.microsoftonline.com/common/v2.0",
  "authorization_endpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  "token_endpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  "jwks_uri": "https://login.microsoftonline.com/common/discovery/v2.0/keys",
  "response_types_supported": [
    "code",
    "id_token",
    "code id_token",
    "token id_token"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "profile",
    "email",
    "offline_access"
  ],
  "claims_supported": [
    "sub",
    "iss",
    "cloud_instance_name",
    "preferred_username",
    "name"
  ]
}`
  },
  okta: {
    name: 'Okta Developer Server',
    json: `{
  "issuer": "https://dev-12345.okta.com",
  "authorization_endpoint": "https://dev-12345.okta.com/oauth2/v1/authorize",
  "token_endpoint": "https://dev-12345.okta.com/oauth2/v1/token",
  "userinfo_endpoint": "https://dev-12345.okta.com/oauth2/v1/userinfo",
  "jwks_uri": "https://dev-12345.okta.com/oauth2/v1/keys",
  "response_types_supported": [
    "code",
    "id_token",
    "token"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "profile",
    "email",
    "offline_access",
    "groups"
  ],
  "claims_supported": [
    "iss",
    "sub",
    "aud",
    "exp",
    "iat",
    "auth_time",
    "groups"
  ]
}`
  }
}

export default function OidcDiscoveryAuditor() {
  const { copy, copiedId } = useClipboardCopy()
  const [rawJson, setRawJson] = useState(SAMPLES.google.json)

  const handleProviderChange = (key: keyof typeof SAMPLES) => {
    setRawJson(SAMPLES[key].json)
  }

  // Parse OIDC discovery payload parameters
  const parsedData = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson)
      if (!parsed || typeof parsed !== 'object') {
        return { error: 'Payload must be a valid JSON object.' }
      }

      return {
        issuer: parsed.issuer || 'Missing',
        authorizationEndpoint: parsed.authorization_endpoint || 'Missing',
        tokenEndpoint: parsed.token_endpoint || 'Missing',
        jwksUri: parsed.jwks_uri || 'Missing',
        scopes: Array.isArray(parsed.scopes_supported) ? parsed.scopes_supported : [],
        responseTypes: Array.isArray(parsed.response_types_supported) ? parsed.response_types_supported : [],
        signingAlgs: Array.isArray(parsed.id_token_signing_alg_values_supported) ? parsed.id_token_signing_alg_values_supported : [],
        error: null
      }
    } catch (e) {
      return { error: `Invalid JSON syntax: ${e instanceof Error ? e.message : String(e)}` }
    }
  }, [rawJson])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Raw JSON metadata input */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle flex-1 flex flex-col justify-between shadow-sm min-h-[350px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-accent-primary" /> OIDC Metadata Source
                </span>
                <select
                  onChange={e => handleProviderChange(e.target.value as keyof typeof SAMPLES)}
                  className="bg-bg-sidebar border border-border-subtle rounded px-2 py-1 text-[10px] text-text-primary font-bold focus:outline-none"
                >
                  <option value="google">Load Google</option>
                  <option value="entra">Load Entra ID</option>
                  <option value="okta">Load Okta</option>
                </select>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed mb-3">
                Paste any standard `/.well-known/openid-configuration` JSON payload here to audit its federated endpoint registry.
              </p>
            </div>

            <textarea
              value={rawJson}
              onChange={e => setRawJson(e.target.value)}
              placeholder="Paste openid-configuration JSON here..."
              className="flex-grow w-full bg-bg-sidebar border border-border-subtle/80 rounded-lg p-3 text-[11px] font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none h-[240px] leading-normal"
            />
          </div>
        </div>

        {/* Right pane: Extracted endpoints and analysis */}
        <div className="lg:col-span-7 space-y-4">
          {parsedData.error ? (
            <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-3 animate-fadeIn">
              <FileJson className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-sm block">Parsing Failure</span>
                <span className="text-xs text-text-primary leading-normal">{parsedData.error}</span>
              </div>
            </div>
          ) : (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-status-success" /> Extracted Endpoint & Policy Registry
              </span>

              {/* Endpoint card block */}
              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block mb-0.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Issuer URI (iss)
                  </span>
                  <div className="flex justify-between items-center bg-bg-sidebar p-2 rounded border border-border-subtle/40">
                    <span className="text-text-primary truncate select-all">{parsedData.issuer}</span>
                    <button type="button" onClick={() => copy(parsedData.issuer || '', 'iss')} className="text-text-muted hover:text-text-primary shrink-0 ml-2">
                      {copiedId === 'iss' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block mb-0.5 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" /> Authorization Endpoint
                  </span>
                  <div className="flex justify-between items-center bg-bg-sidebar p-2 rounded border border-border-subtle/40">
                    <span className="text-text-primary truncate select-all">{parsedData.authorizationEndpoint}</span>
                    <button type="button" onClick={() => copy(parsedData.authorizationEndpoint || '', 'auth')} className="text-text-muted hover:text-text-primary shrink-0 ml-2">
                      {copiedId === 'auth' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block mb-0.5 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" /> Token Endpoint
                  </span>
                  <div className="flex justify-between items-center bg-bg-sidebar p-2 rounded border border-border-subtle/40">
                    <span className="text-text-primary truncate select-all">{parsedData.tokenEndpoint}</span>
                    <button type="button" onClick={() => copy(parsedData.tokenEndpoint || '', 'token')} className="text-text-muted hover:text-text-primary shrink-0 ml-2">
                      {copiedId === 'token' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted text-[10px] uppercase font-bold block mb-0.5 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Public Keys Endpoint (jwks_uri)
                  </span>
                  <div className="flex justify-between items-center bg-bg-sidebar p-2 rounded border border-border-subtle/40">
                    <span className="text-text-primary truncate select-all">{parsedData.jwksUri}</span>
                    <button type="button" onClick={() => copy(parsedData.jwksUri || '', 'jwks')} className="text-text-muted hover:text-text-primary shrink-0 ml-2">
                      {copiedId === 'jwks' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Supported lists (Scopes/signing algorithms) */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-bg-sidebar rounded-xl border border-border-subtle/50 space-y-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block border-b border-border-subtle/50 pb-1">
                    Supported Scopes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.scopes?.map((s: string) => (
                      <span key={s} className="text-[9px] font-bold bg-accent-glow border border-accent-primary/20 px-1.5 py-0.5 rounded text-accent-primary font-mono">
                        {s}
                      </span>
                    )) || <span className="text-text-muted italic text-[10px]">Unspecified</span>}
                  </div>
                </div>

                <div className="p-3.5 bg-bg-sidebar rounded-xl border border-border-subtle/50 space-y-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block border-b border-border-subtle/50 pb-1">
                    Signing Algorithms
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.signingAlgs?.map((s: string) => (
                      <span key={s} className="text-[9px] font-bold bg-status-success/15 border border-status-success/25 px-1.5 py-0.5 rounded text-status-success font-mono">
                        {s}
                      </span>
                    )) || <span className="text-text-muted italic text-[10px]">Unspecified</span>}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
