import { useState, useMemo } from 'react'
import { Check, Copy } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('passphrase-entropy')!

export default function PassphraseEntropy() {
  const { copy, copiedId } = useClipboardCopy()

  // Standard password inputs
  const [password, setPassword] = useState('Tr0ub4dor&3')
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)

  // Passphrase inputs
  const [passphrase, setPassphrase] = useState('correct horse battery staple')

  // Math helper for offline crack time translation
  const getCrackTimeText = (entropyBits: number) => {
    if (entropyBits <= 0) return 'Instant'
    
    const guesses = Math.pow(2, entropyBits)
    const guessesPerSecond = 100_000_000_000 // 100 Billion hashes/sec rig
    const seconds = guesses / (2 * guessesPerSecond)

    if (seconds < 1) return 'Instant'
    if (seconds < 60) return `${Math.round(seconds)} seconds`
    
    const minutes = seconds / 60
    if (minutes < 60) return `${Math.round(minutes)} minutes`
    
    const hours = minutes / 60
    if (hours < 24) return `${Math.round(hours)} hours`
    
    const days = hours / 24
    if (days < 365) return `${Math.round(days)} days`
    
    const years = days / 365
    if (years < 1000) return `${Math.round(years)} years`
    if (years < 1_000_000) return `${Math.round(years / 1000)} thousand years`
    if (years < 1_000_000_000) return `${Math.round(years / 1_000_000)} million years`
    return `${Math.round(years / 1_000_000_000)} billion years`
  }

  // --- PASSWORD ENTROPY CALCULATION ---
  const passwordResult = useMemo(() => {
    let poolSize = 0
    if (useLower) poolSize += 26
    if (useUpper) poolSize += 26
    if (useNumbers) poolSize += 10
    if (useSymbols) poolSize += 32

    if (poolSize === 0 || !password.length) {
      return { entropy: 0, crackTime: 'Instant' }
    }

    // Entropy: E = L * log2(P)
    const entropy = password.length * Math.log2(poolSize)
    return {
      entropy: Math.round(entropy),
      crackTime: getCrackTimeText(entropy)
    }
  }, [password, useUpper, useLower, useNumbers, useSymbols])

  // --- PASSPHRASE ENTROPY CALCULATION ---
  const passphraseResult = useMemo(() => {
    const words = passphrase.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      return { entropy: 0, crackTime: 'Instant', wordCount: 0 }
    }

    // We assume a robust dictionary of 7,776 words (standard EFF Diceware)
    const dicewarePoolSize = 7776
    const entropy = words.length * Math.log2(dicewarePoolSize)

    return {
      entropy: Math.round(entropy),
      crackTime: getCrackTimeText(entropy),
      wordCount: words.length
    }
  }, [passphrase])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Standard Password Entropy */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between shadow-sm min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Standard Password Calculator
              </span>
              <button type="button" onClick={() => copy(password, 'pwd')} className="text-text-muted hover:text-text-primary">
                {copiedId === 'pwd' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[10px] text-text-muted leading-relaxed mb-3">
              Calculates structural entropy based on standard shufflings of uppercase, lowercase, numbers, and symbols.
            </p>

            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-bg-sidebar border border-border-subtle rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono font-bold"
            />

            {/* Checkset selectors */}
            <div className="grid grid-cols-2 gap-2 pt-3.5 text-[10px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary font-bold">
                <input type="checkbox" checked={useLower} onChange={e => setUseLower(e.target.checked)} className="rounded text-accent-primary" />
                Lowercase (a-z)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary font-bold">
                <input type="checkbox" checked={useUpper} onChange={e => setUseUpper(e.target.checked)} className="rounded text-accent-primary" />
                Uppercase (A-Z)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary font-bold">
                <input type="checkbox" checked={useNumbers} onChange={e => setUseNumbers(e.target.checked)} className="rounded text-accent-primary" />
                Numbers (0-9)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary font-bold">
                <input type="checkbox" checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} className="rounded text-accent-primary" />
                Symbols (!@#$)
              </label>
            </div>
          </div>

          {/* Results section */}
          <div className="mt-5 pt-4 border-t border-border-subtle/50 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-text-muted block text-[9px] uppercase font-bold mb-0.5">Entropy Strength</span>
              <span className={`text-sm font-black ${passwordResult.entropy >= 60 ? 'text-status-success' : passwordResult.entropy >= 40 ? 'text-status-warning' : 'text-status-danger'}`}>
                {passwordResult.entropy} Bits
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[9px] uppercase font-bold mb-0.5">GPU Crack Time</span>
              <span className="text-text-primary text-xs font-bold block truncate">{passwordResult.crackTime}</span>
            </div>
          </div>

        </div>

        {/* Right column: Diceware Passphrase Entropy */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between shadow-sm min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Diceware Passphrase Calculator
              </span>
              <button type="button" onClick={() => copy(passphrase, 'passphrase')} className="text-text-muted hover:text-text-primary">
                {copiedId === 'passphrase' ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[10px] text-text-muted leading-relaxed mb-3">
              Calculates cryptographic strength based on random dictionary-word selections (assuming standard EFF 7,776-word lists).
            </p>

            <input
              type="text"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              placeholder="Enter space-separated words..."
              className="w-full bg-bg-sidebar border border-border-subtle rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono font-bold"
            />

            <div className="p-3 bg-bg-sidebar/50 rounded-lg border border-border-subtle/40 text-[10px] text-text-secondary mt-3 leading-normal">
              <strong>Diceware Model:</strong> Standard passphrases bundle over 12.9 bits of entropy per word. Having 4 random words exceeds 50 bits of cryptographical entropy while remaining incredibly easy to memorize!
            </div>
          </div>

          {/* Results section */}
          <div className="mt-5 pt-4 border-t border-border-subtle/50 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-text-muted block text-[9px] uppercase font-bold mb-0.5">Entropy Strength</span>
              <span className={`text-sm font-black ${passphraseResult.entropy >= 60 ? 'text-status-success' : passphraseResult.entropy >= 40 ? 'text-status-warning' : 'text-status-danger'}`}>
                {passphraseResult.entropy} Bits ({passphraseResult.wordCount} words)
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[9px] uppercase font-bold mb-0.5">GPU Crack Time</span>
              <span className="text-text-primary text-xs font-bold block truncate">{passphraseResult.crackTime}</span>
            </div>
          </div>

        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
