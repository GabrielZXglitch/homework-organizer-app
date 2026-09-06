import { describe, it, expect } from 'vitest'
import { formatDeadline, isToday, isThisWeek } from '../utils/dateUtils'

describe('formatDeadline', () => {
  it('returns "Hoje" for today deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-24T18:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isToday).toBe(true)
    expect(result.isOverdue).toBe(false)
    expect(result.text).toContain('Hoje')
  })

  it('detects overdue deadlines', () => {
    const now = new Date('2025-10-24T20:00:00')
    const deadline = new Date('2025-10-24T18:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isOverdue).toBe(true)
    expect(result.text).toContain('Atrasado')
  })

  it('returns "Amanhã" for tomorrow deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-25T14:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.text).toContain('Amanhã')
  })

  it('returns formatted date for future deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-30T14:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isToday).toBe(false)
    expect(result.isOverdue).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-24T18:00:00')
    expect(isToday(date, now)).toBe(true)
  })

  it('returns false for yesterday', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-23T18:00:00')
    expect(isToday(date, now)).toBe(false)
  })
})

describe('isThisWeek', () => {
  it('returns true for a date within the current week', () => {
    // Oct 24 is a Friday
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-26T18:00:00') // Sunday same week
    expect(isThisWeek(date, now)).toBe(true)
  })

  it('returns false for a date in the next week', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-11-02T18:00:00')
    expect(isThisWeek(date, now)).toBe(false)
  })
})
