import { parseISO, addHours, differenceInMinutes, startOfWeek, format } from 'date-fns'

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
      const date = parts[0]
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
    const datesWithShifts = new Set(entries.map((e) => e.date))

    for (const [date, personIds] of Object.entries(monthSchedule.assignments)) {
      if (!Array.isArray(personIds) || personIds.length === 0) continue

      // If this date already has structured entries, avoid duplicating identical allocations
      const existingForDate = entries.filter((e) => e.date === date)
      for (const personId of personIds) {
        const alreadyAllocated = existingForDate.some((e) => e.personId === personId)
        if (alreadyAllocated && datesWithShifts.has(date)) continue

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
  const getPersonName = (id: string) => personMap.get(id)?.name || 'Profissional'

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
                  message: `${rule.name}: ${personName} possui ${dayShifts.length} plantões no dia ${date} (máximo permitido: ${maxOccurrences}).`,
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
                  message: `${rule.name}: ${personName} ultrapassou o limite semanal com ${weekShifts.length} plantões na semana (máximo permitido: ${maxOccurrences}).`,
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
                message: `${rule.name}: ${personName} ultrapassou o limite mensal com ${relevantShifts.length} plantões no mês (máximo permitido: ${maxOccurrences}).`,
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
                  message: `${rule.name}: ${personName} totalizou ${totalHours}h no dia ${date} (máximo permitido: ${maxHours}h).`,
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
                  message: `${rule.name}: ${personName} totalizou ${totalHours}h na semana (máximo permitido: ${maxHours}h).`,
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
                message: `${rule.name}: ${personName} totalizou ${totalHours}h no mês (máximo permitido: ${maxHours}h).`,
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
                message: `${rule.name}: ${personName} tem apenas ${formattedRest}h de descanso entre o plantão de ${currentShift.date} e o de ${nextShift.date} (mínimo exigido: ${minRestHours}h).`,
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
                message: `${rule.name}: ${personName} está escalado(a) por ${currentStreak} dias consecutivos (limite: ${limit}).`,
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

