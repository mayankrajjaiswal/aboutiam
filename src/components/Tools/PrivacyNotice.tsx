import { Lock } from 'lucide-react'

export default function PrivacyNotice() {
  return (
    <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 flex gap-3 items-start">
      <Lock className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
      <p className="text-xs text-text-secondary leading-relaxed font-medium">
        <span className="font-bold text-text-primary">Runs 100% in your browser.</span> Nothing you type, paste, or upload on this page is sent to any server — open your browser's Network tab and confirm it yourself. Still, treat any online tool (including this one) as untrusted with real production secrets: if you paste a live password, private key, or token here for debugging, rotate it afterward.
      </p>
    </div>
  )
}
