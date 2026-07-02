import { describe, expect, it } from 'vitest'
import {
  buildCharset,
  calculateEntropyBits,
  generatePassphrase,
  generatePassword,
  passphraseEntropyBits,
} from './password'

describe('buildCharset / generatePassword', () => {
  it('respects the requested character classes only', () => {
    const charset = buildCharset({
      length: 20,
      useUpper: false,
      useLower: true,
      useDigits: true,
      useSymbols: false,
      excludeAmbiguous: false,
    })
    expect(charset).toMatch(/^[a-z0-9]+$/)
  })

  it('excludes ambiguous characters when requested', () => {
    const charset = buildCharset({
      length: 20,
      useUpper: true,
      useLower: true,
      useDigits: true,
      useSymbols: false,
      excludeAmbiguous: true,
    })
    expect(charset).not.toMatch(/[0O1lI]/)
  })

  it('generates a password of the exact requested length from the allowed charset', () => {
    const options = { length: 24, useUpper: true, useLower: true, useDigits: true, useSymbols: true, excludeAmbiguous: false }
    const password = generatePassword(options)
    expect(password).toHaveLength(24)
    const allowed = new Set(buildCharset(options))
    expect([...password].every((char) => allowed.has(char))).toBe(true)
  })

  it('returns an empty string when no character class is selected', () => {
    expect(generatePassword({ length: 10, useUpper: false, useLower: false, useDigits: false, useSymbols: false, excludeAmbiguous: false })).toBe('')
  })
})

describe('calculateEntropyBits', () => {
  it('matches the log2(charset^length) formula', () => {
    expect(calculateEntropyBits(2, 10)).toBeCloseTo(10, 5)
    expect(calculateEntropyBits(64, 8)).toBeCloseTo(48, 5)
  })

  it('returns 0 for a degenerate single-character charset', () => {
    expect(calculateEntropyBits(1, 10)).toBe(0)
  })
})

describe('generatePassphrase / passphraseEntropyBits', () => {
  const wordList = ['alpha', 'bravo', 'charlie', 'delta']

  it('joins the requested number of words from the list', () => {
    const phrase = generatePassphrase(wordList, 5, '-')
    expect(phrase.split('-')).toHaveLength(5)
    phrase.split('-').forEach((word) => expect(wordList).toContain(word))
  })

  it('computes entropy as log2(listLength) * wordCount', () => {
    expect(passphraseEntropyBits(4, 5)).toBeCloseTo(10, 5)
  })
})
