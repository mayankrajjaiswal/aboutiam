<p align="center">
  <img src="https://www.aboutiam.com/aboutiam_banner.svg" alt="AboutIAM Widescreen Banner" width="800" />
</p>

<p align="center">
  <strong>The definitive, browser-native knowledge hub & simulation playground for Identity and Access Management (IAM).</strong>
</p>

<p align="center">
  <a href="https://github.com/mayankrajjaiswal/aboutiam/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mayankrajjaiswal/aboutiam?color=blue" alt="License MIT" />
  </a>
  <img src="https://img.shields.io/github/actions/workflow/status/mayankrajjaiswal/aboutiam/deploy.yml?branch=main&label=deployment" alt="Build Status" />
  <img src="https://img.shields.io/badge/react-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/tailwind-v4-teal" alt="Tailwind v4" />
</p>

---

## 🎯 Project Mission & Objective

**AboutIAM** is an interactive, visual, and entirely browser-native academy and simulation playground. 

Many developers and security architects find Identity and Access Management dry, abstract, and highly fragmented across hundreds of scattered RFC standards (OAuth, SAML, WebAuthn, SCIM). **AboutIAM** bridges the gap between theory and execution. By running fully client-side inside the user's browser, it provides **hands-on, visual workbenches** where anyone can deconstruct network redirects, toggle cryptographic exploits, evaluate access control engines, and assess GRC posture natively.

### 🏛️ The Three Core Principles:
1. **Show, Don't Tell (Playgrounds First):** Instead of just reading about PKCE or SAML XML, customize inputs, trigger step-by-step redirects, and inspect raw HTTP packet logs in real-time.
2. **Beginner to Expert Progression (Progressive Detail):** Every module and standard features a friendly, layman analogy (e.g. *SAML is like a visa-stamped physical passport*) alongside its official expert specification.
3. **Zero Backend, Complete Privacy:** 100% of cryptography (Web Crypto HMAC), policy evaluations, and data reviews run strictly in-device, ensuring zero server costs and ultimate user privacy.

---

## 📂 Platform Feature Map

The AboutIAM platform houses a fully integrated identity workspace, organized into three distinct structural columns:

### 🚀 A. Core Platform & Reference Centers
* **First-Visit Disclaimer:** A one-time welcome modal summarizing the 3 Core Principles and the educational-use notice for the attack-technique labs, shown once per browser before the Guided Feature Tour.
* **Guided Feature Tour:** A 5-step onboarding walkthrough (Academy → Playgrounds → Tools → Assess → Global Search) that auto-opens once per browser on first visit, and can be replayed anytime from the Header's tour icon.
* **Bookmarks ("Save for Later"):** A persistent, cross-session bookmark toggle on Security Tools, Playgrounds, and Encyclopedia terms. Saved items surface in a dedicated panel on the Community Hub.
* **Content Feedback (Endorse/Flag):** A lightweight 👍/🚩 widget on Encyclopedia terms and Wall of Shame breach labs that deep-links straight to a pre-filled GitHub issue — no backend, community-sourced accuracy signal.
* **Global Search & Command Palette Console (⌘K / Ctrl+K):** A high-performance, browser-native command console powered by `MiniSearch`. Indexes every page on the site — simulators, tools, glossary terms, vendor profiles, breaches, standards, architectures, and every remaining sidebar/nav page — sourced automatically from the route registry, so newly added pages are searchable without any extra wiring. Features instant in-memory fuzzy searching, term highlighting, persistent search history caching, deep-linking, and interactive console slash commands (`/theme`, `/reset`, `/ctf`, `/labs`, `/tools`) wrapped in a security terminal layout.
* **Programmatic RSS Feed Engine & Notification Channel (`rss.xml`):** A custom, build-time programmatically compiled RSS 2.0 Feed (`/rss.xml`) aggregating all live Security Tools, Vendor CVE vulnerabilities, and IAM news advisories. Fully integrated into the Vite build chain with standard discoverability alternate headers, and accessible via the Header RSS button.
* **Offline Resilience & IdP Survivability Simulator (Airplane Mode):** Interactive network-degradation and outage sandbox in the header controls. Allows users to simulate full internet outages, inject artificial network latency (ms), and specify packet loss (%) to test local authentication backups (such as offline JWT cache checkouts, cached public keys, and local biometric checks). Explicitly asserts air-gapped data privacy assurances on all local tools.
* **Overview Dashboard (`Home.tsx`):** Displays overall progress, track graduations, and historical **Identity Trivia cards** (including MIT's first 1961 password bypass and Kerberos mythology).
* **Beginner's Onboarding Primer (`BeginnerPrimer.tsx`):** Specifically designed for students, interns, and laymen. Explains the 4 chronological pillars (**Identify $\rightarrow$ Authenticate $\rightarrow$ Authorize $\rightarrow$ Audit**) in plain English.
* **IAM Academy (`Learn.tsx`):** 6 guided course tracks and 36 expanding modules. Toggling "Completed" persists progress inside browser `localStorage` and animates progress bars. Shows a "Recommended for your role" banner when a career track is set in the Header's Personalize control. (Phase 3 Milestone)
* **Unified Personalization (Header "Personalize" control):** One persisted preference set governing content depth (beginner-only / expert-only / both, applied across every tool and glossary page) and an optional career-track selection that pre-selects your track in the Career Center and recommends one in the Academy.
* **Identity Scenario Builder (`/scenario-builder`):** Questionnaire-driven enterprise topology, user lifecycle, and threat model generator. (Phase 1 Milestone)
* **Interactive Identity Labs (`/labs`):** Hands-on vulnerability and pen-test sandbox covering JWT Algorithm Confusion, SAML SSW, SCIM sync conflicts, and OAuth security overrides. (Phase 2 Milestone)
* **Enterprise Reference Implementations (`/references`):** Categorized, beginner-to-advanced library of ready-to-run copyable code — session/cookie auth, LDAP bind & search, Passport OIDC, refresh-token rotation, WebAuthn server verification, HashiCorp Vault AppRole, Keycloak Spring Security, SCIM 2.0 payloads, OPA/Rego, AWS/GCP workload identity federation, Kubernetes RBAC, and Istio mTLS. Each entry is individually searchable and deep-linkable via `?ref=<id>`. (Phase 4 Milestone)
* **Identity Case Study Center (`/case-studies`):** An educational repository deconstructing 13 real-world, production-quality IAM implementation case studies (Netflix, Uber, Cloudflare, Google, Slack, Stripe, Thales, Login.gov, GitHub, and more) across Big Technology, Financial Services, Government, Healthcare, Retail, and Education, each tagged Beginner → Advanced, with architecture sequence flows, threat models, and deep-linkable (`?study=<id>`), fully searchable entries. (Phase 6 Milestone)
* **Interactive Threat Modeling Studio (`/threat-modeling`):** Visual sandbox to construct IAM topologies, toggle vulnerability configurations, and run active STRIDE, OWASP, and MITRE threat validations with detailed mitigation reports. (Phase 6 Milestone)
* **Identity Decision Matrix (`/decision-matrix`):** Interactive architecture recommendation engine mapping standard protocols, authorization schemas, IdPs, checklists, and deep-linked tools. (Phase 6 Milestone)
* **IAM Design Review Assistant (`/design-review`):** Interactive design reviewer executing automated structural audits on OAuth parameters, SAML XML, and JWT payload configurations. (Phase 6 Milestone)
* **Living Standards & RFC Explorer (`/standards`):** Interactive standards center detailing RFC specifications, message schemas, and sequence flows across OIDC, OAuth, SAML, SCIM, and WebAuthn. Supports shareable `?standard=<id>&tab=<tab>` deep links surfaced through global search. A **Compliance Deadlines** tab (`?view=deadlines`) tracks major identity-relevant regulatory deadlines (NIS2, DORA, PCI DSS 4.0, eIDAS 2.0/EUDI Wallet, and more), filterable by jurisdiction with a past/upcoming toggle — each entry links to its official source and flags whether the date is confirmed or still estimated. (Phase 6 Milestone)
* **Interactive Architecture Center (`/architecture`):** Clickable, responsive reference architectures detailing trust boundaries, threat models, and trace logs — 24 architectures spanning Beginner (session/cookie auth, on-prem LDAP bind, social login, API key auth, basic RBAC), Intermediate (JWT stateless APIs, SSO reverse proxies for legacy apps, step-up TOTP MFA, IGA access reviews, JIT PAM elevation, OAuth 2.0/OIDC, SAML 2.0), and Advanced (Zero Trust NIST SP 800-207, Multi-tenant B2B SaaS, Multi-Cloud SPIRE/SPIFFE, PKI, Kubernetes, banking/healthcare/government/manufacturing/retail) tiers, with a difficulty filter. Supports shareable `?arch=<id>` deep links surfaced through global search.
* **IAM Landscape Directory (`/explore`):** Browsable, beginner-to-advanced catalog of 21 identity products — Open Source IdPs (Keycloak, Authentik, Ory, Zitadel), Enterprise & Workforce SaaS (Auth0/Okta, Entra ID, Ping Identity, JumpCloud), CIAM platforms (WorkOS, Frontegg), Directory Services (OpenLDAP, FreeIPA), PAM & Access (Teleport, CyberArk, BeyondTrust, HashiCorp Boundary), and Secrets Engines (Vault, Doppler) — each tagged by difficulty tier with license details, protocol support matrices, and copyable integration snippets. Every entry is individually searchable and deep-linkable via `?product=<id>`. Links to the **Auth Matchmaker** (`/explore/matchmaker`) wizard for a guided recommendation.
* **Enterprise Ecosystem & Vendor Intelligence Portal (`/vendor`):** Definitive knowledge portal mapping 18 major identity platforms (featuring deep-dive custom subtabs for Thales OneWelcome, SafeNet Trusted Access, and IdCloud), with a "Compare" mode for a deep-linkable, side-by-side attribute comparison of up to 3 vendors. Houses a Live Identity Intelligence Hub with real-time news and security advisories, a searchable CVE code patch repairs analyzer, an interactive AI Content Ingestion Pipeline simulator, a Community events calendar with automated alert simulations, and social dashboard integrations.
* **Identity Research & CVE Tracker (`/research`):** Searchable identity CVE directory (e.g. Log4Shell, Spring4Shell) with side-by-side vulnerable vs. secure code-remediation patches, and a live IETF RFC protocol registry.
* **Design Pattern Library (`/patterns`):** Hardened integration patterns, sequence flows, and implementation checklists for B2B Federated SSO, API Gateway Token Exchange (RFC 8693), and Passwordless FIDO2.
* **Enterprise Certification Hub (`/certifications`):** 27 beginner-to-advanced identity certifications, difficulty/category-filterable and individually searchable via `?cert=<id>` deep links — Fundamentals (SC-900, CompTIA Security+, IDPro CIDPRO), Cloud & Workforce IAM (SC-300, AZ-500, Okta, Ping, AWS/GCP security), Identity Governance (SailPoint, Saviynt, One Identity), Privileged Access Management (CyberArk, BeyondTrust, Delinea), Security Leadership & GRC (CISSP, CCSP, CISM, CRISC), Privacy (IAPP CIPT/CIPM), and Cloud-Native (CKS) — with study blueprints, domain-weighted focus areas, and interactive mock practice exams with real-time explanations for flagship credentials.
* **Interview & Career Preparation Center (`/career-center`):** Comprehensive role-based interview preparation system. Spans 6 role tracks (Fresher -> Principal) featuring interactive multiple-choice verification, outage incident walkthroughs, real-time system design audits, config code terminals (LDAP filters, OPA Rego rules), timed mock interviews, and copyable high-impact resume bullets.
* **Security Bulletins & IR Simulator (`/bulletins`):** Active threat bulletins tracking real-world incident post-mortems (Okta support HAR cookie theft, SolarWinds Golden SAML) with an interactive "Crisis Response Console" simulation game.
* **Interactive Playgrounds (`PlaygroundCatalog.tsx`):** Selection hub connecting to 15+ custom-built detailed simulators.
* **Interactive Identity Timeline (`/timeline`):** Traces identity history from 1961 mainframes to future ambient trust, with active inline simulators for 6 eras.
* **Community Achievements & Badge Hub (`/community`):** Dynamic contributor achievements, monthly challenges, and leaderboards driven by browser states, plus cross-module milestone badges that aggregate progress already tracked across the IAM Academy (track graduations) and the Playground catalog (cumulative completions).
* **Community Forums & Showcase Hub (`/community-forums`):** Threaded SecOps discussion boards (SCIM conflicts, SSW bypasses) and custom reference architecture showcases.
* **IAM Events & Conferences (`/events`):** Hand-curated, chronologically sorted calendar of major identity industry conferences and summits — EIC, Identiverse, RSAC, Gartner IAM Summit, Authenticate, Oktane, Identity Week, and KuppingerCole Impact Days — with dates, locations, and direct links to official agendas. Past events automatically drop off the list.
* **IAM Analyst Reports & Research (`/reports`):** Publisher-grouped directory of trusted third-party IAM research — Gartner Magic Quadrants (Access Management, PAM), Forrester Waves (Workforce Identity, CIAM, Privileged Identity Management), KuppingerCole Leadership Compasses (Access Management, CIAM, Passwordless), and Thales's annual Data Threat Report. Every report carries a source-verified provenance note and a "last verified" date, a **Cross-Analyst Leaderboard** highlights vendors recognized as a Leader by 2+ independent publishers, and named-leader chips deep-link straight into the matching Vendor Center profile.
* **AI Knowledge Assistant 2.0 (`/assistant`):** Multi-tabbed platform navigator featuring highly context-aware chat with automatic tool recommendations, side-by-side protocol comparisons, and customized dynamic career roadmaps.
* **Team, Contact & Security Transparency (`/contributors`):** Developer bio cards, an inquiry contact form, and a "Security & Transparency" section summarizing shipped hardening controls (CSP, Referrer-Policy, SHA-pinned Actions, Dependabot, CI `npm audit` gate) with a link to the GitHub Security tab.
* **Terms, License & Disclaimer (`/terms`):** MIT license summary and an educational/simulated-environment disclaimer clarifying that the attack-technique labs (SAML Signature Wrapping, Golden SAML, JWT cracking, etc.) run entirely client-side against mock data, plus a no-warranty clause.

### 💻 B. Simulators & Playgrounds (`/playground`)
* **OAuth 2.0 / OIDC Flow Visualizer:** Animates Front-Channel redirects and Back-Channel direct connections step-by-step. Generates dynamic **PKCE verifier/challenge pairs** and inspects raw HTTP requests.
* **JWT Studio:** Cryptographically signs headers and payloads using browser-native HMAC-SHA256, and simulates the infamous **`none` algorithm** and **JWKS spoofing** exploits.
* **SAML 2.0 XML Workbench:** Generates raw Assertion packages, signs XML, and runs **SAML Signature Wrapping (SSW)** injections.
* **FIDO2 / WebAuthn Lab:** Emulates asymmetric public-key credential negotiations, parsing `clientDataJSON` and `authenticatorData` bytes.
* **Access Control Engine:** Runs dynamic, context-aware **ABAC** evaluations (evaluating device compliance, location network, and department) and contrasts it against static **RBAC** groups.
* **LDAP Tree Simulator:** Renders a nested Active Directory domain schema. Typing standard LDAP filters (e.g. `(memberOf=cn=Admins)`) dynamically matches and highlights nodes.
* **Zero Trust Planner:** Models NIST SP 800-207 trust algorithms, calculating access risk scores based on real-time parameters.
* **SCIM Provisioning Lab & Sync Engine:** Simulates real-time Identity Provider (IdP) to Service Provider (SP) user lifecycle sync loops (CRUD), simulating `HTTP 429` (Rate-Limiting) and `HTTP 409` (Conflict) sync queues.
* **OAuth 2.0 Attack Lab:** Hands-on hack-and-defend sandbox demonstrating PKCE bypasses, open-redirect URI wildcards, and CSRF session state omissions.
* **Kerberos Tickets Lab:** State-machine AD simulator modeling AS/TGS cryptographic ticket exchanges and Golden/Silver Ticket exploits.
* **Identity CTF Hacking Arena:** Gamified identity-focused capture-the-flag challenges with scoreboard tracking for JWT none-algorithm bypass, SAML wrapped assertion injections, and LDAP filter parameter escapes.
* **Identity Architect AI Builder:** Questionnaire-driven design wizard generating bespoke visual topologies, threat models, software specifications, and OPA/JSON policy scripts based on project parameters.
* **JWT Signature Secret Cracker:** Visual, client-side dictionary attack simulator hashing local payloads against common weak secrets to discover HS256 JWT keys within seconds.
* **mTLS & Certificate Chain Validator:** Visual hierarchical map of Certificate Authorities (Root -> Intermediate -> Leaf) allowing users to simulate CRL/OCSP revocations and trace mTLS handshakes.
* **Active Directory GPO Simulator:** Interactive DC GPO editor modeling password lengths, lockout thresholds, and ticket lifetimes with login lockouts and Kerberos TGT outputs.
* **AI vs Identity Threat Lab:** Simulates Generative AI voice deepfake attacks against legacy MFA and witness how FIDO2 hardware bounds defeat synthetic cloning.
* **Zero-Knowledge Proof (ZKP) Wallet:** Explore decentralized Self-Sovereign Identity. Generate mathematical proofs confirming your age without exposing your raw birthdate.
* **Continuous Ambient Trust Decayer:** Visualize post-2030 systems where real-time biometric telemetry (keystrokes, location) constantly decays or fortifies session trust.
* **NHI Workload Mesh (SPIFFE):** Simulate service-to-service attestations, issuing dynamic X.509 SVID credentials to secure microservice pipelines without static API keys.
* **Enterprise IAM Reference Builder:** Visual drag-and-drop identity topology architect with dynamic SVG trust lines and OIDC/SAML/SCIM handshake traces.
* **Session Hijacking & Token Theft Lab:** Simulates session cookie theft via infostealers, pasting stolen tokens, and applying DPoP, IP-binding, and CAEP.
* **Conditional Access Policy Simulator:** Models conditional policy evaluations testing device compliance, networks, geolocations, and risk scores.
* **Open Policy Agent (OPA) & Rego Playground:** Decoupled fine-grained authorization rules playground using OPA's standard Rego language with input JSON.
* **Token Exchange Lab (RFC 8693):** Security Token Service (STS) broker flow modeling RFC 8693 access delegation and impersonation.
* **Identity Threat Detection (ITDR) Lab:** Real-time SecOps system log monitoring, brute-force/push fatigue injection, and lockout mitigations.
* **Device Posture & MDM Attestation Lab:** Models Zero Trust endpoint posture attestation handshakes evaluating firewalls, FileVault encryption, and mTLS client certificates.
* **Passkey Internals Playground:** Deconstructs binary authenticatorData byte-offsets and CBOR public keys generated inside hardware enclave TPMs.

### 🛠️ C. Security Tools (`/tools`)
* **Free, 100% client-side IAM/security utilities** — no signup, no uploads, nothing leaves the device. 32 tools are live:
  * **Tokens & Assertions:** JWT Decoder, JWT Generator, JWKS Key-Set Inspector, SAML Decoder, SD-JWT Decoder.
  * **PKI & Certificates:** Basic/Bearer Auth Header Decoder, JWK↔PEM Converter, X.509 Certificate & CSR Decoder, X.509 CSR Generator.
  * **Hashing, Encoding & Secrets:** Base64/Base64URL Encoder-Decoder, SHA-256 & Hash Generator, HMAC Generator & Verifier, bcrypt Hash Generator, Passphrase & Entropy Strength Calculator, Ansible Vault Encryptor & Decryptor, Mozilla SOPS GitOps Secrets Simulator, Hardware Key Ring & HSM Emulator.
  * **Auth & Directory Builders:** OAuth PKCE Generator, TOTP Generator & Verifier, LDAP Filter Builder, SCIM Payload Validator, OAuth Request Builder, OIDC Discovery Document Auditor, SAML Metadata Builder, SCIM Diff & Reconciliation Tool, Standards Conformance Checker.
  * **Emerging & Decentralized Identity:** WebAuthn/Passkey Assertion Decoder, DID Key Generator.
* Every tool page pairs a **beginner analogy** with an **expert technical specification** (RFC/spec-referenced), matching the Encyclopedia's teaching pattern, plus its own SEO-optimized route, meta tags, and JSON-LD structured data for search discoverability.
* All backlog items from `FIXED_TODO.md` (including sitemap hygiene and automatic IndexNow pings) have been fully completed and validated.

### 🏛️ D. Advanced Ecosystem & Governance
* **Master A-Z Encyclopedia (`Encyclopedia.tsx`):** Searchable glossary packed with **65 standard identity terms**. Details analogies and strict technical specifications.
* **Vulnerability Lab & Identity Museum (`WallOfShame.tsx`):** Interactive corridor charting the 5 historic eras of identity. Houses detailed steppers explaining the SolarWinds **Golden SAML** exploit, **Silver SAML** threats, and **MFA Fatigue push bombing**.
* **Developer Playbooks (`CheatSheets.tsx`):** Checklist compliance audits for SPAs and M2M credentials, fully expanded with interactive regulatory checklists mapping **SOC2 Type II, ISO 27001, and HIPAA Security Rule** identity controls to update dynamic compliance gauges.
* **GRC Maturity Wizard (`Assess.tsx`):** 5-pillar questionnaire evaluating organizational readiness, plotting dynamic charts, exporting a downloadable vector SVG roadmap, and generating a shareable, URL-hydrated read-only report link.
* **Identity Playground SDK (`src/lib/sdk`):** A unified, reusable React developer framework containing integrated state machines, trace terminals, scoring hooks, and structured AI connector schemas to rapidly spin up and scale future sandboxes.

---

## 🛠️ Technology Stack

* **Framework:** React 19, TypeScript, Vite 7.x
* **Search Core:** MiniSearch (lightweight, client-side indexing with full-text TF-IDF relevance weighting, prefix search, and fuzzy matching)
* **State & Storage:** Zustand + Persist Middleware (local storage)
* **Design & Theme:** Tailwind CSS 4.x (fully fluid responsive grids, supporting system-matching Light & Dark themes)
* **Animation Canvas:** Framer Motion (animated vector flow paths)
* **Testing Core:** Vitest (Vite-native unit testing with Server-Side-Rendering defensive safeguards)

---

## 💻 Local Development & Setup

To boot up the project, run tests, or modify configurations locally on your machine:

### 1. Recommended VS Code Extensions
For a consistent, professional, and rapid development workflow:
- 🛡️ **ESLint** (`dbaeumer.vscode-eslint`) - Code standards and audits.
- 🎨 **Prettier** (`esbenp.prettier-eslint`) - Consistent code formatting.
- 🚀 **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Dynamic CSS v4 suggestions.
- 🧪 **Vitest** (`vitest.explorer`) - Run unit tests directly inside the IDE panel.

### 2. Standard Terminal Commands
Open your terminal at the workspace root directory:
```bash
# 1. Install all dependencies
npm install

# 2. Start the instant dev server
npm run dev

# 3. Compile TypeScript & Build Production Assets
npm run build

# 4. Run the Unit Test Suite
npm run test
```

---

## 🚀 Continuous Deployment (GitHub Actions)

This repository is equipped with a fully automated CI/CD pipeline inside `.github/workflows/deploy.yml`:
- Every time you run `git push origin main`, GitHub Actions automatically boots up an Ubuntu runner, installs Node.js, compiles your TypeScript code, bundles assets, and deploys them directly to **GitHub Pages**.
- The custom domain is mapped via `public/CNAME` (bundled into every deploy so the mapping survives redeploys) — DNS is configured separately in your registrar and in the repository's **Settings → Pages**.
- Your live website is served statically at: **[https://www.aboutiam.com/](https://www.aboutiam.com/)**

---

## 📄 License & Open-Source

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. 
All contributions are welcome! Review our [Contributing Guidelines](CONTRIBUTING.md) to join the mission of making digital identity safer for everyone.

Created by **[Mayank Raj Jaiswal](https://github.com/mayankrajjaiswal/)** and Rajat.
