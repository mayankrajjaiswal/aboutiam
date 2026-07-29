import { useState } from 'react'
import { ArrowRight, ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react'
import type { PacketFrame } from '../usePacketCapture'

const DIRECTION_STYLES: Record<PacketFrame['direction'], { badge: string; icon: typeof ArrowRight }> = {
  request: { badge: 'bg-accent-primary/15 border-accent-primary/40 text-accent-primary', icon: ArrowRight },
  response: { badge: 'bg-accent-secondary/15 border-accent-secondary/40 text-accent-secondary', icon: ArrowLeft },
  error: { badge: 'bg-status-danger/15 border-status-danger/40 text-status-danger', icon: AlertTriangle }
}

export interface PacketCaptureOverlayProps {
  frames: PacketFrame[]
  onClear: () => void
}

/** Wireshark-style packet timeline for a playground's own mock request/response traffic (§4-lettered "How to Add" doc explains the opt-in). */
export function PacketCaptureOverlay({ frames, onClear }: PacketCaptureOverlayProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedFrame = frames.find((f) => f.id === expandedId) ?? null

  return (
    <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Packet Capture ({frames.length})</span>
        <button
          onClick={onClear}
          disabled={frames.length === 0}
          className="text-text-muted hover:text-status-danger disabled:opacity-30 transition-colors"
          title="Clear captured frames"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {frames.length === 0 ? (
        <p className="text-[11px] text-text-muted italic">No traffic captured yet — run the flow above to see frames appear here.</p>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {frames.map((frame) => {
            const { badge, icon: DirectionIcon } = DIRECTION_STYLES[frame.direction]
            return (
              <button
                key={frame.id}
                onClick={() => setExpandedId(frame.id === expandedId ? null : frame.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${badge} ${
                  expandedId === frame.id ? 'ring-2 ring-accent-primary/40' : ''
                }`}
                title={frame.summary}
              >
                <DirectionIcon className="w-3 h-3" />
                {frame.protocol}
              </button>
            )
          })}
        </div>
      )}

      {expandedFrame && (
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-text-secondary">
            [{expandedFrame.timestamp}] {expandedFrame.protocol} — {expandedFrame.summary}
          </div>
          <pre className="text-[10px] font-mono text-text-primary bg-bg-nested p-3 rounded border border-border-subtle/50 max-h-40 overflow-y-auto break-all whitespace-pre-wrap">
            {expandedFrame.raw}
          </pre>
        </div>
      )}
    </div>
  )
}
