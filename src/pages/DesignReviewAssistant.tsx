import { useState, useMemo } from 'react'
import { 
  CheckSquare, ShieldCheck, Play,
  Terminal, Check, ShieldAlert,
  Activity, Info
} from 'lucide-react'

// Define Design Types
interface ReviewTemplate {
  id: string
  title: string
  score: number
  description: string
  designCode: string
  strengths: string[]
  weaknesses: string[]
  missingControls: string[]
  compliance: string[]
  priorityFixes: { title: string; desc: string; fix: string }[]
}

export default function DesignReviewAssistant() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-1')
  const [customDesignCode, setCustomDesignCode] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)
  const [showReport, setShowReport] = useState<boolean>(false)
  const [activeReportTab, setActiveReportTab] = useState<'dashboard' | 'controls' | 'compliance' | 'remediations'>('dashboard')

  // Curated Architectural Blueprints & Code Reviews Templates
  const TEMPLATES: ReviewTemplate[] = [
    {
      id: 'template-1',
      title: 'Public SPA Client + Bearer Access Tokens',
      score: 35,
      description: 'A React Single Page App verifying sessions stateless-ly via Bearer JWTs. Features standard OAuth 2.0 flows but lacks modern posture/signature constraints.',
      designCode: `// LEGACY MONOLITHIC USER ACCESS CODE
const authUrl = "https://auth.company.com/authorize?client_id=spa-app" +
                "&response_type=token" + 
                "&redirect_uri=https://company-app.com/*" + 
                "&scope=read:write"; // Missing PKCE & state`,
      strengths: [
        'Stateless sessions reduce database bottlenecking.',
        'OAuth 2.0 scopes map user consent granularly.'
      ],
      weaknesses: [
        'Vulnerable to Authorization Code Interception (Missing PKCE).',
        'Open wildcard redirect URI allow token hijacking via redirection hijack.',
        'Access tokens are plain, unprotected Bearer string variables (No DPoP bindings).'
      ],
      missingControls: [
        'PKCE (Proof Key for Code Exchange) parameters.',
        'Sender-Constrained Token validation rules.',
        'Exact-string redirect URI matches.'
      ],
      compliance: [
        'SOC 2 Type II: Fails access control and cryptographic validation controls.',
        'ISO 27001 (Control A.8.20): Missing secure key-binding constraints.'
      ],
      priorityFixes: [
        {
          title: 'Implement PKCE Verifier/Challenge',
          desc: 'Mandate SHA256 hashed code challenges on all administrative client redirect pipelines.',
          fix: `// Hardened PKCE Authorize Handshake
const code_verifier = "random_cryptographic_bytes_here...";
const code_challenge = sha256(code_verifier); // base64url encoded

const authUrl = "https://auth.company.com/authorize?client_id=spa-app" +
                "&response_type=code" + // Auth Code Flow
                "&code_challenge=" + code_challenge +
                "&code_challenge_method=S256" +
                "&redirect_uri=https://company-app.com/callback";`
        }
      ]
    },
    {
      id: 'template-2',
      title: 'SAML 2.0 Corporate Employee SSO assertion',
      score: 55,
      description: 'SAML 2.0 assertion flow verifying corporate employee Single Sign-On, but vulnerable to Signature Wrapping XML injection attacks.',
      designCode: `<saml2:Assertion ID="assertion-123" IssueInstant="2026-07-06T12:00:00Z">
  <saml2:Subject><saml2:NameID>employee@corp.com</saml2:NameID></saml2:Subject>
  <ds:Signature>
    <ds:SignedInfo><ds:Reference URI="#assertion-123">...</ds:Reference></ds:SignedInfo>
  </ds:Signature>
</saml2:Assertion>`,
      strengths: [
        'Uses standard XML-Digital Signatures (DSIG).',
        'Short-lived Validity window controls.'
      ],
      weaknesses: [
        'SAML SP validates ID references insecurely, exposing the Assertion to SAML Signature Wrapping (SSW) XML injections.',
        'Missing strict, audited AudienceRestriction nodes.'
      ],
      missingControls: [
        'Schema-validation filters matching strict SAML templates.',
        'Audience restriction elements tying assertions to specific SP portals.'
      ],
      compliance: [
        'HIPAA (Security Rule §164.312): Weak assertion verification exposes patient records to spoofing risks.',
        'NIST SP 800-53 (IA-2): Lacks non-bypassable employee SSO validations.'
      ],
      priorityFixes: [
        {
          title: 'Enforce strict Audience Restriction & SSW filters',
          desc: 'Ensure your SAML Service Provider strictly enforces Audience restrictions and matches signatures against specific elements rather than floating elements.',
          fix: `// Hardened SAML Verification
samlParser.setStrictValidation(true);
samlParser.setExpectedAudience("https://portal.company.com/sp/saml");
// Enforce strict element matching to prevent wrapped XML asserts
samlParser.enforceSignatureElementMatching(true);`
        }
      ]
    }
  ]

  // Dynamic analysis engine
  const activeReport = useMemo(() => {
    if (isCustomMode) {
      // Compiled report on the fly based on custom input keywords
      const code = customDesignCode.toLowerCase()
      const hasPkce = code.includes('pkce') || code.includes('challenge')
      const hasMtls = code.includes('mtls') || code.includes('spiffe')
      const hasDpop = code.includes('dpop') || code.includes('sender')

      let score = 50
      const strengths = ['Custom design model uploaded.']
      const weaknesses = []
      const missingControls = []
      const compliance = ['SOC2: Compliance requires review.']
      const priorityFixes = []

      if (hasPkce) {
        score += 15
        strengths.push('PKCE flow is declared and implemented.')
      } else {
        weaknesses.push('Vulnerable to authorization code interception (Missing PKCE).')
        missingControls.push('PKCE S256 Challenge checks.')
        priorityFixes.push({
          title: 'Enforce S256 PKCE challenges',
          desc: 'Deploy exact S256 code challenge bindings on your login client handshakes.',
          fix: `// Code Challenge setup
const challenge = sha256(verifier);`
        })
      }

      if (hasMtls) {
        score += 20
        strengths.push('mTLS mutual workload mesh authentication enforced.')
      } else {
        weaknesses.push('Workload communications susceptible to man-in-the-middle spoofing.')
        missingControls.push('mTLS service mesh cert check.')
      }

      if (hasDpop) {
        score += 10
        strengths.push('DPoP sender constraints are enforced.')
      } else {
        weaknesses.push('Access tokens are plain bearer tokens susceptible to replay attacks.')
      }

      return {
        id: 'custom',
        title: 'Custom User Upload Architecture Review',
        score: Math.min(95, score),
        description: 'Automated review of user pasted code blocks.',
        strengths,
        weaknesses: weaknesses.length > 0 ? weaknesses : ['No severe vulnerabilities caught.'],
        missingControls: missingControls.length > 0 ? missingControls : ['None'],
        compliance,
        priorityFixes
      }
    } else {
      return TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0]
    }
  }, [isCustomMode, customDesignCode, selectedTemplateId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
              <CheckSquare className="w-3.5 h-3.5 animate-pulse" /> Initiative 4 Milestone
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              IAM Design Review Assistant
            </h1>
            <p className="text-sm text-text-secondary">
              Deconstruct, validate, and audit your corporate identity integrations. Execute automated structural reviews on OAuth, SAML, and JWT blueprints.
            </p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex gap-2 border-b border-border-subtle overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { setIsCustomMode(false); setShowReport(false); }}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              !isCustomMode 
                ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            📋 Select Corporate Blueprint Template
          </button>
          <button
            onClick={() => { setIsCustomMode(true); setShowReport(false); }}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              isCustomMode 
                ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            🛠️ Paste Custom Design Code
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT CONTAINER */}
      <div className="flex-grow min-h-0 relative flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Code/Template workspace */}
        <div className="lg:w-1/3 shrink-0 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex-grow min-h-0 overflow-y-auto space-y-4">
            
            {isCustomMode ? (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-1 text-xs font-bold text-text-primary">
                  <Terminal className="w-4 h-4 text-accent-primary" /> Paste Custom Integration Code
                </div>
                <textarea
                  value={customDesignCode}
                  onChange={(e) => { setCustomDesignCode(e.target.value); setShowReport(false); }}
                  placeholder="Paste OAuth parameters, SAML XML, or JWT code blocks here (e.g., includes PKCE, mTLS, etc.)"
                  className="flex-grow w-full p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none min-h-[220px]"
                />
              </div>
            ) : (
              <div className="space-y-5 select-none">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Target Blueprint</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => { setSelectedTemplateId(e.target.value); setShowReport(false); }}
                    className="w-full p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle text-xs text-text-primary font-bold outline-none focus:border-accent-primary"
                  >
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle space-y-1.5">
                  <span className="text-[9px] uppercase font-black text-text-muted block">Summary Scope</span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {TEMPLATES.find(t => t.id === selectedTemplateId)?.description}
                  </p>
                </div>

                <div className="space-y-2 font-mono">
                  <span className="text-[9px] uppercase font-black text-text-muted block">Vulnerable code snippet</span>
                  <pre className="p-4 rounded-xl bg-bg-nested border border-border-subtle text-[10px] text-text-primary overflow-x-auto leading-relaxed">
                    {TEMPLATES.find(t => t.id === selectedTemplateId)?.designCode}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {!showReport && (
            <div className="border-t border-border-subtle/30 pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setShowReport(true)}
                disabled={isCustomMode && !customDesignCode.trim()}
                className="px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-4 h-4 animate-pulse" /> Analyze Design Architecture
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Multi-tabbed Report output */}
        <div className="flex-grow min-w-0 bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          
          {showReport ? (
            <div className="flex-grow min-h-0 flex flex-col justify-between animate-in fade-in duration-300">
              
              {/* Report Tabs */}
              <div className="flex gap-1.5 bg-bg-sidebar p-1 rounded-xl border border-border-subtle max-w-lg select-none">
                {[
                  { id: 'dashboard', label: '📊 Posture Score' },
                  { id: 'controls', label: '🛡️ Controls & Audits' },
                  { id: 'compliance', label: '📑 Compliance GRC' },
                  { id: 'remediations', label: '✅ Remediation fixes' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReportTab(tab.id as 'dashboard' | 'controls' | 'compliance' | 'remediations')}
                    className={`flex-grow px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeReportTab === tab.id 
                        ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle/50' 
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB WORKSPACE CANVAS */}
              <div className="flex-grow min-h-0 overflow-y-auto mt-6 space-y-6">
                
                {/* 1. DASHBOARD */}
                {activeReportTab === 'dashboard' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Scorecard */}
                    <div className="flex justify-between items-center bg-bg-sidebar border border-border-subtle rounded-xl p-5 select-none">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-text-muted block leading-none">Security Architecture Score</span>
                        <span className="text-2xl font-black text-text-primary mt-2 inline-block">{activeReport?.score} / 100</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activeReport!.score >= 80 ? 'bg-status-success/15 text-status-success border border-status-success/20' :
                        activeReport!.score >= 50 ? 'bg-status-warning/15 text-status-warning border border-status-warning/20' :
                        'bg-status-danger/15 text-status-danger border border-status-danger/20'
                      }`}>
                        {activeReport!.score >= 80 ? 'High Robust' : activeReport!.score >= 50 ? 'Medium Risk' : 'Critical Failure'}
                      </div>
                    </div>

                    {/* Strengths vs Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-xl bg-status-success/5 border border-status-success/10 space-y-3">
                        <span className="text-xs font-black text-status-success uppercase flex items-center gap-1.5 border-b border-status-success/15 pb-2"><ShieldCheck className="w-4 h-4" /> Design Strengths</span>
                        <ul className="space-y-2">
                          {activeReport?.strengths.map((str, i) => (
                            <li key={i} className="flex gap-2 text-xs text-text-secondary leading-normal">
                              <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/10 space-y-3">
                        <span className="text-xs font-black text-status-danger uppercase flex items-center gap-1.5 border-b border-status-danger/15 pb-2"><ShieldAlert className="w-4 h-4" /> Architectural Weaknesses</span>
                        <ul className="space-y-2">
                          {activeReport?.weaknesses.map((weak, i) => (
                            <li key={i} className="flex gap-2 text-xs text-text-secondary leading-normal">
                              <ShieldAlert className="w-4 h-4 text-status-danger shrink-0 mt-0.5" /> {weak}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. CONTROLS & AUDITS */}
                {activeReportTab === 'controls' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3">
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle/30 pb-2 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-status-danger" /> Missing Security Controls</span>
                      <ul className="space-y-2.5">
                        {activeReport?.missingControls.map((control, i) => (
                          <li key={i} className="flex gap-2 text-xs text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-danger shrink-0 mt-2"></span>
                            {control}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. COMPLIANCE */}
                {activeReportTab === 'compliance' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <div className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3">
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-subtle/30 pb-2.5">Regulatory GRC Alignment</span>
                      <ul className="space-y-3">
                        {activeReport?.compliance.map((comp, i) => (
                          <li key={i} className="flex gap-2.5 text-xs text-text-secondary leading-normal">
                            <Info className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" /> {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 4. REMEDIATIONS */}
                {activeReportTab === 'remediations' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <div className="space-y-4">
                      {activeReport?.priorityFixes.map((pf, i) => (
                        <div key={i} className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-4">
                          <div>
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-wide">{pf.title}</h4>
                            <p className="text-xs text-text-secondary mt-1">{pf.desc}</p>
                          </div>
                          <div className="space-y-2 font-mono">
                            <span className="text-[9px] uppercase font-black text-text-muted block">Remediation Patch Code</span>
                            <pre className="p-4 rounded-xl bg-bg-nested border border-border-subtle text-[10px] text-text-primary overflow-x-auto select-text leading-relaxed">
                              {pf.fix}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-text-muted space-y-4 select-none">
              <Activity className="w-12 h-12 text-accent-primary animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-text-primary">Awaiting Architectural Review</h3>
                <p className="text-xs text-text-secondary mt-1">Configure your corporate templates or paste code on the left and click &quot;Analyze Design Architecture&quot;.</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
