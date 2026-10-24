import { describe, it, expect } from 'vitest'

import { getPersonShiftRate, parseNumericRate } from './shift-rate-utils'

import type { MonthlyAvailability } from '../types'

describe('shift-rate-utils', () => {
  describe('parseNumericRate', () => {
    it('parses numeric values in several formats', () => {
      expect(parseNumericRate('1500')).toBe(1500)
      expect(parseNumericRate('1500,50')).toBe(1500.5)
      expect(parseNumericRate('1.500,00')).toBe(1500)
      expect(parseNumericRate('R$ 1.800,00')).toBe(1800)
      expect(parseNumericRate('')).toBe(0)
    })
  })

  describe('getPersonShiftRate', () => {
    const baseAvail: MonthlyAvailability[] = [
      {
        personId: 'p1',
        month: '2026-10',
        availableDays: [1, 2, 3],
        shiftRates: {
          shift_d12: {
            1: 1500,
            2: 1600,
            0: 1400, // base rate
          },
        },
      },
      {
        personId: 'p2',
        month: '2026-10',
        availableDays: [1, 2],
        shiftRates: {
          default: {
            1: 1200,
            2: 1300,
          },
        },
      },
    ]

    it('returns the exact rate for the shiftId and day', () => {
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', 'shift_d12', 1)
      expect(rate).toBe(1500)
    })

    it('uses the shift rate for legacy assignments without a shiftId', () => {
      // p1 has shift_d12 rates, but is assigned without shiftId
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', undefined, 1)
      expect(rate).toBe(1500)
    })

    it('uses the default rate when the requested shiftId has none', () => {
      const rate = getPersonShiftRate(baseAvail, 'p2', '2026-10', 'shift_random', 1)
      expect(rate).toBe(1200)
    })

    it('falls back to the shift base rate when the day has no rate', () => {
      // p1 on day 10 (not in days 1, 2)
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', 'shift_d12', 10)
      expect(rate).toBe(1400)
    })

    it('returns 0 when the professional has no rates', () => {
      const rate = getPersonShiftRate(baseAvail, 'p_unknown', '2026-10', 'shift_d12', 1)
      expect(rate).toBe(0)
    })
  })
})

