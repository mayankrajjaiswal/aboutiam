import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Award, ArrowRight, Settings, List, Terminal
} from 'lucide-react'

type CertType = 'sc300' | 'okta_admin' | 'cyberark_defender' | 'ping_professional'

interface CertDetails {
  title: string
  vendor: string
  difficulty: 'Beginner' | 'Intermediate' | 'Expert'
  cost: string
  domains: { name: string; weight: string }[]
  studyPath: string[]
  recommendedLabs: { name: string; path: string }[]
  quiz: {
    q: string
    options: string[]
    correct: number
    explanation: string
  }[]
}

const CERT_DATA: Record<CertType, CertDetails> = {
  sc300: {
    title: 'SC-300: Microsoft Identity and Access Administrator',
    vendor: 'Microsoft',
    difficulty: 'Intermediate',
    cost: '$165 USD',
    domains: [
      { name: 'Implement an Identity Management Solution', weight: '25-30%' },
      { name: 'Implement an Authentication and Access Management Solution', weight: '25-30%' },
      { name: 'Implement Access Management for Apps', weight: '15-20%' },
      { name: 'Plan and Implement an Identity Governance Strategy', weight: '20-25%' }
    ],
    studyPath: [
      'Learn hybrid replication topologies using Microsoft Entra Connect & Cloud Sync.',
      'Master the Conditional Access Policy structure, utilizing user risk, device posture, and network locations.',
      'Configure administrative access lifecycles using Privileged Identity Management (PIM) JIT templates.',
      'Understand directory entitlement management, access reviews, and access packages.'
    ],
    recommendedLabs: [
      { name: 'Access Control ABAC/RBAC Lab', path: '/playground/access' },
      { name: 'Zero Trust Planner', path: '/playground/zta' },
      { name: 'Microsoft Entra Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'You need to ensure that database administrators can only activate their high-privilege directory roles for a maximum of 2 hours, and must require manager approval before activation. Which Entra ID capability should you configure?',
        options: [
          'Microsoft Entra Conditional Access',
          'Microsoft Entra Identity Protection',
          'Microsoft Entra Privileged Identity Management (PIM)',
          'Microsoft Entra ID Protection Strengths'
        ],
        correct: 2,
        explanation: 'Privileged Identity Management (PIM) lets you configure role settings—such as maximum activation duration (e.g. 2 hours), mandatory business justification, and required manager approvals for role activations—satisfying least-privilege JIT governance rules.'
      },
      {
        q: 'Your organization mandates that all users connecting to Microsoft 365 from unmanaged devices must complete FIDO2 passwordless authentication, while managed device users can use standard passwords. What should you configure?',
        options: [
          'Entra ID Connect sync filtering rules',
          'Conditional Access policy with Authentication Strengths',
          'Entra ID Identity Governance Access Packages',
          'A custom XML policy inside the Identity Experience Framework'
        ],
        correct: 1,
        explanation: 'Conditional Access policies allow you to define conditions (such as device state = unmanaged) and enforce specific "Authentication Strengths" (such as mandating Phishing-resistant MFA / FIDO2) as a grant control, enforcing contextual adaptive security.'
      },
      {
        q: 'You are configuring a B2B collaboration environment with an external partner. You want to allow external guest users to access specific Microsoft Teams channels without creating separate accounts in your directory, while ensuring their access is reviewed monthly. What should you configure?',
        options: [
          'Direct Federation via SAML/OIDC',
          'Microsoft Entra Connect Cloud Sync',
          'Entitlement Management Access Packages with monthly Access Reviews',
          'Cross-tenant access settings with B2B direct connect'
        ],
        correct: 2,
        explanation: 'Entitlement Management allows you to pack resources (like Teams, SharePoint, and Apps) into "Access Packages" assigned to external guest partners. By pairing this with an Access Review schedule, the partner manager or internal leads must actively verify and approve the guests continued access monthly, automating account lifecycles.'
      },
      {
        q: 'Your security operations center (SOC) detects multiple "impossible travel" alerts for several corporate accounts. You need to configure an automated response that immediately prompts these users for step-up MFA and forces a password change. What Entra ID component should you configure?',
        options: [
          'Entra ID Protection Sign-in Risk and User Risk Policies',
          'Entra ID Privileged Identity Management Alert Settings',
          'Azure Key Vault secret rotational loops',
          'Custom Entra Connect Sync filtering attributes'
        ],
        correct: 0,
        explanation: 'Entra ID Protection (formerly Azure AD Identity Protection) evaluates real-time telemetry (impossible travel, leaked credentials, suspicious IPs) to calculate "Sign-in Risk" and "User Risk" scores. Conditional Access policies can leverage these scores to trigger automatic actions, such as blocking access, forcing MFA, or mandating password resets via Self-Service Password Reset (SSPR).'
      },
      {
        q: 'When implementing a hybrid identity model, what is the primary benefit of deploying Microsoft Entra Cloud Sync instead of traditional Microsoft Entra Connect Sync?',
        options: [
          'Cloud Sync supports larger file attachments inside user mailboxes.',
          'Cloud Sync runs entirely in the cloud and utilizes a lightweight on-prem agent, simplifying multi-forest directory consolidation and reducing local server footprints.',
          'Cloud Sync forces local Active Directory schemas to override all cloud policies.',
          'Cloud Sync is mandatory for setting up local hardware Kerberos keytabs.'
        ],
        correct: 1,
        explanation: 'Unlike traditional Entra Connect Sync which requires a heavy SQL database and synchronization engine installed on-premise, Entra Cloud Sync moves the heavy calculation sync engine to the cloud, utilizing a lightweight, highly-available local agent on-prem. It is highly optimized for organizations consolidating multiple disconnected Active Directory forests.'
      }
    ]
  },
  okta_admin: {
    title: 'Okta Certified Professional & Administrator',
    vendor: 'Okta',
    difficulty: 'Intermediate',
    cost: '$150 USD',
    domains: [
      { name: 'Identity & Access Management', weight: '20%' },
      { name: 'Directory Integration & Synchronization', weight: '25%' },
      { name: 'Okta Security Policies & Multi-Factor', weight: '25%' },
      { name: 'Application Provisioning (SCIM)', weight: '30%' }
    ],
    studyPath: [
      'Understand Universal Directory custom attribute schemas and metadata profile mappings.',
      'Master directory integration setups installing local Active Directory or LDAP Agents.',
      'Configure Okta Sign-On and MFA Enrollment Policies using Network Zones and Device Trust.',
      'Configure SaaS outbound SCIM provisioning with Attribute Mapping and sync triggers.'
    ],
    recommendedLabs: [
      { name: 'SCIM 2.0 Provisioning Lab', path: '/playground/scim' },
      { name: 'OAuth 2.0 Attack Lab', path: '/playground/oauth-attack' },
      { name: 'Okta Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'When configuring SCIM 2.0 provisioning to a downstream SaaS application, what is the best REST method to add a single user as a member of a pre-existing group without overwriting other members?',
        options: [
          'HTTP PUT to the /Groups/{id} endpoint carrying the full roster payload',
          'HTTP POST to the /Groups/{id}/members endpoint carrying the user ID',
          'HTTP PATCH to the /Groups/{id} endpoint carrying an "add" operation targeting members path',
          'HTTP DELETE to clear the group, followed by a POST recreate'
        ],
        correct: 2,
        explanation: 'SCIM (RFC 7644) mandates using HTTP PATCH with the "add" operation on the "members" attribute path to append new members. This is extremely lightweight, preventing race-conditions or the overhead of transferring a full group roster.'
      },
      {
        q: 'You must secure a legacy, header-based on-premise application by federating its authentication with the Okta Cloud directory. Which component should you deploy?',
        options: [
          'Okta Universal Directory Agents',
          'Okta Workflows Orchestrator',
          'Okta Access Gateway (OAG)',
          'Okta API Access Management proxy'
        ],
        correct: 2,
        explanation: 'Okta Access Gateway (OAG) acts as a local reverse proxy PEP. It handles modern OIDC federation with Okta cloud and forwards the user session context to the legacy on-prem app using HTTP header injection.'
      },
      {
        q: 'You need to transform a user\'s department attribute from Okta Universal Directory before sending it to a downstream SAML Service Provider. If the department attribute is null, you want to send a default value of "General". What Okta Expression Language expression should you write?',
        options: [
          'user.department == null ? "General" : user.department',
          'if (user.department === "") then "General" else department',
          'String.coalesce(user.department, "General")',
          'user.department ? "General"'
        ],
        correct: 0,
        explanation: 'Okta Expression Language utilizes ternary operators (condition ? value_if_true : value_if_false) derived from standard programming syntax. The expression `user.department == null ? "General" : user.department` perfectly handles null checks during assertion compilation.'
      },
      {
        q: 'An attacker is attempting a password-spraying attack against your Okta portal from multiple global IP addresses, triggering lockouts. You want Okta to automatically identify and block these malicious IPs prior to any authentication attempt. What should you configure?',
        options: [
          'Okta ThreatInsight Policy',
          'Custom Okta Sign-On Policy with IP restrictions',
          'Okta Routing Rules using email domains',
          'Local Windows Active Directory lockout thresholds'
        ],
        correct: 0,
        explanation: 'Okta ThreatInsight evaluates global threat intelligence telemetry across thousands of Okta tenants. When active in "Block" mode, it automatically identifies and drops requests from suspicious, crawling IP addresses at the API gateway layer, before evaluating credentials, preventing local directory account lockouts.'
      },
      {
        q: 'A customer wants to sync employee profile attributes from an on-premise Active Directory to Okta. You install the Okta AD Agent. What is the correct operational model of this agent regarding network traffic security?',
        options: [
          'The agent acts as an inbound firewall listener opening port 389 directly to the internet.',
          'The agent is entirely outbound-only, polling Okta servers over port 443 (HTTPS), eliminating the need for inbound corporate firewall ports.',
          'The agent requires setting up a dedicated VPN tunnel between AD and Okta servers.',
          'The agent acts as a RADIUS proxy listening to local UDP ports.'
        ],
        correct: 1,
        explanation: 'The Okta Active Directory Agent is engineered as an outbound-only service. It communicates strictly via secure HTTPS polling over port 443 to fetch synchronization jobs queued in Okta cloud, completely removing the security risk of opening inbound corporate ports.'
      }
    ]
  },
  cyberark_defender: {
    title: 'CyberArk Certified Defender (PAM)',
    vendor: 'CyberArk',
    difficulty: 'Intermediate',
    cost: '$200 USD',
    domains: [
      { name: 'Privileged Account Security Vault Architecture', weight: '30%' },
      { name: 'Credential Onboarding & CPM Rotation Policies', weight: '30%' },
      { name: 'Privileged Session Monitoring & Jump-Server Proxies', weight: '40%' }
    ],
    studyPath: [
      'Understand Enterprise Password Vault (EPV) hardware server isolation and firewall setups.',
      'Configure Central Policy Manager (CPM) automatic target password rotation intervals.',
      'Deploy Privileged Session Manager (PSM) proxies with keystroke logger integrations.',
      'Design Dual-Control master request workflows and emergency break-glass procedures.'
    ],
    recommendedLabs: [
      { name: 'Workload Mesh (Machine Identities)', path: '/playground/workload-mesh' },
      { name: 'CyberArk Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'How does CyberArk Privileged Session Manager (PSM) mitigate the risk of administrative password theft from an operator\'s workstation?',
        options: [
          'By locally encrypting the password on the admin workstation',
          'By routing credentials through an email approval workflow',
          'By proxying remote connections and injecting vault credentials directly into the session channel',
          'By forcing administrators to memorize passwords thatCPM rotates daily'
        ],
        correct: 2,
        explanation: 'PSM proxies all RDP/SSH sessions, retrieves the requested credential from the Vault, and injects it directly into the remote session stream. The administrator never sees, knows, or interacts with the password, preventing credential theft on untrusted workstations.'
      },
      {
        q: 'A Central Policy Manager (CPM) fails to rotate the password of a target administrative account on a local Windows Server because the CPM lacks permission to write to the domain controller directly. What PAM configuration should you implement to resolve this?',
        options: [
          'Configure a CyberArk Reconcile Account in the Safe settings',
          'Disable CPM automatic rotation and rely on manual rotation',
          'Assign local admin rights on the domain controller to the CPM server directly',
          'Increase the CPM server network polling timeout'
        ],
        correct: 0,
        explanation: 'When target account credentials fail rotation due to password expiration or missing administrative permissions, CyberArk utilizes a pre-configured "Reconcile Account". This high-privilege account is invoked to forcefully reset and synchronize the target account\'s password on the target machine, restoring automation.'
      },
      {
        q: 'You need to configure the highest level of security for the CyberArk Enterprise Password Vault (EPV) server. What is the standard deployment recommendation regarding the operating system and firewall of the Vault server?',
        options: [
          'Run on a shared Windows Server alongside Active Directory domain services.',
          'Install on a dedicated Windows Server, run the CyberArk hardening script to disable unnecessary OS services, and enforce a localized, highly restrictive firewall rejecting all non-vault traffic.',
          'Deploy on a Linux Kubernetes cluster exposed to corporate load balancers.',
          'None of the above; cloud databases handle EPV security natively.'
        ],
        correct: 1,
        explanation: 'The CyberArk EPV Vault server must be hardened strictly. The hardening process disables unnecessary OS services, removes non-essential Windows features, closes all generic network ports except the Vault communication port (TCP 1858), and ensures the server operates solely as a cryptographically isolated identity safe.'
      },
      {
        q: 'Your corporate security policy demands that any administrative session targeting critical financial servers must require manual approval from a security manager, except during emergency "break-glass" situations. What CyberArk feature should you configure?',
        options: [
          'CyberArk Privileged Threat Analytics (PTA)',
          'CyberArk Safe Dual-Control (Confirmation) workflows',
          'Okta Access Gateway proxy rules',
          'Central Policy Manager rotational intervals'
        ],
        correct: 1,
        explanation: 'Safe Dual-Control (or confirmation workflows) forces administrators to submit a formal request stating business justification and time windows before gaining access to a sensitive credential. This request must be manually authorized by one or more designated Safe Owners before the session can proceed.'
      },
      {
        q: 'A security engineer detects that a domain administrator is executing suspicious PowerShell scripts on a server. CyberArk immediately flags this anomaly and terminates their active SSH session automatically. What CyberArk component is responsible for this detection?',
        options: [
          'Central Policy Manager (CPM)',
          'Privileged Threat Analytics (PTA)',
          'Enterprise Password Vault (EPV)',
          'CyberArk Identity Broker'
        ],
        correct: 1,
        explanation: 'Privileged Threat Analytics (PTA) continuously monitors real-time session logs, command history, and credential usage anomalies. If it detects anomalous or malicious commands (like credential harvest attempts or un-vaulted logins), it can trigger automated remediation actions, such as notifying SOC analysts, rotating credentials, or instantly suspending the active session.'
      }
    ]
  },
  ping_professional: {
    title: 'Ping Identity Certified Professional (PingFederate)',
    vendor: 'Ping Identity',
    difficulty: 'Intermediate',
    cost: '$150 USD',
    domains: [
      { name: 'PingFederate Server Configurations', weight: '25%' },
      { name: 'Protocol Handshakes (SAML 2.0 / OIDC)', weight: '40%' },
      { name: 'SAML Adapter & JWT Token Mappings', weight: '35%' }
    ],
    studyPath: [
      'Master SAML 2.0 Bindings (Redirect, POST) and XML metadata import configurations.',
      'Configure OpenID Connect policy registries, grant types, and JWT scopes.',
      'Design PingAccess gateway policies protecting backend API resources.',
      'Map LDAP and custom SQL data stores to dynamic token attribute schemas.'
    ],
    recommendedLabs: [
      { name: 'OAuth 2.0 / OIDC Handshake Visualizer', path: '/playground/oauth' },
      { name: 'SAML 2.0 XML Workbench', path: '/playground/saml' },
      { name: 'LDAP Tree Simulator', path: '/playground/ldap' }
    ],
    quiz: [
      {
        q: 'During a SAML 2.0 Single Sign-On federation loop, which HTTP binding transports the signed SAMLResponse assertion payload from the Identity Provider to the Service Provider via the user\'s browser using an HTTP POST body parameter?',
        options: [
          'HTTP Redirect Binding',
          'HTTP POST Binding',
          'HTTP Artifact Binding',
          'HTTP SOAP Binding'
        ],
        correct: 1,
        explanation: 'The HTTP POST Binding transfers the base64-encoded XML `<samlp:Response>` assertion inside an standard HTML form body POST parameter, communicating through the client\'s browser frontchannel.'
      },
      {
        q: 'A partner Service Provider reports that users are getting SAML assertion validation errors when attempting SSO. You discover that the system clocks of the PingFederate server and the partner SP server differ by 8 minutes. What parameter should you adjust to temporarily mitigate this issue?',
        options: [
          'SAML assertion validation interval',
          'SAML Adapter Attribute Mapping expressions',
          'Allowed Clock Skew tolerance threshold',
          'OIDC Session Timeout setting'
        ],
        correct: 2,
        explanation: 'Clock Drift is a common SAML federation issue. SAML assertions are stamped with an issue and expiration time. If server clocks differ beyond the default tolerance (typically 3-5 minutes), assertions fail validation. Temporarily increasing the Allowed Clock Skew tolerance (e.g., to 10 minutes) mitigates the block while server times are synchronized via NTP.'
      },
      {
        q: 'You are configuring PingAccess to protect on-premise backend APIs. You want PingAccess to intercept user requests, inspect the OIDC Access Token issued by PingFederate, and securely inject user profile attributes as HTTP header parameters to the backend APIs. What capability is this?',
        options: [
          'SAML Assertion Wrapping',
          'PingAccess Token Exchange and Header Injection',
          'LDAP directory routing rules',
          'PingFederate Client Credentials flow'
        ],
        correct: 1,
        explanation: 'PingAccess acts as an API gateway PEP. It validates incoming client-facing tokens and swaps/maps them for backend-facing HTTP headers containing validated claims. This hides token complexity from legacy on-prem APIs, enforcing centralized access management.'
      },
      {
        q: 'Your organization wants to dynamically route incoming employee login requests. Users connecting from the internal corporate network should authenticate via Kerberos (IWA), while external remote workers must use standard passwords + SMS MFA. What PingFederate feature should you configure?',
        options: [
          'AD Sync attribute filters',
          'PingFederate Authentication Policies and Adapter Selectors',
          'Custom SCIM payload schemas',
          'PingAccess Reverse Proxy Gateway rules'
        ],
        correct: 1,
        explanation: 'Authentication Policies in PingFederate allow you to construct complex, conditional decision trees. By utilizing "Adapter Selectors" (like an IP Range Selector or Device Selector), PingFederate dynamically routes requests to the correct authentication adapters (e.g. Kerberos on-premise or HTML Form + MFA externally).'
      },
      {
        q: 'Which OAuth 2.0 grant flow should be configured in PingFederate to authenticate a background server-to-server (Machine-to-Machine) service integration that does not involve any end-user interaction?',
        options: [
          'Implicit Grant Flow',
          'Authorization Code Flow with PKCE',
          'Client Credentials Grant Flow',
          'Resource Owner Password Credentials Flow'
        ],
        correct: 2,
        explanation: 'The Client Credentials Grant (RFC 6749) is engineered strictly for Machine-to-Machine (M2M) integrations. The calling background server authenticates directly against PingFederate using its client_id and client_secret to receive an access token, requiring no browser redirects or user inputs.'
      }
    ]
  }
}

interface Flashcard {
  cert: string
  q: string
  a: string
}

const FLASHCARDS: Flashcard[] = [
  { cert: 'sc300', q: 'What is considered a "Phishing-Resistant" MFA method in Microsoft Entra ID?', a: 'FIDO2 Security Keys (hardware enclaves), Windows Hello for Business, and Microsoft Authenticator Passwordless. Traditional push and SMS OTP are NOT phishing-resistant.' },
  { cert: 'sc300', q: 'What occurs during a Privileged Identity Management (PIM) Role Activation request?', a: 'The user swaps their "Eligible" role status for an "Active" state. This triggers JIT elevation, enforcing duration bounds (e.g. 2 hours), manager approvals, and ticket MFA audits.' },
  { cert: 'okta_admin', q: 'What is the role of Okta Universal Directory (UD) attribute mapping expressions?', a: 'It maps directory properties (AD/LDAP) to standardized Okta attributes using Okta Expression Language. Allows on-the-fly string concatenations, defaults, or conditional transformations (e.g. email lowercasing).' },
  { cert: 'okta_admin', q: 'What is the functional purpose of Okta Access Gateway (OAG)?', a: 'A reverse proxy that connects on-premise, header-based legacy applications with Okta\'s cloud OIDC/SAML directory. It injects authenticated user headers locally after verifying cloud credentials.' },
  { cert: 'cyberark_defender', q: 'What is the primary difference between CPM and PSM in CyberArk?', a: 'CPM (Central Policy Manager) is responsible for automatic password rotation and synchronization on target machines. PSM (Privileged Session Manager) acts as a secure jump-server proxy, isolating connections and injecting credentials directly into SSH/RDP streams.' }
]

export default function CertificationHub() {
  const [activeCert, setActiveCert] = useState<CertType>('sc300')
  const cert = CERT_DATA[activeCert]

  // Active quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // Active flashcard state
  const [flashIndex, setFlashIndex] = useState(0)
  const [flashFlipped, setFlashFlipped] = useState(false)

  const handleOptionClick = (index: number) => {
    if (showExplanation) return
    setSelectedOption(index)
    if (index === cert.quiz[quizIndex].correct) {
      setScore(prev => prev + 1)
    }
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    if (quizIndex < cert.quiz.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const restartQuiz = () => {
    setQuizIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setQuizFinished(false)
  }

  const handleCertChange = (key: CertType) => {
    setActiveCert(key)
    setQuizIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setQuizFinished(false)
    setFlashIndex(0)
    setFlashFlipped(false)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Certification Hub</h1>
            <p className="text-xs text-text-secondary">Comprehensive study roadmaps, domains, and mock practice quizzes for major identity credentials</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Hub
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Cert selectors */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Certification
            </span>

            <div className="flex flex-col gap-2">
              {(Object.keys(CERT_DATA) as CertType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleCertChange(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition flex items-center justify-between ${activeCert === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                >
                  <span>{key === 'sc300' ? 'SC-300 Entra ID' : key === 'okta_admin' ? 'Okta Admin' : key === 'cyberark_defender' ? 'CyberArk Def.' : 'Ping Professional'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCert === key ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick exam stats */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-3 text-xs leading-normal text-text-secondary">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block border-b border-border-subtle pb-1">
              Exam Details
            </span>
            <div>
              <span className="block text-text-muted text-[10px] uppercase font-bold">Difficulty</span>
              <span className={`font-semibold ${cert.difficulty === 'Expert' ? 'text-status-danger' : 'text-accent-secondary'}`}>{cert.difficulty}</span>
            </div>
            <div>
              <span className="block text-text-muted text-[10px] uppercase font-bold">Standard Cost</span>
              <span className="font-semibold text-text-primary">{cert.cost}</span>
            </div>
          </div>
        </div>

        {/* Right column: Blueprint domains and Practice Quiz */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Cert Title Hero */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <Award className="w-24 h-24 text-accent-primary" />
            </div>

            <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
              {cert.vendor} certification
            </span>
            <h2 className="text-xl font-black text-text-primary mt-2.5">{cert.title}</h2>
          </div>

          {/* Domains vs Study Path grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Blueprint Domains */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                <List className="w-4 h-4 text-blue-400" /> Blueprint Focus Domains
              </span>

              <div className="space-y-3 text-xs leading-normal">
                {cert.domains.map((dom) => (
                  <div key={dom.name} className="flex justify-between items-start gap-4 p-2.5 bg-bg-nested/30 border border-border-subtle rounded-lg">
                    <span className="text-text-secondary">{dom.name}</span>
                    <span className="text-[10px] font-bold bg-accent-glow border border-accent-primary/20 px-1.5 py-0.5 rounded text-accent-primary shrink-0">
                      {dom.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Path */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-teal-400" /> Recommended Study Path
                </span>

                <div className="space-y-2.5 text-xs text-text-secondary leading-normal">
                  {cert.studyPath.map((path, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{path}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended AboutIAM Labs */}
              <div className="mt-5 pt-3 border-t border-border-subtle">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-1.5">Recommended practice in AboutIAM</span>
                <div className="flex flex-wrap gap-1.5">
                  {cert.recommendedLabs.map((lab) => (
                    <Link 
                      key={lab.name} 
                      to={lab.path}
                      className="text-[10px] bg-bg-nested hover:bg-border-subtle border border-border-subtle text-accent-primary font-bold px-2 py-1 rounded"
                    >
                      {lab.name} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Filter and render dynamic study flashcards */}
          {useMemo(() => {
            const filteredFlashcards = FLASHCARDS.filter(f => f.cert === activeCert)
            if (filteredFlashcards.length === 0) return null
            return (
              <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-4">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-primary animate-pulse" /> Active Exam Study Flashcards
                </span>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Flashcard Box (Flip-able) */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFlashFlipped(!flashFlipped)}
                      className="w-full text-left focus:outline-none"
                    >
                      <div className="relative min-h-[160px] w-full rounded-xl border border-border-subtle p-5 shadow-inner transition-all flex flex-col justify-between cursor-pointer overflow-hidden bg-bg-sidebar select-none hover:border-accent-primary/40 group">
                        <div className="absolute top-2 right-2.5 text-[8px] font-black text-text-muted uppercase tracking-wider">
                          {flashFlipped ? '📖 REVEALED ANSWER' : '❓ STUDY FLASHCARD QUESTION'}
                        </div>
                        
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-accent-secondary uppercase tracking-wider">
                            CARD {flashIndex + 1} OF {filteredFlashcards.length}
                          </span>
                          <p className={`font-semibold tracking-tight transition-colors leading-relaxed ${
                            flashFlipped ? 'text-xs text-text-secondary select-text' : 'text-sm text-text-primary font-bold group-hover:text-accent-primary'
                          }`}>
                            {flashFlipped ? filteredFlashcards[flashIndex].a : filteredFlashcards[flashIndex].q}
                          </p>
                        </div>

                        <div className="text-[10px] text-accent-primary font-black uppercase text-center mt-3 pt-2 border-t border-border-subtle/30 leading-none">
                          {flashFlipped ? '↺ Click to view Question' : '💡 Click to Flip and Reveal Answer'}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Navigation controls */}
                  <div className="p-4 bg-bg-sidebar border border-border-subtle/50 rounded-xl space-y-3">
                    <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle/30 pb-1.5">Study Navigation</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={flashIndex === 0}
                        onClick={() => {
                          setFlashIndex(idx => idx - 1)
                          setFlashFlipped(false)
                        }}
                        className="flex-1 py-1.5 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[10px] font-bold text-text-secondary disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        disabled={flashIndex >= filteredFlashcards.length - 1}
                        onClick={() => {
                          setFlashIndex(idx => idx + 1)
                          setFlashFlipped(false)
                        }}
                        className="flex-1 py-1.5 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[10px] font-bold text-text-secondary disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFlashIndex(0)
                        setFlashFlipped(false)
                      }}
                      className="w-full py-1 bg-bg-card hover:bg-bg-nested border border-border-subtle rounded text-[9px] font-black text-text-muted uppercase"
                    >
                      Reset Deck
                    </button>
                  </div>
                </div>
              </div>
            )
          }, [activeCert, flashIndex, flashFlipped])}

          {/* Interactive Quiz Panel */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-4 border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-accent-primary" /> Active Mock Practice Quiz
            </span>

            {!quizFinished ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted border-b border-border-subtle/50 pb-1.5">
                  <span>QUESTION {quizIndex + 1} OF {cert.quiz.length}</span>
                  <span>CURRENT SCORE: {score}</span>
                </div>

                <p className="text-sm font-bold text-text-primary leading-relaxed">
                  {cert.quiz[quizIndex].q}
                </p>

                <div className="space-y-2.5">
                  {cert.quiz[quizIndex].options.map((opt, optIdx) => {
                    const isCorrect = optIdx === cert.quiz[quizIndex].correct
                    const isSelected = optIdx === selectedOption
                    
                    let btnStyle = 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested/60'
                    if (showExplanation) {
                      if (isCorrect) {
                        btnStyle = 'bg-status-success/15 border-status-success text-status-success'
                      } else if (isSelected) {
                        btnStyle = 'bg-status-danger/10 border-status-danger text-status-danger'
                      } else {
                        btnStyle = 'bg-bg-nested/20 border-border-subtle/60 text-text-muted cursor-not-allowed'
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionClick(optIdx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs leading-normal transition flex justify-between items-center font-semibold ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showExplanation && isCorrect && <span className="text-status-success font-black text-sm shrink-0 ml-3">✓ Correct</span>}
                        {showExplanation && isSelected && !isCorrect && <span className="text-status-danger font-black text-sm shrink-0 ml-3">✗ Incorrect</span>}
                      </button>
                    )
                  })}
                </div>

                {showExplanation && (
                  <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/25 text-xs text-text-secondary leading-relaxed animate-fadeIn">
                    <span className="font-extrabold text-accent-primary block mb-1 text-[10px] uppercase tracking-wider">Concept Explanation</span>
                    {cert.quiz[quizIndex].explanation}

                    <button
                      onClick={nextQuestion}
                      className="mt-4 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition ml-auto"
                    >
                      {quizIndex < cert.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <Award className="w-12 h-12 text-status-success mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-text-primary uppercase tracking-wider">Quiz Completed!</h3>
                
                <div className="max-w-xs mx-auto p-4 bg-bg-nested/40 border border-border-subtle rounded-xl text-center space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Your Score</span>
                  <span className="text-2xl font-black text-accent-primary block">{score} / {cert.quiz.length}</span>
                  <span className="text-[11px] text-text-secondary leading-normal block pt-1.5 font-semibold">
                    {score === cert.quiz.length ? '👑 Perfect Score! You are ready for the exam!' : '👍 Good effort! Review the study path on the left.'}
                  </span>
                </div>

                <button
                  onClick={restartQuiz}
                  className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition mx-auto"
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
