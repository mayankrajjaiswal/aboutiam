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

### 🚀 A. Core Platform
* **Overview Dashboard (`Home.tsx`):** Displays overall progress, track graduations, and historical **Identity Trivia cards** (including MIT's first 1961 password bypass and Kerberos mythology).
* **Beginner's Onboarding Primer (`BeginnerPrimer.tsx`):** Specifically designed for students, interns, and laymen. Explains the 4 chronological pillars (**Identify $\rightarrow$ Authenticate $\rightarrow$ Authorize $\rightarrow$ Audit**) in plain English.
* **IAM Academy (`Learn.tsx`):** 6 guided course tracks and 36 expanding modules. Toggling "Completed" persists progress inside browser `localStorage` and animates progress bars.
* **Interactive Playgrounds (`PlaygroundCatalog.tsx`):** selection hub connecting to 5 custom-built detailed simulators.

### 💻 B. Simulators & Playgrounds (`/playground`)
* **OAuth 2.0 / OIDC Flow Visualizer:** Animates Front-Channel redirects and Back-Channel direct connections step-by-step. Generates dynamic **PKCE verifier/challenge pairs** and inspects raw HTTP requests.
* **JWT Studio:** Cryptographically signs headers and payloads using browser-native HMAC-SHA256, and simulates the infamous **`none` algorithm** and **JWKS spoofing** exploits.
* **SAML 2.0 XML Workbench:** Generates raw Assertion packages, signs XML, and runs **SAML Signature Wrapping (SSW)** injections.
* **FIDO2 / WebAuthn Lab:** Emulates asymmetric public-key credential negotiations, parsing `clientDataJSON` and `authenticatorData` bytes.
* **Access Control Engine:** Runs dynamic, context-aware **ABAC** evaluations (evaluating device compliance, location network, and department) and contrasts it against static **RBAC** groups.
* **LDAP Tree Simulator:** Renders a nested Active Directory domain schema. Typing standard LDAP filters (e.g. `(memberOf=cn=Admins)`) dynamically matches and highlights nodes.
* **Zero Trust Planner:** Models NIST SP 800-207 trust algorithms, calculating access risk scores based on real-time parameters.

### 🏛️ C. Advanced Ecosystem & Governance
* **Master A-Z Encyclopedia (`Encyclopedia.tsx`):** Searchable glossary packed with **35 standard identity terms**. Details analogies and strict technical specifications.
* **Vulnerability Lab & Identity Museum (`WallOfShame.tsx`):** Interactive corridor charting the 5 historic eras of identity. Houses detailed steppers explaining the SolarWinds **Golden SAML** exploit, **Silver SAML** threats, and **MFA Fatigue push bombing**.
* **Developer Playbooks (`CheatSheets.tsx`):** Checklist compliance audits for SPAs and M2M credentials that update dynamic posture gauges.
* **GRC Maturity Wizard (`Assess.tsx`):** 5-pillar questionnaire evaluating organizational readiness, plotting dynamic charts, and exporting a downloadable vector SVG roadmap.

---

## 🛠️ Technology Stack

* **Framework:** React 19, TypeScript, Vite 7.x
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

Created with 💙 by **[Mayank Raj Jaiswal](https://github.com/mayankrajjaiswal/)** (Lead Architect & Founder).
