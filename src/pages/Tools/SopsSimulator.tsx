import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Lock,
  Unlock,
} from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import type { SopsKeyProvider } from '../../lib/tools/sops'
import { encryptSops, decryptSops } from '../../lib/tools/sops'

const tool = getToolBySlug('sops-simulator')!

const YAML_TEMPLATE = `# Multi-environment database coordinates
environment: production
db_host: postgres-prod.internal.net
db_port: 5432
db_username: deployment_manager

# Confidential credential parameters (will match regex)
db_password: "production-db-unbreakable-password-2026!"
api_secret_token: 'secret-api-token-xyz-789'
private_ssh_key: '-----BEGIN OPENSSH PRIVATE KEY-----\\nb3BlbnNzaC1rZXktdjEAAAA...'

# Flag to allow public metrics
metrics_enabled: true
`.trim()

const JSON_TEMPLATE = `{
  "environment": "production",
  "db_host": "postgres-prod.internal.net",
  "db_port": 5432,
  "db_username": "deployment_manager",
  "db_password": "production-db-unbreakable-password-2026!",
  "api_secret_token": "secret-api-token-xyz-789",
  "private_ssh_key": "-----BEGIN OPENSSH PRIVATE KEY-----\\nb3BlbnNzaC1rZXktdjEAAAA...",
  "metrics_enabled": true
}`

export default function SopsSimulator() {
  const [activeMode, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml')

  // Encryption States
  const [cleartext, setCleartext] = useState(YAML_TEMPLATE)
  const [encryptedOutput, setEncryptedOutput] = useState('')
  const [keyProvider, setKeyProvider] = useState<SopsKeyProvider>('aws_kms')
  const [providerId, setProviderId] = useState('arn:aws:kms:us-east-1:123456789012:key/sops-simulator-key-id')
  const [encryptedRegex, setEncryptedRegex] = useState('^(db_password|api_secret_token|private_ssh_key)$')
  const [encPassword, setEncPassword] = useState('sops-default-pass')

  // Decryption States
  const [encryptedInput, setEncryptedInput] = useState('')
  const [decryptedOutput, setDecryptedOutput] = useState('')
  const [decPassword, setDecPassword] = useState('sops-default-pass')
  const [decError, setDecError] = useState<string | null>(null)

  const { copy, copiedId } = useClipboardCopy()

  // Run SOPS Encryption
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!cleartext.trim()) {
        setEncryptedOutput('')
        return
      }

      try {
        const out = await encryptSops(cleartext, {
          encryptedRegex,
          keyProvider,
          providerId,
          password: encPassword,
        })
        if (!cancelled) {
          setEncryptedOutput(out)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          setEncryptedOutput(`Encryption failed: ${msg}`)
        }
      }
    }

    const timer = setTimeout(run, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [cleartext, encryptedRegex, keyProvider, providerId, encPassword])

  // Run SOPS Decryption
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!encryptedInput.trim()) {
        setDecryptedOutput('')
        setDecError(null)
        return
      }

      try {
        const out = await decryptSops(encryptedInput, decPassword)
        if (!cancelled) {
          setDecryptedOutput(out)
          setDecError(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDecryptedOutput('')
          const msg = err instanceof Error ? err.message : String(err)
          setDecError(msg || 'Decryption failed')
        }
      }
    }

    const timer = setTimeout(run, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [encryptedInput, decPassword])

  // Download Encrypted File
  const downloadEncrypted = () => {
    const filename = format === 'yaml' ? 'secrets.sops.yaml' : 'secrets.sops.json'
    const blob = new Blob([encryptedOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download Decrypted File
  const downloadDecrypted = () => {
    const filename = encryptedInput.trim().startsWith('{') ? 'secrets.dec.json' : 'secrets.dec.yaml'
    const blob = new Blob([decryptedOutput], { type: 'text/plain;charset=utf-8' })
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
            activeMode === 'encrypt'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4" /> SOPS Encrypt (Envelope)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('decrypt')
            // Pre-fill decryption input with encryption output if available!
            if (encryptedOutput && !encryptedOutput.startsWith('Encryption failed')) {
              setEncryptedInput(encryptedOutput)
            }
          }}
          className={`px-5 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeMode === 'decrypt'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Unlock className="w-4 h-4" /> SOPS Decrypt (Verify)
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* --- LEFT SIDE: CONFIG & INPUTS --- */}
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
          {activeMode === 'encrypt' ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Format</span>
                <div className="flex bg-bg-sidebar rounded-lg p-0.5 border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => {
                      setFormat('yaml')
                      setCleartext(YAML_TEMPLATE)
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      format === 'yaml' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    YAML
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormat('json')
                      setCleartext(JSON_TEMPLATE)
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      format === 'json' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="cleartext" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Plaintext Configuration</label>
                <textarea
                  id="cleartext"
                  value={cleartext}
                  onChange={(e) => setCleartext(e.target.value)}
                  className="w-full h-48 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                  spellCheck={false}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="key-provider" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">KMS Key Provider (KEK)</label>
                  <select
                    id="key-provider"
                    value={keyProvider}
                    onChange={(e) => {
                      const prov = e.target.value as SopsKeyProvider
                      setKeyProvider(prov)
                      if (prov === 'aws_kms') {
                        setProviderId('arn:aws:kms:us-east-1:123456789012:key/sops-simulator-key-id')
                      } else if (prov === 'azure_kv') {
                        setProviderId('https://allaboutiam.vault.azure.net/keys/sops-dek-key')
                      } else if (prov === 'hc_vault') {
                        setProviderId('secret/data/production/sops')
                      } else if (prov === 'age') {
                        setProviderId('age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p')
                      }
                    }}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-bold text-xs focus:outline-none focus:border-accent-primary"
                  >
                    <option value="aws_kms">AWS KMS (Symmetric)</option>
                    <option value="azure_kv">Azure Key Vault (REST)</option>
                    <option value="hc_vault">HashiCorp Vault Transit</option>
                    <option value="age">Age (Asymmetric Pair)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="encrypted-regex" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Encrypted Keys Regex</label>
                  <input
                    id="encrypted-regex"
                    type="text"
                    value={encryptedRegex}
                    onChange={(e) => setEncryptedRegex(e.target.value)}
                    placeholder="Regex of keys to encrypt…"
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="provider-id" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Provider Identifier (KMS ARN / Key URL)</label>
                  <input
                    id="provider-id"
                    type="text"
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-[10px] focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label htmlFor="enc-pass" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">DEK Simulation Password</label>
                  <input
                    id="enc-pass"
                    type="password"
                    value={encPassword}
                    onChange={(e) => setEncPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>
            </>
          ) : (
            // DECRYPT INPUTS
            <>
              <div>
                <label htmlFor="encrypted-input" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Encrypted SOPS Content</label>
                <textarea
                  id="encrypted-input"
                  value={encryptedInput}
                  onChange={(e) => setEncryptedInput(e.target.value)}
                  placeholder="Paste SOPS encrypted YAML/JSON containing ENC[AES256_GCM...] blocks here…"
                  className="w-full h-72 p-3 rounded-lg bg-bg-sidebar text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none"
                  spellCheck={false}
                />
              </div>

              <div>
                <label htmlFor="dec-password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">DEK Simulation Password</label>
                <input
                  id="dec-password"
                  type="password"
                  value={decPassword}
                  onChange={(e) => setDecPassword(e.target.value)}
                  placeholder="Enter simulating password used during encryption…"
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* --- RIGHT SIDE: RESULTS VIEWER --- */}
        <div className="space-y-4">
          {activeMode === 'encrypt' ? (
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">SOPS Encrypted Configuration</span>
                  {encryptedOutput && !encryptedOutput.startsWith('Encryption failed') && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy(encryptedOutput, 'sops-output')}
                        aria-label="Copy SOPS output"
                        className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                      >
                        {copiedId === 'sops-output' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={downloadEncrypted}
                        aria-label="Download SOPS file"
                        className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg flex items-center gap-2 text-[11px] font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Envelope Key Architecture Established (AES-256-GCM + {keyProvider.toUpperCase()})</span>
                </div>

                <pre className="w-full p-3.5 rounded-lg bg-bg-sidebar font-mono text-[10px] text-text-primary border border-border-subtle max-h-96 overflow-y-auto whitespace-pre break-all select-text">
                  {encryptedOutput || 'Generating encrypted block…'}
                </pre>
              </div>
            </div>
          ) : (
            // DECRYPT MODE
            <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Decrypted Configuration</span>
                  {decryptedOutput && !decError && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy(decryptedOutput, 'dec-sops')}
                        className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                      >
                        {copiedId === 'dec-sops' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={downloadDecrypted}
                        className="p-1.5 rounded bg-bg-sidebar border border-border-subtle/50 text-text-muted hover:text-text-primary"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {decError && (
                  <div className="p-4 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Envelope Decryption Failed</p>
                    <p className="font-mono text-[10px]">{decError}</p>
                  </div>
                )}

                {decryptedOutput && !decError && (
                  <>
                    <div className="p-3.5 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg flex items-center gap-2 text-[11px] font-bold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Integrity MAC Valid & DEK Successfully Unwrapped</span>
                    </div>

                    <pre className="w-full p-3.5 rounded-lg bg-bg-sidebar font-mono text-xs text-text-primary border border-border-subtle max-h-96 overflow-y-auto whitespace-pre break-all select-text">
                      {decryptedOutput}
                    </pre>
                  </>
                )}

                {!decryptedOutput && !decError && (
                  <p className="text-text-muted text-xs italic">Provide a SOPS encrypted payload and password to decrypt…</p>
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
