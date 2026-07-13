import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileKey,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import FileDropInput from '../../components/Tools/FileDropInput'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { encryptVault, decryptVault } from '../../lib/tools/ansibleVault'

const tool = getToolBySlug('ansible-vault')!

export default function AnsibleVault() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt')

  // Encryption States
  const [encSource, setEncryptSource] = useState<'text' | 'file'>('text')
  const [encPlaintext, setEncryptPlaintext] = useState('db_password: "super-secure-production-secret-123!"')
  const [encFile, setEncryptFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [encPassword, setEncryptPassword] = useState('vault-password')
  const [vaultId, setVaultId] = useState('')
  const [encOutput, setEncryptOutput] = useState('')

  // Decryption States
  const [decSource, setDecryptSource] = useState<'text' | 'file'>('text')
  const [decVaultText, setDecryptVaultText] = useState('')
  const [decPassword, setDecryptPassword] = useState('')
  const [decOutputBytes, setDecryptOutputBytes] = useState<Uint8Array | null>(null)
  const [decOutputText, setDecryptOutputText] = useState('')
  const [decError, setDecryptError] = useState<string | null>(null)
  const [decFileName, setDecryptFileName] = useState<string | null>(null)

  const { copy, copiedId } = useClipboardCopy()

  // Run Encryption
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const input = encSource === 'text'
          ? encPlaintext
          : (encFile?.bytes || new Uint8Array())

        if (encSource === 'file' && !encFile) {
          setEncryptOutput('')
          return
        }

        const out = await encryptVault(input, encPassword, vaultId || undefined)
        if (!cancelled) {
          setEncryptOutput(out)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          setEncryptOutput(`Encryption failed: ${msg}`)
        }
      }
    }

    const timer = setTimeout(() => {
      run()
    }, 150) // Debounce heavy PBKDF2 runs

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [encSource, encPlaintext, encFile, encPassword, vaultId])

  // Run Decryption
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!decVaultText.trim() || !decPassword) {
        setDecryptOutputBytes(null)
        setDecryptOutputText('')
        setDecryptError(null)
        return
      }

      try {
        const decryptedBytes = await decryptVault(decVaultText, decPassword)
        if (!cancelled) {
          setDecryptOutputBytes(decryptedBytes)
          setDecryptError(null)

          // Try to decode as UTF-8 text for display
          try {
            const decoded = new TextDecoder('utf-8', { fatal: true }).decode(decryptedBytes)
            setDecryptOutputText(decoded)
          } catch {
            setDecryptOutputText('') // Binary data, can't represent as UTF-8
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDecryptOutputBytes(null)
          setDecryptOutputText('')
          const msg = err instanceof Error ? err.message : String(err)
          setDecryptError(msg || 'Decryption failed')
        }
      }
    }

    const timer = setTimeout(() => {
      run()
    }, 150)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [decVaultText, decPassword])

  // Handle Encrypt File Drop
  const handleEncryptFile = (_file: File, buffer: ArrayBuffer) => {
    setEncryptFile({
      name: _file.name,
      bytes: new Uint8Array(buffer),
    })
  }

  // Handle Decrypt File Drop
  const handleDecryptFile = (_file: File, buffer: ArrayBuffer) => {
    setDecryptFileName(_file.name)
    const text = new TextDecoder().decode(buffer)
    setDecryptVaultText(text)
  }

  // Download Encrypted File
  const downloadEncrypted = () => {
    const filename = encSource === 'file' && encFile
      ? `${encFile.name}.vault`
      : 'secret.yml'

    const blob = new Blob([encOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download Decrypted File
  const downloadDecrypted = () => {
    if (!decOutputBytes) return
    const filename = decFileName
      ? decFileName.replace(/\.(vault|yml|yaml|enc)$/i, '') + '.decrypted'
      : 'decrypted-secret.txt'

    const blob = new Blob([decOutputBytes as unknown as BlobPart], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageShell tool={tool}>
      {/* Tab Navigation */}
      <div className="flex border-b border-border-subtle mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('encrypt')}
          className={`px-5 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'encrypt'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4" /> Encrypt Secrets (Vault)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decrypt')}
          className={`px-5 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'decrypt'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Unlock className="w-4 h-4" /> Decrypt Secrets (Unvault)
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* --- LEFT SIDE: INPUT CONTROLS --- */}
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
          {activeTab === 'encrypt' ? (
            // ENCRYPT CONTROLS
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Secrets Source</span>
                <div className="flex bg-bg-sidebar rounded-lg p-0.5 border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setEncryptSource('text')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      encSource === 'text' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Plaintext
                  </button>
                  <button
                    type="button"
                    onClick={() => setEncryptSource('file')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      encSource === 'file' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    File
                  </button>
                </div>
              </div>

              {encSource === 'text' ? (
                <div>
                  <label htmlFor="enc-plaintext" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Plaintext Secret</label>
                  <textarea
                    id="enc-plaintext"
                    value={encPlaintext}
                    onChange={(e) => setEncryptPlaintext(e.target.value)}
                    className="w-full h-32 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Upload Secret File</label>
                  <FileDropInput onFile={handleEncryptFile} hint="Encrypt any configuration file, binary, or private key entirely in your browser." />
                  {encFile && (
                    <div className="mt-2 p-2.5 rounded bg-bg-sidebar border border-border-subtle/50 flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4 text-accent-primary" />
                      <span className="font-mono text-text-primary truncate">{encFile.name}</span>
                      <span className="text-text-muted ml-auto font-semibold">({(encFile.bytes.length / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="enc-password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Vault Password</label>
                  <input
                    id="enc-password"
                    type="password"
                    value={encPassword}
                    onChange={(e) => setEncryptPassword(e.target.value)}
                    placeholder="Enter passphrase…"
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label htmlFor="enc-vault-id" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Vault ID Label <span className="text-text-muted font-normal text-[10px]">(Optional, 1.2)</span></label>
                  <input
                    id="enc-vault-id"
                    type="text"
                    value={vaultId}
                    onChange={(e) => setVaultId(e.target.value)}
                    placeholder="e.g. dev, prod"
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>
            </>
          ) : (
            // DECRYPT CONTROLS
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Vault Input Source</span>
                <div className="flex bg-bg-sidebar rounded-lg p-0.5 border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setDecryptSource('text')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      decSource === 'text' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecryptSource('file')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      decSource === 'file' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    File
                  </button>
                </div>
              </div>

              {decSource === 'text' ? (
                <div>
                  <label htmlFor="dec-vaulttext" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Encrypted Vault Block</label>
                  <textarea
                    id="dec-vaulttext"
                    value={decVaultText}
                    onChange={(e) => setDecryptVaultText(e.target.value)}
                    placeholder="Paste $ANSIBLE_VAULT block here…"
                    className="w-full h-32 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Upload Vault File</label>
                  <FileDropInput onFile={handleDecryptFile} hint="Drop an encrypted .yml or .vault file here." />
                  {decFileName && (
                    <div className="mt-2 p-2.5 rounded bg-bg-sidebar border border-border-subtle/50 flex items-center gap-2 text-xs">
                      <FileKey className="w-4 h-4 text-accent-primary" />
                      <span className="font-mono text-text-primary truncate">{decFileName}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="dec-password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Vault Password</label>
                <input
                  id="dec-password"
                  type="password"
                  value={decPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  placeholder="Enter vault password to decrypt…"
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* --- RIGHT SIDE: OUTPUT VIEWER --- */}
        <div className="space-y-4">
          {activeTab === 'encrypt' ? (
            // ENCRYPT OUTPUT
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Encrypted Vault Text</span>
                {encOutput && !encOutput.startsWith('Encryption failed') && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copy(encOutput, 'enc-vault')}
                      aria-label="Copy Encrypted Payload"
                      className="p-1.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-muted hover:text-text-primary hover:border-accent-primary transition-all"
                    >
                      {copiedId === 'enc-vault' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={downloadEncrypted}
                      aria-label="Download Encrypted file"
                      className="p-1.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-muted hover:text-text-primary hover:border-accent-primary transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-48 bg-bg-sidebar rounded-lg border border-border-subtle p-3.5 font-mono text-[10px] text-text-primary overflow-y-auto break-all max-h-72 select-all">
                {encOutput ? (
                  <pre className="whitespace-pre-wrap leading-relaxed select-text">{encOutput}</pre>
                ) : (
                  <p className="text-text-muted italic">Provide a secret and password to generate the vault output…</p>
                )}
              </div>
            </div>
          ) : (
            // DECRYPT OUTPUT
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-3">Decrypted Secret</span>

                {decError && (
                  <div className="p-4 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Integrity Verification Failed</p>
                    <p className="font-mono text-[10px]">{decError}</p>
                  </div>
                )}

                {decOutputBytes && !decError && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Symmetric Key Integrity Authenticated</span>
                    </div>

                    {decOutputText ? (
                      <div className="relative">
                        <div className="absolute right-2 top-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => copy(decOutputText, 'dec-text')}
                            className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                          >
                            {copiedId === 'dec-text' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={downloadDecrypted}
                            className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                        <pre className="w-full p-3.5 rounded-lg bg-bg-sidebar font-mono text-xs text-text-primary border border-border-subtle max-h-60 overflow-y-auto whitespace-pre break-all select-text">
                          {decOutputText}
                        </pre>
                      </div>
                    ) : (
                      // Decrypted binary file details
                      <div className="p-5 rounded-lg bg-bg-sidebar border border-border-subtle flex flex-col items-center justify-center text-center space-y-3">
                        <FileKey className="w-10 h-10 text-accent-primary" />
                        <div>
                          <p className="text-xs font-bold text-text-primary">Decrypted Binary Resource</p>
                          <p className="text-[10px] text-text-muted mt-1">This decrypted resource is a binary payload (non-printable UTF-8).</p>
                        </div>
                        <button
                          type="button"
                          onClick={downloadDecrypted}
                          className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition-all"
                        >
                          <Download className="w-4 h-4" /> Download Decrypted Bytes ({ (decOutputBytes.length / 1024).toFixed(1) } KB)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!decOutputBytes && !decError && (
                  <p className="text-text-muted text-xs italic">Provide an encrypted vault payload and password to decrypt…</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
