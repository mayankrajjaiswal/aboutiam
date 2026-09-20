import { describe, it, expect } from 'vitest'
import { PQC_ALGORITHM_RISK_TABLE, findPqcAlgorithmRisk, type MigrationPriority, type AffectedTheme } from './pqcAlgorithmRisk'
import { NEXT_GEN_THEMES, type NextGenThemeId } from './nextGenThemes'

const VALID_PRIORITIES: MigrationPriority[] = ['Critical', 'High', 'Medium', 'Info']

describe('pqcAlgorithmRisk data table', () => {
  it('has a non-empty table', () => {
    expect(PQC_ALGORITHM_RISK_TABLE.length).toBeGreaterThan (0)
  })

  it('every entry has a valid migrationPriority', () => {
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      expect(VALID_PRIORITIES).toContain(entry.migrationPriority)
    }
  })

  it('every entry has at least one alias, a citation, and a recommendedHybrid note', () => {
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      expect(entry.aliases.length).toBeGreaterThan(0)
      expect(entry.citation.trim()).not.toBe('')
      expect(entry.recommendedHybrid.trim()).not.toBe('')
      expect(entry.vulnerabilityReason.trim()).not.toBe('')
    }
  })

  it('quantum-vulnerable entries never claim "already PQC" in their hybrid guidance', () => {
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      if (entry.quantumVulnerable) {
        expect(entry.recommendedHybrid.toLowerCase()).not.toContain('already pqc')
      }
    }
  })

  it('no two entries share an identical alias (ambiguous lookups)', () => {
    const seen = new Map<string, string>()
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      for (const alias of entry.aliases) {
        const key = alias.toLowerCase()
        expect(seen.has(key)).toBe(false)
        seen.set(key, entry.algorithm)
      }
    }
  })

  it('every entry has at least one affected theme, and every id resolves to a real NextGenTheme', () => {
    const realThemeIds = new Set<NextGenThemeId>(NEXT_GEN_THEMES.map((t) => t.id))
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      expect(entry.affectedThemes.length).toBeGreaterThan(0)
      for (const themeId of entry.affectedThemes) {
        expect(realThemeIds.has(themeId as unknown as NextGenThemeId)).toBe(true)
      }
    }
  })

  it('every entry lists crypto-agility as an affected theme', () => {
    for (const entry of PQC_ALGORITHM_RISK_TABLE) {
      const themes: AffectedTheme[] = entry.affectedThemes
      expect(themes).toContain('crypto-agility')
    }
  })
})

describe('findPqcAlgorithmRisk', () => {
  it('matches classical algorithms case-insensitively', () => {
    expect(findPqcAlgorithmRisk('SHA256withRSA')?.algorithm).toBe('RSA')
    expect(findPqcAlgorithmRisk('es256')?.algorithm).toBe('ECDSA')
    expect(findPqcAlgorithmRisk('Ed25519')?.algorithm).toContain('EdDSA')
  })

  it('matches PQC-hybrid algorithms as non-vulnerable', () => {
    expect(findPqcAlgorithmRisk('ML-KEM-768')?.quantumVulnerable).toBe(false)
    expect(findPqcAlgorithmRisk('ML-DSA-65')?.quantumVulnerable).toBe(false)
  })

  it('returns null for an unrecognized label', () => {
    expect(findPqcAlgorithmRisk('totally-unknown-cipher')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(findPqcAlgorithmRisk('')).toBeNull()
  })
})
