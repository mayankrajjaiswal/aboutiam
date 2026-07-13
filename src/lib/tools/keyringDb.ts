/**
 * Secure local IndexedDB storage wrapper for the HSM Cryptographic Key Ring.
 * Stores generated CryptoKey objects in browser sandbox with 100% data privacy.
 */

export interface HSMKeyRecord {
  id: string
  name: string
  type: 'RSA-2048' | 'ECDSA-P256' | 'AES-GCM-256'
  publicKeyJwk?: unknown
  privateKey?: CryptoKey // Only non-extractable keys are stored securely
  publicKey?: CryptoKey
  symmetricKey?: CryptoKey
  createdAt: string
}

const DB_NAME = 'AboutIAM_HSM_Vault'
const STORE_NAME = 'keys'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Defensive check for server-side static generation environments (SSR)
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in non-browser environments.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Saves a cryptographic key record to the local IndexedDB.
 */
export async function saveKeyRecord(record: HSMKeyRecord): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(record)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Fetches all local HSM key records.
 */
export async function getAllKeyRecords(): Promise<HSMKeyRecord[]> {
  // SSR Safety Check
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return []
  }

  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  } catch {
    return []
  }
}

/**
 * Deletes a cryptographic key by ID.
 */
export async function deleteKeyRecord(id: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
