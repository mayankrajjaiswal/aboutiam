import { useState } from 'react'
import {
  Award, Download, LineChart, ShieldCheck,
  RefreshCw, Clipboard, ArrowRight, Check, Link2, FileText, Presentation
} from 'lucide-react'
import { questions, computeScores, getMaturityTier, encodeAnswers, decodeAnswers } from '../lib/assess/scoring'
import { mapScoreToGartnerLevel, estimatePeerPercentile, PEER_BENCHMARK_SOURCE_NOTE, GARTNER_LEVELS } from '../lib/assess/maturityBenchmark'
import { saveLastAssessment } from '../lib/assess/assessHistory'
import JourneyBreadcrumb from '../components/JourneyBreadcrumb'
import ShareScoreButton from '../components/ShareScoreButton'

function getSharedParam(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('a')
}

export default function Assess() {
  const sharedAnswers = useState(() => decodeAnswers(getSharedParam()))[0]
  const [inProgress, setInActive] = useState(!!sharedAnswers)
  const [activeStep, setActiveStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>(() => sharedAnswers ?? {})
  const [showResults, setShowResults] = useState(!!sharedAnswers)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isBoardSlideDownloaded, setIsBoardSlideDownloaded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isArticleDownloaded, setIsArticleDownloaded] = useState(false)
  const isSharedReport = !!sharedAnswers

  const handleSelectOption = (score: number) => {
    setAnswers({ ...answers, [activeStep]: score })
  }

  const nextStep = () => {
    if (activeStep < questions.length - 1) {
      setInActive(true) // prevent closing progress state
      setActiveStep(activeStep + 1)
    } else {
      saveLastAssessment(answers)
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
  const { percentage, averageScore } = computeScores(answers)
  const maturityTier = getMaturityTier(averageScore)
  const gartnerLevel = mapScoreToGartnerLevel(percentage)
  const peerPercentile = estimatePeerPercentile(percentage)

  const copyShareableLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?a=${encodeAnswers(answers)}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadMarkdownCaseStudy = () => {
    const lines = [
      '---',
      'title: "Corporate GRC Identity Security Maturity Audit Case Study"',
      'published: true',
      'tags: "security, cybersecurity, devsecops, iam, compliance"',
      'canonical_url: "https://www.aboutiam.com/assess"',
      '---',
      '',
      '# Corporate Identity GRC Maturity Case Study Report',
      '',
      'Our security engineering and architecture teams conducted an exhaustive Identity Governance, Risk & Compliance (GRC) maturity self-assessment on the [AboutIAM platform](https://www.aboutiam.com/assess). Here are our verified results, gaps, and strategic mitigation plans.',
      '',
      '## 📊 Executive Maturity Summary',
      `- **Maturity Score:** **${percentage}%**`,
      `- **Average Maturity Tier:** **${averageScore} / 5.0**`,
      `- **Assessed Rating:** **${maturityTier.label}**`,
      '',
      '### Assessment Focus Areas:',
      'Our maturity has been calculated across five major corporate identity dimensions:',
    ]

    questions.forEach((q, idx) => {
      const scoreVal = answers[idx] ?? 0
      const tierLabel = scoreVal === 1 ? 'Tier 1 (Tactical / Siloed)' : scoreVal === 3 ? 'Tier 2 (Standardized)' : 'Tier 3 (Optimized / Governed)'
      lines.push(`- **${q.dimension}:** ${tierLabel}`)
    })

    lines.push(
      '',
      '## 🔍 GRC Posture Ruling & Strategy',
      `> *"${maturityTier.desc}"*`,
      '',
      '## 🛠️ Strategic Remediation Plan',
      '1. **Deploy Zero-Backend Identity Guardrails:** Establish centralized on-device audit and validation policies.',
      '2. **Leverage Modern Attestation Controls:** Integrate hardware-bound cryptographic passkeys to eliminate credential theft loops.',
      '3. **Continuous Access Audits:** Perform quarterly RACI matrix and risk-register reviews inside our central Executive Command Center.',
      '',
      '---',
      '*Generated autonomously via the [AboutIAM GRC Maturity Center](https://www.aboutiam.com/assess) — Zero-Backend Identity Security Playground.*'
    )

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_grc_case_study.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsArticleDownloaded(true)
    setTimeout(() => setIsArticleDownloaded(false), 2000)
  }

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

  // Generate high-resolution presentation board slide (16:9 widescreen layout)
  const triggerBoardSlideDownload = () => {
    const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const tierText = escapeXml(maturityTier.label)
    const scoreText = escapeXml(`Security Posture: ${percentage}% | Average Score: ${averageScore}/5.0`)
    
    // Construct 16:9 Widescreen slide SVG content
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" style="background:#070a13; font-family:'Inter', sans-serif;">
      <!-- Gradient Definitions -->
      <defs>
        <linearGradient id="primaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#14b8a6" />
        </linearGradient>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0d1222" />
          <stop offset="100%" stop-color="#0a0e1a" />
        </linearGradient>
      </defs>

      <!-- Background Grid Pattern -->
      <rect width="1920" height="1080" fill="#070a13"/>
      <path d="M 0,90 L 1920,90 M 0,990 L 1920,990" stroke="#1e293b" stroke-width="1" stroke-dasharray="5,5"/>

      <!-- Slide Header -->
      <text x="80" y="80" fill="#94a3b8" font-size="14" font-weight="800" letter-spacing="3" uppercase="true">IDENTITY GOVERNANCE &amp; COMPLIANCE BRIEFING</text>
      <text x="80" y="130" fill="#f8fafc" font-size="36" font-weight="900" letter-spacing="-1">EXECUTIVE IAM POSTURE ASSESSMENT</text>
      <text x="1840" y="80" fill="#ef4444" font-size="14" font-weight="900" letter-spacing="2" text-anchor="end">⚠️ CONFIDENTIAL — FOR BOARD REVIEW ONLY</text>

      <!-- LEFT SIDEBAR: Overall Performance KPI Card -->
      <g transform="translate(80, 200)">
        <rect width="520" height="710" rx="20" fill="url(#cardBg)" stroke="#3b82f6" stroke-width="2" />
        <!-- Score Dial Header -->
        <text x="40" y="60" fill="#3b82f6" font-size="14" font-weight="800" letter-spacing="2">MATURITY INDEX RATING</text>
        
        <!-- Large Score Dial Graphic -->
        <circle cx="260" cy="230" r="110" fill="none" stroke="#1e293b" stroke-width="16" />
        <circle cx="260" cy="230" r="110" fill="none" stroke="url(#primaryGlow)" stroke-width="16" stroke-dasharray="691" stroke-dashoffset="${691 - (691 * percentage) / 100}" stroke-linecap="round" />
        <text x="260" y="245" fill="#f8fafc" font-size="54" font-weight="900" text-anchor="middle">${percentage}%</text>

        <!-- Rating Pill -->
        <text x="260" y="410" fill="#38bdf8" font-size="28" font-weight="900" text-anchor="middle" uppercase="true">${tierText}</text>
        <text x="260" y="440" fill="#64748b" font-size="14" font-weight="700" text-anchor="middle">${scoreText}</text>

        <!-- Executive Narrative Summary -->
        <rect x="30" y="480" width="460" height="190" rx="12" fill="#070a13" stroke="#1e293b" />
        <text x="50" y="520" fill="#94a3b8" font-size="14" font-weight="bold" letter-spacing="1">ARCHITECT'S ANALYSIS</text>
        <text x="50" y="555" fill="#e2e8f0" font-size="14" font-weight="medium" leading="22">
          <tspan x="50" dy="0">This self-audit evaluates our capability across five core</tspan>
          <tspan x="50" dy="25">identity pillars (directory, MFA, delegation, access</tspan>
          <tspan x="50" dy="25">policies, and session trust). The current footprint</tspan>
          <tspan x="50" dy="25">attests to an optimized, risk-mitigated environment.</tspan>
        </text>
      </g>

      <!-- CENTER SECTION: Pillar-By-Pillar Maturity Graph & Spider Radar -->
      <g transform="translate(640, 200)">
        <rect width="600" height="710" rx="20" fill="url(#cardBg)" stroke="#1e293b" stroke-width="1.5" />
        <text x="40" y="60" fill="#94a3b8" font-size="14" font-weight="800" letter-spacing="2">PILLAR DIMENSION MATURITY GAUGE</text>

        <!-- Spider Radar Chart Background Grids -->
        <g transform="translate(200, 310) scale(1.1)">
          ${[1, 2, 3, 4, 5].map(level => {
            const r = (level / 5) * 80;
            const pts = questions.map((_, i) => {
              const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
              return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
            }).join(' ');
            return `<polygon points="${pts}" fill="none" stroke="${level === 5 ? '#334155' : '#1e293b'}" stroke-width="1" />`;
          }).join('')}
          
          <!-- Axis Lines -->
          ${questions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
            return `<line x1="100" y1="100" x2="${100 + 80 * Math.cos(angle)}" y2="${100 + 80 * Math.sin(angle)}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2,2" />`;
          }).join('')}

          <!-- Dynamic Score Polygon -->
          <polygon
            points="${questions.map((_, i) => {
              const score = answers[i] || 1;
              const r = (score / 5) * 80;
              const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
              return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
            }).join(' ')}"
            fill="rgba(59,130,246,0.2)"
            stroke="#3b82f6"
            stroke-width="2"
            stroke-linejoin="round"
          />
          
          <!-- Radar Data Points -->
          ${questions.map((_, i) => {
            const score = answers[i] || 1;
            const r = (score / 5) * 80;
            const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
            const x = 100 + r * Math.cos(angle);
            const y = 100 + r * Math.sin(angle);
            return `<circle cx="${x}" cy="${y}" r="3.5" fill="#3b82f6" stroke="#0d1222" stroke-width="1" />`;
          }).join('')}
          
          <!-- Radar Labels -->
          ${questions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
            const x = 100 + 96 * Math.cos(angle);
            const y = 100 + 96 * Math.sin(angle);
            let anchor = "middle";
            if (x < 90) anchor = "end";
            if (x > 110) anchor = "start";
            return `<text x="${x}" y="${y}" fill="#94a3b8" font-size="7" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle">P${i+1}</text>`;
          }).join('')}
        </g>

        <!-- Bars Rendering Grid -->
        ${questions.map((q, i) => {
          const val = answers[i] || 1
          const barHeight = (val / 5) * 120
          const yPos = 650 - barHeight
          const xPos = 65 + (i * 105)
          const dimLabel = q.dimension.length > 14 ? q.dimension.substring(0, 11) + '...' : q.dimension
          return `
            <!-- Background track -->
            <rect x="${xPos}" y="530" width="48" height="120" rx="4" fill="#070a13" stroke="#1e293b" stroke-width="1" />
            <!-- Active value -->
            <rect x="${xPos}" y="${yPos}" width="48" height="${barHeight}" rx="4" fill="url(#primaryGlow)" />
            <!-- Floating Text Value -->
            <text x="${xPos + 24}" y="${yPos - 12}" fill="#f8fafc" font-size="14" font-weight="900" text-anchor="middle">${val.toFixed(1)}</text>
            <!-- X-Axis Labels -->
            <text x="${xPos + 24}" y="675" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">${escapeXml(dimLabel)}</text>
            <text x="${xPos + 24}" y="692" fill="#64748b" font-size="10" font-weight="700" text-anchor="middle">Dim ${i + 1}</text>
          `
        }).join('')}
      </g>

      <!-- RIGHT COLUMN: Strategic Remediation Plan -->
      <g transform="translate(1280, 200)">
        <rect width="560" height="710" rx="20" fill="url(#cardBg)" stroke="#1e293b" stroke-width="1.5" />
        <text x="40" y="60" fill="#94a3b8" font-size="14" font-weight="800" letter-spacing="2">IMMEDIATE ACTION BOARD DIRECTIVES</text>

        <!-- Action Items list -->
        ${questions.map((q, i) => {
          const selectedOpt = q.options.find(o => o.score === answers[i]) || q.options[0]
          const label = escapeXml(q.dimension)
          const remediation = escapeXml(selectedOpt.remediation)
          const truncatedRemediation = remediation.length > 56 ? remediation.substring(0, 53) + '...' : remediation
          const yOffset = 150 + (i * 105)
          return `
            <!-- Indicator Icon -->
            <circle cx="50" cy="${yOffset + 10}" r="16" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1" />
            <text x="50" y="${yOffset + 15}" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">${i + 1}</text>
            
            <text x="85" y="${yOffset + 5}" fill="#f8fafc" font-size="14" font-weight="bold">${label}</text>
            <text x="85" y="${yOffset + 26}" fill="#94a3b8" font-size="12" font-weight="medium">${truncatedRemediation}</text>
            <line x1="40" y1="${yOffset + 54}" x2="520" y2="${yOffset + 54}" stroke="#1e293b" stroke-width="1" />
          `
        }).join('')}
      </g>

      <!-- Footer Metadata / Signoff -->
      <text x="80" y="1030" fill="#64748b" font-size="12" font-weight="600" letter-spacing="1">GENERATED VIA WWW.ABOUTIAM.COM · MIT LICENSE EDUCATIONAL WORKSPACE</text>
      <text x="1840" y="1030" fill="#64748b" font-size="12" font-weight="700" letter-spacing="1" text-anchor="end">SLIDE 1 OF 1 · ALL RIGHTS RESERVED</text>
    </svg>
    `

    // Generate blob and download natively
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_board_maturity_slide.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsBoardSlideDownloaded(true)
    setTimeout(() => setIsBoardSlideDownloaded(false), 2000)
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
          <JourneyBreadcrumb currentPath="/assess" />
          {isSharedReport && (
            <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary font-medium">
                You're viewing a <span className="font-bold text-accent-primary">shared maturity report</span>.
              </span>
              <button
                onClick={startAssessment}
                className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shrink-0"
              >
                Start Your Own Assessment
              </button>
            </div>
          )}
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
                  onClick={triggerBoardSlideDownload}
                  className="px-4 py-2.5 rounded-lg border border-accent-primary/20 hover:border-accent-primary bg-bg-sidebar hover:bg-accent-glow text-accent-primary text-xs font-bold transition-all hover-cyber-glow flex items-center gap-1.5"
                >
                  {isBoardSlideDownloaded ? <Check className="w-4 h-4 text-accent-primary" /> : <Presentation className="w-4 h-4 text-accent-primary animate-pulse-slow" />}
                  {isBoardSlideDownloaded ? 'Board Slide Exported!' : 'Export for Board Slide (16:9)'}
                </button>
                <button
                  onClick={copyShareableLink}
                  className="px-4 py-2.5 rounded-lg border border-border-subtle hover:bg-bg-sidebar text-text-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-4 h-4 text-status-success" /> : <Link2 className="w-4 h-4" />}
                  {isCopied ? 'Link Copied!' : 'Copy Shareable Link'}
                </button>
                <button
                  onClick={downloadMarkdownCaseStudy}
                  className="px-4 py-2.5 rounded-lg border border-border-subtle hover:bg-bg-sidebar text-text-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isArticleDownloaded ? <Check className="w-4 h-4 text-status-success" /> : <FileText className="w-4 h-4 text-accent-primary" />}
                  {isArticleDownloaded ? 'Case Study Generated!' : 'Publish Case Study (Dev.to)'}
                </button>
                <button
                  onClick={startAssessment}
                  className="px-4 py-2.5 rounded-lg border border-border-subtle hover:bg-bg-sidebar text-text-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Restart Assessment
                </button>
              </div>

              <ShareScoreButton
                moduleName="GRC Maturity Wizard"
                score={`${percentage}% (${maturityTier.label})`}
                date={new Date().toISOString().slice(0, 10)}
                className="pt-2"
              />
            </div>
          </div>

          {/* Visual Charts & Remediations Matrix */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Bar Chart Visualization */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <LineChart className="w-4 h-4 text-accent-primary" /> Maturity Dimensions
              </h4>

              {/* Dynamic SVG Columns */}
              <div className="relative w-full h-[220px] flex items-end justify-around pt-6 px-2">
                {/* Horizontal Baseline Guideline */}
                <div className="absolute left-0 right-0 bottom-8 border-b border-border-subtle/50 border-dashed"></div>

                {questions.map((q, i) => {
                  const score = answers[i] || 1
                  const height = (score / 5) * 140
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group w-12 relative z-10 hover-cyber-glow cursor-default">
                      {/* Floating tooltip score */}
                      <span className="text-[11px] font-extrabold text-text-primary bg-bg-sidebar border border-border-subtle px-2 py-0.5 rounded shadow-sm opacity-100 transition-opacity">
                        {score}.0
                      </span>
                      {/* Interactive Pillar bar */}
                      <div 
                        style={{ height: `${height}px` }}
                        className={`w-8 rounded-t-md transition-all duration-1000 ${
                          score === 1 && 'bg-status-danger/60 border border-status-danger/80 shadow-[0_0_10px_rgba(248,113,113,0.3)]'
                        } ${
                          score === 3 && 'bg-status-warning/60 border border-status-warning/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        } ${
                          score === 5 && 'bg-status-success/60 border border-status-success/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                        }`}
                      ></div>
                      {/* Short Label */}
                      <span className="text-[9px] font-bold text-text-muted uppercase text-center tracking-wider truncate w-full" title={q.dimension}>
                        P{i+1}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider text-text-muted pt-2 border-t border-border-subtle/30">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-status-danger/60"></span> Ad-hoc</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-status-warning/60"></span> Defined</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-status-success/60"></span> Optimized</span>
              </div>
            </div>

            {/* Spider Radar Chart */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6 flex flex-col justify-between hover-cyber-glow transition-all">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <ShieldCheck className="w-4 h-4 text-accent-primary" /> Posture Radar Graph
              </h4>
              
              <div className="relative w-full aspect-square flex items-center justify-center -mt-2">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[240px] drop-shadow-lg">
                  {/* Web Background Grids */}
                  {[1, 2, 3, 4, 5].map((level) => {
                    const r = (level / 5) * 80;
                    const points = questions.map((_, i) => {
                      const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
                      return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                    }).join(' ');
                    return (
                      <polygon 
                        key={`grid-${level}`} 
                        points={points} 
                        fill="none" 
                        className={`stroke-border-subtle/50 ${level === 5 ? 'stroke-border-subtle' : ''}`}
                        strokeWidth="1" 
                      />
                    );
                  })}
                  
                  {/* Axis Lines */}
                  {questions.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
                    return (
                      <line
                        key={`axis-${i}`}
                        x1="100" y1="100"
                        x2={100 + 80 * Math.cos(angle)}
                        y2={100 + 80 * Math.sin(angle)}
                        className="stroke-border-subtle/50"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    );
                  })}

                  {/* Dynamic Score Polygon */}
                  <polygon
                    points={questions.map((_, i) => {
                      const score = answers[i] || 1;
                      const r = (score / 5) * 80;
                      const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
                      return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                    }).join(' ')}
                    className="fill-accent-primary/20 stroke-accent-primary animate-pulse-slow"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data Points */}
                  {questions.map((_, i) => {
                    const score = answers[i] || 1;
                    const r = (score / 5) * 80;
                    const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
                    const x = 100 + r * Math.cos(angle);
                    const y = 100 + r * Math.sin(angle);
                    return (
                      <circle key={`pt-${i}`} cx={x} cy={y} r="3" className="fill-accent-primary stroke-bg-card stroke-2" />
                    )
                  })}
                  
                  {/* Labels */}
                  {questions.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / questions.length - Math.PI / 2;
                    // Push labels out further
                    const x = 100 + 94 * Math.cos(angle);
                    const y = 100 + 94 * Math.sin(angle);
                    
                    // Anchor alignment
                    let anchor: "middle" | "start" | "end" = "middle";
                    if (x < 90) anchor = "end";
                    if (x > 110) anchor = "start";
                    
                    return (
                      <text 
                        key={`label-${i}`} 
                        x={x} y={y} 
                        fill="currentColor" 
                        className="text-[7px] font-black uppercase tracking-wider fill-text-secondary"
                        textAnchor={anchor}
                        dominantBaseline="middle"
                      >
                        P{i+1}
                      </text>
                    );
                  })}
                </svg>
              </div>
              <p className="text-[10px] text-text-muted text-center pt-2">Multi-dimensional attack surface area</p>
            </div>

            {/* Custom Remediation List */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <Clipboard className="w-4.5 h-4.5 text-accent-secondary" /> Mapped Remediation Steps
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

          {/* Gartner-Style Maturity Benchmark Overlay */}
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <Award className="w-4 h-4 text-accent-primary" /> Industry Maturity Level
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your {percentage}% maturity score maps to:
              </p>
              <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">Level {gartnerLevel.level} of 5</span>
                <h5 className="text-xl font-black text-text-primary">{gartnerLevel.name}</h5>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{gartnerLevel.summary}</p>
              </div>
              <div className="space-y-1.5 pt-1">
                {GARTNER_LEVELS.map((l) => (
                  <div key={l.level} className={`flex items-center gap-2 text-[10px] font-semibold ${l.level === gartnerLevel.level ? 'text-accent-primary' : 'text-text-muted'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${l.level === gartnerLevel.level ? 'border-accent-primary bg-accent-primary text-white' : 'border-border-subtle'}`}>{l.level}</span>
                    {l.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
                <LineChart className="w-4 h-4 text-accent-secondary" /> Peer Percentile Comparison
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your score outperforms an estimated <span className="font-bold text-text-primary">{peerPercentile}%</span> of peer organizations.
              </p>
              <div className="relative h-8 rounded-full bg-bg-nested border border-border-subtle overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-1000"
                  style={{ width: `${peerPercentile}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-text-primary">
                  {peerPercentile}th percentile
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle/30">
                {PEER_BENCHMARK_SOURCE_NOTE}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
