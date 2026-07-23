import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ArrowLeft, BookOpen, Layers, ShieldCheck,
  Award, Check, ShieldAlert, Cpu, Network
} from 'lucide-react'
import { CASE_STUDIES, CASE_STUDY_CATEGORIES, type CaseStudyCategory } from '../data/caseStudiesData'

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

function buildCaseStudiesJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/case-studies/',
    'name': 'AboutIAM Enterprise Identity Case Study Center',
    'description': 'Deconstruct real-world, production-quality IAM implementation case studies across Big Technology, Financial Services, Government, Healthcare, Retail, and Education.',
    'hasPart': CASE_STUDIES.map((cs) => ({
      '@type': 'Article',
      '@id': `https://www.aboutiam.com/case-studies/#${cs.id}`,
      'headline': `${cs.company} — ${cs.title}`,
      'about': cs.category,
      'description': cs.summary,
      'url': `https://www.aboutiam.com/case-studies?study=${cs.id}`
    }))
  }
}

export default function CaseStudyCenter() {
  const [selectedCategory, setSelectedCategory] = useState<CaseStudyCategory | 'All'>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof DIFFICULTIES)[number]>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'architecture' | 'security' | 'lessons' | 'interview'>('summary')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const study = params.get('study')
      if (study && CASE_STUDIES.some(s => s.id === study)) {
        setTimeout(() => {
          setActiveStudyId(study)
        }, 0)
      }
    }
  }, [])

  // Filter and search logic
  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter(study => {
      const categoryMatches = selectedCategory === 'All' || study.category === selectedCategory
      const difficultyMatches = difficultyFilter === 'All' || study.difficulty === difficultyFilter
      const searchMatches =
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatches && difficultyMatches && searchMatches
    })
  }, [selectedCategory, difficultyFilter, searchQuery])

  const activeStudy = useMemo(() => {
    return CASE_STUDIES.find(s => s.id === activeStudyId)
  }, [activeStudyId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCaseStudiesJsonLd()).replace(/</g, '\\u003c') }}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 shrink-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
            <Layers className="w-3.5 h-3.5" /> Initiative 1 Milestone
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Enterprise Identity Case Study Center
          </h1>
          <p className="text-sm text-text-secondary">
            Deconstruct real-world production configurations and scaling challenges across Big Technology, Financial Services, Government, Healthcare, Retail, and Education.
          </p>
        </div>
        {activeStudyId && (
          <button
            onClick={() => { setActiveStudyId(null); setActiveTab('summary'); }}
            className="text-xs bg-bg-card border border-border-subtle hover:bg-bg-sidebar px-4 py-2.5 rounded-xl text-text-secondary flex items-center gap-1.5 transition-colors font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Case Studies Inventory
          </button>
        )}
      </div>

      {/* CASE STUDIES DIRECTORY LIST VIEW */}
      {!activeStudyId ? (
        <div className="space-y-6">

          {/* SEARCH & FILTERS BAR */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col md:flex-row gap-4 items-center">

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-10 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="Search Netflix, Uber, JWT..."
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex overflow-x-auto gap-2 w-full md:w-auto scrollbar-hide pb-1">
              {(['All', ...CASE_STUDY_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as CaseStudyCategory | 'All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                    selectedCategory === cat
                      ? 'bg-accent-primary border-accent-primary text-white shadow'
                      : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* DIFFICULTY FILTER BAR */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wide mr-1">Difficulty:</span>
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                  difficultyFilter === level
                    ? 'bg-accent-primary border-accent-primary text-white shadow'
                    : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* CASE STUDIES GRID */}
          {filteredStudies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredStudies.map((study) => (
                <div
                  key={study.id}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-accent-primary hover:shadow transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-12 h-12 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        {study.logo}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] bg-bg-sidebar border border-border-subtle px-2.5 py-0.5 rounded-full font-bold text-text-secondary uppercase">
                          {study.category}
                        </span>
                        <span className="text-[9px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                          {study.difficulty}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-text-primary tracking-tight">
                        {study.company} — {study.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                        {study.summary}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border-subtle/30 pt-4 mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-bold tracking-wide uppercase">
                      {study.rfcs.length} standards listed
                    </span>
                    <button
                      onClick={() => enterCaseStudy(study.id)}
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all shadow-md shadow-accent-primary/10"
                    >
                      Explore Case Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
              <p className="text-sm font-bold text-text-primary">No case studies found</p>
              <p className="text-xs text-text-secondary mt-1.5">Try a different search term, category, or difficulty filter.</p>
            </div>
          )}

        </div>
      ) : (

        /* ================= CASE STUDY DETAIL VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-h-0">

          {/* LEFT SUB-NAV MENU */}
          <div className="lg:col-span-1 flex flex-col gap-3 shrink-0">
            {[
              { id: 'summary', label: '📋 Executive Summary', desc: 'Business challenges & goals' },
              { id: 'architecture', label: '🏗️ Architecture & Models', desc: 'Flowcharts, AuthN & AuthZ rules' },
              { id: 'security', label: '🛡️ Threat Model & Security', desc: 'Risks, mitigations & boundaries' },
              { id: 'lessons', label: '💡 Lessons & Pitfalls', desc: 'Lessons learned & mistakes' },
              { id: 'interview', label: '🎤 Interview & Standards', desc: 'Architect Q&As & RFCs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'summary' | 'architecture' | 'security' | 'lessons' | 'interview')}
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

          {/* RIGHT DETAILED WORKSPACE CANVAS */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">

            {/* Header Badge */}
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex items-center gap-4">
              <span className="text-3xl p-3 bg-bg-sidebar rounded-2xl border border-border-subtle">{activeStudy?.logo}</span>
              <div>
                <span className="text-[9px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase">
                  {activeStudy?.category} STUDY · {activeStudy?.difficulty}
                </span>
                <h2 className="text-xl font-black text-text-primary mt-1">{activeStudy?.company} — {activeStudy?.title}</h2>
              </div>
            </div>

            {/* TAB CONTENT 1: EXECUTIVE SUMMARY */}
            {activeTab === 'summary' && activeStudy && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Business Problem</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{activeStudy.problem}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Business Requirements</h3>
                    <ul className="space-y-2">
                      {activeStudy.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-normal">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Primary Identity Challenges</h3>
                    <ul className="space-y-2">
                      {activeStudy.challenges.map((ch, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-normal">
                          <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" /> {ch}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ARCHITECTURE & MODELS */}
            {activeTab === 'architecture' && activeStudy && (
              <div className="space-y-6">

                {/* Visual flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-accent-primary" /> Edge Deployment Architecture
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStudy.architecture}
                  </pre>
                </div>

                {/* Sequence flowchart */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-accent-primary animate-pulse" /> Cryptographic Signatures Flow
                  </h3>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary overflow-x-auto select-text leading-relaxed">
                    {activeStudy.sequence}
                  </pre>
                </div>

                {/* AuthN vs AuthZ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Authentication (AuthN) Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.authModel}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Authorization (AuthZ) Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.authzModel}</p>
                  </div>
                </div>

                {/* Lifecycle / Provisioning / Federation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Identity Lifecycle Model</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.lifecycle}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Federation Strategy</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeStudy.federation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: THREAT MODEL */}
            {activeTab === 'security' && activeStudy && (
              <div className="space-y-6">

                {/* STRIDE threat model table */}
                <div className="overflow-x-auto rounded-2xl border border-border-subtle shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sidebar border-b border-border-subtle select-none">
                        <th className="p-4 text-xs font-bold text-text-muted uppercase">Primary Threat Risk</th>
                        <th className="p-4 text-xs font-bold text-text-primary uppercase">Defensive Mitigation Control</th>
                      </tr>
                    </thead>
                    <tbody className="bg-bg-card">
                      {activeStudy.threatModel.map((item, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-bg-sidebar/30 transition-colors">
                          <td className="p-4 text-xs font-bold text-text-primary flex items-start gap-2.5 max-w-sm leading-normal">
                            <ShieldAlert className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                            {item.risk}
                          </td>
                          <td className="p-4 text-xs text-text-secondary max-w-sm leading-normal">
                            <Check className="w-4 h-4 text-status-success shrink-0 inline-block mr-2 mt-0.5 align-top" />
                            {item.mitigation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: LESSONS & PITFALLS */}
            {activeTab === 'lessons' && activeStudy && (
              <div className="space-y-6">

                {/* Common Mistakes */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Implementation Mistakes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudy.mistakes.map((mis, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-xs text-text-secondary leading-relaxed">
                        {mis}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Practices */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-status-success" /> Production Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudy.bestPractices.map((bp, i) => (
                      <div key={i} className="p-4 rounded-xl bg-status-success/5 border border-status-success/10 text-xs text-text-secondary leading-relaxed">
                        {bp}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lessons Learned */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider">Lessons Learned</h3>
                  <ul className="space-y-2">
                    {activeStudy.lessons.map((les, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                        <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {les}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: INTERVIEW PREP & STANDARDS */}
            {activeTab === 'interview' && activeStudy && (
              <div className="space-y-6">

                {/* Related RFCs */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent-primary" /> Primary Standards & RFCs Used
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeStudy.rfcs.map((rfc, i) => (
                      <span key={i} className="px-3.5 py-1.5 rounded-lg bg-bg-sidebar border border-border-subtle text-xs font-bold text-text-secondary tracking-tight">
                        {rfc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mock Interview Q&A flashcards */}
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle/30 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-500" /> Architectural Interview Q&A Prep
                  </h3>
                  <div className="space-y-4">
                    {activeStudy.interviewQuestions.map((qa, i) => (
                      <div key={i} className="p-5 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3 leading-relaxed">
                        <h4 className="text-xs font-bold text-text-primary flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded bg-accent-glow text-accent-primary text-[10px] font-mono tracking-tight font-black">Q</span>
                          {qa.q}
                        </h4>
                        <p className="text-xs text-text-secondary pl-8 border-l border-border-subtle mt-2">
                          <strong>Expert Answer:</strong> {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RELATED PLATFORM RESOURCES (Always shown at the bottom of the Detail View) */}
            {activeStudy && activeStudy.relatedResources && (
              <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4 shrink-0">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" /> Deep-Linked Hands-On Practice Resources
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bridge theory with browser-native execution. Leverage our custom tools, checklists, or reference directories to inspect the protocols deployed in this case study.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeStudy.relatedResources.map((res, idx) => (
                    <Link
                      key={idx}
                      to={res.path}
                      className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/50 transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold text-accent-primary tracking-wide">
                          {res.type}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-primary mt-1">
                          {res.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-text-secondary hover:text-text-primary mt-3 font-semibold flex items-center gap-1">
                        Run Resource &rarr;
                      </span>
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

  function enterCaseStudy(id: string) {
    setActiveStudyId(id)
    setActiveTab('summary')
  }
}
