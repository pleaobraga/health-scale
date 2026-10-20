import { parseISO, format } from 'date-fns'

import {
  getMonthDaysArray,
  getConsecutiveDates,
  getWeekStartKey,
  getWeekEndKey,
  formatDisplayDate,
} from './date-utils'
import {
  validateSchedule as ruleEngineValidate,
  DEFAULT_SHIFTS,
  DEFAULT_RULES,
  doShiftDefinitionsOverlap,
} from '../services/validation/rule-engine'

import type {
  Person,
  MonthlyAvailability,
  ValidationError,
  ShiftRule,
  ShiftDefinition,
} from '../types'

export interface ValidationParams {
  currentMonth: string; // 'YYYY-MM'
  allAssignments: Record<string, string[]>; // 'YYYY-MM-DD' -> array of personId(s)
  persons: Person[];
  availabilities: MonthlyAvailability[]; // all recorded availabilities
  activeRuleIds?: string[];
  allRules?: ShiftRule[];
  allShifts?: ShiftDefinition[];
  dayShiftAssignments?: Record<string, Record<string, string>>;
}

/**
 * Pure validation engine for schedule auditing.
 * Checks:
 * 1. Rest rule: No consecutive days (D and D+1 / D-1), crossing month boundaries.
 * 2. Weekly limit rule: Max 2 assignments per Sunday-to-Saturday block, crossing month boundaries.
 * 3. Allocation inconsistencies:
 *    - More than 1 person assigned (unresolved conflict)
 *    - Empty day (no person assigned)
 *    - Assigned person was not available for that day
 */
export function validateSchedule({
  currentMonth,
  allAssignments,
  persons,
  availabilities,
  activeRuleIds,
  allRules,
  allShifts,
  dayShiftAssignments,
}: ValidationParams): ValidationError[] {
  const errors: ValidationError[] = []
  const personMap = new Map<string, Person>(persons.map((p) => [p.id, p]))

  // Helper to get person name
  const getPersonName = (id: string) => personMap.get(id)?.name || 'Pessoa desconhecida'

  // Days in current month
  const currentMonthDays = getMonthDaysArray(currentMonth)

  // Set of week start keys (Sundays) evaluated to avoid duplicate weekly errors
  const evaluatedWeeksPerPerson = new Set<string>() // "personId_sundayDateStr"
  // Set of consecutive day pairs evaluated to avoid duplicate A->B and B->A reporting
  const evaluatedConsecutivePairs = new Set<string>() // "personId_date1_date2"

  // 1. Audit each day of the current month
  for (const dayNum of currentMonthDays) {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${currentMonth}-${dayStr}`
    const assignedIds = allAssignments[dateStr] || []

    // Check: Empty day
    if (assignedIds.length === 0) {
      errors.push({
        id: `empty_${dateStr}`,
        rule: 'empty_day',
        severity: 'warning',
        date: dateStr,
        message: `Dia sem responsável: o dia ${formatDisplayDate(dateStr)} está sem nenhuma pessoa escalada.`,
      })
      continue
    }

    // Check: Multiple people assigned (unresolved conflict)
    // If the day has distinct shift slots that do not overlap (e.g. 2 different 12h shifts: D12 and N12),
    // having 2 people on different shifts covering the day is normal and NOT a conflict!
    const dayShifts = dayShiftAssignments ? dayShiftAssignments[dateStr] : undefined
    let isMultiShiftDay = Boolean(dayShifts && Object.keys(dayShifts).length > 1)

    // If day has multiple shifts, verify they do not overlap in working hours
    if (isMultiShiftDay && dayShifts) {
      const assignedShiftDefs = Object.keys(dayShifts)
        .map((sId) => (allShifts || DEFAULT_SHIFTS).find((s) => s.id === sId))
        .filter((s): s is ShiftDefinition => Boolean(s))

      for (let i = 0; i < assignedShiftDefs.length; i++) {
        for (let j = i + 1; j < assignedShiftDefs.length; j++) {
          if (doShiftDefinitionsOverlap(assignedShiftDefs[i], assignedShiftDefs[j], dateStr)) {
            isMultiShiftDay = false
            break
          }
        }
        if (!isMultiShiftDay) break
      }
    }

    // Check if MAX_PEOPLE_PER_SHIFT rule is active; if active, ruleEngine handles it dynamically
    const hasActiveMaxPeopleRule = (allRules || DEFAULT_RULES).some(
      (r) => (activeRuleIds?.includes(r.id) ?? r.enabledByDefault) && r.type === 'MAX_PEOPLE_PER_SHIFT'
    )

    if (assignedIds.length > 1 && !isMultiShiftDay && !hasActiveMaxPeopleRule) {
      const names = assignedIds.map(getPersonName).join(', ')
      errors.push({
        id: `multi_${dateStr}`,
        rule: 'multi_assigned',
        severity: 'error',
        date: dateStr,
        message: `Conflito de alocação: o dia ${formatDisplayDate(dateStr)} possui ${assignedIds.length} pessoas atribuídas (${names}). Apenas uma pessoa deve ser designada por turno.`,
      })
    }

    // Check availability for each assigned person
    for (const personId of assignedIds) {
      const pName = getPersonName(personId)
      const userMonthAvail = availabilities.find(
        (a) => a.personId === personId && a.month === currentMonth
      )

      // Check if person is assigned to a specific shift on this day
      let assignedShiftId: string | undefined
      if (dayShifts) {
        assignedShiftId = Object.entries(dayShifts).find(([, pId]) => pId === personId)?.[0]
      }

      let isAvailable = false
      if (userMonthAvail) {
        if (
          assignedShiftId &&
          userMonthAvail.shiftAvailability &&
          Object.keys(userMonthAvail.shiftAvailability).length > 0
        ) {
          const shiftDays = userMonthAvail.shiftAvailability[assignedShiftId]
          isAvailable = shiftDays ? shiftDays.includes(dayNum) : false
        } else {
          isAvailable = userMonthAvail.availableDays.includes(dayNum)
        }
      }

      if (!isAvailable) {
        const shiftDef =
          assignedShiftId && allShifts ? allShifts.find((s) => s.id === assignedShiftId) : undefined
        const shiftContext = shiftDef ? ` no plantão ${shiftDef.name} (${shiftDef.code})` : ''
        errors.push({
          id: `unavail_${dateStr}_${personId}`,
          rule: 'not_available',
          severity: 'error',
          date: dateStr,
          personId,
          personName: pName,
          message: `Indisponibilidade: ${pName} foi escalado(a)${shiftContext} no dia ${formatDisplayDate(dateStr)}, mas não informou disponibilidade para esta data.`,
        })
      }
    }
  }

  // 2. Audit Consecutive Days (Rest rule) & Weekly Limits across the timeline
  // Only evaluate legacy rules if activeRuleIds is omitted OR explicitly contains legacy IDs
  const hasActiveRuleIds = activeRuleIds !== undefined
  const hasDynamicRules = Boolean(hasActiveRuleIds && allRules && allRules.length > 0)
  const isConsecutiveRuleActive = !hasActiveRuleIds
    ? true
    : (!hasDynamicRules && (activeRuleIds?.some((id) => id.includes('consec') || id.includes('rest')) ?? true)) ||
      Boolean(activeRuleIds?.includes('consecutive_days'))
  const isWeeklyRuleActive = !hasActiveRuleIds
    ? true
    : (!hasDynamicRules && (activeRuleIds?.some((id) => id.includes('week')) ?? true)) ||
      Boolean(activeRuleIds?.includes('weekly_limit'))

  for (const dayNum of currentMonthDays) {
    const dayStr = dayNum.toString().padStart(2, '0')
    const dateStr = `${currentMonth}-${dayStr}`
    const assignedIds = allAssignments[dateStr] || []

    for (const personId of assignedIds) {
      const pName = getPersonName(personId)

      // Check consecutive days: D and D+1
      if (isConsecutiveRuleActive) {
        const { nextDateStr } = getConsecutiveDates(dateStr)
        const nextDayAssignedIds = allAssignments[nextDateStr] || []

        if (nextDayAssignedIds.includes(personId)) {
          const pairKey = `${personId}_${dateStr}_${nextDateStr}`
          if (!evaluatedConsecutivePairs.has(pairKey)) {
            evaluatedConsecutivePairs.add(pairKey)
            errors.push({
              id: `consecutive_${personId}_${dateStr}`,
              rule: 'consecutive_days',
              severity: 'error',
              date: dateStr,
              personId,
              personName: pName,
              message: `Descanso violado: ${pName} foi escalado(a) em dias seguidos (${formatDisplayDate(dateStr)} e ${formatDisplayDate(nextDateStr)}). É obrigatório pelo menos 1 dia de descanso.`,
            })
          }
        }
      }

      // Check weekly limit (Sunday to Saturday block)
      if (isWeeklyRuleActive) {
        const weekStart = getWeekStartKey(dateStr)
        const weekKey = `${personId}_${weekStart}`

        if (!evaluatedWeeksPerPerson.has(weekKey)) {
          evaluatedWeeksPerPerson.add(weekKey)

          // Scan all 7 days of this week (Sunday to Saturday)
          const weekSunday = parseISO(weekStart)
          const weekDates: string[] = []
          for (let i = 0; i < 7; i++) {
            const d = new Date(weekSunday)
            d.setDate(d.getDate() + i)
            weekDates.push(format(d, 'yyyy-MM-dd'))
          }

          // Count how many days this person is assigned in this Sunday-Saturday block across all stored assignments
          const workedDatesInWeek = weekDates.filter((d) =>
            (allAssignments[d] || []).includes(personId)
          )

          if (workedDatesInWeek.length > 2) {
            const weekEnd = getWeekEndKey(dateStr)
            const formattedDatesList = workedDatesInWeek.map((d) => formatDisplayDate(d)).join(', ')
            errors.push({
              id: `weekly_${personId}_${weekStart}`,
              rule: 'weekly_limit',
              severity: 'error',
              date: dateStr,
              personId,
              personName: pName,
              message: `Limite semanal excedido: ${pName} foi escalado(a) ${workedDatesInWeek.length} vezes na semana de ${formatDisplayDate(weekStart)} a ${formatDisplayDate(weekEnd)} (${formattedDatesList}). O limite máximo é de 2 escalas por semana.`,
            })
          }
        }
      }
    }
  }

  // 3. If dynamic rules are provided or activeRuleIds is present, execute RuleEngine for custom rules
  if (hasActiveRuleIds) {
    const rulesToRun = allRules || DEFAULT_RULES
    const shiftsToRun = allShifts || DEFAULT_SHIFTS

    const monthShifts: Record<string, { personId: string; shiftDefinitionId: string }> = {}
    if (dayShiftAssignments) {
      for (const [dStr, shiftMap] of Object.entries(dayShiftAssignments)) {
        if (dStr.startsWith(currentMonth)) {
          for (const [sId, pId] of Object.entries(shiftMap)) {
            monthShifts[`${dStr}_${sId}_${pId}`] = {
              personId: pId,
              shiftDefinitionId: sId,
            }
          }
        }
      }
    }

    const dynamicViolations = ruleEngineValidate(
      {
        month: currentMonth,
        assignments: allAssignments,
        shifts: monthShifts,
      },
      rulesToRun,
      shiftsToRun,
      activeRuleIds || [],
      persons
    )

    for (const v of dynamicViolations) {
      // Avoid duplicate reports if legacy already reported it
      const alreadyReported = errors.some(
        (e) => e.date === v.date && e.personId === v.personId && (e.rule === v.ruleId || e.id.includes(v.ruleId))
      )
      if (!alreadyReported) {
        errors.push({
          id: `${v.ruleId}_${v.personId}_${v.date}`,
          rule: v.ruleId,
          severity: v.severity.toLowerCase() as 'error' | 'warning',
          date: v.date,
          personId: v.personId,
          personName: v.personName,
          message: v.message,
        })
      }
    }
  }

  // Sort errors by date, then severity (errors first, then warnings)
  return errors.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.severity === 'error' && b.severity !== 'error') return -1
    if (a.severity !== 'error' && b.severity === 'error') return 1
    return a.id.localeCompare(b.id)
  })
}
