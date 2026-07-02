import { describe, expect, it } from 'vitest'
import { base64Encode, bytesToBase64 } from './base64'
import { decodePostBinding, decodeRedirectBinding, extractSamlFields, prettyPrintXml } from './saml'

const SAMPLE_RESPONSE_XML =
  '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">' +
  '<saml:Issuer>https://idp.example.com</saml:Issuer>' +
  '<saml:Assertion><saml:Subject><saml:NameID>jdoe@example.com</saml:NameID></saml:Subject>' +
  '<saml:Conditions NotBefore="2026-01-01T00:00:00Z" NotOnOrAfter="2026-01-01T00:05:00Z">' +
  '<saml:AudienceRestriction><saml:Audience>https://sp.example.com</saml:Audience></saml:AudienceRestriction></saml:Conditions>' +
  '<saml:AttributeStatement>' +
  '<saml:Attribute Name="email"><saml:AttributeValue>jdoe@example.com</saml:AttributeValue></saml:Attribute>' +
  '<saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue><saml:AttributeValue>auditor</saml:AttributeValue></saml:Attribute>' +
  '</saml:AttributeStatement></saml:Assertion></samlp:Response>'

describe('saml binding decode', () => {
  it('decodes a POST-binding base64 value directly to XML', () => {
    expect(decodePostBinding(base64Encode(SAMPLE_RESPONSE_XML))).toBe(SAMPLE_RESPONSE_XML)
  })

  it('decodes a Redirect-binding base64(raw-deflate(xml)) value', async () => {
    const bytes = new TextEncoder().encode(SAMPLE_RESPONSE_XML)
    const compressedStream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    const compressedBuffer = await new Response(compressedStream).arrayBuffer()
    const compressedBase64 = bytesToBase64(new Uint8Array(compressedBuffer))
    expect(await decodeRedirectBinding(compressedBase64)).toBe(SAMPLE_RESPONSE_XML)
  })
})

describe('saml XML pretty-printer', () => {
  it('indents nested elements while keeping leaf text inline', () => {
    expect(prettyPrintXml('<a><b>text</b><c/></a>')).toBe('<a>\n  <b>text</b>\n  <c/>\n</a>')
  })
})

describe('saml field extraction', () => {
  it('extracts issuer, NameID, audience, conditions, and attribute statement values', () => {
    const fields = extractSamlFields(SAMPLE_RESPONSE_XML)
    expect(fields.issuer).toBe('https://idp.example.com')
    expect(fields.nameId).toBe('jdoe@example.com')
    expect(fields.audience).toBe('https://sp.example.com')
    expect(fields.notBefore).toBe('2026-01-01T00:00:00Z')
    expect(fields.notOnOrAfter).toBe('2026-01-01T00:05:00Z')
    expect(fields.attributes).toEqual([
      { name: 'email', values: ['jdoe@example.com'] },
      { name: 'role', values: ['admin', 'auditor'] },
    ])
  })
})
