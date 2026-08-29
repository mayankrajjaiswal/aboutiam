import { useState, useEffect } from 'react'
import { 
  GitBranch, Settings, ArrowRight, HelpCircle
} from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { usePacketCapture } from '../../lib/sdk/usePacketCapture'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { WORKLOAD_SCENARIOS } from '../../data/workloadIdentityScenarios'

export default function WorkloadIdentityFederation() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('github_to_aws')
  const currentScenario = WORKLOAD_SCENARIOS.find(s => s.id === selectedScenarioId) || WORKLOAD_SCENARIOS[0]

  // Simulator Toggles
  const [maliciousBranch, setMaliciousBranch] = useState<boolean>(false)
  const [wildcardPolicy, setWildcardPolicy] = useState<boolean>(false)
  
  const [handshakeStep, setHandshakeStep] = useState<number>(0)
  const [mintedToken, setMintedToken] = useState<string>('')
  const [decodedPayload, setDecodedPayload] = useState<Record<string, unknown> | null>(null)

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
    moduleId: 'workload_identity_federation_lab',
    initialScore: 100,
    maxHints: 3
  })
  const { capture, clearFrames } = usePacketCapture()

  // Reset steps on scenario or toggle changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHandshakeStep(0)
      setMintedToken('')
      setDecodedPayload(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedScenarioId, maliciousBranch, wildcardPolicy])

  const handleRunStep = () => {
    if (handshakeStep === 0) {
      // Step 1: Mint Token
      log('info', `[Pipeline Build Triggered] Requesting OIDC JWT from ${currentScenario.provider}...`)
      
      const sub = maliciousBranch 
        ? 'repo:aboutiam/academy:ref:refs/heads/feature/malicious-patch'
        : currentScenario.trustSubject

      const payload = {
        iss: currentScenario.issuer,
        sub: sub,
        aud: currentScenario.audience,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
        repository: 'aboutiam/academy',
        actor: 'cicd-runner-04',
        branch: maliciousBranch ? 'feature/malicious-patch' : 'main'
      }

      setDecodedPayload(payload)
      // Mock signed JWT
      setMintedToken(`eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0xIn0.${btoa(JSON.stringify(payload))}.[SignatureBlock]`)

      log('success', `✓ OIDC JWT successfully minted by ${currentScenario.provider}!`)
      log('info', `JWT subject claim (sub): "${sub}"`)
      
      setHandshakeStep(1)
    } else if (handshakeStep === 1) {
      // Step 2: Post to STS
      log('info', `[STS AssumeRole] Exchanging OIDC JWT at ${currentScenario.cloud} endpoint...`)
      log('info', `POST /assume-role-with-web-identity | RoleArn: GithubDeployer | WebIdentityToken: ${mintedToken.substring(0, 30)}...`)
      
      capture({
        direction: 'request',
        protocol: 'OIDC / SAML',
        summary: 'AssumeRoleWithWebIdentity',
        raw: `WebIdentityToken: "${mintedToken}"\nRoleArn: "arn:aws:iam::123456789012:role/GithubDeployer"`
      })

      setHandshakeStep(2)
    } else if (handshakeStep === 2) {
      // Step 3: Validate and Decide
      log('info', `[STS Verification] Fetching public JWKS from ${currentScenario.issuer}/.well-known/jwks.json`)
      log('info', `✓ JWT cryptographic signature validated successfully.`)
      log('info', `[Policy Audit] Evaluating claims against Cloud trust policy conditions...`)

      // Logic:
      // If NOT malicious: Always ALLOWS.
      // If malicious AND wildcardPolicy: ALLOWS (due to vulnerability!)
      // If malicious AND NOT wildcardPolicy: DENIES.
      const isAllowed = !maliciousBranch || wildcardPolicy

      if (isAllowed) {
        log('success', `✓ Trust Policy matches: condition aud equals "${currentScenario.audience}" is satisfied.`)
        if (maliciousBranch && wildcardPolicy) {
          log('error', `⚠️ [COMPROMISE DETECTED] Overly permissive wildcard policy allowed malicious branch 'feature/malicious-patch' to assume the deployment role!`)
        } else {
          log('success', `✓ Subject claim matches trust policy successfully.`)
        }
        setHandshakeStep(3)
      } else {
        log('error', `❌ [Access Denied] AWS STS rejected the token exchange. Reason: Subject claim "repo:aboutiam/academy:ref:refs/heads/feature/malicious-patch" does not match target trust policy condition.`)
        completeStep(1) // Completed learning how OIDC protects the role!
        finishPlayground()
        setHandshakeStep(4)
      }
    } else if (handshakeStep === 3) {
      // Step 4: Complete Session keys
      log('success', `🎉 Ephemeral credentials issued successfully by ${currentScenario.cloud}!`)
      log('info', `Temporary Access Key: ASIAX${Math.random().toString(36).substr(2, 6).toUpperCase()}`)
      log('info', `Session lifespan: 3600 seconds (1 hour)`)
      
      capture({
        direction: 'response',
        protocol: 'AWS STS / JSON',
        summary: 'CredentialsIssued',
        raw: `Credentials: { AccessKeyId: "ASIA...", SessionToken: "IQoJ...", Expiration: "1 Hour" }`
      })

      if (!maliciousBranch) {
        completeStep(1)
        finishPlayground()
      }
      setHandshakeStep(4)
    }
  }

  const handleReset = () => {
    resetPlayground()
    clearFrames()
    setHandshakeStep(0)
    setMaliciousBranch(false)
    setWildcardPolicy(false)
    setMintedToken('')
    setDecodedPayload(null)
    log('info', 'Playground simulation has been fully reset.')
  }

  return (
    <PlaygroundShell
      title="Workload Identity Federation & OIDC Visualizer"
      description="Ditch long-lived static API secrets. Secure your automated build pipelines (GitHub Actions, GitLab CI) using federated OIDC token handshakes with Cloud Providers."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={1}
      isCompleted={isCompleted}
      onRevealHint={() => {
        revealHint('To complete the simulation, run a secure pipeline handshake (no malicious branch) from GitHub to AWS. Then, try simulating a "Malicious Branch Push" with default policies to see how the cloud provider blocks it!')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6 h-full flex flex-col justify-between">
        
        {/* Scenario Selection and Attack Toggles */}
        <div className="shrink-0 space-y-4 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-accent-primary animate-spin" /> 1. Select Pipeline Configuration
              </span>
              <select
                value={selectedScenarioId}
                onChange={e => setSelectedScenarioId(e.target.value)}
                className="p-1.5 rounded bg-bg-sidebar border border-border-subtle text-xs text-text-primary outline-none font-bold"
              >
                <option value="github_to_aws">GitHub Actions deploying to AWS</option>
                <option value="gitlab_to_gcp">GitLab CI/CD deploying to Google Cloud</option>
              </select>
            </div>

            {/* Attack & Vulnerability Switches */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block">Simulate Malicious Branch Push</span>
                  <span className="text-[9px] text-text-muted leading-none block">Pushing code from feature/malicious-patch</span>
                </div>
                <input 
                  type="checkbox"
                  checked={maliciousBranch}
                  onChange={e => setMaliciousBranch(e.target.checked)}
                  className="w-4 h-4 text-status-danger border-border-subtle rounded focus:ring-0 focus:ring-offset-0"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block">Misconfigured Wildcard Policy</span>
                  <span className="text-[9px] text-text-muted leading-none block">Allow repo:aboutiam/* on cloud provider</span>
                </div>
                <input 
                  type="checkbox"
                  checked={wildcardPolicy}
                  onChange={e => setWildcardPolicy(e.target.checked)}
                  className="w-4 h-4 text-status-danger border-border-subtle rounded focus:ring-0 focus:ring-offset-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Handshake Phase Arena */}
        <div className="flex-1 min-h-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-text-muted block flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5" /> 2. Workload Identity Exchange Timeline</span>
            
            {/* Handshake Visual Stage Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 select-none">
              {[
                { name: '1. Mint OIDC Token', id: 1 },
                { name: '2. Exchange Request', id: 2 },
                { name: '3. Policy Audit', id: 3 },
                { name: '4. Ephemeral Credentials', id: 4 }
              ].map(s => {
                const isActive = handshakeStep === s.id - 1
                const isPassed = handshakeStep >= s.id
                return (
                  <div 
                    key={s.id}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      isActive ? 'bg-accent-glow border-accent-primary text-text-primary scale-105' :
                      isPassed ? 'bg-bg-sidebar border-status-success/30 text-status-success' :
                      'bg-bg-sidebar border-border-subtle text-text-muted'
                    }`}
                  >
                    {s.name}
                  </div>
                )
              })}
            </div>

            {/* Render minted JWT preview in Step 1 or later */}
            {decodedPayload && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-text-muted block">CIPELINE MINTED OIDC ID TOKEN (JWT)</span>
                  <pre className="p-3 rounded-xl bg-slate-950/80 border border-border-subtle/50 text-[10px] font-mono leading-normal overflow-auto max-h-[140px] text-blue-300">
                    {JSON.stringify(decodedPayload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-text-muted block">ACTIVE CLOUD TRUST POLICY</span>
                  <pre className="p-3 rounded-xl bg-slate-950/80 border border-border-subtle/50 text-[10px] font-mono leading-normal overflow-auto max-h-[140px] text-teal-300">
                    {currentScenario.trustPolicyYaml}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Trigger button for next handshake phase */}
          <div className="pt-4 border-t border-border-subtle/40 select-none">
            <button
              onClick={handleRunStep}
              className="w-full py-3 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold font-sans shadow-md transition flex items-center justify-center gap-1.5"
            >
              {handshakeStep === 0 ? 'Step 1: Mint OIDC Identity Token' :
               handshakeStep === 1 ? 'Step 2: Request Ephemeral Exchange' :
               handshakeStep === 2 ? 'Step 3: Validate OIDC Claims against Trust Policy' :
               handshakeStep === 3 ? 'Step 4: Issue Short-Lived Access Keys' :
               'Exchange Complete! Reset to simulate again.'} <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Bottom Informational Explainer */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-sm space-y-3 shrink-0">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-accent-primary" /> Why Federated OIDC is Superior</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="font-bold text-accent-primary block mb-0.5">The Danger of Static Access Keys</span>
              Standard IAM User access keys are permanent. If an engineer hardcodes a key into a repo, or an adversary breaches a CI/CD server, they obtain indefinite backdoors to your cloud accounts until manually rotated.
            </div>
            <div>
              <span className="font-bold text-accent-secondary block mb-0.5">Zero Trust Workload Federation</span>
              Workload Identity Federation issues cryptographically signed JWTs valid for only minutes. The OIDC provider (GitHub) attests to precisely which repository and branch triggered the build. The cloud rejects any unauthorized branches.
            </div>
          </div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
