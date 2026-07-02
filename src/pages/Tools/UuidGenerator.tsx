import { useState } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { generateUlid, generateUuidV4, generateUuidV7 } from '../../lib/tools/uuid'

const tool = getToolBySlug('uuid-generator')!

type Kind = 'v4' | 'v7' | 'ulid'

const GENERATORS: Record<Kind, () => string> = {
  v4: generateUuidV4,
  v7: generateUuidV7,
  ulid: generateUlid,
}

const LABELS: Record<Kind, string> = {
  v4: 'UUID v4 (random)',
  v7: 'UUID v7 (time-sortable)',
  ulid: 'ULID (time-sortable)',
}

export default function UuidGenerator() {
  const [kind, setKind] = useState<Kind>('v4')
  const [count, setCount] = useState(10)
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 10 }, GENERATORS.v4))
  const { copy, copiedId } = useClipboardCopy()

  const regenerate = (nextKind: Kind = kind, nextCount: number = count) => {
    setIds(Array.from({ length: nextCount }, GENERATORS[nextKind]))
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="uuid-kind" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Format</label>
            <select
              id="uuid-kind"
              value={kind}
              onChange={(e) => { const next = e.target.value as Kind; setKind(next); regenerate(next) }}
              className="p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-bold text-sm focus:outline-none focus:border-accent-primary"
            >
              {(Object.keys(LABELS) as Kind[]).map((k) => <option key={k} value={k}>{LABELS[k]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="uuid-count" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Count</label>
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => {
                const next = Math.min(100, Math.max(1, Number(e.target.value) || 1))
                setCount(next)
                regenerate(kind, next)
              }}
              className="w-24 p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => regenerate()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-primary text-white text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Generate
          </button>
          <button
            type="button"
            onClick={() => copy(ids.join('\n'), 'all')}
            aria-label="Copy all identifiers"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-bg-sidebar hover:bg-bg-nested text-xs font-bold text-text-secondary border border-border-subtle"
          >
            {copiedId === 'all' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />} Copy All
          </button>
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {ids.map((id, i) => (
            <div key={`${id}-${i}`} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle/50">
              <span className="text-xs font-mono text-text-primary break-all">{id}</span>
              <button
                type="button"
                onClick={() => copy(id, `id-${i}`)}
                aria-label="Copy this identifier"
                className="text-text-muted hover:text-text-primary shrink-0"
              >
                {copiedId === `id-${i}` ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
