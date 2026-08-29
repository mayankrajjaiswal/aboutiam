import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Key, Play, Fingerprint, Lock, Shield, Server, RefreshCw, Bot, Wallet, Activity, Network, Terminal, Sparkles, Sliders, KeySquare, Eye, Laptop, Scale, Radio, BadgeCheck, Mail, ShieldAlert, UserPlus, ClipboardCheck, Gauge, Vault, Cloud, ScanSearch, ClipboardList, GitBranch, ArrowLeftRight, Waypoints, ScanFace, Landmark, Glasses, Siren, Share2, Gamepad2, Layers, Smartphone, Zap } from 'lucide-react'
import BookmarkButton from '../components/BookmarkButton'
import TaskFilterRow from '../components/TaskFilterRow'
import { PLAYGROUND_TASK_TAGS } from '../data/playgroundTaskTags'
import type { TaskTag } from '../data/taskTags'

export default function PlaygroundCatalog() {
  const [taskFilter, setTaskFilter] = useState<TaskTag | null>(null)
  const playgrounds = [
    {
      title: "OAuth 2.0 & OIDC Flow Visualizer",
      desc: "Visualize real-time authorization code, implicit, device, and PKCE handshakes step-by-step with live HTTP parameters.",
      icon: RefreshCw,
      link: "/playground/oauth",
      badge: "Active (Core)",
      enterpriseProducts: "Microsoft Entra ID, Okta, Ping Identity, Thales OneWelcome"
    },
    {
      title: "JWT Studio & Exploit Arena",
      desc: "Decode, sign, and verify JSON Web Tokens, and run interactive simulations showcasing the none-algorithm exploit or JWKS spoofing.",
      icon: Key,
      link: "/playground/jwt",
      badge: "Active (Core)",
      enterpriseProducts: "Auth0, PingFederate, Keycloak"
    },
    {
      title: "SAML 2.0 XML Workbench",
      desc: "Build Assertion packages and run XML signature verifications inside an interactive mock Service Provider (SP) and Identity Provider (IdP).",
      icon: Lock,
      link: "/playground/saml",
      badge: "Active (Standard)",
      enterpriseProducts: "CyberArk, Microsoft Entra ID, PingIdentity"
    },
    {
      title: "FIDO2 / WebAuthn & Passkeys Lab",
      desc: "Simulate credential creation and assertions, and view raw clientDataJSON and authenticatorData payloads parsed directly in-browser.",
      icon: Fingerprint,
      link: "/playground/fido2",
      badge: "Active (Standard)",
      enterpriseProducts: "Thales SafeNet Trusted Access, Okta, YubiKey"
    },
    {
      title: "Access Control Lab (RBAC vs ABAC)",
      desc: "Build RBAC directories, configure attribute matrices (ABAC), and dynamically evaluate permissions inside a real-time decision console.",
      icon: Shield,
      link: "/playground/access",
      badge: "Active (Standard)",
      enterpriseProducts: "PingAccess, AWS IAM, Open Policy Agent"
    },
    {
      title: "LDAP Tree Simulator",
      desc: "Visualize nested organizational units (OUs), group members, and query a mock Active Directory using standard LDAP search string syntax.",
      icon: Server,
      link: "/playground/ldap",
      badge: "Active (Standard)",
      enterpriseProducts: "Microsoft Active Directory, PingDirectory"
    },
    {
      title: "Zero Trust Planner",
      desc: "Model dynamic trust score evaluation algorithms and PEP/PDP controls natively inside your browser.",
      icon: RefreshCw,
      link: "/playground/zta",
      badge: "Active (Standard)",
      enterpriseProducts: "Thales SafeNet Trusted Access, Cloudflare Access"
    },
    {
      title: "SCIM Provisioning & Sync Lab",
      desc: "Simulate identity lifecycles (Joiner/Mover/Leaver) and visual sync pipelines evaluating SCIM 2.0 user/group endpoints.",
      icon: Cpu,
      link: "/playground/scim",
      badge: "Active (Advanced)",
      enterpriseProducts: "SailPoint, Saviynt, Okta Lifecycle Management"
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
      enterpriseProducts: "Microsoft Active Directory"
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
      enterpriseProducts: "Microsoft Entra ID Conditional Access, Thales SafeNet"
    },
    {
      title: "Open Policy Agent (OPA) & Rego Playground",
      desc: "Write fine-grained access policies using Regos declarative language, configure input JSON context, and step-through compiled rules.",
      icon: KeySquare,
      link: "/playground/opa",
      badge: "Active (Advanced)",
      enterpriseProducts: "Styra Declarative Authorization"
    },
    {
      title: "Active Directory GPO Simulator",
      desc: "Configure Default Domain GPO security variables, simulate client logon lockouts, and inspect issued Kerberos TGT ticket lifespans.",
      icon: Server,
      link: "/playground/gpo-simulator",
      badge: "Active (Standard)",
    },
    {
      title: "AD/LDAP OU & Schema Designer",
      desc: "Build an Organizational Unit tree from scratch — add nested OUs, groups, and users, apply GPOs that cascade through inheritance (or block it), and export the result as valid LDIF.",
      icon: Server,
      link: "/playground/ldap-schema-designer",
      badge: "Active (Standard)",
      enterpriseProducts: "Microsoft Active Directory, PingDirectory"
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
      title: "Liveness Detection & Injection Attack Lab",
      desc: "Pit presentation-replay, camera-feed-injection, and real-time face-swap attacks against static-photo, flash-challenge, depth-motion, and full ISO 30107-3 PAD-scoring defenses to see which defense catches which attack class and why.",
      icon: ScanFace,
      link: "/playground/liveness-injection",
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
      title: "Agentic Identity & MCP Trust",
      desc: "Design secure delegation pipelines for non-human AI agents, configure OAuth 2.1 on-behalf-of trust chains, and enforce scope narrowing to contain blast radius under sub-agent compromise.",
      icon: Bot,
      link: "/playground/agent-identity",
      badge: "Active (Advanced)",
    },
    {
      title: "NHI Sprawl Cleanup Game",
      desc: "Triage a seeded fleet of service accounts, API keys, and CI/CD tokens against a real non-human-identity governance rubric — rotate what's stale, revoke what's orphaned or over-privileged, and keep what's legitimately still in use.",
      icon: ScanSearch,
      link: "/playground/nhi-sprawl",
      badge: "Active (Advanced)",
    },
    {
      title: "Passkey Fleet Rollout Strategist",
      desc: "Play CISO: allocate a fixed rollout budget across platform SDKs, help-desk training, legacy-fallback sunset, and account recovery, then see a year of quarterly outcomes scored against real 2026 industry benchmarks.",
      icon: Fingerprint,
      link: "/playground/passkey-rollout-strategist",
      badge: "Active (Advanced)",
    },
    {
      title: "IAM Modernization Backlog Game",
      desc: "Sequence 20 realistic legacy-IAM tech-debt items into a 12-month roadmap under a fixed quarterly budget — respect dependency ordering, stay within budget, and maximize risk reduction per dollar.",
      icon: ClipboardList,
      link: "/playground/modernization-backlog",
      badge: "Active (Advanced)",
    },
    {
      title: "Build-Your-Own-IdP Sandbox",
      desc: "Assemble a minimal OIDC Provider step by step — generate signing keys, configure the discovery document, register a client, build a consent screen — then watch a mock Relying Party consume it and complete a real signed login, entirely offline.",
      icon: KeySquare,
      link: "/playground/build-your-idp",
      badge: "Active (Advanced)",
    },
    {
      title: "OpenID4VC Wallet Studio",
      desc: "Issue a real SD-JWT verifiable credential, store it in a mock wallet, and selectively disclose only the claims a verifier actually requested — the OID4VCI/OID4VP flow behind eIDAS 2.0 EUDI Wallets.",
      icon: Wallet,
      link: "/playground/openid4vc-wallet",
      badge: "Active (Advanced)",
    },
    {
      title: "Trust Registry & Issuer Governance Explorer",
      desc: "Verify a presented credential against a chosen national trust registry — see cross-border recognition gaps between registries and watch a revoked issuer fail authorization even though its signature is still cryptographically valid.",
      icon: Landmark,
      link: "/playground/trust-registry",
      badge: "Active (Advanced)",
    },
    {
      title: "FAPI 2.0 / Open Banking Security Profile Lab",
      desc: "Simulate the three controls FAPI 2.0 adds on top of plain OAuth 2.0 for financial-grade APIs — Pushed Authorization Requests, sender-constrained tokens, and signed authorization responses — and watch each one independently block a real attack.",
      icon: ShieldAlert,
      link: "/playground/fapi2",
      badge: "Active (Advanced)",
    },
    {
      title: "CAEP Event Storm Visualizer",
      desc: "Fire a Continuous Access Evaluation Protocol (CAEP) event from a mock IdP and watch it fan out to multiple subscribed relying parties in real time — each with its own subscription list, latency, and enforcement decision.",
      icon: Radio,
      link: "/playground/caep-event-storm",
      badge: "Active (Advanced)",
    },
    {
      title: "Legacy & Academic Federation Playground",
      desc: "RADIUS AAA Access-Request/Access-Accept exchanges, TACACS+'s separated authentication/authorization/accounting phases, and a Shibboleth/eduGAIN WAYF discovery-service redirect — the protocols still running enormous amounts of real enterprise network-auth and academic federation infrastructure today.",
      icon: Radio,
      link: "/playground/legacy-federation",
      badge: "Active (Advanced)",
    },
    {
      title: "Avatar & Spatial Identity Verification Lab",
      desc: "A headset-only VR/AR session has no front-facing camera and is often a shared device. Pit wallet-based cryptographic age attestation against continuous behavioral/gesture telemetry across four risk scenarios — mid-session handoff, unattended takeover, a motion-capture replay bot, and deliberate credential lending — to see why neither alone catches everything.",
      icon: Glasses,
      link: "/playground/spatial-identity-lab",
      badge: "Active (Advanced)",
    },
    {
      title: "OT/ICS Device Identity & Segmentation Simulator",
      desc: "Toggle a factory-floor topology (PLCs, HMIs, sensors) between a flat network and identity-based microsegmentation, trigger a ransomware injection at an HMI, and compare the lateral-movement blast radius between the two modes.",
      icon: Cpu,
      link: "/playground/ot-ics-identity",
      badge: "Active (Advanced)",
    },
    {
      title: "Identity Fabric / Orchestration Flow Builder",
      desc: "Wire a legacy protocol-only app to a modern protocol-only IdP through an orchestration node and watch the trace log narrate each protocol-translation step — models IdP migration without app rewrites and consistent policy enforcement across heterogeneous IdPs.",
      icon: Waypoints,
      link: "/playground/identity-fabric",
      badge: "Active (Advanced)",
    },
    {
      title: "Identity Attack-Path Graph Visualizer",
      desc: "A BloodHound-style force-directed graph — click hop-by-hop through a seeded identity graph to trace a privilege-escalation path from a low-privilege user to Domain Admin or Cloud Admin, then reveal the true shortest path and its real-world techniques.",
      icon: GitBranch,
      link: "/playground/attack-path-graph",
      badge: "Active (Advanced)",
    },
    {
      title: "Cloud Entitlement Graph Explorer (CIEM Lite)",
      desc: "Click a role in a seeded AWS-style IAM policy graph to see toxic privilege-escalation combinations (like iam:PassRole + lambda:CreateFunction), compare granted vs. effective permissions across cross-account trust chains, and shrink a role to least privilege from a mock access log.",
      icon: GitBranch,
      link: "/playground/ciem-explorer",
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
      enterpriseProducts: "Auth0, Keycloak"
    },
    {
      title: "Identity Threat Detection (ITDR) Lab",
      desc: "Monitor authentication security streams in real-time, inject brute-force, geovelocity travel or push bombing attacks, and trigger active lockout countermeasures.",
      icon: Eye,
      link: "/playground/itdr",
      badge: "Active (Standard)",
      enterpriseProducts: "Okta ITDR, CyberArk"
    },
    {
      title: "Device Posture Attestation Lab",
      desc: "Model Zero Trust endpoint handshakes checking workstation firewalls, disk encryption states, OS kernels, and client certificates.",
      icon: Laptop,
      link: "/playground/device-trust",
      badge: "Active (Standard)",
      enterpriseProducts: "Microsoft Intune, JumpCloud"
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
    },
    {
      title: "Identity Broker & Federation Sandbox",
      desc: "Explore multi-tenant single sign-on (SSO), federation routing, and real-time SAML-to-OIDC token translation topologies.",
      icon: Network,
      link: "/playground/identity-broker",
      badge: "Active (Advanced)",
      enterpriseProducts: "Okta, Azure AD, PingIdentity, Thales OneWelcome"
    },
    {
      title: "Passwordless Magic Link & Step-Up Auth Lab",
      desc: "Log in with nothing but an email inbox, then watch policy force a stronger WebAuthn/OTP factor before a high-risk action is authorized.",
      icon: Mail,
      link: "/playground/magic-link-stepup",
      badge: "Active (Beginner)",
    },
    {
      title: "Credential Stuffing & Password Spray Defense Lab",
      desc: "Replay leaked credential pairs against a mock login endpoint, then toggle rate-limiting, CAPTCHA, breached-password detection, and lockout to drop the takeover rate to zero.",
      icon: ShieldAlert,
      link: "/playground/credential-stuffing",
      badge: "Active (Beginner)",
    },
    {
      title: "CIAM Consent & Progressive Profiling Sandbox",
      desc: "Grant or deny individual OAuth scopes on a social-login consent screen, then watch a customer-identity app collect profile fields progressively across sessions.",
      icon: UserPlus,
      link: "/playground/ciam-consent",
      badge: "Active (Core)",
    },
    {
      title: "Access Certification Campaign Simulator",
      desc: "Play the reviewer role in a quarterly access recertification campaign — approve or revoke entitlements and watch Separation-of-Duties (SoD) conflicts get flagged automatically.",
      icon: ClipboardCheck,
      link: "/playground/access-certification",
      badge: "Active (Standard)",
      enterpriseProducts: "SailPoint, Saviynt, Omada"
    },
    {
      title: "Role Mining Workbench",
      desc: "Run Jaccard-similarity clustering over a seeded 30-user entitlement matrix to discover candidate roles — accept, reject, and merge proposals while watching the orphan-entitlement count drop.",
      icon: Network,
      link: "/playground/role-mining",
      badge: "Active (Standard)",
      enterpriseProducts: "SailPoint, Saviynt, Omada"
    },
    {
      title: "Access Request Cart Simulator",
      desc: "Shop a mock entitlement catalog and submit a request through a deterministic approval chain — manager approval, app-owner sign-off for privileged items, and a compliance-officer override for Separation-of-Duties conflicts.",
      icon: ClipboardCheck,
      link: "/playground/access-request-cart",
      badge: "Active (Standard)",
      enterpriseProducts: "SailPoint, Saviynt, Omada"
    },
    {
      title: "Adaptive Risk-Based Authentication Engine",
      desc: "Toggle risk signals (impossible travel, device reputation, behavior anomaly) and watch a composite UEBA-style score drive an allow / step-up / block decision in real time.",
      icon: Gauge,
      link: "/playground/risk-engine",
      badge: "Active (Advanced)",
    },
    {
      title: "PAM Vaulting & Just-in-Time Elevation Lab",
      desc: "Request, approve, and time-box a privileged credential checkout, then watch the vault auto-rotate the secret the instant the session ends.",
      icon: Vault,
      link: "/playground/pam-vaulting",
      badge: "Active (Advanced)",
      enterpriseProducts: "CyberArk, Thales SafeNet, HashiCorp Vault"
    },
    {
      title: "Hybrid Identity Sync Lab (PHS / PTA / Federation)",
      desc: "Compare Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) and see how each handles an on-prem network outage.",
      icon: Cloud,
      link: "/playground/hybrid-ad-sync",
      badge: "Active (Advanced)",
      enterpriseProducts: "Microsoft Entra Connect, AD FS"
    },
    {
      title: "HR-to-IdP Attribute Mapper",
      desc: "Click-to-connect mock HR fields (Workday/SAP-style) to AD/Entra/SCIM attributes, apply concat/regex/lookup-table transformations, and watch a live preview and conflict warnings update in real time.",
      icon: ArrowLeftRight,
      link: "/playground/hr-attribute-mapper",
      badge: "Active (Standard)",
      enterpriseProducts: "Workday, SAP SuccessFactors, Microsoft Entra Connect"
    },
    {
      title: "Incident Commander",
      desc: "Play incident commander during a live identity breach. Make timed branching decisions built from real AboutIAM Security Bulletins incidents — every path terminates in a scored outcome with a real-world post-mortem.",
      icon: Siren,
      link: "/playground/incident-commander",
      badge: "Active (Advanced)",
    },
    {
      title: "STIX/TAXII Identity-IOC Fan-Out Simulator",
      desc: "Assemble a STIX 2.1 object bundle for an identity-relevant indicator of compromise, publish it to a mock TAXII 2.1 collection, and watch subscriber organizations receive — or correctly not receive — it based on their own subscription filters.",
      icon: Share2,
      link: "/playground/stix-taxii-ioc",
      badge: "Active (Advanced)",
    },
    {
      title: "Gaming & Esports Identity Lab",
      desc: "Model three identity challenges unique to gaming and esports: cross-platform account linking with ban propagation, smurf/ban-evasion detection via device and behavioral signals, and continuous (not one-time) KYC for real-money wagering platforms.",
      icon: Gamepad2,
      link: "/playground/gaming-identity",
      badge: "Active (Advanced)",
    },
    {
      title: "Post-Quantum Cryptography Handshake Simulator",
      desc: "Step through classical vs. hybrid vs. pure post-quantum handshakes. Analyze key exchange sizes, signature overheads, and network packet fragmentation thresholds under FIPS 203/204 lattice cryptography.",
      icon: Cpu,
      link: "/playground/pqc-handshake",
      badge: "Active (Advanced)",
    },
    {
      title: "Advanced Passkey Policy & Attestation Workbench",
      desc: "Act as a Relying Party (RP) Security Admin configuring enterprise-grade FIDO2 / WebAuthn registration parameters. Enforce FIPS-restricted AAGUIDs, direct packed attestation anchors, and resident key storage rules.",
      icon: KeySquare,
      link: "/playground/passkey-policy",
      badge: "Active (Advanced)",
    },
    {
      title: "Workload Identity Federation & OIDC Visualizer",
      desc: "Ditch long-lived static API secrets. Secure your automated build pipelines (GitHub Actions, GitLab CI) using federated OIDC token handshakes with Cloud Providers.",
      icon: GitBranch,
      link: "/playground/workload-identity",
      badge: "Active (Advanced)",
    },
    {
      title: "Multi-Cloud Overlapping IAM Policy Evaluator",
      desc: "Step inside the heart of an enterprise Policy Evaluation Engine. Visualize and evaluate how Organization SCP boundaries, identity-based IAM permissions, and Resource policies combine to govern access.",
      icon: Layers,
      link: "/playground/cloud-policy-evaluator",
      badge: "Active (Advanced)",
    },
    {
      title: "Dynamic Trust Framework & Verifiable Presentation Playground",
      desc: "Explore the architecture of eIDAS 2.0 and the European Digital Identity (EUDI) Wallet. Selectively disclose claims, verify cryptographic SD-JWT signatures, and audit issuers against cross-border trust registries.",
      icon: Smartphone,
      link: "/playground/federated-vp",
      badge: "Active (Advanced)",
    },
    {
      title: "Autonomous Security Agent Simulation Playground",
      desc: "Deploy autonomous Red Team and Blue Team AI security agents in simulated token-hijacking and redirect-hijacking arenas. Watch security enforcers dynamically adapt, detect anomalies, and apply cryptographic defenses.",
      icon: Zap,
      link: "/playground/autonomous-agent",
      badge: "Active (Advanced)",
    }
  ]

  const visiblePlaygrounds = taskFilter
    ? playgrounds.filter((pg) => PLAYGROUND_TASK_TAGS[pg.link]?.includes(taskFilter))
    : playgrounds

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

      <TaskFilterRow selected={taskFilter} onSelect={setTaskFilter} />

      {visiblePlaygrounds.length === 0 && (
        <p className="text-sm text-text-muted text-center py-8">No playgrounds are tagged for this task yet — try "All" instead.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePlaygrounds.map((pg, i) => (
          <div key={i} className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                  <pg.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    pg.badge.includes('v1')
                      ? 'bg-status-success/10 border-status-success/20 text-status-success'
                      : 'bg-text-muted/10 border-border-subtle text-text-secondary'
                  }`}>
                    {pg.badge}
                  </span>
                  <BookmarkButton item={{ id: `playground-${pg.link}`, title: pg.title, link: pg.link }} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                {pg.title}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">{pg.desc}</p>
              
              {pg.enterpriseProducts && (
                <div className="pt-3 border-t border-border-subtle border-dashed mt-3">
                  <span className="text-[9px] font-black uppercase text-text-muted block mb-1">Implemented In</span>
                  <p className="text-[10px] text-text-secondary font-semibold leading-relaxed">{pg.enterpriseProducts}</p>
                </div>
              )}
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
