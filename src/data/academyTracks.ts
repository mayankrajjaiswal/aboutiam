import type { LucideIcon } from 'lucide-react'
import {
  Compass, Server, Key, Users, Lock, Fingerprint
} from 'lucide-react'

export interface SubModule {
  id: string
  title: string
  desc: string
  analogy: string
  expertTakeaway: string
}

export interface Track {
  id: string
  title: string
  desc: string
  icon: LucideIcon
  modules: SubModule[]
}

export const ACADEMY_TRACKS: Track[] = [
    {
      id: 'track-1',
      title: '1. Foundations of Identity',
      desc: 'Understand the building blocks of identity systems: authentication vs authorization, lifecycles, and modern single sign-on paradigms.',
      icon: Compass,
      modules: [
        {
          id: 'm1.1',
          title: 'Identity vs. Account',
          desc: 'Differentiating the human persona (Identity) from their technical login credential rows (Account).',
          analogy: 'Think of "Identity" as you—the actual physical person. An "Account" is like a specific library card issued to you; you can have different cards (work account, personal account, social account), but you are still the same human.',
          expertTakeaway: 'In directories, a User Entity represents the unique identity object, while login identifiers (e.g. usernames, email claims) represent accounts linked to that identity.'
        },
        {
          id: 'm1.2',
          title: 'Authentication vs. Authorization',
          desc: 'Understanding the difference between proving WHO you are (AuthN) versus proving WHAT you can access (AuthZ).',
          analogy: 'Authentication is showing your passport at the border (proving you are you). Authorization is the Visa stamp in that passport (determining if you have permission to enter and work in that specific country).',
          expertTakeaway: 'Standards split: OIDC handles Authentication (returns an id_token); OAuth 2.0 handles Authorization (returns an access_token).'
        },
        {
          id: 'm1.3',
          title: 'Lifecycle: Joiner-Mover-Leaver',
          desc: 'The complete management of accounts and permissions from a user onboarding, transferring departments, to eventual company departure.',
          analogy: 'Like enrolling in a school (Joiner - getting ID cards, locker key), transferring grades/majors (Mover - getting lab permissions, changing keys), and graduating (Leaver - returning keys, disabling cards).',
          expertTakeaway: 'The Joiner-Mover-Leaver (JML) process should be driven automatically by HR triggers to prevent "orphaned accounts" and "privilege creep".'
        },
        {
          id: 'm1.4',
          title: 'Identity Stores & Repositories',
          desc: 'How user accounts are organized—comparing relational SQL databases with nested LDAP directory trees.',
          analogy: 'Relational databases are like spreadsheets (flat tables of columns and rows). Directory Services are like folders on your computer—nested trees organizing users under offices and departments.',
          expertTakeaway: 'Use SQL databases for custom web application metadata, and hierarchical LDAP/AD trees for centralized employee access controls.'
        },
        {
          id: 'm1.5',
          title: 'Modern Multi-Factor Auth (MFA)',
          desc: 'Enforcing more than one independent factor: what you know (password), what you have (app/token), and what you are (fingerprint).',
          analogy: 'Like getting into a highly secure vault: you have to type the code (factor 1), insert a key card (factor 2), and look into a retina scanner (factor 3). Any single factor being compromised still blocks entry.',
          expertTakeaway: 'Standardize on mobile push notifications or TOTP algorithms (RFC 6238), and deprecate weak SMS-based OTPs which are vulnerable to SIM swapping.'
        },
        {
          id: 'm1.6',
          title: 'Single Sign-On (SSO) Concepts',
          desc: 'Logging in once to a central authority, allowing seamless authentication into multiple separate web services.',
          analogy: 'Like going to an amusement park and buying a wristband once. Instead of paying cash at every separate roller coaster, you just show your wristband (SSO token) to enter immediately.',
          expertTakeaway: 'SSO reduces credential fatigue, lowers IT support burden for password resets, and establishes a single audit choke-point.'
        }
      ]
    },
    {
      id: 'track-2',
      title: '2. Directory Services & Legacy SSO',
      desc: 'Master enterprise-grade heritage standards: hierarchical LDAP directories, Active Directory configurations, and Kerberos ticketing systems.',
      icon: Server,
      modules: [
        {
          id: 'm2.1',
          title: 'LDAP Protocol & Directory Trees',
          desc: 'Understanding Lightweight Directory Access Protocol structure, CNs, DNs, and organizational units (OUs).',
          analogy: 'Like writing a postal mailing address in reverse hierarchy: you target Country -> State -> City -> Street -> Name.',
          expertTakeaway: 'A Distinguished Name (DN) uniquely identifies an object, e.g., cn=Alex,ou=Security,dc=aboutiam,dc=com.'
        },
        {
          id: 'm2.2',
          title: 'Active Directory Schemas',
          desc: 'Microsoft Active Directory schema definitions, Domain Controllers, and Global Catalogs.',
          analogy: 'Active Directory is like the central registry office of a huge skyscraper. It tracks every office (OU), employee (User), and computer, and enforces master elevator building keys (Group Policies).',
          expertTakeaway: 'AD extends standard LDAP with Kerberos and GPOs, utilizing Domain Controllers (DC) as the absolute authority.'
        },
        {
          id: 'm2.3',
          title: 'Kerberos Ticket Handshakes',
          desc: 'Deep-dive into Ticket Granting Tickets (TGT) and Service Tickets (TGS) in domain networks.',
          analogy: 'Like going to a carnival: you show your ID at the ticket booth once and get a roll of tickets (TGT). For every ride (Service), you trade a single ticket (Service Ticket) without showing your ID again.',
          expertTakeaway: 'Kerberos uses symmetric encryption (RFC 4120) to authenticate clients to network services, bypassing the need to send passwords across wires.'
        },
        {
          id: 'm2.4',
          title: 'SAML 2.0 XML SSO',
          desc: 'Federation based on signed XML packages, assertions, Identity Providers (IdP), and Service Providers (SP).',
          analogy: 'SAML is like a digital passport. The border agent (Service Provider) reads the visa stamp (XML Assertion) signed by your home government (Identity Provider) and lets you enter immediately based on trust.',
          expertTakeaway: 'SAML 2.0 relies on heavy XML signatures. Always sanitize assertions to prevent Signature Wrapping (SSW) attacks.'
        },
        {
          id: 'm2.5',
          title: 'WS-Federation Standards',
          desc: 'Understanding legacy SOAP-based enterprise federations, particularly in AD FS (Active Directory Federation Services).',
          analogy: 'Like enterprise contractual agreements. Two corporations set up trusted digital tunnels to share employee access.',
          expertTakeaway: 'WS-Federation is common in legacy Microsoft architectures but is actively being replaced by OIDC.'
        },
        {
          id: 'm2.6',
          title: 'Reverse Proxies & Web Access',
          desc: 'Heritage Web SSO agent structures intercepting raw HTTP traffic to inject header headers.',
          analogy: 'Like a security bouncer standing directly in front of an elevator. You must pass their audit before they press the button for you.',
          expertTakeaway: 'Proxies like NGINX or Apache proxy-pass requests, appending user attributes (e.g. `X-User-Email`) in HTTP headers to backend servers.'
        }
      ]
    },
    {
      id: 'track-3',
      title: '3. Modern Federation & APIs',
      desc: 'Deconstruct state-of-the-art standards: OAuth 2.0, OAuth 2.1 specifications, OpenID Connect JWT claims, and SCIM automated provisioning.',
      icon: Key,
      modules: [
        {
          id: 'm3.1',
          title: 'OAuth 2.0 Core Roles',
          desc: 'The four roles: Resource Owner (User), Client App, Authorization Server, and Resource Server (API).',
          analogy: 'Like checking into a hotel: you (Owner) authorize the receptionist (Auth Server) to give your phone app (Client) a digital Bluetooth keycard (Token) to unlock your room door (API).',
          expertTakeaway: 'Always keep clients distinct: Confidential clients (backends that can secure secrets) vs. Public clients (SPAs/Native Apps).'
        },
        {
          id: 'm3.2',
          title: 'OAuth 2.1 Refinements',
          desc: 'The modern consolidated OAuth standard, enforcing PKCE and deprecating insecure legacy grants (Implicit).',
          analogy: 'Like upgrading building safety codes. Deprecating thin doors (Implicit redirects) and requiring heavy double-bolted locks (PKCE SHA-256 verifications) globally.',
          expertTakeaway: 'OAuth 2.1 removes the Implicit and Resource Owner Password Credentials grants, making PKCE mandatory for all authorization code steps.'
        },
        {
          id: 'm3.3',
          title: 'OpenID Connect (OIDC) Layer',
          desc: 'Building an identity verification layer on top of OAuth 2.0 authorization using JSON Web Tokens (JWT).',
          analogy: 'OAuth 2.0 is a lockbox key. OIDC is a digital ID card that tells the app your name, email, and photo, and is carried inside that same box.',
          expertTakeaway: 'OIDC introduces the `id_token` and standardizes endpoints (e.g. `/userinfo`, `/.well-known/openid-configuration`).'
        },
        {
          id: 'm3.4',
          title: 'JWKS Key Endpoints',
          desc: 'How JSON Web Key Sets distribute public keys dynamically to let client applications verify token signatures.',
          analogy: 'Like a notary public publishing their official signature seal on a public bulletin board. Anyone can verify the seal on a document is authentic by comparing it to the public board.',
          expertTakeaway: 'Verify tokens using cached public keys fetched from the IdP\'s JWKS endpoint (`/.well-known/jwks.json`), checking matching `kid` claims.'
        },
        {
          id: 'm3.5',
          title: 'Token Exchange (RFC 8693)',
          desc: 'Delegating access in microservices by exchanging a public OAuth token for a restricted inner-network token.',
          analogy: 'Like trading your theme-park entry ticket for a specific locker token inside. The ticket gets you through the front gate; the token only works for that locker.',
          expertTakeaway: 'Token Exchange is vital under Zero Trust to enforce "least privilege" inside backend-to-backend calls.'
        },
        {
          id: 'm3.6',
          title: 'SCIM 2.0 Provisioning',
          desc: 'Standard for Cross-domain Identity Management, automating REST CRUD operations over user resources.',
          analogy: 'Like a universal translator for employee lists. If HR adds a employee, it sends standard codes (SCIM POST) to automatically create matching accounts in Slack, AWS, and Zoom simultaneously.',
          expertTakeaway: 'SCIM standardizes `/Users` and `/Groups` REST endpoints, leveraging standard schemas to remove proprietary integration scripts.'
        }
      ]
    },
    {
      id: 'track-4',
      title: '4. Customer IAM (CIAM)',
      desc: 'Build frictionless customer experiences: progressive user profiling, multi-tenant organizations, and phishing-resistant FIDO2 Passkeys.',
      icon: Users,
      modules: [
        {
          id: 'm4.1',
          title: 'Progressive Profiling',
          desc: 'Reducing customer signup friction by collecting profile fields step-by-step over multiple login sessions.',
          analogy: 'On your first date, you only ask for their name. On the third date, you ask for their birthday. On the fifth, you ask for their address. Asking for everything on day one scares them away.',
          expertTakeaway: 'Progressive profiling improves registration conversion rates by deferring optional data gathering until the feature demands it.'
        },
        {
          id: 'm4.2',
          title: 'Social & Federated Login',
          desc: 'Allowing customers to authenticate instantly using existing accounts like Google, Apple, or GitHub.',
          analogy: 'Logging into a club by showing your official state ID card. The club trusts the state verified you, saving them from doing background checks themselves.',
          expertTakeaway: 'Social logins leverage standard OAuth 2.0 / OIDC redirects to retrieve verified email and profile claims.'
        },
        {
          id: 'm4.3',
          title: 'Multi-Tenant Isolation',
          desc: 'Architecting CIAM schemas for B2B SaaS platforms requiring strict separation of customer organization data.',
          analogy: 'Like an apartment building. All tenants share the same structure and plumbing (code/database), but every apartment has a completely separate locked door (tenant key).',
          expertTakeaway: 'Use dynamic database tenant identifiers (`tenant_id`) or custom subdomains (e.g. `tenant.saas.com`) to isolate active context filters.'
        },
        {
          id: 'm4.4',
          title: 'Consent & Privacy Compliance',
          desc: 'Satisfying GDPR and CCPA mandates by tracking explicit user consents, opt-ins, and data deletion rights.',
          analogy: 'A legal disclaimer checkbox before letting you ride a rollercoaster, detailing how they will handle your photos.',
          expertTakeaway: 'Store explicit versioned consent receipts linked to user profile IDs to prove compliance during regulatory audits.'
        },
        {
          id: 'm4.5',
          title: 'FIDO2 & Passkeys',
          desc: 'Moving to absolute passwordless security using biometric hardware and asymmetric key pairs.',
          analogy: 'Unlocking your phone with your face. Instead of typing a secret, your phone dynamically signs a cryptographic signature in-device and proves you are holding the phone.',
          expertTakeaway: 'Passkeys utilize the WebAuthn API to generate unique asymmetric keys, fully immune to phishing attacks since keys are domain-bound.'
        },
        {
          id: 'm4.6',
          title: 'Anomaly & Threat Auditing',
          desc: 'Detecting session hijackings, brute forces, and credential stuffing dynamically.',
          analogy: 'A bank blocking your credit card because you bought coffee in New York and dinner in London 1 hour later. Impossible travel time flags immediate fraud.',
          expertTakeaway: 'Leverage device fingerprinting, IP reputations, and behavioral scoring to trigger dynamic step-up MFA demands.'
        }
      ]
    },
    {
      id: 'track-5',
      title: '5. Enterprise Governance & Privilege',
      desc: 'Understand access governance: Attestation campaigns, privileged session vaults (PAM), and Just-in-Time (JIT) ephemeral sessions.',
      icon: Lock,
      modules: [
        {
          id: 'm5.1',
          title: 'IGA & Separation of Duties (SoD)',
          desc: 'Preventing internal fraud by enforcing business logic constraints (e.g., the employee who submits invoices cannot approve them).',
          analogy: 'Like a nuclear launch key: it requires two separate officers in different seats turning keys at the same time to fire.',
          expertTakeaway: 'Set up strict Separation of Duties (SoD) policies inside your Identity Governance and Administration (IGA) platform.'
        },
        {
          id: 'm5.2',
          title: 'Privileged Access Management (PAM)',
          desc: 'Securing administrative and database credentials inside a protected, highly recorded vault.',
          analogy: 'A safe containing the gold master key. Only authorized security guards can retrieve it, and they must sign a logbook detailing exactly when and why.',
          expertTakeaway: 'PAM tools isolate admin sessions, rotating credentials automatically after check-in events.'
        },
        {
          id: 'm5.3',
          title: 'Just-in-Time (JIT) Ephemeral sessions',
          desc: 'Enforcing zero standing privileges by creating short-lived administrative credentials that auto-delete after the session ends.',
          analogy: 'A temporary digital security pass that lets you access the server room for only 30 minutes. Once the time is up, the pass dynamically de-authorizes.',
          expertTakeaway: 'Reduce standing threat windows by issuing ephemeral certificates that expire in hours, rather than static long-lived admin credentials.'
        },
        {
          id: 'm5.4',
          title: 'Command Auditing & Recordings',
          desc: 'Enforcing full transparency in infrastructure modifications by recording administrative shell commands.',
          analogy: 'Dash-cams recording everything an officer does during a traffic stop to ensure rules and standards are upheld.',
          expertTakeaway: 'PAM proxies record SSH and RDP session streams, archiving text logs of executed CLI inputs for security forensic audits.'
        },
        {
          id: 'm5.5',
          title: 'Non-Human Identities (NHI)',
          desc: 'Managing access keys, database credentials, and service accounts utilized by automated software scripts.',
          analogy: 'Like delivery robots in a factory. They don\'t have employee ID badges, but they still need limited smart-keys to unlock specific conveyor doors.',
          expertTakeaway: 'Secrets management tools (e.g., HashiCorp Vault, AWS Secrets Manager) provide rotating keys for non-human identities.'
        },
        {
          id: 'm5.6',
          title: 'Attestation & Access Reviews',
          desc: 'Enforcing periodic, compliance-driven campaigns where managers must audit and re-approve employee permissions.',
          analogy: 'An annual roll-call at a school to make sure graduated students have their building cards revoked.',
          expertTakeaway: 'Attestation campaigns prevent privilege accumulation by forcing business managers to periodically re-justify access.'
        }
      ]
    },
    {
      id: 'track-6',
      title: '6. Zero Trust & Future Identity',
      desc: 'Formulate next-generation identity strategies: continuous access evaluations (CAEP), decentralized DIDs, and workload identities.',
      icon: Fingerprint,
      modules: [
        {
          id: 'm6.1',
          title: 'Zero Trust (NIST SP 800-207)',
          desc: 'Shifting from network-perimeter models to continuous, device-posture and user-risk access audits.',
          analogy: 'Legacy security is a castle with a drawbridge. Once you pass the gate, you walk freely. Zero Trust is a high-security lab where every door requires a badge check and biometric audit, every single time.',
          expertTakeaway: 'Zero Trust treats the corporate network as hostile. Access decisions are evaluated dynamically at Policy Decision Points (PDP).'
        },
        {
          id: 'm6.2',
          title: 'Continuous Access Evaluation (CAEP)',
          desc: 'Real-time session monitoring using standardized continuous event feeds, replacing traditional fixed-duration token expirations.',
          analogy: 'A security guard following you around the museum. If you try to touch a painting (network change), they instantly stop and escort you out, rather than waiting for your day ticket to expire.',
          expertTakeaway: 'CAEP (RFC 9396) allows an Identity Provider to push real-time event signals (e.g., password resets, session revokes) directly to APIs.'
        },
        {
          id: 'm6.3',
          title: 'Shared Signals Framework (SSF)',
          desc: 'Standardized open protocol to share critical security incidents across independent corporate SaaS boundaries.',
          analogy: 'If an alarm goes off at one bank, they instantly broadcast alert signals to all neighboring banks so they can lock their doors, too.',
          expertTakeaway: 'SSF allows multi-vendor platforms (e.g., Okta, Microsoft, Salesforce) to exchange standard JSON security event feeds.'
        },
        {
          id: 'm6.4',
          title: 'Decentralized Identity (DIDs)',
          desc: 'Giving users complete ownership of their digital identity without relying on central database authorities.',
          analogy: 'An official physical driver\'s license card. You carry it in your wallet, show it to whom you want, and the DMV (Identity Provider) is never notified when or where you showed it.',
          expertTakeaway: 'Decentralized Identifiers (DIDs) are standard W3C URI strings resolving to cryptographic public keys held on tamper-proof distributed ledgers.'
        },
        {
          id: 'm6.5',
          title: 'Verifiable Credentials',
          desc: 'W3C standard for sharing cryptographically verifiable user attributes (e.g. proof of age, corporate role).',
          analogy: 'Like showing a concert ticket barcode on your smartphone. The usher can verify the barcode is real using a digital scanner, without calling the box office to lookup your identity.',
          expertTakeaway: 'Verifiable Credentials (VC) contain a digital signature signed by the Issuer, allowing Verifiers to audit assertions instantly.'
        },
        {
          id: 'm6.6',
          title: 'Workload SPIFFE/SPIRE Identity',
          desc: 'Issuing cryptographically verifiable, dynamic identities to non-human software workloads across multi-cloud clusters.',
          analogy: 'Like assigning a unique, self-destructing digital barcode to every software robot running in AWS or Google Cloud, so they can securely talk to each other without sharing secrets.',
          expertTakeaway: 'SPIFFE standardizes short-lived X.509 SVID credentials issued dynamically based on Kubernetes or OS platform state.'
        }
      ]
    }
]
