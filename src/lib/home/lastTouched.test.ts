// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { touchAcademyModule, touchLabCompletion, getAcademyTouchedMap, getLabsTouchedMap } from './lastTouched'

beforeEach(() => {
  window.localStorage.clear()
})

describe('touchAcademyModule / getAcademyTouchedMap', () => {
  it('records an ISO timestamp for a touched module', () => {
    touchAcademyModule('m1.1')
    const map = getAcademyTouchedMap()
    expect(typeof map['m1.1']).toBe('string')
    expect(new Date(map['m1.1']).toString()).not.toBe('Invalid Date')
  })

  it('tracks multiple modules independently and overwrites on re-touch', () => {
    touchAcademyModule('m1.1')
    touchAcademyModule('m1.2')
    expect(Object.keys(getAcademyTouchedMap()).sort()).toEqual(['m1.1', 'm1.2'])

    touchAcademyModule('m1.1')
    expect(Object.keys(getAcademyTouchedMap())).toHaveLength(2)
  })
})

describe('touchLabCompletion / getLabsTouchedMap', () => {
  it('records an ISO timestamp for a completed lab/playground', () => {
    touchLabCompletion('role_mining_workbench')
    const map = getLabsTouchedMap()
    expect(typeof map['role_mining_workbench']).toBe('string')
  })
})

describe('empty state', () => {
  it('returns an empty map when nothing has been touched yet', () => {
    expect(getAcademyTouchedMap()).toEqual({})
    expect(getLabsTouchedMap()).toEqual({})
  })
})
