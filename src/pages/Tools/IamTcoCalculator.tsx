import { useState } from 'react'
import { Wallet, Users, Server, AlertTriangle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { computeTco, type TcoInputs } from '../../lib/tools/tcoCalculator'

const tool = getToolBySlug('iam-tco-calculator')!

const DEFAULT_INPUTS: TcoInputs = {
  engineerCount: 2,
  engineerAnnualCost: 150000,
  buildMaintenanceHoursPerYear: 500,
  commercialPerSeatCost: 8,
  seatCount: 500,
  includeBreachRiskAdjustment: false,
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US')}`
}

export default function IamTcoCalculator() {
  const [inputs, setInputs] = useState<TcoInputs>(DEFAULT_INPUTS)
  const result = computeTco(inputs)

  const maxCumulative = Math.max(
    result.years[result.years.length - 1].buildCostCumulative,
    result.years[result.years.length - 1].buyCostCumulative,
    1
  )

  const updateField = <K extends keyof TcoInputs>(key: K, value: TcoInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const cheaperOption = result.totalBuildCost < result.totalBuyCost ? 'Build' : 'Buy'

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-primary" /> Build (In-House) Inputs
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="tco-engineers" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Engineers assigned: {inputs.engineerCount}
            </label>
            <input
              id="tco-engineers"
              type="range"
              min={0}
              max={10}
              value={inputs.engineerCount}
              onChange={(e) => updateField('engineerCount', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tco-engineer-cost" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Fully-loaded annual engineer cost: {formatCurrency(inputs.engineerAnnualCost)}
            </label>
            <input
              id="tco-engineer-cost"
              type="range"
              min={50000}
              max={300000}
              step={5000}
              value={inputs.engineerAnnualCost}
              onChange={(e) => updateField('engineerAnnualCost', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tco-hours" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Maintenance hours/year (per engineer): {inputs.buildMaintenanceHoursPerYear}
            </label>
            <input
              id="tco-hours"
              type="range"
              min={0}
              max={2080}
              step={20}
              value={inputs.buildMaintenanceHoursPerYear}
              onChange={(e) => updateField('buildMaintenanceHoursPerYear', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer select-none pt-2 border-t border-border-subtle/50">
            <input
              type="checkbox"
              checked={inputs.includeBreachRiskAdjustment}
              onChange={(e) => updateField('includeBreachRiskAdjustment', e.target.checked)}
              className="w-4 h-4 accent-accent-primary"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
            Apply breach-risk-adjusted cost (illustrative uplift for slower patch cadence)
          </label>
        </div>

        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Server className="w-4 h-4 text-accent-secondary" /> Buy (Commercial IDaaS) Inputs
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="tco-per-seat" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Per-seat licensing cost/year: {formatCurrency(inputs.commercialPerSeatCost)}
            </label>
            <input
              id="tco-per-seat"
              type="range"
              min={0}
              max={50}
              value={inputs.commercialPerSeatCost}
              onChange={(e) => updateField('commercialPerSeatCost', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tco-seats" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Seat count: {inputs.seatCount.toLocaleString('en-US')}
            </label>
            <input
              id="tco-seats"
              type="range"
              min={0}
              max={10000}
              step={50}
              value={inputs.seatCount}
              onChange={(e) => updateField('seatCount', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> 3-Year Verdict
            </span>
            <p className="text-sm text-text-primary font-bold">
              {cheaperOption} is cheaper over 3 years: {formatCurrency(Math.min(result.totalBuildCost, result.totalBuyCost))} vs. {formatCurrency(Math.max(result.totalBuildCost, result.totalBuyCost))}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
        <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Wallet className="w-4 h-4 text-accent-primary" /> 3-Year Cumulative Cost Curve
        </h4>

        <div className="relative w-full h-[220px] flex items-end justify-around pt-6 px-4">
          <div className="absolute left-0 right-0 bottom-8 border-b border-border-subtle/50 border-dashed"></div>
          {result.years.map((y) => {
            const buildHeight = (y.buildCostCumulative / maxCumulative) * 160
            const buyHeight = (y.buyCostCumulative / maxCumulative) * 160
            return (
              <div key={y.year} className="flex flex-col items-center gap-1 w-24" data-testid={`tco-year-${y.year}`}>
                <div className="flex items-end gap-2 h-[160px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-text-primary">{formatCurrency(y.buildCostCumulative)}</span>
                    <div style={{ height: `${buildHeight}px` }} className="w-8 rounded-t-md bg-accent-primary/70 border border-accent-primary" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-text-primary">{formatCurrency(y.buyCostCumulative)}</span>
                    <div style={{ height: `${buyHeight}px` }} className="w-8 rounded-t-md bg-accent-secondary/70 border border-accent-secondary" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Year {y.year}</span>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-text-muted pt-2 border-t border-border-subtle/30">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent-primary/70"></span> Build (In-House)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent-secondary/70"></span> Buy (Commercial IDaaS)</span>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle/30">
          Directional estimate only — this is not a procurement-grade TCO model. Real decisions should incorporate your own negotiated pricing, migration costs, and compliance requirements.
        </p>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
