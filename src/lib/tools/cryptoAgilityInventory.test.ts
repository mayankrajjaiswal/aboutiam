import { describe, it, expect } from 'vitest'
import {
  buildMigrationBacklog,
  summarizeInventory,
  buildInventoryCsv,
  buildInventoryJson,
  createEmptyEntry,
  type InventoryEntry,
} from './cryptoAgilityInventory'

function entry(overrides: Partial<InventoryEntry> = {}): InventoryEntry {
  return {
    id: 'e1',
    component: 'Root CA',
    algorithm: 'RSA-2048',
    keyLengthBits: 2048,
    rotationCapability: 'manual',
    hndlExposure: 'medium',
    migrationDifficulty: 'medium',
    notes: '',
    ...overrides,
  }
}

describe('buildMigrationBacklog', () => {
  it('returns an empty array for an empty inventory', () => {
    expect(buildMigrationBacklog([])).toEqual([])
  })

  it('ranks a high-HNDL, not-rotatable, high-difficulty entry above a low-risk one', () => {
    const urgent = entry({ id: 'urgent', hndlExposure: 'high', rotationCapability: 'not-rotatable', migrationDifficulty: 'high' })
    const mild = entry({ id: 'mild', hndlExposure: 'none', rotationCapability: 'automated', migrationDifficulty: 'low' })
    const backlog = buildMigrationBacklog([mild, urgent])
    expect(backlog[0].id).toBe('urgent')
    expect(backlog[1].id).toBe('mild')
  })

  it('gives every entry a priorityScore', () => {
    const backlog = buildMigrationBacklog([entry()])
    expect(typeof backlog[0].priorityScore).toBe('number')
  })

  it('weights HNDL exposure more heavily than migration difficulty alone', () => {
    const highHndlLowDifficulty = entry({ id: 'a', hndlExposure: 'high', migrationDifficulty: 'low', rotationCapability: 'automated' })
    const noHndlHighDifficulty = entry({ id: 'b', hndlExposure: 'none', migrationDifficulty: 'high', rotationCapability: 'automated' })
    const backlog = buildMigrationBacklog([noHndlHighDifficulty, highHndlLowDifficulty])
    expect(backlog[0].id).toBe('a')
  })
})

describe('summarizeInventory', () => {
  it('summarizes an empty inventory as all zeros', () => {
    const summary = summarizeInventory([])
    expect(summary.totalEntries).toBe(0)
    expect(summary.highHndlCount).toBe(0)
    expect(summary.notRotatableCount).toBe(0)
    expect(summary.byDifficulty).toEqual({ low: 0, medium: 0, high: 0 })
  })

  it('counts high-HNDL and not-rotatable entries correctly', () => {
    const entries = [
      entry({ id: 'a', hndlExposure: 'high', rotationCapability: 'not-rotatable' }),
      entry({ id: 'b', hndlExposure: 'low', rotationCapability: 'automated' }),
    ]
    const summary = summarizeInventory(entries)
    expect(summary.totalEntries).toBe(2)
    expect(summary.highHndlCount).toBe(1)
    expect(summary.notRotatableCount).toBe(1)
  })

  it('buckets entries by migration difficulty', () => {
    const entries = [
      entry({ id: 'a', migrationDifficulty: 'low' }),
      entry({ id: 'b', migrationDifficulty: 'low' }),
      entry({ id: 'c', migrationDifficulty: 'high' }),
    ]
    const summary = summarizeInventory(entries)
    expect(summary.byDifficulty).toEqual({ low: 2, medium: 0, high: 1 })
  })
})

describe('buildInventoryCsv', () => {
  it('produces a header row and one data row per entry', () => {
    const csv = buildInventoryCsv([entry(), entry({ id: 'e2', component: 'Directory Service' })])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('component')
    expect(lines[0]).toContain('priorityScore')
  })

  it('escapes values containing commas or quotes', () => {
    const csv = buildInventoryCsv([entry({ notes: 'contains, a comma and a "quote"' })])
    expect(csv).toContain('"contains, a comma and a ""quote"""')
  })

  it('sorts CSV rows by priority, most urgent first', () => {
    const urgent = entry({ id: 'urgent', component: 'Urgent', hndlExposure: 'high', rotationCapability: 'not-rotatable' })
    const mild = entry({ id: 'mild', component: 'Mild', hndlExposure: 'none', rotationCapability: 'automated' })
    const csv = buildInventoryCsv([mild, urgent])
    const lines = csv.split('\n')
    expect(lines[1]).toContain('Urgent')
    expect(lines[2]).toContain('Mild')
  })
})

describe('buildInventoryJson', () => {
  it('produces valid JSON with a priorityScore per entry', () => {
    const json = buildInventoryJson([entry(), entry({ id: 'e2' })])
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toHaveProperty('priorityScore')
  })
})

describe('createEmptyEntry', () => {
  it('creates an entry with the given id and safe defaults', () => {
    const created = createEmptyEntry('new-id')
    expect(created.id).toBe('new-id')
    expect(created.component).toBe('')
    expect(created.keyLengthBits).toBeNull()
    expect(created.rotationCapability).toBe('manual')
  })
})
