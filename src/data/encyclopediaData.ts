import type { Term } from '../pages/Encyclopedia'

export const ENCYCLOPEDIA_TERMS: Term[] = [
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
      category: 'Authorization',
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
      expert: 'RFC 6749. A string or JWT representing authorization granted to the client application. It is passed in HTTP headers (`Authorization: Bearer <token>`) to authenticate requests at resource APIs.'
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
      id: 'bcrypt',
      term: 'bcrypt',
      fullName: 'bcrypt Password Hashing Algorithm',
      category: 'Cryptography',
      analogy: 'bcrypt is a lock that is deliberately slow to pick, on purpose — so that even if a thief steals the entire box of locks (your database), trying keys against even one lock is impractically slow.',
      expert: 'A Blowfish-based adaptive key-derivation and password hashing function. Features a configurable work factor that doubles the computation time per increment to resist brute-force hardware scaling.',
      toolUrl: '/tools/bcrypt-generator'
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
      expert: 'A standard W3C URI string resolving to cryptographic public keys held on a tamper-proof blockchain or distributed ledger, allowing users to verify their identities without centralized servers.',
      toolUrl: '/tools/did-key-generator'
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
      expert: 'The unified passwordless authentication standard combining W3C WebAuthn and CTAP2. Uses asymmetric public-key cryptography to perform secure, phishing-resistant logins natively in-browser.',
      toolUrl: '/tools/webauthn-decoder'
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
      expert: 'OIDC Core 1.0. A JSON Web Token (JWT) containing cryptographically signed claims verifying the user\'s identity (such as `sub`, `name`, `email`, `auth_time`). It is intended strictly for the client application.'
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
      expert: 'RFC 7517. A JSON structure containing a list of public cryptographic keys issued by an Identity Server, allowing relying applications to dynamically verify JWT signatures via `/.well-known/jwks.json`.',
      toolUrl: '/tools/jwk-pem-converter'
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
      expert: 'RFC 7519. A compact, URL-safe string representing claims encoded as a JSON object, composed of three dot-separated blocks: Header, Payload, and Signature (`xxxxx.yyyyy.zzzzz`).',
      toolUrl: '/tools/jwt-decoder'
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
      expert: 'RFC 4511. An active application protocol used to query and manage hierarchical directory services over IP networks. Utilizes distinguished names (DNs) and nested schemas to retrieve user/group records.',
      toolUrl: '/tools/ldap-filter-builder'
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
      expert: 'An identity layer built directly on top of the OAuth 2.0 authorization framework, standardizing user authentication and profile attributes using JSON Web Tokens (`id_token`).'
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
      expert: 'RFC 7636 standard. Prevents authorization code interception attacks on public clients. The client generates a random `code_verifier`, hashes it to a `code_challenge` for the front-channel, and proves it on the back-channel token exchange.',
      toolUrl: '/tools/oauth-pkce-generator'
    },
    {
      id: 'rbac',
      term: 'RBAC',
      fullName: 'Role-Based Access Control',
      category: 'Authorization',
      analogy: 'Like assigning keys based on job descriptions: everyone on the finance team gets the keys to the accounting file cabinet, and everyone on engineering gets the keys to the server room.',
      expert: 'An authorization framework where access permissions are bound to logical "Roles" (e.g., editor, admin, viewer) and users are assigned to roles, reducing policy management overhead.'
    },
    {
      id: 'rebac',
      term: 'ReBAC',
      fullName: 'Relationship-Based Access Control',
      category: 'Authorization',
      analogy: 'You can view a family photo album because you are the "child" of the owner, not because your job title says "Photo Viewer". Access is determined by your relationship to the file owner.',
      expert: 'An authorization model (Google Zanzibar standard) evaluating access based on a graph of relationships between users and objects (e.g., "User A is owner of Document B; Folder C contains Document B").'
    },
    {
      id: 'saml',
      term: 'SAML 2.0',
      fullName: 'Security Assertion Markup Language',
      category: 'Protocols',
      analogy: 'A physical passport. The border control (Service Provider) lets you in because they trust the visa stamp (XML Digital Signature) applied by your home government (Identity Provider).',
      expert: 'A heavyweight, XML-based open standard for exchanging authentication and authorization data between an IdP and an SP, heavily relying on XML Digital Signatures to prevent assertion tampering.',
      toolUrl: '/tools/saml-decoder'
    },
    {
      id: 'scim',
      term: 'SCIM 2.0',
      fullName: 'System for Cross-domain Identity Management',
      category: 'Provisioning',
      analogy: 'An automated megaphone. When HR hires you, the megaphone yells to Slack, AWS, and Salesforce simultaneously to create your accounts using the exact same standard form.',
      expert: 'RFC 7643. An open standard providing a common RESTful API schema (JSON) for managing user and group identities across cloud applications, eliminating custom API integration scripts.',
      toolUrl: '/tools/scim-payload-validator'
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
      expert: 'RFC 6238. An algorithm generating a one-time password by hashing a shared secret key with the current timestamp, securing secondary user verification factors.',
      toolUrl: '/tools/totp-generator'
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
    },
    {
      id: 'onewelcome',
      term: 'OneWelcome',
      fullName: 'Thales OneWelcome Identity Platform',
      category: 'Protocols',
      analogy: 'The highly welcoming and organized reception of a luxury hotel. It seamlessly guides guest registrations, manages GDPR room privacy preferences, and delegates keycard distributions to travel agency partners.',
      expert: 'A leading European Customer and Partner IAM (CIAM & B2B) platform specializing in no-code visual workflow orchestration, user consent management, and partner-delegated administration.'
    },
    {
      id: 'sta',
      term: 'STA',
      fullName: 'SafeNet Trusted Access',
      category: 'Zero Trust',
      analogy: 'A secure bank vaults dynamic entrance control. Even if you have a key, it checks your current IP geolocation, monitors device compliance indicators, and prompts dynamic push biometric approvals before opening.',
      expert: 'Thales\' military-grade access management service delivering adaptive MFA and context-aware Single Sign-On (SSO), using physical HSMs to protect all cryptographic signing keys.'
    },
    {
      id: 'identity_orchestration',
      term: 'Identity Orchestration',
      fullName: 'Identity Orchestration & Externalized Authorization',
      category: 'Authorization',
      analogy: 'A flight dispatcher mapping coordinate points dynamically. Instead of hardcoding flight paths, the dispatcher visually routes airplanes around storms and delays in real-time.',
      expert: 'The architectural practice of abstracting user authentication and registration workflows into a separate, visual policy layer (e.g. Thales OneWelcome Orchestrator), allowing organizations to change security paths without rewriting application code.'
    },
    {
      id: 'dpop',
      term: 'DPoP',
      fullName: 'Demonstrating Proof-of-Possession (RFC 9449)',
      category: 'Protocols',
      analogy: 'Like wrapping your bearer keycard in a fingerprint-locked sleeve. Even if a pickpocket steals the card, they cannot use it because it will only unlock if presented alongside your active biometric thumbprint (the client\'s private key signature).',
      expert: 'RFC 9449. A security extension for OAuth 2.0 Access and Refresh tokens. Requires the client to generate a local asymmetric key pair and sign a JWS containing the target HTTP request parameters (method, URI, timestamp). This binds the token to that specific client, preventing token replay attacks if intercepted.'
    },
    {
      id: 'fapi',
      term: 'FAPI',
      fullName: 'Financial-grade API Security Profile',
      category: 'Protocols',
      analogy: 'An armored bank transport truck instead of a standard courier envelope. Every single lock, hinge, and dispatch time is cryptographically audited and verified to prevent high-value bank robberies.',
      expert: 'An OpenID Foundation security profile. Establishes a highly hardened layer on top of OAuth 2.0 and OIDC. Mandates mutual TLS (mTLS), strict asymmetric public key authentication, cryptographic request object signings (PAR), and sender-constrained DPoP tokens to secure financial Open Banking APIs.'
    },
    {
      id: 'gnap',
      term: 'GNAP',
      fullName: 'Grant Negotiation and Authorization Protocol',
      category: 'Protocols',
      analogy: 'Like a digital lawyer drawing up a bespoke contract. Instead of just showing a generic badge (a token), the client and server negotiate exact, custom access boundaries and parameters on the spot before any key is issued.',
      expert: 'A prospective successor framework to OAuth 2.0 (RFC 6749). Decouples client authentication, user consent, and token issuance into a highly expressive, single negotiation request-response protocol, eliminating the need for complex browser redirects and implicit flow hacks.'
    },
    {
      id: 'scim_patch',
      term: 'SCIM PATCH',
      fullName: 'SCIM 2.0 Attribute-Level Reconciliation',
      category: 'Provisioning',
      analogy: 'Making a minor edit on page 4 of a document instead of completely discarding the book, rewriting everything, and printing a new copy from scratch.',
      expert: 'RFC 7644. A REST API method enabling partial, attribute-level modifications inside SCIM 2.0 directories. Supports "add", "remove", and "replace" operations, dramatically reducing network payload overhead and preventing race-conditions.'
    },
    {
      id: 'mtls',
      term: 'mTLS',
      fullName: 'Mutual Transport Layer Security',
      category: 'Cryptography',
      analogy: 'A bank teller verifying your ID, while you simultaneously demand to see the teller\'s official badge. Both parties must prove who they are before any money is slid through the slot.',
      expert: 'Mutual Transport Layer Security. An extension of TLS where both the client and server validate each other\'s X.509 digital certificates before establishing an encrypted tunnel, forming the core perimeter control for zero-trust microservices.'
    },
    {
      id: 'par',
      term: 'PAR',
      fullName: 'Pushed Authorization Requests (RFC 9126)',
      category: 'Protocols',
      analogy: 'Handing your confidential medical records directly to the doctor behind closed doors, and getting a tiny claims ticket to show the receptionist, instead of walking through the crowded lobby waving your records in the air.',
      expert: 'RFC 9126. An OAuth 2.0 security extension. The client "pushes" sensitive authorization parameters (like scopes and request URIs) directly to the IdP backchannel over HTTPS, receiving a short-lived "request_uri" ticket. The client browser redirect is then executed strictly with this ticket, preventing parameter tampering.'
    },
    {
      id: 'dmarc',
      term: 'DMARC',
      fullName: 'Domain-based Message Authentication, Reporting, and Conformance',
      category: 'Governance',
      analogy: 'A corporate mailroom stamping every outgoing envelope with a wax seal, and telling all post offices to shred any envelope claiming to be from them that lacks the seal.',
      expert: 'RFC 7489. An email authentication protocol that builds upon SPF and DKIM. Enables domain owners to publish strict DNS policy records specifying how receiving mail servers should handle unauthorized spoofs (e.g. p=reject), protecting identity domains from phishing.'
    },
    {
      id: 'zkp',
      term: 'ZKP',
      fullName: 'Zero-Knowledge Proof (Decentralized Identity)',
      category: 'Decentralized',
      analogy: 'Proving to a bartender you are over 21 by showing a glowing green light on your phone, without revealing your actual driver\'s license, name, or birthdate.',
      expert: 'A cryptographic method by which one party (the prover) can prove to another party (the verifier) that a given statement is true, without conveying any information beyond the statement\'s validity (e.g. proof of credential ownership or mathematical bounds).'
    },
    {
      id: 'kms',
      term: 'KMS',
      fullName: 'Key Management Service & Hardware HSMs',
      category: 'Cryptography',
      analogy: 'A locked room inside a secure bank vault where keys are generated, stored, and used to sign/decrypt documents. The keys never leave the locked room, and any signing request is executed inside under strict surveillance.',
      expert: 'A cloud or hardware-backed (HSM) system offering centralized key generation, lifecycle management, rotation, and cryptographic operations, securing Master Keys and DEKs.'
    },
    {
      id: 'abac_policy_engine',
      term: 'ABAC Policy Engine',
      fullName: 'Dynamic Attribute-Based Evaluation Gateway',
      category: 'Authorization',
      analogy: 'A smart digital bouncer that checks if the customer is on the list (identity), if they have their ID (credentials), if the bar is not full (resource), and if it\'s before midnight (context) before granting entry.',
      expert: 'A Policy Decision Point (PDP) evaluating incoming access requests against Attribute-Based rules, utilizing context (time, location), user attributes (clearance, roles), and resource metadata dynamically.'
    }
]
