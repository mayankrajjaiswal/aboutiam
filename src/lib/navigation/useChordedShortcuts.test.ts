// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as ReactRouter from 'react-router-dom'
import { useChordedShortcuts } from './useChordedShortcuts'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>()
  return { ...actual, useNavigate: () => navigateMock }
})

const TEST_CHORDS = [
  { chord: 'g h', label: 'Home', path: '/' },
  { chord: 'g l', label: 'Academy', path: '/learn' },
]

function fireKey(key: string, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
}

beforeEach(() => {
  vi.useFakeTimers()
  navigateMock.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useChordedShortcuts', () => {
  it('navigates on a valid "g h" chord within the timeout window', () => {
    renderHook(() => useChordedShortcuts(TEST_CHORDS))
    fireKey('g')
    fireKey('h')
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('does nothing for an unmapped second key', () => {
    renderHook(() => useChordedShortcuts(TEST_CHORDS))
    fireKey('g')
    fireKey('z')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('does nothing when a text input is focused', () => {
    renderHook(() => useChordedShortcuts(TEST_CHORDS))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireKey('g', input)
    fireKey('h', input)
    expect(navigateMock).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('resets the chord state after the timeout so a stray "g" does not linger and misfire later', () => {
    renderHook(() => useChordedShortcuts(TEST_CHORDS))
    fireKey('g')
    act(() => {
      vi.advanceTimersByTime(900)
    })
    fireKey('h')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('toggles the shortcuts overlay open/closed on "?"', () => {
    const { result } = renderHook(() => useChordedShortcuts(TEST_CHORDS))
    expect(result.current.isOverlayOpen).toBe(false)

    act(() => fireKey('?'))
    expect(result.current.isOverlayOpen).toBe(true)

    act(() => result.current.closeOverlay())
    expect(result.current.isOverlayOpen).toBe(false)
  })
})
