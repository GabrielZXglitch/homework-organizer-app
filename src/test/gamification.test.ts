import { describe, it, expect } from 'vitest'
import { calculateGamification } from '../utils/gamification'

describe('calculateGamification', () => {
  it('awards +20 XP when completing homework with photo', () => {
    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 3,
      ultimoConcluido: null,
    }, true, new Date('2025-10-24T15:00:00'))

    expect(result.xpGained).toBe(20)
    expect(result.newXp).toBe(120)
  })

  it('awards +10 XP when completing homework without photo', () => {
    const result = calculateGamification({
      xpTotal: 50,
      streakDias: 1,
      ultimoConcluido: null,
    }, false, new Date('2025-10-24T15:00:00'))

    expect(result.xpGained).toBe(10)
    expect(result.newXp).toBe(60)
  })

  it('increments streak on consecutive days', () => {
    // Yesterday was the last completion
    const yesterday = new Date('2025-10-23T18:00:00')
    const today = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 5,
      ultimoConcluido: { toDate: () => yesterday } as any,
    }, true, today)

    expect(result.newStreak).toBe(6)
  })

  it('keeps streak same if already completed today', () => {
    const earlierToday = new Date('2025-10-24T10:00:00')
    const now = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 3,
      ultimoConcluido: { toDate: () => earlierToday } as any,
    }, true, now)

    expect(result.newStreak).toBe(3)
  })

  it('resets streak to 1 when gap is more than 1 day', () => {
    const threeDaysAgo = new Date('2025-10-21T18:00:00')
    const today = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 10,
      ultimoConcluido: { toDate: () => threeDaysAgo } as any,
    }, true, today)

    expect(result.newStreak).toBe(1)
  })

  it('starts streak at 1 when no previous completion', () => {
    const result = calculateGamification({
      xpTotal: 0,
      streakDias: 0,
      ultimoConcluido: null,
    }, true, new Date('2025-10-24T15:00:00'))

    expect(result.newStreak).toBe(1)
  })
})
