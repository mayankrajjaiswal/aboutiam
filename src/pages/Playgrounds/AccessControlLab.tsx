import { useState } from 'react'
import { 
  Shield, Cpu, Info
} from 'lucide-react'

type PolicyMode = 'rbac' | 'abac'

export default function AccessControlLab() {
  const [mode, setMode] = useState<PolicyMode>('rbac')
  
  // RBAC states
  const [role, setRole] = useState<'Guest' | 'Developer' | 'Admin'>('Guest')
  const [action, setAction] = useState<'Read logs' | 'Deploy code' | 'Delete database'>('Read logs')

  // ABAC states
  const [department, setDepartment] = useState<'Finance' | 'Engineering'>('Engineering')
  const [deviceSecure, setDeviceSecure] = useState(true)
  const [network, setNetwork] = useState<'Corporate Office' | 'Starbucks Wi-Fi'>('Corporate Office')

  // Evaluate RBAC Decision
  const evaluateRBAC = () => {
    if (role === 'Admin') return true
    if (role === 'Developer') {
      return action === 'Read logs' || action === 'Deploy code'
    }
    return action === 'Read logs'
  }

  // Evaluate ABAC Decision
  const evaluateABAC = () => {
    // Policy rule: Only Engineering can Deploy code if device is secure and on Corporate network
    if (action === 'Deploy code') {
      return department === 'Engineering' && deviceSecure && network === 'Corporate Office'
    }
    if (action === 'Delete database') {
      return role === 'Admin' && deviceSecure && network === 'Corporate Office'
    }
    return deviceSecure // General rule: read logs only if device is secure
  }

  const isApproved = mode === 'rbac' ? evaluateRBAC() : evaluateABAC()

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Shield className="w-3.5 h-3.5" /> Authorization Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Access Control Lab (RBAC vs ABAC)
        </h2>
        <p className="text-text-secondary">
          Compare flat Role-Based Access (RBAC) schemas against dynamic, context-aware Attribute-Based Access (ABAC) policies and observe access decisions in real-time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-bg-card p-1.5 rounded-xl border border-border-subtle w-fit">
        <button
          onClick={() => { setMode('rbac'); setAction('Read logs') }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'rbac' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          RBAC (Role-Based)
        </button>
        <button
          onClick={() => { setMode('abac'); setAction('Deploy code') }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'abac' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          ABAC (Attribute-Based)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Parameters Selectors */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm h-fit">
          <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Cpu className="w-4 h-4 text-accent-primary" /> Attribute Forge
          </h4>

          <div className="space-y-4 text-xs font-semibold text-text-secondary">
            {/* Common Action Selector */}
            <div className="space-y-1.5">
              <label className="block uppercase tracking-wider">Target Action</label>
              <select 
                value={action}
                onChange={(e) => setAction(e.target.value as 'Read logs' | 'Deploy code' | 'Delete database')}
                className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
              >
                <option value="Read logs">Read logs</option>
                <option value="Deploy code">Deploy code</option>
                <option value="Delete database">Delete database</option>
              </select>
            </div>

            {mode === 'rbac' ? (
              /* RBAC Settings */
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider">User Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Guest' | 'Developer' | 'Admin')}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
                >
                  <option value="Guest">Guest</option>
                  <option value="Developer">Developer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            ) : (
              /* ABAC Settings */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider">User Department</label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as 'Finance' | 'Engineering')}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider">Device Compliance</label>
                  <select 
                    value={deviceSecure ? 'Secure' : 'Infected'}
                    onChange={(e) => setDeviceSecure(e.target.value === 'Secure')}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-bold"
                  >
                    <option value="Secure" className="text-status-success">Compliant & Secure</option>
                    <option value="Infected" className="text-status-danger">Compromised / Infected</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider">Network Origin</label>
                  <select 
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as 'Corporate Office' | 'Starbucks Wi-Fi')}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
                  >
                    <option value="Corporate Office">Corporate Office Network</option>
                    <option value="Starbucks Wi-Fi">Starbucks Wi-Fi (Untrusted)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Output Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center justify-center text-center min-h-[220px] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Decision Engine Ruling</span>
              <div className={`text-4xl font-black uppercase tracking-widest px-8 py-4 rounded-xl border ${
                isApproved 
                  ? 'bg-status-success/5 border-status-success/30 text-status-success shadow-lg shadow-status-success/10' 
                  : 'bg-status-danger/5 border-status-danger/30 text-status-danger shadow-lg shadow-status-danger/10 animate-shake'
              }`}>
                {isApproved ? 'Approved (Allow)' : 'Denied (Block)'}
              </div>
              <p className="text-xs text-text-secondary font-semibold max-w-md mx-auto leading-relaxed pt-2 font-sans">
                {mode === 'rbac' ? (
                  `RBAC Rule: A user with role "${role}" attempting action "${action}" is statically evaluated and ${isApproved ? 'APPROVED' : 'DENIED'} based solely on their static directory group inheritance.`
                ) : (
                  `ABAC Policy Rule: Access is evaluated against User attributes (Dept: "${department}"), Device posture ("${deviceSecure ? 'Secure' : 'Compromised'}"), and Network origin ("${network}"). Decision: ${isApproved ? 'ALLOW' : 'DENIED'} because policy constraints require secure, localized compliance.`
                )}
              </p>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-5 rounded-2xl bg-bg-sidebar/50 border border-border-subtle flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
            <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5 font-sans">
              <span className="font-bold text-text-primary text-[10px] uppercase">Architect Takeaway</span>
              {mode === 'rbac' ? (
                <p>
                  RBAC is excellent for course-grained access controls. However, it results in **"role explosion"** when trying to handle dynamic exceptions (e.g., trying to create separate roles for 'Engineering On-Prem' and 'Engineering Off-Prem'). This is where transitioning to ABAC becomes critical.
                </p>
              ) : (
                <p>
                  ABAC enforces true **"Least Privilege"** and supports **Zero Trust**. By evaluating device encryption state and location networks dynamically, an active attacker possessing an engineer\'s password will still be strictly blocked from deploying code if they trigger a compromise alarm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
