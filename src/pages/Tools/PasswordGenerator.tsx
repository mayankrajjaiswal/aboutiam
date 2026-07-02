import { useMemo, useState } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { PASSPHRASE_WORD_LIST } from '../../data/passphraseWordList'
import {
  buildCharset,
  calculateEntropyBits,
  estimateCrackTime,
  generatePassphrase,
  generatePassword,
  passphraseEntropyBits,
} from '../../lib/tools/password'
import type { PasswordOptions } from '../../lib/tools/password'

const tool = getToolBySlug('password-generator')!

export default function PasswordGenerator() {
  const [pwMode, setPwMode] = useState<'characters' | 'passphrase'>('characters')
  const [options, setOptions] = useState<PasswordOptions>({
    length: 20,
    useUpper: true,
    useLower: true,
    useDigits: true,
    useSymbols: true,
    excludeAmbiguous: false,
  })
  const [wordCount, setWordCount] = useState(5)
  const [nonce, setNonce] = useState(0)
  const { copy, copiedId } = useClipboardCopy()

  // `nonce` forces a fresh random draw on "New" clicks even when options are unchanged.
  const password = useMemo(() => {
    void nonce
    return pwMode === 'characters' ? generatePassword(options) : generatePassphrase(PASSPHRASE_WORD_LIST, wordCount)
  }, [pwMode, options, wordCount, nonce])

  const regenerate = () => setNonce((n) => n + 1)

  const entropyBits = pwMode === 'characters'
    ? calculateEntropyBits(buildCharset(options).length, options.length)
    : passphraseEntropyBits(PASSPHRASE_WORD_LIST.length, wordCount)

  const strengthLabel = entropyBits >= 80 ? 'Strong' : entropyBits >= 50 ? 'Reasonable' : 'Weak'
  const strengthColor = entropyBits >= 80 ? 'text-status-success' : entropyBits >= 50 ? 'text-status-warning' : 'text-status-danger'

  const toggle = (key: keyof PasswordOptions) => setOptions((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <ToolPageShell tool={tool}>
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <p className="text-lg font-mono font-bold text-text-primary break-all">{password}</p>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={regenerate} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary text-white text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5" /> New
            </button>
            <button type="button" onClick={() => copy(password, 'password')} aria-label="Copy password" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-sidebar hover:bg-bg-nested text-xs font-bold text-text-secondary border border-border-subtle">
              {copiedId === 'password' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={strengthColor}>{strengthLabel}</span>
          <span className="text-text-muted">— {entropyBits.toFixed(1)} bits of entropy — est. crack time {estimateCrackTime(entropyBits)}</span>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
        {(['characters', 'passphrase'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPwMode(m)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${pwMode === m ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {pwMode === 'characters' ? (
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="pw-length" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Length: {options.length}</label>
            <input
              id="pw-length"
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(e) => setOptions((prev) => ({ ...prev, length: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <CheckboxOption label="A-Z" checked={options.useUpper} onToggle={() => toggle('useUpper')} />
            <CheckboxOption label="a-z" checked={options.useLower} onToggle={() => toggle('useLower')} />
            <CheckboxOption label="0-9" checked={options.useDigits} onToggle={() => toggle('useDigits')} />
            <CheckboxOption label="!@#$" checked={options.useSymbols} onToggle={() => toggle('useSymbols')} />
          </div>
          <CheckboxOption label="Exclude ambiguous characters (0 O 1 l I)" checked={options.excludeAmbiguous} onToggle={() => toggle('excludeAmbiguous')} />
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm">
          <label htmlFor="pw-wordcount" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Word count: {wordCount}</label>
          <input
            id="pw-wordcount"
            type="range"
            min={3}
            max={10}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-[11px] text-text-muted">Drawn from a curated {PASSPHRASE_WORD_LIST.length}-word local list — entropy is calculated from this list's actual size, not assumed.</p>
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function CheckboxOption({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onToggle} className="w-4 h-4 accent-accent-primary" />
      <span className="text-text-secondary">{label}</span>
    </label>
  )
}
