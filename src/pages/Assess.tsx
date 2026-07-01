import { useState } from 'react'
import { 
  Award, Download, LineChart, ShieldCheck, 
  RefreshCw, Clipboard, ArrowRight, Check
} from 'lucide-react'

interface Question {
  dimension: string
  title: string
  q: string
  options: {
    score: number
    label: string
    desc: string
    remediation: string
  }[]
}

export default function Assess() {
  const [inProgress, setInActive] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const questions: Question[] = [
    {
      dimension: 'Identity Governance (IGA)',
      title: 'User Lifecycle Management',
      q: 'How are employee lifecycles (Joiner-Mover-Leaver events) managed across corporate applications?',
      options: [
        {
          score: 1,
          label: 'Tier 1: Ad-hoc & Manual',
          desc: 'Manual email tickets, spreadsheets, and manual account creations by IT administrators.',
          remediation: 'Migrate manual tickets to a centralized directory sync schema and automate basic scripting.'
        },
        {
          score: 3,
          label: 'Tier 2: Defined & Scripted',
          desc: 'Accounts are provisioned via scheduled scripts parsing active directory templates or CSV file loads.',
          remediation: 'Upgrade to automatic API-driven provisioning (SCIM 2.0) triggered from a single source of truth.'
        },
        {
          score: 5,
          label: 'Tier 3: Automated & Continuous',
          desc: 'Real-time API provisioning (SCIM) triggered natively by HR events (e.g. Workday), with immediate, automated de-provisioning on leaver detection.',
          remediation: 'Review and audit SCIM group mappings quarterly to identify privilege drift.'
        }
      ]
    },
    {
      dimension: 'Privileged Access (PAM)',
      title: 'Infrastructure & Key Secrets',
      q: 'How are administrative passwords, server credentials, and cloud secrets protected?',
      options: [
        {
          score: 1,
          label: 'Tier 1: Shared Passwords',
          desc: 'Shared administrative passwords or static SSH keys kept in text files or unencrypted vaults.',
          remediation: 'Enforce individual admin accounts and transition all keys to an encrypted shared vault immediately.'
        },
        {
          score: 3,
          label: 'Tier 2: Centralized Vaulting',
          desc: 'Secrets are stored in an encrypted vault (e.g. HashiCorp Vault) with individual logging but standing permanent privileges.',
          remediation: 'Adopt Just-In-Time (JIT) access, issuing short-lived SSH keys or session cookies that auto-expire.'
        },
        {
          score: 5,
          label: 'Tier 3: Just-in-Time (JIT) Access',
          desc: 'No standing permanent administrative accounts. Ephemeral, short-lived certificates or keys are generated dynamically and auto-expire within minutes, with session audit recording.',
          remediation: 'Integrate PAM alerts directly into your Security Operations Center (SIEM/SOC) for real-time bypass audits.'
        }
      ]
    },
    {
      dimension: 'Customer Identity (CIAM)',
      title: 'Customer Registration & Login',
      q: 'What authentication standards are used for customer-facing interfaces or social federation?',
      options: [
        {
          score: 1,
          label: 'Tier 1: Local DB Passwords',
          desc: 'Homegrown SQL tables storing hashed passwords. No federated identity standard or social login support.',
          remediation: 'Outsource password management to an external OIDC Identity Provider (e.g., Keycloak, Auth0).'
        },
        {
          score: 3,
          label: 'Tier 2: Standard Federated SSO',
          desc: 'Built on standardized OAuth 2.0 / OpenID Connect (OIDC) protocols with social login integration and basic MFA.',
          remediation: 'Implement passwordless login methods (FIDO2 / WebAuthn Passkeys) and progressive user profiling.'
        },
        {
          score: 5,
          label: 'Tier 3: Passwordless & Risk-Adaptive',
          desc: 'Mandatory passwordless login utilizing WebAuthn / Passkeys. Progressive profiling limits friction, and dynamic anomaly detection terminates suspect connections.',
          remediation: 'Enforce synced vs. device-bound passkey policy auditing depending on user data risk profiles.'
        }
      ]
    },
    {
      dimension: 'Workforce Access (AM)',
      title: 'Employee Authentication & MFA',
      q: 'What Multi-Factor Authentication (MFA) standards apply to employees accessing internal systems?',
      options: [
        {
          score: 1,
          label: 'Tier 1: Basic Passwords',
          desc: 'Passwords only, or MFA is only enforced on select administrative boundaries.',
          remediation: 'Enforce mandatory MFA across all user boundaries using mobile authentication apps.'
        },
        {
          score: 3,
          label: 'Tier 2: Push & TOTP Apps',
          desc: 'Mandatory MFA using mobile push notifications, SMS texts, or timed authenticator apps (TOTP).',
          remediation: 'Enforce phishing-resistant MFA (FIDO2 Security Keys or Passkeys) to bypass interception tricks.'
        },
        {
          score: 5,
          label: 'Tier 3: Phishing-Resistant MFA',
          desc: 'Mandatory phishing-resistant authentication (FIDO2 or platform passkeys), enforced globally under context-based conditional rules.',
          remediation: 'Review device compliance rules to ensure access is denied if local firewalls or system patches fail.'
        }
      ]
    },
    {
      dimension: 'Zero Trust and Dynamic Risk',
      title: 'Session Verification Engine',
      q: 'How is user authorization evaluated after initial login has occurred?',
      options: [
        {
          score: 1,
          label: 'Tier 1: Permanent Session Cookies',
          desc: 'Sessions remain valid indefinitely or require manual timeouts. No context validation after login.',
          remediation: 'Configure absolute session timeouts (e.g., maximum 8 to 12 hours) and implement IP geofence audits.'
        },
        {
          score: 3,
          label: 'Tier 2: Fixed Timeout Windows',
          desc: 'Access tokens expire and refresh after a fixed, standard timeframe (e.g. 1 hour access, 24 hours refresh).',
          remediation: 'Transition to Continuous Adaptive Trust, setting up Shared Signals (CAEP/SSF) to capture security events.'
        },
        {
          score: 5,
          label: 'Tier 3: Continuous Adaptive Trust',
          desc: 'Real-time session monitoring using Continuous Access Evaluation Protocol (CAEP / SSF). IP shifts or compliance failures instantly trigger revocation.',
          remediation: 'Establish joint threat-sharing circles with key partners using unified SSF event feeds.'
        }
      ]
    }
  ]

  const handleSelectOption = (score: number) => {
    setAnswers({ ...answers, [activeStep]: score })
  }

  const nextStep = () => {
    if (activeStep < questions.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const startAssessment = () => {
    setAnswers({})
    setActiveStep(0)
    setShowResults(false)
    setInActive(true)
  }

  // Scoring Metrics Calculations
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 5
  const percentage = Math.round((totalScore / maxScore) * 100)
  const averageScore = Number((totalScore / questions.length).toFixed(1))

  const getMaturityTier = () => {
    if (averageScore <= 1.8) return { label: 'Tier 1: Ad-Hoc & Siloed', color: 'text-status-danger bg-status-danger/5 border-status-danger/20', desc: 'Your IAM systems are highly fragmented, rely on manual tasks, and are vulnerable to password interception or shared-secret leakages.' }
    if (averageScore <= 3.4) return { label: 'Tier 2: Standardized & Defined', color: 'text-status-warning bg-status-warning/5 border-status-warning/20', desc: 'You have established central directory controls and standard SSO patterns. Security is defined but vulnerable to standing privileges and push-fatigue attacks.' }
    return { label: 'Tier 3: Adaptive Zero Trust', color: 'text-status-success bg-status-success/5 border-status-success/20', desc: 'Outstanding! Your environment is driven by automated SCIM loops, Just-In-Time access controls, phishing-resistant Passkeys, and continuous CAEP session audits.' }
  }

  const maturityTier = getMaturityTier()

  // Generate downloadable SVG roadmap dynamically
  const triggerDownload = () => {
    const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const tierText = escapeXml(maturityTier.label)
    const scoreText = escapeXml(`Maturity: ${percentage}% (Avg: ${averageScore}/5.0)`)
    
    // Construct inline SVG document as string
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#070a13; font-family:sans-serif;">
      <!-- Title Block -->
      <rect x="20" y="20" width="760" height="80" rx="10" fill="#0d1222" stroke="#1e293b" stroke-width="2"/>
      <text x="40" y="66" fill="#f8fafc" font-size="22" font-weight="bold">AboutIAM Secure Roadmap</text>
      <text x="40" y="86" fill="#94a3b8" font-size="12">Enterprise IAM Maturity Audit Exporter</text>

      <!-- Results Summary Card -->
      <rect x="20" y="120" width="760" height="140" rx="10" fill="#0d1222" stroke="#3b82f6" stroke-width="1.5" />
      <text x="40" y="160" fill="#3b82f6" font-size="14" font-weight="bold" letter-spacing="1">CURRENT STATUS SUMMARY</text>
      <text x="40" y="195" fill="#f8fafc" font-size="28" font-weight="black">${tierText}</text>
      <text x="40" y="230" fill="#94a3b8" font-size="14">${scoreText}</text>

      <!-- Chart Columns -->
      <rect x="20" y="280" width="370" height="280" rx="10" fill="#0d1222" stroke="#1e293b" />
      <text x="40" y="315" fill="#94a3b8" font-size="12" font-weight="bold" letter-spacing="1">MATURITY DIMENSIONS</text>
      ${questions.map((_, i) => {
        const val = answers[i] || 1
        const height = (val / 5) * 160
        const yPos = 490 - height
        const xPos = 50 + (i * 68)
        return `
          <rect x="${xPos}" y="${yPos}" width="36" height="${height}" rx="4" fill="#3b82f6" />
          <text x="${xPos + 18}" y="${yPos - 10}" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">${val}.0</text>
          <text x="${xPos + 18}" y="515" fill="#94a3b8" font-size="9" text-anchor="middle">Dim ${i + 1}</text>
        `
      }).join('')}

      <!-- Quick Action Steps -->
      <rect x="410" y="280" width="370" height="280" rx="10" fill="#0d1222" stroke="#1e293b" />
      <text x="430" y="315" fill="#94a3b8" font-size="12" font-weight="bold" letter-spacing="1">CRITICAL REMEDIATION STEPS</text>
      ${questions.map((q, i) => {
        const selectedOpt = q.options.find(o => o.score === answers[i]) || q.options[0]
        const text = `${i+1}. ${q.dimension}: ${selectedOpt.remediation}`
        // Truncate text beautifully
        const truncated = text.length > 52 ? text.substring(0, 49) + '...' : text
        const yOffset = 350 + (i * 38)
        return `
          <circle cx="440" cy="${yOffset - 4}" r="4" fill="#ef4444" />
          <text x="454" y="${yOffset}" fill="#f8fafc" font-size="11" font-weight="semibold">${truncated}</text>
        `
      }).join('')}
    </svg>
    `

    // Generate blob and download natively
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_maturity_roadmap.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsDownloaded(true)
    setTimeout(() => setIsDownloaded(false), 2000)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Award className="w-3.5 h-3.5" /> GRC Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Maturity Assessment Wizard
        </h2>
        <p className="text-text-secondary">
          Conduct an interactive self-audit across 5 core security pillars. Map alignment scores to NIST SP 800-207 frameworks, view dynamic columns, and export custom vector SVG checklists.
        </p>
      </div>

      {!inProgress && !showResults && (
        /* Welcome Panel */
        <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-6 md:w-2/3">
            <h3 className="text-2xl font-bold text-text-primary">Audit Your Enterprise Readiness</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our structured assessment audits the alignment of your administrative structures across identity lifecycles (IGA), privileged vaults (PAM), consumer integrations (CIAM), phishing MFA (AM), and zero trust continuous adaptive sessions.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-text-muted">
              <div className="flex items-center gap-2">🟢 NIST SP 800-207 Mapped</div>
              <div className="flex items-center gap-2">🟢 Immediate Score Grading</div>
              <div className="flex items-center gap-2">🟢 Code-Level Remediation Plans</div>
              <div className="flex items-center gap-2">🟢 Exporter Vector SVG Roadmaps</div>
            </div>
            <button 
              onClick={startAssessment}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-sm font-semibold transition-all shadow-lg shadow-accent-primary/25 group"
            >
              Begin Self-Assessment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="md:w-1/3 flex items-center justify-center shrink-0">
            <LineChart className="w-32 h-32 text-accent-primary/30 stroke-[1.5px] animate-pulse-slow" />
          </div>
        </div>
      )}

      {inProgress && !showResults && (
        /* Questionnaire Stepper */
        <div className="grid lg:grid-cols-3 gap-8 pt-2">
          {/* Question Picker Card */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-accent-primary bg-accent-glow px-3 py-1.5 rounded-full border border-accent-primary/10 w-fit">
                {questions[activeStep].dimension}
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                {questions[activeStep].title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {questions[activeStep].q}
              </p>

              {/* Dynamic Multiple Choice Grid */}
              <div className="space-y-3 pt-4">
                {questions[activeStep].options.map((opt) => {
                  const isSelected = answers[activeStep] === opt.score
                  return (
                    <button
                      key={opt.score}
                      onClick={() => handleSelectOption(opt.score)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-accent-glow border-accent-primary shadow-sm shadow-accent-primary/5' 
                          : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar text-text-primary'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-accent-primary bg-accent-primary text-white' : 'border-border-subtle bg-bg-card'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </div>
                        <div className="space-y-1">
                          <span className={`text-xs font-bold uppercase ${isSelected ? 'text-accent-primary' : 'text-text-secondary'}`}>
                            {opt.label}
                          </span>
                          <p className="text-xs text-text-secondary font-medium leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stepper Navigation Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50 mt-8">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted font-bold uppercase">
                  Pillar {activeStep + 1} of {questions.length}
                </span>
                <button
                  onClick={nextStep}
                  disabled={!answers[activeStep]}
                  className="px-5 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-accent-primary/15"
                >
                  {activeStep === questions.length - 1 ? 'Analyze Maturity Report' : 'Next Step'}
                </button>
              </div>
            </div>
          </div>

          {/* Pillars List Tracker Sidebar */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm h-fit space-y-4">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Clipboard className="w-4 h-4 text-accent-primary" /> Pillars Tracker
            </h4>
            <div className="space-y-2.5">
              {questions.map((q, i) => {
                const answer = answers[i]
                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${
                      i === activeStep 
                        ? 'border-accent-primary/30 bg-accent-glow/5 text-accent-primary' 
                        : 'border-border-subtle bg-bg-sidebar/30 text-text-secondary'
                    }`}
                  >
                    <span>{q.dimension}</span>
                    {answer ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-success/10 border border-status-success/20 text-status-success font-bold uppercase">
                        Tier {answer === 1 ? '1' : answer === 3 ? '2' : '3'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-text-muted font-bold uppercase">Pending</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showResults && (
        /* Results Executive Panel */
        <div className="space-y-8 animate-fadeIn">
          {/* Main Scoring Header */}
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm grid md:grid-cols-3 gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Percentage Gauge */}
            <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-6 border-r border-border-subtle/50 relative z-10">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                {/* SVG Progress Circle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="64" fill="none" className="stroke-border-subtle" strokeWidth="8" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    fill="none" 
                    className="stroke-accent-primary transition-all duration-1000" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - percentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="space-y-0.5 relative z-10 text-center">
                  <span className="text-3xl font-black text-text-primary">{percentage}%</span>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Maturity Score</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-4 font-bold uppercase tracking-wider">
                Average Score: {averageScore} / 5.0
              </p>
            </div>

            {/* Maturity Level Text */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-4 relative z-10">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">EXECUTIVE RULING</span>
                <h3 className={`text-2xl font-black rounded-lg px-4 py-2 w-fit border ${maturityTier.color}`}>
                  {maturityTier.label}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  {maturityTier.desc}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-subtle/50">
                <button
                  onClick={triggerDownload}
                  className="px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 flex items-center gap-1.5"
                >
                  {isDownloaded ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                  {isDownloaded ? 'Roadmap Downloaded!' : 'Download SVG Roadmap'}
                </button>
                <button
                  onClick={startAssessment}
                  className="px-4 py-2.5 rounded-lg border border-border-subtle hover:bg-bg-sidebar text-text-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Restart Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Column Chart & Remediations Matrix */}
          <div className="grid md:grid-cols-5 gap-8">
            {/* Bar Chart Visualization (3 columns) */}
            <div className="md:col-span-3 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <LineChart className="w-4 h-4 text-accent-primary" /> Maturity Dimensions Bar Chart
              </h4>

              {/* Dynamic SVG Columns */}
              <div className="relative w-full h-[220px] flex items-end justify-around pt-6 px-4">
                {/* Horizontal Baseline Guideline */}
                <div className="absolute left-0 right-0 bottom-8 border-b border-border-subtle/50 border-dashed"></div>

                {questions.map((q, i) => {
                  const score = answers[i] || 1
                  const height = (score / 5) * 140
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group w-14 relative z-10">
                      {/* Floating tooltip score */}
                      <span className="text-[11px] font-extrabold text-text-primary bg-bg-sidebar border border-border-subtle px-2 py-0.5 rounded shadow-sm opacity-100 transition-opacity">
                        {score}.0
                      </span>
                      {/* Interactive Pillar bar */}
                      <div 
                        style={{ height: `${height}px` }}
                        className={`w-10 rounded-t-md transition-all duration-1000 ${
                          score === 1 && 'bg-status-danger/60 border border-status-danger/80'
                        } ${
                          score === 3 && 'bg-status-warning/60 border border-status-warning/80'
                        } ${
                          score === 5 && 'bg-status-success/60 border border-status-success/80'
                        }`}
                      ></div>
                      {/* Short Label */}
                      <span className="text-[9px] font-bold text-text-muted uppercase text-center tracking-wider truncate w-full" title={q.dimension}>
                        Pillar {i+1}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-text-muted pt-2 border-t border-border-subtle/30">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-status-danger/60"></span> Ad-hoc (1.0)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-status-warning/60"></span> Defined (3.0)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-status-success/60"></span> Optimized (5.0)</span>
              </div>
            </div>

            {/* Custom Remediation List (2 columns) */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <ShieldCheck className="w-4.5 h-4.5 text-accent-secondary" /> Mapped Remediation Steps
              </h4>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {questions.map((q, i) => {
                  const score = answers[i] || 1
                  const selectedOption = q.options.find(o => o.score === score) || q.options[0]
                  return (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed">
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] border ${
                        score === 1 && 'bg-status-danger/10 border-status-danger/20 text-status-danger'
                      } ${
                        score === 3 && 'bg-status-warning/10 border-status-warning/20 text-status-warning'
                      } ${
                        score === 5 && 'bg-status-success/10 border-status-success/20 text-status-success'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-text-primary uppercase tracking-wide text-[10px] block">
                          {q.dimension}
                        </span>
                        <p className="text-text-secondary font-medium">
                          {selectedOption.remediation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
