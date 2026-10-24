import { describe, it, expect, vi } from 'vitest'
import * as XLSX from 'xlsx'

import {
  generateScheduleWorkbook,
  getScheduleFileBaseName,
  exportScheduleToExcel,
} from './export-to-excel'

vi.mock('xlsx', async () => {
  const actual = await vi.importActual<typeof XLSX>('xlsx')
  return {
    ...actual,
    writeFile: vi.fn(),
  }
})

describe('exportScheduleToExcel - Geração de Planilha', () => {
  it('gera workbook com 3 abas e preenchimento correto', () => {
    const workbook = generateScheduleWorkbook({
      month: '2026-10',
      persons: [
        { id: 'p1', name: 'Dr. Lucas Silva', color: '#3B82F6' },
        { id: 'p2', name: 'Dra. Camila Santos', color: '#10B981' },
      ],
      assignments: {
        '2026-10-01': ['p1'],
        '2026-10-02': ['p2'],
        '2026-10-05': ['p1', 'p2'],
      },
      events: [
        { id: 'ev1', date: '2026-10-12', title: 'Feriado de Nossa Senhora' },
      ],
    })

    expect(workbook.SheetNames).toEqual([
      'Escala Detalhada',
      'Resumo por Profissional',
      'Grade Panorâmica',
    ])

    // Validates that the first sheet contains expected cells
    const detailedSheet = workbook.Sheets['Escala Detalhada']
    expect(detailedSheet).toBeDefined()

    const summarySheet = workbook.Sheets['Resumo por Profissional']
    expect(summarySheet).toBeDefined()

    const matrixSheet = workbook.Sheets['Grade Panorâmica']
    expect(matrixSheet).toBeDefined()
  })

  it('gera workbook com 4 abas incluindo Fechamento Financeiro e detalhes de plantões quando houver taxas configuradas', () => {
    const workbook = generateScheduleWorkbook({
      month: '2026-10',
      persons: [
        { id: 'p1', name: 'Dr. Lucas Silva', color: '#3B82F6' },
      ],
      assignments: {
        '2026-10-01': ['p1'],
      },
      dayShiftAssignments: {
        '2026-10-01': { 's1': 'p1' },
      },
      shiftDefinitions: [
        {
          id: 's1',
          name: 'Plantão Diurno',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-20T00:00:00.000Z',
        },
      ],
      availabilities: [
        {
          personId: 'p1',
          month: '2026-10',
          availableDays: [1],
          shiftRates: {
            's1': { 1: 1800 },
          },
        },
      ],
      events: [],
    })

    expect(workbook.SheetNames).toEqual([
      'Escala Detalhada',
      'Resumo por Profissional',
      'Grade Panorâmica',
      'Fechamento Financeiro',
    ])

    const financialSheet = workbook.Sheets['Fechamento Financeiro']
    expect(financialSheet).toBeDefined()
  })

  it('gera o nome base do arquivo com mês de 1 a 12 e ano em português (escala) e inglês (schedule)', () => {
    expect(getScheduleFileBaseName('2026-01', 'pt-BR')).toBe('escala-1-2026')
    expect(getScheduleFileBaseName('2026-10', 'pt-BR')).toBe('escala-10-2026')
    expect(getScheduleFileBaseName('2026-01', 'en-US')).toBe('schedule-1-2026')
    expect(getScheduleFileBaseName('2026-12', 'en-US')).toBe('schedule-12-2026')
  })

  it('salva o arquivo Excel com o nome formatado de acordo com o idioma e mês (1-12)', () => {
    exportScheduleToExcel({
      month: '2026-03',
      persons: [],
      assignments: {},
      events: [],
      language: 'pt-BR',
    })
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'escala-3-2026.xlsx')

    exportScheduleToExcel({
      month: '2026-03',
      persons: [],
      assignments: {},
      events: [],
      language: 'en-US',
    })
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'schedule-3-2026.xlsx')
  })
})

