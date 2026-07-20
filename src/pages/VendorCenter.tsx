import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building, ArrowRight, ShieldCheck, HelpCircle, 
  Settings, Award, AlertTriangle, Layers, Calendar,
  MessageSquare, Newspaper, Search, Play, RefreshCw,
  CheckCircle2, ExternalLink, Globe, Target, AlertCircle,
  Cpu, Sparkles, Plus, Clock, Terminal, ArrowLeftRight
} from 'lucide-react'

// Import static databases and type-safe helpers
import { VENDOR_CATALOG, THALES_PRODUCTS } from '../data/vendorCatalog'
import type { VendorType } from '../data/vendorCatalog'
import { 
  IDENTITY_NEWS_FEED, IDENTITY_CVE_DIRECTORY, COMMUNITY_EVENTS_CALENDAR, 
  SOCIAL_DISCUSSIONS, INITIAL_INGESTION_STEPS
} from '../data/identityIntelligence'
import type { IngestionStep } from '../data/identityIntelligence'

type SectionType = 'vendors' | 'intelligence' | 'events' | 'social'
type ThalesTabType = 'overview' | 'onewelcome' | 'sta' | 'idcloud' | 'interview'

export default function VendorCenter() {
  const [activeSection, setActiveSection] = useState<SectionType>('vendors')
  
  // --- SECTION 1: VENDOR CENTER STATE ---
  const [activeVendor, setActiveVendor] = useState<VendorType>('thales')
  const vendor = VENDOR_CATALOG[activeVendor]
  const [thalesTab, setThalesTab] = useState<ThalesTabType>('overview')

  // --- SECTION 2: INTELLIGENCE HUB STATE ---
  const [newsFilter, setNewsFilter] = useState<'All' | 'News' | 'Advisory' | 'Research' | 'Announcement'>('All')
  const [cveSearch, setCveSearch] = useState('')
  const [activeCveId, setActiveCveId] = useState<string | null>('cve-1')
  
  // AI Ingestion Pipeline Simulation State
  const [ingestionSteps, setIngestionSteps] = useState<IngestionStep[]>(INITIAL_INGESTION_STEPS)
  const [isSimulatingPipeline, setIsSimulatingPipeline] = useState(false)
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    '[SYSTEM] Editorial Ingestion Pipeline Ready.',
    '[SYSTEM] Awaiting ingestion trigger...'
  ])

  // --- SECTION 3: EVENTS CALENDAR STATE ---
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'All' | 'Conference' | 'Summit' | 'Webinar' | 'CTF'>('All')
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([])
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  // --- SECTION 4: SOCIAL DASHBOARD STATE ---
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false)
  const [socialDigest, setSocialDigest] = useState<string | null>(null)

  // --- AI PIPELINE SIMULATION LOGIC ---
  const runPipelineSimulation = () => {
    if (isSimulatingPipeline) return
    setIsSimulatingPipeline(true)
    setPipelineLogs([])
    
    const logs = [
      'Scanning authoritative RSS registries: NIST NVD, Okta Security Advisories, Thales OneWelcome release notes...',
      'Detected new publication: "Continuous Authentication and Cryptographic DPoP Bindings" (IETF Draft).',
      'HTML cleansing complete. Isolated raw body sections containing claims and RFC citations.',
      'AI Analysis model starting: extracting context tags, evaluating vulnerability score (CVSS).',
      'AI Summarization: generated user analogy and expert takeaways.',
      'Cross-linking engine: matched context with related AboutIAM tools (OAuth Request Builder, JWT Studio).',
      'Publishing review queue complete. Curated summary committed to live Hub databases.'
    ]

    setIngestionSteps(prev => prev.map(s => s.step === 1 ? { ...s, status: 'active' } : { ...s, status: 'idle' }))
    setPipelineLogs(prev => [...prev, `[INIT] Starting pipeline cycle...`])

    let currentStep = 1
    const interval = setInterval(() => {
      setPipelineLogs(prev => [...prev, `[INFO] ${logs[currentStep - 1]}`])
      
      setIngestionSteps(prev => prev.map(s => {
        if (s.step === currentStep) return { ...s, status: 'completed' }
        if (s.step === currentStep + 1) return { ...s, status: 'active' }
        return s
      }))

      currentStep++

      if (currentStep > 5) {
        clearInterval(interval)
        setIsSimulatingPipeline(false)
        setPipelineLogs(prev => [...prev, `[SUCCESS] Editorial ingestion cycle completed. Curated summary published!`])
        setIngestionSteps(prev => prev.map(s => ({ ...s, status: 'completed' })))
      }
    }, 1500)
  }

  // --- SIMULATE ADD CALENDAR REMINDER ---
  const handleRegisterEvent = (eventId: string, eventTitle: string) => {
    if (registeredEventIds.includes(eventId)) {
      setRegisteredEventIds(prev => prev.filter(id => id !== eventId))
      setNotificationMsg(`Removed reminder for: ${eventTitle}`)
    } else {
      setRegisteredEventIds(prev => [...prev, eventId])
      setNotificationMsg(`Reminder added! You will receive a local browser alert 15 minutes before "${eventTitle}" starts.`)
    }
  }

  useEffect(() => {
    if (notificationMsg) {
      const timer = setTimeout(() => setNotificationMsg(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notificationMsg])

  // --- SOCIAL DIGEST GENERATOR ---
  const generateWeeklyDigest = () => {
    setIsGeneratingDigest(true)
    setSocialDigest(null)
    setTimeout(() => {
      setSocialDigest(
        `### AboutIAM AI Community Digest — July 2026

**1. Primary Discussion Focus: The Deprecation of SMS OTP**
The industry consensus is reaching a turning point. Led by PSD2 RTS compliance mandates in Europe, enterprise banking and retail sectors are rapidly stripping SMS authentication in favor of hardware-bound FIDO2 Passkeys. Major partners (such as Thales) are reporting a 40% reduction in user onboarding friction post-biometrics.

**2. Attack Trends: Golden SAML & Active Directory Vulnerabilities**
With ADFS configurations remaining highly legacy in hybrid companies, threat actors continue to target token-signing certificates to bypass MFA rules. Top security engineers advise isolating certificate-signing keys inside Hardware Security Modules (HSMs) immediately.

**3. Developer Highlights: visual Identity Orchestration**
Instead of hardcoding complex redirects and KYC validation routines, developers are advocating for drag-and-drop identity orchestrators (like Thales OneWelcome), which cleanly externalize authorization logic from main application repositories.`
      )
      setIsGeneratingDigest(false)
    }, 1200)
  }

  // --- FILTERED ARRAYS ---
  const filteredNews = useMemo(() => {
    if (newsFilter === 'All') return IDENTITY_NEWS_FEED
    return IDENTITY_NEWS_FEED.filter(item => item.category === newsFilter)
  }, [newsFilter])

  const filteredCves = useMemo(() => {
    return IDENTITY_CVE_DIRECTORY.filter(cve => 
      cve.title.toLowerCase().includes(cveSearch.toLowerCase()) ||
      cve.cveId.toLowerCase().includes(cveSearch.toLowerCase()) ||
      cve.vendor.toLowerCase().includes(cveSearch.toLowerCase())
    )
  }, [cveSearch])

  const activeCve = useMemo(() => {
    return IDENTITY_CVE_DIRECTORY.find(cve => cve.id === activeCveId) || null
  }, [activeCveId])

  const filteredEvents = useMemo(() => {
    if (eventCategoryFilter === 'All') return COMMUNITY_EVENTS_CALENDAR
    return COMMUNITY_EVENTS_CALENDAR.filter(e => e.category === eventCategoryFilter)
  }, [eventCategoryFilter])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans pb-12">
      {/* Dynamic Alert Banner */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-accent-glow border border-accent-primary p-4 rounded-xl shadow-lg max-w-sm animate-bounce flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-text-primary leading-normal">{notificationMsg}</p>
        </div>
      )}

      {/* Global Center Navigation Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Building className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              Enterprise Ecosystem Hub <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded border border-accent-primary/20 font-mono">PHASE 7 LIVE</span>
            </h1>
            <p className="text-xs text-text-secondary">Official Identity Standards, Live Vulnerability Feeds, Events Calendar, and Vendor Architectures.</p>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex bg-bg-base p-1.5 rounded-xl border border-border-subtle gap-1">
          <button
            onClick={() => setActiveSection('vendors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeSection === 'vendors' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            🏢 Vendor Directory
          </button>
          <button
            onClick={() => setActiveSection('intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeSection === 'intelligence' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            📰 Intelligence Hub
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeSection === 'events' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            📅 Community Calendar
          </button>
          <button
            onClick={() => setActiveSection('social')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${activeSection === 'social' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
          >
            💬 Social Dashboard
          </button>
        </div>

        <Link to="/" className="text-xs font-bold bg-bg-nested hover:bg-border-subtle px-3.5 py-2 rounded-xl text-text-secondary flex items-center justify-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: VENDOR KNOWLEDGE CENTER                       */}
      {/* ======================================================== */}
      {activeSection === 'vendors' && (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 18-Vendor List Selector */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
                Select Platform Profile
              </span>
              
              <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {(Object.keys(VENDOR_CATALOG) as VendorType[]).map((key) => {
                  const item = VENDOR_CATALOG[key]
                  const isAct = activeVendor === key
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveVendor(key)
                        if (key === 'thales') setThalesTab('overview')
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold border transition flex items-center justify-between ${isAct ? 'bg-accent-glow border-accent-primary text-accent-primary font-black shadow-sm' : 'bg-bg-nested/30 border-transparent text-text-secondary hover:bg-bg-nested/60 hover:border-border-subtle'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">{item.logo || '🏢'}</span>
                        <span className="truncate">{key === 'thales' ? 'Thales (Featured)' : item.fullName.split(' (')[0].split(' by ')[0]}</span>
                      </span>
                      {item.isFeatured && (
                        <span className="text-[8px] bg-accent-primary text-bg-card font-black uppercase px-1.5 py-0.5 rounded leading-none shrink-0 scale-90">Flagship</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Micro-learning card on left */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm space-y-2">
              <h3 className="text-xs font-black text-text-primary flex items-center gap-1.5">
                <Award className="w-4 h-4 text-accent-primary animate-pulse" /> Certified Learning Paths
              </h3>
              <p className="text-[10px] text-text-secondary leading-normal">
                Prepare for top enterprise, platform-specific certifications highly sought after by corporate recruiting departments:
              </p>
              <div className="space-y-1.5 pt-1">
                {vendor.certifications.map((cert) => (
                  <div key={cert} className="p-2 bg-bg-nested/50 border border-border-subtle rounded-lg text-[10px] font-bold text-text-secondary leading-relaxed flex items-center gap-1.5">
                    <span className="shrink-0">🛡️</span> <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Platform Information */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* THALES HIGHLY CUSTOM FLAGSHIP EXPERIENCE */}
            {activeVendor === 'thales' ? (
              <div className="space-y-6">
                
                {/* Hero Platform Overview Header */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none select-none">
                    <Building className="w-32 h-32 text-accent-primary" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-3 py-1 rounded-full">
                        Featured Platform Partner
                      </span>
                      <h2 className="text-2xl font-black text-text-primary mt-3 flex items-center gap-2">
                        <span>🛡️</span> Thales Identity Security Ecosystem
                      </h2>
                      <p className="text-xs text-text-secondary mt-1 max-w-2xl">{vendor.marketPositioning}</p>
                    </div>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-accent-glow hover:bg-accent-primary hover:text-bg-card border border-accent-primary text-accent-primary px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 h-10 shadow-sm"
                    >
                      <Globe className="w-4 h-4" /> Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Target Industries tags */}
                  <div className="pt-3 border-t border-border-subtle flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] uppercase font-black text-text-muted mr-1.5 tracking-wider">Target Segments:</span>
                    {vendor.targetIndustries?.map(ind => (
                      <span key={ind} className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-black px-2 py-0.5 rounded">
                        {ind}
                      </span>
                    ))}
                  </div>

                  {/* THALES PRODUCTS SUB-NAVIGATION */}
                  <div className="flex bg-bg-nested p-1 rounded-xl border border-border-subtle gap-1 overflow-x-auto">
                    <button
                      onClick={() => setThalesTab('overview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${thalesTab === 'overview' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      📖 Company Overview
                    </button>
                    <button
                      onClick={() => setThalesTab('onewelcome')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${thalesTab === 'onewelcome' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      🪐 OneWelcome Platform
                    </button>
                    <button
                      onClick={() => setThalesTab('sta')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${thalesTab === 'sta' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      🔒 SafeNet STA MFA
                    </button>
                    <button
                      onClick={() => setThalesTab('idcloud')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${thalesTab === 'idcloud' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      ☁️ IdCloud Portal
                    </button>
                    <button
                      onClick={() => setThalesTab('interview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${thalesTab === 'interview' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      💬 Interview Prep ({vendor.interviewQuestions.length})
                    </button>
                  </div>
                </div>

                {/* Subtab Render blocks */}
                {thalesTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Strengths */}
                    <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-status-success" /> Key Strengths
                      </span>
                      <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                        {vendor.strengths.map((str, idx) => (
                          <li key={idx} className="marker:text-accent-primary">{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Hard constraints */}
                    <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-status-danger" /> Engineering Tradeoffs
                      </span>
                      <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                        {vendor.limitations.map((lim, idx) => (
                          <li key={idx} className="marker:text-status-danger">{lim}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Architectural Components */}
                    <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3 md:col-span-2">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1">
                        Operational Portfolio Mapping
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {vendor.components.map(comp => (
                          <div key={comp.name} className="p-3.5 bg-bg-nested/40 border border-border-subtle rounded-xl text-xs flex flex-col justify-between">
                            <div>
                              <span className="font-bold text-accent-primary block mb-1">{comp.name}</span>
                              <span className="text-text-secondary leading-normal block">{comp.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab products: OneWelcome, STA, IdCloud */}
                {(thalesTab === 'onewelcome' || thalesTab === 'sta' || thalesTab === 'idcloud') && (
                  (() => {
                    const prod = THALES_PRODUCTS.find(p => p.id === thalesTab)!
                    return (
                      <div className="space-y-6">
                        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9px] uppercase font-black text-accent-primary bg-accent-glow px-2 py-0.5 rounded border border-accent-primary/20">
                              Featured Product Profile
                            </span>
                            <h3 className="text-xl font-black text-text-primary mt-2">{prod.name}</h3>
                            <p className="text-xs font-bold text-accent-secondary mt-1">{prod.tagline}</p>
                            <p className="text-xs text-text-secondary mt-3 leading-relaxed">{prod.overview}</p>
                          </div>

                          {/* ASCII architecture and Modules */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            
                            {/* Visual Ascii block */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Architectural Diagram (ASCII Flow)
                              </span>
                              <pre className="p-4 bg-bg-nested border border-border-subtle text-[10px] text-accent-primary rounded-xl font-mono leading-relaxed overflow-x-auto select-all">
                                {prod.architectureAscii}
                              </pre>
                            </div>

                            {/* Core Modules List */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-accent-primary" /> Key Functional Modules
                              </span>
                              <div className="space-y-2.5">
                                {prod.modules.map(mod => (
                                  <div key={mod.name} className="p-3 bg-bg-nested/40 border border-border-subtle rounded-xl text-xs leading-normal">
                                    <span className="font-bold text-text-primary block mb-0.5">⭐ {mod.name}</span>
                                    <span className="text-text-secondary">{mod.desc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Extra Metadata: usecases, standards, deployment models */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-subtle text-xs">
                            <div className="space-y-1.5 p-3.5 bg-bg-nested/30 border border-border-subtle rounded-xl">
                              <span className="font-bold text-text-primary flex items-center gap-1"><Target className="w-3.5 h-3.5 text-accent-primary" /> Supported Standards</span>
                              <p className="text-[11px] text-text-secondary leading-normal">{prod.standards.join(', ')}</p>
                            </div>
                            <div className="space-y-1.5 p-3.5 bg-bg-nested/30 border border-border-subtle rounded-xl">
                              <span className="font-bold text-text-primary flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-accent-secondary" /> Deploy Models</span>
                              <p className="text-[11px] text-text-secondary leading-normal">{prod.deploymentModels.join(', ')}</p>
                            </div>
                            <div className="space-y-1.5 p-3.5 bg-bg-nested/30 border border-border-subtle rounded-xl">
                              <span className="font-bold text-text-primary flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-status-success" /> Primary Use Cases</span>
                              <p className="text-[11px] text-text-secondary leading-normal">{prod.useCases.join(', ')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Troubleshooting Guides */}
                        <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
                          <span className="text-xs font-black text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1 flex items-center gap-1.5">
                            <Settings className="w-4 h-4 text-accent-secondary animate-spin-slow" /> Real-World Engineering Troubleshooting
                          </span>
                          <div className="space-y-3">
                            {prod.troubleshooting.map(guide => (
                              <div key={guide.issue} className="p-4 bg-bg-nested/40 border border-border-subtle rounded-xl text-xs space-y-1.5">
                                <span className="font-bold text-text-primary flex items-center gap-1.5 text-status-danger">
                                  <AlertCircle className="w-4 h-4 shrink-0" /> ISSUE: {guide.issue}
                                </span>
                                <p className="text-text-secondary leading-relaxed pl-5 font-semibold">
                                  <span className="text-status-success font-bold">REMEDIATION:</span> {guide.resolution}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sandbox Link cards */}
                        <div className="bg-accent-glow/5 border border-accent-primary/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                          <div>
                            <h4 className="text-xs font-black text-text-primary flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-accent-primary" /> Want to test these standards in-browser?
                            </h4>
                            <p className="text-[11px] text-text-secondary mt-1">Deploy sandboxed handshakes, JWT decoders, and WebAuthn authenticators directly inside our simulation playgrounds.</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to="/playground/fido2" className="text-[10px] font-black bg-bg-card hover:bg-bg-nested border border-border-subtle px-3 py-2 rounded-lg text-text-secondary transition shadow-sm">FIDO2 Passkey Simulator</Link>
                            <Link to="/playground/scim" className="text-[10px] font-black bg-bg-card hover:bg-bg-nested border border-border-subtle px-3 py-2 rounded-lg text-text-secondary transition shadow-sm">SCIM sync Simulator</Link>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                )}

                {thalesTab === 'interview' && (
                  <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-black text-text-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-accent-primary" /> Platform Architecture Mock Interview Questions
                    </span>
                    <div className="space-y-4">
                      {vendor.interviewQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <span className="block font-bold text-text-primary text-xs flex items-start gap-1">
                            <span>Q{idx+1}:</span> <span>{q.q}</span>
                          </span>
                          <div className="bg-bg-nested/40 border border-border-subtle p-3.5 rounded-xl text-xs leading-relaxed text-text-secondary font-semibold">
                            {q.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* STANDARD VENDOR DETAIL CARD LAYOUT */
              <div className="space-y-6">
                
                {/* Hero card */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                    <Building className="w-24 h-24 text-accent-primary" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
                        {vendor.category}
                      </span>
                      <h2 className="text-xl font-black text-text-primary mt-3 flex items-center gap-1.5">
                        <span className="text-base">{vendor.logo || '🏢'}</span> {vendor.fullName}
                      </h2>
                    </div>
                    {vendor.website && (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary font-bold flex items-center gap-1 transition"
                      >
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border-subtle">
                    
                    <div className="space-y-2">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-status-success" /> Platform Strengths
                      </span>
                      <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                        {vendor.strengths.map((str, idx) => (
                          <li key={idx} className="marker:text-accent-primary">{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-status-danger" /> Limitations & Constraints
                      </span>
                      <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                        {vendor.limitations.map((lim, idx) => (
                          <li key={idx} className="marker:text-status-danger">{lim}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Split layout: modules & deployment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Components */}
                  <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-accent-primary" /> Key Architectural Elements
                      </span>
                      
                      <div className="space-y-3">
                        {vendor.components.map((comp) => (
                          <div key={comp.name} className="p-3 bg-bg-nested/40 border border-border-subtle rounded-xl text-xs leading-normal">
                            <span className="font-bold text-accent-primary block mb-0.5">{comp.name}</span>
                            <span className="text-text-secondary">{comp.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border-subtle bg-bg-nested/20 p-2.5 rounded-lg text-[10px] text-text-muted font-mono leading-normal">
                      <strong>Licensing:</strong> {vendor.licensingModel}
                    </div>
                  </div>

                  {/* Deployment */}
                  <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-accent-secondary" /> Enterprise Deployment Checklist
                    </span>
                    
                    <div className="space-y-2.5">
                      {vendor.deploymentChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                          <span className="w-5 h-5 rounded-lg bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Interview block */}
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-accent-primary" /> Standard Interview Prep
                  </span>

                  <div className="space-y-4">
                    {vendor.interviewQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <span className="block font-bold text-text-primary text-xs">
                          Q: {q.q}
                        </span>
                        <div className="bg-bg-nested/40 border border-border-subtle p-3 rounded-xl text-xs leading-relaxed text-text-secondary font-semibold">
                          {q.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: LIVE IDENTITY INTELLIGENCE HUB                 */}
      {/* ======================================================== */}
      {activeSection === 'intelligence' && (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Main Intelligence Grid split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Live news feed */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-accent-primary" /> Live Identity Intelligence & Advisories
                  </h3>
                  
                  {/* Category Filter selector */}
                  <select
                    value={newsFilter}
                    onChange={(e) => setNewsFilter(e.target.value as 'All' | 'News' | 'Advisory' | 'Research' | 'Announcement')}
                    className="text-[10px] bg-bg-nested border border-border-subtle p-1.5 rounded-lg text-text-secondary font-bold focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="News">News Only</option>
                    <option value="Advisory">Advisories Only</option>
                    <option value="Research">Research Drafts</option>
                    <option value="Announcement">Announcements</option>
                  </select>
                </div>

                {/* News feed list scroll */}
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredNews.map(item => (
                    <div key={item.id} className="p-4 bg-bg-nested/30 border border-border-subtle rounded-xl text-xs space-y-2 relative hover:bg-bg-nested/50 transition">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          item.category === 'Advisory' ? 'bg-status-danger/15 text-status-danger border border-status-danger/20' : 
                          item.category === 'Research' ? 'bg-accent-glow text-accent-primary border border-accent-primary/20' :
                          'bg-bg-nested text-text-secondary border border-border-subtle'
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{item.date}</span>
                      </div>

                      <h4 className="font-bold text-text-primary leading-snug">{item.title}</h4>
                      <p className="text-text-secondary leading-relaxed font-semibold">{item.summary}</p>
                      
                      {/* Remediation toggle for advisories */}
                      {item.category === 'Advisory' && item.remediation && (
                        <div className="p-2.5 bg-status-danger/5 border border-status-danger/20 rounded-lg text-[11px] leading-relaxed">
                          <span className="font-black text-status-danger block mb-0.5">⚠️ DISCOVERY MITIGATION REMEDIATION:</span>
                          <span className="text-text-secondary font-semibold block">{item.remediation}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted">
                        <span className="font-bold">Source: {item.source}</span>
                        <div className="flex gap-1">
                          {item.tags.map(t => (
                            <span key={t} className="bg-bg-nested px-1.5 py-0.5 rounded text-[8px] font-bold">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Searchable CVE Code-Remediation */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent-secondary" /> Searchable Identity CVE Code Patch Auditor
                  </h3>
                  
                  {/* Search input bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search CVEs by ID, title, or vendor..."
                      value={cveSearch}
                      onChange={(e) => setCveSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-bg-nested border border-border-subtle focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* CVE ID List */}
                  <div className="md:col-span-4 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {filteredCves.map(cve => (
                      <button
                        key={cve.id}
                        onClick={() => setActiveCveId(cve.id)}
                        className={`w-full text-left p-3 border rounded-xl text-xs flex flex-col gap-1 transition ${activeCveId === cve.id ? 'bg-accent-glow border-accent-secondary text-text-primary font-bold shadow-sm' : 'bg-bg-nested/20 border-border-subtle hover:bg-bg-nested/60 text-text-secondary'}`}
                      >
                        <span className="font-black text-[10px] font-mono flex items-center justify-between">
                          <span>{cve.cveId}</span>
                          <span className={`px-1.5 rounded text-[8px] font-sans ${cve.score >= 8 ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'}`}>{cve.score}</span>
                        </span>
                        <span className="truncate block font-semibold">{cve.title}</span>
                      </button>
                    ))}
                    {filteredCves.length === 0 && (
                      <p className="text-[10px] text-text-muted text-center py-6">No matching CVEs found.</p>
                    )}
                  </div>

                  {/* Active CVE Detail and Code Comparison */}
                  <div className="md:col-span-8">
                    {activeCve ? (
                      <div className="p-4 bg-bg-nested/30 border border-border-subtle rounded-2xl text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                          <span className="font-mono font-black text-status-danger">{activeCve.cveId}</span>
                          <span className="text-[10px] text-text-muted font-bold">Severity Score: <strong className="text-status-danger font-mono font-black">{activeCve.score}/10</strong></span>
                        </div>
                        <h4 className="font-bold text-text-primary text-xs">{activeCve.title}</h4>
                        <p className="text-text-secondary leading-relaxed font-semibold">{activeCve.description}</p>
                        
                        <div className="p-3 bg-accent-glow/5 border border-accent-secondary/15 rounded-xl text-[11px] leading-relaxed font-semibold text-text-secondary">
                          <strong className="text-text-primary block mb-0.5">💡 Remediation Protocol:</strong>
                          {activeCve.remediationSteps}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 bg-bg-nested/10 border border-dashed border-border-subtle rounded-2xl">
                        <p className="text-xs text-text-muted">Select a CVE to inspect its code mitigation patch.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side-by-side Code Diff Render */}
                {activeCve && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                      <ArrowLeftRight className="w-3.5 h-3.5" /> Side-by-Side Code Repair Patch Comparison
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Vulnerable Code */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-status-danger font-bold uppercase flex items-center gap-1 font-mono">
                          ❌ Vulnerable Code Component
                        </span>
                        <pre className="p-3.5 bg-status-danger/5 border border-status-danger/10 text-[9px] text-text-secondary rounded-xl font-mono leading-relaxed overflow-x-auto select-all">
                          {activeCve.remediationPatch}
                        </pre>
                      </div>

                      {/* Secure Code */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-status-success font-bold uppercase flex items-center gap-1 font-mono">
                          ✔️ Secure Patched Code Component
                        </span>
                        <pre className="p-3.5 bg-status-success/5 border border-status-success/10 text-[9px] text-text-secondary rounded-xl font-mono leading-relaxed overflow-x-auto select-all">
                          {activeCve.securePatch}
                        </pre>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Bottom Panel: AI Editorial Ingestion Pipeline Simulator */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black text-accent-primary uppercase tracking-widest bg-accent-glow border border-accent-primary/20 px-2.5 py-0.5 rounded-full">
                  Initiative 5 Implementation
                </span>
                <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                  <Cpu className="text-accent-primary w-5 h-5 animate-pulse" /> Intelligent Content Ingestion Pipeline Simulator
                </h3>
                <p className="text-xs text-text-secondary">Simulate the AI-assisted automated pipeline that scans RSS, digests document claims, generates educational metadata, and cross-links contents.</p>
              </div>

              <button
                onClick={runPipelineSimulation}
                disabled={isSimulatingPipeline}
                className="text-xs bg-accent-primary hover:bg-accent-secondary disabled:bg-border-subtle text-bg-card px-5 py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
              >
                {isSimulatingPipeline ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Content...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Trigger Pipeline Simulation
                  </>
                )}
              </button>
            </div>

            {/* Stepper Steps UI */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {ingestionSteps.map((s) => {
                const isAct = s.status === 'active'
                const isComp = s.status === 'completed'
                return (
                  <div key={s.step} className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2 relative ${
                    isAct ? 'bg-accent-glow/30 border-accent-primary scale-[1.02] shadow' : 
                    isComp ? 'bg-bg-nested/40 border-accent-secondary' : 
                    'bg-bg-nested/10 border-border-subtle opacity-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-text-muted">STEP 0{s.step}</span>
                      {isComp ? (
                        <CheckCircle2 className="w-4 h-4 text-accent-secondary shrink-0" />
                      ) : isAct ? (
                        <div className="w-3.5 h-3.5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-border-subtle shrink-0"></div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-[11px] font-black text-text-primary block leading-tight">{s.title}</h4>
                      <p className="text-[10px] text-text-secondary leading-normal mt-1 leading-relaxed font-semibold">{s.description}</p>
                    </div>

                    <span className={`text-[8px] font-bold uppercase py-0.5 text-center rounded block mt-1 tracking-wider ${
                      isAct ? 'bg-accent-primary text-bg-card animate-pulse' : 
                      isComp ? 'bg-accent-secondary/15 text-accent-secondary' : 
                      'bg-bg-nested text-text-muted'
                    }`}>
                      {s.status === 'idle' ? 'Pending' : s.status}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Simulated log output terminal */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-accent-secondary" /> Active Pipeline Execution Log Terminal
              </span>
              <div className="bg-bg-card border border-border-subtle p-4 rounded-xl font-mono text-[10px] text-accent-primary max-h-[160px] overflow-y-auto space-y-1 select-all shadow-inner">
                {pipelineLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    <span className="text-text-muted shrink-0 mr-1 select-none">[{idx+1}]</span> {log}
                  </p>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: COMMUNITY EVENTS & CALENDAR                     */}
      {/* ======================================================== */}
      {activeSection === 'events' && (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-primary" /> Enterprise Events & Community Calendar
                </h3>
                <p className="text-xs text-text-secondary">Explore conferences, summits, training workshops, and live CTFs. Simulates adding automated calendar alarms.</p>
              </div>

              {/* Filter */}
              <div className="flex bg-bg-nested p-1 rounded-xl border border-border-subtle gap-1">
                {(['All', 'Conference', 'Summit', 'Webinar', 'CTF'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setEventCategoryFilter(cat)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition ${eventCategoryFilter === cat ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(ev => {
                const isReg = registeredEventIds.includes(ev.id)
                return (
                  <div key={ev.id} className="p-5 bg-bg-nested/30 border border-border-subtle rounded-2xl flex flex-col justify-between space-y-4 relative hover:border-accent-primary/20 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-black bg-accent-glow text-accent-primary border border-accent-primary/25 px-2.5 py-0.5 rounded-full">
                          {ev.category}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {ev.date}
                        </span>
                      </div>

                      <h4 className="font-black text-xs text-text-primary tracking-tight leading-snug">{ev.title}</h4>
                      <p className="text-[11px] text-text-secondary font-semibold">Organized by: <strong className="text-text-primary font-bold">{ev.organizer}</strong></p>
                      
                      <div className="text-[11px] text-text-secondary font-mono leading-normal">
                        <strong>Time & Place:</strong> {ev.time} | <span className="underline">{ev.location}</span>
                      </div>

                      {/* Speakers & Agenda */}
                      <div className="pt-2 border-t border-border-subtle space-y-2 text-xs">
                        <div className="space-y-1">
                          <strong className="text-text-muted text-[10px] uppercase tracking-wider block">Featured Presenters:</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.speakers.map(s => (
                              <span key={s} className="bg-bg-card px-2 py-0.5 rounded border border-border-subtle text-[10px] font-semibold text-text-secondary">👥 {s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <strong className="text-text-muted text-[10px] uppercase tracking-wider block">Core Session Syllabus:</strong>
                          <ul className="space-y-1 text-[10px] list-disc list-inside text-text-secondary leading-relaxed font-semibold">
                            {ev.agenda.map((ag, idx) => (
                              <li key={idx}>{ag}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border-subtle">
                      <a
                        href={ev.registrationUrl.startsWith('/') ? '#' : ev.registrationUrl}
                        target={ev.registrationUrl.startsWith('/') ? undefined : '_blank'}
                        rel={ev.registrationUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                        className="w-1/2 text-center text-[10px] font-black bg-bg-card hover:bg-bg-nested border border-border-subtle p-2.5 rounded-xl text-text-primary transition flex items-center justify-center gap-1.5"
                      >
                        Register Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRegisterEvent(ev.id, ev.title)}
                        className={`w-1/2 text-[10px] font-black p-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${isReg ? 'bg-accent-secondary text-bg-card shadow' : 'bg-accent-glow text-accent-primary border border-accent-primary/20 hover:bg-accent-primary hover:text-bg-card'}`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alert Alarm Set!
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Set Alarm Alert
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: SOCIAL DASHBOARD                               */}
      {/* ======================================================== */}
      {activeSection === 'social' && (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Aggregated Posts list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
                  <MessageSquare className="w-5 h-5 text-accent-primary" /> Industry Hot Topics & Trending Debates
                </h3>

                <div className="space-y-4 scrollbar-thin">
                  {SOCIAL_DISCUSSIONS.map(p => (
                    <div key={p.id} className="p-4 bg-bg-nested/30 border border-border-subtle rounded-2xl text-xs space-y-2.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent-primary font-mono bg-accent-glow px-2.5 py-0.5 rounded border border-accent-primary/10">
                          {p.source} Feed Source
                        </span>
                        <div className="text-[10px] text-text-muted font-mono font-bold flex items-center gap-1">
                          🔥 Trending Score: <span className="text-accent-secondary font-black font-mono bg-accent-glow/20 border border-accent-secondary/10 px-1.5 py-0.5 rounded">{p.trendingScore}%</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-text-primary text-xs leading-snug">{p.title}</h4>
                      <p className="text-text-secondary leading-relaxed font-semibold">{p.summary}</p>
                      
                      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-muted">
                        <span className="font-bold">Author: {p.author}</span>
                        <div className="flex gap-3">
                          <span>❤️ {p.likesCount} shares</span>
                          <span>💬 {p.commentsCount} reviews</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: AI Weekly Digest Report Generator */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                <div className="space-y-1 border-b border-border-subtle pb-3">
                  <span className="text-[9px] font-mono font-black text-accent-primary uppercase tracking-widest bg-accent-glow border border-accent-primary/20 px-2.5 py-0.5 rounded-full">
                    AI Content Ingestion Task
                  </span>
                  <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-primary animate-pulse" /> Weekly AI Security Posture Digest
                  </h3>
                  <p className="text-[11px] text-text-secondary">Compile, synthesize, and audit all trending LinkedIn discussions, podcast releases, and cyber security advisories into an executive digest.</p>
                </div>

                <button
                  onClick={generateWeeklyDigest}
                  disabled={isGeneratingDigest}
                  className="w-full text-xs bg-accent-primary hover:bg-accent-secondary disabled:bg-border-subtle text-bg-card py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {isGeneratingDigest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Synthesize Industry Weekly Digest
                    </>
                  )}
                </button>

                {/* Report Digest Output */}
                {socialDigest ? (
                  <div className="p-4 bg-bg-nested border border-border-subtle rounded-xl text-xs space-y-3 prose max-w-none text-text-secondary leading-relaxed font-semibold select-all">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <span className="text-[10px] text-text-muted font-bold">Report Status: <strong className="text-status-success">AUDITED & CURATED</strong></span>
                      <span className="text-[9px] font-mono font-black text-accent-primary">July 2026</span>
                    </div>
                    {/* Rendered Digest */}
                    <div className="space-y-3 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {socialDigest}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-bg-nested/15 border border-dashed border-border-subtle rounded-2xl space-y-2">
                    <Sparkles className="w-8 h-8 text-text-muted" />
                    <p className="text-[10px] text-text-muted text-center leading-normal">Click the button above to run our local client-side AI summarizer, compiling active posts into an executive report digest.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
