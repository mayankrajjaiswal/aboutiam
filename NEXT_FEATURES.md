# AboutIAM — Phase 2 Feature Roadmap (One-Stop IAM Platform Expansion)

This is the sibling document to `NEXT_FEATURES.md` (Phase 1's 12 approved features). Phase 2 pushes AboutIAM further toward being **the one-stop place for IAM** — filling gaps in emerging standards, program-management/career tooling, and engagement formats that Phase 1 doesn't touch.

**Shared conventions:** Every rule in `NEXT_FEATURES.md` §0 ("Cross-Cutting Rules") applies here verbatim — the 7-step new-page checklist (App.tsx / routeMeta.ts / postbuild-ssg.mjs / Sidebar.tsx / sitemap.xml / llms.txt / searchService.ts), the registry+colocated-test pattern for new data arrays, `usePlayground`/`PlaygroundShell`/`TraceTerminal` SDK reuse for simulators, and the README.md/GEMINI.md doc-update obligation per feature. Do not duplicate those rules here — refer back to `NEXT_FEATURES.md` §0 before starting any feature below.

**Convention for this doc:** same as Phase 1 — work top-to-bottom, delete a feature's section once shipped, fold its final description into `README.md`/`GEMINI.md`.

---

## Group A — Emerging Standards & Cryptography

### A10 (stretch, deprioritized). Avatar & Spatial Identity Verification Lab

**One-liner:** Simulates age/identity assurance inside a headset-only VR/AR context — no front-facing camera, often a shared device — contrasting behavioral/gesture telemetry-based continuous authentication against wallet-based cryptographic age attestation.

**Why deprioritized:** Real, researched gap (existing biometric/liveness approaches genuinely don't map to headset-only contexts), but speculative resonance with the current audience compared to the rest of Group A. Keep as a documented stretch goal — only start after A1-A9 ship and if there's appetite for more spatial-computing content.

**Feasibility:** Medium-Hard.

---

## Group C — Engagement, Accessibility & Format Innovation

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

A9, C2, B8, the B6/B5/B9 trio, C1, B10, B1, B2, B7, A1, A2, B3, B4, A4, A7, A8, A5, A3, A6, C3, and an initial B11 pass have all shipped. All of Group A and Group B are done. C3 shipped with a lightweight custom terminal component instead of `xterm.js` (a scope decision consistent with this codebase's established preference for small dependency-free UI primitives over heavy libraries — see `GEMINI.md` §4HH). B11's three phases (opt-in `jest-axe` matcher, a manual sweep of the newest Phase 2 playgrounds, and the `GEMINI.md`/`README.md` documentation) are done as an initial installment — per its own "ongoing hardening initiative, not a single PR" framing, extending the sweep to more of the site's 30+ pre-existing interactive components remains open for a future pass, but is not blocking Phase 2 completion.

Everything remaining is explicitly out of scope for this pass:

- **A10** — Avatar & Spatial Identity Lab (stretch, only if there's appetite after everything else).
- **C4** — Local AI Assistant Upgrade (highest engineering risk — dedicated spike first, own timeline — out of scope for this pass).
- **C5** — AboutIAM Inspector Browser Extension (separate project — own go/no-go decision, sequence last — out of scope for this pass).

## Final Wrap-Up (after Phase 2 ships) — DONE

- ✅ `npm run test` — 153 test files, 1111 tests, all passing. `npm run lint` — zero warnings/errors.
- ✅ `routeRegistrySync.test.ts` (11 tests) and `searchService.test.ts` (part of the 47-test file) both re-verified passing standalone.
- ✅ No route-slug or tool-slug collisions found across every Phase 2 addition (`App.tsx` paths and `toolsRegistry.ts` slugs both checked for duplicates — none).
- ✅ Mobile-overflow sweep at a 375px viewport across the new Phase 2 pages found zero overflow on all of them. It also caught one **pre-existing** bug on `/career-center` (not introduced by Phase 2, but on the same page C3's terminal was piloted into): the section tab bar's `overflow-x-auto` container had no `min-w-0` on its flex/grid ancestor, so instead of scrolling internally it forced the whole page 935px wide. Fixed by adding `min-w-0` to the `lg:col-span-3` wrapper — the classic CSS Grid/Flexbox "min-width: auto" trap.
- Considered Sidebar/Guided Tour rebalancing per this section's own note (ecosystem: 17 items, architecture: 19 items after Phase 2) — genuinely grown, but not yet at a point that demands a sub-grouping pass. Left untouched per the note's own "not now" framing; worth revisiting if more pages are added to either group.
