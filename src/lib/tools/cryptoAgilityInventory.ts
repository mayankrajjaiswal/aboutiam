/**
 * Pure logic for the Crypto Agility Inventory Builder (`/tools/crypto-agility-inventory`).
 * Lets a user record cryptographic dependencies across their own identity estate
 * (not the reference workstreams in cryptoAgilityRoadmap.ts, which model the
 * industry-wide dependency graph) -- each entry captures algorithm, key length,
 * rotation capability, HNDL exposure, and migration difficulty. Produces a
 * prioritized migration backlog and CSV/JSON export, intended to feed
 * `/playground/crypto-migration` for the dependency-ordering exercise.
 */
export type HndlExposure = 'none' | 'low' | 'medium' | 'high'
export type MigrationDifficulty = 'low' | 'medium' | 'high'
export type RotationCapability = 'automated' | 'manual' | 'not-rotatable'

export interface InventoryEntry {
  id: string
  component: string
  algorithm: string
  keyLengthBits: number | null
  rotationCapability: RotationCapability
  hndlExposure: HndlExposure
  migrationDifficulty: MigrationDifficulty
  notes: string
}

const HNDL_WEIGHT: Record<HndlExposure, number> = { none: 0, low: 1, medium: 2, high: 3 }
const DIFFICULTY_WEIGHT: Record<MigrationDifficulty, number> = { low: 1, medium: 2, high: 3 }
const ROTATION_RISK_WEIGHT: Record<RotationCapability, number> = { automated: 0, manual: 1, 'not-rotatable': 2 }

export interface PrioritizedEntry extends InventoryEntry {
  /** Higher = more urgent to migrate first. Weighted toward HNDL exposure, since that risk accrues silently today. */
  priorityScore: number
}

export function buildMigrationBacklog(entries: InventoryEntry[]): PrioritizedEntry[] {
  return entries
    .map((entry) => ({
      ...entry,
      priorityScore:
        HNDL_WEIGHT[entry.hndlExposure] * 3 +
        ROTATION_RISK_WEIGHT[entry.rotationCapability] * 2 +
        DIFFICULTY_WEIGHT[entry.migrationDifficulty],
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
}

export interface InventorySummary {
  totalEntries: number
  highHndlCount: number
  notRotatableCount: number
  byDifficulty: Record<MigrationDifficulty, number>
}

export function summarizeInventory(entries: InventoryEntry[]): InventorySummary {
  return {
    totalEntries: entries.length,
    highHndlCount: entries.filter((e) => e.hndlExposure === 'high').length,
    notRotatableCount: entries.filter((e) => e.rotationCapability === 'not-rotatable').length,
    byDifficulty: {
      low: entries.filter((e) => e.migrationDifficulty === 'low').length,
      medium: entries.filter((e) => e.migrationDifficulty === 'medium').length,
      high: entries.filter((e) => e.migrationDifficulty === 'high').length,
    },
  }
}

const CSV_COLUMNS: (keyof InventoryEntry | 'priorityScore')[] = [
  'component', 'algorithm', 'keyLengthBits', 'rotationCapability', 'hndlExposure', 'migrationDifficulty', 'notes', 'priorityScore',
]

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildInventoryCsv(entries: InventoryEntry[]): string {
  const prioritized = buildMigrationBacklog(entries)
  const header = CSV_COLUMNS.join(',')
  const rows = prioritized.map((entry) =>
    CSV_COLUMNS.map((col) => csvEscape(String(entry[col] ?? ''))).join(','),
  )
  return [header, ...rows].join('\n')
}

export function buildInventoryJson(entries: InventoryEntry[]): string {
  return JSON.stringify(buildMigrationBacklog(entries), null, 2)
}

export function createEmptyEntry(id: string): InventoryEntry {
  return {
    id,
    component: '',
    algorithm: '',
    keyLengthBits: null,
    rotationCapability: 'manual',
    hndlExposure: 'medium',
    migrationDifficulty: 'medium',
    notes: '',
  }
}
