import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function WarRoomPlayground() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'war_room_lab',
    initialScore: 100
  })

  const [insuranceCost, setInsuranceCost] = useState(0)

  const handleMitigate = (action: 'rotate' | 'redact' | 'revoke') => {
    if (action === 'rotate') {
      log('info', `SOC Lead initiating emergency global Credential Rotation...`)
      log('success', `✅ Active threat vectors reduced. Multi-cloud session tokens rotated.`)
      setInsuranceCost((prev) => prev + 1000)
      if (currentStep === 1) completeStep(1)
    } else if (action === 'redact') {
      log('info', `SOC Lead initiating API parameter Redaction...`)
      log('success', `✅ Log-leakage vector neutralized. Internal tokens scrubbed from cloud outputs.`)
      setInsuranceCost((prev) => prev + 500)
      if (currentStep === 1) completeStep(1)
    } else {
      log('warning', `SOC Lead initiating emergency user account Revocation!`)
      log('error', `❌ Critical User session terminated. Root compromised credential locked.`)
      setInsuranceCost((prev) => prev + 2500)
      if (currentStep === 1) completeStep(1)
    }
  }

  return (
    <PlaygroundShell
      title="Active SOC 'War Room' Threat Simulator"
      description="A gamified, timed incident response dashboard. Users must parse incoming logs, issue revokes, and manage an active threat before a 60-second timer exhausts the simulated insurance coverage."
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
        <div className="p-4 bg-bg-nested border border-border-subtle rounded-xl flex items-center justify-between">
          <span className="text-xs text-text-secondary">Simulated Breach Liability Costs</span>
          <span className="text-sm font-black text-red-500">${insuranceCost} USD</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleMitigate('rotate')}
            className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-center"
          >
            🔑 Rotate Cloud Credentials
          </button>
          <button
            onClick={() => handleMitigate('redact')}
            className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-center"
          >
            🔒 Redact API Log Values
          </button>
          <button
            onClick={() => handleMitigate('revoke')}
            className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-center"
          >
            🛑 Terminate Compromised Users
          </button>
        </div>
      </div>
    </PlaygroundShell>
  )
}
