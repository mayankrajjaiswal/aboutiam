import { useState } from 'react'
import { Server, Database, ArrowRight, UserPlus, FileJson, CheckCircle2 } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function JitProvisioningLab() {
  const { score, currentStep, isCompleted, logs, hintsRevealed, log, revealHint, completeStep, resetPlayground } = usePlayground({
    moduleId: 'jit-provisioning',
    initialScore: 100,
    maxHints: 3
  })

  // JIT Simulator State
  interface ProvisionedUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    createdAt: string
  }

  const [tenantSsoConfig] = useState({
    idpDomain: 'acme-corp.okta.com',
    claimEmail: 'email',
    claimFirstName: 'given_name',
    claimLastName: 'family_name',
    claimRole: 'groups'
  })
  
  const [incomingAssertion] = useState({
    email: 'alice.smith@acmecorp.com',
    given_name: 'Alice',
    family_name: 'Smith',
    groups: ['Sales', 'Enterprise']
  })

  const [dbState, setDbState] = useState<ProvisionedUser[]>([])
  const [simStatus, setSimStatus] = useState<'idle' | 'parsing' | 'mapping' | 'provisioning' | 'success'>('idle')
  const [mappedUser, setMappedUser] = useState<ProvisionedUser | null>(null)

  const runJitProvisioning = () => {
    setSimStatus('parsing')
    log('info', `[SaaS App] Intercepted SAML/OIDC Assertion from ${tenantSsoConfig.idpDomain}`)
    
    setTimeout(() => {
      setSimStatus('mapping')
      log('info', '[SaaS App] Mapping Identity Provider claims to local database schema...')
      
      const roleMap = incomingAssertion[tenantSsoConfig.claimRole as keyof typeof incomingAssertion] as string[]
      const internalRole = roleMap.includes('Sales') ? 'Account Executive' : 'Standard User'
      
      const userObj = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: incomingAssertion[tenantSsoConfig.claimEmail as keyof typeof incomingAssertion] as string,
        firstName: incomingAssertion[tenantSsoConfig.claimFirstName as keyof typeof incomingAssertion] as string,
        lastName: incomingAssertion[tenantSsoConfig.claimLastName as keyof typeof incomingAssertion] as string,
        role: internalRole,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      setMappedUser(userObj)
      if (currentStep === 0) completeStep(0)

      setTimeout(() => {
        setSimStatus('provisioning')
        log('warning', `[SaaS DB] User ${userObj.email} not found in local tenant DB. Executing Just-In-Time (JIT) creation...`)
        
        setTimeout(() => {
          setDbState(prev => [...prev, userObj])
          setSimStatus('success')
          log('success', `[SaaS DB] Successfully provisioned ${userObj.firstName} ${userObj.lastName} as ${userObj.role}. JIT flow complete!`)
          if (currentStep === 1) completeStep(1)
          if (currentStep === 2) completeStep(2)
        }, 1500)
      }, 1500)
    }, 1500)
  }

  const handleReset = () => {
    resetPlayground()
    setSimStatus('idle')
    setMappedUser(null)
    setDbState([])
  }

  return (
    <PlaygroundShell
      title="B2B SaaS Just-In-Time (JIT) Provisioning"
      description="Simulate how enterprise SaaS platforms automatically onboard new corporate users on the fly by mapping SAML/OIDC claims directly into the application database."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => revealHint('Click "Simulate SSO Login" to trigger the flow and watch the mapping engine create the user.')}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        {/* Top Split: IdP Assertion & JIT Mapper */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Identity Provider (IdP) Assertion */}
          <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-xl flex flex-col hover-cyber-glow">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2">
              <Server className="w-4 h-4 text-accent-primary" /> Inbound IdP Assertion
            </h4>
            <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-[10px] text-accent-secondary border border-border-subtle/50 relative overflow-hidden">
              <pre>
{`{
  "iss": "${tenantSsoConfig.idpDomain}",
  "aud": "my-saas-app",
  "claims": {
    "${tenantSsoConfig.claimEmail}": "${incomingAssertion.email}",
    "${tenantSsoConfig.claimFirstName}": "${incomingAssertion.given_name}",
    "${tenantSsoConfig.claimLastName}": "${incomingAssertion.family_name}",
    "${tenantSsoConfig.claimRole}": ${JSON.stringify(incomingAssertion.groups)}
  }
}`}
              </pre>
              {simStatus === 'parsing' && <div className="absolute inset-0 bg-accent-secondary/10 animate-pulse"></div>}
            </div>
            
            <button
              onClick={runJitProvisioning}
              disabled={simStatus !== 'idle'}
              className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {simStatus === 'idle' ? 'Simulate SSO Login' : 'JIT Provisioning...'}
            </button>
          </div>

          {/* SaaS JIT Mapping Engine */}
          <div className="p-6 bg-bg-sidebar border border-border-subtle rounded-xl hover-cyber-glow flex flex-col justify-center items-center relative overflow-hidden">
            <h4 className="absolute top-6 left-6 text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center gap-2">
              <FileJson className="w-4 h-4 text-accent-secondary" /> SaaS Claim Mapper
            </h4>
            
            <div className="w-full max-w-sm mt-8 space-y-3">
              {[
                { dbField: 'User Email', claim: tenantSsoConfig.claimEmail, val: mappedUser?.email },
                { dbField: 'First Name', claim: tenantSsoConfig.claimFirstName, val: mappedUser?.firstName },
                { dbField: 'Last Name', claim: tenantSsoConfig.claimLastName, val: mappedUser?.lastName },
                { dbField: 'Internal Role', claim: tenantSsoConfig.claimRole, val: mappedUser?.role },
              ].map((m, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded border transition-all duration-500 ${simStatus === 'mapping' ? 'bg-accent-secondary/10 border-accent-secondary' : simStatus === 'success' || simStatus === 'provisioning' ? 'bg-bg-card border-border-subtle' : 'bg-bg-nested border-border-subtle/50 opacity-50'}`}>
                  <span className="text-[10px] font-bold text-text-muted w-24">{m.dbField}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${simStatus === 'mapping' ? 'text-accent-secondary animate-pulse' : 'text-border-subtle'}`} />
                  <span className="text-[10px] font-mono font-bold text-accent-primary truncate w-24 text-right">{simStatus === 'idle' ? m.claim : m.val || '...'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: SaaS Local Database */}
        <div className="p-6 bg-bg-card border border-border-subtle rounded-xl hover-cyber-glow">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2">
            <Database className="w-4 h-4 text-status-info" /> Target SaaS User Database (Tenancy)
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[9px] uppercase tracking-wider text-text-muted">
                  <th className="pb-2 font-bold">User ID</th>
                  <th className="pb-2 font-bold">Email</th>
                  <th className="pb-2 font-bold">Name</th>
                  <th className="pb-2 font-bold">App Role</th>
                  <th className="pb-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {dbState.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted italic">
                      {simStatus === 'provisioning' ? (
                        <span className="flex items-center justify-center gap-2 text-accent-primary animate-pulse font-bold">
                          <UserPlus className="w-4 h-4" /> Provisioning User Record...
                        </span>
                      ) : (
                        'Database empty. Waiting for JIT provisioning.'
                      )}
                    </td>
                  </tr>
                ) : (
                  dbState.map((user, i) => (
                    <tr key={i} className="border-b border-border-subtle/50 animate-in fade-in slide-in-from-bottom-2 bg-status-success/5">
                      <td className="py-3 font-mono text-[10px] text-text-secondary">{user.id}</td>
                      <td className="py-3 font-semibold text-text-primary">{user.email}</td>
                      <td className="py-3 text-text-secondary">{user.firstName} {user.lastName}</td>
                      <td className="py-3">
                        <span className="bg-accent-glow text-accent-primary px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-accent-primary/20">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-status-success flex items-center gap-1 font-bold text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3" /> {user.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  )
}
