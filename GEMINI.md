# AboutIAM | Executive Production Guide & Maintenance Playbook

Welcome to the **AboutIAM** production workspace. AboutIAM is an open-source, highly interactive, browser-native identity security academy and cryptographic simulation workbench. 

This document serves as the definitive reference guide for the platform's production architecture, core standards, and future maintenance procedures. Now that all roadmap milestones are fully completed, this playbook details how to sustain, audit, and easily extend the platform.

---

## 1. Production Architecture Summary

AboutIAM is engineered as a **100% Client-Side, Zero-Backend Application**, ensuring zero-cost hosting (e.g., GitHub Pages, Vercel, Netlify) and ultimate data privacy. All cryptographic calculations, policy compilations, and state persistence run natively inside the user's browser.

### 🛠️ Production Tech Stack
- **Core Runtime:** React 19 (TypeScript) + Vite 7.x (instant HMR compiling).
- **Styling Engine:** Tailwind CSS 4.x (fully fluid responsive viewports, supporting system-matching Light & Dark themes).
- **State Management:** Zustand + Persist middleware (persisting user course completions and layout states in `localStorage`).
- **Motion Canvas:** Framer Motion (handling animated vector SVG flow paths and popup transitions).
- **Testing Core:** Vitest (Vite-native unit testing with mock SSR safeguards).

---

## 2. Operational Pages Directory

The active workspace maps cleanly to the following page assets under `src/pages/`:

| Path | Component Name | Description |
| :--- | :--- | :--- |
| **`/`** | `Home.tsx` | Overview Dashboard. Features dual-tracks (Beginners vs. Experts) and interactive trivia. |
| **`/primer`** | `BeginnerPrimer.tsx` | Layman's Onboarding Portal. Deconstructs security into "The Internet's Digital Bouncer" analogy. |
| **`/learn`** | `Learn.tsx` | IAM Academy. 6 tracks, 36 expandable modules with local progress bar persistent tracking. |
| **`/playground`** | `PlaygroundCatalog.tsx` | Interactive Sandboxes index. Links to all 7 completed simulators. |
| **`/playground/jwt`** | `JWTStudio.tsx` | JWT encoder/decoder. Runs real browser-native HS256 signatures and "none" alg exploits. |
| **`/playground/oauth`** | `OAuthVisualizer.tsx` | Step-by-step OIDC flow chart. Animates front/back-channels and parses raw HTTP. |
| **`/playground/saml`** | `SAMLWorkbench.tsx` | XML assertion workbench. Simulates SAML Signature Wrapping (SSW) attacks. |
| **`/playground/fido2`** | `FIDO2Lab.tsx` | WebAuthn key emulator. Parses clientDataJSON and authenticatorData payloads. |
| **`/playground/access`** | `AccessControlLab.tsx` | Dynamic ABAC/RBAC engine evaluating department, device, and network. |
| **`/playground/ldap`** | `LDAPTreeSimulator.tsx` | AD directory tree simulator. Searches objects dynamically using LDAP filters. |
| **`/playground/zta`** | `ZTAPlanner.tsx` | Zero Trust risk controller based on NIST SP 800-207. |
| **`/assess`** | `Assess.tsx` | GRC Maturity Wizard. Self-assessments with dynamic charts and downloadable SVG roadmaps. |
| **`/explore`** | `Explore.tsx` | Landscape Directory. Product blueprints with copyable integration code blocks. |
| **`/assistant`** | `Assistant.tsx` | AI Architect Chat. Simulated RAG chatbot delivering JSON policies and Rego scripts. |
| **`/encyclopedia`**| `Encyclopedia.tsx` | Master A-Z Glossary. 35 categorized standard terms with analogies and specs. |
| **`/wall-of-shame`**| `WallOfShame.tsx` | Identity Museum. 5 Eras of history, SolarWinds Golden SAML, and push-bombing fatigue. |

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

## 3.6. Next-Generation Traffic Enhancements (Phase 7 Roadmap)

To maximize organic developer traffic (SEO, Hacker News, Twitter, and LinkedIn), we will expand the platform with five high-impact, futuristic playgrounds exploring deepfakes, cryptography, and decentralized wallets:

### 1. The "AI vs. Identity" Threat Lab (`/playground/ai-threat-lab`)
- **What (Objective):** An interactive simulation explaining how Generative AI voice clones and real-time face deepfakes easily bypass traditional Voice MFA and Video KYC.
- **How (Interaction):** Render a mock smartphone authentication gateway. Users toggle "Trigger AI Voice Deepfake" to see how the system is compromised, and toggle "FIDO2 / WebAuthn Shield" to witness how cryptographic hardware-bound credentials block the attack natively by verifying physical key possession.
- **Where (Implementation):** Create page `src/pages/Playgrounds/AIThreatLab.tsx` and register the route `/playground/ai-threat-lab`.

### 2. The Zero-Knowledge Proof (ZKP) Wallet Playground (`/playground/zkp-wallet`)
- **What (Objective):** A browser-native decentralized wallet sandbox showing how privacy-first Self-Sovereign Identity (SSI) is managed.
- **How (Interaction):** Users issue themselves a cryptographically signed Verifiable Credential (e.g., a digital driver's license containing raw name, address, and birthdate claims). To access a mock restricted area, they generate and present a **Zero-Knowledge Proof (ZKP)** proving they are "over 21 years old" without transmitting or revealing their raw age or name.
- **Where (Implementation):** Create page `src/pages/Playgrounds/ZKPWallet.tsx` and register the route `/playground/zkp-wallet`.

### 3. The Continuous Biometric Trust Decayer (`/playground/ambient-trust`)
- **What (Objective):** A high-concept visualizer modeling the future of ambient, continuous authentication in post-2030 systems.
- **How (Interaction):** Render a live telemetry dashboard tracking mock biometric feeds (keystroke dynamics, smartwatch gait, AR gaze tracking) alongside a decaying **"Trust Curve"** line graph. As typing speed or wrist movements drift, trust decays, triggering a seamless biometric step-up audit in real-time.
- **Where (Implementation):** Create page `src/pages/Playgrounds/AmbientTrust.tsx` and register the route `/playground/ambient-trust`.

### 4. Non-Human Identity (NHI) Workload Mesh (`/playground/workload-mesh`)
- **What (Objective):** An interactive DevSecOps lab detailing service-to-service SPIFFE/SPIRE authentication across multi-cloud networks.
- **How (Interaction):** Build an interactive node canvas mapping microservices, cron jobs, and database brokers. Users trigger a SPIRE Workload Attestation to see how nodes dynamically prove their platform state and obtain short-lived X.509 SVID certificates to authenticate calls without shared static secrets.
- **Where (Implementation):** Create page `src/pages/Playgrounds/WorkloadMesh.tsx` and register the route `/playground/workload-mesh`.

### 5. The "IAM Auth Matchmaker" (`/explore/matchmaker`)
- **What (Objective):** An evergreen SEO lead magnet designed to capture massive developer traffic by matching startups with their ideal Auth provider (Keycloak, Auth0, Clerk, Authentik, Entra).
- **How (Interaction):** Build a 4-step consultative survey capturing tech stacks (React, Go, Django), hosting models (SaaS vs. Self-hosted), compliance needs (SOC2, HIPAA), and budget. Renders a personalized **"Perfect Auth Match Card"** with copyable integration boilerplates.
- **Where (Implementation):** Create page `src/pages/Playgrounds/AuthMatchmaker.tsx` and register the route `/explore/matchmaker`.

---

## 4. Developer Maintenance & Extension Playbook

AboutIAM is designed to be highly modular. Follow these simple guides to easily extend the platform's information base:

### 📖 A. How to Add a 36th Term to the Glossary
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
*The sidebar timeline slider will dynamically add and scale the new node instantly!*

### 🎓 C. How to Add a New Course Track to the Academy
To add a new learning track or module to the **IAM Academy**, open `src/pages/Learn.tsx` and append a new `Track` object to the `tracks` array. Enforce six sub-modules per track to maintain the global graduation progress bar ratios.
