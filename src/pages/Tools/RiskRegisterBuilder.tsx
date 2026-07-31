import { useState } from 'react'
import { Plus, Trash2, Download } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { getToolBySlug } from '../../data/toolsRegistry'
import { STARTER_RISK_REGISTER, scoreRiskEntry, buildRiskRegisterMarkdown, type RiskEntry, type RiskTier } from '../../lib/tools/riskRegisterScoring'

const tool = getToolBySlug('risk-register-builder')!

const TIER_STYLE: Record<RiskTier, string> = {
  Low: 'bg-status-success/10 text-status-success border-status-success/20',
  Medium: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Critical: 'bg-status-danger/10 text-status-danger border-status-danger/20',
}

function emptyRisk(index: number): RiskEntry {
  return { id: `custom-${Date.now()}-${index}`, risk: '', impact: 3, likelihood: 3, owner: '', mitigation: '', targetDate: '' }
}

export default function RiskRegisterBuilder() {
  const [entries, setEntries] = useState<RiskEntry[]>(STARTER_RISK_REGISTER)

  const updateEntry = (id: string, patch: Partial<RiskEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const addEntry = () => {
    setEntries((prev) => [...prev, emptyRisk(prev.length)])
  }

  const downloadMarkdown = () => {
    const markdown = buildRiskRegisterMarkdown(entries)
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'iam-risk-register.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border-subtle bg-bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[10px] font-black text-text-muted uppercase tracking-wider">
                <th className="p-3 min-w-[220px]">Risk</th>
                <th className="p-3">Impact</th>
                <th className="p-3">Likelihood</th>
                <th className="p-3">Score / Tier</th>
                <th className="p-3 min-w-[140px]">Owner</th>
                <th className="p-3 min-w-[220px]">Mitigation</th>
                <th className="p-3">Target Date</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const { score, tier } = scoreRiskEntry(entry)
                return (
                  <tr key={entry.id} className="border-b border-border-subtle/50 align-top">
                    <td className="p-2">
                      <input
                        value={entry.risk}
                        onChange={(e) => updateEntry(entry.id, { risk: e.target.value })}
                        placeholder="Describe the risk"
                        className="w-full p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={entry.impact}
                        onChange={(e) => updateEntry(entry.id, { impact: Number(e.target.value) as RiskEntry['impact'] })}
                        className="p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      >
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={entry.likelihood}
                        onChange={(e) => updateEntry(entry.id, { likelihood: Number(e.target.value) as RiskEntry['likelihood'] })}
                        className="p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      >
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border font-black text-[10px] uppercase tracking-wider ${TIER_STYLE[tier]}`}>
                        {score} · {tier}
                      </span>
                    </td>
                    <td className="p-2">
                      <input
                        value={entry.owner}
                        onChange={(e) => updateEntry(entry.id, { owner: e.target.value })}
                        placeholder="Owner"
                        className="w-full p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={entry.mitigation}
                        onChange={(e) => updateEntry(entry.id, { mitigation: e.target.value })}
                        placeholder="Mitigation plan"
                        className="w-full p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        value={entry.targetDate}
                        onChange={(e) => updateEntry(entry.id, { targetDate: e.target.value })}
                        className="p-1.5 rounded-lg bg-bg-nested border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </td>
                    <td className="p-2">
                      <button onClick={() => removeEntry(entry.id)} aria-label="Remove risk" className="text-text-muted hover:text-status-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={addEntry} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Risk
          </button>
          <button onClick={downloadMarkdown} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors">
            <Download className="w-4 h-4" /> Download Register (.md)
          </button>
        </div>
      </div>
    </ToolPageShell>
  )
}
