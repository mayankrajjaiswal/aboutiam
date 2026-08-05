import { describe, it, expect } from 'vitest'
import { getBreadcrumbTrail } from './breadcrumbs'

describe('getBreadcrumbTrail', () => {
  it('returns an empty trail for the homepage', () => {
    expect(getBreadcrumbTrail('/', 'Home')).toEqual([])
  })

  it('returns an empty trail for a single top-level segment', () => {
    expect(getBreadcrumbTrail('/learn/', 'IAM Academy')).toEqual([])
  })

  it('builds a Home + leaf trail for a two-segment path, using the page title for the leaf', () => {
    const trail = getBreadcrumbTrail('/tools/jwt-decoder/', 'JWT Decoder — Inspect & Verify Tokens Online')
    expect(trail).toEqual([
      { name: 'Home', path: '/' },
      { name: 'Security Tools', path: '/tools/' },
      { name: 'JWT Decoder', path: '/tools/jwt-decoder/' },
    ])
  })

  it('special-cases the tools/playground/explore hub segment names', () => {
    expect(getBreadcrumbTrail('/playground/jwt/', 'JWT Playground')[1]).toEqual({ name: 'Playgrounds', path: '/playground/' })
    expect(getBreadcrumbTrail('/explore/matchmaker/', 'Auth Matchmaker')[1]).toEqual({ name: 'Explore', path: '/explore/' })
  })

  it('title-cases a non-special intermediate segment', () => {
    const trail = getBreadcrumbTrail('/vendor/okta/profile/', 'Okta Profile')
    expect(trail[1]).toEqual({ name: 'Vendor', path: '/vendor/' })
  })

  it('strips a " — " or " | " suffix off the leaf title', () => {
    expect(getBreadcrumbTrail('/tools/jwt-decoder/', 'JWT Decoder — Inspect Tokens').at(-1)?.name).toBe('JWT Decoder')
    expect(getBreadcrumbTrail('/tools/jwt-decoder/', 'JWT Decoder | AboutIAM').at(-1)?.name).toBe('JWT Decoder')
  })

  it('handles a pathname with no trailing slash the same as one with it', () => {
    expect(getBreadcrumbTrail('/tools/jwt-decoder', 'JWT Decoder')).toEqual(
      getBreadcrumbTrail('/tools/jwt-decoder/', 'JWT Decoder')
    )
  })
})
