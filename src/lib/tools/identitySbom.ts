import { AUTH_RISKY_LIBRARIES, type LibraryEcosystem } from '../../data/authRiskyLibraries'

export interface ParsedDependency {
  name: string
  versionRaw: string
}

export type SbomSeverity = 'Critical' | 'High' | 'Medium' | 'Info'

export interface SbomFinding {
  packageName: string
  ecosystem: LibraryEcosystem
  installedVersionRaw: string
  patchedVersion: string
  isConfirmedAffected: boolean
  severity: SbomSeverity
  cveIds: string[]
  notes: string
}

export interface SbomReport {
  generatedAt: string
  findings: SbomFinding[]
  summary: Record<SbomSeverity, number>
}

/**
 * Format-tolerant manifest parser: tries `package.json`-style JSON first
 * (`dependencies`/`devDependencies`), then falls back to a plain
 * comma/newline-separated "name" or "name@version" list for non-npm
 * ecosystems (requirements.txt-style, Gemfile-style, etc.).
 */
export function parseManifestInput(input: string): ParsedDependency[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') {
      const deps: ParsedDependency[] = []
      for (const section of ['dependencies', 'devDependencies']) {
        const sectionDeps = (parsed as Record<string, unknown>)[section]
        if (sectionDeps && typeof sectionDeps === 'object') {
          for (const [name, version] of Object.entries(sectionDeps as Record<string, unknown>)) {
            deps.push({ name, versionRaw: String(version) })
          }
        }
      }
      if (deps.length > 0) return deps
    }
  } catch {
    // Not JSON — fall through to the plain-list parser below.
  }

  return trimmed
    .split(/[\n,]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const at = token.lastIndexOf('@')
      if (at > 0) {
        return { name: token.slice(0, at).trim(), versionRaw: token.slice(at + 1).trim() }
      }
      return { name: token, versionRaw: '' }
    })
}

/** Strips range/prefix characters (^, ~, >=, v, ==) and parses a bare "x.y.z" tuple. */
function parseVersionTuple(raw: string): [number, number, number] | null {
  const cleaned = raw.trim().replace(/^[^\d]*/, '')
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (!match) return null
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)]
}

function compareVersionTuples(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
  }
  return 0
}

/**
 * Matches parsed dependencies against the curated auth-risky-library table.
 * Packages not in the table are silently skipped (never false-flagged).
 * A package that IS in the table but whose version can't be parsed is
 * reported at Info severity rather than skipped, since it may still be affected.
 */
export function analyzeManifest(input: string, generatedAt: string): SbomReport {
  const dependencies = parseManifestInput(input)
  const findings: SbomFinding[] = []

  for (const dep of dependencies) {
    const library = AUTH_RISKY_LIBRARIES.find((l) => l.packageName.toLowerCase() === dep.name.toLowerCase())
    if (!library) continue

    const installed = parseVersionTuple(dep.versionRaw)
    if (installed === null) {
      findings.push({
        packageName: library.packageName,
        ecosystem: library.ecosystem,
        installedVersionRaw: dep.versionRaw,
        patchedVersion: library.patchedVersion,
        isConfirmedAffected: false,
        severity: 'Info',
        cveIds: library.knownCveIds,
        notes: `Could not determine the installed version from "${dep.versionRaw || '(none specified)'}" — manually verify against the patched version (${library.patchedVersion}).`
      })
      continue
    }

    const patched = parseVersionTuple(library.patchedVersion)!
    const isConfirmedAffected = compareVersionTuples(installed, patched) < 0
    if (!isConfirmedAffected) continue

    findings.push({
      packageName: library.packageName,
      ecosystem: library.ecosystem,
      installedVersionRaw: dep.versionRaw,
      patchedVersion: library.patchedVersion,
      isConfirmedAffected: true,
      severity: library.severity,
      cveIds: library.knownCveIds,
      notes: library.notes
    })
  }

  const summary: Record<SbomSeverity, number> = { Critical: 0, High: 0, Medium: 0, Info: 0 }
  for (const finding of findings) summary[finding.severity]++

  return { generatedAt, findings, summary }
}

export function buildSbomJson(report: SbomReport): string {
  return JSON.stringify(report, null, 2)
}
