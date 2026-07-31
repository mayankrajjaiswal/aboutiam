# AboutIAM — Phase 3 Feature Roadmap (Navigation/UX + One-Stop IAM Expansion)

This is the sibling document to `NEXT_FEATURES.md` (the in-progress Phase 1+2 backlog). Phase 3 responds to two explicit asks: (1) more genuinely unique IAM content that isn't a duplicate of anything already shipped or planned, and (2) **smoother site navigation, onboarding, and overall user experience** — since the site has grown past 100 pages, the days of a single flat sidebar and a one-time tour are numbered.

Research for this phase included a crawl of `pqctoday.com` (a comparable niche-education site) — first via `WebFetch`, then via a live Playwright browse of its Home, Command Center, Report, and Playground pages once the browser tool freed up. Most of its persona onboarding, modular learning, timeline, compliance tracker, and playground concepts are already present on AboutIAM in some form. The live crawl surfaced several genuinely new, concrete ideas beyond the first pass: a unified local progress export/import (D1), a persistent site-wide floating AI-assistant launcher (D10), task-based "I want to…" filtering for large tool/playground catalogs (D11), a guided cross-page workflow breadcrumb for the GRC journey (D12), and — most notably — its "Command Center" is a full executive hub built around four board-level questions (risk, deadline, cost, ownership) with dedicated RACI (E9) and Risk Register (E10) builder tools feeding into it, which meaningfully upgrades this document's original, thinner E5 concept.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here.

**Convention for this doc:** same as Phase 1/2 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

**Duplication check:** every feature below was checked against `README.md`, `GEMINI.md`, and the currently-active items in `NEXT_FEATURES.md` (A1-A8/A10, B3/B4/B11, C3/C4/C5) before inclusion. None overlap.

---

## Group D — Navigation, UX & Onboarding

### D3. Goal-Based "Start Here" Routing Wizard

**One-liner:** A short 2-3 question wizard ("What brings you here today?" — Learn IAM fundamentals / Prep for an interview / Explore hands-on labs / Assess my org) that routes to a pre-built page *sequence*, distinct from the existing static Personalization selector which only tags a depth/role preference without actively routing anywhere.

**Why unique:** The existing Personalization control (Header "Personalize") passively adjusts content depth across pages a user *already chose* to visit; this actively decides *where to send* a brand-new, undecided visitor — filling the gap between the first-visit Disclaimer/Tour (orientation) and actually starting a learning path.

**Where it fits:** A new modal/panel triggered from `Home.tsx` (e.g. a prominent "Not sure where to start?" button), component `src/components/StartHereWizard.tsx`. No new route — it's a routing layer over existing pages.

**Design:**
- `src/data/startHereRoutes.ts` — a small static mapping from each goal answer to an ordered array of `{ path, label }` steps (e.g. "Prep for an interview" → Career Center → relevant Certification → Interview Prep tab of the Assistant).
- After answering, show the recommended sequence as a checklist the user can follow at their own pace (not a forced walkthrough) — persisted in `localStorage` so returning to the wizard's result later still shows progress against that specific path.
- Distinct from D2: D2 surfaces *past* activity; D3 helps a visitor with *no* activity yet decide where to begin.

**Tests:** `src/data/startHereRoutes.test.ts` — every route in every goal's sequence resolves to a real, currently-registered route in `routeMeta.ts` (guards against a future route rename silently breaking the wizard).

**Docs to update:** `README.md` §A new bullet; `GEMINI.md` §2 — note on the `Home.tsx` row.

**Feasibility:** Medium.

---

### D4. "Related Content" Recommendation Rail

**One-liner:** A "You might also like" strip at the bottom of tool, playground, glossary, and architecture pages, populated from the already-curated Knowledge Graph relationship edges — currently only visible on the standalone Knowledge Graph view.

**Why unique:** The relationship data already exists and is hand-curated (`/knowledge-graph`); surfacing it contextually on the content pages themselves, where a reader is far more likely to act on it, is a pure reuse/UX task rather than new content authoring.

**Where it fits:** New shared component `src/components/RelatedContentRail.tsx`, wired into `ToolPageShell` (so every tool page gets it automatically), `Encyclopedia.tsx`'s term detail view, `ArchitectureCenter.tsx`, and playground pages that have real Knowledge Graph edges. No new route.

**Design:**
- Takes a content `id` (matching the Knowledge Graph's node id scheme) and looks up its direct neighbors from the existing graph data module, rendering up to 3-4 as small cards with a one-line "why related" label (reuse the edge-label data already present in the graph, don't invent new copy).
- Renders nothing if a page's id has no graph entry yet (graceful degradation — not every one of 100+ pages needs to be in the graph before this ships).

**Tests:** `src/components/RelatedContentRail.test.tsx` — renders the correct neighbor set for a node with edges; renders nothing (not an empty box) for a node with none.

**Docs to update:** `README.md` §A — amend the Knowledge Graph bullet to mention it now also surfaces inline; `GEMINI.md` §2 — note on the `/knowledge-graph` row and a one-line addition to §4E (tool pages now get a Related Content rail via `ToolPageShell` automatically).

**Feasibility:** Easy-Medium.

---

### D6. Mobile Bottom Tab Bar

**One-liner:** A fixed bottom navigation bar on mobile viewports for the 4-5 highest-traffic destinations (Home, Learn, Playgrounds, Tools, Search), keeping them within thumb reach without replacing the full sidebar (still reachable via a "More" entry).

**Why unique:** With 100+ pages, the existing hamburger-triggered full sidebar is the only mobile navigation surface today — real reachability research for mobile recommends a persistent bottom bar specifically for a small, frequently-used core set, with everything else staying one tap away behind "More," rather than either a single giant list or nothing persistent at all.

**Where it fits:** New component `src/components/MobileBottomNav.tsx`, rendered conditionally at the `App.tsx`/layout level below a Tailwind breakpoint, alongside (not replacing) the existing `Sidebar.tsx`. No new route.

**Design:**
- 5 fixed icon+label tabs: Home, Learn, Playgrounds, Tools, and a "More" tab that opens the existing mobile sidebar/hamburger menu (reuse that existing open/close state rather than building a second menu system) — swap "More" for direct Search access if Ctrl+K/the search icon is judged more valuable in the fixed slot; decide during implementation based on which is used more in the existing analytics-free judgment call (no telemetry exists to measure this, so default to Search in the fixed slot since it's the site's most power-user-valuable single action).
- Active-tab highlighting driven by the current route via React Router's location, not manual state.
- Respects safe-area insets (`env(safe-area-inset-bottom)`) for notched devices.

**Tests:** `src/components/MobileBottomNav.test.tsx` — the tab matching the current route is visually marked active; tapping "More" opens the existing mobile menu rather than a new one.

**Docs to update:** `README.md` — no new bullet needed (this is navigation chrome, not a content feature) but add one line to the existing tech-stack/mobile-support context if such a line exists; `GEMINI.md` — a short new note under §3 (Production Code Standards) about the mobile nav pattern, since future pages don't need to do anything for this to apply to them.

**Feasibility:** Medium.

---

### D8. Sidebar Two-Tier Grouping + "Jump To" Filter

**One-liner:** Converts the now-large flat sidebar groups (`ecosystem`, `architecture`, etc. — each now dozens of items after Phase 1/2) into collapsible sub-groups with a small in-sidebar filter input, directly resolving the deferred note at the bottom of the currently-active `NEXT_FEATURES.md`'s own "Final Wrap-Up" section.

**Why unique:** Not new content — pure information-architecture hardening that becomes increasingly necessary as more Phase 2/3 playgrounds/tools land in the same few sidebar buckets; documentation-navigation research consistently favors progressive-disclosure nested trees over one long scrollable list once a section passes roughly 15-20 items, which several existing groups already have or will soon exceed.

**Where it fits:** Modifies `src/components/Sidebar.tsx` and whatever data structure currently defines its groups (check for a `sidebarConfig`-style module before assuming one needs to be created). No new route.

**Design:**
- Introduce an optional `subGroup` field on each sidebar entry's config (e.g. within `architecture`: "Protocols," "Zero Trust & PAM," "Industry Verticals," "Cloud & Workload Identity") — additive, so entries without a `subGroup` simply render under an "Other" bucket rather than requiring a mass one-time reclassification of every existing entry before this can ship.
- A small filter input at the top of the sidebar (separate from the full Ctrl+K command palette — this is for quickly narrowing the *currently open* group, not a global search) that shows/hides entries by substring match as the user types.
- Collapsed/expanded state per sub-group persisted in `localStorage` so a user's preferred layout survives navigation.

**Tests:** `src/components/Sidebar.test.tsx` — filtering by a substring hides non-matching entries and keeps matching ones visible across sub-groups; an entry without an assigned `subGroup` still renders (under "Other"), so nothing silently disappears during the transition.

**Docs to update:** `GEMINI.md` §4D — add a note that a new page's Sidebar entry should include a `subGroup` where a natural one exists; `README.md` — no bullet needed (navigation chrome, not a feature).

**Feasibility:** Medium.

---

### D9. Keyboard Shortcuts Cheat Sheet + Chorded Navigation

**One-liner:** A `?`-triggered overlay listing every keyboard shortcut, plus Gmail/GitHub-style `g`-then-letter chorded navigation (`g h` → Home, `g l` → Learn, `g t` → Tools, `g p` → Playgrounds) for power users, extending beyond the existing Ctrl+K palette.

**Why unique:** Ctrl+K covers search/jump-to-anything; chorded shortcuts for the half-dozen most-visited top-level destinations are a distinct, faster muscle-memory pattern common on developer-facing sites (GitHub, Gmail, Linear) that AboutIAM doesn't yet offer, and a discoverable `?` cheat sheet is what makes any shortcut system actually learnable rather than a hidden trick.

**Where it fits:** New shared hook `src/lib/navigation/useChordedShortcuts.ts` and component `src/components/ShortcutsOverlay.tsx`, both mounted once at `Header.tsx` alongside the existing `CommandPalette`/`GuidedTour` mounts (§4M's established "mount once, available everywhere" pattern).

**Design:**
- `useChordedShortcuts` listens for a `g` keypress followed by a second key within a short timeout window (e.g. 800ms), matching against a small static `{ chord: 'g h', path: '/' }`-style table; ignores keypresses while focus is inside any input/textarea/contentEditable (critical — must not hijack normal typing anywhere on the site, including every tool's paste/textarea inputs).
- `?` (when not focused in an input) opens `ShortcutsOverlay`, listing both the chorded navigation shortcuts and any existing ones (Ctrl+K, theme toggle, etc. — audit `Header.tsx`/`CommandPalette.tsx` for what already exists before writing the list, so it's complete and accurate).

**Tests:** `useChordedShortcuts.test.ts` — a `g` then `h` within the timeout window navigates to `/`; a `g` then `h` typed while a text input is focused does nothing; the timeout expiring resets the chord state so a stray `g` doesn't linger and misfire later.

**Docs to update:** `README.md` §A — new bullet describing the shortcuts system; `GEMINI.md` — a short note near the Command Palette description (§2's `Home.tsx`/global-feature area) documenting the chord table's location for future additions.

**Feasibility:** Easy-Medium.

---

### D10. Persistent Floating "Ask AI" Launcher

**One-liner:** A small, persistent floating action button (bottom-right, dismissible/collapsible) that opens the existing AI Knowledge Assistant's Knowledge Chat from *any* page on the site, instead of requiring a navigation to `/assistant` first.

**Why unique:** Observed directly on `pqctoday.com`'s live site (a persistent "Ask the PQC Assistant" launcher present on every page, including deep pages like its Command Center and Report views). AboutIAM's AI Knowledge Assistant is currently a full destination page — a user mid-task on, say, the FAPI 2.0 Playground has to leave the page entirely to ask a question, losing their place.

**Where it fits:** New component `src/components/FloatingAssistantLauncher.tsx`, mounted once at the root layout level (alongside `CommandPalette`/`GuidedTour`, §4M's "mount once, available everywhere" pattern) rather than only inside `Assistant.tsx`. No new route.

**Design:**
- A small floating button, collapsed by default to avoid obscuring content on already-dense pages (canvas-based playgrounds especially); expands into a lightweight chat panel reusing the existing Knowledge Chat tab's logic from `Assistant.tsx` (extract the chat-input/response-rendering logic into a shared component both the full page and the floating launcher can mount, rather than duplicating it).
- Preserves conversation context only for the current page session (no new persistence requirement beyond what the existing Assistant already does).
- Respects the existing Airplane Mode/offline-simulator conventions — if a future WebLLM upgrade (an already-active item in `NEXT_FEATURES.md`, C4) is enabled, the floating launcher surfaces the same mode-indicator badge that distinguishes local-AI from rule-based responses.

**Tests:** `src/components/FloatingAssistantLauncher.test.tsx` — renders collapsed by default; expanding shows the same chat interface `Assistant.tsx`'s Knowledge Chat tab renders, from the shared extracted component (a regression guard against the two ever drifting into different behavior).

**Docs to update:** `README.md` §A — amend the AI Knowledge Assistant 2.0 bullet to mention the new site-wide floating launcher; `GEMINI.md` §2 — amend the `/assistant` row's description.

**Feasibility:** Medium — the main work is safely extracting the chat logic into a component reusable both standalone and floating, not the floating-button chrome itself.

---

### D11. Task-Based "I Want To…" Filter for Tools & Playground Catalogs

**One-liner:** Adds a task-oriented filter row ("Decode a token," "Generate a credential," "Simulate an attack," "Validate a policy," "Build a diagram," "Check compliance") above the existing category/difficulty filters on `ToolsCatalog.tsx` and `PlaygroundCatalog.tsx`, letting a visitor filter by *what they're trying to do* rather than only by protocol/category.

**Why unique:** Directly observed on `pqctoday.com`'s Playground catalog (an "I want to…" row — Sign/verify, Encrypt/wrap, Key exchange, Generate keys, etc. — sitting above its category sidebar) as a second, orthogonal filtering axis. AboutIAM's 39 tools and 40+ playgrounds are currently filterable only by category and difficulty; a task-based axis is a meaningfully different (and for a new visitor, often more intuitive) way to find the right page, especially once several more Phase 2/3 tools land in already-large categories.

**Where it fits:** Extends `ToolsCatalog.tsx` and `PlaygroundCatalog.tsx` directly. No new route.

**Design:**
- Add an optional `taskTags: string[]` field to `ToolMeta` (`toolsRegistry.ts`) and to whatever metadata structure backs `PlaygroundCatalog.tsx`'s entries — additive, so existing entries without it simply don't appear under any task filter until tagged (avoid a mass one-time retagging blocking this feature's ship; tag the most-used/most-recent entries first, backfill the rest incrementally).
- A small fixed set of task categories (curated, not per-entry free text, so the filter row stays a manageable fixed width) — e.g. `decode`, `generate`, `simulate-attack`, `validate-policy`, `build-diagram`, `check-compliance`.
- Task filter and category/difficulty filters compose (AND, not OR) — same multi-filter interaction model already used elsewhere on the site (Standards Explorer, Case Studies, etc.).

**Tests:** Extend the existing `toolsRegistry.test.ts`/catalog component tests — every entry with a `taskTags` value uses only values from the fixed task-category list (guards against a typo silently creating an orphan filter bucket with zero matches).

**Docs to update:** `GEMINI.md` §4E — add a note that a new tool's registry entry may optionally include `taskTags`; `README.md` — no new bullet needed (this is catalog UX, not a new content feature), but amend the Security Tools §C intro line if it currently describes the filtering model.

**Feasibility:** Easy-Medium.

---

## Group E — New Unique IAM Content Domains

### E1. IAM Hall of Fame — Standard-Bearers Profile Gallery

**One-liner:** Short biographical profiles of the people behind foundational IAM specs — OAuth's Blaine Cook/Chris Messina/Eran Hammer/Dick Hardt, SAML/OASIS SSTC's Eve Maler/Scott Cantor/Prateek Mishra, Kerberos's MIT Project Athena team (Steve Miller/Clifford Neuman/Jennifer Steiner), and the WebAuthn/FIDO2 spec editors (Dirk Balfanz, Michael B. Jones, J.C. Jones).

**Why unique:** Nothing on the site personalizes standards history with the people behind them — `IdentityTimeline.tsx` covers eras/protocols and `StandardsExplorer.tsx` covers specs, neither covers the humans who wrote them, a genuinely different and highly shareable angle.

**Where it fits:** New tab on `IdentityTimeline.tsx` (`?tab=hall-of-fame`) rather than a standalone route, since it's naturally a companion to the historical narrative already there. Cross-linked from relevant `StandardsExplorer.tsx` entries' `relatedResources`.

**Design:**
- `src/data/iamHallOfFame.ts` — profile objects (`name, contribution, standard, year, bio, sourceLinks`) sourced from public, citable material (Wikipedia, OASIS/IETF/W3C credits, oauth.net history) — no invented biographical claims.
- Each profile cross-links to its relevant Standards Explorer entry via a shared id convention.

**Tests:** `src/data/iamHallOfFame.test.ts` — every profile's `standard` reference resolves to a real `STANDARDS` entry id; every profile has at least one `sourceLinks` citation.

**Docs to update:** `README.md` — amend the Interactive Identity Timeline bullet in §A in place; `GEMINI.md` §2 — amend the `/timeline` row's description.

**Feasibility:** Easy.

---

### E2. Passwordless/FIDO Certification Explainer

**One-liner:** A static reference explaining FIDO Alliance's certification programs (Authenticator L1/L1+/L2/L2+, Biometric Component/PAD certification, identity-verification certification) and what each level actually guarantees, plus a periodically-refreshed snapshot of notable certified product categories.

**Why unique:** Distinct from the existing Passkey Fleet Rollout Strategist (a budget-allocation strategy game) — this is a reference/explainer closing the real "what does 'FIDO Certified' actually mean" knowledge gap. Explicitly scoped as an evergreen explainer, not a live-mirrored copy of FIDO's continuously-changing 1,000+ product directory, which a zero-backend static site cannot keep in sync with anyway.

**Where it fits:** New Encyclopedia-style content, either as a new Standards Explorer entry (`fido-certification`) or a dedicated section within the existing Passkey Internals/Rollout Strategist playgrounds' reference material — prefer the Standards Explorer entry, since it's reference content, not an interactive simulator.

**Design:**
- New `IdentityStandard` entry in `standardsData.ts` following the §4Q convention, with a `bestPractices`/`vendorSupport` section explicitly labeled with a "last verified" date and a clear "for the live, current product directory, see FIDO Alliance's own site →" outbound link rather than pretending to replicate it.

**Tests:** Covered automatically by the existing `searchService.test.ts` loop over `STANDARDS` (§4Q) — no new test file needed.

**Docs to update:** `README.md` — amend the Living Standards bullet's entry-count mention; `GEMINI.md` §2 — amend the `/standards` row if entry counts are cited there.

**Feasibility:** Easy-Medium.

---

### E3. Digital Identity Wallet & mDL Adoption Tracker

**One-liner:** A hand-curated registry (same pattern as `complianceDeadlines.ts`) of US states issuing standards-based mobile driver's licenses, TSA/REAL ID acceptance status, and Apple/Google/Samsung Wallet support.

**Why unique:** Compliance Deadlines tracks *regulatory dates*; this tracks *consumer rollout/adoption status* — a genuinely different axis — and directly complements the already-shipped OpenID4VC Wallet Studio playground's issuance mechanics with real-world "who's actually live today" context.

**Where it fits:** New tab on `StandardsExplorer.tsx` (`?view=wallet-adoption`), following the same tab-based extension pattern already used for the Compliance Deadlines tab. No new top-level route.

**Design:**
- `src/data/walletAdoptionTracker.ts` — per-state entries (`state, mdlStatus: 'live' | 'pilot' | 'paused' | 'none', tsaAccepted, walletSupport: string[], sourceLink, verifiedDate`) — refreshed quarterly, same maintenance cadence discipline as Compliance Deadlines.
- Rendered as a filterable table/map-style list (a literal US map SVG is a nice-to-have, not required for v1 — a sortable table is sufficient and far lower effort).

**Tests:** `src/data/walletAdoptionTracker.test.ts` — every entry has a valid `mdlStatus` enum value and a non-empty `sourceLink`.

**Docs to update:** `README.md` — amend the Living Standards & RFC Explorer bullet in §A to mention the new tab; `GEMINI.md` §2 — amend the `/standards` row.

**Feasibility:** Easy.

---

### E4. Cyber-Insurance Identity Readiness Calculator

**One-liner:** An interactive scorer mapping identity controls (phishing-resistant MFA coverage, PAM deployment, Zero Trust/conditional-access posture) to real insurer underwriting criteria, outputting a directional "this posture typically swings premium ±X%" estimate with citations and real denial case studies.

**Why unique:** A dollar-exposure/insurance framing for identity investment doesn't exist anywhere on the site — distinct from the GRC Maturity Wizard (process maturity scoring) and the TCO Calculator (build-vs-buy cost), this is specifically about how identity posture affects a real, external financial outcome (insurance premiums/claim eligibility).

**Where it fits:** New tool at `/tools/cyber-insurance-readiness`, page `Tools/CyberInsuranceReadiness.tsx`, §4E convention. Sidebar: `tools` group, next to the existing TCO Calculator.

**Design:**
- Questionnaire on the specific controls insurers explicitly underwrite against in 2026 (universal phishing-resistant MFA on privileged/remote/email/cloud-admin paths, documented PAM governance, Zero Trust posture) — `src/lib/tools/insuranceReadiness.ts` maps answers to a directional premium-impact estimate and a checklist of gaps.
- Include 2-3 real, citable denial case studies (e.g. well-documented public insurance-denial disputes tied to inadequate MFA/PAM) as cautionary context, clearly sourced.
- Same "directional estimate, not a quote" disclaimer discipline already established for the Salary Compass and TCO Calculator.

**Tests:** `src/lib/tools/insuranceReadiness.test.ts` — the scorer is monotonic (adding a missing control never decreases the readiness score); every cited case study has a real source link.

**Docs to update:** `src/data/toolsRegistry.ts` new entry; `README.md` §C — new bullet in the existing "Program & Vendor Management" grouping; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### E5. Executive Command Center (upgraded from Board Report Generator)

**One-liner:** A dedicated executive hub page organizing the site's existing GRC/program-management tools around four board-level questions — "What's at risk?" (Assess), "What's the deadline?" (Compliance Deadlines), "What will it cost?" (TCO Calculator), "Who owns it?" (the new E9 RACI Builder) — plus a "Generate Board Summary" one-page export using dollar-exposure framing, explicitly surfacing non-human-identity governance as a named 2026 boardroom gap.

**Why unique / revision note:** This supersedes this document's original, thinner concept (a single export mode bolted onto `Assess.tsx`). Live-crawling `pqctoday.com`'s own "Command Center" showed a materially better version of the same idea: a standalone hub page that *reframes and links to* existing tools around the questions an executive actually asks, rather than just reformatting one tool's output. Every existing exec-adjacent artifact (Assess, RFP Generator, TCO Calculator, E4's Insurance Calculator) is technical-buyer-oriented; this is the first genuinely CISO/board-specific *destination* on the site.

**Where it fits:** New route `/command-center`, page `CommandCenter.tsx`. Sidebar: a new top-level entry (not nested under `tools` or `ecosystem`, given its cross-cutting executive-audience purpose — consider a distinct sidebar treatment, e.g. near the top alongside `Home`/`Assess`). Uses the D12 Journey Breadcrumb component to link out to Assess, Compliance Deadlines, TCO Calculator, and (once built) the RACI Builder and Modernization Backlog Game.

**Design:**
- Four large "start here" cards, one per board-level question, each linking directly to the relevant existing page (`/assess`, `/standards?view=deadlines`, `/tools/iam-tco-calculator`, `/tools/raci-builder`) — this page adds no new data collection of its own for those four; it's a curated front door.
- `src/lib/assess/boardSummary.ts` — a "Generate Board Summary" export reusing the existing Assess score/pillar breakdown, reformatted into a one-page narrative (dollar-exposure-style framing per current Gartner board-reporting guidance: risk reduction in relatable financial terms, not raw maturity-level jargon), explicitly calling out NHI/non-human-identity governance as a fixed addendum section regardless of the underlying GRC pillar structure, since it's a named 2026 gap worth surfacing even if no existing pillar maps to it directly.
- Exportable as the same Markdown/print-to-PDF pattern already used by the Dynamic Portfolio Builder.
- A "Density" toggle (inspired by the observed persona-driven density control) tied to the existing `preferenceStore.ts` depth mode (§4P) rather than inventing a second, separate density preference — reuse, don't duplicate.

**Tests:** `src/lib/assess/boardSummary.test.ts` — a low-scoring input produces a summary that names the weakest pillar(s); output is well-formed regardless of score distribution (no divide-by-zero/undefined-pillar edge cases). `CommandCenter.test.tsx` — all four question cards link to real, currently-registered routes.

**Docs to update:** `README.md` — new §A bullet for the Command Center hub, plus amend the GRC Maturity Wizard bullet in §D to mention it now feeds into the hub; `GEMINI.md` §2 — new row for `/command-center`.

**Feasibility:** Medium — mostly composition/linking of existing and E9/E10's new tools, plus the board-summary export logic carried over from the original concept.

---

### E6. Gaming & Esports Identity Playground

**One-liner:** Models account-linking across platforms, smurf/ban-evasion detection via device+behavioral fingerprinting, anti-cheat identity binding ("ban the person, not just the account"), and continuous KYC for real-money wagering platforms.

**Why unique:** A genuinely untouched vertical — every existing lab targets enterprise/workforce/consumer-web identity; gaming/esports identity (cross-platform account linking, anti-cheat identity binding, wagering KYC) is a distinct, real discipline with its own IAM challenges nothing on the site addresses.

**Where it fits:** New playground at `/playground/gaming-identity`, component `GamingIdentityLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group.

**Design:**
- Scenario 1 — Account linking: a player links a console account, a PC launcher account, and a mobile account into one persistent identity; trace log shows how a ban decision on the underlying identity propagates across all three linked platform accounts (the "ban the person, not the account" pattern).
- Scenario 2 — Smurf/ban-evasion detection: toggle device-fingerprint and behavioral-pattern signals (mouse/input cadence, hardware ID) on a fresh account created shortly after a ban; show the detection system flagging it as a likely evasion attempt with a confidence score.
- Scenario 3 — Wagering KYC: model a continuous (not one-time) identity-verification requirement for a real-money platform, re-triggering verification on risk signals (large withdrawal, new device, geolocation change).

**Data model:** `src/data/gamingIdentityScenarios.ts` — the three scenario definitions with their signal sets and expected outcomes.

**Tests:** `src/data/gamingIdentityScenarios.test.ts` — every scenario's planted signal set produces its documented expected outcome deterministically.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### E7. STIX/TAXII Identity-IOC Fan-Out Simulator

**One-liner:** Models STIX 2.1 object relationships (Indicator → Malware/Identity/Threat-Actor SDOs) and a mock TAXII 2.1 collection/subscription exchange specifically for identity-relevant indicators of compromise (leaked-credential hashes, compromised-token indicators) — teaching the exchange *format and protocol*, not detection logic.

**Why unique:** Distinct from the already-shipped CAEP Event Storm Visualizer (Shared Signals Framework session-state propagation) and the ITDR Lab (SIEM log monitoring/mitigation) — this is specifically about how identity threat intelligence is *structured and exchanged between organizations* (STIX object model, TAXII collections/subscriptions), a format nothing else on the site touches.

**Where it fits:** New playground at `/playground/stix-taxii-ioc`, component `StixTaxiiIocLab.tsx` in `src/pages/Playgrounds/`. Sidebar: `ecosystem` group, next to `ItdrLab`.

**Design:**
- A visual STIX object graph builder: user assembles an `Indicator` SDO (e.g. a leaked-credential hash pattern) and links it via STIX relationship objects to a `Malware`/`Threat-Actor`/`Identity` SDO, seeing the resulting bundle as both a graph and the underlying JSON.
- A mock TAXII exchange: the assembled bundle is "published" to a mock TAXII collection; 2-3 mock subscriber organizations with different subscription filters receive (or correctly don't receive) the bundle based on their filter criteria, visualized as a simple fan-out diagram (reuse rendering conventions from the CAEP Event Storm Visualizer where sensible, since the fan-out shape is conceptually similar even though the payload/protocol is entirely different).

**Data model:** `src/data/stixTaxiiScenarios.ts` — sample STIX object sets and subscriber filter definitions.

**Tests:** `src/data/stixTaxiiScenarios.test.ts` — every scenario's bundle is valid against the minimal STIX object shape the simulator supports; fan-out delivery correctly matches each subscriber's filter.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row.

**Feasibility:** Medium.

---

### E8. Open Source IAM "Good First Issue" Pathways Guide

**One-liner:** A static, hand-curated architecture primer and "where beginners typically start" guide for contributing to Keycloak, Ory (Kratos/Hydra), and Zitadel, with direct links to each repository's `good-first-issue` label search.

**Why unique:** Turns AboutIAM from a pure-consumption learning site into a funnel toward real open-source participation — directly reinforcing the platform's own "making digital identity safer for everyone" mission statement (README §License & Open-Source) by pointing learners at real projects, not just teaching protocol theory.

**Where it fits:** New page section, most naturally as a new tab or section on `Explore.tsx` (which already catalogs these exact projects) — add a "Contribute" callout per relevant `EXPLORE_PRODUCTS` entry rather than building a fully separate page.

**Design:**
- Extend relevant `ExploreProduct` entries (Keycloak, Ory Kratos/Hydra, Zitadel — all already in `exploreData.ts`) with an optional `contributionGuide` field: a short architecture primer, "where beginners typically start" notes, and a direct link to that repo's live `good-first-issue` search (an outbound link, not a scraped/mirrored live issue list, since a static site can't keep that in sync).

**Tests:** Covered by the existing `searchService.test.ts`/`exploreData.test.ts` loop over `EXPLORE_PRODUCTS` (§4U) if a new required field is added — extend that test to check `contributionGuide` (where present) has a non-empty guide and a valid-looking URL.

**Docs to update:** `README.md` — amend the IAM Landscape Directory bullet in §A in place; `GEMINI.md` §2 — amend the `/explore` row's description.

**Feasibility:** Easy.

---

### E9. IAM RACI Builder

**One-liner:** An interactive Responsible/Accountable/Consulted/Informed matrix builder for identity-program governance — pick from a curated list of common IAM activities (SSO onboarding, access recertification, PAM credential rotation, incident response, vendor risk review) and assign each a role from an org-chart-style role list, with built-in validation (every activity needs exactly one Accountable owner, no activity should have zero Responsible parties).

**Why unique:** Directly observed as a dedicated tool on `pqctoday.com`'s Command Center ("Who owns it? Assign accountability and set the governance model"). Genuinely new to AboutIAM — nothing on the site currently helps a team formalize *who owns what* in an identity program; the closest existing content (Access Certification Lab, Role Mining Workbench) is about *user* entitlements, not *program governance* accountability.

**Where it fits:** New tool at `/tools/raci-builder`, page `Tools/RaciBuilder.tsx`, §4E convention. Sidebar: `tools` group, cross-linked from the new E5 Command Center's "Who owns it?" card.

**Design:**
- `src/data/iamRaciActivities.ts` — a curated starter list of common IAM program activities, editable/extensible by the user (add a custom activity row), each needing an assigned role per RACI letter.
- `src/lib/tools/raciValidation.ts` — pure validation rules (exactly one Accountable per activity; at least one Responsible; warn if the same person is both Responsible and Accountable for too many activities, a common real-world governance smell).
- Export as a downloadable Markdown/CSV table.

**Tests:** `src/lib/tools/raciValidation.test.ts` — a matrix with zero or multiple Accountable owners for one activity fails validation with a clear message; a well-formed matrix passes.

**Docs to update:** `src/data/toolsRegistry.ts` new entry; `README.md` §C — new bullet in the existing "Program & Vendor Management" grouping; `GEMINI.md` §2 new row.

**Feasibility:** Easy.

---

### E10. IAM Risk Register Builder

**One-liner:** A structured risk-register builder for identity programs — add risks (e.g. "no MFA on legacy VPN," "orphaned service accounts," "single IdP with no failover"), score each by impact × likelihood, assign an owner, and record a mitigation/target date, producing a standard risk-register table export.

**Why unique:** Directly observed as a dedicated tool on `pqctoday.com`'s Command Center ("Build a PQC risk register with impact, likelihood, owners, and mitigations"). Distinct from the GRC Maturity Wizard (which *scores* overall posture) and the IAM Modernization Backlog Game (which *sequences* remediation into a roadmap) — a risk register is a different, more granular artifact security/GRC teams are typically expected to maintain continuously, not a one-time assessment or a single planning exercise.

**Where it fits:** New tool at `/tools/risk-register-builder`, page `Tools/RiskRegisterBuilder.tsx`, §4E convention. Sidebar: `tools` group, cross-linked from the E5 Command Center hub and from `Assess.tsx`'s results view (a low-scoring pillar is a natural candidate to add as a risk-register entry).

**Design:**
- A standard 5×5 impact/likelihood matrix (reuse the visual grid pattern already established elsewhere on the site for scored matrices, e.g. the Adaptive Risk-Based Authentication Engine's scoring visualization, rather than inventing a new grid component) computing a risk score and tier (Low/Medium/High/Critical) per entry.
- A small starter set of common identity risks pre-populated as editable examples (drawn loosely from the existing Security Bulletins/breach categories for realism) that the user can keep, edit, or delete — not a mandatory fixed list.
- Export as a downloadable CSV/Markdown table suitable for pasting into a real GRC tracking tool.

**Tests:** `src/lib/tools/riskRegisterScoring.test.ts` — impact × likelihood combinations map to the correct tier boundaries consistently; every starter example risk has a non-empty mitigation and owner field.

**Docs to update:** `src/data/toolsRegistry.ts` new entry; `README.md` §C — new bullet in the existing "Program & Vendor Management" grouping; `GEMINI.md` §2 new row.

**Feasibility:** Easy-Medium.

---

### Explicitly Rejected from Group E

- **IAM Patent Timeline (à la PQC Today's "Patents" section)** — research found no landmark OAuth/SAML/Kerberos patent *disputes* comparable to PQC's genuinely active, contentious patent landscape; OAuth's real patent story is deliberate *avoidance* (Open Web Foundation non-assert agreements), which is thin, single-fact content better suited to one Encyclopedia glossary entry than a dedicated section or page. **Skip the dedicated section; consider one Encyclopedia entry only.**
- **Full internationalization (i18n)/multi-language support** — real value for global reach, but an open-ended, ongoing translation-maintenance burden (every one of 182 glossary terms, 24 cheat sheets, dozens of playgrounds, etc. would need translation and re-translation on every content update) disproportionate to what a small team can sustain today. **Defer indefinitely; revisit only if content-volume growth meaningfully slows.**

---

## Group F — Interactive Formats, Accessibility & Zero-Backend Growth

### F1. Branching "Incident Commander" Narrative Simulator

**One-liner:** A choose-your-own-adventure decision-tree module where the user plays incident commander during a live breach (e.g. a Golden SAML forgery or MFA push-bombing attack), making timed branching decisions that lead to different outcomes and a post-mortem score.

**Why unique:** A genuinely different content format from the existing score-based Crisis Response Console/CTF Arena — this is narrative-branching prose with consequence trees, not a simulator UI with toggles/inputs. Pure static JSON + a state machine, with zero backend concerns at all (unlike several Group F ideas below, this one has no gray-zone caveat whatsoever).

**Where it fits:** New playground at `/playground/incident-commander`, component `IncidentCommanderSim.tsx` in `src/pages/Playgrounds/`, built on the shared Playground SDK. Sidebar: `ecosystem` group, cross-linked from `SecurityBulletins.tsx` (reuses bulletin incidents as source scenarios, same reuse discipline already established for the Tabletop Exercise Generator).

**Design:**
- `src/data/incidentCommanderScenarios.ts` — 2-3 branching-tree scenarios built from existing `BULLETINS` incidents, each node offering 2-3 timed decisions that branch to different next-nodes and eventually terminate in one of several distinct outcomes (contained-fast / contained-slow / breach-escalated / compliance-failure), each with a short post-mortem explanation.
- Reuses `usePlayground`/`TraceTerminal` from the SDK for scoring and the decision trace log.

**Tests:** `src/data/incidentCommanderScenarios.test.ts` — every scenario's decision tree is fully connected (no dead-end nodes missing a next-step or terminal outcome) and every path terminates within a bounded number of decisions.

**Docs to update:** `README.md` §B new bullet; `GEMINI.md` §2 new row; amend the Security Bulletins bullet in §A to mention this as another consumer of `BULLETINS` (alongside the Tabletop Exercise Generator).

**Feasibility:** Easy.

---

### F3. Offline "IAM Field Guide" PDF Export

**One-liner:** A one-click, client-side PDF export compiling the Encyclopedia, Cheat Sheets, and Standards reference content into a genuinely offline, printable field guide, using jsPDF's native text/table APIs rather than screenshotting the DOM.

**Why unique:** A natural sibling to the already-shipped Offline Study Pack (Markdown/`.zip` export), not a duplicate — this targets a different output/use case: a polished, printable, searchable-text PDF for physical reading or a printed reference binder, versus the Study Pack's Markdown files meant for notes-app/AI-tool ingestion.

**Where it fits:** Extends the same trigger point as the existing Offline Study Pack (`Home.tsx` or wherever that download button lives), adding a second "Download IAM Field Guide (PDF)" option alongside it. No new route.

**Design:**
- Lazy-load `jsPDF` (and its `autoTable` plugin for the tabular cheat-sheet content) via dynamic `import()` only when the PDF export is triggered — same bundle-discipline pattern already used for `JSZip` in the Offline Study Pack, so this never adds to the initial page load.
- Use jsPDF's native text/table drawing APIs for the Encyclopedia/Cheat Sheets/Standards content (real, searchable, selectable PDF text) — explicitly avoid an `html2canvas`-based DOM screenshot approach, which produces non-searchable raster text and defeats the point of a "field guide."

**Tests:** `src/lib/export/fieldGuidePdf.test.ts` — the generator produces a well-formed PDF byte stream from a fixture content set without throwing; a smoke test confirms the expected number of sections are present in the generated document's structure (jsPDF exposes enough of its internal state to assert this without needing to actually render/rasterize the PDF in a test environment).

**Docs to update:** `README.md` §A — amend the existing Offline Study Pack bullet to mention the new PDF sibling option; `GEMINI.md` §1 tech stack — add `jsPDF` as a new lazy-loaded dependency, following the same one-line disclosure pattern already used for `JSZip`.

**Feasibility:** Easy-Medium.

---

### F5. Cryptographic Local Completion Certificate

**One-liner:** Extends the already-shipped Dynamic Portfolio Builder's Open Badges SVG export with a Web Crypto-signed certificate and a small "Verify a Certificate" tool that checks the signature locally via `SubtleCrypto.verify()`.

**Why unique:** Adds a second, independent verification mechanic beyond the existing self-contained Open Badges SVG metadata — but **this feature carries a real, disclosed limitation that must be designed in from the start, not glossed over**: a pure client-side application cannot keep a signing private key secret, since all application code (including any embedded key) ships to and is inspectable in the browser. This means the feature cannot honestly claim to be an "unforgeable" proof of completion — it can only prove *internal self-consistency* (the certificate's claimed contents match its own embedded signature), functioning more like a tamper-evidence checksum than a security guarantee.

**Where it fits:** Extends the existing Portfolio Builder export flow in `InterviewCareerCenter.tsx`/`CommunityHub.tsx`, plus a small new "Verify a Certificate" mini-tool (could live at `/tools/certificate-verifier` following §4E convention, since it's a genuinely standalone, pasteable-input utility).

**Design:**
- On badge/certificate generation, sign a payload (claimed completed modules + timestamp) with an Ed25519 or ECDSA keypair generated once and committed to the repo (the *public* key ships in the app bundle and is also printed on the certificate/QR code for independent verification; the private key is used only at generation time within the user's own browser — it is never transmitted, but it is technically present in the shipped client code, which is the crux limitation above).
- The UI copy on both the certificate and the verifier tool must explicitly state: "This confirms the certificate's contents haven't been altered since AboutIAM generated it in your browser — it is not a substitute for third-party-issued professional certification and should not be represented as one." This disclosure is not optional polish — it is the difference between an honest feature and a misleading one, given the key-custody limitation above.

**Tests:** `src/lib/career/certificateVerifier.test.ts` — a certificate generated by the signing logic verifies successfully; a tampered payload (one field changed) fails verification.

**Docs to update:** `README.md` — amend the existing Dynamic Portfolio Builder bullet to mention the new signed-certificate option, **including the same honest-limitation framing** used in the UI copy; `GEMINI.md` §2 — amend the Career Center row.

**Feasibility:** Medium, with a mandatory honesty caveat in both the design and the shipped UI copy.

---

### F6. Async GitHub-Based Opt-In Leaderboard (Manual-Paste Variant)

**One-liner:** Users who complete the GRC Maturity Wizard, CTF Arena, or a cert mock exam can generate a portable share code (same pattern as the Daily Puzzle's result string) and manually paste it into a public GitHub Discussion thread as an informal, crowdsourced leaderboard.

**Why unique:** Approximates a leaderboard mechanic without any AboutIAM-run backend or scheduled compute.

**Gray-zone flag (must be disclosed in the shipped feature, not just this planning doc):** A fully-automated version of this idea — a GitHub Action that periodically aggregates posted issues/discussion comments into a rebuilt static JSON leaderboard — was explicitly considered and is **not** part of this recommendation, because it requires scheduled compute running against AboutIAM's own repository, which is a meaningfully different admission than "zero AboutIAM-run server" (it's zero-*runtime*-server, but not zero-compute-anywhere). **Only the manual-paste version is recommended here**; if an automated aggregator is wanted later, that should be its own explicit decision with the user, not something built by default under this feature's name.

**Where it fits:** A small "Share your score" button on `Assess.tsx`'s results view, `IdentityCTFArena.tsx`'s scoreboard, and relevant `CertificationHub.tsx` mock-exam results, deep-linking to a pre-filled GitHub Discussion post (same `buildIssueUrl`-style pre-fill pattern already used by `ContentFeedback.tsx`, §4L). A "Browse the community leaderboard →" link points to the live Discussion thread on GitHub itself (not embedded/mirrored on AboutIAM, since a static site can't keep a live mirror in sync without exactly the compute question flagged above).

**Design:**
- Reuse the existing `contentFeedback.ts::buildIssueUrl`-style helper, generalized or duplicated as `buildDiscussionUrl`, pre-filling a structured post (score, module/challenge name, date) into a dedicated GitHub Discussions category.

**Tests:** `src/lib/community/shareScoreUrl.test.ts` — the generated URL correctly encodes the score/module/date into the pre-filled post body.

**Docs to update:** `README.md` — amend the relevant existing bullets (Assess, CTF Arena, Certification Hub) to mention the new share-to-community option, **including the gray-zone note** that this links out to GitHub Discussions rather than running any AboutIAM infrastructure; `GEMINI.md` §4L — add a note that this reuses the `ContentFeedback` pre-filled-URL pattern.

**Feasibility:** Easy (manual-paste version only — do not build the Action-based automated aggregator without a separate explicit go-ahead).

---

### F7. GitHub Discussions Comments (giscus)

**One-liner:** Adds threaded comments to Encyclopedia terms, Standards Explorer entries, and Security Bulletins via giscus, which stores comments as GitHub Discussions with no AboutIAM-run server involved.

**Gray-zone flag (values decision, not just a technical one — surface this explicitly to the user before building, do not just implement it):** This is architecturally consistent with the already-accepted Google Drive Backup precedent (the browser talks directly to a third party — GitHub, in this case — with no AboutIAM server ever in the loop, exactly as README §29 already describes for Drive sync). However, unlike Drive sync, this is **user-facing and visible to every visitor**, requires commenters to have a GitHub account (a real access barrier some visitors won't clear), and makes AboutIAM's comment sections dependent on GitHub's uptime/ToS in a way that's more consequential than an optional personal backup feature. **Recommend confirming with the user that this level of third-party dependency for a core, visible feature (not an opt-in personal utility like Drive Backup) is acceptable before implementing** — this plan documents it as researched and ready, not as a decided/approved build.

**Where it fits:** If approved, a shared `src/components/GiscusComments.tsx` wrapper around the giscus embed script, wired into `Encyclopedia.tsx` term detail views, `StandardsExplorer.tsx` entries, and `SecurityBulletins.tsx` entries — following the same "opt-in, clearly disclosed, inert until configured" pattern already established for Google Drive Backup (giscus requires its own GitHub App installation/repo configuration, analogous to `VITE_GOOGLE_CLIENT_ID`).

**Tests:** Minimal — mostly a third-party embed; a smoke test confirming the wrapper renders its container div and doesn't crash when the giscus script fails to load (network-blocked environments, CI, etc.) is the main thing worth testing.

**Docs to update:** If built: `README.md` new bullet with the same privacy-disclosure rigor as the Google Drive Backup bullet; a new `.env.example` entry for the giscus repo/category configuration, following the existing `VITE_GOOGLE_CLIENT_ID` pattern exactly.

**Feasibility:** Easy technically — **pending an explicit product decision from the user first**, since it's the first *visible, default-facing* feature (not an opt-in personal utility) that depends on a third-party service.

---

### F8. Newsletter/Community Links (RSS-to-Email + Existing Channels)

**One-liner:** Points the already-shipped `/rss.xml` at a free RSS-to-email bridge (e.g. Buttondown's free tier) so visitors can subscribe to new tools/CVEs/architectures by email, paired with a static GitHub Sponsors button and a Discord/Slack community link.

**Gray-zone flag:** Same category as F7 — relies on a free third-party service (an RSS-to-email provider) rather than AboutIAM running any mail infrastructure, which is consistent with the site's zero-backend ethos but is worth a one-line disclosure on whichever page hosts the signup link, same transparency standard as everywhere else third-party services are used.

**Where it fits:** A small "Stay Updated" section, likely on `Contributors.tsx` (which already hosts contact/community-adjacent content) or the Header's existing RSS button area — a link out to the chosen RSS-to-email provider's subscribe page, plus static GitHub Sponsors and Discord/Slack links if the maintainer wants to set those up (this plan does not assume those community channels already exist — confirm with the user before adding dead links for channels that don't exist yet).

**Design:** Purely a set of outbound links and a short explanatory paragraph — no new component logic beyond a static content block.

**Tests:** None needed beyond the existing page-smoke-test coverage (§4AA) that already asserts every page renders without crashing.

**Docs to update:** `README.md` §A — new bullet describing the update channels available, with the gray-zone disclosure; `GEMINI.md` — a one-line note near the RSS Feed Engine description (§H) pointing to the new email-subscribe option.

**Feasibility:** Easy — confirm actual community channel URLs (Discord/Slack/Sponsors) exist or are wanted before implementation, since this plan can't invent them.

---

### Explicitly Rejected from Group F

- **Service-Worker "real inbound webhook/SCIM callback receiver"** (accepting live traffic from an external, real SCIM client or OAuth app pointed at a locally-generated URL) — as literally described, this structurally requires a backend: a Service Worker can only intercept requests originating from pages under its own registered scope/origin, it cannot receive traffic an external server sends to a public URL without something else forwarding that traffic in, which is real server infrastructure. **Skip entirely as described.** The legitimately client-side-only version of this idea is exactly what the existing `SCIMLab.tsx` already does (simulate the receiver side with mock data) — no new feature needed here, just confirmation that the existing lab already covers the honest version of this idea.

---

## Suggested Execution Order

Phase 3 has no shipped items yet — suggested order, weighted toward cheapest/highest-value first and toward the user's explicit "smooth navigation" ask:

1. **F4** — Fact/Analogy of the Day (very easy, near-zero marginal cost, reuses shipped Daily Puzzle infrastructure).
2. **D1** — Export/Import My AboutIAM Profile (easy, directly closes the PQC Today-inspired gap).
3. **D2** — Continue Where You Left Off (easy, high retention value).
4. **D7** — Command Palette Recent + Popular (easy, small but real navigation win).
5. **D12** — Executive Journey Workflow Breadcrumb (easy, pure static data — do this early since D12/E5/E9/E10 all reference each other and it's cheapest to land first).
6. **D5** — Contextual Coach Marks (easy, complements the existing Guided Tour without replacing it).
7. **F2** — Dyslexia/Colorblind Toggles (easy, meaningful accessibility win, extends the existing Personalize control).
8. **D9** — Keyboard Shortcuts Cheat Sheet + Chorded Nav (easy-medium).
9. **D4** — Related Content Rail (easy-medium, pure reuse of existing Knowledge Graph data).
10. **D11** — Task-Based "I Want To…" Catalog Filter (easy-medium, tag newest entries first, backfill incrementally).
11. **F1** — Incident Commander Narrative Simulator (easy, reuses existing Bulletins data).
12. **F3** — IAM Field Guide PDF Export (easy-medium, sibling to shipped Offline Study Pack).
13. **E1, E3, E8** — Hall of Fame, Wallet/mDL Tracker, Open Source Pathways Guide (all easy, independent, parallelizable).
14. **E9, E10** — RACI Builder, Risk Register Builder (easy/easy-medium, build before E5 since the Command Center hub links to both).
15. **E2** — FIDO Certification Explainer (easy-medium).
16. **D3** — Goal-Based Start Here Wizard (medium).
17. **D10** — Persistent Floating Assistant Launcher (medium — extract the shared chat component carefully so the full page and floating launcher never drift).
18. **D8** — Sidebar Two-Tier Grouping (medium, do this once several Phase 2/3 pages have landed and the sidebar groups have visibly grown).
19. **D6** — Mobile Bottom Tab Bar (medium).
20. **E4** — Cyber-Insurance Calculator (medium).
21. **E5** — Executive Command Center hub (medium — build last among the E5/E9/E10/D12 cluster since it links to all of them).
22. **E6, E7** — Gaming Identity Playground, STIX/TAXII Simulator (medium, independent, parallelizable).
23. **F5** — Cryptographic Completion Certificate (medium — build the honesty-caveat copy alongside the code, not after).
24. **F6** — Async GitHub Leaderboard, manual-paste only (easy, but sequence after confirming actual community appetite exists).
25. **F7, F8** — Giscus Comments, Newsletter/Community Links (easy technically — **both require an explicit go/no-go conversation with the user first**, since they're the first default-facing features depending on third-party services; do not build without that confirmation).

## Final Wrap-Up (after Phase 3 ships)

- Run `npm run test` and `npm run lint` — zero new warnings.
- Re-verify `routeRegistrySync.test.ts` and `searchService.test.ts` both pass for every new route/registry/tab added in this phase.
- Cross-check that no Phase 3 route/tool/tab slug collided with an existing one across `NEXT_FEATURES.md`'s remaining Phase 1/2 items as those ship concurrently.
- Sweep every new page/component for the mobile-overflow issues called out in `GEMINI.md` §4E step 5 — especially D6's bottom nav and D8's sidebar changes, which touch mobile layout directly.
- Before F7/F8 ship, confirm with the user: (a) whether visible, default-facing third-party dependencies are acceptable for a platform whose core pitch is "Zero Backend, Complete Privacy," and (b) whether real Discord/Slack/Sponsors channels exist to link to.
- Re-run the accessibility hardening sweep (`NEXT_FEATURES.md`'s B11) against any new interactive components this phase adds (D3's wizard, D6's bottom nav, D8's sidebar filter) — they're exactly the kind of new interactive surface that sweep exists to catch.
