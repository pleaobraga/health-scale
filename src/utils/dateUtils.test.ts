import { describe, it, expect } from 'vitest';
import {
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
} from './dateUtils';

describe('dateUtils - Utilitários de manipulação de data', () => {
  it('deve formatar mês e ano em português por extenso', () => {
    expect(formatMonthYear('2026-10')).toBe('Outubro de 2026');
    expect(formatMonthYear('2026-01')).toBe('Janeiro de 2026');
  });

  it('deve calcular mês anterior e próximo mês corretamente', () => {
    expect(getPreviousMonth('2026-10')).toBe('2026-09');
    expect(getNextMonth('2026-10')).toBe('2026-11');
    // Virada de ano
    expect(getPreviousMonth('2026-01')).toBe('2025-12');
    expect(getNextMonth('2026-12')).toBe('2027-01');
  });

  it('deve retornar contagem correta de dias no mês', () => {
    expect(getDaysCountInMonth('2026-10')).toBe(31);
    expect(getDaysCountInMonth('2026-11')).toBe(30);
    expect(getDaysCountInMonth('2026-02')).toBe(28); // não bissexto
    expect(getDaysCountInMonth('2024-02')).toBe(29); // bissexto
  });

  it('deve gerar array com todos os dias do mês de 1 a N', () => {
    const days = getMonthDaysArray('2026-10');
    expect(days.length).toBe(31);
    expect(days[0]).toBe(1);
    expect(days[30]).toBe(31);
  });

  it('deve gerar o grid de calendário iniciando no Domingo (0) e terminando no Sábado (6)', () => {
    const grid = getMonthCalendarGrid('2026-10');
    // O total de células no grid deve ser múltiplo de 7
    expect(grid.length % 7).toBe(0);

    // Primeiro dia do grid deve ser Domingo
    expect(grid[0].dayOfWeek).toBe(0);
    // Último dia do grid deve ser Sábado
    expect(grid[grid.length - 1].dayOfWeek).toBe(6);

    // Células do mês atual devem ter flag isCurrentMonth = true
    const currentMonthDays = grid.filter((c) => c.isCurrentMonth);
    expect(currentMonthDays.length).toBe(31);
  });

  it('deve calcular corretamente a chave do início da semana (Domingo) e fim (Sábado)', () => {
    // 2026-10-07 é uma Quarta-feira
    // O domingo daquela semana é 2026-10-04
    // O sábado daquela semana é 2026-10-10
    expect(getWeekStartKey('2026-10-07')).toBe('2026-10-04');
    expect(getWeekEndKey('2026-10-07')).toBe('2026-10-10');

    // Para o próprio domingo (2026-10-04), start deve ser 2026-10-04
    expect(getWeekStartKey('2026-10-04')).toBe('2026-10-04');
  });

  it('deve formatar data para formato brasileiro dd/MM/yyyy', () => {
    expect(formatDisplayDate('2026-10-05')).toBe('05/10/2026');
    expect(formatDisplayDate('2026-01-01')).toBe('01/01/2026');
  });

  it('deve retornar datas consecutivas anterior e posterior', () => {
    const { prevDateStr, nextDateStr } = getConsecutiveDates('2026-10-15');
    expect(prevDateStr).toBe('2026-10-14');
    expect(nextDateStr).toBe('2026-10-16');

    // Teste de virada de mês
    const boundary = getConsecutiveDates('2026-10-31');
    expect(boundary.prevDateStr).toBe('2026-10-30');
    expect(boundary.nextDateStr).toBe('2026-11-01');
  });
});

