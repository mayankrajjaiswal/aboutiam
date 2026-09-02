import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function WebrtcP2pPlayground() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'webrtc_p2p_lab',
    initialScore: 100
  })

  const [activePane, setActivePane] = useState<'sdp' | 'candidates'>('sdp')

  const handleHandshake = () => {
    log('info', `📡 Peer A generating local Session Description Protocol (SDP) Offer...`)
    log('info', `🔒 SDP Offer contains standard DTLS-SRTP fingerprint (SHA-256).`)
    log('info', `📡 Transmitting SDP Offer to Peer B via serverless manual paste...`)
    
    setTimeout(() => {
      log('success', `👥 Peer B parsed SDP Offer and generated matching SDP Answer.`)
      log('success', `🧩 Peer A and Peer B exchanging local ICE Connection Candidates...`)
      log('success', `✅ P2P Direct cryptographic tunnel established! Initiating direct secure Diffie-Hellman key exchange...`)
      if (currentStep === 1) completeStep(1)
    }, 1000)
  }

  return (
    <PlaygroundShell
      title="WebRTC P2P Cryptographic Handshake"
      description="A split-pane simulator where users manually generate SDP offers, exchange ICE candidates, and negotiate a secure Diffie-Hellman channel between Peer A and Peer B."
      score={score}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onReset={resetPlayground}
      sidebarContent={<TraceTerminal logs={logs} />}
      hintsRevealed={0}
      onRevealHint={() => {}}
    >
      <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setActivePane('sdp'); log('info', 'Viewing SDP Exchange parameters'); }}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${activePane === 'sdp' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
          >
            1. SDP Offer/Answer
          </button>
          <button
            onClick={() => { setActivePane('candidates'); log('info', 'Viewing STUN/TURN ICE Candidates'); }}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${activePane === 'candidates' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
          >
            2. ICE Candidates
          </button>
        </div>

        <button
          onClick={handleHandshake}
          className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors animate-pulse"
        >
          Negotiate P2P WebRTC Handshake
        </button>
      </div>
    </PlaygroundShell>
  )
}
