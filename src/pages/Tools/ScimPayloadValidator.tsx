import { useMemo, useState } from 'react'
import { AlertOctagon, Check, CheckCircle2, Copy } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  buildSampleScimGroup,
  buildSampleScimUser,
  validateScimGroup,
  validateScimUser,
} from '../../lib/tools/scimSchema'

const tool = getToolBySlug('scim-payload-validator')!

type ResourceType = 'User' | 'Group'
type Tab = 'validate' | 'build'

export default function ScimPayloadValidator() {
  const [tab, setTab] = useState<Tab>('validate')
  const [resourceType, setResourceType] = useState<ResourceType>('User')
  const [json, setJson] = useState(JSON.stringify(buildSampleScimUser(), null, 2))
  const { copy, copiedId } = useClipboardCopy()

  const validation = useMemo(() => {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      return { errors: [{ path: '$', message: 'Payload is not valid JSON.' }] }
    }
    return { errors: resourceType === 'User' ? validateScimUser(parsed) : validateScimGroup(parsed) }
  }, [json, resourceType])

  const builtSample = resourceType === 'User' ? buildSampleScimUser() : buildSampleScimGroup()

  return (
    <ToolPageShell tool={tool}>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
          {(['validate', 'build'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === t ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
          {(['User', 'Group'] as ResourceType[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setResourceType(r)
                if (tab === 'validate') setJson(JSON.stringify(r === 'User' ? buildSampleScimUser() : buildSampleScimGroup(), null, 2))
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${resourceType === r ? 'bg-accent-secondary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {tab === 'validate' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">SCIM {resourceType} Payload</span>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              aria-label="SCIM payload JSON"
              className="w-full h-72 p-4 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
              spellCheck={false}
            />
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Validation Result</span>
            {validation.errors.length === 0 ? (
              <p className="text-sm text-status-success font-bold flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5" /> Spec-correct — no issues found.</p>
            ) : (
              <div className="space-y-2">
                {validation.errors.map((err, i) => (
                  <div key={i} className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/20 flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-status-danger font-mono">{err.path}</p>
                      <p className="text-xs text-text-secondary">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Spec-Correct {resourceType} Scaffold</span>
            <button
              type="button"
              onClick={() => copy(JSON.stringify(builtSample, null, 2), 'built')}
              aria-label="Copy generated payload"
              className="text-text-muted hover:text-text-primary"
            >
              {copiedId === 'built' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-text-primary bg-bg-sidebar p-4 rounded border border-border-subtle/50 overflow-x-auto whitespace-pre">
            {JSON.stringify(builtSample, null, 2)}
          </pre>
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
