import { describe, it, expect } from 'vitest'

import { validateSchedule } from './validate-schedule'

import type { Person, MonthlyAvailability } from '../types'

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
})

