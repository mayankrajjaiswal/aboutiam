import { useMemo, useState } from 'react'
import { Download, FileJson, RotateCcw, ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { analyzeMcpManifest, buildManifestReportJson, type ManifestFindingSeverity } from '../../lib/tools/mcpManifest'

const tool = getToolBySlug('mcp-manifest-auditor')!

const SEVERITY_ORDER: ManifestFindingSeverity[] = ['Critical', 'High', 'Medium', 'Info']

const SEVERITY_STYLES: Record<ManifestFindingSeverity, { badge: string; icon: typeof ShieldAlert }> = {
  Critical: { badge: 'bg-status-danger/10 text-status-danger border-status-danger/25', icon: ShieldAlert },
  High: { badge: 'bg-status-warning/10 text-status-warning border-status-warning/25', icon: AlertTriangle },
  Medium: { badge: 'bg-status-info/10 text-status-info border-status-info/25', icon: AlertTriangle },
  Info: { badge: 'bg-bg-nested text-text-muted border-border-subtle', icon: Info },
}

const SAMPLE_MANIFEST = `{
  "tools": [
    {
      "name": "get_order_status",
      "description": "Look up the current status of a specific order by its order ID.",
      "parameters": { "properties": { "orderId": { "type": "string", "pattern": "^[A-Z0-9-]{6,20}$" } } },
      "scopes": ["orders:read"],
      "readOnly": true
    },
    {
      "name": "delete_account",
      "parameters": { "properties": { "accountId": { "type": "string" }, "password": { "type": "string" } } }
    },
    {
      "name": "search_records",
      "description": "x",
      "parameters": { "properties": { "resource": { "type": "string" }, "filter": { "type": "string" } }, "resource": "*" }
    }
  ]
}`

function buildFileTimestamp(iso: string): string {
  return iso.replace(/[:.]/g, '-')
}

export default function McpManifestAuditor() {
  const [input, setInput] = useState('')
  const [generatedAt] = useState(() => new Date().toISOString())

  const report = useMemo(() => analyzeMcpManifest(input, generatedAt), [input, generatedAt])
  const hasFindings = report.findings.length > 0
  const hasTools = report.toolCount > 0

  const handleDownload = () => {
    const json = buildManifestReportJson(report)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mcp-manifest-audit-${buildFileTimestamp(report.generatedAt)}.json`
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
              Paste an MCP tool manifest (single tool, array, or {'{ tools: [...] }'})
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
            aria-label="MCP tool manifest JSON input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your MCP manifest JSON here..."
            rows={10}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none resize-y"
          />
        </div>

        {hasTools && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle text-center">
                <div className="text-sm font-black text-text-primary">{report.toolCount}</div>
                <div className="text-[9px] text-text-muted uppercase">Tools</div>
              </div>
              {SEVERITY_ORDER.map((sev) => (
                <div key={sev} className={`p-2.5 rounded-xl border text-center ${SEVERITY_STYLES[sev].badge}`}>
                  <div className="text-sm font-black">{report.summary[sev]}</div>
                  <div className="text-[9px] uppercase">{sev}</div>
                </div>
              ))}
            </div>

            {hasFindings ? (
              <div className="space-y-2">
                {SEVERITY_ORDER.map((sev) => {
                  const findingsForSeverity = report.findings.filter((f) => f.severity === sev)
                  if (findingsForSeverity.length === 0) return null
                  const Icon = SEVERITY_STYLES[sev].icon
                  return findingsForSeverity.map((f, i) => (
                    <div key={`${sev}-${i}`} className={`p-3 rounded-xl border text-xs space-y-1 ${SEVERITY_STYLES[sev].badge}`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="font-black">{f.category}</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ml-auto">{f.severity}</span>
                      </div>
                      <p className="text-text-secondary">{f.message}</p>
                    </div>
                  ))
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/30 text-xs text-status-success flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" /> No identity-relevant risks found in this manifest.
              </div>
            )}

            {report.suggestedScopes.length > 0 && (
              <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Suggested Least-Privilege Scopes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {report.suggestedScopes.map((scope) => (
                    <span key={scope} className="text-[10px] font-mono bg-bg-nested border border-border-subtle text-text-secondary px-2 py-0.5 rounded">{scope}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Audit Report (JSON)
            </button>
          </>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
