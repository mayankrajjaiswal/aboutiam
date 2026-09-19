import { describe, it, expect } from 'vitest'
import { ACADEMY_TRACKS } from './academyTracks'

describe('ACADEMY_TRACKS', () => {
  it('has 7 tracks and 42 total modules, matching the README/GEMINI count', () => {
    expect(ACADEMY_TRACKS).toHaveLength(7)
    const totalModules = ACADEMY_TRACKS.reduce((sum, t) => sum + t.modules.length, 0)
    expect(totalModules).toBe(42)
  })

  it('every track has exactly 6 modules, matching the global graduation progress bar ratio', () => {
    for (const track of ACADEMY_TRACKS) {
      expect(track.modules).toHaveLength(6)
    }
  })

  it('every track and module has a unique, non-empty id', () => {
    const trackIds = new Set<string>()
    const moduleIds = new Set<string>()
    for (const track of ACADEMY_TRACKS) {
      expect(track.id.length).toBeGreaterThan(0)
      expect(trackIds.has(track.id)).toBe(false)
      trackIds.add(track.id)
      for (const mod of track.modules) {
        expect(mod.id.length).toBeGreaterThan(0)
        expect(moduleIds.has(mod.id)).toBe(false)
        moduleIds.add(mod.id)
      }
    }
  })
})
