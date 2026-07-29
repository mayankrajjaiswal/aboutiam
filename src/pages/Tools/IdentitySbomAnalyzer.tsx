import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileJson, RotateCcw, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { analyzeManifest, buildSbomJson, type SbomSeverity } from '../../lib/tools/identitySbom'

const tool = getToolBySlug('identity-sbom-analyzer')!

const SEVERITY_ORDER: SbomSeverity[] = ['Critical', 'High', 'Medium', 'Info']

const SEVERITY_STYLES: Record<SbomSeverity, { badge: string; icon: typeof ShieldAlert }> = {
  Critical: { badge: 'bg-status-danger/10 text-status-danger border-status-danger/25', icon: ShieldAlert },
  High: { badge: 'bg-status-warning/10 text-status-warning border-status-warning/25', icon: AlertTriangle },
  Medium: { badge: 'bg-status-info/10 text-status-info border-status-info/25', icon: AlertTriangle },
  Info: { badge: 'bg-bg-nested text-text-muted border-border-subtle', icon: Info }
}

const SAMPLE_MANIFEST = `{
  "name": "example-service",
  "version": "1.0.0",
  "dependencies": {
    "jsonwebtoken": "^8.5.1",
    "express": "^4.18.2",
    "node-samlify": "2.5.0"
  },
  "devDependencies": {
    "pyjwt": "1.5.0"
  }
}`

function buildFileTimestamp(iso: string): string {
  return iso.replace(/[:.]/g, '-')
}

export default function IdentitySbomAnalyzer() {
  const [input, setInput] = useState('')
  const [generatedAt] = useState(() => new Date().toISOString())

  const report = useMemo(() => analyzeManifest(input, generatedAt), [input, generatedAt])
  const hasFindings = report.findings.length > 0

  const handleDownload = () => {
    const json = buildSbomJson(report)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `identity-sbom-${buildFileTimestamp(report.generatedAt)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
              Paste a package.json (or a comma/newline-separated dependency list)
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_MANIFEST)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" /> Load Sample
              </button>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  title="Clear"
                  className="p-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <textarea
            aria-label="Dependency manifest"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste package.json, or a plain list like "jsonwebtoken@8.5.1, pyjwt@1.2.0"...'}
            className="w-full h-64 font-mono text-[11px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none focus:border-accent-primary resize-none wrap-break-word"
          />
        </div>

        {input.trim() === '' ? (
          <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-sm text-text-muted font-semibold">
            Paste a manifest above (or load the sample) to run the auth-dependency risk report.
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">Identity SBOM Report</span>
              <div className="flex items-center gap-2">
                {SEVERITY_ORDER.map((severity) => (
                  <span key={severity} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${SEVERITY_STYLES[severity].badge}`}>
                    {severity}: {report.summary[severity]}
                  </span>
                ))}
              </div>
            </div>

            {!hasFindings ? (
              <div className="p-6 rounded-xl bg-status-success/5 border border-status-success/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                <span className="text-xs font-semibold text-text-secondary">
                  No known auth-relevant risky dependencies detected in this manifest.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {report.findings.map((finding, idx) => {
                  const { badge, icon: SeverityIcon } = SEVERITY_STYLES[finding.severity]
                  return (
                    <div key={`${finding.packageName}-${idx}`} className={`p-3.5 rounded-xl border ${badge} space-y-2`}>
                      <div className="flex items-start gap-3">
                        <SeverityIcon className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-text-primary font-mono">{finding.packageName}</span>
                            <span className="text-[10px] text-text-muted">({finding.ecosystem})</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-nested text-text-secondary">
                              installed: {finding.installedVersionRaw || '(none)'}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-nested text-text-secondary">
                              patched: {finding.patchedVersion}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1 wrap-break-word">{finding.notes}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            {finding.cveIds.map((cveId) => (
                              <Link
                                key={cveId}
                                to={`/research?cve=${cveId}`}
                                className="text-[10px] font-bold text-accent-primary hover:underline font-mono"
                              >
                                {cveId} — View full CVE profile →
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="pt-2 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Identity SBOM (JSON)
              </button>
            </div>
          </div>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
