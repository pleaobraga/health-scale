import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'

import { getMonthDaysArray, formatMonthYear } from './date-utils'

import type { Person, CalendarEvent } from '../types'

interface ExportScheduleParams {
  month: string; // 'YYYY-MM'
  persons: Person[];
  assignments: Record<string, string[]>;
  events: CalendarEvent[];
}

export const generateScheduleWorkbook = ({
  month,
  persons,
  assignments,
  events,
}: ExportScheduleParams): XLSX.WorkBook => {
  const personMap = new Map(persons.map((p) => [p.id, p]))
  const days = getMonthDaysArray(month)
  const formattedMonthTitle = formatMonthYear(month)

  // 1. Sheet 1: Detailed Daily Schedule
  const dailyRows: (string | number)[][] = [
    [`ESCALA DE PLANTÕES - ${formattedMonthTitle.toUpperCase()}`],
    [],
    ['Data', 'Dia da Semana', 'Profissional(is) Escalado(s)', 'Status', 'Eventos / Observações'],
  ]

  days.forEach((dayNum) => {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${month}-${dayStr}`
    const dateObj = parseISO(dateStr)
    const dayOfWeek = format(dateObj, 'EEEE', { locale: ptBR })
    const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    const formattedDate = format(dateObj, 'dd/MM/yyyy')

    const assignedIds = assignments[dateStr] || []
    const assignedNames = assignedIds
      .map((id) => personMap.get(id)?.name || 'Desconhecido')
      .join(', ')

    let status = 'Escalado'
    if (assignedIds.length === 0) {
      status = 'Vago'
    } else if (assignedIds.length > 1) {
      status = `Conflito (${assignedIds.length} profissionais)`
    }

    const dayEvents = events.filter((e) => e.date === dateStr)
    const eventDetails = dayEvents
      .map((e) => {
        const timePrefix = e.time ? `[${e.time}] ` : ''
        const caregiverId = e.personId || assignedIds[0]
        const caregiver = caregiverId ? personMap.get(caregiverId) : null
        const caregiverSuffix = caregiver ? ` (${caregiver.name})` : ''
        return `${timePrefix}${e.title}${caregiverSuffix}`
      })
      .join(' | ')

    dailyRows.push([
      formattedDate,
      capitalizedDayOfWeek,
      assignedNames || '(Vago)',
      status,
      eventDetails || '-',
    ])
  })

  const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows)
  dailySheet['!cols'] = [
    { wch: 14 }, // Date
    { wch: 18 }, // Day of Week
    { wch: 32 }, // Assigned Professional(s)
    { wch: 16 }, // Status
    { wch: 40 }, // Events
  ]

  // 2. Sheet 2: Summary by Professional
  const summaryRows: (string | number)[][] = [
    [`RESUMO DE PLANTÕES POR PROFISSIONAL - ${formattedMonthTitle.toUpperCase()}`],
    [],
    ['Profissional', 'Total de Plantões', 'Dias Escalados no Mês'],
  ]

  persons.forEach((person) => {
    const assignedDays: number[] = []
    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${month}-${dayStr}`
      if ((assignments[dateStr] || []).includes(person.id)) {
        assignedDays.push(dayNum)
      }
    })

    const daysFormatted = assignedDays.length > 0
      ? assignedDays.map((d) => d.toString().padStart(2, '0')).join(', ')
      : 'Nenhum plantão'

    summaryRows.push([person.name, assignedDays.length, daysFormatted])
  })

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  summarySheet['!cols'] = [
    { wch: 28 }, // Professional
    { wch: 18 }, // Total
    { wch: 50 }, // Days
  ]

  // 3. Sheet 3: Panoramic Grid (Matrix: Professional x Days 1..N)
  const matrixHeader: (string | number)[] = ['Profissional', ...days.map((d) => d.toString())]
  const matrixRows: (string | number)[][] = [
    [`GRADE PANORÂMICA MENSAL - ${formattedMonthTitle.toUpperCase()}`],
    [],
    matrixHeader,
  ]

  persons.forEach((person) => {
    const row: (string | number)[] = [person.name]
    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${month}-${dayStr}`
      const isAssigned = (assignments[dateStr] || []).includes(person.id)
      row.push(isAssigned ? 'X' : '')
    })
    matrixRows.push(row)
  })

  // Daily total row
  const dailyTotalRow: (string | number)[] = ['TOTAL ESCALADOS']
  days.forEach((dayNum) => {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${month}-${dayStr}`
    dailyTotalRow.push((assignments[dateStr] || []).length)
  })
  matrixRows.push(dailyTotalRow)

  const matrixSheet = XLSX.utils.aoa_to_sheet(matrixRows)
  matrixSheet['!cols'] = [{ wch: 28 }, ...days.map(() => ({ wch: 5 }))]

  // 4. Assemble Workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Escala Detalhada')
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo por Profissional')
  XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Grade Panorâmica')

  return workbook
}

export const exportScheduleToExcel = (params: ExportScheduleParams): void => {
  const workbook = generateScheduleWorkbook(params)
  const cleanMonth = params.month.replace('-', '_')
  const fileName = `Escala_${cleanMonth}.xlsx`

  XLSX.writeFile(workbook, fileName)
}
