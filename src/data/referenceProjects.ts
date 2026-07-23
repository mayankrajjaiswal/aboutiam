// Reference Implementations registry — static, beginner-to-advanced IAM reference
// code with diagrams, deployment steps, security checklists, and pitfalls.
// Kept in its own data module (not inside ReferenceImplementations.tsx) so it can
// be imported by both the page and searchService.ts without tripping the
// react-refresh/only-export-components lint rule.

export type ReferenceLevel = 'beginner' | 'intermediate' | 'advanced'

// Reference Implementation Structure
export interface ReferenceProject {
  id: string
  title: string
  shortLabel: string
  category: string
  level: ReferenceLevel
  tech: string
  description: string
  rfc: string
  diagram: string
  folderStructure: string
  codeFile: string
  codeLang: string
  code: string
  deployment: string[]
  securityChecklist: string[]
  pitfalls: { mistake: string; fix: string }[]
}

export const LEVEL_LABELS: Record<ReferenceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}

export const LEVEL_ORDER: ReferenceLevel[] = ['beginner', 'intermediate', 'advanced']

// Reference Implementations list — kept at module scope (not recreated on
// every render) since it's static data with large embedded code strings.
export const PROJECTS: ReferenceProject[] = [
    {
      id: 'springboot-keycloak',
      title: 'Spring Boot 3 + Keycloak Resource Server',
      shortLabel: 'Spring Boot + Keycloak',
      category: 'SAML & Federation',
      level: 'advanced',
      tech: 'Java / Spring Security',
      rfc: 'RFC 6749, RFC 7519 (OAuth Bearer Tokens)',
      description: 'Configure Spring Boot 3 Resource Server with Spring Security 6, enabling seamless, stateless OAuth 2.0 Bearer JWT token decryption, signature checks, and group/role claiming mapping.',
      diagram: `
+------------+       Bearer Access Token       +------------------------+
| Client App | ------------------------------> | Spring Boot Resource   |
+------------+                                 | Server API (PEP)       |
      |                                        +------------------------+
      |                                                    |
      | Request JWKS keys for validation                   | Parse & Verify Token
      +--------------------------------------------------> | using JWKS keys
                                                           |
                                                           v
                                               +------------------------+
                                               | Keycloak IdP Authority |
                                               +------------------------+
`,
      folderStructure: `
springboot-resource-server/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── corp/
        │           └── api/
        │               ├── ResourceServerApplication.java
        │               ├── config/
        │               │   ├── SecurityConfig.java
        │               │   └── JwtGrantedAuthoritiesConverter.java
        │               └── controller/
        │                   └── InventoryController.java
        └── resources/
            └── application.yml
`,
      codeFile: 'SecurityConfig.java',
      codeLang: 'java',
      code: `package com.corp.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enforce pre-post method checks (@PreAuthorize)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> http.disable()) // Stateless JWT has zero session state, safe to disable CSRF
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Custom claim extractor (extracts Keycloak realm_access.roles into Spring authorities)
        converter.setJwtGrantedAuthoritiesConverter(new CustomJwtAuthoritiesConverter());
        return converter;
    }
}`,
      deployment: [
        '1. Ensure you have Docker Compose active on your target machine.',
        '2. Configure application.yml: set spring.security.oauth2.resourceserver.jwt.issuer-uri to your Keycloak realm URL (e.g., http://localhost:8080/realms/corp-realm).',
        '3. Start the application using: mvn spring-boot:run.'
      ],
      securityChecklist: [
        'Enforce strict JWT Issuer validation (must match target authority URL exactly).',
        'Configure connection and read timeouts on the JWKS key fetching client to prevent DoS lockouts.',
        'Enforce HTTPS on all Keycloak authority connections in production environments.'
      ],
      pitfalls: [
        { mistake: 'Configuring JWT decoding using static public keys instead of JWKS cache.', fix: 'Static keys prevent rotation. Always use JWKS issuer-uri configurations to automatically sync rotated certificates.' },
        { mistake: 'Storing session state in memory while accepting stateless bearer tokens.', fix: 'Enforce SessionCreationPolicy.STATELESS in Spring Security to optimize scale and avoid memory starvation.' }
      ]
    },
    {
      id: 'node-express-oauth',
      title: 'Node.js Express + JWT Verification Middleware',
      shortLabel: 'Express JWT Middleware',
      category: 'Token-Based Auth',
      level: 'intermediate',
      tech: 'JavaScript / Express',
      rfc: 'RFC 7519 (JSON Web Tokens), RFC 7636 (PKCE)',
      description: 'A production-hardened Node.js/Express JWT verification middleware utilizing jwks-rsa to retrieve public keys from standard OIDC endpoints (such as Thales OneWelcome, Okta, or Auth0), cache keys, and enforce audience and issuer matching.',
      diagram: `
+------------+         GET /api/secure with JWT        +----------------------+
| Client App | --------------------------------------> | Express Middleware   |
+------------+                                         | (jwks-rsa signature) |
                                                       +----------------------+
                                                                  |
                                                                  v
                                                       +----------------------+
                                                       | Retrieve public key  |
                                                       | from OIDC caching    |
                                                       | JWKS endpoints       |
                                                       +----------------------+
`,
      folderStructure: `
express-jwt-middleware/
├── package.json
├── server.js
└── middleware/
    └── auth.js
`,
      codeFile: 'auth.js',
      codeLang: 'javascript',
      code: `const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// Hardened authorization middleware verifying Bearer tokens against JWKS cache
const verifyJWT = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10, // Prevent JWKS DDoS flooding
    jwksUri: 'https://auth.corp-portal.com/oauth/.well-known/jwks.json'
  }),
  audience: 'https://api.corp-portal.com/v1',
  issuer: 'https://auth.corp-portal.com/oauth',
  algorithms: ['RS256'], // Strictly enforce secure asymmetric signing algorithm

  // Handle unauthorized requests
  credentialsRequired: true
});

module.exports = { verifyJWT };`,
      deployment: [
        '1. Run: npm install express-jwt jwks-rsa express.',
        '2. Import middleware/auth.js inside server.js.',
        '3. Protect routes: app.use("/api/secure", verifyJWT, router).'
      ],
      securityChecklist: [
        'Strictly lock down accepted algorithms (e.g. RS256) inside verifyJWT options.',
        'Enable rate-limiting and local caching in jwks-rsa options to mitigate signature flooding attacks.',
        'Enforce audience (aud) checks so token scopes cannot be spoofed across separate resources.'
      ],
      pitfalls: [
        { mistake: 'Omitting algorithms configurations in jwt options.', fix: 'Failing to bind algorithms leaves you vulnerable to algorithm-confusion attacks (accepting HS256 forged with public keys).' },
        { mistake: 'Hardcoding JWT secret strings directly inside Express repos.', fix: 'Always retrieve client config parameters and secrets from secure, rotatable environment variables.' }
      ]
    },
    {
      id: 'opa-rego-authorization',
      title: 'Open Policy Agent (OPA) + Rego Policies',
      shortLabel: 'OPA + Rego',
      category: 'Fine-Grained Authorization',
      level: 'advanced',
      tech: 'OPA / Rego / Cloud Native',
      rfc: 'ABAC, NIST SP 800-207 Policy-Based Access',
      description: 'Standard-compliant attribute-based access control (ABAC) policies compiled in Open Policy Agents Rego language, validating user group permissions, device trust posture, and regional boundaries.',
      diagram: `
+-------------+     JSON Policy Query     +---------------------+
| API Gateway | ------------------------> | Open Policy Agent   |
+-------------+                           | (Rego Engine)       |
                                          +---------------------+
                                                     |
                                                     v
                                          +---------------------+
                                          | Compile decisions   |
                                          | { "allow": true }   |
                                          +---------------------+
`,
      folderStructure: `
opa-policy-engine/
├── policy/
│   ├── authz.rego
│   └── authz_test.rego
└── docker-compose.yml
`,
      codeFile: 'authz.rego',
      codeLang: 'rego',
      code: `package authz

default allow = false

# Allow access if user is in admin group, device is managed, and connection has MFA verified
allow {
    user_is_admin
    device_is_managed
    mfa_verified
}

# Allow read access to generic engineers
allow {
    input.user.groups[_] == "engineers"
    input.action == "read"
    device_is_managed
}

user_is_admin {
    input.user.groups[_] == "security-admins"
}

device_is_managed {
    input.device.is_managed == true
    input.device.firewall_active == true
}

mfa_verified {
    input.auth.mfa_completed == true
    input.auth.strength in ["phishing-resistant", "hardware-token"]
}

# Helper inclusion checking
import future.keywords.in`,
      deployment: [
        '1. Launch OPA server container using OPA official images.',
        '2. Upload policy using: curl -X PUT --data-binary @policy/authz.rego http://localhost:8181/v1/policies/authz.',
        '3. Query decisions: POST JSON payload to http://localhost:8181/v1/data/authz/allow.'
      ],
      securityChecklist: [
        'Configure default allow = false at the top of every package.',
        'Strictly enforce device posture attestation bounds before granting server-level CLI/Admin permissions.',
        'Enforce FIPS-compliant cipher ranges on the API gateway queries routed to OPA sidecars.'
      ],
      pitfalls: [
        { mistake: 'Omitting a default allow = false fallback statement.', fix: 'Without OPA defaults, undefined policy rule scenarios return empty responses which Gateway handlers can misinterpret as true.' },
        { mistake: 'Bundling heavy active state databases directly inside OPA memory blocks.', fix: 'OPA memory is for active policies. Route heavy transactional directory queries out via dynamic JWT attributes.' }
      ]
    },
    {
      id: 'scim-server-payload',
      title: 'SCIM 2.0 User Provisioning API Payload',
      shortLabel: 'SCIM 2.0 Payload',
      category: 'Provisioning & SCIM',
      level: 'intermediate',
      tech: 'SCIM 2.0 Schema & Protocol',
      rfc: 'RFC 7643, RFC 7644 (SCIM 2.0)',
      description: 'Hardened REST API schema specifications and payloads for a standard SCIM 2.0 (System for Cross-domain Identity Management) User synchronization server, designed to process automated syncing events from clients like Thales OneWelcome, Okta, or SailPoint.',
      diagram: `
+--------------+     POST /Users (SCIM JSON)     +--------------------+
| Identity IdP | ------------------------------> | SCIM Server Target |
+--------------+                                 | (Reconcile sync)   |
                                                 +--------------------+
                                                            |
                                                            v
                                                 +--------------------+
                                                 | Sync user record   |
                                                 | in database        |
                                                 +--------------------+
`,
      folderStructure: `
scim-provisioning-server/
└── schema/
    ├── user_schema.json
    └── user_post_payload.json
`,
      codeFile: 'user_post_payload.json',
      codeLang: 'json',
      code: `{
  "schemas": [
    "urn:ietf:params:scim:schemas:core:2.0:User",
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
  ],
  "externalId": "ext_usr_0091",
  "userName": "bob.security",
  "name": {
    "familyName": "Identity",
    "givenName": "Bob",
    "formatted": "Bob Identity"
  },
  "emails": [
    {
      "value": "bob@enterprise-corp.com",
      "type": "work",
      "primary": true
    }
  ],
  "active": true,
  "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
    "employeeNumber": "10092",
    "costCenter": "Security-440",
    "organization": "Corporate Security",
    "division": "IAM Engineering"
  }
}`,
      deployment: [
        '1. Implement a REST endpoint at /scim/v2/Users.',
        '2. Expose GET, POST, PUT, PATCH, and DELETE endpoints matching RFC 7644 specifications.',
        '3. Enforce authenticated Bearer token queries across all provision routes.'
      ],
      securityChecklist: [
        'Block raw password hashing responses on SCIM GET requests (password must remain write-only).',
        'Enforce strict UUID format validations on all SCIM resource ID paths.',
        'Deploy rate-limits and maximum size thresholds on SCIM bulk synchronization routes.'
      ],
      pitfalls: [
        { mistake: 'Returning raw user password strings inside GET payloads.', fix: 'User passwords must be designated with returned: "none" in schemas, never returning credential hashes to query clients.' },
        { mistake: 'Treating costCenter, employeeNumber, or groups as unrestricted attributes.', fix: 'Strictly validate costume attributes. Unsanitized strings in SCIM payloads can trigger database SQL injection.' }
      ]
    },
    {
      id: 'github-aws-oidc',
      title: 'GitHub Actions to AWS OIDC Federation Trust',
      shortLabel: 'GitHub → AWS OIDC',
      category: 'Cloud IAM & Workload Identity',
      level: 'advanced',
      tech: 'AWS IAM / GitHub Actions',
      rfc: 'RFC 7519, OpenID Connect Core 1.0',
      description: 'Configure a secure, keyless Trust Relationship between GitHub Actions runners and AWS IAM. Swaps short-lived GitHub JWT id_tokens dynamically for temporary AWS session credentials, completely eliminating the need to store static, long-lived AWS Access Keys in repository secrets.',
      diagram: `
+----------------+        1. OIDC Token (IdToken)        +----------------+
| GitHub Runner  | ------------------------------------> | AWS IAM Role   |
+----------------+                                       | (AssumeRole)   |
        ^                                                +----------------+
        |                                                        |
        |      2. Temporary Session Credentials (AccessKey, Sec) | Validates JWT issuer
        +<-------------------------------------------------------+ and claims (aud/sub)
`,
      folderStructure: `
github-aws-oidc-trust/
├── .github/
│   └── workflows/
│       └── deploy.yml
└── aws-iam/
    └── trust-relationship.json
`,
      codeFile: 'trust-relationship.json',
      codeLang: 'json',
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:my-org/my-repo:ref:refs/heads/main"
        }
      }
    }
  ]
}`,
      deployment: [
        '1. Create an OIDC Identity Provider in AWS IAM with URL: https://token.actions.githubusercontent.com and audience: sts.amazonaws.com.',
        '2. Create an IAM Role and assign this trust relationship JSON to its Trust Policy.',
        '3. Authorize permissions on the IAM Role (e.g. S3 upload or ECR push) for deployments.'
      ],
      securityChecklist: [
        'Strictly bound the sub condition to your specific organization, repository, and branch (never use generic wildcards like *).',
        'Verify the aud condition equals "sts.amazonaws.com" strictly.',
        'Apply an AWS session policy boundary to the assumed role to restrict deployment permissions.'
      ],
      pitfalls: [
        { mistake: 'Configuring StringLike subject conditions to "repo:my-org/*".', fix: 'This permits ANY repository inside your organization (including public forks) to assume the AWS deployer role. Enforce strict repository and branch rules.' },
        { mistake: 'Omitting the audience aud check from the condition block.', fix: 'The aud check is mandatory. Without it, any client receiving a GitHub actions token can attempt to spoof AWS IAM.' }
      ]
    },
    {
      id: 'aws-iam-boundary',
      title: 'AWS Least-Privilege Administrative Boundary Policy',
      shortLabel: 'AWS IAM Boundary',
      category: 'Cloud IAM & Workload Identity',
      level: 'advanced',
      tech: 'AWS IAM (JSON Policy)',
      rfc: 'NIST SP 800-207 (Zero Trust Policy)',
      description: 'Establish a robust AWS IAM Policy boundary that restricts administrative access based on mandatory MFA checks, corporate IP-whitelists, and regional boundaries, preventing account takeover from leaked master credentials.',
      diagram: `
+-------------------+        Request with API Key / Role        +-------------------+
| Admin Workstation | ----------------------------------------> | AWS IAM Gateway   |
+-------------------+                                           +-------------------+
                                                                          |
                                                                          v (Asserts conditions)
                                                                - Active MFA?
                                                                - Corporate IP?
                                                                - Allowed Region?
`,
      folderStructure: `
aws-iam-boundary/
└── policies/
    ├── admin-boundary-policy.json
    └── developer-policy.json
`,
      codeFile: 'admin-boundary-policy.json',
      codeLang: 'json',
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnforceMFAAndCorporateIPForAdministrativeActions",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        },
        "NotIpAddressIfExists": {
          "aws:SourceIp": [
            "192.0.2.0/24",
            "198.51.100.0/22"
          ]
        },
        "StringNotEqualsIfExists": {
          "aws:RequestedRegion": [
            "us-east-1",
            "eu-central-1"
          ]
        }
      }
    }
  ]
}`,
      deployment: [
        '1. Create an AWS IAM Policy and paste the JSON boundary.',
        '2. Attach the policy as a Permissions Boundary to all administrative users and roles.',
        '3. Ensure root accounts are excluded from boundaries to prevent lockouts.'
      ],
      securityChecklist: [
        'Enforce explicit Deny on lack of MultiFactorAuthPresent or SourceIp blocks.',
        'Use "IfExists" operators (e.g. BoolIfExists) to prevent blocking non-human/workload service accounts that authenticate without IP/MFA.',
        'Restrict deployment actions to strictly permitted, authorized regions (e.g. us-east-1, eu-central-1).'
      ],
      pitfalls: [
        { mistake: 'Enforcing a strict SourceIp block on API-only workload roles.', fix: 'Service roles (e.g. ECS agents or Lambdas) invoke AWS APIs from internal AWS addresses, not corporate IPs. Use "NotIpAddressIfExists" or exclude workloads.' },
        { mistake: 'Blocking administrative regions without verifying global service dependencies.', fix: 'Global services (like Route53 or CloudFront) execute endpoints in us-east-1 strictly. Always allow us-east-1.' }
      ]
    },
    {
      id: 'express-session-cookie',
      title: 'Express.js Session-Cookie Login',
      shortLabel: 'Session Cookie Auth',
      category: 'Session & Cookie Auth',
      level: 'beginner',
      tech: 'JavaScript / Express',
      rfc: 'N/A (Server-side session convention)',
      description: 'The simplest possible "who is making this request" pattern: verify a bcrypt password hash, then track the user with an opaque, HttpOnly, server-side session cookie backed by a shared Redis store.',
      diagram: `
+------------+     POST /login (email+password)     +--------------------+
| Browser    | -------------------------------------> | Express App        |
+------------+                                        | (bcrypt.compare)   |
      ^                                                +--------------------+
      |          Set-Cookie: sid=...; HttpOnly                  |
      +<----------------------------------------------------------+
                                                                   v
                                                        +--------------------+
                                                        | Redis Session Store|
                                                        +--------------------+
`,
      folderStructure: `
express-session-login/
├── package.json
├── server.js
└── routes/
    └── auth.js
`,
      codeFile: 'auth.js',
      codeLang: 'javascript',
      code: `const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

// POST /login — verify credentials, then start a server-side session
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.users.findByEmail(email);

  // Compare against the stored salted hash — never plaintext, never a fast hash
  const valid = user && await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Rotate the session ID on every successful login to prevent fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.userId = user.id;
    res.json({ ok: true });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('sid').json({ ok: true }));
});

module.exports = router;`,
      deployment: [
        '1. Run: npm install express express-session connect-redis bcrypt.',
        '2. Configure express-session with { store: RedisStore, cookie: { httpOnly: true, secure: true, sameSite: "lax" } }.',
        '3. Mount routes/auth.js under your app: app.use(authRouter).'
      ],
      securityChecklist: [
        'Always hash passwords with bcrypt/Argon2 — never store or compare plaintext.',
        'Set the session cookie as HttpOnly + Secure + SameSite=Lax.',
        'Call session.regenerate() on login to rotate the session ID and block fixation attacks.'
      ],
      pitfalls: [
        { mistake: 'Using the default in-memory MemoryStore in production.', fix: 'MemoryStore leaks memory and does not survive a restart or multiple instances — always back sessions with Redis/Postgres in production.' },
        { mistake: 'Keeping the same session ID after a privilege change (e.g. login).', fix: 'Always regenerate the session ID immediately after authentication to prevent session-fixation attacks.' }
      ]
    },
    {
      id: 'node-basic-auth-middleware',
      title: 'Node.js HTTP Basic Auth Middleware',
      shortLabel: 'HTTP Basic Auth',
      category: 'Session & Cookie Auth',
      level: 'beginner',
      tech: 'JavaScript / Node.js',
      rfc: 'RFC 7617 (Basic HTTP Authentication)',
      description: 'A minimal, dependency-light middleware that parses an incoming Authorization: Basic header, timing-safe compares credentials, and challenges unauthenticated requests — useful for internal tools and quick admin gates.',
      diagram: `
+------------+   GET /admin (no Authorization header)   +------------------+
| Client     | ----------------------------------------> | Basic Auth MW    |
+------------+ <---------------------------------------- | 401 + WWW-Authenticate |
      |             WWW-Authenticate: Basic realm=...     +------------------+
      |    Retry with Authorization: Basic base64(user:pass)
      +--------------------------------------------------------->  (200 OK)
`,
      folderStructure: `
basic-auth-middleware/
├── package.json
└── middleware/
    └── basicAuth.js
`,
      codeFile: 'basicAuth.js',
      codeLang: 'javascript',
      code: `const crypto = require('crypto');

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Minimal RFC 7617 Basic Auth gate — intended for internal tools, not customer-facing login
function basicAuth(expectedUser, expectedPassHash) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, encoded] = header.split(' ');

    if (scheme !== 'Basic' || !encoded) {
      res.set('WWW-Authenticate', 'Basic realm="Internal Tools"');
      return res.status(401).send('Authentication required');
    }

    const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
    const passHash = require('crypto').createHash('sha256').update(pass || '').digest('hex');

    if (!timingSafeEqual(user || '', expectedUser) || !timingSafeEqual(passHash, expectedPassHash)) {
      res.set('WWW-Authenticate', 'Basic realm="Internal Tools"');
      return res.status(401).send('Invalid credentials');
    }

    next();
  };
}

module.exports = { basicAuth };`,
      deployment: [
        '1. Store expectedUser / expectedPassHash in environment variables, never hardcoded.',
        '2. Apply as middleware: app.use("/admin", basicAuth(process.env.ADMIN_USER, process.env.ADMIN_PASS_HASH)).',
        '3. Always terminate TLS in front of this — Basic Auth sends credentials on every single request.'
      ],
      securityChecklist: [
        'Only ever serve Basic Auth over HTTPS — the header is base64, not encrypted.',
        'Use crypto.timingSafeEqual for comparisons to prevent timing side-channel attacks.',
        'Treat Basic Auth as a stop-gap for internal tools, not a customer-facing login pattern.'
      ],
      pitfalls: [
        { mistake: 'Comparing credentials with a plain === string comparison.', fix: 'Plain string comparison is vulnerable to timing attacks; always use crypto.timingSafeEqual on fixed-length buffers.' },
        { mistake: 'Exposing a Basic Auth endpoint over plain HTTP.', fix: 'Basic Auth headers are only base64-encoded, not encrypted — anyone on the network path can decode stolen credentials instantly.' }
      ]
    },
    {
      id: 'ldap-bind-search',
      title: 'Node.js LDAP Bind & Search Against Active Directory',
      shortLabel: 'LDAP Bind & Search',
      category: 'Directory Services (LDAP/AD)',
      level: 'beginner',
      tech: 'JavaScript / ldapjs',
      rfc: 'RFC 4511 (LDAP), RFC 4515 (LDAP Filters)',
      description: 'Authenticate a user against an existing Active Directory or OpenLDAP tree by binding with their DN and password, then searching for their group memberships using a standard RFC 4515 filter.',
      diagram: `
+------------+   1. Simple Bind (userDN, password)   +------------------+
| Node App   | -------------------------------------> | AD / OpenLDAP    |
+------------+ <------------------------------------- | Bind result       |
      |                    2. Search (memberOf filter) +------------------+
      +-------------------------------------------------------->  Entries
`,
      folderStructure: `
ldap-bind-search/
├── package.json
└── ldapClient.js
`,
      codeFile: 'ldapClient.js',
      codeLang: 'javascript',
      code: `const ldap = require('ldapjs');

function authenticateAndFetchGroups(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: 'ldaps://dc01.corp.local:636' });
    const userDn = \`CN=\${username},OU=Employees,DC=corp,DC=local\`;

    // 1. Simple bind — this is the actual authentication step
    client.bind(userDn, password, (bindErr) => {
      if (bindErr) {
        client.unbind();
        return reject(new Error('Invalid credentials'));
      }

      // 2. Search for group memberships using an RFC 4515 filter
      const opts = {
        filter: \`(&(objectClass=user)(sAMAccountName=\${username}))\`,
        scope: 'sub',
        attributes: ['memberOf', 'displayName']
      };

      client.search('DC=corp,DC=local', opts, (searchErr, res) => {
        if (searchErr) { client.unbind(); return reject(searchErr); }
        const entries = [];
        res.on('searchEntry', (entry) => entries.push(entry.pojo));
        res.on('end', () => { client.unbind(); resolve(entries[0]); });
        res.on('error', (err) => { client.unbind(); reject(err); });
      });
    });
  });
}

module.exports = { authenticateAndFetchGroups };`,
      deployment: [
        '1. Run: npm install ldapjs.',
        '2. Always connect via ldaps:// (TLS), never plaintext ldap:// over untrusted networks.',
        '3. Escape any user-supplied value before interpolating it into an LDAP filter (see pitfalls).'
      ],
      securityChecklist: [
        'Connect over ldaps:// (TLS) only — plaintext LDAP exposes the bind password on the wire.',
        'Escape special filter characters (*()\\\\NUL) in user input before building any LDAP filter string.',
        'Always unbind the client connection in both the success and error paths to avoid connection leaks.'
      ],
      pitfalls: [
        { mistake: 'Interpolating raw username input directly into an LDAP filter string.', fix: 'Unescaped input allows LDAP injection (e.g. a username of "*)(objectClass=*" can widen the search). Always escape *()\\\\NUL characters.' },
        { mistake: 'Falling back to an anonymous bind if the user bind fails.', fix: 'Never fall back to anonymous or service-account bind on a failed user bind — treat any bind failure as a hard authentication rejection.' }
      ]
    },
    {
      id: 'passport-oidc-strategy',
      title: 'Passport.js OpenID Connect Strategy',
      shortLabel: 'Passport OIDC Strategy',
      category: 'Token-Based Auth',
      level: 'intermediate',
      tech: 'JavaScript / Passport.js',
      rfc: 'OpenID Connect Core 1.0, RFC 6749',
      description: 'Wire an Express app into any standard OIDC Identity Provider (Okta, Auth0, Entra ID, Keycloak) using passport-openidconnect, handling the authorization-code redirect, callback, and profile-claim mapping.',
      diagram: `
+------------+   1. GET /login (redirect)   +----------------+
| Browser    | ----------------------------> | OIDC Provider  |
+------------+ <---------------------------- | (Okta/Auth0)   |
      |        2. GET /callback?code=...     +----------------+
      +-------------------------------------------------------> Express App
                                                (exchanges code, verifies ID token)
`,
      folderStructure: `
passport-oidc-app/
├── package.json
├── server.js
└── config/
    └── passport.js
`,
      codeFile: 'passport.js',
      codeLang: 'javascript',
      code: `const passport = require('passport');
const { Strategy: OidcStrategy } = require('passport-openidconnect');

passport.use('oidc', new OidcStrategy({
  issuer: 'https://corp.okta.com/oauth2/default',
  authorizationURL: 'https://corp.okta.com/oauth2/default/v1/authorize',
  tokenURL: 'https://corp.okta.com/oauth2/default/v1/token',
  userInfoURL: 'https://corp.okta.com/oauth2/default/v1/userinfo',
  clientID: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  callbackURL: 'https://app.corp-portal.com/auth/callback',
  scope: 'openid profile email'
}, (issuer, profile, done) => {
  // Key the local account on the stable, immutable subject claim — never on email alone
  db.users.upsertBySub(profile.id, {
    email: profile.emails?.[0]?.value,
    name: profile.displayName
  }).then((user) => done(null, user)).catch(done);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => db.users.findById(id).then((u) => done(null, u)).catch(done));

module.exports = passport;`,
      deployment: [
        '1. Run: npm install passport passport-openidconnect express-session.',
        '2. Register /auth/login (passport.authenticate("oidc")) and /auth/callback routes.',
        '3. Register the exact callbackURL in the IdP\'s application settings — it must match byte-for-byte.'
      ],
      securityChecklist: [
        'Validate the state parameter (handled by passport-openidconnect) to block CSRF on the callback.',
        'Key local accounts on the OIDC sub claim, not the email address, since email can be reassigned.',
        'Store clientSecret only in environment variables / a secrets manager, never committed to source.'
      ],
      pitfalls: [
        { mistake: 'Registering a wildcard or overly broad callbackURL with the IdP.', fix: 'A loose callback URL pattern lets an attacker redirect the authorization code to a domain they control — register the exact, full callback path.' },
        { mistake: 'Trusting the email claim as a unique, permanent user identifier.', fix: 'Some IdPs allow email reuse/reassignment; always key accounts on the immutable sub claim instead.' }
      ]
    },
    {
      id: 'jwt-refresh-rotation',
      title: 'Refresh Token Rotation Middleware',
      shortLabel: 'Refresh Token Rotation',
      category: 'Token-Based Auth',
      level: 'intermediate',
      tech: 'JavaScript / Express',
      rfc: 'RFC 6749 §6, OAuth 2.0 Security BCP (RFC 9700)',
      description: 'Issue short-lived JWT access tokens alongside a long-lived, single-use refresh token, rotating the refresh token on every use and detecting reuse (a strong signal of theft) to auto-revoke the entire token family.',
      diagram: `
+------------+   POST /token/refresh (old refresh token)   +------------------+
| Client     | -------------------------------------------> | Auth Server      |
+------------+ <--------------------------------------------  New access +     |
        New refresh token (old one now revoked)              refresh token pair|
                                                              +------------------+
`,
      folderStructure: `
refresh-token-rotation/
├── package.json
└── routes/
    └── refresh.js
`,
      codeFile: 'refresh.js',
      codeLang: 'javascript',
      code: `const jwt = require('jsonwebtoken');
const crypto = require('crypto');

router.post('/token/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const record = await db.refreshTokens.findByHash(hashed);

  if (!record) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Reuse detection: a token already marked "used" being replayed means theft —
  // revoke the whole token family, not just this token.
  if (record.usedAt) {
    await db.refreshTokens.revokeFamily(record.familyId);
    return res.status(401).json({ error: 'Token reuse detected — session revoked' });
  }

  await db.refreshTokens.markUsed(record.id);

  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  await db.refreshTokens.create({
    hash: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
    familyId: record.familyId,
    userId: record.userId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  const accessToken = jwt.sign({ sub: record.userId }, process.env.JWT_SIGNING_KEY, { expiresIn: '10m' });
  res.json({ accessToken, refreshToken: newRefreshToken });
});`,
      deployment: [
        '1. Store only a SHA-256 hash of each refresh token server-side, keyed with a shared familyId per login session.',
        '2. Keep access tokens short-lived (5-15 min) and refresh tokens rotated on every use.',
        '3. On reuse detection, revoke the entire token family and force the user to re-authenticate.'
      ],
      securityChecklist: [
        'Never store raw refresh tokens server-side — hash them exactly like passwords.',
        'Rotate the refresh token on every single use; the old one must become permanently invalid.',
        'Detect and react to refresh-token reuse by revoking the whole token family immediately.'
      ],
      pitfalls: [
        { mistake: 'Allowing the same refresh token to be redeemed more than once.', fix: 'Reusable refresh tokens turn a single leaked token into indefinite access — always invalidate on first use and issue a new one.' },
        { mistake: 'Treating a detected reuse as an isolated error rather than a security event.', fix: 'Refresh-token reuse strongly implies theft; revoke the entire token family, not just the single reused token.' }
      ]
    },
    {
      id: 'webauthn-server-verification',
      title: '@simplewebauthn/server Registration & Assertion',
      shortLabel: 'WebAuthn Server Verify',
      category: 'Passwordless / WebAuthn',
      level: 'intermediate',
      tech: 'JavaScript / SimpleWebAuthn',
      rfc: 'W3C WebAuthn Level 2, FIDO2 CTAP2',
      description: 'Server-side registration and authentication verification for FIDO2/WebAuthn passkeys using @simplewebauthn/server, covering both the "create credential" and "get assertion" ceremonies.',
      diagram: `
+------------+  1. generateRegistrationOptions()  +------------------+
| Browser    | <---------------------------------- | Server (RP)      |
+------------+  2. navigator.credentials.create()  +------------------+
      |          3. verifyRegistrationResponse() -------->  Store public key
`,
      folderStructure: `
webauthn-server/
├── package.json
└── routes/
    └── webauthn.js
`,
      codeFile: 'webauthn.js',
      codeLang: 'javascript',
      code: `const {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const rpID = 'app.corp-portal.com';
const rpName = 'Corp Portal';
const origin = 'https://app.corp-portal.com';

router.post('/webauthn/register/options', async (req, res) => {
  const options = await generateRegistrationOptions({
    rpName, rpID,
    userName: req.user.email,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }
  });
  req.session.currentChallenge = options.challenge;
  res.json(options);
});

router.post('/webauthn/register/verify', async (req, res) => {
  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: req.session.currentChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID
  });

  if (!verification.verified) {
    return res.status(400).json({ error: 'Registration verification failed' });
  }

  const { credential } = verification.registrationInfo;
  await db.credentials.save(req.user.id, credential); // store publicKey, counter, id
  res.json({ ok: true });
});`,
      deployment: [
        '1. Run: npm install @simplewebauthn/server @simplewebauthn/browser.',
        '2. Set rpID to your exact registrable domain and origin to the exact scheme+host+port serving the app.',
        '3. Store the returned credential (public key + signature counter) keyed to the user.'
      ],
      securityChecklist: [
        'Always verify expectedOrigin and expectedRPID server-side — never trust the client-submitted values.',
        'Persist and check the signature counter on every authentication to detect cloned authenticators.',
        'Bind the challenge to the server-side session, never accept a client-supplied challenge back.'
      ],
      pitfalls: [
        { mistake: 'Setting rpID to a value broader than the actual serving domain.', fix: 'rpID must be the exact registrable domain (or a valid suffix of it) actually serving the page, or browsers will reject the ceremony.' },
        { mistake: 'Skipping the signature-counter check on subsequent logins.', fix: 'A signature counter that fails to increase (or resets) signals a cloned authenticator — reject the assertion and alert the user.' }
      ]
    },
    {
      id: 'vault-approle-dynamic-secrets',
      title: 'HashiCorp Vault AppRole Auth & Dynamic DB Secrets',
      shortLabel: 'Vault AppRole',
      category: 'Secrets Management',
      level: 'intermediate',
      tech: 'HashiCorp Vault / HCL',
      rfc: 'N/A (Vault AppRole auth method)',
      description: 'Authenticate a workload to HashiCorp Vault using the AppRole method (role_id + short-lived secret_id) and request dynamically generated, automatically expiring database credentials instead of a static shared password.',
      diagram: `
+------------+   1. login(role_id, secret_id)   +------------------+
| Workload   | --------------------------------> | Vault Server     |
+------------+ <-------------------------------- | Client token     |
      |           2. read database/creds/app     +------------------+
      +-------------------------------------------------------> Time-boxed DB user/pass
`,
      folderStructure: `
vault-approle-db-secrets/
├── policies/
│   └── app-db-policy.hcl
└── config/
    └── database-secrets-engine.hcl
`,
      codeFile: 'app-db-policy.hcl',
      codeLang: 'javascript',
      code: `# Vault policy: only allow reading dynamic DB creds for this specific role
path "database/creds/app-readonly" {
  capabilities = ["read"]
}

# Enable the AppRole auth method and bind it to this policy
# vault auth enable approle
# vault write auth/approle/role/app-service \\
#   token_policies="app-db-policy" \\
#   token_ttl=15m token_max_ttl=1h \\
#   secret_id_ttl=10m secret_id_num_uses=1

# Enable the database secrets engine and a rotating connection
# vault secrets enable database
# vault write database/config/app-postgres \\
#   plugin_name=postgresql-database-plugin \\
#   connection_url="postgresql://{{"{{username}}"}}:{{"{{password}}"}}@db.corp.local:5432/app" \\
#   allowed_roles="app-readonly"

# vault write database/roles/app-readonly \\
#   db_name=app-postgres \\
#   creation_statements="CREATE ROLE \\"{{"{{name}}"}}\\" WITH LOGIN PASSWORD '{{"{{password}}"}}' VALID UNTIL '{{"{{expiration}}"}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \\"{{"{{name}}"}}\\";" \\
#   default_ttl=1h max_ttl=4h`,
      deployment: [
        '1. Enable the AppRole auth method and the database secrets engine on the Vault server.',
        '2. Distribute role_id at deploy time and a short-lived, single-use secret_id via a secure bootstrap channel (e.g. cloud instance metadata).',
        '3. Workload calls vault write auth/approle/login to get a client token, then reads database/creds/app-readonly for time-boxed DB credentials.'
      ],
      securityChecklist: [
        'Set secret_id_num_uses=1 and a short secret_id_ttl so a leaked secret_id cannot be reused indefinitely.',
        'Scope each Vault policy to the narrowest possible path (one dynamic-secret role per workload).',
        'Set aggressive default_ttl/max_ttl on dynamic database credentials so leaked creds self-expire quickly.'
      ],
      pitfalls: [
        { mistake: 'Distributing a long-lived, reusable secret_id to every instance of a workload.', fix: 'A long-lived, multi-use secret_id is functionally a static password again — always issue short-lived, single-use secret_ids per instance.' },
        { mistake: 'Granting a workload policy read access to unrelated secrets engines or paths.', fix: 'Scope Vault policies to exactly the paths a workload needs — a compromised workload token should not be able to read unrelated secrets.' }
      ]
    },
    {
      id: 'gcp-workload-identity-federation',
      title: 'GCP Workload Identity Federation (GitHub → GCP)',
      shortLabel: 'GCP Workload Identity',
      category: 'Cloud IAM & Workload Identity',
      level: 'advanced',
      tech: 'Google Cloud IAM / GitHub Actions',
      rfc: 'OpenID Connect Core 1.0',
      description: 'Let GitHub Actions runners impersonate a GCP service account using its own short-lived OIDC id_token, exchanged via Workload Identity Federation — eliminating long-lived downloaded GCP service-account JSON keys from CI entirely.',
      diagram: `
+----------------+    1. OIDC id_token (GitHub)    +---------------------------+
| GitHub Runner  | --------------------------------> | GCP Workload Identity Pool|
+----------------+                                    +---------------------------+
        ^                                                        |
        |     2. Short-lived GCP access token                    | Validates issuer/sub,
        +<--------------------------------------------------------+ maps to service account
`,
      folderStructure: `
gcp-workload-identity-federation/
├── .github/
│   └── workflows/
│       └── deploy.yml
└── terraform/
    └── workload-identity-pool.tf
`,
      codeFile: 'workload-identity-pool.tf',
      codeLang: 'javascript',
      code: `resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
  }
  # Strictly bind trust to one repository — never a wildcard
  attribute_condition = "assertion.repository == 'my-org/my-repo'"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.deployer.name
  role                = "roles/iam.workloadIdentityUser"
  member = "principalSet://iam.googleapis.com/\${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/my-org/my-repo"
}`,
      deployment: [
        '1. Create a Workload Identity Pool + OIDC Provider trusting https://token.actions.githubusercontent.com.',
        '2. Bind the pool provider to a GCP service account via roles/iam.workloadIdentityUser, scoped to one repository.',
        '3. In the GitHub Actions workflow, use google-github-actions/auth with workload_identity_provider — no JSON key ever downloaded.'
      ],
      securityChecklist: [
        'Set attribute_condition to bind trust to a specific repository (and ideally branch/environment), never a wildcard.',
        'Grant the impersonated service account only the minimum IAM roles needed for the deploy job.',
        'Disable/avoid creating long-lived downloadable JSON service-account keys entirely once WIF is in place.'
      ],
      pitfalls: [
        { mistake: 'Omitting or loosening the attribute_condition on the workload identity provider.', fix: 'Without a strict repository/branch condition, any repository in the GitHub organization (or even public forks, depending on settings) could impersonate the bound service account.' },
        { mistake: 'Leaving old downloaded JSON service-account keys active after migrating to Workload Identity Federation.', fix: 'Migrating to WIF but leaving the old static key active gives attackers a second, weaker path in — always disable/delete legacy keys after cutover.' }
      ]
    },
    {
      id: 'k8s-oidc-serviceaccount-rbac',
      title: 'Kubernetes Projected ServiceAccount Token + RBAC',
      shortLabel: 'K8s OIDC + RBAC',
      category: 'Kubernetes & Service Mesh',
      level: 'advanced',
      tech: 'Kubernetes / RBAC',
      rfc: 'Kubernetes Bound Service Account Tokens (KEP-1205)',
      description: 'Issue a short-lived, audience-bound OIDC projected ServiceAccount token to a pod (instead of a long-lived mounted Secret token), and bind fine-grained permissions to that identity with a Kubernetes Role/RoleBinding.',
      diagram: `
+------------------+   Volume-mounted, auto-rotated   +---------------------+
| Pod (workload)   | <-------------------------------- | Kubelet / API server|
+------------------+   short-lived, audience-bound JWT +---------------------+
        |
        | Presents JWT as bearer token to external API
        v
+---------------------------+
| External API (verifies    |
| issuer + audience + exp)  |
+---------------------------+
`,
      folderStructure: `
k8s-oidc-rbac/
├── pod-projected-token.yaml
└── rbac/
    ├── role.yaml
    └── rolebinding.yaml
`,
      codeFile: 'pod-projected-token.yaml',
      codeLang: 'javascript',
      code: `apiVersion: v1
kind: Pod
metadata:
  name: billing-worker
spec:
  serviceAccountName: billing-worker-sa
  containers:
    - name: app
      image: registry.corp.local/billing-worker:1.4.0
      volumeMounts:
        - name: aws-token
          mountPath: /var/run/secrets/tokens
  volumes:
    - name: aws-token
      projected:
        sources:
          - serviceAccountToken:
              path: aws-token
              expirationSeconds: 600 # short-lived, auto-rotated by kubelet
              audience: sts.amazonaws.com`,
      deployment: [
        '1. Define a dedicated ServiceAccount per workload — never share one ServiceAccount across unrelated deployments.',
        '2. Mount a projected serviceAccountToken volume scoped to the exact downstream audience (e.g. sts.amazonaws.com for AWS IRSA-style federation).',
        '3. Bind least-privilege permissions to that ServiceAccount using a namespaced Role + RoleBinding, never a cluster-wide ClusterRoleBinding unless truly needed.'
      ],
      securityChecklist: [
        'Set a short expirationSeconds on every projected token so a leaked token self-expires quickly.',
        'Scope the audience field to the exact downstream consumer — an unscoped token can be replayed against any audience-agnostic verifier.',
        'Prefer namespaced Role/RoleBinding over ClusterRole/ClusterRoleBinding unless cluster-wide access is genuinely required.'
      ],
      pitfalls: [
        { mistake: 'Reusing the default legacy long-lived ServiceAccount Secret token instead of a projected token.', fix: 'Legacy auto-mounted ServiceAccount Secrets never expire and are not audience-bound — always use short-lived projected tokens (KEP-1205) for new workloads.' },
        { mistake: 'Binding a workload\'s ServiceAccount with a cluster-wide admin ClusterRoleBinding "to be safe".', fix: 'Over-broad bindings turn a single compromised pod into a full-cluster compromise — always scope RBAC to the minimum verbs/resources/namespaces the workload actually needs.' }
      ]
    },
    {
      id: 'istio-mtls-authorization-policy',
      title: 'Istio Strict mTLS + AuthorizationPolicy',
      shortLabel: 'Istio mTLS + AuthZ',
      category: 'PKI & mTLS',
      level: 'advanced',
      tech: 'Istio / Envoy Service Mesh',
      rfc: 'SPIFFE, mTLS (RFC 8446 / TLS 1.3)',
      description: 'Enforce cluster-wide strict mutual TLS between every service-mesh sidecar (no plaintext fallback) and layer a fine-grained AuthorizationPolicy restricting which SPIFFE-identified workloads may call which routes.',
      diagram: `
+------------------+   mTLS (SPIFFE SVID cert)   +------------------+
| Service A Sidecar| ---------------------------> | Service B Sidecar|
+------------------+ <--------------------------- +------------------+
                          AuthorizationPolicy evaluates
                          source.principal against allow rules
`,
      folderStructure: `
istio-mtls-authz/
├── peer-authentication.yaml
└── authorization-policy.yaml
`,
      codeFile: 'peer-authentication.yaml',
      codeLang: 'javascript',
      code: `apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: billing
spec:
  mtls:
    mode: STRICT # reject any plaintext connection cluster-wide in this namespace
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: billing-allow-checkout-only
  namespace: billing
spec:
  selector:
    matchLabels:
      app: billing-service
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/checkout/sa/checkout-service"]
      to:
        - operation:
            methods: ["POST"]
            paths: ["/v1/charge"]`,
      deployment: [
        '1. Apply PeerAuthentication with mtls.mode: STRICT to the target namespace to reject any plaintext sidecar-to-sidecar traffic.',
        '2. Apply a default-deny AuthorizationPolicy, then explicitly allow only the source SPIFFE principals and routes each service actually needs.',
        '3. Roll out with PERMISSIVE mode first in a staging environment to confirm no service is still relying on plaintext, then switch to STRICT.'
      ],
      securityChecklist: [
        'Default every namespace to STRICT mTLS — plaintext fallback defeats the entire point of the mesh identity layer.',
        'Write AuthorizationPolicy rules as an explicit allow-list keyed on SPIFFE source.principals, never a network-based (IP/port) rule.',
        'Scope each AuthorizationPolicy\'s selector as narrowly as one service, mirroring least-privilege at the network layer.'
      ],
      pitfalls: [
        { mistake: 'Leaving PeerAuthentication in PERMISSIVE mode indefinitely "to be safe".', fix: 'PERMISSIVE mode silently allows plaintext connections to keep working, which means a network-level attacker can bypass the mesh identity layer entirely — always converge to STRICT after migration.' },
        { mistake: 'Authorizing traffic based on the caller\'s namespace or IP range instead of its verified SPIFFE principal.', fix: 'Namespace/IP-based rules are trivially spoofable inside a compromised cluster; always authorize on the cryptographically verified source.principal from the mTLS handshake.' }
      ]
    }
  ]
