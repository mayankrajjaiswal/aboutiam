import { useState } from 'react'
import { 
  Search, X, Copy, CheckCircle2, ExternalLink, Terminal, Layers, Check, Wand2
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Product {
  name: string
  type: 'Open Source' | 'Enterprise SaaS' | 'Workforce SaaS' | 'Secrets Engine' | 'PAM & Access'
  license: string
  deployment: string
  bestUse: string
  protocols: {
    oidc: boolean
    saml: boolean
    scim: boolean
    fido2: boolean
    ldap: boolean
  }
  integrationSnippet: string
  snippetLang: string
}

export default function Explore() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('All')
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const products: Product[] = [
    {
      name: 'Keycloak',
      type: 'Open Source',
      license: 'Apache-2.0',
      deployment: 'Self-hosted (Docker, Kubernetes, Bare-Metal)',
      bestUse: 'Best for standard, highly customizable, and fully self-hosted Open Source Identity Provider (IdP) infrastructures.',
      protocols: { oidc: true, saml: true, scim: false, fido2: true, ldap: true },
      snippetLang: 'yaml',
      integrationSnippet: `# Spring Security Configuration for Keycloak OIDC
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: aboutiam-spa
            client-secret: sec_keycloak_9922a
            scope: openid, profile, email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          keycloak:
            issuer-uri: https://auth.company.com/realms/aboutiam`
    },
    {
      name: 'Authentik',
      type: 'Open Source',
      license: 'GPL-3.0',
      deployment: 'Self-hosted (Docker-Compose, Helm Chart)',
      bestUse: 'Ideal for tech-savvy DevOps teams wanting a modern, lightweight Open Source SSO portal with unified proxy outposts.',
      protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
      snippetLang: 'yaml',
      integrationSnippet: `# Authentik Outpost Proxy Configuration
version: "3.4"
services:
  authentik-outpost:
    image: ghcr.io/goauthentik/proxy:2026.3.1
    ports:
      - "9000:9000"
    environment:
      AUTHENTIK_HOST: "https://auth.company.com"
      AUTHENTIK_TOKEN: "ak_outpost_token_99b82c..."
      AUTHENTIK_INSECURE: "false"`
    },
    {
      name: 'Auth0 / Okta',
      type: 'Enterprise SaaS',
      license: 'Commercial SaaS',
      deployment: 'Cloud Multi-tenant SaaS / Private Cloud',
      bestUse: 'Premium customer identity (CIAM) integrations, providing instant social logins, analytics, and passwordless authentication.',
      protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: false },
      snippetLang: 'javascript',
      integrationSnippet: `// Auth0 React SPA Integration Script
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

export function App() {
  return (
    <Auth0Provider
      domain="aboutiam.us.auth0.com"
      clientId="client_auth0_spa_9921"
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email"
      }}
    >
      <MainApp />
    </Auth0Provider>
  );
}`
    },
    {
      name: 'Microsoft Entra ID',
      type: 'Workforce SaaS',
      license: 'Enterprise Commercial',
      deployment: 'Microsoft Azure Cloud Native SaaS',
      bestUse: 'Defacto workforce employee management, offering tight integration with Office 365, Active Directory syncs, and heavy GPOs.',
      protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
      snippetLang: 'javascript',
      integrationSnippet: `// Microsoft MSAL.js OIDC Configuration
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "entra-client-guid-002a3b",
    authority: "https://login.microsoftonline.com/entra-tenant-id",
    redirectUri: "https://aboutiam.com/callback"
  },
  cache: {
    cacheLocation: "sessionStorage"
  }
};

const msalInstance = new PublicClientApplication(msalConfig);`
    },
    {
      name: 'Teleport Access',
      type: 'PAM & Access',
      license: 'Apache-2.0 / Enterprise',
      deployment: 'Self-hosted Proxy / Managed Cloud',
      bestUse: 'Perfect for privileged access management (PAM), securing servers, databases, and Kubernetes clusters with session recordings.',
      protocols: { oidc: true, saml: true, scim: false, fido2: true, ldap: false },
      snippetLang: 'yaml',
      integrationSnippet: `# Teleport SSH Role Resource Map
kind: role
metadata:
  name: infrastructure-db-admin
spec:
  allow:
    logins: [root, ec2-user]
    node_labels:
      'env': 'production'
    db_users: ['postgres', 'admin']
    db_names: ['*']
  options:
    max_session_ttl: 1h # Ephemeral Just-in-Time session limit`
    },
    {
      name: 'HashiCorp Vault',
      type: 'Secrets Engine',
      license: 'BSL 1.1 / Commercial',
      deployment: 'Self-hosted (Binary, Helm) / Managed Cloud',
      bestUse: 'The leading centralized secret engine, storing passwords, API keys, and dynamically issuing ephemeral database users.',
      protocols: { oidc: true, saml: false, scim: false, fido2: false, ldap: true },
      snippetLang: 'bash',
      integrationSnippet: `# Enable OIDC Auth Role in HashiCorp Vault CLI
vault auth enable oidc

vault write auth/oidc/config \\
    oidc_discovery_url="https://auth.company.com/realms/aboutiam" \\
    oidc_client_id="vault-client-id" \\
    oidc_client_secret="sec_vault_002"

vault write auth/oidc/role/developer \\
    user_claim="sub" \\
    allowed_redirect_uris="https://vault.company.com/ui/vault/auth/oidc/oidc/callback" \\
    policies="developer-policy" \\
    ttl="1h"`
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  // Filter products by search and select category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.bestUse.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'All' || p.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Layers className="w-3.5 h-3.5" /> Identity Landscape
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Landscape Directory
        </h2>
        <p className="text-text-secondary">
          Browse and compare leading Open Source Identity Servers, Enterprise SaaS vendors, PAM proxies, and Secret Engines. Study license details and retrieve sample integration scripts.
        </p>
      </div>

      {/* SEO Lead Magnet Banner */}
      <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-accent-primary text-white flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-text-primary">Not sure which Identity Provider to choose?</span>
            <p className="text-[11px] text-text-secondary font-medium">Use our interactive 3-step consultative wizard to calculate your perfect architectural match.</p>
          </div>
        </div>
        <Link
          to="/explore/matchmaker"
          className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shrink-0 shadow"
        >
          Launch Auth Matchmaker →
        </Link>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-card p-4 rounded-xl border border-border-subtle shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 pl-10 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" 
            placeholder="Search products (e.g. Keycloak)..." 
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          {['All', 'Open Source', 'Enterprise SaaS', 'PAM & Access', 'Secrets Engine'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterType === t 
                  ? 'bg-accent-primary text-white border-accent-primary' 
                  : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProducts.map((p, i) => (
          <div 
            key={i} 
            className="group p-6 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {p.type}
                </span>
                <span className="text-[10px] font-bold text-text-muted">{p.license}</span>
              </div>
              <h4 className="text-xl font-black text-text-primary group-hover:text-accent-primary transition-colors">
                {p.name}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {p.bestUse}
              </p>

              {/* Mini Protocol Check Indicators */}
              <div className="pt-4 border-t border-border-subtle/50 space-y-2">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Standard Protocols</span>
                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase">
                  {Object.entries(p.protocols).map(([name, supported]) => (
                    <span 
                      key={name}
                      className={`px-2 py-0.5 rounded border ${
                        supported 
                          ? 'bg-status-success/5 border-status-success/15 text-status-success' 
                          : 'bg-bg-nested/30 border-border-subtle text-text-muted line-through'
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Modal Trigger */}
            <div className="pt-6 mt-6 border-t border-border-subtle/50">
              <button
                onClick={() => setActiveProduct(p)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-sidebar hover:bg-accent-glow hover:text-accent-primary text-text-primary text-xs font-extrabold transition-colors border border-border-subtle group"
              >
                View Product Blueprint <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Detail Modal Drawer */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveProduct(null)}></div>

          {/* Modal Card */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90svh] animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
              <div className="space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {activeProduct.type}
                </span>
                <h3 className="text-2xl font-black text-text-primary">{activeProduct.name} Blueprint</h3>
              </div>
              <button 
                onClick={() => setActiveProduct(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-bg-sidebar hover:text-text-primary transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Metadata Info */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-1.5">
                <span className="font-bold text-text-muted uppercase text-[9px] tracking-wider block">Deployment Target</span>
                <p className="text-text-primary font-bold leading-normal">{activeProduct.deployment}</p>
              </div>
              <div className="p-4 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-1.5">
                <span className="font-bold text-text-muted uppercase text-[9px] tracking-wider block">Core License</span>
                <p className="text-text-primary font-bold leading-normal">{activeProduct.license}</p>
              </div>
            </div>

            {/* Protocol Support Checklist Matrix */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Detailed Protocol Support Matrix</span>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(activeProduct.protocols).map(([proto, supported]) => (
                  <div 
                    key={proto} 
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                      supported 
                        ? 'border-status-success/30 bg-status-success/5 text-status-success' 
                        : 'border-border-subtle bg-bg-sidebar/30 text-text-muted'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{proto}</span>
                    {supported ? (
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                    ) : (
                      <X className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Integration Snippet */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-secondary" /> Sample Integration Snippet
                </span>
                <button 
                  onClick={() => copyToClipboard(activeProduct.integrationSnippet)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle transition-colors focus:outline-none"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-bold uppercase">{isCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/50 text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                {activeProduct.integrationSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
