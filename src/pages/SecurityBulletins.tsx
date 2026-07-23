import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert, ShieldCheck, ArrowRight, Terminal,
  Settings, AlertTriangle, List, Check
} from 'lucide-react'
import { BULLETINS, BULLETIN_CATEGORIES, CONTROL_TITLES, type Bulletin, type BulletinDifficulty } from '../data/bulletinsData'
import BookmarkButton from '../components/BookmarkButton'

const DIFFICULTIES: (BulletinDifficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced']

function buildBulletinsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/bulletins/',
    'name': 'AboutIAM Security Bulletins & IR Simulator',
    'description': 'Beginner-to-advanced identity incident bulletins with hardened remediation playbooks and a Crisis Response Console simulator.',
    'hasPart': BULLETINS.map((b) => ({
      '@type': 'NewsArticle',
      '@id': `https://www.aboutiam.com/bulletins/#${b.id}`,
      'headline': b.title,
      'about': b.category,
      'datePublished': b.date,
      'description': b.description,
      'url': `https://www.aboutiam.com/bulletins?bulletin=${b.id}`
    }))
  }
}

export default function SecurityBulletins() {
  const [activeBulletinId, setActiveBulletinId] = useState<string>(BULLETINS[0].id)
  const [difficultyFilter, setDifficultyFilter] = useState<BulletinDifficulty | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState<Bulletin['category'] | 'All'>('All')
  const bulletin = BULLETINS.find(b => b.id === activeBulletinId) ?? BULLETINS[0]

  // Crisis Response Simulator States
  const [crisisStep, setCrisisStep] = useState<number>(0)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [simulatorLogs, setSimulatorLogs] = useState<string[]>([])
  const [containmentScore, setContainmentScore] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const bulletinParam = params.get('bulletin')
      const found = bulletinParam ? BULLETINS.find(b => b.id === bulletinParam) : undefined
      if (found) {
        setTimeout(() => {
          setActiveBulletinId(found.id)
        }, 0)
      }
    }
  }, [])

  const addLog = (msg: string) => {
    setSimulatorLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const handleBulletinChange = (id: string) => {
    setActiveBulletinId(id)
    resetSimulator()
  }

  const resetSimulator = () => {
    setCrisisStep(0)
    setSimulatorLogs([])
    setContainmentScore(null)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText('rem-code')
    setTimeout(() => setCopiedText(null), 1500)
  }

  // --- INCIDENT RESPONSE FLOW STEPS (data-driven from bulletin.simulator) ---
  const runResponseStep1 = () => {
    addLog(`🚨 WARNING: Suspicious login alert on administrative accounts detected!`)
    addLog(bulletin.simulator.step1Log)
    setCrisisStep(1)
  }

  const runResponseStep2 = () => {
    addLog(`🔍 Analyzing logs to determine active security breach vector...`)
    addLog(bulletin.simulator.step2Log)
    setCrisisStep(2)
  }

  const triggerContainmentAction = (strategy: 'low' | 'high') => {
    addLog(`🔧 Initiating containment strategy...`)
    if (strategy === 'high') {
      setContainmentScore('A+ (EXCELLENT)')
      bulletin.simulator.containmentHighLog.split('\n').forEach(line => addLog(line))
    } else {
      setContainmentScore('F- (CRITICAL LEAKAGE)')
      bulletin.simulator.containmentLowLog.split('\n').forEach(line => addLog(line))
    }
    setCrisisStep(3)
  }

  const visibleBulletins = BULLETINS.filter(b =>
    (difficultyFilter === 'All' || b.difficulty === difficultyFilter) &&
    (categoryFilter === 'All' || b.category === categoryFilter)
  )

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBulletinsJsonLd()).replace(/</g, '\\u003c') }}
      />
      {/* Header Element */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-status-danger w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Identity Security Bulletin Board</h1>
            <p className="text-xs text-text-secondary">Incident Response console tracking {BULLETINS.length} real-world identity breaches, attack vectors, and hardened playbooks</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column: Incident selector tabs & Playbooks */}
        <div className="lg:col-span-4 space-y-4">

          {/* Filters */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md space-y-3">
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-2">Difficulty</span>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${difficultyFilter === d ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-2">Category</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategoryFilter('All')}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${categoryFilter === 'All' ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested'}`}
                >
                  All
                </button>
                {BULLETIN_CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${categoryFilter === c ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Threat Advisory ({visibleBulletins.length})
            </span>

            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
              {visibleBulletins.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBulletinChange(b.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${activeBulletinId === b.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:bg-bg-nested hover:border-border-subtle'}`}
                >
                  <div>
                    <span className="font-bold block">{b.title}</span>
                    <span className="text-[9px] text-text-muted">{b.date} · {b.difficulty}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${activeBulletinId === b.id ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                </button>
              ))}
              {visibleBulletins.length === 0 && (
                <span className="text-xs text-text-muted italic p-3">No bulletins match the selected filters.</span>
              )}
            </div>
          </div>

          {/* Hardened incident playbook checklist */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
              <List className="w-4 h-4 text-accent-primary" /> Incident Response Playbook
            </span>

            <div className="space-y-3">
              {bulletin.playbookSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                  <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Incident Details and Interactive IR Crisis Simulator */}
        <div className="lg:col-span-8 space-y-6">

          {/* Incident Info Header */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <ShieldAlert className="w-24 h-24 text-status-danger" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/25 px-2.5 py-0.5 rounded-full">
                  Vector: {bulletin.vector}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-danger/10 text-status-danger border border-status-danger/20">
                  Severity: {bulletin.severity}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-bg-nested text-text-secondary border border-border-subtle">
                  {bulletin.difficulty} · {bulletin.category}
                </span>
                <BookmarkButton item={{ id: `bulletin-${bulletin.id}`, title: bulletin.title, link: `/bulletins?bulletin=${bulletin.id}` }} />
              </div>

              <h2 className="text-lg font-black text-text-primary uppercase tracking-wide">{bulletin.title}</h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-2.5">{bulletin.description}</p>

              <div className="mt-4 pt-3 border-t border-border-subtle/60">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mb-2">Controls Mapped (Cheat Sheet Cross-Reference)</span>
                <div className="flex flex-wrap gap-1.5">
                  {bulletin.controlsMapped.map((controlId) => (
                    <Link
                      key={controlId}
                      to="/cheat-sheets"
                      className="text-[10px] font-bold font-mono px-2 py-1 rounded-full bg-accent-glow border border-accent-primary/25 text-accent-primary hover:bg-accent-primary/20 transition"
                      title="View this control in the Cheat Sheets playbooks"
                    >
                      {CONTROL_TITLES[controlId] ?? controlId}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Incident Response Simulator */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg min-h-[350px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-primary" /> Incident Response Crisis Simulator
                </span>
                <button
                  onClick={resetSimulator}
                  className="text-[10px] bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle px-2 py-1 rounded transition"
                >
                  Reset Incident
                </button>
              </div>

              {/* Step Triggers */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={runResponseStep1}
                  disabled={crisisStep !== 0}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${crisisStep === 0 ? 'bg-status-danger hover:bg-status-danger/95 text-white border-status-danger/40 animate-pulse' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 1: Detect Threat
                </button>

                <button
                  onClick={runResponseStep2}
                  disabled={crisisStep !== 1}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${crisisStep === 1 ? 'bg-status-warning hover:bg-status-warning/95 text-white border-status-warning/40 animate-pulse' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                >
                  Step 2: Analyze Vector
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => triggerContainmentAction('low')}
                    disabled={crisisStep !== 2}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition text-center ${crisisStep === 2 ? 'bg-status-danger/10 border-status-danger/35 text-status-danger hover:bg-status-danger/20' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                    title="Enforce basic remediation action"
                  >
                    Remediate (Low)
                  </button>
                  <button
                    onClick={() => triggerContainmentAction('high')}
                    disabled={crisisStep !== 2}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition text-center ${crisisStep === 2 ? 'bg-status-success/15 border-status-success/40 text-status-success hover:bg-status-success/30' : 'bg-bg-nested text-text-muted border-border-subtle cursor-not-allowed'}`}
                    title="Enforce strong, standard-compliant remediation action"
                  >
                    Remediate (High)
                  </button>
                </div>
              </div>

              {/* Containment Score status banner */}
              {containmentScore && (
                <div className="mt-5">
                  {containmentScore.includes('EXCELLENT') ? (
                    <div className="p-4 rounded-xl bg-status-success/15 text-status-success border border-status-success/30 flex items-start gap-3 animate-fadeIn">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-status-success animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Incident Contained Successfully!</span>
                        <span className="text-xs text-text-primary leading-normal">
                          Remediation Action Score: <strong className="font-bold text-status-success">{containmentScore}</strong>. Cryptographic isolation barriers established forest-wide.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-3 animate-fadeIn">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-status-danger animate-bounce" />
                      <div>
                        <span className="font-extrabold text-sm block">Remediation Action Incomplete!</span>
                        <span className="text-xs text-text-primary leading-normal">
                          Remediation Action Score: <strong className="font-bold text-status-danger">{containmentScore}</strong>. Attacker retains active identity sessions. Critical data leakage active.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trace logs terminal */}
            <div className="border border-border-subtle bg-bg-nested rounded-lg p-3 font-mono text-xs text-text-primary h-36 overflow-y-auto mt-4 leading-normal">
              <div className="flex items-center gap-1.5 border-b border-border-subtle/50 pb-1.5 mb-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Incident Response Console Outputs
              </div>
              {simulatorLogs.length === 0 ? (
                <span className="text-text-muted italic select-none">Console ready. Trigger an incident response step to begin active containment audits.</span>
              ) : (
                simulatorLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed text-text-secondary">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Code Reference block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-accent-primary" /> Hardened Code Reference ({bulletin.snippetLanguage})
              </span>
              <button
                onClick={() => handleCopy(bulletin.remediationSnippet)}
                className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 bg-bg-nested border border-border-subtle px-2 py-1 rounded transition"
              >
                {copiedText === 'rem-code' ? <Check className="w-3 h-3 text-status-success" /> : 'Copy Code'}
              </button>
            </div>
            <pre className="text-xs font-mono bg-bg-base border border-border-subtle p-4 rounded-xl text-text-primary overflow-x-auto select-all leading-relaxed shadow-inner max-h-40">
              {bulletin.remediationSnippet}
            </pre>
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
