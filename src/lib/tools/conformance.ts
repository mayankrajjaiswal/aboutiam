// Structural conformance checklists for OIDC Discovery documents and SAML 2.0
// metadata — distinct from OidcDiscoveryAuditor.tsx (decodes/pretty-prints) and
// SamlMetadataBuilder.tsx (compiles new metadata): this validates an existing
// document against required-field/structural rules and reports pass/fail per rule.
// SAML checks use lightweight regex matching rather than DOMParser, matching the
// rest of lib/tools/ (see saml.ts) so this module stays unit-testable in Node
// without jsdom.
export interface ConformanceCheckResult {
  id: string
  label: string
  passed: boolean
  detail: string
}

export type ConformanceDocumentType = 'oidc-discovery' | 'saml-metadata' | 'unknown'

export interface ConformanceReport {
  documentType: ConformanceDocumentType
  results: ConformanceCheckResult[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function detectDocumentType(input: string): ConformanceDocumentType {
  const trimmed = input.trim()
  if (trimmed.startsWith('{')) return 'oidc-discovery'
  if (trimmed.startsWith('<')) return 'saml-metadata'
  return 'unknown'
}

export function checkOidcDiscovery(input: string): ConformanceCheckResult[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return [{ id: 'valid-json', label: 'Valid JSON', passed: false, detail: 'Input is not valid JSON.' }]
  }

  if (!isPlainObject(parsed)) {
    return [{ id: 'valid-json', label: 'Valid JSON Object', passed: false, detail: 'Top-level value must be a JSON object.' }]
  }

  const doc = parsed
  const results: ConformanceCheckResult[] = [
    { id: 'valid-json', label: 'Valid JSON Object', passed: true, detail: 'Parsed successfully.' },
  ]

  const requiredStringFields = [
    { field: 'issuer', ref: 'OIDC Discovery Core 1.0 §3' },
    { field: 'authorization_endpoint', ref: 'OIDC Discovery Core 1.0 §3' },
    { field: 'token_endpoint', ref: 'OIDC Discovery Core 1.0 §3' },
    { field: 'jwks_uri', ref: 'OIDC Discovery Core 1.0 §3' },
  ]
  for (const { field, ref } of requiredStringFields) {
    const value = doc[field]
    const passed = typeof value === 'string' && value.length > 0
    results.push({
      id: `field-${field}`,
      label: `Has "${field}"`,
      passed,
      detail: passed ? `${field} = ${value as string}` : `Missing or empty required field "${field}" (${ref}).`,
    })
  }

  const requiredArrayFields = ['response_types_supported', 'subject_types_supported', 'id_token_signing_alg_values_supported']
  for (const field of requiredArrayFields) {
    const value = doc[field]
    const passed = Array.isArray(value) && value.length > 0
    results.push({
      id: `field-${field}`,
      label: `Has "${field}"`,
      passed,
      detail: passed ? `${(value as unknown[]).length} value(s) listed.` : `Missing or empty required array field "${field}".`,
    })
  }

  if (typeof doc.issuer === 'string') {
    const isHttps = doc.issuer.startsWith('https://')
    results.push({
      id: 'issuer-https',
      label: 'Issuer uses HTTPS',
      passed: isHttps,
      detail: isHttps ? 'issuer uses https://.' : 'issuer should use https:// — plaintext issuers cannot be trusted for federation.',
    })
  }

  const algs = doc.id_token_signing_alg_values_supported
  if (Array.isArray(algs)) {
    const hasNone = algs.includes('none')
    results.push({
      id: 'no-none-alg',
      label: 'Does not advertise "none" algorithm',
      passed: !hasNone,
      detail: hasNone
        ? 'id_token_signing_alg_values_supported includes "none" — advertising this for ID Tokens is a known algorithm-confusion risk.'
        : 'No "none" algorithm advertised for ID Token signing.',
    })
  }

  return results
}

function countMatches(xml: string, tagName: string): number {
  const re = new RegExp(`<(?:\\w+:)?${tagName}\\b`, 'gi')
  return xml.match(re)?.length ?? 0
}

export function checkSamlMetadata(input: string): ConformanceCheckResult[] {
  const trimmed = input.trim()
  const looksLikeXml = /^(<\?xml[^>]*\?>\s*)?<[a-zA-Z][\w-]*(:[\w-]+)?\b[^>]*>[\s\S]*<\/[\w:-]+>\s*$/.test(trimmed)
  if (!looksLikeXml) {
    return [{ id: 'valid-xml', label: 'Valid XML', passed: false, detail: 'Input does not look like well-formed XML (expected a single root element with a matching closing tag).' }]
  }

  const results: ConformanceCheckResult[] = [
    { id: 'valid-xml', label: 'Valid XML', passed: true, detail: 'Looks like well-formed XML.' },
  ]

  const withoutProlog = trimmed.replace(/^<\?xml[^>]*\?>\s*/, '')
  const rootTag = withoutProlog.match(/^<(?:\w+:)?([A-Za-z][\w-]*)/)?.[1]
  const isEntityDescriptor = rootTag === 'EntityDescriptor'
  results.push({
    id: 'root-entity-descriptor',
    label: 'Root is <EntityDescriptor>',
    passed: isEntityDescriptor,
    detail: isEntityDescriptor
      ? 'Root element is <EntityDescriptor>.'
      : `Root element is <${rootTag ?? 'unknown'}>, expected <EntityDescriptor> (SAML 2.0 Metadata §2.3.1).`,
  })

  const entityId = trimmed.match(/<(?:\w+:)?EntityDescriptor\b[^>]*\sentityID="([^"]+)"/)?.[1]
  results.push({
    id: 'entity-id',
    label: 'Has entityID attribute',
    passed: !!entityId,
    detail: entityId ? `entityID = ${entityId}` : 'Missing required entityID attribute on <EntityDescriptor>.',
  })

  const idpCount = countMatches(trimmed, 'IDPSSODescriptor')
  const spCount = countMatches(trimmed, 'SPSSODescriptor')
  const hasRoleDescriptor = idpCount > 0 || spCount > 0
  results.push({
    id: 'role-descriptor',
    label: 'Has an IdP or SP role descriptor',
    passed: hasRoleDescriptor,
    detail: hasRoleDescriptor
      ? `Found ${idpCount} <IDPSSODescriptor> and ${spCount} <SPSSODescriptor> element(s).`
      : 'Missing both <IDPSSODescriptor> and <SPSSODescriptor> — at least one role descriptor is required.',
  })

  const certCount = countMatches(trimmed, 'X509Certificate')
  results.push({
    id: 'signing-certificate',
    label: 'Has a signing certificate',
    passed: certCount > 0,
    detail: certCount > 0 ? `Found ${certCount} <X509Certificate> element(s).` : 'No <X509Certificate> found — signature verification will not be possible without one.',
  })

  if (idpCount > 0) {
    const ssoCount = countMatches(trimmed, 'SingleSignOnService')
    results.push({
      id: 'sso-endpoint',
      label: 'IdP has a SingleSignOnService endpoint',
      passed: ssoCount > 0,
      detail: ssoCount > 0 ? `Found ${ssoCount} <SingleSignOnService> endpoint(s).` : '<IDPSSODescriptor> is missing a <SingleSignOnService> endpoint.',
    })
  }

  if (spCount > 0) {
    const acsCount = countMatches(trimmed, 'AssertionConsumerService')
    results.push({
      id: 'acs-endpoint',
      label: 'SP has an AssertionConsumerService endpoint',
      passed: acsCount > 0,
      detail: acsCount > 0 ? `Found ${acsCount} <AssertionConsumerService> endpoint(s).` : '<SPSSODescriptor> is missing an <AssertionConsumerService> endpoint.',
    })
  }

  return results
}

export function runConformanceCheck(input: string): ConformanceReport {
  const documentType = detectDocumentType(input)
  if (documentType === 'oidc-discovery') return { documentType, results: checkOidcDiscovery(input) }
  if (documentType === 'saml-metadata') return { documentType, results: checkSamlMetadata(input) }
  return { documentType: 'unknown', results: [] }
}

export function buildSampleOidcDiscovery(): string {
  return JSON.stringify(
    {
      issuer: 'https://idp.example.com',
      authorization_endpoint: 'https://idp.example.com/authorize',
      token_endpoint: 'https://idp.example.com/token',
      jwks_uri: 'https://idp.example.com/.well-known/jwks.json',
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
    },
    null,
    2
  )
}

export function buildSampleSamlMetadata(): string {
  return `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/metadata">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MIIB...sample...cert...</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`
}
