# AboutIAM | Executive Production Guide & Maintenance Playbook

Welcome to the **AboutIAM** production workspace. AboutIAM is an open-source, highly interactive, browser-native identity security academy and cryptographic simulation workbench. 

This document serves as the definitive reference guide for the platform's production architecture, core standards, and future maintenance procedures. Now that all roadmap milestones are fully completed, this playbook details how to sustain, audit, and easily extend the platform.

---

## 1. Production Architecture Summary

AboutIAM is engineered as a **100% Client-Side, Zero-Backend Application**, ensuring zero-cost hosting (e.g., GitHub Pages, Vercel, Netlify) and ultimate data privacy. All cryptographic calculations, policy compilations, and state persistence run natively inside the user's browser. The production site is served from the custom domain **`www.aboutiam.com`**, mapped via `public/CNAME`.

### 🛠️ Production Tech Stack
- **Core Runtime:** React 19 (TypeScript) + Vite 7.x (instant HMR compiling).
- **Routing & SEO:** React Router 7 (`BrowserRouter`, clean URLs) plus a post-build static pre-render step (`scripts/postbuild-ssg.mjs`) that writes a real, indexable `index.html` per route — required because GitHub Pages has no server-side rewrites, so a route without its own physical file would 404 for crawlers.
- **Styling Engine:** Tailwind CSS 4.x (fully fluid responsive viewports, supporting system-matching Light & Dark themes).
- **Search Engine Core:** MiniSearch (~9kb high-performance client-side indexing with TF-IDF relevance weighting, prefix searches, and fuzzy matching).
- **State Management:** Zustand + Persist middleware (persisting user course completions and layout states in `localStorage`).
- **Motion Canvas:** Framer Motion (handling animated vector SVG flow paths and popup transitions).
- **Testing Core:** Vitest (Vite-native unit testing with mock SSR safeguards).
- **Discoverability:** `robots.txt`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest`, and `security.txt` live in `public/` and all reference the production domain directly — update them alongside any future domain change.
- **Security Hardening:** A strict `Content-Security-Policy` (`connect-src 'none'`) and `Referrer-Policy` are enforced via `<meta>` tags in `index.html` (GitHub Pages serves no custom HTTP headers, so this is the only enforcement mechanism). `.github/workflows/deploy.yml` and `ci.yml` pin all third-party GitHub Actions to commit SHA (not mutable tags) and gate on `npm audit`; `.github/dependabot.yml` keeps both npm and Actions pins current.

---

## 2. Operational Pages Directory

The active workspace maps cleanly to the following page assets under `src/pages/`:

| Path | Component Name | Description |
| :--- | :--- | :--- |
| **`/`** | `Home.tsx` | Overview Dashboard. Features dual-tracks (Beginners vs. Experts) and interactive trivia. |
| **`/primer`** | `BeginnerPrimer.tsx` | Layman's Onboarding Portal. Deconstructs security into "The Internet's Digital Bouncer" analogy. |
| **`/roadmap`** | `Roadmap.tsx` | Zero-to-Hero Learning Pathway. Chronological guide detailing sequential tracks. |
| **`/learn`** | `Learn.tsx` | IAM Academy. 6 tracks, 36 expandable modules with local progress bar persistent tracking. |
| **`/scenario-builder`** | `ScenarioBuilder.tsx` | Identity Scenario Builder. Questionnaire-driven enterprise architecture and threat model designer. (Phase 1) |
| **`/labs`** | `IdentityLabs.tsx` | Interactive Identity Labs. Hands-on vulnerability and pen-test academy with progressive score boards. (Phase 2) |
| **`/references`** | `ReferenceImplementations.tsx` | Enterprise Reference Implementations. Categorized, beginner-to-advanced library of ready-to-run copyable directories (`src/data/referenceProjects.ts`) — session/cookie auth, LDAP, OAuth/OIDC, WebAuthn, SCIM, OPA/Rego, Vault, cloud workload identity, Kubernetes RBAC, and Istio mTLS. Deep-linkable via `?ref=<id>` and individually searchable. (Phase 4) |
| **`/case-studies`** | `CaseStudyCenter.tsx` | Enterprise Identity Case Study Center. Deconstruct real-world production setups spanning Big Technology, Financial Services, Government, Healthcare, Retail, and Education, each difficulty-tagged Beginner → Advanced. Data-driven from `src/data/caseStudiesData.ts`; supports `?study=<id>` deep links surfaced through global search. (Phase 6) |
| **`/decision-matrix`** | `IdentityDecisionMatrix.tsx` | Identity Decision Matrix. Intelligent interactive architecture recommender engine. (Phase 6) |
| **`/threat-modeling`** | `ThreatModelingStudio.tsx` | Interactive Threat Modeling Studio. Visual security modeling workspace with STRIDE/OWASP validations. (Phase 6) |
| **`/design-review`** | `DesignReviewAssistant.tsx` | IAM Design Review Assistant. Automated structural audits on OAuth, SAML, and JWT blueprints. (Phase 6) |
| **`/standards`** | `StandardsExplorer.tsx` | Living Standards & RFC Explorer. Visually explore standard specs and RFC timelines across OIDC, SAML, SCIM. Supports `?standard=<id>&tab=<tab>` deep links. A "Compliance Deadlines" tab (`?view=deadlines`) tracks regulatory deadlines (NIS2, DORA, PCI DSS 4.0, eIDAS 2.0, etc.) from `src/data/complianceDeadlines.ts`, filterable by jurisdiction with a past/upcoming toggle. (Phase 6) |
| **`/architecture`** | `ArchitectureCenter.tsx` | Interactive, clickable Reference Architecture diagrams with threat models and trace logs — 24 architectures spanning Beginner (session/cookie auth, LDAP bind, social login, API keys, basic RBAC), Intermediate (JWT stateless APIs, SSO reverse proxy, step-up MFA, IGA access reviews, JIT PAM), and Advanced (Zero Trust, B2B SaaS, Multi-Cloud SPIFFE/SPIRE, PKI, banking/healthcare/government/manufacturing/retail) tiers, backed by `src/data/architectureData.ts` (§4S). Supports `?arch=<id>` deep links and a difficulty filter. |
| **`/vendor`** | `VendorCenter.tsx` | Enterprise Ecosystem & Vendor Intelligence Portal. Comprehensive profiles for 18 major platforms, including a flagship featured profile for Thales (OneWelcome, SafeNet Trusted Access, IdCloud) with inner ASCII diagrams, Troubleshooting, and custom Interview Prep. Integrates the Live Identity Intelligence Hub (news, searchable CVE code patch repairs, and visual AI Ingestion Pipeline Simulator), Community Events Calendars with alerts, and Social dashboards with AI Weekly Digest builders. A "Compare" toggle switches the vendor list to multi-select checkboxes (up to 3) and renders a side-by-side attribute table; deep-linkable via `?compare=<key1>,<key2>`. |
| **`/research`** | `ResearchCenter.tsx` | Identity Research & CVE Tracker — 13 beginner-to-advanced CVEs with side-by-side vulnerable/secure code patches, and 17 IETF RFCs/drafts spanning the core IAM protocol registry, backed by `src/data/researchData.ts`. Difficulty-filterable on both panels, deep-linkable via `?cve=<id>`/`?rfc=<slug>`, and individually searchable. |
| **`/patterns`** | `DesignPatternLibrary.tsx` | Hardened design patterns, sequence flows, and checklists for B2B Federated SSO, API Gateway Token Exchange (RFC 8693), and Passwordless. |
| **`/certifications`** | `CertificationHub.tsx` | Enterprise Certification Hub. 27 beginner-to-advanced identity certifications backed by `src/data/certificationsData.ts` (§4U) — spanning Fundamentals (SC-900, Security+, IDPro CIDPRO), Cloud & Workforce IAM (SC-300, AZ-500, Okta, Ping, AWS/GCP), Identity Governance (SailPoint, Saviynt, One Identity), PAM (CyberArk, BeyondTrust, Delinea), Security Leadership & GRC (CISSP, CCSP, CISM, CRISC), Privacy (IAPP CIPT/CIPM), and Cloud-Native (CKS). Difficulty/category filterable, deep-linkable via `?cert=<id>`, and individually searchable; flagship certs carry an interactive mock quiz. |
| **`/career-center`** | `InterviewCareerCenter.tsx` | Comprehensive role-based interview preparation system spanning 6 role tracks featuring MCQs, scenarios, design simulations, coding terminals, timed mocks, and resume guidelines. |
| **`/bulletins`** | `SecurityBulletins.tsx` | Active threat bulletin board backed by `src/data/bulletinsData.ts` (§4W) — 18 beginner-to-advanced identity incident post-mortems spanning Credential & Session Theft, MFA & Push Fatigue, Federation & SSO Exploits, OAuth & Token Abuse, Cloud IAM Misconfiguration, Directory & Kerberos Attacks, and Supply Chain & Provisioning. Difficulty/category filterable, deep-linkable via `?bulletin=<id>`, individually searchable, bookmarkable, and paired with a data-driven "Crisis Response Console" simulation game. |
| **`/playground`** | `PlaygroundCatalog.tsx` | Interactive Sandboxes index. Links to all 15+ completed simulators, each bookmarkable via `BookmarkButton`. |
| **`/tools`** | `ToolsCatalog.tsx` | Security Tools index. 100% client-side utilities, categorized, rendered from `src/data/toolsRegistry.ts` (32 tools live). Every tool page (`ToolPageShell`) is bookmarkable via `BookmarkButton`. |
| **`/tools/jwt-decoder`** | `Tools/JwtDecoder.tsx` | Decodes a JWT's header/payload/signature; flags `alg: none`; optional HMAC verify. |
| **`/tools/jwt-generator`** | `Tools/JwtGenerator.tsx` | Signs a JWT client-side with HS256/384/512 or an ephemeral RS256 keypair. |
| **`/tools/base64-encoder-decoder`** | `Tools/Base64EncoderDecoder.tsx` | Base64/Base64URL encode-decode for text and files. |
| **`/tools/sha256-hash-generator`** | `Tools/Sha256HashGenerator.tsx` | SHA-1/256/384/512 checksums for text or files via Web Crypto. |
| **`/tools/hmac-generator`** | `Tools/HmacGenerator.tsx` | Computes and verifies keyed HMAC signatures. |
| **`/tools/uuid-generator`** | `Tools/UuidGenerator.tsx` | Bulk UUIDv4/UUIDv7/ULID generation. |
| **`/tools/password-generator`** | `Tools/PasswordGenerator.tsx` | Random passwords or passphrases with a live entropy/crack-time estimate. |
| **`/tools/oauth-pkce-generator`** | `Tools/OauthPkceGenerator.tsx` | RFC 7636 `code_verifier`/`code_challenge` pair plus a sample authorization URL. |
| **`/tools/totp-generator`** | `Tools/TotpGenerator.tsx` | Live RFC 6238 TOTP codes with a 30-second countdown ring, plus a verifier. |
| **`/tools/ldap-filter-builder`** | `Tools/LdapFilterBuilder.tsx` | Visual AND/OR/NOT composer producing an RFC 4515 filter string. |
| **`/tools/scim-payload-validator`** | `Tools/ScimPayloadValidator.tsx` | Validates or scaffolds SCIM 2.0 User/Group JSON payloads. |
| **`/tools/basic-auth-decoder`** | `Tools/BasicAuthDecoder.tsx` | Decodes `Authorization: Basic`/`Bearer` header values. |
| **`/tools/oauth-builder`** | `Tools/OauthRequestBuilder.tsx` | Visually constructs standard OAuth 2.0 / OIDC request URLs and backchannel exchange curls. |
| **`/tools/jwks-inspector`** | `Tools/JwksInspector.tsx` | Parses, inspects, and validates public JSON Web Key Sets (JWKS) and extracts key components. |
| **`/tools/policy-evaluator`** | `Tools/PolicyEvaluator.tsx` | Dynamic JSON-based access policy evaluator (ABAC/RBAC) with step-by-step trace terminals. |
| **`/tools/passphrase-entropy`** | `Tools/PassphraseEntropy.tsx` | Entropy bits and GPU-cracking speed comparisons between standard passwords and dictionary passphrases. |
| **`/tools/oidc-discovery`** | `Tools/OidcDiscoveryAuditor.tsx` | Decodes and pretty-prints openid-configuration metadata and extracts supported endpoints. |
| **`/playground/jwt`** | `JWTStudio.tsx` | JWT encoder/decoder. Runs real browser-native HS256 signatures and "none" alg exploits. |
| **`/playground/oauth`** | `OAuthVisualizer.tsx` | Step-by-step OIDC flow chart. Animates front/back-channels and parses raw HTTP. |
| **`/playground/saml`** | `SAMLWorkbench.tsx` | XML assertion workbench. Simulates SAML Signature Wrapping (SSW) attacks. |
| **`/playground/fido2`** | `FIDO2Lab.tsx` | WebAuthn key emulator. Parses clientDataJSON and authenticatorData payloads. |
| **`/playground/access`** | `AccessControlLab.tsx` | Dynamic ABAC/RBAC engine evaluating department, device, and network. |
| **`/playground/ldap`** | `LDAPTreeSimulator.tsx` | AD directory tree simulator. Searches objects dynamically using LDAP filters. |
| **`/playground/zta`** | `ZTAPlanner.tsx` | Zero Trust risk controller based on NIST SP 800-207. |
| **`/playground/scim`** | `Playgrounds/SCIMLab.tsx` | Visual Identity Provider (IdP) to Service Provider (SP) SCIM sync pipeline. |
| **`/playground/oauth-attack`** | `Playgrounds/OAuthAttackLab.tsx` | Hack-and-defend sandbox mapping PKCE bypasses, wildcard redirects, and CSRF state omissions. |
| **`/playground/kerberos`** | `Playgrounds/KerberosLab.tsx` | State-machine AD simulator detailing ticketing (AS/TGS) and Golden/Silver ticket exploits. |
| **`/playground/ctf`** | `Playgrounds/IdentityCTFArena.tsx` | Gamified client-side identity hacking challenges (JWT none bypass, SAML wrapped assertions, LDAP injections). |
| **`/playground/identity-architect`** | `Playgrounds/IdentityArchitect.tsx` | AI-assisted design wizard generating bespoke visual topologies, threat models, and policy codes. |
| **`/playground/jwt-cracker`** | `Playgrounds/JwtCracker.tsx` | Client-side dictionary attack simulator hashing local payloads against common secrets to discover HS256 keys. |
| **`/playground/cert-chain`** | `Playgrounds/CertChainValidator.tsx` | Visual hierarchical map of Certificate Authorities with CRL/OCSP revocation checks and mTLS handshakes. |
| **`/playground/gpo-simulator`** | `Playgrounds/GpoSimulator.tsx` | Interactive AD GPO editor modeling password lengths, lockout thresholds, and ticket lifetimes. |
| **`/playground/ai-threat-lab`** | `AIThreatLab.tsx` | Simulates voice deepfake attacks against legacy MFA and verifies FIDO2 hardware bounds. |
| **`/playground/zkp-wallet`** | `ZKPWallet.tsx` | Generates mathematical zero-knowledge age proofs without exposing raw birthdates. |
| **`/playground/ambient-trust`** | `AmbientTrust.tsx` | Tracks continuous, ambient biometric telemetry and decays session trust scores. |
| **`/playground/workload-mesh`** | `WorkloadMesh.tsx` | Demonstrates SPIFFE/SPIRE attestations and X.509 SVID credentials. |
| **`/explore/matchmaker`** | `AuthMatchmaker.tsx` | Startup Auth Matchmaker wizard with copyable boilerplates. |
| **`/assess`** | `Assess.tsx` | GRC Maturity Wizard. Self-assessments with dynamic charts, downloadable SVG roadmaps, and a `?a=<digits>` shareable, URL-hydrated read-only report link (scoring logic lives in `src/lib/assess/scoring.ts`). |
| **`/explore`** | `Explore.tsx` | IAM Landscape Directory. 21 products spanning Open Source IdPs, Enterprise/Workforce SaaS, CIAM, Directory Services, PAM & Access, and Secrets Engines — each tagged Beginner/Intermediate/Advanced, backed by `src/data/exploreData.ts`. Supports type + difficulty filters, `?product=<id>` deep links, and copyable integration code blocks. |
| **`/assistant`** | `Assistant.tsx` | AI Knowledge Assistant 2.0. Four tabs backed by `src/data/aiKnowledgeGraph.ts` (§4Z): a context-aware Knowledge Chat spanning 45+ IAM topics, a Comparison Engine (20 protocol/product pairings), a Learning Planner (8 beginner-to-expert career roadmaps), and an Interview Prep tab (16 domain-filterable mock questions). Every comparison/track/question is deep-linkable (`?tab=compare&compare=<id>`, `?tab=learn&level=<lvl>&goal=<goal>`, `?tab=interview&q=<id>`) and individually searchable. |
| **`/encyclopedia`**| `Encyclopedia.tsx` | Master A-Z Glossary. 65 categorized standard terms with analogies and specs. Each term supports bookmarking (`BookmarkButton`) and carries a `ContentFeedback` accuracy widget. |
| **`/wall-of-shame`**| `WallOfShame.tsx` | Identity Museum. 5 Eras of history plus a difficulty-filterable Breach Archive of 25 beginner-to-advanced incidents (SolarWinds Golden SAML, push-bombing fatigue, Storm-0558 signing-key forgery, Kerberoasting/DCSync, and more) backed by `src/data/breachesData.ts` (§4B). Each breach carries `ContentFeedback` and `BookmarkButton` widgets, and is deep-linkable via `?tab=breaches&lab=<id>`. |
| **`/cheat-sheets`** | `CheatSheets.tsx` | Developer Playbooks. 24 beginner-to-advanced interactive compliance/hardening checklists — Application Security (SPA, M2M, password/session, JWT, OAuth 2.0/OIDC, SAML, REST API, CIAM social login), Identity Infrastructure & Governance (secrets management, LDAP/AD hardening, IGA access reviews, Zero Trust, Kubernetes RBAC, Kerberos tiering, identity incident response), and Compliance & Regulatory (SOC 2, ISO 27001, HIPAA, PCI-DSS, NIST 800-63-3, GDPR, CCPA/CPRA, FedRAMP High, DORA) — backed by `src/data/cheatSheetsData.ts` (§4Y). Each sheet carries a live progress gauge, `ContentFeedback` and `BookmarkButton` widgets, a difficulty filter, and is deep-linkable via `?sheet=<id>`. |
| **`/contributors`**| `Contributors.tsx` | Team & Contact page. Integrates developer bio cards, interactive forms, and a static "Security & Transparency" section summarizing shipped CI/CSP hardening with a link to the GitHub Security tab. |
| **`/terms`** | `Terms.tsx` | Terms, License & Disclaimer. MIT license summary, an educational/simulated-environment disclaimer for the attack-technique labs, and a no-warranty clause. Linked from Contributors and from the first-visit `DisclaimerModal`; intentionally excluded from the Sidebar nav. |
| **`/timeline`** | `IdentityTimeline.tsx` | Interactive historical identity timeline from mainframes to post-2030 ambient trust with inline simulators. |
| **`/community`** | `CommunityHub.tsx` | Community Achievements and dynamic contributor badges matched with local storage progression, including cross-module milestone badges (Academy track graduations, cumulative Playground completions) derived via `src/lib/achievements/achievementRules.ts`. |
| **`/community-forums`** | `CommunityForums.tsx` | Threaded developer forums (SCIM conflicts, SSW bypasses) and custom architectural showcase. |
| **`/events`** | `EventsCalendar.tsx` | IAM Events & Conferences. Chronologically sorted, hand-curated directory of major industry conferences and summits (EIC, Identiverse, RSAC, Gartner IAM Summit, Authenticate, Oktane, Identity Week, KuppingerCole Impact Days), rendered from `src/data/eventsRegistry.ts`, with dates, locations, and direct links to official agendas. Past events auto-filter out via `getUpcomingEvents()`. |
| **`/reports`** | `IamReports.tsx` | IAM Analyst Reports & Research. Publisher-grouped directory of Gartner Magic Quadrant, Forrester Wave, and KuppingerCole Leadership Compass reports (Access Management, PAM, CIAM, Passwordless) plus Thales's annual Data Threat Report, rendered from `src/data/reportsRegistry.ts`. Each entry carries a `confidence` flag and `verifiedVia`/`verifiedDate` provenance note (single-vendor corroboration vs. cross-checked across independent sources). A **Cross-Analyst Leaderboard** (`getVendorLeaderboard()`) surfaces vendors named a Leader by 2+ independent publishers, and named-leader chips deep-link to their `/vendor?v=<key>` profile via `LEADER_VENDOR_LINKS`. |
| **`/playground/reference-builder`** | `Playgrounds/ReferenceBuilder.tsx` | Visual drag-and-drop identity topology architect with dynamic SVG connectors, OIDC/SAML redirects, and SCIM sync animations. |
| **`/playground/session-hijacking`** | `Playgrounds/SessionHijackingLab.tsx` | Simulates session cookie theft via infostealers, pasting stolen tokens, and applying DPoP, IP-binding, and CAEP. |
| **`/playground/conditional-access`** | `Playgrounds/ConditionalAccess.tsx` | Models conditional policy evaluations testing device compliance, networks, geolocations, and risk scores. |
| **`/playground/opa`** | `Playgrounds/OpaPlayground.tsx` | Decoupled fine-grained authorization rules playground using OPA's standard Rego language with input JSON. |
| **`/playground/token-exchange`** | `Playgrounds/TokenExchange.tsx` | Security Token Service (STS) broker flow modeling RFC 8693 access delegation and impersonation. |
| **`/playground/itdr`** | `Playgrounds/ItdrLab.tsx` | Real-time SecOps system log monitoring, brute-force/push fatigue injection, and lockout mitigations. |
| **`/playground/device-trust`** | `Playgrounds/DeviceTrust.tsx` | Models Zero Trust endpoint posture attestation handshakes evaluating firewalls, FileVault encryption, and mTLS client certificates. |
| **`/playground/passkey-internals`** | `Playgrounds/PasskeyInternals.tsx` | Deconstructs binary authenticatorData byte-offsets and CBOR public keys generated inside hardware enclave TPMs. |
| **`/tools/saml-metadata-builder`** | `Tools/SamlMetadataBuilder.tsx` | Visually compile and export standard-compliant SAML 2.0 SP and IdP XML metadata configurations. |
| **`/tools/scim-diff`** | `Tools/ScimDiffTool.tsx` | Side-by-side SCIM JSON comparison diff engine generating standard RFC 7644 PATCH reconciliation payloads. |
| **`/tools/csr-generator`** | `Tools/CsrGenerator.tsx` | Visually compile standard PKCS#10 Certificate Signing Requests, generate local browser keypairs, and walk ASN.1 DER structures. |
| **`/tools/ansible-vault`** | `Tools/AnsibleVault.tsx` | Encrypt or decrypt secrets client-side using the standard Ansible Vault 1.1/1.2 AES-256 cipher format — 100% browser-native PBKDF2 + AES-CTR + HMAC-SHA256. |
| **`/tools/sops-simulator`** | `Tools/SopsSimulator.tsx` | Selectively encrypt configuration values inside YAML or JSON files using simulated AWS KMS, Azure Key Vault, or Age keys. |
| **`/tools/conformance-checker`** | `Tools/ConformanceChecker.tsx` | Paste an OIDC discovery document or SAML 2.0 metadata XML and run an automated pass/fail checklist against required fields and structural rules (`src/lib/tools/conformance.ts`). |

---

## 3. Production Code Standards

Future contributions must adhere strictly to these core enterprise-grade standards:

### 🎨 A. Dual-Theme Variable Mapping (`src/index.css`)
We use Tailwind v4 custom theme bindings mapped directly to native CSS variables. To adjust theme colors, modify the tokens inside `index.css`:
- **Dark Mode Background:** `#070a13` (deep security slate)
- **Dark Mode Card Background:** `#0d1222` (navy-slate)
- **Light Mode Background:** `#f8fafc` (slate-50)
- **Active Accents:** `#3b82f6` (blue-500) and `#14b8a6` (teal-500)

### 🛡️ B. Server-Side Rendering (SSR) Defensive Checks (`src/store/themeStore.ts`)
Because this app compiles in static builders and CLI test runners that do not possess a browser window or document DOM, all direct browser accesses must be safeguarded:
```typescript
if (typeof document !== 'undefined') {
  // Safe to access document.documentElement
}
if (typeof window !== 'undefined') {
  // Safe to access localStorage or window.matchMedia
}
```

`DisclaimerModal.tsx` and `GuidedTour.tsx` (§4M/§4N) are further examples of this SSR-guard combined with a persisted "seen" flag (`disclaimerStore.ts` / `tourStore.ts`) driving a first-visit-only overlay.

### 🧪 C. Testing Standards (`npm run test`)
We mandate the inclusion of Vitest unit tests for all state mutations, mathematical calculations, and helper utility libraries. Running `npm run test` executes tests in our custom safe environments.

### 🧹 D. React Hooks Lint Compliance (`npm run lint`)
`eslint-plugin-react-hooks` enforces the React-Compiler-readiness rules (`set-state-in-effect`, `purity`, `immutability`) on top of `exhaustive-deps`. Pick the fix by what the effect actually does — don't reach for a blanket `eslint-disable`:
- **One-time read from `localStorage` on mount** → a lazy `useState(() => ...)` initializer (guarded per §3B), not an effect + setter.
- **Synchronous value derived from other state** (e.g. building an XML/JSON string) → `useMemo`, not state + effect.
- **Timer/interval loop with a "stop" condition** → fold the stop transition into the *same* interval's functional-updater callback (see `IdentityTimeline.tsx`'s ambient-trust decay), not a second synchronous setter call on the effect's next run.
- **Async Web Crypto derivation** (can't become a `useMemo`) → wrap the call itself in `setTimeout(() => fn(), 0)` at the effect's call site. Wrapping inside the async function (e.g. a leading `await Promise.resolve()`) does not satisfy the rule — verified empirically.
- **`Math.random()`/`Date.now()` inside a function only ever invoked from a click/submit handler** → a scoped `eslint-disable-next-line react-hooks/purity` with a one-line comment naming the handler is acceptable; the linter can't prove render-time vs. event-time reachability on its own.

---

## 4. Developer Maintenance & Extension Playbook

AboutIAM is designed to be highly modular. Follow these simple guides to easily extend the platform's information base:

### 📖 A. How to Add a 37th Term to the Glossary
To add a new standard, acronym, or protocol definition to the **Master A-Z Glossary**, simply open `src/pages/Encyclopedia.tsx` and append a new `Term` object into the `encyclopedia` array:
```typescript
{
  id: 'caep',
  term: 'CAEP',
  fullName: 'Continuous Access Evaluation Protocol',
  category: 'Zero Trust',
  analogy: 'A security guard constantly walking with you inside the bank...',
  expert: 'An active profile of the Shared Signals Framework (RFC 9396)...'
}
```
*The UI will automatically alphabetical-sort, categorize, and render the search results upon reloading!*

### 💣 B. How to Add a New Breach to the Museum (`/wall-of-shame`)

`src/data/breachesData.ts` is the single source of truth for the `/wall-of-shame` "Breach Archive" — `WallOfShame.tsx` and the search index (`searchService.ts`) both import the same `BREACHES` array, so appending one `Breach` object makes it render in the difficulty-filtered breach list **and** become searchable/deep-linkable (`?tab=breaches&lab=<id>`) with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures/explore products/certifications/research/bulletins (§4Q-X): `searchService.ts` used to hand-maintain its own duplicate, hardcoded `BREACHES_LIST` with no `difficulty` field at all, while the 6 breaches themselves were hardcoded a second time inline inside `WallOfShame.tsx` with bespoke simulator UI and no shared data model — a 7th breach could only ever be added by hand-writing an entire new React simulator, which is why the museum stalled at 6 entries for so long.

```typescript
{
  id: 'your-breach-id',
  title: 'Full, Descriptive Incident Title',
  year: '2026',
  company: 'Target Company / Program Name',
  logo: '💥', // any emoji works as the list icon
  category: 'Credential & Password Attacks', // one of BREACH_CATEGORIES — reuse an existing one where the topic fits
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips
  attackVector: 'Short attack vector label',
  summary: '...', rootCause: '...',
  timeline: ['Step one...', 'Step two...'],
  vulnCode: `// insecure snippet`,
  secureCode: `// hardened snippet`,
  remediation: 'Detailed, code-level explanation of the modern defensive fix.',
  lessons: ['...'],
  rfcs: ['RFC 1234 (Spec Name)'], // optional, [] if none applies
  relatedResources: [{ title: 'Related Tool/Playground', path: '/playground/...', type: 'playground' }]
}
```

Most new entries should omit `interactiveLabId` — `WallOfShame.tsx` automatically renders a generic "Breach Profile" panel (summary, root cause, timeline, vulnerable/secure code, remediation, lessons) for any breach without one, which is what makes it practical to keep adding "almost every" IAM-relevant breach without hand-building a bespoke React simulator each time. Only the original 6 flagship breaches (`goldensaml`, `pushfatigue`, `wildcard`, `oktahar`, `silversaml`, `lastpass`) carry an `interactiveLabId` wiring them to their existing hand-built step-by-step simulators in `WallOfShame.tsx` — reserve that field for a breach that earns a fully custom interactive lab, not the default case.

If adding a new category value, also add it to the exported `BREACH_CATEGORIES` array in the same file so the difficulty/category coverage stays in sync. No route-wiring needed (§4D) — the `?tab=breaches&lab=<id>` deep link reuses the existing `/wall-of-shame` route via the same mount-effect pattern described in §4I. Every breach automatically carries a `ContentFeedback` and `BookmarkButton` widget (id `breach-<id>`, §4K/§4L). Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `BREACHES` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers and every `BREACH_CATEGORIES` value are represented.

### 🎓 C. How to Add a New Course Track to the Academy
To add a new learning track or module to the **IAM Academy**, open `src/pages/Learn.tsx` and append a new `Track` object to the `tracks` array. Enforce six sub-modules per track to maintain the global graduation progress bar ratios.

### 🧭 D. How to Add a New Page/Route
Adding a page touches **three** files, because routes are statically pre-rendered for SEO (see §1) rather than resolved purely client-side:
1. **`src/App.tsx`** — add the `<Route path="..." element={<YourPage />} />`.
2. **`src/routeMeta.ts`** — add a `{ path, title, description }` entry. This drives the browser tab title, `<meta name="description">`, and canonical link that `Header.tsx` syncs on navigation. It also automatically makes the page searchable in the command palette (see §4I) — no separate search-registration step needed for a generic page.
3. **`scripts/postbuild-ssg.mjs`** — add the *same* `{ path, title, description }` entry to its `ROUTES` array. This script runs in plain Node after `vite build` and intentionally keeps its own copy instead of importing the `.ts` file (avoids depending on a specific Node TypeScript-execution feature in CI) — it's what writes the real `dist/<route>/index.html` GitHub Pages serves. Skipping this step means the route works for in-app navigation but 404s for anyone (or any crawler) linking to it directly.

Optionally add a `Sidebar.tsx` nav entry and a `public/sitemap.xml` `<url>` entry if the page should be discoverable from the main nav / search engines.

### 🛠️ E. How to Add a New Security Tool (`/tools/<slug>`)

The **Security Tools** section (`/tools`) is a registry-driven extension point on top of the routing convention in §4D — all 23 planned tools are now fully live and shipped. To add a new (24th) tool in the future, follow these steps:

1. **`src/data/toolsRegistry.ts`** — append a `ToolMeta` entry (`slug`, `title`, `description`, `category`, `icon`, `phase`, `keywords`, `analogy`, `expert`, `faqs`, optional `relatedLinks`) with `status: 'planned'` while you build, then flip to `'live'` when it ships. `ToolsCatalog.tsx` and the sidebar-adjacent catalog card both render from this array automatically — nothing else to touch there.
2. **`src/pages/Tools/<PascalCaseName>.tsx`** — build the page using the shared components in `src/components/Tools/` (`ToolPageShell` for the header/privacy-notice/JSON-LD wrapper, `BeginnerExpertExplainer` for the analogy/expert/FAQ card, `useClipboardCopy` for copy buttons, `FileDropInput` for file-accepting tools) and any pure-logic helpers you need in `src/lib/tools/` (one small, independently Vitest-tested module per concern — see the existing `base64.ts`/`jwt.ts`/`totp.ts`/etc. for the pattern).
3. **Route wiring** — same 3 files as §4D (`App.tsx`, `routeMeta.ts`, `postbuild-ssg.mjs`), plus a `public/sitemap.xml` `<url>` entry and a `public/llms.txt` line, plus flipping the registry `status` to `'live'` from step 1.
4. **No JSON-LD or FAQ schema work needed** — `ToolPageShell` generates both `SoftwareApplication` and `FAQPage` structured data automatically from the registry entry's `description`/`expert`/`faqs` fields.
5. Run the responsive/mobile-overflow sweep described in `FIXED_TODO.md` §7 before calling it done — two real overflow bugs were found this way during the first 12 tools, both fixed at the shared-component level, but new tools can still introduce new ones (e.g. a long unbroken example string in a paragraph without `wrap-break-word`).

---

### 🏛️ F. How to Leverage the Identity Playground SDK

All future interactive simulators, CTFs, or sandboxes should be engineered using the unified **Identity Playground SDK** (`src/lib/sdk/`) rather than writing redundant state tracking, scoreboards, hints, and terminal logging logic.

#### **1. Import & Initialize the Core Hook (`usePlayground`)**
In your page/component, trigger the hook with your module metadata:
```typescript
import { usePlayground } from '../lib/sdk/usePlayground'

const {
  score,
  hintsRevealed,
  logs,
  currentStep,
  isCompleted,
  log,
  revealHint,
  completeStep,
  finishPlayground,
  resetPlayground
} = usePlayground({
  moduleId: 'jwt_studio_lab',
  initialScore: 100,
  maxHints: 3
})
```

#### **2. Wrap the Page Canvas inside `<PlaygroundShell />`**
The shell component handles responsive split layouts, status indicators, scoreboards, checklists, and active hints out of the box:
```typescript
import { PlaygroundShell } from '../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../lib/sdk/components/TraceTerminal'

return (
  <PlaygroundShell
    title="JWT Algorithm Confusion Lab"
    description="Analyze and exploit a server that blindly trusts user-supplied signing headers."
    score={score}
    hintsRevealed={hintsRevealed}
    currentStep={currentStep}
    totalSteps={3}
    isCompleted={isCompleted}
    onRevealHint={() => revealHint("Verify if the header 'alg' equals 'none'")}
    onReset={resetPlayground}
    sidebarContent={<TraceTerminal logs={logs} />}
  >
    {/* Your Interactive Sandbox Controls Here */}
  </PlaygroundShell>
)
```

#### **3. Feed Workspace States to AI Prompts (`serializePlaygroundStateForAI`)**
To support future client-side GenAI integrations, compile your inputs and SDK states into structured formats natively:
```typescript
import { serializePlaygroundStateForAI } from '../lib/sdk/aiConnector'

const promptPayload = serializePlaygroundStateForAI({
  moduleId: 'jwt_studio_lab',
  score,
  currentStep,
  isCompleted,
  logs,
  userVariables: { alg: 'none', sub: 'admin' }
})
```
---

### 🏛️ G. How to Leverage the Offline Resilience Simulator (Airplane Mode)

All developer utilities, playgrounds, or features should integrate cleanly with our **Simulated Offline Resilience Simulator** to demonstrate network-constrained, secure air-gapped environments.

#### **1. Read Offline States Natively via `useAirplaneModeStore`**
Import the store hook to check for simulated disconnections, latencies, or packet drops:
```typescript
import { useAirplaneModeStore } from '../store/airplaneModeStore'

const { isEnabled, simulateLatency, simulatePacketLoss } = useAirplaneModeStore()
```

#### **2. Model IdP Outages & Latency in Playgrounds**
In your network mock actions (e.g. OIDC authentication requests, SAML redirect mappings, or SCIM sync loops), inject simulated constraints:
```typescript
if (isEnabled) {
  // Trigger simulated 503 Outage
  log("🚨 Central IdP Outage Detected. Fallback to cached key structures.")
  return { status: 503, error: 'Service Unavailable' }
}

if (simulateLatency > 0) {
  // Inject simulated delay
  await new Promise(resolve => setTimeout(resolve, simulateLatency))
}
```

---

### 🏛️ H. Build-Time Programmatic RSS Generation

AboutIAM implements a fully automated, compile-time RSS Feed generation engine. Every production build programmatically compiles `rss.xml` containing the latest tools, security advisories (CVEs), and news releases.

#### **1. Architecture Flow**
During the `npm run build` command, Vite triggers `scripts/generate-rss.ts` via the Node.js native `--experimental-strip-types` engine:
- Reads structured updates directly from:
  - `src/data/identityIntelligence.ts` (`IDENTITY_NEWS_FEED`, `IDENTITY_CVE_DIRECTORY`)
  - `src/data/toolsRegistry.ts` (`TOOLS`)
- Performs UTC date-sorting to place the newest item first.
- Generates `rss.xml` inside `public/rss.xml` (dev copy & fallback source) and `dist/rss.xml` (production bundle file).

#### **2. Automated Validation**
The generation process is guarded by Vitest. The test suite is defined in `scripts/generate-rss.test.ts`. Whenever any data update is committed, running the test pipeline ensures that:
- Structural integrity of the feed remains correct.
- All items format HTML descriptions within standard XML CDATA elements safely.
- No unreleased/planned tools leak into the subscriber notifications feed.

#### **3. Custom Feed Maintenance**
To add a custom feed update without shipping a new tool or CVE, simply insert an item into `IDENTITY_NEWS_FEED` inside `src/data/identityIntelligence.ts`. The RSS compilation script automatically picks up your changes on the next build.

---

### 🏛️ I. How to Keep a New Page Searchable (and Add Deep-Linkable Query Params)

`getSearchIndex()` in `src/lib/search/searchService.ts` builds its MiniSearch index from two layers:

1. **Rich, hand-curated categories** — Simulators, Security Tools (from `toolsRegistry.ts`), Encyclopedia terms, Vendor profiles, Breaches, Living Standards, and Reference Architectures — each with its own keyword list and category label.
2. **A generic fallback pass over `ROUTE_META`** (`src/routeMeta.ts`) that indexes any route path *not already covered* by layer 1, under a `'📄 Site Pages'` category, deriving keywords from the route's title. Because every route is already required to have a `ROUTE_META` entry (§4D), **this means a brand-new plain page is searchable automatically the moment it's added there — no `searchService.ts` edit required.**

Only touch `searchService.ts` directly when a page deserves a *richer* entry than the generic fallback gives it — e.g. adding a new simulator to `SIMULATORS_LIST`, a new vendor to `VENDOR_CATALOG`, a new breach to `BREACHES_LIST`, or a new deep-linkable standard/architecture (see below) — since those hand-curated categories carry more specific keywords and a nicer category label than the generic one.

Several pages (`VendorCenter.tsx`, `StandardsExplorer.tsx`, `ArchitectureCenter.tsx`) support landing directly on a specific item via a query param, so search results and the command palette (`src/lib/search/searchService.ts`) can link straight into a specific vendor, standard, or architecture instead of just the index page. The codebase's convention is a manual mount-time `useEffect` reading `window.location.search` — not React Router's `useSearchParams` — to stay consistent across pages:
```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('yourParam')
    if (id && KNOWN_IDS.includes(id)) {
      // Per §3D, wrap the setState calls in setTimeout so the purity/
      // set-state-in-effect lint rules don't flag a synchronous effect-driven update.
      setTimeout(() => {
        setActiveItem(id)
      }, 0)
    }
  }
}, [])
```
To make a new page discoverable this way: add the effect above, then add a matching `SearchItem` entry (or a small static list of them) inside `getSearchIndex()` in `searchService.ts` with a `link` like `/your-page?yourParam=<id>`.

The one exception is `/assess`'s shareable report link, which uses a synchronous `useState` lazy initializer instead of an effect (see `Assess.tsx` and `src/lib/assess/scoring.ts`) — because the whole results view, not just an active tab, needs to be seeded before first paint, a `useEffect` would cause a visible flash of the empty wizard first.

---

### 🏛️ J. How to Add a New Achievement Rule

`CommunityHub.tsx`'s Security Badges list is a single flat array of `Achievement` objects. Most badges hardcode a specific unlock condition directly (e.g. `unlocked: completedLabs.includes('lab-oauth')`), but *cross-module milestone* badges — ones that scale off a count rather than a single named module/lab — live as pure functions in `src/lib/achievements/achievementRules.ts` instead, so they can be independently unit-tested (`achievementRules.test.ts`) without rendering the page:

```typescript
export function getYourMilestoneBadges(someCount: number): RuleBadge[] {
  return THRESHOLDS.map((t) => ({
    id: `badge-your-milestone-${t.count}`,
    title: t.label,
    // ...
    unlocked: someCount >= t.count
  }))
}
```

Import the function into `CommunityHub.tsx` and spread its output into the existing `achievements` `useMemo` array (alongside its dependency in the `useMemo`'s dependency list). Only add a new rule function here if the underlying progress is already tracked somewhere in `localStorage` (Academy `aboutiam-academy-progress`, Playgrounds `aboutiam_labs_completed`, etc.) — do not invent new persisted state solely to power a badge.

---

### 🏛️ K. How to Make an Item Bookmarkable

`src/store/bookmarksStore.ts` is a Zustand + persist store (same SSR-guarded pattern as `themeStore.ts`, §3B) holding a flat `bookmarks: { id, title, link }[]` array — richer than a plain id list so `CommunityHub.tsx`'s "Bookmarked" panel can render a title and link without needing a separate id-to-content resolver. To make any new content item bookmarkable, drop the shared button in with a stable, globally-unique id:

```tsx
import BookmarkButton from '../components/BookmarkButton'

<BookmarkButton item={{ id: `yourtype-${item.slug}`, title: item.title, link: `/your-route/${item.slug}` }} />
```

Existing id prefixes: `tool-<slug>` (`ToolPageShell.tsx`), `playground-<link>` (`PlaygroundCatalog.tsx`), `term-<id>` (`Encyclopedia.tsx`). Keep the prefix convention when adding a new bookmarkable content type so ids stay collision-free across types. `CommunityHub.tsx` reads `useBookmarksStore((s) => s.bookmarks)` directly — no changes needed there when a new content type is wired up.

---

### 🏛️ L. How to Add Content Feedback (Endorse/Flag) to a Content Item

`src/components/ContentFeedback.tsx` renders a 👍 Helpful / 🚩 Flag pair that deep-links to a pre-filled GitHub issue (`src/lib/contentFeedback.ts::buildIssueUrl`, unit-tested in `contentFeedback.test.ts`) — no backend, no new persisted state beyond a per-id "already voted" flag in `localStorage`. Wire it into any content detail view with a stable id and a human-readable title:

```tsx
import ContentFeedback from '../components/ContentFeedback'

<ContentFeedback id={`yourtype-${item.id}`} title={item.title} />
```

Currently wired into Encyclopedia term details (`term-<id>`) and Wall of Shame breach labs (`breach-<labId>`). Reuse the same id prefix already established for that content type (see §4K) so a single item's bookmark id and feedback id stay recognizably related.

---

### 🏛️ M. Guided Feature Tour

`src/components/GuidedTour.tsx` renders a 5-step, centered onboarding modal (Academy → Playgrounds → Tools → Assess → Global Search) backed by `src/store/tourStore.ts` (Zustand + persist, only the `hasSeenTour` boolean is persisted — `isOpen` is ephemeral, same `partialize` pattern as `layoutStore.ts`). It auto-opens once per browser on mount (checked via `useTourStore.getState()` inside a mount-only effect, so no reactive dependency is needed) and is mounted once at `Header.tsx` alongside `CommandPalette`, so it's available on every route. A "Replay tour" icon button in the Header calls `openTour()` directly to re-trigger it on demand.

To add a new step: append a `TourStep` object (`title`, `description`, `icon`, optional `link`/`linkLabel`) to the `STEPS` array — the progress dots, step counter, and Back/Next/Skip controls all derive from `STEPS.length` automatically.

---

### 🏛️ N. First-Visit Disclaimer Modal

`src/components/DisclaimerModal.tsx` is a separate first-visit overlay (`disclaimerStore.ts`, same Zustand + persist + `partialize` shape as §4M's tour store) summarizing the 3 Core Principles from `README.md` plus a one-line educational-use notice linking to `/terms`. It is deliberately a **separate** concern from the Guided Tour — legal/safety notice vs. feature orientation — but the two are sequenced so they never stack:

- `DisclaimerModal`'s mount effect auto-opens it if `!hasSeenDisclaimer`.
- `GuidedTour`'s mount effect only auto-opens itself if `hasSeenDisclaimer` is already `true` — on a first-ever visit it stays closed and waits.
- `DisclaimerModal`'s dismiss handler explicitly calls `useTourStore.getState().openTour()` (if the tour hasn't been seen yet) right after closing itself, so the tour opens immediately after the disclaimer instead of both fighting for the same overlay.

If a third first-visit overlay is ever added, follow the same "each auto-opens only if all prior-in-sequence flags are already true" pattern rather than giving every modal an independent, uncoordinated mount-timer.

---

### 🏛️ O. How to Add a Compliance Deadline

`src/data/complianceDeadlines.ts` is the registry backing the `/standards` "Compliance Deadlines" tab, following the same hand-curated-registry convention as `eventsRegistry.ts`/`reportsRegistry.ts`. Append a `ComplianceDeadline` object:

```typescript
{
  id: 'your-regulation-id',
  regulation: 'Full Regulation / Standard Name',
  jurisdiction: 'European Union', // groups into the tab's jurisdiction filter buttons
  deadlineDate: '2027-01-01',     // ISO date; drives the past/upcoming split automatically
  description: 'One or two sentences on what this deadline requires and why it matters for IAM.',
  relatedStandardId: 'oidc',      // optional — id from StandardsExplorer's STANDARDS array, adds a "Related Standard →" jump link
  officialLink: 'https://...',    // the regulator/publisher's own page — always required
  verifiedDate: '2027-01-01',     // when you last checked officialLink
  confidence: 'confirmed',        // 'confirmed' = fixed in an enacted law/standard; 'estimated' = depends on further implementing acts or a proposed rule
}
```

No UI changes needed — `getUpcomingDeadlines()`/`getPastDeadlines()`/`getJurisdictions()` and the search index (`searchService.ts`, category `📅 Compliance Deadlines`) all derive from this array automatically. Only mark an entry `confirmed` if the date is fixed directly in an enacted regulation; anything still dependent on a phased rollout or a not-yet-finalized rule should be `estimated` so the UI's "Estimated Date" badge sets the right expectation.

---

### 🏛️ P. Unified Personalization System (Content Depth + Career Track)

`src/store/preferenceStore.ts` (Zustand + persist) holds two independent, non-persisted-separately preferences behind one Header control (`PersonalizationSelector.tsx`, opened from the `Layers` icon button next to Airplane Mode):

- `depthMode: 'beginner' | 'expert' | 'both'` (default `'both'`, unchanged from every page's original behavior). `BeginnerExpertExplainer.tsx` (§4E's shared tool-page component) reads it to default-collapse the analogy or expert-spec column it doesn't want, but always exposes a local "Show Both" override (component `useState`, not written back to the store) so a single page view never permanently loses content.
- `roleTrack: RoleTrackId | null` (one of the 6 `InterviewCareerCenter.tsx` career track ids, default `null`). Two pages key off it:
  - `InterviewCareerCenter.tsx` lazy-initializes its `activeTrackId` from `roleTrack` (its ids already match `RoleTrackId` 1:1) and shows a small confirmation banner.
  - `Learn.tsx` maps `roleTrack` to a recommended Academy track via the local `ROLE_TRACK_RECOMMENDATIONS` record and shows a "Recommended for `<role>`: `<track>`" banner with a "Jump to Track →" button that calls `setExpandedTrack`.

To make a new tool page depth-aware, render it through `ToolPageShell`/`BeginnerExpertExplainer` as usual (§4E) — no extra wiring needed, since that shared component already reads the store. To key new content off `roleTrack`, follow the `Learn.tsx` pattern: a small local id-to-recommendation map plus a dismiss-free banner, not a new store field.

---

### 🏛️ Q. How to Add a New Living Standard (`/standards`)

`src/data/standardsData.ts` is the single source of truth for the `/standards` "Living Standards & RFC Explorer" — `StandardsExplorer.tsx` and the search index (`searchService.ts`) both import the same `STANDARDS` array, so appending one `IdentityStandard` object makes it render as a card **and** become searchable/deep-linkable (`?standard=<id>`) with no second list to remember. This fixes a real drift bug that existed before: the two files used to hand-duplicate their own copies of the standards list, so an addition to one silently didn't show up in the other.

```typescript
{
  id: 'dpop',
  title: 'DPoP',
  fullname: 'Demonstrating Proof-of-Possession at the Application Layer',
  rfcs: ['RFC 9449'],
  year: '2023',
  difficulty: 'Advanced', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the filter chips and card badge
  category: 'Tokens & Cryptography',
  summary: '...', problem: '...', whyExists: '...',
  flowchart: `ASCII sequence diagram`,
  messageFormat: `example request/response payload`,
  vulnerabilities: ['...'], bestPractices: ['...'], vendorSupport: ['...'],
  relatedResources: [{ title: 'Related Tool/Playground', path: '/tools/...', type: 'tool' }]
}
```

Prefer linking `relatedResources` to an existing tool/playground (§4E/§4F) if one already covers the protocol — most new standards added here should already have one. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `STANDARDS` and fails if any one of them isn't indexed, so a broken/missing `relatedStandardId` or search-sync regression is caught immediately.

---

### 🏛️ R. How to Add a New Reference Implementation (`/references`)

`src/data/referenceProjects.ts` is the single source of truth for the `/references` "Enterprise Reference Implementations" library — `ReferenceImplementations.tsx` and the search index (`searchService.ts`) both import the same `PROJECTS` array, so appending one `ReferenceProject` object makes it render in the level-grouped selector **and** become searchable/deep-linkable (`?ref=<id>`) with no second list to sync. The registry is deliberately its own module (not defined inside the page component) so it can be imported by `searchService.ts` without tripping the `react-refresh/only-export-components` lint rule.

```typescript
{
  id: 'your-reference-id',
  title: 'Full, Descriptive Title',
  shortLabel: 'Short Selector Label',
  category: 'Token-Based Auth', // groups within its level in the left selector — reuse an existing category where the topic fits
  level: 'beginner', // 'beginner' | 'intermediate' | 'advanced' — drives the level grouping in the selector and the overview panel's tag
  tech: 'Language / Framework',
  rfc: 'Relevant RFC(s) or spec, or "N/A" if none applies',
  description: '...',
  diagram: `ASCII sequence diagram`,
  folderStructure: `recommended directory tree`,
  codeFile: 'the-main-file.ext',
  codeLang: 'javascript', // used only as a label; syntax highlighting is not applied
  code: `the actual reference code snippet`,
  deployment: ['1. ...', '2. ...', '3. ...'],
  securityChecklist: ['...'],
  pitfalls: [{ mistake: '...', fix: '...' }]
}
```

No route-wiring needed (§4D) — the `?ref=<id>` deep link reuses the existing `/references` route, following the same query-param convention as `/patterns?pattern=<id>` and `/standards?standard=<id>` (§4I). Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `PROJECTS` and fails if any one of them isn't indexed, catching a search-sync regression immediately.

---

### 🏛️ S. How to Add a New Case Study (`/case-studies`)

`src/data/caseStudiesData.ts` is the single source of truth for the `/case-studies` "Enterprise Identity Case Study Center" — `CaseStudyCenter.tsx` and the search index (`searchService.ts`) both import the same `CASE_STUDIES` array, so appending one `CaseStudy` object makes it render as a card **and** become searchable/deep-linkable (`?study=<id>`) with no second list to sync. This follows the same fix already applied to `standardsData.ts` (§4Q): the array used to live inline inside the page component with no external file, no `difficulty` field, and no search wiring at all.

```typescript
{
  id: 'your-case-study-id',
  title: 'Descriptive Case Study Title',
  company: 'Company or Program Name',
  logo: '🏢', // any emoji works as the card icon
  category: 'Big Technology', // 'Big Technology' | 'Financial Services' | 'Government' | 'Healthcare' | 'Retail' | 'Education'
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips and card badge
  summary: '...', problem: '...',
  requirements: ['...'], challenges: ['...'],
  architecture: `ASCII topology diagram`,
  authModel: '...', authzModel: '...', lifecycle: '...', federation: '...',
  sequence: `ASCII sequence diagram`,
  threatModel: [{ risk: '...', mitigation: '...' }],
  lessons: ['...'], mistakes: ['...'], bestPractices: ['...'],
  interviewQuestions: [{ q: '...', a: '...' }],
  rfcs: ['RFC 1234 (Spec Name)'],
  relatedResources: [{ title: 'Related Tool/Playground', path: '/tools/...', type: 'tool' }]
}
```

When adding a new category value, also add it to the exported `CASE_STUDY_CATEGORIES` array in the same file so the filter-button UI stays in sync automatically (this is exactly the drift bug that previously left `Government`/`Healthcare`/`Retail`/`Education` as always-empty filter buttons). No route-wiring needed (§4D) — the `?study=<id>` deep link reuses the existing `/case-studies` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `CASE_STUDIES` and fails if any one of them isn't indexed, and separately asserts every difficulty tier and every category has at least one case study, catching both a search-sync regression and a reintroduced empty-category bug immediately.

---

### 🏛️ T. How to Add a New Reference Architecture (`/architecture`)

`src/data/architectureData.ts` is the single source of truth for the `/architecture` "Interactive Architecture Center" — `ArchitectureCenter.tsx` and the search index (`searchService.ts`) both import the same `ARCHITECTURES` array, so appending one `Architecture` object makes it searchable/deep-linkable (`?arch=<id>`) automatically. This closes a drift bug identical to the one fixed for standards/case-studies/references (§4Q-S): `ArchitectureCenter.tsx` used to define its 14 architectures inline with no `difficulty` field, while `searchService.ts` hand-maintained a second, independently-typed `ARCHITECTURES_LIST` array — a 15th architecture added to the page only would silently never appear in search.

```typescript
{
  id: 'your-architecture-id',
  name: 'Full, Descriptive Architecture Name',
  description: '...',
  difficulty: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips and dropdown grouping
  group: 'fundamentals', // 'fundamentals' | 'protocol' | 'industry' — which dropdown section it renders under
  defaultNode: 'first_node_id', // which node the diagram highlights by default when this architecture is selected
  tags: ['keyword', 'standard-acronym'], // hand-picked search keywords not already present in the name
  nodes: {
    first_node_id: {
      title: 'Node Display Title',
      role: 'What this component does in the flow.',
      analogy: 'A plain-English analogy for the beginner track.',
      spec: 'The expert-level technical specification (RFC/standard reference).',
      threatModel: 'Threat: ... Mitigation: ...',
      bestPractice: 'One actionable best practice.'
    }
    // 3-6 nodes total is typical
  }
}
```

Unlike standards/case-studies/references, the architecture's *diagram* (the clickable node layout) and its *simulation* (the "Run Simulation Handshake" trace log) are presentation-only and still live in `ArchitectureCenter.tsx` rather than the data file, since they're tightly coupled to the interactive canvas:
- Add a `{activeArch === 'your-architecture-id' && (...)}` block to the diagram workspace, following an existing compact 3-4 node example (e.g. `api_key_auth` or `jwt_stateless_api`) as a template — reuse an already-imported `lucide-react` icon per node where possible.
- Add an entry to the `SIMULATION_STEPS` map (keyed by id) with one `{ node, msg }` step per node the simulation should visit, in order — `runSimulation` itself is a single generic loop over whichever architecture's steps are active, so no control-flow changes are needed.

No route-wiring needed (§4D) — the `?arch=<id>` deep link reuses the existing `/architecture` route via the same mount-effect pattern described in §4I, and both the dropdown's default-node selection and the deep-link's default-node selection read the same `defaultNode` field (previously these were two independently hand-maintained if/else chains that could silently drift — switching architectures via the dropdown for `oauth_oidc`/`saml`/`pam`/`pki`/`k8s_identity` used to leave the previous architecture's `selectedNode` stale, breaking the detail panel, since only the `?arch=` deep-link effect had a correct per-architecture default). Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `ARCHITECTURES` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers are represented.

---

### 🏛️ U. How to Add a New IAM Landscape Product (`/explore`)

`src/data/exploreData.ts` is the single source of truth for the `/explore` "IAM Landscape Directory" — `Explore.tsx` and the search index (`searchService.ts`) both import the same `EXPLORE_PRODUCTS` array, so appending one `ExploreProduct` object makes it render as a card **and** become searchable/deep-linkable (`?product=<id>`) with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures (§4Q-T): the page used to define its 6 products inline with no `id`, no `difficulty` field, a hand-maintained type-filter tab list that had silently drifted out of sync with the data (missing the `Workforce SaaS` tab entirely), and zero search wiring.

```typescript
{
  id: 'your-product-id',
  name: 'Full Product Name',
  type: 'Open Source', // 'Open Source' | 'Enterprise SaaS' | 'Workforce SaaS' | 'CIAM' | 'Secrets Engine' | 'PAM & Access' | 'Directory Service'
  difficulty: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips and card badge
  license: 'Apache-2.0', // or 'Commercial SaaS', etc.
  deployment: 'Self-hosted (Docker, Kubernetes) / Managed Cloud',
  bestUse: 'One or two sentences on what this product is best suited for and why.',
  protocols: { oidc: true, saml: true, scim: false, fido2: true, ldap: false },
  tags: ['keyword', 'not-already-in-name-or-type'], // extra search keywords
  integrationSnippet: `# A realistic, copyable sample integration snippet`
}
```

`EXPLORE_TYPES` is derived automatically from `EXPLORE_PRODUCTS` (`Array.from(new Set(...))`), so a new `type` value automatically gets its own filter tab — no hand-maintained tab list to fall out of sync. No route-wiring needed (§4D) — the `?product=<id>` deep link reuses the existing `/explore` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `EXPLORE_PRODUCTS` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers and every `EXPLORE_TYPES` value are represented.

---

### 🏛️ V. How to Add a New Certification (`/certifications`)

`src/data/certificationsData.ts` is the single source of truth for the `/certifications` "Enterprise Certification Hub" — `CertificationHub.tsx` and the search index (`searchService.ts`) both import the same `CERTIFICATIONS` array, so appending one `Certification` object makes it render in the category/difficulty-filtered selector **and** become searchable/deep-linkable (`?cert=<id>`) with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures/explore products (§4Q-U): the page used to hard-code exactly 4 certifications inline via a closed `CertType` union with zero search wiring and no difficulty field at all.

```typescript
{
  id: 'your-cert-id',
  title: 'Full, Descriptive Certification Name',
  vendor: 'Issuing Vendor or Body',
  category: 'Cloud & Workforce IAM', // one of CERTIFICATION_CATEGORIES — reuse an existing one where the topic fits
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips
  cost: '$200 USD', // or 'Contact vendor' if pricing isn't public
  examCode: 'XX-000', // optional — omit if the credential has no formal exam code
  officialLink: 'https://vendor.com/certification', // the vendor/body's own stable top-level certification page
  domains: [{ name: 'Domain Name', weight: '25%' }], // weight can be a percentage or a qualitative label like 'Core' if the real split isn't publicly documented
  studyPath: ['Step one...', 'Step two...'],
  recommendedLabs: [{ name: 'Existing Tool/Playground', path: '/playground/...' }], // link to genuinely relevant existing tools/playgrounds, don't invent new ones
  quiz: [ /* optional CertQuizQuestion[] */ ] // only add a full mock quiz for flagship certs you can hand-verify — most new entries should omit this; CertificationHub.tsx renders a lighter "Study Blueprint + Official Exam Guide" panel automatically when quiz is absent
}
```

If adding a new category value, also add it to the exported `CERTIFICATION_CATEGORIES` array in the same file so the category grouping in the selector stays in sync. No route-wiring needed (§4D) — the `?cert=<id>` deep link reuses the existing `/certifications` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `CERTIFICATIONS` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers are represented.

---

### 🏛️ W. How to Add a New CVE or RFC/Draft (`/research`)

`src/data/researchData.ts` is the single source of truth for the `/research` "Identity Research & CVE Tracker" — `ResearchCenter.tsx` and the search index (`searchService.ts`) both import the same `CVE_DATABASE`/`RFC_DATABASE` arrays, so appending an object to either makes it render in the difficulty-filtered list **and** become searchable/deep-linkable (`?cve=<id>` / `?rfc=<slug>`) with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures/explore products/certifications (§4Q-V): both databases used to be defined inline in the page component with no `difficulty` field and zero search wiring — `/research` was only reachable via the generic "📄 Site Pages" fallback with no way to deep-link into a specific entry.

```typescript
// CVE_DATABASE entry
{
  id: 'CVE-YYYY-NNNNN',
  title: 'Descriptive Vulnerability Name',
  cvss: 8.8,
  component: 'Affected Library / Product',
  vulnerabilityType: 'e.g. Signature Wrapping, Command Injection, SSRF',
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips and badge
  description: '...',
  exploitScenario: '...',
  patchRemediation: '...',
  vulnerableCode: `// insecure snippet`,
  secureCode: `// hardened snippet`
}

// RFC_DATABASE entry
{
  number: 'RFC 1234', // or a draft name like "OAuth 2.1" — run through rfcSlug() for its ?rfc= id
  title: 'Full Standard/Draft Title',
  status: 'Live', // 'Live' | 'Draft' | 'Deprecated'
  category: 'Tokens', // free-form grouping label shown on the card
  difficulty: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips and badge
  description: '...',
  keyTakeaway: 'One actionable, security-relevant takeaway.'
}
```

The `rfcSlug()` helper (also exported from `researchData.ts`) turns a `number` field into its stable `?rfc=<slug>` id (e.g. `"RFC 6749"` → `"rfc-6749"`, `"OAuth 2.1"` → `"oauth-2-1"`) — always use it rather than hand-writing the slug, so the data file and the deep link never drift apart. No route-wiring needed (§4D) — both `?cve=<id>` and `?rfc=<slug>` deep links reuse the existing `/research` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in both `CVE_DATABASE` and `RFC_DATABASE` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers are represented in each dataset.

---

### 🏛️ X. How to Add a New Security Bulletin (`/bulletins`)

`src/data/bulletinsData.ts` is the single source of truth for the `/bulletins` "Security Bulletin Board & IR Simulator" — `SecurityBulletins.tsx` and the search index (`searchService.ts`) both import the same `BULLETINS` array, so appending one `Bulletin` object makes it render in the difficulty/category-filtered selector, become searchable/deep-linkable (`?bulletin=<id>`), and automatically drive the "Crisis Response Console" simulator with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures/explore products/certifications/research (§4Q-W): the page used to hard-code exactly 4 bulletins inline via a closed `IncidentType` union, with the simulator's narrative text hand-written as three separate `if/else if` chains keyed on that same union — a 5th bulletin would have silently fallen into the last `else` branch and displayed the wrong incident's narrative, and there was no search wiring beyond the generic "📄 Site Pages" fallback (and `/bulletins` itself was missing from `sitemap.xml`/`llms.txt` entirely).

```typescript
{
  id: 'your-bulletin-id',
  title: 'Full, Descriptive Incident Title',
  date: 'Month Year or a range',
  severity: 'Critical', // 'Critical' | 'High' | 'Medium' | 'Low'
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips
  category: 'OAuth & Token Abuse', // one of BULLETIN_CATEGORIES — reuse an existing one where the topic fits
  vector: 'Short Attack Vector Label',
  description: '...',
  playbookSteps: ['Step one...', 'Step two...'],
  remediationSnippet: `// hardened code snippet`,
  snippetLanguage: 'JavaScript',
  controlsMapped: ['soc2_2', 'iso_3'], // ids into the shared CONTROL_TITLES map in the same file
  simulator: {
    step1Log: 'SIEM Log: ...',           // shown when the user clicks "Step 1: Detect Threat"
    step2Log: 'Incident Detail: ...',    // shown when the user clicks "Step 2: Analyze Vector"
    containmentHighLog: 'Action: ...\n✓ Containment Successful! ...', // the correct, standards-compliant remediation
    containmentLowLog: 'Action: ...\n❌ Containment Failed! ...'      // the tempting-but-wrong shortcut remediation
  }
}
```

If adding a new category value, also add it to the exported `BULLETIN_CATEGORIES` array in the same file so the category filter chips stay in sync. No route-wiring needed (§4D) — the `?bulletin=<id>` deep link reuses the existing `/bulletins` route via the same mount-effect pattern described in §4I. Because the simulator is fully data-driven off each bulletin's own `simulator` field, a new bulletin gets correct Crisis Response Console narrative text automatically — there is no `if/else` chain left to remember to extend. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `BULLETINS` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers and every `BULLETIN_CATEGORIES` value are represented; `bulletinsData.test.ts` additionally guards that every `controlsMapped` id resolves to a real `CONTROL_TITLES` entry and that every bulletin carries a complete, non-empty `simulator` script.

---

### 🏛️ Y. How to Add a New Cheat Sheet (`/cheat-sheets`)

`src/data/cheatSheetsData.ts` is the single source of truth for the `/cheat-sheets` "Developer Playbooks" checklist library — `CheatSheets.tsx` and the search index (`searchService.ts`) both import the same `CHEAT_SHEETS` array, so appending one `CheatSheet` object makes it render in the category/difficulty-filtered selector **and** become searchable/deep-linkable (`?sheet=<id>`) with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/architectures/explore products/certifications/research/bulletins/breaches (§4B, §4Q–§4X): the page used to hard-code exactly 9 sheets inline inside the component body itself (recreated on every render) with no `category` or `difficulty` field at all, and zero search wiring.

```typescript
{
  id: 'your-sheet-id',
  title: 'Full, Descriptive Checklist Title',
  target: 'Who this checklist is for (role or audience)',
  category: 'Application Security', // one of SHEET_CATEGORIES — reuse an existing one where the topic fits
  difficulty: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced' — drives the difficulty filter chips
  checks: [
    { id: 'yoursheet_1', task: 'One-line actionable remediation step', desc: 'A fuller explanation of why this step matters and how to implement it.' },
    // 4+ checks is typical — keep the array non-empty, since the progress gauge divides by its length
  ]
}
```

If adding a new category value, also add it to the exported `SHEET_CATEGORIES` array in the same file so the category grouping in the sidebar selector stays in sync. No route-wiring needed (§4D) — the `?sheet=<id>` deep link reuses the existing `/cheat-sheets` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `CHEAT_SHEETS` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers and every `SHEET_CATEGORIES` value are represented; `cheatSheetsData.test.ts` additionally guards that every sheet has a non-empty `checks` array (the percent-complete gauge divides by this length, so an empty array would render `NaN`) and that every check id is unique within its sheet.

---

### 🏛️ Z. How to Add to the AI Knowledge Assistant (`/assistant`)

`src/data/aiKnowledgeGraph.ts` is the single source of truth for all four `/assistant` tabs — `Assistant.tsx` and the search index (`searchService.ts`) both import the same `KNOWLEDGE_GRAPH`/`COMPARISONS`/`LEARNING_TRACKS`/`INTERVIEW_QUESTIONS` exports, so appending an entry to any of them makes it render in the UI **and** become searchable/deep-linkable with no second list to sync. This closes the same class of drift bug fixed for standards/case-studies/references/etc. (§4Q-Y): `COMPARISONS`/`LEARNING_TRACKS` previously had zero search wiring, `INTERVIEW_QUESTIONS` was defined but never rendered anywhere on the page at all (routeMeta's own description promised an "interview prep simulator" that didn't exist), and the Learning Planner's level `<select>` only offered two of the four levels actually present in the data, silently making the `Expert` tier unreachable.

**Knowledge Chat resource keywords** (`KNOWLEDGE_GRAPH: Record<string, ResourceLink[]>`) — add a lowercase key (use a natural single word where possible; if a multi-word concept truly needs an underscore key like `zero_trust`, `extractResources()` in `Assistant.tsx` matches both the raw key and its space-separated form, so it detects "zero trust" typed naturally) mapped to 1-4 `ResourceLink` entries pointing at real, already-existing tools/playgrounds/encyclopedia terms:
```typescript
mfa: [
  { title: 'TOTP Generator & Verifier', path: '/tools/totp-generator', type: 'tool', desc: 'RFC 6238 TOTP codes' },
  { title: 'MFA', path: '/encyclopedia?term=mfa', type: 'encyclopedia' }
]
```

**Comparison Engine** (`COMPARISONS: ComparisonData[]`):
```typescript
{
  id: 'your-comparison-id',
  title: 'Entity A vs Entity B',
  entityA: 'Entity A', entityB: 'Entity B',
  summary: '...',
  table: [{ feature: 'Feature Name', a: '...', b: '...' }],
  useCasesA: ['...'], useCasesB: ['...']
}
```

**Learning Planner** (`LEARNING_TRACKS: LearningTrack[]`) — `level` must be one of `'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'` and `goal` one of `'Security Engineer' | 'IAM Architect'` (the exact strings the `Assistant.tsx` `<select>` options render, sourced from the `LEARN_LEVELS`/`LEARN_GOALS` constants at the top of that file) — a new `level`/`goal` value must be added to those constants first or the track is unreachable in the UI (this is exactly the bug fixed above):
```typescript
{
  level: 'Advanced', goal: 'Security Engineer',
  title: '...', description: '...',
  steps: [{ title: '...', desc: '...', resources: [{ title: '...', path: '/playground/...', type: 'playground' }] }]
}
```

**Interview Prep** (`INTERVIEW_QUESTIONS: InterviewQuestion[]`):
```typescript
{
  id: 'your-question-id',
  domain: 'OAuth/OIDC', // free-form — automatically becomes a filter chip on the Interview Prep tab
  question: '...', hint: '...', answer: '...',
  rfc: 'RFC 1234' // optional
}
```

No route-wiring needed (§4D) — all three deep-link patterns (`?tab=compare&compare=<id>`, `?tab=learn&level=<lvl>&goal=<goal>`, `?tab=interview&q=<id>`) reuse the existing `/assistant` route via the same mount-effect pattern described in §4I. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `COMPARISONS`/`LEARNING_TRACKS`/`INTERVIEW_QUESTIONS` and fails if any one of them isn't indexed; `aiKnowledgeGraph.test.ts` additionally guards id uniqueness, non-empty comparison tables/use-case lists, that every learning track's level/goal is actually selectable in the UI, and that every knowledge-graph key has at least one resource.
