import { useState } from 'react'
import { ShieldCheck, AlertTriangle, Gavel, ExternalLink } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  computeInsuranceReadiness,
  INSURANCE_CONTROLS,
  INSURANCE_DENIAL_CASE_STUDIES,
  type InsuranceControlInputs,
} from '../../lib/tools/insuranceReadiness'

const tool = getToolBySlug('cyber-insurance-readiness')!

const DEFAULT_INPUTS: InsuranceControlInputs = Object.fromEntries(INSURANCE_CONTROLS.map((c) => [c.id, false]))

export default function CyberInsuranceReadiness() {
  const [inputs, setInputs] = useState<InsuranceControlInputs>(DEFAULT_INPUTS)
  const result = computeInsuranceReadiness(inputs)

  const toggleControl = (id: string) => {
    setInputs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-primary" /> Underwritten Controls
          </h3>
          <div className="space-y-2">
            {INSURANCE_CONTROLS.map((control) => (
              <label
                key={control.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-bg-sidebar/40 hover:bg-bg-sidebar cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={Boolean(inputs[control.id])}
                  onChange={() => toggleControl(control.id)}
                  className="w-4 h-4 mt-0.5 accent-accent-primary shrink-0"
                />
                <span className="space-y-0.5">
                  <span className="block text-sm font-bold text-text-primary">
                    {control.label} <span className="text-text-muted font-normal">({control.points} pts)</span>
                  </span>
                  <span className="block text-xs text-text-secondary leading-relaxed">{control.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-secondary" /> Readiness Score
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-text-primary">{result.score}</span>
                <span className="text-sm text-text-muted">/ {result.maxScore} ({result.percent}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-nested overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-primary transition-all"
                  style={{ width: `${result.percent}%` }}
                  data-testid="insurance-readiness-bar"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent-glow border border-accent-primary/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                Directional Premium Impact
              </span>
              <p className="text-sm font-bold text-text-primary">{result.premiumImpact.label}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{result.premiumImpact.description}</p>
            </div>

            {result.gaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border-subtle/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning" /> Gap Checklist
                </span>
                <ul className="space-y-1.5">
                  {result.gaps.map((gap) => (
                    <li key={gap.id} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-status-warning shrink-0">•</span> {gap.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle/30">
              Directional estimate only — not a quote from any specific carrier. Real premiums depend on your industry, revenue, claims history, and the carrier's own underwriting model.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
        <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Gavel className="w-4 h-4 text-accent-primary" /> Real Coverage-Denial Case Studies
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {INSURANCE_DENIAL_CASE_STUDIES.map((study) => (
            <div key={study.id} className="p-4 rounded-xl bg-bg-sidebar/40 border border-border-subtle space-y-2">
              <p className="text-sm font-bold text-text-primary">{study.caseName}</p>
              <p className="text-[11px] font-mono text-text-muted">{study.citation}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{study.summary}</p>
              <div className="flex items-center justify-between pt-1">
                <a
                  href={study.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-accent-primary hover:text-accent-hover inline-flex items-center gap-1"
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-text-muted">Last verified: {study.lastVerified}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
