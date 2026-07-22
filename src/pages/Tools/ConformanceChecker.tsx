import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, FileJson, FileCode, RotateCcw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { runConformanceCheck, buildSampleOidcDiscovery, buildSampleSamlMetadata } from '../../lib/tools/conformance'

const tool = getToolBySlug('conformance-checker')!

export default function ConformanceChecker() {
  const [input, setInput] = useState('')

  const report = useMemo(() => runConformanceCheck(input), [input])
  const passedCount = report.results.filter((r) => r.passed).length

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
              Paste an OIDC Discovery Document or SAML 2.0 Metadata XML
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInput(buildSampleOidcDiscovery())}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" /> Load OIDC Sample
              </button>
              <button
                type="button"
                onClick={() => setInput(buildSampleSamlMetadata())}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" /> Load SAML Sample
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
            aria-label="Document to check"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste a JSON OIDC discovery document (starts with "{") or SAML 2.0 metadata XML (starts with "<") …'}
            className="w-full h-64 font-mono text-[11px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none focus:border-accent-primary resize-none wrap-break-word"
          />
        </div>

        {input.trim() === '' ? (
          <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-sm text-text-muted font-semibold">
            Paste a document above (or load a sample) to run the conformance checklist.
          </div>
        ) : report.documentType === 'unknown' ? (
          <div className="p-6 rounded-2xl bg-status-warning/5 border border-status-warning/20 text-xs font-semibold text-text-secondary">
            Couldn't detect a document type. Input should start with <code className="bg-bg-nested px-1 py-0.5 rounded">{'{'}</code> for an OIDC discovery document or <code className="bg-bg-nested px-1 py-0.5 rounded">{'<'}</code> for SAML metadata XML.
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                {report.documentType === 'oidc-discovery' ? 'OIDC Discovery Checklist' : 'SAML 2.0 Metadata Checklist'}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                passedCount === report.results.length ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
              }`}>
                {passedCount} / {report.results.length} Passed
              </span>
            </div>

            <div className="space-y-2">
              {report.results.map((r) => (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    r.passed ? 'border-status-success/20 bg-status-success/5' : 'border-status-danger/20 bg-status-danger/5'
                  }`}
                >
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-primary block">{r.label}</span>
                    <span className="text-[11px] text-text-secondary leading-relaxed block mt-0.5 wrap-break-word">{r.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
