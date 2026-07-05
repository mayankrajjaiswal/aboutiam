import { Link } from 'react-router-dom'
import { Cpu, Key, Play, Fingerprint, Lock, Shield, Server, RefreshCw, Bot, Wallet, Activity, Network, Terminal, Sparkles, Sliders, KeySquare, Eye, Laptop, Scale, Radio, BadgeCheck } from 'lucide-react'

export default function PlaygroundCatalog() {
  const playgrounds = [
    {
      title: "OAuth 2.0 & OIDC Flow Visualizer",
      desc: "Visualize real-time authorization code, implicit, device, and PKCE handshakes step-by-step with live HTTP parameters.",
      icon: RefreshCw,
      link: "/playground/oauth",
      badge: "Active (Core)",
    },
    {
      title: "JWT Studio & Exploit Arena",
      desc: "Decode, sign, and verify JSON Web Tokens, and run interactive simulations showcasing the none-algorithm exploit or JWKS spoofing.",
      icon: Key,
      link: "/playground/jwt",
      badge: "Active (Core)",
    },
    {
      title: "SAML 2.0 XML Workbench",
      desc: "Build Assertion packages and run XML signature verifications inside an interactive mock Service Provider (SP) and Identity Provider (IdP).",
      icon: Lock,
      link: "/playground/saml",
      badge: "Active (Standard)",
    },
    {
      title: "FIDO2 / WebAuthn & Passkeys Lab",
      desc: "Simulate credential creation and assertions, and view raw clientDataJSON and authenticatorData payloads parsed directly in-browser.",
      icon: Fingerprint,
      link: "/playground/fido2",
      badge: "Active (Standard)",
    },
    {
      title: "Access Control Lab (RBAC vs ABAC)",
      desc: "Build RBAC directories, configure attribute matrices (ABAC), and dynamically evaluate permissions inside a real-time decision console.",
      icon: Shield,
      link: "/playground/access",
      badge: "Active (Standard)",
    },
    {
      title: "LDAP Tree Simulator",
      desc: "Visualize nested organizational units (OUs), group members, and query a mock Active Directory using standard LDAP search string syntax.",
      icon: Server,
      link: "/playground/ldap",
      badge: "Active (Standard)",
    },
    {
      title: "Zero Trust Planner",
      desc: "Model dynamic trust score evaluation algorithms and PEP/PDP controls natively inside your browser.",
      icon: RefreshCw,
      link: "/playground/zta",
      badge: "Active (Standard)",
    },
    {
      title: "SCIM Provisioning & Sync Lab",
      desc: "Simulate identity lifecycles (Joiner/Mover/Leaver) and visual sync pipelines evaluating SCIM 2.0 user/group endpoints.",
      icon: Cpu,
      link: "/playground/scim",
      badge: "Active (Advanced)",
    },
    {
      title: "OAuth 2.0 Attack Lab",
      desc: "Execute and mitigate common token vulnerabilities step-by-step: PKCE bypasses, wildcard redirects, and state CSRF exploits.",
      icon: Shield,
      link: "/playground/oauth-attack",
      badge: "Active (Core)",
    },
    {
      title: "Kerberos Tickets Lab",
      desc: "Visualize Active Directory ticketing (AS/TGS) and run Golden Ticket and Silver Ticket bypass exploits.",
      icon: Server,
      link: "/playground/kerberos",
      badge: "Active (Standard)",
    },
    {
      title: "Identity CTF Hacking Arena",
      desc: "Crack and solve client-side identity security puzzles: JWT none algorithm bypass, SAML wrapped assertions, and LDAP query injections.",
      icon: Terminal,
      link: "/playground/ctf",
      badge: "Active (Core)",
    },
    {
      title: "Identity Architect (AI Builder)",
      desc: "Model dynamic target requirements to automatically generate secure, compliance-ready enterprise architectures, threat maps, and policies.",
      icon: Sparkles,
      link: "/playground/identity-architect",
      badge: "Active (Advanced)",
    },
    {
      title: "Enterprise IAM Reference Builder",
      desc: "Drag-and-drop identity components (IdPs, Directories, PAM, Workstations) onto an interactive canvas to configure connections and trace secure protocol handshakes.",
      icon: Network,
      link: "/playground/reference-builder",
      badge: "Active (Advanced)",
    },
    {
      title: "Session Hijacking & Token Theft Lab",
      desc: "Emulate session cookie theft via infostealers, paste and replay stolen tokens against protected APIs, and apply modern mitigations like IP binding, DPoP, and CAEP.",
      icon: Shield,
      link: "/playground/session-hijacking",
      badge: "Active (Advanced)",
    },
    {
      title: "Conditional Access Policy Simulator",
      desc: "Model dynamic trust gates and evaluate logon context parameters (device compliance, untrusted networks, geo-IP ranges, risk scores) in real-time.",
      icon: Sliders,
      link: "/playground/conditional-access",
      badge: "Active (Standard)",
    },
    {
      title: "Open Policy Agent (OPA) & Rego Playground",
      desc: "Write fine-grained access policies using Regos declarative language, configure input JSON context, and step-through compiled rules.",
      icon: KeySquare,
      link: "/playground/opa",
      badge: "Active (Advanced)",
    },
    {
      title: "Active Directory GPO Simulator",
      desc: "Configure Default Domain GPO security variables, simulate client logon lockouts, and inspect issued Kerberos TGT ticket lifespans.",
      icon: Server,
      link: "/playground/gpo-simulator",
      badge: "Active (Standard)",
    },
    {
      title: "JWT Signature Secret Cracker",
      desc: "Run client-side dictionary attacks against weak HS256 tokens to crack and discover the signature secret within seconds.",
      icon: Key,
      link: "/playground/jwt-cracker",
      badge: "Active (Core)",
    },
    {
      title: "mTLS & Certificate Chain Validator",
      desc: "Model dynamic Certificate Authority trust chains, simulate intermediate CRL/OCSP revocations, and audit mTLS connection handshakes.",
      icon: Network,
      link: "/playground/cert-chain",
      badge: "Active (Standard)",
    },
    {
      title: "AI vs Identity Threat Lab",
      desc: "Simulate Generative AI voice deepfake attacks against legacy MFA and witness how FIDO2 hardware bounds defeat synthetic cloning.",
      icon: Bot,
      link: "/playground/ai-threat-lab",
      badge: "Active (Advanced)",
    },
    {
      title: "Zero-Knowledge Proof (ZKP) Wallet",
      desc: "Explore decentralized Self-Sovereign Identity. Generate mathematical proofs confirming your age without exposing your raw birthdate.",
      icon: Wallet,
      link: "/playground/zkp-wallet",
      badge: "Active (Advanced)",
    },
    {
      title: "Continuous Ambient Trust Decayer",
      desc: "Visualize post-2030 systems where real-time biometric telemetry (keystrokes, location) constantly decays or fortifies session trust.",
      icon: Activity,
      link: "/playground/ambient-trust",
      badge: "Active (Advanced)",
    },
    {
      title: "NHI Workload Mesh (SPIFFE)",
      desc: "Simulate service-to-service attestations, issuing dynamic X.509 SVID credentials to secure microservice pipelines without static API keys.",
      icon: Network,
      link: "/playground/workload-mesh",
      badge: "Active (Advanced)",
    },
    {
      title: "Token Exchange Lab (RFC 8693)",
      desc: "Exchange incoming user security assertions for scoped downstream APIs access tokens dynamically using delegation or impersonation parameters.",
      icon: Key,
      link: "/playground/token-exchange",
      badge: "Active (Standard)",
    },
    {
      title: "Identity Threat Detection (ITDR) Lab",
      desc: "Monitor authentication security streams in real-time, inject brute-force, geovelocity travel or push bombing attacks, and trigger active lockout countermeasures.",
      icon: Eye,
      link: "/playground/itdr",
      badge: "Active (Standard)",
    },
    {
      title: "Device Posture Attestation Lab",
      desc: "Model Zero Trust endpoint handshakes checking workstation firewalls, disk encryption states, OS kernels, and client certificates.",
      icon: Laptop,
      link: "/playground/device-trust",
      badge: "Active (Standard)",
    },
    {
      title: "Passkey Internals Playground",
      desc: "Deconstruct the binary authenticatorData and CBOR COSE public keys byte-by-byte during WebAuthn public-key registrations.",
      icon: Fingerprint,
      link: "/playground/passkey-internals",
      badge: "Active (Advanced)",
    },
    {
      title: "XACML 3.0 Policy Engine",
      desc: "Evaluate real combining-algorithm semantics — deny-overrides, permit-overrides, first-applicable, and only-one-applicable — against an editable request context.",
      icon: Scale,
      link: "/playground/xacml",
      badge: "Active (Advanced)",
    },
    {
      title: "GNAP Grant Negotiation Visualizer",
      desc: "Step through the RFC 9635 grant request, interaction, continuation, and key-bound token issuance timeline.",
      icon: Radio,
      link: "/playground/gnap",
      badge: "Active (Standard)",
    },
    {
      title: "CAEP Continuous Access Evaluation Lab",
      desc: "Push signed Security Event Tokens (SETs) from a transmitter to receivers and watch sessions revoke or re-evaluate in real time.",
      icon: Activity,
      link: "/playground/caep",
      badge: "Active (Standard)",
    },
    {
      title: "Verifiable Credentials & DID Lab",
      desc: "Issue, hold, and verify a real Ed25519-signed Verifiable Credential and Presentation across an Issuer/Holder/Verifier flow.",
      icon: BadgeCheck,
      link: "/playground/vc-did",
      badge: "Active (Advanced)",
    }
  ]

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Cpu className="w-3.5 h-3.5" /> Interactive Sandboxes
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Identity Playground Catalog
        </h2>
        <p className="text-text-secondary">
          No cloud tokens or configuration hassles. Run full cryptographic handshakes, decode payloads, and simulate common security exploits natively client-side.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playgrounds.map((pg, i) => (
          <div key={i} className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                  <pg.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  pg.badge.includes('v1') 
                    ? 'bg-status-success/10 border-status-success/20 text-status-success' 
                    : 'bg-text-muted/10 border-border-subtle text-text-secondary'
                }`}>
                  {pg.badge}
                </span>
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                {pg.title}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">{pg.desc}</p>
            </div>
            <div className="pt-6 border-t border-border-subtle/50 mt-6">
              <Link
                to={pg.link}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-bg-sidebar hover:bg-accent-glow hover:text-accent-primary text-text-primary text-sm font-semibold transition-colors border border-border-subtle group"
              >
                Launch Sandbox <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Exploit Spotlight Banner */}
      <div className="p-6 rounded-2xl bg-status-danger/5 border border-status-danger/20 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans mt-8 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-status-danger tracking-wider block">Vulnerability Alert</span>
          <h4 className="text-base font-bold text-text-primary">Test Real-World Identity Exploits Natively</h4>
          <p className="text-xs text-text-secondary font-medium">
            Our playgrounds aren't just empty forms. Open the <strong>JWT Studio</strong> to trigger none-algorithm signature bypasses, or launch the <strong>SAML Workbench</strong> to run XML Signature Wrapping (SSW) injections.
          </p>
        </div>
        <Link
          to="/wall-of-shame"
          className="w-full sm:w-auto text-center px-4 py-2.5 bg-status-danger hover:bg-status-danger/90 text-white text-xs font-black uppercase rounded-lg shadow-md shadow-status-danger/10 transition-all shrink-0"
        >
          Enter Breach Museum →
        </Link>
      </div>
    </div>
  )
}
