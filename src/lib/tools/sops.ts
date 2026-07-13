import { bytesToBase64 } from './base64'
import { bytesToHex } from './hash'

/**
 * Type helper to assert that a Uint8Array has a non-shared ArrayBuffer,
 * which is required by some strict environments for Web Crypto BufferSource parameters.
 */
type NonSharedUint8Array = Uint8Array & { buffer: ArrayBuffer }

/**
 * Standard Base64 decoding in browser/node environment.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export type SopsKeyProvider = 'aws_kms' | 'azure_kv' | 'hc_vault' | 'age'

export interface SopsEncryptionOptions {
  encryptedRegex: string // e.g. "^(password|secret|token)$" or ".*"
  keyProvider: SopsKeyProvider
  providerId: string // e.g. KMS ARN, Vault path, or Age public key
  password?: string  // Password to simulate/derive keys client-side
}

/**
 * Converts a combined Web Crypto AES-GCM output buffer (ciphertext + 16-byte tag)
 * into discrete Base64 components.
 */
function splitAesGcmBuffer(buffer: ArrayBuffer): { dataBase64: string; tagBase64: string } {
  const bytes = new Uint8Array(buffer)
  const ciphertextBytes = bytes.slice(0, bytes.length - 16)
  const tagBytes = bytes.slice(bytes.length - 16)

  return {
    dataBase64: bytesToBase64(ciphertextBytes),
    tagBase64: bytesToBase64(tagBytes),
  }
}

/**
 * Recombines ciphertext and authentication tag bytes for AES-GCM decryption in Web Crypto.
 */
function recombineAesGcmBuffer(dataBase64: string, tagBase64: string): Uint8Array {
  const dataBytes = base64ToBytes(dataBase64)
  const tagBytes = base64ToBytes(tagBase64)
  const combined = new Uint8Array(dataBytes.length + tagBytes.length)
  combined.set(dataBytes)
  combined.set(tagBytes, dataBytes.length)
  return combined
}

/**
 * Helper to derive a stable CryptoKey from a password and salt using PBKDF2.
 */
async function deriveSopsKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBytes = new TextEncoder().encode(password)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as NonSharedUint8Array,
      iterations: 5000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Main encryption engine. Walks the values of JSON/YAML structures
 * and selectively encrypts fields matching the regular expression.
 */
export async function encryptSops(
  content: string,
  options: SopsEncryptionOptions
): Promise<string> {
  const { encryptedRegex, keyProvider, providerId, password = 'sops-default-pass' } = options
  const regex = new RegExp(encryptedRegex)

  // Derive stable AES-GCM key simulating the DEK (Data Encryption Key)
  const salt = new Uint8Array([83, 79, 80, 83, 95, 83, 65, 76, 84, 95, 49, 50, 51, 52, 53, 54]) // "SOPS_SALT_123456"
  const sopsDek = await deriveSopsKey(password, salt)

  // Determine if content is JSON or YAML
  const trimmed = content.trim()
  const isJson = trimmed.startsWith('{') || trimmed.startsWith('[')

  const encryptValue = async (val: string, type: string): Promise<string> => {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const rawVal = new TextEncoder().encode(val)
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      sopsDek,
      rawVal
    )
    const { dataBase64, tagBase64 } = splitAesGcmBuffer(encryptedBuffer)
    const ivBase64 = bytesToBase64(iv)
    return `ENC[AES256_GCM,data:${dataBase64},iv:${ivBase64},tag:${tagBase64},type:${type}]`
  }

  // Generate a realistic metadata block
  const generateMetadata = (modifiedDate: string) => {
    const mockEncryptedDek = 'AQICAHg1...' + bytesToHex(crypto.getRandomValues(new Uint8Array(32))) + '=='
    const kmsBlock = keyProvider === 'aws_kms' ? [{
      arn: providerId || 'arn:aws:kms:us-east-1:123456789012:key/sops-simulator-key-id',
      created_at: modifiedDate,
      enc: mockEncryptedDek,
    }] : []

    const azureBlock = keyProvider === 'azure_kv' ? [{
      vault_url: providerId || 'https://my-vault.vault.azure.net',
      name: 'sops-key',
      version: '1.0.0',
      created_at: modifiedDate,
      enc: mockEncryptedDek,
    }] : []

    const vaultBlock = keyProvider === 'hc_vault' ? [{
      address: 'https://vault.example.com:8200',
      path: providerId || 'secret/data/sops',
      key: 'sops-key',
      created_at: modifiedDate,
      enc: mockEncryptedDek,
    }] : []

    const ageBlock = keyProvider === 'age' ? [{
      recipient: providerId || 'age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p',
      enc: `-----BEGIN AGE ENCRYPTED FILE-----\nYWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBvS09vR09v\n${bytesToBase64(crypto.getRandomValues(new Uint8Array(48)))}\n-----END AGE ENCRYPTED FILE-----`,
    }] : []

    return {
      kms: kmsBlock,
      gcp_kms: [],
      azure_kv: azureBlock,
      hc_vault: vaultBlock,
      age: ageBlock,
      lastmodified: modifiedDate,
      mac: `ENC[AES256_GCM,data:${bytesToBase64(crypto.getRandomValues(new Uint8Array(16)))},iv:${bytesToBase64(crypto.getRandomValues(new Uint8Array(12)))},tag:${bytesToBase64(crypto.getRandomValues(new Uint8Array(16)))},type:str]`,
      pgp: [],
      unencrypted_suffix: '_unencrypted',
      encrypted_regex: encryptedRegex,
      version: '3.9.1',
    }
  }

  const modifiedDate = new Date().toISOString()

  if (isJson) {
    let parsedObj: unknown
    try {
      parsedObj = JSON.parse(content)
    } catch {
      throw new Error('Invalid JSON input')
    }

    const walkAndEncrypt = async (obj: unknown): Promise<unknown> => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => walkAndEncrypt(item)))
      }

      const rawObj = obj as Record<string, unknown>
      const res: Record<string, unknown> = {}
      for (const key of Object.keys(rawObj)) {
        const val = rawObj[key]
        if (typeof val === 'object' && val !== null) {
          res[key] = await walkAndEncrypt(val)
        } else if (regex.test(key)) {
          // Encrypt
          const type = typeof val
          const stringVal = String(val)
          res[key] = await encryptValue(stringVal, type)
        } else {
          res[key] = val
        }
      }
      return res
    }

    const encryptedData = await walkAndEncrypt(parsedObj) as Record<string, unknown>
    encryptedData.sops = generateMetadata(modifiedDate)
    return JSON.stringify(encryptedData, null, 2)
  } else {
    // Process YAML line-by-line to preserve comments and indentation exactly!
    const lines = content.split('\n')
    const resultLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Skip empty or comment-only lines
      if (line.trim() === '' || line.trim().startsWith('#')) {
        resultLines.push(line)
        continue
      }

      // Regex to match:   indentation key: value   # comment (optional)
      const match = line.match(/^(\s*)([^#:\s]+)\s*:\s*([^#]+)(.*)$/)
      if (match) {
        const [, indent, key, valueStr, comment] = match
        const trimmedVal = valueStr.trim()
        const cleanKey = key.trim()

        // Unquote value if quoted
        let val = trimmedVal
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1)
        }

        if (regex.test(cleanKey) && val !== '' && !val.startsWith('ENC[')) {
          // Determine type
          let type = 'str'
          if (!isNaN(Number(val)) && val !== '') {
            type = 'int'
          } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
            type = 'bool'
          }

          const encryptedVal = await encryptValue(val, type)
          resultLines.push(`${indent}${cleanKey}: ${encryptedVal}${comment || ''}`)
        } else {
          resultLines.push(line)
        }
      } else {
        resultLines.push(line)
      }
    }

    // Append YAML SOPS metadata block
    const meta = generateMetadata(modifiedDate)
    resultLines.push('')
    resultLines.push('# --- SOPS METADATA BLOCK ---')
    resultLines.push('sops:')
    resultLines.push('    kms:')
    if (meta.kms.length > 0) {
      resultLines.push(`        - arn: ${meta.kms[0].arn}`)
      resultLines.push(`          created_at: "${meta.kms[0].created_at}"`)
      resultLines.push(`          enc: ${meta.kms[0].enc}`)
    } else {
      resultLines.push('        []')
    }
    resultLines.push('    gcp_kms: []')
    resultLines.push('    azure_kv:')
    if (meta.azure_kv.length > 0) {
      resultLines.push(`        - vault_url: ${meta.azure_kv[0].vault_url}`)
      resultLines.push(`          name: ${meta.azure_kv[0].name}`)
      resultLines.push(`          version: ${meta.azure_kv[0].version}`)
      resultLines.push(`          created_at: "${meta.azure_kv[0].created_at}"`)
      resultLines.push(`          enc: ${meta.azure_kv[0].enc}`)
    } else {
      resultLines.push('        []')
    }
    resultLines.push('    hc_vault:')
    if (meta.hc_vault.length > 0) {
      resultLines.push(`        - address: ${meta.hc_vault[0].address}`)
      resultLines.push(`          path: ${meta.hc_vault[0].path}`)
      resultLines.push(`          key: ${meta.hc_vault[0].key}`)
      resultLines.push(`          created_at: "${meta.hc_vault[0].created_at}"`)
      resultLines.push(`          enc: ${meta.hc_vault[0].enc}`)
    } else {
      resultLines.push('        []')
    }
    resultLines.push('    age:')
    if (meta.age.length > 0) {
      resultLines.push(`        - recipient: ${meta.age[0].recipient}`)
      resultLines.push('          enc: |')
      const ageEncLines = meta.age[0].enc.split('\n')
      for (const ageLine of ageEncLines) {
        resultLines.push(`            ${ageLine}`)
      }
    } else {
      resultLines.push('        []')
    }
    resultLines.push(`    lastmodified: "${meta.lastmodified}"`)
    resultLines.push(`    mac: ${meta.mac}`)
    resultLines.push('    pgp: []')
    resultLines.push(`    unencrypted_suffix: ${meta.unencrypted_suffix}`)
    resultLines.push(`    encrypted_regex: ${meta.encrypted_regex}`)
    resultLines.push(`    version: ${meta.version}`)

    return resultLines.join('\n')
  }
}

/**
 * Decrypts a SOPS encrypted JSON or YAML structure.
 * Scans for all instances of "ENC[AES256_GCM,...]" and decrypts them.
 */
export async function decryptSops(
  encryptedContent: string,
  password = 'sops-default-pass'
): Promise<string> {
  const salt = new Uint8Array([83, 79, 80, 83, 95, 83, 65, 76, 84, 95, 49, 50, 51, 52, 53, 54])
  const sopsDek = await deriveSopsKey(password, salt)

  const decryptValueString = async (
    dataB64: string,
    ivB64: string,
    tagB64: string,
    type: string
  ): Promise<string> => {
    try {
      const iv = base64ToBytes(ivB64)
      const combinedBuffer = recombineAesGcmBuffer(dataB64, tagB64)

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as NonSharedUint8Array,
        },
        sopsDek,
        combinedBuffer as unknown as NonSharedUint8Array
      )

      const decodedVal = new TextDecoder().decode(decryptedBuffer)

      // Convert value back to its original parsed type format for printing
      if (type === 'int') return decodedVal
      if (type === 'bool') return decodedVal.toLowerCase()
      // Otherwise, return as normal string (with quotes for JSON)
      return decodedVal
    } catch {
      throw new Error('Decryption failed: Check your password/secret key.')
    }
  }

  const isJson = encryptedContent.trim().startsWith('{') || encryptedContent.trim().startsWith('[')

  if (isJson) {
    let parsed: unknown
    try {
      parsed = JSON.parse(encryptedContent)
    } catch {
      throw new Error('Invalid encrypted JSON input')
    }

    const rawParsed = parsed as Record<string, unknown>
    // Strip sops block
    delete rawParsed.sops

    const walkAndDecrypt = async (obj: unknown): Promise<unknown> => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => walkAndDecrypt(item)))
      }

      const rawObj = obj as Record<string, unknown>
      const res: Record<string, unknown> = {}
      for (const key of Object.keys(rawObj)) {
        const val = rawObj[key]
        if (typeof val === 'object' && val !== null) {
          res[key] = await walkAndDecrypt(val)
        } else if (typeof val === 'string' && val.startsWith('ENC[')) {
          // Decrypt match
          const match = val.match(/ENC\[AES256_GCM,data:([^,]+),iv:([^,]+),tag:([^,]+),type:([^\]]+)\]/)
          if (match) {
            const [, dataB64, ivB64, tagB64, type] = match
            const decryptedString = await decryptValueString(dataB64, ivB64, tagB64, type)

            // Convert primitive types back to their actual JS types in the JSON output!
            if (type === 'int') {
              res[key] = Number(decryptedString)
            } else if (type === 'bool') {
              res[key] = decryptedString === 'true'
            } else {
              res[key] = decryptedString
            }
          } else {
            res[key] = val
          }
        } else {
          res[key] = val
        }
      }
      return res
    }

    const decryptedObj = await walkAndDecrypt(rawParsed)
    return JSON.stringify(decryptedObj, null, 2)
  } else {
    // Process YAML
    // Strip the SOPS metadata block from the end of the YAML file
    const sopsIndex = encryptedContent.indexOf('# --- SOPS METADATA BLOCK ---')
    const yamlMain = sopsIndex !== -1 ? encryptedContent.substring(0, sopsIndex) : encryptedContent

    const lines = yamlMain.split('\n')
    const decryptedLines: string[] = []

    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) {
        decryptedLines.push(line)
        continue
      }

      // Detect keys holding encrypted payloads
      const match = line.match(/^(\s*)([^#:\s]+)\s*:\s*(ENC\[AES256_GCM,[^\]]+\])(.*)$/)
      if (match) {
        const [, indent, key, encBlock, comment] = match
        const encMatch = encBlock.match(/ENC\[AES256_GCM,data:([^,]+),iv:([^,]+),tag:([^,]+),type:([^\]]+)\]/)

        if (encMatch) {
          const [, dataB64, ivB64, tagB64, type] = encMatch
          const decryptedVal = await decryptValueString(dataB64, ivB64, tagB64, type)
          decryptedLines.push(`${indent}${key}: ${decryptedVal}${comment || ''}`)
        } else {
          decryptedLines.push(line)
        }
      } else {
        decryptedLines.push(line)
      }
    }

    return decryptedLines.join('\n').trim()
  }
}
