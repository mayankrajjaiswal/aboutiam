import { describe, expect, it } from 'vitest'
import { buildIssueUrl, feedbackStorageKey } from './contentFeedback'

describe('buildIssueUrl', () => {
  it('targets the correct GitHub repo issues endpoint', () => {
    const url = buildIssueUrl('flag', 'term-oidc', 'OIDC')
    expect(url.startsWith('https://github.com/mayankrajjaiswal/aboutiam/issues/new?')).toBe(true)
  })

  it('encodes a flag report with the flag label and the item id in the body', () => {
    const url = buildIssueUrl('flag', 'term-oidc', 'OIDC')
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('title')).toBe('Content flag: "OIDC"')
    expect(params.get('labels')).toBe('content-feedback,flag')
    expect(params.get('body')).toContain('term-oidc')
  })

  it('encodes a helpful endorsement with the endorsement label', () => {
    const url = buildIssueUrl('helpful', 'breach-lastpass', 'LastPass Offline Vault Cracking')
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('title')).toBe('Content endorsement: "LastPass Offline Vault Cracking"')
    expect(params.get('labels')).toBe('content-feedback,endorsement')
  })

  it('safely encodes special characters in the title', () => {
    const url = buildIssueUrl('flag', 'x', 'A "quoted" & tricky <title>')
    expect(() => new URL(url)).not.toThrow()
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('title')).toContain('A "quoted" & tricky <title>')
  })
})

describe('feedbackStorageKey', () => {
  it('namespaces the localStorage key per content id', () => {
    expect(feedbackStorageKey('term-oidc')).toBe('aboutiam-feedback-term-oidc')
  })
})
