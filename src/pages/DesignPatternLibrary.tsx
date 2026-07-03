import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, ArrowRight, ShieldCheck, 
  Terminal, Settings, Layers, AlertTriangle, Cpu
} from 'lucide-react'

type PatternType = 'b2b_sso' | 'token_exchange' | 'passwordless'

interface PatternDetails {
  name: string
  subtitle: string
  problemStatement: string
  architectureOverview: string
  tradeoffs: { title: string; desc: string }[]
  sequenceFlow: string[]
  checklist: string[]
}

const PATTERN_DATA: Record<PatternType, PatternDetails> = {
  b2b_sso: {
    name: 'B2B Multi-Tenant Federated SSO & Provisioning',
    subtitle: 'Enterprise-grade tenant isolation, domain-based SSO redirection, and automated user synchronization.',
    problemStatement: 'Enterprise SaaS customers demand that their employees authenticate utilizing their own existing corporate identity providers (e.g. Okta, Entra ID) and expect automated provisioning/de-provisioning when employees join or leave the company, preventing manual account overheads and access leakage.',
    architectureOverview: 'Federates the SaaS central authentication broker with multiple tenant-specific identity directories using SAML 2.0 / OIDC. Implements domain-based routing (intercepting email suffixes like `@corp-a.com` to redirect to Tenant A\'s IdP) and exposes an RFC 7644 SCIM 2.0 endpoint for real-time CRUD user sync.',
    tradeoffs: [
      { title: 'Shared DB with Row-Level Security (RLS)', desc: 'Highly cost-effective and simple to deploy, but risks accidental cross-tenant data leakage if SQL queries are malformed.' },
      { title: 'Database-per-Tenant Isolation', desc: 'Guarantees absolute compliance and cryptographic isolation, but incurs heavy infrastructure scaling costs and cluster database migration overheads.' }
    ],
    sequenceFlow: [
      'User accesses tenant landing page: `company-a.saasapp.com`.',
      'SaaS Router identifies Tenant A context and retrieves registered IDP configurations.',
      'SaaS redirects the user’s browser carrying a SAMLRequest/OIDC authorization payload to Tenant A\'s Okta directory.',
      'User completes corporate MFA; Okta redirects browser back carrying a cryptographically signed assertion.',
      'SaaS central broker validates the signature, maps claims, and opens an isolated database session.'
    ],
    checklist: [
      'Implement strict subdomain and email-domain parsing algorithms at the ingress layer.',
      'Support both metadata-URL-syncing and manual XML upload for customer SAML certificates.',
      'Expose standard, token-secured `/Users` and `/Groups` SCIM 2.0 endpoints.',
      'Enable strict SAML Assertion signature validation, ensuring XML signature wrapping (SSW) is prevented.'
    ]
  },
  token_exchange: {
    name: 'API Gateway Token Exchange & Delegation (RFC 8693)',
    subtitle: 'Swapping external user-scoped tokens for restricted, machine-specific downstream credentials.',
    problemStatement: 'A public client application (SPA or mobile app) accesses a secure API Gateway with a high-privilege user access token. However, calling downstream microservices with the same token violates the least privilege principle, exposing user permissions to internal network components and risking token replay attacks across internal systems.',
    architectureOverview: 'Enforces the RFC 8693 Token Exchange standard. The edge API Gateway acts as a Token Exchange client: it accepts the incoming user token, requests the central security token service (STS) to validate it, and exchanges it for a restricted, short-lived, service-to-service JWT token containing limited scopes mapped strictly for downstream microservice boundaries.',
    tradeoffs: [
      { title: 'Edge Token Exchange', desc: 'Ensures absolute downstream isolation and microservice security, but adds database network latency overheads on the token-swap round-trip.' },
      { title: 'Shared Gateway Cache', desc: 'Allows downstream proxies to cached token exchanges locally, speeding up requests, but increases token revocation synchronization lag.' }
    ],
    sequenceFlow: [
      'Client SPA calls Edge API Gateway with standard User Access Token (Scope: `user.write`).',
      'API Gateway validates the token and extracts identity attributes.',
      'API Gateway calls Security Token Service (STS) `/token` endpoint with `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`.',
      'STS validates parameters and issues a restricted, machine-scoped downstream JWT (Scope: `service.billing.write`).',
      'API Gateway forwards request to billing microservice carrying only the restricted downstream token.'
    ],
    checklist: [
      'Configure the central STS to accept and parse standard RFC 8693 `subject_token` and `actor_token` parameters.',
      'Ensure exchanged downstream tokens have highly restricted lifetimes (e.g. 5 minutes max).',
      'Set up mutual TLS (mTLS) to secure the backchannel transport between API Gateway, STS, and downstream microservices.',
      'Map aud (Audience) claims strictly on exchanged tokens to restrict them to specific backend microservice domains.'
    ]
  },
  passwordless: {
    name: 'Passwordless FIDO2 / WebAuthn Customer Journey',
    subtitle: 'Implementing phishing-proof public-key credential registration and authentication loops.',
    problemStatement: 'Relying on traditional passwords leads to massive security liabilities: corporate users fall victim to phishing links, share credentials, and suffer from password reuse. Standard MFA channels like SMS OTP or push notifications are prone to interception, SIM-swapping, and push fatigue hacking.',
    architectureOverview: 'Implements WebAuthn (W3C/FIDO2) public-key cryptography directly inside the application browser context. During registration, the browser requests the device’s hardware TPM to generate an asymmetric key pair, keeping the private key locked in hardware and sending the public key to the relying party (SaaS backend). During login, the user completes local biometrics (TouchID, FaceID) to sign a cryptographic challenge.',
    tradeoffs: [
      { title: 'Passkey Cloud Sync (Apple/Google)', desc: 'Provides seamless, user-friendly recovery and cross-device synchronization, but removes absolute hardware binding controls required by ultra-high-risk systems.' },
      { title: 'Hardware-Bound Security Keys (YubiKey)', desc: 'Guarantees absolute physical identity ownership and is completely uncopyable, but introduces recovery friction if the physical key is lost.' }
    ],
    sequenceFlow: [
      'User clicks "Login with Passkey" and enters their username.',
      'SaaS server generates a random challenge and returns registration options, including the Relying Party ID.',
      'Browser invokes `navigator.credentials.create()` (or `.get()` for login), triggering local biometrics.',
      'Device TPM signs the challenge, and browser returns the signature payload and credential ID.',
      'SaaS server verifies the signature against the stored public key, establishing the secure session.'
    ],
    checklist: [
      'Enforce strict verification of `clientDataJSON` and `authenticatorData` bytes on the server backend.',
      'Verify that the incoming `origin` matches the registered application custom domain exactly to prevent phishing relays.',
      'Validate and record the signature counter to detect cloned or replayed authenticator payloads.',
      'Provide fallback authentication options (e.g., recovery codes) during initial passkey setup.'
    ]
  }
}

export default function DesignPatternLibrary() {
  const [activePattern, setActivePattern] = useState<PatternType>('b2b_sso')
  const pattern = PATTERN_DATA[activePattern]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Page Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Design Pattern Library</h1>
            <p className="text-xs text-text-secondary">Hardened reference patterns, sequence flows, trade-offs, and implementation checklists</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Library
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Pattern Selector */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Design Pattern
            </span>

            <div className="flex flex-col gap-2">
              {(Object.keys(PATTERN_DATA) as PatternType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActivePattern(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition flex items-center justify-between ${activePattern === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                >
                  <span>{key === 'b2b_sso' ? 'B2B Multi-Tenant' : key === 'token_exchange' ? 'Token Exchange' : 'Passwordless FIDO2'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activePattern === key ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick info panel */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-primary" /> Hardened Standards
            </h3>
            <p className="text-[10px] text-text-secondary leading-normal">
              Every design pattern in this library complies strictly with established IETF, W3C, and OpenID Foundation standards, guaranteeing industry-grade interoperability.
            </p>
          </div>
        </div>

        {/* Right column: Content references */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Hero Card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <BookOpen className="w-24 h-24 text-accent-primary" />
            </div>

            <div>
              <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
                {activePattern === 'b2b_sso' ? 'Multi-Tenancy' : activePattern === 'token_exchange' ? 'Delegation' : 'Passwordless'}
              </span>
              <h2 className="text-xl font-black text-text-primary mt-2.5">{pattern.name}</h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-1">{pattern.subtitle}</p>
            </div>

            <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="border border-status-danger/20 bg-status-danger/5 p-3.5 rounded-lg text-text-secondary">
                <span className="font-extrabold text-status-danger block mb-0.5 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Problem Statement
                </span>
                {pattern.problemStatement}
              </div>

              <div className="border border-accent-primary/25 bg-accent-glow p-3.5 rounded-lg text-text-secondary">
                <span className="font-extrabold text-accent-primary block mb-0.5 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Solution Architecture
                </span>
                {pattern.architectureOverview}
              </div>
            </div>
          </div>

          {/* Sequence Flow vs Trade-offs split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sequence Flow Stepper */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-400" /> Architectural Sequence Flow
              </span>
              
              <div className="space-y-3">
                {pattern.sequenceFlow.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                    <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade-offs Analysis */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-400" /> Architectural Trade-offs
                </span>
                
                <div className="space-y-3">
                  {pattern.tradeoffs.map((trade) => (
                    <div key={trade.title} className="p-3 bg-bg-nested/40 border border-border-subtle rounded-lg text-xs leading-normal">
                      <span className="font-bold text-accent-primary block mb-0.5">{trade.title}</span>
                      <span className="text-text-secondary">{trade.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-subtle bg-bg-nested/10 p-2 text-[10px] text-text-muted font-mono text-center">
                Review security vs performance vectors before selection.
              </div>
            </div>

          </div>

          {/* Implementation Checklist block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-accent-primary" /> Core Implementation Checklist
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-normal">
              {pattern.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-status-success mt-0.5 font-bold shrink-0 text-sm">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
