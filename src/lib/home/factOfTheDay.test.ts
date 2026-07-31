import { describe, it, expect } from 'vitest'
import { getFactOfTheDay, buildFactPool } from './factOfTheDay'

describe('buildFactPool', () => {
  it('returns a non-empty pool combining trivia facts and encyclopedia analogies', () => {
    const pool = buildFactPool()
    expect(pool.length).toBeGreaterThan(8)
    expect(pool.every((f) => f.id && f.label && f.text)).toBe(true)
  })
})

describe('getFactOfTheDay', () => {
  it('returns the same fact for the same date (determinism)', () => {
    const a = getFactOfTheDay('2026-07-31')
    const b = getFactOfTheDay('2026-07-31')
    expect(a.id).toBe(b.id)
  })

  it('works against a small custom pool without throwing', () => {
    const tinyPool = buildFactPool().slice(0, 2)
    const fact = getFactOfTheDay('2026-07-31', tinyPool)
    expect(tinyPool.map((f) => f.id)).toContain(fact.id)
  })

  it('cycles through a full custom pool without an early repeat within one window', () => {
    const pool = buildFactPool().slice(0, 30)
    const seen = new Set<string>()
    const startDate = new Date('2026-01-01T00:00:00Z')
    for (let i = 0; i < pool.length; i++) {
      const d = new Date(startDate.getTime() + i * 86400000)
      const dateString = d.toISOString().slice(0, 10)
      seen.add(getFactOfTheDay(dateString, pool).id)
    }
    expect(seen.size).toBe(pool.length)
  })

  it('every encyclopedia-sourced fact links to a resolvable term deep link', () => {
    const pool = buildFactPool()
    const encyclopediaFacts = pool.filter((f) => f.link)
    expect(encyclopediaFacts.length).toBeGreaterThan(0)
    for (const f of encyclopediaFacts) {
      expect(f.link).toMatch(/^\/encyclopedia\?term=.+$/)
    }
  })
})
