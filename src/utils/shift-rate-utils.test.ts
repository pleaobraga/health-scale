import { describe, it, expect } from 'vitest'

import { getPersonShiftRate, parseNumericRate } from './shift-rate-utils'

import type { MonthlyAvailability } from '../types'

describe('shift-rate-utils', () => {
  describe('parseNumericRate', () => {
    it('deve converter valores numéricos em vários formatos', () => {
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

    it('deve retornar a taxa exata de shiftId e dia quando encontrada', () => {
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', 'shift_d12', 1)
      expect(rate).toBe(1500)
    })

    it('deve usar taxa da escala para escala legada (sem shiftId especificado)', () => {
      // p1 has shift_d12 rates, but is assigned without shiftId
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', undefined, 1)
      expect(rate).toBe(1500)
    })

    it('deve usar taxa default quando shiftId solicitado não existir mas houver default', () => {
      const rate = getPersonShiftRate(baseAvail, 'p2', '2026-10', 'shift_random', 1)
      expect(rate).toBe(1200)
    })

    it('deve recorrer à taxa base da escala quando o dia específico não tiver taxa configurada', () => {
      // p1 on day 10 (not in days 1, 2)
      const rate = getPersonShiftRate(baseAvail, 'p1', '2026-10', 'shift_d12', 10)
      expect(rate).toBe(1400)
    })

    it('deve retornar 0 quando o profissional não tiver taxas configuradas', () => {
      const rate = getPersonShiftRate(baseAvail, 'p_unknown', '2026-10', 'shift_d12', 1)
      expect(rate).toBe(0)
    })
  })
})

