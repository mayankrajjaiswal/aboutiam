// X.509 certificate (RFC 5280) and PKCS#10 CSR (RFC 2986) field extraction,
// built entirely on the generic DER walker in lib/tools/asn1.ts. Covers the
// common real-world case (RSA/EC certs and CSRs) rather than every optional
// RFC 5280 field — see FIXED_TODO.md §4.3 for the target field list.
import type { Asn1Node } from './asn1'
import { UNIVERSAL_TAG, decodeBitString, decodeDerString, decodeDerTime, decodeInteger, decodeOid, parseAll, readChildren } from './asn1'
import { base64ToBytes } from './base64'
import { pemToDer } from './pem'
import { digest, bytesToHex } from './hash'

export interface DnAttribute {
  oid: string
  label: string
  value: string
}

export interface DistinguishedName {
  attributes: DnAttribute[]
  display: string
}

export interface SubjectAltName {
  type: 'dns' | 'email' | 'uri' | 'ip' | 'other'
  value: string
  isSpiffe?: boolean
}

export interface PublicKeyInfo {
  algorithm: string
  details: string
}

export interface ParsedCertificate {
  kind: 'certificate'
  version: number
  serialNumberHex: string
  signatureAlgorithm: string
  issuer: DistinguishedName
  subject: DistinguishedName
  notBefore: Date
  notAfter: Date
  isExpired: boolean
  daysRemaining: number
  publicKey: PublicKeyInfo
  subjectAltNames: SubjectAltName[]
  keyUsage: string[]
  extKeyUsage: string[]
  isCa: boolean
  pathLenConstraint: number | null
  fingerprintSha1: string
  fingerprintSha256: string
}

export interface ParsedCsr {
  kind: 'csr'
  subject: DistinguishedName
  publicKey: PublicKeyInfo
  subjectAltNames: SubjectAltName[]
}

export interface ParseFailure {
  kind: 'error'
  message: string
}

export type ParsedCertOrCsr = ParsedCertificate | ParsedCsr | ParseFailure

const DN_OID_LABELS: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '1.2.840.113549.1.9.1': 'E',
}

const EC_CURVE_OIDS: Record<string, string> = {
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
}

const SIGNATURE_ALG_OIDS: Record<string, string> = {
  '1.2.840.113549.1.1.5': 'SHA1withRSA',
  '1.2.840.113549.1.1.11': 'SHA256withRSA',
  '1.2.840.113549.1.1.12': 'SHA384withRSA',
  '1.2.840.113549.1.1.13': 'SHA512withRSA',
  '1.2.840.10045.4.3.2': 'ECDSA-SHA256',
  '1.2.840.10045.4.3.3': 'ECDSA-SHA384',
  '1.2.840.10045.4.3.4': 'ECDSA-SHA512',
}

const EKU_OID_LABELS: Record<string, string> = {
  '1.3.6.1.5.5.7.3.1': 'serverAuth',
  '1.3.6.1.5.5.7.3.2': 'clientAuth',
  '1.3.6.1.5.5.7.3.3': 'codeSigning',
  '1.3.6.1.5.5.7.3.4': 'emailProtection',
  '1.3.6.1.5.5.7.3.8': 'timeStamping',
  '1.3.6.1.5.5.7.3.9': 'OCSPSigning',
}

const KEY_USAGE_BITS = [
  'digitalSignature', 'nonRepudiation', 'keyEncipherment', 'dataEncipherment',
  'keyAgreement', 'keyCertSign', 'cRLSign', 'encipherOnly', 'decipherOnly',
]

function parseName(nameNode: Asn1Node, buf: Uint8Array): DistinguishedName {
  const attributes: DnAttribute[] = []
  for (const rdnSet of readChildren(nameNode, buf)) {
    for (const atv of readChildren(rdnSet, buf)) {
      const [oidNode, valueNode] = readChildren(atv, buf)
      const oid = decodeOid(oidNode.content)
      attributes.push({ oid, label: DN_OID_LABELS[oid] ?? oid, value: decodeDerString(valueNode.content) })
    }
  }
  return { attributes, display: attributes.map((a) => `${a.label}=${a.value}`).join(', ') }
}

function estimateRsaBitLength(modulusBytes: Uint8Array): number {
  if (modulusBytes.length === 0) return 0
  let firstByte = modulusBytes[0]
  let bits = (modulusBytes.length - 1) * 8
  while (firstByte > 0) {
    bits++
    firstByte >>= 1
  }
  return bits
}

function parsePublicKeyInfo(spkiNode: Asn1Node, buf: Uint8Array): PublicKeyInfo {
  const [algIdNode, bitStringNode] = readChildren(spkiNode, buf)
  const algChildren = readChildren(algIdNode, buf)
  const algOid = decodeOid(algChildren[0].content)
  const { bits } = decodeBitString(bitStringNode.content)

  if (algOid === '1.2.840.113549.1.1.1') {
    const [rsaSeq] = parseAll(bits)
    const [modulusNode] = readChildren(rsaSeq, bits)
    const modulus = modulusNode.content[0] === 0 ? modulusNode.content.subarray(1) : modulusNode.content
    return { algorithm: 'RSA', details: `${estimateRsaBitLength(modulus)}-bit` }
  }
  if (algOid === '1.2.840.10045.2.1') {
    const curveOid = algChildren[1] ? decodeOid(algChildren[1].content) : ''
    return { algorithm: 'EC', details: EC_CURVE_OIDS[curveOid] ?? (curveOid || 'unknown curve') }
  }
  return { algorithm: algOid, details: '' }
}

function formatIpAddress(bytes: Uint8Array): string {
  if (bytes.length === 4) return Array.from(bytes).join('.')
  if (bytes.length === 16) {
    const groups: string[] = []
    for (let i = 0; i < 16; i += 2) groups.push(((bytes[i] << 8) | bytes[i + 1]).toString(16))
    return groups.join(':')
  }
  return bytesToHex(bytes)
}

function parseGeneralName(node: Asn1Node): SubjectAltName {
  switch (node.tagNumber) {
    case 1:
      return { type: 'email', value: decodeDerString(node.content) }
    case 2:
      return { type: 'dns', value: decodeDerString(node.content) }
    case 6: {
      const value = decodeDerString(node.content)
      return { type: 'uri', value, isSpiffe: value.startsWith('spiffe://') }
    }
    case 7:
      return { type: 'ip', value: formatIpAddress(node.content) }
    default:
      return { type: 'other', value: `[context ${node.tagNumber}] ${bytesToHex(node.content)}` }
  }
}

interface ParsedExtensions {
  subjectAltNames: SubjectAltName[]
  keyUsage: string[]
  extKeyUsage: string[]
  isCa: boolean
  pathLenConstraint: number | null
}

function parseExtensions(extensions: Asn1Node[], buf: Uint8Array): ParsedExtensions {
  const result: ParsedExtensions = { subjectAltNames: [], keyUsage: [], extKeyUsage: [], isCa: false, pathLenConstraint: null }

  for (const ext of extensions) {
    const extChildren = readChildren(ext, buf)
    const oid = decodeOid(extChildren[0].content)
    const extnValueNode = extChildren[extChildren.length - 1]
    const value = extnValueNode.content

    if (oid === '2.5.29.17') {
      const [sanSeq] = parseAll(value)
      result.subjectAltNames = readChildren(sanSeq, value).map(parseGeneralName)
    } else if (oid === '2.5.29.15') {
      const [bitStringNode] = parseAll(value)
      const { bits } = decodeBitString(bitStringNode.content)
      result.keyUsage = KEY_USAGE_BITS.filter((_, i) => {
        const byteIndex = Math.floor(i / 8)
        const mask = 1 << (7 - (i % 8))
        return byteIndex < bits.length && (bits[byteIndex] & mask) !== 0
      })
    } else if (oid === '2.5.29.37') {
      const [ekuSeq] = parseAll(value)
      result.extKeyUsage = readChildren(ekuSeq, value).map((n) => {
        const eku = decodeOid(n.content)
        return EKU_OID_LABELS[eku] ?? eku
      })
    } else if (oid === '2.5.29.19') {
      const [bcSeq] = parseAll(value)
      const bcChildren = readChildren(bcSeq, value)
      let i = 0
      if (bcChildren[i]?.tagNumber === UNIVERSAL_TAG.BOOLEAN) {
        result.isCa = bcChildren[i].content[0] !== 0
        i++
      }
      if (bcChildren[i]?.tagNumber === UNIVERSAL_TAG.INTEGER) {
        result.pathLenConstraint = decodeInteger(bcChildren[i].content).asNumber
      }
    }
  }
  return result
}

function parseCertificateSync(der: Uint8Array): Omit<ParsedCertificate, 'fingerprintSha1' | 'fingerprintSha256'> {
  const [certSeq] = parseAll(der)
  if (!certSeq || certSeq.tagNumber !== UNIVERSAL_TAG.SEQUENCE) throw new Error('Not a DER SEQUENCE at the top level.')
  const [tbsCert, sigAlgNode] = readChildren(certSeq, der)
  if (!tbsCert || tbsCert.tagNumber !== UNIVERSAL_TAG.SEQUENCE) throw new Error('Missing tbsCertificate.')

  const tbsChildren = readChildren(tbsCert, der)
  let idx = 0
  let version = 1
  if (tbsChildren[idx]?.tagClass === 'context' && tbsChildren[idx]?.tagNumber === 0) {
    const versionInt = readChildren(tbsChildren[idx], der)[0]
    version = (decodeInteger(versionInt.content).asNumber ?? 0) + 1
    idx++
  }

  const serialNode = tbsChildren[idx++]
  if (!serialNode || serialNode.tagNumber !== UNIVERSAL_TAG.INTEGER) throw new Error('Missing or malformed serial number.')
  const serialNumberHex = decodeInteger(serialNode.content).hex

  idx++ // signature AlgorithmIdentifier inside TBS — the outer one (sigAlgNode) is used for display instead
  const issuer = parseName(tbsChildren[idx++], der)
  const validityNode = tbsChildren[idx++]
  const [notBeforeNode, notAfterNode] = readChildren(validityNode, der)
  const notBefore = decodeDerTime(notBeforeNode.content, notBeforeNode.tagNumber === UNIVERSAL_TAG.GENERALIZED_TIME)
  const notAfter = decodeDerTime(notAfterNode.content, notAfterNode.tagNumber === UNIVERSAL_TAG.GENERALIZED_TIME)
  const subject = parseName(tbsChildren[idx++], der)
  const publicKey = parsePublicKeyInfo(tbsChildren[idx++], der)

  let extensionNodes: Asn1Node[] = []
  for (; idx < tbsChildren.length; idx++) {
    const node = tbsChildren[idx]
    if (node.tagClass === 'context' && node.tagNumber === 3) {
      const [extSeq] = readChildren(node, der)
      extensionNodes = readChildren(extSeq, der)
    }
  }
  const extensions = parseExtensions(extensionNodes, der)

  const sigAlgOid = decodeOid(readChildren(sigAlgNode, der)[0].content)
  const now = Date.now()

  return {
    kind: 'certificate',
    version,
    serialNumberHex,
    signatureAlgorithm: SIGNATURE_ALG_OIDS[sigAlgOid] ?? sigAlgOid,
    issuer,
    subject,
    notBefore,
    notAfter,
    isExpired: now > notAfter.getTime(),
    daysRemaining: Math.ceil((notAfter.getTime() - now) / 86400000),
    publicKey,
    subjectAltNames: extensions.subjectAltNames,
    keyUsage: extensions.keyUsage,
    extKeyUsage: extensions.extKeyUsage,
    isCa: extensions.isCa,
    pathLenConstraint: extensions.pathLenConstraint,
  }
}

function parseCsr(der: Uint8Array): ParsedCsr {
  const [reqSeq] = parseAll(der)
  if (!reqSeq || reqSeq.tagNumber !== UNIVERSAL_TAG.SEQUENCE) throw new Error('Not a DER SEQUENCE at the top level.')
  const [certReqInfo] = readChildren(reqSeq, der)
  const [versionNode, subjectNode, spkiNode, attrsNode] = readChildren(certReqInfo, der)
  if (!versionNode || versionNode.tagNumber !== UNIVERSAL_TAG.INTEGER) {
    throw new Error('Not a recognizable PKCS#10 CertificationRequestInfo.')
  }

  const subject = parseName(subjectNode, der)
  const publicKey = parsePublicKeyInfo(spkiNode, der)

  let subjectAltNames: SubjectAltName[] = []
  if (attrsNode?.tagClass === 'context' && attrsNode.tagNumber === 0) {
    for (const attr of readChildren(attrsNode, der)) {
      const [oidNode, valuesSet] = readChildren(attr, der)
      if (decodeOid(oidNode.content) === '1.2.840.113549.1.9.14') {
        const [extSeqWrapper] = readChildren(valuesSet, der)
        subjectAltNames = parseExtensions(readChildren(extSeqWrapper, der), der).subjectAltNames
      }
    }
  }

  return { kind: 'csr', subject, publicKey, subjectAltNames }
}

function looksLikePem(text: string): boolean {
  return text.includes('-----BEGIN')
}

function pemHint(text: string): 'certificate' | 'csr' | null {
  if (/CERTIFICATE REQUEST/.test(text)) return 'csr'
  if (/BEGIN CERTIFICATE/.test(text)) return 'certificate'
  return null
}

function toDerAndHint(input: string | Uint8Array<ArrayBuffer>): { der: Uint8Array<ArrayBuffer>; hint: 'certificate' | 'csr' | null } {
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (looksLikePem(trimmed)) return { der: pemToDer(trimmed), hint: pemHint(trimmed) }
    return { der: base64ToBytes(trimmed.replace(/\s+/g, '')), hint: null }
  }
  try {
    const asText = new TextDecoder('utf-8', { fatal: true }).decode(input)
    if (looksLikePem(asText)) return { der: pemToDer(asText), hint: pemHint(asText) }
  } catch {
    // Not valid UTF-8 text — fall through and treat the upload as raw DER bytes.
  }
  return { der: input, hint: null }
}

export async function parseCertificateOrCsr(input: string | Uint8Array<ArrayBuffer>): Promise<ParsedCertOrCsr> {
  let der: Uint8Array<ArrayBuffer>
  let hint: 'certificate' | 'csr' | null
  try {
    ;({ der, hint } = toDerAndHint(input))
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : 'Could not decode this input as PEM or Base64 DER.' }
  }

  const order: ('certificate' | 'csr')[] = hint === 'csr' ? ['csr', 'certificate'] : ['certificate', 'csr']
  let lastMessage = 'This does not look like a valid X.509 certificate or PKCS#10 CSR.'

  for (const kind of order) {
    try {
      if (kind === 'certificate') {
        const parsed = parseCertificateSync(der)
        const [sha1, sha256] = await Promise.all([digest('SHA-1', der), digest('SHA-256', der)])
        return { ...parsed, fingerprintSha1: bytesToHex(sha1), fingerprintSha256: bytesToHex(sha256) }
      }
      return parseCsr(der)
    } catch (err) {
      lastMessage = err instanceof Error ? err.message : lastMessage
    }
  }
  return { kind: 'error', message: lastMessage }
}
