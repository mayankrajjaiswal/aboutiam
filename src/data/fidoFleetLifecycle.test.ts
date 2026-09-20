import { describe, expect, it } from 'vitest'
import { FIDO_FLEET_LIFECYCLE, getStageById } from './fidoFleetLifecycle'

describe('fidoFleetLifecycle data integrity', () => {
  it('has exactly 8 stages with order 1-8 contiguous and in sequence', () => {
    expect(FIDO_FLEET_LIFECYCLE).toHaveLength(8)
    expect(FIDO_FLEET_LIFECYCLE.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('has no duplicate ids', () => {
    const ids = FIDO_FLEET_LIFECYCLE.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every stage has activities, whatGoesWrong, controls, kpis, and stakeholders', () => {
    for (const s of FIDO_FLEET_LIFECYCLE) {
      expect(s.activities.length).toBeGreaterThan(0)
      expect(s.whatGoesWrong.length).toBeGreaterThan(0)
      expect(s.controls.length).toBeGreaterThan(0)
      expect(s.kpis.length).toBeGreaterThan(0)
      expect(s.stakeholders.length).toBeGreaterThan(0)
    }
  })

  it('every kpi has a name and a definition', () => {
    for (const s of FIDO_FLEET_LIFECYCLE) {
      for (const kpi of s.kpis) {
        expect(kpi.name.length).toBeGreaterThan(3)
        expect(kpi.definition.length).toBeGreaterThan(10)
      }
    }
  })

  it('every stage has a non-empty objective', () => {
    for (const s of FIDO_FLEET_LIFECYCLE) {
      expect(s.objective.length).toBeGreaterThan(20)
    }
  })

  it('stage order matches the standard fleet-ops narrative starting with procure and ending with recycle', () => {
    expect(FIDO_FLEET_LIFECYCLE[0].id).toBe('procure')
    expect(FIDO_FLEET_LIFECYCLE[FIDO_FLEET_LIFECYCLE.length - 1].id).toBe('recycle')
  })
})

describe('getStageById', () => {
  it('returns the matching stage', () => {
    expect(getStageById('enrol')?.order).toBe(4)
  })
})
