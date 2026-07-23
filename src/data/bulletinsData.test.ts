import { describe, expect, it } from 'vitest'
import { BULLETINS, BULLETIN_CATEGORIES, CONTROL_TITLES } from './bulletinsData'

describe('bulletinsData', () => {
  it('maps every controlsMapped id to a known control title', () => {
    BULLETINS.forEach((b) => {
      b.controlsMapped.forEach((controlId) => {
        expect(CONTROL_TITLES[controlId], `unknown control id "${controlId}" on bulletin "${b.id}"`).toBeTruthy()
      })
    })
  })

  it('gives every bulletin a non-empty, bulletin-specific simulator script', () => {
    BULLETINS.forEach((b) => {
      expect(b.simulator.step1Log.length, `empty step1Log on "${b.id}"`).toBeGreaterThan(0)
      expect(b.simulator.step2Log.length, `empty step2Log on "${b.id}"`).toBeGreaterThan(0)
      expect(b.simulator.containmentHighLog.length, `empty containmentHighLog on "${b.id}"`).toBeGreaterThan(0)
      expect(b.simulator.containmentLowLog.length, `empty containmentLowLog on "${b.id}"`).toBeGreaterThan(0)
    })
  })

  it('only uses category values declared in BULLETIN_CATEGORIES', () => {
    BULLETINS.forEach((b) => {
      expect(BULLETIN_CATEGORIES as readonly string[], `unexpected category "${b.category}" on bulletin "${b.id}"`).toContain(b.category)
    })
  })

  it('gives every bulletin a unique id', () => {
    const ids = BULLETINS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
