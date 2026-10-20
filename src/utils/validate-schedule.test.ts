import { describe, it, expect } from 'vitest'

import { validateSchedule } from './validate-schedule'

import type { Person, MonthlyAvailability, ShiftRule } from '../types'

describe('validateSchedule - Motor de Regras e Auditoria', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
    { id: 'p3', name: 'Enf. Beatriz', color: '#8b5cf6' },
  ]

  const mockAvailabilities: MonthlyAvailability[] = [
    {
      personId: 'p1',
      month: '2026-10',
      availableDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 31],
    },
    {
      personId: 'p2',
      month: '2026-10',
      availableDays: [2, 4, 6, 8, 10, 12, 14],
    },
    {
      personId: 'p3',
      month: '2026-10',
      availableDays: [1, 3, 5, 7, 9, 11],
    },
  ]

  it('deve acusar erro quando a mesma pessoa trabalha em dias consecutivos no mesmo mês', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-02': ['p1'], // Consecutive
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const error = errors.find((e) => e.rule === 'consecutive_days')
    expect(error).toBeDefined()
    expect(error?.severity).toBe('error')
    expect(error?.personId).toBe('p1')
    expect(error?.message).toContain('Descanso violado')
    expect(error?.message).toContain('01/10/2026 e 02/10/2026')
  })

  it('deve acusar erro de dias consecutivos na virada de mês (ex: 31 de Outubro e 01 de Novembro)', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-31': ['p1'],
      '2026-11-01': ['p1'], // Month boundary rollover
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const error = errors.find((e) => e.rule === 'consecutive_days')
    expect(error).toBeDefined()
    expect(error?.message).toContain('31/10/2026 e 01/11/2026')
  })

  it('deve acusar erro quando o limite semanal de 2 escalas (Domingo a Sábado) é ultrapassado', () => {
    // 2026-10-04 is Sunday and 2026-10-10 is Saturday
    const assignments: Record<string, string[]> = {
      '2026-10-04': ['p1'], // Sun
      '2026-10-06': ['p1'], // Tue
      '2026-10-08': ['p1'], // Thu (3rd day in same week!)
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const error = errors.find((e) => e.rule === 'weekly_limit')
    expect(error).toBeDefined()
    expect(error?.severity).toBe('error')
    expect(error?.message).toContain('Limite semanal excedido')
    expect(error?.message).toContain('3 vezes')
  })

  it('deve acusar erro quando há mais de uma pessoa atribuída ao mesmo dia (conflito não resolvido)', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p3'], // 2 people assigned to the same day
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const error = errors.find((e) => e.rule === 'multi_assigned')
    expect(error).toBeDefined()
    expect(error?.severity).toBe('error')
    expect(error?.message).toContain('Conflito de alocação')
    expect(error?.message).toContain('2 pessoas atribuídas')
  })

  it('deve acusar aviso para dias vazios sem ninguém escalado no mês atual', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const emptyErrors = errors.filter((e) => e.rule === 'empty_day')
    // October has 31 days, 1 assigned => 30 empty days
    expect(emptyErrors.length).toBe(30)
    expect(emptyErrors[0].severity).toBe('warning')
    expect(emptyErrors[0].message).toContain('Dia sem responsável')
  })

  it('deve acusar erro quando uma pessoa é escalada sem ter marcado disponibilidade', () => {
    // p2 only has availability on even days (2, 4, 6...)
    const assignments: Record<string, string[]> = {
      '2026-10-05': ['p2'], // Day 5 is not in p2's availability
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const error = errors.find((e) => e.rule === 'not_available')
    expect(error).toBeDefined()
    expect(error?.severity).toBe('error')
    expect(error?.personId).toBe('p2')
    expect(error?.message).toContain('Indisponibilidade')
  })

  it('deve retornar zero erros críticos quando todos os dias estão em conformidade com as regras', () => {
    // Creates alternating assignment without consecutive days and max 2 days per week
    // Week 1: 01 (Thu - p1), 03 (Sat - p1) -> 2 times in the week
    // Week 2: 05 (Mon - p3), 07 (Wed - p3) -> 2 times in the week
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-03': ['p1'],
      '2026-10-05': ['p3'],
      '2026-10-07': ['p3'],
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    })

    const criticalErrors = errors.filter((e) => e.severity === 'error')
    expect(criticalErrors.length).toBe(0)
  })

  it('permite 2 pessoas no mesmo dia quando alocadas em turnos de 12h distintos sem gerar erro multi_assigned', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p3'], // 2 people on the same day
    }

    const dayShiftAssignments = {
      '2026-10-01': {
        shift_d12: 'p1', // Dra. Camila on D12 (07:00-19:00)
        shift_n12: 'p3', // Enf. Beatriz on N12 (19:00-07:00)
      },
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      dayShiftAssignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      activeRuleIds: ['rule_max_shifts_day'],
    })

    const multiAssignedError = errors.find((e) => e.rule === 'multi_assigned')
    expect(multiAssignedError).toBeUndefined()
  })

  it('valida regra dinâmica MAX_PEOPLE_PER_SHIFT acusando erro quando limite de pessoas no mesmo turno é ultrapassado', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p2'],
    }

    const dayShiftAssignments = {
      '2026-10-01': {
        shift_d12: 'p1',
      },
    }

    const maxOnePersonRule: ShiftRule = {
      id: 'rule_max_1_person_shift',
      name: 'Máx 1 pessoa por plantão',
      type: 'MAX_PEOPLE_PER_SHIFT',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { maxPeople: 1 },
      createdAt: '',
      updatedAt: '',
    }

    // Both p1 and p2 end up assigned to default shift if dayShiftAssignments isn't distinguishing, or if both are on shift_d12
    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      dayShiftAssignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      allRules: [maxOnePersonRule],
      activeRuleIds: ['rule_max_1_person_shift'],
    })

    const ruleError = errors.find((e) => e.rule === 'rule_max_1_person_shift')
    expect(ruleError).toBeDefined()
    expect(ruleError?.severity).toBe('error')
  })

  it('valida regra dinâmica MAX_PEOPLE_PER_SHIFT acusando erro quando 2 turnos diferentes no mesmo dia se sobrepõem no horário (ex: 24h e 12h noite)', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p2'],
    }

    const dayShiftAssignments = {
      '2026-10-01': {
        shift_p24: 'p1', // Plantão 24h (07:00-07:00)
        shift_n12: 'p2', // Plantão Noturno 12h (19:00-07:00)
      },
    }

    const maxOnePersonRule: ShiftRule = {
      id: 'rule_max_1_person_shift',
      name: 'Máx 1 pessoa por plantão',
      type: 'MAX_PEOPLE_PER_SHIFT',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { maxPeople: 1 },
      createdAt: '',
      updatedAt: '',
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      dayShiftAssignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      allRules: [maxOnePersonRule],
      activeRuleIds: ['rule_max_1_person_shift'],
    })

    const ruleErrors = errors.filter((e) => e.rule === 'rule_max_1_person_shift')
    expect(ruleErrors.length).toBe(2)
    expect(ruleErrors[0].message).toContain('trabalhando simultaneamente')
  })

  it('acusa conflito de alocação se 2 turnos diferentes no mesmo dia se sobrepõem quando não há regra dinâmica configurada', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p2'],
    }

    const dayShiftAssignments = {
      '2026-10-01': {
        shift_p24: 'p1', // Plantão 24h (07:00-07:00)
        shift_n12: 'p2', // Plantão Noturno 12h (19:00-07:00) - sobrepõem-se das 19h às 07h
      },
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      dayShiftAssignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      activeRuleIds: ['rule_max_shifts_day'], // MAX_PEOPLE_PER_SHIFT não ativo
    })

    const multiError = errors.find((e) => e.rule === 'multi_assigned')
    expect(multiError).toBeDefined()
    expect(multiError?.severity).toBe('error')
  })

  it('não deve gerar aviso de dia vazio para datas que não possuem plantão agendado', () => {
    // Only day 1 has a shift scheduled; days 2..31 have no shifts
    const monthDailyShifts = {
      '2026-10': {
        shift_d12: [1],
      },
    }

    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'], // Day 1 covered
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      monthDailyShifts,
    })

    const emptyErrors = errors.filter((e) => e.rule === 'empty_day')
    // No empty day warning should be generated since day 1 is covered and days 2..31 have no scheduled shifts
    expect(emptyErrors.length).toBe(0)
  })

  it('deve gerar aviso de dia vazio apenas se a data possui plantão agendado mas ninguém foi escalado', () => {
    // Day 1 and Day 2 have shifts scheduled, but only Day 1 is covered
    const monthDailyShifts = {
      '2026-10': {
        shift_d12: [1, 2],
      },
    }

    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      // Day 2 has a shift scheduled but no one assigned
    }

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
      monthDailyShifts,
    })

    const emptyErrors = errors.filter((e) => e.rule === 'empty_day')
    expect(emptyErrors.length).toBe(1)
    expect(emptyErrors[0].date).toBe('2026-10-02')
  })
})

