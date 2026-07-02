import { describe, expect, it } from 'vitest'
import { bytesToHex, digestText } from './hash'

// Vectors from NIST FIPS 180-4 / the well-known "abc" test string.
describe('hash.ts against NIST test vectors', () => {
  it('computes SHA-1("abc")', async () => {
    expect(bytesToHex(await digestText('SHA-1', 'abc'))).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
  })

  it('computes SHA-256("abc")', async () => {
    expect(bytesToHex(await digestText('SHA-256', 'abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('computes SHA-384("abc")', async () => {
    expect(bytesToHex(await digestText('SHA-384', 'abc'))).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'
    )
  })

  it('computes SHA-512("abc")', async () => {
    expect(bytesToHex(await digestText('SHA-512', 'abc'))).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    )
  })

  it('is deterministic and exhibits the avalanche effect', async () => {
    const a = bytesToHex(await digestText('SHA-256', 'AboutIAM'))
    const b = bytesToHex(await digestText('SHA-256', 'AboutIAN'))
    expect(a).toBe(bytesToHex(await digestText('SHA-256', 'AboutIAM')))
    expect(a).not.toBe(b)
  })
})
