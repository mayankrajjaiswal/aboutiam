export type BulletinSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
export type BulletinDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export const BULLETIN_CATEGORIES = [
  'Credential & Session Theft',
  'MFA & Push Fatigue',
  'Federation & SSO Exploits',
  'OAuth & Token Abuse',
  'Cloud IAM Misconfiguration',
  'Directory & Kerberos Attacks',
  'Supply Chain & Provisioning'
] as const

export type BulletinCategory = typeof BULLETIN_CATEGORIES[number]

export const CONTROL_TITLES: Record<string, string> = {
  soc2_1: 'SOC 2 CC6.1: Automated Directory Provisioning',
  soc2_2: 'SOC 2 CC6.2: Phishing-Proof MFA',
  soc2_3: 'SOC 2 CC6.3: JIT Role Elevation',
  soc2_4: 'SOC 2 CC6.8: API Gateway Authorization',
  iso_1: 'ISO 27001 A.5.15: Access Rights Lifecycle',
  iso_2: 'ISO 27001 A.5.16: Secure Identity & Secrets Mgmt',
  iso_3: 'ISO 27001 A.5.17: Privileged Session Monitoring',
  iso_4: 'ISO 27001 A.5.18: Dynamic Group Re-evaluation',
  pci_1: 'PCI-DSS Req 7: Need-to-Know Access',
  pci_2: 'PCI-DSS Req 8.3: MFA Into the CDE',
  pci_3: 'PCI-DSS Req 8.6: Unique Service Account Auth',
  pci_4: 'PCI-DSS Req 10.2: Cardholder Data Audit Trails',
}

export interface BulletinSimulator {
  step1Log: string
  step2Log: string
  containmentHighLog: string
  containmentLowLog: string
}

export interface Bulletin {
  id: string
  title: string
  date: string
  severity: BulletinSeverity
  difficulty: BulletinDifficulty
  category: BulletinCategory
  vector: string
  description: string
  playbookSteps: string[]
  remediationSnippet: string
  snippetLanguage: string
  controlsMapped: string[]
  simulator: BulletinSimulator
}

export const BULLETINS: Bulletin[] = [
  // ───────────────────────── Beginner ─────────────────────────
  {
    id: 'mfa_fatigue',
    title: 'MFA Fatigue Push-Bombing Handovers',
    date: '2022 - 2023',
    severity: 'High',
    difficulty: 'Beginner',
    category: 'MFA & Push Fatigue',
    vector: 'MFA Push Notification Exhaustion Hacking',
    description: 'Attackers harvested valid username/password credentials. They repeatedly triggered Microsoft Authenticator or Okta Verify push approvals (hundreds of notifications) during late-night hours until the distracted, fatigued employee clicked "Approve" simply to stop the notifications.',
    playbookSteps: [
      'Disable standard basic "Approve/Deny" push notification setups globally.',
      'Enable Context-Aware Number Matching, forcing the user to type digits shown on the login screen.',
      'Enable location-aware push notification displays, showing the login request IP and location map on the device.',
      'Enforce alert thresholds to block or lock accounts when more than 5 MFA notifications trigger in 1 minute.'
    ],
    remediationSnippet: `{\n  "MfaFatigueLockout": {\n    "MaxPushRequestsPerMinute": 5,\n    "LockoutDurationMinutes": 15,\n    "TriggerAction": "LOCK_ACCOUNT"\n  }\n}`,
    snippetLanguage: 'JSON Config',
    controlsMapped: ['soc2_2'],
    simulator: {
      step1Log: 'SIEM Log: Administrative user triggered 15 push notifications in 2 minutes before successful approval.',
      step2Log: 'Incident Detail: User confirmed they approved the push request after receiving consecutive notification popups simply to stop the device buzzings.',
      containmentHighLog: 'Action: Enforcing Context-Aware Number Matching, location-aware notifications, and lockouts after 5 consecutive push failures.\n✓ Containment Successful! Attackers can no longer trigger basic push fatigue. Phishing-proof bounds successfully armed.',
      containmentLowLog: 'Action: Sending corporate security awareness training emails to employees.\n❌ Containment Failed! Simple push exhaustion hacks are still structurally possible.'
    }
  },
  {
    id: 'snowflake_breach',
    title: 'Snowflake Customer Tenant Credential Stuffing (UNC5537)',
    date: 'May 2024',
    severity: 'Critical',
    difficulty: 'Beginner',
    category: 'Credential & Session Theft',
    vector: 'Credential Stuffing Against MFA-less Customer Accounts',
    description: 'Threat actor UNC5537 used credentials previously harvested by infostealer malware — unrelated to any Snowflake platform vulnerability — to log into customer Snowflake accounts that had neither MFA nor network allow-listing enabled. This affected multiple named customers, including Ticketmaster and Advance Auto Parts, among others widely reported. The Snowflake platform itself was never compromised; every impacted tenant had left MFA disabled on the customer side.',
    playbookSteps: [
      'Mandate MFA enforcement on every customer/tenant account accessing the SaaS platform, not just administrative logins.',
      'Enable network policy allow-listing to restrict data warehouse access to known corporate IP ranges.',
      'Screen for credentials appearing in infostealer dumps and force rotation before attackers can reuse them.',
      'Remember: in a shared-responsibility SaaS/cloud-provider model, tenant-side authentication hardening is the customer\'s responsibility, not the vendor\'s.'
    ],
    remediationSnippet: `-- Snowflake: Enforce MFA and restrict access via network policy\nALTER USER target_user SET MINS_TO_BYPASS_MFA = 0;\nCREATE NETWORK POLICY corp_allowlist ALLOWED_IP_LIST = ('203.0.113.0/24');\nALTER ACCOUNT SET NETWORK_POLICY = corp_allowlist;`,
    snippetLanguage: 'SQL',
    controlsMapped: ['soc2_2', 'pci_1'],
    simulator: {
      step1Log: 'SIEM Log: Customer tenant account "svc-integration@customer.com" authenticated successfully from an unrecognized IP with zero MFA challenges.',
      step2Log: 'Incident Detail: Credential matches a batch harvested by infostealer malware months earlier. Account had no MFA enrolled and no network policy allow-list configured.',
      containmentHighLog: 'Action: Enforcing tenant-wide MFA and network policy allow-listing; forcing rotation of every credential matched against known infostealer dumps.\n✓ Containment Successful! Stuffed credentials are worthless without the second factor, and the account is unreachable outside the allow-listed range.',
      containmentLowLog: 'Action: Filing a support ticket asking the platform vendor to investigate their infrastructure for a breach.\n❌ Containment Failed! The platform was never compromised — the vulnerable surface is entirely tenant-side and remains wide open.'
    }
  },
  {
    id: 'weak_password_reuse',
    title: 'Credential-Stuffing via Password Reuse',
    date: '2019 - Present',
    severity: 'High',
    difficulty: 'Beginner',
    category: 'Credential & Session Theft',
    vector: 'Automated Login Replay of Leaked Credential Pairs',
    description: 'Attackers replay username/password pairs harvested from unrelated third-party data breaches against corporate login pages, relying on the well-documented fact that most users reuse the same password across multiple services. Low-and-slow automated bots rotate IP addresses and user agents to evade basic rate-limiting.',
    playbookSteps: [
      'Screen every new and existing password against a breached-password corpus (e.g. Have I Been Pwned k-Anonymity API) at signup and login time.',
      'Enforce mandatory MFA enrollment for all accounts, removing password-only authentication entirely.',
      'Deploy adaptive rate-limiting and CAPTCHA challenges after repeated failed login attempts from a single IP or device fingerprint.',
      'Monitor for distributed low-volume login attempts across many source IPs — a signature of credential-stuffing botnets.'
    ],
    remediationSnippet: `// Node.js: reject passwords found in a breached-password corpus\nasync function checkPwned(password) {\n  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();\n  const prefix = sha1.slice(0, 5), suffix = sha1.slice(5);\n  const res = await fetch(\`https://api.pwnedpasswords.com/range/\${prefix}\`);\n  const body = await res.text();\n  return body.split('\\n').some(line => line.startsWith(suffix));\n}`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['soc2_2', 'pci_2'],
    simulator: {
      step1Log: 'SIEM Log: 4,300 login attempts across 900 distinct customer accounts in 10 minutes, sourced from a rotating residential proxy pool.',
      step2Log: 'Incident Detail: 61 of the attempted credential pairs matched active accounts exactly — all previously appeared in an unrelated third-party breach corpus 8 months earlier.',
      containmentHighLog: 'Action: Force-resetting the 61 matched accounts, enrolling them into mandatory MFA, and screening the entire user base against the breached-password corpus going forward.\n✓ Containment Successful! Reused credentials are neutralized and future signups are screened before acceptance.',
      containmentLowLog: 'Action: Temporarily blocking the single most active source IP address.\n❌ Containment Failed! The botnet simply rotates to the next IP in its residential proxy pool; the 61 compromised accounts remain wide open.'
    }
  },
  {
    id: 'phishing_session_cookie',
    title: 'Adversary-in-the-Middle Session Cookie Phishing',
    date: '2023 - Present',
    severity: 'High',
    difficulty: 'Beginner',
    category: 'Credential & Session Theft',
    vector: 'Reverse-Proxy Phishing Kit (AiTM) Cookie Capture',
    description: 'An employee clicks a phishing link pointing to a reverse-proxy phishing kit (e.g. Evilginx-style) that transparently relays the real login page while capturing the session cookie issued after a successful login — including a completed MFA challenge — since the proxy sits directly in the middle of the legitimate flow.',
    playbookSteps: [
      'Move high-value applications to phishing-resistant WebAuthn/FIDO2 passkeys, which cryptographically bind to the origin and cannot be relayed by a proxy.',
      'Bind sessions to the originating device using Token Binding or DPoP so a stolen cookie is rejected if replayed from a different client.',
      'Deploy browser-based anti-phishing extensions and DNS-layer filtering to block known AiTM phishing kit domains before the page loads.',
      'Train staff to verify the browser address bar domain matches the expected corporate SSO domain exactly before entering credentials.'
    ],
    remediationSnippet: `// Bind a session token to the client's DPoP proof-of-possession key\nfunction validateDpopBoundSession(req) {\n  const proof = req.headers['dpop'];\n  const expectedJkt = req.session.cnf.jkt; // bound at issuance time\n  if (!proof || computeJkt(proof) !== expectedJkt) {\n    throw new Error('Session token replay rejected: DPoP key mismatch');\n  }\n}`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['soc2_2', 'iso_3'],
    simulator: {
      step1Log: 'SIEM Log: User "j.doe@company.com" completed login and MFA challenge from a new device fingerprint immediately followed by a second session using the identical cookie from a different IP.',
      step2Log: 'Incident Detail: Browser telemetry confirms the user\'s original request was relayed through an unregistered proxy domain resembling the corporate SSO portal.',
      containmentHighLog: 'Action: Revoking the stolen session cookie, forcing re-authentication via a phishing-resistant WebAuthn passkey, and blocklisting the phishing kit domain.\n✓ Containment Successful! The relayed cookie is invalidated and future logins can no longer be captured by the proxy.',
      containmentLowLog: 'Action: Asking the employee to simply change their password.\n❌ Containment Failed! The stolen session cookie remains valid and does not require the password to be reused.'
    }
  },
  {
    id: 'public_s3_iam_keys',
    title: 'Public Cloud Storage Bucket Leaking IAM Access Keys',
    date: '2021 - Present',
    severity: 'Critical',
    difficulty: 'Beginner',
    category: 'Cloud IAM Misconfiguration',
    vector: 'Misconfigured Public Object Storage Exposing Long-Lived Credentials',
    description: 'A developer commits a configuration file or environment dump containing long-lived cloud IAM access keys into a storage bucket that is misconfigured for public read access, or the bucket ACL itself is left open to "Authenticated Users" / "Everyone". Automated internet-wide scanners discover the exposed keys within minutes and use them to enumerate and access other cloud resources.',
    playbookSteps: [
      'Immediately deactivate and rotate any IAM access keys found in a publicly accessible object.',
      'Enable bucket-level "Block Public Access" settings by default across the entire cloud account, not per-bucket.',
      'Replace long-lived static access keys with short-lived, automatically rotated credentials (IAM roles, workload identity federation) wherever possible.',
      'Run continuous secret-scanning against both source repositories and cloud storage to catch future leaks before a scanner does.'
    ],
    remediationSnippet: `# AWS CLI: enforce account-wide public access block and deactivate a leaked key\naws s3control put-public-access-block \\\n  --account-id 123456789012 \\\n  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true\n\naws iam update-access-key --access-key-id AKIAEXAMPLE1234 --status Inactive --user-name leaked-svc-user`,
    snippetLanguage: 'Bash',
    controlsMapped: ['iso_2', 'pci_1'],
    simulator: {
      step1Log: 'SIEM Log: CloudTrail shows API calls from access key "AKIAEXAMPLE1234" originating from an unrecognized ASN never seen for this account before.',
      step2Log: 'Incident Detail: The access key was found embedded in a ".env.backup" file inside a storage bucket with public read ACLs, indexed by an internet-wide bucket scanner within 12 minutes of upload.',
      containmentHighLog: 'Action: Deactivating the leaked access key, enabling account-wide Block Public Access, and migrating the workload to short-lived federated credentials.\n✓ Containment Successful! The exposed static key is dead and future workloads can no longer mint long-lived, exfiltratable secrets.',
      containmentLowLog: 'Action: Deleting the single leaked file from the bucket.\n❌ Containment Failed! The access key itself is still active and the bucket remains publicly readable for the next secret that lands in it.'
    }
  },
  {
    id: 'default_admin_credentials',
    title: 'Default Administrator Credentials on an Exposed IdP Appliance',
    date: 'Ongoing',
    severity: 'Critical',
    difficulty: 'Beginner',
    category: 'Directory & Kerberos Attacks',
    vector: 'Unchanged Vendor-Default Administrative Login',
    description: 'A newly deployed on-premise identity appliance (LDAP gateway, SSO reverse proxy, VPN concentrator with directory integration) is exposed to the internet for remote administration convenience, but the vendor-supplied default administrator username and password were never changed during setup. Attackers use publicly documented default credential lists to gain immediate administrative control.',
    playbookSteps: [
      'Change every default administrative credential immediately during initial appliance provisioning, before the device is ever network-attached.',
      'Remove direct internet exposure of administrative management interfaces; require VPN or bastion-host access instead.',
      'Run periodic default-credential and known-CVE scans against all identity infrastructure appliances.',
      'Enforce a hardening checklist as a mandatory, signed-off gate before any identity appliance goes into production.'
    ],
    remediationSnippet: `# Shodan-style exposure check followed by forced credential rotation\ncurl -s -o /dev/null -w "%{http_code}" https://idp-appliance.internal:8443/admin\n\n# Then, on the appliance itself:\npasswd admin   # force a new, unique, vaulted administrative password\nufw deny 8443/tcp from any to any   # block the admin interface from the public internet`,
    snippetLanguage: 'Bash',
    controlsMapped: ['iso_1', 'iso_3'],
    simulator: {
      step1Log: 'SIEM Log: Successful administrative login to the SSO reverse-proxy appliance from an external IP address using the account "admin".',
      step2Log: 'Incident Detail: The appliance\'s administrative password matches the vendor\'s publicly documented factory-default credential, and the management port is directly internet-facing.',
      containmentHighLog: 'Action: Rotating the administrative credential to a unique, vaulted password, and firewalling the management interface off from the public internet.\n✓ Containment Successful! The default-credential attack path is permanently closed and administration now requires internal network access.',
      containmentLowLog: 'Action: Restarting the appliance and hoping the attacker\'s session is gone.\n❌ Containment Failed! The credential itself was never changed — the attacker can simply log back in.'
    }
  },

  // ───────────────────────── Intermediate ─────────────────────────
  {
    id: 'okta_support',
    title: 'Okta Support Portal HAR File Hijack',
    date: 'October 2023',
    severity: 'Critical',
    difficulty: 'Intermediate',
    category: 'Credential & Session Theft',
    vector: 'Session Token Theft via HTTP Archive (HAR) Files',
    description: 'Attackers compromised Okta\'s third-party customer support portal using stolen credentials. They downloaded custom HAR files uploaded by customer administrators, extracted active session cookies (tokens) from the raw network logs, and hijacked global administrator sessions, bypassing MFA restrictions completely.',
    playbookSteps: [
      'Sanitize and scrub all HTTP Archive (HAR) files before uploading them to external support teams.',
      'Enforce strict administrative session IP binding constraints to block reused tokens from anomalous locations.',
      'Transition administrative single-sign-on (SSO) portals to mandate phishing-resistant WebAuthn Passkeys.',
      'Enforce short admin-session timeouts and audit all support bypass configuration changes.'
    ],
    remediationSnippet: `// Node.js Express Session IP Binding check\napp.use((req, res, next) => {\n  if (req.session.userId) {\n    if (req.session.ipAddress !== req.ip) {\n      req.session.destroy(); // Terminate session immediately on IP swap\n      return res.status(401).send("Unauthorized: IP Mismatch");\n    }\n  }\n  next();\n});`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['soc2_2', 'iso_3'],
    simulator: {
      step1Log: 'SIEM Log: User "admin@company.com" logged in from anomalous IP: 203.0.113.88. No MFA challenge prompted during session init!',
      step2Log: 'Incident Detail: Cookie extraction trace confirmed. Attacker repurposed global admin session cookie. Stolen cookie is bound to an active support ticket HAR attachment!',
      containmentHighLog: 'Action: Instantly terminating all global administrative session cookies, and enabling strict Administrative IP binding checks.\n✓ Containment Successful! Attacker\'s stolen session cookie was immediately revoked and rendered useless on subsequent hops.',
      containmentLowLog: 'Action: Informing support team to close the ticket and delete the HAR attachment.\n❌ Containment Failed! Attacker still holds active cookie session bounds on administrative resources.'
    }
  },
  {
    id: 'illicit_consent_grant',
    title: 'Illicit OAuth Consent Grant Phishing',
    date: '2019 - Present',
    severity: 'High',
    difficulty: 'Intermediate',
    category: 'OAuth & Token Abuse',
    vector: 'Malicious OAuth Application Consent Screen Abuse',
    description: 'Attackers register a malicious OAuth application impersonating a legitimate productivity tool and phish users into granting it broad delegated permissions (mail read, file access, offline access) via the standard consent screen. Because the user approves the grant themselves, no password or MFA is ever bypassed — the attacker instead gains a long-lived refresh token with legitimate API access.',
    playbookSteps: [
      'Restrict end-user consent so only administrator-vetted, verified-publisher applications can request high-risk scopes (mail, files, offline_access).',
      'Deploy continuous OAuth application governance to review, risk-score, and revoke suspicious third-party app grants.',
      'Alert on newly registered applications requesting broad delegated scopes immediately after publication.',
      'Educate users that a consent screen requesting "read all mail" or "access all files" from an unfamiliar publisher is a red flag, not a routine permission.'
    ],
    remediationSnippet: `// Azure AD / Entra: restrict user consent to verified publishers only\naz ad app permission admin-consent-policy update \\\n  --user-consent-for-apps "AllowForVerifiedPublishers" \\\n  --risk-based-consent enabled`,
    snippetLanguage: 'Bash',
    controlsMapped: ['soc2_4', 'iso_2'],
    simulator: {
      step1Log: 'SIEM Log: New OAuth application "Quick-Doc-Viewer" granted Mail.Read and Files.ReadWrite.All delegated scopes by 14 users within one hour of registration.',
      step2Log: 'Incident Detail: The application\'s publisher domain was registered 3 days ago and is not a Microsoft-verified publisher; the granted refresh tokens remain valid indefinitely.',
      containmentHighLog: 'Action: Revoking all OAuth grants and refresh tokens for the malicious application, and restricting future user consent to verified publishers only.\n✓ Containment Successful! The rogue application\'s access is severed and future consent-phishing attempts are blocked at the policy layer.',
      containmentLowLog: 'Action: Sending the 14 affected users an email asking them to review their app permissions themselves.\n❌ Containment Failed! The malicious application\'s refresh tokens remain valid and continue harvesting mail and files in the background.'
    }
  },
  {
    id: 'saml_metadata_tampering',
    title: 'SAML Identity Provider Metadata Tampering',
    date: '2020 - Present',
    severity: 'High',
    difficulty: 'Intermediate',
    category: 'Federation & SSO Exploits',
    vector: 'Unauthenticated or Weakly-Protected IdP Metadata Endpoint Modification',
    description: 'An attacker gains write access to a Service Provider\'s stored IdP metadata (via a compromised admin console, an exposed configuration API, or a supply-chain update) and swaps in their own signing certificate and entity ID. Because the SP now trusts assertions signed by the attacker\'s certificate, any subsequently forged SAML assertion is accepted as fully authenticated.',
    playbookSteps: [
      'Fetch and refresh IdP metadata only over authenticated, integrity-checked channels — never accept metadata updates from unauthenticated endpoints.',
      'Pin the expected IdP entity ID and certificate fingerprint, alerting on any change rather than silently trusting metadata refreshes.',
      'Restrict who can modify SSO/SAML configuration in the Service Provider admin console with strict RBAC and change-approval workflows.',
      'Log and alert on every SAML metadata or trusted-certificate configuration change as a high-severity security event.'
    ],
    remediationSnippet: `// Pin the expected IdP certificate fingerprint and reject silent metadata swaps\nfunction verifyIdpMetadata(newCert) {\n  const EXPECTED_FINGERPRINT = 'SHA256:AB:CD:EF:...';\n  if (sha256Fingerprint(newCert) !== EXPECTED_FINGERPRINT) {\n    throw new Error('SAML IdP certificate fingerprint mismatch — metadata tampering suspected');\n  }\n}`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['iso_1', 'soc2_1'],
    simulator: {
      step1Log: 'SIEM Log: SP-side SAML configuration API recorded an unattended metadata update at 02:14 AM outside the normal change-management window.',
      step2Log: 'Incident Detail: The updated metadata\'s signing certificate fingerprint does not match the pinned, previously trusted IdP certificate — a silent trust-anchor swap.',
      containmentHighLog: 'Action: Reverting to the last known-good, pinned IdP metadata, rotating admin console credentials, and locking metadata changes behind a mandatory approval workflow.\n✓ Containment Successful! The forged trust anchor is removed and future metadata changes require verified authorization.',
      containmentLowLog: 'Action: Leaving the new metadata in place since login still appears to work correctly.\n❌ Containment Failed! The Service Provider continues to trust assertions forged with the attacker\'s planted signing certificate.'
    }
  },
  {
    id: 'scim_deprovisioning_failure',
    title: 'SCIM De-Provisioning Failure Leaving Orphaned Accounts',
    date: 'Ongoing',
    severity: 'Medium',
    difficulty: 'Intermediate',
    category: 'Supply Chain & Provisioning',
    vector: 'Broken or Silently-Failing SCIM Sync Between HR System and Downstream Apps',
    description: 'An employee is offboarded in the HR system of record, which is expected to trigger a SCIM DELETE/deactivate call to every downstream SaaS application. A silent SCIM sync failure (rate limiting, an unhandled 409 conflict, a schema mismatch) leaves the account fully active in one or more applications weeks or months after termination, with no alert ever raised.',
    playbookSteps: [
      'Alert on any SCIM provisioning/de-provisioning call that returns a non-2xx status instead of silently logging and continuing.',
      'Run a periodic reconciliation job comparing the HR system of record\'s active roster against every downstream application\'s user list, flagging drift.',
      'Treat repeated SCIM 429/409 responses as a queue-health incident requiring active remediation, not routine noise.',
      'Require a manual, time-boxed verification step confirming full de-provisioning before an offboarding ticket is marked closed.'
    ],
    remediationSnippet: `// Reconciliation sweep: flag accounts active downstream but terminated upstream\nasync function findOrphanedAccounts(hrRoster, appUsers) {\n  const terminatedIds = new Set(hrRoster.filter(u => u.status === 'terminated').map(u => u.id));\n  return appUsers.filter(u => terminatedIds.has(u.externalId) && u.active);\n}`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['soc2_1', 'iso_4'],
    simulator: {
      step1Log: 'SIEM Log: Reconciliation sweep flags 3 user accounts marked "terminated" in the HR system of record but still "active" in a downstream CRM application.',
      step2Log: 'Incident Detail: SCIM de-provisioning calls for all 3 accounts returned HTTP 429 (rate-limited) six weeks ago and were never retried or alerted on.',
      containmentHighLog: 'Action: Immediately deactivating the 3 orphaned accounts, fixing the SCIM retry/backoff logic, and wiring a hard alert on any future non-2xx provisioning response.\n✓ Containment Successful! Orphaned access is closed and silent sync failures can no longer go unnoticed.',
      containmentLowLog: 'Action: Noting the discrepancy in a ticket to be reviewed "next quarter."\n❌ Containment Failed! The three terminated employees retain live access to the CRM application in the meantime.'
    }
  },
  {
    id: 'jwt_alg_none_exploit',
    title: 'JWT `alg:none` and Weak-Secret Signature Bypass',
    date: '2015 - Present',
    severity: 'High',
    difficulty: 'Intermediate',
    category: 'OAuth & Token Abuse',
    vector: 'Signature Algorithm Confusion / Brute-Forced HMAC Secret',
    description: 'A backend API accepts a JWT\'s `alg` header at face value. An attacker rewrites a captured token\'s header to `"alg":"none"` and strips the signature entirely, or — where HS256 is used with a short, guessable secret — brute-forces the signing secret offline, then forges arbitrary claims (e.g. `role: admin`) with a validly-signed token.',
    playbookSteps: [
      'Hard-code the expected signing algorithm on the verification side; never trust the `alg` value from the token header itself.',
      'Reject any token presenting `alg:none` or an unexpected algorithm outright, at the library configuration level.',
      'Use long, high-entropy HMAC secrets (32+ random bytes) or migrate to asymmetric RS256/ES256 signing with rotated key pairs.',
      'Rate-limit and monitor for repeated signature-verification failures, a signal of an active offline cracking or fuzzing attempt.'
    ],
    remediationSnippet: `// Explicitly pin the accepted algorithm — never trust the token's own header\nconst payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] }); // rejects 'none' and 'RS256' confusion`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['soc2_4', 'pci_3'],
    simulator: {
      step1Log: 'SIEM Log: API gateway accepted a bearer token whose header declares "alg":"none" with an empty signature segment.',
      step2Log: 'Incident Detail: The forged token\'s payload claims "role":"admin" for a user account that has never held administrative privileges.',
      containmentHighLog: 'Action: Pinning the verification library to HS256-only, rejecting "none" and cross-algorithm tokens, and rotating the signing secret to a high-entropy value.\n✓ Containment Successful! Forged and algorithm-confused tokens are now rejected outright at the gateway.',
      containmentLowLog: 'Action: Manually revoking the single forged token that was caught.\n❌ Containment Failed! The underlying verification logic still accepts "alg":"none", so the next forged token sails through unchecked.'
    }
  },
  {
    id: 'third_party_oauth_overprivilege',
    title: 'Over-Privileged Third-Party OAuth App Breach',
    date: '2022 - Present',
    severity: 'High',
    difficulty: 'Intermediate',
    category: 'OAuth & Token Abuse',
    vector: 'Compromised SaaS Integration with Excessive Delegated Scopes',
    description: 'A legitimate, IT-approved third-party SaaS integration (e.g. a scheduling or analytics tool) is itself breached by attackers. Because the integration was originally granted broad delegated scopes far beyond what its actual functionality required, the attacker inherits wide-reaching read/write access to the connected tenant\'s data through the compromised app\'s still-valid OAuth tokens.',
    playbookSteps: [
      'Apply least-privilege scoping to every third-party integration at approval time — grant only the specific scopes the integration\'s stated functionality requires.',
      'Periodically re-review and prune OAuth application scopes, since app requirements and vendor security posture both drift over time.',
      'Immediately revoke tokens for any third-party vendor that discloses a security incident, rather than waiting for confirmed impact.',
      'Segment high-sensitivity data away from what broadly-scoped integrations can reach, even when the integration itself is trusted.'
    ],
    remediationSnippet: `# Revoke all active OAuth tokens issued to a specific third-party application\ncurl -X POST https://api.idp.example.com/oauth/revoke-app \\\n  -H "Authorization: Bearer $ADMIN_TOKEN" \\\n  -d '{"client_id": "compromised-vendor-app-id", "revoke_all_tokens": true}'`,
    snippetLanguage: 'Bash',
    controlsMapped: ['iso_2', 'soc2_4'],
    simulator: {
      step1Log: 'SIEM Log: Vendor "SchedulePro Analytics" publicly disclosed a security incident affecting its own infrastructure and stored OAuth credentials.',
      step2Log: 'Incident Detail: The integration was granted "Files.ReadWrite.All" and "Directory.Read.All" scopes at approval time despite only needing calendar read access.',
      containmentHighLog: 'Action: Revoking all OAuth tokens issued to the vendor application and re-scoping it to calendar-read-only before reconnecting.\n✓ Containment Successful! The over-broad access path is closed and the reconnected integration can no longer reach files or directory data.',
      containmentLowLog: 'Action: Waiting for the vendor to confirm whether any of your organization\'s data was actually accessed.\n❌ Containment Failed! The compromised tokens remain valid and broadly scoped for the entire duration of the vendor\'s investigation.'
    }
  },

  // ───────────────────────── Advanced ─────────────────────────
  {
    id: 'golden_saml',
    title: 'SolarWinds Golden SAML (APT29 Nobelium)',
    date: 'December 2020',
    severity: 'Critical',
    difficulty: 'Advanced',
    category: 'Federation & SSO Exploits',
    vector: 'Token-Signing Private Key Certificate Compromise',
    description: 'State-sponsored attackers compromised on-premise Active Directory Federation Services (ADFS) servers and extracted the private token-signing certificate key. Using this key, the attackers forged standard SAML assertions locally in memory, granting themselves any administrative group claim and completely bypassing on-premise ADFS and MFA gateways to access cloud systems.',
    playbookSteps: [
      'Store and back all ADFS token-signing private keys securely inside a physical Hardware Security Module (HSM).',
      'Manually rotate ADFS token-signing certificates immediately and verify replication forest-wide.',
      'Enforce strict host-level filesystem security audits on on-premise Domain Controllers.',
      'Migrate workforce single-sign-on (SSO) channels from on-premise federations to cloud-native Entra ID.'
    ],
    remediationSnippet: `# PowerShell: Enable ADFS Token Signing Key HSM protection\nSet-AdfsCertificate -CertificateType Token-Signing -Thumbprint "THUMBPRINT_HEX" -Pin "HSM_PIN_HERE"`,
    snippetLanguage: 'PowerShell',
    controlsMapped: ['iso_2', 'soc2_1'],
    simulator: {
      step1Log: 'SIEM Log: Multiple administrative logins authenticated to cloud portal without matching ADFS request logs!',
      step2Log: 'Incident Detail: SAML assertion signatures verified, but ADFS server logs do not show token generation. Certificate key is likely compromised locally!',
      containmentHighLog: 'Action: Manually rotating ADFS token-signing private keys twice, flushing active caches, and moving certificates to physical HSM hardware.\n✓ Containment Successful! Forged SAML certificates are invalidated forest-wide, blocking attacker authentication.',
      containmentLowLog: 'Action: Resetting the target administrator\'s Active Directory password.\n❌ Containment Failed! Attackers still hold the ADFS private signing key, letting them forge valid administrative SAML assertions at will.'
    }
  },
  {
    id: 'kerberoasting_service_accounts',
    title: 'Kerberoasting Against Service Accounts',
    date: 'Ongoing',
    severity: 'High',
    difficulty: 'Advanced',
    category: 'Directory & Kerberos Attacks',
    vector: 'Offline TGS Ticket Cracking Against Weak Service Account Passwords',
    description: 'Any authenticated domain user can request a Kerberos service ticket (TGS) for any account with a registered Service Principal Name (SPN). The ticket is encrypted with the service account\'s own password hash. Attackers request TGS tickets for high-privilege service accounts and crack them offline, since many legacy service accounts use old, never-rotated, weak passwords.',
    playbookSteps: [
      'Set service account passwords to long, high-entropy, randomly generated values (25+ characters) that are effectively immune to offline cracking.',
      'Migrate eligible service accounts to Group Managed Service Accounts (gMSA), which rotate a 120-character password automatically.',
      'Monitor for anomalous volumes of TGS ticket requests (event ID 4769) targeting multiple SPNs from a single account in a short window.',
      'Enforce AES-only Kerberos encryption for service accounts and disable legacy RC4 support, which is dramatically weaker against offline cracking.'
    ],
    remediationSnippet: `# PowerShell: audit accounts with an SPN and migrate to a gMSA\nGet-ADUser -Filter {ServicePrincipalName -like "*"} -Properties ServicePrincipalName\n\nNew-ADServiceAccount -Name "svc-app-gmsa" -DNSHostName "app.corp.local" -PrincipalsAllowedToRetrieveManagedPassword "AppServers"`,
    snippetLanguage: 'PowerShell',
    controlsMapped: ['iso_2', 'iso_3'],
    simulator: {
      step1Log: 'SIEM Log: Event ID 4769 shows a single standard domain user account requesting TGS tickets for 40 distinct SPNs within 90 seconds.',
      step2Log: 'Incident Detail: Offline analysis confirms one of the requested tickets — for service account "svc-legacy-sql" — was encrypted under RC4 with a password last rotated 6 years ago.',
      containmentHighLog: 'Action: Migrating the exposed service account to a gMSA with an automatically rotated 120-character password and disabling RC4 domain-wide.\n✓ Containment Successful! The service account\'s credential can no longer be offline-cracked, and legacy weak encryption is eliminated.',
      containmentLowLog: 'Action: Manually changing the service account\'s password to another human-chosen value.\n❌ Containment Failed! A human-chosen replacement password is still crackable offline via the exact same Kerberoasting technique.'
    }
  },
  {
    id: 'silver_ticket_forgery',
    title: 'Silver Ticket Forgery Against a Single Service',
    date: 'Ongoing',
    severity: 'Critical',
    difficulty: 'Advanced',
    category: 'Directory & Kerberos Attacks',
    vector: 'Forged Service Ticket Using a Stolen Service Account NTLM Hash',
    description: 'Unlike a Golden Ticket (which forges the domain-wide Kerberos trust anchor), a Silver Ticket only requires the NTLM password hash of a single target service account. An attacker who has already dumped that hash can forge a valid-looking service ticket for that specific service without ever contacting a Domain Controller, embedding arbitrary group memberships and evading centralized Kerberos logging entirely.',
    playbookSteps: [
      'Rotate the NTLM hash (i.e. the password) of any service account suspected of prior credential dumping, immediately and domain-wide.',
      'Enable and monitor detailed service-side authorization logging, since forged Silver Tickets bypass Domain Controller audit trails by design.',
      'Restrict which hosts and accounts are permitted to authenticate to sensitive services using Protected Users groups and authentication policies.',
      'Apply the principle of least privilege to service account group memberships, minimizing the blast radius of any single forged ticket.'
    ],
    remediationSnippet: `# PowerShell: force NTLM hash rotation for a suspected-compromised service account\nSet-ADAccountPassword -Identity "svc-fileserver" -Reset -NewPassword (ConvertTo-SecureString "NewHighEntropyValue!" -AsPlainText -Force)\nAdd-ADGroupMember -Identity "Protected Users" -Members "svc-fileserver"`,
    snippetLanguage: 'PowerShell',
    controlsMapped: ['iso_2', 'iso_3'],
    simulator: {
      step1Log: 'SIEM Log: A file server granted access to a user account with group memberships that do not appear anywhere in Domain Controller authentication logs.',
      step2Log: 'Incident Detail: The service ticket presented was forged locally using a previously dumped NTLM hash for the file server\'s own service account — no Domain Controller was ever contacted.',
      containmentHighLog: 'Action: Rotating the service account\'s NTLM hash domain-wide, adding it to Protected Users, and tightening authorization logging on the target service.\n✓ Containment Successful! The forged ticket is invalidated and future forgeries against this account are no longer possible with the old hash.',
      containmentLowLog: 'Action: Restarting the affected file server service.\n❌ Containment Failed! The underlying NTLM hash the attacker stole is unchanged, so a fresh Silver Ticket can be forged again immediately.'
    }
  },
  {
    id: 'cicd_supply_chain_secret_leak',
    title: 'CI/CD Pipeline Supply-Chain Secret Compromise',
    date: 'December 2020 (SolarWinds precedent) - Present',
    severity: 'Critical',
    difficulty: 'Advanced',
    category: 'Supply Chain & Provisioning',
    vector: 'Poisoned Build Pipeline Exfiltrating Signing Keys and Deployment Secrets',
    description: 'Attackers compromise a software vendor\'s build/CI pipeline itself rather than any single customer, injecting malicious code or exfiltrating code-signing keys and deployment credentials during the build process. Every downstream customer who trusts and installs the resulting signed update inherits the compromise — the defining pattern behind the SolarWinds Orion supply-chain attack.',
    playbookSteps: [
      'Isolate build/CI infrastructure from general corporate network access, and require step-up authentication for any pipeline configuration change.',
      'Store code-signing keys and deployment credentials in a Hardware Security Module (HSM) or secrets manager the pipeline can use but never directly read.',
      'Require reproducible, independently-verifiable builds so a tampered artifact can be detected against a clean rebuild.',
      'Continuously monitor pipeline configuration files (e.g. build scripts, CI YAML) for unauthorized modification, treating any change as a high-severity alert.'
    ],
    remediationSnippet: `# GitHub Actions: pin every third-party action to a commit SHA and require signed commits\n- uses: actions/checkout@8f4b7f84864484a7bf31766abe9204da3cbe65b3 # v4 pinned by SHA, not a mutable tag\n\n# Fail the build if any workflow file was modified without a signed, verified commit\ngit log --show-signature -1 .github/workflows/deploy.yml | grep -q "Good signature" || exit 1`,
    snippetLanguage: 'YAML / Bash',
    controlsMapped: ['iso_2', 'soc2_1'],
    simulator: {
      step1Log: 'SIEM Log: The production build pipeline\'s signing step executed with a modified script hash that does not match the last known-good, reviewed version.',
      step2Log: 'Incident Detail: The modification injects an additional network callback into the compiled binary immediately after the legitimate code-signing step, before the artifact is published to customers.',
      containmentHighLog: 'Action: Halting all outbound releases, rotating the code-signing key via HSM re-issuance, and isolating build infrastructure pending a full forensic rebuild from a clean source.\n✓ Containment Successful! The poisoned signing path is severed and no further malicious artifacts can be published under the trusted signature.',
      containmentLowLog: 'Action: Pushing a "fixed" follow-up release using the same pipeline and the same signing key.\n❌ Containment Failed! The pipeline and signing key are still compromised, so the "fixed" release itself cannot be trusted.'
    }
  },
  {
    id: 'cloud_privilege_escalation_chain',
    title: 'Cloud IAM Privilege-Escalation Chain',
    date: 'Ongoing',
    severity: 'Critical',
    difficulty: 'Advanced',
    category: 'Cloud IAM Misconfiguration',
    vector: 'Chained Misconfigured IAM Permissions Leading to Full Account Takeover',
    description: 'No single overly-broad IAM permission looks dangerous in isolation, but an attacker with initial low-privilege access chains several together — e.g. permission to create a new IAM policy version, permission to attach policies to roles, and permission to assume an EC2 instance role — to escalate step by step into full administrative control of the cloud account, a well-documented class of AWS/Azure/GCP privilege-escalation paths.',
    playbookSteps: [
      'Run automated IAM privilege-escalation path analysis regularly (e.g. PMapper/Cloudsplaining-style graph analysis) rather than reviewing permissions individually.',
      'Apply permission boundaries and service control policies that cap the maximum privilege any role can ever reach, even via a discovered chain.',
      'Remove standing "iam:PassRole" and policy-attachment permissions from application roles that have no legitimate need for them.',
      'Alert on any low-privilege identity creating or modifying IAM policies, roles, or trust relationships — an action that should almost never occur outside a change-managed deployment.'
    ],
    remediationSnippet: `// AWS: permission boundary capping the maximum reachable privilege for a role\n{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Deny",\n    "Action": ["iam:CreatePolicyVersion", "iam:AttachRolePolicy", "iam:PassRole"],\n    "Resource": "*",\n    "Condition": { "StringNotEquals": { "aws:PrincipalTag/Team": "platform-admin" } }\n  }]\n}`,
    snippetLanguage: 'JSON',
    controlsMapped: ['iso_1', 'soc2_3'],
    simulator: {
      step1Log: 'SIEM Log: A low-privilege application role created a new IAM policy version and immediately attached it to itself — an action never seen from this role before.',
      step2Log: 'Incident Detail: The newly attached policy grants "iam:PassRole" against the account\'s administrator role, and the same identity assumed that admin role within 90 seconds.',
      containmentHighLog: 'Action: Revoking the escalated session, deploying a permission boundary that caps this role\'s maximum reachable privilege, and removing the unused policy-attachment permission entirely.\n✓ Containment Successful! The escalation chain is broken at its first link and can no longer reach administrative privilege.',
      containmentLowLog: 'Action: Deleting only the specific malicious policy version that was created.\n❌ Containment Failed! The role\'s underlying permission to create and attach new policy versions is unchanged, so the identical escalation chain can be rebuilt immediately.'
    }
  },
  {
    id: 'cross_tenant_token_forgery',
    title: 'Cross-Tenant Identity Federation Trust-Chain Compromise',
    date: 'Ongoing',
    severity: 'Critical',
    difficulty: 'Advanced',
    category: 'Federation & SSO Exploits',
    vector: 'Forged Cross-Tenant Token via a Compromised Federation Trust Relationship',
    description: 'In a B2B multi-tenant federation setup, a Service Provider trusts assertions/tokens issued by many partner IdPs. An attacker compromises one weakly-secured partner IdP in the trust chain and issues a forged token claiming a high-privilege identity in an entirely different, unrelated tenant, exploiting the Service Provider\'s failure to strictly validate the issuer-to-tenant binding.',
    playbookSteps: [
      'Strictly validate that a token\'s issuer claim matches the specific tenant it claims to represent — never trust an issuer to vouch for an arbitrary tenant.',
      'Maintain per-partner-IdP trust scoping so a compromised partner can only ever assert identities within its own delegated tenant boundary.',
      'Periodically audit every federated trust relationship for weak signing algorithms, stale certificates, or overly permissive issuer wildcarding.',
      'Require partner IdPs to meet a minimum security bar (rotated signing keys, MFA-protected admin consoles) as a condition of remaining in the federation trust chain.'
    ],
    remediationSnippet: `// Reject any token whose issuer is not explicitly authorized for the claimed tenant\nfunction validateFederatedToken(token) {\n  const { iss, tid } = decodeClaims(token);\n  const allowedIssuersForTenant = TENANT_TRUST_MAP[tid] || [];\n  if (!allowedIssuersForTenant.includes(iss)) {\n    throw new Error(\`Federation trust violation: issuer \${iss} is not authorized for tenant \${tid}\`);\n  }\n}`,
    snippetLanguage: 'JavaScript',
    controlsMapped: ['iso_1', 'iso_4'],
    simulator: {
      step1Log: 'SIEM Log: A token asserting a "Global Administrator" identity for Tenant B arrived signed by the federation IdP registered only for Tenant A.',
      step2Log: 'Incident Detail: Tenant A\'s partner IdP was compromised 5 days ago via an unpatched admin console vulnerability, and its signing key was used to mint tokens for an unrelated tenant.',
      containmentHighLog: 'Action: Revoking Tenant A\'s federation trust immediately, enforcing strict issuer-to-tenant binding validation, and requiring the partner to rotate its signing key before re-establishing trust.\n✓ Containment Successful! Cross-tenant forgery is blocked structurally, and the compromised partner can no longer impersonate other tenants even if re-trusted.',
      containmentLowLog: 'Action: Disabling the specific forged administrator account that was created in Tenant B.\n❌ Containment Failed! The compromised partner IdP\'s signing key remains trusted and can forge an unlimited number of new cross-tenant identities.'
    }
  },
]
