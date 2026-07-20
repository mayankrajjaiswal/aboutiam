import { useRef, useEffect } from 'react'
import { ShieldCheck, WifiOff, Clock, AlertTriangle, Info } from 'lucide-react'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'

interface AirplaneSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export default function AirplaneSelector({ isOpen, onClose }: AirplaneSelectorProps) {
  const { 
    isEnabled, 
    setEnabled, 
    simulateLatency, 
    setLatency, 
    simulatePacketLoss, 
    setPacketLoss 
  } = useAirplaneModeStore()
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to dismiss the dropdown panel
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getLatencyLabel = (ms: number) => {
    if (ms === 0) return 'Instant (Local)'
    if (ms <= 200) return '150ms (4G/5G mobile)'
    if (ms <= 600) return '500ms (Broadband Jitter)'
    return `${ms}ms (Satellite / VPN)`
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 w-80 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-2xl z-50 animate-fadeIn space-y-4"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-accent-secondary animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Resilience Console</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
          isEnabled 
            ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' 
            : 'bg-status-success/10 border-status-success/30 text-status-success animate-pulse'
        }`}>
          {isEnabled ? 'OFFLINE' : 'ONLINE'}
        </span>
      </div>

      {/* Toggler button */}
      <div className="flex items-center justify-between bg-bg-nested/40 border border-border-subtle/50 p-2.5 rounded-xl">
        <div className="text-left">
          <span className="text-xs font-bold block">Airplane Mode</span>
          <span className="text-[10px] text-text-muted leading-tight block mt-0.5">Simulate offline IdP outage</span>
        </div>
        
        <button
          onClick={() => setEnabled(!isEnabled, true)}
          className={`w-11 h-6 rounded-full transition-all relative ${
            isEnabled ? 'bg-status-danger' : 'bg-border-subtle hover:bg-text-muted'
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
            isEnabled ? 'left-5.5' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* Latency slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-3.5 h-3.5" /> Inject Latency
          </span>
          <span className="font-mono text-accent-primary font-bold text-[10px]">
            {getLatencyLabel(simulateLatency)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={simulateLatency}
          onChange={(e) => setLatency(parseInt(e.target.value))}
          className="w-full h-1.5 bg-bg-nested rounded-lg appearance-none cursor-pointer accent-accent-primary"
        />
        <div className="flex justify-between text-[8px] text-text-muted font-bold font-mono">
          <span>0ms</span>
          <span>500ms</span>
          <span>1000ms</span>
          <span>2000ms</span>
        </div>
      </div>

      {/* Packet loss input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <AlertTriangle className="w-3.5 h-3.5 text-status-warning" /> Simulated Packet Loss
          </span>
          <span className="font-mono text-status-warning font-bold text-[10px]">
            {simulatePacketLoss}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={simulatePacketLoss}
          onChange={(e) => setPacketLoss(parseInt(e.target.value))}
          className="w-full h-1.5 bg-bg-nested rounded-lg appearance-none cursor-pointer accent-status-warning"
        />
      </div>

      {/* 100% Client-Side Privacy Guarantee Notice */}
      <div className="p-3 bg-accent-glow/50 border border-accent-primary/20 rounded-xl space-y-1.5">
        <div className="flex gap-2 items-start">
          <ShieldCheck className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block">Air-Gapped Privacy Guarantee</span>
            <p className="text-[9px] text-text-secondary leading-normal font-semibold">
              AboutIAM is a <strong>100% client-side, browser-native application</strong>. All cryptographic operations, key exchanges, and token signatures execute strictly inside your local browser. 
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-start pt-1.5 border-t border-border-subtle/30 text-[9px] text-text-muted leading-tight font-medium">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-secondary" />
          <span>Enabling Airplane Mode completely suspends network requests to simulate and verify offline resilience profiles.</span>
        </div>
      </div>
    </div>
  )
}
