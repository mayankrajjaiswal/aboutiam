export type NhiType = 'service-account' | 'api-key' | 'ci-token'
export type NhiPrivilege = 'low' | 'medium' | 'high' | 'admin'
export type NhiAction = 'rotate' | 'revoke' | 'keep'

export interface NhiRecord {
  id: string
  type: NhiType
  owner: string | null
  lastUsedDaysAgo: number
  ageDays: number
  privilege: NhiPrivilege
  hasDependents: boolean
  isOrphaned: boolean
  correctAction: NhiAction
  rationale: string
}

/** The game simulates a fleet of 500 real NHIs; only the top-risk subset renders in the DOM. */
export const TOTAL_NHI_COUNT = 500
export const SHOWN_RECORD_COUNT = 60

const TYPES: NhiType[] = ['service-account', 'api-key', 'ci-token']
const PRIVILEGES: NhiPrivilege[] = ['low', 'medium', 'high', 'admin']
const OWNERS = ['platform-team', 'billing-team', 'data-eng', 'security-team', 'growth-team', 'mobile-team']

/**
 * Deterministic seeded PRNG (mulberry32) — the dataset must be stable across
 * runs/tests, so it is generated once from a fixed seed rather than
 * `Math.random()`.
 */
function mulberry32(seed: number) {
  let state = seed
  return function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface DraftRecord {
  type: NhiType
  owner: string | null
  lastUsedDaysAgo: number
  ageDays: number
  privilege: NhiPrivilege
  hasDependents: boolean
  isOrphaned: boolean
}

function determineAction(rec: DraftRecord): { action: NhiAction; rationale: string } {
  if (rec.isOrphaned) {
    return {
      action: 'revoke',
      rationale: 'No owner of record — an orphaned credential with nobody accountable for it should be revoked.'
    }
  }
  if (rec.ageDays > 365 && rec.lastUsedDaysAgo < 30) {
    return {
      action: 'rotate',
      rationale: 'Actively used but never rotated in over a year — rotate it to limit exposure from a long-lived secret.'
    }
  }
  if (rec.lastUsedDaysAgo > 180 && !rec.hasDependents) {
    return {
      action: 'revoke',
      rationale: 'Unused for 6+ months with no dependent services relying on it — safe to revoke.'
    }
  }
  return {
    action: 'keep',
    rationale: 'Actively used, owned, and appropriately scoped for its current purpose — no action needed.'
  }
}

function buildRecord(index: number, draft: DraftRecord): NhiRecord {
  const { action, rationale } = determineAction(draft)
  return {
    id: `nhi-${String(index).padStart(3, '0')}`,
    ...draft,
    correctAction: action,
    rationale
  }
}

function generateRecords(): NhiRecord[] {
  const rng = mulberry32(20260728)
  const records: NhiRecord[] = []
  let index = 0

  // Guarantee a solid, always-solvable baseline of each triage category
  // (§0 cross-cutting rule + the doc's own "at least N of each" test spec)
  // before filling the remainder with RNG-driven mixed cases.

  // 10 orphaned accounts (no owner) — correctAction: revoke
  for (let i = 0; i < 10; i++) {
    records.push(buildRecord(index++, {
      type: TYPES[Math.floor(rng() * TYPES.length)],
      owner: null,
      lastUsedDaysAgo: Math.floor(rng() * 400),
      ageDays: 200 + Math.floor(rng() * 900),
      privilege: PRIVILEGES[Math.floor(rng() * PRIVILEGES.length)],
      hasDependents: false,
      isOrphaned: true
    }))
  }

  // 10 stale, never-rotated but still-active keys — correctAction: rotate
  for (let i = 0; i < 10; i++) {
    records.push(buildRecord(index++, {
      type: TYPES[Math.floor(rng() * TYPES.length)],
      owner: OWNERS[Math.floor(rng() * OWNERS.length)],
      lastUsedDaysAgo: Math.floor(rng() * 29),
      ageDays: 400 + Math.floor(rng() * 600),
      privilege: PRIVILEGES[Math.floor(rng() * PRIVILEGES.length)],
      hasDependents: rng() < 0.5,
      isOrphaned: false
    }))
  }

  // 10 over-privileged, long-unused accounts with no dependents — correctAction: revoke
  for (let i = 0; i < 10; i++) {
    records.push(buildRecord(index++, {
      type: TYPES[Math.floor(rng() * TYPES.length)],
      owner: OWNERS[Math.floor(rng() * OWNERS.length)],
      lastUsedDaysAgo: 181 + Math.floor(rng() * 200),
      ageDays: 100 + Math.floor(rng() * 500),
      privilege: rng() < 0.5 ? 'admin' : 'high',
      hasDependents: false,
      isOrphaned: false
    }))
  }

  // Remaining records: mixed, RNG-driven — some will legitimately be "keep"
  while (records.length < SHOWN_RECORD_COUNT) {
    const lastUsedDaysAgo = Math.floor(rng() * 400)
    const ageDays = 10 + Math.floor(rng() * 900)
    const hasDependents = rng() < 0.5
    records.push(buildRecord(index++, {
      type: TYPES[Math.floor(rng() * TYPES.length)],
      owner: OWNERS[Math.floor(rng() * OWNERS.length)],
      lastUsedDaysAgo,
      ageDays,
      privilege: PRIVILEGES[Math.floor(rng() * PRIVILEGES.length)],
      hasDependents,
      isOrphaned: false
    }))
  }

  return records
}

export const NHI_RECORDS: NhiRecord[] = generateRecords()
