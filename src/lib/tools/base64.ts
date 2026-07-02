// UTF-8 safe Base64 / Base64URL helpers shared across the Tools section.
// Deliberately wraps TextEncoder/TextDecoder around btoa/atob rather than
// calling btoa(str) directly, which corrupts anything outside Latin1.

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(base64url: string): string {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (padded.length % 4)) % 4
  return padded + '='.repeat(padLength)
}

export function base64UrlEncodeBytes(bytes: Uint8Array): string {
  return toBase64Url(bytesToBase64(bytes))
}

export function base64UrlDecodeBytes(base64url: string): Uint8Array {
  return base64ToBytes(fromBase64Url(base64url))
}

export function base64UrlEncode(text: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(text))
}

export function base64UrlDecode(base64url: string): string {
  return new TextDecoder().decode(base64UrlDecodeBytes(base64url))
}

export function base64Encode(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text))
}

export function base64Decode(base64: string): string {
  return new TextDecoder().decode(base64ToBytes(base64))
}
