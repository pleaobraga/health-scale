import { parseISO, addHours, differenceInMinutes, startOfWeek, format } from 'date-fns'

import { i18n } from '../../i18n'

import type { Person } from '../../types'
import type {
  ShiftDefinition,
  ShiftRule,
  RuleViolation,
  MonthScheduleDocument,
} from '../../types/scheduleConfig'

export const DEFAULT_SHIFTS: ShiftDefinition[] = [
  {
    id: 'shift_d12',
    name: 'Plantão Diurno 12h',
    code: 'D12',
    startTime: '07:00',
    durationHours: 12,
    color: '#3B82F6',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'shift_n12',
    name: 'Plantão Noturno 12h',
    code: 'N12',
    startTime: '19:00',
    durationHours: 12,
    color: '#6366F1',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'shift_p24',
    name: 'Plantão 24h',
    code: 'P24',
    startTime: '07:00',
    durationHours: 24,
    color: '#8B5CF6',
    enabledByDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

export const DEFAULT_RULES: ShiftRule[] = [
  {
    id: 'rule_max_shifts_day',
    name: 'Máximo 1 turno por dia',
    description: 'Impede que um profissional seja alocado em mais de um turno no mesmo dia civil',
    type: 'MAX_SHIFTS_PER_PERIOD',
    enabledByDefault: true,
    severity: 'ERROR',
    parameters: {
      scope: 'DAY',
      maxOccurrences: 1,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule_max_shifts_week',
    name: 'Máximo 2 turnos por semana',
    description: 'Limita a escala semanal do profissional a no máximo 2 turnos',
    type: 'MAX_SHIFTS_PER_PERIOD',
    enabledByDefault: true,
    severity: 'WARNING',
    parameters: {
      scope: 'WEEK',
      maxOccurrences: 2,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule_min_rest_hours',
    name: 'Descanso mínimo entre plantões de 24h',
    description: 'Exige intervalo mínimo de 24 horas entre o término de um turno e o início do próximo',
    type: 'MIN_REST_HOURS',
    enabledByDefault: true,
    severity: 'ERROR',
    parameters: {
      minRestHours: 24,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

export interface NormalizedShiftEntry {
  date: string // YYYY-MM-DD
  personId: string
  shiftDefinition: ShiftDefinition
  startDateTime: Date
  endDateTime: Date
}

/**
 * Checks whether two shift definitions have overlapping work intervals on a given date.
 */
export function doShiftDefinitionsOverlap(
  shiftA: ShiftDefinition,
  shiftB: ShiftDefinition,
  dateStr = '2026-01-01'
): boolean {
  const startA = parseISO(`${dateStr}T${shiftA.startTime || '07:00'}:00`)
  const endA = addHours(startA, shiftA.durationHours || 12)
  const startB = parseISO(`${dateStr}T${shiftB.startTime || '07:00'}:00`)
  const endB = addHours(startB, shiftB.durationHours || 12)

  return startA.getTime() < endB.getTime() && startB.getTime() < endA.getTime()
}

/**
 * Extracts and normalizes shift allocations from MonthScheduleDocument.
 * Supports both structured `shifts` (`${date}_${shiftId}`) and legacy `assignments` (`${date}: personId[]`).
 */
export function extractNormalizedShifts(
  monthSchedule: MonthScheduleDocument,
  allShifts: ShiftDefinition[]
): NormalizedShiftEntry[] {
  const shiftMap = new Map<string, ShiftDefinition>(allShifts.map((s) => [s.id, s]))
  const defaultShift = allShifts[0] || DEFAULT_SHIFTS[0]
  const entries: NormalizedShiftEntry[] = []

  // 1. Process explicit `shifts` map if present
  if (monthSchedule.shifts && Object.keys(monthSchedule.shifts).length > 0) {
    for (const [key, item] of Object.entries(monthSchedule.shifts)) {
      if (!item || !item.personId) continue
      // Key format can be `${YYYY-MM-DD}_${shiftId}` or just a unique key
      const parts = key.split('_')
      const date = item.date || parts[0]
      const shiftDef = shiftMap.get(item.shiftDefinitionId) || defaultShift
      const startTime = shiftDef.startTime || '07:00'
      const startDateTime = parseISO(`${date}T${startTime}:00`)
      const endDateTime = addHours(startDateTime, shiftDef.durationHours || 12)

      entries.push({
        date,
        personId: item.personId,
        shiftDefinition: shiftDef,
        startDateTime,
        endDateTime,
      })
    }
  }

  // 2. Process legacy or fallback `assignments` map
  if (monthSchedule.assignments) {
    for (const [date, personIds] of Object.entries(monthSchedule.assignments)) {
      if (!Array.isArray(personIds) || personIds.length === 0) continue

      // If this date already has structured entries, avoid duplicating identical allocations
      const existingForDate = entries.filter((e) => e.date === date)
      for (const personId of personIds) {
        const alreadyAllocated = existingForDate.some((e) => e.personId === personId)
        if (alreadyAllocated) continue

        const shiftDef = defaultShift
        const startTime = shiftDef.startTime || '07:00'
        const startDateTime = parseISO(`${date}T${startTime}:00`)
        const endDateTime = addHours(startDateTime, shiftDef.durationHours || 12)

        entries.push({
          date,
          personId,
          shiftDefinition: shiftDef,
          startDateTime,
          endDateTime,
        })
      }
    }
  }

  // Sort chronologically by start date/time
  return entries.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
}

/**
 * Pure validation engine for schedules.
 */
export function validateSchedule(
  monthSchedule: MonthScheduleDocument,
  allRules: ShiftRule[],
  allShifts: ShiftDefinition[],
  activeRuleIds: string[],
  people: Person[]
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const personMap = new Map<string, Person>(people.map((p) => [p.id, p]))
  const getPersonName = (id: string) =>
    personMap.get(id)?.name || i18n.t('calendar:validation.messages.unknownProfessional')

  // Filter only active rules
  const activeRules = allRules.filter((r) => activeRuleIds.includes(r.id))
  if (activeRules.length === 0) return []

  const shiftEntries = extractNormalizedShifts(monthSchedule, allShifts)

  // Group shifts by person
  const shiftsByPerson = new Map<string, NormalizedShiftEntry[]>()
  for (const entry of shiftEntries) {
    const list = shiftsByPerson.get(entry.personId) || []
    list.push(entry)
    shiftsByPerson.set(entry.personId, list)
  }

  for (const rule of activeRules) {
    const targetShiftIds = rule.parameters.targetShiftIds
    const matchesTargetShifts = (entry: NormalizedShiftEntry) => {
      if (!targetShiftIds || targetShiftIds.length === 0) return true
      return targetShiftIds.includes(entry.shiftDefinition.id)
    }

    switch (rule.type) {
      case 'MAX_SHIFTS_PER_PERIOD': {
        const maxOccurrences = rule.parameters.maxOccurrences ?? 1
        const scope = rule.parameters.scope ?? 'DAY'

        for (const [personId, personShifts] of shiftsByPerson.entries()) {
          const personName = getPersonName(personId)
          const relevantShifts = personShifts.filter(matchesTargetShifts)

          if (scope === 'DAY') {
            // Group by date
            const byDate = new Map<string, NormalizedShiftEntry[]>()
            for (const s of relevantShifts) {
              const list = byDate.get(s.date) || []
              list.push(s)
              byDate.set(s.date, list)
            }

            for (const [date, dayShifts] of byDate.entries()) {
              if (dayShifts.length > maxOccurrences) {
                violations.push({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  severity: rule.severity,
                  personId,
                  personName,
                  date,
                  shiftId: dayShifts[0]?.shiftDefinition.id,
                  message: i18n.t('calendar:validation.messages.maxShiftsDay', {
                    ruleName: rule.name,
                    personName,
                    count: dayShifts.length,
                    date,
                    max: maxOccurrences,
                  }),
                })
              }
            }
          } else if (scope === 'WEEK') {
            // Group by calendar week (Sunday start)
            const byWeek = new Map<string, NormalizedShiftEntry[]>()
            for (const s of relevantShifts) {
              const weekStart = format(startOfWeek(parseISO(s.date), { weekStartsOn: 0 }), 'yyyy-MM-dd')
              const list = byWeek.get(weekStart) || []
              list.push(s)
              byWeek.set(weekStart, list)
            }

            for (const [, weekShifts] of byWeek.entries()) {
              if (weekShifts.length > maxOccurrences) {
                // Report on the shift that exceeded the limit
                const triggerShift = weekShifts[maxOccurrences] || weekShifts[weekShifts.length - 1]
                violations.push({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  severity: rule.severity,
                  personId,
                  personName,
                  date: triggerShift.date,
                  shiftId: triggerShift.shiftDefinition.id,
                  message: i18n.t('calendar:validation.messages.maxShiftsWeek', {
                    ruleName: rule.name,
                    personName,
                    count: weekShifts.length,
                    max: maxOccurrences,
                  }),
                })
              }
            }
          } else if (scope === 'MONTH') {
            if (relevantShifts.length > maxOccurrences) {
              const triggerShift = relevantShifts[maxOccurrences] || relevantShifts[relevantShifts.length - 1]
              violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                personId,
                personName,
                date: triggerShift.date,
                shiftId: triggerShift.shiftDefinition.id,
                message: i18n.t('calendar:validation.messages.maxShiftsMonth', {
                  ruleName: rule.name,
                  personName,
                  count: relevantShifts.length,
                  max: maxOccurrences,
                }),
              })
            }
          }
        }
        break
      }

      case 'MAX_HOURS_PER_PERIOD': {
        const maxHours = rule.parameters.maxHours ?? 24
        const scope = rule.parameters.scope ?? 'DAY'

        for (const [personId, personShifts] of shiftsByPerson.entries()) {
          const personName = getPersonName(personId)
          const relevantShifts = personShifts.filter(matchesTargetShifts)

          if (scope === 'DAY') {
            const byDate = new Map<string, NormalizedShiftEntry[]>()
            for (const s of relevantShifts) {
              const list = byDate.get(s.date) || []
              list.push(s)
              byDate.set(s.date, list)
            }

            for (const [date, dayShifts] of byDate.entries()) {
              const totalHours = dayShifts.reduce((acc, s) => acc + s.shiftDefinition.durationHours, 0)
              if (totalHours > maxHours) {
                violations.push({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  severity: rule.severity,
                  personId,
                  personName,
                  date,
                  shiftId: dayShifts[0]?.shiftDefinition.id,
                  message: i18n.t('calendar:validation.messages.maxHoursDay', {
                    ruleName: rule.name,
                    personName,
                    totalHours,
                    date,
                    maxHours,
                  }),
                })
              }
            }
          } else if (scope === 'WEEK') {
            const byWeek = new Map<string, NormalizedShiftEntry[]>()
            for (const s of relevantShifts) {
              const weekStart = format(startOfWeek(parseISO(s.date), { weekStartsOn: 0 }), 'yyyy-MM-dd')
              const list = byWeek.get(weekStart) || []
              list.push(s)
              byWeek.set(weekStart, list)
            }

            for (const [, weekShifts] of byWeek.entries()) {
              const totalHours = weekShifts.reduce((acc, s) => acc + s.shiftDefinition.durationHours, 0)
              if (totalHours > maxHours) {
                const triggerShift = weekShifts[weekShifts.length - 1]
                violations.push({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  severity: rule.severity,
                  personId,
                  personName,
                  date: triggerShift.date,
                  shiftId: triggerShift.shiftDefinition.id,
                  message: i18n.t('calendar:validation.messages.maxHoursWeek', {
                    ruleName: rule.name,
                    personName,
                    totalHours,
                    maxHours,
                  }),
                })
              }
            }
          } else if (scope === 'MONTH') {
            const totalHours = relevantShifts.reduce((acc, s) => acc + s.shiftDefinition.durationHours, 0)
            if (totalHours > maxHours) {
              const triggerShift = relevantShifts[relevantShifts.length - 1] || { date: monthSchedule.month }
              violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                personId,
                personName,
                date: triggerShift.date,
                message: i18n.t('calendar:validation.messages.maxHoursMonth', {
                  ruleName: rule.name,
                  personName,
                  totalHours,
                  maxHours,
                }),
              })
            }
          }
        }
        break
      }

      case 'MIN_REST_HOURS': {
        const minRestHours = rule.parameters.minRestHours ?? 24

        for (const [personId, personShifts] of shiftsByPerson.entries()) {
          const personName = getPersonName(personId)
          const relevantShifts = personShifts.filter(matchesTargetShifts)

          for (let i = 0; i < relevantShifts.length - 1; i++) {
            const currentShift = relevantShifts[i]
            const nextShift = relevantShifts[i + 1]

            // Difference in minutes between end of current and start of next
            const diffMinutes = differenceInMinutes(nextShift.startDateTime, currentShift.endDateTime)
            const restHours = diffMinutes / 60

            if (restHours < minRestHours) {
              const formattedRest = restHours < 0 ? '0' : restHours.toFixed(1).replace('.0', '')
              violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                personId,
                personName,
                date: nextShift.date,
                shiftId: nextShift.shiftDefinition.id,
                message: i18n.t('calendar:validation.messages.minRestHours', {
                  ruleName: rule.name,
                  personName,
                  restHours: formattedRest,
                  prevDate: currentShift.date,
                  nextDate: nextShift.date,
                  minRestHours,
                }),
              })
            }
          }
        }
        break
      }

      case 'CONSECUTIVE_DAYS_LIMIT': {
        const limit = rule.parameters.consecutiveDaysLimit ?? 1

        for (const [personId, personShifts] of shiftsByPerson.entries()) {
          const personName = getPersonName(personId)
          const relevantShifts = personShifts.filter(matchesTargetShifts)

          // Get unique sorted dates worked
          const uniqueDates = Array.from(new Set(relevantShifts.map((s) => s.date))).sort()

          let currentStreak = 0
          let lastDate: Date | null = null

          for (const dateStr of uniqueDates) {
            const currentDate = parseISO(dateStr)

            if (!lastDate) {
              currentStreak = 1
            } else {
              const dayDiff = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
              if (dayDiff === 1) {
                currentStreak++
              } else {
                currentStreak = 1
              }
            }
            lastDate = currentDate

            if (currentStreak > limit) {
              violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                personId,
                personName,
                date: dateStr,
                message: i18n.t('calendar:validation.messages.consecutiveDaysLimit', {
                  ruleName: rule.name,
                  personName,
                  streak: currentStreak,
                  limit,
                }),
              })
            }
          }
        }
        break
      }

      case 'MAX_PEOPLE_PER_SHIFT': {
        const maxPeople = rule.parameters.maxPeople ?? rule.parameters.maxOccurrences ?? 1
        const relevantEntries = shiftEntries.filter(matchesTargetShifts)

        // Map to store violations keyed by `${rule.id}_${personId}_${date}`
        const violationMap = new Map<string, RuleViolation>()
        const violationCountMap = new Map<string, number>()

        // Check concurrency at the start of each relevant shift
        for (const entry of relevantEntries) {
          const t = entry.startDateTime.getTime()
          const concurrent = relevantEntries.filter(
            (other) => other.startDateTime.getTime() <= t && t < other.endDateTime.getTime()
          )

          const distinctPersonIds = Array.from(new Set(concurrent.map((c) => c.personId)))

          if (distinctPersonIds.length > maxPeople) {
            const allSameShift = concurrent.every(
              (c) => c.shiftDefinition.id === concurrent[0].shiftDefinition.id
            )

            for (const item of concurrent) {
              const itemDate = item.date
              const vKey = `${rule.id}_${item.personId}_${itemDate}`
              const previousCount = violationCountMap.get(vKey) ?? 0

              if (distinctPersonIds.length > previousCount) {
                let message: string
                if (allSameShift) {
                  const shiftDef = item.shiftDefinition
                  const names = distinctPersonIds.map(getPersonName).join(', ')
                  message = i18n.t('calendar:validation.messages.maxPeopleSameShift', {
                    ruleName: rule.name,
                    shiftName: shiftDef.name,
                    shiftCode: shiftDef.code,
                    count: distinctPersonIds.length,
                    date: itemDate,
                    maxPeople,
                    names,
                  })
                } else {
                  const details = distinctPersonIds
                    .map((pId) => {
                      const pName = getPersonName(pId)
                      const shifts = concurrent
                        .filter((c) => c.personId === pId)
                        .map((c) => `${c.shiftDefinition.name} [${c.shiftDefinition.code}]`)
                        .join(', ')
                      return `${pName} (${shifts})`
                    })
                    .join(', ')
                  message = i18n.t('calendar:validation.messages.maxPeopleOverlappingShifts', {
                    ruleName: rule.name,
                    count: distinctPersonIds.length,
                    date: itemDate,
                    maxPeople,
                    details,
                  })
                }

                violationCountMap.set(vKey, distinctPersonIds.length)
                violationMap.set(vKey, {
                  ruleId: rule.id,
                  ruleName: rule.name,
                  severity: rule.severity,
                  personId: item.personId,
                  personName: getPersonName(item.personId),
                  date: itemDate,
                  shiftId: item.shiftDefinition.id,
                  message,
                })
              }
            }
          }
        }

        violations.push(...violationMap.values())
        break
      }

      case 'DAILY_SHIFT_HOURS': {
        const targetHours = rule.parameters.targetDailyHours ?? 24
        const comparison = rule.parameters.dailyHoursComparison ?? 'EXACT'
        const filterType = rule.parameters.dayFilterType ?? 'ALL'
        const specificDays = rule.parameters.specificDaysOfWeek ?? []

        // Group shift allocations by date
        const entriesByDate = new Map<string, NormalizedShiftEntry[]>()
        for (const entry of shiftEntries) {
          if (!matchesTargetShifts(entry)) continue
          const list = entriesByDate.get(entry.date) || []
          list.push(entry)
          entriesByDate.set(entry.date, list)
        }

        const weekdayKeys = [
          'calendar:weekdays.sunday',
          'calendar:weekdays.monday',
          'calendar:weekdays.tuesday',
          'calendar:weekdays.wednesday',
          'calendar:weekdays.thursday',
          'calendar:weekdays.friday',
          'calendar:weekdays.saturday',
        ] as const

        for (const [dateStr, dayEntries] of entriesByDate.entries()) {
          if (dayEntries.length === 0) continue

          const d = parseISO(dateStr)
          const dayOfWeek = d.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday

          // Check if date matches day filter
          let matchesFilter = true
          if (filterType === 'WEEKDAYS') {
            matchesFilter = dayOfWeek >= 1 && dayOfWeek <= 5
          } else if (filterType === 'WEEKENDS') {
            matchesFilter = dayOfWeek === 0 || dayOfWeek === 6
          } else if (filterType === 'SPECIFIC_DAYS') {
            matchesFilter = specificDays.includes(dayOfWeek)
          }

          if (!matchesFilter) continue

          // Compute unique shifts assigned on this day and sum their duration
          const uniqueShifts = new Map<string, ShiftDefinition>()
          for (const item of dayEntries) {
            uniqueShifts.set(item.shiftDefinition.id, item.shiftDefinition)
          }
          const totalHours = Array.from(uniqueShifts.values()).reduce(
            (acc, s) => acc + (s.durationHours || 12),
            0
          )

          let isViolated = false
          if (comparison === 'EXACT') {
            isViolated = totalHours !== targetHours
          } else if (comparison === 'MAX') {
            isViolated = totalHours > targetHours
          } else if (comparison === 'MIN') {
            isViolated = totalHours < targetHours
          }

          if (isViolated) {
            const dayName = i18n.t(weekdayKeys[dayOfWeek]).toLowerCase()
            const shiftList = Array.from(uniqueShifts.values())
              .map((s) => `${s.name} [${s.code}] (${s.durationHours}h)`)
              .join(', ')

            let reason: string
            if (comparison === 'EXACT') {
              reason = i18n.t('calendar:validation.messages.dailyShiftHoursReasonExact', {
                totalHours,
                targetHours,
              })
            } else if (comparison === 'MAX') {
              reason = i18n.t('calendar:validation.messages.dailyShiftHoursReasonMax', {
                totalHours,
                targetHours,
              })
            } else {
              reason = i18n.t('calendar:validation.messages.dailyShiftHoursReasonMin', {
                totalHours,
                targetHours,
              })
            }

            for (const item of dayEntries) {
              violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                personId: item.personId,
                personName: getPersonName(item.personId),
                date: dateStr,
                shiftId: item.shiftDefinition.id,
                message: i18n.t('calendar:validation.messages.dailyShiftHours', {
                  ruleName: rule.name,
                  date: dateStr,
                  dayName,
                  reason,
                  shiftList,
                }),
              })
            }
          }
        }
        break
      }
    }
  }

  return violations
}

