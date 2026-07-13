import { useState, useMemo } from 'react'
import { 
  ShieldAlert, Settings, Play, ShieldCheck, 
  Trash2, Plus, RefreshCw, Terminal
} from 'lucide-react'

// Define Node Types
type NodeType = 'client' | 'gateway' | 'authority' | 'service'

interface ArchitectNode {
  id: string
  name: string
  type: NodeType
  // Security Overrides Config
  pkceEnforced?: boolean
  restrictRedirects?: boolean
  jwtValidation?: boolean
  dpopRequired?: boolean
  strongMfa?: boolean
  keyRotation?: boolean
  mtlsEnforced?: boolean
  scimValidation?: boolean
}

interface ThreatFinding {
  id: string
  nodeName: string
  threat: string
  methodology: 'STRIDE' | 'MITRE ATT&CK' | 'OWASP' | 'Zero Trust'
  severity: 'High' | 'Medium' | 'Low'
  mitigation: string
}

export default function ThreatModelingStudio() {
  const [activeNodes, setActiveNodes] = useState<ArchitectNode[]>([
    { id: 'node-1', name: 'SPA Client Portal', type: 'client', pkceEnforced: false, restrictRedirects: false },
    { id: 'node-2', name: 'Zuul API Gateway', type: 'gateway', jwtValidation: false, dpopRequired: false },
    { id: 'node-3', name: 'Keycloak Auth Authority', type: 'authority', strongMfa: true, keyRotation: false },
    { id: 'node-4', name: 'Billing Microservice', type: 'service', mtlsEnforced: false, scimValidation: false }
  ])
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1')
  const [activeMethodology, setActiveMethodology] = useState<'STRIDE' | 'OWASP' | 'Zero Trust'>('STRIDE')
  const [showReport, setShowReport] = useState(false)

  const selectedNode = useMemo(() => {
    return activeNodes.find(n => n.id === selectedNodeId)
  }, [selectedNodeId, activeNodes])

  // --- ADD / REMOVE NODES HANDLERS ---
  const addNode = (type: NodeType) => {
    const newId = `node-${Date.now()}`
    let name = 'SPA Client'
    let template: ArchitectNode = { id: newId, name, type }

    if (type === 'client') {
      name = 'Mobile App Portal'
      template = { id: newId, name, type, pkceEnforced: false, restrictRedirects: false }
    } else if (type === 'gateway') {
      name = 'Kong API Gateway'
      template = { id: newId, name, type, jwtValidation: false, dpopRequired: false }
    } else if (type === 'authority') {
      name = 'Entra ID Provider'
      template = { id: newId, name, type, strongMfa: false, keyRotation: false }
    } else if (type === 'service') {
      name = 'User DB Service'
      template = { id: newId, name, type, mtlsEnforced: false, scimValidation: false }
    }

    setActiveNodes(prev => [...prev, template])
    setSelectedNodeId(newId)
    setShowReport(false)
  }

  const removeNode = (id: string) => {
    if (activeNodes.length <= 1) return
    setActiveNodes(prev => prev.filter(n => n.id !== id))
    setSelectedNodeId(activeNodes[0].id)
    setShowReport(false)
  }

  const updateNodeConfig = (id: string, updates: Partial<ArchitectNode>) => {
    setActiveNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
    setShowReport(false)
  }

  // --- MODEL PRESET TEMPLATES ---
  const loadPreset = (presetName: 'spire_mesh' | 'iot_posture' | 'cicd_runner' | 'reset') => {
    setShowReport(false)
    if (presetName === 'spire_mesh') {
      setActiveNodes([
        { id: 'node-spire-1', name: 'SPIFFE Workload Server A', type: 'service', mtlsEnforced: false, scimValidation: false },
        { id: 'node-spire-2', name: 'SPIRE Agent/Attestor Daemon', type: 'gateway', jwtValidation: true, dpopRequired: false },
        { id: 'node-spire-3', name: 'SPIRE Server Authority', type: 'authority', strongMfa: true, keyRotation: false },
        { id: 'node-spire-4', name: 'Target Postgres Database', type: 'service', mtlsEnforced: false, scimValidation: false }
      ])
      setSelectedNodeId('node-spire-1')
    } else if (presetName === 'iot_posture') {
      setActiveNodes([
        { id: 'node-iot-1', name: 'Smart Hub Client Dashboard', type: 'client', pkceEnforced: false, restrictRedirects: false },
        { id: 'node-iot-2', name: 'IoT CoAP API Gateway', type: 'gateway', jwtValidation: false, dpopRequired: false },
        { id: 'node-iot-3', name: 'FIDO2 Auth Server', type: 'authority', strongMfa: false, keyRotation: false }
      ])
      setSelectedNodeId('node-iot-1')
    } else if (presetName === 'cicd_runner') {
      setActiveNodes([
        { id: 'node-cicd-1', name: 'GitHub Actions Runner', type: 'client', pkceEnforced: false, restrictRedirects: true },
        { id: 'node-cicd-2', name: 'HashiCorp Vault Service', type: 'gateway', jwtValidation: true, dpopRequired: false },
        { id: 'node-cicd-3', name: 'OIDC Identity Provider', type: 'authority', strongMfa: true, keyRotation: false }
      ])
      setSelectedNodeId('node-cicd-1')
    } else {
      // Default reset
      setActiveNodes([
        { id: 'node-1', name: 'SPA Client Portal', type: 'client', pkceEnforced: false, restrictRedirects: false },
        { id: 'node-2', name: 'Zuul API Gateway', type: 'gateway', jwtValidation: false, dpopRequired: false },
        { id: 'node-3', name: 'Keycloak Auth Authority', type: 'authority', strongMfa: true, keyRotation: false },
        { id: 'node-4', name: 'Billing Microservice', type: 'service', mtlsEnforced: false, scimValidation: false }
      ])
      setSelectedNodeId('node-1')
    }
  }

  // --- DYNAMIC SECURITY THREAT COMPILER ---
  const threatFindings: ThreatFinding[] = useMemo(() => {
    const findings: ThreatFinding[] = []

    activeNodes.forEach(node => {
      if (node.type === 'client') {
        if (node.pkceEnforced === false) {
          findings.push({
            id: `${node.id}-pkce`,
            nodeName: node.name,
            threat: 'Missing PKCE (RFC 7636) Authorization Code flow protection.',
            methodology: 'OWASP',
            severity: 'High',
            mitigation: 'Implement a cryptographically unique code_verifier & code_challenge on authorize handshakes.'
          })
        }
        if (node.restrictRedirects === false) {
          findings.push({
            id: `${node.id}-redirect`,
            nodeName: node.name,
            threat: 'Wildcard and unvalidated redirection URIs allowed.',
            methodology: 'STRIDE',
            severity: 'High',
            mitigation: 'Enforce rigid, exact-match string comparisons on authorization server redirect domains.'
          })
        }
      }

      if (node.type === 'gateway') {
        if (node.jwtValidation === false) {
          findings.push({
            id: `${node.id}-jwt`,
            nodeName: node.name,
            threat: 'Missing stateless Access Token (alg: none) signature checks.',
            methodology: 'STRIDE',
            severity: 'High',
            mitigation: 'Configure gateway validation filters to explicitly reject JWTs carrying algorithms outside expected sets (e.g. RS256).'
          })
        }
        if (node.dpopRequired === false) {
          findings.push({
            id: `${node.id}-dpop`,
            nodeName: node.name,
            threat: 'Bearer access tokens vulnerable to replay attacks on interception.',
            methodology: 'MITRE ATT&CK',
            severity: 'Medium',
            mitigation: 'Mandate Sender-Constrained Token verification (DPoP - RFC 9449) on authorization endpoints.'
          })
        }
      }

      if (node.type === 'authority') {
        if (node.strongMfa === false) {
          findings.push({
            id: `${node.id}-mfa`,
            nodeName: node.name,
            threat: 'Authentication relies on vulnerable credentials or push-fatigue MFA.',
            methodology: 'Zero Trust',
            severity: 'Medium',
            mitigation: 'Enforce hardware-backed biometric FIDO2/WebAuthn Passkey steps for administrative tasks.'
          })
        }
        if (node.keyRotation === false) {
          findings.push({
            id: `${node.id}-rotation`,
            nodeName: node.name,
            threat: 'Static JWKS private keys lack automated cryptographic rotations.',
            methodology: 'STRIDE',
            severity: 'Low',
            mitigation: 'Deploy key scheduler daemons to rotate signing keys automatically every 90 days.'
          })
        }
      }

      if (node.type === 'service') {
        if (node.mtlsEnforced === false) {
          findings.push({
            id: `${node.id}-mtls`,
            nodeName: node.name,
            threat: 'Workload API accepts unauthenticated service requests.',
            methodology: 'Zero Trust',
            severity: 'High',
            mitigation: 'Issue ephemeral X.509 SVID credentials via SPIFFE/SPIRE nodes to authenticate pipelines over mTLS.'
          })
        }
        if (node.scimValidation === false) {
          findings.push({
            id: `${node.id}-scim`,
            nodeName: node.name,
            threat: 'SCIM user-creation payloads bypass nested schema filters.',
            methodology: 'OWASP',
            severity: 'Medium',
            mitigation: 'Establish compliance schema validators to strip or reject extended attributes outside core JSON limits.'
          })
        }
      }
    })

    return findings.filter(f => {
      if (activeMethodology === 'STRIDE') return f.methodology === 'STRIDE' || f.methodology === 'MITRE ATT&CK'
      if (activeMethodology === 'OWASP') return f.methodology === 'OWASP'
      return f.methodology === 'Zero Trust'
    })
  }, [activeNodes, activeMethodology])

  // Computed Risk Score out of 100
  const riskScore = useMemo(() => {
    if (activeNodes.length === 0) return 0
    const totalPotentialThreats = activeNodes.length * 2
    const solvedThreats = totalPotentialThreats - threatFindings.length
    return Math.max(10, Math.round((solvedThreats / totalPotentialThreats) * 100))
  }, [activeNodes, threatFindings])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Initiative 3 Milestone
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Interactive Threat Modeling Studio
            </h1>
            <p className="text-sm text-text-secondary">
              Visually construct your corporate IAM topology, toggle vulnerability controls, and generate active threat mitigations in real-time.
            </p>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm select-none">
          <div className="flex flex-wrap gap-2 items-center">
            <button 
              onClick={() => addNode('client')}
              className="px-3 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-nested text-xs text-text-primary font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-accent-primary" /> + SPA Portal
            </button>
            <button 
              onClick={() => addNode('gateway')}
              className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-nested text-xs text-text-primary font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-accent-primary" /> + API Gateway
            </button>
            <button 
              onClick={() => addNode('authority')}
              className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-nested text-xs text-text-primary font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-accent-primary" /> + Auth Server
            </button>
            <button 
              onClick={() => addNode('service')}
              className="px-3.5 py-2 rounded-lg bg-bg-sidebar border border-border-subtle hover:bg-bg-nested text-xs text-text-primary font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-accent-primary" /> + Microservice
            </button>

            {/* Template Presets Selector */}
            <div className="flex gap-2 items-center border-l border-border-subtle/30 pl-3.5 ml-2.5">
              <span className="text-[10px] font-black text-text-muted uppercase">Templates:</span>
              <select
                onChange={(e) => loadPreset(e.target.value as 'spire_mesh' | 'iot_posture' | 'cicd_runner' | 'reset')}
                className="p-1.5 rounded-lg bg-bg-sidebar border border-border-subtle text-xs font-bold text-text-primary focus:outline-none"
              >
                <option value="reset">Default Architecture</option>
                <option value="spire_mesh">Kubernetes SPIRE Workload Mesh</option>
                <option value="iot_posture">IoT Smart Device Posture</option>
                <option value="cicd_runner">DevOps CI/CD Runner Hijack</option>
              </select>
            </div>
          </div>

          {/* Methodology selectors */}
          <div className="flex gap-1.5 bg-bg-sidebar p-1 rounded-lg border border-border-subtle">
            {['STRIDE', 'OWASP', 'Zero Trust'].map(meth => (
              <button
                key={meth}
                onClick={() => setActiveMethodology(meth as 'STRIDE' | 'OWASP' | 'Zero Trust')}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  activeMethodology === meth 
                    ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle/50' 
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {meth}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT CANVAS */}
      <div className="flex-grow min-h-0 relative flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Visual Topology Grid & Node Inspector */}
        <div className="flex-grow min-w-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex-grow min-h-0 overflow-y-auto space-y-6">
            
            {/* Visual Topology Cards */}
            <div className="grid grid-cols-2 gap-4">
              {activeNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between relative transition-all group ${
                    selectedNodeId === node.id 
                      ? 'border-accent-primary bg-accent-glow/40 shadow-inner' 
                      : 'border-border-subtle bg-bg-sidebar hover:border-accent-primary/40'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-accent-primary">
                      {node.type} workload
                    </span>
                    <h3 className="text-sm font-black text-text-primary group-hover:text-accent-primary transition-colors truncate">
                      {node.name}
                    </h3>
                  </div>
                  
                  {activeNodes.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                      className="absolute top-4 right-4 p-1.5 rounded-lg border border-transparent hover:border-status-danger/10 hover:bg-status-danger/5 text-text-muted hover:text-status-danger transition-all opacity-0 group-hover:opacity-100"
                      title="Remove component"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              ))}
            </div>

            {/* Config overrides panel for selected Node */}
            {selectedNode && (
              <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary border-b border-border-subtle/30 pb-2.5">
                  <Settings className="w-4 h-4 text-accent-primary" />
                  Configure: <span className="text-accent-primary font-black">{selectedNode.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedNode.type === 'client' && (
                    <>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Enforce PKCE Flow (RFC 7636)</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.pkceEnforced}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { pkceEnforced: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Restrict Wildcard Redirect URIs</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.restrictRedirects}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { restrictRedirects: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.type === 'gateway' && (
                    <>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Validate JWT algorithm constraints</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.jwtValidation}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { jwtValidation: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Require Sender-Constrained Tokens (DPoP)</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.dpopRequired}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { dpopRequired: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.type === 'authority' && (
                    <>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Enforce Hardware Passkeys (FIDO2)</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.strongMfa}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { strongMfa: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Deploy Automated JWKS Key Rotations</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.keyRotation}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { keyRotation: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.type === 'service' && (
                    <>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Enforce Non-Human Identity mTLS mesh</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.mtlsEnforced}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { mtlsEnforced: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs font-semibold text-text-secondary">Verify nested SCIM payloads</span>
                        <input 
                          type="checkbox" 
                          checked={selectedNode.scimValidation}
                          onChange={(e) => updateNodeConfig(selectedNode.id, { scimValidation: e.target.checked })}
                          className="w-4 h-4 text-accent-primary" 
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Run threat analysis trigger */}
          {!showReport && (
            <div className="border-t border-border-subtle/30 pt-4 mt-6 flex justify-end">
              <button
                onClick={() => setShowReport(true)}
                className="px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Run Threat Modeling Analysis
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Risk Scoreboard & Threat Findings List */}
        <div className="lg:w-1/3 shrink-0 flex flex-col gap-6 overflow-y-auto">
          {showReport ? (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Score card */}
              <div className="flex justify-between items-center bg-bg-sidebar border border-border-subtle rounded-xl p-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block leading-none">Topology Security Score</span>
                  <span className="text-xl font-extrabold text-text-primary mt-1 inline-block">{riskScore} / 100</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  riskScore >= 80 ? 'bg-status-success/15 text-status-success border border-status-success/20' :
                  riskScore >= 50 ? 'bg-status-warning/15 text-status-warning border border-status-warning/20' :
                  'bg-status-danger/15 text-status-danger border border-status-danger/20'
                }`}>
                  {riskScore >= 80 ? 'Robust Secure' : riskScore >= 50 ? 'Medium Risk' : 'High Vulnerability'}
                </div>
              </div>

              {/* Dynamic findings list */}
              <div className="space-y-4">
                <div className="border-b border-border-subtle/30 pb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-accent-primary animate-pulse" />
                    Threat Analysis: {threatFindings.length} found
                  </span>
                </div>

                {threatFindings.length === 0 ? (
                  <div className="p-8 text-center text-text-muted border border-border-subtle border-dashed rounded-xl flex flex-col items-center justify-center space-y-2">
                    <ShieldCheck className="w-10 h-10 text-status-success animate-bounce" />
                    <h4 className="text-xs font-bold text-text-primary">Perfect Score! No Threats Detected</h4>
                    <p className="text-[11px] text-text-secondary">Your current configuration fully satisfies active security posture checks!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {threatFindings.map(f => (
                      <div key={f.id} className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-status-danger"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-status-danger/15 text-status-danger font-bold uppercase px-2 py-0.5 rounded">
                            {f.severity}
                          </span>
                          <span className="text-[8px] font-mono text-text-muted uppercase">
                            {f.methodology}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary leading-snug">
                            {f.nodeName}: {f.threat}
                          </h4>
                          <p className="text-[11px] text-text-secondary mt-1 pl-4 border-l border-border-subtle">
                            <strong>Mitigation:</strong> {f.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-bg-card border border-border-subtle border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center text-text-muted space-y-4">
              <RefreshCw className="w-12 h-12 text-accent-primary animate-spin" />
              <div>
                <h3 className="text-base font-bold text-text-primary">Awaiting Threat Analysis</h3>
                <p className="text-xs text-text-secondary mt-1">Configure your corporate workloads on the left, then click &quot;Run Threat Modeling Analysis&quot;.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
