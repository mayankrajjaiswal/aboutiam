#!/usr/bin/env node
// Wraps `npm audit --json` with a small, explicit allow-list — vanilla
// `npm audit` has no per-advisory ignore flag, so an upstream-unpatched
// advisory that doesn't apply to how this app uses the package would
// otherwise block CI on every PR indefinitely (see GEMINI.md's Security
// Hardening section). Only add an entry here with a real justification and a
// review-by date; this is meant to unblock a specific known non-issue, not
// to become a general-purpose audit bypass.
import { execSync } from 'node:child_process'

const ALLOWLIST = [
  {
    ghsaId: 'GHSA-qwww-vcr4-c8h2',
    package: 'react-router',
    reason:
      'React Router RSC-mode CSRF bypass — this app is a client-side SPA using BrowserRouter/Routes/Route only, never the unstable RSC APIs the advisory names as the attack surface. No non-breaking fix exists yet (first patched version 8.3.0, which react-router-dom has not published as of this writing).',
    reviewBy: '2026-10-01',
  },
]

const auditLevel = 'moderate'
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }

let report
try {
  const raw = execSync('npm audit --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  report = JSON.parse(raw)
} catch (err) {
  // npm audit exits non-zero whenever it finds anything — the JSON is still
  // on stdout in that case, so parse it instead of treating this as a hard failure.
  if (err.stdout) {
    report = JSON.parse(err.stdout)
  } else {
    console.error('npm audit did not return parseable JSON:', err.message)
    process.exit(1)
  }
}

const today = new Date().toISOString().slice(0, 10)
for (const entry of ALLOWLIST) {
  if (entry.reviewBy < today) {
    console.error(`Audit allow-list entry for ${entry.ghsaId} expired on ${entry.reviewBy} — re-check whether it's actually fixed now and update or remove this entry.`)
    process.exit(1)
  }
}

const allowedGhsaIds = new Set(ALLOWLIST.map((e) => e.ghsaId))
const vulnerabilitiesByName = report.vulnerabilities ?? {}
const vulnerabilities = Object.values(vulnerabilitiesByName)

// A package's vulnerability is "allowed" if every advisory it directly cites
// is on the allow-list, OR — for a transitive vulnerability, whose `via`
// array is just the names of the packages that caused it — every one of
// those upstream packages is itself (recursively) allowed.
function isAllowed(vuln, seen = new Set()) {
  if (seen.has(vuln.name)) return true // cycle guard
  seen.add(vuln.name)
  return vuln.via.every((v) => {
    if (typeof v === 'object' && v.url) {
      const ghsaId = v.url.split('/').pop()
      return allowedGhsaIds.has(ghsaId)
    }
    const upstream = vulnerabilitiesByName[v]
    return upstream ? isAllowed(upstream, seen) : false
  })
}

const unallowed = vulnerabilities.filter(
  (vuln) => severityRank[vuln.severity] >= severityRank[auditLevel] && !isAllowed(vuln)
)

if (unallowed.length > 0) {
  console.error(`${unallowed.length} vulnerability(ies) at or above "${auditLevel}" are not covered by the allow-list:`)
  for (const v of unallowed) {
    console.error(`  - ${v.name} (${v.severity}): ${v.via.map((x) => (typeof x === 'object' ? x.title : x)).join(', ')}`)
  }
  console.error('\nRun `npm audit` for full details. Fix it, or add a justified, time-boxed entry to scripts/audit-check.mjs\'s ALLOWLIST.')
  process.exit(1)
}

const allowedCount = vulnerabilities.length
if (allowedCount > 0) {
  console.log(`npm audit: ${allowedCount} vulnerability(ies) found, all covered by the documented allow-list in scripts/audit-check.mjs:`)
  for (const entry of ALLOWLIST) {
    console.log(`  - ${entry.ghsaId} (${entry.package}): ${entry.reason} [review by ${entry.reviewBy}]`)
  }
} else {
  console.log('npm audit: no vulnerabilities found.')
}
