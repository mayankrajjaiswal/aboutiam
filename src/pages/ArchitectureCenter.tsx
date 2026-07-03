import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Network, ArrowRight, Shield, Play, Terminal, Cpu, Database, 
  Globe, Server, Users, Cloud, RefreshCw, KeySquare, ChevronRight
} from 'lucide-react'

type ArchitectureType = 'zero_trust' | 'b2b_saas' | 'multi_cloud'

interface NodeDetails {
  title: string
  role: string
  analogy: string
  spec: string
  threatModel: string
  bestPractice: string
}

const ARCHITECTURE_DATA: Record<ArchitectureType, {
  name: string
  description: string
  nodes: Record<string, NodeDetails>
}> = {
  zero_trust: {
    name: 'Workforce Zero Trust (NIST SP 800-207)',
    description: 'An implementation of modern Zero Trust principles showing dynamic authentication, device management, and Policy Decision Point (PDP) evaluations.',
    nodes: {
      client: {
        title: 'Subject / Client Workstation',
        role: 'Initiates request, carrying real-time user attributes (department, role) and device telemetry.',
        analogy: 'A guest arriving at a bank lobby presenting their ID and showing they are not carrying unapproved items.',
        spec: 'Utilizes cryptographic Client Certificates (mTLS) and browser posture agents to bundle JWT identity claims and secure hardware bindings.',
        threatModel: 'Threat: Session hijacking via cookies / token extraction. Mitigation: Use DPoP (Demonstrating Proof-of-Possession) keys bound to hardware TPMs.',
        bestPractice: 'Enforce continuous risk-based telemetry updates instead of single-point-in-time logins.'
      },
      pep: {
        title: 'Policy Enforcement Point (PEP)',
        role: 'The gatekeeper. Intercepts all traffic, blocks access by default, and coordinates with PDP to allow/deny connection.',
        analogy: 'The physical security guard at the door of the vault who locks or unlocks the gate based on direct orders from the manager.',
        spec: 'An API Gateway, Reverse Proxy, or Service Mesh ingress (e.g. Envoy, NGINX) validating mTLS handshakes and inspecting access tokens.',
        threatModel: 'Threat: DDoS or proxy bypass. Mitigation: Ensure resources are completely hidden behind the PEP with no direct public IPs.',
        bestPractice: 'Decouple policy enforcement (PEP) entirely from policy decision (PDP) to enable rapid updates.'
      },
      pdp: {
        title: 'Policy Decision Point (PDP)',
        role: 'The brain. Evaluates request attributes against active security policies to make final ALLOW/DENY verdicts.',
        analogy: 'The bank manager sitting in the office who looks up the rules and customer record to decide if the security guard should open the gate.',
        spec: 'A centralized engine (like Open Policy Agent - OPA, or custom GRC engines) evaluating attributes based on REGO scripts or XACML schemas.',
        threatModel: 'Threat: Policy injection / hijacking. Mitigation: Enforce strict configuration-as-code pipelines and sign policy bundles.',
        bestPractice: 'Enforce a default-deny policy fallback. If the PDP engine is unresponsive, PEP must reject all traffic.'
      },
      idp: {
        title: 'Identity Provider (IdP) & MFA',
        role: 'Authenticates the user identity and issues cryptographic proof of identity (OIDC ID Tokens).',
        analogy: 'The passport office that verifies your face and documents before issuing a secure, tamper-proof passport.',
        spec: 'Workforce IdPs (e.g. Entra ID, Okta) managing standard user groups, claims, and coordinating FIDO2/WebAuthn public key challenges.',
        threatModel: 'Threat: MFA push-bombing fatigue attacks. Mitigation: Mandate context-aware number matching or pure passwordless FIDO2 keys.',
        bestPractice: 'Centralize identity attributes in a directory with automated joiner/mover/leaver provisioning.'
      },
      mdm: {
        title: 'Device Management (MDM / UEM)',
        role: 'Monitors client device health and posture (OS patch level, firewall status, certificate existence).',
        analogy: 'The state vehicle inspection office verifying that a car is safe, licensed, and equipped with functional brakes before letting it on the highway.',
        spec: 'Systems like Microsoft Intune or Jamf validating endpoint compliance, writing compliance claims directly into the IdP verification loop.',
        threatModel: 'Threat: Spoofed compliance status. Mitigation: Issue ephemeral, hardware-attested certificates to compliant devices.',
        bestPractice: 'Establish absolute zero-trust parameters for devices. Unmanaged or out-of-compliance devices are limited to low-risk resources.'
      },
      resource: {
        title: 'Protected Corporate Resource',
        role: 'The target system, database, or internal API holding sensitive organizational data.',
        analogy: 'The highly-secured safety deposit vault located inside the building that holds the gold bars.',
        spec: 'Internal Kubernetes pods, file shares, or SQL databases decoupled from direct public networks, communicating only via PEP tunnels.',
        threatModel: 'Threat: Lateral movement if PEP is breached. Mitigation: Encrypt all data-at-rest and segment internal networks.',
        bestPractice: 'Enforce micro-segmentation. Treat every sub-service or API database as its own isolated trust boundary.'
      }
    }
  },
  b2b_saas: {
    name: 'Multi-Tenant B2B SaaS Identity Architecture',
    description: 'A structural overview of multi-tenant identity partitioning, tenant-isolated routing, and automated corporate directory synchronization.',
    nodes: {
      tenant_router: {
        title: 'Tenant Router & API Gateway',
        role: 'Inspects subdomains or headers to route incoming queries to the correct isolated tenant resource layer.',
        analogy: 'The building directory board in the lobby directing visitors to Tenant A on Floor 2 vs Tenant B on Floor 3.',
        spec: 'Dynamically parses incoming URLs (e.g. `tenant-a.saasapp.com`) or custom HTTP headers (`X-Tenant-ID`) to bind routing context.',
        threatModel: 'Threat: Cross-tenant data leakage / routing injection. Mitigation: Maintain strict cryptographic tenant context isolation.',
        bestPractice: 'Validate tenant routing parameters on every single request at the gateway boundary.'
      },
      central_auth: {
        title: 'Central Auth Service',
        role: 'Coordinates logins, custom domains, and handles single-sign-on (SSO) federation loops across different customer directories.',
        analogy: 'A global airport customs desk: they check your flight ticket and direct you to federate with your home country’s passport gate.',
        spec: 'An OIDC/SAML relying party engine multiplexing auth pathways based on the user’s corporate email domain (e.g., redirecting `@corp.com` to Entra).',
        threatModel: 'Threat: SSO redirection hijack. Mitigation: Validate exact redirect URI string whitelist matches.',
        bestPractice: 'Support progressive profiling to prevent user friction during initial onboarding.'
      },
      custom_idp: {
        title: 'Enterprise IdP (Customer IdP)',
        role: 'The customer’s home identity directory (e.g. Okta, Ping), letting corporate users use their existing credentials.',
        analogy: 'The corporate office badge that employees already use daily to access their home building.',
        spec: 'Federates with the SaaS application utilizing standard SAML 2.0 or OIDC assertions, sending cryptographically signed XML/JSON payloads.',
        threatModel: 'Threat: XML Signature Wrapping (SSW) attacks. Mitigation: Ensure the signature validates the assertion element, not just the envelope.',
        bestPractice: 'Provide step-by-step SSO configuration wizards with downloadable metadata packages.'
      },
      scim_sync: {
        title: 'Directory Sync Engine (SCIM)',
        role: 'Accepts automated SCIM payloads from corporate directories to keep SaaS user databases instantly in-sync.',
        analogy: 'A direct hotline between HR departments: when an employee is let go, they immediately ring the SaaS system to deactivate their cards.',
        spec: 'An RFC 7644-compliant SCIM 2.0 endpoint handling POST/PUT/PATCH/DELETE calls on `/Users` and `/Groups` resources.',
        threatModel: 'Threat: SCIM token compromise. Mitigation: Use secure, periodically-rotated Bearer tokens or OAuth client credentials.',
        bestPractice: 'Support partial updates (PATCH) rather than full overrides (PUT) to avoid synchronization bottlenecks.'
      },
      isolated_db: {
        title: 'Isolated Database Partitioning',
        role: 'Provides complete separation of customer database layers (Database-per-tenant vs. Shared Database with Row-Level Security).',
        analogy: 'Providing tenants with individual secure locked boxes (Isolated DB) versus renting space in a shared locker with custom partitions (Row-Level).',
        spec: 'Implements PostgreSQL Row Level Security (RLS) policies binding queries to `current_setting(\'app.current_tenant_id\')`.',
        threatModel: 'Threat: SQL injection bypassing row boundaries. Mitigation: Enforce parameterized queries and dedicated database connection pools.',
        bestPractice: 'Enforce Isolated Databases for highly-regulated customers (finance, healthcare) and Row-Level Security for standard tiers.'
      }
    }
  },
  multi_cloud: {
    name: 'Multi-Cloud Identity & Machine Workloads (SPIFFE/SPIRE)',
    description: 'An architectural diagram modeling decentralized, cryptographic machine-to-machine trust across AWS, Google Cloud, and localized clusters.',
    nodes: {
      aws_workload: {
        title: 'AWS Workload Instance',
        role: 'A compute node running inside Amazon Web Services (e.g. EC2 worker, Kubernetes Pod) needing to access resources in GCP.',
        analogy: 'A foreign delivery truck crossing national borders needing to prove its cargo manifest and registration is authentic.',
        spec: 'Runs a SPIFFE Workload Agent locally which communicates over a local Unix domain socket using standard gRPC endpoints.',
        threatModel: 'Threat: Instance identity spoofing. Mitigation: Use AWS Instance Document attestation to verify exact cryptographic runtime IDs.',
        bestPractice: 'Never embed long-lived AWS IAM access keys inside pod code. Use short-lived, rotated token profiles.'
      },
      spire_agent: {
        title: 'SPIFFE / SPIRE Agent',
        role: 'A lightweight node daemon that attests local workloads and coordinates with the central server to issue local cryptographic keys.',
        analogy: 'A local passport application office: they verify your birth certificate locally before sending data to the central print office.',
        spec: 'Communicates with SPIRE Server to obtain SVIDs (SPIFFE Verifiable Identity Documents) and stores them locally in memory.',
        threatModel: 'Threat: Local Unix socket hijacking. Mitigation: Restrict socket read/write permissions to specific operating system group accounts.',
        bestPractice: 'Deploy SPIRE agents as Kubernetes DaemonSets to automate local pod attestation cycles.'
      },
      spire_server: {
        title: 'SPIRE Authority Server',
        role: 'The central authority. Verifies node attestation reports and issues cryptographically signed X.509 SVID credentials.',
        analogy: 'The central national passport bureau that prints, signs, and authorizes the secure passports.',
        spec: 'An enterprise Certificate Authority (CA) signing X.509 certificates and JWT tokens, rotating signing keys automatically every few hours.',
        threatModel: 'Threat: CA signing key compromise. Mitigation: Back the SPIRE server with a physical Hardware Security Module (HSM).',
        bestPractice: 'Establish cluster-wide federated trust bundles to bridge distinct cloud certificate registries.'
      },
      workload_mesh: {
        title: 'Workload Mesh (mTLS Proxy)',
        role: 'Intercepts out-of-cloud network requests and establishes secure Mutual TLS tunnels using issued SVIDs.',
        analogy: 'An armored transport convoy escorting the delivery trucks between clouds, keeping all communications completely invisible to eavesdroppers.',
        spec: 'Envoy proxies running in sidecar configurations, negotiating mTLS handshakes and validating the peer’s X.509 SAN namespaces.',
        threatModel: 'Threat: Insecure proxy routing. Mitigation: Restrict proxy egress to strictly defined service namespaces.',
        bestPractice: 'Keep proxy configurations light and decouple attestation logic from transport proxies.'
      },
      gcp_resource: {
        title: 'GCP Resource (Target Service)',
        role: 'The target workload or database sitting inside Google Cloud platform (e.g. Google Cloud SQL).',
        analogy: 'The secure warehouse inside Google Cloud territory that accepts authorized foreign delivery trucks.',
        spec: 'Validates incoming mTLS connections against the AWS SPIRE Server federated trust bundle, ensuring the SPIFFE ID parses correctly.',
        threatModel: 'Threat: Unauthorized cross-cloud operations. Mitigation: Enforce strict attribute checks inside Google IAM policy sets.',
        bestPractice: 'Segment resources based on SPIFFE namespaces, limiting write privileges to attested workloads.'
      }
    }
  }
}

export default function ArchitectureCenter() {
  const [activeArch, setActiveArch] = useState<ArchitectureType>('zero_trust')
  const [selectedNode, setSelectedNode] = useState<string>('client')
  
  // Animation / simulation trace logs
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  const handleArchChange = (type: ArchitectureType) => {
    setActiveArch(type)
    // Default selected node per architecture
    if (type === 'zero_trust') setSelectedNode('client')
    else if (type === 'b2b_saas') setSelectedNode('tenant_router')
    else if (type === 'multi_cloud') setSelectedNode('aws_workload')
    setSimLogs([])
  }

  const runSimulation = async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimLogs([])

    const addLog = (msg: string) => {
      setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    if (activeArch === 'zero_trust') {
      addLog('🚀 Subject initiates access request to restricted database...')
      setSelectedNode('client')
      await new Promise(r => setTimeout(r, 800))
      
      addLog('📡 Traffic intercepted at PEP ( Envoy gateway). Validating mTLS certificate...')
      setSelectedNode('pep')
      await new Promise(r => setTimeout(r, 800))

      addLog('🧠 PEP queries PDP (Policy Decision Point) to check authorization rules...')
      setSelectedNode('pdp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔐 PDP queries IdP to confirm user "alice.dev" group memberships and active session state...')
      setSelectedNode('idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('📱 PDP queries MDM compliance loop: verifying client machine certificate and posture...')
      setSelectedNode('mdm')
      await new Promise(r => setTimeout(r, 800))

      addLog('✓ PDP outputs ALLOW: User is valid engineer on a compliant, managed machine!')
      setSelectedNode('pdp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔓 PEP opens secure proxy tunnel. Connection established to SQL Database!')
      setSelectedNode('resource')
    } else if (activeArch === 'b2b_saas') {
      addLog('🚀 Enterprise user requests SaaS dashboard via tenant subdomain: tenant-a.saasapp.com...')
      setSelectedNode('tenant_router')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 Router binds tenant-a context. Redirecting to Central Auth Service...')
      setSelectedNode('central_auth')
      await new Promise(r => setTimeout(r, 800))

      addLog('🏢 Central Auth identifies @corp.com. Redirecting to Enterprise Customer IdP via SAML federation...')
      setSelectedNode('custom_idp')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔄 Customer IdP signs SAML assertion, redirecting user back to SaaS API gateway...')
      setSelectedNode('central_auth')
      await new Promise(r => setTimeout(r, 800))

      addLog('👥 Synced user record parsed. Querying Database with Row-Level Security current_tenant_id binding...')
      setSelectedNode('isolated_db')
    } else {
      addLog('🚀 AWS pod worker initiates gRPC connection over Unix socket to request identity document...')
      setSelectedNode('aws_workload')
      await new Promise(r => setTimeout(r, 800))

      addLog('📡 SPIFFE Agent attests pod attributes and forwards data to Central SPIRE Authority...')
      setSelectedNode('spire_agent')
      await new Promise(r => setTimeout(r, 800))

      addLog('📜 SPIRE Server validates AWS instance attestation and issues cryptographically signed X.509 SVID...')
      setSelectedNode('spire_server')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔒 Envoy Sidecar proxy intercepts egress. Establishing mTLS tunnel across clouds using SVID...')
      setSelectedNode('workload_mesh')
      await new Promise(r => setTimeout(r, 800))

      addLog('🔓 Mutually authenticated mTLS session established! GCP Database grants access to validated AWS SPIFFE workload.')
      setSelectedNode('gcp_resource')
    }

    setIsSimulating(false)
  }

  const selectedData = ARCHITECTURE_DATA[activeArch].nodes[selectedNode]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Page Shell Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Interactive Architecture Center</h1>
            <p className="text-xs text-text-secondary">Interactive reference security architectures, threat models, and real-time handshakes</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Layout Map & Diagram Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Architecture tabs */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex justify-between items-center">
            <div className="flex gap-2">
              {(Object.keys(ARCHITECTURE_DATA) as ArchitectureType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleArchChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeArch === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                >
                  {ARCHITECTURE_DATA[key].name.split(' (')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-bold flex items-center gap-1.5 ${isSimulating ? 'bg-bg-nested border-border-subtle text-text-muted cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-hover text-white border-accent-primary shadow-sm shadow-accent-primary/10'}`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? '' : 'animate-pulse'}`} /> 
              {isSimulating ? 'Simulating...' : 'Run Simulation Handshake'}
            </button>
          </div>

          {/* Graphical Diagram Workspace */}
          <div className="border border-border-subtle bg-bg-base rounded-xl p-6 relative min-h-[380px] flex items-center justify-center select-none overflow-x-auto shadow-inner">
            
            {/* --- WORKFORCE ZERO TRUST DIAGRAM --- */}
            {activeArch === 'zero_trust' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-16 items-center justify-center min-w-[500px]">
                
                {/* Row 1: Users, PEP, Resources */}
                <DiagramNode 
                  id="client" 
                  selected={selectedNode === 'client'} 
                  title="Subject Workstation" 
                  icon={Users} 
                  color="blue"
                  onClick={() => setSelectedNode('client')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="pep" 
                  selected={selectedNode === 'pep'} 
                  title="PEP ( Envoy)" 
                  icon={Shield} 
                  color="teal"
                  onClick={() => setSelectedNode('pep')} 
                />

                {/* Vertical Bridge Row */}
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>

                {/* Row 2: MDM, PDP, Resources DB */}
                <DiagramNode 
                  id="mdm" 
                  selected={selectedNode === 'mdm'} 
                  title="MDM (Intune)" 
                  icon={RefreshCw} 
                  color="blue"
                  onClick={() => setSelectedNode('mdm')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="pdp" 
                  selected={selectedNode === 'pdp'} 
                  title="PDP (OPA)" 
                  icon={Cpu} 
                  color="teal"
                  onClick={() => setSelectedNode('pdp')} 
                />

                {/* Vertical Bridge Row 2 */}
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>

                {/* Row 3: IdP, Secure DB Target */}
                <DiagramNode 
                  id="idp" 
                  selected={selectedNode === 'idp'} 
                  title="Directory IdP" 
                  icon={KeySquare} 
                  color="blue"
                  onClick={() => setSelectedNode('idp')} 
                />

                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full h-0.5 bg-border-subtle"></div>
                  <ChevronRight className="w-4 h-4 text-text-muted absolute -top-2 animate-bounce" />
                </div>

                <DiagramNode 
                  id="resource" 
                  selected={selectedNode === 'resource'} 
                  title="Secure DB Resource" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('resource')} 
                />

              </div>
            )}

            {/* --- MULTI-TENANT B2B SAAS DIAGRAM --- */}
            {activeArch === 'b2b_saas' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                
                {/* Row 1: Tenant Router, Customer IdP */}
                <DiagramNode 
                  id="tenant_router" 
                  selected={selectedNode === 'tenant_router'} 
                  title="Tenant Domain Router" 
                  icon={Globe} 
                  color="blue"
                  onClick={() => setSelectedNode('tenant_router')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="custom_idp" 
                  selected={selectedNode === 'custom_idp'} 
                  title="Customer Corp IdP" 
                  icon={KeySquare} 
                  color="teal"
                  onClick={() => setSelectedNode('custom_idp')} 
                />

                {/* Row 2: Central Auth */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <div className="col-span-3 flex justify-center">
                  <DiagramNode 
                    id="central_auth" 
                    selected={selectedNode === 'central_auth'} 
                    title="Central Auth Broker" 
                    icon={Server} 
                    color="blue"
                    onClick={() => setSelectedNode('central_auth')} 
                  />
                </div>

                {/* Row 3: SCIM Sync, Isolated DB */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode 
                  id="scim_sync" 
                  selected={selectedNode === 'scim_sync'} 
                  title="SCIM Sync Engine" 
                  icon={RefreshCw} 
                  color="teal"
                  onClick={() => setSelectedNode('scim_sync')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="isolated_db" 
                  selected={selectedNode === 'isolated_db'} 
                  title="Tenant Isolated DB" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('isolated_db')} 
                />

              </div>
            )}

            {/* --- MULTI-CLOUD WORKLOAD DIAGRAM --- */}
            {activeArch === 'multi_cloud' && (
              <div className="grid grid-cols-3 gap-y-12 gap-x-12 items-center justify-center min-w-[500px]">
                
                {/* AWS compute Workload */}
                <DiagramNode 
                  id="aws_workload" 
                  selected={selectedNode === 'aws_workload'} 
                  title="AWS Pod Workload" 
                  icon={Cloud} 
                  color="blue"
                  onClick={() => setSelectedNode('aws_workload')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                {/* Local agent */}
                <DiagramNode 
                  id="spire_agent" 
                  selected={selectedNode === 'spire_agent'} 
                  title="SPIRE Attest Agent" 
                  icon={Shield} 
                  color="blue"
                  onClick={() => setSelectedNode('spire_agent')} 
                />

                {/* Vertical to Server */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                {/* Central server */}
                <div className="col-span-3 flex justify-center">
                  <DiagramNode 
                    id="spire_server" 
                    selected={selectedNode === 'spire_server'} 
                    title="SPIRE Cert Authority" 
                    icon={Server} 
                    color="teal"
                    onClick={() => setSelectedNode('spire_server')} 
                  />
                </div>

                {/* Down to proxy & GCP target */}
                <div className="h-10"></div>
                <div className="h-10 border-l border-dashed border-border-subtle mx-auto"></div>
                <div className="h-10"></div>

                <DiagramNode 
                  id="workload_mesh" 
                  selected={selectedNode === 'workload_mesh'} 
                  title="mTLS Workload Mesh" 
                  icon={Network} 
                  color="teal"
                  onClick={() => setSelectedNode('workload_mesh')} 
                />

                <div className="w-full h-0.5 bg-border-subtle"></div>

                <DiagramNode 
                  id="gcp_resource" 
                  selected={selectedNode === 'gcp_resource'} 
                  title="GCP Secure Resource" 
                  icon={Database} 
                  color="emerald"
                  onClick={() => setSelectedNode('gcp_resource')} 
                />

              </div>
            )}

          </div>

          {/* Interactive simulated execution traces */}
          <div className="border border-border-subtle bg-bg-card rounded-xl p-4 shadow flex-1 min-h-[140px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-2 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-accent-primary" /> Active Handshake Trace Logs
              </div>
              
              <div className="space-y-1 text-[11px] font-mono leading-normal max-h-32 overflow-y-auto pr-1">
                {simLogs.length === 0 ? (
                  <span className="text-text-muted italic select-none">No active handshake trace. Click "Run Simulation Handshake" above to watch packets route.</span>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="text-text-primary">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {simLogs.length > 0 && !isSimulating && (
              <span className="block text-[9px] text-status-success font-bold font-mono mt-2 animate-pulse">
                ✓ Handshake completed. Dynamic parameters resolved securely.
              </span>
            )}
          </div>

        </div>

        {/* Right Side: Component Details and Specs */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
          {selectedData ? (
            <div className="space-y-5">
              <div className="border-b border-border-subtle pb-3">
                <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider block mb-0.5">Selected Node Component</span>
                <h2 className="text-base font-black text-text-primary">{selectedData.title}</h2>
              </div>

              <div>
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-1">Functional Role</span>
                <p className="text-xs text-text-secondary leading-normal">{selectedData.role}</p>
              </div>

              <div className="bg-bg-nested/60 border border-border-subtle p-3 rounded-lg">
                <span className="text-[9px] text-accent-primary font-bold uppercase tracking-wider block mb-1">Friendly Analogy</span>
                <p className="text-xs text-text-secondary leading-relaxed italic">"{selectedData.analogy}"</p>
              </div>

              <div>
                <span className="text-[9px] text-accent-secondary font-bold uppercase tracking-wider block mb-1 font-mono">Expert Specifications</span>
                <p className="text-xs text-text-secondary leading-normal font-mono text-[11px]">{selectedData.spec}</p>
              </div>

              <div className="border border-status-danger/30 bg-status-danger/5 p-3 rounded-lg text-status-danger">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-danger">Threat Model & Mitigation</span>
                <p className="text-xs leading-normal">{selectedData.threatModel}</p>
              </div>

              <div className="border border-status-success/30 bg-status-success/5 p-3 rounded-lg text-status-success">
                <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-status-success">Architect Best Practice</span>
                <p className="text-xs leading-normal">{selectedData.bestPractice}</p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center select-none gap-2">
              <Network className="w-8 h-8 text-text-muted animate-pulse" />
              <span>Click on any box in the diagram to inspect its deep-dive workforce role, trust boundaries, threat models, and best practices.</span>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-border-subtle/60">
            <span className="text-[9px] text-text-muted font-mono block text-center">Reference Model: NIST SP 800-207 & RFC Standards.</span>
          </div>
        </div>

      </div>
    </div>
  )
}

function DiagramNode({ 
  selected, title, icon: Icon, color, onClick 
}: { 
  id: string
  selected: boolean
  title: string
  icon: any
  color: 'blue' | 'teal' | 'emerald'
  onClick: () => void 
}) {
  const colorClasses = {
    blue: selected ? 'bg-accent-glow border-accent-primary text-accent-primary shadow shadow-accent-primary/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle',
    teal: selected ? 'bg-accent-glow border-accent-secondary text-accent-secondary shadow shadow-accent-secondary/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle',
    emerald: selected ? 'bg-status-success/10 border-status-success text-status-success shadow shadow-status-success/20' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer min-w-[125px] ${colorClasses[color]}`}
    >
      <Icon className={`w-5 h-5 ${selected ? 'text-accent-primary' : 'text-text-muted'}`} />
      <span className="text-[10px] font-bold tracking-tight block max-w-[110px]">{title}</span>
    </button>
  )
}
