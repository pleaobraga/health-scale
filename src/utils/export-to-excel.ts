import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'

import { getMonthDaysArray, formatMonthYear } from './date-utils'

import type {
  Person,
  CalendarEvent,
  ShiftDefinition,
  MonthlyAvailability,
} from '../types'

export interface ExportScheduleParams {
  month: string; // 'YYYY-MM'
  persons: Person[];
  assignments: Record<string, string[]>;
  events: CalendarEvent[];
  dayShiftAssignments?: Record<string, Record<string, string>>;
  shiftDefinitions?: ShiftDefinition[];
  availabilities?: MonthlyAvailability[];
}

export const generateScheduleWorkbook = ({
  month,
  persons,
  assignments,
  events,
  dayShiftAssignments = {},
  shiftDefinitions = [],
  availabilities = [],
}: ExportScheduleParams): XLSX.WorkBook => {
  const personMap = new Map(persons.map((p) => [p.id, p]))
  const shiftDefMap = new Map((shiftDefinitions || []).map((s) => [s.id, s]))
  const days = getMonthDaysArray(month)
  const formattedMonthTitle = formatMonthYear(month)

  // 1. Sheet 1: Detailed Daily Schedule
  const dailyRows: (string | number)[][] = [
    [`ESCALA DE PLANTÕES - ${formattedMonthTitle.toUpperCase()}`],
    [],
    ['Data', 'Dia da Semana', 'Profissional(is) Escalado(s) / Turnos', 'Status', 'Eventos / Observações'],
  ]

  days.forEach((dayNum) => {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${month}-${dayStr}`
    const dateObj = parseISO(dateStr)
    const dayOfWeek = format(dateObj, 'EEEE', { locale: ptBR })
    const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    const formattedDate = format(dateObj, 'dd/MM/yyyy')

    const assignedIds = assignments[dateStr] || []
    const dayShifts = dayShiftAssignments[dateStr]

    let assignedDetails = ''
    if (dayShifts && Object.keys(dayShifts).length > 0) {
      const shiftParts: string[] = []
      for (const [shiftId, personId] of Object.entries(dayShifts)) {
        if (!personId) continue
        const personName = personMap.get(personId)?.name || 'Desconhecido'
        const shiftDef = shiftDefMap.get(shiftId)
        const shiftLabel = shiftDef ? `${shiftDef.name} (${shiftDef.code})` : 'Plantão'
        shiftParts.push(`${shiftLabel}: ${personName}`)
      }
      assignedDetails = shiftParts.join(' | ')
    }

    if (!assignedDetails) {
      assignedDetails = assignedIds
        .map((id) => personMap.get(id)?.name || 'Desconhecido')
        .join(', ')
    }

    let status = 'Escalado'
    if (dayShifts && Object.keys(dayShifts).length > 0) {
      const activeCount = Object.values(dayShifts).filter(Boolean).length
      status = activeCount === 0 ? 'Vago' : `${activeCount} turno(s)`
    } else if (assignedIds.length === 0) {
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
      assignedDetails || '(Vago)',
      status,
      eventDetails || '-',
    ])
  })

  const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows)
  dailySheet['!cols'] = [
    { wch: 14 }, // Date
    { wch: 18 }, // Day of Week
    { wch: 38 }, // Assigned Professional(s) / Shifts
    { wch: 18 }, // Status
    { wch: 40 }, // Events
  ]

  // 2. Sheet 2: Summary by Professional
  const hasRates = availabilities.some(
    (a) => a.month === month && a.shiftRates && Object.keys(a.shiftRates).length > 0
  )

  const summaryHeaders: (string | number)[] = [
    'Profissional',
    'Total de Plantões',
    'Dias Escalados no Mês',
    'Detalhamento de Turnos',
  ]
  if (hasRates) {
    summaryHeaders.push('Valor Total a Pagar (R$)')
  }

  const summaryRows: (string | number)[][] = [
    [`RESUMO DE PLANTÕES POR PROFISSIONAL - ${formattedMonthTitle.toUpperCase()}`],
    [],
    summaryHeaders,
  ]

  persons.forEach((person) => {
    const assignedDays: number[] = []
    const shiftCounts: Record<string, number> = {}
    let personTotalAmount = 0

    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${month}-${dayStr}`
      const dayShifts = dayShiftAssignments[dateStr]
      let workedThisDay = false

      if (dayShifts && Object.keys(dayShifts).length > 0) {
        for (const [shiftId, pId] of Object.entries(dayShifts)) {
          if (pId === person.id) {
            workedThisDay = true
            const shiftDef = shiftDefMap.get(shiftId)
            const code = shiftDef ? shiftDef.code : 'PL'
            shiftCounts[code] = (shiftCounts[code] || 0) + 1

            const userAvail = availabilities.find(
              (a) => a.personId === person.id && a.month === month,
            )
            const rate = userAvail?.shiftRates?.[shiftId]?.[dayNum] ?? 0
            personTotalAmount += rate
          }
        }
      }

      if (!workedThisDay && (assignments[dateStr] || []).includes(person.id)) {
        workedThisDay = true
        shiftCounts['PL'] = (shiftCounts['PL'] || 0) + 1

        const userAvail = availabilities.find(
          (a) => a.personId === person.id && a.month === month,
        )
        const rate = userAvail?.shiftRates?.['default']?.[dayNum] ?? 0
        personTotalAmount += rate
      }

      if (workedThisDay) {
        assignedDays.push(dayNum)
      }
    })

    const daysFormatted = assignedDays.length > 0
      ? assignedDays.map((d) => d.toString().padStart(2, '0')).join(', ')
      : 'Nenhum plantão'

    const shiftBreakdown = Object.entries(shiftCounts)
      .map(([code, count]) => `${count}x ${code}`)
      .join(', ') || '-'

    const row: (string | number)[] = [
      person.name,
      assignedDays.length,
      daysFormatted,
      shiftBreakdown,
    ]

    if (hasRates) {
      row.push(personTotalAmount)
    }

    summaryRows.push(row)
  })

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  summarySheet['!cols'] = [
    { wch: 28 }, // Professional
    { wch: 18 }, // Total
    { wch: 40 }, // Days
    { wch: 25 }, // Shifts breakdown
    ...(hasRates ? [{ wch: 24 }] : []), // Value to pay
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
      const dayShifts = dayShiftAssignments[dateStr]
      let shiftCodeMarker = ''

      if (dayShifts && Object.keys(dayShifts).length > 0) {
        const codes: string[] = []
        for (const [shiftId, pId] of Object.entries(dayShifts)) {
          if (pId === person.id) {
            const shiftDef = shiftDefMap.get(shiftId)
            codes.push(shiftDef ? shiftDef.code : 'X')
          }
        }
        if (codes.length > 0) {
          shiftCodeMarker = codes.join('/')
        }
      }

      if (!shiftCodeMarker && (assignments[dateStr] || []).includes(person.id)) {
        shiftCodeMarker = 'X'
      }

      row.push(shiftCodeMarker)
    })
    matrixRows.push(row)
  })

  // Daily total row
  const dailyTotalRow: (string | number)[] = ['TOTAL ESCALADOS']
  days.forEach((dayNum) => {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${month}-${dayStr}`
    const dayShifts = dayShiftAssignments[dateStr]
    if (dayShifts && Object.keys(dayShifts).length > 0) {
      dailyTotalRow.push(Object.values(dayShifts).filter(Boolean).length)
    } else {
      dailyTotalRow.push((assignments[dateStr] || []).length)
    }
  })
  matrixRows.push(dailyTotalRow)

  const matrixSheet = XLSX.utils.aoa_to_sheet(matrixRows)
  matrixSheet['!cols'] = [{ wch: 28 }, ...days.map(() => ({ wch: 5 }))]

  // 4. Assemble Workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Escala Detalhada')
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo por Profissional')
  XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Grade Panorâmica')

  // 5. Optional Sheet 4: Fechamento Financeiro (if rates exist)
  if (hasRates) {
    const financialRows: (string | number)[][] = [
      [`FECHAMENTO FINANCEIRO DE PLANTÕES - ${formattedMonthTitle.toUpperCase()}`],
      [],
      ['Data', 'Dia da Semana', 'Profissional', 'Turno', 'Código', 'Valor (R$)'],
    ]

    let grandTotal = 0
    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${month}-${dayStr}`
      const dateObj = parseISO(dateStr)
      const dayOfWeek = format(dateObj, 'EEEE', { locale: ptBR })
      const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
      const formattedDate = format(dateObj, 'dd/MM/yyyy')

      const dayShifts = dayShiftAssignments[dateStr]
      if (dayShifts && Object.keys(dayShifts).length > 0) {
        for (const [shiftId, pId] of Object.entries(dayShifts)) {
          if (!pId) continue
          const person = personMap.get(pId)
          const shiftDef = shiftDefMap.get(shiftId)
          const userAvail = availabilities.find(
            (a) => a.personId === pId && a.month === month,
          )
          const rate = userAvail?.shiftRates?.[shiftId]?.[dayNum] ?? 0
          grandTotal += rate

          financialRows.push([
            formattedDate,
            capitalizedDayOfWeek,
            person?.name || 'Desconhecido',
            shiftDef?.name || 'Plantão',
            shiftDef?.code || 'PL',
            rate,
          ])
        }
      }
    })

    financialRows.push([])
    financialRows.push(['TOTAL GERAL', '', '', '', '', grandTotal])

    const financialSheet = XLSX.utils.aoa_to_sheet(financialRows)
    financialSheet['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 28 },
      { wch: 24 },
      { wch: 12 },
      { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Fechamento Financeiro')
  }

  return workbook
}

export const exportScheduleToExcel = (params: ExportScheduleParams): void => {
  const workbook = generateScheduleWorkbook(params)
  const cleanMonth = params.month.replace('-', '_')
  const fileName = `Escala_${cleanMonth}.xlsx`

  XLSX.writeFile(workbook, fileName)
}
