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

## Suggested Execution Order

All 12 features have shipped: #1 (Agentic Identity & MCP Trust Simulator), #12 (Spaced-Repetition Quiz), #2 (NHI Sprawl Game), #7 (Passkey Rollout Strategist), #11 (Modernization Backlog Game), #9 (Identity SBOM Analyzer), #5 (Build-Your-Own-IdP Sandbox), #3 (OpenID4VC Wallet Studio), #6 (FAPI 2.0 Playground), #10 (CAEP Event Storm Visualizer), #8 (Live Packet Capture Overlay), and #4 (Attack-Path Graph Visualizer).

## Final Wrap-Up (after all 12 ship)

- Run `npm run test` (full suite) and `npm run lint` — zero new warnings, per §3C/§3D.
- Sweep every new page for the mobile-overflow issues called out in §4E step 5.
- Update the Guided Tour (§4M) only if a feature is deemed important enough to earn a 6th tour step — default to *not* touching the tour unless explicitly requested, since it's a deliberately short 5-step onboarding.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass — these are the two tests that catch every class of drift bug described throughout `GEMINI.md` §4, and this batch of 12 features is exactly the kind of change that has historically introduced that drift.
