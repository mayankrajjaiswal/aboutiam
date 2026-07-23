import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROUTE_META } from '../../src/routeMeta'

// GEMINI.md §4D: adding a page touches three files (App.tsx, routeMeta.ts,
// postbuild-ssg.mjs) precisely because none of them import each other — this
// is a plain-text/regex check (not a live import of App.tsx, which would drag
// in every lazy-loaded page) that all three stay in sync, generalizing the
// exact "index every entry" pattern searchService.test.ts already applies to
// BREACHES/STANDARDS/etc., but at the route-registry level.
const repoRoot = join(__dirname, '..', '..')

function extractAppRoutePaths(): string[] {
  const source = readFileSync(join(repoRoot, 'src', 'App.tsx'), 'utf-8')
  const matches = [...source.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1])
  return matches.filter((p) => p !== '*')
}

function extractSsgRoutePaths(): string[] {
  const source = readFileSync(join(repoRoot, 'scripts', 'postbuild-ssg.mjs'), 'utf-8')
  return [...source.matchAll(/\{\s*path:\s*'([^']+)'/g)].map((m) => m[1])
}

describe('route registries stay in sync (App.tsx, routeMeta.ts, postbuild-ssg.mjs)', () => {
  const appRoutes = extractAppRoutePaths()
  const routeMetaPaths = ROUTE_META.map((r) => r.path)
  const ssgRoutes = extractSsgRoutePaths()

  it('found a non-trivial number of routes in each registry (regex still matches)', () => {
    expect(appRoutes.length).toBeGreaterThan(50)
    expect(routeMetaPaths.length).toBeGreaterThan(50)
    expect(ssgRoutes.length).toBeGreaterThan(50)
  })

  it('every App.tsx route (except "/") has a routeMeta.ts entry', () => {
    const missing = appRoutes.filter((p) => p !== '/' && !routeMetaPaths.includes(p))
    expect(missing).toEqual([])
  })

  it('every routeMeta.ts entry has a matching App.tsx route', () => {
    const missing = routeMetaPaths.filter((p) => !appRoutes.includes(p))
    expect(missing).toEqual([])
  })

  it('every routeMeta.ts entry (except "/") has a postbuild-ssg.mjs entry, so deep links get a real pre-rendered index.html', () => {
    const missing = routeMetaPaths.filter((p) => p !== '/' && !ssgRoutes.includes(p))
    expect(missing).toEqual([])
  })

  it('has no duplicate paths within routeMeta.ts', () => {
    const duplicates = routeMetaPaths.filter((p, i) => routeMetaPaths.indexOf(p) !== i)
    expect(duplicates).toEqual([])
  })
})
