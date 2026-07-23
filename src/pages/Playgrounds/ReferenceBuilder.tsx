import { useState, useEffect, useRef } from 'react'
import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Server, Shield, Cpu, Key, Network, Terminal,
  RotateCcw, Plus, Trash2, Download, Sliders,
  X, Lock, Laptop, Cloud, Database
} from 'lucide-react'

// Icon mapping dictionary
const ICON_MAP: Record<string, LucideIcon> = {
  'entra-id': Shield,
  'okta': Key,
  'keycloak': Lock,
  'active-directory': Database,
  'ldap-directory': Server,
  'custom-web-app': Laptop,
  'b2b-saas-app': Cloud,
  'rest-api': Cpu,
  'api-gateway': Network,
  'pam-vault': Shield,
  'user-device': Laptop,
}

// Protocols configuration
interface ProtocolType {
  id: string
  name: string
  desc: string
  color: string
}

const PROTOCOLS: ProtocolType[] = [
  { id: 'oidc', name: 'OIDC + PKCE', desc: 'OAuth 2.1 authentication flow using ephemeral PKCE challenge.', color: 'stroke-accent-primary text-accent-primary' },
  { id: 'saml', name: 'SAML 2.0 Web SSO', desc: 'XML-based assertion exchange with digital signatures.', color: 'stroke-teal-500 text-teal-500' },
  { id: 'scim', name: 'SCIM 2.0 Sync', desc: 'REST-based CRUD provisioning pipeline for user synchronization.', color: 'stroke-amber-500 text-amber-500' },
  { id: 'ldap', name: 'LDAP Active Directory', desc: 'Standard LDAP directory searches and authentication calls.', color: 'stroke-blue-500 text-blue-500' },
  { id: 'kerberos', name: 'Kerberos tickets', desc: 'Symmetric ticketing AS/TGS credentials exchange.', color: 'stroke-purple-500 text-purple-500' },
  { id: 'mtls', name: 'mTLS Secure Link', desc: 'Asymmetric mutual TLS handshake with certificate exchange.', color: 'stroke-emerald-500 text-emerald-500' }
]

// Base node interface
interface Node {
  id: string
  name: string
  type: 'idp' | 'directory' | 'resource' | 'gateway' | 'device'
  x: number // percentage coordinate on canvas
  y: number // percentage coordinate on canvas
  iconName: string
  desc: string
  mfaEnforced: boolean
  domain: string
  status: 'active' | 'degraded' | 'disabled'
}

// Base connection interface
interface Connection {
  id: string
  from: string
  to: string
  protocol: string
  label: string
}

// Pre-populated Enterprise Hybrid Template Blueprint
const DEFAULT_NODES: Node[] = [
  {
    id: 'entra-id',
    name: 'Entra ID Cloud IdP',
    type: 'idp',
    x: 45,
    y: 15,
    iconName: 'entra-id',
    desc: 'Primary Azure tenant managing cloud authorization rules and OIDC apps.',
    mfaEnforced: true,
    domain: 'login.microsoftonline.com',
    status: 'active'
  },
  {
    id: 'active-directory',
    name: 'On-Prem Active Directory',
    type: 'directory',
    x: 15,
    y: 45,
    iconName: 'active-directory',
    desc: 'Local corporate directory service housing legacy user profiles.',
    mfaEnforced: false,
    domain: 'corp.local',
    status: 'active'
  },
  {
    id: 'user-device',
    name: 'Employee Laptop',
    type: 'device',
    x: 45,
    y: 80,
    iconName: 'user-device',
    desc: 'Corporate employee workstation requesting intranet access.',
    mfaEnforced: true,
    domain: 'workstation-99.corp.local',
    status: 'active'
  },
  {
    id: 'custom-web-app',
    name: 'Custom Portal (SPA)',
    type: 'resource',
    x: 80,
    y: 45,
    iconName: 'custom-web-app',
    desc: 'In-house single page application federated to Entra ID.',
    mfaEnforced: true,
    domain: 'portal.company.com',
    status: 'active'
  },
  {
    id: 'b2b-saas-app',
    name: 'Salesforce ERP',
    type: 'resource',
    x: 80,
    y: 15,
    iconName: 'b2b-saas-app',
    desc: 'External cloud SaaS application connected via SAML SSO.',
    mfaEnforced: true,
    domain: 'company.my.salesforce.com',
    status: 'active'
  }
]

const DEFAULT_CONNECTIONS: Connection[] = [
  {
    id: 'conn_ad_entra',
    from: 'active-directory',
    to: 'entra-id',
    protocol: 'scim',
    label: 'DirSync Provisioning'
  },
  {
    id: 'conn_device_entra',
    from: 'user-device',
    to: 'entra-id',
    protocol: 'oidc',
    label: 'Authentication Redirect'
  },
  {
    id: 'conn_device_app',
    from: 'user-device',
    to: 'custom-web-app',
    protocol: 'mtls',
    label: 'Secure Access SPA'
  },
  {
    id: 'conn_entra_saas',
    from: 'entra-id',
    to: 'b2b-saas-app',
    protocol: 'saml',
    label: 'SAML Web Trust'
  },
  {
    id: 'conn_entra_app',
    from: 'entra-id',
    to: 'custom-web-app',
    protocol: 'oidc',
    label: 'OIDC Token Exchange'
  }
]

export default function ReferenceBuilder() {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES)
  const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS)
  
  // Selection and editing state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  
  // Handshake simulation states
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const [activeSimulationType, setSimulationType] = useState<'oidc' | 'saml' | 'scim' | 'kerberos' | null>(null)
  const [traceLogs, setTraceLogs] = useState<string[]>([])
  
  // Interactive line creator state
  const [connectionCreator, setConnectionCreator] = useState<{
    step: 'from' | 'to'
    fromNodeId?: string
    protocol: string
  } | null>(null)

  // Drag-and-drop state reference
  const canvasRef = useRef<HTMLDivElement>(null)
  const draggedNodeIdRef = useRef<string | null>(null)

  const selectedNode = nodes.find(n => n.id === selectedNodeId)
  const selectedConnection = connections.find(c => c.id === selectedConnectionId)

  const getSimulationStepsCount = (type: 'oidc' | 'saml' | 'scim' | 'kerberos') => {
    return type === 'oidc' ? 6 : type === 'saml' ? 5 : type === 'scim' ? 5 : 5
  }

  const getSimulationLogs = (type: 'oidc' | 'saml' | 'scim' | 'kerberos', step: number): string[] => {
    const isMfa = nodes.find(n => n.id === 'entra-id')?.mfaEnforced ?? true

    const flows: Record<string, Record<number, string[]>> = {
      oidc: {
        2: [
          `[REDIRECT] Redirecting browser to Entra ID Auth Endpoint with code_challenge.`,
          `URL: https://login.microsoftonline.com/oauth2/v2.0/authorize?client_id=spa_99&response_type=code&code_challenge=xyz...`,
          `Sending packets from workstation to Entra ID...`
        ],
        3: [
          `[IdP] Entra ID intercepts request. User authenticated.`,
          isMfa
            ? `[MFA] Enforced! Prompting Face ID check on employee workstation... Verified! ✔`
            : `[MFA] Bypassed! (MFA is currently DISABLED in Entra ID properties).`,
          `[IdP] Generating cryptographically random Authorization Code (code_a5b9)...`
        ],
        4: [
          `[REDIRECT] Redirecting back to App callback URI with auth code.`,
          `URL: https://portal.company.com/callback?code=code_a5b9`,
          `App intercepts Authorization Code from redirect URI...`
        ],
        5: [
          `[CLIENT] Initiating Back-Channel Token Exchange with client credentials.`,
          `POST to /token endpoint with Authorization Code + PKCE code_verifier...`,
          `[IdP] Verifying code_verifier hash against original challenge... MATCH! ✔`
        ],
        6: [
          `[IdP] Issuing RSA-SHA256 Signed tokens: ID Token (IDaaS profile) + Access Token.`,
          `[CLIENT] Local validation successful via Entra ID public JWKS keys.`,
          `🎉 SUCCESS: User session established. Dashboard accessed secure. Handshake complete!`
        ]
      },
      saml: {
        2: [
          `[REDIRECT] Redirecting client workstation with base64-encoded SAMLRequest.`,
          `URL: https://login.microsoftonline.com/saml/sso?SAMLRequest=fZDRboMwD...`,
          `Connecting to cloud Identity Provider...`
        ],
        3: [
          `[IdP] Entra ID decodes SAMLRequest, authenticates user session.`,
          isMfa
            ? `[MFA] Entra ID Enforced: biometric check successful. ✔`
            : `[MFA] Skip (MFA is disabled in properties).`,
          `[IdP] Generating SAML Assertion: [Subject: Alice, Role: Administrator, Issuer: company_idp]`
        ],
        4: [
          `[IdP] Cryptographically signing XML Statement using SAML Token Signing Key.`,
          `[REDIRECT] Returning signed SAMLResponse XML wrapper to Client Browser redirect...`,
          `Client workstation submits signed assertion automatically via POST callback...`
        ],
        5: [
          `[SP] Salesforce decodes SAMLResponse XML wrapper.`,
          `[SP] Verifying digital signature against registered public certificate... SUCCESS! ✔`,
          `🎉 SUCCESS: Federation Trust established! SP session granted with Admin scopes.`
        ]
      },
      scim: {
        2: [
          `[IdP] Detecting changes: User 'John Doe' added to 'Engineering' directory group.`,
          `[IdP] Building standard SCIM 2.0 User JSON payload (RFC 7643 Schema)...`
        ],
        3: [
          `[IdP] Querying SCIM /Users target endpoint at Custom Portal...`,
          `Request: POST https://portal.company.com/scim/v2/Users with payload headers.`
        ],
        4: [
          `[SP] Custom Portal process request. Validating Bearer Auth Token... verified. ✔`,
          `[SP] Writing record to local database table: Creating portal user profile...`
        ],
        5: [
          `[SP] Return SCIM JSON payload: HTTP 201 Created (ID: usr_8a92f0).`,
          `[IdP] Directory Sync synchronization queue: SUCCESS! John Doe successfully provisioned. 🎉`
        ]
      },
      kerberos: {
        2: [
          `[CLIENT] Crafting plaintext request to Active Directory KDC.`,
          `Sent: Requesting Ticket Granting Ticket (TGT) for domain user...`
        ],
        3: [
          `[KDC] Authentication Server (AS) verifies user, generates Session Key.`,
          `[KDC] Returns TGT encrypted with AD Krbtgt Key, and Session Key encrypted with User Password Hash.`
        ],
        4: [
          `[CLIENT] Decrypts Session Key locally with user password. Requests Service Ticket (ST) from KDC.`,
          `[KDC] Ticket Granting Server (TGS) validates TGT, returns ST encrypted with target App Key.`
        ],
        5: [
          `[CLIENT] Presents Service Ticket to target App Server.`,
          `[SERVER] Server decrypts ST using its pre-shared key... MATCH! ✔`,
          `🎉 SUCCESS: Kerberos session authorized. Secure intranet connection established!`
        ]
      }
    }

    return flows[type][step] || []
  }

  const advanceSimulationStep = () => {
    setSimulationStep(prev => {
      const nextStep = prev + 1
      const logs = getSimulationLogs(activeSimulationType!, nextStep)
      setTraceLogs(p => [...p, ...logs])
      return nextStep
    })
  }

  // Simulation step timeouts for handshakes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (simulationActive && activeSimulationType) {
      const stepsCount = getSimulationStepsCount(activeSimulationType)
      if (simulationStep < stepsCount) {
        timer = setTimeout(() => {
          advanceSimulationStep()
        }, 2200)
      } else {
        timer = setTimeout(() => setSimulationActive(false), 0)
      }
    }
    return () => clearTimeout(timer)
    // advanceSimulationStep is an unmemoized closure recreated every render;
    // the deps below already cover everything it reads (activeSimulationType)
    // and cancel the pending timer via cleanup whenever any of them change, so
    // listing the function itself would only add spurious timer resets on
    // unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationActive, simulationStep, activeSimulationType])

  // HTML5 Drag-and-drop handlers
  const handleDragStart = (e: DragEvent, nodeId: string) => {
    draggedNodeIdRef.current = nodeId
    e.dataTransfer.setData('text/plain', nodeId)
    // Make transparent drag preview
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault()
    if (!canvasRef.current || !draggedNodeIdRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Constrain coordinates into [2, 92]% to keep cards cleanly inside canvas borders
    const boundedX = Math.max(2, Math.min(88, Math.round(x)))
    const boundedY = Math.max(2, Math.min(88, Math.round(y)))

    const nodeId = draggedNodeIdRef.current
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: boundedX, y: boundedY } : n))
    draggedNodeIdRef.current = null
  }

  // Node operations
  const addNewNode = (type: 'idp' | 'directory' | 'resource' | 'gateway' | 'device') => {
    const id = `node_${Date.now()}`
    let name: string
    let iconName: string
    let domain: string
    let desc: string

    if (type === 'idp') {
      name = 'Okta SSO Identity Provider'
      iconName = 'okta'
      domain = 'identity.company.okta.com'
      desc = 'External IDP handling SAML redirects and user scopes.'
    } else if (type === 'directory') {
      name = 'LDAP Directory Node'
      iconName = 'ldap-directory'
      domain = 'ldap.corp.internal'
      desc = 'Directory replica syncing directory objects.'
    } else if (type === 'gateway') {
      name = 'WAF API Gateway'
      iconName = 'api-gateway'
      domain = 'api.gateway.company.com'
      desc = 'Reverse proxy authorizing inbound OAuth bearers.'
    } else if (type === 'device') {
      name = 'Contractor Tablet'
      iconName = 'user-device'
      domain = 'tablet-12.corp.local'
      desc = 'Contractor handset auditing secure endpoints.'
    } else {
      name = 'Protected Microservice'
      iconName = 'rest-api'
      domain = 'payment-srv.corp.local'
      desc = 'Internal microservice containing sensitive resources.'
    }

    const newNode: Node = {
      id,
      name,
      type,
      x: 35 + Math.random() * 20,
      y: 35 + Math.random() * 20,
      iconName,
      desc,
      mfaEnforced: false,
      domain,
      status: 'active'
    }

    setNodes(prev => [...prev, newNode])
    setSelectedNodeId(id)
    setSelectedConnectionId(null)
  }

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return
    // Purge node
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId))
    // Purge connected trust lines
    setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId))
    setSelectedNodeId(null)
  }

  // Connection operations
  const startConnecting = (protocol: string) => {
    setConnectionCreator({ step: 'from', protocol })
    setSelectedNodeId(null)
    setSelectedConnectionId(null)
    setTraceLogs([`[BUILDER] Connect Mode Active: Select the SOURCE identity node...`])
  }

  const handleNodeClickForConnection = (nodeId: string) => {
    if (!connectionCreator) return

    if (connectionCreator.step === 'from') {
      setConnectionCreator(prev => ({ ...prev!, step: 'to', fromNodeId: nodeId }))
      setTraceLogs([`[BUILDER] Source node set to: ${nodeId}. Now select the TARGET destination node...`])
    } else if (connectionCreator.step === 'to') {
      const fromNodeId = connectionCreator.fromNodeId!
      const targetNodeId = nodeId

      if (fromNodeId === targetNodeId) {
        setTraceLogs([`🚨 ERROR: Cannot create a loop link onto the exact same node.`])
        setConnectionCreator(null)
        return
      }

      // Check if connection already exists
      const exists = connections.some(c => (c.from === fromNodeId && c.to === targetNodeId) || (c.from === targetNodeId && c.to === fromNodeId))
      if (exists) {
        setTraceLogs([`🚨 ERROR: An active trust connection already exists between these two nodes.`])
        setConnectionCreator(null)
        return
      }

      const protoDetails = PROTOCOLS.find(p => p.id === connectionCreator.protocol)!
      const newConnection: Connection = {
        // Only ever invoked from a node's onClick while connect-mode is active, never during render.
        // eslint-disable-next-line react-hooks/purity
        id: `conn_${Date.now()}`,
        from: fromNodeId,
        to: targetNodeId,
        protocol: connectionCreator.protocol,
        label: `${protoDetails.name} Connection`
      }

      setConnections(prev => [...prev, newConnection])
      setTraceLogs([`✔ SUCCESS: Trust connection established successfully using standard ${protoDetails.name}!`])
      setConnectionCreator(null)
    }
  }

  const deleteSelectedConnection = () => {
    if (!selectedConnectionId) return
    setConnections(prev => prev.filter(c => c.id !== selectedConnectionId))
    setSelectedConnectionId(null)
  }

  // Simulation handshake flows
  const startSimulation = (type: 'oidc' | 'saml' | 'scim' | 'kerberos') => {
    localStorage.setItem('aboutiam-builder-configured', 'true')
    setSimulationType(type)
    setSimulationStep(1)
    setSimulationActive(true)
    
    // Initial logs based on simulation type
    const initialLogs: Record<string, string[]> = {
      oidc: [
        `[SIMULATION START] Initiating OIDC Authorization Code Flow + PKCE...`,
        `[CLIENT] User attempts logon on corporate workstation.`,
        `Checking secure credentials... Session token: EXPIRED.`
      ],
      saml: [
        `[SIMULATION START] Initiating SAML 2.0 Federated SSO Handshake...`,
        `[CLIENT] User navigates to Salesforce ERP App.`,
        `App detects federation set to Entra ID. Crafting SAMLRequest...`
      ],
      scim: [
        `[SIMULATION START] Starting SCIM 2.0 User Lifecycle Provisioning loop...`,
        `[IdP] Directory Sync triggered: Joiner-Mover-Leaver audit active.`,
        `Awaiting database pipeline payload queue...`
      ],
      kerberos: [
        `[SIMULATION START] Initializing Kerberos ticket exchange...`,
        `[CLIENT] User requests access to corporate intranet files.`,
        `Client looks up local Active Directory DC IP...`
      ]
    }

    setTraceLogs(initialLogs[type])
  }

  // Simulation line drawing helpers
  const getConnectionCoordinates = (conn: Connection) => {
    const fromNode = nodes.find(n => n.id === conn.from)
    const toNode = nodes.find(n => n.id === conn.to)
    
    if (!fromNode || !toNode) return { x1: 0, y1: 0, x2: 0, y2: 0 }
    
    // Add offsets to target the centers of node cards (assuming 150x80px card roughly mapped to percents)
    return {
      x1: fromNode.x + 6,
      y1: fromNode.y + 4,
      x2: toNode.x + 6,
      y2: toNode.y + 4
    }
  }

  // Get active connection protocol path for styling
  const getConnectionStyle = (conn: Connection) => {
    const isSelected = selectedConnectionId === conn.id
    const activeProto = PROTOCOLS.find(p => p.id === conn.protocol)
    const strokeColor = isSelected ? 'stroke-accent-primary stroke-[3px]' : activeProto ? activeProto.color.split(' ')[0] + ' stroke-[1.5px]' : 'stroke-border-subtle stroke-[1px]'
    return { strokeColor }
  }

  // Export functions (SVG & JSON)
  const exportTopologyAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, connections }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "aboutiam_reference_architecture.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const exportTopologyAsSvg = () => {
    // Dynamically program an exportable SVG block representing the canvas layout
    const svgLines = connections.map(conn => {
      const { x1, y1, x2, y2 } = getConnectionCoordinates(conn)
      const color = conn.protocol === 'oidc' ? '#3b82f6' : conn.protocol === 'saml' ? '#14b8a6' : conn.protocol === 'scim' ? '#f59e0b' : '#3b82f6'
      return `  <!-- Connection: ${conn.label} -->
  <line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="${color}" stroke-width="2" stroke-dasharray="4" />
  <text x="${(x1 + x2) / 2}%" y="${(y1 + y2) / 2 - 2}%" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">${conn.label}</text>`
    }).join('\n')

    const svgNodes = nodes.map(node => {
      // Scale nodes into a standard 1000x500 box coordinate system
      const left = node.x * 10
      const top = node.y * 5
      const color = node.type === 'idp' ? '#3b82f6' : node.type === 'directory' ? '#f59e0b' : '#14b8a6'
      return `  <!-- Node: ${node.name} -->
  <g transform="translate(${left}, ${top})">
    <rect width="140" height="60" rx="10" fill="#0d1222" stroke="${color}" stroke-width="1.5" />
    <text x="70" y="25" fill="#f8fafc" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">${node.name}</text>
    <text x="70" y="42" fill="#94a3b8" font-size="9" font-family="sans-serif" text-anchor="middle">${node.domain}</text>
  </g>`
    }).join('\n')

    const fullSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" style="background-color: #070a13;">
  <rect width="1000" height="500" fill="#070a13" />
  <!-- Grid overlay -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="0.5" fill="#334155" />
    </pattern>
  </defs>
  <rect width="1000" height="500" fill="url(#grid)" />

${svgLines}

${svgNodes}
</svg>`

    const dataStr = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(fullSvg)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "aboutiam_reference_architecture.svg")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const resetTopology = () => {
    setNodes(DEFAULT_NODES)
    setConnections(DEFAULT_CONNECTIONS)
    setSelectedNodeId(null)
    setSelectedConnectionId(null)
    setSimulationActive(false)
    setSimulationStep(0)
    setSimulationType(null)
    setTraceLogs([`[BUILDER] Topology reset successfully to corporate hybrid default template blueprint.`])
  }

  const clearCanvas = () => {
    setNodes([])
    setConnections([])
    setSelectedNodeId(null)
    setSelectedConnectionId(null)
    setSimulationActive(false)
    setSimulationStep(0)
    setSimulationType(null)
    setTraceLogs([`[BUILDER] Canvas cleared. Use the left toolbox to drag or add new identity components!`])
  }

  // Get SVG line animation path during simulation
  const getSimulationLinePath = () => {
    if (!simulationActive || !activeSimulationType) return null
    
    // Choose connection trust line to animate based on simulation steps
    let targetConnId = ''
    if (activeSimulationType === 'oidc') {
      if (simulationStep === 2) targetConnId = 'conn_device_entra'
      if (simulationStep === 3) targetConnId = 'conn_device_entra'
      if (simulationStep === 4) targetConnId = 'conn_device_app'
      if (simulationStep === 5) targetConnId = 'conn_entra_app'
    } else if (activeSimulationType === 'saml') {
      if (simulationStep === 2) targetConnId = 'conn_device_entra'
      if (simulationStep === 3) targetConnId = 'conn_device_entra'
      if (simulationStep === 4) targetConnId = 'conn_entra_saas'
    } else if (activeSimulationType === 'scim') {
      if (simulationStep === 2 || simulationStep === 3) targetConnId = 'conn_ad_entra'
      if (simulationStep === 4) targetConnId = 'conn_entra_app'
    }

    const conn = connections.find(c => c.id === targetConnId)
    if (!conn) return null

    return getConnectionCoordinates(conn)
  }

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Network className="w-3.5 h-3.5" /> Enterprise Blueprint Designer
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Enterprise IAM Reference Builder
        </h2>
        <p className="text-text-secondary">
          Design secure enterprise topologies natively. Drag and drop identity providers, Directories, API targets, and devices onto our radial-grid canvas. Define cryptographically secure protocols, run step-by-step handshake trace logs, and export editable vector SVG diagrams!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANE: Component Toolbox & Actions (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Node Spawners */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-accent-primary" /> Component Toolbox
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Click any element below to spawn it on the design canvas:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => addNewNode('idp')}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center gap-2.5 text-xs text-text-primary font-bold text-left"
              >
                <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">Identity Provider (IdP)</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Okta, Entra ID</span>
                </div>
              </button>

              <button
                onClick={() => addNewNode('directory')}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center gap-2.5 text-xs text-text-primary font-bold text-left"
              >
                <div className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">User Directory</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Active Directory, LDAP</span>
                </div>
              </button>

              <button
                onClick={() => addNewNode('gateway')}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center gap-2.5 text-xs text-text-primary font-bold text-left"
              >
                <div className="w-6 h-6 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Network className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">API Gateway Proxy</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">WAF, Reverse Proxy</span>
                </div>
              </button>

              <button
                onClick={() => addNewNode('device')}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center gap-2.5 text-xs text-text-primary font-bold text-left"
              >
                <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">User Device</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Employee laptop, workstation</span>
                </div>
              </button>

              <button
                onClick={() => addNewNode('resource')}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle hover:border-accent-primary bg-bg-nested hover:bg-bg-sidebar transition-all flex items-center gap-2.5 text-xs text-text-primary font-bold text-left"
              >
                <div className="w-6 h-6 rounded bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">Target Application</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Custom App (SPA), cloud SaaS</span>
                </div>
              </button>
            </div>
          </div>

          {/* Connection Link Creator */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-accent-secondary" /> Trust Connectors
            </h4>
            <p className="text-[11px] text-text-secondary leading-normal">
              Select a secure communication protocol to link two nodes on the canvas:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {PROTOCOLS.map(proto => (
                <button
                  key={proto.id}
                  onClick={() => startConnecting(proto.id)}
                  className={`py-2 px-2 rounded-lg border text-[10px] font-bold transition-all text-center ${
                    connectionCreator?.protocol === proto.id
                      ? 'bg-accent-glow/10 border-accent-primary text-accent-primary'
                      : 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar text-text-secondary'
                  }`}
                  title={proto.desc}
                >
                  {proto.name}
                </button>
              ))}
            </div>

            {connectionCreator && (
              <div className="p-2.5 rounded bg-accent-glow/5 border border-accent-primary/20 text-[10px] font-semibold text-accent-primary flex items-center justify-between">
                <span>
                  {connectionCreator.step === 'from' 
                    ? 'Awaiting SOURCE Node...' 
                    : 'Awaiting TARGET Node...'}
                </span>
                <button 
                  onClick={() => setConnectionCreator(null)}
                  className="p-0.5 rounded hover:bg-accent-glow"
                  title="Cancel connection"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE PANE: Interactive Grid Canvas (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick blueprint actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={resetTopology}
                className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle hover:border-accent-primary/30 text-text-secondary hover:text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-accent-primary" /> Load Template
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle hover:border-status-danger/30 text-text-secondary hover:text-status-danger text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-status-danger" /> Clear Canvas
              </button>
            </div>

            {/* Handshake Simulation Triggers */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black text-text-muted uppercase mr-1">Simulate:</span>
              <button
                disabled={simulationActive}
                onClick={() => startSimulation('oidc')}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wide transition-all shadow"
              >
                OIDC
              </button>
              <button
                disabled={simulationActive}
                onClick={() => startSimulation('saml')}
                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wide transition-all shadow"
              >
                SAML
              </button>
              <button
                disabled={simulationActive}
                onClick={() => startSimulation('scim')}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wide transition-all shadow"
              >
                SCIM
              </button>
            </div>
          </div>

          {/* Interactive Drag-and-Drop Canvas Container */}
          <div 
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleCanvasDrop}
            style={{
              backgroundImage: 'radial-gradient(var(--color-border-subtle) 1px, transparent 1px)',
              backgroundSize: '22px 22px'
            }}
            className="relative overflow-hidden w-full h-[480px] bg-bg-nested border border-border-subtle rounded-2xl shadow-inner select-none"
          >
            {/* SVG Connections Overlay behind node elements */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {connections.map((conn) => {
                const { x1, y1, x2, y2 } = getConnectionCoordinates(conn)
                const { strokeColor } = getConnectionStyle(conn)
                return (
                  <g key={conn.id}>
                    {/* Main connect line */}
                    <line
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      className={`${strokeColor} stroke-dasharray-4 transition-all duration-300`}
                    />
                    
                    {/* Protocol mid-line pill */}
                    <foreignObject
                      x={`${(x1 + x2) / 2 - 4.5}%`}
                      y={`${(y1 + y2) / 2 - 2}%`}
                      width="90"
                      height="20"
                      className="overflow-visible"
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConnectionId(conn.id)
                          setSelectedNodeId(null)
                        }}
                        className={`pointer-events-auto cursor-pointer px-1.5 py-0.5 rounded-full border text-[8px] font-black tracking-wide uppercase text-center transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                          selectedConnectionId === conn.id
                            ? 'bg-accent-primary text-white border-accent-primary shadow'
                            : 'bg-bg-card border-border-subtle text-text-secondary hover:border-accent-primary'
                        }`}
                      >
                        {conn.protocol}
                      </div>
                    </foreignObject>
                  </g>
                )
              })}

              {/* Simulation Packet Animation Layer */}
              {simulationActive && activeSimulationType && getSimulationLinePath() && (
                <motion.circle
                  r="6"
                  fill={activeSimulationType === 'oidc' ? '#3b82f6' : activeSimulationType === 'saml' ? '#14b8a6' : '#f59e0b'}
                  initial={{ 
                    cx: `${getSimulationLinePath()!.x1}%`, 
                    cy: `${getSimulationLinePath()!.y1}%` 
                  }}
                  animate={{ 
                    cx: `${getSimulationLinePath()!.x2}%`, 
                    cy: `${getSimulationLinePath()!.y2}%` 
                  }}
                  transition={{ 
                    duration: 1.8, 
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="shadow shadow-accent-primary/50"
                />
              )}
            </svg>

            {/* Canvas Nodes Loop */}
            {nodes.map((node) => {
              const Icon = ICON_MAP[node.iconName] || Shield
              const isSelected = selectedNodeId === node.id
              const isSourceInConnector = connectionCreator?.fromNodeId === node.id
              
              let borderClass = 'border-border-subtle hover:border-accent-primary/50 shadow-sm'
              if (isSelected) borderClass = 'border-accent-primary ring-2 ring-accent-primary/20 shadow'
              if (isSourceInConnector) borderClass = 'border-accent-secondary animate-pulse shadow'

              return (
                <div
                  key={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  onClick={() => {
                    if (connectionCreator) {
                      handleNodeClickForConnection(node.id)
                    } else {
                      setSelectedNodeId(node.id)
                      setSelectedConnectionId(null)
                    }
                  }}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`
                  }}
                  className={`absolute w-32 cursor-pointer p-2.5 rounded-xl bg-bg-card border select-none z-10 transition-shadow ${borderClass}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-border-subtle ${
                      node.type === 'idp' ? 'bg-blue-500/10 text-blue-500' :
                      node.type === 'directory' ? 'bg-amber-500/10 text-amber-500' :
                      node.type === 'device' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-teal-500/10 text-teal-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black text-text-primary truncate">{node.name}</span>
                      <span className="block text-[8px] text-text-muted truncate mt-0.5">{node.domain}</span>
                    </div>
                  </div>

                  {/* Operational status marker */}
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active" />
                </div>
              )
            })}
          </div>

          {/* DIAGNOSTIC TERMINAL WINDOW (Simulation output) */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-accent-primary animate-pulse" /> Diagnostic Trace Console
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">
                Status: {simulationActive ? 'ANIMATING' : 'AWAITING_FLOW'}
              </span>
            </div>

            <div className="font-mono text-[10px] text-emerald-400 space-y-1 max-h-[140px] overflow-y-auto h-[100px] leading-relaxed select-text">
              {traceLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${
                  log.startsWith('✔') || log.includes('SUCCESS') ? 'text-emerald-500 font-black' :
                  log.startsWith('🚨') || log.startsWith('ERROR') ? 'text-red-500 font-bold' :
                  log.startsWith('[REDIRECT]') ? 'text-blue-400' :
                  log.startsWith('[MFA]') ? 'text-purple-400 font-semibold' : ''
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Node & Connection Property Sheets (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Node editing sheet */}
          {selectedNode && (
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-4 h-4 text-accent-primary" /> Node Properties
                </h4>
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded hover:bg-bg-nested"
                  title="Close panel"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-text-muted font-bold block uppercase" htmlFor="node-name-input">COMPONENT NAME</label>
                  <input
                    id="node-name-input"
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const val = e.target.value
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, name: val } : n))
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-bg-nested border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-text-muted font-bold block uppercase" htmlFor="node-domain-input">DOMAIN NAME / IP</label>
                  <input
                    id="node-domain-input"
                    type="text"
                    value={selectedNode.domain}
                    onChange={(e) => {
                      const val = e.target.value
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, domain: val } : n))
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-bg-nested border border-border-subtle text-xs text-text-primary font-medium focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-text-muted font-bold block uppercase" htmlFor="node-desc-input">DESCRIPTION</label>
                  <textarea
                    id="node-desc-input"
                    value={selectedNode.desc}
                    onChange={(e) => {
                      const val = e.target.value
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, desc: val } : n))
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-bg-nested border border-border-subtle text-xs text-text-secondary h-16 resize-none focus:outline-none focus:border-accent-primary"
                  />
                </div>

                {selectedNode.type === 'idp' && (
                  <div className="pt-2 flex items-center justify-between border-t border-border-subtle/50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-text-primary block leading-tight">Enforce MFA Rule</span>
                      <span className="text-[8px] text-text-muted block">Enforce dynamic step-up biometrics</span>
                    </div>
                    <button
                      onClick={() => {
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, mfaEnforced: !n.mfaEnforced } : n))
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                        selectedNode.mfaEnforced ? 'bg-accent-primary' : 'bg-border-subtle'
                      }`}
                      aria-label="Enforce MFA"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        selectedNode.mfaEnforced ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border-subtle/50">
                <button
                  onClick={deleteSelectedNode}
                  className="w-full py-2 bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/20 rounded-lg text-status-danger text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge component
                </button>
              </div>
            </div>
          )}

          {/* Connection editing sheet */}
          {selectedConnection && (
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-4 h-4 text-accent-secondary" /> Link Properties
                </h4>
                <button 
                  onClick={() => setSelectedConnectionId(null)}
                  className="p-1 rounded hover:bg-bg-nested"
                  title="Close panel"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-text-muted font-bold block uppercase" htmlFor="conn-label-input">CONNECTION LABEL</label>
                  <input
                    id="conn-label-input"
                    type="text"
                    value={selectedConnection.label}
                    onChange={(e) => {
                      const val = e.target.value
                      setConnections(prev => prev.map(c => c.id === selectedConnection.id ? { ...c, label: val } : c))
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-bg-nested border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="p-3 rounded-lg bg-bg-nested border border-border-subtle text-[10px] text-text-secondary leading-normal space-y-1">
                  <span className="font-extrabold text-text-primary uppercase block">Protocol Spec</span>
                  <p>
                    {PROTOCOLS.find(p => p.id === selectedConnection.protocol)?.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle/50">
                <button
                  onClick={deleteSelectedConnection}
                  className="w-full py-2 bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/20 rounded-lg text-status-danger text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Break trust link
                </button>
              </div>
            </div>
          )}

          {/* Export Actions Panel when nothing is selected */}
          {!selectedNode && !selectedConnection && (
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-accent-primary" /> Architecture Export
              </h4>
              <p className="text-[11px] text-text-secondary leading-normal">
                Export your finalized blueprint directly into standard vector graphic formats or JSON coordinate schema maps:
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={exportTopologyAsSvg}
                  className="w-full py-2 px-3 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Export Editable Vector SVG
                </button>

                <button
                  onClick={exportTopologyAsJson}
                  className="w-full py-2 px-3 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" /> Export Topology Config JSON
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
