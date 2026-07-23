import { useEffect, useState } from 'react'
import { CheckSquare, ShieldCheck } from 'lucide-react'
import BookmarkButton from '../components/BookmarkButton'
import ContentFeedback from '../components/ContentFeedback'
import { CHEAT_SHEETS, SHEET_CATEGORIES, type SheetDifficulty } from '../data/cheatSheetsData'

const DIFFICULTIES: SheetDifficulty[] = ['Beginner', 'Intermediate', 'Advanced']

function buildCheatSheetsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/cheat-sheets/',
    'name': 'AboutIAM Developer Playbooks',
    'description': 'Beginner-to-advanced interactive compliance and hardening checklists for application security, identity infrastructure, and regulatory frameworks.',
    'hasPart': CHEAT_SHEETS.map((s) => ({
      '@type': 'TechArticle',
      '@id': `https://www.aboutiam.com/cheat-sheets/#${s.id}`,
      'headline': s.title,
      'about': s.category,
      'description': `${s.target} — ${s.checks.length} actionable checks.`,
      'url': `https://www.aboutiam.com/cheat-sheets?sheet=${s.id}`
    }))
  }
}

export default function CheatSheets() {
  const [activeSheet, setActiveSheet] = useState(CHEAT_SHEETS[0].id)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [difficultyFilter, setDifficultyFilter] = useState<SheetDifficulty | 'All'>('All')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const sheetParam = params.get('sheet')
      const found = sheetParam ? CHEAT_SHEETS.find(s => s.id === sheetParam) : undefined
      if (found) {
        setTimeout(() => {
          setActiveSheet(found.id)
        }, 0)
      }
    }
  }, [])

  const toggleCheck = (id: string) => {
    setCompleted({ ...completed, [id]: !completed[id] })
  }

  const currentSheet = CHEAT_SHEETS.find(s => s.id === activeSheet) || CHEAT_SHEETS[0]
  const sheetCompletedCount = currentSheet.checks.filter(c => completed[c.id]).length
  const totalChecks = currentSheet.checks.length
  const pct = totalChecks > 0 ? Math.round((sheetCompletedCount / totalChecks) * 100) : 0

  const visibleSheets = difficultyFilter === 'All' ? CHEAT_SHEETS : CHEAT_SHEETS.filter(s => s.difficulty === difficultyFilter)

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCheatSheetsJsonLd()).replace(/</g, '\\u003c') }}
      />
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-secondary uppercase tracking-wider bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
          <CheckSquare className="w-3.5 h-3.5 text-status-success" /> Developer Playbooks
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Security & Compliance Cheat Sheets
        </h2>
        <p className="text-text-secondary">
          {CHEAT_SHEETS.length} interactive compliance and hardening checklists for software engineers, platform teams, and auditors — spanning Application Security, Identity Infrastructure & Governance, and Compliance & Regulatory frameworks. Check off remediation steps to calculate your application's real-time security posture.
        </p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...DIFFICULTIES] as const).map(d => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              difficultyFilter === d
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-bg-nested border-border-subtle text-text-secondary hover:border-accent-primary/40'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Selectors */}
        <div className="lg:col-span-1 space-y-5">
          {SHEET_CATEGORIES.map(category => {
            const categorySheets = visibleSheets.filter(s => s.category === category)
            if (categorySheets.length === 0) return null
            return (
              <div key={category} className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{category}</span>
                <div className="space-y-2">
                  {categorySheets.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSheet(s.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        activeSheet === s.id
                          ? 'bg-bg-card border-accent-primary shadow-sm'
                          : 'bg-bg-nested border-border-subtle hover:bg-bg-card hover:border-accent-primary/30'
                      }`}
                    >
                      <span className={`block font-bold text-sm ${activeSheet === s.id ? 'text-accent-primary' : 'text-text-primary'}`}>{s.title}</span>
                      <span className="block text-[10px] text-text-muted font-bold uppercase mt-1">{s.difficulty} · {s.target}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Checklist */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm animate-fadeIn relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-border-subtle relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-text-primary">{currentSheet.title}</h3>
                  <BookmarkButton item={{ id: `sheet-${currentSheet.id}`, title: currentSheet.title, link: `/cheat-sheets?sheet=${currentSheet.id}` }} />
                </div>
                <p className="text-sm text-text-secondary font-medium">Compliance target: {currentSheet.target}</p>
              </div>

              {/* Progress Gauge */}
              <div className="flex items-center gap-4 bg-bg-sidebar border border-border-subtle p-3 rounded-xl shrink-0">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" className="stroke-border-subtle" strokeWidth="4" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      className="stroke-status-success transition-all duration-1000"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - pct / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="relative z-10 text-[10px] font-black text-text-primary">{pct}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Security Posture</span>
                  <span className={`text-xs font-black uppercase ${pct === 100 ? 'text-status-success' : 'text-status-warning'}`}>
                    {pct === 100 ? 'Audit Compliant' : 'Uncertified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="pt-6 space-y-4 relative z-10">
              {currentSheet.checks.map(chk => {
                const isChecked = !!completed[chk.id]
                return (
                  <button
                    key={chk.id}
                    onClick={() => toggleCheck(chk.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-status-success/5 border-status-success/30 shadow-inner'
                        : 'bg-bg-sidebar/50 border-border-subtle hover:bg-bg-sidebar hover:border-accent-primary/30'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                      isChecked ? 'bg-status-success border-status-success text-white' : 'bg-bg-card border-border-subtle'
                    }`}>
                      {isChecked && <ShieldCheck className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-sm font-bold ${isChecked ? 'text-text-primary line-through opacity-70' : 'text-text-primary'}`}>
                        {chk.task}
                      </span>
                      <p className={`text-xs font-medium leading-relaxed ${isChecked ? 'text-text-muted line-through opacity-70' : 'text-text-secondary'}`}>
                        {chk.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pt-6 flex justify-end relative z-10">
              <ContentFeedback id={`sheet-${currentSheet.id}`} title={currentSheet.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
