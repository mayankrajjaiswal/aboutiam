import { describe, it, expect } from 'vitest'
import { generateResumeBullets, type ProgressSnapshot } from './resumeBulletGenerator'

const EMPTY: ProgressSnapshot = { completedModuleCount: 0, totalModuleCount: 36, completedLabCount: 0, passedCertTitles: [] }

describe('generateResumeBullets', () => {
  it('returns an empty array for zero progress', () => {
    expect(generateResumeBullets(EMPTY)).toEqual([])
  })

  it('generates an academy bullet when at least one module is completed', () => {
    const bullets = generateResumeBullets({ ...EMPTY, completedModuleCount: 12 })
    expect(bullets.some((b) => b.id === 'academy-tracks')).toBe(true)
    const text = bullets.find((b) => b.id === 'academy-tracks')?.text ?? ''
    expect(text).toContain('12')
    expect(text).toContain('36')
  })

  it('generates a labs bullet when at least one lab is completed', () => {
    const bullets = generateResumeBullets({ ...EMPTY, completedLabCount: 5 })
    expect(bullets.some((b) => b.id === 'playground-labs')).toBe(true)
    expect(bullets.find((b) => b.id === 'playground-labs')?.text).toContain('5')
  })

  it('generates one bullet per passed certification', () => {
    const bullets = generateResumeBullets({ ...EMPTY, passedCertTitles: ['SC-900', 'CISSP'] })
    expect(bullets.filter((b) => b.id.startsWith('cert-')).length).toBe(2)
  })

  it('never fabricates progress not present in the snapshot', () => {
    const bullets = generateResumeBullets({ ...EMPTY, completedModuleCount: 3 })
    expect(bullets.some((b) => b.id === 'playground-labs')).toBe(false)
    expect(bullets.some((b) => b.id.startsWith('cert-'))).toBe(false)
  })

  it('combines all progress types into a complete bullet set', () => {
    const bullets = generateResumeBullets({
      completedModuleCount: 20,
      totalModuleCount: 36,
      completedLabCount: 3,
      passedCertTitles: ['SC-900'],
    })
    expect(bullets.length).toBe(3)
  })
})
