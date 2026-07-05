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
| **`/architecture`** | `ArchitectureCenter.tsx` | Interactive, clickable Reference Architecture diagrams with threat models and trace logs for Zero Trust, B2B SaaS, and Multi-Cloud SPIRE. |
| **`/vendor`** | `VendorCenter.tsx` | Checklists, licensing models, certified paths, and technical interview guides for Entra ID, Okta, Keycloak, Ping, and CyberArk. |
| **`/research`** | `ResearchCenter.tsx` | Searchable identity CVE directory with side-by-side remediation code patches and active standard IETF RFC drafts. |
| **`/patterns`** | `DesignPatternLibrary.tsx` | Hardened design patterns, sequence flows, and checklists for B2B Federated SSO, API Gateway Token Exchange (RFC 8693), and Passwordless. |
| **`/certifications`** | `CertificationHub.tsx` | Exam domains, study paths, and interactive practice tests for Microsoft, Okta, Ping, and CyberArk credentials. |
| **`/bulletins`** | `SecurityBulletins.tsx` | Active threat bulletins tracking real-world incident post-mortems (Okta support, SolarWinds) with an interactive "Crisis Response Console" simulation game. |
| **`/playground`** | `PlaygroundCatalog.tsx` | Interactive Sandboxes index. Links to all 15+ completed simulators. |
| **`/tools`** | `ToolsCatalog.tsx` | Security Tools index. 100% client-side utilities, categorized, rendered from `src/data/toolsRegistry.ts` (all 23 tools live). |
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
| **`/assess`** | `Assess.tsx` | GRC Maturity Wizard. Self-assessments with dynamic charts and downloadable SVG roadmaps. |
| **`/explore`** | `Explore.tsx` | Landscape Directory. Product blueprints with copyable integration code blocks. |
| **`/assistant`** | `Assistant.tsx` | AI Architect Chat. Simulated RAG chatbot delivering JSON policies and Rego scripts. |
| **`/encyclopedia`**| `Encyclopedia.tsx` | Master A-Z Glossary. 36 categorized standard terms with analogies and specs. |
| **`/wall-of-shame`**| `WallOfShame.tsx` | Identity Museum. 5 Eras of history, SolarWinds Golden SAML, and push-bombing fatigue. |
| **`/contributors`**| `Contributors.tsx` | Team & Contact page. Integrates developer bio cards and interactive forms. |
| **`/timeline`** | `IdentityTimeline.tsx` | Interactive historical identity timeline from mainframes to post-2030 ambient trust with inline simulators. |
| **`/community`** | `CommunityHub.tsx` | Community Achievements and dynamic contributor badges matched with local storage progression. |
| **`/community-forums`** | `CommunityForums.tsx` | Threaded developer forums (SCIM conflicts, SSW bypasses) and custom architectural showcase. |
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

### 🧪 C. Testing Standards (`npm run test`)
We mandate the inclusion of Vitest unit tests for all state mutations, mathematical calculations, and helper utility libraries. Running `npm run test` executes tests in our custom safe environments.

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

### 💣 B. How to Add a New Breach to the Museum
To add a new cyber-attack profile or historic case study to the **Vulnerability Lab**, open `src/pages/WallOfShame.tsx` and append a new breach object into the `breaches` array:
```typescript
{
  id: 4,
  title: 'My Custom Hack Title',
  year: '2026',
  company: 'Target Corp Name',
  attack: 'Attack Vector Title',
  desc: 'Detailed description of how the security failure occurred...',
  vulnCode: `// Insecure code snippet`,
  secureCode: `// Secure remediation code snippet`,
  remediation: 'Detailed, code-level explanation of the modern defensive fix.'
}
```
*The timeline slider will dynamically add the new node instantly!*

### 🎓 C. How to Add a New Course Track to the Academy
To add a new learning track or module to the **IAM Academy**, open `src/pages/Learn.tsx` and append a new `Track` object to the `tracks` array. Enforce six sub-modules per track to maintain the global graduation progress bar ratios.

### 🧭 D. How to Add a New Page/Route
Adding a page touches **three** files, because routes are statically pre-rendered for SEO (see §1) rather than resolved purely client-side:
1. **`src/App.tsx`** — add the `<Route path="..." element={<YourPage />} />`.
2. **`src/routeMeta.ts`** — add a `{ path, title, description }` entry. This drives the browser tab title, `<meta name="description">`, and canonical link that `Header.tsx` syncs on navigation.
3. **`scripts/postbuild-ssg.mjs`** — add the *same* `{ path, title, description }` entry to its `ROUTES` array. This script runs in plain Node after `vite build` and intentionally keeps its own copy instead of importing the `.ts` file (avoids depending on a specific Node TypeScript-execution feature in CI) — it's what writes the real `dist/<route>/index.html` GitHub Pages serves. Skipping this step means the route works for in-app navigation but 404s for anyone (or any crawler) linking to it directly.

Optionally add a `Sidebar.tsx` nav entry and a `public/sitemap.xml` `<url>` entry if the page should be discoverable from the main nav / search engines.

### 🛠️ E. How to Add a New Security Tool (`/tools/<slug>`)

The **Security Tools** section (`/tools`) is a registry-driven extension point on top of the routing convention in §4D — all 23 planned tools are now fully live and shipped. To add a new (24th) tool in the future, follow these steps:

1. **`src/data/toolsRegistry.ts`** — append a `ToolMeta` entry (`slug`, `title`, `description`, `category`, `icon`, `phase`, `keywords`, `analogy`, `expert`, `faqs`, optional `relatedLinks`) with `status: 'planned'` while you build, then flip to `'live'` when it ships. `ToolsCatalog.tsx` and the sidebar-adjacent catalog card both render from this array automatically — nothing else to touch there.
2. **`src/pages/Tools/<PascalCaseName>.tsx`** — build the page using the shared components in `src/components/Tools/` (`ToolPageShell` for the header/privacy-notice/JSON-LD wrapper, `BeginnerExpertExplainer` for the analogy/expert/FAQ card, `useClipboardCopy` for copy buttons, `FileDropInput` for file-accepting tools) and any pure-logic helpers you need in `src/lib/tools/` (one small, independently Vitest-tested module per concern — see the existing `base64.ts`/`jwt.ts`/`totp.ts`/etc. for the pattern).
3. **Route wiring** — same 3 files as §4D (`App.tsx`, `routeMeta.ts`, `postbuild-ssg.mjs`), plus a `public/sitemap.xml` `<url>` entry and a `public/llms.txt` line, plus flipping the registry `status` to `'live'` from step 1.
4. **No JSON-LD or FAQ schema work needed** — `ToolPageShell` generates both `SoftwareApplication` and `FAQPage` structured data automatically from the registry entry's `description`/`expert`/`faqs` fields.
5. Run the responsive/mobile-overflow sweep described in `FIXED_TODO.md` §7 before calling it done — two real overflow bugs were found this way during the first 12 tools, both fixed at the shared-component level, but new tools can still introduce new ones (e.g. a long unbroken example string in a paragraph without `wrap-break-word`).
