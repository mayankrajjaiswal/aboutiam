import { useState } from 'react'
import { Scale, ShieldAlert, Award } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

export default function EuAiActAssessor() {
  const tool = getToolBySlug('eu-ai-act-assessor')!
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    highRisk: false,
    loggingActive: false,
    humanInLoop: false,
    auditTrail: false,
    apiAttestation: false,
  })

  const toggleAnswer = (key: string) => {
    setAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const computeScore = () => {
    if (!answers.highRisk) return { score: 100, label: 'Unregulated / Low-Risk System', color: 'text-accent-secondary' }
    
    let score = 0
    if (answers.loggingActive) score += 25
    if (answers.humanInLoop) score += 25
    if (answers.auditTrail) score += 25
    if (answers.apiAttestation) score += 25

    if (score === 100) return { score, label: 'Fully Compliant High-Risk AI System', color: 'text-accent-secondary' }
    if (score >= 50) return { score, label: 'Partially Compliant (Action Required)', color: 'text-yellow-500' }
    return { score, label: 'Critical Compliance Gaps (High Risk of Heavy Fines)', color: 'text-red-500' }
  }

  const { score, label, color } = computeScore()

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-accent-primary" /> Compliance Questionnaire
            </h2>

            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
                <div className="space-y-1 pr-4">
                  <h3 className="text-xs font-bold text-text-primary">Does your system use High-Risk AI? (Title III classification)</h3>
                  <p className="text-[10px] text-text-secondary">Includes biometric identification, critical infrastructure, profiling, or direct user sorting.</p>
                </div>
                <input
                  type="checkbox"
                  checked={answers.highRisk}
                  onChange={() => toggleAnswer('highRisk')}
                  className="w-4 h-4 text-accent-primary"
                />
              </div>

              {answers.highRisk && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xs font-bold text-text-primary">Dynamic Automated Logging Active? (Art 12)</h3>
                      <p className="text-[10px] text-text-secondary">Does the system log every decision, input changes, and API user context dynamically?</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={answers.loggingActive}
                      onChange={() => toggleAnswer('loggingActive')}
                      className="w-4 h-4 text-accent-primary"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xs font-bold text-text-primary">Human-in-the-loop Kill-switch / Override? (Art 14)</h3>
                      <p className="text-[10px] text-text-secondary">Can authorized human operators override, disable, or intercept automated AI decisions?</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={answers.humanInLoop}
                      onChange={() => toggleAnswer('humanInLoop')}
                      className="w-4 h-4 text-accent-primary"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xs font-bold text-text-primary">Cryptographic Audit Trails? (Art 12)</h3>
                      <p className="text-[10px] text-text-secondary">Are logs cryptographically sealed or stored on immutable ledger stores to prevent alteration?</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={answers.auditTrail}
                      onChange={() => toggleAnswer('auditTrail')}
                      className="w-4 h-4 text-accent-primary"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-bg-nested border border-border-subtle rounded-xl">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xs font-bold text-text-primary">Authorized API Client Attestation? (Art 15)</h3>
                      <p className="text-[10px] text-text-secondary">Are API integrations required to present proof-of-identity (e.g. mTLS or signed assertions) before access?</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={answers.apiAttestation}
                      onChange={() => toggleAnswer('apiAttestation')}
                      className="w-4 h-4 text-accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-secondary" /> Assessment Result
            </h2>

            <div className="p-4 bg-bg-nested border border-border-subtle rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Readiness Score</span>
                <span className={`text-xl font-black ${color}`}>{score}%</span>
              </div>
              <p className="text-xs font-bold text-text-primary">{label}</p>
              {answers.highRisk && score < 100 && (
                <p className="text-[10px] text-red-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> High risk of regulatory non-compliance penalty (up to €35M or 7% global turnover).
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BeginnerExpertExplainer tool={tool} />
        </div>
      </div>
    </ToolPageShell>
  )
}
