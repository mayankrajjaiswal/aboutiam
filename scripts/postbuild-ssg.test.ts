import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META } from '../src/routeMeta'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Route {
  path: string
  title: string
  description: string
}

/**
 * postbuild-ssg.mjs keeps its own plain-JS copy of ROUTE_META (see its header
 * comment) because it can't cheaply import TypeScript at build time. This
 * test extracts that copy and diffs it against the real ROUTE_META so the two
 * can never silently drift apart again — this is the exact class of bug
 * caught by hand three separate times in one session (stale sitemap, stale
 * llms.txt, a missing tool route in this very file).
 */
function extractRoutesFromSsgScript(): Route[] {
  const source = readFileSync(join(__dirname, 'postbuild-ssg.mjs'), 'utf8')
  const match = source.match(/const ROUTES = (\[[\s\S]*?\n\])/)
  if (!match) throw new Error('Could not find ROUTES array in postbuild-ssg.mjs')
  // eslint-disable-next-line no-new-func -- trusted, repo-local source file, not external input
  return new Function(`return ${match[1]}`)()
}

describe('postbuild-ssg.mjs ROUTES sync with src/routeMeta.ts', () => {
  const ssgRoutes = extractRoutesFromSsgScript()
  const ssgByPath = new Map(ssgRoutes.map((r) => [r.path, r]))
  const routeMetaNonRoot = ROUTE_META.filter((r) => r.path !== '/')

  it('should have an SSG entry for every non-root ROUTE_META route with an identical title/description', () => {
    const mismatches: string[] = []
    for (const route of routeMetaNonRoot) {
      const ssgRoute = ssgByPath.get(route.path)
      if (!ssgRoute) {
        mismatches.push(`${route.path}: missing from postbuild-ssg.mjs ROUTES`)
        continue
      }
      if (ssgRoute.title !== route.title) {
        mismatches.push(`${route.path}: title mismatch ("${ssgRoute.title}" vs "${route.title}")`)
      }
      if (ssgRoute.description !== route.description) {
        mismatches.push(`${route.path}: description mismatch`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it('should not have any SSG routes absent from ROUTE_META', () => {
    const routeMetaPaths = new Set(routeMetaNonRoot.map((r) => r.path))
    const extras = ssgRoutes.filter((r) => !routeMetaPaths.has(r.path)).map((r) => r.path)
    expect(extras).toEqual([])
  })
})
