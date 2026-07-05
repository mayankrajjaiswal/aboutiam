import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Network, ArrowRight, Shield, Play, Terminal, Cpu, Database,
  Globe, Server, Users, Cloud, RefreshCw, KeySquare, ChevronRight, Laptop,
  Wallet, Fingerprint, Landmark, TrendingUp, Send, FileCheck, Waypoints, Siren, Building2, IdCard, Scale, Eye,
  HardHat, Router, Cog, Truck, Factory, CreditCard, ScanLine, Boxes
} from 'lucide-react'

type ArchitectureType = 'zero_trust' | 'b2b_saas' | 'multi_cloud' | 'ciam_social' | 'oauth_oidc' | 'saml' | 'pam' | 'pki' | 'k8s_identity' | 'banking' | 'healthcare' | 'government' | 'manufacturing' | 'retail'

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
  },
  banking: {
    name: 'Banking & Financial Services Identity Architecture (PCI-DSS & PSD2)',
    description: 'Models Strong Customer Authentication, segmented core-ledger dual control, real-time fraud screening, and correspondent-bank wire authorization.',
    nodes: {
      customer_channel: {
        title: 'Digital Banking Channel (Customer)',
        role: 'The customer-facing mobile or web banking app initiating payment and account-management requests, carrying FIDO2/PSD2 Strong Customer Authentication (SCA) proofs.',
        analogy: 'A customer walking up to a bank teller window with their government ID already in hand.',
        spec: 'A PSD2-regulated payment initiation client performing FIDO2/WebAuthn biometric SCA challenges before every high-risk transaction.',
        threatModel: 'Threat: Malware-driven transaction hijacking (man-in-the-browser). Mitigation: Bind SCA dynamic linking to the exact payee and amount so a tampered transaction invalidates the signature.',
        bestPractice: 'Re-run SCA on every new payee or amount change; never reuse a single SCA approval across multiple transactions.'
      },
      sca_engine: {
        title: 'Strong Customer Authentication (SCA) Engine',
        role: 'Evaluates PSD2 exemption eligibility (low-value, trusted beneficiary, TRA) and enforces dynamic linking between the authentication and the specific transaction.',
        analogy: 'The bank manager who decides whether a transaction is small enough to wave through or big enough to demand a second signature.',
        spec: 'Implements the EBA Regulatory Technical Standards (RTS) on SCA, computing Transaction Risk Analysis (TRA) fraud-rate thresholds to grant exemptions.',
        threatModel: 'Threat: Exemption abuse to bypass MFA on fraudulent transfers. Mitigation: Cap cumulative exempted transaction value and force full SCA once thresholds are breached.',
        bestPractice: 'Log every exemption decision with its computed fraud rate for regulator audit trails.'
      },
      core_ledger: {
        title: 'Core Banking Ledger',
        role: 'The authoritative system of record for account balances and transaction postings, operating inside the segmented Cardholder/Core Data Environment (CDE).',
        analogy: 'The bank vault\'s master ledger book that only specific dual-keyed officers may amend.',
        spec: 'A segmented, network-isolated ledger platform enforcing dual-control approvals for any manual balance adjustment or wire override.',
        threatModel: 'Threat: Insider-initiated fraudulent ledger entries. Mitigation: Require maker-checker (dual-control) approval on every manual posting above a defined threshold.',
        bestPractice: 'Isolate the ledger network segment from general corporate IT, permitting only brokered, audited connections.'
      },
      fraud_engine: {
        title: 'Real-Time Fraud & AML Risk Engine',
        role: 'Screens every transaction for velocity anomalies, sanctioned-party matches (OFAC), and money-laundering typologies before settlement.',
        analogy: 'The airport customs officer scanning every passenger\'s name against a watchlist before letting them board.',
        spec: 'A streaming risk engine applying velocity rules and real-time OFAC/sanctions-list screening against every payment instruction.',
        threatModel: 'Threat: Structuring (breaking large transfers into many small ones to evade thresholds). Mitigation: Aggregate velocity scoring across a rolling window, not just single-transaction limits.',
        bestPractice: 'Feed confirmed fraud outcomes back into the risk model to continuously retrain detection thresholds.'
      },
      swift_gateway: {
        title: 'SWIFT / Correspondent Banking Gateway',
        role: 'Formats and transmits verified, high-value wire instructions to correspondent banks over the SWIFT messaging network.',
        analogy: 'The diplomatic courier who carries a sealed, dual-signed letter between two nations\' treasuries.',
        spec: 'Enforces the SWIFT Customer Security Programme (CSP) mandatory controls, requiring dual-authorization sign-off before releasing any outbound wire message.',
        threatModel: 'Threat: Malware forging fraudulent SWIFT messages (cf. Bangladesh Bank heist). Mitigation: Enforce hardware-token dual-authorization and out-of-band confirmation for high-value wires.',
        bestPractice: 'Segregate SWIFT terminal access on dedicated, hardened workstations with no general internet access.'
      }
    }
  },
  healthcare: {
    name: 'Healthcare Identity Architecture (HIPAA & HL7 FHIR)',
    description: 'Models patient-facing CIAM proofing, minimum-necessary EHR scoping, SMART on FHIR granular authorization, break-glass emergency access, and the Business Associate boundary.',
    nodes: {
      patient_portal: {
        title: 'Patient Portal (CIAM)',
        role: 'Customer-facing portal where patients register, verify their identity, and view their own health records.',
        analogy: 'The hospital\'s front-desk check-in kiosk that verifies you are who your appointment says you are.',
        spec: 'A CIAM registration flow performing NIST IAL2-level identity proofing (government ID plus a liveness/biometric check) before granting portal access.',
        threatModel: 'Threat: Account takeover exposing a patient\'s full medical history. Mitigation: Require step-up authentication before displaying sensitive diagnosis or mental-health records.',
        bestPractice: 'Offer passwordless FIDO2 login to reduce credential-stuffing exposure on patient accounts.'
      },
      fhir_gateway: {
        title: 'HL7 FHIR API Gateway',
        role: 'Exposes clinical data to patient apps and third-party health tools through standardized, scope-limited FHIR resources.',
        analogy: 'A hospital records window that only releases the exact document category you have a signed release for.',
        spec: 'Implements SMART on FHIR, issuing granular OAuth 2.0 scopes (e.g., patient/Observation.read) rather than blanket record access.',
        threatModel: 'Threat: Over-broad scope grants leaking unrelated record categories to a third-party app. Mitigation: Enforce scope allow-lists per registered SMART app and reject undeclared scope requests.',
        bestPractice: 'Version and publish a FHIR CapabilityStatement so integrators know exactly which resources and scopes are supported.'
      },
      ehr_system: {
        title: 'Electronic Health Record (EHR) System',
        role: 'The system of record for clinical data, enforcing that every user only sees the minimum data necessary for their treatment role.',
        analogy: 'The hospital records room clerk who hands a nurse only the specific patient chart requested, not the entire cabinet.',
        spec: 'Implements HIPAA §164.312 Technical Safeguards and the Minimum Necessary Standard, scoping field-level record visibility to the requester\'s clinical role.',
        threatModel: 'Threat: Curious-employee snooping on a celebrity or family member\'s chart. Mitigation: Run automated audit analytics flagging record access with no matching treatment relationship.',
        bestPractice: 'Attach a treatment-relationship justification to every record access for audit defensibility.'
      },
      break_glass: {
        title: 'Break-Glass Emergency Access',
        role: 'Grants clinicians immediate, time-boxed elevated access to a patient record during an emergency, bypassing normal relationship checks.',
        analogy: 'The fire alarm glass box in a hallway: breaking it gets you the axe immediately, but someone reviews the broken glass afterward.',
        spec: 'Issues a short-lived elevated-access token (typically minutes to hours) that auto-expires and triggers a mandatory post-hoc supervisor review.',
        threatModel: 'Threat: Break-glass access used as a routine bypass rather than a true emergency. Mitigation: Auto-flag every break-glass invocation for mandatory next-business-day review with termination consequences for misuse.',
        bestPractice: 'Never allow break-glass grants to silently expire unreviewed — route every instance to a compliance queue.'
      },
      business_associate: {
        title: 'Business Associate Boundary',
        role: 'The contractual and technical boundary governing any third party (billing vendor, cloud host, analytics firm) that processes PHI on the covered entity\'s behalf.',
        analogy: 'The visiting contractor who may only enter the building escorted, under a signed non-disclosure agreement, and only in the rooms specified in their work order.',
        spec: 'Every data flow crossing this boundary is governed by a signed Business Associate Agreement (BAA) and scoped API credentials limited to the vendor\'s specific function.',
        threatModel: 'Threat: A breached subcontractor exposing PHI outside the covered entity\'s direct control. Mitigation: Require BAAs to flow down to sub-subcontractors and audit vendor access logs periodically.',
        bestPractice: 'Maintain a live inventory of every Business Associate with API access and their exact PHI scope.'
      }
    }
  },
  government: {
    name: 'Government & Public Sector Identity Architecture (FedRAMP & NIST 800-63)',
    description: 'Models PIV/CAC hardware-bound credentials, NIST-tiered assurance assertions, cross-agency federation, the FedRAMP authorization boundary, and continuous audit monitoring.',
    nodes: {
      piv_card: {
        title: 'PIV / CAC Smart Card',
        role: 'The physical, hardware-bound credential federal employees and contractors present to authenticate to government systems.',
        analogy: 'A federal employee badge with an embedded chip that must be physically inserted into a reader, not just shown.',
        spec: 'A FIPS 201-compliant Personal Identity Verification (PIV) or Common Access Card (CAC) storing a hardware-bound X.509 certificate and private key.',
        threatModel: 'Threat: Cloned or stolen physical card used without the holder present. Mitigation: Require PIN entry alongside the card (something-you-have plus something-you-know) at every logon.',
        bestPractice: 'Bind the card\'s private key to non-exportable hardware so it can never be copied off the chip.'
      },
      assurance_broker: {
        title: 'IAL/AAL/FAL Assurance Broker',
        role: 'Determines and asserts the identity, authenticator, and federation assurance levels achieved for a given authentication event.',
        analogy: 'A notary who stamps a document not just "verified" but with a specific grade of verification rigor that other offices can trust.',
        spec: 'Implements NIST SP 800-63-3, computing and asserting IAL/AAL/FAL tier claims inside issued federation tokens.',
        threatModel: 'Threat: A relying party silently accepting a lower assurance tier than it requires. Mitigation: Have relying parties explicitly request and validate minimum acceptable IAL/AAL/FAL values, rejecting under-strength assertions.',
        bestPractice: 'Stamp the achieved assurance tier directly into the token claims so every downstream relying party can independently verify it.'
      },
      agency_broker: {
        title: 'Cross-Agency Federation Broker',
        role: 'A shared identity provider (Login.gov-style) that lets citizens and federal employees use one credential across many agency applications.',
        analogy: 'A single embassy visa that is honored at the border crossing of every allied nation, rather than requiring a new visa per country.',
        spec: 'A centralized OIDC/SAML IdP federating dozens of independent agency relying parties under one shared assurance and proofing pipeline.',
        threatModel: 'Threat: Single federated IdP compromise cascading access across every connected agency. Mitigation: Monitor for anomalous cross-agency assertion patterns and support rapid, forest-wide token revocation.',
        bestPractice: 'Publish a single, well-audited proofing and authentication pipeline so agencies stop duplicating costly proofing infrastructure.'
      },
      fedramp_boundary: {
        title: 'FedRAMP Authorization Boundary',
        role: 'Defines the exact set of systems, services, and data flows that fall under a cloud service\'s federal security authorization.',
        analogy: 'The fence line around a secured federal facility: everything inside it was inspected and approved, anything outside was not.',
        spec: 'A System Security Plan (SSP) mapping every in-scope component to its required NIST SP 800-53 control baseline (Low/Moderate/High).',
        threatModel: 'Threat: Undocumented "shadow" services quietly expanding the true attack surface beyond the authorized boundary. Mitigation: Continuously reconcile deployed infrastructure inventory against the SSP-declared boundary.',
        bestPractice: 'Treat any new service addition as an SSP change requiring re-assessment before it goes live in the authorized environment.'
      },
      audit_continuous_monitoring: {
        title: 'Continuous Monitoring & Audit Logging',
        role: 'Aggregates immutable audit logs and continuously reassesses control effectiveness across the entire authorization boundary.',
        analogy: 'The building\'s 24/7 security camera feed, permanently recorded to a vault no single guard can erase.',
        spec: 'Implements FedRAMP Continuous Monitoring (ConMon), shipping immutable, tamper-evident logs and monthly vulnerability scan attestations to the authorizing agency.',
        threatModel: 'Threat: Log tampering to hide unauthorized access after the fact. Mitigation: Write logs to an append-only, cryptographically chained store with independent retention outside the monitored system\'s own control.',
        bestPractice: 'Retain audit logs for the full federally mandated retention period, verified independently from the system being monitored.'
      }
    }
  },
  manufacturing: {
    name: 'Industrial OT/ICS Identity Architecture (IEC 62443)',
    description: 'Models IT/OT segmentation, machine identity for PLCs and controllers, brokered third-party vendor access, and dual-authorization safety controls on the plant floor.',
    nodes: {
      plant_operator: {
        title: 'Plant Floor Operator / HMI',
        role: 'The shift operator authenticating to a Human-Machine Interface (HMI) terminal to monitor and control equipment on the production line.',
        analogy: 'A factory floor worker badging into a shared control terminal with their own personal ID card instead of a sticky note password taped to the machine.',
        spec: 'Terminal authenticates via badge-tap RFID/PIV bound to a named operator identity, feeding session logs into the plant Manufacturing Execution System (MES).',
        threatModel: 'Threat: Shared, generic HMI login credentials used by multiple shift workers. Mitigation: Require individual badge-based login per operator shift with automatic idle-session timeout.',
        bestPractice: 'Bind every HMI session to a named individual identity — never a shared shift-generic login.'
      },
      ot_it_gateway: {
        title: 'OT/IT Segmentation Gateway',
        role: 'The Industrial DMZ enforcing a controlled protocol break between the corporate IT network and the OT/ICS production network.',
        analogy: 'The airlock door between the office building and the factory floor that only lets specific approved carts pass through in one direction.',
        spec: 'Implements the IEC 62443 zones-and-conduits model, running protocol-aware firewalls (Modbus/OPC-UA proxies) between IT and OT/ICS network segments.',
        threatModel: 'Threat: Malware pivoting from corporate IT into the OT network (cf. NotPetya-style lateral movement). Mitigation: Enforce unidirectional data diodes or strict protocol-break firewalls at every IT/OT boundary.',
        bestPractice: 'Never allow a direct, unbrokered network path between corporate IT and the OT/ICS zone.'
      },
      plc_identity_broker: {
        title: 'PLC/RTU Machine Identity Broker',
        role: 'Issues and manages machine identities and certificates for Programmable Logic Controllers (PLCs) and Remote Terminal Units (RTUs) on the plant floor.',
        analogy: 'The foreman\'s master key ring that only issues verified, numbered keys to certified robot arms and never to counterfeit blanks.',
        spec: 'A PKI-backed identity service issuing X.509 device certificates to PLCs/RTUs and validating mutual TLS handshakes for every engineering-workstation connection.',
        threatModel: 'Threat: Firmware or ladder-logic tampering via a spoofed controller identity (cf. Stuxnet). Mitigation: Require signed firmware updates and mutually-authenticated engineering-to-PLC sessions.',
        bestPractice: 'Rotate and re-issue PLC device certificates on a fixed schedule, and alert on any unexpected certificate change.'
      },
      vendor_remote_access: {
        title: 'Third-Party Vendor Remote Access Broker',
        role: 'Brokers time-boxed, approval-gated remote sessions for OEM and vendor maintenance technicians who need to service plant equipment.',
        analogy: 'The outside repair contractor who must sign in at the gatehouse, get escorted, and sign out — never given a spare building key to keep.',
        spec: 'A brokered jump-host (PAM-style) granting vendor technicians time-boxed, fully session-recorded remote access with no standing credentials.',
        threatModel: 'Threat: Persistent, always-on VPN credentials left active for OEM technicians (cf. retail vendor-access breaches). Mitigation: Broker every vendor session through an approval-gated jump host with full session recording.',
        bestPractice: 'Expire vendor remote-access grants automatically at the end of the approved maintenance window.'
      },
      scada_historian: {
        title: 'SCADA Historian & Safety System',
        role: 'The process-control target: the historian database recording production data plus the safety instrumented system (SIS) enforcing physical interlocks.',
        analogy: 'The main control room where changing a critical valve setting requires two supervisors turning their keys at the same time.',
        spec: 'The SCADA historian database and safety instrumented system (SIS) record process data and enforce interlocks on physical equipment.',
        threatModel: 'Threat: Unauthorized setpoint changes causing physical or safety damage. Mitigation: Enforce dual-operator (four-eyes) authorization for any safety-critical setpoint change.',
        bestPractice: 'Require dual-operator sign-off for any change to a safety-critical setpoint.'
      }
    }
  },
  retail: {
    name: 'Retail & Point-of-Sale Identity Architecture (PCI-DSS & Omnichannel)',
    description: 'Models PCI-scoped point-of-sale hardening, badge-based staff RBAC, a unified omnichannel customer identity hub, payment tokenization, and least-privilege supply-chain integrations.',
    nodes: {
      pos_terminal: {
        title: 'Point-of-Sale Terminal',
        role: 'The physical checkout terminal or self-checkout kiosk where a customer\'s payment card or mobile wallet is presented for a transaction.',
        analogy: 'The register counter itself — anyone can walk up to it, but it only unlocks a sale after the cashier or self-checkout logs in.',
        spec: 'A PCI-DSS scoped terminal running Point-to-Point Encryption (P2PE) hardware, isolated on its own segmented VLAN from the general store network.',
        threatModel: 'Threat: Point-of-sale malware skimming card data from memory (RAM-scraping). Mitigation: Encrypt card data at the swipe head itself (P2PE) so plaintext PAN never touches general-purpose terminal memory.',
        bestPractice: 'Never allow POS terminals to browse the general internet or run software outside the certified payment application allow-list.'
      },
      store_associate_id: {
        title: 'Store Associate Identity',
        role: 'The badge-based staff identity a cashier, manager, or loss-prevention officer uses to unlock register functions and inventory overrides.',
        analogy: 'The manager\'s override key that must be inserted and turned before a cashier can approve a large refund or price change.',
        spec: 'An RBAC-scoped staff directory issuing role-based POS permissions (cashier vs. manager override vs. loss-prevention) via badge-tap or PIN login.',
        threatModel: 'Threat: Cashiers sharing manager override PINs to bypass refund and discount approval controls. Mitigation: Require a physical badge tap in addition to a PIN for any manager-level override, logged to loss-prevention.',
        bestPractice: 'Immediately revoke terminated employees\' badge access across every store location, not just their home store.'
      },
      omnichannel_ciam: {
        title: 'Omnichannel Customer Identity Hub',
        role: 'The unified customer identity linking a shopper\'s online account, loyalty profile, and in-store purchase history across every retail channel.',
        analogy: 'The single loyalty card that works whether you\'re shopping on the website, the mobile app, or walking into the physical store.',
        spec: 'A CIAM platform federating e-commerce login, loyalty program membership, and Buy-Online-Pickup-In-Store (BOPIS) order verification under one customer profile.',
        threatModel: 'Threat: Account takeover via credential stuffing draining stored loyalty points or gift card balances. Mitigation: Apply risk-based, adaptive authentication and rate-limit login attempts across the omnichannel hub.',
        bestPractice: 'Give customers one consistent identity and consent record across web, app, and in-store systems instead of siloed per-channel accounts.'
      },
      payment_gateway: {
        title: 'Tokenized Payment Gateway',
        role: 'The tokenization service that exchanges a customer\'s raw card number for a non-sensitive token immediately at the point of capture.',
        analogy: 'A coat-check ticket: you hand over your coat once and get a numbered ticket back — the ticket alone is worthless to a thief who doesn\'t control the coat closet.',
        spec: 'A PCI-DSS Level 1 tokenization/payment gateway generating a merchant-specific token in place of the PAN, drastically shrinking the store\'s own PCI compliance scope.',
        threatModel: 'Threat: Token vault compromise re-linking tokens back to real card numbers. Mitigation: Keep the detokenization vault isolated from the merchant network, accessible only to the payment processor.',
        bestPractice: 'Never store raw PAN data anywhere in the retail environment — tokenize at first capture and store only tokens.'
      },
      inventory_supply_chain: {
        title: 'Inventory & Supply Chain System',
        role: 'The warehouse management and supply-chain system tracking stock levels and coordinating restocking with third-party logistics partners.',
        analogy: 'The loading dock logbook that only lets an approved delivery driver\'s badge open the correct bay door for their scheduled shipment.',
        spec: 'An M2M-authenticated EDI/API integration layer connecting store inventory systems to distribution centers and third-party logistics (3PL) partners.',
        threatModel: 'Threat: A compromised 3PL API key enabling fraudulent inventory adjustments or shipment redirection. Mitigation: Scope each partner\'s API credentials to only their specific warehouse/SKU range, with mTLS and key rotation.',
        bestPractice: 'Issue least-privilege, per-partner API credentials rather than one shared integration key for every logistics vendor.'
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
    else if (type === 'banking') setSelectedNode('customer_channel')
    else if (type === 'healthcare') setSelectedNode('patient_portal')
    else if (type === 'government') setSelectedNode('piv_card')
    else if (type === 'manufacturing') setSelectedNode('plant_operator')
    else if (type === 'retail') setSelectedNode('pos_terminal')
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
    } else if (activeArch === 'banking') {
      addLog('🚀 Customer initiates a high-value wire transfer via the Digital Banking Channel...')
      setSelectedNode('customer_channel')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 SCA Engine evaluates PSD2 exemption eligibility. Transaction exceeds the low-value threshold, triggering a dynamically-linked SCA challenge...')
      setSelectedNode('sca_engine')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 Customer approves the dynamically-linked biometric challenge. Core Banking Ledger begins a dual-control posting...')
      setSelectedNode('core_ledger')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔍 Real-Time Fraud & AML Risk Engine screens the payee against OFAC sanctions lists and velocity thresholds... CLEAR.')
      setSelectedNode('fraud_engine')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ SWIFT Gateway obtains dual-authorization sign-off and transmits the wire to the correspondent bank! 🎉')
      setSelectedNode('swift_gateway')
    } else if (activeArch === 'healthcare') {
      addLog('🚀 Patient logs into the Patient Portal, having already completed IAL2 identity proofing...')
      setSelectedNode('patient_portal')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Portal requests lab results via the HL7 FHIR Gateway using a scoped patient/Observation.read token...')
      setSelectedNode('fhir_gateway')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 EHR System enforces the Minimum Necessary Standard, returning only the requested lab result fields...')
      setSelectedNode('ehr_system')
      await new Promise(r => setTimeout(r, 800))

      addLog('🚨 Emergency: an on-call physician invokes Break-Glass access to view the same patient\'s allergy history during a code event...')
      setSelectedNode('break_glass')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Access logged for mandatory post-hoc review. Billing data for the visit is later shared with a vendor under a signed Business Associate Agreement! 🎉')
      setSelectedNode('business_associate')
    } else if (activeArch === 'government') {
      addLog('🚀 Federal employee inserts their PIV smart card and enters their PIN at a workstation...')
      setSelectedNode('piv_card')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Assurance Broker validates the hardware-bound certificate and asserts IAL2/AAL3/FAL3 tiers into the token...')
      setSelectedNode('assurance_broker')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 Cross-Agency Federation Broker federates the asserted identity to the target agency application...')
      setSelectedNode('agency_broker')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Application resides inside a FedRAMP Moderate authorization boundary. Request is validated against the SSP-mapped control baseline...')
      setSelectedNode('fedramp_boundary')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Continuous Monitoring logs the access to an immutable audit trail for ConMon reporting! 🎉')
      setSelectedNode('audit_continuous_monitoring')
    } else if (activeArch === 'manufacturing') {
      addLog('🚀 Operator badges into the Plant Floor HMI to begin a shift on the packaging line...')
      setSelectedNode('plant_operator')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 HMI session request crosses the OT/IT Segmentation Gateway, which enforces the Industrial DMZ protocol break...')
      setSelectedNode('ot_it_gateway')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 PLC/RTU Machine Identity Broker validates the mutual TLS certificate on the target packaging-line controller...')
      setSelectedNode('plc_identity_broker')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔧 An OEM vendor technician requests remote access to recalibrate the same PLC. Vendor Remote Access Broker opens a time-boxed, recorded session...')
      setSelectedNode('vendor_remote_access')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Recalibration setpoint change requires dual-operator sign-off before the SCADA Historian applies it to the safety-critical control loop! 🎉')
      setSelectedNode('scada_historian')
    } else if (activeArch === 'retail') {
      addLog('🚀 Customer taps their loyalty card at checkout while the cashier logs into the POS Terminal with a badge...')
      setSelectedNode('pos_terminal')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Store Associate Identity confirms cashier-level RBAC permissions to open the sale...')
      setSelectedNode('store_associate_id')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 Omnichannel Customer Identity Hub resolves the customer\'s unified profile, linking this purchase to their online order history and loyalty balance...')
      setSelectedNode('omnichannel_ciam')
      await new Promise(r => setTimeout(r, 800))

      addLog('💳 Tokenized Payment Gateway tokenizes the card at the point of capture — raw PAN never touches the store network...')
      setSelectedNode('payment_gateway')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ Inventory & Supply Chain System deducts the sold SKU and automatically triggers a restock order with the 3PL partner! 🎉')
      setSelectedNode('inventory_supply_chain')
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

            {/* --- BANKING & FINANCIAL SERVICES --- */}
            {activeArch === 'banking' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="customer_channel" selected={selectedNode === 'customer_channel'} title="Digital Banking Channel" icon={Wallet} color="blue" onClick={() => setSelectedNode('customer_channel')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="sca_engine" selected={selectedNode === 'sca_engine'} title="SCA Engine (PSD2)" icon={Fingerprint} color="teal" onClick={() => setSelectedNode('sca_engine')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="core_ledger" selected={selectedNode === 'core_ledger'} title="Core Banking Ledger" icon={Landmark} color="blue" onClick={() => setSelectedNode('core_ledger')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="fraud_engine" selected={selectedNode === 'fraud_engine'} title="Fraud & AML Engine" icon={TrendingUp} color="teal" onClick={() => setSelectedNode('fraud_engine')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="swift_gateway" selected={selectedNode === 'swift_gateway'} title="SWIFT Gateway" icon={Send} color="emerald" onClick={() => setSelectedNode('swift_gateway')} />
              </div>
            )}

            {/* --- HEALTHCARE (HIPAA & HL7 FHIR) --- */}
            {activeArch === 'healthcare' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="patient_portal" selected={selectedNode === 'patient_portal'} title="Patient Portal (CIAM)" icon={Users} color="blue" onClick={() => setSelectedNode('patient_portal')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="fhir_gateway" selected={selectedNode === 'fhir_gateway'} title="HL7 FHIR Gateway" icon={Waypoints} color="teal" onClick={() => setSelectedNode('fhir_gateway')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="ehr_system" selected={selectedNode === 'ehr_system'} title="EHR System" icon={FileCheck} color="blue" onClick={() => setSelectedNode('ehr_system')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="break_glass" selected={selectedNode === 'break_glass'} title="Break-Glass Access" icon={Siren} color="teal" onClick={() => setSelectedNode('break_glass')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="business_associate" selected={selectedNode === 'business_associate'} title="Business Associate" icon={Building2} color="emerald" onClick={() => setSelectedNode('business_associate')} />
              </div>
            )}

            {/* --- GOVERNMENT & PUBLIC SECTOR (FedRAMP & NIST 800-63) --- */}
            {activeArch === 'government' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="piv_card" selected={selectedNode === 'piv_card'} title="PIV / CAC Card" icon={IdCard} color="blue" onClick={() => setSelectedNode('piv_card')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="assurance_broker" selected={selectedNode === 'assurance_broker'} title="Assurance Broker" icon={Scale} color="teal" onClick={() => setSelectedNode('assurance_broker')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="agency_broker" selected={selectedNode === 'agency_broker'} title="Cross-Agency Broker" icon={Landmark} color="blue" onClick={() => setSelectedNode('agency_broker')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="fedramp_boundary" selected={selectedNode === 'fedramp_boundary'} title="FedRAMP Boundary" icon={Building2} color="teal" onClick={() => setSelectedNode('fedramp_boundary')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="audit_continuous_monitoring" selected={selectedNode === 'audit_continuous_monitoring'} title="Continuous Monitoring" icon={Eye} color="emerald" onClick={() => setSelectedNode('audit_continuous_monitoring')} />
              </div>
            )}

            {/* --- MANUFACTURING (OT/ICS & IEC 62443) --- */}
            {activeArch === 'manufacturing' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="plant_operator" selected={selectedNode === 'plant_operator'} title="Plant Floor Operator" icon={HardHat} color="blue" onClick={() => setSelectedNode('plant_operator')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="ot_it_gateway" selected={selectedNode === 'ot_it_gateway'} title="OT/IT Segmentation Gateway" icon={Router} color="teal" onClick={() => setSelectedNode('ot_it_gateway')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="plc_identity_broker" selected={selectedNode === 'plc_identity_broker'} title="PLC/RTU Identity Broker" icon={Cog} color="blue" onClick={() => setSelectedNode('plc_identity_broker')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="vendor_remote_access" selected={selectedNode === 'vendor_remote_access'} title="Vendor Remote Access" icon={Truck} color="teal" onClick={() => setSelectedNode('vendor_remote_access')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="scada_historian" selected={selectedNode === 'scada_historian'} title="SCADA Historian" icon={Factory} color="emerald" onClick={() => setSelectedNode('scada_historian')} />
              </div>
            )}

            {/* --- RETAIL (PCI-DSS & OMNICHANNEL) --- */}
            {activeArch === 'retail' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                <DiagramNode id="pos_terminal" selected={selectedNode === 'pos_terminal'} title="Point-of-Sale Terminal" icon={CreditCard} color="blue" onClick={() => setSelectedNode('pos_terminal')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="store_associate_id" selected={selectedNode === 'store_associate_id'} title="Store Associate Identity" icon={IdCard} color="teal" onClick={() => setSelectedNode('store_associate_id')} />
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="col-span-3 flex justify-center">
                  <DiagramNode id="omnichannel_ciam" selected={selectedNode === 'omnichannel_ciam'} title="Omnichannel CIAM Hub" icon={Users} color="blue" onClick={() => setSelectedNode('omnichannel_ciam')} />
                </div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <DiagramNode id="payment_gateway" selected={selectedNode === 'payment_gateway'} title="Tokenized Payment Gateway" icon={ScanLine} color="teal" onClick={() => setSelectedNode('payment_gateway')} />
                <div className="w-full h-0.5 bg-border-subtle"></div>
                <DiagramNode id="inventory_supply_chain" selected={selectedNode === 'inventory_supply_chain'} title="Inventory & Supply Chain" icon={Boxes} color="emerald" onClick={() => setSelectedNode('inventory_supply_chain')} />
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
