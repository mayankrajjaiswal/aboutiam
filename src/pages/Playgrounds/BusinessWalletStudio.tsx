import { useState, useMemo } from 'react'
import { Building2, UserCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { BUSINESS_WALLET_USE_CASES } from '../../data/businessWalletUseCases'

type CustodyModel = 'single-admin' | 'multi-signer' | 'delegated-hsm'

const CUSTODY_LABELS: Record<CustodyModel, string> = {
  'single-admin': 'Single Administrator',
  'multi-signer': 'Multi-Signer Threshold',
  'delegated-hsm': 'HSM-Backed Delegated Custody',
}

interface Employee {
  id: string
  name: string
  role: string
  active: boolean
  delegatedAuthority: string | null
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Alicia Chen', role: 'Contracts Manager', active: true, delegatedAuthority: null },
  { id: 'emp-2', name: 'Marcus Webb', role: 'Compliance Officer', active: true, delegatedAuthority: null },
  { id: 'emp-3', name: 'Priya Anand', role: 'Former Employee (departed)', active: false, delegatedAuthority: null },
]

type PresentationOutcome = 'success' | 'revoked-credential' | 'departed-employee' | 'threshold-exceeded' | null

export default function BusinessWalletStudio() {
  const [useCaseId, setUseCaseId] = useState(BUSINESS_WALLET_USE_CASES[0].id)
  const useCase = useMemo(() => BUSINESS_WALLET_USE_CASES.find((u) => u.id === useCaseId)!, [useCaseId])

  const [custodyModel, setCustodyModel] = useState<CustodyModel>('multi-signer')
  const [credentialReceived, setCredentialReceived] = useState(false)
  const [credentialRevoked, setCredentialRevoked] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [presentationOutcome, setPresentationOutcome] = useState<PresentationOutcome>(null)
  const [highValueThreshold, setHighValueThreshold] = useState(true)

  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    adjustScore,
    completeStep,
    finishPlayground,
    resetPlayground,
  } = usePlayground({
    moduleId: 'business_wallet_studio',
    initialScore: 100,
    maxHints: 3,
  })

  const handleSelectUseCase = (id: string) => {
    setUseCaseId(id)
    setCredentialReceived(false)
    setCredentialRevoked(false)
    setPresentationOutcome(null)
    setEmployees(INITIAL_EMPLOYEES)
    log('info', `Selected use case: ${BUSINESS_WALLET_USE_CASES.find((u) => u.id === id)?.title}`)
  }

  const handleReceiveCredential = () => {
    setCredentialReceived(true)
    log('success', `Credential received into the business wallet under ${CUSTODY_LABELS[custodyModel]} custody.`)
    completeStep(0, 'Credential received into the organizational wallet.')
  }

  const handleDelegate = (employeeId: string) => {
    setEmployees((prev) => prev.map((e) => e.id === employeeId ? { ...e, delegatedAuthority: useCase.title } : e))
    const employee = employees.find((e) => e.id === employeeId)!
    log(employee.active ? 'info' : 'warning', `Delegated presentation authority for "${useCase.title}" to ${employee.name} (${employee.role}).`)
  }

  const handlePresent = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId)!

    if (!employee.delegatedAuthority) {
      log('error', `${employee.name} attempted to present without any delegated authority.`)
      setPresentationOutcome(null)
      return
    }
    if (!employee.active) {
      log('error', `PRESENTATION BLOCKED: ${employee.name} has departed but their delegation was never revoked — the verifier's issuer-trust and holder-binding check should catch this.`)
      setPresentationOutcome('departed-employee')
      adjustScore(-15, 'A departed employee still holding delegated authority is a real revocation-propagation failure.')
      return
    }
    if (credentialRevoked) {
      log('error', `PRESENTATION BLOCKED: the underlying credential was revoked mid-transaction. Verifier's revocation-status check caught it.`)
      setPresentationOutcome('revoked-credential')
      adjustScore(-10, 'A revoked credential correctly failed the verifier check.')
      return
    }
    if (highValueThreshold && custodyModel === 'single-admin') {
      log('warning', `PRESENTATION FLAGGED: this is a high-value presentation, but custody is single-administrator — no multi-signer threshold was enforced.`)
      setPresentationOutcome('threshold-exceeded')
      adjustScore(-10, 'A high-value presentation went through without the multi-signer threshold this custody model should have enforced.')
      return
    }

    log('success', `Presentation succeeded: verifier confirmed issuer trust, revocation status (clean), and holder binding to ${employee.name}.`)
    setPresentationOutcome('success')
    adjustScore(10, 'Presentation succeeded cleanly with proper custody and an active delegate.')
    completeStep(1, 'Successful, well-governed presentation.')
    finishPlayground('The business wallet correctly handled custody, delegation, and presentation for this use case.')
  }

  const handleRevokeCredential = () => {
    setCredentialRevoked(true)
    log('warning', 'Credential revoked by the issuer (e.g. licence suspended, registration lapsed).')
  }

  return (
    <PlaygroundShell
      title="Business Wallet Studio"
      description="Set up an organizational (business) wallet: choose a custody model, receive a credential, delegate presentation authority to employees, and present it to a verifier. Then inject real failure modes — a departed employee, a mid-transaction revocation, a threshold violation — and see whether governance holds."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('A departed employee\'s delegated authority must be revoked the moment they leave — the wallet has no way to know they left unless your offboarding process tells it.')}
      onReset={() => {
        setCredentialReceived(false)
        setCredentialRevoked(false)
        setEmployees(INITIAL_EMPLOYEES)
        setPresentationOutcome(null)
        setCustodyModel('multi-signer')
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* USE CASE SELECTOR */}
        <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Select a Business Wallet Use Case</label>
          <select
            aria-label="Select a business wallet use case"
            value={useCaseId}
            onChange={(e) => handleSelectUseCase(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary"
          >
            {BUSINESS_WALLET_USE_CASES.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
          </select>
          <p className="text-[11px] text-text-secondary">{useCase.walletApproach}</p>
        </div>

        {/* CUSTODY MODEL */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <h2 className="text-xs font-black text-text-primary flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-accent-primary" /> Custody Model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {(Object.keys(CUSTODY_LABELS) as CustodyModel[]).map((model) => (
              <button
                key={model}
                onClick={() => setCustodyModel(model)}
                className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  custodyModel === model ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-subtle bg-bg-nested text-text-secondary'
                }`}
              >
                {CUSTODY_LABELS[model]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] text-text-secondary pt-1">
            <input type="checkbox" checked={highValueThreshold} onChange={(e) => setHighValueThreshold(e.target.checked)} />
            This is a high-value presentation requiring multi-signer approval
          </label>
        </div>

        {/* RECEIVE CREDENTIAL */}
        {!credentialReceived ? (
          <button
            onClick={handleReceiveCredential}
            className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors"
          >
            Receive Credential Into Wallet
          </button>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-status-success/5 border border-status-success/30 text-xs text-status-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Credential received under {CUSTODY_LABELS[custodyModel]} custody.
            </div>

            {/* DELEGATION AND PRESENTATION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-accent-primary" /> Delegate & Present
              </label>
              {employees.map((employee) => (
                <div key={employee.id} className={`p-3 rounded-xl border space-y-2 ${!employee.active ? 'bg-status-warning/5 border-status-warning/20' : 'bg-bg-card border-border-subtle'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{employee.name}</span>
                    <span className={`text-[10px] ${employee.active ? 'text-text-muted' : 'text-status-warning font-bold'}`}>{employee.role}</span>
                  </div>
                  {employee.delegatedAuthority && (
                    <div className="text-[10px] text-accent-primary">Delegated: {employee.delegatedAuthority}</div>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleDelegate(employee.id)}
                      className="px-2 py-1 rounded-lg bg-bg-nested border border-border-subtle text-[10px] font-bold text-text-secondary hover:text-text-primary"
                    >
                      Delegate Authority
                    </button>
                    <button
                      onClick={() => handlePresent(employee.id)}
                      className="px-2 py-1 rounded-lg bg-accent-primary text-white text-[10px] font-bold hover:bg-accent-hover"
                    >
                      Present to Verifier
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRevokeCredential}
              disabled={credentialRevoked}
              className="w-full py-2 rounded-xl bg-bg-nested border border-border-subtle text-[11px] font-bold text-status-warning hover:bg-status-warning/5 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> {credentialRevoked ? 'Credential Already Revoked' : 'Simulate Mid-Transaction Revocation'}
            </button>

            {presentationOutcome && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${presentationOutcome === 'success' ? 'bg-status-success/5 border-status-success/30 text-status-success' : 'bg-status-danger/5 border-status-danger/30 text-status-danger'}`}>
                {presentationOutcome === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  {presentationOutcome === 'success' && 'Presentation succeeded: issuer trust, revocation status, and holder binding all verified.'}
                  {presentationOutcome === 'departed-employee' && 'Blocked: the presenting employee has departed but their delegation was never revoked.'}
                  {presentationOutcome === 'revoked-credential' && 'Blocked: the underlying credential was revoked before this presentation completed.'}
                  {presentationOutcome === 'threshold-exceeded' && 'Flagged: a high-value presentation bypassed the multi-signer threshold this custody model requires.'}
                </div>
              </div>
            )}
          </>
        )}

        <div className="p-3 rounded-xl bg-accent-glow border border-accent-primary/20 flex items-start gap-2 text-[11px] text-text-secondary">
          <AlertTriangle className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
          <div><span className="font-black text-text-primary block mb-0.5">Governance challenge for this use case:</span>{useCase.governanceChallenges[0]}</div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
