import { useMemo, useState } from 'react'
import { Plus, Trash2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { getToolBySlug } from '../../data/toolsRegistry'
import { IAM_RACI_ACTIVITIES, type RaciActivity } from '../../data/iamRaciActivities'
import { validateRaciMatrix, type RaciMatrix, type RaciLetter } from '../../lib/tools/raciValidation'

const tool = getToolBySlug('raci-builder')!

const LETTERS: RaciLetter[] = ['R', 'A', 'C', 'I']
const DEFAULT_ROLES = ['IAM Program Manager', 'App Owner', 'Security Team']

function toggleLetter(cell: RaciLetter[], letter: RaciLetter): RaciLetter[] {
  return cell.includes(letter) ? cell.filter((l) => l !== letter) : [...cell, letter]
}

export default function RaciBuilder() {
  const [activities, setActivities] = useState<RaciActivity[]>(IAM_RACI_ACTIVITIES)
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES)
  const [matrix, setMatrix] = useState<RaciMatrix>({})
  const [newActivity, setNewActivity] = useState('')
  const [newRole, setNewRole] = useState('')

  const activityIds = useMemo(() => activities.map((a) => a.id), [activities])
  const issues = useMemo(() => validateRaciMatrix(activityIds, matrix), [activityIds, matrix])
  const errorsByActivity = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const issue of issues) {
      if (issue.severity !== 'error') continue
      map.set(issue.activityId, [...(map.get(issue.activityId) ?? []), issue.message])
    }
    return map
  }, [issues])
  const warnings = issues.filter((i) => i.severity === 'warning')

  const setCell = (activityId: string, role: string, letter: RaciLetter) => {
    setMatrix((prev) => {
      const activityRow = prev[activityId] ?? {}
      const cell = activityRow[role] ?? []
      return { ...prev, [activityId]: { ...activityRow, [role]: toggleLetter(cell, letter) } }
    })
  }

  const addActivity = () => {
    const name = newActivity.trim()
    if (!name) return
    setActivities((prev) => [...prev, { id: `custom-${Date.now()}-${prev.length}`, name }])
    setNewActivity('')
  }

  const removeActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  const addRole = () => {
    const role = newRole.trim()
    if (!role || roles.includes(role)) return
    setRoles((prev) => [...prev, role])
    setNewRole('')
  }

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role))
  }

  const downloadMarkdown = () => {
    const header = `| Activity | ${roles.join(' | ')} |\n| --- | ${roles.map(() => '---').join(' | ')} |`
    const rows = activities
      .map((activity) => {
        const cells = roles.map((role) => (matrix[activity.id]?.[role] ?? []).join('/') || '—')
        return `| ${activity.name} | ${cells.join(' | ')} |`
      })
      .join('\n')
    const markdown = `# IAM RACI Matrix\n\n${header}\n${rows}\n`
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'iam-raci-matrix.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label htmlFor="raci-new-role" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Add a role</label>
              <input
                id="raci-new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRole()}
                placeholder="e.g. Compliance Officer"
                className="p-2 rounded-lg bg-bg-nested border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
            <button onClick={addRole} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span key={role} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-glow text-accent-primary border border-accent-primary/20 text-xs font-bold">
                {role}
                <button onClick={() => removeRole(role)} aria-label={`Remove role ${role}`} className="hover:text-status-danger">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[10px] font-black text-text-muted uppercase tracking-wider">
                <th className="p-3 min-w-[220px]">Activity</th>
                {roles.map((role) => (
                  <th key={role} className="p-3 text-center min-w-[140px]">{role}</th>
                ))}
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => {
                const activityErrors = errorsByActivity.get(activity.id) ?? []
                return (
                  <tr key={activity.id} className="border-b border-border-subtle/50 align-top">
                    <td className="p-3">
                      <span className="font-bold text-text-primary block">{activity.name}</span>
                      {activityErrors.map((msg) => (
                        <span key={msg} className="text-[10px] text-status-danger flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> {msg}
                        </span>
                      ))}
                    </td>
                    {roles.map((role) => {
                      const cell = matrix[activity.id]?.[role] ?? []
                      return (
                        <td key={role} className="p-3 text-center">
                          <div className="flex justify-center gap-1">
                            {LETTERS.map((letter) => (
                              <button
                                key={letter}
                                onClick={() => setCell(activity.id, role, letter)}
                                aria-pressed={cell.includes(letter)}
                                aria-label={`${letter} for ${role} on ${activity.name}`}
                                className={`w-6 h-6 rounded-md text-[10px] font-black border transition-colors ${
                                  cell.includes(letter)
                                    ? 'bg-accent-primary border-accent-primary text-white'
                                    : 'bg-bg-nested border-border-subtle text-text-muted hover:text-text-primary'
                                }`}
                              >
                                {letter}
                              </button>
                            ))}
                          </div>
                        </td>
                      )
                    })}
                    <td className="p-3">
                      <button onClick={() => removeActivity(activity.id)} aria-label={`Remove activity ${activity.name}`} className="text-text-muted hover:text-status-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 items-end p-4 rounded-2xl bg-bg-card border border-border-subtle">
          <div className="space-y-1 flex-1 min-w-[220px]">
            <label htmlFor="raci-new-activity" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Add a custom activity</label>
            <input
              id="raci-new-activity"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addActivity()}
              placeholder="e.g. Emergency access break-glass review"
              className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <button onClick={addActivity} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Activity
          </button>
        </div>

        {warnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-status-warning/10 border border-status-warning/30 space-y-1">
            {warnings.map((w) => (
              <p key={w.message} className="text-xs text-status-warning flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {w.message}
              </p>
            ))}
          </div>
        )}

        {issues.length === 0 && (
          <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Every activity has exactly one Accountable owner and at least one Responsible party.
          </div>
        )}

        <button
          onClick={downloadMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-colors"
        >
          <Download className="w-4 h-4" /> Download Matrix (.md)
        </button>
      </div>
    </ToolPageShell>
  )
}
