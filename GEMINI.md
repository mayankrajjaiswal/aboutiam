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
- **File Export:** JSZip, dynamically `import()`-ed at the moment a user clicks "Download Study Pack" (`src/lib/studyPackExport.ts`) rather than statically imported — keeps the ~100KB library out of the `Home.tsx` chunk entirely (§4EE). `jsPDF` + `jspdf-autotable` (~400KB combined) follow the identical pattern for the sibling "Download IAM Field Guide (PDF)" button (`src/lib/export/fieldGuidePdf.ts`).
- **Optional Cloud Sync:** Google Identity Services token client + the Drive v3 REST API, called directly with `fetch` (no `gapi`/SDK dependency) — powers the opt-in Google Drive Backup & Restore feature (§4DD), gated behind `VITE_GOOGLE_CLIENT_ID`.
- **Testing Core:** Vitest (Vite-native unit testing with mock SSR safeguards).
- **Discoverability:** `robots.txt`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest`, and `security.txt` live in `public/` and all reference the production domain directly — update them alongside any future domain change.
- **Security Hardening:** A strict `Content-Security-Policy` (`connect-src 'none'`) and `Referrer-Policy` are enforced via `<meta>` tags in `index.html` (GitHub Pages serves no custom HTTP headers, so this is the only enforcement mechanism). `.github/workflows/deploy.yml` and `ci.yml` pin all third-party GitHub Actions to commit SHA (not mutable tags) and gate on `npm run audit:check` (§3G); `.github/dependabot.yml` keeps both npm and Actions pins current.

---

## 2. Operational Pages Directory

The active workspace maps cleanly to the following page assets under `src/pages/`:

| Path | Component Name | Description |
| :--- | :--- | :--- |
| **`/`** | `Home.tsx` | Overview Dashboard. Features dual-tracks (Beginners vs. Experts), a "Continue Where You Left Off" widget (`ContinueLearningCard.tsx` / `src/lib/home/continueLearning.ts`, ranked by `src/lib/home/lastTouched.ts` timestamps written from `Learn.tsx`/`IdentityLabs.tsx`/`usePlayground.ts`), a date-seeded "Fact of the Day" widget rotating through the site's own trivia and Encyclopedia analogies (`src/lib/home/factOfTheDay.ts`), a "Not sure where to start?" goal-based routing wizard (`StartHereWizard.tsx` over `src/data/startHereRoutes.ts`, progress persisted via `useStartHereStore`) — distinct from the Header's Personalize control, which tags a preference rather than actively routing — Google Drive Backup, and the zero-account local Export/Import Profile card (`ProfileExportImport.tsx`; single source of truth for which keys are included is `src/lib/backup/knownStorageKeys.ts`). |
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
| **`/standards`** | `StandardsExplorer.tsx` | Living Standards & RFC Explorer. Visually explore standard specs and RFC timelines across OIDC, SAML, SCIM. Supports `?standard=<id>&tab=<tab>` deep links. A "Compliance Deadlines" tab (`?view=deadlines`) tracks regulatory deadlines (NIS2, DORA, PCI DSS 4.0, eIDAS 2.0, etc.) from `src/data/complianceDeadlines.ts`, filterable by jurisdiction with a past/upcoming toggle. A "Wallet/mDL Adoption" tab (`?view=wallet-adoption`) tracks US state mobile-driver's-license rollout status from `src/data/walletAdoptionTracker.ts` — a different axis (consumer adoption, not regulatory dates) from Compliance Deadlines, both refreshed quarterly. `pageView` is a 3-way union (`'standards' \| 'deadlines' \| 'wallet-adoption'`); each new view slots into the same ternary chain rather than a nested state machine. (Phase 6) |
| **`/knowledge-graph`** | `KnowledgeGraph.tsx` | Knowledge Graph. A concentric-ring SVG map connecting Standards, Encyclopedia terms, and Architecture Center entries via hand-curated edges in `src/data/knowledgeGraphData.ts` (§4BB), paired with a searchable/type-filterable list and a detail panel for full-content-independent usability on small screens. The same edges also power `RelatedContentRail.tsx`, rendered inline on tool pages (via `ToolPageShell`), `Encyclopedia.tsx`'s term detail view, and `ArchitectureCenter.tsx`. |
| **`/daily-puzzle`** | `DailyPuzzle.tsx` | Daily Identity Puzzle. A date-seeded (`src/lib/games/dailyPuzzle.ts` — deterministic, no `Math.random()`) rotation across a 36-entry bank (`src/data/dailyPuzzleBank.ts`) of JWT-vulnerability, SAML-tampering, and protocol-guess puzzles — every visitor gets the same puzzle on the same UTC date. Up to 3 attempts, a Wordle-style emoji result grid, and a `?r=<code>` shareable replay link. The interactive widget (`src/components/DailyPuzzleWidget.tsx`) is also embedded directly on `Home.tsx`. |
| **`/architecture`** | `ArchitectureCenter.tsx` | Interactive, clickable Reference Architecture diagrams with threat models and trace logs — 24 architectures spanning Beginner (session/cookie auth, LDAP bind, social login, API keys, basic RBAC), Intermediate (JWT stateless APIs, SSO reverse proxy, step-up MFA, IGA access reviews, JIT PAM), and Advanced (Zero Trust, B2B SaaS, Multi-Cloud SPIFFE/SPIRE, PKI, banking/healthcare/government/manufacturing/retail) tiers, backed by `src/data/architectureData.ts` (§4S). Supports `?arch=<id>` deep links and a difficulty filter. |
| **`/vendor`** | `VendorCenter.tsx` | Enterprise Ecosystem & Vendor Intelligence Portal. Comprehensive profiles for 18 major platforms, including a flagship featured profile for Thales (OneWelcome, SafeNet Trusted Access, IdCloud) with inner ASCII diagrams, Troubleshooting, and custom Interview Prep. Integrates the Live Identity Intelligence Hub (news, searchable CVE code patch repairs, and visual AI Ingestion Pipeline Simulator), Community Events Calendars with alerts, and Social dashboards with AI Weekly Digest builders. A "Compare" toggle switches the vendor list to multi-select checkboxes (up to 3) and renders a side-by-side attribute table; deep-linkable via `?compare=<key1>,<key2>`. |
| **`/research`** | `ResearchCenter.tsx` | Identity Research & CVE Tracker — 13 beginner-to-advanced CVEs with side-by-side vulnerable/secure code patches, and 17 IETF RFCs/drafts spanning the core IAM protocol registry, backed by `src/data/researchData.ts`. Difficulty-filterable on both panels, deep-linkable via `?cve=<id>`/`?rfc=<slug>`, and individually searchable. |
| **`/patterns`** | `DesignPatternLibrary.tsx` | Hardened design patterns, sequence flows, and checklists for B2B Federated SSO, API Gateway Token Exchange (RFC 8693), and Passwordless. |
| **`/certifications`** | `CertificationHub.tsx` | Enterprise Certification Hub. 27 beginner-to-advanced identity certifications backed by `src/data/certificationsData.ts` (§4U) — spanning Fundamentals (SC-900, Security+, IDPro CIDPRO), Cloud & Workforce IAM (SC-300, AZ-500, Okta, Ping, AWS/GCP), Identity Governance (SailPoint, Saviynt, One Identity), PAM (CyberArk, BeyondTrust, Delinea), Security Leadership & GRC (CISSP, CCSP, CISM, CRISC), Privacy (IAPP CIPT/CIPM), and Cloud-Native (CKS). Difficulty/category filterable, deep-linkable via `?cert=<id>`, and individually searchable; flagship certs carry an interactive mock quiz. |
| **`/career-center`** | `InterviewCareerCenter.tsx` | Comprehensive role-based interview preparation system spanning 6 role tracks featuring MCQs, scenarios, design simulations, coding terminals, timed mocks, and resume guidelines. Its Resume & Portfolio tab embeds `PortfolioExport.tsx`, which reads real `localStorage` progress to auto-draft resume bullets, award a self-baked Open Badges 2.0 SVG badge, and export a Markdown/print-to-PDF portfolio. |
| **`/bulletins`** | `SecurityBulletins.tsx` | Active threat bulletin board backed by `src/data/bulletinsData.ts` (§4W) — 18 beginner-to-advanced identity incident post-mortems spanning Credential & Session Theft, MFA & Push Fatigue, Federation & SSO Exploits, OAuth & Token Abuse, Cloud IAM Misconfiguration, Directory & Kerberos Attacks, and Supply Chain & Provisioning. Difficulty/category filterable, deep-linkable via `?bulletin=<id>`, individually searchable, bookmarkable, and paired with a data-driven "Crisis Response Console" simulation game. |
| **`/playground`** | `PlaygroundCatalog.tsx` | Interactive Sandboxes index. Links to all 22+ completed simulators, each bookmarkable via `BookmarkButton`. |
| **`/tools`** | `ToolsCatalog.tsx` | Security Tools index. 100% client-side utilities, categorized, rendered from `src/data/toolsRegistry.ts` (39 tools live). Every tool page (`ToolPageShell`) is bookmarkable via `BookmarkButton`. |
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
| **`/tools/pbkdf2-generator`** | `Tools/Pbkdf2Generator.tsx` | Derives a key from a password via PBKDF2 (configurable salt/iterations/hash) and verifies a password against a stored derived hash, using Web Crypto. |
| **`/tools/cert-bundle-splitter`** | `Tools/CertBundleSplitter.tsx` | Splits a multi-certificate PEM bundle into individual certs, inspects each subject/issuer/expiry, and checks leaf-to-root chain order. |
| **`/tools/did-document-validator`** | `Tools/DidDocumentValidator.tsx` | Validates a Decentralized Identifier (DID) Document JSON against W3C DID Core structural requirements, with a field-by-field resolved preview. |
| **`/tools/identity-sbom-analyzer`** | `Tools/IdentitySbomAnalyzer.tsx` | Parses a pasted `package.json` and matches dependencies against a curated table of historically CVE-disclosed auth-adjacent libraries (`src/data/authRiskyLibraries.ts`), cross-linking matches to the CVE Tracker and offering a downloadable "Identity SBOM" JSON export. |
| **`/tools/tabletop-exercise-generator`** | `Tools/TabletopExerciseGenerator.tsx` | Turns a selected Security Bulletins entry into a printable, facilitator-ready live-team tabletop exercise script (`src/lib/tools/tabletopGenerator.ts`) — objectives, a T+0/T+15/T+30 timed inject sequence, one discussion prompt per real playbook step, and a 3-area scoring rubric cross-referencing the bulletin's mapped compliance controls. No new incident authoring — reuses `BULLETINS` directly (§4X). |
| **`/tools/raci-builder`** | `Tools/RaciBuilder.tsx` | Editable RACI matrix over a starter activity list (`src/data/iamRaciActivities.ts`, extensible via an "Add Activity" row) and user-defined roles. Validation (`src/lib/tools/raciValidation.ts`) enforces exactly one Accountable + at least one Responsible per activity and warns when one role holds both R and A on too many activities — a `RaciCell` is `RaciLetter[]`, not a single letter, specifically so one person can hold multiple letters on one activity. |
| **`/tools/risk-register-builder`** | `Tools/RiskRegisterBuilder.tsx` | Editable risk register scored on a standard 5x5 impact x likelihood matrix (`src/lib/tools/riskRegisterScoring.ts`, tier boundaries 1-4/5-9/10-14/15-25 → Low/Medium/High/Critical). Ships with `STARTER_RISK_REGISTER`, editable/deletable starter risks drawn loosely from the Security Bulletins categories. Cross-links to the RACI Builder (assign ownership) and `/assess` (score overall posture). |
| **`/tools/pqc-readiness-auditor`** | `Tools/PqcReadinessAuditor.tsx` | Paste a PEM cert chain, JWKS JSON, or TLS cipher-suite list; `src/lib/tools/pqcReadiness.ts` reuses `parseCertificateOrCsr` (`x509.ts`) and matches detected algorithms against a static risk table (`src/data/pqcAlgorithmRisk.ts`) covering RSA/ECDSA/EdDSA/AES/ML-KEM/ML-DSA/SLH-DSA, producing a Critical/High/Medium/Info checklist plus a hybrid-handshake size-delta estimate. Analysis-only — no real PQC signing/key-exchange runs in-browser. |
| **`/playground/agent-identity`** | `Playgrounds/AgentIdentityLab.tsx` | OAuth 2.1 delegation chains and scope-narrowing limits for AI agents. |
| **`/playground/nhi-sprawl`** | `Playgrounds/NhiSprawlLab.tsx` | Triage game over a seeded fleet of 60 (of a simulated 500) service accounts, API keys, and CI/CD tokens — rotate, revoke, or keep each one against an NHI-governance rubric, backed by `src/data/nhiSprawlRecords.ts`. |
| **`/playground/passkey-rollout-strategist`** | `Playgrounds/PasskeyRolloutStrategist.tsx` | Allocate a fixed rollout budget across platform SDKs, help-desk training, legacy-fallback sunset, and account recovery, then see 4 quarters of deterministic adoption/phishing/ticket outcomes scored against FIDO Alliance 2026 benchmarks, backed by `src/data/passkeyRolloutModel.ts`. |
| **`/playground/modernization-backlog`** | `Playgrounds/ModernizationBacklogGame.tsx` | Sequence 20 legacy-IAM tech-debt items into a 12-month roadmap under a fixed quarterly budget, respecting dependency order and maximizing risk-reduction-per-dollar, backed by `src/data/modernizationBacklogItems.ts` and `src/lib/games/modernizationScoring.ts`. |
| **`/playground/incident-commander`** | `Playgrounds/IncidentCommanderSim.tsx` | Branching-decision incident-commander sim built from real Security Bulletins incidents (`src/data/incidentCommanderScenarios.ts` — each `bulletinId` cross-references `BULLETINS`). Every decision is either another node id or `outcome:<id>`; the data-file test proves the tree is fully connected and every path terminates within a bounded number of decisions before adding a new scenario. |
| **`/playground/build-your-idp`** | `Playgrounds/BuildYourIdp.tsx` | 5-step wizard assembling a minimal OIDC Provider — real RS256 keypair, live discovery document + JWKS preview, client/consent config — then a mock RP runs authorization-code + PKCE and mints a self-verifying signed ID token, deep-linkable to `/tools/jwt-decoder?token=<jwt>`. |
| **`/playground/openid4vc-wallet`** | `Playgrounds/OpenId4VcWallet.tsx` | Issues a real SD-JWT verifiable credential (`src/lib/tools/sdJwtIssue.ts`, paired with the existing `sdJwt.ts` decoder), stores it in a mock wallet with per-claim toggles, and selectively discloses only what a verifier requested — flags both missing and over-disclosed claims, backed by `src/data/openId4VcScenarios.ts`. |
| **`/playground/trust-registry`** | `Playgrounds/TrustRegistryExplorer.tsx` | Reuses `openId4VcScenarios.ts`'s `issuerName`s rather than duplicating credential data. `src/data/trustRegistryScenarios.ts`'s `verifyIssuerAuthorization` checks issuer authorization independently of signature validity -- one level of cross-registry recognition models the real EUDI cross-border gap, and revoking an issuer live flips previously-authorized verifications to fail. |
| **`/playground/ciem-explorer`** | `Playgrounds/CiemExplorer.tsx` | Reuses `src/lib/graph/forcePath.ts`'s `computeForceLayout` (built for `/playground/attack-path-graph`) rather than a second graph renderer. `src/lib/graph/ciemAnalysis.ts` distinguishes `computeGrantedPermissions` (direct policy only) from `computeEffectivePermissions` (BFS through `CanAssume`/`TrustsAccount` edges) against `src/data/ciemScenarios.ts`'s curated `TOXIC_COMBINATION_RULES`, plus `computeLeastPrivilegePolicy` intersecting granted permissions against a mock access log. |
| **`/playground/fapi2`** | `Playgrounds/Fapi2Lab.tsx` | Toggle PAR, sender-constrained tokens (mTLS/DPoP), and signed responses (JARM/JAR) on/off and simulate the matching attack against each — both the attack-succeeds and attack-blocked branches render, backed by `src/data/fapi2Scenarios.ts`. Cross-linked from the banking Architecture Center entry and a new `fapi2` Standards Explorer entry. |
| **`/playground/caep-event-storm`** | `Playgrounds/CaepEventStorm.tsx` | Fires a CAEP event from a mock IdP Event Bus to 4 mock relying parties with independent subscriptions, latency, and enforcement, backed by `src/data/caepEventScenarios.ts`. Reuses the header's Airplane Mode store (`useAirplaneModeStore`) as the "chaos" toggle for an offline subscriber. Distinct from the existing single-transmitter/receiver `/playground/caep` lab — this is the multi-subscriber pub-sub fan-out; `caep-ssf`'s Standards Explorer entry links to both. |
| **`/playground/attack-path-graph`** | `Playgrounds/AttackPathGraph.tsx` | BloodHound-style force-directed graph — click hop-by-hop along directed `MemberOf`/`AdminTo`/`HasSession`/`CanRDP`/`Owns` edges to trace a privilege-escalation path to Domain Admin/Cloud Admin across a 10-node beginner and 24-node advanced scenario, then reveal the true shortest path with a per-hop real-world technique breakdown. Backed by `src/data/attackPathScenarios.ts` (graph data) and `src/lib/graph/forcePath.ts` (BFS shortest-path + a custom deterministic spring/repulsion force layout — see §4GG). |
| **`/playground/jwt`** | `JWTStudio.tsx` | JWT encoder/decoder. Runs real browser-native HS256 signatures and "none" alg exploits. |
| **`/playground/oauth`** | `OAuthVisualizer.tsx` | Step-by-step OIDC flow chart. Animates front/back-channels and parses raw HTTP. |
| **`/playground/saml`** | `SAMLWorkbench.tsx` | XML assertion workbench. Simulates SAML Signature Wrapping (SSW) attacks. |
| **`/playground/fido2`** | `FIDO2Lab.tsx` | WebAuthn key emulator. Parses clientDataJSON and authenticatorData payloads. |
| **`/playground/access`** | `AccessControlLab.tsx` | Dynamic ABAC/RBAC engine evaluating department, device, and network. |
| **`/playground/ldap`** | `LDAPTreeSimulator.tsx` | AD directory tree simulator. Searches objects dynamically using LDAP filters. |
| **`/playground/ldap-schema-designer`** | `Playgrounds/LdapSchemaDesigner.tsx` | Builds (not just queries) an OU tree from scratch — add nested OUs/groups/users, link GPOs, and toggle inheritance blocking. Pure tree logic lives in `src/lib/tools/ldapSchemaTree.ts` (`computeEffectiveGpos` mirrors real AD Group Policy inheritance/blocking semantics) with LDIF serialization split into `src/lib/tools/ldifExport.ts`. |
| **`/playground/zta`** | `ZTAPlanner.tsx` | Zero Trust risk controller based on NIST SP 800-207. |
| **`/playground/scim`** | `Playgrounds/SCIMLab.tsx` | Visual Identity Provider (IdP) to Service Provider (SP) SCIM sync pipeline. |
| **`/playground/oauth-attack`** | `Playgrounds/OAuthAttackLab.tsx` | Hack-and-defend sandbox mapping PKCE bypasses, wildcard redirects, and CSRF state omissions. |
| **`/playground/kerberos`** | `Playgrounds/KerberosLab.tsx` | State-machine AD simulator detailing ticketing (AS/TGS) and Golden/Silver ticket exploits. |
| **`/playground/ctf`** | `Playgrounds/IdentityCTFArena.tsx` | Gamified client-side identity hacking challenges (JWT none bypass, SAML wrapped assertions, LDAP injections). |
| **`/playground/identity-architect`** | `Playgrounds/IdentityArchitect.tsx` | AI-assisted design wizard generating bespoke visual topologies, threat models, and policy codes. |
| **`/playground/jwt-cracker`** | `Playgrounds/JwtCracker.tsx` | Client-side dictionary attack simulator hashing local payloads against common secrets to discover HS256 keys. |
| **`/playground/cert-chain`** | `Playgrounds/CertChainValidator.tsx` | Visual hierarchical map of Certificate Authorities with CRL/OCSP revocation checks and mTLS handshakes. A Classical/Hybrid PQC toggle (`src/lib/tools/certChainPqc.ts`'s `getPqcSignatureDisplay`/`computeChainSizeBytes`, reusing the reference byte sizes from `lib/tools/pqcReadiness.ts`) annotates each hop's signature size and shows a "Harvest Now, Decrypt Later" timeline strip that only renders in classical mode. |
| **`/playground/gpo-simulator`** | `Playgrounds/GpoSimulator.tsx` | Interactive AD GPO editor modeling password lengths, lockout thresholds, and ticket lifetimes. |
| **`/playground/ai-threat-lab`** | `AIThreatLab.tsx` | Simulates voice deepfake attacks against legacy MFA and verifies FIDO2 hardware bounds. |
| **`/playground/liveness-injection`** | `Playgrounds/LivenessInjectionLab.tsx` | Complements `AIThreatLab.tsx` (voice deepfakes) with camera-based liveness -- a fully data-driven attack×defense matrix (`src/data/livenessAttackMatrix.ts`) so the UI has zero hardcoded if/else outcome logic; the same flash-challenge defense that blocks presentation replay is explicitly bypassed by camera-feed injection. |
| **`/playground/ot-ics-identity`** | `Playgrounds/OtIcsIdentityLab.tsx` | The first IT-independent identity lab -- most field devices (`src/data/otIcsScenarios.ts`) structurally cannot authenticate. `src/lib/tools/otIcsSegmentation.ts`'s `computeReachableNodes` runs a real BFS lateral-movement simulation: in segmented mode a zone-crossing edge only survives if BOTH endpoints can authenticate, trapping a compromised HMI inside its own zone. |
| **`/playground/legacy-federation`** | `Playgrounds/LegacyFederationLab.tsx` | Three tabs, one playground: RADIUS (`evaluateRadiusAccess` in `src/lib/tools/legacyFederation.ts`, combined AAA), TACACS+ (`checkTacacsCommand`, separately-logged authentication/authorization/accounting phases), and a Shibboleth/eduGAIN WAYF picker (`buildWayfAssertion`, backed by `src/data/legacyFederationData.ts`'s mock federation metadata). |
| **`/playground/spatial-identity-lab`** | `Playgrounds/SpatialIdentityLab.tsx` | A10 (was a deprioritized stretch goal, no detailed spec — designed against the `livenessAttackMatrix.ts` risk×defense pattern). `src/data/spatialIdentityMatrix.ts`'s 4×4 matrix contrasts wallet-based cryptographic age attestation (proves a credential claim, not physical presence — stops nothing on its own) against continuous behavioral/gesture telemetry (stops 3 of 4 risks, but is defeated by a motion-capture replay bot the same way flash-challenge liveness is defeated by camera-feed injection); only pairing attestation with a live challenge-response prompt catches every risk. |
| **`/playground/zkp-wallet`** | `ZKPWallet.tsx` | Generates mathematical zero-knowledge age proofs without exposing raw birthdates. |
| **`/playground/ambient-trust`** | `AmbientTrust.tsx` | Tracks continuous, ambient biometric telemetry and decays session trust scores. |
| **`/playground/workload-mesh`** | `WorkloadMesh.tsx` | Demonstrates SPIFFE/SPIRE attestations and X.509 SVID credentials. |
| **`/playground/identity-fabric`** | `Playgrounds/IdentityFabricBuilder.tsx` | Click-to-connect wiring of a fixed App/Orchestration/IdP 3-node canvas across 3 scenarios (`src/data/identityFabricScenarios.ts`); pure wiring/translation logic lives in `src/lib/identityFabric/wiring.ts` (`attemptWiring`) — a direct App↔IdP wire always fails since nothing translates between the mismatched protocols. |
| **`/explore/matchmaker`** | `AuthMatchmaker.tsx` | Startup Auth Matchmaker wizard with copyable boilerplates. |
| **`/assess`** | `Assess.tsx` | GRC Maturity Wizard. Self-assessments with dynamic charts, downloadable SVG roadmaps, and a `?a=<digits>` shareable, URL-hydrated read-only report link (scoring logic lives in `src/lib/assess/scoring.ts`). The results view also maps the score to a 5-level industry maturity model and an estimated peer percentile (`src/lib/assess/maturityBenchmark.ts`), and carries the `JourneyBreadcrumb` (`src/data/executiveJourneySteps.ts` is the single source of truth for the step sequence — a future step, e.g. the E5 Command Center, is added there once its route is real). |
| **`/explore`** | `Explore.tsx` | IAM Landscape Directory. 21 products spanning Open Source IdPs, Enterprise/Workforce SaaS, CIAM, Directory Services, PAM & Access, and Secrets Engines — each tagged Beginner/Intermediate/Advanced, backed by `src/data/exploreData.ts`. Supports type + difficulty filters, `?product=<id>` deep links, and copyable integration code blocks. An optional `contributionGuide` field (currently on Keycloak, Ory, Zitadel) renders a "Contribute" callout in the blueprint modal with a direct link to that repo's `good-first-issue` search — add it to a new Open Source entry the same way. |
| **`/assistant`** | `Assistant.tsx` | AI Knowledge Assistant 2.0. Four tabs backed by `src/data/aiKnowledgeGraph.ts` (§4Z): a context-aware Knowledge Chat spanning 45+ IAM topics (shared `KnowledgeChatPanel`/`useKnowledgeChat.ts`, also mounted site-wide as a floating "Ask AI" launcher — see §4Z), a Comparison Engine (20 protocol/product pairings), a Learning Planner (8 beginner-to-expert career roadmaps), and an Interview Prep tab (16 domain-filterable mock questions). Every comparison/track/question is deep-linkable (`?tab=compare&compare=<id>`, `?tab=learn&level=<lvl>&goal=<goal>`, `?tab=interview&q=<id>`) and individually searchable. |
| **`/encyclopedia`**| `Encyclopedia.tsx` | Master A-Z Glossary. 182 categorized standard terms with analogies and specs. Each term supports bookmarking (`BookmarkButton`), carries a `ContentFeedback` accuracy widget, and a `ReadAloudButton` (Web Speech API `SpeechSynthesis`) to have the term/analogy/expert text read aloud. |
| **`/wall-of-shame`**| `WallOfShame.tsx` | Identity Museum. 5 Eras of history plus a difficulty-filterable Breach Archive of 27 beginner-to-advanced incidents (SolarWinds Golden SAML, push-bombing fatigue, Storm-0558 signing-key forgery, Kerberoasting/DCSync, and more) backed by `src/data/breachesData.ts` (§4B). Each breach carries `ContentFeedback` and `BookmarkButton` widgets, and is deep-linkable via `?tab=breaches&lab=<id>`. A "🧠 Quiz Mode" tab (`?tab=quiz`) turns every breach into an SM-2 spaced-repetition flashcard (`src/lib/learning/spacedRepetition.ts`, `src/store/spacedRepetitionStore.ts`). |
| **`/cheat-sheets`** | `CheatSheets.tsx` | Developer Playbooks. 24 beginner-to-advanced interactive compliance/hardening checklists — Application Security (SPA, M2M, password/session, JWT, OAuth 2.0/OIDC, SAML, REST API, CIAM social login), Identity Infrastructure & Governance (secrets management, LDAP/AD hardening, IGA access reviews, Zero Trust, Kubernetes RBAC, Kerberos tiering, identity incident response), and Compliance & Regulatory (SOC 2, ISO 27001, HIPAA, PCI-DSS, NIST 800-63-3, GDPR, CCPA/CPRA, FedRAMP High, DORA) — backed by `src/data/cheatSheetsData.ts` (§4Y). Each sheet carries a live progress gauge, `ContentFeedback` and `BookmarkButton` widgets, a difficulty filter, and is deep-linkable via `?sheet=<id>`. |
| **`/contributors`**| `Contributors.tsx` | Team & Contact page. Integrates developer bio cards, interactive forms, and a static "Security & Transparency" section summarizing shipped CI/CSP hardening with a link to the GitHub Security tab. |
| **`/terms`** | `Terms.tsx` | Terms, License & Disclaimer. MIT license summary, an educational/simulated-environment disclaimer for the attack-technique labs, and a no-warranty clause. Linked from Contributors and from the first-visit `DisclaimerModal`; intentionally excluded from the Sidebar nav. |
| **`/timeline`** | `IdentityTimeline.tsx` | Interactive historical identity timeline from mainframes to post-2030 ambient trust with inline simulators. A `?tab=hall-of-fame` companion tab profiles the standards' authors (`src/data/iamHallOfFame.ts`), each cross-linked to its `/standards?standard=<id>` entry. |
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
| **`/playground/magic-link-stepup`** | `Playgrounds/MagicLinkStepUp.tsx` | Passwordless email magic-link login followed by a forced step-up to WebAuthn/OTP before a high-risk action. |
| **`/playground/credential-stuffing`** | `Playgrounds/CredentialStuffingLab.tsx` | Replays leaked credentials against a mock login and toggles rate-limiting, CAPTCHA, breached-password detection, and lockout defenses. |
| **`/playground/ciam-consent`** | `Playgrounds/CiamConsentSandbox.tsx` | Social login consent screen, OAuth scope grants, and progressive profile-field collection across sessions. |
| **`/playground/access-certification`** | `Playgrounds/AccessCertificationLab.tsx` | Reviewer walks user-to-entitlement rows, approves or revokes access, and flags Separation-of-Duties (SoD) conflicts. |
| **`/playground/risk-engine`** | `Playgrounds/RiskEngine.tsx` | Composite risk score from impossible travel, device reputation, and behavior anomaly signals drives allow/step-up/block decisions. |
| **`/playground/pam-vaulting`** | `Playgrounds/PamVaultingLab.tsx` | Check out a vaulted credential, request time-boxed JIT elevation and approval, toggle session recording, and auto-rotate on check-in. |
| **`/playground/hybrid-ad-sync`** | `Playgrounds/HybridAdSyncLab.tsx` | Toggle between Password Hash Sync, Pass-Through Authentication, and Federation (AD FS) to see how each handles an on-prem login. |
| **`/playground/hr-attribute-mapper`** | `Playgrounds/HrAttributeMapper.tsx` | Click-to-select-then-click-to-connect mapping of mock HR fields (`src/data/hrAttributeMappingFixtures.ts`, Workday/SAP scenarios) to identity-store attributes, with concat/regex/lookup transforms (`src/lib/tools/attributeTransform.ts`) and live conflict detection for duplicate-target and missing-required mappings. |
| **`/playground/role-mining`** | `Playgrounds/RoleMiningWorkbench.tsx` | Runs a pure Jaccard-similarity union-find clustering (`src/lib/analytics/jaccardClustering.ts`) over a seeded, deterministic 30-user x 15-entitlement matrix (`src/data/roleMiningDataset.ts`) to propose candidate roles. Accept/reject decisions drive a live "orphan entitlements" counter (permissions not covered by any accepted role) and a "role explosion risk" counter (single-entitlement roles). |
| **`/playground/access-request-cart`** | `Playgrounds/AccessRequestCart.tsx` | Shop a mock entitlement catalog (`src/data/accessRequestCatalog.ts`) and submit a request through a deterministic approval chain (`src/lib/games/accessRequestApproval.ts`) — manager approval always runs first, a privileged item adds app-owner sign-off, and an SoD conflict against the cart or existing access adds a pending compliance-officer override, blocking auto-approval. |
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
- **Async Web Crypto derivation** (can't become a `useMemo`) → wrap the call itself in `setTimeout(() => fn(), 0)` at the effect's call site. Wrapping inside the async function (e.g. a leading `await Promise.resolve()`) does not satisfy the rule — verified empirically. The `setTimeout` wrapper does *not* on its own silence `exhaustive-deps` for the wrapped function name (e.g. `recomputeJWT`, `generateKeysAndCsr`) — since that function is an unmemoized closure recreated every render and already reads the effect's own listed deps via closure, add a scoped `eslint-disable-next-line react-hooks/exhaustive-deps` immediately above the dependency array, with a one-line comment naming the function and confirming everything it reads is already listed. See `JWTStudio.tsx`, `CsrGenerator.tsx`, `SCIMLab.tsx`, `ReferenceBuilder.tsx` for the pattern.
- **`Math.random()`/`Date.now()` inside a function only ever invoked from a click/submit handler** → a scoped `eslint-disable-next-line react-hooks/purity` with a one-line comment naming the handler is acceptable; the linter can't prove render-time vs. event-time reachability on its own.
- **Static reference data with no dependency on props/state** (e.g. a curated list of templates/options) defined inside the component body → hoist it to module scope instead of wrapping it in `useMemo`/adding it as a dependency. It gets recreated every render for no reason otherwise, and every `useMemo`/`useEffect` that reads it must awkwardly list it as a dependency.
- **A plain helper function whose only inputs are values already in a `useMemo`'s dependency array** → inline its body directly into the `useMemo` callback instead of calling it as a separate function. Removes the missing-dependency warning entirely (no function reference to omit) instead of suppressing it.

### 🧬 E. TypeScript DOM-Lib Typing Gotchas (`npx tsc -b`)

`npm run test` type-checks nothing (Vitest transpiles with esbuild, no type errors surface there) — a bad type only fails `npx tsc -b` / `npm run build`. Run a full `npm run build` before committing, not just `npm run test`, or a type error like the ones below ships straight to `main`.

- **`crypto.subtle.exportKey('jwk', ...)` → `JsonWebKey`** — this TypeScript version's bundled `lib.dom.d.ts` omits `kid` from the `JsonWebKey` interface even though it's a standard JWK member (RFC 7517 §4.5). Don't spread a `kid` field onto a bare `JsonWebKey`-typed object; define a local `type JsonWebKeyWithKid = JsonWebKey & { kid?: string }` and use that as the return/variable type instead (see `exportPublicKeyJwk` in `src/lib/tools/jwt.ts`).
- **`Array.prototype.map` return type narrowing** — building a fixed-choice array (e.g. `['🟩', '🟥']` from a ternary) infers a union-literal element type, so a later `.push()` of any value outside that union fails. Give the array an explicit widened type (e.g. `const blocks: string[] = arr.map(...)`) when more values get pushed afterward — see `buildResultEmojiGrid` in `src/lib/games/dailyPuzzle.ts`.

### 🗺️ F. Committed Build Artifacts Go Stale Without a Full Build (`public/sitemap.xml`, `llms.txt`, `rss.xml`)

`public/sitemap.xml`, `public/llms.txt`, and `public/rss.xml` (§4H) are regenerated by `npm run build` from `ROUTE_META`/`TOOLS`, then committed as the "dev copy & fallback source." `npm run test` never runs the build, so committing a new page/tool without also running a full `npm run build` leaves these three files silently stale — this has happened more than once, each time only caught by manually diffing after the fact.

`tests/integration/generatedArtifactsFresh.test.ts` now catches this automatically: it counts `<url>` entries in the committed `sitemap.xml` against `ROUTE_META.length`, checks every `ROUTE_META` route has a matching link in `llms.txt`, and checks every `status: 'live'` tool has a matching link in `rss.xml` — all read straight off disk, no need to actually re-run the generator scripts. If it fails, the fix is always the same: run `npm run build` and commit the regenerated `public/*` files (the `lastBuildDate`/`lastmod` timestamp diff is expected and fine to commit).

### 🔒 G. The `npm run audit:check` Security Gate (`scripts/audit-check.mjs`)

CI (`ci.yml`) and `deploy.yml` run `npm run audit:check` instead of a bare `npm audit --audit-level=moderate`, because plain `npm audit` has no way to say "this specific advisory doesn't apply to how we use this package" — it just hard-fails on anything at or above the threshold, forever, until upstream ships a fix. That's what happened with `GHSA-qwww-vcr4-c8h2` (a `react-router` RSC-mode CSRF advisory this app can't hit — it's a client-side SPA using plain `BrowserRouter`/`Routes`/`Route`, never the unstable RSC APIs the advisory names): no non-breaking fix exists yet, and the raw gate blocked every single PR, including every open Dependabot PR, regardless of what each one actually bumped.

`scripts/audit-check.mjs` runs `npm audit --json` itself and checks each reported vulnerability (severity ≥ `moderate`, matching the old flag) against a small, explicit `ALLOWLIST` array — each entry needs a real `reason` and a `reviewBy` date, and the script refuses to run (exit 1) once that date has passed, forcing a re-check instead of letting a stale exception silently live forever. A vulnerability is only treated as covered if every advisory it (or, transitively, an upstream package it depends on) cites is on the allow-list; anything else still fails the build exactly like plain `npm audit` would.

To add a new entry: confirm the advisory genuinely doesn't apply to this app's actual usage (not just "it's inconvenient right now"), then add `{ ghsaId, package, reason, reviewBy }` to `ALLOWLIST`. Prefer fixing the real vulnerability (`npm audit fix`, or `npm audit fix --force` after checking the breaking change is safe) over allow-listing whenever a fix is actually available — the allow-list is for the specific case for a fix doesn't exist yet.

### 📱 H. Mobile Bottom Tab Bar (`src/components/Layout/MobileBottomNav.tsx`)

Mounted once in `App.tsx` alongside `Sidebar`/`Header` (`hidden` above the `lg` breakpoint via `lg:hidden`), so a new page needs zero per-page wiring for this to apply to it — active-tab highlighting is driven purely by `useLocation()` matching against 4 fixed destinations (Home, Learn, Playgrounds, Tools); a page outside those 4 just shows no active tab, which is expected. The 5th slot is Search (opens the shared `useCommandPaletteStore`, same modal as the header's Search button and `⌘K`) rather than a "More" menu — the existing hamburger-triggered `Sidebar isMobile` drawer already covers full navigation, so a second menu system would be redundant. `App.tsx`'s `<main>` carries `pb-20 lg:pb-12` specifically so page content doesn't render underneath the fixed bar on mobile; if a page adds its own fixed/sticky bottom UI, check it against this bar's height (`env(safe-area-inset-bottom)`-aware) rather than assuming the viewport bottom is unobstructed.

The Search button's shared state lives in `src/store/commandPaletteStore.ts` (a small non-persisted Zustand store) rather than `Header.tsx`'s old local `useState` — `Header.tsx` was refactored to read/write the same store so the command palette has exactly one source of truth regardless of which UI surface opens it.

---

## 4. Developer Maintenance & Extension Playbook

AboutIAM is designed to be highly modular. Follow these simple guides to easily extend the platform's information base:

### 📖 A. How to Add a New Term to the Glossary
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

If adding a new category value, also add it to the exported `BREACH_CATEGORIES` array in the same file so the difficulty/category coverage stays in sync. No route-wiring needed (§4D) — the `?tab=breaches&lab=<id>` deep link reuses the existing `/wall-of-shame` route via the same mount-effect pattern described in §4I. Every breach automatically carries a `ContentFeedback` and `BookmarkButton` widget (id `breach-<id>`, §4K/§4L). Every breach also automatically becomes a Quiz Mode flashcard (`?tab=quiz`) — the front/back come straight from the same `title`/`attackVector`/`rootCause`/`remediation` fields, so no extra authoring is needed there either. Run `npm run test` afterward: `searchService.test.ts` loops over every entry in `BREACHES` and fails if any one of them isn't indexed, and separately asserts all three difficulty tiers and every `BREACH_CATEGORIES` value are represented.

### 🎓 C. How to Add a New Course Track to the Academy
To add a new learning track or module to the **IAM Academy**, open `src/pages/Learn.tsx` and append a new `Track` object to the `tracks` array. Enforce six sub-modules per track to maintain the global graduation progress bar ratios.

### 🧭 D. How to Add a New Page/Route
Adding a page touches **three** files, because routes are statically pre-rendered for SEO (see §1) rather than resolved purely client-side:
1. **`src/App.tsx`** — add the `<Route path="..." element={<YourPage />} />`.
2. **`src/routeMeta.ts`** — add a `{ path, title, description }` entry. This drives the browser tab title, `<meta name="description">`, and canonical link that `Header.tsx` syncs on navigation. It also automatically makes the page searchable in the command palette (see §4I) — no separate search-registration step needed for a generic page.
3. **`scripts/postbuild-ssg.mjs`** — add the *same* `{ path, title, description }` entry to its `ROUTES` array. This script runs in plain Node after `vite build` and intentionally keeps its own copy instead of importing the `.ts` file (avoids depending on a specific Node TypeScript-execution feature in CI) — it's what writes the real `dist/<route>/index.html` GitHub Pages serves. Skipping this step means the route works for in-app navigation but 404s for anyone (or any crawler) linking to it directly.

Optionally add a `Sidebar.tsx` nav entry and a `public/sitemap.xml` `<url>` entry if the page should be discoverable from the main nav / search engines. If adding to `architectureItems` or `ecosystemItems` (the two groups large enough to have been split into sub-groups — see the two-tier grouping note just below), give the new `NavItem` a `subGroup` matching one of that group's existing sub-group names where a natural fit exists — an entry left without one still renders (grouped under an implicit "Other" bucket), so this is never a blocker, just a nicety.

**Sidebar two-tier grouping + "Jump To" filter (D8):** `Sidebar.tsx`'s `NavItem` has an optional `subGroup?: string` field. A group's `AccordionGroup` only renders sub-group sub-headers when more than one distinct `subGroup` value (including the implicit `Other` for items with none) is present among its items — a small group like "Cryptographic Tools" stays a flat list with no sub-header clutter even though the field exists. Each sub-group's open/closed state persists to `localStorage` (`aboutiam-sidebar-subgroups-open`) independently per group, so a user's preferred layout survives navigation. The "Jump To" filter input above the nav list does a case-insensitive substring match against every item's `name` across every group and sub-group simultaneously (not just the currently-open one) — while a filter is active, every group and sub-group force-expands so a match is never hidden behind a collapsed accordion, and a group with zero matches doesn't render its header at all.

### 🛠️ E. How to Add a New Security Tool (`/tools/<slug>`)

The **Security Tools** section (`/tools`) is a registry-driven extension point on top of the routing convention in §4D — all 39 tools currently in `toolsRegistry.ts` are live and shipped. To add a new tool in the future, follow these steps:

1. **`src/data/toolsRegistry.ts`** — append a `ToolMeta` entry (`slug`, `title`, `description`, `category`, `icon`, `phase`, `keywords`, `analogy`, `expert`, `faqs`, optional `relatedLinks`, optional `taskTags`) with `status: 'planned'` while you build, then flip to `'live'` when it ships. `ToolsCatalog.tsx` and the sidebar-adjacent catalog card both render from this array automatically — nothing else to touch there. `taskTags` (values from `src/data/taskTags.ts`) is optional and additive — a new tool without one simply doesn't appear under any "I want to…" filter until tagged; there's no obligation to backfill every existing entry before shipping. `PlaygroundCatalog.tsx`'s equivalent tags live in a separate lookup, `src/data/playgroundTaskTags.ts` (keyed by the playground's `link`), since its catalog entries aren't a typed registry.
2. **`src/pages/Tools/<PascalCaseName>.tsx`** — build the page using the shared components in `src/components/Tools/` (`ToolPageShell` for the header/privacy-notice/JSON-LD wrapper, `BeginnerExpertExplainer` for the analogy/expert/FAQ card, `useClipboardCopy` for copy buttons, `FileDropInput` for file-accepting tools) and any pure-logic helpers you need in `src/lib/tools/` (one small, independently Vitest-tested module per concern — see the existing `base64.ts`/`jwt.ts`/`totp.ts`/etc. for the pattern).
3. **Route wiring** — same 3 files as §4D (`App.tsx`, `routeMeta.ts`, `postbuild-ssg.mjs`), plus a `public/sitemap.xml` `<url>` entry and a `public/llms.txt` line, plus flipping the registry `status` to `'live'` from step 1.
4. **No JSON-LD or FAQ schema work needed** — `ToolPageShell` generates both `SoftwareApplication` and `FAQPage` structured data automatically from the registry entry's `description`/`expert`/`faqs` fields. It also renders a `RelatedContentRail` (§4BB's Knowledge Graph edges) keyed on `tool:<slug>` automatically — renders nothing until a graph edge actually references that tool id, so no extra wiring is required to add one later.
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

The Command Palette's empty-query state (`CommandPalette.tsx`) shows Recent Queries (`useSearchHistory.ts`, capped at 5, most-recent-first, de-duplicated) above a hand-curated **Popular** shortlist (`src/data/curatedPopularSearches.ts`) — the honest zero-backend substitute for live trending search. Refresh the Popular list periodically (e.g. quarterly); every entry's link is covered by `curatedPopularSearches.test.ts` against `ROUTE_META`/`ARCHITECTURES`/`ENCYCLOPEDIA_TERMS`.

Ctrl+K isn't the only power-user shortcut: `useChordedShortcuts.ts` (mounted once at `Header.tsx`, same pattern) listens for Gmail/GitHub-style `g`-then-letter chords against the table in `src/data/chordedShortcuts.ts` (a new destination is added there, not hand-coded into the hook), and `?` toggles `ShortcutsOverlay.tsx`, which renders that same table plus the general/slash-command shortcuts — so a new chord is automatically listed without touching the overlay.

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

**Distinct from per-feature Coach Marks** (`src/components/CoachMark.tsx` + `src/lib/useCoachMark.ts` + `src/store/coachMarkStore.ts`): the Guided Tour orients a new visitor to the *site's* five main sections once; a Coach Mark teaches how to use one specific complicated widget the first time a visitor lands on it (currently wired into `AttackPathGraph.tsx` and `RoleMiningWorkbench.tsx`). Each has its own seen-tracking (`hasSeenTour` boolean vs. a per-`featureId` set) and its own Header replay icon — use the Tour for a new top-level section, a Coach Mark for a new complex interactive widget.

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

The same store also holds two accessibility toggles, applied as classes on `<html>` (same `document.documentElement.classList` mechanism `themeStore.ts` uses for `dark`/`light`, generalized into `applyAccessibilityClass()`): `readingMode` (`.reading-mode` — spacing/background CSS-variable overrides in `src/index.css`, no font-file download) and `colorblindSafePalette` (`.colorblind-safe` — swaps `--color-status-success/warning/danger` to an Okabe-Ito blue/amber/vermillion set). Both are re-applied once on mount via `initializeAccessibilityPreferences()`, called from `App.tsx` alongside `initializeTheme()` — a persisted boolean alone doesn't touch the DOM without that call.

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

A second, independent consumer of `BULLETINS` exists at `/tools/tabletop-exercise-generator` (`src/lib/tools/tabletopGenerator.ts`) — it transforms a selected bulletin's `playbookSteps`/`simulator` fields into a printable, facilitator-ready tabletop script. Any new bulletin you add here automatically becomes selectable there too, with zero extra wiring.

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

**Knowledge Chat resource keywords** (`KNOWLEDGE_GRAPH: Record<string, ResourceLink[]>`) — add a lowercase key (use a natural single word where possible; if a multi-word concept truly needs an underscore key like `zero_trust`, `extractResources()` in `src/lib/ai/useKnowledgeChat.ts` matches both the raw key and its space-separated form, so it detects "zero trust" typed naturally) mapped to 1-4 `ResourceLink` entries pointing at real, already-existing tools/playgrounds/encyclopedia terms:
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

**The Knowledge Chat tab is not a special case of `Assistant.tsx`** — its state/handlers live in `src/lib/ai/useKnowledgeChat.ts` and its rendering in `src/components/KnowledgeChatPanel.tsx`, both extracted verbatim out of the page so a second consumer, `src/components/FloatingAssistantLauncher.tsx` (a fixed bottom-right button mounted once in `Header.tsx`, collapsed by default, expanding into a compact popup with a "Full page" link to `/assistant`), can mount the exact same chat without duplicating a second copy of the local-AI toggle, quick prompts, or resource-recommendation logic. `KnowledgeChatPanel`'s `showSidebar` prop controls only the wide "Active Context Resources" desktop column (`Assistant.tsx` passes it, the floating launcher's narrow popup does not) — every other part of the chat (messages, quick prompts, local-AI spike toggle) is identical between the two hosts by construction, not by convention. Adding a new keyword/response/quick-prompt to the Knowledge Chat therefore means editing `useKnowledgeChat.ts` once and it appears in both places.

### 🏛️ Z-spike. C4 Technical Spike — Opt-In Local AI (WebLLM), status: investigation only, not shipped

Phase 2 §C4 flagged this as the highest-risk item in the backlog and asked for a dedicated spike before committing to a ship date. This is that spike, landed 2026-07-30 — **experimental and gated off by default**, not a finished feature.

**What exists today:** the shared `KnowledgeChatPanel` component (mounted both by the Knowledge Chat tab in `Assistant.tsx` and by the site-wide `FloatingAssistantLauncher` — see below) has a collapsed "🧪 Experimental: Enable Local AI (Spike)" `<details>` block above the input, backed by `useKnowledgeChat.ts`. Left untouched, the page is byte-for-byte the same experience as before — zero network calls, zero extra bundle weight. Only clicking "Download & Enable" triggers `import('./webllmConnector')`, which:
- Checks `detectWebGpuSupport()` (`'gpu' in navigator`) and refuses to proceed if WebGPU is unavailable — **the WASM-only fallback path is explicitly not implemented in this spike**, per the doc's own instruction not to silently degrade.
- Spins up `src/lib/ai/webllm.worker.ts`, a thin wrapper around `@mlc-ai/web-llm`'s own `WebWorkerMLCEngineHandler` (the library already implements the worker message-passing protocol — no custom protocol was hand-rolled).
- Loads `SmolLM2-360M-Instruct-q4f16_1-MLC` (`SPIKE_MODEL_ID` in `webllmConnector.ts`), the smallest chat-capable prebuilt model in WebLLM's registry — `vram_required_MB: 376`, materially smaller than the doc's own ~400-700MB Qwen2.5-0.5B estimate.
- Streams generated tokens back into the chat as a distinct purple-badged "Local AI (Experimental)" message, never mixed up with the deterministic canned responses.

**Measured/confirmed in this pass:**
- Default page load: unchanged — confirmed via Playwright (no console errors beyond the pre-existing dev-only Vite HMR/CSP warning, no network requests to any WebLLM CDN) and via `npm run build`: `@mlc-ai/web-llm` and the worker land in their own `webllmConnector-*.js` / `webllm.worker-*.js` chunks, not in `Assistant-*.js`, `vendor-*.js`, or the eager `index-*.js` entry chunk.
- `webllmConnector.ts`'s `load()`/`generate()`/`dispose()` contract is unit-tested against a mocked `Worker` (`webllmConnector.test.ts`) — progress-percent parsing, token streaming order, and load/generate error propagation as rejected promises (not uncaught throws) are all covered without downloading a real model, per the doc's own testing note.
- `detectWebGpuSupport()` degrades to `false` under Node/no-`navigator` (verified in `tests/ssr/ssrSafety.test.ts`), so this module is safe to import from the static build pipeline.
- The test browser (current Chromium via Playwright) reports `'gpu' in navigator === true`, so only the WebGPU path is reachable in this environment — **the WASM-fallback performance question from the doc remains genuinely unmeasured**, not merely untested.
- The actual model download/load-time/tokens-per-second numbers were **intentionally not measured in this pass** (deferred by explicit user choice to avoid a ~200MB download mid-session) — the toggle UI, warning copy, and code path up to (but not including) the real `CreateWebWorkerMLCEngine()` call were verified instead.

**Go/no-go input for a follow-up conversation, not a verdict:** the worker-isolation and bundle-splitting approach works and is low-risk to leave merged as-is (default UX is provably unaffected). What's still open before this could ship as a real feature: an actual measured download/load-time run, a WASM-fallback decision (implement it, or disable the option outright on non-WebGPU browsers with clearer messaging), and cross-browser cache-persistence testing (does the ~200MB model actually get cached via IndexedDB/Cache API on a second visit, or re-download every time).

---

### 🏛️ AA. How to Add a Test

Vitest runs three separate **projects** (configured in `vitest.config.ts`, not `vite.config.ts` — the build config has no reason to know about jsdom or coverage), each scoped to what kind of thing it verifies:

| Project | Environment | Where tests live | What it's for |
| :--- | :--- | :--- | :--- |
| `unit` | `node` | Colocated `*.test.ts` next to the file it tests, under `src/lib/`, `src/data/`, `src/store/`, `scripts/` | Pure logic — mathematical calculations, state mutations, helper utilities (§3C's existing mandate) |
| `component` | `jsdom` | Colocated `*.test.tsx` next to the component, under `src/components/`; plus `tests/pages/` | Anything that renders React — shared components and the cross-cutting page-smoke suite |
| `integration` | `node` | `tests/integration/`, `tests/ssr/` | Cross-file consistency checks that don't belong to any single source file |

`npm run test` runs all three; `npm run test:unit` / `test:components` / `test:integration` target just one; `npm run test:coverage` adds a coverage report (`coverage/`, gitignored, uploaded as a CI artifact).

**Where to put a new test:**

- Testing a function in `src/lib/`, `src/data/`, or `src/store/`? Colocate `yourFile.test.ts` next to it — same convention as all 51 existing unit tests. No config changes needed.
- Testing a component in `src/components/`? Colocate `YourComponent.test.tsx` next to it, using `renderWithProviders` from `src/test/renderWithProviders.tsx` (wraps `MemoryRouter`) instead of hand-rolling router setup. See `BookmarkButton.test.tsx`, `ContentFeedback.test.tsx`, `DisclaimerModal.test.tsx`, `GuidedTour.test.tsx`, and `PersonalizationSelector.test.tsx` for the pattern — render + content assertions, click/toggle interactions against the real Zustand store (not mocked), and first-visit/sequencing behavior for anything following the §4M/§4N pattern.
- Testing a brand-new **page**? You almost never need to write one — `tests/pages/allPagesRender.test.tsx` globs every file under `src/pages/**/*.tsx` and asserts each one mounts without throwing, so a new page gets crash-coverage the moment its file exists, the same "append and get it for free" pattern as search (§4I) and SSG. Only add a dedicated page test file if the page has real interactive logic worth asserting on beyond "it renders" (a wizard's step transitions, a filter's result count, a deep-link query param actually selecting the right item).
- Adding a new registry/data array (breaches, standards, certifications, etc.)? Don't write a new test file — extend the existing per-registry checks in `searchService.test.ts` (search-index coverage) and the array's own `*.test.ts` (id uniqueness, category/difficulty coverage), following the pattern already used for every registry listed in §4B/§4Q–Z.
- Adding a new SSR-guarded module (§3B)? Add a case to `tests/ssr/ssrSafety.test.ts` — it runs under the `integration` project's real `node` environment (genuinely no `window`/`document`, not stubbed) and asserts the module's exported actions don't throw.
- Adding a new page/route (§4D)? `routeRegistrySync.test.ts` already fails if `App.tsx`, `routeMeta.ts`, and `scripts/postbuild-ssg.mjs` fall out of sync — no test change needed there either.
- Testing real interactive logic on a **page** (not just "it renders")? Do **not** colocate the test file inside `src/pages/` — `tests/pages/allPagesRender.test.tsx` globs `../../src/pages/**/*.tsx` and would try to mount your `*.test.tsx` file itself as if it were a page component, crashing the suite with "Calling the suite function inside test function is not allowed." Put it in `tests/pages/yourPage.test.tsx` instead (see `tests/pages/knowledgeGraph.test.tsx`), importing the page via a relative `../../src/pages/...` path — it still runs under the `component` project (jsdom) because `tests/pages/**/*.test.tsx` is in that project's `include` glob.
- Writing a `src/lib/` module that genuinely needs browser APIs (`window`, `document`, `fetch`, `localStorage`) rather than pure/SSR-safe logic — e.g. `googleDrive.ts`, `studyPackExport.ts`? The `unit` project runs `src/**/*.test.ts` under `node`, which doesn't have those globals. Add a `// @vitest-environment jsdom` docblock comment as the *first* line of that specific test file to override just that file's environment, instead of moving the whole `unit` project to jsdom or relocating the file out of its natural colocation next to the module it tests. Keep the pure, truly-SSR-safe logic (e.g. Markdown string building in `studyPack.ts`) in a separate file from the browser-dependent glue (`studyPackExport.ts`) where practical, so most of a feature's logic stays testable under real `node` semantics.

**Test environment gotchas** (see `src/test/setup.ts`): jsdom has no `window.matchMedia` and no `crypto.subtle` — both are polyfilled globally for the `component`/`integration` projects, so a tool page that hashes/signs on mount won't crash in tests for a reason unrelated to its own code. `localStorage` is cleared after every test to stop one persisted Zustand store's state (theme, bookmarks, preferences, tour, disclaimer, layout, airplane mode, what's-new, Drive sync) from leaking into the next test file — if a test explicitly needs a particular store state, set it with `useYourStore.setState({...})` at the top of the test rather than relying on ordering.

**Accessibility assertions (B11, opt-in — not globally enforced):** `jest-axe`'s `toHaveNoViolations()` matcher is registered globally in `src/test/setup.ts` for the `component` project, so any test CAN call `expect(await axe(container)).toHaveNoViolations()` without every existing component test needing to pass it immediately (a mass simultaneous failure across 100+ pre-existing tests wasn't worth forcing in one PR). New interactive components — anything with real click/drag/keyboard interaction, not a static content page — **should** include this assertion; see `tests/pages/phase2Accessibility.test.tsx` for the pattern (one `it.each`-style loop over several playgrounds). This exact check is what caught `PlaygroundShell.tsx`'s shared `<h1>`→`<h3>` heading-order skip (fixed to `<h2>`) affecting every playground built on the shell — a single shared-component fix that resolved the same violation across dozens of pages at once, which is the whole point of auditing the shell before individual pages.

---

### 🏛️ BB. How to Add a New Concept to the Knowledge Graph (`/knowledge-graph`)

`src/data/knowledgeGraphData.ts` powers `/knowledge-graph` differently from every other registry in this doc (§4B/§4Q-Z): instead of one array of content objects, it's a single hand-curated edge list, `KNOWLEDGE_GRAPH_EDGES: [string, string][]`, where each id is `${'standard' | 'term' | 'architecture'}:${id from that dataset}` (e.g. `'standard:oauth21'`, `'term:jwt'`, `'architecture:zero_trust'`). Nodes are **derived automatically** from whichever ids appear in at least one edge — `resolveNode()` looks each one up directly in `STANDARDS`/`ENCYCLOPEDIA_TERMS`/`ARCHITECTURES` (§4Q/§4A/§4T) for its label, description, and deep-link path, so there is no second node list to hand-maintain and no way for a node's display data to drift from its source of truth.

To add a new relationship, append one tuple:

```typescript
['standard:dpop', 'term:token_binding']
```

There's no route-wiring step (§4D already done for this page) and no `searchService.ts` step — the graph composes three already-independently-searchable datasets rather than introducing new searchable content of its own. Run `npm run test` afterward: `knowledgeGraphData.test.ts` fails if either id in a new edge doesn't resolve to a real record in its source dataset (catches a typo'd id immediately, the equivalent of the search-sync check other registries get), and separately guards against duplicate/self-loop edges.

---

### 🏛️ CC. The "What's New" Changelog Modal

`src/components/WhatsNewModal.tsx` + `src/store/whatsNewStore.ts` follow the same Zustand-persist "auto-open once, replay from a Header icon" shape as the Guided Tour/Disclaimer pair (§4M/§4N) — `lastSeenVersion`/`isOpen`/`openWhatsNew`/`closeWhatsNew`, mounted in `Header.tsx` next to `GuidedTour`/`DisclaimerModal`. The trigger condition is deliberately different, though: it only auto-opens for a *returning* visitor (`hasSeenDisclaimer === true`) whose `lastSeenVersion` doesn't match the latest release — a first-time visitor already getting the Disclaimer→Tour sequence never also gets this stacked on top; they'll simply see the current release the next time they return.

To ship a new release entry, prepend one object to `WHATS_NEW_RELEASES` in `src/data/whatsNewData.ts`:

```typescript
{
  version: '2026.08.15', // bump this — it becomes WHATS_NEW_VERSION (derived from the array's first entry)
  date: '2026-08-15',
  items: [
    { title: 'Feature Title', description: 'One or two sentences.', path: '/optional-deep-link' }, // path is optional
  ],
}
```

Bumping `version` alone is what causes every returning visitor who's seen an older version to see the modal once more — no other state to reset.

---

### 🏛️ DD. How to Add an Optional, Env-Gated Feature (Google Drive Backup & Restore)

`src/lib/googleDrive.ts` + `src/components/GoogleDriveSync.tsx` establish the first (so far only) pattern in this codebase for a feature gated behind a `VITE_...` environment variable — every other feature works with zero configuration, and this one must too when unconfigured:

1. A `getXClientId()`-style function reads `import.meta.env.VITE_...` and returns `null` when unset or empty — never throw, never assume a value is present.
2. The component checks that `null` first and renders a clearly-labeled, non-broken disabled state (see `GoogleDriveSync.tsx`'s "Cloud backup isn't configured for this deployment yet" panel) instead of dead buttons or a runtime error — every fork/clone of this repo must boot cleanly with the feature simply hidden/inert.
3. Document the variable in `.env.example` (committed, with the value left blank and setup instructions in a comment) — never commit a real value. `.env`, `.env.local`, and `.env.*.local` are gitignored.
4. Keep all calls to the third-party API direct from the browser (no server proxy) and never persist secrets/tokens beyond the current action's lifetime (`requestAccessToken()`'s token lives only in React state, never `localStorage`) — this is what keeps an env-gated integration compatible with the Zero-Backend/Complete-Privacy principle (§1) instead of quietly reintroducing a backend dependency.

---

### 🏛️ EE. Lazy-Loading a Heavy Dependency to Avoid Bloating a Page Chunk

If a feature needs a library only inside one click handler — not for the page's initial render — dynamically `import()` it inside that handler instead of a static top-level import. `src/lib/studyPackExport.ts`'s `buildStudyPackZipBlob()` does this for `jszip`:

```typescript
export async function buildStudyPackZipBlob(): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  // ...
}
```

A static `import JSZip from 'jszip'` at the top of that file added ~100KB to `Home.tsx`'s chunk (visible directly in `npm run build`'s per-chunk size output) for a feature most visitors never click; the dynamic import instead makes Vite split it into its own chunk, fetched only on demand. When adding any new heavy client-side library, compare `npm run build`'s chunk-size output before and after wiring it up — that diff is the actual signal for whether this pattern is worth applying, not a guess.

---

### 🏛️ FF. How to Add Packet-Capture Overlay to a Playground

`src/lib/sdk/usePacketCapture.ts` + `src/lib/sdk/components/PacketCaptureOverlay.tsx` are a shared instrumentation layer — a "DevTools inside DevTools" Wireshark-style timeline over a playground's own mock request/response traffic — layered onto `PlaygroundShell` (§4F) as a one-line opt-in, not a new playground of its own.

**1. Call the hook and pass its output to `PlaygroundShell`:**
```typescript
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'

const { frames: packetFrames, capture, clearFrames } = usePacketCapture()

return (
  <PlaygroundShell
    // ...existing props
    packetCapture={{ frames: packetFrames, onClear: clearFrames }}
  >
```
This alone makes a new "Toggle Packet Capture" icon button appear in the shell's status bar (next to Reset) and renders `PacketCaptureOverlay` as a collapsible drawer, off by default — no drawer/button code to write yourself.

**2. Call `capture(...)` alongside your existing `log(...)` calls at any point that represents a "wire" event** (a mock request being sent, a response received, or a protocol error):
```typescript
log('info', `[Front-channel] Redirecting to: ${authorizationUrl}`)
capture({ direction: 'request', protocol: 'OAuth 2.1', summary: 'Authorization Request', raw: authorizationUrl })
```
`direction` is `'request' | 'response' | 'error'` — this is what drives the timeline block's color. No new state machine or trace-log logic is needed; `capture()` is purely additive next to a `log()` call you already have.

**3. Clear captured frames on reset**, same as you already clear other local state in `onReset`:
```typescript
onReset={() => {
  // ...existing reset logic
  clearFrames()
}}
```

`usePacketCapture()` caps its buffer at 50 frames (oldest dropped first) so a long session can't grow it unbounded — nothing for a playground author to manage. Currently wired into `AgentIdentityLab.tsx`, `BuildYourIdp.tsx`, and `Fapi2Lab.tsx`. Note: `OAuthVisualizer.tsx`, `SAMLWorkbench.tsx`, and `SCIMLab.tsx` predate the `PlaygroundShell`/`usePlayground` SDK convention entirely (custom bespoke UIs, no shell) — adopting packet capture there would first require migrating those three onto the shell, which is a separate, larger refactor deliberately left out of scope here to avoid destabilizing already-shipped, complex flows. Any *future* playground built on `PlaygroundShell` gets this feature for free with the one-line opt-in above.

---

### 🏛️ GG. How to Render a New Attack-Path Scenario (Custom Force-Directed Graph)

`src/lib/graph/forcePath.ts` is a small, dependency-free graph primitive — no `d3-force`, no charting library — built for `/playground/attack-path-graph` (`Playgrounds/AttackPathGraph.tsx`) but reusable by any future feature that needs a force-directed node/edge diagram.

**Two pure functions, both plain TypeScript with no React/DOM coupling:**
- `findShortestPath(nodeIds, edges, startId, targetId)` — directed, unweighted BFS. Returns the ordered node-id path, or `null` if unreachable. Used both to validate scenario data in tests (`attackPathScenarios.test.ts` asserts the authored `shortestPath` matches what BFS actually computes) and at render time to highlight the true solution when "Reveal Shortest Path" is clicked.
- `computeForceLayout(nodeIds, edges, width, height, iterations?)` — a spring/repulsion physics loop (Coulomb-style node repulsion + Hooke's-law edge springs, damped velocity integration) that returns a `Record<nodeId, {x, y}>`. Deterministic by construction: initial positions are placed on a circle indexed by array position (no `Math.random()`), so the exact same scenario always renders in the exact same layout — required by this codebase's no-`Math.random()`-in-render convention (§3B) and makes the layout itself snapshot-testable (see `forcePath.test.ts`'s determinism assertion).

**To add a new scenario**, add an entry to `src/data/attackPathScenarios.ts` (`nodes: GraphNode[]`, `edges: GraphEdge[]`, `startNodeId`, `targetNodeId`, `shortestPath`) — the page picks it up automatically via the scenario-switcher buttons, no component changes needed. Keep `shortestPath` honest: `attackPathScenarios.test.ts` fails the build if it doesn't match a genuine BFS traversal of the scenario's own `edges` array, which is exactly the class of "unsolvable scenario shipped by accident" bug this check exists to catch.

**To reuse the layout engine elsewhere**, call `computeForceLayout` inside a `useMemo` keyed on the graph's node/edge identity (never recompute on every render — `iterations` defaults to 250 and an O(n²) repulsion pass per iteration is not free for large graphs) and render the returned positions as plain SVG `<line>`/`<circle>` elements, exactly as `AttackPathGraph.tsx` does. There is no `d3-selection`/DOM-binding layer to fight — positions are just numbers you place yourself.

---

### 🏛️ HH. How to Add a Command to the Mock IAM Terminal

`src/lib/sdk/components/IamTerminal.tsx` + `src/lib/tools/mockShell.ts` are a reusable SDK primitive — a scripted (not a real shell) terminal for muscle-memory CLI practice. Deliberately **not** built on `xterm.js`: this codebase consistently avoids heavy UI dependencies for interaction surfaces (same reasoning as the dependency-free force-graph in §4GG, or the custom 2D physics instead of Three.js) — a real shell isn't needed, just a scrollback + prompt line, so a small custom component covers it at a fraction of the bundle cost.

**The grammar is strictly curated on purpose** — a fixed command list, a fixed flag set per command — explicitly not a general shell, to keep it safe/lightweight and avoid scope creep. `runShellCommand(rawInput)` in `mockShell.ts` is the single entry point; it tokenizes on whitespace and dispatches to one `run<Command>` handler per supported command (`openssl`, `curl`, `kinit`, `jwt-cli`), plus `help`.

**To add a new command:**
1. Write a handler function `async function runFoo(args: string[]): Promise<ShellCommandResult>` in `mockShell.ts`. Check `args` against your supported flag set explicitly; return `{ output: [...], isError: true }` with a "try: ..." usage hint for anything outside it — never throw.
2. **Reuse an existing Tools-section helper for the mock output wherever one exists** rather than hand-writing fake strings — e.g. `openssl x509` reuses `parseCertificateOrCsr` from `x509.ts`, and `curl -X POST .../token` reuses `signJwtHmac` from `jwt.ts`, so the mock output has the same real shape/fields the actual tool page would produce.
3. Add a `case 'foo': return runFoo(args)` branch to the `switch` in `runShellCommand`, and a line to `HELP_LINES` so `help` stays accurate.
4. Add a `describe('foo', ...)` block to `mockShell.test.ts` covering both a supported invocation and an unsupported one (per the doc's own test requirement: every supported command produces its expected output, and an unsupported command returns a helpful message rather than crashing).

**To embed the terminal in a page**, just render `<IamTerminal welcomeLines={[...]} />` — no props beyond that are required. It manages its own scrollback, command history (↑/↓ arrow recall), and the `clear` command internally. First piloted inside `InterviewCareerCenter.tsx`'s "Config Exercises" tab, alongside (not replacing) the existing regex/config-validation exercises, which serve a different pedagogical purpose.
