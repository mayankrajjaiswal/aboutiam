import { describe, it, expect } from 'vitest'
import { buildLlmsTxt, sectionFor } from './generate-llms'
import { ROUTE_META } from '../src/routeMeta'

describe('llms.txt Generator', () => {
  it('should include every ROUTE_META route exactly once', () => {
    const { llmsTxt, totalCount } = buildLlmsTxt(ROUTE_META)
    expect(totalCount).toBe(ROUTE_META.length)
    for (const route of ROUTE_META) {
      expect(llmsTxt).toContain(`](https://www.aboutiam.com${route.path === '/' ? '' : route.path}/)`)
    }
  })

  it('should bucket routes into deterministic sections', () => {
    expect(sectionFor('/')).toBe('Core Platform')
    expect(sectionFor('/tools/jwt-decoder')).toBe('Security Tools')
    expect(sectionFor('/playground/oauth')).toBe('Playgrounds')
    expect(sectionFor('/explore/matchmaker')).toBe('Playgrounds')
    expect(sectionFor('/contributors')).toBe('Optional')
    expect(sectionFor('/terms')).toBe('Optional')
    expect(sectionFor('/standards')).toBe('Advanced Ecosystem & Governance')
  })

  it('should emit markdown section headers in a fixed order', () => {
    const { llmsTxt } = buildLlmsTxt(ROUTE_META)
    const coreIdx = llmsTxt.indexOf('## Core Platform')
    const playgroundIdx = llmsTxt.indexOf('## Playgrounds')
    const toolsIdx = llmsTxt.indexOf('## Security Tools')
    const advancedIdx = llmsTxt.indexOf('## Advanced Ecosystem & Governance')
    const optionalIdx = llmsTxt.indexOf('## Optional')

    expect(coreIdx).toBeGreaterThan(-1)
    expect(coreIdx).toBeLessThan(playgroundIdx)
    expect(playgroundIdx).toBeLessThan(toolsIdx)
    expect(toolsIdx).toBeLessThan(advancedIdx)
    expect(advancedIdx).toBeLessThan(optionalIdx)
  })

  it('should include the footer contributing/license links', () => {
    const { llmsTxt } = buildLlmsTxt(ROUTE_META)
    expect(llmsTxt).toContain('Contributing Guide')
    expect(llmsTxt).toContain('License (MIT)')
  })
})
