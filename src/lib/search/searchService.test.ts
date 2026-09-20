import { describe, expect, it } from 'vitest'
import { getSearchIndex } from './searchService'
import { STANDARDS } from '../../data/standardsData'
import { CASE_STUDIES, CASE_STUDY_CATEGORIES } from '../../data/caseStudiesData'
import { PROJECTS as REFERENCE_PROJECTS } from '../../data/referenceProjects'
import { ARCHITECTURES } from '../../data/architectureData'
import { CERTIFICATIONS } from '../../data/certificationsData'
import { EXPLORE_PRODUCTS, EXPLORE_TYPES } from '../../data/exploreData'
import { CVE_DATABASE, RFC_DATABASE, rfcSlug } from '../../data/researchData'
import { BULLETINS, BULLETIN_CATEGORIES } from '../../data/bulletinsData'
import { BREACHES, BREACH_CATEGORIES } from '../../data/breachesData'
import { CHEAT_SHEETS, SHEET_CATEGORIES } from '../../data/cheatSheetsData'
import { COMPARISONS, LEARNING_TRACKS, INTERVIEW_QUESTIONS } from '../../data/aiKnowledgeGraph'
import { NEXT_GEN_THEMES } from '../../data/nextGenThemes'
import { AGENTIC_QUADRANTS } from '../../data/agenticEcosystemQuadrants'
import { AGENT_THREAT_CATALOG } from '../../data/agentThreatCatalog'
import { FIDO_FORM_FACTORS } from '../../data/fidoFormFactors'
import { BUSINESS_WALLET_USE_CASES } from '../../data/businessWalletUseCases'
import { WALLET_PROGRAMMES } from '../../data/walletProgrammes'
import { CRYPTO_MIGRATION_WORKSTREAMS } from '../../data/cryptoAgilityRoadmap'
import { HSM_ROOT_OF_TRUST_CONCEPTS } from '../../data/hsmRootOfTrust'
import { ROUTE_META } from '../../routeMeta'

describe('getSearchIndex deep-link entries', () => {
  it('indexes all living standards with ?standard= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('OAuth 2.1')
    const match = results.find((r) => r.id === 'standard-oauth21')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/standards?standard=oauth21')
  })

  it('indexes every entry in standardsData.ts by id — closes the standards/search drift bug', () => {
    const index = getSearchIndex()
    STANDARDS.forEach((std) => {
      const results = index.search(std.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `standard-${std.id}`)
      expect(match, `expected "${std.title}" (${std.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string }).link).toBe(`/standards?standard=${std.id}`)
    })
  })

  it('indexes reference architectures with ?arch= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('Zero Trust')
    const match = results.find((r) => r.id === 'arch-zero_trust')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/architecture?arch=zero_trust')
  })

  it('indexes every entry in architectureData.ts by id — closes the architecture/search drift bug', () => {
    const index = getSearchIndex()
    ARCHITECTURES.forEach((arch) => {
      const results = index.search(arch.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `arch-${arch.id}`)
      expect(match, `expected "${arch.name}" (${arch.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/architecture?arch=${arch.id}`)
      expect((match as unknown as { category: string }).category).toBe('🏛️ Reference Architectures')
    })
  })

  it('covers reference architectures across all three difficulty tiers', () => {
    const difficulties = new Set(ARCHITECTURES.map((a) => a.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('gives every reference architecture a unique id', () => {
    const ids = ARCHITECTURES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every standards/architecture item a non-empty category and keywords', () => {
    const index = getSearchIndex()
    const all = [
      ...index.search('standard', { prefix: true }),
      ...index.search('architecture', { prefix: true }),
    ].filter((r) => r.id.startsWith('standard-') || r.id.startsWith('arch-'))
    expect(all.length).toBeGreaterThan(0)
  })

  it('indexes sidebar/nav pages not covered by other categories', () => {
    const index = getSearchIndex()

    const reportResult = index.search('report', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/reports')
    expect(reportResult).toBeTruthy()

    const termsResult = index.search('terms', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/terms')
    expect(termsResult).toBeTruthy()

    const assessResult = index.search('assess', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/assess')
    expect(assessResult).toBeTruthy()
  })

  it('indexes every entry in referenceProjects.ts\'s PROJECTS with a ?ref= deep link', () => {
    const index = getSearchIndex()
    REFERENCE_PROJECTS.forEach((project) => {
      const results = index.search(project.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `reference-${project.id}`)
      expect(match, `expected "${project.title}" (${project.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/references?ref=${project.id}`)
      expect((match as unknown as { category: string }).category).toBe('🗂️ Reference Implementations')
    })
  })

  it('covers reference implementations across all three levels (beginner, intermediate, advanced)', () => {
    const levels = new Set(REFERENCE_PROJECTS.map((p) => p.level))
    expect(levels.has('beginner')).toBe(true)
    expect(levels.has('intermediate')).toBe(true)
    expect(levels.has('advanced')).toBe(true)
  })

  it('gives every reference implementation a unique id', () => {
    const ids = REFERENCE_PROJECTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in caseStudiesData.ts with a ?study= deep link — closes the case-studies/search drift bug', () => {
    const index = getSearchIndex()
    CASE_STUDIES.forEach((cs) => {
      const results = index.search(cs.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `case-${cs.id}`)
      expect(match, `expected "${cs.title}" (${cs.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/case-studies?study=${cs.id}`)
      expect((match as unknown as { category: string }).category).toBe('🏢 Case Study Center')
    })
  })

  it('covers case studies across all three difficulty tiers and every category', () => {
    const difficulties = new Set(CASE_STUDIES.map((cs) => cs.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const categories = new Set(CASE_STUDIES.map((cs) => cs.category))
    CASE_STUDY_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one case study in category "${cat}"`).toBe(true)
    })
  })

  it('gives every case study a unique id', () => {
    const ids = CASE_STUDIES.map((cs) => cs.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes compliance deadlines under the deadlines category with a deep link', () => {
    const index = getSearchIndex()
    const results = index.search('DORA')
    const match = results.find((r) => r.id === 'deadline-dora-application')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string; category: string }).link).toBe('/standards?view=deadlines')
    expect((match as unknown as { category: string }).category).toBe('📅 Compliance Deadlines')
  })

  it('indexes every entry in exploreData.ts with a ?product= deep link', () => {
    const index = getSearchIndex()
    EXPLORE_PRODUCTS.forEach((p) => {
      const results = index.search(p.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `explore-${p.id}`)
      expect(match, `expected "${p.name}" (${p.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/explore?product=${p.id}`)
      expect((match as unknown as { category: string }).category).toBe('🧭 IAM Landscape Directory')
    })
  })

  it('covers IAM landscape products across all three difficulty tiers and every product type', () => {
    const difficulties = new Set(EXPLORE_PRODUCTS.map((p) => p.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const types = new Set(EXPLORE_PRODUCTS.map((p) => p.type))
    EXPLORE_TYPES.forEach((t) => {
      expect(types.has(t), `expected at least one product of type "${t}"`).toBe(true)
    })
  })

  it('gives every IAM landscape product a unique id', () => {
    const ids = EXPLORE_PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in certificationsData.ts with a ?cert= deep link — closes the certifications/search drift bug', () => {
    const index = getSearchIndex()
    CERTIFICATIONS.forEach((cert) => {
      const results = index.search(cert.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `cert-${cert.id}`)
      expect(match, `expected "${cert.title}" (${cert.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/certifications?cert=${cert.id}`)
      expect((match as unknown as { category: string }).category).toBe('🎓 Certification Hub')
    })
  })

  it('covers certifications across all three difficulty tiers', () => {
    const difficulties = new Set(CERTIFICATIONS.map((c) => c.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('gives every certification a unique id', () => {
    const ids = CERTIFICATIONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in researchData.ts\'s CVE_DATABASE with a ?cve= deep link', () => {
    const index = getSearchIndex()
    CVE_DATABASE.forEach((cve) => {
      const results = index.search(cve.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `cve-${cve.id}`)
      expect(match, `expected "${cve.title}" (${cve.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/research?cve=${cve.id}`)
      expect((match as unknown as { category: string }).category).toBe('🦠 CVE & Vulnerability Research')
    })
  })

  it('covers CVE research entries across all three difficulty tiers', () => {
    const difficulties = new Set(CVE_DATABASE.map((c) => c.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('gives every CVE entry a unique id', () => {
    const ids = CVE_DATABASE.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in researchData.ts\'s RFC_DATABASE with a ?rfc= deep link', () => {
    const index = getSearchIndex()
    RFC_DATABASE.forEach((rfc) => {
      const results = index.search(rfc.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `rfc-${rfcSlug(rfc.number)}`)
      expect(match, `expected "${rfc.title}" (${rfc.number}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/research?rfc=${rfcSlug(rfc.number)}`)
      expect((match as unknown as { category: string }).category).toBe('📡 RFC & Protocol Registry')
    })
  })

  it('covers RFC/draft registry entries across all three difficulty tiers', () => {
    const difficulties = new Set(RFC_DATABASE.map((r) => r.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)
  })

  it('gives every RFC/draft entry a unique slug id', () => {
    const ids = RFC_DATABASE.map((r) => rfcSlug(r.number))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in bulletinsData.ts with a ?bulletin= deep link — closes the bulletins/search drift bug', () => {
    const index = getSearchIndex()
    BULLETINS.forEach((b) => {
      const results = index.search(b.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `bulletin-${b.id}`)
      expect(match, `expected "${b.title}" (${b.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/bulletins?bulletin=${b.id}`)
      expect((match as unknown as { category: string }).category).toBe('🚨 Security Bulletins')
    })
  })

  it('covers security bulletins across all three difficulty tiers and every category', () => {
    const difficulties = new Set(BULLETINS.map((b) => b.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const categories = new Set(BULLETINS.map((b) => b.category))
    BULLETIN_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one bulletin in category "${cat}"`).toBe(true)
    })
  })

  it('gives every security bulletin a unique id', () => {
    const ids = BULLETINS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in breachesData.ts with a ?lab= deep link — closes the breaches/search drift bug', () => {
    const index = getSearchIndex()
    BREACHES.forEach((b) => {
      const results = index.search(b.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `breach-${b.id}`)
      expect(match, `expected "${b.title}" (${b.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/wall-of-shame?tab=breaches&lab=${b.id}`)
      expect((match as unknown as { category: string }).category).toBe('💣 Breach Museum Cases')
    })
  })

  it('covers breaches across all three difficulty tiers and every category', () => {
    const difficulties = new Set(BREACHES.map((b) => b.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const categories = new Set(BREACHES.map((b) => b.category))
    BREACH_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one breach in category "${cat}"`).toBe(true)
    })
  })

  it('gives every breach a unique id', () => {
    const ids = BREACHES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in cheatSheetsData.ts with a ?sheet= deep link — closes the cheat-sheets/search drift bug', () => {
    const index = getSearchIndex()
    CHEAT_SHEETS.forEach((s) => {
      const results = index.search(s.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `sheet-${s.id}`)
      expect(match, `expected "${s.title}" (${s.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/cheat-sheets?sheet=${s.id}`)
      expect((match as unknown as { category: string }).category).toBe('✅ Developer Playbooks & Cheat Sheets')
    })
  })

  it('covers cheat sheets across all three difficulty tiers and every category', () => {
    const difficulties = new Set(CHEAT_SHEETS.map((s) => s.difficulty))
    expect(difficulties.has('Beginner')).toBe(true)
    expect(difficulties.has('Intermediate')).toBe(true)
    expect(difficulties.has('Advanced')).toBe(true)

    const categories = new Set(CHEAT_SHEETS.map((s) => s.category))
    SHEET_CATEGORIES.forEach((cat) => {
      expect(categories.has(cat), `expected at least one cheat sheet in category "${cat}"`).toBe(true)
    })
  })

  it('gives every cheat sheet a unique id', () => {
    const ids = CHEAT_SHEETS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in aiKnowledgeGraph.ts\'s COMPARISONS with a ?tab=compare&compare= deep link', () => {
    const index = getSearchIndex()
    COMPARISONS.forEach((c) => {
      const results = index.search(c.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `assistant-compare-${c.id}`)
      expect(match, `expected "${c.title}" (${c.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/assistant?tab=compare&compare=${c.id}`)
      expect((match as unknown as { category: string }).category).toBe('🤖 AI Assistant — Comparisons')
    })
  })

  it('gives every comparison a unique id', () => {
    const ids = COMPARISONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in aiKnowledgeGraph.ts\'s LEARNING_TRACKS with a ?tab=learn deep link', () => {
    const index = getSearchIndex()
    LEARNING_TRACKS.forEach((t) => {
      const results = index.search(t.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `assistant-learn-${t.level.toLowerCase()}-${t.goal.toLowerCase().replace(/\s+/g, '-')}`)
      expect(match, `expected "${t.title}" (${t.level}/${t.goal}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(
        `/assistant?tab=learn&level=${encodeURIComponent(t.level)}&goal=${encodeURIComponent(t.goal)}`
      )
      expect((match as unknown as { category: string }).category).toBe('🧭 AI Assistant — Learning Tracks')
    })
  })

  it('gives every learning track a unique level/goal combination', () => {
    const ids = LEARNING_TRACKS.map((t) => `${t.level}-${t.goal}`)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every entry in aiKnowledgeGraph.ts\'s INTERVIEW_QUESTIONS with a ?tab=interview&q= deep link', () => {
    const index = getSearchIndex()
    INTERVIEW_QUESTIONS.forEach((q) => {
      const results = index.search(q.question, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `assistant-interview-${q.id}`)
      expect(match, `expected "${q.question}" (${q.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string; category: string }).link).toBe(`/assistant?tab=interview&q=${q.id}`)
      expect((match as unknown as { category: string }).category).toBe('🎯 AI Assistant — Interview Prep')
    })
  })

  it('gives every interview question a unique id', () => {
    const ids = INTERVIEW_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes all 15 new Next-Gen Horizon 3 & 4 playgrounds as simulators', () => {
    const index = getSearchIndex()
    const nextGenPlaygrounds = [
      'rag-authorization',
      'ai-swarm',
      'fhe-auth',
      'qkd-simulator',
      'mdl-proximity',
      'space-identity',
      'v2x-pki',
      'ebpf-tracer',
      'digital-twin',
      'bci-auth',
      'mpc-threshold',
      'zk-cross-chain',
      'sybil-orb',
      'm2m-negotiator',
      'ocular-kinetic'
    ]

    nextGenPlaygrounds.forEach((id) => {
      const results = index.search(id, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `sim-${id}`)
      expect(match, `expected next-gen simulator "${id}" to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string }).link).toBe(`/playground/${id}`)
    })
  })
})

// NextGenIAM.md §11 invariant #2: every entry in each of the 8 Next-Gen IAM
// registries indexed by searchService.ts is actually searchable by id — the
// same loop-over-all-entries pattern used above for standards/architectures,
// applied to the pillar's own data sources.
describe('getSearchIndex — Next-Gen IAM pillar registries', () => {
  it('indexes every theme in nextGenThemes.ts by id', () => {
    const index = getSearchIndex()
    NEXT_GEN_THEMES.forEach((t) => {
      const results = index.search(t.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-theme-${t.id}`)
      expect(match, `expected theme "${t.title}" (${t.id}) to be searchable`).toBeTruthy()
      expect((match as unknown as { link: string }).link).toBe(t.route)
    })
  })

  it('indexes every quadrant in agenticEcosystemQuadrants.ts by id', () => {
    const index = getSearchIndex()
    AGENTIC_QUADRANTS.forEach((q) => {
      const results = index.search(q.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-quadrant-${q.id}`)
      expect(match, `expected quadrant "${q.title}" (${q.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every threat in agentThreatCatalog.ts by id', () => {
    const index = getSearchIndex()
    AGENT_THREAT_CATALOG.forEach((t) => {
      const results = index.search(t.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-threat-${t.id}`)
      expect(match, `expected threat "${t.title}" (${t.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every form factor in fidoFormFactors.ts by id', () => {
    const index = getSearchIndex()
    FIDO_FORM_FACTORS.forEach((f) => {
      const results = index.search(f.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-formfactor-${f.id}`)
      expect(match, `expected form factor "${f.name}" (${f.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every use case in businessWalletUseCases.ts by id', () => {
    const index = getSearchIndex()
    BUSINESS_WALLET_USE_CASES.forEach((u) => {
      const results = index.search(u.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-wallet-usecase-${u.id}`)
      expect(match, `expected use case "${u.title}" (${u.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every programme in walletProgrammes.ts by id', () => {
    const index = getSearchIndex()
    WALLET_PROGRAMMES.forEach((p) => {
      const results = index.search(p.name, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-wallet-programme-${p.id}`)
      expect(match, `expected programme "${p.name}" (${p.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every workstream in cryptoAgilityRoadmap.ts by id', () => {
    const index = getSearchIndex()
    CRYPTO_MIGRATION_WORKSTREAMS.forEach((w) => {
      const results = index.search(w.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-crypto-workstream-${w.id}`)
      expect(match, `expected workstream "${w.title}" (${w.id}) to be searchable`).toBeTruthy()
    })
  })

  it('indexes every concept in hsmRootOfTrust.ts by id', () => {
    const index = getSearchIndex()
    HSM_ROOT_OF_TRUST_CONCEPTS.forEach((c) => {
      const results = index.search(c.title, { prefix: true, fuzzy: 0.2 })
      const match = results.find((r) => r.id === `nextgen-rot-${c.id}`)
      expect(match, `expected concept "${c.title}" (${c.id}) to be searchable`).toBeTruthy()
    })
  })
})

// NextGenIAM.md §11 invariant #1: every relatedLabs/relatedTools/route
// reference in every Next-Gen IAM registry resolves to a real, live path in
// ROUTE_META. All 22 pillar routes shipped by the end of P8 (NextGenIAM.md
// Appendix A), so this asserts directly against ROUTE_META with no
// "planned but not yet wired" allowlist -- a stale cross-link is now a real
// dead link, not a forward reference to a future phase.
describe('Next-Gen IAM registries — cross-link resolution against ROUTE_META', () => {
  function assertResolvable(paths: string[], sourceLabel: string) {
    const liveRoutes = new Set(ROUTE_META.map((r) => r.path))
    for (const path of paths) {
      expect(liveRoutes.has(path), `${sourceLabel}: "${path}" is not a live route in ROUTE_META`).toBe(true)
    }
  }

  it('every nextGenThemes.ts relatedLabs/relatedTools path resolves', () => {
    NEXT_GEN_THEMES.forEach((t) => assertResolvable([...t.relatedLabs, ...t.relatedTools], `theme ${t.id}`))
  })

  it('every agenticEcosystemQuadrants.ts relatedLabs path resolves', () => {
    AGENTIC_QUADRANTS.forEach((q) => assertResolvable(q.relatedLabs, `quadrant ${q.id}`))
  })

  it('every agentThreatCatalog.ts relatedLabs path resolves', () => {
    AGENT_THREAT_CATALOG.forEach((t) => assertResolvable(t.relatedLabs, `threat ${t.id}`))
  })

  it('every businessWalletUseCases.ts relatedLabs path resolves', () => {
    BUSINESS_WALLET_USE_CASES.forEach((u) => assertResolvable(u.relatedLabs, `use case ${u.id}`))
  })
})
