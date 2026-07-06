import { describe, it, expect } from 'vitest'
import { PASSPHRASE_WORD_LIST } from './passphraseWordList'

describe('Curated Passphrase Word List (passphraseWordList.ts)', () => {
  it('should verify the word list contains no duplicate entries', () => {
    const list = PASSPHRASE_WORD_LIST
    const uniqueList = new Set(list)

    expect(list.length).toBe(uniqueList.size)
  })

  it('should assert that every word in the dictionary is purely lowercase alphabetic characters', () => {
    PASSPHRASE_WORD_LIST.forEach(word => {
      // Must be lowercase alphabetical string with length greater than 1
      expect(word).toMatch(/^[a-z]+$/)
      expect(word.length).toBeGreaterThan(1)
    })
  })

  it('should contain a solid vocabulary size to ensure high-entropy passphrase generation', () => {
    // Standard secure list sizes should comfortably exceed 100 entries for custom sub-lists
    expect(PASSPHRASE_WORD_LIST.length).toBeGreaterThanOrEqual(150)
  })
})
