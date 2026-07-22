import { describe, expect, it } from 'vitest'
import {
  detectDocumentType,
  checkOidcDiscovery,
  checkSamlMetadata,
  runConformanceCheck,
  buildSampleOidcDiscovery,
  buildSampleSamlMetadata,
} from './conformance'

describe('detectDocumentType', () => {
  it('detects a JSON object as oidc-discovery', () => {
    expect(detectDocumentType('{"issuer": "https://x"}')).toBe('oidc-discovery')
  })

  it('detects XML as saml-metadata', () => {
    expect(detectDocumentType('<EntityDescriptor></EntityDescriptor>')).toBe('saml-metadata')
  })

  it('falls back to unknown for anything else', () => {
    expect(detectDocumentType('not a document')).toBe('unknown')
  })
})

describe('checkOidcDiscovery', () => {
  it('passes every rule for a well-formed discovery document', () => {
    const results = checkOidcDiscovery(buildSampleOidcDiscovery())
    expect(results.every((r) => r.passed)).toBe(true)
    expect(results.length).toBeGreaterThan (5)
  })

  it('fails valid-json for malformed JSON without throwing', () => {
    const results = checkOidcDiscovery('{ not valid json')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ id: 'valid-json', passed: false })
  })

  it('fails valid-json for a JSON array (not an object)', () => {
    const results = checkOidcDiscovery('[1,2,3]')
    expect(results[0].passed).toBe(false)
  })

  it('flags a missing required field', () => {
    const doc = JSON.stringify({ authorization_endpoint: 'https://x/authorize', token_endpoint: 'https://x/token', jwks_uri: 'https://x/jwks' })
    const results = checkOidcDiscovery(doc)
    const issuerCheck = results.find((r) => r.id === 'field-issuer')
    expect(issuerCheck?.passed).toBe(false)
  })

  it('flags a non-HTTPS issuer', () => {
    const doc = JSON.parse(buildSampleOidcDiscovery())
    doc.issuer = 'http://insecure.example.com'
    const results = checkOidcDiscovery(JSON.stringify(doc))
    expect(results.find((r) => r.id === 'issuer-https')?.passed).toBe(false)
  })

  it('flags "none" advertised in id_token_signing_alg_values_supported', () => {
    const doc = JSON.parse(buildSampleOidcDiscovery())
    doc.id_token_signing_alg_values_supported = ['RS256', 'none']
    const results = checkOidcDiscovery(JSON.stringify(doc))
    expect(results.find((r) => r.id === 'no-none-alg')?.passed).toBe(false)
  })
})

describe('checkSamlMetadata', () => {
  it('passes every rule for well-formed IdP metadata', () => {
    const results = checkSamlMetadata(buildSampleSamlMetadata())
    expect(results.every((r) => r.passed)).toBe(true)
  })

  it('fails valid-xml for malformed input without throwing', () => {
    const results = checkSamlMetadata('<EntityDescriptor entityID="x">')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ id: 'valid-xml', passed: false })
  })

  it('flags a non-EntityDescriptor root element', () => {
    const results = checkSamlMetadata('<SomethingElse foo="bar">content</SomethingElse>')
    expect(results.find((r) => r.id === 'root-entity-descriptor')?.passed).toBe(false)
  })

  it('flags a missing entityID attribute', () => {
    const xml = '<EntityDescriptor><IDPSSODescriptor></IDPSSODescriptor></EntityDescriptor>'
    const results = checkSamlMetadata(xml)
    expect(results.find((r) => r.id === 'entity-id')?.passed).toBe(false)
  })

  it('flags missing role descriptors', () => {
    const xml = '<EntityDescriptor entityID="https://x"></EntityDescriptor>'
    const results = checkSamlMetadata(xml)
    expect(results.find((r) => r.id === 'role-descriptor')?.passed).toBe(false)
  })

  it('flags an IdP missing a SingleSignOnService endpoint', () => {
    const xml = '<EntityDescriptor entityID="https://x"><IDPSSODescriptor><X509Certificate>abc</X509Certificate></IDPSSODescriptor></EntityDescriptor>'
    const results = checkSamlMetadata(xml)
    expect(results.find((r) => r.id === 'sso-endpoint')?.passed).toBe(false)
  })
})

describe('runConformanceCheck', () => {
  it('routes a JSON document through the OIDC checklist', () => {
    const report = runConformanceCheck(buildSampleOidcDiscovery())
    expect(report.documentType).toBe('oidc-discovery')
    expect(report.results.length).toBeGreaterThan(0)
  })

  it('routes an XML document through the SAML checklist', () => {
    const report = runConformanceCheck(buildSampleSamlMetadata())
    expect(report.documentType).toBe('saml-metadata')
    expect(report.results.length).toBeGreaterThan(0)
  })

  it('returns an empty report for unrecognized input', () => {
    const report = runConformanceCheck('plain text')
    expect(report.documentType).toBe('unknown')
    expect(report.results).toEqual([])
  })
})
