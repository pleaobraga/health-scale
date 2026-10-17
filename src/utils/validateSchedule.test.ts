import { describe, it, expect } from 'vitest';
import { validateSchedule } from './validateSchedule';
import { Person, MonthlyAvailability } from '../types';

describe('validateSchedule - Motor de Regras e Auditoria', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
    { id: 'p3', name: 'Enf. Beatriz', color: '#8b5cf6' },
  ];

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
  ];

  it('deve acusar erro quando a mesma pessoa trabalha em dias consecutivos no mesmo mês', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-02': ['p1'], // Consecutivo
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const error = errors.find((e) => e.rule === 'consecutive_days');
    expect(error).toBeDefined();
    expect(error?.severity).toBe('error');
    expect(error?.personId).toBe('p1');
    expect(error?.message).toContain('Descanso violado');
    expect(error?.message).toContain('01/10/2026 e 02/10/2026');
  });

  it('deve acusar erro de dias consecutivos na virada de mês (ex: 31 de Outubro e 01 de Novembro)', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-31': ['p1'],
      '2026-11-01': ['p1'], // Virada de mês
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const error = errors.find((e) => e.rule === 'consecutive_days');
    expect(error).toBeDefined();
    expect(error?.message).toContain('31/10/2026 e 01/11/2026');
  });

  it('deve acusar erro quando o limite semanal de 2 escalas (Domingo a Sábado) é ultrapassado', () => {
    // 2026-10-04 é Domingo e 2026-10-10 é Sábado
    const assignments: Record<string, string[]> = {
      '2026-10-04': ['p1'], // Dom
      '2026-10-06': ['p1'], // Ter
      '2026-10-08': ['p1'], // Qui (3º dia na mesma semana!)
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const error = errors.find((e) => e.rule === 'weekly_limit');
    expect(error).toBeDefined();
    expect(error?.severity).toBe('error');
    expect(error?.message).toContain('Limite semanal excedido');
    expect(error?.message).toContain('3 vezes');
  });

  it('deve acusar erro quando há mais de uma pessoa atribuída ao mesmo dia (conflito não resolvido)', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1', 'p3'], // 2 pessoas no mesmo dia
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const error = errors.find((e) => e.rule === 'multi_assigned');
    expect(error).toBeDefined();
    expect(error?.severity).toBe('error');
    expect(error?.message).toContain('Conflito de alocação');
    expect(error?.message).toContain('2 pessoas atribuídas');
  });

  it('deve acusar aviso para dias vazios sem ninguém escalado no mês atual', () => {
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const emptyErrors = errors.filter((e) => e.rule === 'empty_day');
    // Outubro tem 31 dias, 1 preenchido => 30 dias vazios
    expect(emptyErrors.length).toBe(30);
    expect(emptyErrors[0].severity).toBe('warning');
    expect(emptyErrors[0].message).toContain('Dia sem responsável');
  });

  it('deve acusar erro quando uma pessoa é escalada sem ter marcado disponibilidade', () => {
    // p2 só tem disponibilidade nos dias pares (2, 4, 6...)
    const assignments: Record<string, string[]> = {
      '2026-10-05': ['p2'], // Dia 5 não está na disponibilidade de p2
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const error = errors.find((e) => e.rule === 'not_available');
    expect(error).toBeDefined();
    expect(error?.severity).toBe('error');
    expect(error?.personId).toBe('p2');
    expect(error?.message).toContain('Indisponibilidade');
  });

  it('deve retornar zero erros críticos quando todos os dias estão em conformidade com as regras', () => {
    // Cria uma alocação alternada sem dias consecutivos e com máx 2 dias por semana
    // Semana 1: 01 (Qui - p1), 03 (Sáb - p1) -> 2 vezes na semana
    // Semana 2: 05 (Seg - p3), 07 (Qua - p3) -> 2 vezes na semana
    const assignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-03': ['p1'],
      '2026-10-05': ['p3'],
      '2026-10-07': ['p3'],
    };

    const errors = validateSchedule({
      currentMonth: '2026-10',
      allAssignments: assignments,
      persons: mockPersons,
      availabilities: mockAvailabilities,
    });

    const criticalErrors = errors.filter((e) => e.severity === 'error');
    expect(criticalErrors.length).toBe(0);
  });
});

