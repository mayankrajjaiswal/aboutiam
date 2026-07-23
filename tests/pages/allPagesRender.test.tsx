import { describe, it, expect } from 'vitest'
import type { ComponentType } from 'react'
import { renderWithProviders } from '../../src/test/renderWithProviders'

// Data-driven off the page files themselves (not routeMeta.ts / App.tsx) via
// Vite's import.meta.glob, so a brand-new page gets crash-coverage the moment
// its file exists under src/pages/ — no test to remember to write, no
// registry to keep in sync with this file. This is the single highest-leverage
// suite in the test plan: it is the first thing in the repo that actually
// mounts every page component (scripts/postbuild-ssg.mjs only string-templates
// <title>/<meta> tags, it never renders React).
const pageModules = import.meta.glob<{ default: ComponentType }>('../../src/pages/**/*.tsx', {
  eager: false,
})

const pagePaths = Object.keys(pageModules).sort()

describe('every page under src/pages renders without throwing', () => {
  it('found at least one page module to test (glob pattern still matches)', () => {
    expect(pagePaths.length).toBeGreaterThan(0)
  })

  it.each(pagePaths)('%s', async (path) => {
    const mod = await pageModules[path]()
    const Page = mod.default
    expect(typeof Page).toBe('function')
    expect(() => renderWithProviders(<Page />)).not.toThrow()
  })
})
