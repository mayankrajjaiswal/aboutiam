# AboutIAM — Next Features Roadmap (12 New Modules)

This document is the execution playbook for the next 12 features approved for AboutIAM. It follows the same conventions already established in `GEMINI.md` §4 (route wiring, registry-driven data, SDK reuse, search indexing, testing) — nothing here invents a new architectural pattern; every feature below is built by composing existing infrastructure (`usePlayground` SDK, `PlaygroundShell`, registry + `searchService.ts` sync, `BookmarkButton`, `ContentFeedback`, the 3-file route-wiring convention).

**Convention for this doc:** work top-to-bottom, one feature at a time. When a feature ships, delete its section from this file entirely (matching the existing Roadmap doc convention — see `[[roadmap_doc_convention_change]]` — completed work is deleted, not marked ✅) and fold the finished description into `README.md` / `GEMINI.md` per the "Docs to update" list in that feature's section.

---

## 0. Cross-Cutting Rules (apply to every feature below)

Every feature that adds a **new page/route** must touch these files (per `GEMINI.md` §4D):
1. `src/App.tsx` — lazy import + `<Route>`.
2. `src/routeMeta.ts` — `{ path, title, description }` entry (drives tab title, meta description, canonical link, and automatic generic search fallback).
3. `scripts/postbuild-ssg.mjs` — the same `{ path, title, description }` entry (drives the static-rendered `dist/<route>/index.html` for GitHub Pages/crawlers).
4. `src/components/Layout/Sidebar.tsx` — one nav entry in the correct `AccordionGroup` (`core`, `tools`, `architecture`, `ecosystem`, `community`).
5. `public/sitemap.xml` — one `<url>` entry.
6. `public/llms.txt` — one line.
7. `src/lib/search/searchService.ts` — either rely on the generic `📄 Site Pages` fallback (fine for a single simulator page), or add a hand-curated category with keywords if the feature has multiple deep-linkable sub-items (matches §4I).

Every feature that adds a **new registry/data array** (not just a page) must:
- Live in its own `src/data/<name>Data.ts` file (typed, exported array + any derived category/type constants), so both the page and `searchService.ts` import the same source of truth — never duplicate a list across two files (this is the exact drift bug fixed repeatedly in `GEMINI.md` §4B/§4Q-Z).
- Get a colocated `src/data/<name>Data.test.ts` asserting: id uniqueness, every difficulty/category tier represented, and (if applicable) that `searchService.test.ts` indexes every entry.

Every feature built as an interactive simulator should:
- Use `usePlayground` (`src/lib/sdk/usePlayground.ts`) + `PlaygroundShell` + `TraceTerminal` (§4F) instead of hand-rolling score/hint/log state.
- Persist completion into the existing `aboutiam_labs_completed` / `aboutiam-academy-progress` localStorage keys (automatic via the SDK) so it plugs into `CommunityHub.tsx`'s existing achievement system for free.
- Respect the Airplane Mode / offline-resilience simulator hook where a "network call" is being mocked (§4G).
- Be added to `PlaygroundCatalog.tsx`'s simulator list with a `BookmarkButton`.

Every feature should get:
- A component test (if it's a component) or a page smoke test is already free via `tests/pages/allPagesRender.test.tsx` (§4AA) — only add a dedicated test file if there's real interactive logic beyond "it renders" (a scoring rubric, a state machine transition, a deep-link param).
- An SSR-safety check added to `tests/ssr/ssrSafety.test.ts` if it introduces a new Zustand store or a new module touching `window`/`document`/`localStorage` directly (§3B).

Every feature must update:
- `README.md` — one bullet in the correct lettered section (§A Core Platform, §B Playgrounds, §C Tools, or §D Advanced Ecosystem).
- `GEMINI.md` — one row in the §2 Operational Pages Directory table, and (if it establishes a new reusable extension pattern) a new lettered subsection under §4.

---

## Feature 3 — OpenID4VC Wallet Studio

**One-liner:** A full OID4VCI issuance + OID4VP presentation flow simulator — issue an SD-JWT mobile-driver's-license-style verifiable credential, selectively disclose only requested claims to a mock verifier, and visualize the QR-code/wallet handshake used by EUDI Wallets.

**Why unique:** Goes beyond the existing `ZKPWallet.tsx` toy age-proof demo into the actual live 2026 EU regulatory standard (eIDAS 2.0 mandates member-state wallets using OpenID4VCI/VP + SD-JWT).

**Where it fits:** New playground at `/playground/openid4vc-wallet`, component `OpenId4VcWallet.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group (near `ZKPWallet`). `PlaygroundCatalog.tsx` entry. Also cross-link from `/standards` if a new "OpenID4VC" standard entry is added (see below).

**Design — 3 steps:**
1. **Issuance (OID4VCI):** Mock Issuer (e.g. "Digital Motor Authority") issues an SD-JWT credential with several claims (name, birthdate, license class, address) each independently salted/hashed as an SD-JWT disclosure. Reuses/extends the existing SD-JWT decoder logic in `src/lib/tools/` (check `Tools/` for the existing SD-JWT Decoder tool's parsing lib and extend it with an *issuance* helper rather than duplicating SD-JWT logic).
2. **Wallet storage:** Visualize the credential landing in a mock wallet UI with a claims list, each with a checkbox to include/exclude in the next presentation.
3. **Presentation (OID4VP):** A mock verifier (e.g. "Bar — Age Check Only") requests specific claims via a presentation definition; user selectively discloses only the requested claim (e.g. "over 21: true" derived, not raw birthdate) and the verifier's log shows what it could and could not see.

**Data model:** `src/data/openId4VcScenarios.ts` — 3-4 preset issuer/verifier scenario pairs (mDL age-check, university diploma, employment proof) each defining the full claim set and the verifier's requested subset.

**Tests:**
- `src/data/openId4VcScenarios.test.ts` — every scenario's requested claims are a subset of the issued claims.
- `src/pages/Playgrounds/OpenId4VcWallet.test.tsx` — disclosure logic only reveals selected claims; verifier log never contains an undisclosed claim value.

**Docs to update:**
- `README.md` §B: new bullet.
- `GEMINI.md` §2 table: new row.
- Optional: add an `openid4vc` entry to `src/data/standardsData.ts` (§4Q pattern) with `relatedResources` pointing at this playground.

**Feasibility:** Medium.

---

## Feature 4 — Identity Attack-Path Graph Visualizer

**One-liner:** A BloodHound-style interactive force-directed graph — load a small seeded AD/cloud-IAM dataset and visually trace privilege-escalation paths (nested group membership → domain admin, leaked service-account key → lateral movement → cloud admin).

**Why unique:** Genuinely new visual format for the site — nothing currently uses graph/network visualization. This is a widely-used real SOC/red-team skill (BloodHound-style attack-path analysis) that no beginner-to-expert resource currently teaches interactively in-browser.

**Where it fits:** New playground at `/playground/attack-path-graph`, component `AttackPathGraph.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group (pairs conceptually with `KerberosLab`/`GpoSimulator`/Threat Modeling Studio). `PlaygroundCatalog.tsx` entry.

**Technical approach:** Add a lightweight force-directed graph dependency. Prefer **no new heavy dependency** if avoidable — implement a small custom force-simulation (Barnes-Hut is overkill; a simple spring/repulsion physics loop over ≤40 nodes running on `requestAnimationFrame` is entirely feasible and keeps the zero-backend/light-bundle ethos). If a library is justified, `d3-force` (headless physics only, render via existing SVG, no `d3-selection` DOM coupling) is the lightest reasonable option — evaluate bundle size impact before adding.

**Design:**
- Nodes: Users, Groups, Service Accounts, Machines/Roles, "Domain Admin"/"Cloud Admin" target nodes. Edges: `MemberOf`, `AdminTo`, `HasSession`, `CanRDP`, `Owns` (mirrors real BloodHound edge types, simplified).
- 2-3 preset seeded scenarios of increasing difficulty (a 10-node "obvious path" scenario for beginners, a 25-30 node "multiple false paths" scenario for advanced).
- User clicks nodes to build a hypothesis path; a "Reveal Shortest Path" button highlights the actual escalation path with an explanation of each hop's real-world technique name (Kerberoasting, GenericAll ACL abuse, etc. — cross-link to existing `KerberosLab`/Wall of Shame entries where applicable).
- Score based on path-found efficiency and hint usage (via `usePlayground`).

**Data model:** `src/data/attackPathScenarios.ts` — typed graph data (`nodes: GraphNode[]`, `edges: GraphEdge[]`, `startNodeId`, `targetNodeId`, `shortestPath: string[]`) per scenario.

**Tests:**
- `src/data/attackPathScenarios.test.ts` — every scenario's `shortestPath` is a valid connected path through its own `edges` array (graph-validity check — prevents an unsolvable scenario from shipping).
- `src/lib/graph/forcePath.test.ts` (if a custom shortest-path helper is written, e.g. BFS over the edge list) — unit tests for path-finding correctness on a small fixture graph.

**Docs to update:**
- `README.md` §B: new bullet.
- `GEMINI.md` §2 table: new row. If the custom force-graph renderer becomes reusable, document it as a new §4-lettered subsection ("How to Render a New Attack-Path Scenario").

**Feasibility:** Medium-Hard (graph physics + rendering is the most novel engineering in this whole batch — budget the most review time here).

---

## Feature 5 — Build-Your-Own-IdP Sandbox

**One-liner:** A guided, step-by-step builder that assembles a minimal OIDC Provider — configure signing keys, discovery document fields, token lifetimes, and a consent screen — then watch a mock Relying Party consume the resulting `.well-known/openid-configuration` and complete a login, entirely offline.

**Why unique:** Fills the gap between *reading about* OIDC (Standards Explorer) and *configuring* a real IdP (Keycloak/Auth0/Ory) without needing a backend — this is assembly/configuration practice, distinct from the existing `OAuthVisualizer.tsx` (which only visualizes a fixed flow) and `OidcDiscoveryAuditor.tsx` tool (which only decodes an existing document).

**Where it fits:** New playground at `/playground/build-your-idp`, component `BuildYourIdp.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group. `PlaygroundCatalog.tsx` entry.

**Design — wizard steps:**
1. **Generate keys:** RS256 keypair via Web Crypto (reuse `Tools/JwtGenerator.tsx`'s existing RS256 keypair generation helper — do not duplicate).
2. **Configure discovery doc:** Issuer URL, supported scopes, response types, endpoints — live-preview the generated `openid-configuration` JSON (reuse rendering conventions from `OidcDiscoveryAuditor.tsx`).
3. **Configure a client:** redirect URI, client ID, scope grants.
4. **Consent screen builder:** toggle which scopes require explicit consent; preview the resulting consent screen.
5. **Run it:** a mock RP ("Demo App") performs the full authorization-code + PKCE flow against the user's just-built IdP config entirely in-memory — reuses the animated request/response visualization pattern from `OAuthVisualizer.tsx` — and mints a real signed ID token using the keys from step 1, which the user can then decode via a "Send to JWT Decoder" deep link (`/tools/jwt-decoder?token=...`).

**Data model:** No new persisted registry needed — this is pure in-session interactive state (Zustand not required; component `useState`/`useReducer` is sufficient since nothing needs to persist across sessions).

**Tests:**
- `src/pages/Playgrounds/BuildYourIdp.test.tsx` — discovery doc JSON reflects configured values; generated ID token is correctly signed by the session's own keypair and verifies against its own JWKS; consent screen only prompts for scopes flagged as requiring consent.

**Docs to update:**
- `README.md` §B: new bullet.
- `GEMINI.md` §2 table: new row.

**Feasibility:** Medium (mostly composition of existing JWT/JWKS/OIDC-discovery logic already built for the Tools section — low net-new crypto work).

---

## Feature 6 — FAPI 2.0 / Open Banking Security Profile Playground

**One-liner:** A dedicated simulator for FAPI 2.0 message signing, mTLS-bound (or DPoP-bound) tokens, and Pushed Authorization Requests (PAR) — demonstrating why plain OAuth 2.0 isn't sufficient for high-value financial-grade APIs.

**Why unique:** FAPI 2.0 is a named gap — not covered in the Standards Explorer, playgrounds, or Architecture Center's protocol tier — despite the Architecture Center already having a dedicated banking architecture that would benefit from linking to it.

**Where it fits:** New playground at `/playground/fapi2`, component `Fapi2Lab.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group. `PlaygroundCatalog.tsx` entry. Add a new `fapi2` entry to `src/data/standardsData.ts` (§4Q) with `relatedResources` linking here, and link from the existing banking architecture's node in `src/data/architectureData.ts` (§4T).

**Design:**
- Step 1 — **PAR:** show why sending authorization parameters directly in a browser redirect URL is a security smell (parameter tampering, URL leakage in logs) versus pushing them server-to-server first and getting back a short-lived `request_uri`.
- Step 2 — **Sender-constrained tokens:** toggle between mTLS client-certificate binding and DPoP (reuse the existing DPoP concept from `SessionHijackingLab.tsx`/CAEP) and show a stolen bearer token being rejected because it isn't bound to the attacker's key/cert.
- Step 3 — **Message signing (JARM/JAR):** show a signed (not just TLS-protected) authorization response/request and what tampering detection looks like if a MITM alters an unsigned response.
- A final "Attack attempt" toggle simulates a classic OAuth attack (token replay, parameter injection) and shows FAPI 2.0's specific mitigation blocking it, with a trace log.

**Data model:** `src/data/fapi2Scenarios.ts` — 2-3 attack/defense scenario pairs.

**Tests:**
- `src/data/fapi2Scenarios.test.ts` — scenario shape validation.
- `src/pages/Playgrounds/Fapi2Lab.test.tsx` — attack is blocked when the correct FAPI control is enabled, succeeds (with a warning log) when disabled — proving the pedagogical contrast actually renders both branches.

**Docs to update:**
- `README.md` §B: new bullet.
- `GEMINI.md` §2 table: new row.

**Feasibility:** Medium.

---

## Feature 8 — Live Packet/Handshake Capture Overlay

**One-liner:** A reusable "DevTools inside DevTools" overlay component that intercepts a playground's own mock request/response traffic during any existing flow-based simulator run (OAuth, SAML, SCIM) and renders it as an animated, click-to-inspect Wireshark-style packet timeline.

**Why unique:** This is not a new playground but a shared instrumentation layer that makes every existing flow-based playground more visceral — a genuinely new *interaction pattern* layered onto existing content rather than new content itself.

**Where it fits:** New shared SDK component `src/lib/sdk/components/PacketCaptureOverlay.tsx` + a companion hook `src/lib/sdk/usePacketCapture.ts`. Wire it into `PlaygroundShell` as an optional prop (`packetCapture?: boolean`) so any playground opts in with one line, starting with `OAuthVisualizer.tsx`, `SAMLWorkbench.tsx`, and `SCIMLab.tsx` (the three most redirect/message-heavy flows) as the initial rollout, plus the new `BuildYourIdp.tsx` (Feature 5) and `Fapi2Lab.tsx` (Feature 6) from day one.

**Design:**
- `usePacketCapture()` exposes a `capture(frame: { direction: 'request'|'response', protocol: string, summary: string, raw: string })` function that each playground calls at its existing trace-log points (no new logic — just an additional call alongside existing `log(...)` calls).
- `PacketCaptureOverlay` renders captured frames as a horizontal timeline of color-coded blocks (request = blue, response = teal, error = red — reusing the existing theme accent tokens from `index.css` per §3A); clicking a frame expands a raw-payload inspector panel (reuse `TraceTerminal`'s monospace styling).
- Ships as a collapsible drawer at the bottom of `PlaygroundShell`, off by default, toggled via a new icon button in the shell's existing status-bar area.

**Tests:**
- `src/lib/sdk/usePacketCapture.test.ts` — frames append in order, capped at a max buffer (avoid unbounded memory growth in a long session), and `direction` styling maps correctly.
- Update **one** existing playground test (`OAuthVisualizer.test.tsx` if present, else add one) to assert `packetCapture` frames appear when the flow runs.

**Docs to update:**
- `GEMINI.md`: add a new §4-lettered subsection ("How to Add Packet-Capture Overlay to a Playground") documenting the one-line `PlaygroundShell` opt-in — this is a genuine new extension pattern, so it belongs in the Developer Maintenance & Extension Playbook, not just the pages table.
- `README.md` §B: mention it as a cross-cutting enhancement note under the Playgrounds section intro rather than a single bullet (since it touches multiple existing entries).

**Feasibility:** Medium (mechanically simple, but touches multiple existing files carefully — do this one with extra regression-test care since it modifies shipped playgrounds).

---

## Feature 9 — Identity Supply-Chain / SBOM-for-Auth Analyzer

**One-liner:** Paste a `package.json` (or similar manifest) and get a mock "auth-relevant dependency risk report" — flags packages with a history of auth-adjacent CVEs (JWT libraries, SAML parsers, OAuth clients), cross-references the existing CVE Tracker, and exports an "Identity SBOM."

**Why unique:** Fills a real 2026 supply-chain concern (attacks on auth-adjacent libraries) not covered by the existing `ResearchCenter.tsx` CVE directory, which is read-only reference material rather than an interactive analyzer of *your own* stack.

**Where it fits:** New tool at `/tools/identity-sbom-analyzer`, page `Tools/IdentitySbomAnalyzer.tsx`, following the §4E tool convention exactly (registry entry + `ToolPageShell` + `BeginnerExpertExplainer`). Sidebar: `tools` group. New pure-logic helper `src/lib/tools/identitySbom.ts`.

**Design:**
- Textarea paste of `package.json` `dependencies`/`devDependencies` (or a manual comma-separated package list, for non-npm ecosystems — keep the parser format-tolerant).
- `identitySbom.ts` matches parsed package names/version ranges against a curated static table (`src/data/authRiskyLibraries.ts`) of known auth-relevant libraries and their historically disclosed CVE ids.
- Cross-reference: any matched CVE id that also exists in `CVE_DATABASE` (`src/data/researchData.ts`, §4W) renders a "View full CVE profile →" deep link to `/research?cve=<id>` — this is the connective tissue that makes it feel integrated rather than a standalone toy.
- Output: a categorized report (Critical/High/Medium/Info) plus a downloadable JSON "Identity SBOM" (list of matched libraries + flagged CVEs + a generated timestamp) — client-side `Blob` download, no upload anywhere (privacy notice via the existing `PrivacyNotice` component already used by `ToolsCatalog`/`ToolPageShell`).

**Data model:** `src/data/authRiskyLibraries.ts` — curated array of `{ packageName, ecosystem, knownCveIds: string[], notes }`. Cross-checked against `CVE_DATABASE` ids in a test.

**Tests:**
- `src/lib/tools/identitySbom.test.ts` — parser handles a real `package.json` fixture, unknown packages are silently skipped (not false-flagged), version-range matching correctly scopes a CVE to only affected versions.
- `src/data/authRiskyLibraries.test.ts` — every `knownCveIds` entry that has a corresponding `CVE_DATABASE` id actually resolves (catches a stale/typo'd cross-reference immediately, same pattern as the `controlsMapped` check in `bulletinsData.test.ts`).

**Docs to update:**
- `src/data/toolsRegistry.ts` — new `ToolMeta` entry, `status: 'live'`.
- `README.md` §C: add to the tools bullet list under a fitting sub-bucket (new "Supply Chain & Governance" grouping, or extend "Hashing, Encoding & Secrets").
- `GEMINI.md` §2 table: new row for `/tools/identity-sbom-analyzer`.
- `public/llms.txt` + `public/sitemap.xml`.

**Feasibility:** Easy-Medium.

---

## Feature 10 — Continuous Access Evaluation (CAEP) Event Storm Visualizer

**One-liner:** A dedicated real-time Shared Signals Framework simulator — multiple mock relying parties subscribe to a mock IdP's CAEP event stream; triggering events (session-revoked, device-compliance-changed, IP-changed) animates propagation/latency/enforcement fanning out to each subscriber as a pub-sub diagram.

**Why unique:** `SessionHijackingLab.tsx` already *mentions* CAEP as one toggle among several session-defense controls, but nothing treats CAEP as its own first-class protocol topic the way Standards Explorer entries do for OIDC/SAML/SCIM — this gives it a dedicated visual simulator.

**Where it fits:** New playground at `/playground/caep-event-storm`, component `CaepEventStorm.tsx` in `src/pages/Playgrounds/`. Sidebar: `architecture` group (protocol-tier, alongside `TokenExchange`, `ConditionalAccess`). `PlaygroundCatalog.tsx` entry. Add a `caep` entry to `src/data/standardsData.ts` if one doesn't already exist (verify first — `SessionHijackingLab.tsx`'s existing CAEP toggle may already reference one; if so, extend its `relatedResources` to link here instead of creating a duplicate).

**Design:**
- Central "IdP Event Bus" node with 3-4 mock relying-party nodes connected as subscribers (SVG connector lines, matching the existing animated-connector visual language from `ReferenceBuilder.tsx`/`ArchitectureCenter.tsx`).
- A control panel to fire a CAEP event type; each subscriber node animates receipt with a simulated latency delay and shows its own enforcement decision (e.g. "Revoked session at RP-2 in 340ms", "RP-3 ignored event — not subscribed to this event type").
- A "chaos toggle" simulates a subscriber that's offline/slow (ties into the existing Airplane Mode simulator per §4G) — demonstrates the real-world problem of inconsistent enforcement latency across relying parties.

**Data model:** `src/data/caepEventScenarios.ts` — event type definitions and per-subscriber simulated latency/behavior profiles.

**Tests:**
- `src/data/caepEventScenarios.test.ts` — every event type has at least one subscriber behavior defined.
- `src/pages/Playgrounds/CaepEventStorm.test.tsx` — firing an event updates every subscribed node's state; an unsubscribed node's state is untouched; the offline-chaos toggle delays/drops delivery to the affected node only.

**Docs to update:**
- `README.md` §B: new bullet.
- `GEMINI.md` §2 table: new row.

**Feasibility:** Medium.

---

## Suggested Execution Order

Ordered by a mix of (a) unlocking cross-links for later features, (b) risk-adjusted effort, and (c) novelty payoff:

Features #1 (Agentic Identity & MCP Trust Simulator), #12 (Spaced-Repetition Quiz), #2 (NHI Sprawl Game), #7 (Passkey Rollout Strategist), and #11 (Modernization Backlog Game) have shipped. Remaining order:

1. **#9 Identity SBOM Analyzer** — tools-convention reuse, cross-links to existing CVE tracker.
2. **#5 Build-Your-Own-IdP Sandbox** — medium, but mostly composes already-built JWT/JWKS/OIDC logic.
3. **#3 OpenID4VC Wallet Studio** — medium, extends existing SD-JWT logic.
4. **#6 FAPI 2.0 Playground** — medium, cross-links banking architecture + new standards entry.
5. **#10 CAEP Event Storm Visualizer** — medium, new pub-sub visual pattern.
6. **#8 Live Packet Capture Overlay** — medium engineering risk because it touches multiple *existing shipped* playgrounds; do this after the team is warmed up on the codebase's trace-log conventions, and budget full regression testing of every playground it's wired into.
7. **#4 Attack-Path Graph Visualizer** — hardest (new rendering primitive); do last so the force-graph engineering doesn't block the other features from shipping.

## Final Wrap-Up (after all 12 ship)

- Run `npm run test` (full suite) and `npm run lint` — zero new warnings, per §3C/§3D.
- Sweep every new page for the mobile-overflow issues called out in §4E step 5.
- Update the Guided Tour (§4M) only if a feature is deemed important enough to earn a 6th tour step — default to *not* touching the tour unless explicitly requested, since it's a deliberately short 5-step onboarding.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass — these are the two tests that catch every class of drift bug described throughout `GEMINI.md` §4, and this batch of 12 features is exactly the kind of change that has historically introduced that drift.
