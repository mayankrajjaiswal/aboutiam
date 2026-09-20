import { useMemo, useState } from 'react'
import { AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { computeRoi, DEFAULT_ROI_INPUTS, type RoiInputs } from '../../lib/tools/passwordlessRoi'

const tool = getToolBySlug('passwordless-roi-calculator')!

interface FieldConfig {
  key: keyof RoiInputs
  label: string
  isIllustrative: boolean
}

const FIELDS: FieldConfig[] = [
  { key: 'population', label: 'Population (users)', isIllustrative: false },
  { key: 'resetTicketsPerUserPerYear', label: 'Password-reset tickets / user / year', isIllustrative: true },
  { key: 'costPerTicket', label: 'Cost per helpdesk ticket (USD)', isIllustrative: true },
  { key: 'lockoutIncidentsPerUserPerYear', label: 'Lockout incidents / user / year', isIllustrative: true },
  { key: 'lockoutMinutesPerIncident', label: 'Lockout downtime per incident (minutes)', isIllustrative: true },
  { key: 'loadedHourlyCost', label: 'Fully-loaded hourly cost (USD)', isIllustrative: true },
  { key: 'mfaFatigueIncidentsPer1000PerYear', label: 'MFA-fatigue incidents / 1,000 users / year', isIllustrative: true },
  { key: 'costPerMfaFatigueIncident', label: 'Cost per MFA-fatigue incident (USD)', isIllustrative: true },
  { key: 'deviceUnitCost', label: 'Device unit cost (USD)', isIllustrative: true },
  { key: 'deviceFulfillmentCost', label: 'Device fulfillment cost (USD)', isIllustrative: true },
  { key: 'deviceSupportCostPerYear', label: 'Device support cost / user / year (USD)', isIllustrative: true },
  { key: 'deviceRefreshCycleYears', label: 'Device refresh cycle (years)', isIllustrative: true },
]

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

export default function PasswordlessRoiCalculator() {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_ROI_INPUTS)

  const result = useMemo(() => computeRoi(inputs), [inputs])

  const handleChange = (key: keyof RoiInputs, value: string) => {
    const numeric = Number(value)
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(numeric) ? numeric : 0 }))
  }

  const handleReset = () => setInputs(DEFAULT_ROI_INPUTS)

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/30 flex items-start gap-2 text-xs text-text-secondary">
          <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-text-primary block mb-1">This is a planning model, not a vendor performance claim.</span>
            Every default value below is an <strong>illustrative assumption</strong> — replace every one of them with your own organization's actual ticket volume, cost-per-ticket, and device pricing before relying on this output for a real budget decision.
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-text-primary uppercase tracking-wider">Inputs</h2>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary hover:text-text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Illustrative Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <label htmlFor={`roi-${field.key}`} className="text-[10px] font-bold text-text-muted uppercase block flex items-center gap-1.5">
                {field.label}
                {field.isIllustrative && (
                  <span className="text-[8px] bg-status-warning/10 text-status-warning border border-status-warning/30 px-1 py-0.5 rounded uppercase font-black">Illustrative</span>
                )}
              </label>
              <input
                id={`roi-${field.key}`}
                type="number"
                min={0}
                value={inputs[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-text-primary">{formatUsd(result.threeYearPasswordCost)}</div>
            <div className="text-[10px] text-text-muted uppercase">3-Year Password Cost</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-text-primary">{formatUsd(result.threeYearPasswordlessCost)}</div>
            <div className="text-[10px] text-text-muted uppercase">3-Year Passwordless Cost</div>
          </div>
          <div className={`p-4 rounded-xl border text-center ${result.threeYearSavings >= 0 ? 'bg-status-success/5 border-status-success/30' : 'bg-status-danger/5 border-status-danger/30'}`}>
            <div className={`text-lg font-black ${result.threeYearSavings >= 0 ? 'text-status-success' : 'text-status-danger'}`}>{formatUsd(Math.abs(result.threeYearSavings))}</div>
            <div className="text-[10px] text-text-muted uppercase">{result.threeYearSavings >= 0 ? '3-Year Savings' : '3-Year Additional Cost'}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">Cumulative Cost by Year</h3>
          <div className="space-y-2">
            {result.yearlyPoints.map((point) => (
              <div key={point.year} className="flex items-center gap-3 text-[11px]">
                <span className="w-14 shrink-0 font-bold text-text-secondary">Year {point.year}</span>
                <span className="flex-1 text-text-secondary">Password: {formatUsd(point.cumulativePasswordCost)}</span>
                <span className="flex-1 text-text-secondary">Passwordless: {formatUsd(point.cumulativePasswordlessCost)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 text-xs text-text-secondary">
          {result.breakEvenYear !== null ? (
            <span><strong className="text-text-primary">Break-even at year {result.breakEvenYear.toFixed(1)}.</strong> Before this point, the passwordless rollout costs more than continuing with passwords; after it, passwordless is cheaper.</span>
          ) : (
            <span><strong className="text-text-primary">No break-even within 3 years</strong> at these inputs — the password-related costs modeled here don't offset the device investment in this window.</span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-accent-primary" /> Most Influential Inputs</h3>
          <p className="text-[11px] text-text-secondary">These two inputs, if off by 20%, shift your 3-year savings the most — worth getting right before presenting a business case.</p>
          <ul className="space-y-1">
            {result.mostInfluentialInputs.map((s) => (
              <li key={s.input} className="text-[11px] text-text-secondary">
                <span className="font-bold text-text-primary">{FIELDS.find((f) => f.key === s.input)?.label ?? s.input}</span>: ±20% shifts savings by ~{formatUsd(s.savingsDeltaAt20PercentUp)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
