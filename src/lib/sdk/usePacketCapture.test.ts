// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePacketCapture } from './usePacketCapture'

describe('usePacketCapture', () => {
  it('appends captured frames in order', () => {
    const { result } = renderHook(() => usePacketCapture())
    act(() => {
      result.current.capture({ direction: 'request', protocol: 'OAuth', summary: 'Authorization Request', raw: 'GET /authorize' })
      result.current.capture({ direction: 'response', protocol: 'OAuth', summary: 'Authorization Response', raw: 'HTTP 302' })
    })

    expect(result.current.frames).toHaveLength(2)
    expect(result.current.frames[0].summary).toBe('Authorization Request')
    expect(result.current.frames[1].summary).toBe('Authorization Response')
  })

  it('maps direction styling data correctly for request, response, and error frames', () => {
    const { result } = renderHook(() => usePacketCapture())
    act(() => {
      result.current.capture({ direction: 'request', protocol: 'SAML', summary: 'AuthnRequest', raw: '<AuthnRequest/>' })
      result.current.capture({ direction: 'response', protocol: 'SAML', summary: 'Response', raw: '<Response/>' })
      result.current.capture({ direction: 'error', protocol: 'SAML', summary: 'Signature invalid', raw: 'error' })
    })

    expect(result.current.frames.map((f) => f.direction)).toEqual(['request', 'response', 'error'])
  })

  it('assigns a unique id and a timestamp to every frame', () => {
    const { result } = renderHook(() => usePacketCapture())
    act(() => {
      result.current.capture({ direction: 'request', protocol: 'SCIM', summary: 'POST /Users', raw: '{}' })
      result.current.capture({ direction: 'response', protocol: 'SCIM', summary: '201 Created', raw: '{}' })
    })

    const ids = result.current.frames.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const frame of result.current.frames) {
      expect(frame.timestamp.length).toBeGreaterThan(0)
    }
  })

  it('caps the buffer at 50 frames, dropping the oldest first', () => {
    const { result } = renderHook(() => usePacketCapture())
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.capture({ direction: 'request', protocol: 'Test', summary: `frame-${i}`, raw: '' })
      }
    })

    expect(result.current.frames).toHaveLength(50)
    // The first 10 frames (0-9) should have been dropped; frame-10 should now be oldest.
    expect(result.current.frames[0].summary).toBe('frame-10')
    expect(result.current.frames[49].summary).toBe('frame-59')
  })

  it('clearFrames empties the buffer', () => {
    const { result } = renderHook(() => usePacketCapture())
    act(() => {
      result.current.capture({ direction: 'request', protocol: 'Test', summary: 'x', raw: '' })
    })
    expect(result.current.frames).toHaveLength(1)

    act(() => {
      result.current.clearFrames()
    })
    expect(result.current.frames).toHaveLength(0)
  })
})
