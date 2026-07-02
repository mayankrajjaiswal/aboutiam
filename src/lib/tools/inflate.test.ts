import { describe, expect, it } from 'vitest'
import { isInflateSupported, rawInflate } from './inflate'

async function rawDeflate(text: string): Promise<Uint8Array<ArrayBuffer>> {
  const bytes = new TextEncoder().encode(text)
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  const buffer = await new Response(stream).arrayBuffer()
  return new Uint8Array(buffer)
}

describe('inflate (raw DEFLATE)', () => {
  it('reports support in this environment', () => {
    expect(isInflateSupported()).toBe(true)
  })

  it('round-trips a compressed SAML-like XML payload', async () => {
    const xml = '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><saml:Issuer>https://sp.example.com</saml:Issuer></samlp:AuthnRequest>'
    const compressed = await rawDeflate(xml)
    const inflated = await rawInflate(compressed)
    expect(new TextDecoder().decode(inflated)).toBe(xml)
  })
})
