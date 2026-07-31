import { describe, it, expect } from 'vitest'
import { WALLET_ADOPTION_TRACKER, getWalletAdoptionEntry, type MdlStatus } from './walletAdoptionTracker'

const VALID_STATUSES: MdlStatus[] = ['live', 'pilot', 'paused', 'none']

describe('WALLET_ADOPTION_TRACKER', () => {
  it('every entry has a valid mdlStatus enum value', () => {
    for (const entry of WALLET_ADOPTION_TRACKER) {
      expect(VALID_STATUSES).toContain(entry.mdlStatus)
    }
  })

  it('every entry has a non-empty sourceLink and verifiedDate', () => {
    for (const entry of WALLET_ADOPTION_TRACKER) {
      expect(entry.sourceLink).toMatch(/^https?:\/\//)
      expect(entry.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('has no duplicate states', () => {
    const states = WALLET_ADOPTION_TRACKER.map((e) => e.state)
    expect(new Set(states).size).toBe(states.length)
  })

  it('a "none" status entry has no walletSupport and is not TSA-accepted', () => {
    for (const entry of WALLET_ADOPTION_TRACKER.filter((e) => e.mdlStatus === 'none')) {
      expect(entry.walletSupport).toEqual([])
      expect(entry.tsaAccepted).toBe(false)
    }
  })
})

describe('getWalletAdoptionEntry', () => {
  it('finds a known state', () => {
    expect(getWalletAdoptionEntry('Arizona')?.mdlStatus).toBe('live')
  })

  it('returns undefined for an unknown state', () => {
    expect(getWalletAdoptionEntry('Atlantis')).toBeUndefined()
  })
})
