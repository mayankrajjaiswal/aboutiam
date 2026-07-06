import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, Clipboard, Check, Terminal, Code, 
  ArrowLeft, ShieldAlert
} from 'lucide-react'

// Reference Implementation Structure
interface ReferenceProject {
  id: string
  title: string
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

export default function ReferenceImplementations() {
  const [activeProjectId, setActiveProjectId] = useState<string>('springboot-keycloak')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Projects list
  const PROJECTS: ReferenceProject[] = [
    {
      id: 'springboot-keycloak',
      title: 'Spring Boot 3 + Keycloak Resource Server',
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
      tech: 'JavaScript / Express',
      rfc: 'RFC 7519 (JSON Web Tokens), RFC 7636 (PKCE)',
      description: 'A production-hardened Node.js/Express JWT verification middleware utilizing jwks-rsa to retrieve public keys from OIDC endpoints, cache keys, and enforce audience and issuer matching.',
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
      tech: 'SCIM 2.0 Schema & Protocol',
      rfc: 'RFC 7643, RFC 7644 (SCIM 2.0)',
      description: 'Hardened REST API schema specifications and payloads for a standard SCIM 2.0 (System for Cross-domain Identity Management) User synchronization server, enforcing attribute read/write constraints.',
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
    }
  ]

  // Active Project Selector
  const activeProject = useMemo(() => {
    return PROJECTS.find(p => p.id === activeProjectId) || PROJECTS[0]
  }, [activeProjectId])

  // Copy code utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Toggle checklist check
  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Code className="text-accent-primary w-7 h-7 animate-pulse shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              Enterprise Reference Implementations <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">Production-Ready</span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Bridge the gap between theoretical standards and real-world microservice code. Production-quality, verified snippets across core platforms.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs bg-bg-nested hover:bg-border-subtle px-3 py-2 rounded-lg text-text-secondary flex items-center gap-1.5 transition shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* PORTAL BODY SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SELECTOR AND BLUEPRINTS (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Reference Implementations</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Select a pre-verified core technology framework to review source files and deployment guides.</p>
              </div>

              <div className="space-y-2">
                {PROJECTS.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id)
                      setCheckedItems({})
                    }}
                    className={`w-full py-3 px-4 rounded-xl border text-left flex flex-col gap-1 transition ${activeProjectId === proj.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow-sm' : 'border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary cursor-pointer'}`}
                  >
                    <span className="text-xs font-black block">{proj.title.split(' + ')[0]}</span>
                    <span className="text-[10px] text-text-muted font-normal block font-mono">{proj.tech}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FLOW DIAGRAM VIEW */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2">SSO Handshake Flow Map</span>
              <pre className="text-[10px] font-mono text-text-secondary bg-bg-nested p-3.5 rounded-lg overflow-x-auto whitespace-pre leading-relaxed select-none">
                <code>{activeProject.diagram}</code>
              </pre>
            </div>

          </div>

          {/* RIGHT DETAILED FILES VIEW (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* OVERVIEW PANEL */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[9px] bg-bg-nested border border-border-subtle px-2 py-0.5 rounded font-mono font-bold text-text-secondary uppercase">{activeProject.rfc}</span>
                <h2 className="text-base font-black text-text-primary mt-2">{activeProject.title}</h2>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{activeProject.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-subtle/50 pt-4">
                {/* Folder Structure */}
                <div className="space-y-2">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Recommended Directory Tree</span>
                  <pre className="text-[10px] font-mono text-text-secondary bg-bg-nested p-4 rounded-xl border border-border-subtle/40 overflow-x-auto leading-relaxed select-text">
                    <code>{activeProject.folderStructure}</code>
                  </pre>
                </div>

                {/* Deployment */}
                <div className="space-y-2">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Quick Deployment Steps</span>
                  <div className="space-y-2">
                    {activeProject.deployment.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary bg-bg-nested/40 border border-border-subtle/40 p-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded bg-bg-nested border border-border-subtle flex items-center justify-center font-mono text-[10px] font-bold text-text-primary shrink-0">{idx + 1}</span>
                        <span className="leading-normal">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CORE INTERACTIVE SOURCE FILE CODE VIEWER */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
              <div className="flex items-center justify-between bg-[#0b0f19] px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Terminal className="w-4 h-4 text-accent-primary animate-pulse" /> {activeProject.codeFile}
                </div>
                <button
                  onClick={() => copyToClipboard(activeProject.code)}
                  className="text-[10px] bg-slate-900/60 hover:bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer flex items-center gap-1 focus:outline-none"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Source'}
                </button>
              </div>
              <pre className="p-5 overflow-x-auto text-[11px] font-mono text-slate-300 whitespace-pre max-h-[380px] custom-scrollbar text-left leading-relaxed">
                <code>{activeProject.code}</code>
              </pre>
            </div>

            {/* SECURITY HARDENING AUDIT CHECKLIST */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2">Production Security Hardening Audit Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeProject.securityChecklist.map((item, idx) => {
                  const checkId = `${activeProject.id}-sec-${idx}`
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleChecklist(checkId)}
                      className="text-left flex items-start gap-2.5 p-3 rounded-xl border border-border-subtle/50 hover:bg-bg-nested/60 transition cursor-pointer text-xs text-text-secondary leading-snug"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checkedItems[checkId] ? 'bg-status-success border-status-success text-white' : 'border-border-subtle bg-bg-card'}`}>
                        {checkedItems[checkId] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={checkedItems[checkId] ? 'line-through text-text-muted font-normal' : 'font-bold'}>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ARCHITECTURAL PITFALLS & MITIGATIONS */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2 flex items-center gap-1.5 text-status-danger">
                <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Pitfalls & Secure Remediations
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.pitfalls.map((item, idx) => (
                  <div key={idx} className="border border-border-subtle p-4 rounded-xl space-y-3 bg-bg-nested/30 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-status-danger/10 text-status-danger px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Anti-Pattern / Mistake</span>
                      <p className="text-xs font-black text-text-primary mt-1.5 leading-snug">"{item.mistake}"</p>
                    </div>
                    <div className="pt-3 border-t border-border-subtle/40 text-[11px] text-status-success font-bold font-mono flex items-start gap-1">
                      <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                      <span>Remediation: {item.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
