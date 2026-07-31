import { describe, it, expect } from 'vitest'
import { validateRaciMatrix, isRaciMatrixValid, type RaciMatrix } from './raciValidation'

describe('validateRaciMatrix', () => {
  it('fails with a clear message when an activity has zero Accountable owners', () => {
    const matrix: RaciMatrix = { 'act-1': { Alice: ['R'] } }
    const issues = validateRaciMatrix(['act-1'], matrix)
    expect(issues).toContainEqual(expect.objectContaining({ activityId: 'act-1', severity: 'error', message: expect.stringContaining('No Accountable') }))
  })

  it('fails with a clear message when an activity has multiple Accountable owners', () => {
    const matrix: RaciMatrix = { 'act-1': { Alice: ['A'], Bob: ['A'], Carol: ['R'] } }
    const issues = validateRaciMatrix(['act-1'], matrix)
    expect(issues).toContainEqual(expect.objectContaining({ activityId: 'act-1', severity: 'error', message: expect.stringContaining('Multiple Accountable') }))
  })

  it('fails when an activity has zero Responsible parties', () => {
    const matrix: RaciMatrix = { 'act-1': { Alice: ['A'] } }
    const issues = validateRaciMatrix(['act-1'], matrix)
    expect(issues).toContainEqual(expect.objectContaining({ activityId: 'act-1', severity: 'error', message: expect.stringContaining('No Responsible') }))
  })

  it('passes a well-formed matrix with no issues', () => {
    const matrix: RaciMatrix = {
      'act-1': { Alice: ['A'], Bob: ['R'], Carol: ['C'] },
      'act-2': { Alice: ['R'], Bob: ['A'] },
    }
    expect(validateRaciMatrix(['act-1', 'act-2'], matrix)).toEqual([])
    expect(isRaciMatrixValid(['act-1', 'act-2'], matrix)).toBe(true)
  })

  it('warns when the same person is both Responsible and Accountable on the same activity, across >= threshold activities', () => {
    const matrix: RaciMatrix = {
      'act-1': { Alice: ['R', 'A'], Bob: ['C'] },
      'act-2': { Alice: ['R', 'A'] },
      'act-3': { Alice: ['R', 'A'] },
    }
    const issues = validateRaciMatrix(['act-1', 'act-2', 'act-3'], matrix)
    expect(issues).toContainEqual(expect.objectContaining({ severity: 'warning', message: expect.stringContaining('Alice') }))
    // Still structurally valid (every activity has exactly one A and at least one R) despite the smell warning
    expect(isRaciMatrixValid(['act-1', 'act-2', 'act-3'], matrix)).toBe(true)
  })

  it('does not warn when the dual-role count is below the threshold', () => {
    const matrix: RaciMatrix = {
      'act-1': { Alice: ['R', 'A'] },
      'act-2': { Alice: ['R', 'A'] },
    }
    const issues = validateRaciMatrix(['act-1', 'act-2'], matrix)
    expect(issues.filter((i) => i.severity === 'warning')).toEqual([])
  })

  it('a missing activity entry in the matrix is treated as fully unassigned (both errors fire)', () => {
    const issues = validateRaciMatrix(['act-missing'], {})
    expect(issues).toHaveLength(2)
    expect(issues.every((i) => i.severity === 'error')).toBe(true)
  })
})
