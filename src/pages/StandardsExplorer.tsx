import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Search, ArrowLeft, Layers, ShieldCheck,
  Terminal, Check, ShieldAlert, Network,
  Info, Calendar, Building, CalendarClock, ExternalLink
} from 'lucide-react'
import { getUpcomingDeadlines, getPastDeadlines, getJurisdictions } from '../data/complianceDeadlines'
import { STANDARDS } from '../data/standardsData'

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

function buildStandardsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/standards/',
    'name': 'AboutIAM Living Standards & RFC Explorer',
    'description': 'Interactive specifications and RFC timelines across OAuth, OpenID Connect, SAML, SCIM, and WebAuthn.',
    'hasPart': STANDARDS.map((s) => ({
      '@type': 'TechArticle',
      '@id': `https://www.aboutiam.com/standards/#${s.id}`,
      'headline': `${s.title} — ${s.fullname}`,
      'about': s.category,
      'description': s.summary,
      'url': `https://www.aboutiam.com/standards?standard=${s.id}`
    }))
  }
}

export default function StandardsExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStandardId, setActiveStandardId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'flow' | 'security' | 'vendors'>('summary')
  const [pageView, setPageView] = useState<'standards' | 'deadlines'>('standards')
  const [deadlineJurisdiction, setDeadlineJurisdiction] = useState('All')
  const [showPastDeadlines, setShowPastDeadlines] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof DIFFICULTIES)[number]>('All')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const standard = params.get('standard')
      const tab = params.get('tab')
      if (standard && STANDARDS.some(s => s.id === standard)) {
        setTimeout(() => {
          setActiveStandardId(standard)
          if (tab === 'summary' || tab === 'flow' || tab === 'security' || tab === 'vendors') {
            setActiveTab(tab)
          }
        }, 0)
      }

      if (params.get('view') === 'deadlines') {
        setTimeout(() => {
          setPageView('deadlines')
        }, 0)
      }
    }
  }, [])

  // Filter and search logic
  const filteredStandards = useMemo(() => {
    return STANDARDS.filter(std => {
      const matchQuery =
        std.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.summary.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDifficulty = difficultyFilter === 'All' || std.difficulty === difficultyFilter
      return matchQuery && matchDifficulty
    })
  }, [searchQuery, difficultyFilter])

  const jurisdictions = useMemo(() => ['All', ...getJurisdictions()], [])

  const filteredDeadlines = useMemo(() => {
    const list = showPastDeadlines ? getPastDeadlines() : getUpcomingDeadlines()
    if (deadlineJurisdiction === 'All') return list
    return list.filter((d) => d.jurisdiction === deadlineJurisdiction)
  }, [deadlineJurisdiction, showPastDeadlines])

  const activeStandard = useMemo(() => {
    return STANDARDS.find(s => s.id === activeStandardId)
  }, [activeStandardId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStandardsJsonLd()).replace(/</g, '\\u003c') }}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 shrink-0 select-none">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <BookOpen className="w-3.5 h-3.5" /> Initiative 5 Milestone
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Living Standards & RFC Explorer
          </h1>
          <p className="text-sm text-text-secondary">
            Deconstruct complex digital identity standards and specifications visually. Trace sequences, raw payloads, and security considerations in-browser.
          </p>
        </div>
        {activeStandardId ? (
          <button
            onClick={() => { setActiveStandardId(null); setActiveTab('summary'); }}
            className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Standards Inventory
          </button>
        ) : (
          <div className="flex bg-bg-nested p-1.5 rounded-xl border border-border-subtle gap-1 shrink-0">
            <button
              onClick={() => setPageView('standards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${pageView === 'standards' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Standards
            </button>
            <button
              onClick={() => setPageView('deadlines')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${pageView === 'deadlines' ? 'bg-bg-card text-accent-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <CalendarClock className="w-3.5 h-3.5" /> Compliance Deadlines
            </button>
          </div>
        )}
      </div>

      {/* COMPLIANCE DEADLINES TRACKER VIEW */}
      {pageView === 'deadlines' ? (
        <div className="space-y-6 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-status-warning/5 border border-status-warning/20 flex items-start gap-3 text-xs text-text-secondary leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            <span>Regulatory deadlines can shift with implementing acts and phased rollouts. Always re-verify against each entry's official source before relying on these dates for compliance planning — this is an educational starting point, not compliance advice.</span>
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {jurisdictions.map((j) => (
                <button
                  key={j}
                  onClick={() => setDeadlineJurisdiction(j)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                    deadlineJurisdiction === j ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPastDeadlines((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 border ${
                showPastDeadlines ? 'bg-bg-nested text-text-primary border-border-subtle' : 'bg-accent-glow text-accent-primary border-accent-primary/20'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" /> {showPastDeadlines ? 'Showing Past' : 'Showing Upcoming'}
            </button>
          </div>

          {filteredDeadlines.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-sm text-text-muted font-semibold">
              No {showPastDeadlines ? 'past' : 'upcoming'} deadlines for this jurisdiction.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeadlines.map((d) => (
                <div key={d.id} className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-text-primary">{d.regulation}</span>
                      <span className="text-[9px] bg-bg-nested border border-border-subtle text-text-secondary font-black px-2 py-0.5 rounded uppercase tracking-wider">{d.jurisdiction}</span>
                      {d.confidence === 'estimated' && (
                        <span className="text-[9px] bg-status-warning/10 border border-status-warning/30 text-status-warning font-black px-2 py-0.5 rounded uppercase tracking-wider">Estimated Date</span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-accent-primary flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5" /> {d.deadlineDate}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{d.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/40">
                    <a
                      href={d.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-accent-primary hover:text-accent-hover flex items-center gap-1"
                    >
                      Official Source <ExternalLink className="w-3 h-3" />
                    </a>
                    {d.relatedStandardId && (
                      <button
                        onClick={() => { setPageView('standards'); setActiveStandardId(d.relatedStandardId!); setActiveTab('summary'); }}
                        className="text-[10px] font-bold text-text-secondary hover:text-accent-primary"
                      >
                        Related Standard →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !activeStandardId ? (
        <div className="space-y-6">

          {/* SEARCH BAR */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-10 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="Search OIDC, SCIM, FIDO2, RFCs..."
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                    difficultyFilter === d ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider hidden md:inline-block ml-auto">
              Listing {filteredStandards.length} Standards
            </span>
          </div>

          {/* STANDARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStandards.map((std) => (
              <div 
                key={std.id}
                className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-accent-primary hover:shadow transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-accent-glow text-accent-primary border border-accent-primary/25 rounded-lg text-xs font-mono font-bold">
                      {std.title}
                    </span>
                    <span className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent-primary" /> {std.year}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        std.difficulty === 'Beginner' ? 'bg-status-success/10 text-status-success border-status-success/30' :
                        std.difficulty === 'Intermediate' ? 'bg-status-warning/10 text-status-warning border-status-warning/30' :
                        'bg-status-danger/10 text-status-danger border-status-danger/30'
                      }`}>
                        {std.difficulty}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bg-nested/30 text-text-muted border border-border-subtle">
                        {std.category}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-text-primary tracking-tight">
                      {std.fullname}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                      {std.summary}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border-subtle/30 pt-4 mt-6 flex items-center justify-between">
                  <span className="text-[9px] text-text-muted font-black uppercase font-mono tracking-wide">
                    {std.rfcs.join(' | ')}
                  </span>
                  <button
                    onClick={() => { setActiveStandardId(std.id); setActiveTab('summary'); }}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all shadow-md shadow-accent-primary/10"
                  >
                    Deconstruct RFC
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        
        /* ================= STANDARD DETAIL VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-h-0">
          
          {/* LEFT SUB-NAV MENU */}
          <div className="lg:col-span-1 flex flex-col gap-3 shrink-0 select-none">
            {[
              { id: 'summary', label: '📖 Executive Summary', desc: 'Why it exists & historical context' },
              { id: 'flow', label: '🏗️ Visual Protocol Flow', desc: 'ASCII handshakes & message formats' },
              { id: 'security', label: '🛡️ Security & Pitfalls', desc: 'Vulnerabilities & best practices' },
              { id: 'vendors', label: '🏢 Vendor Support', desc: 'Vendor adoption & references' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'summary' | 'flow' | 'security' | 'vendors')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  activeTab === tab.id 
                    ? 'border-accent-primary bg-accent-glow/50 text-accent-primary shadow-sm' 
                    : 'border-border-subtle bg-bg-card hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* RIGHT DETAILED CANVAS */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            
            {/* Header Title Card */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                  IDENTITY STANDARD DECONSTRUCTION
                </span>
                <h2 className="text-xl font-black text-text-primary mt-1">{activeStandard?.title} — {activeStandard?.fullname}</h2>
              </div>
              <div className="text-xs font-bold font-mono text-text-muted hidden md:inline-block">
                {activeStandard?.rfcs.join(' | ')}
              </div>
            </div>

            {/* TAB CONTENT 1: EXECUTIVE SUMMARY */}
            {activeTab === 'summary' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5"><Info className="w-4 h-4 text-accent-primary" /> Why It Exists</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.whyExists}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">The Problem Statement</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.problem}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Scope Summary</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStandard.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VISUAL PROTOCOL FLOW */}
            {activeTab === 'flow' && activeStandard && (
              <div className="space-y-6">
                
                {/* Sequence flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-accent-primary animate-pulse" /> Interactive Protocol Sequence Handshake
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStandard.flowchart}
                  </pre>
                </div>

                {/* Message format */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-accent-primary" /> Compliant Message Exchange Formats
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStandard.messageFormat}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SECURITY & PITFALLS */}
            {activeTab === 'security' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Security Vulnerabilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStandard.vulnerabilities.map((vuln, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-xs text-text-secondary leading-relaxed">
                        {vuln}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-status-success" /> Defensive Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStandard.bestPractices.map((bp, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-success/5 border border-status-success/10 text-xs text-text-secondary leading-relaxed">
                        {bp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: VENDOR SUPPORT & CONTEXT */}
            {activeTab === 'vendors' && activeStandard && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-accent-primary" /> Active Enterprise Vendor Adoption
                  </h3>
                  <ul className="space-y-2.5">
                    {activeStandard.vendorSupport.map((ven, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-text-secondary leading-normal">
                        <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {ven}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* RELATED HANDS-ON WORKBUNCH RESOURCES */}
            {activeStandard && activeStandard.relatedResources && (
              <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4 shrink-0">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" /> Related Interactive Workbenches & Simulators
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Validate these protocol concepts immediately inside our browser-native simulators and utility toolsets.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeStandard.relatedResources.map((res, i) => (
                    <Link
                      key={i}
                      to={res.path}
                      className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[8px] font-mono uppercase text-accent-primary font-bold">{res.type}</span>
                        <h4 className="text-xs font-black text-text-primary group-hover:text-accent-primary mt-0.5 leading-snug">{res.title}</h4>
                      </div>
                      <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold">&rarr; Run Workbench</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )
}
