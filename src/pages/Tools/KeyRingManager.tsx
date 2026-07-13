/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import {
  KeySquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { saveKeyRecord, getAllKeyRecords, deleteKeyRecord } from '../../lib/tools/keyringDb'
import type { HSMKeyRecord } from '../../lib/tools/keyringDb'
import { bytesToHex } from '../../lib/tools/hash'

const tool = getToolBySlug('keyring-manager') || {
  slug: 'keyring-manager',
  title: 'Hardware Key Ring & HSM Emulator',
  description: 'Generate, store, and execute asymmetric and symmetric cryptographic keys locally inside your browser\'s secure sandbox — emulating a corporate Hardware Security Module (HSM).',
  category: 'Hashing, Encoding & Secrets',
  icon: KeySquare,
  phase: 3,
  status: 'live',
  keywords: ['hsm emulator', 'cryptographic keyring', 'rsa keygen online', 'aes-gcm generator'],
  analogy: 'A Hardware Security Module (HSM) is like an un-hackable, armored bank vault where security keys are stamped and used. Instead of carrying keys around in your pocket (where they can be copied or lost), keys are locked inside the vault forever. When you need to sign a letter, you slide it through a tiny slot in the vault door, and the vault stamps it securely and slides it back out—the key itself never, ever leaves the vault.',
  expert: 'Utilizes the browser\'s native Web Crypto API and IndexedDB to emulate HSM boundaries. Private and symmetric keys are marked extractable: false on generation, ensuring they can never be extracted or leaked via JavaScript or XSS. Signed assertions use RSASSA-PKCS1-v1_5 or ECDSA P-256 signatures, while data encryption leverages AES-GCM-256 authenticated ciphers with unique 12-byte initialization vectors.',
  faqs: [
    { q: 'Can my private keys be stolen from this web page?', a: 'No. On generation, keys are marked as non-extractable (extractable: false) and stored directly in the browser\'s IndexedDB. This mimics physical HSM boundaries: the private key resides in a secure memory register and cannot be read, copied, or serialized by JavaScript, protecting you from XSS theft.' },
    { q: 'Is it safe to generate keys here?', a: 'Yes. All key generation, signing, and encryption are executed 100% locally inside your device using standard browser-native hardware entropy sources. No data is ever transmitted over the network.' }
  ]
}

export default function KeyRingManager() {
  const [keys, setKeys] = useState<HSMKeyRecord[]>([])
  
  // Generation States
  const [keyName, setKeyName] = useState('billing_signing_key_2026')
  const [keyType, setKeyType] = useState<'RSA-2048' | 'ECDSA-P256' | 'AES-GCM-256'>('RSA-2048')
  
  // Interactive Operations States
  const [selectedKeyId, setSelectedNodeId] = useState('')
  const [plainInput, setPlainInput] = useState('Confidential financial transaction payload: $4,500.00 USD')
  
  // Sign/Verify States
  const [signatureHex, setSignatureHex] = useState('')
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  
  // Encrypt/Decrypt States
  const [encryptedHex, setEncryptedHex] = useState('')
  const [encryptedIvHex, setEncryptedIvHex] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [errorLog, setErrorLog] = useState<string | null>(null)



  const activeKey = keys.find(k => k.id === selectedKeyId)

  const loadKeys = async () => {
    try {
      const records = await getAllKeyRecords()
      setKeys(records)
      if (records.length > 0 && !selectedKeyId) {
        setSelectedNodeId(records[0].id)
      }
    } catch {
      // Ignored in SSR
    }
  }

  // Fetch keys on mount
  useEffect(() => {
    setTimeout(() => loadKeys(), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Generate Key
  const handleGenerateKey = async () => {
    if (!keyName.trim()) return
    setErrorLog(null)

    try {
      // eslint-disable-next-line react-hooks/purity
      const id = 'key-' + Math.random().toString(36).substring(2, 11)
      const createdAt = new Date().toISOString()
      let record: HSMKeyRecord

      if (keyType === 'RSA-2048') {
        const pair = await window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
          },
          false, // private key remains non-extractable (mimics HSM!)
          ['sign', 'verify']
        )
        const jwk = await window.crypto.subtle.exportKey('jwk', pair.publicKey)
        record = { id, name: keyName, type: 'RSA-2048', publicKeyJwk: jwk, privateKey: pair.privateKey, publicKey: pair.publicKey, createdAt }
      } else if (keyType === 'ECDSA-P256') {
        const pair = await window.crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256'
          },
          false,
          ['sign', 'verify']
        )
        const jwk = await window.crypto.subtle.exportKey('jwk', pair.publicKey)
        record = { id, name: keyName, type: 'ECDSA-P256', publicKeyJwk: jwk, privateKey: pair.privateKey, publicKey: pair.publicKey, createdAt }
      } else {
        const key = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256
          },
          false, // symmetric key is non-extractable
          ['encrypt', 'decrypt']
        )
        record = { id, name: keyName, type: 'AES-GCM-256', symmetricKey: key, createdAt }
      }

      await saveKeyRecord(record)
      // eslint-disable-next-line react-hooks/purity
      setKeyName(`key_${Math.random().toString(36).substring(7)}`)
      await loadKeys()
      setSelectedNodeId(id)
      resetOperations()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorLog(msg || 'Key generation failed.')
    }
  }

  // Delete Key
  const handleDeleteKey = async (id: string) => {
    try {
      await deleteKeyRecord(id)
      await loadKeys()
      if (selectedKeyId === id) {
        setSelectedNodeId('')
        resetOperations()
      }
    } catch {
      // Ignored
    }
  }

  const resetOperations = () => {
    setSignatureHex('')
    setVerificationResult(null)
    setEncryptedHex('')
    setEncryptedIvHex('')
    setDecryptedText('')
    setErrorLog(null)
  }

  // Cryptographic Signing
  const handleSign = async () => {
    if (!activeKey || !activeKey.privateKey) return
    setErrorLog(null)
    setVerificationResult(null)

    try {
      const data = new TextEncoder().encode(plainInput)
      let signatureBuffer: ArrayBuffer

      if (activeKey.type === 'RSA-2048') {
        signatureBuffer = await window.crypto.subtle.sign(
          'RSASSA-PKCS1-v1_5',
          activeKey.privateKey,
          data
        )
      } else {
        signatureBuffer = await window.crypto.subtle.sign(
          { name: 'ECDSA', hash: 'SHA-256' },
          activeKey.privateKey,
          data
        )
      }

      setSignatureHex(bytesToHex(new Uint8Array(signatureBuffer)))
    } catch (err: any) {
      setErrorLog(err.message || 'Signing operation failed.')
    }
  }

  // Cryptographic Verification
  const handleVerify = async () => {
    if (!activeKey || !activeKey.publicKey || !signatureHex) return
    setErrorLog(null)

    try {
      const data = new TextEncoder().encode(plainInput)
      const cleanHex = signatureHex.replace(/\s+/g, '')
      const sigBytes = new Uint8Array(cleanHex.length / 2)
      for (let i = 0; i < sigBytes.length; i++) {
        sigBytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16)
      }

      let isVerified = false
      if (activeKey.type === 'RSA-2048') {
        isVerified = await window.crypto.subtle.verify(
          'RSASSA-PKCS1-v1_5',
          activeKey.publicKey,
          sigBytes,
          data
        )
      } else {
        isVerified = await window.crypto.subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          activeKey.publicKey,
          sigBytes,
          data
        )
      }

      setVerificationResult(isVerified)
    } catch (err: any) {
      setErrorLog(err.message || 'Verification operation failed.')
      setVerificationResult(false)
    }
  }

  // Symmetric Data Encryption
  const handleEncrypt = async () => {
    if (!activeKey || !activeKey.symmetricKey) return
    setErrorLog(null)
    setDecryptedText('')

    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(12)) // AES-GCM IV is 12 bytes
      const data = new TextEncoder().encode(plainInput)

      const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        activeKey.symmetricKey,
        data
      )

      setEncryptedHex(bytesToHex(new Uint8Array(ciphertextBuffer)))
      setEncryptedIvHex(bytesToHex(iv))
    } catch (err: any) {
      setErrorLog(err.message || 'Encryption operation failed.')
    }
  }

  // Symmetric Data Decryption
  const handleDecrypt = async () => {
    if (!activeKey || !activeKey.symmetricKey || !encryptedHex || !encryptedIvHex) return
    setErrorLog(null)

    try {
      // Decode IV Hex
      const ivBytes = new Uint8Array(12)
      for (let i = 0; i < 12; i++) {
        ivBytes[i] = parseInt(encryptedIvHex.substring(i * 2, i * 2 + 2), 16)
      }

      // Decode Ciphertext Hex
      const cleanHex = encryptedHex.replace(/\s+/g, '')
      const cipherBytes = new Uint8Array(cleanHex.length / 2)
      for (let i = 0; i < cipherBytes.length; i++) {
        cipherBytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16)
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes
        },
        activeKey.symmetricKey,
        cipherBytes
      )

      setDecryptedText(new TextDecoder().decode(decryptedBuffer))
    } catch (err: any) {
      setErrorLog(err.message || 'Decryption failed: Ciphertext or IV modified.')
    }
  }

  const downloadPublicJwk = () => {
    if (!activeKey || !activeKey.publicKeyJwk) return
    const content = JSON.stringify(activeKey.publicKeyJwk, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeKey.name}-public-key.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: KEYRING CONTROLS & GENERATOR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Generator card */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider block border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 shrink-0" /> Generate Safe Cryptographic Key
            </span>

            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="key-name-input" className="block text-[10px] font-bold text-text-muted uppercase">Key Alias Label</label>
                <input
                  id="key-name-input"
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="key-type-select" className="block text-[10px] font-bold text-text-muted uppercase">Key Mechanism</label>
                <select
                  id="key-type-select"
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary text-xs font-bold focus:outline-none focus:border-accent-primary"
                >
                  <option value="RSA-2048">RSA-2048 Signature Key (asymmetric)</option>
                  <option value="ECDSA-P256">ECDSA P-256 Curve (asymmetric)</option>
                  <option value="AES-GCM-256">AES-GCM-256 Block Cipher (symmetric)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateKey}
                className="w-full mt-2 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-black shadow-sm transition"
              >
                Generate Key inside HSM
              </button>
            </div>
          </div>

          {/* Key Ring Vault Safe List */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-[280px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle pb-1.5">
                HSM Safe Vault Keys ({keys.length})
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto mt-2 pr-1">
                {keys.length === 0 ? (
                  <p className="text-text-muted text-xs italic py-4 text-center">No keys generated inside the vault.</p>
                ) : (
                  keys.map((k) => {
                    const selected = k.id === selectedKeyId
                    return (
                      <div
                        key={k.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selected 
                            ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow-sm' 
                            : 'bg-bg-sidebar/30 border-border-subtle text-text-secondary hover:border-border-subtle'
                        }`}
                        onClick={() => {
                          setSelectedNodeId(k.id)
                          resetOperations()
                        }}
                      >
                        <div className="space-y-0.5 truncate select-none">
                          <p className="text-xs truncate">{k.name}</p>
                          <p className="text-[9px] text-text-muted truncate font-mono">{k.type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteKey(k.id)
                          }}
                          className="p-1 rounded hover:bg-status-danger/10 text-text-muted hover:text-status-danger transition"
                          title="Destroy Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE OPERATIONS */}
        <div className="lg:col-span-2 space-y-6">
          {activeKey ? (
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-border-subtle pb-2.5 mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider">HSM Safe Operation Board</span>
                    <h3 className="text-sm font-black text-text-primary">Alias: {activeKey.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-bg-nested text-text-secondary font-mono text-[9px] font-bold">
                    {activeKey.type}
                  </span>
                </div>

                {/* Operations UI */}
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Action Box: Plain Payload */}
                  <div className="space-y-3">
                    <label htmlFor="plain-payload-input" className="block text-[10px] font-black text-text-muted uppercase">Payload Cleartext</label>
                    <textarea
                      id="plain-payload-input"
                      value={plainInput}
                      onChange={(e) => {
                        setPlainInput(e.target.value)
                        setSignatureHex('')
                        setVerificationResult(null)
                        setEncryptedHex('')
                        setDecryptedText('')
                      }}
                      className="w-full h-32 p-3 bg-bg-sidebar border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-primary resize-none font-sans"
                    />

                    <div className="flex gap-2.5">
                      {activeKey.publicKey ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSign}
                            className="flex-1 py-2 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-lg text-xs transition"
                          >
                            Sign Payload
                          </button>
                          <button
                            type="button"
                            onClick={downloadPublicJwk}
                            className="p-2 bg-bg-sidebar hover:bg-bg-nested border border-border-subtle text-text-muted hover:text-text-primary rounded-lg transition"
                            title="Export Public JWK"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleEncrypt}
                          className="w-full py-2 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-lg text-xs transition"
                        >
                          Encrypt Payload (GCM)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Action Box: Cryptographic Results */}
                  <div className="space-y-4">
                    {activeKey.publicKey ? (
                      // ASYMMETRIC SIGN / VERIFY OPERATIONS PANEL
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="sig-output-box" className="block text-[10px] font-black text-text-muted uppercase">Digital Signature output (Hex)</label>
                          <textarea
                            id="sig-output-box"
                            value={signatureHex}
                            onChange={(e) => {
                              setSignatureHex(e.target.value)
                              setVerificationResult(null)
                            }}
                            placeholder="Generate signature, or paste custom signature..."
                            className="w-full h-24 p-3 bg-bg-sidebar border border-border-subtle rounded-xl font-mono text-[9px] text-text-secondary focus:outline-none focus:border-accent-primary resize-none select-all break-all leading-normal"
                          />
                        </div>

                        {signatureHex && (
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={handleVerify}
                              className="w-full py-2 bg-accent-secondary hover:bg-accent-secondary/90 text-white font-bold rounded-lg text-xs transition"
                            >
                              Verify Signature Integrity
                            </button>

                            {verificationResult !== null && (
                              <div className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                verificationResult 
                                  ? 'bg-status-success/10 border-status-success/20 text-status-success' 
                                  : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
                              }`}>
                                {verificationResult ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" /> Signature verified successfully!
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-4 h-4 animate-bounce" /> Invalid signature hash match!
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // SYMMETRIC ENCRYPT / DECRYPT OPERATIONS PANEL
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label htmlFor="cipher-output-box" className="block text-[10px] font-black text-text-muted uppercase">AES-GCM Ciphertext output (Hex)</label>
                          <textarea
                            id="cipher-output-box"
                            value={encryptedHex}
                            onChange={(e) => setEncryptedHex(e.target.value)}
                            placeholder="Encrypted ciphertext hex..."
                            className="w-full h-16 p-2 bg-bg-sidebar border border-border-subtle rounded-xl font-mono text-[9px] text-text-secondary focus:outline-none focus:border-accent-primary resize-none select-all break-all leading-normal"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label htmlFor="cipher-iv-box" className="block text-[9px] font-black text-text-muted uppercase">Initialization Vector (IV)</label>
                            <input
                              id="cipher-iv-box"
                              type="text"
                              value={encryptedIvHex}
                              onChange={(e) => setEncryptedIvHex(e.target.value)}
                              className="w-full p-2 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-[9px] focus:outline-none focus:border-accent-primary"
                            />
                          </div>

                          <div className="col-span-1 pt-4">
                            <button
                              type="button"
                              disabled={!encryptedHex || !encryptedIvHex}
                              onClick={handleDecrypt}
                              className="w-full py-2 bg-accent-secondary hover:bg-accent-secondary/90 text-white font-bold rounded-lg text-xs transition disabled:opacity-40"
                            >
                              Decrypt
                            </button>
                          </div>
                        </div>

                        {decryptedText && (
                          <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/20 text-xs font-bold space-y-1 text-status-success animate-fadeIn font-mono">
                            <span className="text-[10px] font-black text-text-muted uppercase block border-b border-border-subtle/30 pb-0.5">Decrypted Cleartext:</span>
                            <p className="select-text pt-1">"{decryptedText}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {errorLog && (
                <div className="p-3 mt-4 rounded-lg bg-status-danger/10 border border-status-danger/20 text-[10px] font-mono text-status-danger flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Error: {errorLog}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle text-center py-12 text-text-muted text-xs italic shadow-sm min-h-[460px] flex items-center justify-center">
              Generate a key in the local HSM on the left to begin active cryptographic safe operations…
            </div>
          )}
        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
