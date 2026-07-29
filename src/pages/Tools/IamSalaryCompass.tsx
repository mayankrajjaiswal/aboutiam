import { useMemo, useState } from 'react'
import { Combine, Info } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  IAM_SALARY_DATA,
  REGION_MULTIPLIERS,
  estimateCompensation,
  type SalaryRole,
  type SalarySeniority,
  type SalarySpecialization,
} from '../../data/iamSalaryData'

const tool = getToolBySlug('iam-salary-compass')!

const ROLES: SalaryRole[] = ['Engineer', 'Architect', 'Analyst', 'Manager']
const SPECIALIZATIONS: SalarySpecialization[] = ['Workforce IAM', 'CIAM', 'PAM', 'IGA']

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US')}`
}

export default function IamSalaryCompass() {
  const [role, setRole] = useState<SalaryRole | 'All'>('All')
  const [specialization, setSpecialization] = useState<SalarySpecialization | 'All'>('All')
  const [regionIndex, setRegionIndex] = useState(1)

  const region = REGION_MULTIPLIERS[regionIndex]

  const filtered = useMemo(() => {
    return IAM_SALARY_DATA.filter((entry) => {
      if (role !== 'All' && entry.role !== role) return false
      if (specialization !== 'All' && entry.specialization !== specialization) return false
      return true
    })
  }, [role, specialization])

  const seniorityOrder: SalarySeniority[] = ['Junior', 'Mid', 'Senior', 'Staff/Principal']
  const sorted = [...filtered].sort((a, b) => seniorityOrder.indexOf(a.seniority) - seniorityOrder.indexOf(b.seniority))

  return (
    <ToolPageShell tool={tool}>
      <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 flex gap-3 text-xs text-text-secondary items-start">
        <Info className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
        <span>Directional estimates aggregated from public sources; not a substitute for local market research or a real negotiation benchmark.</span>
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="salary-role" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Role</label>
            <select
              id="salary-role"
              value={role}
              onChange={(e) => setRole(e.target.value as SalaryRole | 'All')}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              <option value="All">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="salary-spec" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Specialization</label>
            <select
              id="salary-spec"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value as SalarySpecialization | 'All')}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              <option value="All">All Specializations</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="salary-region" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Region</label>
            <select
              id="salary-region"
              value={regionIndex}
              onChange={(e) => setRegionIndex(Number(e.target.value))}
              className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary"
            >
              {REGION_MULTIPLIERS.map((r, idx) => (
                <option key={r.region} value={idx}>{r.region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
        <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Combine className="w-4 h-4 text-accent-primary" /> {sorted.length} Matching Role{sorted.length === 1 ? '' : 's'} — {region.region}
        </h4>

        {sorted.length === 0 ? (
          <p className="text-xs text-text-muted">No roles match this filter combination.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-xs">
              <thead className="bg-bg-nested">
                <tr>
                  <th className="p-2.5 text-left font-bold text-text-secondary">Role</th>
                  <th className="p-2.5 text-left font-bold text-text-secondary">Seniority</th>
                  <th className="p-2.5 text-left font-bold text-text-secondary">Specialization</th>
                  <th className="p-2.5 text-left font-bold text-text-secondary">P25</th>
                  <th className="p-2.5 text-left font-bold text-text-secondary">P50 (Median)</th>
                  <th className="p-2.5 text-left font-bold text-text-secondary">P75</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => {
                  const comp = estimateCompensation(entry, region.multiplier)
                  return (
                    <tr key={entry.id} className="border-t border-border-subtle/50">
                      <td className="p-2.5 font-semibold text-text-primary">{entry.role}</td>
                      <td className="p-2.5">{entry.seniority}</td>
                      <td className="p-2.5">{entry.specialization}</td>
                      <td className="p-2.5 font-mono">{formatCurrency(comp.p25)}</td>
                      <td className="p-2.5 font-mono font-bold text-accent-primary">{formatCurrency(comp.p50)}</td>
                      <td className="p-2.5 font-mono">{formatCurrency(comp.p75)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
