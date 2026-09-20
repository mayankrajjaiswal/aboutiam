import { useMemo, useState } from 'react'
import { Plus, Trash2, Download, FileJson2, FileSpreadsheet } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  buildMigrationBacklog,
  summarizeInventory,
  buildInventoryCsv,
  buildInventoryJson,
  createEmptyEntry,
  type InventoryEntry,
  type HndlExposure,
  type MigrationDifficulty,
  type RotationCapability,
} from '../../lib/tools/cryptoAgilityInventory'

const tool = getToolBySlug('crypto-agility-inventory')!

const HNDL_OPTIONS: HndlExposure[] = ['none', 'low', 'medium', 'high']
const DIFFICULTY_OPTIONS: MigrationDifficulty[] = ['low', 'medium', 'high']
const ROTATION_OPTIONS: RotationCapability[] = ['automated', 'manual', 'not-rotatable']

const PRIORITY_COLOR = (score: number): string => {
  if (score >= 10) return 'text-status-danger'
  if (score >= 6) return 'text-status-warning'
  return 'text-status-info'
}

function buildFileTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

let nextId = 1

export default function CryptoAgilityInventoryBuilder() {
  const [entries, setEntries] = useState<InventoryEntry[]>([createEmptyEntry('e-0')])

  const backlog = useMemo(() => buildMigrationBacklog(entries), [entries])
  const summary = useMemo(() => summarizeInventory(entries), [entries])

  const updateEntry = (id: string, patch: Partial<InventoryEntry>) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))
  }

  const addEntry = () => {
    nextId += 1
    setEntries((prev) => [...prev, createEmptyEntry(`e-${nextId}`)])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const downloadFile = (content: string, extension: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crypto-agility-inventory-${buildFileTimestamp()}.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-text-primary">{summary.totalEntries}</div>
            <div className="text-[9px] text-text-muted uppercase">Entries</div>
          </div>
          <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-status-danger">{summary.highHndlCount}</div>
            <div className="text-[9px] text-text-muted uppercase">High HNDL</div>
          </div>
          <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-status-warning">{summary.notRotatableCount}</div>
            <div className="text-[9px] text-text-muted uppercase">Not Rotatable</div>
          </div>
          <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-center">
            <div className="text-lg font-black text-text-primary">{summary.byDifficulty.high}</div>
            <div className="text-[9px] text-text-muted uppercase">High Difficulty</div>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-text-muted">Entry {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1}
                  aria-label={`Remove entry ${index + 1}`}
                  className="text-text-muted hover:text-status-danger disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`component-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Component</label>
                  <input
                    id={`component-${entry.id}`}
                    type="text"
                    placeholder="e.g. Root CA"
                    value={entry.component}
                    onChange={(e) => updateEntry(entry.id, { component: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`algorithm-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Algorithm</label>
                  <input
                    id={`algorithm-${entry.id}`}
                    type="text"
                    placeholder="e.g. RSA-2048"
                    value={entry.algorithm}
                    onChange={(e) => updateEntry(entry.id, { algorithm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`keylength-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Key Length (bits)</label>
                  <input
                    id={`keylength-${entry.id}`}
                    type="number"
                    min={0}
                    value={entry.keyLengthBits ?? ''}
                    onChange={(e) => updateEntry(entry.id, { keyLengthBits: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`rotation-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Rotation Capability</label>
                  <select
                    id={`rotation-${entry.id}`}
                    value={entry.rotationCapability}
                    onChange={(e) => updateEntry(entry.id, { rotationCapability: e.target.value as RotationCapability })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none"
                  >
                    {ROTATION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`hndl-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">HNDL Exposure</label>
                  <select
                    id={`hndl-${entry.id}`}
                    value={entry.hndlExposure}
                    onChange={(e) => updateEntry(entry.id, { hndlExposure: e.target.value as HndlExposure })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none"
                  >
                    {HNDL_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`difficulty-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Migration Difficulty</label>
                  <select
                    id={`difficulty-${entry.id}`}
                    value={entry.migrationDifficulty}
                    onChange={(e) => updateEntry(entry.id, { migrationDifficulty: e.target.value as MigrationDifficulty })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none"
                  >
                    {DIFFICULTY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor={`notes-${entry.id}`} className="text-[10px] font-bold text-text-muted uppercase block">Notes</label>
                  <input
                    id={`notes-${entry.id}`}
                    type="text"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, { notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEntry}
          className="flex items-center gap-1.5 text-[11px] font-bold text-accent-primary hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider">Prioritized Migration Backlog</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => downloadFile(buildInventoryCsv(entries), 'csv')}
                className="flex items-center gap-1 text-[10px] font-bold text-text-secondary hover:text-text-primary"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> <Download className="w-3 h-3" /> CSV
              </button>
              <button
                type="button"
                onClick={() => downloadFile(buildInventoryJson(entries), 'json')}
                className="flex items-center gap-1 text-[10px] font-bold text-text-secondary hover:text-text-primary"
              >
                <FileJson2 className="w-3.5 h-3.5" /> <Download className="w-3 h-3" /> JSON
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {backlog.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-[11px] p-2 rounded-lg bg-bg-nested">
                <span className={`font-black w-8 shrink-0 ${PRIORITY_COLOR(item.priorityScore)}`}>{item.priorityScore}</span>
                <span className="font-bold text-text-primary flex-1">{item.component || '(unnamed component)'}</span>
                <span className="text-text-secondary">{item.algorithm || '(no algorithm)'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
