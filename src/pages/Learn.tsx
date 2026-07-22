import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen, Compass, Key, Lock, Fingerprint,
  Users, Server, CheckCircle2, ChevronDown, ChevronUp, HelpCircle,
  Info, AwardIcon, Sparkles, LayoutGrid, RotateCcw, Briefcase
} from 'lucide-react'
import { usePreferenceStore, type RoleTrackId } from '../store/preferenceStore'

// Maps a Career Center role track to the single Academy track most relevant to it.
const ROLE_TRACK_RECOMMENDATIONS: Record<RoleTrackId, { trackId: string; roleLabel: string }> = {
  fresher: { trackId: 'track-1', roleLabel: 'Fresher / Entry-Level' },
  developer: { trackId: 'track-3', roleLabel: 'Developer' },
  security_engineer: { trackId: 'track-6', roleLabel: 'Security Engineer' },
  iam_engineer: { trackId: 'track-2', roleLabel: 'IAM Engineer' },
  architect: { trackId: 'track-5', roleLabel: 'Enterprise Architect' },
  principal: { trackId: 'track-5', roleLabel: 'Principal / Director' },
}

interface SubModule {
  id: string
  title: string
  desc: string
  analogy: string
  expertTakeaway: string
}

interface Track {
  id: string
  title: string
  desc: string
  icon: LucideIcon
  modules: SubModule[]
}

interface AcademyQuiz {
  q: string
  options: string[]
  correct: number
  explanation: string
}

const ACADEMY_QUIZZES: Record<string, AcademyQuiz> = {
  'track-1': {
    q: "Which component of an IAM architecture is responsible for verifying that an identity exists and matching presented credentials (e.g. passwords, biometrics)?",
    options: [
      "Authorization Server (STS)",
      "Authentication Provider (Identity Provider - IdP)",
      "Directory Repository (User Database / Active Directory)",
      "Policy Decision Point (PDP)"
    ],
    correct: 1,
    explanation: "The Authentication Provider (IdP) is responsible for verifying the authenticity of an identity (matching presented credentials like passwords or biometrics) and asserting that verified state to downstream applications."
  },
  'track-2': {
    q: "Why are FIDO2/WebAuthn hardware credentials structurally immune to phishing attacks compared to traditional passwords or SMS OTPs?",
    options: [
      "They utilize standard symmetric shared keys stored on the server.",
      "The private key is cryptographically bound to the origin domain and never leaves the hardware security enclave/TPM.",
      "They enforce longer password lengths dynamically in the background.",
      "They are backed by blockchain ledger verifications."
    ],
    correct: 1,
    explanation: "Under FIDO2/WebAuthn, the browser binds the asymmetric keypair to the specific origin domain. The private key remains locked inside the device TPM enclave and is never sent over the wire, neutralizing phishing and credential-theft."
  },
  'track-3': {
    q: "In an Attribute-Based Access Control (ABAC) engine, which component evaluates request contexts (user, device, network, resources) against policies to return a security decision?",
    options: [
      "Policy Enforcement Point (PEP)",
      "Policy Decision Point (PDP)",
      "Policy Administration Point (PAP)",
      "Policy Information Point (PIP)"
    ],
    correct: 1,
    explanation: "The Policy Decision Point (PDP) acts as the logic engine. It evaluates incoming contextual attributes supplied by the PIP against active authorization policies to return a verdict (permit vs. deny)."
  },
  'track-4': {
    q: "An organization wants to enforce Segregation of Duties (SoD) inside their finance system. Which control represents a valid SoD implementation?",
    options: [
      "Requiring all finance employees to use hardware Passkeys.",
      "Ensuring that the user who creates a vendor record cannot also approve payments to that same vendor.",
      "Automatically rotating administrative passwords every 24 hours.",
      "Recording administrative sessions inside a secure PAM vault."
    ],
    correct: 1,
    explanation: "Segregation of Duties (SoD) prevents fraud by dividing critical, multi-step actions across separate identities, ensuring no single user possesses complete control over a sensitive transaction lifecycle."
  },
  'track-5': {
    q: "What is the primary architectural purpose of implementing 'Progressive Profiling' inside a Customer Identity (CIAM) journey?",
    options: [
      "To force users to undergo MFA checks on every single login attempt.",
      "To gradually collect additional user profile attributes over multiple sessions as trust is established, reducing registration friction.",
      "To index user behaviors across social directories like Google or Apple.",
      "To cryptographically encrypt customer metadata inside browser localStorage."
    ],
    correct: 1,
    explanation: "Progressive Profiling reduces onboarding friction by only asking for mandatory information (e.g. email) during registration, and progressively requesting additional attributes in subsequent logins as they engage."
  },
  'track-6': {
    q: "Under the SPIFFE standard, what is an SVID (SPIFFE Verifiable Identity Document) used for?",
    options: [
      "To store encrypted enterprise master passwords on-premise.",
      "To authenticate software workloads securely across cloud boundaries using short-lived X.509 certificates or JWTs.",
      "To verify corporate domain compliance on employee workstations.",
      "To federate workforce SSO connections via SAML redirects."
    ],
    correct: 1,
    explanation: "An SVID is a cryptographically verifiable, short-lived identity document (formatted as an X.509 certificate or JWT) issued dynamically to running workloads, allowing software robots to attest identity securely without static secrets."
  }
}

export default function Learn() {
  const roleTrack = usePreferenceStore((s) => s.roleTrack)
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [expandedModule, setExpandedExpandedModule] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('aboutiam-academy-progress')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Track quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selectedIdx: number; correct: boolean | null }>>({})

  const handleSelectQuizOption = (trackId: string, optionIdx: number, correctIdx: number) => {
    const isCorrect = optionIdx === correctIdx
    setQuizAnswers(prev => ({
      ...prev,
      [trackId]: { selectedIdx: optionIdx, correct: isCorrect }
    }))
  }

  const handleResetQuiz = (trackId: string) => {
    setQuizAnswers(prev => {
      const copy = { ...prev }
      delete copy[trackId]
      return copy
    })
  }

  const renderTrackQuiz = (trackId: string) => {
    const quiz = ACADEMY_QUIZZES[trackId]
    if (!quiz) return null

    const answer = quizAnswers[trackId]
    const isAnswered = !!answer

    return (
      <div className="p-5 bg-bg-card border border-border-subtle rounded-2xl shadow-sm space-y-4 mt-6">
        <div className="border-b border-border-subtle pb-3">
          <span className="text-[10px] text-accent-primary font-black uppercase tracking-wider">Track Verification Quiz</span>
          <h5 className="text-sm font-black text-text-primary mt-1.5 leading-snug">
            {quiz.q}
          </h5>
        </div>

        <div className="space-y-2">
          {quiz.options.map((opt, i) => {
            const isSelected = answer?.selectedIdx === i
            let btnStyle = 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
            
            if (isAnswered) {
              if (i === quiz.correct) {
                btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
              } else if (isSelected) {
                btnStyle = 'bg-status-danger/10 border-status-danger text-status-danger font-bold'
              } else {
                btnStyle = 'border-border-subtle bg-bg-nested opacity-50 text-text-secondary'
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectQuizOption(trackId, i, quiz.correct)}
                className={`w-full py-2.5 px-3 rounded-lg border text-left text-[11px] font-bold transition-all leading-normal ${btnStyle}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
            answer.correct 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
          }`}>
            <strong className="block uppercase text-[9px] mb-0.5">
              {answer.correct ? 'Verification Successful! ✔' : 'Incorrect Choice! ❌'}
            </strong>
            <p className="text-text-secondary font-semibold leading-normal">
              {quiz.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <button
            onClick={() => handleResetQuiz(trackId)}
            className="px-3 py-1.5 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle rounded text-[9px] font-black text-text-secondary uppercase transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Retry Quiz
          </button>
        )}
      </div>
    )
  }

  // Toggle module completion and persist
  const toggleModuleCompletion = (modId: string) => {
    const updated = { ...completedModules, [modId]: !completedModules[modId] }
    setCompletedModules(updated)
    try {
      localStorage.setItem('aboutiam-academy-progress', JSON.stringify(updated))
    } catch {
      // localStorage unavailable (private browsing quota, etc.) — in-memory state still updated
    }
  }

  // Calculate track progress
  const getTrackProgress = (track: Track) => {
    const total = track.modules.length
    const completed = track.modules.filter(m => completedModules[m.id]).length
    const pct = Math.round((completed / total) * 100)
    return { completed, total, pct }
  }

  const tracks: Track[] = [
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

  // Get total modules completed metrics
  const getGlobalStats = () => {
    const total = 36
    const completed = Object.values(completedModules).filter(Boolean).length
    const pct = Math.round((completed / total) * 100)
    return { completed, total, pct }
  }

  const globalStats = getGlobalStats()

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header with Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border-subtle">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <BookOpen className="w-3.5 h-3.5" /> AboutIAM Academy
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Central Academy Curriculum
          </h2>
          <p className="text-text-secondary">
            Master Identity structures across 6 progressive tracks and 36 curated learning modules. Explore conceptual analogies, study expert takeaways, and track your graduation progress.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle shrink-0 md:w-80 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-primary animate-pulse-slow" /> Overall Graduation
            </span>
            <span className="text-accent-primary">{globalStats.completed} / {globalStats.total} Done</span>
          </div>
          <div className="relative w-full h-2.5 bg-bg-sidebar rounded-full overflow-hidden border border-border-subtle/50">
            <div 
              style={{ width: `${globalStats.pct}%` }}
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-700"
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase">
            <span>Progress: {globalStats.pct}%</span>
            {globalStats.completed === 36 ? (
              <span className="text-status-success flex items-center gap-1"><AwardIcon className="w-3.5 h-3.5" /> Graduated!</span>
            ) : (
              <span>Not Graduated</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Track Banner (personalized via Header's career-track preference) */}
      {roleTrack && ROLE_TRACK_RECOMMENDATIONS[roleTrack] && (
        <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-accent-primary shrink-0" />
            <p className="text-xs font-semibold text-text-primary">
              Recommended for <strong>{ROLE_TRACK_RECOMMENDATIONS[roleTrack].roleLabel}</strong>: {tracks.find((t) => t.id === ROLE_TRACK_RECOMMENDATIONS[roleTrack].trackId)?.title}
            </p>
          </div>
          <button
            onClick={() => setExpandedTrack(ROLE_TRACK_RECOMMENDATIONS[roleTrack].trackId)}
            className="text-xs font-black text-accent-primary hover:text-accent-hover uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Jump to Track →
          </button>
        </div>
      )}

      {/* Main Two Column Workspace */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side Track Selector Accordion (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Academy Tracks</span>

          {tracks.map((track) => {
            const { completed, total, pct } = getTrackProgress(track)
            const isTrackExpanded = expandedTrack === track.id
            const isGraduated = completed === total

            return (
              <div 
                key={track.id} 
                className={`rounded-xl border transition-all ${
                  isTrackExpanded 
                    ? 'border-accent-primary bg-bg-card shadow-md' 
                    : 'border-border-subtle bg-bg-card/50 hover:bg-bg-card hover:border-accent-primary/20'
                }`}
              >
                {/* Track Card Header */}
                <button
                  onClick={() => setExpandedTrack(isTrackExpanded ? null : track.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isTrackExpanded 
                        ? 'bg-accent-primary text-white border-accent-primary' 
                        : 'bg-bg-sidebar text-text-secondary border-border-subtle'
                    }`}>
                      <track.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-2">
                        {track.title}
                        {isGraduated && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-success/10 border border-status-success/20 text-status-success font-extrabold uppercase flex items-center gap-0.5">
                            Graduated
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-xl">
                        {track.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Progress Dial */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[10px] font-bold text-text-muted">
                      <span>{completed}/{total} Completed</span>
                      <span className={isGraduated ? 'text-status-success' : 'text-text-secondary'}>{pct}%</span>
                    </div>
                    {isTrackExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Sub-Modules Accordion List */}
                {isTrackExpanded && (
                  <div className="border-t border-border-subtle/50 px-5 py-4 bg-bg-sidebar/30 divide-y divide-border-subtle/40">
                    {track.modules.map((mod) => {
                      const isModExpanded = expandedModule === mod.id
                      const isDone = !!completedModules[mod.id]

                      return (
                        <div key={mod.id} className="py-4 first:pt-0 last:pb-0">
                          {/* Sub-Module Row */}
                          <div className="flex items-center justify-between gap-4">
                            <button
                              onClick={() => setExpandedExpandedModule(isModExpanded ? null : mod.id)}
                              className="text-left font-bold text-text-primary text-sm hover:text-accent-primary transition-colors flex items-center gap-2"
                            >
                              <span className="text-text-muted text-xs font-mono">{mod.id.toUpperCase()}</span>
                              {mod.title}
                              {isModExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* Mark as completed Checklist control */}
                            <button
                              onClick={() => toggleModuleCompletion(mod.id)}
                              className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                isDone
                                  ? 'bg-status-success/10 border-status-success/30 text-status-success shadow-inner'
                                  : 'border-border-subtle hover:bg-bg-nested text-text-secondary bg-bg-card'
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-status-success' : 'text-text-muted'}`} />
                              {isDone ? 'Completed' : 'Mark Completed'}
                            </button>
                          </div>

                          {/* Expanded Content Sub-Panel */}
                          {isModExpanded && (
                            <div className="mt-4 pl-8 grid md:grid-cols-2 gap-4 text-xs font-semibold text-text-secondary animate-fadeIn">
                              {/* Left Side: General Overview and Analogy (Beginner friendly) */}
                              <div className="p-4 bg-bg-card rounded-xl border border-border-subtle space-y-2">
                                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1">
                                  <HelpCircle className="w-3.5 h-3.5" /> Beginner-friendly Analogy
                                </span>
                                <p className="text-text-secondary leading-relaxed font-medium">
                                  {mod.desc}
                                </p>
                                <div className="pt-2 border-t border-border-subtle/50 text-text-muted italic font-medium leading-normal">
                                  "{mod.analogy}"
                                </div>
                              </div>

                              {/* Right Side: Architecture Deep-Dive (Expert level) */}
                              <div className="p-4 bg-bg-card rounded-xl border border-border-subtle space-y-2">
                                <span className="text-[10px] font-bold text-accent-secondary uppercase tracking-wider flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5 text-accent-secondary" /> Expert Architectural Blueprint
                                </span>
                                <p className="text-[11px] text-text-primary leading-relaxed font-mono whitespace-pre-wrap break-all bg-bg-nested/40 p-3 rounded-lg border border-border-subtle/30">
                                  {mod.expertTakeaway}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* INTERACTIVE TRACK QUIZ BLOCK */}
                    {renderTrackQuiz(track.id)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Side Overview Sidebar (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm h-fit space-y-4">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <LayoutGrid className="w-4 h-4 text-accent-primary" /> Track Overview Map
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Browse any track directly. Your progression is saved locally so you can resume learning at your own pace.
            </p>
            <div className="space-y-2 text-xs font-semibold">
              {tracks.map((track) => {
                const { completed, total } = getTrackProgress(track)
                const isGraduated = completed === total
                return (
                  <button
                    key={track.id}
                    onClick={() => setExpandedTrack(track.id)}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      expandedTrack === track.id
                        ? 'border-accent-primary/30 bg-accent-glow/5 text-accent-primary'
                        : 'border-border-subtle bg-bg-sidebar/30 text-text-secondary'
                    }`}
                  >
                    <span>{track.title.substring(3)}</span>
                    <span className={`text-[10px] font-bold uppercase ${isGraduated ? 'text-status-success' : 'text-text-muted'}`}>
                      {completed}/{total}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
