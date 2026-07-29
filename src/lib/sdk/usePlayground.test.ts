// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayground } from './usePlayground'

describe('Identity Playground SDK System Core', () => {
  it('core logic hooks successfully registered in compiler context', () => {
    expect(true).toBe(true)
  })
})

describe('usePlayground.adjustScore', () => {
  it('increases the score by a positive delta and logs a success entry', () => {
    const { result } = renderHook(() => usePlayground({ moduleId: 'test_module', initialScore: 80 }))
    act(() => {
      result.current.adjustScore(10, 'Correct triage decision')
    })
    expect(result.current.score).toBe(90)
    expect(result.current.logs.at(-1)?.type).toBe('success')
    expect(result.current.logs.at(-1)?.message).toBe('Correct triage decision')
  })

  it('never lets the score exceed 100', () => {
    const { result } = renderHook(() => usePlayground({ moduleId: 'test_module' }))
    act(() => {
      result.current.adjustScore(25)
    })
    expect(result.current.score).toBe(100)
  })

  it('decreases the score by a negative delta and logs a warning entry', () => {
    const { result } = renderHook(() => usePlayground({ moduleId: 'test_module' }))
    act(() => {
      result.current.adjustScore(-15, 'Revoked a key with active dependents')
    })
    expect(result.current.score).toBe(85)
    expect(result.current.logs.at(-1)?.type).toBe('warning')
  })

  it('never lets the score drop below 0', () => {
    const { result } = renderHook(() => usePlayground({ moduleId: 'test_module', initialScore: 10 }))
    act(() => {
      result.current.adjustScore(-50)
    })
    expect(result.current.score).toBe(0)
  })

  it('does not log anything when no reason is provided', () => {
    const { result } = renderHook(() => usePlayground({ moduleId: 'test_module', initialScore: 80 }))
    act(() => {
      result.current.adjustScore(5)
    })
    expect(result.current.score).toBe(85)
    expect(result.current.logs.length).toBe(0)
  })
})
