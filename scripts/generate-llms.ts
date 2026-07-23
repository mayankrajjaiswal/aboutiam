import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META } from '../src/routeMeta.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SITE_URL = 'https://www.aboutiam.com'

const HEADER = `# AboutIAM

> AboutIAM is an open-source, 100% client-side, browser-native academy and simulation workbench for Identity and Access Management (IAM). It teaches OAuth 2.0/OIDC, SAML, JWT, FIDO2/WebAuthn, ABAC/RBAC, LDAP, Zero Trust, ZKPs, and SPIFFE/SPIRE through hands-on, interactive playgrounds rather than static documentation, with progressive detail for both beginners and expert architects. Every cryptographic operation and policy evaluation runs natively in the browser — there is no backend, no telemetry, and no server-side data collection.

Runs entirely client-side (React 19, TypeScript, Vite, Zustand). Source: https://github.com/mayankrajjaiswal/aboutiam (MIT licensed). Live site: ${SITE_URL}/.
`

const FOOTER_LINKS = [
  { title: 'Contributing Guide', url: 'https://github.com/mayankrajjaiswal/aboutiam/blob/main/CONTRIBUTING.md', description: 'How to add modules, playgrounds, or fix bugs.' },
  { title: 'License (MIT)', url: 'https://github.com/mayankrajjaiswal/aboutiam/blob/main/LICENSE', description: '' },
]

type Section = 'Core Platform' | 'Playgrounds' | 'Security Tools' | 'Advanced Ecosystem & Governance' | 'Optional'

const SECTION_ORDER: Section[] = ['Core Platform', 'Playgrounds', 'Security Tools', 'Advanced Ecosystem & Governance', 'Optional']

/**
 * Buckets a route into an llms.txt section by path-prefix heuristic — kept
 * deliberately simple (no hand-maintained per-route section map) so this
 * file can never drift from src/routeMeta.ts the way the old hand-written
 * llms.txt did (stale counts, missing routes).
 */
export function sectionFor(path: string): Section {
  if (path === '/') return 'Core Platform'
  if (path === '/contributors' || path === '/terms') return 'Optional'
  if (path.startsWith('/tools')) return 'Security Tools'
  if (path.startsWith('/playground') || path === '/explore/matchmaker') return 'Playgrounds'
  return 'Advanced Ecosystem & Governance'
}

export function buildLlmsTxt(routes: typeof ROUTE_META): { llmsTxt: string; totalCount: number } {
  const bySection = new Map<Section, typeof ROUTE_META>()
  for (const section of SECTION_ORDER) bySection.set(section, [])

  for (const route of routes) {
    bySection.get(sectionFor(route.path))!.push(route)
  }

  const sections = SECTION_ORDER.map((section) => {
    const routes = bySection.get(section)!
    if (routes.length === 0) return ''
    const lines = routes.map((r) => {
      const normalizedPath = r.path === '/' ? '' : r.path.replace(/\/+$/, '')
      const url = `${SITE_URL}${normalizedPath}/`
      return `- [${r.title}](${url}): ${r.description}`
    })
    return `## ${section}\n\n${lines.join('\n')}\n`
  }).filter(Boolean)

  const optionalExtra = FOOTER_LINKS.map((l) => `- [${l.title}](${l.url})${l.description ? `: ${l.description}` : ''}`).join('\n')

  const llmsTxt = `${HEADER}\n${sections.join('\n')}\n${optionalExtra}\n`

  return { llmsTxt, totalCount: routes.length }
}

// Self-execute if run directly via node command line
if (process.argv[1] && process.argv[1].endsWith('generate-llms.ts')) {
  try {
    const { llmsTxt, totalCount } = buildLlmsTxt(ROUTE_META)

    const publicPath = join(__dirname, '../public/llms.txt')
    writeFileSync(publicPath, llmsTxt, 'utf8')
    console.log(`✓ llms.txt generated successfully at: public/llms.txt (${totalCount} routes)`)

    const distDir = join(__dirname, '../dist')
    if (existsSync(distDir)) {
      const distPath = join(distDir, 'llms.txt')
      writeFileSync(distPath, llmsTxt, 'utf8')
      console.log(`✓ llms.txt copied to build output: dist/llms.txt`)
    }
  } catch (error) {
    console.error('💥 Failed to generate llms.txt:', error)
    process.exit(1)
  }
}
