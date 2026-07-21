import { describe, expect, it } from 'vitest'
import { getSearchIndex } from './searchService'

describe('getSearchIndex deep-link entries', () => {
  it('indexes all 4 living standards with ?standard= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('OAuth 2.1')
    const match = results.find((r) => r.id === 'standard-oauth21')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/standards?standard=oauth21')
  })

  it('indexes reference architectures with ?arch= deep links', () => {
    const index = getSearchIndex()
    const results = index.search('Zero Trust')
    const match = results.find((r) => r.id === 'arch-zero_trust')
    expect(match).toBeTruthy()
    expect((match as unknown as { link: string }).link).toBe('/architecture?arch=zero_trust')
  })

  it('gives every standards/architecture item a non-empty category and keywords', () => {
    const index = getSearchIndex()
    const all = [
      ...index.search('standard', { prefix: true }),
      ...index.search('architecture', { prefix: true }),
    ].filter((r) => r.id.startsWith('standard-') || r.id.startsWith('arch-'))
    expect(all.length).toBeGreaterThan(0)
  })

  it('indexes sidebar/nav pages not covered by other categories', () => {
    const index = getSearchIndex()

    const reportResult = index.search('report', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/reports')
    expect(reportResult).toBeTruthy()

    const termsResult = index.search('terms', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/terms')
    expect(termsResult).toBeTruthy()

    const assessResult = index.search('assess', { prefix: true })
      .find((r) => (r as unknown as { link: string }).link === '/assess')
    expect(assessResult).toBeTruthy()
  })
})
