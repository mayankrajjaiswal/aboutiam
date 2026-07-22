import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Book, Search, Lightbulb, ShieldCheck, FileText, ChevronRight, Wrench, ArrowRight } from 'lucide-react'
import { ENCYCLOPEDIA_TERMS } from '../data/encyclopediaData'
import BookmarkButton from '../components/BookmarkButton'
import ContentFeedback from '../components/ContentFeedback'

export interface Term {
  id: string
  term: string
  fullName: string
  analogy: string
  expert: string
  category: 'Foundations' | 'Directories' | 'Protocols' | 'Governance' | 'Cryptography' | 'Zero Trust' | 'Decentralized' | 'Authorization' | 'Provisioning'
  toolUrl?: string
}

function buildEncyclopediaJsonLd(terms: Term[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': 'https://www.aboutiam.com/encyclopedia/',
    'name': 'AboutIAM Master IAM Glossary & Encyclopedia',
    'description': 'Translate complex identity acronyms. Every standard from ABAC to Zero Trust is defined with a beginner-friendly analogy and a strict, expert-grade architectural specification.',
    'hasDefinedTerm': terms.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `https://www.aboutiam.com/encyclopedia/#${t.id}`,
      'name': t.term,
      'description': `${t.fullName}. Analogy: ${t.analogy} Expert specification: ${t.expert}`.slice(0, 300) + '...',
      'inDefinedTermSet': 'https://www.aboutiam.com/encyclopedia/'
    }))
  }
}

export default function Encyclopedia() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const termId = params.get('term') || params.get('id')
      if (termId) {
        const found = ENCYCLOPEDIA_TERMS.find(t => t.id === termId.toLowerCase())
        if (found) {
          setTimeout(() => {
            setSelectedTerm(found)
          }, 0)
        }
      }
    }
  }, [])

  const encyclopedia = ENCYCLOPEDIA_TERMS

  const filteredTerms = encyclopedia.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.fullName.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEncyclopediaJsonLd(encyclopedia)).replace(/</g, '\\u003c') }}
      />
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Book className="w-3.5 h-3.5" /> Encyclopedia
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Master IAM Glossary & Encyclopedia
        </h2>
        <p className="text-text-secondary">
          Translate complex identity acronyms. Every standard from ABAC to Zero Trust is defined with a beginner-friendly analogy and a strict, expert-grade architectural specification.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Side: Search and List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative w-full">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" 
              placeholder="Search 65 terms (e.g. PKCE)..."
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', 'Foundations', 'Directories', 'Protocols', 'Governance', 'Cryptography', 'Zero Trust', 'Decentralized'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cat
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'bg-bg-sidebar text-text-muted border-border-subtle hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 mt-4 custom-scrollbar">
            {filteredTerms.map(t => (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTerm(t)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTerm(t) }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  selectedTerm?.id === t.id
                    ? 'border-accent-primary bg-accent-glow shadow-sm'
                    : 'border-border-subtle bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <span className={`block text-sm font-black ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {t.term}
                  </span>
                  <span className="block text-[10px] text-text-muted font-bold uppercase truncate max-w-[160px]">
                    {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <BookmarkButton item={{ id: `term-${t.id}`, title: t.term, link: `/encyclopedia?term=${t.id}` }} />
                  <ChevronRight className={`w-4 h-4 ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-muted'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Term Detail View */}
        <div className="lg:col-span-3">
          {selectedTerm ? (
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-8 animate-fadeIn h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-2 border-b border-border-subtle pb-6 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                    {selectedTerm.category}
                  </span>
                  <BookmarkButton
                    item={{ id: `term-${selectedTerm.id}`, title: selectedTerm.term, link: `/encyclopedia?term=${selectedTerm.id}` }}
                    className="p-1.5 rounded-lg border border-border-subtle bg-bg-sidebar/50 hover:border-accent-primary/30"
                  />
                </div>
                <h3 className="text-3xl font-black text-text-primary">{selectedTerm.term}</h3>
                <p className="text-base text-text-secondary font-medium">{selectedTerm.fullName}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {/* Analogy */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> The Beginner Analogy
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    "{selectedTerm.analogy}"
                  </p>
                </div>

                {/* Expert Detail */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-secondary uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Expert Technical Specification
                  </span>
                  <p className="text-[12px] text-text-primary leading-relaxed font-mono bg-bg-nested p-3.5 rounded border border-border-subtle/50">
                    {selectedTerm.expert}
                  </p>
                </div>
              </div>

              {selectedTerm.toolUrl ? (
                <div className="p-5 rounded-xl bg-accent-glow border border-accent-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 animate-fadeIn">
                  <div className="flex gap-3 items-start">
                    <Wrench className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider">Interactive Tool Available</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed font-semibold">
                        We built a 100% client-side, browser-native tool to simulate, parse, and experiment with {selectedTerm.term} in real time!
                      </p>
                    </div>
                  </div>
                  <Link
                    to={selectedTerm.toolUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-accent-primary/15 shrink-0 group cursor-pointer"
                  >
                    Try the Tool
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-bg-nested/30 border border-border-subtle/50 flex gap-3 text-xs text-text-muted font-semibold items-start relative z-10">
                  <FileText className="w-4 h-4 shrink-0 text-text-secondary" />
                  <span>Want to see how {selectedTerm.term} fits into active code or real handshakes? Browse the Playgrounds or play with our visual OIDC handshakes!</span>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border-subtle/50 relative z-10">
                <ContentFeedback id={`term-${selectedTerm.id}`} title={selectedTerm.term} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-subtle rounded-2xl bg-bg-card/50">
              <Book className="w-12 h-12 text-text-muted mb-4" />
              <h4 className="text-lg font-bold text-text-primary">Select a Term</h4>
              <p className="text-sm text-text-secondary">Click on any acronym or standard on the left to reveal its deep-dive translation and layman analogies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
