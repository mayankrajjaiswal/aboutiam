export interface MCQ {
  id: string
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface Scenario {
  id: string
  title: string
  incident: string
  hint: string
  modelAnswer: string
  checkpoints: string[]
}

export interface DesignSimulation {
  id: string
  title: string
  prompt: string
  diagramAnalogy: string
  requirements: string[]
  criteriaChecklist: { label: string; details: string; matchedKeywords: string[] }[]
}

export interface CodingExercise {
  id: string
  title: string
  instruction: string
  starterCode: string
  solutionRegex: string // Regex pattern to validate the input config/code
  sampleSolution: string
  hint: string
}

export interface MockQuestion {
  id: string
  question: string
  suggestedDurationSeconds: number
  interviewerPersona: string // e.g. "Senior DevSecOps Engineer", "Governance Director"
  modelPoints: string[]
  hint: string
}

export interface CareerTrack {
  id: string
  title: string
  description: string
  salaryRange: string
  experienceLevel: string
  mcqs: MCQ[]
  scenarios: Scenario[]
  designSimulations: DesignSimulation[]
  codingExercises: CodingExercise[]
  mockInterviews: MockQuestion[]
  resumeGuidance: {
    guidelines: string[]
    copyableBullets: string[]
    portfolioChecklist: string[]
  }
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'fresher',
    title: 'Fresher / Entry-Level Prep',
    description: 'Perfect for students, junior associates, or career switchers entering the Identity security workspace. Focuses on core analogies, basic protocol definitions (OIDC vs SAML), and credential hygiene.',
    salaryRange: '$65,000 - $85,000',
    experienceLevel: '0 - 2 Years',
    mcqs: [
      {
        id: 'f-m1',
        question: 'What is the primary difference between Authentication (AuthN) and Authorization (AuthZ)?',
        options: [
          'Authentication checks who you are; Authorization checks what you are allowed to do.',
          'Authentication checks what you can access; Authorization logs your session.',
          'Authentication is only for passwords; Authorization is only for API tokens.',
          'There is no technical difference; they are interchangeable terms.',
        ],
        answerIndex: 0,
        explanation: 'Authentication (AuthN) verifies the identity of a user (Who are you?), while Authorization (AuthZ) determines their access privileges (What can you do?). Think of AuthN as your passport, and AuthZ as the visa stamp granting you permission to enter a specific country.',
      },
      {
        id: 'f-m2',
        question: 'Which of the following describes "Federated Single Sign-On (SSO)" in plain terms?',
        options: [
          'Forcing users to change passwords every 30 days.',
          'Allowing a user to log in once with an Identity Provider (IdP) and access multiple unrelated applications without re-entering credentials.',
          'A system that strictly uses physical hardware security keys.',
          'A network topology that requires double-layer firewall routers.',
        ],
        answerIndex: 1,
        explanation: 'Federated SSO allows organizations to share identities across boundaries. Once authenticated by the central Identity Provider (IdP), the user gains secure, ticketed access to multiple Service Providers (SPs) without re-typing their credentials, vastly improving UX and centralizing audit controls.',
      },
    ],
    scenarios: [
      {
        id: 'f-s1',
        title: 'The Shared Shared Account Trap',
        incident: 'A customer support team of 15 members uses a single shared admin account on a cloud CRM to save on license fees. The security team discovers an unauthorized configuration change but cannot determine which support representative performed it.',
        hint: 'Focus on the principle of Accountability and why Shared Accounts violate security audits.',
        modelAnswer: 'Shared accounts completely destroy the non-repudiation property of security. Since multiple people possess the password, individual actions cannot be audited. The correct remediation is to establish individual user accounts for each representative (integrating single sign-on if supported) and enforce Role-Based Access Control (RBAC) to ensure they only have the minimal privileges needed to perform support duties.',
        checkpoints: [
          'Mentioned "Non-repudiation" or "Accountability".',
          'Highlighted the inability to audit individual actions.',
          'Proposed individual accounts with SSO integration.',
          'Recommended applying Least Privilege/RBAC.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 'f-d1',
        title: 'Basic User Onboarding and MFA Flow',
        prompt: 'Design a simple, secure onboarding flow for a newly hired employee. They must get their account activated, select a password, and register a multi-factor authentication (MFA) token safely.',
        diagramAnalogy: 'Think of this as registering a digital vault: they need a temporary one-time invitation code, which they exchange for a permanent master lock combination and a backup mobile security token.',
        requirements: [
          'An HR system triggers account creation in the directory.',
          'A temporary, short-lived activation link is sent to their personal email.',
          'User visits the link, undergoes identity verification, sets a secure password, and immediately registers an authenticator app (TOTP).',
        ],
        criteriaChecklist: [
          {
            label: 'Temporary Activation Link',
            details: 'Includes a secure, random activation token with a strict expiration window (e.g. 24 hours).',
            matchedKeywords: ['expire', 'hours', 'temporary', 'one-time'],
          },
          {
            label: 'Enforce Immediate MFA Registration',
            details: 'Requires the user to register an authenticator app (TOTP) or FIDO2 key during their first initial sign-in before allowing further resource access.',
            matchedKeywords: ['mfa', 'totp', 'authenticator', 'register'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 'f-c1',
        title: 'Construct a Basic JSON User Schema',
        instruction: 'Assemble a basic SCIM-like JSON schema payload containing three mandatory user parameters: "userName" (string), "emails" (array containing an object with "value" and "primary: true"), and "active" (boolean).',
        starterCode: '{\n  "userName": "jdoe@example.com",\n  // Complete the rest of the JSON structure...\n}',
        solutionRegex: '"emails"\\s*:\\s*\\[\\s*\\{\\s*"value"\\s*:\\s*"[^"]+"\\s*,\\s*"primary"\\s*:\\s*true\\s*\\}\\s*\\]\\s*,\\s*"active"\\s*:\\s*(true|false)',
        sampleSolution: '{\n  "userName": "jdoe@example.com",\n  "emails": [\n    { "value": "jdoe@example.com", "primary": true }\n  ],\n  "active": true\n}',
        hint: 'Ensure your JSON is valid, keys are double-quoted, and "emails" holds an array containing an object.',
      },
    ],
    mockInterviews: [
      {
        id: 'f-q1',
        question: 'Can you explain Multi-Factor Authentication (MFA) to someone who has no background in security?',
        suggestedDurationSeconds: 60,
        interviewerPersona: 'Supportive HR Manager',
        modelPoints: [
          'Used the three classic factors: Something you know (password), Something you have (phone/key), and Something you are (biometrics).',
          'Avoided overly complex cryptographic jargon.',
          'Explained that having multiple barriers makes it significantly harder for an attacker to break in even if they steal one of them.',
        ],
        hint: 'Use simple real-world analogies: like a house key combined with a fingerprint reader on the front door.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Place strong emphasis on foundational identity security concepts (AuthN vs AuthZ, SSO, Directories).',
        'Highlight any academic or home-lab projects involving authentication (e.g. setting up Keycloak, integrating Auth0, configuring LDAP directories).',
        'Demonstrate familiarity with directory concepts (Active Directory, LDAP, cloud directories).',
      ],
      copyableBullets: [
        'Deployed and configured a local mock single sign-on Identity Provider (Keycloak) to secure 3 custom demo web applications.',
        'Structured and validated SCIM 2.0 user provisioning JSON payloads to automate simulated account synchronization schemas.',
        'Designed active employee onboarding study checklists incorporating automated email invitation flows and secure TOTP MFA registration guides.',
      ],
      portfolioChecklist: [
        'GitHub repository showing a clean React or Node application integrating standard login via OIDC/OAuth 2.0 libraries.',
        'Blog post or local writeup detailing how to secure a simple API using JWT validation.',
        'Active progress badges from AboutIAM courses.',
      ],
    },
  },
  {
    id: 'developer',
    title: 'Developer Auth & Integration Prep',
    description: 'Geared towards software engineers, integration specialists, and app developers. Focuses on writing secure client integrations, OAuth 2.0 grant selection, token validation, and JWT security.',
    salaryRange: '$95,000 - $135,000',
    experienceLevel: '2 - 5 Years',
    mcqs: [
      {
        id: 'd-m1',
        question: 'Which OAuth 2.0 grant flow is considered the absolute standard and most secure for a Single Page Application (SPA)?',
        options: [
          'Implicit Grant (which returns tokens directly in the redirect URL fragment).',
          'Authorization Code Flow with PKCE (Proof Key for Code Exchange).',
          'Resource Owner Password Credentials Grant (directly exchanging raw username/password).',
          'Client Credentials Grant (using backend service credentials).',
        ],
        answerIndex: 1,
        explanation: 'The Implicit Grant is deprecated due to the risk of token leakage in browser history and redirect headers. For modern SPAs, Authorization Code Flow with PKCE is the gold standard. It prevents Authorization Code interception attacks by requiring a cryptographic dynamic challenge verification on the token swap.',
      },
      {
        id: 'd-m2',
        question: 'How should a server-side API securely validate an incoming JWT (JSON Web Token)?',
        options: [
          'API should blindly parse the base64 payload and trust the claims.',
          'API must fetch the public key from the IdP JWKS endpoint, verify the signature, assert the expiration (exp), audience (aud), and issuer (iss) claims.',
          'API must contact the database for every request to check password records.',
          'JWTs are self-validating and do not require cryptographic signature checks.',
        ],
        answerIndex: 1,
        explanation: 'JWT validation requires cryptographically verifying the signature against the trusted Identity Provider\'s public key (fetched and cached from the JWKS endpoint). Additionally, the resource server must validate standard claims: exp (not expired), aud (correct client target), and iss (matches trusted issuer url).',
      },
    ],
    scenarios: [
      {
        id: 'd-s1',
        title: 'The Leaking Refresh Token',
        incident: 'An application developer stores OAuth refresh tokens directly in the browser\'s localStorage. A security scanner flags this as a critical vulnerability. The developer argues it is safe because the connection is over HTTPS.',
        hint: 'Think about cross-site scripting (XSS) attacks and how HTTPS does not prevent script access to local storage.',
        modelAnswer: 'While HTTPS encrypts data in transit, it does not restrict access to client-side storage from within the browser. If the SPA falls victim to an XSS (Cross-Site Scripting) attack, a malicious script can read all values in localStorage, allowing hackers to steal the Refresh Tokens and maintain persistent unauthorized access. To remediate, either use the BFF (Backend-for-Frontend) pattern where tokens are stored strictly in secure, HttpOnly, SameSite cookies on a server-side proxy, or ensure client-side tokens are wrapped in a highly secure, ephemeral browser memory loop with short expirations.',
        checkpoints: [
          'Explained that HTTPS does not protect localStorage from XSS (Cross-Site Scripting).',
          'Highlighted the risk of token theft via malicious scripts.',
          'Recommended the Backend-for-Frontend (BFF) architecture.',
          'Suggested using secure, HttpOnly, SameSite cookies.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 'd-d1',
        title: 'Backend-for-Frontend (BFF) Token Exchange Topology',
        prompt: 'Design an architecture separating your client-side SPA from your APIs using a secure BFF proxy layer. The browser must never see raw access/refresh tokens.',
        diagramAnalogy: 'Think of the BFF as a trusted hotel concierge: the guest (browser) gets a temporary hotel room keycard (session cookie), while the concierge holds the master key cards (OAuth tokens) to open the external vaults (APIs).',
        requirements: [
          'Browser initiates login through the BFF proxy backend.',
          'BFF acts as the OAuth client, receives and securely stores the raw tokens in server memory/encrypted session.',
          'BFF issues a secure, HttpOnly, SameSite cookie back to the browser.',
          'For API calls, BFF intercepts the cookie, swaps it for the corresponding Bearer Access Token, and forwards the call to the backend APIs.',
        ],
        criteriaChecklist: [
          {
            label: 'HttpOnly same-site cookie structure',
            details: 'Enforces that session cookies cannot be read via JavaScript, completely blocking XSS-based token extraction.',
            matchedKeywords: ['httponly', 'samesite', 'cookie', 'session'],
          },
          {
            label: 'Token storage strictly in BFF proxy',
            details: 'Ensures the SPA client browser never handles or stores raw access or refresh tokens.',
            matchedKeywords: ['bff', 'backend', 'proxy', 'store', 'tokens'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 'd-c1',
        title: 'Write a Secure JWT Validation Claims Check',
        instruction: 'Complete the claims evaluation condition checking that: 1. the current time `now` is less than `payload.exp` (expiration), 2. `payload.iss` equals "https://auth.aboutiam.com", and 3. `payload.aud` matches "app-client-1".',
        starterCode: 'function validateClaims(payload, now) {\n  const expectedIss = "https://auth.aboutiam.com";\n  const expectedAud = "app-client-1";\n  \n  return (\n    // Write your conditional expression here...\n  );\n}',
        solutionRegex: 'now\\s*<\\s*payload\\.exp\\s*&&\\s*payload\\.iss\\s*===\\s*expectedIss\\s*&&\\s*payload\\.aud\\s*===\\s*expectedAud',
        sampleSolution: 'function validateClaims(payload, now) {\n  const expectedIss = "https://auth.aboutiam.com";\n  const expectedAud = "app-client-1";\n  \n  return (\n    now < payload.exp && payload.iss === expectedIss && payload.aud === expectedAud\n  );\n}',
        hint: 'Use strict equality (===) and logic AND (&&) in a single unified return condition.',
      },
    ],
    mockInterviews: [
      {
        id: 'd-q1',
        question: 'What is the PKCE (Proof Key for Code Exchange) mechanism in OAuth, and why is it necessary for browser-based apps?',
        suggestedDurationSeconds: 90,
        interviewerPersona: 'Senior DevSecOps Engineer',
        modelPoints: [
          'Defined PKCE as a dynamic handshake replacing static client secrets.',
          'Explained the three components: code_verifier (random secret), code_challenge (SHA-256 hash), and transformation method.',
          'Detailed how it blocks interception attacks on the redirect authorization code by proving the client asking for the token is the same client that initiated the code request.',
        ],
        hint: 'Describe how the code verifier acts as a dynamic one-time passport verification code that cannot be guessed or stolen in transit.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Emphasize OAuth 2.0 / OpenID Connect integration credentials.',
        'Use terms like "Token validation", "Claim verification", "JWKS caching", and "BFF proxy architectures".',
        'List software development technologies along with the exact security libraries used (e.g. passport-jwt, MSAL, jose).',
      ],
      copyableBullets: [
        'Refactored legacy implicit-grant authentication structures to the highly secure Authorization Code Flow with PKCE, mitigating browser-based access token exposure risks.',
        'Architected a Backend-for-Frontend (BFF) proxy wrapper using Node.js, storing raw OAuth tokens inside secure server sessions and utilizing HttpOnly cookies to defend against XSS-based theft.',
        'Designed custom JWT signature validation filters using cached JWKS public keys, decreasing API latency by 35% while asserting token expiration, audience, and issuer claims.',
      ],
      portfolioChecklist: [
        'Full SPA web application with a secure, backend Node.js or Python API, demonstrating proper cryptographic JWT parsing and authorization headers.',
        'A mock OIDC server integration or custom wrapper illustrating safe claims assertions.',
        'Contributions to open-source auth libraries.',
      ],
    },
  },
  {
    id: 'security_engineer',
    title: 'Security Engineer / Pentester Prep',
    description: 'Targeting application security engineers, penetration testers, and vulnerability analysts. Focuses on identity exploits (SAML SSW, JWT none alg, CSRF), threat modeling, and defensive controls.',
    salaryRange: '$110,000 - $160,000',
    experienceLevel: '3 - 6 Years',
    mcqs: [
      {
        id: 's-m1',
        question: 'How does a SAML Signature Wrapping (SSW) attack manipulate an assertion to bypass authentication checks?',
        options: [
          'It completely removes the XML signature tag.',
          'It leaves the cryptographically signed element unchanged to satisfy the signature validator, but copies/manipulates the actual user data inside an unsigned duplicate element that the business logic engine parses.',
          'It forces the IdP to sign with a public key of the attacker.',
          'It alters the SAML assertion into a plain JWT payload.',
        ],
        answerIndex: 1,
        explanation: 'SAML Signature Wrapping (SSW) exploits a discrepancy between the XML Signature validation module (which correctly validates the original signed element) and the application\'s business logic parser (which reads user details like the username from an unsigned element injected by the attacker). If the parser does not strictly evaluate the xpath of the signed element, the attack succeeds.',
      },
      {
        id: 's-m2',
        question: 'Which defensive header combination should be deployed to protect an identity login page from clickjacking and cookie hijacking?',
        options: [
          'Strict-Transport-Security and X-Frame-Options: DENY, with secure, HttpOnly, SameSite cookies.',
          'Access-Control-Allow-Origin: * and Content-Type: application/json.',
          'Referrer-Policy: unsafe-url and X-Content-Type-Options: nosniff.',
          'None of the above; firewalls handle these vulnerabilities entirely.',
        ],
        answerIndex: 0,
        explanation: 'Clickjacking is prevented by setting X-Frame-Options to DENY or a highly restrictive Content-Security-Policy (frame-ancestors \'none\'), ensuring the page cannot be loaded in malicious iframe overlays. Cookie hijacking is mitigated by forcing HTTPS (Strict-Transport-Security) and setting the Secure, HttpOnly, and SameSite attributes on cookies.',
      },
    ],
    scenarios: [
      {
        id: 's-s1',
        title: 'The JWT Downgrade Catastrophe',
        incident: 'A web portal secures administrative routes using HS256 signed JWTs. An external security engineer discovers they can bypass authentication entirely by modifying the token header `alg` to "none" and submitting a signature-less token.',
        hint: 'Recall why trusting user-supplied headers (like "alg") is a massive vulnerability, and how signature checks must be configured.',
        modelAnswer: 'The vulnerability occurs because the server\'s JWT verification logic blindly accepts the "alg" parameter specified in the incoming token header. If "none" is allowed, the validator assumes the signature was intentionally omitted and approves the token as valid. To remediate, the verification library must be explicitly configured to ONLY accept trusted signing algorithms (e.g. strictly HS256 or RS256) and reject the "none" algorithm under all circumstances. Additionally, always use modern, thoroughly audited libraries that automatically block the "none" exploit.',
        checkpoints: [
          'Identified the error as trusting the user-supplied header "alg: none".',
          'Explained that the validator bypassed signature checks.',
          'Recommended enforcing a strict list of allowed algorithms (e.g. HS256/RS256).',
          'Advised blocking "none" explicitly in the verification library.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 's-d1',
        title: 'Zero Trust Network Access (ZTNA) Trust Engine Architecture',
        prompt: 'Design a continuous authorization gateway modeled after NIST SP 800-207. Access must be dynamically evaluated based on network origin, device posture, and historical risk score.',
        diagramAnalogy: 'Think of this as an airport security queue: instead of just checking a boarding pass once at the entrance, security constantly monitors passenger biometrics, luggage scans, and ticket changes at every boarding gate.',
        requirements: [
          'A central Policy Decision Point (PDP) receives telemetry metadata.',
          'Device Posture checks (firewall active, disk encryption) are asserted prior to granting a short-lived token.',
          'A risk score is generated. If origin geolocations shift abruptly (impossible travel), the session is terminated and step-up authentication is demanded.',
        ],
        criteriaChecklist: [
          {
            label: 'Separate PDP and PEP boundaries',
            details: 'Defines a clear Policy Decision Point (decision logic) decoupled from the Policy Enforcement Point (the gateway block).',
            matchedKeywords: ['pdp', 'pep', 'decision', 'enforcement', 'gate'],
          },
          {
            label: 'Continuous telemetry telemetry loop',
            details: 'Asserts real-time continuous evaluation of device compliance and network threat telemetry.',
            matchedKeywords: ['telemetry', 'continuous', 'real-time', 'risk', 'posture'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 's-c1',
        title: 'Write an OPA Rego Rule for Administrator Access',
        instruction: 'Complete the basic OPA Rego authorization logic. The rule `allow` must evaluate to `true` if the input user roles `input.user.roles` contains "admin" and the input environment network `input.env.network` equals "internal".',
        starterCode: 'package play.authz\n\ndefault allow = false\n\nallow {\n  # Complete the condition here...\n}',
        solutionRegex: 'input\\.user\\.roles\\[_?\\]\\s*==\\s*"admin"\\s*input\\.env\\.network\\s*==\\s*"internal"',
        sampleSolution: 'package play.authz\n\ndefault allow = false\n\nallow {\n  input.user.roles[_] == "admin"\n  input.env.network == "internal"\n}',
        hint: 'Use the `[_]` array traversal notation in OPA Rego to inspect members of the user roles array, and ensure both conditions are listed inside the `allow` block.',
      },
    ],
    mockInterviews: [
      {
        id: 's-q1',
        question: 'If you are auditing a SAML Service Provider setup, what are the primary attack vectors you would look for?',
        suggestedDurationSeconds: 120,
        interviewerPersona: 'Senior Application Security Director',
        modelPoints: [
          'Looked for SAML Signature Wrapping (SSW) flaws.',
          'Checked if the XML Signature itself is strictly validated against a known public key, not trust-on-first-use.',
          'Ensured standard replay protection is active (validating IssueInstant, NotOnOrAfter, and keeping a cache of processed IDs).',
          'Checked for Entity Expansion (XXE) vulnerabilities inside the XML parser.',
        ],
        hint: 'SAML is XML-based. Focus on parser security, cryptographic validity, and signature structure bypasses.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Highlight security auditing, pen-testing, and threat modeling experience.',
        'Use strict terminology: "SAML Wrapping (SSW)", "CSRF token omission", "OAuth flow interception", "threat modeling (STRIDE)".',
        'State specific compliance and vulnerability scanning platforms you routinely use (e.g. Burp Suite, OWASP ZAP, CSP audits).',
      ],
      copyableBullets: [
        'Identified and remediated a critical SAML Signature Wrapping (SSW) vulnerability on a core SaaS portal, blocking prospective administrative account takeover exploits.',
        'Conducted advanced pen-tests across 12 OAuth 2.0 customer environments, identifying PKCE bypasses and open redirect flaws to reduce vulnerability exposure index by 40%.',
        'Built automated threat-modeling pipelines mapping identity system topologies against STRIDE and OWASP Top 10 vulnerabilities, standardizing secure architectural reference designs.',
      ],
      portfolioChecklist: [
        'Clean CVE discoveries in identity platforms or public vulnerability writeups.',
        'A comprehensive repository showing automated security unit test suites running in CI/CD pipelines to flag weak JWT setups.',
        'Active Certifications like OSCP, OSWE, or CISSP.',
      ],
    },
  },
  {
    id: 'iam_engineer',
    title: 'IAM Engineer Mastery Prep',
    description: 'For operations, configuration, and integration engineers working on active identity suites (Okta, Ping, Active Directory, ForgeRock). Focuses on directory design, synchronization pipelines, and system configuration.',
    salaryRange: '$105,000 - $145,000',
    experienceLevel: '3 - 5 Years',
    mcqs: [
      {
        id: 'i-m1',
        question: 'Which protocol is standardly used by modern Identity Providers to automate user account provisioning, update, and de-provisioning cycles across external SaaS platforms?',
        options: [
          'SAML 2.0 (Security Assertion Markup Language).',
          'SCIM 2.0 (System for Cross-domain Identity Management, RFC 7643/7644).',
          'Kerberos (Ticket Granting Service).',
          'DPoP (Demonstrating Proof-of-Possession).',
        ],
        answerIndex: 1,
        explanation: 'While SAML is used for single sign-on (SSO) exchanges during active user authentication sessions, SCIM (System for Cross-domain Identity Management) is specifically engineered to automate identity provisioning and lifecycle synchronization in the background via standard REST JSON APIs.',
      },
      {
        id: 'i-m2',
        question: 'What is an "Active Directory Global Catalog" and what is its operational purpose?',
        options: [
          'A database logging all globally blocked IP addresses.',
          'A distributed data repository that contains a partial, read-only representation of every object in every domain of a multi-domain Active Directory forest, optimizing cross-domain queries.',
          'A software library specifically for managing Linux server accounts.',
          'A global list of Active Directory software licenses.',
        ],
        answerIndex: 1,
        explanation: 'In multi-domain Active Directory environments, searching each directory partition individually would cause massive latencies. The Global Catalog (GC) resolves this by caching a lightweight, highly searchable index of all objects throughout the entire forest, allowing users to find objects in other domains instantly.',
      },
    ],
    scenarios: [
      {
        id: 'i-s1',
        title: 'The Infinite Synchronization Loop',
        incident: 'An administrator connects a local Active Directory to Okta using a directory agent, and also configures a cloud sync pipeline back from Okta to AD. Suddenly, the system experiences a massive spikes in API requests, with employee titles changing back and forth in an infinite loop.',
        hint: 'Consider what happens when both systems act as the absolute source of truth without clear directional master rules.',
        modelAnswer: 'This is a classic "Split-Brain" synchronization race condition. It occurs because both Active Directory and Okta are configured to "Master" the same user attributes simultaneously. AD changes write to Okta, which triggers an Okta write back to AD, creating an infinite modification loop. To resolve this, established absolute attribute-level authority (e.g. Active Directory is the master source for user profiles, while Okta is strictly the master for cloud application states) and disable conflicting write-back schemas to guarantee clear, uni-directional sync pathways.',
        checkpoints: [
          'Identified the issue as attribute-level mastering conflicts.',
          'Explained the circular dependency created by bi-directional sync.',
          'Recommended establishing AD as the primary profile master.',
          'Advised disabling conflicting attribute-writeback filters.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 'i-d1',
        title: 'SaaS User Provisioning Sync Architecture',
        prompt: 'Design an identity provisioning pipeline connecting a central HR system to a Directory (AD) and then syncing those accounts to multiple external SaaS cloud systems using SCIM.',
        diagramAnalogy: 'Think of this as an automated logistics network: the shipping hub (HR system) creates a cargo receipt (user object), writes it to the local warehouse inventory (AD), and automated conveyor belts (SCIM agents) route copies to retail stores (SaaS apps).',
        requirements: [
          'HR database initiates account generation.',
          'Synchronizer agent detects new record, provisions account in Active Directory, and generates email.',
          'SCIM engine evaluates application assignment rules, compiles standard RFC 7644 user schemas, and triggers downstream POST/PUT API calls to cloud SaaS portals.',
        ],
        criteriaChecklist: [
          {
            label: 'Downstream SCIM sync automation',
            details: 'Implements standard SCIM sync engine listening to directory changes to automate cloud application onboarding.',
            matchedKeywords: ['scim', 'sync', 'provisioning', 'saas', 'application'],
          },
          {
            label: 'Graceful rate-limit and error queues',
            details: 'Incorporates retry schedules and dead-letter queues to handle network dropouts and downstream HTTP 429 rate-limiting.',
            matchedKeywords: ['retry', 'queue', 'error', '429', 'rate-limit'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 'i-c1',
        title: 'Construct an LDAP Filter for Active Employees',
        instruction: 'Write an RFC 4515 LDAP filter string. The filter must search for objects where the objectCategory is "person", the objectClass is "user", and the attribute "employeeStatus" equals "Active".',
        starterCode: '(&(objectCategory=person)...)',
        solutionRegex: '\\(&\\(objectCategory=person\\)\\(objectClass=user\\)\\(employeeStatus=Active\\)\\)',
        sampleSolution: '(&(objectCategory=person)(objectClass=user)(employeeStatus=Active))',
        hint: 'Use the logical AND operator `&` wrapped inside an outer parenthesis enclosing all three sub-filters.',
      },
    ],
    mockInterviews: [
      {
        id: 'i-q1',
        question: 'How would you go about troubleshooting a user login issue where they are getting an generic "Authentication Failed" error on an SSO portal?',
        suggestedDurationSeconds: 100,
        interviewerPersona: 'Governance & Infrastructure Director',
        modelPoints: [
          'Divided troubleshooting into logical layers: Network, Protocol, and Directory.',
          'Checked directory lockouts first (AD password expired/locked).',
          'Used browser developer tools to inspect the SAML response or OAuth authorization code redirect parameters.',
          'Checked clock drift between the IdP and SP (SAML assertions fail if clocks differ by more than 5 minutes).',
        ],
        hint: 'Show a systematic, step-by-step diagnostic workflow rather than random guessing.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Highlight experience with directory services, Single Sign-On platforms, and provisioning systems.',
        'Use direct metrics: "managed forest of 50k users", "configured SSO for 120 SaaS apps", "automated provisioning with SCIM".',
        'State platform proficiencies: Okta, Active Directory, PingFederate, Azure AD/Entra ID.',
      ],
      copyableBullets: [
        'Engineered an automated SCIM 2.0 identity provisioning pipeline, synchronizing 15,000 employee profiles across 45 downstream SaaS systems and saving 80 hours of monthly manual operations.',
        'Designed and optimized Active Directory forest topologies across 4 global subsidiaries, restructuring trusts, Group Policy Objects (GPOs), and OU hierarchies to reduce login latency by 20%.',
        'Deployed PingFederate SSO clusters with redundant directory connectors, maintaining 99.99% authentication availability for over 45,000 corporate personnel.',
      ],
      portfolioChecklist: [
        'Terraform or PowerShell scripts automating the setup of mock AD/LDAP instances or SSO application integrations.',
        'Writeups or schemas detailing a migration from legacy LDAP directories to modern cloud Identity directories.',
        'Platform-specific technical certifications (e.g. Okta Certified Professional, Microsoft Certified: Identity and Access Administrator).',
      ],
    },
  },
  {
    id: 'architect',
    title: 'Enterprise Identity Architect Prep',
    description: 'Focused on high-scale architecture design, protocol trade-offs (SAML vs OIDC vs WS-Fed), multi-tenant SaaS patterns, API gateways, and distributed zero-trust mesh setups.',
    salaryRange: '$140,000 - $190,000',
    experienceLevel: '6 - 10+ Years',
    mcqs: [
      {
        id: 'a-m1',
        question: 'When designing a multi-tenant B2B SaaS platform, which isolation pattern is considered the most secure for tenant directory data?',
        options: [
          'Shared database with tenant-id columns in every table.',
          'Separate directory partitions (e.g. separate schemas or entirely decoupled databases per tenant) with dedicated, cryptographically isolated tenant keys.',
          'Placing all tenant profiles in a single flat directory without filtering.',
          'Relying strictly on CSS-based masking to separate client views.',
        ],
        answerIndex: 1,
        explanation: 'While collocated databases (tenant-id column) are cheaper, separate directory partitioning (database-per-tenant or schema isolation) provides the maximum defense against data leakage and accidental cross-tenant queries. This isolation is crucial for regulatory compliance (e.g. GDPR, HIPAA) in enterprise sectors.',
      },
      {
        id: 'a-m2',
        question: 'What is "API Gateway Token Exchange" (RFC 8693) and why is it used in complex microservice meshes?',
        options: [
          'A method to trade API keys for credit card transactions.',
          'A protocol enabling a gateway to validate an external, user-facing OIDC access token and swap it for a low-privilege, short-lived, internal-facing workload token to prevent token abuse downstream.',
          'An encryption standard exclusively for database backups.',
          'A system to translate SAML XML assertions into plain SOAP envelopes.',
        ],
        answerIndex: 1,
        explanation: 'Exposing rich, long-lived client-facing tokens to dozens of internal microservices violates Zero Trust. RFC 8693 Token Exchange solves this: the edge API Gateway validates the external token and swaps it for a highly-scoped downstream token restricting access to only the specific downstream services needed.',
      },
    ],
    scenarios: [
      {
        id: 'a-s1',
        title: 'The Multi-Cloud Identity Silo Crisis',
        incident: 'An enterprise acquires three independent companies, each utilizing separate identity infrastructure (Azure AD, Okta, and Ping). Business demands immediate cross-collaboration and unified portal access, but the systems cannot synchronize directories easily.',
        hint: 'Think about Identity Federation, Hub-and-Spoke topologies, and avoiding brute-force database synchronization.',
        modelAnswer: 'Attempting to merge or continuously sync three active directories directly creates massive database corruption and sync latency. The architecturally sound solution is to implement an Identity Federation Hub (using an Identity Broker or Hub-and-Spoke federation pattern). The unified Portal acts as the master federation hub, trusting Azure AD, Okta, and Ping as downstream Identity Providers (IdPs) via standard SAML/OIDC. Users authenticate against their legacy systems, which issue assertions back to the Federation Hub, generating a single, unified unified corporate security context.',
        checkpoints: [
          'Rejected direct database/directory synchronization.',
          'Proposed an Identity Broker / Federation Hub architecture.',
          'Federated legacy directories as external IdPs via SAML/OIDC.',
          'Maintained local directory authority without manual account migrations.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 'a-d1',
        title: 'Global Federated B2B SaaS Single Sign-On (SSO) Topology',
        prompt: 'Design a federated SSO gateway for a B2B SaaS platform that supports multiple enterprise customers. Each customer has their own Identity Provider (Okta, Azure AD, ADFS) and requires customized routing based on their email domain.',
        diagramAnalogy: 'Think of this as an international transit terminal: passengers arrive from different flights (IdPs). The passport check counter (B2B router) examines their passport stamps (email domains) and directs them down the correct arrivals tunnel (OIDC/SAML routes) to gain access.',
        requirements: [
          'SaaS landing page requests user email.',
          ' SSORouter parses email domain (e.g., user@acme.com -> Acme IdP).',
          'SaaS redirects the user to Acme\'s specific SAML/OIDC endpoint.',
          'User authenticates, and is redirected back to SaaS with authenticated claims, provisioning their session within their tenant-isolated workspace.',
        ],
        criteriaChecklist: [
          {
            label: 'Domain-based SSO Routing',
            details: 'Automatically routes users dynamically to their correct tenant IdP using email domain parses.',
            matchedKeywords: ['email', 'domain', 'route', 'tenant', 'parse'],
          },
          {
            label: 'Tenant Isolation Context',
            details: 'Ensures authenticated sessions are bounded strictly within the tenant-isolated data environment.',
            matchedKeywords: ['tenant', 'isolate', 'context', 'session', 'bound'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 'a-c1',
        title: 'Write an OPA Rego Token Exchange Policy',
        instruction: 'Write an OPA Rego rule to authorize RFC 8693 Token Exchange. The exchange is permitted only if the request subject token type `input.subject_token_type` is "urn:ietf:params:oauth:token-type:access_token" and the token issuer `input.issuer` is "https://auth.company.com".',
        starterCode: 'package token.exchange\n\ndefault allow_exchange = false\n\nallow_exchange {\n  # Complete the policy...\n}',
        solutionRegex: 'input\\.subject_token_type\\s*==\\s*"urn:ietf:params:oauth:token-type:access_token"\\s*input\\.issuer\\s*==\\s*"https://auth\\.company\\.com"',
        sampleSolution: 'package token.exchange\n\ndefault allow_exchange = false\n\nallow_exchange {\n  input.subject_token_type == "urn:ietf:params:oauth:token-type:access_token"\n  input.issuer == "https://auth.company.com"\n}',
        hint: 'Both constraints must evaluate to true within the same `allow_exchange` logic block.',
      },
    ],
    mockInterviews: [
      {
        id: 'a-q1',
        question: 'Walk me through your design process for establishing a zero-trust architecture in a legacy enterprise network environment.',
        suggestedDurationSeconds: 150,
        interviewerPersona: 'Executive Security Architect',
        modelPoints: [
          'Stated the zero-trust core motto: "Never Trust, Always Verify".',
          'Adopted a phased approach: Inventory mapping, Identity fortification, Micro-segmentation, and Continuous Monitoring.',
          'Integrated continuous policy evaluation engines (PDP) assessing device, network, and threat intelligence telemetry.',
          'Emphasized migrating static firewall perimeters to dynamic, authenticated gateways.',
        ],
        hint: 'Ground your answer in standard specifications like NIST SP 800-207 to show authority.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Emphasize strategic system design, architectural trade-offs, and standard implementations.',
        'Use keywords: "Identity fabric", "Federated SSO", "RFC 8693 Token Exchange", "multi-tenant security architecture".',
        'Provide metric-driven success indicators illustrating performance or compliance gains.',
      ],
      copyableBullets: [
        'Architected a highly resilient multi-tenant identity fabric for a B2B SaaS platform supporting 120+ enterprise customers, enforcing strict directory isolation and automated domain-based OIDC routing.',
        'Designed an API Gateway Token Exchange (RFC 8693) architecture handling 50 million daily transactions, decreasing downstream token risk exposure index by 90%.',
        'Defined the global enterprise zero-trust identity roadmap based on NIST SP 800-207, unifying 3 disparate AD forests into a single federated Identity Broker topology.',
      ],
      portfolioChecklist: [
        'A comprehensive public system design portfolio showing complex sequence diagrams and threat models for federated SSO networks.',
        'Open-source reference implementations of OPA Rego libraries or advanced Kubernetes SPIRE workload configurations.',
        'Active board advisory or thought-leadership writeups.',
      ],
    },
  },
  {
    id: 'principal',
    title: 'Principal Strategic Director Prep',
    description: 'For corporate executives, strategists, and practice leaders driving enterprise security compliance, long-term identity fabrics, and organizational governance.',
    salaryRange: '$180,000 - $250,000+',
    experienceLevel: '10+ Years',
    mcqs: [
      {
        id: 'p-m1',
        question: 'Which of the following describes the "Identity Fabric" design philosophy in modern corporate environments?',
        options: [
          'Forcing all legacy applications to be rewritten to support modern OIDC natively.',
          'A cohesive, decentralized architecture that integrates legacy directories, cloud IdPs, and API access management into a unified identity layer, decoupling the application layer from identity providers.',
          'Purchasing a single vendor identity suite and disabling all other tools.',
          'Encrypting all hard drives and backups with AES-256.',
        ],
        answerIndex: 1,
        explanation: 'An Identity Fabric unifies disparate identity systems. Instead of forcing expensive rewrites of legacy apps, the Fabric acts as an abstraction layer (using identity proxies or gateways) that translates modern OIDC, SAML, SCIM, and legacy directory structures into a single cohesive interface, ensuring agility and preventing vendor lock-in.',
      },
      {
        id: 'p-m2',
        question: 'Under GDPR and California Consumer Privacy Act (CCPA), what is a critical architectural requirement for managing identity profiles?',
        options: [
          'Storing passwords in cleartext for easy access.',
          'The absolute ability to completely delete all personal data of a user (Right to be Forgotten) across all connected single-sign-on systems and downstream directories.',
          'Preventing users from resetting their own passwords.',
          'Keeping infinite historical records of deleted profiles.',
        ],
        answerIndex: 1,
        explanation: 'Privacy regulations mandate the "Right to be Forgotten". In an enterprise environment, this requires that once a user deletion is triggered, SCIM provisioning engines must automatically route deletion (GET/DELETE/PATCH) payloads to all downstream SaaS portals and databases, ensuring no residual identity silos remain.',
      },
    ],
    scenarios: [
      {
        id: 'p-s1',
        title: 'The Identity Vendor Lock-In Crisis',
        incident: 'An identity provider raises their subscription license fee by 40% overnight. The executive leadership requests a mitigation strategy to switch to a competitor. The engineering team reports that switching would take 2 years and cost millions because identity logic is hardcoded directly into 300 business applications.',
        hint: 'Consider how decoupling identity from application business logic using standard APIs (like OIDC/SAML) or proxy architectures prevents lock-in.',
        modelAnswer: 'This is the classic penalty of hardcoding vendor-specific APIs directly into applications. To resolve this and prevent future lock-in, the organization must adopt an Identity Fabric architecture. By routing application authentication through a standardized proxy layer or using strictly compliant OIDC/SAML client libraries, the underlying Identity Provider can be swapped out in the configuration panel without modifying a single line of business application code.',
        checkpoints: [
          'Identified the core mistake: hardcoding vendor-specific APIs.',
          'Proposed decoupling identity from the application layer using standard OIDC/SAML.',
          'Recommended establishing an abstraction proxy layer or Identity Fabric.',
          'Ensured future vendor swaps only require configuration changes.',
        ],
      },
    ],
    designSimulations: [
      {
        id: 'p-d1',
        title: 'Decoupled Enterprise Identity Fabric and Abstraction Layer',
        prompt: 'Design a strategic, decoupled identity abstraction architecture for a conglomerate with 200 applications. The design must guarantee that swapping the backend Cloud IdP can be done entirely via centralized configurations without recoding apps.',
        diagramAnalogy: 'Think of this as a modular electrical grid: instead of soldering every appliance directly to a specific power plant, you install standard wall sockets (OIDC proxy layer). If you switch power companies, the outlets remain exactly the same and the appliances keep running.',
        requirements: [
          'Applications integrate strictly with a central Identity Abstraction Gateway using standard OIDC.',
          'The Gateway maps incoming standardized claims.',
          'Backend directories (Okta, Azure, legacy LDAP) connect strictly to the Gateway, allowing central directory routing, auditing, and policy orchestration.',
        ],
        criteriaChecklist: [
          {
            label: 'Centralized Identity Gateway proxy',
            details: 'Creates a clear, decoupled abstraction boundary between business applications and Identity Providers.',
            matchedKeywords: ['gateway', 'proxy', 'broker', 'abstract', 'decouple'],
          },
          {
            label: 'Standards-based OIDC integrations',
            details: 'Mandates standard, vendor-neutral protocol integrations across all application clients.',
            matchedKeywords: ['oidc', 'saml', 'standard', 'neutral', 'compliance'],
          },
        ],
      },
    ],
    codingExercises: [
      {
        id: 'p-c1',
        title: 'Define an IAM Security Policy Checklist Schema',
        instruction: 'Write a basic JSON configuration schema verifying three corporate IAM audit mandates: "sessionTimeoutMinutes" (integer <= 120), "mfaRequired" (boolean, must be true), and "allowedAlgorithms" (array containing "RS256").',
        starterCode: '{\n  "sessionTimeoutMinutes": 60,\n  // Complete the governance schema...\n}',
        solutionRegex: '"sessionTimeoutMinutes"\\s*:\\s*(120|[1-9][0-9]?)\\s*,\\s*"mfaRequired"\\s*:\\s*true\\s*,\\s*"allowedAlgorithms"\\s*:\\s*\\[\\s*"RS256"\\s*\\]',
        sampleSolution: '{\n  "sessionTimeoutMinutes": 120, \n  "mfaRequired": true,\n  "allowedAlgorithms": ["RS256"]\n}',
        hint: 'Your JSON keys must be double-quoted. Enforce exactly true for "mfaRequired" and array ["RS256"] for "allowedAlgorithms".',
      },
    ],
    mockInterviews: [
      {
        id: 'p-q1',
        question: 'How do you align identity security investments with corporate business growth objectives at the executive level?',
        suggestedDurationSeconds: 180,
        interviewerPersona: 'Chief Information Security Officer (CISO)',
        modelPoints: [
          'Reframing identity from a friction-inducing block to a business enabler (fast-tracking partner onboarding, improving customer conversion via seamless passwordless sign-ins).',
          'Focusing on risk reduction metrics (limiting breach exposure indices, eliminating regulatory fine exposures).',
          'Demonstrating clear operational efficiency gains (automating user lifecycles to save administrative IT labor costs).',
          'Ensuring strategic compliance mapping with SOC2, GDPR, CCPA, and FedRAMP.',
        ],
        hint: 'Avoid deep cryptographic talk. Focus on ROI, risk mitigation, business acceleration, and compliance.',
      },
    ],
    resumeGuidance: {
      guidelines: [
        'Emphasize global identity strategy, vendor negotiations, multi-million dollar budget oversight, and leadership.',
        'Use authoritative vocabulary: "Decoupled architecture", "Identity Fabric strategy", "merger integration", "regulatory alignment".',
        'Focus on macro organizational metrics: "consolidated 10 directories into 1", "saved $2.4M in annual licensing", "governed identity for 100k employees".',
      ],
      copyableBullets: [
        'Designed and executed the corporate Identity Fabric strategy, consolidating 14 regional directories into a centralized broker architecture and saving $2.4M in annual vendor subscription fees.',
        'Secured executive board approval for a comprehensive Zero-Trust roadmap, successfully aligning identity controls with SOC2 Type II and GDPR mandates across 200 global corporate applications.',
        'Orchestrated post-merger identity integration schedules for three acquisitions, establishing federated SSO access for 40,000 newly joined personnel within 45 days.',
      ],
      portfolioChecklist: [
        'Executive-level whitepapers or industry roadmap briefs published on Zero-Trust or identity governance.',
        'Keynotes or speaking engagements at prominent security conferences (e.g. Identiverse, RSA, Black Hat).',
        'Record of serving as a senior advisor or board director on corporate identity committees.',
      ],
    },
  },
]
