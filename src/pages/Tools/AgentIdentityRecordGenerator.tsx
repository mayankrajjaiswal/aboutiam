import { useMemo, useState } from 'react'
import { Download, RotateCcw, AlertTriangle, FileJson2, FileText, FileCode } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { AGENT_RECORD_FIELDS, type AgentRecordFieldGroup } from '../../data/agentRegistryModel'
import {
  validateAgentRecord,
  buildRecordJson,
  buildRecordYaml,
  buildJobDescription,
  type AgentRecordValues,
} from '../../lib/tools/agentIdentityRecord'

const tool = getToolBySlug('agent-identity-record')!

type OutputFormat = 'json' | 'yaml' | 'job-description'

const GROUPS: AgentRecordFieldGroup[] = Array.from(new Set(AGENT_RECORD_FIELDS.map((f) => f.group)))

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-status-danger',
  high: 'text-status-warning',
  medium: 'text-status-info',
}

function buildFileTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export default function AgentIdentityRecordGenerator() {
  const [values, setValues] = useState<AgentRecordValues>({})
  const [format, setFormat] = useState<OutputFormat>('json')

  const validation = useMemo(() => validateAgentRecord(values), [values])

  const output = useMemo(() => {
    if (format === 'json') return buildRecordJson(values)
    if (format === 'yaml') return buildRecordYaml(values)
    return buildJobDescription(values)
  }, [values, format])

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleReset = () => setValues({})

  const handleDownload = () => {
    const extension = format === 'json' ? 'json' : format === 'yaml' ? 'yaml' : 'txt'
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agent-identity-record-${buildFileTimestamp()}.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-text-secondary">
            Completeness: <span className="text-text-primary font-black">{validation.completenessPercent}%</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary hover:text-text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {validation.warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/30 space-y-2">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-status-warning" /> Governance Warnings
            </h2>
            {validation.warnings.map((warning) => (
              <p key={warning.fieldId} className={`text-[11px] ${SEVERITY_COLOR[warning.severity]}`}>
                <span className="font-black uppercase mr-1">[{warning.severity}]</span>
                {warning.message}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group}>
              <h2 className="text-xs font-black text-text-primary uppercase tracking-wider mb-2">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AGENT_RECORD_FIELDS.filter((field) => field.group === group).map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label htmlFor={`air-${field.id}`} className="text-[10px] font-bold text-text-muted uppercase block">
                      {field.label}{field.required && <span className="text-status-danger ml-1">*</span>}
                    </label>
                    <input
                      id={`air-${field.id}`}
                      type="text"
                      placeholder={field.exampleValue}
                      value={values[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                    />
                    <p className="text-[10px] text-text-muted">{field.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1.5" role="group" aria-label="Output format">
              <button
                type="button"
                onClick={() => setFormat('json')}
                aria-pressed={format === 'json'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase ${format === 'json' ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary'}`}
              >
                <FileJson2 className="w-3 h-3" /> JSON
              </button>
              <button
                type="button"
                onClick={() => setFormat('yaml')}
                aria-pressed={format === 'yaml'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase ${format === 'yaml' ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary'}`}
              >
                <FileCode className="w-3 h-3" /> YAML
              </button>
              <button
                type="button"
                onClick={() => setFormat('job-description')}
                aria-pressed={format === 'job-description'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase ${format === 'job-description' ? 'bg-accent-primary text-white' : 'bg-bg-nested text-text-secondary'}`}
              >
                <FileText className="w-3 h-3" /> Job Description
              </button>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-[11px] font-bold text-accent-primary hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
          <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap bg-bg-nested rounded-lg p-3 max-h-96 overflow-y-auto">{output}</pre>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
