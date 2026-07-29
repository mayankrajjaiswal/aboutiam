import { useMemo, useState } from 'react'
import { Presentation, Download, Clock, MessageCircle, ClipboardList } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { BULLETINS, BULLETIN_CATEGORIES } from '../../data/bulletinsData'
import { generateTabletopScript, scriptToMarkdown, type TabletopAnswers } from '../../lib/tools/tabletopGenerator'

const tool = getToolBySlug('tabletop-exercise-generator')!

const TEAM_SIZES = ['Small (2-5)', 'Medium (6-15)', 'Large (15+)']
const IDP_TYPES = ['Okta', 'Microsoft Entra ID', 'Ping Identity', 'Active Directory', 'Custom/In-house']

export default function TabletopExerciseGenerator() {
  const [category, setCategory] = useState<string>(BULLETIN_CATEGORIES[0])
  const [answers, setAnswers] = useState<TabletopAnswers>({
    industry: '',
    idpType: IDP_TYPES[0],
    teamSize: TEAM_SIZES[0],
  })

  const bulletinsInCategory = useMemo(() => BULLETINS.filter((b) => b.category === category), [category])
  const [bulletinId, setBulletinId] = useState<string>(bulletinsInCategory[0]?.id ?? '')

  const selectedBulletin = BULLETINS.find((b) => b.id === bulletinId) ?? bulletinsInCategory[0]

  const script = useMemo(
    () => (selectedBulletin ? generateTabletopScript(selectedBulletin, answers) : null),
    [selectedBulletin, answers]
  )

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory)
    const firstInCategory = BULLETINS.find((b) => b.category === nextCategory)
    setBulletinId(firstInCategory?.id ?? '')
  }

  const downloadScript = () => {
    if (!script) return
    const markdown = scriptToMarkdown(script)
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${script.bulletinId}_tabletop_exercise.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-text-primary">Build Your Exercise</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="tt-industry" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Industry</label>
            <input
              id="tt-industry"
              type="text"
              placeholder="e.g. Healthcare"
              value={answers.industry}
              onChange={(e) => setAnswers((prev) => ({ ...prev, industry: e.target.value }))}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tt-idp" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Primary IdP Type</label>
            <select
              id="tt-idp"
              value={answers.idpType}
              onChange={(e) => setAnswers((prev) => ({ ...prev, idpType: e.target.value }))}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              {IDP_TYPES.map((idp) => (
                <option key={idp} value={idp}>{idp}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tt-team-size" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Team Size</label>
            <select
              id="tt-team-size"
              value={answers.teamSize}
              onChange={(e) => setAnswers((prev) => ({ ...prev, teamSize: e.target.value }))}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              {TEAM_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tt-category" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Scenario Theme</label>
            <select
              id="tt-category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              {BULLETIN_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tt-bulletin" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Source Incident</label>
          <select
            id="tt-bulletin"
            value={bulletinId}
            onChange={(e) => setBulletinId(e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
          >
            {bulletinsInCategory.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {script && (
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
              <Presentation className="w-4 h-4 text-accent-primary" /> {script.title}
            </h4>
            <button
              onClick={downloadScript}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Script
            </button>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-black text-text-primary uppercase tracking-wider">Objectives</h5>
            <ul className="space-y-1.5 text-xs text-text-secondary list-disc pl-4">
              {script.objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent-secondary" /> Timed Injects</h5>
            {script.injects.map((inject, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-bg-nested border border-border-subtle/50 text-xs">
                <span className="font-mono font-bold text-accent-primary">{inject.timeOffset}</span> — <span className="text-text-secondary">{inject.description}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-accent-secondary" /> Discussion Prompts</h5>
            <ul className="space-y-1.5 text-xs text-text-secondary list-disc pl-4">
              {script.discussionPrompts.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-accent-secondary" /> Scoring Rubric</h5>
            {script.rubric.map((r, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-bg-nested border border-border-subtle/50 text-xs">
                <span className="font-bold text-text-primary">{r.area}:</span> <span className="text-text-secondary">{r.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
