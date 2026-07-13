import { bytesToHex } from './hash'

/**
 * Type helper to assert that a Uint8Array has a non-shared ArrayBuffer,
 * which is required by some strict environments for Web Crypto BufferSource parameters.
 */
type NonSharedUint8Array = Uint8Array & { buffer: ArrayBuffer }

/**
 * Standard PKCS#7 padding for cryptographic operations (16-byte block size).
 */
export function padPkcs7(data: Uint8Array, blockSize = 16): Uint8Array {
  const paddingLength = blockSize - (data.length % blockSize)
  const padded = new Uint8Array(data.length + paddingLength)
  padded.set(data)
  padded.fill(paddingLength, data.length)
  return padded
}

/**
 * Standard PKCS#7 unpadding.
 */
export function unpadPkcs7(data: Uint8Array): Uint8Array {
  if (data.length === 0) {
    throw new Error('Empty data for unpadding')
  }
  const paddingLength = data[data.length - 1]
  if (paddingLength < 1 || paddingLength > 16) {
    throw new Error('Invalid PKCS#7 padding length')
  }
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) {
      throw new Error('Invalid PKCS#7 padding character')
    }
  }
  return data.slice(0, data.length - paddingLength)
}

/**
 * Helper to convert a hex string to a Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/\s+/g, '')
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string length')
  }
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Derives the necessary cipher key, HMAC key, and counter/IV from the password and salt.
 * Key structure (80 bytes total):
 * - Bytes 0-31: Cipher Key (AES-256)
 * - Bytes 32-63: HMAC Key (SHA-256)
 * - Bytes 64-79: IV (Counter initialization)
 */
async function deriveVaultKeys(password: string, salt: Uint8Array): Promise<{
  cipherKey: CryptoKey
  hmacKey: CryptoKey
  iv: Uint8Array
}> {
  const passwordBytes = new TextEncoder().encode(password)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as NonSharedUint8Array,
      iterations: 10000,
      hash: 'SHA-256',
    },
    baseKey,
    640 // 80 bytes * 8 bits
  )

  const derivedBytes = new Uint8Array(derivedBits)
  const cipherKeyBytes = derivedBytes.slice(0, 32)
  const hmacKeyBytes = derivedBytes.slice(32, 64)
  const ivBytes = derivedBytes.slice(64, 80)

  const cipherKey = await crypto.subtle.importKey(
    'raw',
    cipherKeyBytes,
    'AES-CTR',
    false,
    ['encrypt', 'decrypt']
  )

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    hmacKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  return { cipherKey, hmacKey, iv: ivBytes }
}

/**
 * Encrypts a plaintext string or raw bytes into the Ansible Vault AES-256 encrypted format.
 */
export async function encryptVault(
  plaintext: string | Uint8Array,
  password: string,
  vaultId?: string
): Promise<string> {
  const rawPlaintext = typeof plaintext === 'string'
    ? new TextEncoder().encode(plaintext)
    : plaintext

  const paddedPlaintext = padPkcs7(rawPlaintext)

  // Generate 32 bytes of secure random salt
  const salt = crypto.getRandomValues(new Uint8Array(32))

  // Derive keys
  const { cipherKey, hmacKey, iv } = await deriveVaultKeys(password, salt)

  // Encrypt with AES-CTR
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: iv as unknown as NonSharedUint8Array,
      length: 128,
    },
    cipherKey,
    paddedPlaintext as unknown as NonSharedUint8Array
  )
  const ciphertextBytes = new Uint8Array(ciphertextBuffer)

  // Calculate HMAC-SHA256 over ciphertext (Encrypt-then-MAC)
  const hmacBuffer = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    ciphertextBytes
  )
  const hmacBytes = new Uint8Array(hmacBuffer)

  // Format the inner payload string: salt\nhmac\nciphertext (all hex-encoded)
  const saltHex = bytesToHex(salt)
  const hmacHex = bytesToHex(hmacBytes)
  const ciphertextHex = bytesToHex(ciphertextBytes)
  const innerPayload = `${saltHex}\n${hmacHex}\n${ciphertextHex}`

  // Hex-encode the entire inner payload ASCII string
  const outerPayloadBytes = new TextEncoder().encode(innerPayload)
  const outerPayloadHex = bytesToHex(outerPayloadBytes)

  // Format into lines of exactly 80 characters
  const lines: string[] = []
  for (let i = 0; i < outerPayloadHex.length; i += 80) {
    lines.push(outerPayloadHex.substring(i, i + 80))
  }
  const formattedPayload = lines.join('\n')

  // Construct header
  const header = vaultId
    ? `$ANSIBLE_VAULT;1.2;AES256;${vaultId}`
    : `$ANSIBLE_VAULT;1.1;AES256`

  return `${header}\n${formattedPayload}`
}

/**
 * Decrypts an Ansible Vault AES-256 encrypted format block back into the original raw bytes.
 */
export async function decryptVault(
  vaultText: string,
  password: string
): Promise<Uint8Array> {
  const lines = vaultText.split('\n').map((l) => l.trim()).filter((l) => l !== '')
  if (lines.length < 2) {
    throw new Error('Invalid vault text: too short')
  }

  const header = lines[0]
  if (!header.startsWith('$ANSIBLE_VAULT') || !header.includes('AES256')) {
    throw new Error('Unsupported or invalid Ansible Vault header format')
  }

  // Combine remaining lines to get the outer hex payload
  const outerPayloadHex = lines.slice(1).join('')
  const innerPayloadBytes = hexToBytes(outerPayloadHex)
  const innerPayload = new TextDecoder().decode(innerPayloadBytes)

  // Parse inner payload parts: salt, hmac, ciphertext (separated by newlines)
  const parts = innerPayload.trim().split('\n')
  if (parts.length !== 3) {
    throw new Error('Invalid inner payload structure')
  }

  const salt = hexToBytes(parts[0])
  const expectedHmacBytes = hexToBytes(parts[1])
  const ciphertext = hexToBytes(parts[2])

  // Derive keys
  const { cipherKey, hmacKey, iv } = await deriveVaultKeys(password, salt)

  // Verify HMAC signature first (Encrypt-then-MAC)
  const isHmacValid = await crypto.subtle.verify(
    'HMAC',
    hmacKey,
    expectedHmacBytes as unknown as NonSharedUint8Array,
    ciphertext as unknown as NonSharedUint8Array
  )

  if (!isHmacValid) {
    throw new Error('Decryption failed: Incorrect password or corrupted payload (HMAC verification failed)')
  }

  // Decrypt ciphertext
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: iv as unknown as NonSharedUint8Array,
      length: 128,
    },
    cipherKey,
    ciphertext as unknown as NonSharedUint8Array
  )

  const decryptedPaddedBytes = new Uint8Array(decryptedBuffer)

  // Remove PKCS#7 padding
  return unpadPkcs7(decryptedPaddedBytes)
}
