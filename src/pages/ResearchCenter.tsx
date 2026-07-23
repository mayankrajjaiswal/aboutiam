import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanSearch, ArrowRight, ShieldCheck, AlertTriangle
} from 'lucide-react'
import { CVE_DATABASE, RFC_DATABASE, rfcSlug, type ResearchDifficulty } from '../data/researchData'

type TabType = 'cve' | 'rfc' | 'bulletins'

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

function buildResearchJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/research/',
    'name': 'AboutIAM Identity Research & CVE Tracker',
    'description': 'Identity-relevant CVE directory with vulnerable/secure code patches, plus an IETF RFC and draft protocol registry.',
    'hasPart': [
      ...CVE_DATABASE.map((c) => ({
        '@type': 'TechArticle',
        '@id': `https://www.aboutiam.com/research/#${c.id}`,
        'headline': `${c.id}: ${c.title}`,
        'about': c.vulnerabilityType,
        'description': c.description,
        'url': `https://www.aboutiam.com/research?cve=${c.id}`
      })),
      ...RFC_DATABASE.map((r) => ({
        '@type': 'TechArticle',
        '@id': `https://www.aboutiam.com/research/#${rfcSlug(r.number)}`,
        'headline': `${r.number}: ${r.title}`,
        'about': r.category,
        'description': r.description,
        'url': `https://www.aboutiam.com/research?rfc=${rfcSlug(r.number)}`
      }))
    ]
  }
}

export default function ResearchCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('cve')
  const [cveSearch, setCveSearch] = useState('')
  const [selectedCveId, setSelectedCveId] = useState<string>('CVE-2021-44228')
  const [selectedRfcNumber, setSelectedRfcNumber] = useState<string>('RFC 6749')
  const [cveDifficulty, setCveDifficulty] = useState<typeof DIFFICULTIES[number]>('All')
  const [rfcDifficulty, setRfcDifficulty] = useState<typeof DIFFICULTIES[number]>('All')

  // Deep-link support: ?cve=<id> or ?rfc=<slug> lands directly on that entry (GEMINI.md §4I convention)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cveParam = params.get('cve')
      const rfcParam = params.get('rfc')
      const foundCve = cveParam ? CVE_DATABASE.find(c => c.id.toLowerCase() === cveParam.toLowerCase()) : undefined
      const foundRfc = rfcParam ? RFC_DATABASE.find(r => rfcSlug(r.number) === rfcParam.toLowerCase()) : undefined
      if (foundCve) {
        setTimeout(() => {
          setActiveTab('cve')
          setSelectedCveId(foundCve.id)
        }, 0)
      } else if (foundRfc) {
        setTimeout(() => {
          setActiveTab('rfc')
          setSelectedRfcNumber(foundRfc.number)
        }, 0)
      }
    }
  }, [])

  // Filter CVEs based on search input and difficulty
  const filteredCves = useMemo(() => {
    return CVE_DATABASE.filter(cve =>
      (cveDifficulty === 'All' || cve.difficulty === cveDifficulty) &&
      (cve.id.toLowerCase().includes(cveSearch.toLowerCase()) ||
      cve.component.toLowerCase().includes(cveSearch.toLowerCase()) ||
      cve.title.toLowerCase().includes(cveSearch.toLowerCase()))
    )
  }, [cveSearch, cveDifficulty])

  const filteredRfcs = useMemo(() => {
    return RFC_DATABASE.filter(rfc => rfcDifficulty === 'All' || rfc.difficulty === rfcDifficulty)
  }, [rfcDifficulty])

  const selectedCve = CVE_DATABASE.find(c => c.id === selectedCveId)
  const difficultyBadgeClass = (d: ResearchDifficulty) =>
    d === 'Beginner' ? 'bg-status-success/15 text-status-success' :
    d === 'Intermediate' ? 'bg-status-warning/15 text-status-warning' :
    'bg-status-danger/15 text-status-danger'

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildResearchJsonLd()).replace(/</g, '\\u003c') }}
      />
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
                  className="w-full bg-bg-base border border-border-subtle/80 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary mb-2 font-semibold"
                />
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setCveDifficulty(d)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${cveDifficulty === d ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/60 border-border-subtle text-text-secondary hover:border-accent-primary'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

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
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${c.cvss >= 9.0 ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'}`}>
                          {c.cvss}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${difficultyBadgeClass(c.difficulty)}`}>
                          {c.difficulty}
                        </span>
                      </div>
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
                Active Identity Protocols &amp; Drafts
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setRfcDifficulty(d)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${rfcDifficulty === d ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/60 border-border-subtle text-text-secondary hover:border-accent-primary'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredRfcs.map(rfc => (
                  <button
                    key={rfc.number}
                    onClick={() => setSelectedRfcNumber(rfc.number)}
                    className={`w-full text-left p-2.5 rounded-lg border transition text-xs leading-normal ${selectedRfcNumber === rfc.number ? 'bg-accent-glow border-accent-primary' : 'bg-bg-nested/40 border-border-subtle hover:border-border-subtle'}`}
                  >
                    <div className="flex justify-between items-center mb-1 gap-1.5">
                      <span className="font-mono font-extrabold text-accent-primary">{rfc.number}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${difficultyBadgeClass(rfc.difficulty)}`}>
                          {rfc.difficulty}
                        </span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          rfc.status === 'Live' ? 'bg-status-success/15 text-status-success' :
                          rfc.status === 'Draft' ? 'bg-status-warning/15 text-status-warning' :
                          'bg-bg-nested text-text-muted border border-border-subtle'
                        }`}>
                          {rfc.status}
                        </span>
                      </div>
                    </div>
                    <span className="block font-bold text-text-primary text-[11px] mb-0.5">{rfc.title}</span>
                    <p className="text-[10px] text-text-muted mb-1.5 leading-relaxed">{rfc.description}</p>
                    <span className="block text-[9px] text-text-secondary leading-normal border-t border-border-subtle/40 pt-1">
                      🔑 <strong>Key Takeaway:</strong> {rfc.keyTakeaway}
                    </span>
                  </button>
                ))}
                {filteredRfcs.length === 0 && (
                  <p className="text-xs text-text-muted italic py-4 text-center">No RFCs match this difficulty filter.</p>
                )}
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyBadgeClass(selectedCve.difficulty)}`}>
                      {selectedCve.difficulty}
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
