import { describe, it, expect } from 'vitest'

import {
  validateSchedule,
  DEFAULT_SHIFTS,
  DEFAULT_RULES,
} from './rule-engine'

import type { Person } from '../../types'
import type { MonthScheduleDocument, ShiftDefinition, ShiftRule } from '../../types/scheduleConfig'

describe('RuleEngine', () => {
  const mockPeople: Person[] = [
    { id: 'p1', name: 'Dr. Roberto Alves', color: '#3B82F6' },
    { id: 'p2', name: 'Dra. Ana Paula', color: '#10B981' },
  ]

  const shiftD12: ShiftDefinition = {
    id: 'shift_d12',
    name: 'Plantão Diurno 12h',
    code: 'D12',
    startTime: '07:00',
    durationHours: 12,
    color: '#3B82F6',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const shiftN12: ShiftDefinition = {
    id: 'shift_n12',
    name: 'Plantão Noturno 12h',
    code: 'N12',
    startTime: '19:00',
    durationHours: 12,
    color: '#6366F1',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const shiftP24: ShiftDefinition = {
    id: 'shift_p24',
    name: 'Plantão 24h',
    code: 'P24',
    startTime: '07:00',
    durationHours: 24,
    color: '#8B5CF6',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const allShifts = [shiftD12, shiftN12, shiftP24]

  it('detects MIN_REST_HOURS violation between 12h shifts on consecutive days with 24h rest requirement', () => {
    const minRestRule: ShiftRule = {
      id: 'rule_rest_24',
      name: 'Descanso Mínimo 24h',
      type: 'MIN_REST_HOURS',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { minRestHours: 24 },
      createdAt: '',
      updatedAt: '',
    }

    // Day 1: 07:00 to 19:00 (ends at 19:00)
    // Day 2: 07:00 to 19:00 (starts at 07:00 next day -> 12h of rest)
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-01_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-02_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [minRestRule],
      allShifts,
      ['rule_rest_24'],
      mockPeople
    )

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('rule_rest_24')
    expect(violations[0].personId).toBe('p1')
    expect(violations[0].date).toBe('2026-10-02')
    expect(violations[0].message).toContain('12h de descanso')
  })

  it('does not flag MIN_REST_HOURS if rest duration meets requirement', () => {
    const minRestRule: ShiftRule = {
      id: 'rule_rest_12',
      name: 'Descanso Mínimo 12h',
      type: 'MIN_REST_HOURS',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { minRestHours: 12 },
      createdAt: '',
      updatedAt: '',
    }

    // Day 1: 07:00 to 19:00 (ends 19:00)
    // Day 2: 07:00 to 19:00 (starts 07:00 next day -> exactly 12h rest)
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-01_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-02_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [minRestRule],
      allShifts,
      ['rule_rest_12'],
      mockPeople
    )

    expect(violations).toHaveLength(0)
  })

  it('detects MIN_REST_HOURS with 24h shift followed immediately by another shift', () => {
    const minRestRule: ShiftRule = {
      id: 'rule_rest_24',
      name: 'Descanso Mínimo 24h',
      type: 'MIN_REST_HOURS',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { minRestHours: 24 },
      createdAt: '',
      updatedAt: '',
    }

    // Day 1: 24h shift (07:00 Oct 1 to 07:00 Oct 2)
    // Day 2: 12h shift starting at 07:00 Oct 2 -> 0h rest
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-01_shift_p24': { personId: 'p1', shiftDefinitionId: 'shift_p24' },
        '2026-10-02_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [minRestRule],
      allShifts,
      ['rule_rest_24'],
      mockPeople
    )

    expect(violations).toHaveLength(1)
    expect(violations[0].date).toBe('2026-10-02')
  })

  it('detects MAX_SHIFTS_PER_PERIOD with scope DAY', () => {
    const dayLimitRule: ShiftRule = {
      id: 'rule_max_day_1',
      name: 'Máx 1 turno por dia',
      type: 'MAX_SHIFTS_PER_PERIOD',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { scope: 'DAY', maxOccurrences: 1 },
      createdAt: '',
      updatedAt: '',
    }

    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-05_shift_d12': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-05_shift_n12': { personId: 'p1', shiftDefinitionId: 'shift_n12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [dayLimitRule],
      allShifts,
      ['rule_max_day_1'],
      mockPeople
    )

    expect(violations).toHaveLength(1)
    expect(violations[0].date).toBe('2026-10-05')
    expect(violations[0].message).toContain('possui 2 plantões no dia 2026-10-05')
  })

  it('detects MAX_SHIFTS_PER_PERIOD with scope WEEK', () => {
    const weekLimitRule: ShiftRule = {
      id: 'rule_max_week_2',
      name: 'Máx 2 turnos na semana',
      type: 'MAX_SHIFTS_PER_PERIOD',
      severity: 'WARNING',
      enabledByDefault: true,
      parameters: { scope: 'WEEK', maxOccurrences: 2 },
      createdAt: '',
      updatedAt: '',
    }

    // Oct 4 (Sun), Oct 6 (Tue), Oct 8 (Thu) are in the same week
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-04_s1': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-06_s1': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-08_s1': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [weekLimitRule],
      allShifts,
      ['rule_max_week_2'],
      mockPeople
    )

    expect(violations).toHaveLength(1)
    expect(violations[0].severity).toBe('WARNING')
    expect(violations[0].message).toContain('ultrapassou o limite semanal com 3 plantões')
  })

  it('detects MAX_HOURS_PER_PERIOD with scope DAY and WEEK', () => {
    const maxHoursWeekRule: ShiftRule = {
      id: 'rule_max_hours_week',
      name: 'Máx 40h semanais',
      type: 'MAX_HOURS_PER_PERIOD',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { scope: 'WEEK', maxHours: 40 },
      createdAt: '',
      updatedAt: '',
    }

    // Two 24h shifts in same week = 48 hours > 40h
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-04_p24': { personId: 'p1', shiftDefinitionId: 'shift_p24' },
        '2026-10-07_p24': { personId: 'p1', shiftDefinitionId: 'shift_p24' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [maxHoursWeekRule],
      allShifts,
      ['rule_max_hours_week'],
      mockPeople
    )

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('totalizou 48h na semana (máximo permitido: 40h)')
  })

  it('detects CONSECUTIVE_DAYS_LIMIT violation', () => {
    const consecutiveRule: ShiftRule = {
      id: 'rule_consecutive',
      name: 'Limite dias consecutivos',
      type: 'CONSECUTIVE_DAYS_LIMIT',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { consecutiveDaysLimit: 1 },
      createdAt: '',
      updatedAt: '',
    }

    // Oct 10, Oct 11, Oct 12: 3 consecutive days
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-10_s': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-11_s': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-12_s': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    const violations = validateSchedule(
      schedule,
      [consecutiveRule],
      allShifts,
      ['rule_consecutive'],
      mockPeople
    )

    // Consecutive limit is 1, so days 11 (streak 2) and 12 (streak 3) both trigger violations
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations.some((v) => v.date === '2026-10-11')).toBe(true)
  })

  it('ignores rules that are not in activeRuleIds', () => {
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-01_s': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-02_s': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
      },
    }

    // Active rule list is empty
    const violations = validateSchedule(
      schedule,
      DEFAULT_RULES,
      DEFAULT_SHIFTS,
      [],
      mockPeople
    )

    expect(violations).toHaveLength(0)
  })

  it('respects targetShiftIds filter', () => {
    const targetShiftRule: ShiftRule = {
      id: 'rule_target',
      name: 'Máx 1 plantão noturno por dia',
      type: 'MAX_SHIFTS_PER_PERIOD',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { scope: 'DAY', maxOccurrences: 1, targetShiftIds: ['shift_n12'] },
      createdAt: '',
      updatedAt: '',
    }

    // One day shift and one night shift on same day
    const schedule: MonthScheduleDocument = {
      month: '2026-10',
      shifts: {
        '2026-10-01_d': { personId: 'p1', shiftDefinitionId: 'shift_d12' },
        '2026-10-01_n': { personId: 'p1', shiftDefinitionId: 'shift_n12' },
      },
    }

    // Rule only applies to shift_n12, so only 1 shift_n12 on that day -> no violation
    const violations = validateSchedule(
      schedule,
      [targetShiftRule],
      allShifts,
      ['rule_target'],
      mockPeople
    )

    expect(violations).toHaveLength(0)
  })
})

