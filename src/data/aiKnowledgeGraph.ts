export interface ResourceLink {
  title: string;
  path: string;
  type: 'tool' | 'playground' | 'lab' | 'encyclopedia' | 'architecture' | 'vendor' | 'certification';
  desc?: string;
}

export interface ComparisonData {
  id: string;
  title: string;
  entityA: string;
  entityB: string;
  summary: string;
  table: { feature: string; a: string; b: string }[];
  useCasesA: string[];
  useCasesB: string[];
  winner?: string;
}

export interface InterviewQuestion {
  id: string;
  domain: string;
  question: string;
  hint: string;
  answer: string;
  rfc?: string;
}

export interface LearningTrack {
  level: string;
  goal: string;
  title: string;
  description: string;
  steps: { title: string; desc: string; resources: ResourceLink[] }[];
}

// 1. KNOWLEDGE GRAPH FOR CONTEXTUAL SIDEBAR
export const KNOWLEDGE_GRAPH: Record<string, ResourceLink[]> = {
  oauth: [
    { title: 'OAuth Request Builder', path: '/tools/oauth-builder', type: 'tool', desc: 'Build standard OAuth 2.0 URLs' },
    { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'Step-by-step OIDC flow chart' },
    { title: 'OAuth Attack Lab', path: '/playground/oauth-attack', type: 'lab', desc: 'Hack-and-defend sandbox' },
    { title: 'OAuth 2.0', path: '/encyclopedia', type: 'encyclopedia' }
  ],
  oidc: [
    { title: 'OIDC Discovery Auditor', path: '/tools/oidc-discovery', type: 'tool', desc: 'Decode metadata' },
    { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'OIDC flow chart' },
    { title: 'OpenID Connect', path: '/encyclopedia', type: 'encyclopedia' }
  ],
  jwt: [
    { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool', desc: 'Inspect & Verify Tokens' },
    { title: 'JWT Studio', path: '/playground/jwt', type: 'playground', desc: 'JWT encoder/decoder & signatures' },
    { title: 'JWT Cracker', path: '/playground/jwt-cracker', type: 'lab', desc: 'Dictionary attack simulator' },
    { title: 'Node.js Express + JWT', path: '/references', type: 'architecture', desc: 'Reference middleware implementation' }
  ],
  saml: [
    { title: 'SAML Workbench', path: '/playground/saml', type: 'playground', desc: 'XML assertion workbench' },
    { title: 'SAML Metadata Builder', path: '/tools/saml-metadata-builder', type: 'tool', desc: 'Compile SP/IdP XML' },
    { title: 'Golden SAML', path: '/wall-of-shame', type: 'encyclopedia', desc: 'SolarWinds Attack' }
  ],
  passkey: [
    { title: 'FIDO2 Lab', path: '/playground/fido2', type: 'playground', desc: 'WebAuthn key emulator' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Deconstructs authenticatorData' },
    { title: 'WebAuthn', path: '/encyclopedia', type: 'encyclopedia' }
  ],
  fido2: [
    { title: 'FIDO2 Lab', path: '/playground/fido2', type: 'playground', desc: 'WebAuthn key emulator' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Deconstructs authenticatorData' },
    { title: 'WebAuthn', path: '/encyclopedia', type: 'encyclopedia' }
  ],
  scim: [
    { title: 'SCIM Lab', path: '/playground/scim', type: 'playground', desc: 'Visual SCIM sync pipeline' },
    { title: 'SCIM Payload Validator', path: '/tools/scim-payload-validator', type: 'tool', desc: 'Validates JSON payloads' },
    { title: 'SCIM Diff Tool', path: '/tools/scim-diff', type: 'tool', desc: 'Side-by-side comparison engine' },
    { title: 'SCIM Provisioning API', path: '/references', type: 'architecture', desc: 'SCIM 2.0 implementation' }
  ],
  opa: [
    { title: 'OPA Playground', path: '/playground/opa', type: 'playground', desc: 'Rego authorization rules' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' },
    { title: 'OPA + Rego Policies', path: '/references', type: 'architecture', desc: 'Cloud Native ABAC implementation' }
  ],
  abac: [
    { title: 'Access Control Lab', path: '/playground/access', type: 'playground', desc: 'Dynamic ABAC/RBAC engine' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' }
  ],
  rbac: [
    { title: 'Access Control Lab', path: '/playground/access', type: 'playground', desc: 'Dynamic ABAC/RBAC engine' },
    { title: 'Policy Evaluator', path: '/tools/policy-evaluator', type: 'tool', desc: 'Dynamic JSON ABAC/RBAC' }
  ],
  zero_trust: [
    { title: 'ZTA Planner', path: '/playground/zta', type: 'playground', desc: 'NIST SP 800-207 controller' },
    { title: 'Device Trust', path: '/playground/device-trust', type: 'playground', desc: 'Endpoint posture attestation' },
    { title: 'Conditional Access', path: '/playground/conditional-access', type: 'playground', desc: 'Policy evaluations' }
  ],
  ldap: [
    { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground', desc: 'AD directory tree simulator' },
    { title: 'LDAP Filter Builder', path: '/tools/ldap-filter-builder', type: 'tool', desc: 'Visual RFC 4515 composer' }
  ],
  pki: [
    { title: 'Cert Chain Validator', path: '/playground/cert-chain', type: 'playground', desc: 'Map of Certificate Authorities' },
    { title: 'CSR Generator', path: '/tools/csr-generator', type: 'tool', desc: 'PKCS#10 Certificate Signing Requests' }
  ]
}

// 2. COMPARISON ENGINE DATA
export const COMPARISONS: ComparisonData[] = [
  {
    id: 'oauth_vs_oidc',
    title: 'OAuth 2.0 vs OpenID Connect',
    entityA: 'OAuth 2.0',
    entityB: 'OpenID Connect (OIDC)',
    summary: 'OAuth 2.0 is an authorization framework designed to grant third-party applications limited access to HTTP services. OpenID Connect is an identity layer built on top of the OAuth 2.0 protocol, allowing clients to verify the identity of the end-user.',
    table: [
      { feature: 'Primary Purpose', a: 'Authorization (Delegated Access)', b: 'Authentication (Identity Verification)' },
      { feature: 'Token Type', a: 'Access Token (Opaque or JWT)', b: 'ID Token (Strictly JWT)' },
      { feature: 'Standardized Profiles', a: 'No (API specific)', b: 'Yes (UserInfo endpoint, standard claims)' },
      { feature: 'Typical Analogy', a: 'A hotel keycard (grants access to a room)', b: 'A passport (proves who you are)' }
    ],
    useCasesA: ['Granting an app access to a users calendar', 'Server-to-Server API access', 'Microservices communication'],
    useCasesB: ['Logging into a web application', 'SSO across corporate portals', 'Mobile app user authentication']
  },
  {
    id: 'saml_vs_oauth',
    title: 'SAML 2.0 vs OAuth 2.0',
    entityA: 'SAML 2.0',
    entityB: 'OAuth 2.0',
    summary: 'SAML is an older, XML-based standard primarily used for enterprise SSO (workforce). OAuth 2.0 is a modern, lighter JSON/HTTP-based framework used for delegated authorization, often paired with OIDC for authentication.',
    table: [
      { feature: 'Data Format', a: 'XML Assertions', b: 'JSON / HTTP' },
      { feature: 'Primary Use Case', a: 'Enterprise Single Sign-On (B2E)', b: 'Delegated Authorization / APIs' },
      { feature: 'Cryptography', a: 'XML Digital Signatures (Heavy)', b: 'JSON Web Signatures (Lightweight)' },
      { feature: 'Client Types', a: 'Server-side web apps', b: 'SPAs, Mobile Apps, IoT, Servers' }
    ],
    useCasesA: ['Legacy corporate portals', 'Government identity integrations', 'Active Directory Federation Services (ADFS)'],
    useCasesB: ['Modern Single Page Apps (React/Angular)', 'Mobile applications', 'RESTful API security']
  },
  {
    id: 'rbac_vs_abac',
    title: 'RBAC vs ABAC',
    entityA: 'RBAC (Role-Based)',
    entityB: 'ABAC (Attribute-Based)',
    summary: 'RBAC grants access based on static roles assigned to users. ABAC dynamically evaluates attributes of the user, resource, and environment to make fine-grained access decisions.',
    table: [
      { feature: 'Access Decision', a: 'User Roles (e.g., "Admin", "User")', b: 'Attributes (e.g., User Dept, Device Health, Time)' },
      { feature: 'Granularity', a: 'Coarse-grained (Broad access)', b: 'Fine-grained (Highly specific)' },
      { feature: 'Complexity', a: 'Low (Easy to set up initially)', b: 'High (Requires policy engine like OPA)' },
      { feature: 'Role Explosion', a: 'High risk (Too many roles to manage)', b: 'None (Rules apply dynamically)' }
    ],
    useCasesA: ['Simple internal tools', 'Small teams', 'Legacy monolithic applications'],
    useCasesB: ['Zero Trust architectures', 'Multi-tenant B2B SaaS', 'Highly regulated environments (Finance/Healthcare)']
  },
  {
    id: 'ldap_vs_scim',
    title: 'LDAP vs SCIM 2.0',
    entityA: 'LDAP',
    entityB: 'SCIM 2.0',
    summary: 'LDAP is an older protocol for querying and modifying directory services over TCP. SCIM 2.0 is a modern, REST/JSON-based standard specifically designed to automate the exchange of user identity information across different domains.',
    table: [
      { feature: 'Protocol', a: 'Binary/TCP (Port 389/636)', b: 'REST API over HTTP/HTTPS' },
      { feature: 'Data Format', a: 'ASN.1 / BER', b: 'JSON' },
      { feature: 'Primary Domain', a: 'On-Premises (Inside firewall)', b: 'Cloud & B2B SaaS (Cross-domain)' },
      { feature: 'Cloud Friendly', a: 'No (Requires complex firewalls/VPNs)', b: 'Yes (Standard HTTP endpoints)' }
    ],
    useCasesA: ['On-prem Active Directory', 'Internal network printer authentication', 'Legacy VPNs'],
    useCasesB: ['Provisioning users to AWS/Salesforce', 'Automated cloud onboarding', 'IdP to SP synchronization']
  },
  {
    id: 'jwt_vs_session',
    title: 'JWT vs Session Cookies',
    entityA: 'JSON Web Tokens (JWT)',
    entityB: 'Session Cookies',
    summary: 'JWTs are client-stored, stateless security tokens containing claims that are cryptographically verified by the server. Session Cookies are server-stored, stateful references to an active session in a backend database.',
    table: [
      { feature: 'Storage Location', a: 'Client-side (LocalStorage or cookie)', b: 'Server-side (Memory/DB) + Client Reference' },
      { feature: 'Statelessness', a: 'Yes (No server database lookup needed)', b: 'No (Requires database querying on every request)' },
      { feature: 'Revocation', a: 'Difficult (Requires blacklist/short lifespans)', b: 'Instant (Delete session record on the server)' },
      { feature: 'Size', a: 'Large (Contains payload + signature)', b: 'Very Small (Simple random session ID string)' }
    ],
    useCasesA: ['Stateless Microservices APIs', 'Multi-tenant cloud architectures', 'Mobile application authentication'],
    useCasesB: ['Monolithic web applications', 'High-security financial interfaces (requiring instant logout)', 'Simple administrative portals']
  },
  {
    id: 'passkeys_vs_passwords',
    title: 'Passkeys vs Traditional Passwords',
    entityA: 'Passkeys (FIDO2/WebAuthn)',
    entityB: 'Traditional Passwords',
    summary: 'Passkeys are cryptographic keys stored on a users hardware device, leveraging asymmetric public-key cryptography to authenticate. Passwords are shared secrets that the user must memorize and type, which are sent to the server for verification.',
    table: [
      { feature: 'Cryptography', a: 'Asymmetric (Public/Private keys - ES256)', b: 'Symmetric (Shared secret hash match - bcrypt/argon2)' },
      { feature: 'Phishing Resistance', a: 'Phishing-resistant (Tied strictly to origin domain)', b: 'Highly vulnerable to credential harvesting/spoof sites' },
      { feature: 'User Experience', a: 'No typing needed (Touch ID, Face ID, local PIN)', b: 'Requires memorization, character complexity rules' },
      { feature: 'Credential Stuffing', a: 'Impossible (No shared secret can be leaked)', b: 'Extremely high risk if server database is breached' }
    ],
    useCasesA: ['Phishing-resistant modern CIAM systems', 'Zero-friction consumer onboardings', 'High-security administrative logins'],
    useCasesB: ['Legacy system compatibility', 'Simple hobbyist setups', 'Environments without biometric sensors/TPMs']
  },
  {
    id: 'opa_vs_cedar',
    title: 'Open Policy Agent (OPA) vs AWS Cedar',
    entityA: 'Open Policy Agent (OPA / Rego)',
    entityB: 'AWS Cedar',
    summary: 'OPA (Rego) is an open-source, general-purpose policy engine capable of evaluating any JSON input against logic trees. AWS Cedar is an authorization language specialized for Attribute-Based and Role-Based Access Control, optimized for speed and automated reasoning.',
    table: [
      { feature: 'Language', a: 'Rego (Datalog-inspired query language)', b: 'Cedar (Custom language designed for authorization)' },
      { feature: 'Primary Domain', a: 'Kubernetes, Cloud-Native, General Gateways', b: 'Application-level fine-grained AuthZ, Amazon Verified Permissions' },
      { feature: 'Analyzability', a: 'Decidable with bounds (complex rules)', b: 'Highly analyzable (Formal verification/automated reasoning)' },
      { feature: 'Performance', a: 'Depends on rules (in-memory lookup)', b: 'Extremely fast, constant-time evaluations' }
    ],
    useCasesA: ['Kubernetes admission control', 'Terraform security plan auditing', 'General HTTP microservices gatekeeping'],
    useCasesB: ['Fine-grained SaaS resource authorization', 'AWS Verified Permissions integrations', 'Decidable, high-frequency app-logic access checks']
  }
];

// 3. INTERVIEW PREP DATA
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    domain: 'OAuth/OIDC',
    question: 'An attacker manages to intercept an authorization code in an OAuth 2.0 flow. How can you prevent them from exchanging it for an access token?',
    hint: 'Think about dynamically tying the authorization request to the token request without using a static client secret.',
    answer: 'Implement PKCE (Proof Key for Code Exchange - RFC 7636). The client generates a random `code_verifier` and sends its hash (`code_challenge`) in the initial request. When exchanging the authorization code, the client must send the original `code_verifier`. The authorization server hashes it and verifies it matches the original challenge. An attacker with only the code cannot guess the verifier.',
    rfc: 'RFC 7636'
  },
  {
    id: 'q2',
    domain: 'Zero Trust',
    question: 'How do you enforce Continuous Access Evaluation (CAEP) in a system where JWT access tokens are valid for 1 hour?',
    hint: 'If a token is valid but a security event happens (e.g., device compromised), how does the resource server know?',
    answer: 'Using the Shared Signals Framework (SSF) and CAEP. The Identity Provider pushes asynchronous security events (like "Session Revoked" or "Device Risk Elevated") directly to the Resource Server (API Gateway). The Gateway caches these events and immediately denies access, overriding the local JWT expiration time.',
    rfc: 'RFC 9396'
  },
  {
    id: 'q3',
    domain: 'Cryptography',
    question: 'A developer uses the "none" algorithm in a JWT to bypass signature verification during testing, but leaves it in production. What is this attack called and how do you prevent it?',
    hint: 'The library is blindly trusting the header of the token.',
    answer: 'This is the "Algorithm Confusion / None Algorithm Bypass" attack. To prevent it, the JWT validation library must be hardcoded to strictly enforce an expected list of secure algorithms (e.g., `algorithms: ["RS256"]`) and reject any token presenting `alg: none`, `alg: HS256` (when expecting RS256), or unsupported algorithms.',
    rfc: 'RFC 8725'
  },
  {
    id: 'q4',
    domain: 'Core IAM',
    question: 'What is the primary difference between Authentication (AuthN) and Authorization (AuthZ)? Provide a simple analogy.',
    hint: 'Identity vs Permissions.',
    answer: 'Authentication (AuthN) verifies WHO you are. Authorization (AuthZ) determines WHAT you are allowed to do. Analogy: AuthN is presenting a valid boarding pass at the airport security checkpoint. AuthZ is the gate agent checking if your boarding pass allows you into the First Class Lounge.',
  }
];

// 4. LEARNING PLANNER DATA
export const LEARNING_TRACKS: LearningTrack[] = [
  {
    level: 'Beginner',
    goal: 'Security Engineer',
    title: 'Foundations of Identity Security',
    description: 'A ground-up approach to understanding how the internet secures users.',
    steps: [
      {
        title: 'Step 1: Understand the Basics',
        desc: 'Read the Beginner Primer to understand the "Digital Bouncer" analogy.',
        resources: [{ title: 'Beginner Primer', path: '/primer', type: 'encyclopedia' }]
      },
      {
        title: 'Step 2: Core Hashing & Passwords',
        desc: 'Understand why passwords alone fail.',
        resources: [
          { title: 'Password Generator & Entropy', path: '/tools/password-generator', type: 'tool' },
          { title: 'SHA256 Hash Tool', path: '/tools/sha256-hash-generator', type: 'tool' }
        ]
      },
      {
        title: 'Step 3: Multi-Factor Authentication',
        desc: 'Learn about TOTP and why it is better than passwords.',
        resources: [{ title: 'TOTP Generator', path: '/tools/totp-generator', type: 'tool' }]
      }
    ]
  },
  {
    level: 'Beginner',
    goal: 'IAM Architect',
    title: 'Foundations of IAM Architecture',
    description: 'Learn the architectural layouts, directories, and compliance guidelines.',
    steps: [
      {
        title: 'Step 1: Directory Tree Hierarchies',
        desc: 'Learn how users, groups, and permissions are mapped in Active Directory and SCIM.',
        resources: [
          { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground' },
          { title: 'LDAP Filter Builder', path: '/tools/ldap-filter-builder', type: 'tool' }
        ]
      },
      {
        title: 'Step 2: Access Policies',
        desc: 'Evaluate custom ABAC vs RBAC rules client-side.',
        resources: [
          { title: 'Access Control Lab', path: '/playground/access', type: 'playground' },
          { title: 'Policy Evaluator Tool', path: '/tools/policy-evaluator', type: 'tool' }
        ]
      }
    ]
  },
  {
    level: 'Intermediate',
    goal: 'Security Engineer',
    title: 'Applied Identity Hacking & Defense',
    description: 'An active, scenario-based track focused on patching critical web token and assertion flaws.',
    steps: [
      {
        title: 'Step 1: Exploiting and Securing JSON Web Tokens',
        desc: 'Analyze common signature-bypass strategies and cracking constraints.',
        resources: [
          { title: 'JWT Studio', path: '/playground/jwt', type: 'playground' },
          { title: 'JWT Cracker Lab', path: '/playground/jwt-cracker', type: 'lab' }
        ]
      },
      {
        title: 'Step 2: Defensive Token Handshakes',
        desc: 'Configure PKCE code challenges to shield public redirects from interceptors.',
        resources: [
          { title: 'OAuth Attack Lab', path: '/playground/oauth-attack', type: 'lab' },
          { title: 'PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' }
        ]
      }
    ]
  },
  {
    level: 'Intermediate',
    goal: 'IAM Architect',
    title: 'Enterprise Architecture & Federation',
    description: 'Deep dive into standard protocols that run the modern enterprise.',
    steps: [
      {
        title: 'Step 1: Mastering OAuth & OIDC',
        desc: 'Visually map out the industry standard authorization flows.',
        resources: [
          { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground' },
          { title: 'OAuth Builder Tool', path: '/tools/oauth-builder', type: 'tool' }
        ]
      },
      {
        title: 'Step 2: Deconstructing JWTs',
        desc: 'Understand stateless token security and signatures.',
        resources: [
          { title: 'JWT Studio', path: '/playground/jwt', type: 'playground' },
          { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool' }
        ]
      },
      {
        title: 'Step 3: Reference Implementations',
        desc: 'See how these protocols are implemented in production.',
        resources: [{ title: 'Enterprise References', path: '/references', type: 'architecture' }]
      }
    ]
  }
];
