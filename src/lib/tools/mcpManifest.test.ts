import { describe, expect, it } from 'vitest'
import { parseMcpManifest, analyzeMcpManifest, buildManifestReportJson } from './mcpManifest'

const SAFE_MANIFEST = JSON.stringify({
  tools: [
    {
      name: 'get_order_status',
      description: 'Look up the current status of a specific order by its order ID.',
      parameters: { properties: { orderId: { type: 'string', pattern: '^[A-Z0-9-]{6,20}$' } } },
      scopes: ['orders:read'],
      readOnly: true,
    },
  ],
})

const RISKY_MANIFEST = JSON.stringify({
  tools: [
    {
      name: 'delete_account',
      parameters: { properties: { accountId: { type: 'string' }, password: { type: 'string' } } },
    },
    {
      name: 'search_records',
      description: 'x',
      parameters: { properties: { resource: { type: 'string' }, filter: { type: 'string' } }, resource: '*' },
    },
  ],
})

describe('parseMcpManifest', () => {
  it('returns an empty array for empty or invalid JSON input', () => {
    expect(parseMcpManifest('')).toEqual([])
    expect(parseMcpManifest('not json')).toEqual([])
  })

  it('parses a manifest with a top-level tools array', () => {
    const tools = parseMcpManifest(SAFE_MANIFEST)
    expect(tools).toHaveLength(1)
    expect(tools[0].name).toBe('get_order_status')
    expect(tools[0].scopes).toEqual(['orders:read'])
  })

  it('parses a single tool-definition object without a tools wrapper', () => {
    const tools = parseMcpManifest(JSON.stringify({ name: 'solo_tool', description: 'A single tool with no wrapper array.' }))
    expect(tools).toHaveLength(1)
    expect(tools[0].name).toBe('solo_tool')
  })

  it('parses a bare array of tool definitions', () => {
    const tools = parseMcpManifest(JSON.stringify([{ name: 'tool_a' }, { name: 'tool_b' }]))
    expect(tools).toHaveLength(2)
  })
})

describe('analyzeMcpManifest', () => {
  it('produces zero findings for a well-scoped, well-described, read-only tool', () => {
    const report = analyzeMcpManifest(SAFE_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.toolCount).toBe(1)
    expect(report.findings).toHaveLength(0)
  })

  it('flags an undistinguished destructive operation as Critical', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    const destructiveFinding = report.findings.find((f) => f.toolName === 'delete_account' && f.category === 'Undistinguished Destructive Operation')
    expect(destructiveFinding).toBeDefined()
    expect(destructiveFinding?.severity).toBe('Critical')
  })

  it('flags a credential-accepting parameter as Critical', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    const credFinding = report.findings.find((f) => f.toolName === 'delete_account' && f.category === 'Credential-Accepting Parameter')
    expect(credFinding).toBeDefined()
    expect(credFinding?.severity).toBe('Critical')
  })

  it('flags missing scope declarations', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.findings.some((f) => f.category === 'Missing Scope Declaration')).toBe(true)
  })

  it('flags an unbounded string parameter', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.findings.some((f) => f.category === 'Unbounded Parameter')).toBe(true)
  })

  it('flags an ambiguous (too-short) description', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.findings.some((f) => f.toolName === 'search_records' && f.category === 'Ambiguous Description')).toBe(true)
  })

  it('flags an over-broad wildcard resource pattern', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.findings.some((f) => f.category === 'Over-Broad Resource Pattern')).toBe(true)
  })

  it('computes an accurate severity summary', () => {
    const report = analyzeMcpManifest(RISKY_MANIFEST, '2026-09-19T00:00:00.000Z')
    const totalFromSummary = Object.values(report.summary).reduce((a, b) => a + b, 0)
    expect(totalFromSummary).toBe(report.findings.length)
  })

  it('suggests a least-privilege scope per tool', () => {
    const report = analyzeMcpManifest(SAFE_MANIFEST, '2026-09-19T00:00:00.000Z')
    expect(report.suggestedScopes).toContain('get_order_status:read')
  })

  it('returns an empty report for empty input without throwing', () => {
    const report = analyzeMcpManifest('', '2026-09-19T00:00:00.000Z')
    expect(report.toolCount).toBe(0)
    expect(report.findings).toEqual([])
  })
})

describe('buildManifestReportJson', () => {
  it('produces valid, parseable JSON', () => {
    const report = analyzeMcpManifest(SAFE_MANIFEST, '2026-09-19T00:00:00.000Z')
    const json = buildManifestReportJson(report)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
