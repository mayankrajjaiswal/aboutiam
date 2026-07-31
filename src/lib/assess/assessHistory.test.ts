// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { saveLastAssessment, getLastAssessment } from './assessHistory'

describe('assessHistory', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns null when no assessment has been saved yet', () => {
    expect(getLastAssessment()).toBeNull()
  })

  it('round-trips a saved assessment', () => {
    saveLastAssessment({ 0: 1, 1: 3, 2: 5 })
    expect(getLastAssessment()).toEqual({ 0: 1, 1: 3, 2: 5 })
  })

  it('returns null for corrupted JSON instead of throwing', () => {
    window.localStorage.setItem('aboutiam-last-assessment', 'not json')
    expect(getLastAssessment()).toBeNull()
  })

  it('a later save overwrites the earlier one', () => {
    saveLastAssessment({ 0: 1 })
    saveLastAssessment({ 0: 5, 1: 5 })
    expect(getLastAssessment()).toEqual({ 0: 5, 1: 5 })
  })
})
