import { describe, it, expect } from 'vitest'
import { parseManifestInput, analyzeManifest, buildSbomJson } from './identitySbom'

const REAL_PACKAGE_JSON = `{
  "name": "demo-app",
  "version": "1.0.0",
  "dependencies": {
    "jsonwebtoken": "^8.5.1",
    "express": "^4.18.2",
    "pyjwt-lookalike": "1.0.0"
  },
  "devDependencies": {
    "node-samlify": "2.7.0"
  }
}`

describe('parseManifestInput', () => {
  it('parses a real package.json, merging dependencies and devDependencies', () => {
    const deps = parseManifestInput(REAL_PACKAGE_JSON)
    expect(deps).toEqual(
      expect.arrayContaining([
        { name: 'jsonwebtoken', versionRaw: '^8.5.1' },
        { name: 'express', versionRaw: '^4.18.2' },
        { name: 'node-samlify', versionRaw: '2.7.0' }
      ])
    )
    expect(deps.length).toBe(4)
  })

  it('falls back to a comma/newline-separated plain list for non-JSON input', () => {
    const deps = parseManifestInput('jsonwebtoken@8.5.1, pyjwt@1.2.0\npython-jose')
    expect(deps).toEqual([
      { name: 'jsonwebtoken', versionRaw: '8.5.1' },
      { name: 'pyjwt', versionRaw: '1.2.0' },
      { name: 'python-jose', versionRaw: '' }
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(parseManifestInput('')).toEqual([])
    expect(parseManifestInput('   ')).toEqual([])
  })
})

describe('analyzeManifest', () => {
  const NOW = '2026-01-01T00:00:00.000Z'

  it('flags an affected version of a known risky library', () => {
    const report = analyzeManifest('jsonwebtoken@8.5.1', NOW)
    expect(report.findings).toHaveLength(1)
    expect(report.findings[0].packageName).toBe('jsonwebtoken')
    expect(report.findings[0].isConfirmedAffected).toBe(true)
    expect(report.findings[0].severity).toBe('Critical')
    expect(report.findings[0].cveIds).toContain('CVE-2015-9235')
  })

  it('does not flag a patched version of a known risky library', () => {
    const report = analyzeManifest('jsonwebtoken@9.0.0', NOW)
    expect(report.findings).toHaveLength(0)
  })

  it('does not flag a version newer than the patched version', () => {
    const report = analyzeManifest('jsonwebtoken@9.5.2', NOW)
    expect(report.findings).toHaveLength(0)
  })

  it('silently skips unknown packages rather than false-flagging them', () => {
    const report = analyzeManifest('some-unrelated-package@1.0.0, express@4.18.2', NOW)
    expect(report.findings).toHaveLength(0)
  })

  it('correctly scopes version-range matching to only affected versions in a mixed manifest', () => {
    const report = analyzeManifest('jsonwebtoken@8.5.1, pyjwt@1.5.0, python-jose@1.3.0', NOW)
    const flaggedNames = report.findings.map((f) => f.packageName)
    expect(flaggedNames).toContain('jsonwebtoken') // 8.5.1 < 9.0.0 patched
    expect(flaggedNames).not.toContain('pyjwt') // 1.5.0 >= 1.3.0 patched
    expect(flaggedNames).toContain('python-jose') // 1.3.0 < 1.4.0 patched
  })

  it('reports Info severity (not skipped) when a matched package has an unparseable version', () => {
    const report = analyzeManifest('jsonwebtoken@latest', NOW)
    expect(report.findings).toHaveLength(1)
    expect(report.findings[0].severity).toBe('Info')
    expect(report.findings[0].isConfirmedAffected).toBe(false)
  })

  it('reports Info severity when no version is specified at all', () => {
    const report = analyzeManifest('jsonwebtoken', NOW)
    expect(report.findings).toHaveLength(1)
    expect(report.findings[0].severity).toBe('Info')
  })

  it('tallies the summary counts correctly across severities', () => {
    const report = analyzeManifest('jsonwebtoken@8.5.1, node-samlify@2.0.0, jsonwebtoken@latest', NOW)
    expect(report.summary.Critical).toBe(2)
    expect(report.summary.Info).toBe(1)
  })

  it('handles an empty manifest with zero findings', () => {
    const report = analyzeManifest('', NOW)
    expect(report.findings).toEqual([])
    expect(report.summary).toEqual({ Critical: 0, High: 0, Medium: 0, Info: 0 })
  })

  it('stamps the report with the provided generatedAt timestamp', () => {
    const report = analyzeManifest('jsonwebtoken@8.5.1', NOW)
    expect(report.generatedAt).toBe(NOW)
  })
})

describe('buildSbomJson', () => {
  it('produces valid, pretty-printed JSON round-tripping the report', () => {
    const report = analyzeManifest('jsonwebtoken@8.5.1', '2026-01-01T00:00:00.000Z')
    const json = buildSbomJson(report)
    expect(JSON.parse(json)).toEqual(report)
    expect(json).toContain('\n')
  })
})
