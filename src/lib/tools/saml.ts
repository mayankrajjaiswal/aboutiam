// SAML binding decode (POST/Redirect) + a lightweight, regex-based XML
// pretty-printer and assertion-field extractor. Deliberately not a full XML
// DOM parser (no DOMParser dependency) — this keeps the module portable and
// unit-testable in Node without jsdom, matching the rest of lib/tools/.
import { base64Decode, base64ToBytes } from './base64'
import { rawInflate } from './inflate'

export function decodePostBinding(base64Value: string): string {
  return base64Decode(base64Value.trim())
}

export async function decodeRedirectBinding(base64Value: string): Promise<string> {
  const compressed = base64ToBytes(base64Value.trim())
  const inflated = await rawInflate(compressed)
  return new TextDecoder().decode(inflated)
}

export function prettyPrintXml(xml: string): string {
  const withBreaks = xml.replace(/>\s*</g, '>\n<').trim()
  const lines = withBreaks.split('\n')
  let depth = 0
  const out: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    const isClosingTag = /^<\//.test(trimmed)
    const isSelfClosing = /\/>$/.test(trimmed) || /^<\?/.test(trimmed) || /^<!--/.test(trimmed)
    const isOpenAndCloseOnOneLine = /^<[^!?/][^>]*>[\s\S]*<\/[^>]+>$/.test(trimmed)

    if (isClosingTag) depth = Math.max(0, depth - 1)
    out.push('  '.repeat(depth) + trimmed)
    if (!isClosingTag && !isSelfClosing && !isOpenAndCloseOnOneLine) depth++
  }
  return out.join('\n')
}

export interface SamlAttribute {
  name: string
  values: string[]
}

export interface SamlFields {
  issuer?: string
  nameId?: string
  audience?: string
  notBefore?: string
  notOnOrAfter?: string
  attributes: SamlAttribute[]
}

function firstElementText(xml: string, tagName: string): string | undefined {
  const match = xml.match(new RegExp(`<(?:\\w+:)?${tagName}\\b[^>]*>([^<]*)</(?:\\w+:)?${tagName}>`, 'i'))
  return match ? match[1].trim() : undefined
}

export function extractSamlFields(xml: string): SamlFields {
  const issuer = firstElementText(xml, 'Issuer')
  const nameId = firstElementText(xml, 'NameID')
  const audience = firstElementText(xml, 'Audience')

  const conditionsMatch = xml.match(/<(?:\w+:)?Conditions\b([^>]*)>/i)
  const notBefore = conditionsMatch?.[1].match(/NotBefore="([^"]+)"/)?.[1]
  const notOnOrAfter = conditionsMatch?.[1].match(/NotOnOrAfter="([^"]+)"/)?.[1]

  const attributes: SamlAttribute[] = []
  const attrStatementMatch = xml.match(/<(?:\w+:)?AttributeStatement\b[^>]*>([\s\S]*?)<\/(?:\w+:)?AttributeStatement>/i)
  if (attrStatementMatch) {
    const attrRe = /<(?:\w+:)?Attribute\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?Attribute>/gi
    let attrMatch: RegExpExecArray | null
    while ((attrMatch = attrRe.exec(attrStatementMatch[1]))) {
      const name = attrMatch[1].match(/Name="([^"]+)"/)?.[1] ?? '(unnamed)'
      const values: string[] = []
      const valueRe = /<(?:\w+:)?AttributeValue\b[^>]*>([\s\S]*?)<\/(?:\w+:)?AttributeValue>/gi
      let valueMatch: RegExpExecArray | null
      while ((valueMatch = valueRe.exec(attrMatch[2]))) values.push(valueMatch[1].trim())
      attributes.push({ name, values })
    }
  }

  return { issuer, nameId, audience, notBefore, notOnOrAfter, attributes }
}
