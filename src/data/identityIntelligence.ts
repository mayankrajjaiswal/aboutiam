export interface IdentityNews {
  id: string
  title: string
  source: string
  url: string
  date: string
  summary: string
  category: 'News' | 'Advisory' | 'Research' | 'Announcement'
  tags: string[]
  severity?: 'critical' | 'high' | 'medium' | 'info'
  remediation?: string
}

export interface IdentityCVE {
  id: string
  cveId: string
  title: string
  score: number
  vendor: string
  publishDate: string
  description: string
  remediationPatch: string
  securePatch: string
  remediationSteps: string
}

export interface IdentityEvent {
  id: string
  title: string
  organizer: string
  date: string
  time: string
  location: string
  isVirtual: boolean
  registrationUrl: string
  category: 'Conference' | 'Summit' | 'Webinar' | 'Workshop' | 'CTF' | 'Meeting'
  speakers: string[]
  agenda: string[]
  relatedTech: string[]
}

export interface CommunityDiscussion {
  id: string
  title: string
  source: 'LinkedIn' | 'Forums' | 'GitHub' | 'Podcast'
  author: string
  date: string
  likesCount: number
  commentsCount: number
  summary: string
  trendingScore: number
}

// 1. LIVE NEWS & CRITICAL SECURITY ADVISORIES
export const IDENTITY_NEWS_FEED: IdentityNews[] = [
  {
    id: 'n1',
    title: 'Thales Launches Sovereign Cloud CIAM to Meet Toughest EU Privacy Mandates',
    source: 'Thales Official Blog',
    url: 'https://www.thalesgroup.com/',
    date: '2026-07-01',
    category: 'Announcement',
    tags: ['Thales', 'OneWelcome', 'Sovereignty', 'GDPR', 'CIAM'],
    summary: 'Thales announces dedicated European sovereign data hosting regions for the OneWelcome Identity Platform, ensuring full GDPR compliance and isolated tenant directories for European banks and public institutions.',
    severity: 'info'
  },
  {
    id: 'n2',
    title: 'Advisory: Wildcard Subdomains Exploited in Open OAuth Redirect Attacks',
    source: 'NIST / CISA Advisory',
    url: 'https://www.cisa.gov',
    date: '2026-06-28',
    category: 'Advisory',
    tags: ['OAuth 2.0', 'Redirect URI', 'Vulnerability', 'CISA'],
    summary: 'CISA warns organizations that lax wildcard validation in OAuth redirect URIs is actively being leveraged by threat actors to harvest authentication authorization codes.',
    severity: 'high',
    remediation: 'Disable wildcard match patterns in OAuth client registries. Enforce strict, exact string comparisons on all redirect URIs.'
  },
  {
    id: 'n3',
    title: 'Okta Enforces Default MFA and Device Attestation for Support Portal Admins',
    source: 'Okta Engineering Blog',
    url: 'https://www.okta.com',
    date: '2026-06-25',
    category: 'Announcement',
    tags: ['Okta', 'Security', 'MFA', 'Device Trust'],
    summary: 'Following social engineering post-mortems, Okta mandates phishing-proof FIDO2 MFA and managed device posture attestation for all support-related administrative credentials.',
    severity: 'info'
  },
  {
    id: 'n4',
    title: 'Draft RFC: Ephemeral TLS Session Bindings for Cross-Domain Tokens',
    source: 'IETF OAuth Working Group',
    url: 'https://www.ietf.org',
    date: '2026-06-19',
    category: 'Research',
    tags: ['IETF', 'RFC', 'Token Binding', 'OAuth 2.1'],
    summary: 'A new draft proposes embedding TLS session hashes inside JWT claims to bind access tokens cryptographically to the TLS tunnel, preventing session cookie theft bypasses.',
    severity: 'info'
  },
  {
    id: 'n5',
    title: 'Critical Golden SAML Exploit Vectors Highlighted in Active Directory Configurations',
    source: 'MITRE Security Center',
    url: 'https://www.mitre.org',
    date: '2026-06-15',
    category: 'Advisory',
    tags: ['SAML', 'Active Directory', 'ADFS', 'Golden SAML'],
    summary: 'Attackers compromising on-prem ADFS signing certificates can bypass all MFA to forge assertions of any user. Moving signing keys to HSMs prevents certificate extraction.',
    severity: 'critical',
    remediation: 'Isolate ADFS token-signing private keys inside Hardware Security Modules (such as Thales SafeNet HSM) and enforce strict, read-only administrative access boundaries on the AD domain.'
  }
];

// 2. SEARCHABLE IDENTITY CVE DIRECTORY
export const IDENTITY_CVE_DIRECTORY: IdentityCVE[] = [
  {
    id: 'cve-1',
    cveId: 'CVE-2026-99182',
    title: 'Keycloak JWT Header Algorithm Confusions Bypass',
    score: 8.8,
    vendor: 'Keycloak',
    publishDate: '2026-05-10',
    description: 'A flaw in Keycloak’s token signature verification wrapper allowed an attacker to execute algorithm confusion attacks when verifying custom tokens signed with asymmetric public keys, leading to signature bypasses.',
    remediationSteps: 'Update to Keycloak version 26.1 or higher. Ensure that token validation libraries explicitly declare the exact expected signature algorithms (e.g., algorithms: ["RS256"]) and reject alternative types.',
    remediationPatch: `// VULNERABLE COMPONENT (Blindly trusts token header algorithm)
public boolean verifyToken(String tokenStr) {
    JsonWebToken token = TokenVerifier.create(tokenStr, JsonWebToken.class).getToken();
    String alg = token.getHeader().getAlgorithm();
    
    // Insecure: Resolves verification key dynamically based on token's claim!
    PublicKey key = KeyResolver.getPublicKey(token.getIssuer(), token.getHeader().getKeyId());
    return TokenVerifier.verify(tokenStr, key, alg); 
}`,
    securePatch: `// SECURE COMPONENT (Enforces expected algorithms list)
public boolean verifyToken(String tokenStr) {
    JsonWebToken token = TokenVerifier.create(tokenStr, JsonWebToken.class).getToken();
    String alg = token.getHeader().getAlgorithm();
    
    // Secure: Explicitly reject un-whitelisted or weak signature algorithms
    if (!"RS256".equals(alg) && !"ES256".equals(alg)) {
        throw new SecurityException("Rejected insecure signature algorithm: " + alg);
    }
    
    PublicKey key = KeyResolver.getPublicKey(token.getIssuer(), token.getHeader().getKeyId());
    return TokenVerifier.verify(tokenStr, key, "RS256"); // Restrict to expected
}`
  },
  {
    id: 'cve-2',
    cveId: 'CVE-2025-44912',
    title: 'OAuth PKCE Bypass via S256 Verifier Truncation',
    score: 7.5,
    vendor: 'OpenID Server Providers (Generic)',
    publishDate: '2025-11-14',
    description: 'Multiple open-source OAuth authorization libraries failed to validate the correct length constraints of the PKCE code_verifier, allowing hackers to forge codes using truncated or blank code_verifier parameters.',
    remediationSteps: 'Enforce minimum length requirements (43 to 128 characters) and character sets (A-Z, a-z, 0-9, -._~) on all incoming code_verifier validations as mandated by RFC 7636.',
    remediationPatch: `// VULNERABLE COMPONENT (No length validation on verifier)
public boolean validatePkce(String verifier, String challenge) {
    // Insecure: Bypasses check if verifier is empty or trivially short!
    String computedChallenge = Base64Url.encode(Sha256.hash(verifier));
    return computedChallenge.equals(challenge);
}`,
    securePatch: `// SECURE COMPONENT (Enforces strict length & character validation)
public boolean validatePkce(String verifier, String challenge) {
    if (verifier == null || verifier.length() < 43 || verifier.length() > 128) {
        throw new IllegalArgumentException("PKCE code_verifier length must be between 43 and 128 characters.");
    }
    if (!verifier.matches("^[A-Za-z0-9\\\\-\\\\.\\\\_\\\\~]+$")) {
        throw new IllegalArgumentException("PKCE code_verifier contains invalid characters.");
    }
    
    String computedChallenge = Base64Url.encode(Sha256.hash(verifier));
    return computedChallenge.equals(challenge);
}`
  }
];

// 3. ENTERPRISE EVENTS & COMMUNITY CALENDAR
export const COMMUNITY_EVENTS_CALENDAR: IdentityEvent[] = [
  {
    id: 'e1',
    title: 'Identiverse 2026',
    organizer: 'Identity Alliance',
    date: '2026-08-12',
    time: '09:00 - 17:00 EST',
    location: 'Denver, Colorado, USA',
    isVirtual: false,
    registrationUrl: 'https://identiverse.com',
    category: 'Conference',
    speakers: ['Mayank Raj Jaiswal (AboutIAM)', 'Sarah Evans (NIST)', 'John Doe (FIDO Alliance)'],
    agenda: [
      'Keynote: The Post-Password Enterprise Ecosystem',
      'Deploying FIDO2 Passkeys inside Legacy Infrastructure',
      'Sovereign CIAM and Decentralized Consent Orchestrations (Sponsored by Thales)'
    ],
    relatedTech: ['FIDO2', 'Passkeys', 'Sovereign Identity', 'Thales OneWelcome']
  },
  {
    id: 'e2',
    title: 'Thales Identity Summit: Securing Customer and Partner Ecosystems',
    organizer: 'Thales Group',
    date: '2026-07-28',
    time: '14:00 - 16:30 CET',
    location: 'Paris, France (Webcast Available)',
    isVirtual: true,
    registrationUrl: 'https://www.thalesgroup.com/',
    category: 'Summit',
    speakers: ['Francois Robert (Thales Head of IAM)', 'Elena Petrova (Retail Bank CSO)'],
    agenda: [
      'Orchestrating B2B Federated Single Sign-On and Delegated Admin',
      'SafeNet Trusted Access: Achieving Zero Trust Posture Checks',
      'Digital Banking Onboardings and Liveness Face Verification'
    ],
    relatedTech: ['Thales OneWelcome', 'SafeNet Trusted Access', 'IdCloud', 'Zero Trust', 'mTLS']
  },
  {
    id: 'e3',
    title: 'FIDO Alliance Seminars: Phishing-Resistant MFA Implementation',
    organizer: 'FIDO Alliance',
    date: '2026-07-15',
    time: '11:00 - 12:30 PST',
    location: 'Online Webcast',
    isVirtual: true,
    registrationUrl: 'https://fidoalliance.org',
    category: 'Webinar',
    speakers: ['Robert Miller (FIDO Alliance Chair)', 'David Vance (Security Architect)'],
    agenda: [
      'The Math of Asymmetric WebAuthn Signatures',
      'Overcoming TPM Enrollment Friction in Workforce Teams',
      'Demonstration: Passkey Internals Byte-Offset Analysis'
    ],
    relatedTech: ['WebAuthn', 'FIDO2', 'Passkeys']
  },
  {
    id: 'e4',
    title: 'AboutIAM Global CTF Arena: Identity Hacking Championship',
    organizer: 'AboutIAM Community',
    date: '2026-07-20',
    time: '00:00 - 23:59 GMT',
    location: 'Browser-Native Platform',
    isVirtual: true,
    registrationUrl: '/playground/ctf',
    category: 'CTF',
    speakers: ['AboutIAM Dev Team', 'Enterprise Sponsors'],
    agenda: [
      'SAML SSW Signature Wrapping Injection Challenges',
      'JWT hs256 Secret Cracking Speed Run',
      'LDAP filter injections and LDAP bypass parameters'
    ],
    relatedTech: ['JWT Studio', 'SAML Workbench', 'LDAP Tree Simulator', 'CTF Arena']
  }
];

// 4. SOCIAL & COMMUNITY DISCUSSIONS
export const SOCIAL_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 's1',
    title: 'The Fall of SMS MFA: Why PSD2 Regulatory Standards demand FIDO2 Biometrics',
    source: 'LinkedIn',
    author: 'Michael Vance (Principal Architect)',
    date: '2026-07-05',
    likesCount: 1420,
    commentsCount: 238,
    summary: 'SMS-based OTP is dead. Threat actors bypass SIM cards routinely using push bombing and social engineering. True passwordless biometrics (WebAuthn/FIDO2) is the only regulatory-compliant and phishing-proof path forward.',
    trendingScore: 98
  },
  {
    id: 's2',
    title: 'SAML Signature Wrapping (SSW) is still the #1 threat in legacy corporate federations',
    source: 'Forums',
    author: 'CyberDefender99',
    date: '2026-07-04',
    likesCount: 89,
    commentsCount: 45,
    summary: 'Many enterprise apps validate the XML signature but extract elements from un-signed blocks. Deconstruct this bypass vector locally in the SAML Workbench playground.',
    trendingScore: 82
  },
  {
    id: 's3',
    title: 'Episode 41: Identity Orchestrators and B2B Delegated Administration',
    source: 'Podcast',
    author: 'The Identity Security Podcast',
    date: '2026-06-30',
    likesCount: 520,
    commentsCount: 64,
    summary: 'An interview exploring how visual orchestrators (such as Thales OneWelcome) let organizations visually map login pathways and empower corporate clients to self-manage user roles.',
    trendingScore: 90
  }
];

// 5. AI EDITORIAL INGESTION PIPELINE STEPS
export interface IngestionStep {
  step: number
  title: string
  status: 'idle' | 'active' | 'completed'
  description: string
  actionLabel: string
}

export const INITIAL_INGESTION_STEPS: IngestionStep[] = [
  {
    step: 1,
    title: 'Discover & Scrape',
    status: 'idle',
    description: 'Scanning official vendor RSS, GitHub advisories, and IETF RFC drafts (e.g. Thales, Microsoft, FIDO Alliance).',
    actionLabel: 'Scan Feed Sources'
  },
  {
    step: 2,
    title: 'Extract & Clean',
    status: 'idle',
    description: 'Removing duplicate HTML tags, scraping body text, and isolating core cryptographic/policy claims.',
    actionLabel: 'Extract Raw Text'
  },
  {
    step: 3,
    title: 'Summarize & Categorize',
    status: 'idle',
    description: 'AI model synthesizes text, outputs key problem/remediation summaries, and applies security tags.',
    actionLabel: 'Run AI Summarization'
  },
  {
    step: 4,
    title: 'Cross-Link & Reference',
    status: 'idle',
    description: 'Mapping the intelligence to related AboutIAM tools, playgrounds, and standards (e.g. linking SAML advisories to SAML Workbench).',
    actionLabel: 'Build Cross-Links'
  },
  {
    step: 5,
    title: 'Editorial Publish',
    status: 'idle',
    description: 'Reviewing original summaries for vendor-neutral, standards-compliant clarity and committing to the feed.',
    actionLabel: 'Publish Curated Summary'
  }
];
