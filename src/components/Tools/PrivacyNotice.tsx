import { Lock, Plane } from 'lucide-react'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'

export default function PrivacyNotice() {
  const { isEnabled: isAirplaneEnabled } = useAirplaneModeStore()

  return (
    <div className={`p-4 rounded-xl border flex gap-3 items-start transition-all duration-300 ${
      isAirplaneEnabled 
        ? 'bg-status-success/15 border-status-success/40 shadow-md shadow-status-success/5 scale-[1.01]' 
        : 'bg-status-success/5 border-status-success/20'
    }`}>
      {isAirplaneEnabled ? (
        <Plane className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5 animate-bounce" />
      ) : (
        <Lock className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
      )}
      <p className="text-xs text-text-secondary leading-relaxed font-medium">
        {isAirplaneEnabled ? (
          <>
            <span className="font-extrabold text-status-success">✈️ Offline Air-Gapped Mode Active!</span> Your browser is operating in simulated air-gapped isolation. Cryptographic operations, key generation, and token validations are executing 100% locally in-browser with complete network protection. Absolutely zero credentials, JWTs, or payloads can leave this device.
          </>
        ) : (
          <>
            <span className="font-bold text-text-primary">Runs 100% in your browser.</span> Nothing you type, paste, or upload on this page is sent to any server — open your browser's Network tab and confirm it yourself. Still, treat any online tool (including this one) as untrusted with real production secrets: if you paste a live password, private key, or token here for debugging, rotate it afterward.
          </>
        )}
      </p>
    </div>
  )
}
