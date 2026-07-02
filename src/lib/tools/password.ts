// Entropy is measured in bits of Shannon entropy: log2(charset ^ length).
// NIST SP 800-63B recommends prioritizing length over forced complexity
// rules, which is why generatePassphrase exists alongside the character-set
// mode. crypto.getRandomValues is used throughout — never Math.random().
export interface PasswordOptions {
  length: number
  useUpper: boolean
  useLower: boolean
  useDigits: boolean
  useSymbols: boolean
  excludeAmbiguous: boolean
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?'
const AMBIGUOUS = /[0O1lI]/g

export function buildCharset(options: PasswordOptions): string {
  let charset = ''
  if (options.useUpper) charset += UPPER
  if (options.useLower) charset += LOWER
  if (options.useDigits) charset += DIGITS
  if (options.useSymbols) charset += SYMBOLS
  if (options.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, '')
  return charset
}

export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options)
  if (charset.length === 0) return ''
  const randomValues = crypto.getRandomValues(new Uint32Array(options.length))
  let password = ''
  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length]
  }
  return password
}

export function calculateEntropyBits(charsetLength: number, length: number): number {
  if (charsetLength <= 1 || length <= 0) return 0
  return Math.log2(charsetLength) * length
}

function formatDuration(seconds: number): string {
  const units: [string, number][] = [
    ['century', 3153600000],
    ['year', 31536000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    if (seconds >= secs) {
      const count = seconds / secs
      return `~${count >= 1000 ? count.toExponential(1) : count.toFixed(1)} ${label}s`
    }
  }
  return '< 1 minute'
}

// A rough order-of-magnitude estimate only, not a guarantee — assumes an
// offline attacker at 10 billion guesses/sec against an average-case (half
// the keyspace) search.
export function estimateCrackTime(entropyBits: number, guessesPerSecond = 1e10): string {
  const totalGuesses = 2 ** entropyBits
  const seconds = totalGuesses / guessesPerSecond / 2
  return formatDuration(seconds)
}

export function generatePassphrase(wordList: string[], wordCount = 5, separator = '-'): string {
  const randomIndexes = crypto.getRandomValues(new Uint32Array(wordCount))
  return Array.from(randomIndexes).map((n) => wordList[n % wordList.length]).join(separator)
}

export function passphraseEntropyBits(wordListLength: number, wordCount: number): number {
  return Math.log2(wordListLength) * wordCount
}
