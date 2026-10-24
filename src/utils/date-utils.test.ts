import { describe, it, expect } from 'vitest'

import {
  getCurrentMonth,
  formatMonthYear,
  getPreviousMonth,
  getNextMonth,
  getDaysCountInMonth,
  getMonthDaysArray,
  getMonthCalendarGrid,
  getWeekStartKey,
  getWeekEndKey,
  formatDisplayDate,
  getConsecutiveDates,
  formatDateWithWeekday,
  isEventInPast,
} from './date-utils'


describe('dateUtils', () => {
  it('formats the month and year in Portuguese, with a compact title option', () => {
    expect(formatMonthYear('2026-10')).toBe('Outubro de 2026')
    expect(formatMonthYear('2026-01')).toBe('Janeiro de 2026')
    expect(formatMonthYear('2026-10', 'pt-BR', { compact: true })).toBe('Outubro 2026')
    expect(formatMonthYear('2026-10', 'en-US', { compact: true })).toBe('October 2026')
  })

  it('computes the previous and next month', () => {
    expect(getPreviousMonth('2026-10')).toBe('2026-09')
    expect(getNextMonth('2026-10')).toBe('2026-11')
    // Year rollover
    expect(getPreviousMonth('2026-01')).toBe('2025-12')
    expect(getNextMonth('2026-12')).toBe('2027-01')
  })

  it('returns the number of days in a month', () => {
    expect(getDaysCountInMonth('2026-10')).toBe(31)
    expect(getDaysCountInMonth('2026-11')).toBe(30)
    expect(getDaysCountInMonth('2026-02')).toBe(28) // non-leap year
    expect(getDaysCountInMonth('2024-02')).toBe(29) // leap year
  })

  it('lists every day of the month from 1 to N', () => {
    const days = getMonthDaysArray('2026-10')
    expect(days.length).toBe(31)
    expect(days[0]).toBe(1)
    expect(days[30]).toBe(31)
  })

  it('builds a calendar grid from Sunday (0) to Saturday (6)', () => {
    const grid = getMonthCalendarGrid('2026-10')
    // Total cells in grid must be a multiple of 7
    expect(grid.length % 7).toBe(0)

    // First day of grid must be Sunday
    expect(grid[0].dayOfWeek).toBe(0)
    // Last day of grid must be Saturday
    expect(grid[grid.length - 1].dayOfWeek).toBe(6)

    // Cells of the current month must have isCurrentMonth = true
    const currentMonthDays = grid.filter((c) => c.isCurrentMonth)
    expect(currentMonthDays.length).toBe(31)
  })

  it('computes the week start (Sunday) and end (Saturday)', () => {
    // 2026-10-07 is a Wednesday
    // The Sunday of that week is 2026-10-04
    // The Saturday of that week is 2026-10-10
    expect(getWeekStartKey('2026-10-07')).toBe('2026-10-04')
    expect(getWeekEndKey('2026-10-07')).toBe('2026-10-10')

    // For Sunday itself (2026-10-04), start must be 2026-10-04
    expect(getWeekStartKey('2026-10-04')).toBe('2026-10-04')
  })

  it('formats a date as dd/MM/yyyy', () => {
    expect(formatDisplayDate('2026-10-05')).toBe('05/10/2026')
    expect(formatDisplayDate('2026-01-01')).toBe('01/01/2026')
  })

  it('returns the previous and next dates', () => {
    const { prevDateStr, nextDateStr } = getConsecutiveDates('2026-10-15')
    expect(prevDateStr).toBe('2026-10-14')
    expect(nextDateStr).toBe('2026-10-16')

    // Month boundary rollover test
    const boundary = getConsecutiveDates('2026-10-31')
    expect(boundary.prevDateStr).toBe('2026-10-30')
    expect(boundary.nextDateStr).toBe('2026-11-01')
  })

  it('formats a date with a capitalized Portuguese weekday', () => {
    // 2026-10-15 is a Thursday
    const result = formatDateWithWeekday('2026-10-15')
    expect(result.formattedDate).toBe('15/10/2026')
    expect(result.weekday).toBe('Quinta-feira')
  })

  it('isEventInPast tells whether an event is in the past', () => {
    // Reference now: 2026-10-15 14:30
    const mockNow = new Date('2026-10-15T14:30:00')

    // Dates before reference date are past
    expect(isEventInPast('2026-10-14', undefined, mockNow)).toBe(true)
    expect(isEventInPast('2026-10-14', '18:00', mockNow)).toBe(true)

    // Dates after reference date are not past
    expect(isEventInPast('2026-10-16', undefined, mockNow)).toBe(false)
    expect(isEventInPast('2026-10-16', '08:00', mockNow)).toBe(false)

    // Same date, check time
    expect(isEventInPast('2026-10-15', '14:00', mockNow)).toBe(true)
    expect(isEventInPast('2026-10-15', '14:29', mockNow)).toBe(true)
    expect(isEventInPast('2026-10-15', '14:30', mockNow)).toBe(false)
    expect(isEventInPast('2026-10-15', '15:00', mockNow)).toBe(false)
    // Same date, no time specified defaults to false (not in past)
    expect(isEventInPast('2026-10-15', undefined, mockNow)).toBe(false)
  })

  it('getCurrentMonth returns the current month as YYYY-MM', () => {
    const customDate = new Date('2026-10-20T12:00:00')
    expect(getCurrentMonth(customDate)).toBe('2026-10')

    const janDate = new Date('2027-01-05T08:00:00')
    expect(getCurrentMonth(janDate)).toBe('2027-01')
  })
})


