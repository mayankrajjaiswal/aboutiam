import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, Search, ArrowLeft, Layers, ShieldCheck, 
  Terminal, Check, ShieldAlert, Network,
  Info, Calendar, Building
} from 'lucide-react'

// Define Standard Types
interface IdentityStandard {
  id: string
  title: string
  fullname: string
  rfcs: string[]
  year: string
  summary: string
  problem: string
  whyExists: string
  flowchart: string
  messageFormat: string
  vulnerabilities: string[]
  bestPractices: string[]
  vendorSupport: string[]
  relatedResources: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

export default function StandardsExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStandardId, setActiveStandardId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'flow' | 'security' | 'vendors'>('summary')

  // Curated Living Identity Standards Directory
  const STANDARDS: IdentityStandard[] = [
    {
      id: 'oauth21',
      title: 'OAuth 2.1',
      fullname: 'Consolidated Authorization Framework',
      rfcs: ['RFC 6749', 'RFC 7636 (PKCE)', 'RFC 8252', 'RFC 6819'],
      year: '2024 / 2025',
      summary: 'OAuth 2.1 consolidates secure best-practices from OAuth 2.0, deprecating vulnerable Implicit and Resource Owner Password Credentials grants and mandating PKCE.',
      problem: 'OAuth 2.0 had multiple legacy grant types (Implicit, Password) that exposed security credentials in browser histories and redirect flows, leading to token thefts.',
      whyExists: 'To establish a secure-by-default baseline for modern API and application authorization without legacy security loopholes.',
      flowchart: `
+-------------------------------------------------------------+
|                OAUTH 2.1 PKCE HANDSHAKE FLOW                |
+-------------------------------------------------------------+

  [ Browser Client / SPA ]              [ Authorization Server ]
             |                                     |
             |--- 1. /authorize + challenge ------>|
             |<-- 2. Redirect + Auth Code ---------|
             |                                     |
             |--- 3. /token + verifier ----------->|
             |<-- 4. Access Token (JWT) -----------|
`,
      messageFormat: `// Token Exchange Token Request (POST /token)
POST /token HTTP/1.1
Host: auth.company.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https://app.company.com/callback
&client_id=spa-client-1
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`,
      vulnerabilities: [
        'Authorization Code Interception (Mitigated by PKCE).',
        'Open Redirection URI Hijacking.',
        'Token replay via un-constrained Bearer credentials (Mitigated by DPoP).'
      ],
      bestPractices: [
        'Mandate PKCE S256 verifications on all public clients.',
        'Validate redirects against exact string comparisons, disabling wildcard matching.',
        'Enforce Sender-Constrained tokens (DPoP) on high-risk APIs.'
      ],
      vendorSupport: [
        'Thales STA and OneWelcome: Complete compliance with visual orchestration.',
        'Okta / Auth0: Complete native compliance.',
        'Keycloak: Enforces OAuth 2.1 constraints out-of-the-box in modern versions.',
        'Microsoft Entra ID: Supports PKCE S256 and auth code flows.'
      ],
      relatedResources: [
        { title: 'OAuth Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' },
        { title: 'OAuth PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' },
        { title: 'OAuth 2.0 Attack Lab', path: '/playground/oauth-attack', type: 'playground' }
      ]
    },
    {
      id: 'oidc',
      title: 'OIDC 1.0',
      fullname: 'OpenID Connect Core 1.0',
      rfcs: ['OIDC Core 1.0 Specs'],
      year: '2014',
      summary: 'OpenID Connect is a simple identity layer built on top of the OAuth 2.0 protocol, enabling Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server.',
      problem: 'OAuth 2.0 was designed for authorization (delegated access), leaving developers to hand-roll custom user authentication structures, leading to non-standard, vulnerable "Login with OAuth" implementations.',
      whyExists: 'To standardize user authentication, introducing a cryptographically signed ID Token (JWT) and a standard /userinfo endpoint.',
      flowchart: `
+-------------------------------------------------------------+
|                     OIDC CORE HANDSHAKE                     |
+-------------------------------------------------------------+

  [ Browser Client / SPA ]              [ OIDC Identity Server ]
             |                                     |
             |--- 1. Login Request (scope=openid)->|
             |<-- 2. ID Token + Access Token ------|
             |                                     |
             |--- 3. GET /userinfo + token ------->|
             |<-- 4. User Profile Claims (JSON) ---|
`,
      messageFormat: `// Decoded ID Token (Header & Payload Claims)
{
  "alg": "RS256",
  "kid": "key-123"
}
{
  "iss": "https://auth.company.com",
  "sub": "user_id_9981",
  "aud": "spa-client-1",
  "exp": 1783430000,
  "name": "Alex Identity",
  "email": "alex@company.com"
}`,
      vulnerabilities: [
        'Algorithm Confusion (tampering with JWT headers to alg: none).',
        'JWKS Spoofing (re-routing key checks to attacker keys).',
        'ID Token leakage in public browser history.'
      ],
      bestPractices: [
        'Always validate JWT signatures on downstream resource gates.',
        'Cache and rate-limit JWKS endpoint fetches strictly.',
        'Reject "none" algorithms explicitly in signature verification libraries.'
      ],
      vendorSupport: [
        'Thales OneWelcome and STA: Extensively supports OIDC federated login, identity assertions, and secure /userinfo claims.',
        'Auth0 / Clerk: Complete native compliance.',
        'Ping Identity: Highly customizable enterprise OIDC configurations.',
        'Microsoft Entra ID: Direct workforce and guest user OIDC flows.'
      ],
      relatedResources: [
        { title: 'OIDC Discovery Auditor Tool', path: '/tools/oidc-discovery', type: 'tool' },
        { title: 'JWKS Inspector Tool', path: '/tools/jwks-inspector', type: 'tool' },
        { title: 'JWT Studio & Exploit Arena', path: '/playground/jwt', type: 'playground' }
      ]
    },
    {
      id: 'scim20',
      title: 'SCIM 2.0',
      fullname: 'System for Cross-domain Identity Management',
      rfcs: ['RFC 7643', 'RFC 7644'],
      year: '2015',
      summary: 'SCIM 2.0 is an HTTP-based protocol designed to simplify user provisioning and identity management in multi-tenant cloud applications and services.',
      problem: 'Manual user onboarding, offboarding, and directory synchronization across hundreds of separate corporate SaaS apps led to high operational overhead and orphaned accounts.',
      whyExists: 'To define a standardized, REST/JSON-based resource schema for Users and Groups, enabling automated Identity Lifecycle synchronization.',
      flowchart: `
+-------------------------------------------------------------+
|                 SCIM 2.0 USER PROVISIONING                  |
+-------------------------------------------------------------+

       [ Corporate Directory / IdP ]           [ B2B SaaS Application ]
                     |                                    |
                     |--- 1. POST /Users (JSON User) ---->|
                     |<-- 2. HTTP 201 Created ------------|
                     |                                    |
                     |--- 3. PATCH /Users (Update) ------>|
                     |<-- 4. HTTP 204 No Content ---------|
`,
      messageFormat: `// SCIM Create User Payload (POST /Users)
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "brian@company.com",
  "name": {
    "familyName": "Secure",
    "givenName": "Brian"
  },
  "emails": [{
    "value": "brian@company.com",
    "primary": true
  }],
  "active": true
}`,
      vulnerabilities: [
        'Unauthenticated provisioning endpoints exposing employee attributes.',
        'SQL and LDAP injection vectors via SCIM filter queries (e.g. filter=userName eq "admin").',
        'Data leaks via nested custom attribute extensions.'
      ],
      bestPractices: [
        'Secure SCIM API endpoints strictly using OAuth 2.0 Bearer tokens or mTLS certificates.',
        'Sanitize and validate filter parameter parameters strictly before querying databases.',
        'Validate incoming SCIM payloads against strict, defined schema blueprints.'
      ],
      vendorSupport: [
        'Thales OneWelcome: Fully compliant SCIM 2.0 endpoints for user registration, syncing, and external provisioning.',
        'Okta / Entra ID: Native push-provisioning directories.',
        'Keycloak: Extensible user-sync provisioning modules.',
        'SailPoint: Complete IGA catalog sync hooks.'
      ],
      relatedResources: [
        { title: 'SCIM Payload Validator Tool', path: '/tools/scim-payload-validator', type: 'tool' },
        { title: 'SCIM Diff Tool', path: '/tools/scim-diff', type: 'tool' },
        { title: 'SCIM Sync Provisioning Lab', path: '/playground/scim', type: 'playground' }
      ]
    }
  ]

  // Filter and search logic
  const filteredStandards = useMemo(() => {
    return STANDARDS.filter(std => {
      const matchQuery = 
        std.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return matchQuery
    })
  }, [searchQuery])

  const activeStandard = useMemo(() => {
    return STANDARDS.find(s => s.id === activeStandardId)
  }, [activeStandardId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 shrink-0 select-none">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <BookOpen className="w-3.5 h-3.5" /> Initiative 5 Milestone
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Living Standards & RFC Explorer
          </h1>
          <p className="text-sm text-text-secondary">
            Deconstruct complex digital identity standards and specifications visually. Trace sequences, raw payloads, and security considerations in-browser.
          </p>
        </div>
        {activeStandardId && (
          <button
            onClick={() => { setActiveStandardId(null); setActiveTab('summary'); }}
            className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Standards Inventory
          </button>
        )}
      </div>

      {/* STANDARDS DIRECTORY LIST VIEW */}
      {!activeStandardId ? (
        <div className="space-y-6">
          
          {/* SEARCH BAR */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-10 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="Search OIDC, SCIM, FIDO2, RFCs..."
              />
            </div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider hidden md:inline-block">
              Listing {filteredStandards.length} Standards
            </span>
          </div>

          {/* STANDARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStandards.map((std) => (
              <div 
                key={std.id}
                className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-accent-primary hover:shadow transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-accent-glow text-accent-primary border border-accent-primary/25 rounded-lg text-xs font-mono font-bold">
                      {std.title}
                    </span>
                    <span className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent-primary" /> {std.year}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-text-primary tracking-tight">
                      {std.fullname}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                      {std.summary}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border-subtle/30 pt-4 mt-6 flex items-center justify-between">
                  <span className="text-[9px] text-text-muted font-black uppercase font-mono tracking-wide">
                    {std.rfcs.join(' | ')}
                  </span>
                  <button
                    onClick={() => { setActiveStandardId(std.id); setActiveTab('summary'); }}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all shadow-md shadow-accent-primary/10"
                  >
                    Deconstruct RFC
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        
        /* ================= STANDARD DETAIL VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-h-0">
          
          {/* LEFT SUB-NAV MENU */}
          <div className="lg:col-span-1 flex flex-col gap-3 shrink-0 select-none">
            {[
              { id: 'summary', label: '📖 Executive Summary', desc: 'Why it exists & historical context' },
              { id: 'flow', label: '🏗️ Visual Protocol Flow', desc: 'ASCII handshakes & message formats' },
              { id: 'security', label: '🛡️ Security & Pitfalls', desc: 'Vulnerabilities & best practices' },
              { id: 'vendors', label: '🏢 Vendor Support', desc: 'Vendor adoption & references' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'summary' | 'flow' | 'security' | 'vendors')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  activeTab === tab.id 
                    ? 'border-accent-primary bg-accent-glow/50 text-accent-primary shadow-sm' 
                    : 'border-border-subtle bg-bg-card hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* RIGHT DETAILED CANVAS */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            
            {/* Header Title Card */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                  IDENTITY STANDARD DECONSTRUCTION
                </span>
                <h2 className="text-xl font-black text-text-primary mt-1">{activeStandard?.title} — {activeStandard?.fullname}</h2>
              </div>
              <div className="text-xs font-bold font-mono text-text-muted hidden md:inline-block">
                {activeStandard?.rfcs.join(' | ')}
              </div>
            </div>

            {/* TAB CONTENT 1: EXECUTIVE SUMMARY */}
            {activeTab === 'summary' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5"><Info className="w-4 h-4 text-accent-primary" /> Why It Exists</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.whyExists}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">The Problem Statement</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.problem}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Scope Summary</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VISUAL PROTOCOL FLOW */}
            {activeTab === 'flow' && activeStandard && (
              <div className="space-y-6">
                
                {/* Sequence flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-accent-primary animate-pulse" /> Interactive Protocol Sequence Handshake
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStandard.flowchart}
                  </pre>
                </div>

                {/* Message format */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-accent-primary" /> Compliant Message Exchange Formats
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStandard.messageFormat}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SECURITY & PITFALLS */}
            {activeTab === 'security' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Security Vulnerabilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStandard.vulnerabilities.map((vuln, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-xs text-text-secondary leading-relaxed">
                        {vuln}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-status-success" /> Defensive Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStandard.bestPractices.map((bp, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-success/5 border border-status-success/10 text-xs text-text-secondary leading-relaxed">
                        {bp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: VENDOR SUPPORT & CONTEXT */}
            {activeTab === 'vendors' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-accent-primary" /> Active Enterprise Vendor Adoption
                  </h3>
                  <ul className="space-y-2.5">
                    {activeStandard.vendorSupport.map((ven, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-text-secondary leading-normal">
                        <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {ven}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* RELATED HANDS-ON WORKBUNCH RESOURCES */}
            {activeStandard && activeStandard.relatedResources && (
              <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4 shrink-0">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" /> Related Interactive Workbenches & Simulators
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Validate these protocol concepts immediately inside our browser-native simulators and utility toolsets.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeStandard.relatedResources.map((res, i) => (
                    <Link
                      key={i}
                      to={res.path}
                      className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[8px] font-mono uppercase text-accent-primary font-bold">{res.type}</span>
                        <h4 className="text-xs font-black text-text-primary group-hover:text-accent-primary mt-0.5 leading-snug">{res.title}</h4>
                      </div>
                      <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold">&rarr; Run Workbench</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )
}
