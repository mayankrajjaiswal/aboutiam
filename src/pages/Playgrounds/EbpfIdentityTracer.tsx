import { useState } from 'react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function EbpfIdentityTracer() {
  const { score, logs, currentStep, isCompleted, log, completeStep, resetPlayground } = usePlayground({
    moduleId: 'ebpf_lab',
    initialScore: 100
  })

  const [kernelPolicy, setKernelPolicy] = useState<'audit' | 'enforce'>('audit')

  const handleTrigger = (identity: 'signed' | 'unsigned') => {
    log('info', `📡 Process execution request: [PID = 40562, Signed = ${identity === 'signed' ? 'Yes' : 'No'}]`)
    log('info', `🔍 eBPF probe intercepting sys_enter_connect at Kernel ring-0 layer...`)

    if (kernelPolicy === 'audit') {
      log('warning', `⚠️ eBPF Policy Mode: AUDIT ONLY.`)
      log('success', `🔓 Connection allowed from port 80 to 443. Logging context to user space.`)
      if (currentStep === 1) completeStep(1)
    } else {
      if (identity === 'signed') {
        log('success', `✅ Verification success: cryptographically validated process signature match. Connection allowed.`)
        if (currentStep === 1) completeStep(1)
      } else {
        log('error', `🛡️ Security Alert: process signature verification failed (unauthorized client binary)!`)
        log('error', `❌ eBPF kernel dropped network packet immediately at OS Socket layer.`)
        if (currentStep === 1) completeStep(1)
      }
    }
  }

  return (
    <PlaygroundShell
      title="eBPF Kernel-Level Identity Tracer"
      description="Configure an eBPF ring-0 authorization policy and watch the kernel drop unauthorized network packets at the OS level."
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">1. Set Kernel enforcement policy</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setKernelPolicy('audit'); log('info', 'Kernel policy set to AUDIT'); }}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${kernelPolicy === 'audit' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
            >
              Audit Only
            </button>
            <button
              onClick={() => { setKernelPolicy('enforce'); log('info', 'Kernel policy set to ENFORCE'); }}
              className={`p-4 rounded-xl border text-xs font-bold transition-all ${kernelPolicy === 'enforce' ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-subtle bg-bg-sidebar hover:bg-bg-card'}`}
            >
              Enforce (Active Drops)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wide">2. Trigger execution requests</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleTrigger('signed')}
              className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center"
            >
              Execute Signed Binary
            </button>
            <button
              onClick={() => handleTrigger('unsigned')}
              className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition text-xs font-bold text-text-primary text-center animate-pulse"
            >
              Execute Unsigned Script
            </button>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
