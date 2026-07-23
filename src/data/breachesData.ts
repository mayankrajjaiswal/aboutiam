// Single source of truth for the /wall-of-shame "Breach Museum" — every entry here
// automatically renders in the filterable breach list on WallOfShame.tsx AND becomes
// searchable/deep-linkable (?tab=breaches&lab=<id>) via searchService.ts. Add a new
// breach by appending one object below; nothing else needs to be edited to make it
// searchable (see GEMINI.md §4B). Six entries carry an `interactiveLabId` — these keep
// their bespoke hand-built simulator UI in WallOfShame.tsx; every other entry renders
// through the generic vuln/secure-code "Breach Profile" panel.

export type BreachCategory =
  | 'Federation & SAML'
  | 'MFA & Push Bombing'
  | 'OAuth & OIDC'
  | 'Session & Token Theft'
  | 'Directory & Kerberos'
  | 'Privileged Access'
  | 'Supply Chain'
  | 'Cloud & SaaS Misconfiguration'
  | 'Credential & Password Attacks'
  | 'Social Engineering & Help Desk'

export type BreachLabId = 'goldensaml' | 'pushfatigue' | 'wildcard' | 'oktahar' | 'silversaml' | 'lastpass'

export interface Breach {
  id: string
  title: string
  year: string
  company: string
  logo: string
  category: BreachCategory
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  attackVector: string
  summary: string
  rootCause: string
  timeline: string[]
  vulnCode: string
  secureCode: string
  remediation: string
  lessons: string[]
  rfcs: string[]
  relatedResources: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
  interactiveLabId?: BreachLabId
}

// Derived, deduplicated list of categories actually in use by BREACHES — avoids the
// filter-button UI drifting out of sync with a hand-typed duplicate array.
export const BREACH_CATEGORIES: BreachCategory[] = [
  'Federation & SAML',
  'MFA & Push Bombing',
  'OAuth & OIDC',
  'Session & Token Theft',
  'Directory & Kerberos',
  'Privileged Access',
  'Supply Chain',
  'Cloud & SaaS Misconfiguration',
  'Credential & Password Attacks',
  'Social Engineering & Help Desk'
]

export const BREACHES: Breach[] = [
  // --- The 6 original interactive labs (bespoke simulator UI preserved in WallOfShame.tsx) ---
  {
    id: 'goldensaml',
    title: 'SolarWinds Golden SAML Hack',
    year: '2020',
    company: 'SolarWinds / Nobelium',
    logo: '🇷🇺',
    category: 'Federation & SAML',
    difficulty: 'Advanced',
    attackVector: 'Stolen AD FS token-signing certificate',
    summary: 'The SolarWinds Orion backdoor (SUNBURST) granted attackers administrative access on-premises. From there, they extracted the AD FS token-signing certificate to forge SAML assertions offline, bypassing MFA completely and taking over Microsoft 365 cloud networks.',
    rootCause: 'A supply-chain backdoor gave attackers domain-admin access, and the AD FS private signing key was reachable and exportable from that vantage point with no additional hardware protection (no HSM binding).',
    timeline: [
      'Attacker compromises SolarWinds Orion build pipeline and ships a trojanized update (SUNBURST).',
      'Backdoor grants domain-admin access inside victim networks.',
      'Attacker extracts the AD FS private token-signing certificate.',
      'Attacker forges SAML assertions offline for any user/role — no login event, no MFA prompt.',
      'Forged token presented to Microsoft 365 / AWS — full cloud tenant takeover.'
    ],
    vulnCode: `// AD FS token-signing key stored with no HSM binding
const signingCert = loadFromDisk('adfs-signing.pfx') // exportable, unprotected
const assertion = signSamlAssertion(claims, signingCert)`,
    secureCode: `// Bind signing key to an HSM/TPM so it can never be exported
const signingKey = await hsm.getKeyHandle('adfs-signing-key') // non-exportable
const assertion = await hsm.signSamlAssertion(claims, signingKey)`,
    remediation: 'Store the AD FS token-signing key in an HSM or Azure Key Vault-backed HSM so it can never be exported to disk, rotate signing certificates regularly, and monitor for SAML assertions issued with abnormal lifetimes or claims.',
    lessons: [
      'A signing key that can be exported to a file is a single point of total federation compromise.',
      'Supply-chain compromise of a trusted vendor bypasses every network perimeter control.',
      'Golden SAML forgery produces no authentication logs on the IdP — detection must watch the relying-party side.'
    ],
    rfcs: ['SAML 2.0 Core'],
    relatedResources: [{ title: 'SAML Assertion Workbench', path: '/playground/saml', type: 'playground' }],
    interactiveLabId: 'goldensaml'
  },
  {
    id: 'pushfatigue',
    title: 'MFA Push Fatigue Prompt Bombing',
    year: '2022',
    company: 'Uber / Cisco',
    logo: '📱',
    category: 'MFA & Push Bombing',
    difficulty: 'Beginner',
    attackVector: 'Repeated push-notification spam until the victim approves',
    summary: 'Spamming an employee\'s smartphone with push approval notifications until they click "Approve" out of frustration is a major attack vector, weaponized in the Uber and Cisco breaches. Enforcing "Number Matching" completely mitigates this human failure loop.',
    rootCause: 'Legacy "just tap Approve" push MFA gives the user no context about what they are approving, so social-engineered fatigue eventually produces an approval.',
    timeline: [
      'Attacker already holds a valid stolen password (often from a prior credential-stuffing dump).',
      'Attacker repeatedly triggers login attempts, firing dozens of push notifications to the victim\'s phone.',
      'Victim, annoyed at 2am, taps "Approve" just to stop the notifications.',
      'Attacker\'s session is now fully authenticated with a valid MFA-approved token.'
    ],
    vulnCode: `// Push approval requires no shared context
async function approvePush(pushId) {
  await mfa.approve(pushId) // no code, no context shown
}`,
    secureCode: `// Number matching forces the approver to see request context
async function approvePush(pushId, typedCode) {
  const expected = mfa.getDisplayCode(pushId)
  if (typedCode !== expected) throw new Error('Mismatch — reject')
  await mfa.approve(pushId)
}`,
    remediation: 'Enforce number-matching push MFA (a code shown on the login screen must be typed into the phone prompt), rate-limit repeated MFA challenges per user, and alert on abnormal push-approval request volume.',
    lessons: [
      'Any MFA factor that can be approved with a single tap and no context is vulnerable to fatigue attacks.',
      'Rate-limiting the challenge, not just the login attempt, closes the loop.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'ITDR SecOps Log Monitor Lab', path: '/playground/itdr', type: 'playground' }],
    interactiveLabId: 'pushfatigue'
  },
  {
    id: 'wildcard',
    title: 'OAuth Wildcard Redirect Hijacks',
    year: '2019',
    company: 'Various OAuth Providers',
    logo: '🔗',
    category: 'OAuth & OIDC',
    difficulty: 'Intermediate',
    attackVector: 'Misconfigured wildcard redirect_uri validation',
    summary: 'If an Authorization Server is misconfigured to allow wildcard redirects (e.g. `https://*.attacker-domain.com`), an attacker can register a rogue subdomain to intercept front-channel URL redirects and steal Single Sign-On authorization codes.',
    rootCause: 'The authorization server validates the redirect_uri against a wildcard/prefix pattern instead of an exact registered string match.',
    timeline: [
      'Client app registers a redirect_uri pattern using a wildcard subdomain.',
      'Attacker registers a rogue subdomain matching the wildcard pattern.',
      'Victim is tricked into starting an OAuth flow with the attacker\'s crafted authorize URL.',
      'Authorization code is delivered to the attacker\'s subdomain instead of the legitimate app.',
      'Attacker exchanges the stolen code for an access token.'
    ],
    vulnCode: `// Wildcard/prefix match on redirect_uri
function isValidRedirect(uri) {
  return uri.startsWith('https://') && uri.includes('.attacker-domain.com')
}`,
    secureCode: `// Exact string match against a registered allow-list
const REGISTERED_URIS = new Set(['https://aboutiam.com/callback'])
function isValidRedirect(uri) {
  return REGISTERED_URIS.has(uri)
}`,
    remediation: 'Register exact redirect URIs (RFC 6749 §3.1.2 / RFC 9700 best practice) with no wildcard matching, and require PKCE so a stolen authorization code alone cannot be exchanged for a token.',
    lessons: [
      'redirect_uri validation must be an exact string match, never a pattern or prefix.',
      'PKCE neutralizes most authorization-code interception attacks even if a redirect is hijacked.'
    ],
    rfcs: ['RFC 6749', 'RFC 7636', 'RFC 9700'],
    relatedResources: [{ title: 'OAuth Attack & Defend Lab', path: '/playground/oauth-attack', type: 'playground' }],
    interactiveLabId: 'wildcard'
  },
  {
    id: 'oktahar',
    title: 'Okta HAR Support Ticket Cookie Theft',
    year: '2023',
    company: 'Okta',
    logo: '🚫',
    category: 'Session & Token Theft',
    difficulty: 'Intermediate',
    attackVector: 'Unredacted session cookies inside HTTP Archive (HAR) support logs',
    summary: 'In 2023, threat actors compromised Okta\'s customer support database. They extracted uploaded HTTP Archive (HAR) troubleshooting logs containing valid administrative session cookies, then loaded these cookies into their own browsers to hijack enterprise portals without triggering MFA.',
    rootCause: 'Browser HAR exports capture full request/response headers, including live session cookies and bearer tokens, and were uploaded to a support system without any redaction.',
    timeline: [
      'Customer uploads a HAR file to Okta support to troubleshoot an issue.',
      'HAR file contains an unredacted, still-valid admin session cookie.',
      'Attacker compromises the support database and downloads the HAR file.',
      'Attacker injects the stolen cookie into their own browser session.',
      'Attacker is now authenticated as the admin with no login event and no MFA prompt.'
    ],
    vulnCode: `// Logs full HTTP headers to HAR file
const harLog = {
  request: { url: req.url, headers: req.headers } // UNSAFE: includes Cookie & Auth
}`,
    secureCode: `// Sanitizes headers before logging
const sensitive = ['authorization', 'cookie', 'set-cookie']
const sanitizeHeaders = (headers) =>
  headers.map(h => sensitive.includes(h.name.toLowerCase()) ? { name: h.name, value: '[REDACTED]' } : h)`,
    remediation: 'Redact Authorization/Cookie/Set-Cookie headers before accepting any diagnostic file upload, bind sessions to device fingerprints (DPoP/token-binding), and short-expire support-facing session tokens.',
    lessons: [
      'Diagnostic exports (HAR, crash dumps, core dumps) are a routinely overlooked credential-leak channel.',
      'Sender-constrained tokens (DPoP) neutralize a stolen bearer cookie even if it leaks.'
    ],
    rfcs: ['RFC 9449'],
    relatedResources: [{ title: 'Session Hijacking & Token Theft Lab', path: '/playground/session-hijacking', type: 'playground' }],
    interactiveLabId: 'oktahar'
  },
  {
    id: 'silversaml',
    title: 'Entra ID Silver SAML Attack',
    year: '2024',
    company: 'Entra ID (research disclosure)',
    logo: '🥈',
    category: 'Federation & SAML',
    difficulty: 'Advanced',
    attackVector: 'Stolen self-signed application signing key',
    summary: 'Unlike Golden SAML, which requires stealing the IdP\'s master token-signing key, Silver SAML exploits custom self-signed application signing keys. An attacker who compromises a single app\'s signing key can forge SAML assertions strictly for that app, bypassing Entra ID\'s central domain controller and MFA entirely.',
    rootCause: 'The relying-party application trusts a self-signed certificate whose private key is stored outside of central IdP-managed protections, with no certificate pinning against IdP-published metadata.',
    timeline: [
      'Attacker gains access to the targeted SaaS app\'s locally-stored signing key backup.',
      'Attacker forges a signed SAML assertion for that specific application only.',
      'Forged token presented directly to the target app — bypasses Entra ID\'s central auth entirely.',
      'Attacker is authenticated as an administrator inside that single SaaS application.'
    ],
    vulnCode: `// Accepts any self-signed assertion without pinning
const verifySAML = (xml) => {
  const cert = getCertFromXML(xml)
  return crypto.verify(xml, cert) // UNSAFE
}`,
    secureCode: `// Enforces strictly pinned IdP certificate from metadata
const verifySAML = (xml) => {
  const trustedCert = getPinnedCertFromMetadata()
  return crypto.verify(xml, trustedCert) // SECURE
}`,
    remediation: 'Pin the relying party\'s SAML signature verification to the certificate published in the IdP\'s own metadata (never trust an embedded certificate from the assertion itself), and rotate app-specific signing keys on a schedule.',
    lessons: [
      'Federation trust must be anchored to IdP-published metadata, not to whatever certificate the assertion carries.',
      'App-specific signing keys need the same custody controls as the master IdP key.'
    ],
    rfcs: ['SAML 2.0 Core'],
    relatedResources: [{ title: 'SAML Metadata Builder', path: '/tools/saml-metadata-builder', type: 'tool' }],
    interactiveLabId: 'silversaml'
  },
  {
    id: 'lastpass',
    title: 'LastPass Offline Vault Cracking',
    year: '2022',
    company: 'LastPass',
    logo: '🔑',
    category: 'Credential & Password Attacks',
    difficulty: 'Intermediate',
    attackVector: 'Weak PBKDF2 iteration counts on exfiltrated encrypted vaults',
    summary: 'Threat actors compromised LastPass backup vaults. While vaults were encrypted, older corporate accounts used outdated, low PBKDF2 iteration counts (as low as 5,000), allowing attackers to run highly optimized offline brute-force attacks on stolen GPUs and crack master passwords in seconds.',
    rootCause: 'Key-derivation iteration counts were never force-upgraded for legacy accounts, leaving them orders of magnitude weaker than the modern OWASP-recommended minimum.',
    timeline: [
      'Attacker compromises a cloud storage environment and exfiltrates encrypted customer vault backups.',
      'Vaults with low, legacy PBKDF2 iteration counts are targeted first.',
      'Attacker runs offline GPU-accelerated dictionary/brute-force cracking against the weak vaults.',
      'Master passwords for low-iteration accounts are recovered within hours to days.'
    ],
    vulnCode: `// Weak, legacy iteration count
const key = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 5000 }, base, 256
)`,
    secureCode: `// OWASP-recommended iteration count
const key = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 }, base, 256
)`,
    remediation: 'Force-upgrade every stored credential to the OWASP-recommended PBKDF2/Argon2id parameters on next login, and never let a legacy account remain on deprecated key-derivation settings indefinitely.',
    lessons: [
      'A strong algorithm choice is meaningless if the iteration/work-factor parameter is left at a legacy default.',
      'Encrypted-at-rest data is only as safe as its slowest key-derivation configuration across the entire user base.'
    ],
    rfcs: ['RFC 8018'],
    relatedResources: [{ title: 'Passphrase & Entropy Strength Calculator', path: '/tools/passphrase-entropy', type: 'tool' }],
    interactiveLabId: 'lastpass'
  },

  // --- New Breach Profiles (Beginner) ---
  {
    id: 'rockyou',
    title: 'RockYou Plaintext Password Leak',
    year: '2009',
    company: 'RockYou',
    logo: '📋',
    category: 'Credential & Password Attacks',
    difficulty: 'Beginner',
    attackVector: 'SQL injection into a database storing plaintext passwords',
    summary: 'A SQL injection vulnerability exposed 32 million user passwords — stored in plaintext with no hashing at all. The leaked list became the single most-used password-cracking dictionary in the security industry, still referenced 15+ years later.',
    rootCause: 'Passwords were stored as plaintext strings instead of being hashed with a salted, slow key-derivation function.',
    timeline: [
      'Attacker discovers an unsanitized SQL injection point in a RockYou web application.',
      'Attacker dumps the entire user database, which stores passwords as plaintext.',
      'The full password list is published publicly and becomes a standard cracking dictionary.'
    ],
    vulnCode: `// Storing the raw password string
function registerUser(username, password) {
  db.insert('users', { username, password }) // plaintext!
}`,
    secureCode: `// Hash with a salted, slow KDF before storing
async function registerUser(username, password) {
  const hash = await bcrypt.hash(password, 12)
  db.insert('users', { username, password_hash: hash })
}`,
    remediation: 'Never store raw passwords — always hash with a slow, salted algorithm (bcrypt/Argon2id), and fix the underlying SQL injection with parameterized queries.',
    lessons: [
      'Plaintext password storage turns any single data leak into a catastrophic, permanent credential-reuse disaster.',
      'A 15-year-old leaked password list is still an effective attack tool today because so many people reuse passwords.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'bcrypt Hash Generator', path: '/tools/bcrypt-hash-generator', type: 'tool' }]
  },
  {
    id: 'disney-credential-stuffing',
    title: 'Disney+ Launch-Day Credential Stuffing',
    year: '2019',
    company: 'Disney+',
    logo: '🎬',
    category: 'Credential & Password Attacks',
    difficulty: 'Beginner',
    attackVector: 'Credential stuffing using passwords reused from unrelated breaches',
    summary: 'Within hours of Disney+ launching, thousands of accounts appeared for sale on hacker forums. Attackers simply replayed username/password pairs leaked from unrelated prior breaches — many subscribers had reused a password Disney+ had never lost.',
    rootCause: 'No rate-limiting or breached-password detection on login, combined with widespread password reuse across the ecosystem.',
    timeline: [
      'Attacker collects username/password combo lists from unrelated historical breaches.',
      'Attacker scripts automated login attempts against Disney+ at launch, when demand and account volume were highest.',
      'A meaningful percentage of accounts match reused credentials and are compromised.',
      'Access is resold on underground forums within hours.'
    ],
    vulnCode: `// No throttling, no breach-list check
async function login(username, password) {
  const user = await db.findUser(username)
  return user && await bcrypt.compare(password, user.hash)
}`,
    secureCode: `// Rate limit + check password against known-breached lists
async function login(username, password) {
  await rateLimiter.check(username)
  if (await isBreachedPassword(password)) throw new Error('Reused breached password — reset required')
  const user = await db.findUser(username)
  return user && await bcrypt.compare(password, user.hash)
}`,
    remediation: 'Rate-limit login attempts per account/IP, screen new/changed passwords against known-breach corpora (e.g. HaveIBeenPwned k-anonymity API), and nudge users toward MFA at signup.',
    lessons: [
      'A service does not need its own breach to suffer a credential-stuffing wave — reused passwords from other breaches are enough.',
      'Launch-day traffic spikes are also the highest-value window for credential-stuffing bots.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Credential Stuffing & Password Spray Defense Lab', path: '/playground/credential-stuffing', type: 'playground' }]
  },
  {
    id: 'colonial-pipeline',
    title: 'Colonial Pipeline Single-Factor VPN Breach',
    year: '2021',
    company: 'Colonial Pipeline',
    logo: '⛽',
    category: 'Credential & Password Attacks',
    difficulty: 'Beginner',
    attackVector: 'Reused password on a legacy VPN account with no MFA',
    summary: 'Attackers gained initial access to Colonial Pipeline\'s network using a single compromised VPN account password — reused from another breach — that had no multi-factor authentication enabled. The resulting ransomware shutdown disrupted fuel supply across the US East Coast.',
    rootCause: 'A legacy remote-access account was never decommissioned or migrated to require MFA.',
    timeline: [
      'Employee\'s password, reused across services, is exposed in an unrelated third-party breach.',
      'Attacker finds the leaked credential and tests it against Colonial Pipeline\'s VPN, which has no MFA.',
      'Attacker gains initial network access and later deploys ransomware.',
      'Pipeline operations are shut down as a precaution, causing regional fuel shortages.'
    ],
    vulnCode: `// VPN login with password only
function vpnLogin(username, password) {
  return ldap.bind(username, password) // no second factor
}`,
    secureCode: `// VPN login requires MFA for every remote-access account
async function vpnLogin(username, password, mfaCode) {
  const bound = await ldap.bind(username, password)
  return bound && await mfa.verify(username, mfaCode)
}`,
    remediation: 'Require MFA on every remote-access path without exception, inventory and decommission legacy/unused accounts, and monitor for credentials appearing in breach-dump feeds.',
    lessons: [
      'One un-decommissioned legacy account without MFA can be the entire initial-access vector for a ransomware incident.',
      'Critical infrastructure identity hygiene has consequences far beyond the breached organization itself.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'TOTP Generator & Verifier', path: '/tools/totp-generator', type: 'tool' }]
  },
  {
    id: 'twitter-bitly-admin-tool',
    title: 'Twitter Admin Tool Social Engineering',
    year: '2020',
    company: 'Twitter',
    logo: '🐦',
    category: 'Social Engineering & Help Desk',
    difficulty: 'Beginner',
    attackVector: 'Phone spear-phishing of employees for internal admin-tool access',
    summary: 'Attackers phone-phished Twitter employees, tricking them into providing credentials for an internal administrative tool. That tool let the attackers reset account emails and take over high-profile verified accounts, which were then used for a Bitcoin scam.',
    rootCause: 'Overly broad internal admin-tool permissions were reachable by a wide set of support staff, with no step-up verification for sensitive account-takeover actions.',
    timeline: [
      'Attackers call employees pretending to be IT support, requesting VPN/admin credentials.',
      'A subset of employees hand over credentials or approve a fraudulent MFA push.',
      'Attackers use the internal admin tool to reset emails on high-profile accounts.',
      'Compromised verified accounts tweet a cryptocurrency scam simultaneously.'
    ],
    vulnCode: `// Any support staff role can perform destructive account actions
if (user.role === 'support') {
  adminTool.resetAccountEmail(targetAccountId, newEmail)
}`,
    secureCode: `// High-impact actions require a distinct elevated role + approval workflow
if (user.role === 'support_elevated' && await approvals.hasSecondApprover(actionId)) {
  adminTool.resetAccountEmail(targetAccountId, newEmail)
}`,
    remediation: 'Apply least-privilege and separation-of-duties to internal admin tooling, require a second approver for destructive identity actions (email/phone resets on high-value accounts), and train staff against phone-based social engineering.',
    lessons: [
      'Internal support tooling is as much an attack surface as the customer-facing product.',
      'Voice phishing remains highly effective even against technically sophisticated organizations.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Access Certification Campaign Simulator', path: '/playground/access-certification', type: 'playground' }]
  },

  // --- New Breach Profiles (Intermediate) ---
  {
    id: 'capitalone-ssrf',
    title: 'Capital One SSRF & Over-Privileged IAM Role',
    year: '2019',
    company: 'Capital One',
    logo: '🏦',
    category: 'Cloud & SaaS Misconfiguration',
    difficulty: 'Intermediate',
    attackVector: 'Server-Side Request Forgery against the AWS instance metadata service',
    summary: 'A misconfigured web application firewall was tricked via SSRF into requesting AWS instance metadata, returning temporary credentials for an IAM role with far broader S3 access than the application actually needed. Those credentials were used to exfiltrate over 100 million customer records.',
    rootCause: 'The compromised IAM role was over-privileged relative to the workload\'s actual needs, and the instance metadata service (IMDSv1) had no request-header protection against SSRF.',
    timeline: [
      'Attacker finds an SSRF vulnerability in a misconfigured WAF/reverse proxy.',
      'Attacker uses SSRF to reach the EC2 instance metadata endpoint (169.254.169.254).',
      'Metadata service returns temporary credentials for an over-privileged IAM role.',
      'Attacker uses the stolen credentials to list and exfiltrate dozens of S3 buckets.'
    ],
    vulnCode: `// IMDSv1 — no session token required to read metadata
GET http://169.254.169.254/latest/meta-data/iam/security-credentials/role-name
// Role policy grants broad, unscoped s3:*`,
    secureCode: `// IMDSv2 requires a session token header, defeating basic SSRF
PUT http://169.254.169.254/latest/api/token
  X-aws-ec2-metadata-token-ttl-seconds: 21600
GET http://169.254.169.254/latest/meta-data/...
  X-aws-ec2-metadata-token: <token>
// Role policy scoped to only the specific buckets/prefixes needed`,
    remediation: 'Enforce IMDSv2 (session-oriented, SSRF-resistant metadata requests) fleet-wide, apply least-privilege IAM policies scoped to exact resource ARNs, and continuously audit for SSRF in any request-proxying component.',
    lessons: [
      'An over-privileged IAM role turns a single application bug into an organization-wide data breach.',
      'Cloud metadata services are a high-value target for any SSRF vulnerability — always harden them by default.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Multi-Cloud SPIFFE/SPIRE Workload Identity', path: '/architecture?arch=multi_cloud_spiffe', type: 'references' }]
  },
  {
    id: 'uber-github-aws-keys',
    title: 'Uber GitHub-Leaked AWS Keys',
    year: '2016',
    company: 'Uber',
    logo: '🚗',
    category: 'Credential & Password Attacks',
    difficulty: 'Intermediate',
    attackVector: 'Hardcoded AWS credentials committed to a private GitHub repository',
    summary: 'Attackers found AWS access keys hardcoded inside source code stored in a private GitHub repository (accessed via separately compromised employee credentials) and used them to access an AWS S3 backup bucket containing the personal data of 57 million users and drivers.',
    rootCause: 'Long-lived static cloud credentials were committed directly into application source code instead of being fetched at runtime from a secrets manager.',
    timeline: [
      'Attackers obtain valid credentials to a private Uber GitHub repository.',
      'Repository source code contains hardcoded AWS access key/secret pairs.',
      'Attackers use the keys directly against the AWS API to access an S3 backup bucket.',
      'Personal data for 57 million users/drivers is exfiltrated.'
    ],
    vulnCode: `// Hardcoded static credentials committed to source control
const s3 = new AWS.S3({
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
})`,
    secureCode: `// Fetch short-lived credentials from the workload identity provider at runtime
const s3 = new AWS.S3({
  credentials: await sts.assumeRoleWithWebIdentity({ roleArn, webIdentityToken })
})`,
    remediation: 'Never commit static cloud credentials to source control — use short-lived, workload-scoped identity (IAM roles, OIDC federation) fetched at runtime, enable secret-scanning on every repository, and rotate any credential ever found in git history.',
    lessons: [
      'Static long-lived credentials in source control are one of the most common real-world breach root causes.',
      'Secret scanning and pre-commit hooks catch this class of leak before it ever reaches a remote repository.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Ansible Vault Encryptor & Decryptor', path: '/tools/ansible-vault', type: 'tool' }]
  },
  {
    id: 'marriott-starwood',
    title: 'Marriott/Starwood Long-Dwell Breach',
    year: '2018',
    company: 'Marriott (Starwood)',
    logo: '🏨',
    category: 'Session & Token Theft',
    difficulty: 'Intermediate',
    attackVector: 'Undetected persistent access via stolen administrator credentials',
    summary: 'Attackers first compromised Starwood\'s reservation systems in 2014 using stolen administrator credentials and remained undetected for four years — surviving Marriott\'s 2016 acquisition of Starwood — before finally being discovered, by which point 500 million guest records had been exposed.',
    rootCause: 'No continuous re-verification of privileged sessions or credentials; a stolen administrator credential from 2014 remained valid and undetected through a corporate acquisition and system migration.',
    timeline: [
      'Attacker compromises Starwood administrator credentials in 2014.',
      'Persistent, low-and-slow access is maintained across the network for years.',
      'Marriott acquires Starwood in 2016; compromised systems and access persist through the merger.',
      'Anomaly detection finally flags the intrusion in 2018 — four years after initial access.'
    ],
    vulnCode: `// Static admin credentials, never re-validated after issuance
if (await ldap.bind(adminUser, adminPassword)) {
  grantPrivilegedSession(adminUser, { expiresIn: null }) // no expiry, no re-auth
}`,
    secureCode: `// Time-boxed privileged sessions with continuous re-verification
if (await ldap.bind(adminUser, adminPassword)) {
  grantPrivilegedSession(adminUser, { expiresIn: '4h', requireStepUpEvery: '1h' })
}`,
    remediation: 'Time-box every privileged session, require periodic re-authentication/step-up for administrators, rotate credentials on a fixed schedule regardless of suspected compromise, and re-audit all inherited access during any M&A system integration.',
    lessons: [
      'Long dwell time is often the real damage multiplier in a breach — detection speed matters as much as prevention.',
      'Mergers and acquisitions must re-validate every inherited identity and credential, not just integrate systems.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Identity Threat Detection (ITDR) Lab', path: '/playground/itdr', type: 'playground' }]
  },
  {
    id: '0ktapus-smishing',
    title: '0ktapus SMS Phishing Campaign',
    year: '2022',
    company: 'Twilio / Cloudflare (targeted)',
    logo: '📲',
    category: 'Social Engineering & Help Desk',
    difficulty: 'Intermediate',
    attackVector: 'SMS phishing to a fake, cloned Okta-style login page',
    summary: 'A widespread SMS phishing campaign sent employees at Twilio, Cloudflare, and dozens of other companies text messages linking to a convincing cloned Okta login page. Cloudflare\'s FIDO2 hardware security keys stopped the attack outright; other victims using OTP/push MFA were successfully phished.',
    rootCause: 'Phishable MFA factors (OTP codes, simple push approvals) can be relayed in real time by an attacker\'s proxy phishing page, unlike a phishing-resistant hardware-bound factor.',
    timeline: [
      'Employees receive an SMS impersonating IT, linking to a cloned company SSO login page.',
      'Victim enters username, password, and OTP code directly into the attacker\'s proxy page.',
      'Proxy relays the credentials and OTP to the real IdP in real time, capturing a valid session.',
      'Organizations using FIDO2/WebAuthn hardware keys are immune — the phishing page cannot replay a hardware-bound signature.'
    ],
    vulnCode: `// OTP code alone is phishable via a real-time relay proxy
if (await mfa.verifyOtp(user, submittedOtpCode)) {
  createSession(user)
}`,
    secureCode: `// WebAuthn/FIDO2 is origin-bound — a phishing-page origin cannot get a valid assertion
const assertion = await navigator.credentials.get({ publicKey: challengeOptions })
if (await verifyWebAuthnAssertion(assertion, expectedOrigin)) {
  createSession(user)
}`,
    remediation: 'Migrate high-value accounts to phishing-resistant FIDO2/WebAuthn passkeys, which are cryptographically bound to the legitimate origin and cannot be relayed through a cloned page.',
    lessons: [
      'OTP and simple push MFA can be defeated by real-time phishing relay proxies — they are not phishing-resistant.',
      'Origin-bound WebAuthn assertions are immune to this entire attack class by cryptographic design.'
    ],
    rfcs: ['RFC 9700'],
    relatedResources: [{ title: 'WebAuthn / FIDO2 Passkey Emulator', path: '/playground/fido2', type: 'playground' }]
  },
  {
    id: 'mailchimp-internal-tool',
    title: 'Mailchimp Internal Tool Social Engineering',
    year: '2022',
    company: 'Mailchimp',
    logo: '🐵',
    category: 'Social Engineering & Help Desk',
    difficulty: 'Intermediate',
    attackVector: 'Social engineering of employees for internal customer-support tool access',
    summary: 'Attackers social-engineered Mailchimp employees to gain access to an internal customer support and account administration tool, which was then used to view API keys and export audience data for a targeted set of cryptocurrency and finance customer accounts.',
    rootCause: 'A single compromised employee session granted broad, un-scoped read access across many unrelated customer accounts inside the internal tool.',
    timeline: [
      'Attacker social-engineers an employee (or compromises their credentials) to reach the internal support tool.',
      'Internal tool grants broad account-lookup access with no per-account justification logging.',
      'Attacker searches for high-value (crypto/finance) customer accounts and views their API keys.',
      'API keys are used to export audience/contact data directly from the affected accounts.'
    ],
    vulnCode: `// Any authenticated support agent can view any account's API keys
function viewAccountApiKeys(agentSession, targetAccountId) {
  return db.getApiKeys(targetAccountId)
}`,
    secureCode: `// Access requires a logged, ticket-linked justification and is scoped/audited
function viewAccountApiKeys(agentSession, targetAccountId, ticketId) {
  auditLog.record({ agent: agentSession.user, targetAccountId, ticketId })
  return db.getApiKeys(targetAccountId) // still flagged for anomaly detection
}`,
    remediation: 'Require a linked support ticket/justification for every sensitive account lookup, log and alert on abnormal cross-account access patterns by support staff, and rotate customer API keys automatically after any suspected internal-tool compromise.',
    lessons: [
      'Support tooling that can view secrets across the entire customer base is a prime target for social engineering.',
      'Justification-based, audited access (not just role-based access) is needed for tools with broad reach.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Adaptive Risk-Based Authentication Engine', path: '/playground/risk-engine', type: 'playground' }]
  },
  {
    id: 'uber-2022-pam-credential-discovery',
    title: 'Uber 2022 PAM Credential Discovery on a Network Share',
    year: '2022',
    company: 'Uber',
    logo: '🔑',
    category: 'Privileged Access',
    difficulty: 'Advanced',
    attackVector: 'MFA-fatigue initial access, followed by discovery of hardcoded PAM admin credentials on an internal network share',
    summary: 'After an MFA-fatigue attack granted VPN access, the attacker found a PowerShell script on an internal network share containing hardcoded administrator credentials for Uber\'s Privileged Access Management (PAM) tool, escalating from a single VPN login to full administrative control of AWS, GSuite, and internal admin panels.',
    rootCause: 'The organization\'s own PAM tool — meant to eliminate standing hardcoded credentials — had its master admin password hardcoded in a script left readable on a general-access network share.',
    timeline: [
      'Attacker buys a contractor\'s stolen VPN credentials from an initial-access broker.',
      'Attacker bombards the contractor with MFA push requests until one is approved (MFA fatigue).',
      'Once on the internal network, attacker discovers a PowerShell script on a shared drive containing a hardcoded PAM administrator password.',
      'Attacker uses the PAM admin credential to unlock privileged access to AWS, GSuite, Slack, and internal security tooling.'
    ],
    vulnCode: `// PAM admin password hardcoded in a script on a general-access share
$panAdminPassword = "P@ssw0rd_Th1c3ntr@l_Vault!"
Connect-PamAdminConsole -Credential $panAdminPassword`,
    secureCode: `// PAM admin access requires just-in-time elevation, no standing hardcoded secret
$approval = Request-JitElevation -Justification "incident response" -ApproverGroup 'security-leads'
if ($approval.Granted) { Connect-PamAdminConsole -Token $approval.EphemeralToken }`,
    remediation: 'Never hardcode privileged credentials in scripts or files on shared drives — even for the PAM tool itself — and require just-in-time, approved, time-boxed elevation for any PAM administrator action, with routine scans for secrets left in file shares.',
    lessons: [
      'A Privileged Access Management tool is only as strong as the custody of its own administrator credential.',
      'MFA fatigue is often just the initial-access step; the real damage comes from what standing privileged secrets the attacker finds next.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'PAM Vaulting & Just-in-Time Elevation Lab', path: '/playground/pam-vaulting', type: 'playground' }]
  },
  {
    id: 'github-oauth-app-token-theft',
    title: 'GitHub OAuth App Token Theft (Heroku/Travis CI)',
    year: '2022',
    company: 'GitHub / Heroku / Travis CI',
    logo: '🐙',
    category: 'OAuth & OIDC',
    difficulty: 'Intermediate',
    attackVector: 'Stolen OAuth application integration tokens',
    summary: 'An attacker stole OAuth user tokens issued to the Heroku and Travis CI third-party integrations, then used those tokens to download private repository contents from dozens of organizations that had authorized those OAuth apps — without ever touching GitHub\'s own systems directly.',
    rootCause: 'Broadly-scoped OAuth tokens issued to third-party integrations were stored insecurely on the integration provider\'s side, and GitHub had no way to detect anomalous use of a token it had legitimately issued.',
    timeline: [
      'Attacker compromises internal systems at the Heroku/Travis CI OAuth integration providers.',
      'Attacker extracts stored OAuth access tokens issued to those apps by GitHub on behalf of many organizations.',
      'Attacker uses the valid tokens directly against the GitHub API to list and clone private repositories.',
      'GitHub detects anomalous API usage patterns and revokes the affected OAuth tokens.'
    ],
    vulnCode: `// Third-party OAuth token stored long-term, broad scope, no anomaly detection
const token = await oauth.exchangeCodeForToken(code) // scope: repo (full read/write)
db.save('integration_tokens', { orgId, token })`,
    secureCode: `// Narrowly scoped, short-lived tokens with usage-anomaly monitoring
const token = await oauth.exchangeCodeForToken(code, { scope: 'repo:read-metadata' })
vault.storeEncrypted('integration_tokens', { orgId, token, ttl: '24h' })
anomalyDetector.watch(token)`,
    remediation: 'Scope OAuth app permissions to the minimum required, encrypt tokens at rest on the integrating third party\'s side, rotate/expire tokens frequently, and monitor for anomalous API usage patterns tied to any given token.',
    lessons: [
      'A breach of a trusted third-party OAuth integration is functionally a breach of every org that authorized it.',
      'Overly broad OAuth scopes granted to convenience integrations dramatically expand blast radius.'
    ],
    rfcs: ['RFC 6749', 'RFC 8693'],
    relatedResources: [{ title: 'OIDC / OAuth 2.0 Flow Visualizer', path: '/playground/oauth', type: 'playground' }]
  },

  // --- New Breach Profiles (Advanced) ---
  {
    id: 'storm-0558',
    title: 'Microsoft Storm-0558 Signing Key Forgery',
    year: '2023',
    company: 'Microsoft',
    logo: '🔐',
    category: 'Federation & SAML',
    difficulty: 'Advanced',
    attackVector: 'Stolen consumer signing key used to forge Azure AD (Entra ID) enterprise tokens',
    summary: 'A Chinese state-linked actor obtained an inactive Microsoft consumer-signing key through a crash-dump leak and, due to a validation flaw, was able to use it to forge valid Azure AD enterprise access tokens for Outlook Web Access — bypassing tenant boundaries entirely and reading email at government agencies.',
    rootCause: 'A key-scope validation bug allowed a consumer-tier signing key to be accepted as valid for enterprise-tier tokens, collapsing the intended trust boundary between the two key systems.',
    timeline: [
      'A crash dump containing the (deactivated) consumer signing key is inadvertently exposed and later exfiltrated.',
      'Attacker discovers a validation flaw letting the consumer key sign tokens accepted as enterprise-valid.',
      'Attacker forges access tokens for arbitrary enterprise mailboxes via Outlook Web Access.',
      'Attacker reads email at multiple government agencies over an extended period before detection.'
    ],
    vulnCode: `// Token validation does not check which key "tier" issued the signature
function isValidToken(token) {
  return verifySignature(token, anyKnownPublicKey(token.kid))
}`,
    secureCode: `// Token validation enforces the signing key must belong to the expected tier/tenant
function isValidToken(token, expectedTier) {
  const key = getPublicKey(token.kid)
  if (key.tier !== expectedTier) throw new Error('Key/tier mismatch')
  return verifySignature(token, key)
}`,
    remediation: 'Cryptographically separate signing key material and validation logic per trust tier (consumer vs. enterprise), never let crash dumps or diagnostics retain live key material, and require automated key-scope assertions on every token verification.',
    lessons: [
      'A subtle key-scope validation bug can collapse an entire multi-tenant trust boundary at internet scale.',
      'Diagnostic artifacts (crash dumps, telemetry) must be treated as a potential key-leak surface, same as source control.'
    ],
    rfcs: ['RFC 7517', 'RFC 7519'],
    relatedResources: [{ title: 'JWKS Key-Set Inspector', path: '/tools/jwks-inspector', type: 'tool' }]
  },
  {
    id: 'snowflake-credential-stuffing',
    title: 'Snowflake Mass Credential-Stuffing Breach',
    year: '2024',
    company: 'Snowflake (customer tenants)',
    logo: '❄️',
    category: 'Credential & Password Attacks',
    difficulty: 'Advanced',
    attackVector: 'Credential stuffing against customer accounts with no MFA enforced',
    summary: 'Attackers used credentials stolen by infostealer malware against dozens of Snowflake customer tenants that had not enforced MFA on their accounts, exfiltrating massive volumes of customer data from major companies. Snowflake\'s own platform was not "breached" — customer identity hygiene was.',
    rootCause: 'MFA was optional rather than enforced by default, and customer accounts had long-lived static credentials with no network-based access restrictions.',
    timeline: [
      'Infostealer malware harvests plaintext credentials from employee machines at various customer organizations.',
      'Attacker tests the stolen credentials directly against each organization\'s Snowflake account (credential stuffing).',
      'Accounts with no MFA and no IP allow-listing authenticate successfully.',
      'Attacker runs large data-warehouse queries to exfiltrate customer records at scale.'
    ],
    vulnCode: `// MFA optional, no network restriction on data-warehouse accounts
if (await verifyPassword(user, password)) {
  createSession(user) // no MFA check, no IP allow-list check
}`,
    secureCode: `// MFA and network policy enforced by default for every account
if (await verifyPassword(user, password) && await mfa.verify(user) && ipAllowList.contains(req.ip)) {
  createSession(user)
}`,
    remediation: 'Enforce MFA as a platform default (not opt-in) for every account with data access, apply network policies/IP allow-listing for data-warehouse access, and rotate credentials whenever infostealer-harvested credential dumps surface.',
    lessons: [
      'A SaaS platform can be fully secure at the infrastructure level while its customers remain massively exposed through optional-by-default security controls.',
      'Infostealer malware harvesting plaintext browser-saved credentials is now a leading initial-access vector.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Credential Stuffing & Password Spray Defense Lab', path: '/playground/credential-stuffing', type: 'playground' }]
  },
  {
    id: 'moveit-mass-exfil',
    title: 'MOVEit Mass Exfiltration (Cl0p)',
    year: '2023',
    company: 'Progress Software (MOVEit customers)',
    logo: '📤',
    category: 'Cloud & SaaS Misconfiguration',
    difficulty: 'Advanced',
    attackVector: 'SQL injection zero-day in a managed file-transfer application',
    summary: 'The Cl0p ransomware group exploited a SQL injection zero-day in the MOVEit managed file-transfer software to plant web shells and mass-exfiltrate data from hundreds of organizations that used it, without ever needing to steal a single credential.',
    rootCause: 'An unauthenticated SQL injection vulnerability let attackers bypass authentication entirely and directly manipulate the application database to plant a persistent web shell.',
    timeline: [
      'Attacker discovers an unauthenticated SQL injection flaw in the MOVEit web interface.',
      'Attacker uses the injection to create a privileged session/web shell with no valid credentials.',
      'Web shell is used to list and download files stored across every connected customer\'s file-transfer instance.',
      'Attackers extort each affected organization individually using the stolen data.'
    ],
    vulnCode: `// Unsanitized input concatenated directly into SQL
const query = "SELECT * FROM users WHERE username = '" + input + "'"
db.execute(query)`,
    secureCode: `// Parameterized query — input is never concatenated into SQL
const query = 'SELECT * FROM users WHERE username = ?'
db.execute(query, [input])`,
    remediation: 'Use parameterized queries/ORMs everywhere (never string-concatenate untrusted input into SQL), patch internet-facing file-transfer appliances immediately, and treat any managed file-transfer product as a high-value target requiring network segmentation.',
    lessons: [
      'A single unauthenticated injection vulnerability in third-party software can bypass every identity control an organization has built.',
      'Internet-facing file-transfer and integration appliances are consistently among the highest-value targets for mass-exploitation campaigns.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'SCIM Diff & Reconciliation Tool', path: '/tools/scim-diff', type: 'tool' }]
  },
  {
    id: 'notpetya-golden-ticket',
    title: 'NotPetya Golden Ticket Lateral Movement',
    year: '2017',
    company: 'Maersk (and many others)',
    logo: '🚢',
    category: 'Directory & Kerberos',
    difficulty: 'Advanced',
    attackVector: 'Stolen krbtgt account hash used to forge unlimited Kerberos tickets (Golden Ticket)',
    summary: 'The NotPetya wiper, disguised as ransomware, used stolen domain-admin credentials and a Golden Ticket forged from the krbtgt account hash to move laterally across Active Directory domains at wire speed, ultimately destroying Maersk\'s global IT infrastructure and costing an estimated $10 billion worldwide.',
    rootCause: 'Domain controllers were reachable from standard workstations with no tiered administration model, and the krbtgt account hash — once obtained — grants effectively unlimited forged-ticket authority with no expiry enforcement.',
    timeline: [
      'Initial access gained via a trojanized tax-software update (M.E.Doc) in Ukraine.',
      'Malware harvests credentials in memory and escalates to domain-admin privileges.',
      'Attacker extracts the krbtgt account hash from a domain controller.',
      'Golden Ticket forged from the krbtgt hash grants forged Kerberos TGTs for any user, any privilege, without touching the KDC\'s live account store.',
      'Malware propagates virally across every reachable machine on the network, wiping data as it goes.'
    ],
    vulnCode: `// Flat network: any workstation can reach domain controllers directly
// No tiered admin model — a compromised workstation credential is a domain-admin credential
psexec \\\\DC01 -u domain\\admin -p stolen_password cmd.exe`,
    secureCode: `// Tiered administration: DC access restricted to hardened admin tier (PAW)
// krbtgt rotated on a schedule; DA credentials never used on standard workstations
Enable-ADAdminTierIsolation -Tier0Only $true
Reset-KrbtgtAccountPassword -Schedule 'Every90Days'`,
    remediation: 'Implement a tiered administration model (Microsoft ESAE/PAW-style) so domain-admin credentials are never exposed on standard workstations, rotate the krbtgt account password on a fixed schedule, and segment networks so lateral movement cannot reach domain controllers at will.',
    lessons: [
      'A flat, unsegmented Active Directory network turns any single compromised workstation into a path to full domain compromise.',
      'A Golden Ticket forged from krbtgt grants attacker persistence that survives ordinary password resets — only a krbtgt reset (twice) actually revokes it.'
    ],
    rfcs: ['RFC 4120'],
    relatedResources: [{ title: 'Active Directory Kerberos Lab', path: '/playground/kerberos', type: 'playground' }]
  },
  {
    id: 'change-healthcare-no-mfa',
    title: 'Change Healthcare Ransomware via No-MFA Citrix',
    year: '2024',
    company: 'Change Healthcare (UnitedHealth)',
    logo: '🏥',
    category: 'MFA & Push Bombing',
    difficulty: 'Advanced',
    attackVector: 'Compromised credentials on a Citrix remote-access portal with no MFA enabled',
    summary: 'Attackers gained initial access to Change Healthcare\'s network through a Citrix remote-access portal that had compromised credentials but no multi-factor authentication enabled, deploying ransomware that disrupted prescription processing and payments across the US healthcare system for weeks.',
    rootCause: 'A single internet-facing remote-access portal was exempted from the organization\'s MFA policy, and that exemption alone provided the entire initial-access foothold.',
    timeline: [
      'Attacker obtains valid but unprotected credentials for a Citrix remote-access portal (source unclear — likely prior credential leak or infostealer).',
      'Portal has no MFA enforced, so the stolen password alone is sufficient to log in.',
      'Attacker establishes persistence and moves laterally across the network over roughly nine days before deploying ransomware.',
      'Ransomware deployment disrupts prescription and claims processing nationwide for weeks.'
    ],
    vulnCode: `// Remote access portal exempted from org-wide MFA policy
const mfaRequired = portal.name !== 'legacy-citrix-portal' // exemption!
if (!mfaRequired || await mfa.verify(user)) createSession(user)`,
    secureCode: `// No exemptions — MFA required for every remote-access surface
if (await verifyPassword(user, password) && await mfa.verify(user)) {
  createSession(user)
}`,
    remediation: 'Enforce MFA on every remote-access surface with zero exceptions, treat any policy "exemption" as a standing audit finding requiring remediation, and monitor for anomalous authentication + lateral movement patterns even after a successful login.',
    lessons: [
      'A single unprotected remote-access exception can undo an otherwise mature security program.',
      'Dwell time between initial access and ransomware deployment (often days to weeks) is a real detection window if monitored.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'Conditional Access Policy Simulator', path: '/playground/conditional-access', type: 'playground' }]
  },
  {
    id: 'lapsus-mfa-sim-swap',
    title: 'LAPSUS$ MFA-Fatigue & SIM-Swap Chain',
    year: '2022',
    company: 'Multiple (Microsoft, Okta, Uber, Nvidia)',
    logo: '💥',
    category: 'MFA & Push Bombing',
    difficulty: 'Advanced',
    attackVector: 'SIM-swapping plus MFA-fatigue bombing to seize accounts of privileged employees and contractors',
    summary: 'The LAPSUS$ group ran a highly effective playbook: buy or coerce access to a target\'s phone number via SIM-swapping (or simply buy stolen credentials), then bombard the victim with MFA push notifications until they approved one, breaching Microsoft, Okta, Uber, Nvidia and others in a single quarter.',
    rootCause: 'Phone-number-based recovery/verification and simple push-approval MFA were both trusted as strong factors despite being remotely subvertible without any device compromise.',
    timeline: [
      'Attacker socially engineers a mobile carrier (or bribes an insider) to port the victim\'s phone number to an attacker-controlled SIM.',
      'Attacker uses the hijacked phone number to intercept SMS OTPs or reset account recovery flows.',
      'For push-based MFA, attacker instead spams approval requests until the victim taps "Approve".',
      'Attacker pivots from the initial compromised account into a contractor/support portal with far broader downstream access.'
    ],
    vulnCode: `// SMS OTP and simple push are both trusted as sufficient MFA
if (await sms.verifyOtp(phoneNumber, code) || await push.wasApproved(pushId)) {
  createSession(user)
}`,
    secureCode: `// Phishing-resistant, device-bound factor required for privileged accounts
const assertion = await navigator.credentials.get({ publicKey: challengeOptions })
if (await verifyWebAuthnAssertion(assertion, expectedOrigin)) {
  createSession(user)
}`,
    remediation: 'Move privileged and contractor accounts to phishing-resistant, device-bound authenticators (FIDO2/WebAuthn) that cannot be subverted by a SIM swap or a fatigued approval tap, and require number-matching at minimum wherever passkeys are not yet deployed.',
    lessons: [
      'SMS-based recovery and verification are trivially subverted by SIM-swapping social engineering against telecom carriers.',
      'A group with no custom malware at all breached multiple Fortune 500 companies purely through identity-layer social engineering.'
    ],
    rfcs: ['RFC 9700'],
    relatedResources: [{ title: 'AI Voice Deepfake & MFA Threat Lab', path: '/playground/ai-threat-lab', type: 'playground' }]
  },
  {
    id: 'scattered-spider-helpdesk',
    title: 'Scattered Spider Help-Desk MFA Reset',
    year: '2023',
    company: 'MGM Resorts / Caesars Entertainment',
    logo: '🎰',
    category: 'Social Engineering & Help Desk',
    difficulty: 'Advanced',
    attackVector: 'Impersonating an employee to a help desk to trigger an MFA/password reset',
    summary: 'The Scattered Spider group called corporate IT help desks impersonating employees (using information gathered from LinkedIn and prior breaches), convincing agents to reset MFA enrollment and passwords — no phishing, no malware, just a phone call — leading to ransomware deployment at MGM Resorts that reportedly cost over $100 million.',
    rootCause: 'Help-desk identity-verification procedures relied on easily-guessed or easily-researched knowledge-based facts (employee ID, manager\'s name) rather than a hardware-bound or out-of-band verification step.',
    timeline: [
      'Attacker researches an employee\'s identity details from LinkedIn, prior breach dumps, and public records.',
      'Attacker calls the corporate IT help desk impersonating that employee, citing a "lost phone" to justify an MFA re-enrollment.',
      'Help-desk agent, following a weak identity-verification checklist, resets MFA and issues a new enrollment to the attacker.',
      'Attacker now controls a valid MFA factor for the impersonated account and escalates to domain-admin, then deploys ransomware.'
    ],
    vulnCode: `// Help desk resets MFA based on easily-researched knowledge factors
function resetMfa(employeeId, managerName, dob) {
  if (matchesHrRecord(employeeId, managerName, dob)) {
    return mfa.enrollNewDevice(employeeId) // trivially researchable data
  }
}`,
    secureCode: `// Reset requires an out-of-band verification via a channel the attacker cannot control
function resetMfa(employeeId, videoVerificationToken) {
  if (identityTeam.verifiedViaVideoCall(employeeId, videoVerificationToken)) {
    return mfa.enrollNewDeviceWithApproval(employeeId, requireManagerSignoff: true)
  }
}`,
    remediation: 'Require live video or manager-signoff verification (not knowledge-based facts alone) for any help-desk-initiated MFA or password reset, and route sensitive identity-recovery requests to a dedicated, trained identity-verification team rather than a general help desk.',
    lessons: [
      'Help-desk social engineering bypasses every technical MFA control by attacking the human reset process itself.',
      'Knowledge-based identity verification (employee ID, manager name, DOB) is not a secret — most of it is researchable or previously breached.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'IAM Design Review Assistant', path: '/design-review', type: 'references' }]
  },
  {
    id: 'okta-sitel-subprocessor',
    title: 'Okta 2022 Sitel Subprocessor Breach',
    year: '2022',
    company: 'Okta (via Sitel/Sykes subprocessor)',
    logo: '🧩',
    category: 'Supply Chain',
    difficulty: 'Advanced',
    attackVector: 'Compromised third-party support subprocessor with privileged access to Okta customer tenants',
    summary: 'Attackers compromised a support engineer\'s laptop at Sitel, a third-party subprocessor Okta used for customer support, gaining a window of access to internal tools that could reset passwords and MFA factors for a subset of Okta customer accounts — without ever touching Okta\'s own core infrastructure.',
    rootCause: 'A third-party subprocessor was granted standing, broad access to sensitive account-recovery tools with insufficient session isolation, monitoring, or time-boxing from the primary vendor.',
    timeline: [
      'Attacker compromises a support engineer\'s workstation at Sitel via remote-access trojan.',
      'Compromised session has standing access to Okta\'s internal support tooling used for password/MFA resets.',
      'Attacker has a roughly 25-minute window of potential access before the session is detected/terminated.',
      'Okta discloses the incident and coordinates subprocessor access reviews with affected customers.'
    ],
    vulnCode: `// Subprocessor session has standing, always-on access to reset tooling
if (subprocessorSession.isAuthenticated()) {
  supportTool.grantAccess('password_mfa_reset_console')
}`,
    secureCode: `// Just-in-time, time-boxed, monitored access for subprocessor sessions
if (subprocessorSession.isAuthenticated() && await jitApproval.granted(subprocessorSession)) {
  supportTool.grantAccess('password_mfa_reset_console', { expiresIn: '15m', recorded: true })
}`,
    remediation: 'Grant third-party subprocessors just-in-time, time-boxed, and fully session-recorded access to any sensitive support tooling rather than standing access, and require the same identity hardening (phishing-resistant MFA, device posture checks) on subprocessor workstations as on internal ones.',
    lessons: [
      'Vendor risk extends through every subprocessor with privileged tooling access — the weakest link may not be the primary vendor at all.',
      'Just-in-time access with session recording dramatically shrinks the blast radius of any single compromised support session.'
    ],
    rfcs: [],
    relatedResources: [{ title: 'PAM Vaulting & Just-in-Time Elevation Lab', path: '/playground/pam-vaulting', type: 'playground' }]
  },
  {
    id: 'kerberoasting-dcsync',
    title: 'Kerberoasting & DCSync Active Directory Attacks',
    year: 'Ongoing',
    company: 'Generic Technique (widely observed in ransomware intrusions)',
    logo: '🎫',
    category: 'Directory & Kerberos',
    difficulty: 'Advanced',
    attackVector: 'Offline cracking of service-account Kerberos tickets, followed by domain-controller replication abuse',
    summary: 'Kerberoasting lets any authenticated domain user request a service ticket for any service account and crack its password offline, since service tickets are encrypted with the service account\'s own password hash. Combined with DCSync — abusing directory-replication permissions to pull every password hash straight from a domain controller — this pairing is one of the most common privilege-escalation chains in modern ransomware intrusions.',
    rootCause: 'Service accounts are routinely configured with weak, never-rotated passwords, and directory-replication permissions (needed legitimately only by domain controllers) are often granted more broadly than necessary.',
    timeline: [
      'Attacker with any authenticated domain user account requests service tickets (TGS) for every registered SPN (service account) in the domain.',
      'Tickets are encrypted with each service account\'s password hash — attacker cracks them offline with no logging/lockout exposure.',
      'A weak service-account password is recovered, often already carrying excessive privileges.',
      'Attacker separately abuses over-granted replication rights to run a DCSync request, pulling every domain password hash directly from a domain controller.'
    ],
    vulnCode: `// Service account with a weak, never-rotated password and broad replication rights
Set-ADServiceAccount -Identity svc_backup -PasswordNeverExpires $true
# svc_backup also granted Replicating Directory Changes (used for DCSync)`,
    secureCode: `// Managed service accounts (auto-rotated, unguessable passwords), replication rights restricted
New-ADServiceAccount -Name svc_backup -RestrictToSingleComputer
Remove-ADPermission -Identity svc_backup -ExtendedRight 'Replicating Directory Changes'`,
    remediation: 'Use Group Managed Service Accounts (gMSA) with automatically rotated, cryptographically random passwords instead of static service-account passwords, and audit/restrict "Replicating Directory Changes" permissions to only the domain controllers that legitimately need them.',
    lessons: [
      'Service accounts are a routinely under-protected identity class, since they never log in interactively and are easy to forget in password-hygiene programs.',
      'Kerberoasting requires zero elevated privileges to begin — any standard domain user can request a service ticket.'
    ],
    rfcs: ['RFC 4120'],
    relatedResources: [{ title: 'Active Directory GPO Simulator', path: '/playground/gpo-simulator', type: 'playground' }]
  },
  {
    id: 'pass-the-hash-lateral-movement',
    title: 'Pass-the-Hash Lateral Movement',
    year: 'Ongoing',
    company: 'Generic Technique (classic Windows/AD lateral movement)',
    logo: '🔁',
    category: 'Directory & Kerberos',
    difficulty: 'Intermediate',
    attackVector: 'Reusing a captured NTLM password hash directly for authentication, without ever cracking it',
    summary: 'Windows NTLM authentication can be completed using the password\'s hash directly — the hash itself is a valid credential. An attacker who dumps a local machine\'s credential store (e.g. via Mimikatz) can "pass the hash" to authenticate as that user on other machines across the network, without ever needing the plaintext password.',
    rootCause: 'NTLM authentication accepts the hash itself as proof of knowledge of the password, and local administrator/service-account hashes are frequently reused identically across many machines.',
    timeline: [
      'Attacker compromises one workstation and dumps credentials from memory/registry (e.g. via Mimikatz).',
      'Attacker extracts an NTLM hash for a privileged local or domain account.',
      'Because NTLM accepts the hash as valid proof, the attacker authenticates to other machines using the hash directly.',
      'If the same local admin hash is reused across the fleet, the attacker moves laterally to every machine sharing it.'
    ],
    vulnCode: `// NTLM accepts the raw hash as valid authentication material
function ntlmAuthenticate(username, ntlmHash) {
  return storedHash(username) === ntlmHash // hash reuse = instant lateral movement
}`,
    secureCode: `// Kerberos-only auth + unique-per-machine local admin passwords (LAPS) + credential guard
Enable-CredentialGuard
Enable-LAPS -RandomizePerDevice $true
Disable-NtlmFallback`,
    remediation: 'Deploy Local Administrator Password Solution (LAPS) so every machine has a unique, rotated local admin password, enable Windows Credential Guard to prevent hash extraction from memory, and disable NTLM fallback in favor of Kerberos wherever possible.',
    lessons: [
      'Password hashes are bearer credentials under NTLM — capturing one is functionally equivalent to capturing the plaintext password.',
      'Identical local administrator passwords across a fleet turn a single compromised endpoint into a network-wide breach.'
    ],
    rfcs: ['RFC 4120'],
    relatedResources: [{ title: 'Active Directory Kerberos Lab', path: '/playground/kerberos', type: 'playground' }]
  }
]
