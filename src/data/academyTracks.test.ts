import { describe, it, expect } from 'vitest'
import { ACADEMY_TRACKS } from './academyTracks'

describe('ACADEMY_TRACKS', () => {
  it('has 6 tracks and 36 total modules, matching the README/GEMINI count', () => {
    expect(ACADEMY_TRACKS).toHaveLength(6)
    const totalModules = ACADEMY_TRACKS.reduce((sum, t) => sum + t.modules.length, 0)
    expect(totalModules).toBe(36)
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
