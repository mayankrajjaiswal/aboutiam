import { base64ToBytes, bytesToBase64 } from './base64'

function chunk(str: string, size = 64): string {
  const lines: string[] = []
  for (let i = 0; i < str.length; i += size) lines.push(str.slice(i, i + size))
  return lines.join('\n')
}

export function derToPem(der: Uint8Array, label: string): string {
  return `-----BEGIN ${label}-----\n${chunk(bytesToBase64(der))}\n-----END ${label}-----`
}

export function pemToDer(pem: string): Uint8Array<ArrayBuffer> {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  return base64ToBytes(base64)
}
