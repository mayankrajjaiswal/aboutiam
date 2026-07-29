import { useCallback, useState } from 'react'

export type PacketDirection = 'request' | 'response' | 'error'

export interface PacketFrame {
  id: string
  direction: PacketDirection
  protocol: string
  summary: string
  raw: string
  timestamp: string
}

export type CapturedFrame = Omit<PacketFrame, 'id' | 'timestamp'>

/** Caps the in-memory buffer so a long playground session can't grow it unbounded. */
const MAX_FRAMES = 50

/**
 * Shared instrumentation hook for the optional Packet Capture Overlay
 * (`PlaygroundShell`'s `packetCapture` prop). A playground calls `capture()`
 * at its existing trace-log points — no new logic, just an additional call
 * alongside `log(...)` — and passes the returned `frames` to `PlaygroundShell`.
 */
export function usePacketCapture() {
  const [frames, setFrames] = useState<PacketFrame[]>([])

  const capture = useCallback((frame: CapturedFrame) => {
    setFrames((prev) => {
      const next = [...prev, { ...frame, id: `frame-${prev.length}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]
      return next.length > MAX_FRAMES ? next.slice(next.length - MAX_FRAMES) : next
    })
  }, [])

  const clearFrames = useCallback(() => setFrames([]), [])

  return { frames, capture, clearFrames }
}
