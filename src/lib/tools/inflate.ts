// Raw DEFLATE (RFC 1951, no zlib/gzip wrapper) inflation for Redirect-binding
// SAML values. Wraps the native DecompressionStream rather than hand-rolling
// an inflate algorithm — the browser already ships a correct one. Feature-
// detected per FIXED_TODO.md §1's "no dead ends" principle, since this API
// isn't available in every browser.
export function isInflateSupported(): boolean {
  return typeof DecompressionStream !== 'undefined'
}

export async function rawInflate(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  if (!isInflateSupported()) {
    throw new Error(
      "Your browser doesn't support inline decompression for Redirect-binding SAML — paste the POST-binding value instead, or try a recent Chrome, Firefox, or Safari."
    )
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const buffer = await new Response(stream).arrayBuffer()
  return new Uint8Array(buffer)
}
