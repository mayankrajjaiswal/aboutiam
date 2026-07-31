import { describe, it, expect } from 'vitest'
import { buildDiscussionUrl, buildLeaderboardBrowseUrl } from './shareScoreUrl'

describe('buildDiscussionUrl', () => {
  it('points at a github.com/discussions/new URL for the correct repo', () => {
    const url = buildDiscussionUrl({ moduleName: 'GRC Maturity Wizard', score: '84%', date: '2026-07-31' })
    expect(url).toMatch(/^https:\/\/github\.com\/mayankrajjaiswal\/aboutiam\/discussions\/new\?/)
  })

  it('sets the leaderboard discussion category', () => {
    const url = buildDiscussionUrl({ moduleName: 'GRC Maturity Wizard', score: '84%', date: '2026-07-31' })
    const params = new URL(url).searchParams
    expect(params.get('category')).toBe('leaderboard')
  })

  it('correctly encodes the module name, score, and date into the pre-filled title and body', () => {
    const url = buildDiscussionUrl({ moduleName: 'Identity CTF Arena', score: '300 / 300 PTS', date: '2026-07-31' })
    const params = new URL(url).searchParams
    const title = params.get('title')!
    const body = params.get('body')!

    expect(title).toContain('Identity CTF Arena')
    expect(title).toContain('300 / 300 PTS')
    expect(body).toContain('Identity CTF Arena')
    expect(body).toContain('300 / 300 PTS')
    expect(body).toContain('2026-07-31')
  })

  it('round-trips special characters (ampersands, quotes) safely through URL encoding', () => {
    const url = buildDiscussionUrl({ moduleName: 'SC-300 & Beyond', score: '5/5 "Perfect"', date: '2026-07-31' })
    const params = new URL(url).searchParams
    expect(params.get('title')).toContain('SC-300 & Beyond')
    expect(params.get('body')).toContain('5/5 "Perfect"')
  })
})

describe('buildLeaderboardBrowseUrl', () => {
  it('points at the leaderboard discussions category on GitHub, not an AboutIAM-hosted page', () => {
    const url = buildLeaderboardBrowseUrl()
    expect(url).toBe('https://github.com/mayankrajjaiswal/aboutiam/discussions/categories/leaderboard')
  })
})
