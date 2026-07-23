// Single source of truth for the /architecture "Interactive Architecture Center" library.
// Both ArchitectureCenter.tsx (the page) and searchService.ts (the command palette / global
// search index) import this same array, so every architecture is automatically both rendered
// and searchable — see GEMINI.md §4S for the "how to add a new one" convention.

export type ArchitectureDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type ArchitectureGroup = 'fundamentals' | 'protocol' | 'industry'

export interface ArchitectureNode {
  title: string
  role: string
  analogy: string
  spec: string
  threatModel: string
  bestPractice: string
}

export interface Architecture {
  id: string
  name: string
  description: string
  difficulty: ArchitectureDifficulty
  group: ArchitectureGroup
  /** Which node id the diagram should highlight by default when this architecture is selected. */
  defaultNode: string
  /** Hand-picked search/filter terms not already present in the name (standards, acronyms, etc.). */
  tags: string[]
  nodes: Record<string, ArchitectureNode>
  /** Optional cross-links to hands-on tools/playgrounds that validate this architecture's protocols — same shape as standardsData.ts/caseStudiesData.ts. */
  relatedResources?: { title: string; path: string; type: 'tool' | 'playground' | 'references' }[]
}

export const ARCHITECTURES: Architecture[] = [
  // ————————————————————————————————————————————————————————————————————————
  // BEGINNER — FUNDAMENTALS
  // ————————————————————————————————————————————————————————————————————————
  {
    id: 'basic_session_auth',
    name: 'Monolithic Web App Session Authentication',
    description: 'The foundational request/response login pattern for a single server-rendered web application: a password check, a server-side session, and a cookie — the starting point before any federation or token exchange is introduced.',
    difficulty: 'Beginner',
    group: 'fundamentals',
    defaultNode: 'browser',
    tags: ['session', 'cookie', 'monolith', 'password', 'login'],
    nodes: {
      browser: {
        title: 'Web Browser',
        role: 'Submits the login form and stores the session cookie the server issues after a successful check.',
        analogy: 'A hotel guest handing over ID at the front desk and getting a room key card back.',
        spec: 'Sends credentials over HTTPS via a standard HTML POST form; stores the `Set-Cookie` session identifier automatically for subsequent requests.',
        threatModel: 'Threat: Session cookie theft via XSS. Mitigation: Set the cookie `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` so client-side scripts and cross-site requests cannot read or replay it.',
        bestPractice: 'Never store any authentication state in localStorage/sessionStorage — use HttpOnly cookies exclusively for session identifiers.'
      },
      app_server: {
        title: 'Application Server',
        role: 'Verifies submitted credentials against the user store and creates a new server-side session on success.',
        analogy: 'The front-desk clerk who checks your ID against the reservation system and cuts a new key card.',
        spec: 'Compares the submitted password against a stored bcrypt/argon2 hash, then generates a cryptographically random session ID and persists it server-side.',
        threatModel: 'Threat: Credential stuffing against the login endpoint. Mitigation: Rate-limit login attempts per account/IP and enforce account lockout or CAPTCHA after repeated failures.',
        bestPractice: 'Regenerate the session ID on every successful login to prevent session fixation attacks.'
      },
      session_store: {
        title: 'Server-Side Session Store',
        role: 'Holds session state (user ID, roles, expiry) keyed by the session ID, looked up on every subsequent request.',
        analogy: "The hotel's key-card system database mapping card numbers to room assignments and checkout dates.",
        spec: 'An in-memory cache (Redis) or database table mapping opaque session tokens to server-side session objects, with a sliding or absolute expiry.',
        threatModel: 'Threat: Session store compromise exposing every active user session. Mitigation: Encrypt session data at rest and set short absolute session lifetimes even for "remember me" flows.',
        bestPractice: "Invalidate the session server-side immediately on logout — don't rely on the client discarding the cookie."
      },
      user_db: {
        title: 'User Credentials Database',
        role: 'Stores the durable record of registered users and their hashed passwords.',
        analogy: "The hotel's permanent guest registry, separate from the daily key-card system.",
        spec: 'A relational table storing `username`, a salted password hash (bcrypt/argon2id), and account metadata — never the plaintext password.',
        threatModel: 'Threat: SQL injection extracting the entire credentials table. Mitigation: Use parameterized queries/ORM exclusively and store only irreversible password hashes, never encrypted plaintext.',
        bestPractice: 'Use argon2id or bcrypt with a tuned cost factor — never MD5/SHA-1/plain SHA-256 for password storage.'
      }
    }
  },
  {
    id: 'ldap_onprem',
    name: 'On-Premises LDAP / Active Directory Bind Authentication',
    description: 'The classic enterprise pattern predating modern federation: an application authenticates a user by performing an LDAP bind directly against the corporate directory, and the directory issues a Kerberos ticket for further access.',
    difficulty: 'Beginner',
    group: 'fundamentals',
    defaultNode: 'workstation',
    tags: ['ldap', 'active directory', 'kerberos', 'on-premises', 'bind'],
    nodes: {
      workstation: {
        title: 'Employee Workstation',
        role: 'The domain-joined machine where the employee logs in with their Windows domain username and password.',
        analogy: 'An employee badging into the building using the same badge issued by the corporate security office.',
        spec: "Initiates a Kerberos AS-REQ (or, for a legacy app, a direct LDAP simple bind) using the domain-joined machine's Windows logon credentials.",
        threatModel: 'Threat: Pass-the-hash attacks replaying captured NTLM hashes. Mitigation: Disable NTLM fallback where possible and enforce Kerberos-only authentication with modern encryption types.',
        bestPractice: 'Join workstations to the domain via a hardened, monitored provisioning process rather than manual configuration.'
      },
      domain_controller: {
        title: 'Active Directory Domain Controller',
        role: 'Validates the LDAP bind (or Kerberos pre-auth) against the directory and returns group membership for authorization.',
        analogy: "The building's central security office that checks your badge number against the master employee list.",
        spec: "An LDAPv3 server performing a simple or SASL bind against the `distinguishedName`, returning `memberOf` group attributes on success.",
        threatModel: 'Threat: LDAP injection via unsanitized filter strings. Mitigation: Escape all user-supplied input before building LDAP filter strings, and prefer parameterized bind APIs.',
        bestPractice: 'Disable anonymous and unauthenticated LDAP binds domain-wide; require signed and encrypted LDAP (LDAPS/StartTLS) only.'
      },
      kerberos_kdc: {
        title: 'Kerberos Key Distribution Center (KDC)',
        role: 'Issues a Ticket Granting Ticket (TGT) after successful authentication, letting the user access multiple services without re-entering credentials.',
        analogy: 'A single all-day wristband issued after your first ID check, honored at every ride in the park without re-checking your ID.',
        spec: "Co-located with the Domain Controller; issues a TGT encrypted with the user's long-term key, followed by service tickets (TGS) for each accessed resource.",
        threatModel: 'Threat: Golden Ticket forgery using a compromised krbtgt account hash. Mitigation: Rotate the krbtgt account password twice, on a schedule, and monitor for anomalously long-lived ticket lifetimes.',
        bestPractice: 'Set conservative TGT/service-ticket lifetimes and renewal windows rather than defaulting to the maximum allowed.'
      },
      file_server: {
        title: 'Target File / Application Server',
        role: "The resource being accessed (file share, intranet app), which trusts a valid Kerberos service ticket instead of re-authenticating the user.",
        analogy: 'The specific ride at the park that scans your wristband instead of asking for ID again.',
        spec: "Validates the presented Kerberos service ticket against its own service principal key, extracting the user's identity and group SIDs for access checks.",
        threatModel: 'Threat: Silver Ticket forgery using a compromised service account password. Mitigation: Use long, randomly generated service account passwords and rotate them regularly (or use group Managed Service Accounts).',
        bestPractice: 'Run services under gMSA (group Managed Service Accounts) instead of static, human-set service account passwords.'
      }
    }
  },
  {
    id: 'social_login_basic',
    name: 'Simple Social Login (Consumer OAuth Sign-In)',
    description: 'The minimal "Sign in with Google/GitHub" pattern for a small app that just wants to authenticate a user without building its own password system or a full CIAM profile store.',
    difficulty: 'Beginner',
    group: 'fundamentals',
    defaultNode: 'browser',
    tags: ['social login', 'oauth', 'consumer', 'oidc', 'sign in with google'],
    nodes: {
      browser: {
        title: 'App Browser Session',
        role: "Redirects the user to the social provider and later receives the callback carrying the authorization result.",
        analogy: 'A guest at a conference using their existing company badge to check in rather than filling out a new registration form.',
        spec: "Performs a standard OAuth 2.0 Authorization Code redirect to the social provider's `/authorize` endpoint with the app's registered `client_id` and `redirect_uri`.",
        threatModel: 'Threat: Open-redirect abuse of the callback URL. Mitigation: Register and strictly validate an exact-match allow-list of redirect URIs with the social provider.',
        bestPractice: 'Always include and validate PKCE and a random `state` parameter, even for this simplest of flows.'
      },
      social_provider: {
        title: 'Social Identity Provider (Google / GitHub)',
        role: 'Authenticates the user against their existing account and issues a signed ID token confirming who they are.',
        analogy: 'The conference badge printer that already has your identity on file from a prior registration.',
        spec: 'An OIDC-compliant provider issuing a signed JWT ID Token containing `sub`, `email`, and `name` claims after the user approves the consent screen.',
        threatModel: 'Threat: Compromised social account granting an attacker access to every app the user signed into with it. Mitigation: Encourage users to enable MFA on their social account, since it is now the single point of failure for every federated app.',
        bestPractice: 'Request only the minimal scopes needed (`openid email profile`) — avoid requesting broad data-access scopes just for login.'
      },
      app_backend: {
        title: 'App Backend',
        role: "Verifies the ID token's signature and creates or matches a local user record keyed by the provider's `sub` claim.",
        analogy: 'The conference front desk that reads your printed badge and looks you up (or creates a new entry) in their own guest list.',
        spec: "Validates the ID token JWT signature against the provider's published JWKS, then upserts a local user row keyed on `(provider, sub)`.",
        threatModel: 'Threat: Email-based account takeover if two providers return the same email for different real people. Mitigation: Key the local user record on the immutable `(issuer, sub)` pair, never on the mutable `email` claim alone.',
        bestPractice: 'Store the provider and subject ID together, not just the email, to prevent account-linking confusion across providers.'
      }
    }
  },
  {
    id: 'api_key_auth',
    name: 'REST API Key Authentication',
    description: 'The simplest machine-to-machine credential model: a long-lived static secret sent with every request, appropriate for low-risk internal integrations but the first thing to graduate away from as a system matures.',
    difficulty: 'Beginner',
    group: 'fundamentals',
    defaultNode: 'client_service',
    tags: ['api key', 'm2m', 'static secret', 'integration'],
    nodes: {
      client_service: {
        title: 'Calling Client / Integration',
        role: 'A script or partner service that attaches a pre-issued static API key to every outbound request.',
        analogy: 'A delivery courier showing the same laminated gate pass every single day to enter the loading dock.',
        spec: 'Sends the key in a custom header (e.g. `X-API-Key`) or as a Bearer token on every HTTPS request — no expiry, no rotation ceremony required by the protocol itself.',
        threatModel: 'Threat: Key leaked in a public repo or client-side bundle. Mitigation: Never embed API keys in client-side/browser code; treat them as server-side-only secrets stored in a secrets manager.',
        bestPractice: 'Scope each partner to its own unique key rather than sharing one key across multiple integrations.'
      },
      api_gateway: {
        title: 'API Gateway',
        role: 'Validates the presented key against the registry of issued keys and enforces per-key rate limits before forwarding the request.',
        analogy: 'The loading-dock guard who checks the laminated pass against a clipboard list and logs the time of entry.',
        spec: 'Looks up the key in a fast key-value store, checks it is active and not revoked, and applies per-key rate-limiting and usage quotas.',
        threatModel: 'Threat: A single compromised key going undetected due to no anomaly monitoring. Mitigation: Alert on sudden spikes in request volume or requests from unexpected geographies for a given key.',
        bestPractice: 'Support key rotation without downtime by allowing two active keys per client during a rollover window.'
      },
      backend_service: {
        title: 'Backend Service',
        role: "The protected resource that trusts the gateway's validation and processes the request under the identity/scope tied to that key.",
        analogy: 'The warehouse floor that only ever sees pre-cleared couriers, never checking credentials itself.',
        spec: 'Receives the request already annotated with the resolved client identity (from the gateway) and applies any additional per-client authorization rules.',
        threatModel: "Threat: Overly broad key scope granting access far beyond what an integration needs. Mitigation: Bind each key to the minimal set of endpoints/scopes the integration actually requires.",
        bestPractice: 'Log every request with the associated key ID for after-the-fact forensic traceability.'
      }
    }
  },
  {
    id: 'rbac_basic',
    name: 'Basic Role-Based Access Control in a Single Web App',
    description: 'The first authorization model most applications reach for after login works: assign each user one or more roles, and gate features by role rather than checking individual permissions ad hoc.',
    difficulty: 'Beginner',
    group: 'fundamentals',
    defaultNode: 'user',
    tags: ['rbac', 'authorization', 'roles', 'access control'],
    nodes: {
      user: {
        title: 'Authenticated User',
        role: 'A logged-in user whose session or token carries one or more assigned role names (e.g. `admin`, `editor`, `viewer`).',
        analogy: "An employee wearing a colored lanyard denoting their department clearance level.",
        spec: "Carries a `roles` claim or session attribute populated at login time from the user's row in the application database.",
        threatModel: 'Threat: Role tampering if roles are read from a client-editable source (e.g. a JWT signed with a weak or leaked key). Mitigation: Only trust role claims from tokens signed by a key the server controls, never from client-supplied form fields.',
        bestPractice: "Re-fetch or re-validate the user's current roles periodically rather than trusting a role claim forever, so revoked access takes effect promptly."
      },
      app_middleware: {
        title: 'Authorization Middleware',
        role: "Intercepts each request, reads the user's role, and checks it against the roles permitted for the requested route or action.",
        analogy: "The department floor's badge reader that only unlocks doors matching your lanyard color.",
        spec: "A route-level guard (e.g. `requireRole(['admin'])` middleware) executed before the route handler, short-circuiting with a 403 on mismatch.",
        threatModel: 'Threat: Forgetting to apply the guard on a newly added route ("missing function-level access control"). Mitigation: Default-deny at the framework level — require every route to explicitly declare its allowed roles rather than defaulting to open.',
        bestPractice: 'Centralize role-check logic in one reusable middleware/decorator instead of repeating `if (user.role === ...)` checks inline across handlers.'
      },
      role_assignment: {
        title: 'Role Assignment Store',
        role: 'The durable mapping of which roles each user currently holds, editable by an administrator.',
        analogy: "The HR system's org chart recording which department badge each employee is currently issued.",
        spec: 'A simple `user_roles` join table (or a `roles` array column) in the primary application database, updated through an admin UI.',
        threatModel: 'Threat: Privilege creep — users accumulating roles over time as responsibilities change but old roles are never removed. Mitigation: Periodically review and prune role assignments, especially after an internal transfer.',
        bestPractice: 'Keep the set of roles small and coarse (a handful, not dozens) — if you need fine-grained per-resource rules, that is a sign to graduate to ABAC.'
      },
      protected_resource: {
        title: 'Protected Feature / Resource',
        role: 'The page, API endpoint, or UI element that should only be reachable by users holding the required role.',
        analogy: 'The executive floor that the badge reader physically prevents non-executives from entering.',
        spec: "Any route or component wrapped by the authorization middleware's role check before rendering data or executing a mutation.",
        threatModel: 'Threat: Client-side-only hiding of a UI button without a matching server-side check, letting an attacker call the API directly. Mitigation: Always enforce the role check server-side; client-side hiding is UX polish only, never the security boundary.',
        bestPractice: 'Treat every client-visible role check as cosmetic and duplicate the real check on the server for every mutating action.'
      }
    }
  },

  // ————————————————————————————————————————————————————————————————————————
  // INTERMEDIATE — FUNDAMENTALS
  // ————————————————————————————————————————————————————————————————————————
  {
    id: 'jwt_stateless_api',
    name: 'JWT Stateless API Authentication',
    description: 'Replaces the server-side session of the monolithic pattern with a self-contained, cryptographically signed JWT — trading server-side revocability for horizontal scalability across stateless API instances.',
    difficulty: 'Intermediate',
    group: 'fundamentals',
    defaultNode: 'client',
    tags: ['jwt', 'stateless', 'access token', 'refresh token', 'api'],
    nodes: {
      client: {
        title: 'API Client',
        role: 'Logs in once to obtain an access/refresh token pair, then attaches the access token as a Bearer header on every subsequent call.',
        analogy: 'A festival-goer given a stamped wristband at the gate that every stage entrance can check without radioing back to the gate.',
        spec: 'Stores the short-lived access token in memory (not localStorage) and the longer-lived refresh token in an HttpOnly cookie, using it to silently mint new access tokens.',
        threatModel: 'Threat: Access token theft via XSS granting the attacker a valid, unrevocable token until it expires. Mitigation: Keep access token lifetimes very short (minutes) so a stolen token has a tight blast-radius window.',
        bestPractice: 'Never persist the access token in localStorage/sessionStorage where any injected script can read it.'
      },
      auth_service: {
        title: 'Authentication / Token Service',
        role: 'Verifies login credentials once and issues a signed JWT access token plus a separate refresh token.',
        analogy: 'The festival gate booth that checks your ticket once and stamps a wristband good for the rest of the day.',
        spec: 'Signs the access token with an asymmetric key (RS256/ES256) so any API instance can verify it locally using only the public key — no shared session store needed.',
        threatModel: 'Threat: Refresh token theft granting indefinite re-issuance of new access tokens. Mitigation: Rotate the refresh token on every use (refresh token rotation) and detect/reject reuse of an already-rotated-out token.',
        bestPractice: 'Sign with an asymmetric algorithm (RS256/ES256), not a shared HMAC secret, so verifying services never need the signing key itself.'
      },
      api_service: {
        title: 'Stateless API Service',
        role: 'Validates the JWT signature and claims locally on every request, with no server-side session lookup required.',
        analogy: "Any stage entrance at the festival — each one independently checks the wristband's hologram without calling the gate booth.",
        spec: "Fetches and caches the auth service's JWKS public keys, then verifies signature, `exp`, `iss`, and `aud` claims on every incoming request with zero shared state.",
        threatModel: 'Threat: A compromised token cannot be revoked before its natural expiry, since there is no server-side session to invalidate. Mitigation: Keep access-token TTLs short and maintain a small denylist cache for the rare "revoke immediately" case (e.g. detected account compromise).',
        bestPractice: 'Scale API instances horizontally with zero shared session infrastructure — that is the entire point of this pattern.'
      }
    },
    relatedResources: [
      { title: 'JWT Decoder', path: '/tools/jwt-decoder', type: 'tool' },
      { title: 'JWT Generator', path: '/tools/jwt-generator', type: 'tool' },
      { title: 'JWT Playground', path: '/playground/jwt', type: 'playground' }
    ]
  },
  {
    id: 'sso_reverse_proxy',
    name: 'SSO Reverse Proxy for Legacy Applications',
    description: 'Bolts modern SSO onto an old application that cannot itself speak OIDC/SAML, by placing an authenticating reverse proxy in front of it that injects trusted identity headers.',
    difficulty: 'Intermediate',
    group: 'fundamentals',
    defaultNode: 'user',
    tags: ['sso', 'reverse proxy', 'legacy', 'header auth', 'oauth2-proxy'],
    nodes: {
      user: {
        title: 'End User',
        role: "Navigates directly to the legacy app's URL, unaware that a proxy is intercepting and authenticating the request first.",
        analogy: 'A visitor who thinks they walked straight into the archive room, not realizing a checkpoint just outside the door already verified them.',
        spec: "Sends a normal browser request to the legacy app's hostname, which actually resolves to the reverse proxy.",
        threatModel: 'Threat: Direct network access to the legacy app bypassing the proxy entirely. Mitigation: Firewall the legacy app so it only accepts connections from the proxy\'s IP, never directly from the internet or general LAN.',
        bestPractice: "Never expose the legacy app's real network address to end users or DNS — only the proxy's."
      },
      reverse_proxy: {
        title: 'Authenticating Reverse Proxy',
        role: 'Intercepts every request, forces an OIDC/SAML login if no valid session exists, then injects trusted identity headers before forwarding.',
        analogy: 'The checkpoint guard who checks your badge, then stamps a "cleared" ticket that everyone further inside will simply trust.',
        spec: "A tool like oauth2-proxy or a commercial Access Gateway performing the OIDC flow itself, then setting headers like `X-Forwarded-User`/`X-Forwarded-Email` on the proxied request.",
        threatModel: "Threat: Header spoofing if the legacy app is ever reachable by another path that lets an attacker set those same headers directly. Mitigation: Strip any client-supplied `X-Forwarded-*` headers at the network edge before the proxy adds its own trusted ones.",
        bestPractice: 'Terminate TLS at the proxy and use a private, proxy-only network segment for the hop to the legacy app.'
      },
      idp: {
        title: 'Central Identity Provider',
        role: 'Performs the actual OIDC/SAML authentication and issues the identity assertion the proxy consumes.',
        analogy: "The main security office that actually checks your ID and radios ahead that you're cleared.",
        spec: 'A standard OIDC/SAML IdP (Okta, Entra ID, Keycloak) federated only with the reverse proxy, not with the legacy app itself.',
        threatModel: "Threat: IdP session lasting far longer than appropriate for a sensitive legacy system. Mitigation: Configure a shorter session/re-auth interval at the proxy for high-sensitivity legacy apps than the IdP's organization-wide default.",
        bestPractice: 'Federate the IdP with the proxy only — the legacy app never needs to know OIDC/SAML exists.'
      },
      legacy_app: {
        title: 'Legacy Application',
        role: 'The old app (often trusting a simple username in a header) that has no native SSO support of its own.',
        analogy: 'The archive room itself, which has no ID reader of its own and just trusts whoever the checkpoint already stamped as cleared.',
        spec: 'Reads the trusted `X-Forwarded-User` header as the authenticated identity, exactly as it might have once trusted a hardcoded username — unmodified from before the proxy was added.',
        threatModel: 'Threat: The legacy app itself has no independent authorization checks and blindly trusts every forwarded header. Mitigation: Where feasible, still validate that requests originate only from the proxy\'s network segment as defense-in-depth.',
        bestPractice: 'Treat fronting a legacy app with a reverse proxy as a bridge, not a permanent architecture — plan an eventual native OIDC/SAML migration.'
      }
    }
  },
  {
    id: 'mfa_stepup',
    name: 'Step-Up MFA (TOTP) Architecture',
    description: 'Layers a second, stronger authentication factor on top of an already-authenticated session only when the action being attempted is sensitive enough to warrant it — rather than demanding MFA on every login.',
    difficulty: 'Intermediate',
    group: 'fundamentals',
    defaultNode: 'user',
    tags: ['mfa', 'step-up', 'totp', 'rfc 6238', 'assurance'],
    nodes: {
      user: {
        title: 'Authenticated User',
        role: 'Already holds a valid low-assurance session (e.g. password-only) and attempts a sensitive action like a large funds transfer.',
        analogy: 'A bank customer who is already inside the branch lobby but now wants to access the safe-deposit vault, which needs a second check.',
        spec: 'Carries a session with an `amr` (Authentication Methods Reference) claim indicating only `pwd` was used, not yet `otp`.',
        threatModel: 'Threat: A stolen low-assurance session cookie being reused to attempt a high-value action. Mitigation: Gate every sensitive action on an `amr`/assurance-level check, not merely "is there a valid session."',
        bestPractice: 'Design sensitive endpoints to explicitly declare the minimum assurance level they require.'
      },
      risk_engine: {
        title: 'Risk / Policy Engine',
        role: 'Evaluates the requested action against risk signals (amount, device, location) to decide whether step-up is required.',
        analogy: 'The vault manager glancing at the transaction slip and deciding whether this particular request needs the extra key.',
        spec: 'A rules or ML-based engine scoring the request against transaction value thresholds, device trust, IP reputation, and recent authentication history.',
        threatModel: 'Threat: Risk engine consistently under-triggering step-up for a class of high-risk transactions due to miscalibrated thresholds. Mitigation: Continuously backtest the risk model against confirmed fraud outcomes and retune thresholds.',
        bestPractice: 'Fail closed — if the risk engine is unreachable or errors, default to requiring step-up rather than silently allowing the action.'
      },
      totp_verifier: {
        title: 'TOTP Step-Up Verifier',
        role: "Prompts for and validates a time-based one-time code from the user's authenticator app before releasing the sensitive action.",
        analogy: "The second vault key that only the manager keeps, required in addition to the customer's own key to open the box.",
        spec: 'Validates a 6-digit RFC 6238 TOTP code against the user\'s enrolled shared secret, within the standard ±1 time-step drift window.',
        threatModel: 'Threat: TOTP secret leaked from an insecure enrollment flow or SMS-based fallback intercepted via SIM swap. Mitigation: Prefer app-based TOTP or FIDO2 over SMS OTP, and never display the raw enrollment secret after initial setup.',
        bestPractice: 'Upgrade this step-up factor to FIDO2/WebAuthn where the client supports it — phishing-resistant and no shared secret to steal.'
      },
      protected_action: {
        title: 'Sensitive Action Handler',
        role: 'Executes the sensitive operation (funds transfer, password change, admin setting update) only after step-up succeeds.',
        analogy: 'The vault door itself, which only swings open once both keys have turned.',
        spec: "Checks the session's `amr` claim now includes the step-up method and a recent `auth_time` before executing the mutation, then re-locks (requires step-up again) after a short window.",
        threatModel: 'Threat: A single step-up being reused indefinitely for repeated later actions without re-checking freshness. Mitigation: Require the step-up assertion to have occurred within a short recent window (e.g. 5 minutes) of the action itself.',
        bestPractice: 'Expire the step-up "credential" quickly — treat it as proof of intent for this action, not a standing elevated session.'
      }
    }
  },
  {
    id: 'iga_access_review',
    name: 'Identity Governance & Administration (IGA) Access Review',
    description: 'The periodic governance loop — separate from day-to-day authentication — that certifies whether every user\'s current entitlements across every connected system are still justified.',
    difficulty: 'Intermediate',
    group: 'fundamentals',
    defaultNode: 'manager',
    tags: ['iga', 'access review', 'certification', 'governance', 'joiner mover leaver'],
    nodes: {
      manager: {
        title: 'Reviewing Manager',
        role: "Periodically certifies or revokes each of their direct reports' entitlements across connected applications.",
        analogy: 'A landlord doing an annual walk-through of who still has a key to which unit.',
        spec: "Reviews a generated access-certification campaign listing each report's current app/role entitlements, approving or flagging each line item.",
        threatModel: 'Threat: Rubber-stamp approvals ("certify all") without genuine review, letting stale access persist indefinitely. Mitigation: Track and report reviewer engagement metrics (time spent, revocation rate) and flag suspiciously fast blanket approvals for audit.',
        bestPractice: "Require an explicit justification note whenever a manager approves access flagged as unusual (e.g. access to a system outside the employee's department)."
      },
      iga_platform: {
        title: 'IGA Governance Platform',
        role: 'Aggregates entitlement data from every connected system, generates review campaigns, and enforces revocation of denied access.',
        analogy: "The building super's master log tracking every key ever issued across every unit and contractor.",
        spec: 'A platform (SailPoint, Saviynt) ingesting entitlement feeds from HR, AD, and SaaS apps, running scheduled or event-triggered certification campaigns.',
        threatModel: 'Threat: Stale or incomplete entitlement feeds from a connected system causing reviewers to certify against outdated data. Mitigation: Monitor connector freshness/health and block a campaign from starting if a source feed is stale beyond a defined threshold.',
        bestPractice: 'Trigger event-driven micro-certifications (e.g. on a role change) in addition to the standard periodic campaign, rather than relying solely on an annual cycle.'
      },
      hr_system: {
        title: 'HR System of Record',
        role: "Provides the authoritative org chart, employment status, and manager-report relationships the campaign is built on.",
        analogy: "The tenant registry confirming who actually lives in the building and who their unit's responsible party is.",
        spec: 'An HRIS (Workday, SAP SuccessFactors) feeding joiner/mover/leaver events and org hierarchy via a scheduled or real-time integration.',
        threatModel: "Threat: A terminated employee's access surviving because the HR feed lagged the actual termination date. Mitigation: Trigger an immediate, out-of-cycle access revocation the moment a termination event is received, rather than waiting for the next scheduled sync.",
        bestPractice: 'Treat the HR feed as the single source of truth for "who should have any access at all" — never let application-local user records outlive it.'
      },
      target_systems: {
        title: 'Target Application Entitlements',
        role: 'The actual apps/directories/AD groups whose entitlements are being certified and, if denied, must be actively revoked.',
        analogy: "Every individual unit's lock, each of which the super must actually re-key once a certification denies a tenant's continued access.",
        spec: 'Connected systems (AD groups, SaaS role assignments, database grants) that expose a provisioning API the IGA platform calls to enforce a "revoke" decision.',
        threatModel: 'Threat: A revocation decision recorded in the IGA platform but never actually propagated to the target system due to a broken connector. Mitigation: Verify closed-loop revocation — confirm the target system reflects the removal, not just that the IGA platform logged the decision.',
        bestPractice: 'Prefer systems with a real-time provisioning API (SCIM) over ones requiring manual, ticket-based deprovisioning.'
      }
    }
  },
  {
    id: 'jit_pam_elevation',
    name: 'Just-in-Time (JIT) Privileged Access Elevation',
    description: 'Replaces standing administrative privileges with a request-approve-expire loop: engineers hold no elevated access by default and request it, time-boxed, only when actually needed.',
    difficulty: 'Intermediate',
    group: 'fundamentals',
    defaultNode: 'engineer',
    tags: ['jit', 'pam', 'just-in-time', 'privileged access', 'zero standing privilege'],
    nodes: {
      engineer: {
        title: 'Requesting Engineer',
        role: 'Holds only baseline, non-privileged access by default and submits a request for temporary elevation to perform a specific task.',
        analogy: 'A contractor who normally has no master key, but can request one for a specific job ticket.',
        spec: 'Submits a self-service elevation request specifying the target system, the role needed, and a business justification/ticket reference.',
        threatModel: 'Threat: Vague or missing justification making later audit of why access was granted impossible. Mitigation: Require a linked ticket/change-request ID on every elevation request, not free-text justification alone.',
        bestPractice: 'Request the narrowest role and shortest duration that completes the task, not a broad admin role "just in case."'
      },
      approval_workflow: {
        title: 'Approval Workflow',
        role: 'Routes the request to the appropriate approver (manager, resource owner, or an automated policy) and records the decision.',
        analogy: 'The site supervisor who signs off before the master key gets checked out.',
        spec: 'A workflow engine evaluating the request against policy (auto-approve low-risk/short-duration requests, require human approval above a risk threshold).',
        threatModel: 'Threat: Approval fatigue leading to reflexive rubber-stamping of every request. Mitigation: Auto-approve only genuinely low-risk requests by policy, and surface approver metrics (average review time) to detect rubber-stamping.',
        bestPractice: 'Auto-expire an un-actioned request after a short window rather than leaving it pending indefinitely.'
      },
      pam_broker: {
        title: 'PAM Elevation Broker',
        role: 'Grants the approved role for a strictly time-boxed window, then automatically revokes it — no manual cleanup required.',
        analogy: "The key-checkout desk that hands over the master key with an alarm clock, and automatically deactivates it at day's end.",
        spec: 'Injects a time-limited IAM role/group membership (e.g. an AWS IAM Identity Center permission set with a session duration cap) and schedules automatic revocation.',
        threatModel: 'Threat: Elevation grant silently outliving its intended window due to a broken revocation job. Mitigation: Enforce expiry at the identity provider/cloud IAM layer itself (session duration limits), not solely via a cron job that could fail silently.',
        bestPractice: 'Make the elevation self-expiring at the platform level (e.g. a session policy), so a broken revocation job cannot leave access standing.'
      },
      target_system: {
        title: 'Target Privileged System',
        role: 'The production system, cloud account, or database the engineer needed elevated access to, now under an active but temporary grant.',
        analogy: 'The server room itself, now unlocked for exactly the duration the checked-out master key remains valid.',
        spec: 'Receives all actions performed under the temporary elevated role, with every action logged and attributable to the specific elevation grant.',
        threatModel: 'Threat: Actions taken during the elevated window are not distinctly attributable, complicating incident response. Mitigation: Tag every action performed under a JIT grant with the grant ID so an audit can reconstruct exactly what a specific elevation was used for.',
        bestPractice: 'Record full session activity (command history, API calls) during every JIT-elevated session for later audit review.'
      }
    }
  },

  // ————————————————————————————————————————————————————————————————————————
  // INTERMEDIATE — CORE PROTOCOLS
  // ————————————————————————————————————————————————————————————————————————
  {
    id: 'oauth_oidc',
    name: 'OAuth 2.0 & OIDC Authorization Code Flow',
    description: 'The definitive sequence for delegating API access and federating identities securely over the web.',
    difficulty: 'Intermediate',
    group: 'protocol',
    defaultNode: 'user',
    tags: ['oauth', 'oidc', 'authorization code', 'pkce'],
    nodes: {
      user: {
        title: 'Resource Owner (User)',
        role: 'The human interacting with the client application to grant consent.',
        analogy: "A bank customer authorizing a third-party accounting app to read their ledger.",
        spec: 'Operates via a standard User-Agent (browser) which executes HTTP redirects during the authorization flow.',
        threatModel: 'Threat: Phishing or session theft. Mitigation: Employ strong, hardware-backed MFA (WebAuthn).',
        bestPractice: 'Ensure users clearly understand requested scopes on the consent screen.'
      },
      client_app: {
        title: 'Client Application',
        role: 'The app requesting access to the Resource Server on behalf of the user.',
        analogy: 'The accounting app requesting a read-only pass to your bank.',
        spec: 'A public SPA or confidential web app registered with a client_id. Handles PKCE (S256) code verifiers securely.',
        threatModel: 'Threat: CSRF and Authorization Code Interception. Mitigation: Enforce strict PKCE and exact redirect URIs.',
        bestPractice: 'Never store client secrets in public clients (SPAs/Mobile). Use PKCE exclusively.'
      },
      auth_server: {
        title: 'Authorization Server (IdP)',
        role: 'Authenticates the user, records consent, and issues secure tokens.',
        analogy: "The bank's security office that verifies your identity and issues a restricted temporary badge.",
        spec: 'Exposes /authorize (front-channel) and /token (back-channel) OIDC endpoints. Issues JWT access and ID tokens.',
        threatModel: 'Threat: Open redirect attacks. Mitigation: Strictly enforce whitelisted, exact-match redirect_uri verification.',
        bestPractice: 'Keep token lifetimes extremely short (e.g., 5 minutes) and rely on rotating refresh tokens.'
      },
      resource_server: {
        title: 'Resource Server (API)',
        role: 'Hosts the protected data and honors valid access tokens.',
        analogy: 'The bank teller who checks the restricted temporary badge before handing over the ledger.',
        spec: 'An API validating incoming Bearer JWTs locally via JWKS or remotely via Token Introspection (RFC 7662).',
        threatModel: 'Threat: Replay attacks. Mitigation: Enforce Sender-Constrained tokens (DPoP or mTLS).',
        bestPractice: 'Validate token signature, expiration, issuer, and audience on every single API request.'
      }
    },
    relatedResources: [
      { title: 'OAuth 2.0 / OIDC Request Builder', path: '/tools/oauth-builder', type: 'tool' },
      { title: 'OAuth 2.0 & OIDC Flow Visualizer', path: '/playground/oauth', type: 'playground' },
      { title: 'OAuth PKCE Code Generator', path: '/tools/oauth-pkce-generator', type: 'tool' }
    ]
  },
  {
    id: 'saml',
    name: 'SAML 2.0 Enterprise Web SSO',
    description: 'The legacy XML-based federation standard driving corporate SSO across enterprise boundaries.',
    difficulty: 'Intermediate',
    group: 'protocol',
    defaultNode: 'user',
    tags: ['saml', 'sso', 'assertion', 'enterprise'],
    nodes: {
      user: {
        title: 'Employee (Browser)',
        role: 'The corporate employee navigating to a protected SaaS application.',
        analogy: 'An employee presenting their corporate badge at a partner building.',
        spec: 'Routes base64-encoded XML payloads (SAMLRequest / SAMLResponse) between the SP and IdP via HTTP-POST or HTTP-Redirect.',
        threatModel: 'Threat: Browser history token leakage. Mitigation: Set strict Cache-Control headers on SSO endpoints.',
        bestPractice: 'Initiate SP-initiated flows rather than IdP-initiated to prevent unsolicited login attacks.'
      },
      sp: {
        title: 'Service Provider (SP)',
        role: 'The SaaS application consuming the identity assertion to create a local session.',
        analogy: "The partner building checking the cryptographic seal on the employee's corporate badge.",
        spec: 'Generates AuthnRequests and exposes an Assertion Consumer Service (ACS) endpoint to ingest signed XML assertions.',
        threatModel: 'Threat: XML Signature Wrapping (SSW). Mitigation: Strictly validate signatures on both the SAML Response and the Assertion node.',
        bestPractice: 'Enforce strict Destination matching and verify the InResponseTo attribute to prevent replay injections.'
      },
      idp: {
        title: 'Identity Provider (IdP)',
        role: 'The central corporate directory that authenticates the user and signs the assertion.',
        analogy: 'The home office security desk that prints and holographically seals the corporate badge.',
        spec: 'Authenticates the user session and generates a signed <saml:Assertion> detailing NameID and attribute claims.',
        threatModel: 'Threat: Forged assertions via stolen private keys. Mitigation: Store IdP signing certificates in hardware vaults (HSM) and rotate frequently.',
        bestPractice: 'Sign the Assertion (mandatory) and encrypt the attributes if transmitting sensitive PII.'
      }
    },
    relatedResources: [
      { title: 'SAML Decoder', path: '/tools/saml-decoder', type: 'tool' },
      { title: 'SAML Metadata Builder', path: '/tools/saml-metadata-builder', type: 'tool' },
      { title: 'SAML 2.0 XML Workbench', path: '/playground/saml', type: 'playground' }
    ]
  },
  {
    id: 'ciam_social',
    name: 'Customer Identity & Social Login Federation (CIAM)',
    description: 'A standard Customer Identity architecture showing social directory brokers, registration workflows, and API token authorizations.',
    difficulty: 'Intermediate',
    group: 'protocol',
    defaultNode: 'client',
    tags: ['ciam', 'social login', 'consumer identity'],
    nodes: {
      client: {
        title: 'Customer Web Browser',
        role: 'Initiates a login request to access restricted SaaS customer accounts.',
        analogy: 'A traveler arriving at a foreign terminal and clicking "Login with Social Passport".',
        spec: 'Runs standard JavaScript code requesting OAuth redirects and storing JWT Access Tokens in memory.',
        threatModel: 'Threat: Session hijacking via malicious scripts. Mitigation: Keep Access Tokens strictly scoped and store inside secure memory bounds.',
        bestPractice: 'Enforce phishing-resistant biometrics using FIDO2 WebAuthn Passkeys wherever available.'
      },
      social_idp: {
        title: 'Social IdP (Google / Apple)',
        role: "Authenticates the user identity and verifies their active social profile credentials.",
        analogy: 'An official state passport office verifying your fingerprint and printing your picture.',
        spec: 'Authenticates users on social realms and returns an OIDC ID Token mapping user profiles.',
        threatModel: 'Threat: Social account compromise. Mitigation: Force strict, risk-aware biometrics and MFA checks.',
        bestPractice: 'Only request minimal required permissions (email and profile scopes) during federated redirection.'
      },
      broker: {
        title: 'Central Identity Broker',
        role: 'Negotiates social redirects, parses profile claims, and handles Account Linking rules.',
        analogy: 'A hotel check-in desk that reads your foreign passport, matches it to your booking, and issues a hotel key.',
        spec: 'An OIDC Relying Party (RP) mapping custom attributes and generating SaaS-specific Access Tokens.',
        threatModel: 'Threat: Token redirection hijack. Mitigation: Enforce strict redirect URI whitelists and PKCE S256 verification.',
        bestPractice: 'Decouple auth redirections from app backends, channeling transactions through unified gateways.'
      },
      user_store: {
        title: 'Customer Profile Database',
        role: 'Maintains long-term profile data, consent receipts, and social account linking metadata keys.',
        analogy: 'The hotel secure locker containing customer registration forms and previous visit history.',
        spec: 'Highly scalable SQL/NoSQL document database containing progressive profile attributes and scopes.',
        threatModel: 'Threat: Database extraction of personal credentials. Mitigation: Encrypt all database columns at-rest and parameterize queries.',
        bestPractice: 'Implement progressive profiling, requesting optional data values dynamically across logins.'
      },
      api_gw: {
        title: 'Secure SaaS API Gateway',
        role: 'Verifies incoming customer tokens and enforces RBAC/ABAC access controls before granting access.',
        analogy: 'The security bouncer standing at the VIP entrance verifying your wristband matches the list.',
        spec: 'An API Gateway (e.g. Envoy, Kong) validating RSA signature bounds using cached public JWKS keys.',
        threatModel: 'Threat: Token signature forgery. Mitigation: Match kid parameters and verify tokens natively against JWKS.',
        bestPractice: 'Cache JWKS public keys locally to minimize latency during API handshakes.'
      }
    }
  },
  {
    id: 'retail',
    name: 'Retail & Point-of-Sale Identity Architecture (PCI-DSS & Omnichannel)',
    description: "Models PCI-scoped point-of-sale hardening, badge-based staff RBAC, a unified omnichannel customer identity hub, payment tokenization, and least-privilege supply-chain integrations.",
    difficulty: 'Intermediate',
    group: 'industry',
    defaultNode: 'pos_terminal',
    tags: ['retail', 'pos', 'pci-dss', 'omnichannel'],
    nodes: {
      pos_terminal: {
        title: 'Point-of-Sale Terminal',
        role: "The physical checkout terminal or self-checkout kiosk where a customer's payment card or mobile wallet is presented for a transaction.",
        analogy: 'The register counter itself — anyone can walk up to it, but it only unlocks a sale after the cashier or self-checkout logs in.',
        spec: 'A PCI-DSS scoped terminal running Point-to-Point Encryption (P2PE) hardware, isolated on its own segmented VLAN from the general store network.',
        threatModel: 'Threat: Point-of-sale malware skimming card data from memory (RAM-scraping). Mitigation: Encrypt card data at the swipe head itself (P2PE) so plaintext PAN never touches general-purpose terminal memory.',
        bestPractice: 'Never allow POS terminals to browse the general internet or run software outside the certified payment application allow-list.'
      },
      store_associate_id: {
        title: 'Store Associate Identity',
        role: 'The badge-based staff identity a cashier, manager, or loss-prevention officer uses to unlock register functions and inventory overrides.',
        analogy: "The manager's override key that must be inserted and turned before a cashier can approve a large refund or price change.",
        spec: 'An RBAC-scoped staff directory issuing role-based POS permissions (cashier vs. manager override vs. loss-prevention) via badge-tap or PIN login.',
        threatModel: 'Threat: Cashiers sharing manager override PINs to bypass refund and discount approval controls. Mitigation: Require a physical badge tap in addition to a PIN for any manager-level override, logged to loss-prevention.',
        bestPractice: "Immediately revoke terminated employees' badge access across every store location, not just their home store."
      },
      omnichannel_ciam: {
        title: 'Omnichannel Customer Identity Hub',
        role: "The unified customer identity linking a shopper's online account, loyalty profile, and in-store purchase history across every retail channel.",
        analogy: "The single loyalty card that works whether you're shopping on the website, the mobile app, or walking into the physical store.",
        spec: 'A CIAM platform federating e-commerce login, loyalty program membership, and Buy-Online-Pickup-In-Store (BOPIS) order verification under one customer profile.',
        threatModel: 'Threat: Account takeover via credential stuffing draining stored loyalty points or gift card balances. Mitigation: Apply risk-based, adaptive authentication and rate-limit login attempts across the omnichannel hub.',
        bestPractice: 'Give customers one consistent identity and consent record across web, app, and in-store systems instead of siloed per-channel accounts.'
      },
      payment_gateway: {
        title: 'Tokenized Payment Gateway',
        role: "The tokenization service that exchanges a customer's raw card number for a non-sensitive token immediately at the point of capture.",
        analogy: "A coat-check ticket: you hand over your coat once and get a numbered ticket back — the ticket alone is worthless to a thief who doesn't control the coat closet.",
        spec: "A PCI-DSS Level 1 tokenization/payment gateway generating a merchant-specific token in place of the PAN, drastically shrinking the store's own PCI compliance scope.",
        threatModel: 'Threat: Token vault compromise re-linking tokens back to real card numbers. Mitigation: Keep the detokenization vault isolated from the merchant network, accessible only to the payment processor.',
        bestPractice: 'Never store raw PAN data anywhere in the retail environment — tokenize at first capture and store only tokens.'
      },
      inventory_supply_chain: {
        title: 'Inventory & Supply Chain System',
        role: 'The warehouse management and supply-chain system tracking stock levels and coordinating restocking with third-party logistics partners.',
        analogy: "The loading dock logbook that only lets an approved delivery driver's badge open the correct bay door for their scheduled shipment.",
        spec: 'An M2M-authenticated EDI/API integration layer connecting store inventory systems to distribution centers and third-party logistics (3PL) partners.',
        threatModel: 'Threat: A compromised 3PL API key enabling fraudulent inventory adjustments or shipment redirection. Mitigation: Scope each partner\'s API credentials to only their specific warehouse/SKU range, with mTLS and key rotation.',
        bestPractice: 'Issue least-privilege, per-partner API credentials rather than one shared integration key for every logistics vendor.'
      }
    }
  },

  // ————————————————————————————————————————————————————————————————————————
  // ADVANCED — CORE PROTOCOLS
  // ————————————————————————————————————————————————————————————————————————
  {
    id: 'zero_trust',
    name: 'Workforce Zero Trust (NIST SP 800-207)',
    description: 'An implementation of modern Zero Trust principles showing dynamic authentication, device management, and Policy Decision Point (PDP) evaluations.',
    difficulty: 'Advanced',
    group: 'protocol',
    defaultNode: 'client',
    tags: ['zero trust', 'nist', 'pdp', 'pep'],
    nodes: {
      client: {
        title: 'Subject / Client Workstation',
        role: 'Initiates request, carrying real-time user attributes (department, role) and device telemetry.',
        analogy: 'A guest arriving at a bank lobby presenting their ID and showing they are not carrying unapproved items.',
        spec: 'Utilizes cryptographic Client Certificates (mTLS) and browser posture agents to bundle JWT identity claims and secure hardware bindings.',
        threatModel: 'Threat: Session hijacking via cookies / token extraction. Mitigation: Use DPoP (Demonstrating Proof-of-Possession) keys bound to hardware TPMs.',
        bestPractice: 'Enforce continuous risk-based telemetry updates instead of single-point-in-time logins.'
      },
      pep: {
        title: 'Policy Enforcement Point (PEP)',
        role: 'The gatekeeper. Intercepts all traffic, blocks access by default, and coordinates with PDP to allow/deny connection.',
        analogy: 'The physical security guard at the door of the vault who locks or unlocks the gate based on direct orders from the manager.',
        spec: 'An API Gateway, Reverse Proxy, or Service Mesh ingress (e.g. Envoy, NGINX) validating mTLS handshakes and inspecting access tokens.',
        threatModel: 'Threat: DDoS or proxy bypass. Mitigation: Ensure resources are completely hidden behind the PEP with no direct public IPs.',
        bestPractice: 'Decouple policy enforcement (PEP) entirely from policy decision (PDP) to enable rapid updates.'
      },
      pdp: {
        title: 'Policy Decision Point (PDP)',
        role: 'The brain. Evaluates request attributes against active security policies to make final ALLOW/DENY verdicts.',
        analogy: 'The bank manager sitting in the office who looks up the rules and customer record to decide if the security guard should open the gate.',
        spec: 'A centralized engine (like Open Policy Agent - OPA, or custom GRC engines) evaluating attributes based on REGO scripts or XACML schemas.',
        threatModel: 'Threat: Policy injection / hijacking. Mitigation: Enforce strict configuration-as-code pipelines and sign policy bundles.',
        bestPractice: 'Enforce a default-deny policy fallback. If the PDP engine is unresponsive, PEP must reject all traffic.'
      },
      idp: {
        title: 'Identity Provider (IdP) & MFA',
        role: 'Authenticates the user identity and issues cryptographic proof of identity (OIDC ID Tokens).',
        analogy: 'The passport office that verifies your face and documents before issuing a secure, tamper-proof passport.',
        spec: 'Workforce IdPs (e.g. Thales SafeNet Trusted Access, Microsoft Entra ID, Okta) managing standard user groups, claims, and coordinating FIDO2/WebAuthn public key challenges.',
        threatModel: 'Threat: MFA push-bombing fatigue attacks. Mitigation: Mandate context-aware number matching or pure passwordless FIDO2 keys.',
        bestPractice: 'Centralize identity attributes in a directory with automated joiner/mover/leaver provisioning.'
      },
      mdm: {
        title: 'Device Management (MDM / UEM)',
        role: 'Monitors client device health and posture (OS patch level, firewall status, certificate existence).',
        analogy: 'The state vehicle inspection office verifying that a car is safe, licensed, and equipped with functional brakes before letting it on the highway.',
        spec: 'Systems like Microsoft Intune or Jamf validating endpoint compliance, writing compliance claims directly into the IdP verification loop.',
        threatModel: 'Threat: Spoofed compliance status. Mitigation: Issue ephemeral, hardware-attested certificates to compliant devices.',
        bestPractice: 'Establish absolute zero-trust parameters for devices. Unmanaged or out-of-compliance devices are limited to low-risk resources.'
      },
      resource: {
        title: 'Protected Corporate Resource',
        role: 'The target system, database, or internal API holding sensitive organizational data.',
        analogy: 'The highly-secured safety deposit vault located inside the building that holds the gold bars.',
        spec: 'Internal Kubernetes pods, file shares, or SQL databases decoupled from direct public networks, communicating only via PEP tunnels.',
        threatModel: 'Threat: Lateral movement if PEP is breached. Mitigation: Encrypt all data-at-rest and segment internal networks.',
        bestPractice: 'Enforce micro-segmentation. Treat every sub-service or API database as its own isolated trust boundary.'
      }
    },
    relatedResources: [
      { title: 'Zero Trust Planner', path: '/playground/zta', type: 'playground' },
      { title: 'Conditional Access Playground', path: '/playground/conditional-access', type: 'playground' },
      { title: 'Open Policy Agent (OPA) & Rego Playground', path: '/playground/opa', type: 'playground' }
    ]
  },
  {
    id: 'pam',
    name: 'Privileged Access Management (PAM) Vaulting',
    description: 'Securing, rotating, and proxying highly sensitive administrative sessions (e.g. CyberArk, BeyondTrust).',
    difficulty: 'Advanced',
    group: 'protocol',
    defaultNode: 'admin',
    tags: ['pam', 'privileged access', 'vault', 'jit'],
    nodes: {
      admin: {
        title: 'System Administrator',
        role: 'Requests access to a critical backend server without knowing the actual target password.',
        analogy: 'A pilot requesting temporary access to the cockpit controls without possessing the master physical key.',
        spec: 'Authenticates to the PAM portal via MFA to request a brokered, time-bound RDP or SSH session.',
        threatModel: 'Threat: Endpoint compromise. Mitigation: Use hardened privileged access workstations (PAWs) for all admin activities.',
        bestPractice: 'Administrators must never see or handle the raw vaulted passwords.'
      },
      pam_vault: {
        title: 'PAM Session Vault',
        role: 'Securely stores credentials, rotates them, and proxies connections with full session recording.',
        analogy: 'An armored lockbox that brokers your connection, dials the lock for you, and records everything you do on camera.',
        spec: 'A hardened cluster that acts as a jump server (PSM), injecting credentials into the stream and recording keystrokes.',
        threatModel: 'Threat: Vault master key theft. Mitigation: Distribute vault keys across fragmented smart cards (quorum/M-of-N).',
        bestPractice: 'Implement continuous password rotation (CPM) after every single use.'
      },
      target_server: {
        title: 'Target Server (DB/OS)',
        role: 'The critical infrastructure being managed (e.g. Root Linux Server, Domain Controller).',
        analogy: 'The secured cockpit that is completely isolated from the main cabin.',
        spec: 'Accepts incoming SSH/RDP connections strictly and exclusively from the PAM Proxy IP ranges.',
        threatModel: 'Threat: Lateral bypass. Mitigation: Configure strict local firewalls to reject any direct SSH/RDP access bypassing the PAM.',
        bestPractice: 'Isolate target servers in restricted network zones accessible only by the PAM vault IPs.'
      }
    }
  },
  {
    id: 'pki',
    name: 'Public Key Infrastructure (PKI) & mTLS',
    description: 'The foundation of asymmetric cryptographic trust, Certificate Authorities, and secure channels.',
    difficulty: 'Advanced',
    group: 'protocol',
    defaultNode: 'device',
    tags: ['pki', 'mtls', 'certificate authority', 'x509'],
    nodes: {
      device: {
        title: 'Client Device',
        role: 'Generates a local keypair and requests a signed certificate to prove its identity.',
        analogy: 'A citizen filling out a passport application, attaching their photo, and requesting an official seal.',
        spec: 'Generates a PKCS#10 Certificate Signing Request (CSR) containing its public key and Subject Distinguished Name (DN).',
        threatModel: 'Threat: Private key extraction. Mitigation: Generate and trap the private key immutably inside a hardware TPM/Secure Enclave.',
        bestPractice: 'Never transmit the private key. Send only the CSR to the CA.'
      },
      sub_ca: {
        title: 'Intermediate CA',
        role: 'The active issuing authority that signs client certificates on behalf of the offline Root CA.',
        analogy: 'The regional passport office authorized by the capital to issue physical passports.',
        spec: 'An active Certificate Authority that signs the incoming CSR with its own private key, issuing an X.509 certificate.',
        threatModel: 'Threat: Intermediate CA compromise. Mitigation: Monitor Certificate Transparency (CT) logs for rogue issuances.',
        bestPractice: 'Keep the active Sub CA isolated on a secure network and issue short-lived leaf certificates.'
      },
      root_ca: {
        title: 'Offline Root CA',
        role: "The supreme cryptographic trust anchor of the organization.",
        analogy: "The nation's founding constitution and original master seal kept inside a nuclear bunker.",
        spec: 'A self-signed Certificate Authority used exclusively to sign Intermediate CAs, then immediately taken offline.',
        threatModel: 'Threat: Total organizational compromise. Mitigation: Keep the Root CA completely disconnected from any network (air-gapped).',
        bestPractice: 'Store the Root CA private key in a FIPS 140-2 Level 3 Hardware Security Module (HSM) stored in a physical safe.'
      },
      crl: {
        title: 'Revocation Check (CRL/OCSP)',
        role: 'Provides real-time status on whether a certificate has been compromised and revoked.',
        analogy: 'The active wanted-list checking if a presented passport was reported stolen.',
        spec: 'Certificate Revocation Lists (CRL) or Online Certificate Status Protocol (OCSP) responders queried during TLS handshakes.',
        threatModel: 'Threat: OCSP server failure causing "fail-open". Mitigation: Implement OCSP Stapling directly on the web server.',
        bestPractice: 'Enforce hard-fail revocation checks for highly sensitive administrative connections.'
      }
    },
    relatedResources: [
      { title: 'X.509 CSR Generator', path: '/tools/csr-generator', type: 'tool' },
      { title: 'X.509 Certificate Decoder', path: '/tools/x509-certificate-decoder', type: 'tool' },
      { title: 'mTLS & Certificate Chain Playground', path: '/playground/cert-chain', type: 'playground' }
    ]
  },
  {
    id: 'k8s_identity',
    name: 'Kubernetes Identity (OIDC & RBAC)',
    description: 'Models how external identity providers map to internal Kubernetes clusters using OIDC tokens and native RBAC bindings.',
    difficulty: 'Advanced',
    group: 'protocol',
    defaultNode: 'developer',
    tags: ['kubernetes', 'k8s', 'rbac', 'oidc'],
    nodes: {
      developer: {
        title: 'Cluster Developer (kubectl)',
        role: 'An engineer attempting to run commands against the cluster.',
        analogy: 'A construction worker arriving at the site with a union badge.',
        spec: 'Uses kubectl configured with an OIDC auth provider plugin, performing standard PKCE flows to get a JWT.',
        threatModel: 'Threat: Static kubeconfig theft. Mitigation: Never distribute long-lived static tokens; rely exclusively on OIDC federation.',
        bestPractice: 'Enforce strong MFA and short session timeouts at the IdP level.'
      },
      oidc_provider: {
        title: 'External IdP (Okta / Entra)',
        role: 'The centralized workforce directory issuing signed identity claims.',
        analogy: 'The union office that issues the badge stating the worker is certified.',
        spec: 'Issues a signed OIDC ID Token containing the user\'s email and directory group memberships (e.g. "k8s-admins").',
        threatModel: 'Threat: Forged token signatures. Mitigation: API server must actively fetch and cache IdP public JWKS keys.',
        bestPractice: 'Keep OIDC tokens short-lived and implement strict group-mapping rules.'
      },
      kube_apiserver: {
        title: 'Kubernetes API Server',
        role: 'The control plane gateway validating all incoming cluster requests.',
        analogy: 'The foreman checking the badge against the daily approved roster.',
        spec: "Receives the Bearer token, validates its cryptographic signature using the IdP's discovery document, and extracts the \"groups\" claim.",
        threatModel: 'Threat: Unauthenticated API access. Mitigation: Disable anonymous authentication and restrict API server network ingress.',
        bestPractice: 'Audit API server logs to track exactly which OIDC user executed which command.'
      },
      k8s_rbac: {
        title: 'K8s RBAC (RoleBinding)',
        role: 'Maps the verified IdP group to specific, granular cluster permissions.',
        analogy: 'The site instructions dictating that "union workers" are only allowed in Sector B.',
        spec: 'A native K8s RoleBinding associating the IdP group string to a specific Role (e.g. "pod-reader") within a Namespace.',
        threatModel: 'Threat: Privilege escalation. Mitigation: Never grant ClusterAdmin unless strictly necessary; use namespace-scoped Roles.',
        bestPractice: 'Map RBAC exclusively to IdP Groups, never directly to individual user emails, to maintain scalable IGA processes.'
      },
      pod_sa: {
        title: 'Pod Service Account',
        role: 'The target machine identity running the actual workload containers.',
        analogy: 'The heavy machinery that the authorized worker is finally allowed to operate.',
        spec: 'A native Kubernetes ServiceAccount projected into the pod volume, enabling the pod to communicate securely with other services.',
        threatModel: 'Threat: Service Account token extraction. Mitigation: Use Bound Service Account Token Volumes with expiration.',
        bestPractice: 'Avoid using the "default" service account. Create dedicated, least-privilege service accounts per workload.'
      }
    }
  },

  // ————————————————————————————————————————————————————————————————————————
  // ADVANCED — INDUSTRY VERTICALS
  // ————————————————————————————————————————————————————————————————————————
  {
    id: 'b2b_saas',
    name: 'Multi-Tenant B2B SaaS Identity Architecture',
    description: 'A structural overview of multi-tenant identity partitioning, tenant-isolated routing, and automated corporate directory synchronization.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'tenant_router',
    tags: ['b2b', 'saas', 'multi-tenant', 'federation'],
    nodes: {
      tenant_router: {
        title: 'Tenant Router & API Gateway',
        role: 'Inspects subdomains or headers to route incoming queries to the correct isolated tenant resource layer.',
        analogy: 'The building directory board in the lobby directing visitors to Tenant A on Floor 2 vs Tenant B on Floor 3.',
        spec: 'Dynamically parses incoming URLs (e.g. `tenant-a.saasapp.com`) or custom HTTP headers (`X-Tenant-ID`) to bind routing context.',
        threatModel: 'Threat: Cross-tenant data leakage / routing injection. Mitigation: Maintain strict cryptographic tenant context isolation.',
        bestPractice: 'Validate tenant routing parameters on every single request at the gateway boundary.'
      },
      central_auth: {
        title: 'Central Auth Service',
        role: 'Coordinates logins, custom domains, and handles single-sign-on (SSO) federation loops across different customer directories.',
        analogy: "A global airport customs desk: they check your flight ticket and direct you to federate with your home country's passport gate.",
        spec: 'An OIDC/SAML relying party engine multiplexing auth pathways based on the user\'s corporate email domain (e.g., redirecting `@corp.com` to Entra).',
        threatModel: 'Threat: SSO redirection hijack. Mitigation: Validate exact redirect URI string whitelist matches.',
        bestPractice: 'Support progressive profiling to prevent user friction during initial onboarding.'
      },
      custom_idp: {
        title: 'Enterprise IdP (Customer IdP)',
        role: "The customer's home identity directory (e.g. Thales OneWelcome, Okta, Ping), letting corporate users use their existing credentials.",
        analogy: "The corporate office badge that employees already use daily to access their home building.",
        spec: 'Federates with the SaaS application utilizing standard SAML 2.0 or OIDC assertions, sending cryptographically signed XML/JSON payloads.',
        threatModel: 'Threat: XML Signature Wrapping (SSW) attacks. Mitigation: Ensure the signature validates the assertion element, not just the envelope.',
        bestPractice: 'Provide step-by-step SSO configuration wizards with downloadable metadata packages.'
      },
      scim_sync: {
        title: 'Directory Sync Engine (SCIM)',
        role: 'Accepts automated SCIM payloads from corporate directories to keep SaaS user databases instantly in-sync.',
        analogy: "A direct hotline between HR departments: when an employee is let go, they immediately ring the SaaS system to deactivate their cards.",
        spec: "An RFC 7644-compliant SCIM 2.0 endpoint handling POST/PUT/PATCH/DELETE calls on `/Users` and `/Groups` resources.",
        threatModel: 'Threat: SCIM token compromise. Mitigation: Use secure, periodically-rotated Bearer tokens or OAuth client credentials.',
        bestPractice: 'Support partial updates (PATCH) rather than full overrides (PUT) to avoid synchronization bottlenecks.'
      },
      isolated_db: {
        title: 'Isolated Database Partitioning',
        role: 'Provides complete separation of customer database layers (Database-per-tenant vs. Shared Database with Row-Level Security).',
        analogy: 'Providing tenants with individual secure locked boxes (Isolated DB) versus renting space in a shared locker with custom partitions (Row-Level).',
        spec: "Implements PostgreSQL Row Level Security (RLS) policies binding queries to `current_setting('app.current_tenant_id')`.",
        threatModel: 'Threat: SQL injection bypassing row boundaries. Mitigation: Enforce parameterized queries and dedicated database connection pools.',
        bestPractice: 'Enforce Isolated Databases for highly-regulated customers (finance, healthcare) and Row-Level Security for standard tiers.'
      }
    }
  },
  {
    id: 'multi_cloud',
    name: 'Multi-Cloud Identity & Machine Workloads (SPIFFE/SPIRE)',
    description: 'An architectural diagram modeling decentralized, cryptographic machine-to-machine trust across AWS, Google Cloud, and localized clusters.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'aws_workload',
    tags: ['spiffe', 'spire', 'multi-cloud', 'workload identity'],
    nodes: {
      aws_workload: {
        title: 'AWS Workload Instance',
        role: 'A compute node running inside Amazon Web Services (e.g. EC2 worker, Kubernetes Pod) needing to access resources in GCP.',
        analogy: 'A foreign delivery truck crossing national borders needing to prove its cargo manifest and registration is authentic.',
        spec: 'Runs a SPIFFE Workload Agent locally which communicates over a local Unix domain socket using standard gRPC endpoints.',
        threatModel: 'Threat: Instance identity spoofing. Mitigation: Use AWS Instance Document attestation to verify exact cryptographic runtime IDs.',
        bestPractice: 'Never embed long-lived AWS IAM access keys inside pod code. Use short-lived, rotated token profiles.'
      },
      spire_agent: {
        title: 'SPIFFE / SPIRE Agent',
        role: 'A lightweight node daemon that attests local workloads and coordinates with the central server to issue local cryptographic keys.',
        analogy: 'A local passport application office: they verify your birth certificate locally before sending data to the central print office.',
        spec: 'Communicates with SPIRE Server to obtain SVIDs (SPIFFE Verifiable Identity Documents) and stores them locally in memory.',
        threatModel: 'Threat: Local Unix socket hijacking. Mitigation: Restrict socket read/write permissions to specific operating system group accounts.',
        bestPractice: 'Deploy SPIRE agents as Kubernetes DaemonSets to automate local pod attestation cycles.'
      },
      spire_server: {
        title: 'SPIRE Authority Server',
        role: 'The central authority. Verifies node attestation reports and issues cryptographically signed X.509 SVID credentials.',
        analogy: 'The central national passport bureau that prints, signs, and authorizes the secure passports.',
        spec: 'An enterprise Certificate Authority (CA) signing X.509 certificates and JWT tokens, rotating signing keys automatically every few hours.',
        threatModel: 'Threat: CA signing key compromise. Mitigation: Back the SPIRE server with a physical Hardware Security Module (HSM).',
        bestPractice: 'Establish cluster-wide federated trust bundles to bridge distinct cloud certificate registries.'
      },
      workload_mesh: {
        title: 'Workload Mesh (mTLS Proxy)',
        role: 'Intercepts out-of-cloud network requests and establishes secure Mutual TLS tunnels using issued SVIDs.',
        analogy: 'An armored transport convoy escorting the delivery trucks between clouds, keeping all communications completely invisible to eavesdroppers.',
        spec: "Envoy proxies running in sidecar configurations, negotiating mTLS handshakes and validating the peer's X.509 SAN namespaces.",
        threatModel: 'Threat: Insecure proxy routing. Mitigation: Restrict proxy egress to strictly defined service namespaces.',
        bestPractice: 'Keep proxy configurations light and decouple attestation logic from transport proxies.'
      },
      gcp_resource: {
        title: 'GCP Resource (Target Service)',
        role: 'The target workload or database sitting inside Google Cloud platform (e.g. Google Cloud SQL).',
        analogy: 'The secure warehouse inside Google Cloud territory that accepts authorized foreign delivery trucks.',
        spec: 'Validates incoming mTLS connections against the AWS SPIRE Server federated trust bundle, ensuring the SPIFFE ID parses correctly.',
        threatModel: 'Threat: Unauthorized cross-cloud operations. Mitigation: Enforce strict attribute checks inside Google IAM policy sets.',
        bestPractice: 'Segment resources based on SPIFFE namespaces, limiting write privileges to attested workloads.'
      }
    }
  },
  {
    id: 'banking',
    name: 'Banking & Financial Services Identity Architecture (PCI-DSS & PSD2)',
    description: 'Models Strong Customer Authentication, segmented core-ledger dual control, real-time fraud screening, and correspondent-bank wire authorization.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'customer_channel',
    tags: ['banking', 'pci-dss', 'psd2', 'financial services'],
    nodes: {
      customer_channel: {
        title: 'Digital Banking Channel (Customer)',
        role: 'The customer-facing mobile or web banking app initiating payment and account-management requests, carrying FIDO2/PSD2 Strong Customer Authentication (SCA) proofs.',
        analogy: 'A customer walking up to a bank teller window with their government ID already in hand.',
        spec: 'A PSD2-regulated payment initiation client performing FIDO2/WebAuthn biometric SCA challenges before every high-risk transaction.',
        threatModel: 'Threat: Malware-driven transaction hijacking (man-in-the-browser). Mitigation: Bind SCA dynamic linking to the exact payee and amount so a tampered transaction invalidates the signature.',
        bestPractice: 'Re-run SCA on every new payee or amount change; never reuse a single SCA approval across multiple transactions.'
      },
      sca_engine: {
        title: 'Strong Customer Authentication (SCA) Engine',
        role: 'Evaluates PSD2 exemption eligibility (low-value, trusted beneficiary, TRA) and enforces dynamic linking between the authentication and the specific transaction.',
        analogy: 'The bank manager who decides whether a transaction is small enough to wave through or big enough to demand a second signature.',
        spec: 'Implements the EBA Regulatory Technical Standards (RTS) on SCA, computing Transaction Risk Analysis (TRA) fraud-rate thresholds to grant exemptions.',
        threatModel: 'Threat: Exemption abuse to bypass MFA on fraudulent transfers. Mitigation: Cap cumulative exempted transaction value and force full SCA once thresholds are breached.',
        bestPractice: 'Log every exemption decision with its computed fraud rate for regulator audit trails.'
      },
      core_ledger: {
        title: 'Core Banking Ledger',
        role: 'The authoritative system of record for account balances and transaction postings, operating inside the segmented Cardholder/Core Data Environment (CDE).',
        analogy: "The bank vault's master ledger book that only specific dual-keyed officers may amend.",
        spec: 'A segmented, network-isolated ledger platform enforcing dual-control approvals for any manual balance adjustment or wire override.',
        threatModel: 'Threat: Insider-initiated fraudulent ledger entries. Mitigation: Require maker-checker (dual-control) approval on every manual posting above a defined threshold.',
        bestPractice: 'Isolate the ledger network segment from general corporate IT, permitting only brokered, audited connections.'
      },
      fraud_engine: {
        title: 'Real-Time Fraud & AML Risk Engine',
        role: 'Screens every transaction for velocity anomalies, sanctioned-party matches (OFAC), and money-laundering typologies before settlement.',
        analogy: "The airport customs officer scanning every passenger's name against a watchlist before letting them board.",
        spec: 'A streaming risk engine applying velocity rules and real-time OFAC/sanctions-list screening against every payment instruction.',
        threatModel: 'Threat: Structuring (breaking large transfers into many small ones to evade thresholds). Mitigation: Aggregate velocity scoring across a rolling window, not just single-transaction limits.',
        bestPractice: 'Feed confirmed fraud outcomes back into the risk model to continuously retrain detection thresholds.'
      },
      swift_gateway: {
        title: 'SWIFT / Correspondent Banking Gateway',
        role: 'Formats and transmits verified, high-value wire instructions to correspondent banks over the SWIFT messaging network.',
        analogy: "The diplomatic courier who carries a sealed, dual-signed letter between two nations' treasuries.",
        spec: 'Enforces the SWIFT Customer Security Programme (CSP) mandatory controls, requiring dual-authorization sign-off before releasing any outbound wire message.',
        threatModel: 'Threat: Malware forging fraudulent SWIFT messages (cf. Bangladesh Bank heist). Mitigation: Enforce hardware-token dual-authorization and out-of-band confirmation for high-value wires.',
        bestPractice: 'Segregate SWIFT terminal access on dedicated, hardened workstations with no general internet access.'
      }
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare Identity Architecture (HIPAA & HL7 FHIR)',
    description: 'Models patient-facing CIAM proofing, minimum-necessary EHR scoping, SMART on FHIR granular authorization, break-glass emergency access, and the Business Associate boundary.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'patient_portal',
    tags: ['healthcare', 'hipaa', 'hl7', 'fhir', 'patient portal'],
    nodes: {
      patient_portal: {
        title: 'Patient Portal (CIAM)',
        role: 'Customer-facing portal where patients register, verify their identity, and view their own health records.',
        analogy: "The hospital's front-desk check-in kiosk that verifies you are who your appointment says you are.",
        spec: 'A CIAM registration flow performing NIST IAL2-level identity proofing (government ID plus a liveness/biometric check) before granting portal access.',
        threatModel: "Threat: Account takeover exposing a patient's full medical history. Mitigation: Require step-up authentication before displaying sensitive diagnosis or mental-health records.",
        bestPractice: 'Offer passwordless FIDO2 login to reduce credential-stuffing exposure on patient accounts.'
      },
      fhir_gateway: {
        title: 'HL7 FHIR API Gateway',
        role: 'Exposes clinical data to patient apps and third-party health tools through standardized, scope-limited FHIR resources.',
        analogy: 'A hospital records window that only releases the exact document category you have a signed release for.',
        spec: 'Implements SMART on FHIR, issuing granular OAuth 2.0 scopes (e.g., patient/Observation.read) rather than blanket record access.',
        threatModel: "Threat: Over-broad scope grants leaking unrelated record categories to a third-party app. Mitigation: Enforce scope allow-lists per registered SMART app and reject undeclared scope requests.",
        bestPractice: 'Version and publish a FHIR CapabilityStatement so integrators know exactly which resources and scopes are supported.'
      },
      ehr_system: {
        title: 'Electronic Health Record (EHR) System',
        role: 'The system of record for clinical data, enforcing that every user only sees the minimum data necessary for their treatment role.',
        analogy: "The hospital records room clerk who hands a nurse only the specific patient chart requested, not the entire cabinet.",
        spec: 'Implements HIPAA §164.312 Technical Safeguards and the Minimum Necessary Standard, scoping field-level record visibility to the requester\'s clinical role.',
        threatModel: "Threat: Curious-employee snooping on a celebrity or family member's chart. Mitigation: Run automated audit analytics flagging record access with no matching treatment relationship.",
        bestPractice: 'Attach a treatment-relationship justification to every record access for audit defensibility.'
      },
      break_glass: {
        title: 'Break-Glass Emergency Access',
        role: 'Grants clinicians immediate, time-boxed elevated access to a patient record during an emergency, bypassing normal relationship checks.',
        analogy: 'The fire alarm glass box in a hallway: breaking it gets you the axe immediately, but someone reviews the broken glass afterward.',
        spec: 'Issues a short-lived elevated-access token (typically minutes to hours) that auto-expires and triggers a mandatory post-hoc supervisor review.',
        threatModel: 'Threat: Break-glass access used as a routine bypass rather than a true emergency. Mitigation: Auto-flag every break-glass invocation for mandatory next-business-day review with termination consequences for misuse.',
        bestPractice: 'Never allow break-glass grants to silently expire unreviewed — route every instance to a compliance queue.'
      },
      business_associate: {
        title: 'Business Associate Boundary',
        role: "The contractual and technical boundary governing any third party (billing vendor, cloud host, analytics firm) that processes PHI on the covered entity's behalf.",
        analogy: 'The visiting contractor who may only enter the building escorted, under a signed non-disclosure agreement, and only in the rooms specified in their work order.',
        spec: "Every data flow crossing this boundary is governed by a signed Business Associate Agreement (BAA) and scoped API credentials limited to the vendor's specific function.",
        threatModel: "Threat: A breached subcontractor exposing PHI outside the covered entity's direct control. Mitigation: Require BAAs to flow down to sub-subcontractors and audit vendor access logs periodically.",
        bestPractice: 'Maintain a live inventory of every Business Associate with API access and their exact PHI scope.'
      }
    }
  },
  {
    id: 'government',
    name: 'Government & Public Sector Identity Architecture (FedRAMP & NIST 800-63)',
    description: 'Models PIV/CAC hardware-bound credentials, NIST-tiered assurance assertions, cross-agency federation, the FedRAMP authorization boundary, and continuous audit monitoring.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'piv_card',
    tags: ['government', 'fedramp', 'piv', 'nist 800-63'],
    nodes: {
      piv_card: {
        title: 'PIV / CAC Smart Card',
        role: 'The physical, hardware-bound credential federal employees and contractors present to authenticate to government systems.',
        analogy: 'A federal employee badge with an embedded chip that must be physically inserted into a reader, not just shown.',
        spec: 'A FIPS 201-compliant Personal Identity Verification (PIV) or Common Access Card (CAC) storing a hardware-bound X.509 certificate and private key.',
        threatModel: 'Threat: Cloned or stolen physical card used without the holder present. Mitigation: Require PIN entry alongside the card (something-you-have plus something-you-know) at every logon.',
        bestPractice: "Bind the card's private key to non-exportable hardware so it can never be copied off the chip."
      },
      assurance_broker: {
        title: 'IAL/AAL/FAL Assurance Broker',
        role: 'Determines and asserts the identity, authenticator, and federation assurance levels achieved for a given authentication event.',
        analogy: 'A notary who stamps a document not just "verified" but with a specific grade of verification rigor that other offices can trust.',
        spec: 'Implements NIST SP 800-63-3, computing and asserting IAL/AAL/FAL tier claims inside issued federation tokens.',
        threatModel: 'Threat: A relying party silently accepting a lower assurance tier than it requires. Mitigation: Have relying parties explicitly request and validate minimum acceptable IAL/AAL/FAL values, rejecting under-strength assertions.',
        bestPractice: 'Stamp the achieved assurance tier directly into the token claims so every downstream relying party can independently verify it.'
      },
      agency_broker: {
        title: 'Cross-Agency Federation Broker',
        role: 'A shared identity provider (Login.gov-style) that lets citizens and federal employees use one credential across many agency applications.',
        analogy: 'A single embassy visa that is honored at the border crossing of every allied nation, rather than requiring a new visa per country.',
        spec: 'A centralized OIDC/SAML IdP federating dozens of independent agency relying parties under one shared assurance and proofing pipeline.',
        threatModel: 'Threat: Single federated IdP compromise cascading access across every connected agency. Mitigation: Monitor for anomalous cross-agency assertion patterns and support rapid, forest-wide token revocation.',
        bestPractice: 'Publish a single, well-audited proofing and authentication pipeline so agencies stop duplicating costly proofing infrastructure.'
      },
      fedramp_boundary: {
        title: 'FedRAMP Authorization Boundary',
        role: "Defines the exact set of systems, services, and data flows that fall under a cloud service's federal security authorization.",
        analogy: 'The fence line around a secured federal facility: everything inside it was inspected and approved, anything outside was not.',
        spec: 'A System Security Plan (SSP) mapping every in-scope component to its required NIST SP 800-53 control baseline (Low/Moderate/High).',
        threatModel: 'Threat: Undocumented "shadow" services quietly expanding the true attack surface beyond the authorized boundary. Mitigation: Continuously reconcile deployed infrastructure inventory against the SSP-declared boundary.',
        bestPractice: 'Treat any new service addition as an SSP change requiring re-assessment before it goes live in the authorized environment.'
      },
      audit_continuous_monitoring: {
        title: 'Continuous Monitoring & Audit Logging',
        role: 'Aggregates immutable audit logs and continuously reassesses control effectiveness across the entire authorization boundary.',
        analogy: "The building's 24/7 security camera feed, permanently recorded to a vault no single guard can erase.",
        spec: 'Implements FedRAMP Continuous Monitoring (ConMon), shipping immutable, tamper-evident logs and monthly vulnerability scan attestations to the authorizing agency.',
        threatModel: 'Threat: Log tampering to hide unauthorized access after the fact. Mitigation: Write logs to an append-only, cryptographically chained store with independent retention outside the monitored system\'s own control.',
        bestPractice: "Retain audit logs for the full federally mandated retention period, verified independently from the system being monitored."
      }
    }
  },
  {
    id: 'manufacturing',
    name: 'Industrial OT/ICS Identity Architecture (IEC 62443)',
    description: 'Models IT/OT segmentation, machine identity for PLCs and controllers, brokered third-party vendor access, and dual-authorization safety controls on the plant floor.',
    difficulty: 'Advanced',
    group: 'industry',
    defaultNode: 'plant_operator',
    tags: ['manufacturing', 'ot', 'ics', 'iec 62443'],
    nodes: {
      plant_operator: {
        title: 'Plant Floor Operator / HMI',
        role: 'The shift operator authenticating to a Human-Machine Interface (HMI) terminal to monitor and control equipment on the production line.',
        analogy: 'A factory floor worker badging into a shared control terminal with their own personal ID card instead of a sticky note password taped to the machine.',
        spec: 'Terminal authenticates via badge-tap RFID/PIV bound to a named operator identity, feeding session logs into the plant Manufacturing Execution System (MES).',
        threatModel: 'Threat: Shared, generic HMI login credentials used by multiple shift workers. Mitigation: Require individual badge-based login per operator shift with automatic idle-session timeout.',
        bestPractice: 'Bind every HMI session to a named individual identity — never a shared shift-generic login.'
      },
      ot_it_gateway: {
        title: 'OT/IT Segmentation Gateway',
        role: 'The Industrial DMZ enforcing a controlled protocol break between the corporate IT network and the OT/ICS production network.',
        analogy: 'The airlock door between the office building and the factory floor that only lets specific approved carts pass through in one direction.',
        spec: 'Implements the IEC 62443 zones-and-conduits model, running protocol-aware firewalls (Modbus/OPC-UA proxies) between IT and OT/ICS network segments.',
        threatModel: 'Threat: Malware pivoting from corporate IT into the OT network (cf. NotPetya-style lateral movement). Mitigation: Enforce unidirectional data diodes or strict protocol-break firewalls at every IT/OT boundary.',
        bestPractice: 'Never allow a direct, unbrokered network path between corporate IT and the OT/ICS zone.'
      },
      plc_identity_broker: {
        title: 'PLC/RTU Machine Identity Broker',
        role: 'Issues and manages machine identities and certificates for Programmable Logic Controllers (PLCs) and Remote Terminal Units (RTUs) on the plant floor.',
        analogy: "The foreman's master key ring that only issues verified, numbered keys to certified robot arms and never to counterfeit blanks.",
        spec: 'A PKI-backed identity service issuing X.509 device certificates to PLCs/RTUs and validating mutual TLS handshakes for every engineering-workstation connection.',
        threatModel: 'Threat: Firmware or ladder-logic tampering via a spoofed controller identity (cf. Stuxnet). Mitigation: Require signed firmware updates and mutually-authenticated engineering-to-PLC sessions.',
        bestPractice: 'Rotate and re-issue PLC device certificates on a fixed schedule, and alert on any unexpected certificate change.'
      },
      vendor_remote_access: {
        title: 'Third-Party Vendor Remote Access Broker',
        role: 'Brokers time-boxed, approval-gated remote sessions for OEM and vendor maintenance technicians who need to service plant equipment.',
        analogy: 'The outside repair contractor who must sign in at the gatehouse, get escorted, and sign out — never given a spare building key to keep.',
        spec: 'A brokered jump-host (PAM-style) granting vendor technicians time-boxed, fully session-recorded remote access with no standing credentials.',
        threatModel: 'Threat: Persistent, always-on VPN credentials left active for OEM technicians (cf. retail vendor-access breaches). Mitigation: Broker every vendor session through an approval-gated jump host with full session recording.',
        bestPractice: 'Expire vendor remote-access grants automatically at the end of the approved maintenance window.'
      },
      scada_historian: {
        title: 'SCADA Historian & Safety System',
        role: 'The process-control target: the historian database recording production data plus the safety instrumented system (SIS) enforcing physical interlocks.',
        analogy: 'The main control room where changing a critical valve setting requires two supervisors turning their keys at the same time.',
        spec: 'The SCADA historian database and safety instrumented system (SIS) record process data and enforce interlocks on physical equipment.',
        threatModel: 'Threat: Unauthorized setpoint changes causing physical or safety damage. Mitigation: Enforce dual-operator (four-eyes) authorization for any safety-critical setpoint change.',
        bestPractice: 'Require dual-operator sign-off for any change to a safety-critical setpoint.'
      }
    }
  }
]
