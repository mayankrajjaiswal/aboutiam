import { describe, it, expect } from 'vitest'
import { getRouteMeta } from './routeMeta'

describe('getRouteMeta', () => {
  it('resolves the root path exactly', () => {
    expect(getRouteMeta('/').path).toBe('/')
  })

  it('resolves a real runtime pathname (with trailing slash) to its exact route', () => {
    expect(getRouteMeta('/playground/xacml/').path).toBe('/playground/xacml')
    expect(getRouteMeta('/tools/jwt-decoder/').path).toBe('/tools/jwt-decoder')
  })

  it('does not let a shorter ancestor route shadow a longer, more specific one', () => {
    // Regression: '/playground' appears earlier in ROUTE_META than
    // '/playground/xacml', and '/tools' earlier than '/tools/jwt-decoder' —
    // array-order .find() previously matched the wrong (shorter) entry.
    expect(getRouteMeta('/playground/xacml/').title).not.toBe(getRouteMeta('/playground/').title)
    expect(getRouteMeta('/tools/jwt-decoder/').title).not.toBe(getRouteMeta('/tools/').title)
  })

  it('falls back to the longest matching ancestor for an unlisted sub-path', () => {
    expect(getRouteMeta('/playground/some-future-lab/').path).toBe('/playground')
  })

  it('falls back to the default meta for a wholly unknown path', () => {
    expect(getRouteMeta('/this-route-does-not-exist/').title).toBe('AboutIAM Secure Workspace')
  })
})
