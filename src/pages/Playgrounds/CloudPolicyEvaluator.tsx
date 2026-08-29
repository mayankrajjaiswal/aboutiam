import { useState } from 'react'
import { 
  ShieldCheck, ShieldAlert, Layers, Play, 
  HelpCircle, Cpu, BookOpen
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { CLOUD_POLICIES, evaluateCloudPolicies, type PolicyEvaluationContext, type EvaluationStep } from '../../data/cloudPolicyScenarios'

export default function CloudPolicyEvaluator() {
  const [selectedActionId, setSelectedActionId] = useState<string>('read_corp')
  const [evaluationSteps, setEvaluationSteps] = useState<EvaluationStep[]>([])
  const [evaluationFinal, setEvaluationFinal] = useState<boolean | null>(null)
  
  // Tab states for policy views
  const [activePolicyTab, setActivePolicyTab] = useState<'scp' | 'identity' | 'resource'>('scp')

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'cloud_policy_evaluator_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  const handleEvaluate = () => {
    let context: PolicyEvaluationContext

    if (selectedActionId === 'delete_production') {
      context = {
        action: 's3:DeleteBucket',
        resource: 'arn:aws:s3:::production-financial-data',
        clientIp: '192.168.10.25',
        region: 'us-east-1',
        mfaAuthenticated: true
      }
      log('info', 'Evaluating: Delete Production S3 Bucket (s3:DeleteBucket)')
    } else if (selectedActionId === 'read_corp') {
      context = {
        action: 's3:GetObject',
        resource: 'arn:aws:s3:::production-financial-data/financial_ledger.csv',
        clientIp: '192.168.10.25', // Corp subnet
        region: 'us-east-1',
        mfaAuthenticated: false
      }
      log('info', 'Evaluating: Read Financial Document from Corporate Office IP (192.168.10.25)')
    } else {
      context = {
        action: 's3:GetObject',
        resource: 'arn:aws:s3:::production-financial-data/financial_ledger.csv',
        clientIp: '198.51.100.12', // Outside IP
        region: 'us-east-1',
        mfaAuthenticated: false
      }
      log('info', 'Evaluating: Read Financial Document from Starbucks Public IP (198.51.100.12)')
    }

    const result = evaluateCloudPolicies(context)
    setEvaluationSteps(result.steps)
    setEvaluationFinal(result.allowed)

    result.steps.forEach(step => {
      const icon = step.decision === 'DENY' ? '❌' : step.decision === 'ALLOW' ? '✓' : 'ℹ️'
      log('info', `${icon} [${step.policy}] Decision: ${step.decision} | ${step.reason}`)
    })

    if (result.allowed) {
      log('success', `🎉 Request APPROVED! Access was granted to the target resource.`)
    } else {
      log('error', `❌ Request DENIED! Access was refused by overlapping security policies.`)
    }

    capture({
      direction: result.allowed ? 'response' : 'error',
      protocol: 'IAM Policy Engine',
      summary: `Authorize: ${context.action}`,
      raw: `Decision: ${result.allowed ? 'Allow' : 'Deny'}\nEvaluatedPolicies: [SCP, Resource, Identity]`
    })

    // Advance playground completion steps
    if (selectedActionId === 'delete_production' && !result.allowed) {
      completeStep(1)
      finishPlayground()
    }
  }

  const handleReset = () => {
    resetPlayground()
    clearFrames()
    setSelectedActionId('read_corp')
    setEvaluationSteps([])
    setEvaluationFinal(null)
    log('info', 'Playground simulation has been fully reset.')
  }

  const currentPolicy = CLOUD_POLICIES.find(p => p.type === activePolicyTab) || CLOUD_POLICIES[0]

  return (
    <PlaygroundShell
      title="Multi-Cloud Overlapping IAM Policy Evaluator"
      description="Step inside the heart of an enterprise Policy Evaluation Engine. Visualize and evaluate how Organization SCP boundaries, identity-based IAM permissions, and Resource policies combine to govern access."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => {
        revealHint('To complete the lab, trigger the "Trigger Delete Production Bucket" operation, and observe how the Organization SCP (Service Control Policy) explicitly blocks the action, saving the infrastructure.')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Top: Policy Editor Tabs */}
        <div className="shrink-0 space-y-3 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center select-none">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent-primary animate-pulse" /> 1. View Security Policy Layers (Overlapping Scopes)
            </span>
            <div className="flex gap-1">
              {(['scp', 'resource', 'identity'] as const).map(tab => {
                const isActive = activePolicyTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActivePolicyTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                      isActive ? 'bg-accent-glow border-accent-primary text-text-primary' : 'bg-bg-sidebar border-border-subtle text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Render Active Policy Block */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <p className="text-[10px] text-text-secondary font-sans leading-normal">
              {currentPolicy.description}
            </p>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-border-subtle/50 text-[10px] font-mono leading-normal overflow-auto max-h-[140px] text-teal-300 select-all">
              {currentPolicy.yaml}
            </pre>
          </div>
        </div>

        {/* Action Trigger Sandbox */}
        <div className="flex-1 min-h-0 space-y-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-secondary" /> 2. Configure Action Context & Simulate Policy Evaluation
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto">
            
            {/* Input Selection Box (Col-span 5) */}
            <div className="md:col-span-5 space-y-4 flex flex-col justify-between h-full bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm select-none">
              <div className="space-y-4">
                <span className="text-xs font-bold text-text-primary block">Select Action Trigger</span>
                
                <div className="space-y-2">
                  {[
                    { id: 'read_corp', label: 'Download Document (Source IP inside Corp Subnet)', desc: 's3:GetObject on production bucket from 192.168.10.25' },
                    { id: 'read_starbucks', label: 'Download Document (Source IP outside Corp Subnet)', desc: 's3:GetObject on production bucket from 198.51.100.12' },
                    { id: 'delete_production', label: 'Trigger Delete Production Bucket (Full Organization)', desc: 's3:DeleteBucket on production-financial-data bucket' }
                  ].map(item => {
                    const isSelected = selectedActionId === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedActionId(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex flex-col gap-0.5 transition-all ${
                          isSelected ? 'bg-accent-glow border-accent-primary text-text-primary scale-[1.01]' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:border-border-subtle/80'
                        }`}
                      >
                        <span className="font-bold">{item.label}</span>
                        <span className="text-[9px] text-text-muted font-mono leading-none mt-1">{item.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleEvaluate}
                className="w-full py-2.5 px-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold font-sans shadow transition flex items-center justify-center gap-1.5"
              >
                Evaluate Policies <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Evaluation Flow Map (Col-span 7) */}
            <div className="md:col-span-7 bg-bg-card border border-border-subtle rounded-2xl p-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <span className="text-xs font-bold text-text-primary block">Engine Evaluation Timeline</span>
                
                {evaluationSteps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-44 text-slate-500 gap-1 select-none text-center">
                    <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
                    <span>No active evaluation.</span>
                    <span className="text-[9px] text-slate-600 max-w-[200px]">Click the &quot;Evaluate Policies&quot; button on the left to see the engine evaluation path.</span>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans text-xs">
                    {evaluationSteps.map((step, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-xl border flex justify-between items-center gap-3 ${
                          step.decision === 'DENY' ? 'bg-status-danger/10 border-status-danger/25 text-status-danger' :
                          step.decision === 'ALLOW' ? 'bg-status-success/10 border-status-success/25 text-status-success' :
                          'bg-bg-sidebar border-border-subtle text-text-secondary'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold uppercase text-[9px] block text-text-muted">Layer {idx + 1}: {step.policy}</span>
                          <span className="text-[11px] leading-tight block mt-0.5">{step.reason}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] border ${
                          step.decision === 'DENY' ? 'bg-status-danger/15 border-status-danger/20 text-status-danger' :
                          step.decision === 'ALLOW' ? 'bg-status-success/15 border-status-success/20 text-status-success' :
                          'bg-bg-card border-border-subtle text-text-muted'
                        }`}>
                          {step.decision}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {evaluationFinal !== null && (
                <div className={`p-3 rounded-xl border flex items-center justify-between mt-3 font-sans select-none animate-in fade-in duration-300 ${
                  evaluationFinal ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'
                }`}>
                  <div className="flex items-center gap-2">
                    {evaluationFinal ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    <span className="text-xs font-black">FINAL POLICY DECISION:</span>
                  </div>
                  <span className="font-mono font-black text-xs uppercase tracking-wider">
                    {evaluationFinal ? 'ALLOWED (ACCESS GRANTED)' : 'DENIED (ACCESS REFUSED)'}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Informational Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-accent-primary" /> Overlapping Policy Priority Rules</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">Explicit Deny Always Wins</span>
              In Cloud IAM architectures, an explicit `Deny` statement anywhere in the evaluation chain (such as an organization SCP or resource policy restriction) instantly aborts the transaction and blocks access, overriding any matching `Allow` scopes.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">The Priority Order Chain</span>
              The evaluation sequence runs in three steps: (1) Default to Implicit Deny. (2) Evaluate all policy layers. If any matching statement has an explicit Deny, access is Denied. (3) If no Deny exists, search for an explicit Allow. If none, access is Denied.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
