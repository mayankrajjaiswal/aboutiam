import { useEffect, useState } from 'react'
import {
  Search, X, Copy, CheckCircle2, ExternalLink, Terminal, Layers, Check, Wand2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { EXPLORE_PRODUCTS, EXPLORE_TYPES, type ExploreProduct } from '../data/exploreData'

const DIFFICULTIES: ExploreProduct['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced']

function buildExploreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/explore/',
    'name': 'AboutIAM Landscape Directory',
    'description': 'Browsable, beginner-to-advanced catalog of identity products spanning open source IdPs, enterprise SaaS, CIAM, PAM, and secrets engines.',
    'hasPart': EXPLORE_PRODUCTS.map((p) => ({
      '@type': 'SoftwareApplication',
      '@id': `https://www.aboutiam.com/explore/#${p.id}`,
      'name': p.name,
      'applicationCategory': p.type,
      'description': p.bestUse,
      'url': `https://www.aboutiam.com/explore?product=${p.id}`
    }))
  }
}

export default function Explore() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('All')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')
  const [activeProduct, setActiveProduct] = useState<ExploreProduct | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('product')
      const match = EXPLORE_PRODUCTS.find((p) => p.id === id)
      if (match) {
        setTimeout(() => {
          setActiveProduct(match)
        }, 0)
      }
    }
  }, [])

  useEffect(() => {
    if (!activeProduct) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProduct(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeProduct])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  // Filter products by search, type, and difficulty tier
  const filteredProducts = EXPLORE_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.bestUse.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'All' || p.type === filterType
    const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildExploreJsonLd()).replace(/</g, '\\u003c') }}
      />
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Layers className="w-3.5 h-3.5" /> Identity Landscape
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Landscape Directory
        </h2>
        <p className="text-text-secondary">
          Browse and compare {EXPLORE_PRODUCTS.length} leading Open Source Identity Servers, Enterprise SaaS vendors, CIAM platforms, Directory Services, PAM proxies, and Secret Engines — from beginner-friendly starting points to advanced enterprise stacks. Study license details and retrieve sample integration scripts.
        </p>
      </div>

      {/* SEO Lead Magnet Banner */}
      <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-accent-primary text-white flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-text-primary">Not sure which Identity Provider to choose?</span>
            <p className="text-[11px] text-text-secondary font-medium">Use our interactive 3-step consultative wizard to calculate your perfect architectural match.</p>
          </div>
        </div>
        <Link
          to="/explore/matchmaker"
          className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shrink-0 shadow"
        >
          Launch Auth Matchmaker →
        </Link>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col gap-4 bg-bg-card p-4 rounded-xl border border-border-subtle shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              placeholder="Search products (e.g. Keycloak)..."
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          </div>

          {/* Type Tab Filters */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {['All', ...EXPLORE_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterType === t
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Tier Filters */}
        <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-border-subtle/50">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Difficulty:</span>
          {['All', ...DIFFICULTIES].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filterDifficulty === d
                  ? 'bg-accent-secondary text-white border-accent-secondary'
                  : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar text-text-secondary hover:text-text-primary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group p-6 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {p.type}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-bg-sidebar text-text-muted border border-border-subtle">
                  {p.difficulty}
                </span>
                <span className="text-[10px] font-bold text-text-muted">{p.license}</span>
              </div>
              <h4 className="text-xl font-black text-text-primary group-hover:text-accent-primary transition-colors">
                {p.name}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {p.bestUse}
              </p>

              {/* Mini Protocol Check Indicators */}
              <div className="pt-4 border-t border-border-subtle/50 space-y-2">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Standard Protocols</span>
                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase">
                  {Object.entries(p.protocols).map(([name, supported]) => (
                    <span
                      key={name}
                      className={`px-2 py-0.5 rounded border ${
                        supported
                          ? 'bg-status-success/5 border-status-success/15 text-status-success'
                          : 'bg-bg-nested/30 border-border-subtle text-text-muted line-through'
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Modal Trigger */}
            <div className="pt-6 mt-6 border-t border-border-subtle/50">
              <button
                onClick={() => setActiveProduct(p)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-sidebar hover:bg-accent-glow hover:text-accent-primary text-text-primary text-xs font-extrabold transition-colors border border-border-subtle group"
              >
                View Product Blueprint <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Detail Modal Drawer */}
      {activeProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-product-modal-title"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveProduct(null)}></div>

          {/* Modal Card */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90svh] animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
              <div className="space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {activeProduct.type}
                </span>
                <h3 id="explore-product-modal-title" className="text-2xl font-black text-text-primary">{activeProduct.name} Blueprint</h3>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-bg-sidebar hover:text-text-primary transition-colors focus:outline-none"
                aria-label="Close product blueprint"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Metadata Info */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-1.5">
                <span className="font-bold text-text-muted uppercase text-[9px] tracking-wider block">Deployment Target</span>
                <p className="text-text-primary font-bold leading-normal">{activeProduct.deployment}</p>
              </div>
              <div className="p-4 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-1.5">
                <span className="font-bold text-text-muted uppercase text-[9px] tracking-wider block">Core License</span>
                <p className="text-text-primary font-bold leading-normal">{activeProduct.license}</p>
              </div>
            </div>

            {/* Protocol Support Checklist Matrix */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Detailed Protocol Support Matrix</span>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(activeProduct.protocols).map(([proto, supported]) => (
                  <div
                    key={proto}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                      supported
                        ? 'border-status-success/30 bg-status-success/5 text-status-success'
                        : 'border-border-subtle bg-bg-sidebar/30 text-text-muted'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{proto}</span>
                    {supported ? (
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                    ) : (
                      <X className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Integration Snippet */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-secondary" /> Sample Integration Snippet
                </span>
                <button
                  onClick={() => copyToClipboard(activeProduct.integrationSnippet)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-border-subtle transition-colors focus:outline-none"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-bold uppercase">{isCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle/50 text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                {activeProduct.integrationSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
