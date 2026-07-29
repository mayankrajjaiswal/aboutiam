import { describe, it, expect } from 'vitest'
import { ROLE_MINING_DATASET, ALL_ENTITLEMENTS } from './roleMiningDataset'
import { proposeRoleCandidates } from '../lib/analytics/jaccardClustering'

describe('ROLE_MINING_DATASET', () => {
  it('has unique user ids', () => {
    const ids = ROLE_MINING_DATASET.map((u) => u.userId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has roughly 30 users (a realistic role-mining sample size)', () => {
    expect(ROLE_MINING_DATASET.length).toBeGreaterThanOrEqual(25)
    expect(ROLE_MINING_DATASET.length).toBeLessThanOrEqual(35)
  })

  it('every entitlement referenced by a user exists in ALL_ENTITLEMENTS', () => {
    const validSet = new Set(ALL_ENTITLEMENTS)
    for (const user of ROLE_MINING_DATASET) {
      for (const ent of user.entitlements) {
        expect(validSet.has(ent)).toBe(true)
      }
    }
  })

  it('every user has at least one entitlement', () => {
    for (const user of ROLE_MINING_DATASET) {
      expect(user.entitlements.length).toBeGreaterThan(0)
    }
  })

  it('produces at least 3 genuine multi-member role candidates at a reasonable threshold', () => {
    const candidates = proposeRoleCandidates(ROLE_MINING_DATASET, 0.6)
    expect(candidates.length).toBeGreaterThanOrEqual(3)
  })

  it('produces at least one orphan/noise user not clustered into any role at threshold 0.6', () => {
    const candidates = proposeRoleCandidates(ROLE_MINING_DATASET, 0.6)
    const clusteredIds = new Set(candidates.flatMap((c) => c.memberUserIds))
    const unclustered = ROLE_MINING_DATASET.filter((u) => !clusteredIds.has(u.userId))
    expect(unclustered.length).toBeGreaterThan(0)
  })
})
