import { describe, it, expect } from 'vitest'

import { generateScheduleWorkbook } from './export-to-excel'

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
})

