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
| **`/roadmap`** | `Roadmap.tsx` | Zero-to-Hero Learning Pathway. Chronological guide detailing sequential tracks. |
| **`/learn`** | `Learn.tsx` | IAM Academy. 6 tracks, 36 expandable modules with local progress bar persistent tracking. |
| **`/playground`** | `PlaygroundCatalog.tsx` | Interactive Sandboxes index. Links to all 7 completed simulators. |
| **`/playground/jwt`** | `JWTStudio.tsx` | JWT encoder/decoder. Runs real browser-native HS256 signatures and "none" alg exploits. |
| **`/playground/oauth`** | `OAuthVisualizer.tsx` | Step-by-step OIDC flow chart. Animates front/back-channels and parses raw HTTP. |
| **`/playground/saml`** | `SAMLWorkbench.tsx` | XML assertion workbench. Simulates SAML Signature Wrapping (SSW) attacks. |
| **`/playground/fido2`** | `FIDO2Lab.tsx` | WebAuthn key emulator. Parses clientDataJSON and authenticatorData payloads. |
| **`/playground/access`** | `AccessControlLab.tsx` | Dynamic ABAC/RBAC engine evaluating department, device, and network. |
| **`/playground/ldap`** | `LDAPTreeSimulator.tsx` | AD directory tree simulator. Searches objects dynamically using LDAP filters. |
| **`/playground/zta`** | `ZTAPlanner.tsx` | Zero Trust risk controller based on NIST SP 800-207. |
| **`/playground/ai-threat-lab`** | `AIThreatLab.tsx` | Simulates voice deepfake attacks against legacy MFA and verifies FIDO2 hardware bounds. |
| **`/playground/zkp-wallet`** | `ZKPWallet.tsx` | Generates mathematical zero-knowledge age proofs without exposing raw birthdates. |
| **`/playground/ambient-trust`** | `AmbientTrust.tsx` | Tracks continuous, ambient biometric telemetry and decays session trust scores. |
| **`/playground/workload-mesh`** | `WorkloadMesh.tsx` | Demonstrates SPIFFE/SPIRE attestations and X.509 SVID credentials. |
| **`/explore/matchmaker`** | `AuthMatchmaker.tsx` | Startup Auth Matchmaker wizard with copyable boilerplates. |
| **`/assess`** | `Assess.tsx` | GRC Maturity Wizard. Self-assessments with dynamic charts and downloadable SVG roadmaps. |
| **`/explore`** | `Explore.tsx` | Landscape Directory. Product blueprints with copyable integration code blocks. |
| **`/assistant`** | `Assistant.tsx` | AI Architect Chat. Simulated RAG chatbot delivering JSON policies and Rego scripts. |
| **`/encyclopedia`**| `Encyclopedia.tsx` | Master A-Z Glossary. 35 categorized standard terms with analogies and specs. |
| **`/wall-of-shame`**| `WallOfShame.tsx` | Identity Museum. 5 Eras of history, SolarWinds Golden SAML, and push-bombing fatigue. |
| **`/contributors`**| `Contributors.tsx` | Team & Contact page. Integrates developer bio cards and interactive forms. |

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
*The timeline slider will dynamically add the new node instantly!*

### 🎓 C. How to Add a New Course Track to the Academy
To add a new learning track or module to the **IAM Academy**, open `src/pages/Learn.tsx` and append a new `Track` object to the `tracks` array. Enforce six sub-modules per track to maintain the global graduation progress bar ratios.
