export type LibraryEcosystem = 'npm' | 'pypi' | 'rubygems' | 'other'

export type LibrarySeverity = 'Critical' | 'High' | 'Medium'

export interface AuthRiskyLibrary {
  packageName: string
  ecosystem: LibraryEcosystem
  /** A version strictly below this is flagged as affected by every id in `knownCveIds`. */
  patchedVersion: string
  knownCveIds: string[]
  severity: LibrarySeverity
  notes: string
}

/**
 * Curated, cross-referenced against `CVE_DATABASE` (src/data/researchData.ts, §4W) —
 * every id in `knownCveIds` must resolve to a real `CVE_DATABASE` entry, verified in
 * authRiskyLibraries.test.ts (same integrity guarantee as `controlsMapped` in bulletinsData.ts).
 */
export const AUTH_RISKY_LIBRARIES: AuthRiskyLibrary[] = [
  {
    packageName: 'jsonwebtoken',
    ecosystem: 'npm',
    patchedVersion: '9.0.0',
    knownCveIds: ['CVE-2022-23529', 'CVE-2015-9235'],
    severity: 'Critical',
    notes: 'The most widely-used Node.js JWT library. Historically vulnerable to both algorithm-confusion and alg:none signature bypass — always pin an explicit algorithms allowlist.'
  },
  {
    packageName: 'pyjwt',
    ecosystem: 'pypi',
    patchedVersion: '1.3.0',
    knownCveIds: ['CVE-2015-2951'],
    severity: 'Critical',
    notes: 'The standard Python JWT library. Pre-1.3.0 releases accepted alg:none tokens with no signature verification at all.'
  },
  {
    packageName: 'python-jose',
    ecosystem: 'pypi',
    patchedVersion: '1.4.0',
    knownCveIds: ['CVE-2016-7036'],
    severity: 'High',
    notes: 'A Python JOSE (JWT/JWS/JWE) implementation. Historically susceptible to RSA/HMAC key-confusion signature forgery when no algorithm allowlist is enforced.'
  },
  {
    packageName: 'node-samlify',
    ecosystem: 'npm',
    patchedVersion: '2.8.0',
    knownCveIds: ['CVE-2019-7644'],
    severity: 'Critical',
    notes: 'A Node.js SAML 2.0 SP/IdP library. Historically vulnerable to XML Signature Wrapping (SSW) — claims must be read from the exact node the signature\'s Reference URI points to.'
  }
]
