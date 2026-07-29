# AboutIAM — Phase 2 Feature Roadmap (One-Stop IAM Platform Expansion)

This is the sibling document to `NEXT_FEATURES.md` (Phase 1's 12 approved features). Phase 2 pushes AboutIAM further toward being **the one-stop place for IAM** — filling gaps in emerging standards, program-management/career tooling, and engagement formats that Phase 1 doesn't touch.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here — refer back to `NEXT_FEATURES.md` §0 before starting any feature below.

**Convention for this doc:** same as Phase 1 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

---

## Group A — Emerging Standards & Cryptography

### A3. Cloud Entitlement Graph Explorer (CIEM Lite)

**One-liner:** Load a seeded AWS/Azure/GCP IAM policy set; render a permission graph highlighting toxic privilege-escalation combinations (e.g. `iam:PassRole` + `lambda:CreateFunction`) and "effective vs. granted" access gaps, with a "shrink to least privilege" recalculation mode.

**Why unique:** A genuinely different discipline from PAM Vaulting (credential lifecycle) or Access Certification (SoD review) — this is inventory hygiene of *permissions themselves* across a cloud policy graph, the core CIEM (Cloud Infrastructure Entitlement Management) pedagogical idea, which nothing on the site currently covers.

**Where it fits:** New playground at `/playground/ciem-explorer`, component `CiemExplorer.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group. **Sequencing note: build this after Phase 1 Feature 4 (Attack-Path Graph Visualizer) ships — it reuses that feature's force-graph rendering engine and shortest-path helper (`src/lib/graph/`) rather than building a second graph renderer from scratch.**

**Design:**
- Reuses the graph node/edge rendering primitive from Phase 1 #4, with cloud-specific node types (IAM Role, Policy, Resource, Cross-Account Trust) and edge types (`CanAssume`, `Grants`, `TrustsAccount`).
- 2-3 seeded scenarios of increasing complexity; a "toxic combination" detector highlights known privilege-escalation patterns (curated static rule list, not a general SAT solver).
- "Effective vs. granted" view: toggles between what a policy *grants* on paper vs. what's actually reachable once cross-account trusts and role-assumption chains are traced.
- "Shrink to least privilege" button recalculates a minimal policy for a selected role based on which permissions were actually exercised in a seeded mock CloudTrail-style access log.

**Data model:** `src/data/ciemScenarios.ts` — typed policy graph data per scenario (`roles, policies, resources, trustRelationships`) plus a `toxicCombinations` rule list and a mock access log for the least-privilege recalculation.

**Tests:**
- `src/data/ciemScenarios.test.ts` — every scenario's planted toxic combination is actually detectable by the rule list against that scenario's graph (solvability check, same pattern as Phase 1 #4's shortest-path validity test).
- `src/pages/Playgrounds/CiemExplorer.test.tsx` — toxic-combination detector fires on the planted case and not on a clean role; least-privilege recalculation strictly narrows the original policy.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### A4. Identity Fabric / Orchestration Flow Builder

**One-liner:** A visual canvas for wiring a legacy SAML-only application to a modern OIDC-only IdP through an orchestration/protocol-translation node — models IdP migration without app rewrites and consistent policy enforcement across heterogeneous IdPs.

**Why unique:** 2026's dominant enterprise IAM theme (Strata Maverics, PingOne DaVinci-style identity fabric/orchestration) is completely unaddressed — `HybridAdSyncLab.tsx` covers on-prem/cloud directory sync, not a multi-IdP protocol-translation routing layer.

**Where it fits:** New playground at `/playground/identity-fabric`, component `IdentityFabricBuilder.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group.

**Design:**
- Canvas with 3 node types: Legacy App (fixed protocol, e.g. SAML-only), Modern IdP (fixed protocol, e.g. OIDC-only), Orchestration Node (the fabric — protocol-translating middleware).
- User wires App → Orchestration → IdP; the trace log narrates the translation happening step by step (SAML AuthnRequest received → translated to OIDC authorization request → OIDC token received → translated back to a SAML assertion the legacy app understands).
- 2-3 preset scenarios: "IdP migration without app rewrite," "consistent MFA policy enforced across 3 heterogeneous IdPs," "one orchestration node fronting both a legacy LDAP bind app and a modern OIDC app simultaneously."
- Reuses existing SAML assertion generation (`SAMLWorkbench.tsx`) and OIDC token issuance (`OAuthVisualizer.tsx`) logic rather than reimplementing either protocol.

**Data model:** `src/data/identityFabricScenarios.ts` — scenario definitions (app protocol, IdP protocol, expected translation steps).

**Tests:** `src/pages/Playgrounds/IdentityFabricBuilder.test.tsx` — wiring an incompatible pair without the orchestration node fails with a clear error; wiring through the node succeeds and the trace log contains every expected translation step in order.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### A5. Trust Registry & Issuer Governance Explorer

**One-liner:** Models a multi-country/multi-sector trust registry — a verifier checks not just a credential's cryptographic validity but whether the issuer is authorized in the relevant registry, including cross-border recognition and revocation-status scenarios.

**Why unique:** eIDAS 2.0/EUDI Wallet interoperability in 2026 hinges on **trust registries** (who is allowed to issue what, and who recognizes whom) — a materially different concern from credential issuance/presentation mechanics, which Phase 1 Feature 3 (OpenID4VC Wallet Studio) already covers.

**Where it fits:** New playground at `/playground/trust-registry`, component `TrustRegistryExplorer.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group, placed directly next to Phase 1's OpenID4VC Wallet Studio. **Sequencing note: build immediately after Phase 1 Feature 3 ships, reusing its `openId4VcScenarios.ts` data model and SD-JWT helpers rather than duplicating credential-issuance logic.**

**Design:**
- A registry browser: multiple national/sectoral trust registries, each listing authorized issuers and their status (active/revoked/suspended).
- A verification flow: user presents a credential from Phase 1 Feature 3's wallet; the verifier's log shows two independent checks — (1) is the signature cryptographically valid, (2) is the issuer currently listed and authorized in the registry the verifier trusts.
- Scenario: "a German university diploma issuer is authorized in the DE registry but not yet recognized by a French employer's registry" — demonstrates cross-border recognition gaps as a real 2026 EUDI interoperability pain point.
- Revocation scenario: an issuer is revoked mid-session; previously-issued credentials from that issuer now fail verification even though the signature itself is still mathematically valid.

**Data model:** `src/data/trustRegistryScenarios.ts` — registries, issuer authorization lists, and cross-registry recognition mappings.

**Tests:** `src/data/trustRegistryScenarios.test.ts` — every scenario's "expected verification outcome" is derivable purely from the registry data (no hidden logic); `TrustRegistryExplorer.test.tsx` — revoking an issuer mid-session correctly fails subsequent verification of that issuer's credentials.

**Docs to update:** `README.md` §B new bullet (placed adjacent to the OpenID4VC Wallet Studio bullet once that exists); `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### A6. Legacy & Academic Federation Playground

**One-liner:** One playground covering RADIUS AAA packet exchange, TACACS+ command authorization, and a Shibboleth/CAS/eduGAIN discovery-service simulation (WAYF picker → home IdP redirect) — the "protocols before OAuth/SAML dominance" story.

**Why unique:** Confirmed genuine gap — no unified RADIUS/TACACS+/CAS/Shibboleth/eduGAIN simulator exists anywhere on the site or in the Phase 1 plan, despite these still running enormous amounts of real enterprise network-auth and academic-federation infrastructure today.

**Where it fits:** New playground at `/playground/legacy-federation`, component `LegacyFederationLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group, positioned as a companion to `IdentityTimeline.tsx` (cross-link both ways).

**Design — 3 tabs within one playground:**
1. **RADIUS AAA:** Visualize an Access-Request/Access-Accept/Access-Reject packet exchange for network device login (802.1X-style), showing shared-secret hashing of the password attribute.
2. **TACACS+:** Contrast RADIUS's combined AAA with TACACS+'s separated Authentication/Authorization/Accounting packets, with a command-authorization example (e.g., a network admin's `show run` vs. `configure terminal` being separately authorized).
3. **Shibboleth/CAS/eduGAIN:** A WAYF ("Where Are You From") discovery-service picker — user selects their home institution from a federation metadata list, gets redirected to their home IdP, authenticates, and returns with a SAML assertion the Shibboleth SP consumes (reuses `SAMLWorkbench.tsx` assertion logic under the hood).

**Data model:** `src/data/legacyFederationData.ts` — RADIUS/TACACS+ packet field definitions, and a mock eduGAIN federation metadata list (institution names + home IdP endpoints) for the WAYF picker.

**Tests:** `src/pages/Playgrounds/LegacyFederationLab.test.tsx` — RADIUS Access-Reject renders for a wrong shared secret; TACACS+ separately logs authentication vs. authorization vs. accounting events; WAYF picker redirect produces a SAML assertion consumable by the mock SP.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium-Hard.

---

### A7. Liveness Detection & Injection Attack Lab

**One-liner:** Simulates a face-verification pipeline where the user toggles attacker techniques (presentation replay, camera-feed injection, face-swap) against defensive countermeasures (challenge-response flash patterns, depth mapping, PAD scoring) to see which defense catches which attack class.

**Why unique:** 2026's decisive shift is from presentation attacks to **injection attacks** (synthetic video piped directly into the verification SDK, bypassing the camera entirely) — the existing `AIThreatLab.tsx` covers voice deepfakes vs. legacy MFA, not camera-injection liveness detection specifically, so this complements rather than duplicates it.

**Where it fits:** New playground at `/playground/liveness-injection`, component `LivenessInjectionLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group, next to `AIThreatLab`.

**Design:**
- A mock "face verification" panel with a selectable attack vector (replay a recorded video / inject a synthetic feed bypassing the camera driver / real-time face-swap).
- A selectable defense stack (single static photo check / challenge-response flash-color-sequence / passive depth-and-micro-movement analysis / full ISO 30107-3-style PAD scoring).
- Matrix result: for each attack×defense pairing, show pass/fail with a one-line technical explanation of why (e.g. "flash challenge-response defeats replay because the attacker's pre-recorded video can't react to a randomized light pattern in real time, but does NOT defeat camera-feed injection since the injected stream can be scripted to respond").

**Data model:** `src/data/livenessAttackMatrix.ts` — the attack×defense outcome matrix with explanations, so the UI is purely data-driven (no hardcoded if/else chain — same drift-avoidance lesson already learned repeatedly in `GEMINI.md` §4B/X).

**Tests:** `src/data/livenessAttackMatrix.test.ts` — every attack has at least one defense that stops it and at least one that doesn't (so the lesson is always demonstrable); `LivenessInjectionLab.test.tsx` — selecting an attack/defense pair renders the matrix's recorded outcome and explanation.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### A8. OT/ICS Device Identity & Segmentation Simulator

**One-liner:** A factory-floor topology (PLCs, HMIs, sensors, engineering workstation) where most devices can't do traditional authentication; apply identity-based microsegmentation instead of classic NAC, and watch a ransomware lateral-movement simulation show reduced dwell time and blast radius.

**Why unique:** A completely untouched domain — every existing lab (Kerberos, AD, Zero Trust, PAM, Workload Mesh) is IT-centric; OT/ICS device identity (where most devices structurally cannot authenticate) is a distinct, real, and currently uncovered discipline (IEC 62443, identity-based microsegmentation).

**Where it fits:** New playground at `/playground/ot-ics-identity`, component `OtIcsIdentityLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group.

**Design:**
- A factory-floor network diagram: PLCs, HMIs, sensors/RTUs (most flagged "cannot authenticate"), one engineering workstation, one IT/OT boundary gateway.
- Toggle "Flat network" vs. "Identity-based microsegmentation" (classify-by-what-the-device-is: role/type/behavior fingerprint rather than authenticate-the-device).
- Trigger a ransomware-injection scenario at one compromised HMI; animate lateral-movement spread across the flat network vs. the segmented network, with a dwell-time/blast-radius comparison readout (contextualize with the real-world stat: unsegmented OT ransomware dwell time ~42 days vs. ~5 days with full segmentation/visibility).

**Data model:** `src/data/otIcsScenarios.ts` — network topology graph + per-node "can authenticate" flag + segmentation policy rules.

**Tests:** `src/data/otIcsScenarios.test.ts` — topology is a valid connected graph; `OtIcsIdentityLab.test.tsx` — segmented mode strictly reduces the number of reachable nodes from the compromise point compared to flat mode.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### A10 (stretch, deprioritized). Avatar & Spatial Identity Verification Lab

**One-liner:** Simulates age/identity assurance inside a headset-only VR/AR context — no front-facing camera, often a shared device — contrasting behavioral/gesture telemetry-based continuous authentication against wallet-based cryptographic age attestation.

**Why deprioritized:** Real, researched gap (existing biometric/liveness approaches genuinely don't map to headset-only contexts), but speculative resonance with the current audience compared to the rest of Group A. Keep as a documented stretch goal — only start after A1-A9 ship and if there's appetite for more spatial-computing content.

**Feasibility:** Medium-Hard.

---

## Group B — Governance, Program Management & Career

### B3. AD/LDAP OU & Schema Designer

**One-liner:** Drag-to-build an OU tree with nested groups and GPO-inheritance preview, exportable as LDIF.

**Why unique:** The existing `LDAPTreeSimulator.tsx` is search/filter-only against a fixed pre-built tree — this is *design*, letting the user construct a tree from scratch and see inheritance/export mechanics, a genuinely different skill (directory architecture, not directory querying).

**Where it fits:** New playground at `/playground/ldap-schema-designer`, component `LdapSchemaDesigner.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group, next to `LDAPTreeSimulator`/`GpoSimulator`.

**Design:**
- A tree-builder UI (add/nest OU, add group, add user placeholder) — prefer simple "Add Child" buttons + indentation over full drag-and-drop for accessibility (consistent with the codebase's general preference, see Phase 1 Feature 11's note on avoiding complex DnD).
- GPO inheritance preview: applying a GPO at a parent OU visually cascades to child OUs unless explicitly blocked at a child (mirrors real AD Group Policy inheritance/blocking semantics, reuses concepts from `GpoSimulator.tsx`).
- Export button generates a valid LDIF representation of the constructed tree (reuse the export/`Blob`-download pattern already used by several tools).

**Tests:** `src/lib/tools/ldifExport.test.ts` — a constructed tree serializes to syntactically valid LDIF; `LdapSchemaDesigner.test.tsx` — a GPO applied at a parent cascades to children, and blocking inheritance at a child correctly stops it.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### B4. HR-to-IdP Attribute Mapper

**One-liner:** A drag-and-connect UI mapping mock HR-system fields (Workday/SAP-style) to AD/Entra/SCIM attributes, with a live transformation preview (concat, regex, lookup table) and conflict warnings.

**Why unique:** Attribute mapping between HR-of-record systems and identity stores is one of the most common, error-prone real IAM implementation tasks, and nothing on the site models it interactively — existing SCIM tools (`ScimPayloadValidator`, `ScimDiffTool`) validate/diff payloads but don't model the *mapping design* step that produces them.

**Where it fits:** New playground at `/playground/hr-attribute-mapper`, component `HrAttributeMapper.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group, next to `HybridAdSyncLab`/`SCIMLab`.

**Design:**
- Two columns: mock HR fields (left, e.g. `Legal_First_Name`, `Cost_Center`, `Manager_Employee_ID`) and target identity-store attributes (right, e.g. `givenName`, `department`, `manager`).
- User connects a left field to a right field via a click-to-select-then-click-to-connect interaction (accessible alternative to drag-and-drop, per the same accessibility preference as B3); optionally applies a transformation (string concat of two HR fields into one attribute, a regex extraction, or a static lookup-table translation e.g. cost-center code → department name).
- Live preview panel shows a sample HR record transformed into the resulting identity-store attribute set in real time as mappings/transforms are added.
- Conflict warnings: mapping two different HR fields to the same target attribute, or leaving a required target attribute unmapped, surfaces a clear warning.

**Data model:** `src/data/hrAttributeMappingFixtures.ts` — sample HR field sets and target schema definitions for 2-3 preset scenarios (Workday→Entra, SAP→AD).

**Tests:** `src/lib/tools/attributeTransform.test.ts` — concat/regex/lookup-table transforms produce correct output on fixture data; `HrAttributeMapper.test.tsx` — duplicate-target-mapping and missing-required-attribute warnings render correctly.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### B11. Accessibility (WCAG 2.2 AA) Audit & Hardening Sweep

**One-liner:** A systematic `axe-core`-driven accessibility audit of the 30+ Framer Motion playgrounds and drag/click-based builders (including this batch's B3/B4 and Phase 1's Modernization Backlog Game), fixing keyboard-navigation, focus-management, and ARIA gaps on custom simulator widgets.

**Why unique:** Not a feature — load-bearing credibility/inclusivity work for a platform claiming "one-stop" status; WCAG 2.2 AA is the accepted baseline for education platforms and no systematic audit currently exists per README/GEMINI.md.

**Where it fits:** Cross-cutting — no new route. Add `@axe-core/react` (dev-only, or `jest-axe`/`vitest-axe` equivalent) as a dev dependency wired into the existing `component` Vitest project (§4AA) so future component tests can assert zero critical a11y violations, then run a manual sweep prioritizing the newest/most complex interactive widgets first.

**Design:**
- Phase 1: wire an axe-core assertion helper into `src/test/renderWithProviders.tsx` (opt-in per test, not globally enforced immediately, to avoid a mass simultaneous failure across 100+ existing component tests) so new tests can adopt it incrementally.
- Phase 2: manually sweep the highest-risk existing components (drag/click builders, canvas-style playgrounds, custom dropdown/accordion widgets) for keyboard-nav and focus-trap issues; fix incrementally, filing what's found rather than trying to land it all in one PR.
- Phase 3: require the axe-core assertion on every *new* interactive component test going forward (document this in `GEMINI.md` §4AA's test-project table as a new row/note).

**Tests:** The sweep itself *is* test-writing — no separate "test the audit" needed. Each fixed component gets (or already has) a component test asserting no critical axe violations.

**Docs to update:** `GEMINI.md` §4AA — add a note that new interactive components should include an axe-core assertion; `README.md` — no bullet needed (this is infrastructure, not a user-facing feature), but consider a short mention in a "Quality & Accessibility" line if one doesn't exist.

**Feasibility:** Medium effort, spread over time — treat as an ongoing hardening initiative, not a single PR; schedule after the highest-priority Group A/B features ship, but before Phase 2 is considered "done."

---

## Group C — Engagement, Accessibility & Format Innovation

### C3. In-Browser Mock IAM Terminal

**One-liner:** A scripted (not real-shell) terminal built on `xterm.js` accepting a curated command grammar (`openssl`, `curl`, `kinit`, a mock `jwt-cli`) against fabricated IAM infrastructure — closer to muscle-memory CLI practice than the Career Center's static code snippets.

**Why unique:** A genuinely more novel interaction format than anything currently in the Career Center's config-terminal snippets — typed, stateful, exploration-forgiving (tab-complete, history, wrong-command feedback).

**Where it fits:** New shared component `src/lib/sdk/components/IamTerminal.tsx` (SDK-level, reusable), first wired into `InterviewCareerCenter.tsx`'s existing coding-terminal exercises, replacing/upgrading the static snippet display for at least one exercise as a pilot before wider rollout.

**Design:**
- `xterm.js` renders the terminal chrome; a small custom command interpreter (`src/lib/tools/mockShell.ts`) parses a strictly curated grammar (fixed command list, fixed flag set per command — explicitly NOT a general shell, to keep it safe/lightweight and avoid scope creep into "build a real shell").
- Each supported command has a scripted mock response drawing on real syntax/output shape (e.g. `openssl x509 -in cert.pem -text -noout` prints a realistic-looking mock certificate dump; `curl -X POST https://mock-idp/token` prints a realistic mock token response) — reuses existing cert/token generation helpers from the Tools section rather than hand-writing fake output strings.
- Tab-completion and command history are xterm.js/interpreter-level features, not new architectural surface.

**Tests:** `src/lib/tools/mockShell.test.ts` — every supported command produces its expected mock output; an unsupported command returns a helpful "command not found, try: ..." message rather than crashing.

**Docs to update:** `GEMINI.md` — add a new §4-lettered subsection ("How to Add a Command to the Mock IAM Terminal") documenting the curated-grammar extension pattern, since this is a genuine new reusable SDK primitive; `README.md` — amend the Career Center bullet in place.

**Feasibility:** Medium.

---

### C4. Local AI Assistant Upgrade (Opt-In WebLLM)

**One-liner:** An opt-in, never-auto-loaded "Download Local AI Model" button that runs a genuine small transformer (e.g. Qwen2.5-0.5B or Llama-3.2-1B via WebLLM, WebGPU with WASM fallback) fully client-side for free-form IAM Q&A, layered on top of — never replacing — the existing deterministic rule-based Assistant.

**Why unique:** The current `/assistant` Knowledge Chat is rule-based/keyword-matched (§Z's `KNOWLEDGE_GRAPH`), not a real LLM; this adds genuine generative capability while preserving the zero-download default experience for everyone who doesn't opt in — a meaningfully different value proposition than anything else on the site.

**Where it fits:** Extends `Assistant.tsx`'s existing Knowledge Chat tab — no new route. A clearly-labeled "🧪 Experimental: Enable Local AI" toggle that, once activated, downloads the model (cached via the Cache API/IndexedDB so it's a one-time cost per browser) and runs inference in a dedicated Web Worker (never blocking the main thread).

**Design:**
- Default state: today's deterministic Assistant, completely unchanged, zero download.
- Opt-in state: a clear warning about download size (400MB-700MB depending on model choice) and WebGPU-support requirements before the user confirms; a dedicated Web Worker hosts the WebLLM engine so a slow/failed load never freezes the UI.
- Fallback: if WebGPU is unavailable, either fall back to a WASM-only inference path (materially slower — set expectations in the UI) or disable the option entirely with a clear "not supported in this browser" message — decide which during implementation based on measured WASM performance; do not silently degrade without telling the user.
- The local model's responses should be clearly visually distinguished (e.g. a border/badge) from the deterministic Assistant's responses so users always know which mode answered them.

**Tests:** Given the heavy runtime/model-download dependency, keep automated tests scoped to what's actually unit-testable without downloading a real model: `src/lib/ai/webllmConnector.test.ts` — the Web Worker message-passing contract (request/response shape, error propagation on load failure) using a mocked WebLLM engine, not a real model download in CI. Manual QA covers actual inference quality/behavior.

**Docs to update:** `README.md` §A — amend the AI Knowledge Assistant 2.0 bullet, clearly flagging the new capability as experimental/opt-in; `GEMINI.md` §1 tech stack — add WebLLM as a new (optional, lazy-loaded) dependency; `GEMINI.md` §2 — amend the `/assistant` row's description.

**Feasibility:** Medium-Hard — **the highest engineering-risk item in Phase 2.** Budget a dedicated technical spike (measure real WASM-fallback performance, real download/cache behavior across browsers, real Web Worker integration complexity) before committing to a ship date; do not schedule this alongside other features in the same sprint.

---

### C5. AboutIAM Inspector Browser Extension

**One-liner:** A small Manifest V3 browser extension that reads the current tab's JWTs (from headers/cookies/storage), decodes/flags them locally, and deep-links "Open in AboutIAM JWT Decoder" for deeper analysis.

**Why unique:** Turns AboutIAM from a destination site into an ambient companion tool used on *any* site the user visits — a durable habit loop and organic marketing channel, following the same zero-backend, privacy-first ethos as existing similar extensions in the space (all analysis stays local, nothing is transmitted).

**Where it fits:** **This is explicitly a separate project, not part of the main Vite site build** — its own repository or a clearly separated top-level directory (e.g. `extension/`) with its own manifest, build tooling, and release cadence (Chrome Web Store + Firefox Add-ons submission/review process, which is a fundamentally different workflow from `git push origin main` → GitHub Pages).

**Design:**
- MV3 content script reads the active tab's cookies/local-storage/response headers for JWT-shaped strings (a simple regex/structure check — three base64url segments), decodes them entirely locally using the same decoding logic already built for `Tools/JwtDecoder.tsx` (extract that logic into a small shared, dependency-free module both the site and the extension can import, or accept minor duplication if sharing tooling between two build systems isn't worth the complexity — decide during implementation).
- A popup UI shows decoded header/payload and flags common issues (`alg: none`, expired token, missing standard claims) using the exact same rule set as the existing tool, for consistency.
- "Open in AboutIAM JWT Decoder →" deep-links to the live site with the token pre-filled via a URL parameter (verify the existing JWT Decoder tool supports a `?token=` deep link — if not, add one, since it's useful independent of the extension too).

**Tests:** Standard extension-testing approach (likely a lightweight Playwright/Puppeteer extension-loading test harness, separate from the main Vitest suite) — scope and tooling decided when this project actually starts, since it's a distinct codebase.

**Docs to update:** A new top-level `extension/README.md` (not the main site's README/GEMINI.md, though the main `README.md` should get one short bullet/link pointing at the companion extension once it ships) — this is explicitly flagged as a separate deliverable with its own documentation, not shoehorned into the main site's docs.

**Feasibility:** Medium, but organizationally distinct from everything else in this document — **sequence last**, and treat the decision to start it as its own go/no-go conversation with the user (separate repo, separate store accounts/ownership, separate review/approval cadence) rather than assuming it's greenlit just because it's listed here.

---

## Explicitly Considered and Rejected/Deprioritized

- **UEBA/adaptive-auth ML model expansion** — the existing `RiskEngine.tsx` already covers composite risk scoring (impossible travel, device reputation, behavior anomaly); a dedicated UEBA feature would be a near-duplicate. **Skip.**
- **Homomorphic Encryption / MPC playground** — genuinely hard to demonstrate meaningfully client-side (browser HE libraries are heavy/slow) and conceptually overlaps the existing ZKP Wallet's "prove without revealing" pattern. At most, add a short Encyclopedia glossary entry, not a full playground. **Skip the playground; consider a glossary term only.**
- **3D/WebGL (Three.js) visualization** — adds real bundle/maintenance cost for marginal pedagogical gain, and would be inconsistent with Phase 1 Feature 4's deliberate choice of a lightweight custom 2D force-sim over a heavier graph library. **Skip.**
- **Live WebRTC peer-to-peer multiplayer CTF race** — still requires signaling/STUN coordination (not truly zero-infrastructure) and has weak cheat-prevention without a server. **Skip; use C1's async shareable-score-code pattern instead.**
- **Real two-way mentor-matching** — requires a live directory/backend to connect people; infeasible under the zero-backend constraint. **Skip; instead add a small curated static resource list (WiCyS/Cyversity/ISC2 links) inside the existing Career Center.**

---

## Suggested Execution Order

A9, C2, B8, the B6/B5/B9 trio, C1, B10, B1, B2, B7, A1, and A2 have shipped. Remaining order:

- **B3, B4** — LDAP Schema Designer, HR Attribute Mapper (medium, pair well).
- **A4, A7, A8** — Identity Fabric Builder, Liveness/Injection Lab, OT/ICS Identity Lab (medium, independent — parallelize if multiple contributors).
- **A5** — Trust Registry Explorer (medium — **only after Phase 1 Feature 3 ships**).
- **A3** — CIEM Explorer (medium — **only after Phase 1 Feature 4 ships**, reuses its graph engine).
- **A6** — Legacy & Academic Federation Playground (medium-hard, lower urgency).
- **C3** — In-Browser Mock IAM Terminal (medium, new SDK primitive — good to do once other features have stabilized conventions).
- **B11** — Accessibility Audit & Hardening Sweep (ongoing, start threading through once enough interactive components exist to make a sweep worthwhile — don't block on this, but don't skip it either).
- **A10** — Avatar & Spatial Identity Lab (stretch, only if there's appetite after everything else — out of scope for this pass).
- **C4** — Local AI Assistant Upgrade (highest engineering risk — dedicated spike first, own timeline — out of scope for this pass).
- **C5** — AboutIAM Inspector Browser Extension (separate project — own go/no-go decision, sequence last — out of scope for this pass).

## Final Wrap-Up (after Phase 2 ships)

- Run `npm run test` and `npm run lint` — zero new warnings.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass for every new route/registry added in this phase.
- Cross-check that no Phase 2 route slug or tool slug collided with an existing one in `src/routeMeta.ts` / `src/data/toolsRegistry.ts` before merging each feature.
- Sweep every new page for the mobile-overflow issues called out in `GEMINI.md` §4E step 5.
- Consider whether the Guided Tour (§4M) or Sidebar grouping needs rebalancing once ~20 more pages exist — the `ecosystem`/`architecture` sidebar groups in particular will have grown substantially; a sub-grouping pass may be warranted at that point (not now).
