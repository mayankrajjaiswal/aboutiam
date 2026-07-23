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
    },
    {
      id: 'ciba',
      term: 'CIBA',
      fullName: 'Client-Initiated Backchannel Authentication',
      category: 'Protocols',
      analogy: 'A waiter bringing the payment terminal directly to your table instead of walking you to a register at the front counter. The approval happens on a separate device (your phone) while you keep sitting at a completely different one (a smart TV or kiosk).',
      expert: 'An OpenID Foundation extension to OIDC enabling decoupled authentication: a consumption device (smart TV, kiosk, call center agent) initiates a login request via the backchannel, and the actual user approval happens asynchronously on a separate authentication device (e.g. a mobile app push).'
    },
    {
      id: 'rar',
      term: 'RAR',
      fullName: 'Rich Authorization Requests (RFC 9396)',
      category: 'Authorization',
      analogy: 'Instead of asking for a vague "shopping" pass, you request a precise permission slip: "$50 max, only at Store X, only until Friday." The merchant can read the exact fine print before approving anything.',
      expert: 'RFC 9396. Extends OAuth 2.0 beyond flat string `scope` values by letting clients request fine-grained, structured JSON authorization details (exact amounts, resource identifiers, actions), commonly used in Open Banking and FAPI-profile deployments.'
    },
    {
      id: 'sd_jwt',
      term: 'SD-JWT',
      fullName: 'Selective Disclosure JSON Web Token',
      category: 'Cryptography',
      analogy: 'Handing someone a diploma where individual lines (your major, your GPA, your graduation date) are each covered by a removable sticker. You peel off only the stickers relevant to the person asking, without invalidating the university\'s original seal.',
      expert: 'An IETF format layering selective disclosure over JWTs: the issuer hashes and commits individual claims as separate disclosable blocks, letting a holder reveal only a subset of claims to a verifier while the original issuer signature still validates the presented subset.',
      toolUrl: '/tools/sd-jwt-decoder'
    },
    {
      id: 'mdl',
      term: 'mDL / mDoc',
      fullName: 'Mobile Driver\'s License (ISO/IEC 18013-5)',
      category: 'Decentralized',
      analogy: 'Tapping your phone at airport security instead of handing over a plastic driver\'s license. The scanner only learns "yes, over 21, photo matches" — not your home address or license number, unless you explicitly approve sharing more.',
      expert: 'ISO/IEC 18013-5. A standardized, cryptographically signed mobile credential format for government-issued IDs, supporting offline BLE/NFC device engagement and selective attribute disclosure to a verifying reader without contacting the issuing authority in real time.'
    },
    {
      id: 'radius',
      term: 'RADIUS',
      fullName: 'Remote Authentication Dial-In User Service',
      category: 'Protocols',
      analogy: 'The badge-check intercom at an old office building\'s parking gate: your car radio badge talks to a central guard booth, which checks a logbook and buzzes the gate open — the network switch or VPN box never needs its own user database.',
      expert: 'RFC 2865. A legacy but still widely deployed AAA protocol used by network devices (VPN concentrators, Wi-Fi access points, switches) to centralize authentication, authorization, and accounting against a shared server, typically backed by Active Directory or LDAP.'
    },
    {
      id: 'ocsp',
      term: 'OCSP',
      fullName: 'Online Certificate Status Protocol',
      category: 'Cryptography',
      analogy: 'Calling the DMV\'s hotline to ask "is this specific driver\'s license still valid right now?" instead of downloading their entire multi-thousand-page ledger of every revoked license ever issued.',
      expert: 'RFC 6960. A real-time protocol allowing a relying party to query a Certificate Authority (or its designated responder) about the current revocation status of a single X.509 certificate, avoiding the need to download a full Certificate Revocation List.'
    },
    {
      id: 'crl',
      term: 'CRL',
      fullName: 'Certificate Revocation List',
      category: 'Cryptography',
      analogy: 'A bouncer\'s printed clipboard listing every banned patron\'s name. It works, but it can be huge, gets stale between reprints, and must be fully re-read every time.',
      expert: 'RFC 5280. A digitally signed, timestamped list published periodically by a Certificate Authority enumerating serial numbers of X.509 certificates that have been revoked before their natural expiry, checked by clients as an alternative or fallback to OCSP.'
    },
    {
      id: 'token_binding',
      term: 'Token Binding',
      category: 'Protocols',
      fullName: 'Token Binding Protocol (RFC 8471)',
      analogy: 'Welding a hotel keycard directly to your specific wristband at check-in. Even if someone photocopies the keycard, it won\'t open any door unless it\'s still attached to your original wristband.',
      expert: 'RFC 8471/8473. A TLS-layer mechanism cryptographically binding security tokens (session cookies, OAuth tokens) to the underlying TLS connection\'s key pair, so a stolen bearer token cannot be replayed from a different client — a conceptual precursor to DPoP.'
    },
    {
      id: 'step_up_auth',
      term: 'Step-Up Authentication',
      category: 'Foundations',
      fullName: 'Step-Up (Adaptive) Authentication',
      analogy: 'A bank letting you check your balance with just a PIN, but demanding a manager\'s signature and photo ID the moment you try to wire $50,000 out of the account.',
      expert: 'An authentication pattern where a session initially authenticated at a lower assurance level is prompted to re-authenticate with a stronger factor (biometric, hardware key, fresh MFA challenge) before permitting a higher-risk or higher-value operation.'
    },
    {
      id: 'rba',
      term: 'RBA',
      fullName: 'Risk-Based Authentication',
      category: 'Zero Trust',
      analogy: 'A doorman who waves you through instantly on your usual daily visit, but suddenly demands your full ID and a phone call to your host the one time you show up at 3 AM from a city you\'ve never been to.',
      expert: 'An adaptive authentication approach that scores each login attempt in real time against signals (IP reputation, device fingerprint, geovelocity, behavioral biometrics) and dynamically escalates to additional MFA challenges or blocks the attempt when the computed risk score exceeds a threshold.'
    },
    {
      id: 'jit_provisioning',
      term: 'JIT Provisioning',
      fullName: 'Just-in-Time User Provisioning',
      category: 'Provisioning',
      analogy: 'A hotel that only prints your room keycard the moment you walk up to the front desk with a valid reservation, rather than pre-printing keycards for every guest who might ever book a room.',
      expert: 'A provisioning pattern where a user account is created or updated in a Service Provider at the moment of their first successful SSO assertion (SAML/OIDC), populated directly from IdP-asserted attributes, instead of being pre-provisioned via SCIM ahead of time.'
    },
    {
      id: 'entitlement_management',
      term: 'Entitlement Management',
      fullName: 'Cloud Infrastructure Entitlement Management (CIEM) & Fine-Grained Entitlements',
      category: 'Governance',
      analogy: 'An inventory clerk who tracks not just which employees have a master key, but exactly which specific drawers, cabinets, and shelves that master key happens to unlock across every warehouse in the company.',
      expert: 'The governance discipline of discovering, cataloging, and right-sizing the granular permissions ("entitlements") granted to human and non-human identities across cloud IaaS/PaaS/SaaS resources, commonly surfaced via CIEM tooling to detect excessive standing privilege.'
    },
    {
      id: 'access_recertification',
      term: 'Access Recertification',
      fullName: 'Access Recertification & Attestation Campaigns',
      category: 'Governance',
      analogy: 'A quarterly fire-drill roll call where every floor manager must explicitly re-confirm, in writing, that each person on their floor still needs the badge they were issued — or have it revoked.',
      expert: 'A recurring IGA control (often driven by SOX, SOC2, or ISO 27001 requirements) where resource/application owners formally review and re-approve or revoke each user\'s existing entitlements on a fixed cadence, producing an auditable attestation trail.'
    },
    {
      id: 'ws_federation',
      term: 'WS-Federation',
      fullName: 'Web Services Federation Language',
      category: 'Protocols',
      analogy: 'An older, more formal cousin of SAML\'s passport-and-visa system — same basic idea of a trusted stamp from a home authority, just written in a stricter, more verbose legal dialect that\'s gradually falling out of everyday use.',
      expert: 'A legacy XML-based federated identity protocol (closely associated with Microsoft ADFS) predating widespread SAML 2.0 and OIDC adoption, still encountered in older enterprise SSO integrations but generally being phased out in favor of SAML 2.0 or OIDC.'
    },
    {
      id: 'spiffe_spire',
      term: 'SPIFFE / SPIRE',
      fullName: 'Secure Production Identity Framework for Everyone',
      category: 'Zero Trust',
      analogy: 'A factory that stamps a unique, forgery-proof serial number and birth-certificate onto every single machine part the moment it comes off the line, so any other machine on the floor can instantly verify exactly which part it\'s talking to.',
      expert: 'An open standard (CNCF) and its reference implementation (SPIRE) for issuing short-lived, cryptographically verifiable identities (SVIDs, typically X.509 or JWT) to non-human workloads in dynamic, multi-cloud, or Kubernetes environments, removing the need for long-lived static API keys or shared secrets.',
      toolUrl: '/playground/workload-mesh'
    },
    {
      id: 'password',
      term: 'Password',
      fullName: 'Password / Shared Secret Credential',
      category: 'Foundations',
      analogy: 'A spoken word you and the doorman agreed on in advance. If anyone else learns the word, the door opens for them too — the lock has no idea it isn\'t really you.',
      expert: 'The original "something you know" authentication factor: a secret string compared (usually as a salted hash) against a stored value at login. Weak on its own against phishing, reuse, and brute-force, hence the push toward MFA and passwordless.'
    },
    {
      id: 'passwordless',
      term: 'Passwordless Authentication',
      fullName: 'Passwordless Authentication',
      category: 'Foundations',
      analogy: 'Getting into your apartment with your fingerprint or a key fob instead of memorizing a combination — nothing secret to type, phish, or forget.',
      expert: 'An authentication approach that removes shared-secret passwords entirely, relying instead on possession/inherence factors such as FIDO2/WebAuthn passkeys, magic links, or push approvals, eliminating credential-stuffing and phishing-of-passwords risk classes.'
    },
    {
      id: 'service_provider',
      term: 'Service Provider (SP)',
      fullName: 'Service Provider / Relying Party',
      category: 'Foundations',
      analogy: 'The nightclub that trusts the wristband a separate ticket booth already put on your wrist, instead of checking IDs itself.',
      expert: 'In a federated identity exchange (SAML, OIDC), the application or API that consumes an identity assertion/token issued by an Identity Provider and grants access based on it, rather than authenticating the user directly.'
    },
    {
      id: 'relying_party',
      term: 'Relying Party (RP)',
      fullName: 'Relying Party',
      category: 'Foundations',
      analogy: 'A landlord who accepts a background-check report from a trusted agency instead of running their own investigation on every tenant.',
      expert: 'The OIDC/WebAuthn term for the entity that trusts and consumes assertions or credentials from an external Identity Provider or authenticator, delegating identity verification to that trusted third party.'
    },
    {
      id: 'federation',
      term: 'Identity Federation',
      fullName: 'Identity Federation',
      category: 'Foundations',
      analogy: 'A student ID that also gets you into the library, the gym, and the cafeteria across several partner campuses, because all the schools agreed to trust one another\'s ID cards.',
      expert: 'A trust arrangement allowing a user authenticated by one domain (the IdP) to access resources in another domain (the SP/RP) without re-authenticating, implemented via protocols like SAML, OIDC, or WS-Federation.'
    },
    {
      id: 'claims',
      term: 'Claims',
      fullName: 'Identity Claims',
      category: 'Foundations',
      analogy: 'The stamped facts printed on your passport — name, birthdate, nationality — that the issuing government is vouching for on your behalf.',
      expert: 'Key-value assertions about a subject (e.g. `sub`, `email`, `role`) embedded in a token or SAML assertion by an Identity Provider, consumed by relying parties to make authentication or authorization decisions without a live lookup.'
    },
    {
      id: 'consent_management',
      term: 'Consent Management',
      fullName: 'Consent Management',
      category: 'Foundations',
      analogy: 'The screen an app shows before it accesses your contacts or camera — you explicitly tap "Allow" before anything is shared.',
      expert: 'The mechanism (often an OAuth consent screen) by which a resource owner explicitly grants a client application specific scopes of access to their data, recorded and revocable to satisfy user-control requirements under GDPR/CCPA.'
    },
    {
      id: 'onboarding_offboarding',
      term: 'Onboarding / Offboarding',
      fullName: 'User Onboarding & Offboarding',
      category: 'Provisioning',
      analogy: 'Issuing a new employee their badge, laptop, and building access on day one, and collecting every single one of those back the moment they resign.',
      expert: 'The lifecycle processes of granting an identity its initial birthright access upon joining (onboarding) and deterministically revoking every entitlement and credential upon departure (offboarding), typically automated via an IGA platform to close the access-recovery gap.'
    },
    {
      id: 'least_privilege',
      term: 'Least Privilege',
      fullName: 'Principle of Least Privilege (PoLP)',
      category: 'Governance',
      analogy: 'Giving a hotel cleaner a key that only opens the rooms on her assigned floor, never a master key to the whole building, even though it would be more "convenient."',
      expert: 'A foundational security design principle stating that every identity — human or machine — should hold the minimum set of permissions necessary to perform its function, and nothing more, shrinking the blast radius of any single compromised credential.'
    },
    {
      id: 'session',
      term: 'Session',
      fullName: 'Authentication Session',
      category: 'Foundations',
      analogy: 'The wristband a concert gives you after you show your ticket once — you don\'t re-show the ticket at every stage, just flash the wristband until the show ends.',
      expert: 'A server- or client-tracked period during which a previously authenticated user is recognized without re-presenting credentials, typically bound to a session ID cookie or token with an expiry, idle timeout, and revocation mechanism.'
    },
    {
      id: 'cookie',
      term: 'HTTP Cookie',
      fullName: 'HTTP Cookie',
      category: 'Foundations',
      analogy: 'A coat-check ticket stub: the venue keeps your coat (the real session state) and just hands you a small numbered stub to prove which coat is yours.',
      expert: 'A small piece of state stored by the browser and sent back with every request to the issuing domain, commonly used to carry session identifiers. Security depends on flags like `HttpOnly` (blocks JS access), `Secure` (HTTPS-only), and `SameSite` (limits cross-site sending).'
    },
    {
      id: 'api_key',
      term: 'API Key',
      fullName: 'API Key',
      category: 'Foundations',
      analogy: 'A shared garage-door remote given to a delivery service — it opens the door, but it doesn\'t prove which specific driver is holding it.',
      expert: 'A long-lived, typically un-scoped static secret string presented by a client to authenticate to an API. Lacks the expiry, audience-binding, and claims richness of OAuth tokens, making it weaker for fine-grained or short-lived machine-to-machine authorization.'
    },
    {
      id: 'basic_auth',
      term: 'Basic Authentication',
      fullName: 'HTTP Basic Authentication (RFC 7617)',
      category: 'Protocols',
      analogy: 'Yelling your username and password out loud at the door every single time you want to walk through it — simple, but anyone listening in hears everything.',
      expert: 'An HTTP authentication scheme sending a Base64-encoded `username:password` pair in the `Authorization` header on every request. Provides no encryption of its own (relies entirely on TLS) and no session concept, making it unsuitable without HTTPS.'
    },
    {
      id: 'digest_auth',
      term: 'Digest Authentication',
      fullName: 'HTTP Digest Access Authentication',
      category: 'Protocols',
      analogy: 'Instead of shouting your password at the door, you shout a secret math answer that only someone who knows the password could compute correctly.',
      expert: 'An HTTP authentication scheme improving on Basic Auth by hashing credentials with a server-supplied nonce before transmission, avoiding sending the password in cleartext, though largely superseded today by Bearer tokens over TLS.'
    },
    {
      id: 'bearer_token',
      term: 'Bearer Token',
      fullName: 'Bearer Token (RFC 6750)',
      category: 'Protocols',
      analogy: 'Cash in your pocket — whoever is physically holding the bill can spend it, no ID check required.',
      expert: 'A security token where possession alone is sufficient for access; the API accepts any request presenting a valid, unexpired token in the `Authorization: Bearer` header without verifying who is presenting it, unlike proof-of-possession schemes like DPoP.'
    },
    {
      id: 'opaque_token',
      term: 'Opaque Token',
      fullName: 'Opaque Access Token',
      category: 'Protocols',
      analogy: 'A coat-check number that means nothing on its own — the coat-check counter has to look it up in their ledger to know whose coat it refers to.',
      expert: 'An access token that is an unstructured, unparseable random string rather than a self-contained JWT. Resource servers must call the Authorization Server\'s introspection endpoint to resolve its validity and associated claims, trading client-side verifiability for easier centralized revocation.'
    },
    {
      id: 'token_introspection',
      term: 'Token Introspection',
      fullName: 'OAuth 2.0 Token Introspection (RFC 7662)',
      category: 'Protocols',
      analogy: 'Calling the bank\'s hotline to ask "is this check still good?" instead of trusting the numbers printed on the check itself.',
      expert: 'An endpoint (`/introspect`) exposed by an Authorization Server that lets a resource server submit an opaque or JWT access token and receive back its current validity, scopes, and associated claims in real time.'
    },
    {
      id: 'token_revocation',
      term: 'Token Revocation',
      fullName: 'OAuth 2.0 Token Revocation (RFC 7009)',
      category: 'Protocols',
      analogy: 'Calling the DMV to formally cancel a driver\'s license before its printed expiry date, so it stops working immediately everywhere.',
      expert: 'An Authorization Server endpoint allowing a client to invalidate an access or refresh token before its natural expiry, ensuring a stolen or no-longer-needed token cannot be used again even if it hasn\'t technically expired.'
    },
    {
      id: 'discovery_document',
      term: 'Discovery Document',
      fullName: 'OIDC Discovery / .well-known Configuration',
      category: 'Protocols',
      analogy: 'A visitor\'s map posted at a building entrance listing exactly which door is the front desk, which is the elevator, and which is security — so guests don\'t have to guess.',
      expert: 'A JSON document published at `/.well-known/openid-configuration` enumerating an OIDC provider\'s endpoints (authorization, token, userinfo, jwks_uri) and supported capabilities, allowing clients to auto-configure themselves against any compliant IdP.'
    },
    {
      id: 'dynamic_client_registration',
      term: 'Dynamic Client Registration',
      fullName: 'OAuth 2.0 Dynamic Client Registration (RFC 7591)',
      category: 'Protocols',
      analogy: 'A hotel kiosk that lets a new guest print their own keycard on the spot, instead of requiring the front desk manager to manually create every guest profile ahead of time.',
      expert: 'A protocol allowing OAuth/OIDC client applications to programmatically register themselves with an Authorization Server via an API call, receiving a `client_id`/`client_secret` at runtime rather than through manual admin configuration.'
    },
    {
      id: 'confidential_public_client',
      term: 'Confidential vs Public Client',
      fullName: 'OAuth 2.0 Client Types',
      category: 'Protocols',
      analogy: 'A bank teller (confidential — works behind a locked counter, can keep a safe combination secret) versus a customer filling out a form in the open lobby (public — anything they hold can be seen by anyone nearby).',
      expert: 'OAuth classifies clients by their ability to protect secrets: confidential clients (backend servers) can securely hold a `client_secret`; public clients (SPAs, mobile apps) cannot, and must instead rely on PKCE to prevent authorization code interception.'
    },
    {
      id: 'nonce',
      term: 'Nonce',
      fullName: 'Cryptographic Nonce',
      category: 'Protocols',
      analogy: 'A one-time-use raffle ticket number stamped "VOID IF COPIED" — if you see that exact number twice, something is wrong.',
      expert: 'A unique, single-use value included in an OIDC authentication request and echoed back in the ID Token to bind the token to that specific request, preventing replay attacks where a captured ID Token is resubmitted later.'
    },
    {
      id: 'state_parameter',
      term: 'State Parameter',
      fullName: 'OAuth 2.0 State Parameter',
      category: 'Protocols',
      analogy: 'A claim-check number you write down before stepping away from your seat, so when you come back you can prove this is really your seat and not someone else\'s.',
      expert: 'An opaque, client-generated value passed through the OAuth authorization request and returned unmodified on the redirect callback, used to correlate the response to the original request and mitigate CSRF attacks against the redirect URI.'
    },
    {
      id: 'scope',
      term: 'Scope',
      fullName: 'OAuth 2.0 Scope',
      category: 'Protocols',
      analogy: 'A hotel keycard explicitly programmed for "gym + pool only" — it simply will not open your actual room door, by design.',
      expert: 'A space-delimited string in an OAuth request declaring the specific subset of a resource owner\'s data or actions the client is requesting access to (e.g. `read:contacts`), which the Authorization Server may reduce or reject at consent time.'
    },
    {
      id: 'resource_server',
      term: 'Resource Server',
      fullName: 'OAuth 2.0 Resource Server',
      category: 'Protocols',
      analogy: 'The actual vault room inside a bank, which only checks that your key card is valid before letting you take out your safety-deposit box — it never issued the key card itself.',
      expert: 'The API or service in an OAuth flow that hosts protected resources and validates incoming access tokens (locally via JWT signature checks, or remotely via introspection) before serving a request, distinct from the Authorization Server that issued the token.'
    },
    {
      id: 'authorization_server',
      term: 'Authorization Server',
      fullName: 'OAuth 2.0 Authorization Server',
      category: 'Protocols',
      analogy: 'The bank branch that verifies your identity and prints your key card, as opposed to the vault room that merely reads the card at the door.',
      expert: 'The OAuth 2.0 component responsible for authenticating the resource owner, obtaining consent, and issuing access/refresh/ID tokens to clients — commonly bundled with the IdP in modern platforms (Okta, Entra ID, Auth0, Keycloak).'
    },
    {
      id: 'authorization_code_grant',
      term: 'Authorization Code Grant',
      fullName: 'OAuth 2.0 Authorization Code Grant',
      category: 'Protocols',
      analogy: 'Getting a coat-check stub at the door (the code), then trading that stub privately at the counter for your actual coat (the token) — the crowd never sees the coat itself.',
      expert: 'The core OAuth 2.0 flow: the client redirects the user to authenticate at the Authorization Server, receives a short-lived one-time code via redirect, then exchanges that code server-side (with PKCE for public clients) for access/refresh tokens over a back-channel call.'
    },
    {
      id: 'client_credentials_grant',
      term: 'Client Credentials Grant',
      fullName: 'OAuth 2.0 Client Credentials Grant',
      category: 'Protocols',
      analogy: 'One vending machine company badge-swiping into another company\'s warehouse using its own corporate ID — no individual human is involved at all.',
      expert: 'An OAuth grant type for machine-to-machine authorization with no end user present: the client authenticates directly with its own `client_id`/`client_secret` (or a signed JWT assertion) to the token endpoint and receives an access token scoped to its own service identity.'
    },
    {
      id: 'device_code_grant',
      term: 'Device Code Grant',
      fullName: 'OAuth 2.0 Device Authorization Grant (RFC 8628)',
      category: 'Protocols',
      analogy: 'A smart TV displaying "go to tv.com/activate and enter code 482-193" on your phone, because the TV remote has no keyboard to type a password on.',
      expert: 'An OAuth flow for input-constrained devices (smart TVs, CLIs): the device displays a short user code and verification URL, the user approves on a secondary browser-capable device, and the device polls the token endpoint until authorization completes.'
    },
    {
      id: 'refresh_token',
      term: 'Refresh Token',
      fullName: 'OAuth 2.0 Refresh Token',
      category: 'Protocols',
      analogy: 'A gym membership card you keep in your wallet that lets you print a fresh one-day guest pass (access token) each morning without re-signing the whole membership contract.',
      expert: 'A long-lived credential issued alongside an access token that allows a client to silently obtain new access tokens after the original expires, without re-involving the resource owner, subject to rotation and revocation policies for security.'
    },
    {
      id: 'saml_assertion',
      term: 'SAML Assertion',
      fullName: 'SAML 2.0 Assertion',
      category: 'Protocols',
      analogy: 'A notarized letter from your home country\'s embassy stating "we confirm this person\'s identity and these facts about them," which you hand to a foreign official instead of them calling the embassy directly.',
      expert: 'An XML document issued and digitally signed by a SAML Identity Provider containing statements about a subject\'s authentication event, attributes, and authorization decisions, consumed by a Service Provider to establish a session without direct credential exchange.'
    },
    {
      id: 'saml_metadata',
      term: 'SAML Metadata',
      fullName: 'SAML 2.0 Metadata Document',
      category: 'Protocols',
      analogy: 'The business card exchange two companies do before their mailrooms will accept sealed letters from each other — endpoints, certificates, and trust details agreed up front.',
      expert: 'An XML document published by an IdP or SP describing its entity ID, endpoint URLs, and signing/encryption certificates, exchanged out-of-band to bootstrap a trust relationship before any SAML assertions are accepted.'
    },
    {
      id: 'nameid',
      term: 'NameID',
      fullName: 'SAML NameID',
      category: 'Protocols',
      analogy: 'The specific ID number stamped on your badge that two different buildings agree to both recognize as "you," even if their own internal filing systems label you differently.',
      expert: 'The primary subject identifier within a SAML assertion, whose format (e.g. `emailAddress`, `persistent`, `transient`) is negotiated between IdP and SP to control whether the identifier is stable, pseudonymous, or session-scoped.'
    },
    {
      id: 'idp_sp_initiated',
      term: 'IdP-Initiated vs SP-Initiated SSO',
      fullName: 'IdP-Initiated vs SP-Initiated Single Sign-On',
      category: 'Protocols',
      analogy: 'IdP-initiated is like your school directly walking you into a partner museum; SP-initiated is like showing up at the museum first and having it send you back to your school to fetch a hall pass.',
      expert: 'Two SAML/OIDC login sequences: SP-initiated begins at the Service Provider, which redirects the user to the IdP and expects a return; IdP-initiated begins at the IdP\'s portal, which pushes an unsolicited assertion directly to the SP, requiring extra replay protections.'
    },
    {
      id: 'single_logout',
      term: 'Single Logout (SLO)',
      fullName: 'SAML/OIDC Single Logout',
      category: 'Protocols',
      analogy: 'Pulling one master fire alarm that simultaneously clears every room in a building, instead of walking floor to floor telling each room individually to evacuate.',
      expert: 'A protocol extension (SAML SLO, OIDC front/back-channel logout) that propagates a single logout event across every Service Provider session established under one IdP session, preventing sessions from silently surviving after the user logs out.'
    },
    {
      id: 'forceauthn',
      term: 'ForceAuthn',
      fullName: 'SAML ForceAuthn Attribute',
      category: 'Protocols',
      analogy: 'A bouncer told to re-check ID at the door every single time, even for someone who\'s already inside the club and wearing a wristband.',
      expert: 'A boolean attribute on a SAML `AuthnRequest` instructing the IdP to force fresh, interactive re-authentication of the subject rather than silently reusing an existing IdP session — used before sensitive step-up operations.'
    },
    {
      id: 'ldap_bind',
      term: 'LDAP Bind',
      fullName: 'LDAP Bind Operation',
      category: 'Directories',
      analogy: 'Presenting your ID to the directory office clerk before they\'ll let you flip through any records at all.',
      expert: 'The LDAP operation that authenticates a client to the directory server, either anonymously, via simple bind (DN + password), or via SASL mechanisms, establishing the security context under which subsequent search/modify operations are authorized.'
    },
    {
      id: 'ldap_filter',
      term: 'LDAP Filter',
      fullName: 'LDAP Search Filter',
      category: 'Directories',
      analogy: 'Telling the directory clerk "show me every employee whose last name starts with S and who works on the 3rd floor," instead of flipping through the entire card catalog yourself.',
      expert: 'A structured query expression (e.g. `(&(objectClass=user)(cn=jdoe))`) used in LDAP search operations to match directory entries against attribute conditions, combining Boolean operators to narrow large object trees efficiently.'
    },
    {
      id: 'ldap_injection',
      term: 'LDAP Injection',
      fullName: 'LDAP Injection Attack',
      category: 'Zero Trust',
      analogy: 'Writing extra, unexpected instructions on a request form so the clerk accidentally reads them as commands instead of plain data — like sneaking "and unlock every drawer" onto a simple name-lookup slip.',
      expert: 'An injection vulnerability where unsanitized user input is concatenated directly into an LDAP filter string, allowing an attacker to alter query logic (e.g. bypass authentication checks or exfiltrate directory attributes) analogous to SQL injection against relational databases.'
    },
    {
      id: 'domain_controller',
      term: 'Domain Controller (DC)',
      fullName: 'Active Directory Domain Controller',
      category: 'Directories',
      analogy: 'The main records office of a city hall — every birth certificate, ID card, and permit request in that city ultimately has to be validated against its books.',
      expert: 'A server running Active Directory Domain Services that authenticates users, enforces security policy, and stores the directory database (NTDS.dit) for a domain, replicating changes to peer DCs to maintain a consistent directory across the forest.'
    },
    {
      id: 'ad_forest_domain_trust',
      term: 'AD Forest / Domain / Trust',
      fullName: 'Active Directory Forest, Domain, and Trust Relationships',
      category: 'Directories',
      analogy: 'A domain is one company\'s office building; a forest is the whole corporate campus of related buildings; a trust is a signed agreement letting employees from one building badge into another.',
      expert: 'AD\'s hierarchical structure: a domain is a security boundary sharing one directory partition; a forest is the top-level collection of domains sharing a common schema and global catalog; trusts (one-way, two-way, transitive) define which domains accept each other\'s authentication.'
    },
    {
      id: 'ntlm',
      term: 'NTLM',
      fullName: 'NT LAN Manager',
      category: 'Directories',
      analogy: 'An older handshake-and-password-hint routine between two people who already know a shared secret phrase, still used in some old buildings even though everyone agrees the newer Kerberos badge system is safer.',
      expert: 'A legacy Microsoft challenge-response authentication protocol vulnerable to relay and pass-the-hash attacks due to its lack of mutual authentication and reliance on weak hash algorithms, largely superseded by Kerberos but still present for backward compatibility.'
    },
    {
      id: 'kdc',
      term: 'KDC',
      fullName: 'Key Distribution Center',
      category: 'Directories',
      analogy: 'The ticket booth at a theme park that issues both your all-day wristband and the specific ride-line passes you request throughout the day.',
      expert: 'The Kerberos service (combining an Authentication Service and Ticket-Granting Service) responsible for issuing Ticket-Granting Tickets and Service Tickets to authenticated principals, forming the trusted core of a Kerberos realm.'
    },
    {
      id: 'tgt_tgs',
      term: 'TGT / TGS',
      fullName: 'Ticket-Granting Ticket & Ticket-Granting Service',
      category: 'Directories',
      analogy: 'The all-day wristband (TGT) you get once at the park entrance, which you then show at each individual ride booth (TGS) to get a ride-specific ticket, without re-showing your original ID every time.',
      expert: 'In Kerberos, the TGT is an initial credential proving the user authenticated to the KDC; it is then presented to the Ticket-Granting Service to obtain short-lived Service Tickets for specific resources, avoiding repeated password transmission.'
    },
    {
      id: 'pass_the_hash_ticket',
      term: 'Pass-the-Hash / Pass-the-Ticket',
      fullName: 'Pass-the-Hash & Pass-the-Ticket Attacks',
      category: 'Zero Trust',
      analogy: 'A thief who doesn\'t need your actual key — just a wax impression of it (the hash) or a photocopy of your ticket stub (the ticket) is enough to walk right through the same doors you can.',
      expert: 'Lateral-movement techniques where an attacker extracts a cached NTLM password hash or Kerberos ticket from memory (e.g. via Mimikatz) and replays it to authenticate as the victim on other machines, without ever needing the plaintext password.'
    },
    {
      id: 'golden_silver_ticket',
      term: 'Golden / Silver Ticket',
      fullName: 'Golden Ticket & Silver Ticket Attacks',
      category: 'Zero Trust',
      analogy: 'A Golden Ticket is a forged master key stamped by a stolen copy of the city\'s official seal, letting the holder into any building forever; a Silver Ticket forges just one building\'s local seal instead.',
      expert: 'A Golden Ticket forges a TGT using a stolen KRBTGT account hash, granting domain-wide Kerberos access indefinitely; a Silver Ticket forges a Service Ticket using a stolen service account hash, granting access limited to that one service.',
      toolUrl: '/playground/kerberos-lab'
    },
    {
      id: 'radius_companions',
      term: 'TACACS+ / 802.1X / EAP',
      fullName: 'Network Access Control Protocol Family',
      category: 'Directories',
      analogy: 'Different flavors of the same idea as a building security desk checking your badge before letting the elevator move: TACACS+ separates who-you-are from what-you-can-do, 802.1X is the port-level lock on the wall jack itself, and EAP is the vocabulary they all speak to negotiate how you prove who you are.',
      expert: 'TACACS+ is Cisco\'s AAA protocol separating authentication/authorization/accounting for network device administration; 802.1X is the port-based network access control standard; EAP is the extensible framework (EAP-TLS, PEAP) both TACACS+/RADIUS and 802.1X use to negotiate authentication methods.'
    },
    {
      id: 'hybrid_identity',
      term: 'Hybrid Identity',
      fullName: 'Hybrid Identity (PHS / PTA / Federation)',
      category: 'Directories',
      analogy: 'Three different ways a branch office can check a visitor\'s ID against head office records: mail head office a synced copy of the ID list ahead of time (Password Hash Sync), call head office live for every single visitor (Pass-Through Authentication), or simply send the visitor to head office\'s own front desk to be checked there (Federation).',
      expert: 'The set of connectivity models linking on-prem Active Directory to a cloud IdP. Password Hash Sync (PHS) syncs a hash-of-a-hash to the cloud so it can validate independently; Pass-Through Authentication (PTA) forwards each login to a lightweight on-prem agent for real-time AD validation; Federation (AD FS) redirects the user to an on-prem identity provider that authenticates locally and returns a signed assertion. Only PHS survives a full on-prem outage.',
      toolUrl: '/playground/hybrid-ad-sync'
    },
    {
      id: 'shibboleth',
      term: 'Shibboleth',
      fullName: 'Shibboleth Identity Federation Software',
      category: 'Protocols',
      analogy: 'A campus-wide student ID system built specifically so many different universities could trust each other\'s login pages long before commercial SSO products existed.',
      expert: 'An open-source SAML-based single sign-on and federation software suite widely adopted across higher education and research consortia (via InCommon and eduGAIN) for cross-institutional identity federation.'
    },
    {
      id: 'cas',
      term: 'CAS',
      fullName: 'Central Authentication Service',
      category: 'Protocols',
      analogy: 'A single campus login booth every app on the network is configured to redirect to first, so a student only ever types their password once per day.',
      expert: 'An open-source single sign-on protocol and server, originally from Yale, that issues short-lived service tickets after one central login, widely used in academic environments prior to broader SAML/OIDC adoption.'
    },
    {
      id: 'sod',
      term: 'Segregation of Duties (SoD)',
      fullName: 'Segregation of Duties',
      category: 'Governance',
      analogy: 'The rule that the person who requests a check and the person who signs it must never be the same employee — one person alone should never control an entire risky process end-to-end.',
      expert: 'A governance control that prevents any single identity from holding two conflicting entitlements (e.g. "create vendor" + "approve payment") that together enable fraud, enforced via policy rules in an IGA platform and checked during access requests and certifications.'
    },
    {
      id: 'toxic_combination',
      term: 'Toxic Combination',
      fullName: 'Toxic Combination of Entitlements',
      category: 'Governance',
      analogy: 'Owning both the master key to the safe and the ability to erase the security camera footage — neither permission is dangerous alone, but together they are.',
      expert: 'A specific pairing (or set) of entitlements that, when held simultaneously by one identity, violates Segregation of Duties and creates a fraud or security risk, typically defined in an SoD policy matrix and flagged automatically during access certification.'
    },
    {
      id: 'role_mining',
      term: 'Role Mining',
      fullName: 'Role Mining & Role Engineering',
      category: 'Governance',
      analogy: 'Looking at everyone\'s actual keychains across the company and noticing that 40 people all carry the exact same five keys — so instead of managing 40 separate keychains, you define one "Floor 3 Analyst" master key.',
      expert: 'An IGA analytics process (top-down or bottom-up) that clusters existing entitlement assignments across users to derive candidate RBAC roles, reducing the number of direct entitlement grants that must be individually managed and certified.'
    },
    {
      id: 'role_explosion',
      term: 'Role Explosion',
      fullName: 'Role Explosion',
      category: 'Governance',
      analogy: 'A hotel that starts printing a slightly different keycard type for every single guest combination imaginable, until it has more card types in its system than actual rooms.',
      expert: 'An anti-pattern in RBAC deployments where overly specific, one-off roles proliferate uncontrollably (often one role per user) until the role catalog becomes larger and harder to govern than the raw entitlement list it was meant to simplify.'
    },
    {
      id: 'privileged_account',
      term: 'Privileged Account',
      fullName: 'Privileged Account',
      category: 'Governance',
      analogy: 'The building superintendent\'s master key that opens every apartment, the boiler room, and the roof — versus a regular tenant\'s key that only opens their own door.',
      expert: 'An account (human or service) holding elevated permissions such as domain admin, root, or database superuser rights, representing outsized risk if compromised and therefore targeted specifically by PAM vaulting, session recording, and Just-in-Time elevation controls.'
    },
    {
      id: 'break_glass_account',
      term: 'Break-Glass Account',
      fullName: 'Break-Glass / Emergency Access Account',
      category: 'Governance',
      analogy: 'The fire-alarm-style glass box in a hallway holding a spare key, meant to be smashed open only during a genuine emergency, with an alarm that immediately tells everyone it was used.',
      expert: 'A tightly controlled, sealed emergency-access credential (e.g. a cloud tenant\'s global admin account) kept offline or in a vault, used only when normal federated/MFA login paths are unavailable, with mandatory post-use audit and password rotation.'
    },
    {
      id: 'service_account',
      term: 'Service Account',
      fullName: 'Service / Machine Account',
      category: 'Governance',
      analogy: 'A dedicated ID badge issued not to a person but to a vending machine, so the building\'s security logs can still show exactly which machine restocked the shelf.',
      expert: 'A non-human identity used by an application, script, or automated process to authenticate to other systems, typically holding narrowly scoped, non-interactive credentials that should be inventoried and rotated like any other privileged credential.'
    },
    {
      id: 'non_human_identity',
      term: 'Non-Human Identity (NHI)',
      fullName: 'Non-Human Identity',
      category: 'Zero Trust',
      analogy: 'Giving every robot on a factory floor its own individually tracked ID badge, instead of letting them all share one generic "robot" badge that no one can trace back to a specific machine.',
      expert: 'An umbrella term covering service accounts, API keys, workload identities (SPIFFE SVIDs), and bot credentials — an identity category now often outnumbering human accounts in an enterprise, driving dedicated NHI discovery and governance tooling.'
    },
    {
      id: 'pdp_pep',
      term: 'PDP / PEP',
      fullName: 'Policy Decision Point & Policy Enforcement Point',
      category: 'Authorization',
      analogy: 'A nightclub bouncer (PEP) standing at the door who physically lets people in or turns them away, while radioing an off-site manager (PDP) who actually makes the yes/no judgment call based on the guest list.',
      expert: 'In an externalized authorization architecture (XACML, Zero Trust), the PEP intercepts a resource access request and enforces the outcome, while the PDP evaluates policy against the request context and returns a permit/deny decision, keeping enforcement and decision logic decoupled.'
    },
    {
      id: 'pap_pip',
      term: 'PAP / PIP',
      fullName: 'Policy Administration Point & Policy Information Point',
      category: 'Authorization',
      analogy: 'The PAP is the rulebook office where managers write and update club policy; the PIP is the ID-scanning kiosk that looks up a guest\'s membership tier and age before the bouncer\'s manager decides.',
      expert: 'Within the XACML reference architecture, the PAP is where administrators author and publish authorization policies, and the PIP supplies the PDP with the additional subject, resource, or environment attributes needed to evaluate those policies at decision time.'
    },
    {
      id: 'xacml',
      term: 'XACML',
      fullName: 'eXtensible Access Control Markup Language',
      category: 'Authorization',
      analogy: 'A very formal legal contract template for writing access rules ("if attribute X and resource Y then permit"), so different vendors\' bouncers and rulebook offices can all speak the same legal language.',
      expert: 'An OASIS XML-based standard defining a policy language and request/response protocol for attribute-based access control decisions, historically implemented in enterprise PDP/PEP deployments, though largely superseded in modern stacks by lighter JSON-based engines like OPA/Rego.'
    },
    {
      id: 'attribute_authority',
      term: 'Attribute Authority',
      fullName: 'SAML Attribute Authority',
      category: 'Authorization',
      analogy: 'A separate records office you can call specifically to ask "what department does this badge-holder work in?" — distinct from the main office that only confirms someone\'s identity.',
      expert: 'A SAML component (or role) that responds to attribute queries about a previously authenticated subject, supplying additional attributes on demand rather than embedding every possible attribute in the original assertion.'
    },
    {
      id: 'ztna',
      term: 'ZTNA',
      fullName: 'Zero Trust Network Access',
      category: 'Zero Trust',
      analogy: 'Instead of getting a building-wide badge once you\'re inside the lobby, every single door you approach re-checks your badge, your outfit, and your reason for being there before it clicks open.',
      expert: 'An architecture replacing perimeter-based VPN access with per-session, identity- and context-aware access brokered application-by-application, verifying user identity, device posture, and policy on every connection rather than granting broad network-level trust.'
    },
    {
      id: 'sdp',
      term: 'Software-Defined Perimeter (SDP)',
      fullName: 'Software-Defined Perimeter',
      category: 'Zero Trust',
      analogy: 'A speakeasy with no visible door at all — the building looks like a blank wall to strangers, and only pre-vetted guests with the secret knock ever see an entrance appear.',
      expert: 'A Zero Trust network architecture (the "black cloud" model) that cloaks protected infrastructure from the public internet entirely, only establishing a network path to an authenticated, authorized device/user after out-of-band verification, reducing attack surface visibility.'
    },
    {
      id: 'continuous_authentication',
      term: 'Continuous Authentication',
      fullName: 'Continuous Authentication',
      category: 'Zero Trust',
      analogy: 'A bank guard who doesn\'t just check your ID at the door, but keeps quietly watching your behavior the whole time you\'re inside the vault room, ready to intervene if something suddenly looks off.',
      expert: 'An authentication model that repeatedly re-evaluates trust signals (biometric telemetry, device posture, behavioral patterns) throughout an active session rather than only at initial login, enabling real-time step-up or termination when risk changes mid-session.',
      toolUrl: '/playground/ambient-trust'
    },
    {
      id: 'device_posture',
      term: 'Device Posture',
      fullName: 'Device Trust & Posture Assessment',
      category: 'Zero Trust',
      analogy: 'A bouncer checking not just your ID, but also whether you\'re wearing the venue\'s required safety gear before letting you onto the factory floor.',
      expert: 'The set of security signals collected about an endpoint — OS patch level, disk encryption, firewall status, EDR presence, jailbreak/root status — evaluated by a policy engine as a condition of granting or restricting access, core to Zero Trust and Conditional Access decisions.',
      toolUrl: '/playground/device-trust'
    },
    {
      id: 'ueba',
      term: 'UEBA',
      fullName: 'User and Entity Behavior Analytics',
      category: 'Zero Trust',
      analogy: 'A store detective who has watched a regular shopper for months and instantly notices when that same shopper suddenly starts acting completely out of character.',
      expert: 'A security analytics discipline applying machine learning to baseline normal behavior for users and non-human entities, then flagging statistically anomalous activity (impossible travel, unusual data access volume) as potential compromise indicators, often feeding into ITDR/SIEM pipelines.'
    },
    {
      id: 'risk_based_authentication',
      term: 'Risk-Based Authentication',
      fullName: 'Risk-Based / Adaptive Authentication',
      category: 'Zero Trust',
      analogy: 'A doorman who waves regulars straight through, but stops a stranger arriving at 3am wearing a ski mask for extra questions — the same door, a different amount of scrutiny depending on how suspicious the moment looks.',
      expert: 'An authentication model that computes a continuous risk score per login attempt from weighted signals (impossible travel, device reputation, behavioral anomaly, network reputation) and maps score ranges to a decision — silent allow, step-up MFA, or block — rather than applying one static rule to every request, distinguishing it from static Conditional Access policies.',
      toolUrl: '/playground/risk-engine'
    },
    {
      id: 'credential_stuffing',
      term: 'Credential Stuffing',
      fullName: 'Credential Stuffing Attack',
      category: 'Zero Trust',
      analogy: 'A burglar who found a leaked master list of "keychain + address" pairs from a different neighborhood, and is now systematically trying each old key on doors here too, betting people reused the same key.',
      expert: 'An automated attack that replays username/password pairs leaked from unrelated prior breaches against a target login endpoint, exploiting password reuse across services; mitigated by MFA, breached-password screening, and bot/rate-limit defenses.'
    },
    {
      id: 'password_spraying',
      term: 'Password Spraying',
      fullName: 'Password Spraying Attack',
      category: 'Zero Trust',
      analogy: 'Instead of hammering one door with a thousand different keys (which triggers alarms), a burglar tries one single common key — like "Summer2024!" — against a thousand different doors, staying under each door\'s alarm threshold.',
      expert: 'A brute-force variant that tests a small number of commonly used passwords against a large number of usernames, deliberately staying below per-account lockout thresholds to avoid triggering standard account-lockout defenses.'
    },
    {
      id: 'brute_force_attack',
      term: 'Brute Force Attack',
      fullName: 'Brute Force Attack',
      category: 'Zero Trust',
      analogy: 'Trying every single number on a combination padlock, one after another, until one of them finally clicks open.',
      expert: 'An attack that systematically attempts every possible credential value (or a dictionary of likely candidates) against an authentication endpoint or a stolen hash, countered by rate limiting, lockouts, MFA, and computationally expensive hashing (bcrypt, Argon2).'
    },
    {
      id: 'phishing',
      term: 'Phishing',
      fullName: 'Phishing',
      category: 'Zero Trust',
      analogy: 'A fake bank teller window set up right next door to the real bank, dressed identically, hoping you\'ll hand over your PIN to the wrong window without noticing.',
      expert: 'A social-engineering attack that impersonates a trusted party (via email, SMS, or a fake login page) to trick a user into disclosing credentials or approving a malicious authentication request, remaining the leading initial-access vector despite phishing-resistant FIDO2 defenses.'
    },
    {
      id: 'mfa_fatigue',
      term: 'MFA Fatigue / Push Bombing',
      fullName: 'MFA Fatigue Attack',
      category: 'Zero Trust',
      analogy: 'A doorbell rung fifty times in a row at 3 a.m. until the exhausted homeowner just opens the door to make the noise stop, without checking who\'s actually there.',
      expert: 'An attack exploiting push-based MFA by bombarding a victim with repeated approval prompts until they accidentally or exhaustedly approve one, countered by number-matching prompts, rate-limited push attempts, and phishing-resistant FIDO2 factors.',
      toolUrl: '/wall-of-shame?tab=breaches&lab=pushfatigue'
    },
    {
      id: 'sim_swapping',
      term: 'SIM Swapping',
      fullName: 'SIM Swapping Attack',
      category: 'Zero Trust',
      analogy: 'A con artist convincing the phone company to reassign your phone number to their own SIM card, so every "we texted you a code" security check now goes straight to the attacker instead.',
      expert: 'A social-engineering attack against a mobile carrier that ports a victim\'s phone number to an attacker-controlled SIM, intercepting SMS-based OTP/MFA codes — a key reason NIST 800-63 discourages SMS as a primary authentication factor.'
    },
    {
      id: 'mitm',
      term: 'Man-in-the-Middle (MITM)',
      fullName: 'Man-in-the-Middle Attack',
      category: 'Zero Trust',
      analogy: 'A crooked mail carrier who secretly opens, reads, and possibly rewrites letters passing between two people who both believe they\'re writing directly to each other.',
      expert: 'An attack where an adversary secretly intercepts and potentially alters communication between two parties who believe they are communicating directly, defeated by mutual TLS, certificate pinning, and token audience/proof-of-possession binding (DPoP, mTLS-bound tokens).'
    },
    {
      id: 'replay_attack',
      term: 'Replay Attack',
      fullName: 'Replay Attack',
      category: 'Zero Trust',
      analogy: 'A recording of you saying "yes, I authorize this payment" played back later to authorize a completely different payment you never agreed to.',
      expert: 'An attack that captures a valid authentication message or token and resubmits it later to gain unauthorized access, mitigated by nonces, timestamps, short token lifetimes, and proof-of-possession mechanisms that bind a token to a single legitimate use.'
    },
    {
      id: 'privilege_escalation',
      term: 'Privilege Escalation',
      fullName: 'Privilege Escalation',
      category: 'Zero Trust',
      analogy: 'A hotel guest who checked in for a standard room quietly finding a way to reprogram their own keycard to also open the manager\'s office.',
      expert: 'The act of an attacker or malicious insider exploiting a vulnerability or misconfiguration to gain higher permissions than originally granted, distinguished as vertical (gaining admin rights) or horizontal (accessing peer accounts\' data).'
    },
    {
      id: 'lateral_movement',
      term: 'Lateral Movement',
      fullName: 'Lateral Movement',
      category: 'Zero Trust',
      analogy: 'A burglar who gets into one apartment through an unlocked window, then uses that apartment\'s spare keys to work their way into three more units on the same floor.',
      expert: 'Post-compromise attacker technique of pivoting from an initially breached host to additional systems within a network using harvested credentials or tickets (often via pass-the-hash/pass-the-ticket), a primary target of Zero Trust micro-segmentation defenses.'
    },
    {
      id: 'account_takeover',
      term: 'Account Takeover (ATO)',
      fullName: 'Account Takeover',
      category: 'Zero Trust',
      analogy: 'A stranger who fully impersonates you at the bank — changes your mailing address, resets your PIN, and starts making withdrawals as if they were you all along.',
      expert: 'The end state of a successful credential compromise where an attacker gains full control of a legitimate user\'s account, often escalating to changing recovery contacts and MFA enrollment to lock the real owner out.'
    },
    {
      id: 'csrf',
      term: 'CSRF',
      fullName: 'Cross-Site Request Forgery',
      category: 'Zero Trust',
      analogy: 'Tricking you into unknowingly signing a blank check simply by having you click a link, because the bank teller only checks that it\'s your signature (your logged-in cookie) — not whether you meant to sign it.',
      expert: 'An attack that induces an authenticated user\'s browser to submit an unwanted state-changing request to a site where they\'re logged in, exploiting automatic cookie inclusion; mitigated by anti-CSRF tokens, `SameSite` cookies, and OAuth\'s `state` parameter.'
    },
    {
      id: 'xss',
      term: 'XSS',
      fullName: 'Cross-Site Scripting',
      category: 'Zero Trust',
      analogy: 'A vandal slipping a fake, malicious announcement onto a trusted bulletin board, so everyone reading the board treats it as legitimate news from the board\'s real owner.',
      expert: 'An injection vulnerability where an attacker gets untrusted script to execute in a victim\'s browser within the security context of a trusted site, commonly used to exfiltrate session cookies or tokens from local/session storage.'
    },
    {
      id: 'open_redirect',
      term: 'Open Redirect',
      fullName: 'Open Redirect Vulnerability',
      category: 'Zero Trust',
      analogy: 'A hotel lobby directory that will point a guest toward literally any address they type in, including a fake hotel next door dressed up to look identical.',
      expert: 'A flaw where an application redirects to a URL supplied in a request parameter without validating it against an allow-list, frequently abused in OAuth/SAML phishing to make a malicious redirect appear to originate from a trusted domain.'
    },
    {
      id: 'impossible_travel',
      term: 'Impossible Travel',
      fullName: 'Impossible Travel Detection',
      category: 'Zero Trust',
      analogy: 'Your badge scanning into the New York office at 9:00 a.m. and then the Tokyo office at 9:15 a.m. the same morning — physically impossible, and an obvious sign the badge was cloned.',
      expert: 'A risk-based authentication signal that flags a login as anomalous when the geographic distance and elapsed time between two consecutive sign-ins from the same account exceed physically plausible travel speed, commonly triggering step-up MFA or session block.'
    },
    {
      id: 'device_fingerprinting',
      term: 'Device Fingerprinting',
      fullName: 'Device Fingerprinting',
      category: 'Zero Trust',
      analogy: 'Recognizing a regular customer not by ID card, but by the unique combination of their coat, walking gait, and the specific coffee order they always place.',
      expert: 'A technique that derives a semi-stable identifier for a device from browser/OS attributes, installed fonts, screen resolution, and network characteristics, used as an additional risk signal in adaptive authentication even without cookies or logins.'
    },
    {
      id: 'symmetric_asymmetric_encryption',
      term: 'Symmetric vs Asymmetric Encryption',
      fullName: 'Symmetric & Asymmetric Encryption',
      category: 'Cryptography',
      analogy: 'Symmetric is one shared house key that both locks and unlocks the same door; asymmetric is a mailbox with a public slot anyone can drop letters into, but only the owner\'s private key can open it to read them.',
      expert: 'Symmetric encryption uses one shared secret key for both encryption and decryption (fast, e.g. AES) but requires secure key distribution; asymmetric encryption uses a mathematically linked public/private key pair (e.g. RSA, ECC), solving key distribution at the cost of speed.'
    },
    {
      id: 'public_private_key',
      term: 'Public / Private Key Pair',
      fullName: 'Asymmetric Key Pair',
      category: 'Cryptography',
      analogy: 'A padlock (public key) you hand out freely to anyone who wants to send you a locked box, paired with the one and only physical key (private key) that you alone keep to open it.',
      expert: 'A mathematically related pair of keys where data encrypted with the public key can only be decrypted with the corresponding private key (and vice versa for signatures), underpinning TLS, JWT signing, PKI, and DID cryptography.'
    },
    {
      id: 'digital_signature',
      term: 'Digital Signature',
      fullName: 'Digital Signature',
      category: 'Cryptography',
      analogy: 'A wax seal pressed with a unique family signet ring — anyone can verify the seal matches your ring, but only you possess the ring needed to make that exact impression.',
      expert: 'A cryptographic mechanism where a signer computes a hash of a message and encrypts it with their private key; verifiers decrypt it with the signer\'s public key and compare it to their own hash of the message, proving both authenticity and integrity.'
    },
    {
      id: 'hmac',
      term: 'HMAC',
      fullName: 'Hash-based Message Authentication Code',
      category: 'Cryptography',
      analogy: 'Two people who share a secret password stamp every letter they send with a wax seal made using that shared password mixed into the ink, so each can verify the other truly wrote it and it wasn\'t altered.',
      expert: 'A construction combining a cryptographic hash function with a shared secret key to produce a tag verifying both message integrity and authenticity, used e.g. to sign JWTs under the `HS256` algorithm and to sign OAuth/webhook request bodies.'
    },
    {
      id: 'hashing_vs_encryption',
      term: 'Hashing vs Encryption',
      fullName: 'Hashing vs Encryption',
      category: 'Cryptography',
      analogy: 'Encryption is locking a letter in a box you can later unlock and read again; hashing is putting the letter through a paper shredder into a unique confetti pattern — you can\'t un-shred it, you can only check if a new letter shreds into the exact same pattern.',
      expert: 'Encryption is a reversible transformation requiring a key to decrypt back to plaintext; hashing is a one-way, fixed-length digest function used to verify data integrity or store passwords, where the original input is never meant to be recovered.'
    },
    {
      id: 'salting',
      term: 'Salting',
      fullName: 'Password Salting',
      category: 'Cryptography',
      analogy: 'Mixing a different random spice into each customer\'s recipe before baking, so two people\'s identical secret recipes come out of the oven looking completely different — and a thief can\'t use one stolen recipe card to guess anyone else\'s.',
      expert: 'The practice of appending a unique, random value to each password before hashing, ensuring identical passwords produce different hashes and defeating precomputed rainbow-table attacks; a built-in feature of algorithms like bcrypt and Argon2.'
    },
    {
      id: 'aes',
      term: 'AES',
      fullName: 'Advanced Encryption Standard',
      category: 'Cryptography',
      analogy: 'The industry-standard, government-approved safe design that virtually every bank uses, because it has been tested by so many experts for so long that no practical way to crack it has ever been found.',
      expert: 'A NIST-standardized symmetric block cipher (key sizes 128/192/256-bit) that is the default choice for encrypting data at rest and in transit worldwide, commonly deployed in GCM mode for authenticated encryption.'
    },
    {
      id: 'rsa',
      term: 'RSA',
      fullName: 'Rivest–Shamir–Adleman Algorithm',
      category: 'Cryptography',
      analogy: 'A padlock whose design is based on how absurdly hard it is to figure out the two secret prime numbers that were multiplied together to make one enormous number.',
      expert: 'A widely used asymmetric cryptosystem whose security rests on the computational difficulty of factoring the product of two large prime numbers, used for digital signatures (JWT `RS256`) and key exchange, though gradually giving ground to smaller, faster ECC keys.'
    },
    {
      id: 'ecc',
      term: 'ECC',
      fullName: 'Elliptic Curve Cryptography',
      category: 'Cryptography',
      analogy: 'A lock design that achieves the same strength as RSA\'s giant padlock, but built from a much smaller, lighter mechanism — easier to carry around on constrained devices like phones and security keys.',
      expert: 'An asymmetric cryptography family based on the algebraic structure of elliptic curves over finite fields, offering equivalent security to RSA at much smaller key sizes, favored in FIDO2/WebAuthn, TLS, and DID key material for its performance and lower resource footprint.'
    },
    {
      id: 'pki_ca_csr',
      term: 'PKI / CA / CSR',
      fullName: 'Public Key Infrastructure, Certificate Authority & Certificate Signing Request',
      category: 'Cryptography',
      analogy: 'A CA is a government passport office; a CSR is your passport application form with your photo (public key) attached; the finished passport (certificate) is what border guards everywhere trust because it bears the office\'s official seal.',
      expert: 'PKI is the overall system of certificates, CAs, and revocation infrastructure enabling trusted public-key distribution; a CSR is a request bundling a subject\'s public key and identity for a CA to sign; the resulting X.509 certificate binds that identity to the key.',
      toolUrl: '/playground/cert-chain'
    },
    {
      id: 'x509',
      term: 'X.509',
      fullName: 'X.509 Certificate Standard',
      category: 'Cryptography',
      analogy: 'The universal standardized template every passport in the world follows — same fields for photo, name, expiry, and issuing authority — so any border guard anywhere can read it.',
      expert: 'An ITU-T standard defining the format of public-key certificates, specifying fields such as subject, issuer, validity period, public key, and extensions, used for TLS server/client certs, code signing, and workload identity (SPIFFE SVIDs).'
    },
    {
      id: 'hsm',
      term: 'HSM',
      fullName: 'Hardware Security Module',
      category: 'Cryptography',
      analogy: 'A bank vault built specifically so that even the vault\'s own employees can never remove the gold bars inside — they can only ask the vault to perform an operation with them and hand back the result.',
      expert: 'A tamper-resistant physical or cloud appliance that generates, stores, and performs operations with cryptographic keys without ever exposing the raw private key material outside the module, used for CA root keys, TLS termination, and signing infrastructure.'
    },
    {
      id: 'secrets_management',
      term: 'Secrets Management',
      fullName: 'Secrets Management',
      category: 'Cryptography',
      analogy: 'A hotel safe-deposit system for staff, where instead of every employee memorizing the master key, they request temporary access from a controlled safe that logs exactly who took what and when.',
      expert: 'The discipline and tooling (e.g. HashiCorp Vault, cloud KMS/Secrets Manager) for centrally storing, dynamically issuing, rotating, and auditing access to API keys, database credentials, and certificates, eliminating hardcoded secrets in source code and config files.'
    },
    {
      id: 'key_rotation',
      term: 'Key Rotation',
      fullName: 'Cryptographic Key Rotation',
      category: 'Cryptography',
      analogy: 'A landlord who periodically re-cores every lock in the building and issues fresh keys, so even if an old key was copied by someone untrustworthy, it stops working going forward.',
      expert: 'The practice of periodically replacing cryptographic keys (signing keys, encryption keys, API secrets) on a defined schedule or after suspected compromise, limiting the exposure window of any single key and typically coordinated via JWKS `kid` values to avoid downtime.'
    },
    {
      id: 'ssi',
      term: 'SSI',
      fullName: 'Self-Sovereign Identity',
      category: 'Decentralized',
      analogy: 'Carrying your own physical wallet of ID cards you control directly, instead of every store needing to phone a central government office each time to confirm who you are.',
      expert: 'A decentralized identity model in which individuals hold and control their own verifiable credentials in a personal digital wallet, presenting proofs directly to relying parties without a centralized identity provider mediating every verification.'
    },
    {
      id: 'verifiable_presentation',
      term: 'Verifiable Presentation',
      fullName: 'W3C Verifiable Presentation',
      category: 'Decentralized',
      analogy: 'Choosing to show a bouncer only the "over 21" stamp page of your passport booklet, without handing over the whole passport or revealing your home address.',
      expert: 'A W3C data structure that packages one or more Verifiable Credentials (or selectively disclosed claims from them) into a single cryptographically signed presentation, allowing a holder to prove specific facts to a verifier without over-sharing credential data.'
    },
    {
      id: 'did_document',
      term: 'DID Document',
      fullName: 'DID Document',
      category: 'Decentralized',
      analogy: 'The public listing behind a driver\'s license number that anyone can look up to see which specific keys and services are currently authorized to act on behalf of that license.',
      expert: 'A JSON-LD document resolvable from a DID, containing the public keys, authentication methods, and service endpoints associated with that decentralized identifier, enabling verifiers to cryptographically validate signatures made by the DID\'s controller.'
    },
    {
      id: 'oid4vc',
      term: 'OID4VC',
      fullName: 'OpenID for Verifiable Credentials',
      category: 'Decentralized',
      analogy: 'Bolting the familiar OAuth/OIDC login plumbing onto a digital wallet, so issuing and presenting a verifiable diploma or ID card feels just like a normal "Sign in with…" flow developers already know.',
      expert: 'A family of OpenID Foundation specifications (OID4VCI for issuance, OID4VP for presentation) that extend OAuth 2.0/OIDC flows to issue and present W3C Verifiable Credentials, bridging decentralized identity into familiar OAuth infrastructure.'
    },
    {
      id: 'siop',
      term: 'SIOP',
      fullName: 'Self-Issued OpenID Provider',
      category: 'Decentralized',
      analogy: 'A user acting as their own passport office — issuing themselves a signed ID token straight from their personal wallet instead of asking a company-run identity provider to do it.',
      expert: 'An OIDC extension allowing an end-user\'s wallet or local agent to act as its own OpenID Provider, self-issuing an ID Token containing DID-based claims, enabling relying parties to authenticate a user directly from their decentralized identity without a hosted IdP.'
    },
    {
      id: 'eidas',
      term: 'eIDAS',
      fullName: 'Electronic Identification, Authentication and Trust Services Regulation',
      category: 'Decentralized',
      analogy: 'An EU-wide agreement that a digital ID card issued in one member country must be honored just as readily by government services in every other member country.',
      expert: 'An EU regulation establishing a legal framework for cross-border electronic identification and trust services (e-signatures, e-seals), with eIDAS 2.0 mandating an EU Digital Identity Wallet supporting W3C Verifiable Credentials for citizens across member states.'
    },
    {
      id: 'assurance_levels',
      term: 'Levels of Assurance (IAL/AAL/FAL)',
      fullName: 'NIST 800-63 Identity, Authenticator & Federation Assurance Levels',
      category: 'Governance',
      analogy: 'Grading how strongly you trust a claimed identity like a hotel grading star ratings: a 1-star check just glances at a name typed on a form, while a 3-star check involves notarized documents, a live photo match, and a background check.',
      expert: 'NIST SP 800-63-3 defines three independent assurance dimensions: IAL (confidence in identity proofing), AAL (strength of the authentication mechanism), and FAL (strength of a federation assertion), each rated 1-3, used by government and regulated systems to specify required rigor.'
    },
    {
      id: 'jit_access',
      term: 'Just-In-Time (JIT) Access',
      fullName: 'Just-In-Time Privileged Access',
      category: 'Provisioning',
      analogy: 'A maintenance worker who requests a temporary elevator override key for exactly the 20 minutes he needs it, rather than carrying a permanent override key on his belt all year.',
      expert: 'A PAM control that grants elevated entitlements for a narrow, time-boxed window tied to an approved request or workflow, automatically expiring the grant afterward, sharply reducing the standing-privilege attack surface compared to permanent admin rights.'
    },
    {
      id: 'deprovisioning',
      term: 'De-provisioning',
      fullName: 'Account De-provisioning',
      category: 'Provisioning',
      analogy: 'Cutting up an employee\'s building badge and changing the office locks the moment their last day ends.',
      expert: 'The automated (typically SCIM-driven) process of disabling or deleting a user\'s accounts and entitlements across every connected system the instant their employment or contract ends, closing the window attackers exploit via orphaned accounts.'
    },
    {
      id: 'birthright_access',
      term: 'Birthright Access',
      fullName: 'Birthright Access',
      category: 'Provisioning',
      analogy: 'Every new employee automatically getting a building badge, an email account, and a parking pass on day one, without anyone having to individually request each one.',
      expert: 'A baseline set of entitlements (email, VPN, intranet, core SaaS) automatically granted to every identity in a given role or department upon onboarding, driven by HR-triggered provisioning rules rather than individual access requests.'
    },
    {
      id: 'identity_lifecycle_management',
      term: 'Identity Lifecycle Management',
      fullName: 'Identity Lifecycle Management (Joiner-Mover-Leaver)',
      category: 'Provisioning',
      analogy: 'HR\'s full playbook for an employee\'s entire journey — issuing their first badge on day one, reprogramming it when they change floors, and confiscating it the day they leave.',
      expert: 'The end-to-end governance of an identity\'s entitlements across the Joiner-Mover-Leaver (JML) lifecycle: provisioning birthright access at hire, adjusting entitlements on role change, and fully de-provisioning at termination, typically orchestrated by an IGA platform integrated with HR systems.'
    },
    {
      id: 'kba',
      term: 'KBA',
      fullName: 'Knowledge-Based Authentication',
      category: 'Foundations',
      analogy: 'A bank teller verifying your identity by asking "what street did you grow up on?" — questions only the real you (or someone who\'s done their research) would know the answer to.',
      expert: 'An identity-verification method relying on shared secrets or personal history questions (mother\'s maiden name, previous addresses), increasingly deprecated in favor of stronger methods since answers are often discoverable via social engineering or data breaches.'
    },
    {
      id: 'account_recovery',
      term: 'Account Recovery',
      fullName: 'Account Recovery & Backup Authentication',
      category: 'Foundations',
      analogy: 'The spare house key hidden with a trusted neighbor, used only when you\'ve locked yourself out and lost your primary key entirely.',
      expert: 'The set of fallback mechanisms (backup codes, recovery email/phone, trusted contacts, identity re-proofing) that let a legitimate user regain access after losing their primary authenticator, while being hardened enough that attackers cannot abuse the same path to hijack the account.'
    },
    {
      id: 'identity_proofing',
      term: 'Identity Proofing',
      fullName: 'Identity Proofing',
      category: 'Foundations',
      analogy: 'The passport office actually examining your birth certificate and utility bills before issuing you a passport, rather than just taking your word for who you are.',
      expert: 'The process of collecting and validating evidence (government ID scans, biometric liveness checks, address verification) to establish that a claimed identity genuinely corresponds to a real person, forming the basis of a system\'s NIST 800-63 Identity Assurance Level.'
    },
    {
      id: 'kyc',
      term: 'KYC',
      fullName: 'Know Your Customer',
      category: 'Foundations',
      analogy: 'A bank legally required to check your government ID and address before letting you open an account, so criminals can\'t open accounts under fake names.',
      expert: 'A regulatory requirement (particularly in financial services) mandating identity verification and risk assessment of customers before onboarding, typically implemented via document verification, sanctions-list screening, and biometric liveness detection.'
    },
    {
      id: 'social_login',
      term: 'Social Login',
      fullName: 'Social Login / Social Identity Federation',
      category: 'Foundations',
      analogy: 'Using your existing driver\'s license to check into a hotel instead of filling out a brand-new hotel-specific ID form every single time you travel.',
      expert: 'A CIAM pattern where an application delegates authentication to a large consumer identity provider (Google, Apple, Facebook) via OIDC/OAuth, reducing signup friction at the cost of dependency on the third-party provider\'s availability and data-sharing policies.'
    },
    {
      id: 'magic_link',
      term: 'Magic Link',
      fullName: 'Magic Link Authentication',
      category: 'Foundations',
      analogy: 'A one-time paper ticket mailed straight to your home address — clicking it is proof enough that you control that mailbox, so no password is ever needed.',
      expert: 'A passwordless login method that emails or texts a single-use, time-limited authentication URL to a pre-verified address; clicking it proves possession of that inbox/phone and establishes a session without a shared-secret password.'
    },
    {
      id: 'account_lockout',
      term: 'Account Lockout',
      fullName: 'Account Lockout Policy',
      category: 'Foundations',
      analogy: 'A padlock that jams itself shut for 15 minutes after five wrong combination attempts in a row, buying time before anyone can try a sixth guess.',
      expert: 'A defensive control that temporarily or permanently disables an account after a configured number of consecutive failed authentication attempts, mitigating brute-force and credential-stuffing attacks at the cost of potential denial-of-service against legitimate users if not rate-tuned carefully.'
    },
    {
      id: 'sspr',
      term: 'SSPR',
      fullName: 'Self-Service Password Reset',
      category: 'Foundations',
      analogy: 'A hotel kiosk that lets a guest who forgot their room number reprint their own keycard after verifying a few personal details, without ever needing to wake up the night manager.',
      expert: 'A capability allowing users to reset a forgotten password themselves after passing an identity-verification challenge (MFA, security questions, email/SMS verification), reducing helpdesk password-reset ticket volume, one of the highest-cost categories of IT support tickets.'
    }
]
