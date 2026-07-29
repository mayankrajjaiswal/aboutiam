import { describe, it, expect } from 'vitest'
import { getPqcSignatureDisplay, computeChainSizeBytes } from './certChainPqc'

describe('getPqcSignatureDisplay', () => {
  it('classical mode uses the plain ECDSA signature size', () => {
    const display = getPqcSignatureDisplay('classical')
    expect(display.algorithm).toContain('ECDSA')
    expect(display.bytesPerHop).toBe(96)
  })

  it('hybrid mode adds the ML-DSA-87 signature on top of the classical one', () => {
    const display = getPqcSignatureDisplay('hybrid')
    expect(display.algorithm).toContain('ML-DSA-87')
    expect(display.bytesPerHop).toBe(96 + 4600)
  })
})

describe('computeChainSizeBytes', () => {
  it('hybrid mode strictly increases total chain size over classical', () => {
    expect(computeChainSizeBytes('hybrid')).toBeGreaterThan(computeChainSizeBytes('classical'))
  })

  it('computes total chain size as bytesPerHop times hop count', () => {
    expect(computeChainSizeBytes('classical', 3)).toBe(96 * 3)
  })
})
