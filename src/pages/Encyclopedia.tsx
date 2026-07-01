import { useState } from 'react'
import { Book, Search, Lightbulb, ShieldCheck, FileText, ChevronRight } from 'lucide-react'

interface Term {
  id: string
  term: string
  fullName: string
  analogy: string
  expert: string
  category: 'Foundations' | 'Directories' | 'Protocols' | 'Governance' | 'Cryptography' | 'Zero Trust' | 'Decentralized'
}

export default function Encyclopedia() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  const encyclopedia: Term[] = [
    {
      id: 'aaa',
      term: 'AAA',
      fullName: 'Authentication, Authorization, and Accounting',
      category: 'Foundations',
      analogy: 'The master security system of an apartment building: 1. Authentication checks your key at the front door. 2. Authorization checks if your key card unlocks the gym. 3. Accounting logs the exact time you entered and left the gym.',
      expert: 'An architectural security framework. Authentication verifies a client\'s identity; Authorization determines permitted actions; Accounting monitors active resource usages and session durations for auditing and billing.'
    },
    {
      id: 'abac',
      term: 'ABAC',
      fullName: 'Attribute-Based Access Control',
      category: 'Authorization' as any, // Mapped to Governance/Foundations dynamically
      analogy: 'Like getting into a VIP club only if you are wearing red shoes (a user attribute), it is before midnight (an environment attribute), and the club isn\'t full (a resource attribute). Your actual name doesn\'t matter.',
      expert: 'An advanced access paradigm granting rights dynamically by combining policies against user attributes, environmental contexts (IP, time), and resource states, overriding flat hierarchical RBAC matrices.'
    },
    {
      id: 'active_directory',
      term: 'Active Directory (AD)',
      category: 'Directories',
      fullName: 'Active Directory Domain Services',
      analogy: 'The central registry office of a massive skyscraper corporate headquarters. It tracks every single employee, computer, printer, and elevator security key, allowing administrators to push global rules to all offices in seconds.',
      expert: 'Microsoft\'s proprietary directory service implementing hierarchical object databases containing users, groups, and devices. Operates via Kerberos/NTLM authentication and supports LDAP queries and Group Policy Objects (GPOs).'
    },
    {
      id: 'access_token',
      term: 'Access Token',
      category: 'Foundations',
      fullName: 'Access Token (OAuth 2.0 Payload)',
      analogy: 'A Bluetooth hotel keycard. You scan it at your room door, and the lock opens because the bouncer receptionist signed it, even though the door lock doesn\'t know your name or home address.',
      expert: 'RFC 6749. A string or JWT representing authorization granted to the client application. It is passed in HTTP headers (\`Authorization: Bearer <token>\`) to authenticate requests at resource APIs.'
    },
    {
      id: 'authn',
      term: 'Authentication (AuthN)',
      category: 'Foundations',
      fullName: 'Authentication',
      analogy: 'Showing your physical passport to a customs officer. It proves that you are indeed the human person pictured on the document.',
      expert: 'The security process of validating the claimed identity of a user, service, or device, typically verified via credentials (passwords, TOTP tokens, or cryptographic signatures).'
    },
    {
      id: 'authz',
      term: 'Authorization (AuthZ)',
      category: 'Foundations',
      fullName: 'Authorization',
      analogy: 'The travel Visa stamp inside your passport. The border guard reads it to see if you have legal permission to work or only visit, after you already proved who you are.',
      expert: 'The process of determining whether an authenticated entity has permission to perform a specific action or access a target resource (e.g. read, write, delete), managed via RBAC, ABAC, or policies.'
    },
    {
      id: 'bff',
      term: 'BFF Pattern',
      category: 'Protocols',
      fullName: 'Backend-for-Frontend Architectural Pattern',
      analogy: 'Hiring a personal lawyer to do your business. Instead of sending sensitive secrets directly to the front-line browser, your browser talks to a local secure server (BFF) which manages the keys safely behind closed doors.',
      expert: 'A secure design pattern for single-page applications. The SPA delegates OAuth token storage and session management to a secure server backend. The backend manages tokens and authenticates the SPA via encrypted, HttpOnly, SameSite cookies.'
    },
    {
      id: 'caep',
      term: 'CAEP',
      fullName: 'Continuous Access Evaluation Protocol',
      category: 'Zero Trust',
      analogy: 'A security guard constantly walking with you inside the bank. If you suddenly pull out a camera (a context change), they escort you out immediately, rather than waiting for your visitor badge to expire at 5 PM.',
      expert: 'An active profile of the Shared Signals Framework (RFC 9396) enabling Identity Providers to push real-time session revocation events (e.g., password resets, location anomalies) directly to Relying Party APIs to terminate active access tokens.'
    },
    {
      id: 'ciam',
      term: 'CIAM',
      fullName: 'Customer Identity & Access Management',
      category: 'Foundations',
      analogy: 'The frictionless signup door of an online store. It makes logging in incredibly easy (e.g. Sign in with Google, fingerprint touch), tracks marketing profiles, and scales to millions of users without crashing.',
      expert: 'A specialized branch of identity management optimized for customer-facing systems. Focuses on UX, scalability, social logins, consent management (GDPR), API integrations, and anomaly detection.'
    },
    {
      id: 'did',
      term: 'DID',
      fullName: 'Decentralized Identifier',
      category: 'Decentralized',
      analogy: 'An official physical driver\'s license card. You carry it in your wallet, show it to whom you want, and the DMV (Identity Provider) is never notified when or where you showed it.',
      expert: 'A standard W3C URI string resolving to cryptographic public keys held on a tamper-proof blockchain or distributed ledger, allowing users to verify their identities without centralized servers.'
    },
    {
      id: 'directory',
      term: 'Directory Services',
      category: 'Directories',
      fullName: 'Directory Services & Directories',
      analogy: 'An office telephone directory or organigram, mapping out people under specific departments, floors, and roles.',
      expert: 'A specialized hierarchical database optimized for read-heavy operations, organizing corporate resources, users, and credentials under domain trees accessed via LDAP or Active Directory protocols.'
    },
    {
      id: 'fido2',
      term: 'FIDO2 / WebAuthn',
      fullName: 'FIDO2 & Web Authentication standard',
      category: 'Protocols',
      analogy: 'Unlocking your computer with your face. Instead of typing a secret password, your device dynamically signs a cryptographic message locally and proves you possess the device.',
      expert: 'The unified passwordless authentication standard combining W3C WebAuthn and CTAP2. Uses asymmetric public-key cryptography to perform secure, phishing-resistant logins natively in-browser.'
    },
    {
      id: 'idp',
      term: 'IdP',
      fullName: 'Identity Provider',
      category: 'Foundations',
      analogy: 'The government passport agency. They verify your documents, print your passport, and sign it so that other countries can trust it is authentic.',
      expert: 'A central federation authority (e.g. Okta, Keycloak, Entra) that creates, maintains, and manages identity records, performing the actual authentication and issuing security tokens (OIDC/SAML) to client apps.'
    },
    {
      id: 'id_token',
      term: 'ID Token',
      category: 'Foundations',
      fullName: 'ID Token (OpenID Connect Assertion)',
      analogy: 'A laminated corporate name badge. It explicitly states your name, department, photo, and badge expiration date directly on the card so anyone can read it at a glance.',
      expert: 'OIDC Core 1.0. A JSON Web Token (JWT) containing cryptographically signed claims verifying the user\'s identity (such as \`sub\`, \`name\`, \`email\`, \`auth_time\`). It is intended strictly for the client application.'
    },
    {
      id: 'iga',
      term: 'IGA',
      fullName: 'Identity Governance and Administration',
      category: 'Governance',
      analogy: 'An annual school attendance audit. Managers review student files, confirm who has graduated (reclaiming building cards), and verify who needs specific library access.',
      expert: 'A security discipline focused on compliance, auditing, role administration, segregation of duties (SoD), and user access reviews to prevent entitlement accumulation.'
    },
    {
      id: 'jwe',
      term: 'JWE',
      fullName: 'JSON Web Encryption',
      category: 'Cryptography',
      analogy: 'Putting a letter inside a steel lockbox. Unlike a postcard (JWS) where anyone can read the text but cannot forge the signature, a JWE ensures only the recipient with the exact key can read the contents.',
      expert: 'RFC 7516 standard. A JWE encrypts the payload claims, hiding the data entirely from intermediaries. Typically uses hybrid encryption: symmetric CEK for the payload, wrapped asymmetrically for the recipient.'
    },
    {
      id: 'jwks',
      term: 'JWKS',
      fullName: 'JSON Web Key Set',
      category: 'Cryptography',
      analogy: 'A notary public publishing their official signature seal on a public library bulletin board. Anyone can verify the seal on a document is authentic by comparing it to the public board.',
      expert: 'RFC 7517. A JSON structure containing a list of public cryptographic keys issued by an Identity Server, allowing relying applications to dynamically verify JWT signatures via \`/.well-known/jwks.json\`.'
    },
    {
      id: 'jws',
      term: 'JWS',
      fullName: 'JSON Web Signature',
      category: 'Cryptography',
      analogy: 'A signed check from a bank. The text on the check is completely visible (not encrypted), but the signed line proves that the check was issued by the bank and has not been altered.',
      expert: 'RFC 7515. A standard representing a cryptographically secured JSON structure, binding signature checksums (HMAC or RSA) to the header and payload base64url blocks to prevent tampering.'
    },
    {
      id: 'jwt',
      term: 'JWT',
      fullName: 'JSON Web Token',
      category: 'Cryptography',
      analogy: 'A digital, self-contained passport card containing your name, photo, and signature. Any machine can read the card and trust the text because the government signed the signature block.',
      expert: 'RFC 7519. A compact, URL-safe string representing claims encoded as a JSON object, composed of three dot-separated blocks: Header, Payload, and Signature (\`xxxxx.yyyyy.zzzzz\`).'
    },
    {
      id: 'kerberos',
      term: 'Kerberos',
      category: 'Protocols',
      fullName: 'Kerberos Authentication Protocol',
      analogy: 'Like getting into a highly secure cinema: you buy a main entry ticket (Ticket Granting Ticket) once at the box office. Then, you trade it for individual cinema tickets (Service Tickets) at each room door without showing your ID again.',
      expert: 'RFC 4120. A symmetric, ticket-based computer network authentication protocol using Key Distribution Centers (KDC) to authenticate clients to server applications securely without sending passwords over the wire.'
    },
    {
      id: 'ldap',
      term: 'LDAP',
      fullName: 'Lightweight Directory Access Protocol',
      category: 'Directories',
      analogy: 'Like looking up a book in a library card catalog using a nested system: Floor -> Aisle -> Shelf -> Subject -> Book.',
      expert: 'RFC 4511. An active application protocol used to query and manage hierarchical directory services over IP networks. Utilizes distinguished names (DNs) and nested schemas to retrieve user/group records.'
    },
    {
      id: 'mfa',
      term: 'MFA',
      fullName: 'Multi-Factor Authentication',
      category: 'Foundations',
      analogy: 'Unlocking a high-security vault: you have to type the code (factor 1: what you know), insert a key card (factor 2: what you have), and scan your fingerprint (factor 3: what you are).',
      expert: 'A security mechanism requiring users to present two or more independent authentication factors (Knowledge, Possession, Inherence) to successfully verify identity.'
    },
    {
      id: 'oauth',
      term: 'OAuth 2.0 / 2.1',
      category: 'Protocols',
      fullName: 'Open Authorization Framework',
      analogy: 'A hotel electronic card. It is a key that lets you open a specific door for a specific time, without giving you ownership of the building or revealing your personal details.',
      expert: 'RFC 6749 & OAuth 2.1. An industry-standard authorization framework allowing third-party applications to obtain limited access to an HTTP resource on behalf of a resource owner via access tokens.'
    },
    {
      id: 'oidc',
      term: 'OIDC',
      fullName: 'OpenID Connect',
      category: 'Protocols',
      analogy: 'Adding a photo ID card inside your hotel keycard envelope. Not only can you unlock the door, but the hotel room bouncer also immediately knows your name and email.',
      expert: 'An identity layer built directly on top of the OAuth 2.0 authorization framework, standardizing user authentication and profile attributes using JSON Web Tokens (\`id_token\`).'
    },
    {
      id: 'pam',
      term: 'PAM',
      fullName: 'Privileged Access Management',
      category: 'Governance',
      analogy: 'A high-security vault containing master keys for your cloud servers. Only authorized technicians can check out a key, their screen is fully recorded while they use it, and the key automatically self-destructs after 1 hour.',
      expert: 'A governance sub-field focused on securing, monitoring, rotating, and recording privileged administrative credentials (SSH keys, root passwords, service keys) under Just-in-Time conditions.'
    },
    {
      id: 'passkey',
      term: 'Passkeys',
      category: 'Foundations',
      fullName: 'Passkeys (Biometric Credentials)',
      analogy: 'Unlocking your house with your fingerprint. The fingerprint never leaves your body, and there is no physical key under the welcome mat for an attacker to steal.',
      expert: 'Synced, domain-bound cryptographic credentials utilizing public-key cryptography (WebAuthn). Completely replaces passwords, ensuring immune defenses against phishing attacks.'
    },
    {
      id: 'pkce',
      term: 'PKCE',
      fullName: 'Proof Key for Code Exchange',
      category: 'Protocols',
      analogy: 'Like leaving a secret half-torn dollar bill at the hotel front desk when checking in. When you return later to get your room key, you must present the exact matching torn half to prove you are the same person.',
      expert: 'RFC 7636 standard. Prevents authorization code interception attacks on public clients. The client generates a random `code_verifier`, hashes it to a `code_challenge` for the front-channel, and proves it on the back-channel token exchange.'
    },
    {
      id: 'rbac',
      term: 'RBAC',
      fullName: 'Role-Based Access Control',
      category: 'Authorization' as any,
      analogy: 'Like assigning keys based on job descriptions: everyone on the finance team gets the keys to the accounting file cabinet, and everyone on engineering gets the keys to the server room.',
      expert: 'An authorization framework where access permissions are bound to logical "Roles" (e.g., editor, admin, viewer) and users are assigned to roles, reducing policy management overhead.'
    },
    {
      id: 'rebac',
      term: 'ReBAC',
      fullName: 'Relationship-Based Access Control',
      category: 'Authorization' as any,
      analogy: 'You can view a family photo album because you are the "child" of the owner, not because your job title says "Photo Viewer". Access is determined by your relationship to the file owner.',
      expert: 'An authorization model (Google Zanzibar standard) evaluating access based on a graph of relationships between users and objects (e.g., "User A is owner of Document B; Folder C contains Document B").'
    },
    {
      id: 'saml',
      term: 'SAML 2.0',
      fullName: 'Security Assertion Markup Language',
      category: 'Protocols',
      analogy: 'A physical passport. The border control (Service Provider) lets you in because they trust the visa stamp (XML Digital Signature) applied by your home government (Identity Provider).',
      expert: 'A heavyweight, XML-based open standard for exchanging authentication and authorization data between an IdP and an SP, heavily relying on XML Digital Signatures to prevent assertion tampering.'
    },
    {
      id: 'scim',
      term: 'SCIM 2.0',
      fullName: 'System for Cross-domain Identity Management',
      category: 'Provisioning',
      analogy: 'An automated megaphone. When HR hires you, the megaphone yells to Slack, AWS, and Salesforce simultaneously to create your accounts using the exact same standard form.',
      expert: 'RFC 7643. An open standard providing a common RESTful API schema (JSON) for managing user and group identities across cloud applications, eliminating custom API integration scripts.'
    },
    {
      id: 'ssf',
      term: 'SSF',
      fullName: 'Shared Signals Framework',
      category: 'Zero Trust',
      analogy: 'If an alarm goes off at one bank, they instantly broadcast alert signals to all neighboring banks so they can lock their doors, too.',
      expert: 'An open standardization framework (RFC 9396) enabling disparate SaaS platforms (e.g. Salesforce, Okta, Slack) to subscribe and exchange real-time JSON security event alerts.'
    },
    {
      id: 'sso',
      term: 'SSO',
      fullName: 'Single Sign-On',
      category: 'Foundations',
      analogy: 'Buying a secure entry wristband once at an amusement park. You show the wristband at every ride to enter immediately, without showing your wallet or ID at each separate gate.',
      expert: 'An authentication mechanism allowing a user to authenticate once to a central authority, gaining access to multiple independent applications without re-prompting credentials.'
    },
    {
      id: 'totp',
      term: 'TOTP',
      fullName: 'Time-Based One-Time Password',
      category: 'Cryptography',
      analogy: 'A bank vault code that changes every 30 seconds. Both you and the bank share a secret clock mechanism that generates the exact same matching code at the exact same second.',
      expert: 'RFC 6238. An algorithm generating a one-time password by hashing a shared secret key with the current timestamp, securing secondary user verification factors.'
    },
    {
      id: 'vc',
      term: 'Verifiable Credentials',
      category: 'Decentralized',
      fullName: 'Verifiable Credentials (W3C standard)',
      analogy: 'A digital university diploma inside your mobile wallet. You can show it to a hiring employer, and they can instantly verify it is authentic using the university\'s public key, without ever contacting the university.',
      expert: 'W3C standard. A cryptographically signed digital assertion representing qualification claims, allowing decentralised verification of user credentials without server-to-server redirects.'
    },
    {
      id: 'zero_trust',
      term: 'Zero Trust',
      fullName: 'Zero Trust Security Architecture',
      category: 'Zero Trust',
      analogy: 'A maximum-security military lab. Passing the main front gate isn\'t enough; every single door, terminal, and filing cabinet requires a separate badge scan, device posture check, and authentication, every single time.',
      expert: 'NIST SP 800-207. A security framework based on the premise: "Never Trust, Always Verify." Treats all network traffic as hostile, evaluating access decisions dynamically at Policy Decision Points (PDP).'
    }
  ]

  const filteredTerms = encyclopedia.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.fullName.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Book className="w-3.5 h-3.5" /> Encyclopedia
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Master IAM Glossary & Encyclopedia
        </h2>
        <p className="text-text-secondary">
          Translate complex identity acronyms. Every standard from ABAC to Zero Trust is defined with a beginner-friendly analogy and a strict, expert-grade architectural specification.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Side: Search and List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative w-full">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" 
              placeholder="Search 35 terms (e.g. PKCE)..." 
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', 'Foundations', 'Directories', 'Protocols', 'Governance', 'Cryptography', 'Zero Trust', 'Decentralized'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cat
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'bg-bg-sidebar text-text-muted border-border-subtle hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 mt-4 custom-scrollbar">
            {filteredTerms.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTerm(t)}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                  selectedTerm?.id === t.id
                    ? 'border-accent-primary bg-accent-glow shadow-sm'
                    : 'border-border-subtle bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                <div className="space-y-0.5">
                  <span className={`block text-sm font-black ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {t.term}
                  </span>
                  <span className="block text-[10px] text-text-muted font-bold uppercase truncate max-w-[160px]">
                    {t.category}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-muted'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Term Detail View */}
        <div className="lg:col-span-3">
          {selectedTerm ? (
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-8 animate-fadeIn h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-2 border-b border-border-subtle pb-6 relative z-10">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {selectedTerm.category}
                </span>
                <h3 className="text-3xl font-black text-text-primary">{selectedTerm.term}</h3>
                <p className="text-base text-text-secondary font-medium">{selectedTerm.fullName}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {/* Analogy */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> The Beginner Analogy
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    "{selectedTerm.analogy}"
                  </p>
                </div>

                {/* Expert Detail */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-secondary uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Expert Technical Specification
                  </span>
                  <p className="text-[12px] text-text-primary leading-relaxed font-mono bg-bg-nested p-3.5 rounded border border-border-subtle/50">
                    {selectedTerm.expert}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-nested/30 border border-border-subtle/50 flex gap-3 text-xs text-text-muted font-semibold items-start relative z-10">
                <FileText className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>Want to see how {selectedTerm.term} fits into active code or real handshakes? Browse the Playgrounds or play with our visual OIDC handshakes!</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-subtle rounded-2xl bg-bg-card/50">
              <Book className="w-12 h-12 text-text-muted mb-4" />
              <h4 className="text-lg font-bold text-text-primary">Select a Term</h4>
              <p className="text-sm text-text-secondary">Click on any acronym or standard on the left to reveal its deep-dive translation and layman analogies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
