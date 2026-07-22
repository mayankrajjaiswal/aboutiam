import { describe, expect, it } from 'vitest'
import { getTrackGraduationBadges, getPlaygroundMilestoneBadges } from './achievementRules'

describe('getTrackGraduationBadges', () => {
  it('unlocks a track badge only when all 6 of its modules are complete', () => {
    const completed = { 'm1.1': true, 'm1.2': true, 'm1.3': true, 'm1.4': true, 'm1.5': true, 'm1.6': true }
    const badges = getTrackGraduationBadges(completed)
    const track1 = badges.find((b) => b.id === 'badge-track-graduate-1')
    const track2 = badges.find((b) => b.id === 'badge-track-graduate-2')
    expect(track1?.unlocked).toBe(true)
    expect(track2?.unlocked).toBe(false)
  })

  it('stays locked when a track is one module short of completion', () => {
    const completed = { 'm3.1': true, 'm3.2': true, 'm3.3': true, 'm3.4': true, 'm3.5': true }
    const badges = getTrackGraduationBadges(completed)
    const track3 = badges.find((b) => b.id === 'badge-track-graduate-3')
    expect(track3?.unlocked).toBe(false)
  })

  it('returns exactly 6 track badges regardless of progress', () => {
    expect(getTrackGraduationBadges({})).toHaveLength(6)
  })

  it('treats an empty progress map as entirely locked', () => {
    const badges = getTrackGraduationBadges({})
    expect(badges.every((b) => !b.unlocked)).toBe(true)
  })
})

describe('getPlaygroundMilestoneBadges', () => {
  it('unlocks lower milestones but not higher ones at a mid-range count', () => {
    const badges = getPlaygroundMilestoneBadges(12)
    expect(badges.find((b) => b.id === 'badge-playground-milestone-5')?.unlocked).toBe(true)
    expect(badges.find((b) => b.id === 'badge-playground-milestone-12')?.unlocked).toBe(true)
    expect(badges.find((b) => b.id === 'badge-playground-milestone-22')?.unlocked).toBe(false)
    expect(badges.find((b) => b.id === 'badge-playground-milestone-32')?.unlocked).toBe(false)
  })

  it('unlocks nothing at zero completions', () => {
    const badges = getPlaygroundMilestoneBadges(0)
    expect(badges.every((b) => !b.unlocked)).toBe(true)
  })

  it('unlocks every milestone once the exact top threshold is reached', () => {
    const badges = getPlaygroundMilestoneBadges(32)
    expect(badges.every((b) => b.unlocked)).toBe(true)
  })

  it('unlocks a threshold badge at the exact boundary count', () => {
    const badges = getPlaygroundMilestoneBadges(5)
    expect(badges.find((b) => b.id === 'badge-playground-milestone-5')?.unlocked).toBe(true)
  })
})
