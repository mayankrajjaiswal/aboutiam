import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Network, ArrowRight, Shield, Play, Terminal, Cpu, Database, 
  Globe, Server, Users, Cloud, RefreshCw, KeySquare, ChevronRight, Laptop
} from 'lucide-react'

type ArchitectureType = 'zero_trust' | 'b2b_saas' | 'multi_cloud' | 'ciam_social' | 'oauth_oidc' | 'saml' | 'pam' | 'pki' | 'k8s_identity'

interface NodeDetails {
  title: string
  role: string
  analogy: string
  spec: string
  threatModel: string
  bestPractice: string
}

const ARCHITECTURE_DATA: Record<ArchitectureType, {
  name: string
  description: string
  nodes: Record<string, NodeDetails>
}> = {
  zero_trust: {
    name: 'Workforce Zero Trust (NIST SP 800-207)',
    description: 'An implementation of modern Zero Trust principles showing dynamic authentication, device management, and Policy Decision Point (PDP) evaluations.',
    nodes: {
      client: {
        title: 'Subject / Client Workstation',
        role: 'Initiates request, carrying real-time user attributes (department, role) and device telemetry.',
        analogy: 'A guest arriving at a bank lobby presenting their ID and showing they are not carrying unapproved items.',
        spec: 'Utilizes cryptographic Client Certificates (mTLS) and browser posture agents to bundle JWT identity claims and secure hardware bindings.',
        threatModel: 'Threat: Session hijacking via cookies / token extraction. Mitigation: Use DPoP (Demonstrating Proof-of-Possession) keys bound to hardware TPMs.',
        bestPractice: 'Enforce continuous risk-based telemetry updates instead of single-point-in-time logins.'
      },
      pep: {
        title: 'Policy Enforcement Point (PEP)',
        role: 'The gatekeeper. Intercepts all traffic, blocks access by default, and coordinates with PDP to allow/deny connection.',
        analogy: 'The physical security guard at the door of the vault who locks or unlocks the gate based on direct orders from the manager.',
        spec: 'An API Gateway, Reverse Proxy, or Service Mesh ingress (e.g. Envoy, NGINX) validating mTLS handshakes and inspecting access tokens.',
        threatModel: 'Threat: DDoS or proxy bypass. Mitigation: Ensure resources are completely hidden behind the PEP with no direct public IPs.',
        bestPractice: 'Decouple policy enforcement (PEP) entirely from policy decision (PDP) to enable rapid updates.'
      },
      pdp: {
        title: 'Policy Decision Point (PDP)',
        role: 'The brain. Evaluates request attributes against active security policies to make final ALLOW/DENY verdicts.',
        analogy: 'The bank manager sitting in the office who looks up the rules and customer record to decide if the security guard should open the gate.',
        spec: 'A centralized engine (like Open Policy Agent - OPA, or custom GRC engines) evaluating attributes based on REGO scripts or XACML schemas.',
        threatModel: 'Threat: Policy injection / hijacking. Mitigation: Enforce strict configuration-as-code pipelines and sign policy bundles.',
        bestPractice: 'Enforce a default-deny policy fallback. If the PDP engine is unresponsive, PEP must reject all traffic.'
      },
      idp: {
        title: 'Identity Provider (IdP) & MFA',
        role: 'Authenticates the user identity and issues cryptographic proof of identity (OIDC ID Tokens).',
        analogy: 'The passport office that verifies your face and documents before issuing a secure, tamper-proof passport.',
        spec: 'Workforce IdPs (e.g. Entra ID, Okta) managing standard user groups, claims, and coordinating FIDO2/WebAuthn public key challenges.',
        threatModel: 'Threat: MFA push-bombing fatigue attacks. Mitigation: Mandate context-aware number matching or pure passwordless FIDO2 keys.',
        bestPractice: 'Centralize identity attributes in a directory with automated joiner/mover/leaver provisioning.'
      },
      mdm: {
        title: 'Device Management (MDM / UEM)',
        role: 'Monitors client device health and posture (OS patch level, firewall status, certificate existence).',
        analogy: 'The state vehicle inspection office verifying that a car is safe, licensed, and equipped with functional brakes before letting it on the highway.',
        spec: 'Systems like Microsoft Intune or Jamf validating endpoint compliance, writing compliance claims directly into the IdP verification loop.',
        threatModel: 'Threat: Spoofed compliance status. Mitigation: Issue ephemeral, hardware-attested certificates to compliant devices.',
        bestPractice: 'Establish absolute zero-trust parameters for devices. Unmanaged or out-of-compliance devices are limited to low-risk resources.'
      },
      resource: {
        title: 'Protected Corporate Resource',
        role: 'The target system, database, or internal API holding sensitive organizational data.',
        analogy: 'The highly-secured safety deposit vault located inside the building that holds the gold bars.',
        spec: 'Internal Kubernetes pods, file shares, or SQL databases decoupled from direct public networks, communicating only via PEP tunnels.',
        threatModel: 'Threat: Lateral movement if PEP is breached. Mitigation: Encrypt all data-at-rest and segment internal networks.',
        bestPractice: 'Enforce micro-segmentation. Treat every sub-service or API database as its own isolated trust boundary.'
      }
    }
  },
  b2b_saas: {
    name: 'Multi-Tenant B2B SaaS Identity Architecture',
    description: 'A structural overview of multi-tenant identity partitioning, tenant-isolated routing, and automated corporate directory synchronization.',
    nodes: {
      tenant_router: {
        title: 'Tenant Router & API Gateway',
        role: 'Inspects subdomains or headers to route incoming queries to the correct isolated tenant resource layer.',
        analogy: 'The building directory board in the lobby directing visitors to Tenant A on Floor 2 vs Tenant B on Floor 3.',
        spec: 'Dynamically parses incoming URLs (e.g. `tenant-a.saasapp.com`) or custom HTTP headers (`X-Tenant-ID`) to bind routing context.',
        threatModel: 'Threat: Cross-tenant data leakage / routing injection. Mitigation: Maintain strict cryptographic tenant context isolation.',
        bestPractice: 'Validate tenant routing parameters on every single request at the gateway boundary.'
      },
      central_auth: {
        title: 'Central Auth Service',
        role: 'Coordinates logins, custom domains, and handles single-sign-on (SSO) federation loops across different customer directories.',
        analogy: 'A global airport customs desk: they check your flight ticket and direct you to federate with your home country’s passport gate.',
        spec: 'An OIDC/SAML relying party engine multiplexing auth pathways based on the user’s corporate email domain (e.g., redirecting `@corp.com` to Entra).',
        threatModel: 'Threat: SSO redirection hijack. Mitigation: Validate exact redirect URI string whitelist matches.',
        bestPractice: 'Support progressive profiling to prevent user friction during initial onboarding.'
      },
      custom_idp: {
        title: 'Enterprise IdP (Customer IdP)',
        role: 'The customer’s home identity directory (e.g. Okta, Ping), letting corporate users use their existing credentials.',
        analogy: 'The corporate office badge that employees already use daily to access their home building.',
        spec: 'Federates with the SaaS application utilizing standard SAML 2.0 or OIDC assertions, sending cryptographically signed XML/JSON payloads.',
        threatModel: 'Threat: XML Signature Wrapping (SSW) attacks. Mitigation: Ensure the signature validates the assertion element, not just the envelope.',
        bestPractice: 'Provide step-by-step SSO configuration wizards with downloadable metadata packages.'
      },
      scim_sync: {
        title: 'Directory Sync Engine (SCIM)',
        role: 'Accepts automated SCIM payloads from corporate directories to keep SaaS user databases instantly in-sync.',
        analogy: 'A direct hotline between HR departments: when an employee is let go, they immediately ring the SaaS system to deactivate their cards.',
        spec: 'An RFC 7644-compliant SCIM 2.0 endpoint handling POST/PUT/PATCH/DELETE calls on `/Users` and `/Groups` resources.',
        threatModel: 'Threat: SCIM token compromise. Mitigation: Use secure, periodically-rotated Bearer tokens or OAuth client credentials.',
        bestPractice: 'Support partial updates (PATCH) rather than full overrides (PUT) to avoid synchronization bottlenecks.'
      },
      isolated_db: {
        title: 'Isolated Database Partitioning',
        role: 'Provides complete separation of customer database layers (Database-per-tenant vs. Shared Database with Row-Level Security).',
        analogy: 'Providing tenants with individual secure locked boxes (Isolated DB) versus renting space in a shared locker with custom partitions (Row-Level).',
        spec: 'Implements PostgreSQL Row Level Security (RLS) policies binding queries to `current_setting(\'app.current_tenant_id\')`.',
        threatModel: 'Threat: SQL injection bypassing row boundaries. Mitigation: Enforce parameterized queries and dedicated database connection pools.',
        bestPractice: 'Enforce Isolated Databases for highly-regulated customers (finance, healthcare) and Row-Level Security for standard tiers.'
      }
    }
  },
  multi_cloud: {
    name: 'Multi-Cloud Identity & Machine Workloads (SPIFFE/SPIRE)',
    description: 'An architectural diagram modeling decentralized, cryptographic machine-to-machine trust across AWS, Google Cloud, and localized clusters.',
    nodes: {
      aws_workload: {
        title: 'AWS Workload Instance',
        role: 'A compute node running inside Amazon Web Services (e.g. EC2 worker, Kubernetes Pod) needing to access resources in GCP.',
        analogy: 'A foreign delivery truck crossing national borders needing to prove its cargo manifest and registration is authentic.',
        spec: 'Runs a SPIFFE Workload Agent locally which communicates over a local Unix domain socket using standard gRPC endpoints.',
        threatModel: 'Threat: Instance identity spoofing. Mitigation: Use AWS Instance Document attestation to verify exact cryptographic runtime IDs.',
        bestPractice: 'Never embed long-lived AWS IAM access keys inside pod code. Use short-lived, rotated token profiles.'
      },
      spire_agent: {
        title: 'SPIFFE / SPIRE Agent',
        role: 'A lightweight node daemon that attests local workloads and coordinates with the central server to issue local cryptographic keys.',
        analogy: 'A local passport application office: they verify your birth certificate locally before sending data to the central print office.',
        spec: 'Communicates with SPIRE Server to obtain SVIDs (SPIFFE Verifiable Identity Documents) and stores them locally in memory.',
        threatModel: 'Threat: Local Unix socket hijacking. Mitigation: Restrict socket read/write permissions to specific operating system group accounts.',
        bestPractice: 'Deploy SPIRE agents as Kubernetes DaemonSets to automate local pod attestation cycles.'
      },
      spire_server: {
        title: 'SPIRE Authority Server',
        role: 'The central authority. Verifies node attestation reports and issues cryptographically signed X.509 SVID credentials.',
        analogy: 'The central national passport bureau that prints, signs, and authorizes the secure passports.',
        spec: 'An enterprise Certificate Authority (CA) signing X.509 certificates and JWT tokens, rotating signing keys automatically every few hours.',
        threatModel: 'Threat: CA signing key compromise. Mitigation: Back the SPIRE server with a physical Hardware Security Module (HSM).',
        bestPractice: 'Establish cluster-wide federated trust bundles to bridge distinct cloud certificate registries.'
      },
      workload_mesh: {
        title: 'Workload Mesh (mTLS Proxy)',
        role: 'Intercepts out-of-cloud network requests and establishes secure Mutual TLS tunnels using issued SVIDs.',
        analogy: 'An armored transport convoy escorting the delivery trucks between clouds, keeping all communications completely invisible to eavesdroppers.',
        spec: 'Envoy proxies running in sidecar configurations, negotiating mTLS handshakes and validating the peer’s X.509 SAN namespaces.',
        threatModel: 'Threat: Insecure proxy routing. Mitigation: Restrict proxy egress to strictly defined service namespaces.',
        bestPractice: 'Keep proxy configurations light and decouple attestation logic from transport proxies.'
      },
      gcp_resource: {
        title: 'GCP Resource (Target Service)',
        role: 'The target workload or database sitting inside Google Cloud platform (e.g. Google Cloud SQL).',
        analogy: 'The secure warehouse inside Google Cloud territory that accepts authorized foreign delivery trucks.',
        spec: 'Validates incoming mTLS connections against the AWS SPIRE Server federated trust bundle, ensuring the SPIFFE ID parses correctly.',
        threatModel: 'Threat: Unauthorized cross-cloud operations. Mitigation: Enforce strict attribute checks inside Google IAM policy sets.',
        bestPractice: 'Segment resources based on SPIFFE namespaces, limiting write privileges to attested workloads.'
      }
    }
  },
  ciam_social: {
    name: 'Customer Identity & Social Login Federation (CIAM)',
    description: 'A standard Customer Identity architecture showing social directory brokers, registration workflows, and API token authorizations.',
    nodes: {
      client: {
        title: 'Customer Web Browser',
        role: 'Initiates a login request to access restricted SaaS customer accounts.',
        analogy: 'A traveler arriving at a foreign terminal and clicking "Login with Social Passport".',
        spec: 'Runs standard JavaScript code requesting OAuth redirects and storing JWT Access Tokens in memory.',
        threatModel: 'Threat: Session hijacking via malicious scripts. Mitigation: Keep Access Tokens strictly scoped and store inside secure memory bounds.',
        bestPractice: 'Enforce phishing-resistant biometrics using FIDO2 WebAuthn Passkeys wherever available.'
      },
      social_idp: {
        title: 'Social IdP (Google / Apple)',
        role: 'Authenticates the user identity and verifies their active social profile credentials.',
        analogy: 'An official state passport office verifying your fingerprint and printing your picture.',
        spec: 'Authenticates users on social realms and returns an OIDC ID Token mapping user profiles.',
        threatModel: 'Threat: Social account compromise. Mitigation: Force strict, risk-aware biometrics and MFA checks.',
        bestPractice: 'Only request minimal required permissions (email and profile scopes) during federated redirection.'
      },
      broker: {
        title: 'Central Identity Broker',
        role: 'Negotiates social redirects, parses profile claims, and handles Account Linking rules.',
        analogy: 'A hotel check-in desk that reads your foreign passport, matches it to your booking, and issues a hotel key.',
        spec: 'An OIDC Relying Party (RP) mapping custom attributes and generating SaaS-specific Access Tokens.',
        threatModel: 'Threat: Token redirection hijack. Mitigation: Enforce strict redirect URI whitelists and PKCE S256 verification.',
        bestPractice: 'Decouple auth redirections from app backends, channeling transactions through unified gateways.'
      },
      user_store: {
        title: 'Customer Profile Database',
        role: 'Maintains long-term profile data, consent receipts, and social account linking metadata keys.',
        analogy: 'The hotel secure locker containing customer registration forms and previous visit history.',
        spec: 'Highly scalable SQL/NoSQL document database containing progressive profile attributes and scopes.',
        threatModel: 'Threat: Database extraction of personal credentials. Mitigation: Encrypt all database columns at-rest and parameterize queries.',
        bestPractice: 'Implement progressive profiling, requesting optional data values dynamically across logins.'
      },
      api_gw: {
        title: 'Secure SaaS API Gateway',
        role: 'Verifies incoming customer tokens and enforces RBAC/ABAC access controls before granting access.',
        analogy: 'The security bouncer standing at the VIP entrance verifying your wristband matches the list.',
        spec: 'An API Gateway (e.g. Envoy, Kong) validating RSA signature bounds using cached public JWKS keys.',
        threatModel: 'Threat: Token signature forgery. Mitigation: Match kid parameters and verify tokens natively against JWKS.',
        bestPractice: 'Cache JWKS public keys locally to minimize latency during API handshakes.'
      }
    }
  },
  oauth_oidc: {
    name: 'OAuth 2.0 & OIDC Authorization Code Flow',
    description: 'The definitive sequence for delegating API access and federating identities securely over the web.',
    nodes: {
      user: {
        title: 'Resource Owner (User)',
        role: 'The human interacting with the client application to grant consent.',
        analogy: 'A bank customer authorizing a third-party accounting app to read their ledger.',
        spec: 'Operates via a standard User-Agent (browser) which executes HTTP redirects during the authorization flow.',
        threatModel: 'Threat: Phishing or session theft. Mitigation: Employ strong, hardware-backed MFA (WebAuthn).',
        bestPractice: 'Ensure users clearly understand requested scopes on the consent screen.'
      },
      client_app: {
        title: 'Client Application',
        role: 'The app requesting access to the Resource Server on behalf of the user.',
        analogy: 'The accounting app requesting a read-only pass to your bank.',
        spec: 'A public SPA or confidential web app registered with a client_id. Handles PKCE (S256) code verifiers securely.',
        threatModel: 'Threat: CSRF and Authorization Code Interception. Mitigation: Enforce strict PKCE and exact redirect URIs.',
        bestPractice: 'Never store client secrets in public clients (SPAs/Mobile). Use PKCE exclusively.'
      },
      auth_server: {
        title: 'Authorization Server (IdP)',
        role: 'Authenticates the user, records consent, and issues secure tokens.',
        analogy: 'The bank’s security office that verifies your identity and issues a restricted temporary badge.',
        spec: 'Exposes /authorize (front-channel) and /token (back-channel) OIDC endpoints. Issues JWT access and ID tokens.',
        threatModel: 'Threat: Open redirect attacks. Mitigation: Strictly enforce whitelisted, exact-match redirect_uri verification.',
        bestPractice: 'Keep token lifetimes extremely short (e.g., 5 minutes) and rely on rotating refresh tokens.'
      },
      resource_server: {
        title: 'Resource Server (API)',
        role: 'Hosts the protected data and honors valid access tokens.',
        analogy: 'The bank teller who checks the restricted temporary badge before handing over the ledger.',
        spec: 'An API validating incoming Bearer JWTs locally via JWKS or remotely via Token Introspection (RFC 7662).',
        threatModel: 'Threat: Replay attacks. Mitigation: Enforce Sender-Constrained tokens (DPoP or mTLS).',
        bestPractice: 'Validate token signature, expiration, issuer, and audience on every single API request.'
      }
    }
  },
  saml: {
    name: 'SAML 2.0 Enterprise Web SSO',
    description: 'The legacy XML-based federation standard driving corporate SSO across enterprise boundaries.',
    nodes: {
      user: {
        title: 'Employee (Browser)',
        role: 'The corporate employee navigating to a protected SaaS application.',
        analogy: 'An employee presenting their corporate badge at a partner building.',
        spec: 'Routes base64-encoded XML payloads (SAMLRequest / SAMLResponse) between the SP and IdP via HTTP-POST or HTTP-Redirect.',
        threatModel: 'Threat: Browser history token leakage. Mitigation: Set strict Cache-Control headers on SSO endpoints.',
        bestPractice: 'Initiate SP-initiated flows rather than IdP-initiated to prevent unsolicited login attacks.'
      },
      sp: {
        title: 'Service Provider (SP)',
        role: 'The SaaS application consuming the identity assertion to create a local session.',
        analogy: 'The partner building checking the cryptographic seal on the employee\'s corporate badge.',
        spec: 'Generates AuthnRequests and exposes an Assertion Consumer Service (ACS) endpoint to ingest signed XML assertions.',
        threatModel: 'Threat: XML Signature Wrapping (SSW). Mitigation: Strictly validate signatures on both the SAML Response and the Assertion node.',
        bestPractice: 'Enforce strict Destination matching and verify the InResponseTo attribute to prevent replay injections.'
      },
      idp: {
        title: 'Identity Provider (IdP)',
        role: 'The central corporate directory that authenticates the user and signs the assertion.',
        analogy: 'The home office security desk that prints and holographically seals the corporate badge.',
        spec: 'Authenticates the user session and generates a signed <saml:Assertion> detailing NameID and attribute claims.',
        threatModel: 'Threat: Forged assertions via stolen private keys. Mitigation: Store IdP signing certificates in hardware vaults (HSM) and rotate frequently.',
        bestPractice: 'Sign the Assertion (mandatory) and encrypt the attributes if transmitting sensitive PII.'
      }
    }
  },
  pam: {
    name: 'Privileged Access Management (PAM) Vaulting',
    description: 'Securing, rotating, and proxying highly sensitive administrative sessions (e.g. CyberArk, BeyondTrust).',
    nodes: {
      admin: {
        title: 'System Administrator',
        role: 'Requests access to a critical backend server without knowing the actual target password.',
        analogy: 'A pilot requesting temporary access to the cockpit controls without possessing the master physical key.',
        spec: 'Authenticates to the PAM portal via MFA to request a brokered, time-bound RDP or SSH session.',
        threatModel: 'Threat: Endpoint compromise. Mitigation: Use hardened privileged access workstations (PAWs) for all admin activities.',
        bestPractice: 'Administrators must never see or handle the raw vaulted passwords.'
      },
      pam_vault: {
        title: 'PAM Session Vault',
        role: 'Securely stores credentials, rotates them, and proxies connections with full session recording.',
        analogy: 'An armored lockbox that brokers your connection, dials the lock for you, and records everything you do on camera.',
        spec: 'A hardened cluster that acts as a jump server (PSM), injecting credentials into the stream and recording keystrokes.',
        threatModel: 'Threat: Vault master key theft. Mitigation: Distribute vault keys across fragmented smart cards (quorum/M-of-N).',
        bestPractice: 'Implement continuous password rotation (CPM) after every single use.'
      },
      target_server: {
        title: 'Target Server (DB/OS)',
        role: 'The critical infrastructure being managed (e.g. Root Linux Server, Domain Controller).',
        analogy: 'The secured cockpit that is completely isolated from the main cabin.',
        spec: 'Accepts incoming SSH/RDP connections strictly and exclusively from the PAM Proxy IP ranges.',
        threatModel: 'Threat: Lateral bypass. Mitigation: Configure strict local firewalls to reject any direct SSH/RDP access bypassing the PAM.',
        bestPractice: 'Isolate target servers in restricted network zones accessible only by the PAM vault IPs.'
      }
    }
  },
  pki: {
    name: 'Public Key Infrastructure (PKI) & mTLS',
    description: 'The foundation of asymmetric cryptographic trust, Certificate Authorities, and secure channels.',
    nodes: {
      device: {
        title: 'Client Device',
        role: 'Generates a local keypair and requests a signed certificate to prove its identity.',
        analogy: 'A citizen filling out a passport application, attaching their photo, and requesting an official seal.',
        spec: 'Generates a PKCS#10 Certificate Signing Request (CSR) containing its public key and Subject Distinguished Name (DN).',
        threatModel: 'Threat: Private key extraction. Mitigation: Generate and trap the private key immutably inside a hardware TPM/Secure Enclave.',
        bestPractice: 'Never transmit the private key. Send only the CSR to the CA.'
      },
      sub_ca: {
        title: 'Intermediate CA',
        role: 'The active issuing authority that signs client certificates on behalf of the offline Root CA.',
        analogy: 'The regional passport office authorized by the capital to issue physical passports.',
        spec: 'An active Certificate Authority that signs the incoming CSR with its own private key, issuing an X.509 certificate.',
        threatModel: 'Threat: Intermediate CA compromise. Mitigation: Monitor Certificate Transparency (CT) logs for rogue issuances.',
        bestPractice: 'Keep the active Sub CA isolated on a secure network and issue short-lived leaf certificates.'
      },
      root_ca: {
        title: 'Offline Root CA',
        role: 'The supreme cryptographic trust anchor of the organization.',
        analogy: 'The nation’s founding constitution and original master seal kept inside a nuclear bunker.',
        spec: 'A self-signed Certificate Authority used exclusively to sign Intermediate CAs, then immediately taken offline.',
        threatModel: 'Threat: Total organizational compromise. Mitigation: Keep the Root CA completely disconnected from any network (air-gapped).',
        bestPractice: 'Store the Root CA private key in a FIPS 140-2 Level 3 Hardware Security Module (HSM) stored in a physical safe.'
      },
      crl: {
        title: 'Revocation Check (CRL/OCSP)',
        role: 'Provides real-time status on whether a certificate has been compromised and revoked.',
        analogy: 'The active wanted-list checking if a presented passport was reported stolen.',
        spec: 'Certificate Revocation Lists (CRL) or Online Certificate Status Protocol (OCSP) responders queried during TLS handshakes.',
        threatModel: 'Threat: OCSP server failure causing "fail-open". Mitigation: Implement OCSP Stapling directly on the web server.',
        bestPractice: 'Enforce hard-fail revocation checks for highly sensitive administrative connections.'
      }
    }
  },
  k8s_identity: {
    name: 'Kubernetes Identity (OIDC & RBAC)',
    description: 'Models how external identity providers map to internal Kubernetes clusters using OIDC tokens and native RBAC bindings.',
    nodes: {
      developer: {
        title: 'Cluster Developer (kubectl)',
        role: 'An engineer attempting to run commands against the cluster.',
        analogy: 'A construction worker arriving at the site with a union badge.',
        spec: 'Uses kubectl configured with an OIDC auth provider plugin, performing standard PKCE flows to get a JWT.',
        threatModel: 'Threat: Static kubeconfig theft. Mitigation: Never distribute long-lived static tokens; rely exclusively on OIDC federation.',
        bestPractice: 'Enforce strong MFA and short session timeouts at the IdP level.'
      },
      oidc_provider: {
        title: 'External IdP (Okta / Entra)',
        role: 'The centralized workforce directory issuing signed identity claims.',
        analogy: 'The union office that issues the badge stating the worker is certified.',
        spec: 'Issues a signed OIDC ID Token containing the user’s email and directory group memberships (e.g. "k8s-admins").',
        threatModel: 'Threat: Forged token signatures. Mitigation: API server must actively fetch and cache IdP public JWKS keys.',
        bestPractice: 'Keep OIDC tokens short-lived and implement strict group-mapping rules.'
      },
      kube_apiserver: {
        title: 'Kubernetes API Server',
        role: 'The control plane gateway validating all incoming cluster requests.',
        analogy: 'The foreman checking the badge against the daily approved roster.',
        spec: 'Receives the Bearer token, validates its cryptographic signature using the IdP\'s discovery document, and extracts the "groups" claim.',
        threatModel: 'Threat: Unauthenticated API access. Mitigation: Disable anonymous authentication and restrict API server network ingress.',
        bestPractice: 'Audit API server logs to track exactly which OIDC user executed which command.'
      },
      k8s_rbac: {
        title: 'K8s RBAC (RoleBinding)',
        role: 'Maps the verified IdP group to specific, granular cluster permissions.',
        analogy: 'The site instructions dictating that "union workers" are only allowed in Sector B.',
        spec: 'A native K8s RoleBinding associating the IdP group string to a specific Role (e.g. "pod-reader") within a Namespace.',
        threatModel: 'Threat: Privilege escalation. Mitigation: Never grant ClusterAdmin unless strictly necessary; use namespace-scoped Roles.',
        bestPractice: 'Map RBAC exclusively to IdP Groups, never directly to individual user emails, to maintain scalable IGA processes.'
      },
      pod_sa: {
        title: 'Pod Service Account',
        role: 'The target machine identity running the actual workload containers.',
        analogy: 'The heavy machinery that the authorized worker is finally allowed to operate.',
        spec: 'A native Kubernetes ServiceAccount projected into the pod volume, enabling the pod to communicate securely with other services.',
        threatModel: 'Threat: Service Account token extraction. Mitigation: Use Bound Service Account Token Volumes with expiration.',
        bestPractice: 'Avoid using the "default" service account. Create dedicated, least-privilege service accounts per workload.'
      }
    }
  }
}

export default function ArchitectureCenter() {
  const [activeArch, setActiveArch] = useState<ArchitectureType>('zero_trust')
  const [selectedNode, setSelectedNode] = useState<string>('client')
  
  // Animation / simulation trace logs
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  const handleArchChange = (type: ArchitectureType) => {
    setActiveArch(type)
    // Default selected node per architecture
    if (type === 'zero_trust') setSelectedNode('client')
    else if (type === 'b2b_saas') setSelectedNode('tenant_router')
    else if (type === 'multi_cloud') setSelectedNode('aws_workload')
    setSimLogs([])
  }

  const runSimulation = async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimLogs([])

    const addLog = (msg: string) => {
      setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    if (activeArch === 'zero_trust') {
      addLog('🚀 Subject initiates access request to restricted database...')
      setSelectedNode('client')
      await new Promise(r => setTimeout(r, 800))
      
      addLog('📡 Traffic intercepted at PEP ( Envoy gateway). Validating mTLS certificate...')
      setSelectedNode('pep')
      await new Promise(r => setTimeout(r, 800))

      addLog('🧠 PEP queries PDP (Policy Decision Point) to check authorization rules...')
      setSelectedNode('pdp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 PDP queries IdP to confirm user "alice.dev" group memberships and active session state...')
      setSelectedNode('idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('📱 PDP queries MDM compliance loop: verifying client machine certificate and posture...')
      setSelectedNode('mdm')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ PDP outputs ALLOW: User is valid engineer on a compliant, managed machine!')
      setSelectedNode('pdp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔓 PEP opens secure proxy tunnel. Connection established to SQL Database!')
      setSelectedNode('resource')
    } else if (activeArch === 'b2b_saas') {
      addLog('🚀 Enterprise user requests SaaS dashboard via tenant subdomain: tenant-a.saasapp.com...')
      setSelectedNode('tenant_router')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Router binds tenant-a context. Redirecting to Central Auth Service...')
      setSelectedNode('central_auth')
      await new Promise(r => setTimeout(r, 800))

      addLog('🏢 Central Auth identifies @corp.com. Redirecting to Enterprise Customer IdP via SAML federation...')
      setSelectedNode('custom_idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Customer IdP signs SAML assertion, redirecting user back to SaaS API gateway...')
      setSelectedNode('central_auth')
      await new Promise(r => setTimeout(r, 800))

      addLog('👥 Synced user record parsed. Querying Database with Row-Level Security current_tenant_id binding...')
      setSelectedNode('isolated_db')
    } else if (activeArch === 'multi_cloud') {
      addLog('🚀 AWS pod worker initiates gRPC connection over Unix socket to request identity document...')
      setSelectedNode('aws_workload')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 SPIFFE Agent attests pod attributes and forwards data to Central SPIRE Authority...')
      setSelectedNode('spire_agent')
      await new Promise(r => setTimeout(r, 800))

      addLog('📜 SPIRE Server validates AWS instance attestation and issues cryptographically signed X.509 SVID...')
      setSelectedNode('spire_server')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔒 Envoy Sidecar proxy intercepts egress. Establishing mTLS tunnel across clouds using SVID...')
      setSelectedNode('workload_mesh')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔓 Mutually authenticated mTLS session established! GCP Database grants access to validated AWS SPIFFE workload.')
      setSelectedNode('gcp_resource')
    } else if (activeArch === 'oauth_oidc') {
      addLog('🚀 User clicks "Login with Identity" in the Client Application...')
      setSelectedNode('user')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Client app redirects browser to Authorization Server with PKCE challenge...')
      setSelectedNode('client_app')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 User authenticates and consents. Auth Server issues short-lived Authorization Code...')
      setSelectedNode('auth_server')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Client app receives code. Initiates back-channel POST with PKCE verifier...')
      setSelectedNode('client_app')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Auth Server validates PKCE matching. Issues Access & ID JWTs!')
      setSelectedNode('auth_server')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔓 Client calls backend REST API using Bearer Token. Resource Server validates signature and grants access!')
      setSelectedNode('resource_server')
    } else if (activeArch === 'saml') {
      addLog('🚀 Employee navigates to protected Service Provider SaaS app...')
      setSelectedNode('user')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 SP creates base64-encoded SAMLRequest. Redirects browser to IdP...')
      setSelectedNode('sp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 IdP authenticates employee session. Generates signed SAML Assertion XML...')
      setSelectedNode('idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Browser automatically POSTs SAMLResponse back to SP Assertion Consumer Service (ACS)...')
      setSelectedNode('user')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ SP validates X.509 signature against IdP metadata. Issues secure local session! 🎉')
      setSelectedNode('sp')
    } else if (activeArch === 'pam') {
      addLog('🚀 Administrator authenticates to PAM portal via MFA...')
      setSelectedNode('admin')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Admin requests temporary RDP/SSH access to Target Server without knowing credentials...')
      setSelectedNode('pam_vault')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 PAM Vault retrieves root credentials internally. Initiates video recording stream...')
      setSelectedNode('pam_vault')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ PAM proxies the connection. Target Server accepts isolated PAM IP connection! Session established.')
      setSelectedNode('target_server')
    } else if (activeArch === 'pki') {
      addLog('🚀 Device generates secure local asymmetric keypair. Crafts PKCS#10 CSR...')
      setSelectedNode('device')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Device transmits CSR to active Intermediate CA for signing...')
      setSelectedNode('sub_ca')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 Intermediate CA validates request. Signs public key using authority key linked to Offline Root CA...')
      setSelectedNode('root_ca')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Device receives signed X.509 Certificate. Prepares for mTLS handshake...')
      setSelectedNode('device')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Target server checks CRL/OCSP responders to verify certificate is not revoked. Handshake complete! 🎉')
      setSelectedNode('crl')
    } else if (activeArch === 'k8s_identity') {
      addLog('🚀 Developer initiates cluster command using `kubectl` with an OIDC provider plugin...')
      setSelectedNode('developer')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Developer authenticates. External IdP issues a signed OIDC JWT mapping the "k8s-admins" group...')
      setSelectedNode('oidc_provider')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 Developer passes Bearer token. API Server verifies signature using IdP discovery document...')
      setSelectedNode('kube_apiserver')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 API Server resolves native RBAC RoleBinding matching the OIDC group claim to cluster roles...')
      setSelectedNode('k8s_rbac')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Request authorized! Developer initiates execution on target Pod Service Account. 🎉')
      setSelectedNode('pod_sa')
    } else {
      addLog('🚀 Customer browser initiates login request to access secure SaaS accounts...')
      setSelectedNode('client')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Browser redirects user to Google Social Identity Provider (OIDC workflow)...')
      setSelectedNode('social_idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🧠 User authenticated. Redirection transfers secure OIDC identity assertions back to Broker...')
      setSelectedNode('broker')
      await new Promise(r => setTimeout(r, 800))

      addLog('📝 Broker reads claims, completes Account Linking rules, and synchronizes User Profile Database...')
      setSelectedNode('user_store')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Broker issues secure, signed JWT. SaaS API Gateway validates signature and grants access! 🎉')
      setSelectedNode('api_gw')
    }

    setIsSimulating(false)
  }

  const selectedData = ARCHITECTURE_DATA[activeArch].nodes[selectedNode]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Page Shell Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Interactive Architecture Center</h1>
            <p className="text-xs text-text-secondary">Interactive reference security architectures, threat models, and real-time handshakes</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Layout Map & Diagram Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Architecture tabs */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex justify-between items-center">
            <div className="flex gap-2">
              {(Object.keys(ARCHITECTURE_DATA) as ArchitectureType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleArchChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeArch === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                >
                  {ARCHITECTURE_DATA[key].name.split(' (')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-bold flex items-center gap-1.5 ${isSimulating ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary shadow-sm shadow-accent-primary/10'}`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? '' : 'animate-pulse'}`} /> 
              {isSimulating ? 'Simulating...' : 'Run Simulation Handshake'}
            </button>
          </div>

          {/* Graphical Diagram Workspace */}
          <div className="border border-border-subtle bg-bg-base rounded-xl p-6 relative min-h-[380px] flex items-center justify-center select-none overflow-x-auto shadow-inner">
            
            {/* --- WORKFORCE ZERO TRUST DIAGRAM --- */}
            {activeArch === 'zero_trust' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-16 items-center justify-center min-w-[500px]">
                
                {/* Row 1: Users, PEP, Resources */}
                <DiagramNode 
                  id="client" 
                  selected={selectedNode === 'client'} 
                  title="Subject Workstation" 
                  icon={Users} 
                  color="blue"
                  onClick={() => setSelectedNode('client')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="pep" 
                  selected={selectedNode === 'pep'} 
                  title="PEP ( Envoy)" 
                  icon={Shield} 
                  color="teal"
                  onClick={() => setSelectedNode('pep')} 
                />

                {/* Vertical Bridge Row */}
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>

                {/* Row 2: MDM, PDP, Resources DB */}
                <DiagramNode 
                  id="mdm" 
                  selected={selectedNode === 'mdm'} 
                  title="MDM (Intune)" 
                  icon={RefreshCw} 
                  color="blue"
                  onClick={() => setSelectedNode('mdm')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="pdp" 
                  selected={selectedNode === 'pdp'} 
                  title="PDP (OPA)" 
                  icon={Cpu} 
                  color="teal"
                  onClick={() => setSelectedNode('pdp')} 
                />

                {/* Vertical Bridge Row 2 */}
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>

                {/* Row 3: IdP, Secure DB Target */}
                <DiagramNode 
                  id="idp" 
                  selected={selectedNode === 'idp'} 
                  title="Directory IdP" 
                  icon={KeySquare} 
                  color="blue"
                  onClick={() => setSelectedNode('idp')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="resource" 
                  selected={selectedNode === 'resource'} 
                  title="Secure DB Resource" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('resource')} 
                />

              </div>
            )}

            {/* --- MULTI-TENANT B2B SAAS DIAGRAM --- */}
            {activeArch === 'b2b_saas' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                
                {/* Row 1: Tenant Router, Customer IdP */}
                <DiagramNode 
                  id="tenant_router" 
                  selected={selectedNode === 'tenant_router'} 
                  title="Tenant Domain Router" 
                  icon={Globe} 
                  color="blue"
                  onClick={() => setSelectedNode('tenant_router')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="custom_idp" 
                  selected={selectedNode === 'custom_idp'} 
                  title="Customer Corp IdP" 
                  icon={KeySquare} 
                  color="teal"
                  onClick={() => setSelectedNode('custom_idp')} 
                />

                {/* Row 2: Central Auth */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <div className="col-span-3 flex justify-center">
                  <DiagramNode 
                    id="central_auth" 
                    selected={selectedNode === 'central_auth'} 
                    title="Central Auth Broker" 
                    icon={Server} 
                    color="blue"
                    onClick={() => setSelectedNode('central_auth')} 
                  />
                </div>

                {/* Row 3: SCIM Sync, Isolated DB */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode 
                  id="scim_sync" 
                  selected={selectedNode === 'scim_sync'} 
                  title="SCIM Sync Engine" 
                  icon={RefreshCw} 
                  color="teal"
                  onClick={() => setSelectedNode('scim_sync')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="isolated_db" 
                  selected={selectedNode === 'isolated_db'} 
                  title="Tenant Isolated DB" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('isolated_db')} 
                />

              </div>
            )}

            {/* --- MULTI-CLOUD WORKLOAD DIAGRAM --- */}
            {activeArch === 'multi_cloud' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                
                {/* AWS compute Workload */}
                <DiagramNode 
                  id="aws_workload" 
                  selected={selectedNode === 'aws_workload'} 
                  title="AWS Pod Workload" 
                  icon={Cloud} 
                  color="blue"
                  onClick={() => setSelectedNode('aws_workload')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                {/* Local agent */}
                <DiagramNode 
                  id="spire_agent" 
                  selected={selectedNode === 'spire_agent'} 
                  title="SPIRE Attest Agent" 
                  icon={Shield} 
                  color="blue"
                  onClick={() => setSelectedNode('spire_agent')} 
                />

                {/* Vertical to Server */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                {/* Central server */}
                <div className="col-span-3 flex justify-center">
                  <DiagramNode 
                    id="spire_server" 
                    selected={selectedNode === 'spire_server'} 
                    title="SPIRE Cert Authority" 
                    icon={Server} 
                    color="teal"
                    onClick={() => setSelectedNode('spire_server')} 
                  />
                </div>

                {/* Down to proxy & GCP target */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode 
                  id="workload_mesh" 
                  selected={selectedNode === 'workload_mesh'} 
                  title="mTLS Workload Mesh" 
                  icon={Network} 
                  color="teal"
                  onClick={() => setSelectedNode('workload_mesh')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="gcp_resource" 
                  selected={selectedNode === 'gcp_resource'} 
                  title="GCP Secure Resource" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('gcp_resource')} 
                />

              </div>
            )}

            {/* --- CUSTOMER IDENTITY (CIAM) & SOCIAL FEDERATION DIAGRAM --- */}
            {activeArch === 'ciam_social' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                
                {/* Row 1: Client and Social IdP */}
                <DiagramNode 
                  id="client" 
                  selected={selectedNode === 'client'} 
                  title="Customer Browser" 
                  icon={Users} 
                  color="blue"
                  onClick={() => setSelectedNode('client')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="social_idp" 
                  selected={selectedNode === 'social_idp'} 
                  title="Social IdP (Google)" 
                  icon={KeySquare} 
                  color="teal"
                  onClick={() => setSelectedNode('social_idp')} 
                />

                {/* Vertical Row to Broker */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <div className="col-span-3 flex justify-center">
                  <DiagramNode 
                    id="broker" 
                    selected={selectedNode === 'broker'} 
                    title="Central Identity Broker" 
                    icon={Server} 
                    color="blue"
                    onClick={() => setSelectedNode('broker')} 
                  />
                </div>

                {/* Vertical Row down to User Store & API Gateway */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode 
                  id="user_store" 
                  selected={selectedNode === 'user_store'} 
                  title="Customer Profile DB" 
                  icon={Database} 
                  color="teal"
                  onClick={() => setSelectedNode('user_store')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="api_gw" 
                  selected={selectedNode === 'api_gw'} 
                  title="SaaS API Gateway" 
                  icon={Shield} 
                  color="emerald"
                  onClick={() => setSelectedNode('api_gw')} 
                />

              </div>
            )}

            {/* --- OAUTH 2.0 & OIDC --- */}
            {activeArch === 'oauth_oidc' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Resource Owner" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="client_app" selected={selectedNode === 'client_app'} title="Client App" icon={Globe} color="blue" onClick={() => setSelectedNode('client_app')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="auth_server" selected={selectedNode === 'auth_server'} title="Authorization Server" icon={KeySquare} color="teal" onClick={() => setSelectedNode('auth_server')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <DiagramNode id="client_app" selected={selectedNode === 'client_app'} title="Client App (Bearer)" icon={Globe} color="blue" onClick={() => setSelectedNode('client_app')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="resource_server" selected={selectedNode === 'resource_server'} title="Resource Server (API)" icon={Server} color="emerald" onClick={() => setSelectedNode('resource_server')} />
              </div>
            )}

            {/* --- SAML 2.0 --- */}
            {activeArch === 'saml' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="user" selected={selectedNode === 'user'} title="Employee Browser" icon={Users} color="blue" onClick={() => setSelectedNode('user')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="sp" selected={selectedNode === 'sp'} title="Service Provider" icon={Cloud} color="teal" onClick={() => setSelectedNode('sp')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="idp" selected={selectedNode === 'idp'} title="Identity Provider" icon={KeySquare} color="blue" onClick={() => setSelectedNode('idp')} />
                </div>
              </div>
            )}

            {/* --- PAM --- */}
            {activeArch === 'pam' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="admin" selected={selectedNode === 'admin'} title="System Administrator" icon={Users} color="blue" onClick={() => setSelectedNode('admin')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="pam_vault" selected={selectedNode === 'pam_vault'} title="PAM Session Vault" icon={Shield} color="teal" onClick={() => setSelectedNode('pam_vault')} />
                <div className="h-10"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="col-span-2"></div>
                <DiagramNode id="target_server" selected={selectedNode === 'target_server'} title="Target Server" icon={Server} color="emerald" onClick={() => setSelectedNode('target_server')} />
              </div>
            )}

            {/* --- PKI --- */}
            {activeArch === 'pki' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="device" selected={selectedNode === 'device'} title="Client Device" icon={Laptop} color="blue" onClick={() => setSelectedNode('device')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="sub_ca" selected={selectedNode === 'sub_ca'} title="Intermediate CA" icon={Server} color="teal" onClick={() => setSelectedNode('sub_ca')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <DiagramNode id="crl" selected={selectedNode === 'crl'} title="Revocation (CRL)" icon={Database} color="emerald" onClick={() => setSelectedNode('crl')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="root_ca" selected={selectedNode === 'root_ca'} title="Offline Root CA" icon={KeySquare} color="blue" onClick={() => setSelectedNode('root_ca')} />
              </div>
            )}

            {/* --- KUBERNETES IDENTITY --- */}
            {activeArch === 'k8s_identity' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                {/* Developer -> OIDC Provider -> Kube API Server */}
                <DiagramNode id="developer" selected={selectedNode === 'developer'} title="Developer (kubectl)" icon={Users} color="blue" onClick={() => setSelectedNode('developer')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="oidc_provider" selected={selectedNode === 'oidc_provider'} title="External IdP (OIDC)" icon={KeySquare} color="teal" onClick={() => setSelectedNode('oidc_provider')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="kube_apiserver" selected={selectedNode === 'kube_apiserver'} title="Kubernetes API Server" icon={Server} color="blue" onClick={() => setSelectedNode('kube_apiserver')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                {/* K8s RBAC -> Pod SA */}
                <DiagramNode id="k8s_rbac" selected={selectedNode === 'k8s_rbac'} title="K8s RBAC (RoleBinding)" icon={Shield} color="emerald" onClick={() => setSelectedNode('k8s_rbac')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="pod_sa" selected={selectedNode === 'pod_sa'} title="Pod Service Account" icon={Cpu} color="teal" onClick={() => setSelectedNode('pod_sa')} />
              </div>
            )}

          </div>

          {/* Interactive simulated execution traces */}
          <div className="border border-border-subtle bg-bg-card rounded-xl p-4 shadow flex-1 min-h-[140px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-2 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-accent-primary" /> Active Handshake Trace Logs
              </div>
              
              <div className="space-y-1 text-[11px] font-mono leading-normal max-h-32 overflow-y-auto pr-1">
                {simLogs.length === 0 ? (
                  <span className="text-text-muted italic select-none">No active handshake trace. Click "Run Simulation Handshake" above to watch packets route.</span>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="text-text-primary">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {simLogs.length > 0 && !isSimulating && (
              <span className="block text-[9px] text-status-success font-bold font-mono mt-2 animate-pulse">
                ✓ Handshake completed. Dynamic parameters resolved securely.
              </span>
            )}
          </div>

        </div>

        {/* Right Side: Component Details and Specs */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
          {selectedData ? (
            <div className="space-y-5">
              <div className="border-b border-border-subtle pb-3">
                <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider block mb-0.5">Selected Node Component</span>
                <h2 className="text-base font-black text-text-primary">{selectedData.title}</h2>
              </div>

              <div>
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-1">Functional Role</span>
                <p className="text-xs text-text-secondary leading-normal">{selectedData.role}</p>
              </div>

              <div className="bg-bg-nested/60 border border-border-subtle p-3 rounded-lg">
                <span className="text-[9px] text-accent-primary font-bold uppercase tracking-wider block mb-1">Friendly Analogy</span>
                <p className="text-xs text-text-secondary leading-relaxed italic">"{selectedData.analogy}"</p>
              </div>

              <div>
                <span className="text-[9px] text-accent-secondary font-bold uppercase tracking-wider block mb-1 font-mono">Expert Specifications</span>
                <p className="text-xs text-text-secondary leading-normal font-mono text-[11px]">{selectedData.spec}</p>
              </div>

              <div className="border border-status-danger/30 bg-status-danger/5 p-3 rounded-lg text-status-danger">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-danger">Threat Model & Mitigation</span>
                <p className="text-xs leading-normal">{selectedData.threatModel}</p>
              </div>

              <div className="border border-status-success/30 bg-status-success/5 p-3 rounded-lg text-status-success">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-success">Architect Best Practice</span>
                <p className="text-xs leading-normal">{selectedData.bestPractice}</p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center select-none gap-2">
              <Network className="w-8 h-8 text-text-muted animate-pulse" />
              <span>Click on any box in the diagram to inspect its deep-dive workforce role, trust boundaries, threat models, and best practices.</span>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-border-subtle/60">
            <span className="text-[9px] text-text-muted font-mono block text-center">Reference Model: NIST SP 800-207 & RFC Standards.</span>
          </div>
        </div>

      </div>
    </div>
  )
}

function DiagramNode({ 
  selected, title, icon: Icon, color, onClick 
}: { 
  id: string
  selected: boolean
  title: string
  icon: any
  color: 'blue' | 'teal' | 'emerald'
  onClick: () => void 
}) {
  const colorClasses = {
    blue: selected ? 'bg-accent-glow border-accent-primary text-accent-primary shadow shadow-accent-primary/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle',
    teal: selected ? 'bg-accent-glow border-accent-secondary text-accent-secondary shadow shadow-accent-secondary/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle',
    emerald: selected ? 'bg-status-success/10 border-status-success text-status-success shadow shadow-status-success/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer min-w-[125px] ${colorClasses[color]}`}
    >
      <Icon className={`w-5 h-5 ${selected ? 'text-accent-primary' : 'text-text-muted'}`} />
      <span className="text-[10px] font-bold tracking-tight block max-w-[110px]">{title}</span>
    </button>
  )
}
