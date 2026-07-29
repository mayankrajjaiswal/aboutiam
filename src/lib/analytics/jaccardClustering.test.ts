import { describe, it, expect } from 'vitest'
import { jaccardSimilarity, proposeRoleCandidates, computeOrphanEntitlements, type UserEntitlements } from './jaccardClustering'

describe('jaccardSimilarity', () => {
  it('is 1 for identical sets', () => {
    expect(jaccardSimilarity(['a', 'b'], ['a', 'b'])).toBe(1)
  })

  it('is 0 for disjoint sets', () => {
    expect(jaccardSimilarity(['a', 'b'], ['c', 'd'])).toBe(0)
  })

  it('is 0 for two empty sets', () => {
    expect(jaccardSimilarity([], [])).toBe(0)
  })

  it('computes the correct ratio for partial overlap', () => {
    // intersection {a,b} = 2, union {a,b,c,d} = 4 -> 0.5
    expect(jaccardSimilarity(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(0.5)
  })
})

describe('proposeRoleCandidates', () => {
  const FIXTURE: UserEntitlements[] = [
    { userId: 'u1', entitlements: ['a', 'b', 'c'] },
    { userId: 'u2', entitlements: ['a', 'b', 'c'] },
    { userId: 'u3', entitlements: ['a', 'b', 'c'] },
    { userId: 'u4', entitlements: ['x', 'y'] },
    { userId: 'u5', entitlements: ['z'] },
  ]

  it('clusters identical-entitlement users into one role candidate', () => {
    const candidates = proposeRoleCandidates(FIXTURE, 0.6)
    const bigCluster = candidates.find((c) => c.memberUserIds.length === 3)
    expect(bigCluster).toBeDefined()
    expect(bigCluster!.memberUserIds).toEqual(['u1', 'u2', 'u3'])
    expect(bigCluster!.commonEntitlements).toEqual(['a', 'b', 'c'])
  })

  it('never proposes a singleton as a role candidate', () => {
    const candidates = proposeRoleCandidates(FIXTURE, 0.6)
    for (const c of candidates) {
      expect(c.memberUserIds.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('does not cluster users below the similarity threshold', () => {
    const candidates = proposeRoleCandidates(FIXTURE, 0.6)
    const involvesU4OrU5 = candidates.some((c) => c.memberUserIds.includes('u4') || c.memberUserIds.includes('u5'))
    expect(involvesU4OrU5).toBe(false)
  })

  it('a known small fixture produces exactly the expected clusters at threshold 0.6', () => {
    const candidates = proposeRoleCandidates(FIXTURE, 0.6)
    expect(candidates.length).toBe(1)
  })

  it('a higher threshold can reduce the number of clustered candidates', () => {
    const partialOverlap: UserEntitlements[] = [
      { userId: 'u1', entitlements: ['a', 'b', 'c', 'd'] },
      { userId: 'u2', entitlements: ['a', 'b'] },
    ]
    const loose = proposeRoleCandidates(partialOverlap, 0.3)
    const strict = proposeRoleCandidates(partialOverlap, 0.9)
    expect(loose.length).toBeGreaterThanOrEqual(strict.length)
  })

  it('sorts candidates by cluster size descending', () => {
    const mixed: UserEntitlements[] = [
      { userId: 'a1', entitlements: ['p', 'q'] },
      { userId: 'a2', entitlements: ['p', 'q'] },
      { userId: 'b1', entitlements: ['r', 's'] },
      { userId: 'b2', entitlements: ['r', 's'] },
      { userId: 'b3', entitlements: ['r', 's'] },
    ]
    const candidates = proposeRoleCandidates(mixed, 0.9)
    expect(candidates[0].memberUserIds.length).toBeGreaterThanOrEqual(candidates[1]?.memberUserIds.length ?? 0)
  })

  it('handles an empty user list without throwing', () => {
    expect(proposeRoleCandidates([], 0.6)).toEqual([])
  })
})

describe('computeOrphanEntitlements', () => {
  it('returns entitlements not covered by any accepted role', () => {
    const users: UserEntitlements[] = [
      { userId: 'u1', entitlements: ['a', 'b'] },
      { userId: 'u2', entitlements: ['a', 'b'] },
      { userId: 'u3', entitlements: ['orphan-only'] },
    ]
    const candidates = proposeRoleCandidates(users, 0.6)
    const orphans = computeOrphanEntitlements(users, candidates)
    expect(orphans).toContain('orphan-only')
    expect(orphans).not.toContain('a')
  })

  it('returns every entitlement when no roles are accepted', () => {
    const users: UserEntitlements[] = [{ userId: 'u1', entitlements: ['a', 'b'] }]
    expect(computeOrphanEntitlements(users, [])).toEqual(['a', 'b'])
  })

  it('returns an empty array when every entitlement is covered', () => {
    const users: UserEntitlements[] = [
      { userId: 'u1', entitlements: ['a'] },
      { userId: 'u2', entitlements: ['a'] },
    ]
    const candidates = proposeRoleCandidates(users, 0.6)
    expect(computeOrphanEntitlements(users, candidates)).toEqual([])
  })
})
