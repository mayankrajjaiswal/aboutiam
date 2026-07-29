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

## Suggested Execution Order

Ordered by a mix of (a) unlocking cross-links for later features, (b) risk-adjusted effort, and (c) novelty payoff:

Features #1 (Agentic Identity & MCP Trust Simulator), #12 (Spaced-Repetition Quiz), #2 (NHI Sprawl Game), #7 (Passkey Rollout Strategist), #11 (Modernization Backlog Game), #9 (Identity SBOM Analyzer), #5 (Build-Your-Own-IdP Sandbox), #3 (OpenID4VC Wallet Studio), #6 (FAPI 2.0 Playground), #10 (CAEP Event Storm Visualizer), and #8 (Live Packet Capture Overlay) have shipped. Remaining order:

1. **#4 Attack-Path Graph Visualizer** — hardest (new rendering primitive); do last so the force-graph engineering doesn't block the other features from shipping.

## Final Wrap-Up (after all 12 ship)

- Run `npm run test` (full suite) and `npm run lint` — zero new warnings, per §3C/§3D.
- Sweep every new page for the mobile-overflow issues called out in §4E step 5.
- Update the Guided Tour (§4M) only if a feature is deemed important enough to earn a 6th tour step — default to *not* touching the tour unless explicitly requested, since it's a deliberately short 5-step onboarding.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass — these are the two tests that catch every class of drift bug described throughout `GEMINI.md` §4, and this batch of 12 features is exactly the kind of change that has historically introduced that drift.
