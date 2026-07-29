// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PacketCaptureOverlay } from './PacketCaptureOverlay'
import type { PacketFrame } from '../usePacketCapture'

const SAMPLE_FRAMES: PacketFrame[] = [
  { id: 'frame-0', direction: 'request', protocol: 'OAuth', summary: 'Authorization Request', raw: 'GET /authorize', timestamp: '10:00:00 AM' },
  { id: 'frame-1', direction: 'response', protocol: 'OAuth', summary: 'Authorization Response', raw: 'HTTP 302', timestamp: '10:00:01 AM' }
]

describe('PacketCaptureOverlay', () => {
  it('shows an empty-state message when no frames have been captured', () => {
    render(<PacketCaptureOverlay frames={[]} onClear={() => {}} />)
    expect(screen.getByText(/no traffic captured yet/i)).toBeInTheDocument()
  })

  it('renders one timeline block per captured frame', () => {
    render(<PacketCaptureOverlay frames={SAMPLE_FRAMES} onClear={() => {}} />)
    expect(screen.getByText(/packet capture \(2\)/i)).toBeInTheDocument()
    expect(screen.getAllByText('OAuth')).toHaveLength(2)
  })

  it('clicking a frame expands its raw-payload inspector panel', () => {
    render(<PacketCaptureOverlay frames={SAMPLE_FRAMES} onClear={() => {}} />)
    fireEvent.click(screen.getAllByText('OAuth')[0])
    expect(screen.getByText('GET /authorize')).toBeInTheDocument()
  })

  it('collapses the inspector when the same frame is clicked again', () => {
    render(<PacketCaptureOverlay frames={SAMPLE_FRAMES} onClear={() => {}} />)
    const firstFrame = screen.getAllByText('OAuth')[0]
    fireEvent.click(firstFrame)
    expect(screen.getByText('GET /authorize')).toBeInTheDocument()
    fireEvent.click(firstFrame)
    expect(screen.queryByText('GET /authorize')).not.toBeInTheDocument()
  })

  it('calls onClear when the clear button is clicked, and disables it when there are no frames', () => {
    const onClear = vi.fn()
    const { rerender } = render(<PacketCaptureOverlay frames={SAMPLE_FRAMES} onClear={onClear} />)
    fireEvent.click(screen.getByTitle(/clear captured frames/i))
    expect(onClear).toHaveBeenCalledOnce()

    rerender(<PacketCaptureOverlay frames={[]} onClear={onClear} />)
    expect(screen.getByTitle(/clear captured frames/i)).toBeDisabled()
  })
})
