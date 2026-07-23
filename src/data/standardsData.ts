// Single source of truth for the /standards "Living Standards & RFC Explorer" — every
// entry here automatically renders as a card on StandardsExplorer.tsx AND becomes
// searchable/deep-linkable (?standard=<id>) via searchService.ts. Add a new standard
// by appending one object below; nothing else needs to be edited to make it searchable.
export interface IdentityStandard {
  id: string
  title: string
  fullname: string
  rfcs: string[]
  year: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  summary: string
  problem: string
  whyExists: string
  flowchart: string
  messageFormat: string
  vulnerabilities: string[]
  bestPractices: string[]
  vendorSupport: string[]
  relatedResources: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

export const STANDARDS: IdentityStandard[] = [
  {
    id: 'oauth21',
    title: 'OAuth 2.1',
    fullname: 'Consolidated Authorization Framework',
    rfcs: ['RFC 6749', 'RFC 7636 (PKCE)', 'RFC 8252', 'RFC 6819'],
    year: '2024 / 2025',
    difficulty: 'Intermediate',
    category: 'Authorization',
    summary: 'OAuth 2.1 consolidates secure best-practices from OAuth 2.0, deprecating vulnerable Implicit and Resource Owner Password Credentials grants and mandating PKCE.',
    problem: 'OAuth 2.0 had multiple legacy grant types (Implicit, Password) that exposed security credentials in browser histories and redirect flows, leading to token thefts.',
    whyExists: 'To establish a secure-by-default baseline for modern API and application authorization without legacy security loopholes.',
    flowchart: `
+-------------------------------------------------------------+
|                OAUTH 2.1 PKCE HANDSHAKE FLOW                |
+-------------------------------------------------------------+

  [ Browser Client / SPA ]              [ Authorization Server ]
             |                                     |
             |--- 1. /authorize + challenge ------>|
             |<-- 2. Redirect + Auth Code ---------|
             |                                     |
             |--- 3. /token + verifier ----------->|
             |<-- 4. Access Token (JWT) -----------|
`,
    messageFormat: `// Token Exchange Token Request (POST /token)
POST /token HTTP/1.1
Host: auth.company.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https://app.company.com/callback
&client_id=spa-client-1
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`,
    vulnerabilities: [
      'Authorization Code Interception (Mitigated by PKCE).',
      'Open Redirection URI Hijacking.',
      'Token replay via un-constrained Bearer credentials (Mitigated by DPoP).'
    ],
    bestPractices: [
      'Mandate PKCE S256 verifications on all public clients.',
      'Validate redirects against exact string comparisons, disabling wildcard matching.',
      'Enforce Sender-Constrained tokens (DPoP) on high-risk APIs.'
    ],
    vendorSupport: [
      'Thales STA and OneWelcome: Complete compliance with visual orchestration.',
      'Okta / Auth0: Complete native compliance.',
      'Keycloak: Enforces OAuth 2.1 constraints out-of-the-box in modern versions.',
      'Microsoft Entra ID: Supports PKCE S256 and auth code flows.'
    ],
    relatedResources: [
      { title: 'OAuth Request Builder Tool', path: '/tools/oauth-builder', type: 'tool' },
      { title: 'OAuth PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' },
      { title: 'OAuth 2.0 Attack Lab', path: '/playground/oauth-attack', type: 'playground' }
    ]
  },
  {
    id: 'oidc',
    title: 'OIDC 1.0',
    fullname: 'OpenID Connect Core 1.0',
    rfcs: ['OIDC Core 1.0 Specs'],
    year: '2014',
    difficulty: 'Intermediate',
    category: 'Federation & SSO',
    summary: 'OpenID Connect is a simple identity layer built on top of the OAuth 2.0 protocol, enabling Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server.',
    problem: 'OAuth 2.0 was designed for authorization (delegated access), leaving developers to hand-roll custom user authentication structures, leading to non-standard, vulnerable "Login with OAuth" implementations.',
    whyExists: 'To standardize user authentication, introducing a cryptographically signed ID Token (JWT) and a standard /userinfo endpoint.',
    flowchart: `
+-------------------------------------------------------------+
|                     OIDC CORE HANDSHAKE                     |
+-------------------------------------------------------------+

  [ Browser Client / SPA ]              [ OIDC Identity Server ]
             |                                     |
             |--- 1. Login Request (scope=openid)->|
             |<-- 2. ID Token + Access Token ------|
             |                                     |
             |--- 3. GET /userinfo + token ------->|
             |<-- 4. User Profile Claims (JSON) ---|
`,
    messageFormat: `// Decoded ID Token (Header & Payload Claims)
{
  "alg": "RS256",
  "kid": "key-123"
}
{
  "iss": "https://auth.company.com",
  "sub": "user_id_9981",
  "aud": "spa-client-1",
  "exp": 1783430000,
  "name": "Alex Identity",
  "email": "alex@company.com"
}`,
    vulnerabilities: [
      'Algorithm Confusion (tampering with JWT headers to alg: none).',
      'JWKS Spoofing (re-routing key checks to attacker keys).',
      'ID Token leakage in public browser history.'
    ],
    bestPractices: [
      'Always validate JWT signatures on downstream resource gates.',
      'Cache and rate-limit JWKS endpoint fetches strictly.',
      'Reject "none" algorithms explicitly in signature verification libraries.'
    ],
    vendorSupport: [
      'Thales OneWelcome and STA: Extensively supports OIDC federated login, identity assertions, and secure /userinfo claims.',
      'Auth0 / Clerk: Complete native compliance.',
      'Ping Identity: Highly customizable enterprise OIDC configurations.',
      'Microsoft Entra ID: Direct workforce and guest user OIDC flows.'
    ],
    relatedResources: [
      { title: 'OIDC Discovery Auditor Tool', path: '/tools/oidc-discovery', type: 'tool' },
      { title: 'JWKS Inspector Tool', path: '/tools/jwks-inspector', type: 'tool' },
      { title: 'JWT Studio & Exploit Arena', path: '/playground/jwt', type: 'playground' }
    ]
  },
  {
    id: 'scim20',
    title: 'SCIM 2.0',
    fullname: 'System for Cross-domain Identity Management',
    rfcs: ['RFC 7643', 'RFC 7644'],
    year: '2015',
    difficulty: 'Intermediate',
    category: 'Provisioning',
    summary: 'SCIM 2.0 is an HTTP-based protocol designed to simplify user provisioning and identity management in multi-tenant cloud applications and services.',
    problem: 'Manual user onboarding, offboarding, and directory synchronization across hundreds of separate corporate SaaS apps led to high operational overhead and orphaned accounts.',
    whyExists: 'To define a standardized, REST/JSON-based resource schema for Users and Groups, enabling automated Identity Lifecycle synchronization.',
    flowchart: `
+-------------------------------------------------------------+
|                 SCIM 2.0 USER PROVISIONING                  |
+-------------------------------------------------------------+

       [ Corporate Directory / IdP ]           [ B2B SaaS Application ]
                     |                                    |
                     |--- 1. POST /Users (JSON User) ---->|
                     |<-- 2. HTTP 201 Created ------------|
                     |                                    |
                     |--- 3. PATCH /Users (Update) ------>|
                     |<-- 4. HTTP 204 No Content ---------|
`,
    messageFormat: `// SCIM Create User Payload (POST /Users)
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "brian@company.com",
  "name": {
    "familyName": "Secure",
    "givenName": "Brian"
  },
  "emails": [{
    "value": "brian@company.com",
    "primary": true
  }],
  "active": true
}`,
    vulnerabilities: [
      'Unauthenticated provisioning endpoints exposing employee attributes.',
      'SQL and LDAP injection vectors via SCIM filter queries (e.g. filter=userName eq "admin").',
      'Data leaks via nested custom attribute extensions.'
    ],
    bestPractices: [
      'Secure SCIM API endpoints strictly using OAuth 2.0 Bearer tokens or mTLS certificates.',
      'Sanitize and validate filter parameter parameters strictly before querying databases.',
      'Validate incoming SCIM payloads against strict, defined schema blueprints.'
    ],
    vendorSupport: [
      'Thales OneWelcome: Fully compliant SCIM 2.0 endpoints for user registration, syncing, and external provisioning.',
      'Okta / Entra ID: Native push-provisioning directories.',
      'Keycloak: Extensible user-sync provisioning modules.',
      'SailPoint: Complete IGA catalog sync hooks.'
    ],
    relatedResources: [
      { title: 'SCIM Payload Validator Tool', path: '/tools/scim-payload-validator', type: 'tool' },
      { title: 'SCIM Diff Tool', path: '/tools/scim-diff', type: 'tool' },
      { title: 'SCIM Sync Provisioning Lab', path: '/playground/scim', type: 'playground' }
    ]
  },
  {
    id: 'webauthn',
    title: 'WebAuthn',
    fullname: 'W3C Web Authentication (FIDO2)',
    rfcs: ['W3C WebAuthn Level 3 Specs'],
    year: '2019 / 2024',
    difficulty: 'Advanced',
    category: 'Passwordless & Biometrics',
    summary: 'W3C WebAuthn standardizes secure, phishing-resistant public-key cryptography (Passkeys) executed natively inside browser clients and hardware TPM enclaves.',
    problem: 'Passwords are vulnerable to phishing, databases leaks, or local keylogging, while legacy SMS-based MFA remains vulnerable to high-tech SIM swapping.',
    whyExists: 'To establish a global, passwordless authentication profile using hardware-secured asymmetric keypairs where servers only store the client public key.',
    flowchart: `
+-------------------------------------------------------------+
|                WEBAUTHN PASSKEY HANDSHAKE                   |
+-------------------------------------------------------------+

  [ Browser / Client TPM ]              [ Relying Party Server ]
             |                                     |
             |--- 1. Get Challenge Options ------->|
             |<-- 2. Challenge + Allowed Creds ----|
             |                                     |
             |--- 3. navigator.credentials.get --->|
             |                                     |
             |--- 4. Assertion (Signature) ------->|
             |<-- 5. Session Verified -------------|
`,
    messageFormat: `// WebAuthn Assertion Response Payload (JSON representation)
{
  "id": "ARuX_99a...",
  "rawId": "ARuX_99a...",
  "type": "public-key",
  "response": {
    "authenticatorData": "SZYN5Y...", // Binary authenticator state flags
    "clientDataJSON": "eyJ0eXBlIj...",  // Challenge, origin, tokenBinding
    "signature": "MEUCIQ...",           // ECDSA cryptographic signature
    "userHandle": "dXNlcl8xM..."       // Subject identifier
  }
}`,
    vulnerabilities: [
      'User session hijacking on local unlocked workstations.',
      'Platform credential theft inside unhardened guest operating systems.',
      'Metadata spoofing during key registration (mitigated by Attestation).'
    ],
    bestPractices: [
      'Validate incoming origin domains strictly inside clientDataJSON to prevent phishing.',
      'Enforce User Verification (UV = biometrics/PIN) on sensitive transaction routes.',
      'Assert credentials are bound strictly to hardware enclaves (RP ID matching).'
    ],
    vendorSupport: [
      'Thales STA: Support for hardware tokens and smart passkey authenticators.',
      'Yubico: Complete native FIDO2/WebAuthn L3 hardware compliance.',
      'Microsoft Entra ID: Cloud Hello and FIDO2 workforce passwordless.',
      'Okta: Seamless passkey enrollment and verification flows.'
    ],
    relatedResources: [
      { title: 'WebAuthn Assertion Decoder Tool', path: '/tools/webauthn-assertion-decoder', type: 'tool' },
      { title: 'FIDO2 / WebAuthn Lab', path: '/playground/fido2', type: 'playground' },
      { title: 'Passkey Internals Playground', path: '/playground/passkey-internals', type: 'playground' }
    ]
  },
  {
    id: 'saml2',
    title: 'SAML 2.0',
    fullname: 'Security Assertion Markup Language 2.0',
    rfcs: ['OASIS SAML 2.0 Core', 'OASIS SAML 2.0 Bindings'],
    year: '2005',
    difficulty: 'Beginner',
    category: 'Federation & SSO',
    summary: 'SAML 2.0 is an XML-based framework for exchanging authentication and authorization assertions between an Identity Provider (IdP) and a Service Provider (SP), the backbone of enterprise Single Sign-On.',
    problem: 'Before SAML, every enterprise app maintained its own username/password store, forcing employees to juggle dozens of separate logins and IT to manage duplicate credential lifecycles.',
    whyExists: 'To let a single, centrally-managed Identity Provider vouch for a user\'s identity to any number of separate Service Providers via a signed XML "passport" (the Assertion), without the SP ever seeing the user\'s password.',
    flowchart: `
+-------------------------------------------------------------+
|              SAML 2.0 SP-INITIATED WEB SSO FLOW              |
+-------------------------------------------------------------+

  [ Browser ]      [ Service Provider (SP) ]      [ Identity Provider (IdP) ]
      |                       |                              |
      |--1. GET /app -------->|                              |
      |<-2. Redirect w/ AuthnRequest ------------------------>|
      |--3. Forward AuthnRequest ---------------------------->|
      |<-4. Login Form (if not already authenticated) --------|
      |--5. POST credentials --------------------------------->|
      |<-6. HTML Form w/ signed SAMLResponse (Assertion) ------|
      |--7. POST SAMLResponse to SP ACS --------------------->|
      |<-8. Session Cookie + App Access ----------------------|
`,
    messageFormat: `<!-- Decoded SAMLResponse Assertion (excerpt) -->
<saml2:Assertion ID="_abc123" IssueInstant="2026-07-23T10:00:00Z">
  <saml2:Issuer>https://idp.company.com/saml</saml2:Issuer>
  <ds:Signature>...</ds:Signature>
  <saml2:Subject>
    <saml2:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress">
      brian@company.com
    </saml2:NameID>
  </saml2:Subject>
  <saml2:AttributeStatement>
    <saml2:Attribute Name="department">
      <saml2:AttributeValue>Engineering</saml2:AttributeValue>
    </saml2:Attribute>
  </saml2:AttributeStatement>
</saml2:Assertion>`,
    vulnerabilities: [
      'Signature Wrapping (SSW) — injecting a forged Assertion alongside a validly signed one so parsers read the wrong node.',
      'XML Signature Exclusion — stripping the <ds:Signature> block entirely if the SP fails to enforce its presence.',
      'Golden/Silver SAML — attacker steals the IdP\'s (or an app\'s self-signed) private signing key to forge arbitrary assertions offline.'
    ],
    bestPractices: [
      'Validate the signature against the exact Assertion ID being processed, never trust the first matching node in the XML tree.',
      'Enforce assertion Conditions (NotBefore/NotOnOrAfter) and Audience restriction checks strictly.',
      'Rotate and hardware-vault (HSM) IdP signing keys; monitor for anomalous signing key export events.'
    ],
    vendorSupport: [
      'Thales OneWelcome and SafeNet Trusted Access: Full SP/IdP SAML 2.0 metadata exchange support.',
      'Okta / Ping Identity: Enterprise-grade SAML federation hubs with attribute mapping.',
      'Microsoft Entra ID / ADFS: Native SAML claims-based federation for legacy enterprise apps.',
      'Shibboleth: Widely used in academic/research federation (InCommon, eduGAIN).'
    ],
    relatedResources: [
      { title: 'SAML Metadata Builder Tool', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'SAML Assertion Workbench', path: '/playground/saml', type: 'playground' }
    ]
  },
  {
    id: 'ldapv3',
    title: 'LDAP v3',
    fullname: 'Lightweight Directory Access Protocol v3',
    rfcs: ['RFC 4511', 'RFC 4515 (Filters)'],
    year: '1997 / 2006',
    difficulty: 'Beginner',
    category: 'Directory Services',
    summary: 'LDAP is a lightweight protocol for querying and modifying hierarchical directory information — the foundation for corporate directories like Active Directory and OpenLDAP.',
    problem: 'Early X.500 directory access protocols were heavyweight (full OSI stack) and impractical for everyday application use, making simple "find this user\'s group memberships" queries expensive to implement.',
    whyExists: 'To provide a lean, TCP/IP-native protocol for reading and searching directory entries (users, groups, org units) using a simple string filter syntax.',
    flowchart: `
+-------------------------------------------------------------+
|                  LDAP BIND & SEARCH SEQUENCE                |
+-------------------------------------------------------------+

  [ Application / Client ]              [ Directory Server (AD/OpenLDAP) ]
             |                                     |
             |--- 1. BindRequest (DN + password) ->|
             |<-- 2. BindResponse (success/fail) --|
             |                                     |
             |--- 3. SearchRequest (base+filter) ->|
             |<-- 4. SearchResultEntry(s) ---------|
             |<-- 5. SearchResultDone -------------|
`,
    messageFormat: `// LDAP Search Filter (RFC 4515) targeting a group membership
(&(objectClass=user)(memberOf=CN=Admins,OU=Groups,DC=company,DC=com))

// Typical returned entry (LDIF representation)
dn: CN=Brian Secure,OU=Engineering,DC=company,DC=com
objectClass: user
sAMAccountName: bsecure
mail: brian@company.com
memberOf: CN=Admins,OU=Groups,DC=company,DC=com`,
    vulnerabilities: [
      'LDAP Injection — unsanitized user input concatenated directly into a search filter (e.g. *)(uid=*))(|(uid=*.',
      'Unauthenticated (anonymous) binds exposing the full directory schema and user attributes.',
      'Cleartext LDAP (port 389) transmitting bind credentials without StartTLS/LDAPS.'
    ],
    bestPractices: [
      'Escape all RFC 4515 special filter characters ( \\28 \\29 \\2a \\5c \\00 ) before interpolating user input.',
      'Disable anonymous bind and enforce LDAPS (port 636) or StartTLS for every connection.',
      'Apply least-privilege service accounts for read-only directory queries instead of Domain Admin binds.'
    ],
    vendorSupport: [
      'Microsoft Active Directory: The dominant enterprise LDAPv3 implementation, paired with Kerberos.',
      'OpenLDAP / 389 Directory Server: Open-source LDAPv3 servers common in Linux/Unix estates.',
      'Thales SafeNet Trusted Access: Integrates directly against AD/LDAP for adaptive MFA policy lookups.',
      'AWS Directory Service / Azure AD DS: Managed LDAP-compatible directory offerings.'
    ],
    relatedResources: [
      { title: 'LDAP Filter Builder Tool', path: '/tools/ldap-filter-builder', type: 'tool' },
      { title: 'LDAP Tree Simulator', path: '/playground/ldap', type: 'playground' }
    ]
  },
  {
    id: 'kerberos',
    title: 'Kerberos',
    fullname: 'Kerberos Network Authentication Service v5',
    rfcs: ['RFC 4120'],
    year: '1993 / 2005',
    difficulty: 'Beginner',
    category: 'Directory Services',
    summary: 'Kerberos is a ticket-based authentication protocol that lets users prove their identity across an untrusted network without ever transmitting a password, using a trusted third-party Key Distribution Center (KDC).',
    problem: 'Sending passwords (even hashed) over a shared corporate network for every single service login created a huge sniffing/replay attack surface for internal Windows/Unix networks.',
    whyExists: 'To let a user authenticate once to a trusted KDC and receive short-lived, cryptographically-sealed tickets that can be presented to any number of services without ever re-sending a password.',
    flowchart: `
+-------------------------------------------------------------+
|             KERBEROS AS / TGS TICKET EXCHANGE                |
+-------------------------------------------------------------+

 [ Client ]      [ AS: Auth Server ]   [ TGS: Ticket Server ]   [ App Server ]
     |                    |                       |                   |
     |--1. AS-REQ ------->|                       |                   |
     |<-2. AS-REP (TGT) --|                       |                   |
     |                    |                       |                   |
     |--3. TGS-REQ (TGT + target SPN) ----------->|                   |
     |<-4. TGS-REP (Service Ticket) ---------------|                   |
     |                                                                |
     |--5. AP-REQ (Service Ticket) --------------------------------->|
     |<-6. AP-REP (Mutual Auth) --------------------------------------|
`,
    messageFormat: `// Simplified decoded TGT (Ticket Granting Ticket) contents
{
  "realm": "COMPANY.COM",
  "sname": "krbtgt/COMPANY.COM",
  "cname": "bsecure",
  "authtime": "2026-07-23T10:00:00Z",
  "endtime": "2026-07-23T20:00:00Z",
  "encPart": "<encrypted with krbtgt account's long-term key>"
}`,
    vulnerabilities: [
      'Golden Ticket — attacker who steals the krbtgt account hash can forge unlimited, arbitrarily-privileged TGTs offline.',
      'Silver Ticket — attacker steals a single service account\'s key to forge tickets scoped to just that service.',
      'Kerberoasting — requesting service tickets for accounts with weak passwords, then cracking the ticket encryption offline.'
    ],
    bestPractices: [
      'Rotate the krbtgt account password twice, on a schedule, especially after any suspected domain compromise.',
      'Enforce long, random passwords (or gMSA-managed passwords) for all service accounts to defeat offline Kerberoasting.',
      'Monitor for anomalous TGT lifetimes and abnormal ticket-encryption-type downgrades (RC4 vs AES).'
    ],
    vendorSupport: [
      'Microsoft Active Directory: Kerberos is the default domain authentication protocol on Windows networks.',
      'MIT Kerberos / Heimdal: Reference open-source KDC implementations for Unix/Linux estates.',
      'CyberArk: Detects and alerts on Golden/Silver Ticket forgery patterns via PAM telemetry.',
      'Thales SafeNet Trusted Access: Layers adaptive MFA on top of legacy Kerberos-authenticated sessions.'
    ],
    relatedResources: [
      { title: 'Active Directory Kerberos Lab', path: '/playground/kerberos', type: 'playground' },
      { title: 'AD GPO Simulator', path: '/playground/gpo-simulator', type: 'playground' }
    ]
  },
  {
    id: 'totp-hotp',
    title: 'TOTP / HOTP',
    fullname: 'Time-based & HMAC-based One-Time Password Algorithms',
    rfcs: ['RFC 6238 (TOTP)', 'RFC 4226 (HOTP)'],
    year: '2005 / 2011',
    difficulty: 'Beginner',
    category: 'Multi-Factor Authentication',
    summary: 'HOTP and TOTP define how to derive a short, human-typeable one-time code from a shared secret using HMAC — the algorithm behind every "Google Authenticator"-style app.',
    problem: 'Static passwords alone are trivially phished or reused; early hardware OTP tokens (RSA SecurID) were proprietary and expensive, with no open standard for interoperable code generation.',
    whyExists: 'To standardize a simple, open, license-free algorithm for one-time codes so any authenticator app or hardware token can interoperate with any server.',
    flowchart: `
+-------------------------------------------------------------+
|                  TOTP ENROLLMENT & VERIFY FLOW               |
+-------------------------------------------------------------+

  [ Server ]                          [ Authenticator App ]
      |--1. Provision otpauth:// QR code + shared secret -->|
      |                                                      |
      |          (Every 30s: code = HOTP(secret, floor(unixTime/30)))
      |                                                      |
      |<-2. User submits current 6-digit code --------------|
      |--3. Server recomputes code for current time window->|
      |    (accepts a +/-1 step drift window)                |
`,
    messageFormat: `// otpauth:// provisioning URI (rendered as a QR code)
otpauth://totp/AboutIAM:brian@company.com?secret=JBSWY3DPEHPK3PXP&issuer=AboutIAM&algorithm=SHA1&digits=6&period=30

// HOTP counter-based variant (hardware tokens)
otpauth://hotp/AboutIAM:brian@company.com?secret=JBSWY3DPEHPK3PXP&counter=0`,
    vulnerabilities: [
      'Real-time phishing (adversary-in-the-middle) relaying the OTP code to the legitimate server within its validity window.',
      'Weak shared-secret generation (predictable or low-entropy seeds) enabling brute-force code prediction.',
      'Excessive time-drift tolerance windows widening the valid guess window for attackers.'
    ],
    bestPractices: [
      'Generate secrets with a cryptographically secure RNG at a minimum of 160 bits (20 bytes).',
      'Rate-limit and lock out after a small number of failed OTP attempts to blunt brute-force.',
      'Prefer phishing-resistant WebAuthn/Passkeys over TOTP for high-value accounts where possible.'
    ],
    vendorSupport: [
      'Google Authenticator / Microsoft Authenticator: Ubiquitous free TOTP client apps.',
      'Okta Verify / Ping ID: Enterprise TOTP + push-notification hybrid authenticator apps.',
      'Thales SafeNet MobilePASS+: Enterprise OTP token app with offline TOTP generation.',
      'YubiKey: Hardware tokens supporting both HOTP and TOTP modes.'
    ],
    relatedResources: [
      { title: 'TOTP Generator & Verifier Tool', path: '/tools/totp-generator', type: 'tool' }
    ]
  },
  {
    id: 'radius',
    title: 'RADIUS',
    fullname: 'Remote Authentication Dial-In User Service',
    rfcs: ['RFC 2865', 'RFC 2866 (Accounting)'],
    year: '1997',
    difficulty: 'Beginner',
    category: 'Network Access Control',
    summary: 'RADIUS is a client/server protocol that centralizes authentication, authorization, and accounting (AAA) for network access — VPNs, Wi-Fi (802.1X), and switches all defer the "should this device get on the network" decision to a RADIUS server.',
    problem: 'Every network access server (VPN concentrator, Wi-Fi controller, switch) needed its own local user database, making centralized policy and consistent MFA enforcement across network edges impossible.',
    whyExists: 'To let any network access device forward an authentication request to a single, centrally managed AAA server, enabling one policy engine for every AAA decision on the network.',
    flowchart: `
+-------------------------------------------------------------+
|             RADIUS 802.1X NETWORK ACCESS FLOW                |
+-------------------------------------------------------------+

  [ Supplicant / Laptop ]   [ NAS: Switch / Wi-Fi AP ]   [ RADIUS Server ]
          |                          |                          |
          |--1. EAP Identity ------->|                          |
          |                          |--2. Access-Request ----->|
          |                          |<-3. Access-Challenge ----|
          |<-4. Forward challenge ---|                          |
          |--5. EAP Response (creds)>|                          |
          |                          |--6. Access-Request ----->|
          |                          |<-7. Access-Accept -------|
          |<-8. Network Access Granted|                          |
`,
    messageFormat: `// RADIUS Access-Request packet (conceptual attribute view)
Code: Access-Request (1)
Identifier: 42
Attributes:
  User-Name = "bsecure"
  NAS-IP-Address = 10.0.4.1
  NAS-Port-Type = Wireless-802.11
  EAP-Message = <fragmented EAP payload>
  Message-Authenticator = <HMAC-MD5 over the packet>`,
    vulnerabilities: [
      'Legacy shared-secret RADIUS traffic (UDP, unencrypted attribute values) sniffable on the wire without RadSec/TLS.',
      'Weak PAP/CHAP authentication methods vulnerable to offline password cracking versus EAP-TLS.',
      'Shared-secret reuse across many NAS devices — one compromised switch config leaks the secret for the whole fleet.'
    ],
    bestPractices: [
      'Prefer EAP-TLS (certificate-based) over password-based EAP methods for 802.1X network authentication.',
      'Deploy RadSec (RADIUS over TLS/RFC 6614) to encrypt AAA traffic between NAS and server.',
      'Use unique, high-entropy shared secrets per NAS device and rotate them on a schedule.'
    ],
    vendorSupport: [
      'Cisco ISE / Aruba ClearPass: Enterprise NAC platforms built around RADIUS AAA policy engines.',
      'Microsoft NPS (Network Policy Server): Native Windows Server RADIUS implementation.',
      'FreeRADIUS: The dominant open-source RADIUS server.',
      'Thales SafeNet Trusted Access: RADIUS-based MFA bolt-on for legacy VPN concentrators.'
    ],
    relatedResources: [
      { title: 'Zero Trust Device Posture Lab', path: '/playground/device-trust', type: 'playground' }
    ]
  },
  {
    id: 'jose',
    title: 'JOSE / JWT',
    fullname: 'JSON Object Signing and Encryption (JWS, JWE, JWK, JWT)',
    rfcs: ['RFC 7515 (JWS)', 'RFC 7516 (JWE)', 'RFC 7517 (JWK)', 'RFC 7519 (JWT)'],
    year: '2015',
    difficulty: 'Intermediate',
    category: 'Tokens & Cryptography',
    summary: 'The JOSE family standardizes how to sign (JWS), encrypt (JWE), and represent keys (JWK) for compact, URL-safe JSON structures — the JWT (JSON Web Token) is the best-known JOSE profile, combining a JWS-signed set of claims.',
    problem: 'Before JOSE, every framework invented its own bespoke signed-token format, making cross-platform, interoperable token verification (mobile app ↔ Java backend ↔ Node microservice) a constant integration headache.',
    whyExists: 'To give the industry one compact, base64url-encoded, self-describing structure for signed/encrypted claims that any language\'s crypto library can produce and verify identically.',
    flowchart: `
+-------------------------------------------------------------+
|                 JOSE STRUCTURE (JWS-SIGNED JWT)              |
+-------------------------------------------------------------+

  header.payload.signature
  |       |         |
  |       |         +-- HMAC/RSA/ECDSA signature over header+payload
  |       +------------ Base64URL(claims JSON)
  +-------------------- Base64URL({"alg":"RS256","kid":"key-1"})

  [ Issuer ]  --sign(header, payload, privateKey)-->  JWT string
  [ Verifier] --fetch JWKS by 'kid', verify signature--> Trusted Claims
`,
    messageFormat: `// Compact JWS serialization (3 base64url segments)
eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0xIn0.eyJzdWIiOiJic2VjdXJlIiwiZXhwIjoxNzgzNDMwMDAwfQ.QqY...signature

// Corresponding JWK (public key) used to verify it
{
  "kty": "RSA",
  "kid": "key-1",
  "use": "sig",
  "n": "0vx7agoebGcQSuuPiLJXZ...",
  "e": "AQAB"
}`,
    vulnerabilities: [
      'Algorithm confusion — flipping "alg" to "none" or swapping RS256→HS256 to forge a signature using the public key as an HMAC secret.',
      'JWE lacking authenticated encryption modes, permitting bit-flipping/padding-oracle attacks on ciphertext claims.',
      'Overly long token expirations combined with no revocation list, letting a stolen JWT remain valid for hours or days.'
    ],
    bestPractices: [
      'Hard-pin the expected signing algorithm on the verifier side; never trust the "alg" header from the token itself.',
      'Prefer short-lived access tokens (minutes) paired with a separately revocable refresh token.',
      'Only use JWE algorithms with authenticated encryption (e.g. A256GCM), never unauthenticated CBC modes alone.'
    ],
    vendorSupport: [
      'Auth0 / Okta / Ping Identity: Issue and verify RS256/ES256 JWTs as their default access & ID token format.',
      'Thales OneWelcome: JWT-based session tokens across its identity fabric.',
      'jose (npm) / PyJWT / jjwt (Java): Widely adopted open-source JOSE libraries.',
      'AWS Cognito / Azure AD B2C: Cloud-native JWT issuance for consumer and workforce identity.'
    ],
    relatedResources: [
      { title: 'JWT Decoder Tool', path: '/tools/jwt-decoder', type: 'tool' },
      { title: 'JWT Generator Tool', path: '/tools/jwt-generator', type: 'tool' },
      { title: 'JWKS Inspector Tool', path: '/tools/jwks-inspector', type: 'tool' },
      { title: 'JWT Studio & Exploit Arena', path: '/playground/jwt', type: 'playground' }
    ]
  },
  {
    id: 'x509-pki',
    title: 'X.509 PKI & mTLS',
    fullname: 'X.509 Public Key Infrastructure & Mutual TLS',
    rfcs: ['RFC 5280 (X.509)', 'RFC 8446 (TLS 1.3)'],
    year: '1988 / 2018',
    difficulty: 'Intermediate',
    category: 'PKI & Cryptography',
    summary: 'X.509 defines the standard format for digital certificates binding a public key to an identity via a Certificate Authority\'s signature; mTLS uses these certificates on both sides of a TLS handshake so client and server each cryptographically prove who they are.',
    problem: 'Bearer tokens and passwords can be copied and replayed from any machine; server-only TLS proves the server\'s identity but leaves the client anonymous at the transport layer, an unacceptable gap for high-assurance service-to-service or workload communication.',
    whyExists: 'To give every party in a connection (not just the server) a verifiable, CA-issued cryptographic identity, and a standard chain-of-trust model (Root → Intermediate → Leaf) for validating it.',
    flowchart: `
+-------------------------------------------------------------+
|                  MUTUAL TLS (mTLS) HANDSHAKE                |
+-------------------------------------------------------------+

  [ Client ]                              [ Server ]
      |--1. ClientHello -------------------->|
      |<-2. ServerHello + Server Certificate -|
      |<-3. CertificateRequest ---------------|
      |--4. Client Certificate -------------->|
      |--5. CertificateVerify (signed nonce)->|
      |<-6. Finished (mutual trust) ----------|
      |=========== Encrypted Channel =========|
`,
    messageFormat: `// Decoded X.509 leaf certificate (openssl x509 -text style excerpt)
Certificate:
  Subject: CN=api.company.com, O=Company Inc
  Issuer: CN=Company Intermediate CA
  Validity:
    Not Before: 2026-01-01
    Not After : 2027-01-01
  Subject Public Key Info:
    Public Key Algorithm: id-ecPublicKey
  X509v3 extensions:
    X509v3 Key Usage: Digital Signature
    X509v3 Extended Key Usage: TLS Web Client Authentication`,
    vulnerabilities: [
      'Expired or unchecked CRL/OCSP revocation status allowing a compromised certificate to keep authenticating.',
      'Weak or misconfigured CA chain trust (self-signed leaf treated as a trusted root by a misconfigured client).',
      'Private key exfiltration from an unprotected filesystem instead of an HSM/TPM-backed keystore.'
    ],
    bestPractices: [
      'Enforce OCSP stapling or short-lived certificates instead of relying solely on client-side CRL fetches.',
      'Store private keys in an HSM, TPM, or cloud KMS rather than as plaintext files on disk.',
      'Automate certificate issuance/rotation (e.g. ACME, SPIFFE/SPIRE) to keep lifetimes short and reduce manual renewal risk.'
    ],
    vendorSupport: [
      'Thales Luna HSM / CipherTrust: Hardware-backed private key protection for issuing CAs.',
      'Let\'s Encrypt / HashiCorp Vault PKI: Automated short-lived certificate issuance.',
      'DigiCert / Sectigo: Enterprise public CA issuance and lifecycle management.',
      'Istio / Linkerd: Service mesh sidecars automating mTLS between microservices.'
    ],
    relatedResources: [
      { title: 'X.509 CSR Generator Tool', path: '/tools/csr-generator', type: 'tool' },
      { title: 'mTLS & Certificate Chain Validator', path: '/playground/cert-chain', type: 'playground' }
    ]
  },
  {
    id: 'rfc8693',
    title: 'RFC 8693',
    fullname: 'OAuth 2.0 Token Exchange',
    rfcs: ['RFC 8693'],
    year: '2020',
    difficulty: 'Intermediate',
    category: 'Authorization',
    summary: 'Token Exchange defines a standard grant type for a Security Token Service (STS) to trade one security token for another — enabling delegation and impersonation across service boundaries and even across token types (JWT ↔ SAML).',
    problem: 'Microservice chains (Gateway → Service A → Service B) had no standard way to safely narrow a caller\'s token scope, swap token formats between legacy and modern systems, or attribute a downstream call to both the original user and the calling service.',
    whyExists: 'To standardize how a client presents an existing token to an STS and receives back a new, appropriately-scoped token — carrying delegation ("acting on behalf of") or impersonation semantics explicitly.',
    flowchart: `
+-------------------------------------------------------------+
|              RFC 8693 TOKEN EXCHANGE (STS) FLOW              |
+-------------------------------------------------------------+

  [ Gateway / Service A ]                [ Security Token Service ]
             |                                     |
             |--1. POST /token                     |
             |   grant_type=token-exchange          |
             |   subject_token=<original JWT>  ---->|
             |                                     |
             |<-2. New scoped access_token +        |
             |     issued_token_type ---------------|
             |                                     |
  [ Service A ] --3. Call downstream Service B with new token -->
`,
    messageFormat: `// Token Exchange Request (RFC 8693 §2.1)
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=eyJhbGciOiJSUzI1NiIs...
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&requested_token_type=urn:ietf:params:oauth:token-type:access_token
&audience=inventory-service
&scope=inventory.read`,
    vulnerabilities: [
      'Confused deputy — Service B trusting an exchanged token\'s "act_as" claim without verifying the calling service\'s own identity.',
      'Scope escalation if the STS fails to enforce that an exchanged token can only ever narrow, never widen, the original grant.',
      'Missing audience (aud) restriction letting an exchanged token be replayed against an unintended downstream service.'
    ],
    bestPractices: [
      'Always include and strictly validate the "aud" claim so an exchanged token only works against its intended service.',
      'Preserve the original subject and actor ("act_as") claims through every hop for a full audit trail.',
      'Enforce monotonic scope narrowing — an exchanged token must never carry more privilege than its subject token.'
    ],
    vendorSupport: [
      'Keycloak: Native "Standard Token Exchange" feature implementing RFC 8693.',
      'Okta / Auth0 (Enterprise): Custom token exchange via Actions/Rules extensibility.',
      'Thales OneWelcome: STS-style token brokering across federated identity domains.',
      'Istio / Envoy: Service mesh JWT translation filters implementing exchange-like semantics.'
    ],
    relatedResources: [
      { title: 'STS Token Exchange Broker Lab', path: '/playground/token-exchange', type: 'playground' }
    ]
  },
  {
    id: 'nist80063',
    title: 'NIST SP 800-63',
    fullname: 'NIST Digital Identity Guidelines',
    rfcs: ['NIST SP 800-63-3 / 800-63-4'],
    year: '2017 / 2025',
    difficulty: 'Intermediate',
    category: 'Governance & Assurance',
    summary: 'NIST SP 800-63 defines the U.S. federal reference model for digital identity, splitting it into three independently-selectable assurance levels: Identity Proofing (IAL), Authentication (AAL), and Federation (FAL).',
    problem: 'Agencies and enterprises had no common vocabulary for "how sure are we this person is who they claim to be" versus "how sure are we this login session is legitimate," leading to inconsistent, all-or-nothing identity assurance decisions.',
    whyExists: 'To let a relying party independently dial in the right level of identity proofing rigor and authentication strength for a given risk profile, rather than treating all logins as equally trustworthy.',
    flowchart: `
+-------------------------------------------------------------+
|         NIST 800-63 THREE INDEPENDENT ASSURANCE AXES         |
+-------------------------------------------------------------+

  IAL (Identity Assurance)   AAL (Authenticator Assurance)   FAL (Federation Assurance)
  IAL1: Self-asserted        AAL1: Single-factor              FAL1: Signed assertion
  IAL2: Remote/in-person     AAL2: Multi-factor                FAL2: Signed + encrypted
        proofing w/ evidence AAL3: Hardware-based + verifier   FAL3: + key-bound holder
                                    impersonation resistance          proof (no bearer replay)
`,
    messageFormat: `// Example federation assertion metadata expressing assurance levels
{
  "vot": "P2.Cb.Ma",              // NIST 800-63 "vector of trust" style claim
  "ial": "urn:nist:800-63:ial:2",
  "aal": "urn:nist:800-63:aal:2",
  "fal": "urn:nist:800-63:fal:2"
}`,
    vulnerabilities: [
      'Mismatched assurance expectations — a relying party accepting an IAL1 (self-asserted) identity for a task that requires IAL2 proofing.',
      'AAL2 satisfied with phishable factors (SMS OTP) instead of phishing-resistant authenticators, undermining the intended assurance.',
      'FAL1 bearer assertions being replayed by a network attacker without any holder-of-key binding.'
    ],
    bestPractices: [
      'Map each business transaction to an explicit required IAL/AAL/FAL combination before choosing an identity provider.',
      'Prefer phishing-resistant authenticators (WebAuthn/Passkeys) to satisfy AAL2/AAL3 rather than OTP-based factors.',
      'Use FAL3 (key-bound assertions) for any federation flow protecting highly sensitive resources.'
    ],
    vendorSupport: [
      'Login.gov / ID.me: U.S. federal and state identity-proofing providers explicitly built to NIST 800-63 IAL2/AAL2.',
      'Okta / Microsoft Entra ID: Map authenticator strength configurations to AAL-equivalent policies.',
      'Thales SafeNet Trusted Access: Adaptive authentication policies aligned to AAL2/AAL3 requirements.',
      'GSA USAccess (PIV): Federal AAL3 hardware-based authenticator issuance program.'
    ],
    relatedResources: [
      { title: 'Government Identity Architecture', path: '/architecture?arch=government', type: 'references' },
      { title: 'GRC Maturity Wizard', path: '/assess', type: 'references' }
    ]
  },
  {
    id: 'xacml3',
    title: 'XACML 3.0',
    fullname: 'eXtensible Access Control Markup Language 3.0',
    rfcs: ['OASIS XACML 3.0 Core'],
    year: '2013',
    difficulty: 'Advanced',
    category: 'Fine-Grained Authorization',
    summary: 'XACML is a declarative, XML/JSON-based policy language and reference architecture (PEP/PDP/PAP/PIP) for expressing fine-grained, attribute-based access control decisions independent of any single application.',
    problem: 'Access control logic hardcoded into each application (if user.role == "admin") could not be centrally audited, updated, or reused, and offered no standard way to combine multiple overlapping policies consistently.',
    whyExists: 'To externalize authorization decisions into a shared Policy Decision Point (PDP), with a standard request/response schema and explicit rules for combining multiple applicable policies (deny-overrides, permit-overrides, etc.).',
    flowchart: `
+-------------------------------------------------------------+
|              XACML PEP / PDP / PIP REFERENCE FLOW            |
+-------------------------------------------------------------+

  [ App / PEP ]        [ Policy Decision Point (PDP) ]   [ PIP: Attribute Store ]
        |                          |                              |
        |--1. XACML Request ------>|                              |
        |    (Subject,Resource,    |--2. Fetch missing attributes->|
        |     Action,Environment)  |<-3. Attribute values ---------|
        |                          |--4. Evaluate applicable       |
        |                          |    policies + combine rules   |
        |<-5. Decision: Permit/Deny/Indeterminate/NotApplicable ---|
`,
    messageFormat: `// Simplified XACML policy rule (JSON profile)
{
  "Rule": {
    "RuleId": "allow-manager-approve",
    "Effect": "Permit",
    "Target": {
      "AnyOf": [{ "AllOf": [
        { "Match": { "AttributeId": "role", "Value": "manager" } },
        { "Match": { "AttributeId": "action", "Value": "approve" } }
      ]}]
    },
    "Condition": "resource.amount <= subject.approvalLimit"
  }
}`,
    vulnerabilities: [
      'Policy combining-algorithm misconfiguration (e.g. permit-overrides where deny-overrides was intended) silently widening access.',
      'PIP attribute-store compromise or staleness causing decisions to be made on outdated subject/resource attributes.',
      'Overly complex, unaudited policy sets creating unintended "Indeterminate" fallbacks that fail open instead of closed.'
    ],
    bestPractices: [
      'Default to a deny-overrides combining algorithm for any security-sensitive policy set.',
      'Fail closed — treat Indeterminate/NotApplicable PDP responses as Deny in the PEP, never as an implicit Permit.',
      'Version and test policies with representative request fixtures before deploying combining-algorithm changes.'
    ],
    vendorSupport: [
      'Axiomatics: Dedicated commercial XACML PDP/PAP suite for large enterprises.',
      'PlainID / Thales CipherTrust: Modern ABAC platforms exposing XACML-compatible policy models.',
      'WSO2 Identity Server: Open-source XACML 3.0 PDP implementation.',
      'AT&T XACML (open-source reference implementation): Common baseline used in academic and OSS projects.'
    ],
    relatedResources: [
      { title: 'XACML 3.0 Policy Engine Playground', path: '/playground/xacml', type: 'playground' },
      { title: 'OPA & Rego Playground', path: '/playground/opa', type: 'playground' },
      { title: 'Policy Evaluator Tool', path: '/tools/policy-evaluator', type: 'tool' }
    ]
  },
  {
    id: 'gnap',
    title: 'GNAP',
    fullname: 'Grant Negotiation and Authorization Protocol',
    rfcs: ['RFC 9635'],
    year: '2024',
    difficulty: 'Advanced',
    category: 'Authorization',
    summary: 'GNAP is a from-scratch redesign of the OAuth delegation model, supporting richer client instance identification, multi-step interaction (redirect, push, user-code), and key-bound (never purely bearer) access tokens.',
    problem: 'OAuth 2.0\'s client model assumes a browser-redirect-capable client and bearer tokens; it struggles to natively express non-redirect interaction (CLI tools, IoT devices), multi-party authorization, or sender-constrained tokens without extension RFCs bolted on afterward.',
    whyExists: 'To unify what OAuth had spread across many separate extension RFCs (PKCE, DPoP, device flow, PAR, rich authorization requests) into a single, coherent core protocol designed with those needs in mind from day one.',
    flowchart: `
+-------------------------------------------------------------+
|                 GNAP GRANT NEGOTIATION FLOW                  |
+-------------------------------------------------------------+

  [ Client Instance ]                 [ Authorization Server ]
             |--1. Grant Request (access requested,          |
             |     client key, interaction methods) -------->|
             |<-2. Interaction (redirect/user-code) ---------|
             |         (End-User approves out of band)        |
             |--3. Continuation Request --------------------->|
             |<-4. Access Token (key-bound) + Subject Info ---|
`,
    messageFormat: `// GNAP Grant Request (simplified)
POST /gnap/tx HTTP/1.1
Content-Type: application/json

{
  "access_token": { "access": ["read", "write"] },
  "client": { "key": { "proof": "httpsig", "jwk": { "...": "..." } } },
  "interact": { "start": ["redirect"], "finish": { "method": "redirect" } }
}`,
    vulnerabilities: [
      'Continuation token theft — if not sender-constrained, an intercepted continuation token could let an attacker complete someone else\'s grant.',
      'Weak interaction-finish validation allowing a callback to be replayed against a different, unrelated grant request.',
      'Misconfigured multi-party authorization ("RSR") logic granting access before all required approvals are collected.'
    ],
    bestPractices: [
      'Always bind access tokens and continuation tokens to the requesting client\'s key (httpsig/DPoP-style proof), never bearer-only.',
      'Validate the "interact_ref" returned at interaction-finish strictly against the originating grant request state.',
      'Model multi-party approval requirements explicitly and verify all required approvals before token issuance.'
    ],
    vendorSupport: [
      'Interledger Foundation: One of the earliest production adopters of GNAP for Open Payments.',
      'Emerging support in Financial-grade API (FAPI) 2.0 experimental profiles.',
      'Reference implementations exist for Node.js, Python, and Java; broad commercial IdP support is still maturing.',
      'Standards track under active IETF GNAP working group iteration.'
    ],
    relatedResources: [
      { title: 'GNAP Grant Negotiation Visualizer', path: '/playground/gnap', type: 'playground' }
    ]
  },
  {
    id: 'caep-ssf',
    title: 'CAEP / SSF',
    fullname: 'Continuous Access Evaluation Protocol & Shared Signals Framework',
    rfcs: ['OpenID SSF Core 1.0', 'OpenID CAEP 1.0'],
    year: '2023',
    difficulty: 'Advanced',
    category: 'Continuous Access & Signals',
    summary: 'CAEP is a profile of the Shared Signals Framework letting a transmitter (e.g. an IdP) push real-time, signed Security Event Tokens to subscribed receivers (apps/services) so they can react instantly to session-risk changes — without waiting for the next token refresh.',
    problem: 'OAuth/OIDC sessions are traditionally only re-evaluated when a token expires; a session revoked, or a user\'s risk score spiking, at the IdP had no standard way to immediately propagate that change to every app currently trusting an old, still-technically-valid token.',
    whyExists: 'To let identity providers proactively push "this session/token should no longer be trusted" (or trust-increasing) signals in real time, closing the gap between an IdP-side risk event and enforcement everywhere that session is used.',
    flowchart: `
+-------------------------------------------------------------+
|          CAEP SHARED SIGNALS TRANSMITTER/RECEIVER FLOW       |
+-------------------------------------------------------------+

 [ IdP: Signal Transmitter ]                  [ App: Signal Receiver ]
             |--1. Stream/Push registration (webhook) -------->|
             |                                                 |
        (risk engine detects impossible travel)                |
             |--2. Signed SET: session-revoked ---------------->|
             |                                                 |--3. Receiver kills local session
`,
    messageFormat: `// CAEP Security Event Token (SET) payload, RFC 8417-based JWT claims
{
  "iss": "https://idp.company.com",
  "jti": "set-8b21f...",
  "iat": 1783430000,
  "aud": "https://app.company.com",
  "events": {
    "https://schemas.openid.net/secevent/caep/event-type/session-revoked": {
      "subject": { "format": "email", "email": "brian@company.com" },
      "reason_admin": { "en": "Impossible travel detected" }
    }
  }
}`,
    vulnerabilities: [
      'Receiver fails to authenticate the SET issuer/signature, allowing a spoofed "session-revoked" or (worse) fake "trust-restored" event.',
      'Delayed or dropped webhook delivery leaving a receiver unaware of a revoked session for longer than expected.',
      'Replay of an old, previously valid SET to re-trigger a stale state change on the receiver.'
    ],
    bestPractices: [
      'Always verify the SET\'s JWS signature against the transmitter\'s published JWKS before acting on any event.',
      'Track jti (SET id) to detect and reject replayed events.',
      'Pair CAEP with a short-lived polling fallback so a missed push signal is caught on the next natural token refresh.'
    ],
    vendorSupport: [
      'Microsoft Entra ID (Continuous Access Evaluation): Native CAEP-style real-time session revocation for M365/Entra apps.',
      'Okta: Shared Signals Framework transmitter support for session and risk events.',
      'Google Workspace: Cross-Account Protection built on the same Shared Signals/RISC lineage.',
      'OpenID Foundation Shared Signals WG: Drives the open interoperability specs across vendors.'
    ],
    relatedResources: [
      { title: 'CAEP Continuous Access Evaluation Lab', path: '/playground/caep', type: 'playground' },
      { title: 'Session Hijacking & Token Theft Lab', path: '/playground/session-hijacking', type: 'playground' }
    ]
  },
  {
    id: 'vc-did',
    title: 'Verifiable Credentials & DIDs',
    fullname: 'W3C Verifiable Credentials Data Model & Decentralized Identifiers',
    rfcs: ['W3C VC Data Model 2.0', 'W3C DID Core 1.0'],
    year: '2022',
    difficulty: 'Advanced',
    category: 'Decentralized Identity',
    summary: 'Verifiable Credentials let an Issuer cryptographically sign claims about a Holder, who can later present them to any Verifier for independent proof — all anchored to Decentralized Identifiers (DIDs) that don\'t depend on a single central registry.',
    problem: 'Traditional federated identity (SAML/OIDC) always requires the Verifier to call back to the original Identity Provider online at login time, giving that IdP visibility into every place the user logs in and creating a single point of failure.',
    whyExists: 'To let a Holder collect signed credentials once and present cryptographic proof of them later, offline, to any Verifier — without the original Issuer being involved in, or even aware of, each individual presentation.',
    flowchart: `
+-------------------------------------------------------------+
|         ISSUER → HOLDER → VERIFIER TRUST TRIANGLE           |
+-------------------------------------------------------------+

  [ Issuer ]                [ Holder / Wallet ]              [ Verifier ]
      |--1. Issue signed VC ------->|                              |
      |    (bound to Holder's DID)  |                              |
      |                             |--2. Present VP (selective    |
      |                             |    disclosure) ------------->|
      |                             |                              |--3. Resolve Issuer DID,
      |                             |                              |    verify signature offline
`,
    messageFormat: `// Simplified Verifiable Credential (JSON-LD, Ed25519 proof)
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": ["VerifiableCredential", "AgeOverCredential"],
  "issuer": "did:web:idp.company.com",
  "credentialSubject": {
    "id": "did:key:z6Mkf...HolderKey",
    "ageOver": 18
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-07-23T10:00:00Z",
    "proofValue": "z3Fh9...signature"
  }
}`,
    vulnerabilities: [
      'DID document takeover — an attacker who compromises the DID\'s update key can rotate in their own verification keys and impersonate the subject.',
      'Verifier failing to check credential revocation status (status list), accepting a credential the Issuer has since revoked.',
      'Correlation/linkability leaks from reusing the same DID or credential across many Verifiers, undermining selective-disclosure privacy goals.'
    ],
    bestPractices: [
      'Use a status list or revocation registry and check it on every presentation, not just at issuance time.',
      'Rotate Holder DIDs (or use pairwise DIDs per relationship) to minimize cross-Verifier correlation.',
      'Verify the full chain — Issuer DID resolution, signature validity, and expiration — offline before trusting any claim.'
    ],
    vendorSupport: [
      'Microsoft Entra Verified ID: Enterprise-grade VC issuance/verification built on DID:web.',
      'EU Digital Identity Wallet (eIDAS 2.0): Government-backed Verifiable Credential wallet initiative.',
      'Thales Digital Identity Wallet solutions: VC-based mobile ID and credential issuance.',
      'Trinsic / Dock / Veramo: Developer-focused VC/DID issuance and verification SDKs.'
    ],
    relatedResources: [
      { title: 'Verifiable Credentials & DID Lab', path: '/playground/vc-did', type: 'playground' },
      { title: 'Zero-Knowledge Proof (ZKP) Wallet', path: '/playground/zkp-wallet', type: 'playground' }
    ]
  },
  {
    id: 'spiffe-spire',
    title: 'SPIFFE / SPIRE',
    fullname: 'Secure Production Identity Framework For Everyone',
    rfcs: ['SPIFFE Standard (CNCF)'],
    year: '2018',
    difficulty: 'Advanced',
    category: 'Workload Identity',
    summary: 'SPIFFE defines a universal identity namespace (the SPIFFE ID) and a short-lived X.509/JWT credential format (SVID) for non-human workloads; SPIRE is the reference runtime that attests and issues these identities automatically, with no static secrets.',
    problem: 'Microservices traditionally authenticated to each other with long-lived, static API keys or shared certificates baked into config files or environment variables — a huge blast radius if any single service or CI pipeline leaked one.',
    whyExists: 'To give every workload (container, VM, function) a cryptographically verifiable identity that is automatically issued based on runtime attestation (not a static secret), rotated frequently, and portable across clouds and clusters.',
    flowchart: `
+-------------------------------------------------------------+
|            SPIFFE/SPIRE WORKLOAD ATTESTATION FLOW            |
+-------------------------------------------------------------+

  [ Workload / Pod ]        [ SPIRE Agent (node-local) ]    [ SPIRE Server ]
          |--1. Request SVID via Workload API -->|                    |
          |                                       |--2. Node + workload
          |                                       |    attestation --->|
          |                                       |<-3. Signed SVID ---|
          |<-4. X.509-SVID / JWT-SVID (short TTL)-|                    |
`,
    messageFormat: `// SPIFFE ID and X.509-SVID subject alternative name
spiffe://company.com/ns/payments/sa/checkout-service

// Decoded SVID certificate SAN extension (conceptual)
X509v3 Subject Alternative Name:
  URI:spiffe://company.com/ns/payments/sa/checkout-service`,
    vulnerabilities: [
      'Weak node attestation (e.g. trusting cloud metadata blindly) allowing a rogue workload on the same node to obtain an unintended SVID.',
      'Overly broad SPIFFE ID namespace scoping granting a compromised workload identity trust beyond its actual service boundary.',
      'SPIRE Server private key compromise, which would let an attacker mint arbitrary trusted identities for any workload.'
    ],
    bestPractices: [
      'Scope node and workload attestors as tightly as possible (e.g. Kubernetes namespace + service account, not just "any pod on this node").',
      'Keep SVID TTLs short (minutes, not days) so a leaked credential has minimal usable lifetime.',
      'Protect the SPIRE Server\'s signing key in an HSM/KMS and monitor for anomalous registration entry changes.'
    ],
    vendorSupport: [
      'CNCF SPIFFE/SPIRE: Graduated CNCF project, the de facto open standard for workload identity.',
      'Istio: Uses SPIFFE identities natively for service mesh mTLS.',
      'HashiCorp Consul / Vault: Integrates SPIFFE SVIDs for service identity and secrets access.',
      'AWS/GCP/Azure managed service mesh offerings increasingly support SPIFFE-compatible workload identity.'
    ],
    relatedResources: [
      { title: 'NHI Workload Mesh (SPIFFE) Lab', path: '/playground/workload-mesh', type: 'playground' },
      { title: 'Multi-Cloud Identity Architecture', path: '/architecture?arch=multi_cloud', type: 'references' }
    ]
  },
  {
    id: 'dpop',
    title: 'DPoP',
    fullname: 'Demonstrating Proof-of-Possession at the Application Layer',
    rfcs: ['RFC 9449'],
    year: '2023',
    difficulty: 'Advanced',
    category: 'Tokens & Cryptography',
    summary: 'DPoP binds an OAuth access/refresh token to a client-held private key, so a resource server can require proof of possession of that key on every request — turning a copyable "bearer" token into a sender-constrained one, without needing full mTLS infrastructure.',
    problem: 'Classic OAuth Bearer tokens are usable by anyone who possesses them — if a token leaks (via XSS, a misconfigured log, or a malicious proxy), the thief can replay it from anywhere with zero additional proof required.',
    whyExists: 'To let public clients (SPAs, mobile apps) that can\'t practically hold an mTLS client certificate still get sender-constrained tokens, using a lightweight, per-request signed JWT proof generated from a client-held key pair.',
    flowchart: `
+-------------------------------------------------------------+
|                 DPoP-BOUND TOKEN REQUEST FLOW                |
+-------------------------------------------------------------+

  [ Client (holds keypair) ]           [ Authorization / Resource Server ]
             |--1. Token request + DPoP proof JWT           |
             |    (signed w/ client's private key) -------->|
             |<-2. Access token bound to client's public key (jkt) --|
             |                                               |
             |--3. API call + Authorization: DPoP <token>    |
             |     + fresh DPoP proof JWT ------------------>|
             |<-4. Server verifies proof matches token's jkt-|
`,
    messageFormat: `// DPoP Proof JWT header + payload (sent as the "DPoP" HTTP header)
{
  "typ": "dpop+jwt",
  "alg": "ES256",
  "jwk": { "kty": "EC", "crv": "P-256", "x": "...", "y": "..." }
}
{
  "jti": "e1j3V_bKic8-LAEB",
  "htm": "POST",
  "htu": "https://api.company.com/orders",
  "iat": 1783430000
}`,
    vulnerabilities: [
      'Missing jti replay tracking on the resource server, allowing a captured DPoP proof to be reused within its short validity window.',
      'Client private key theft (e.g. via XSS in a browser SPA) still fully defeats DPoP, since the attacker can just sign new proofs.',
      'Clock-skew tolerance set too generously, widening the effective replay window for a stolen proof JWT.'
    ],
    bestPractices: [
      'Track recently-seen jti values per key and reject duplicates within the proof\'s validity window.',
      'Generate the DPoP key pair in a non-extractable form (e.g. Web Crypto CryptoKey with extractable:false) wherever the runtime supports it.',
      'Bind the "htm"/"htu" claims strictly to the exact request method and URL to prevent proof reuse across endpoints.'
    ],
    vendorSupport: [
      'Curity / Ping Identity: Early adopters offering DPoP-bound token issuance and validation.',
      'Keycloak: Native DPoP support for OAuth client and resource server integrations.',
      'Financial-grade API (FAPI) 2.0: Recommends DPoP as a lighter-weight alternative to mTLS-bound tokens.',
      'Node/Browser DPoP libraries (oauth4webapi, panva/jose ecosystem) are now widely available for SPA implementations.'
    ],
    relatedResources: [
      { title: 'Session Hijacking & Token Theft Lab', path: '/playground/session-hijacking', type: 'playground' },
      { title: 'OAuth PKCE Generator Tool', path: '/tools/oauth-pkce-generator', type: 'tool' }
    ]
  }
]
