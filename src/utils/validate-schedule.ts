import { parseISO, format } from 'date-fns';

import {
  getMonthDaysArray,
  getConsecutiveDates,
  getWeekStartKey,
  getWeekEndKey,
  formatDisplayDate,
} from './date-utils';

import type { Person, MonthlyAvailability, ValidationError } from '../types';

export interface ValidationParams {
  currentMonth: string; // 'YYYY-MM'
  allAssignments: Record<string, string[]>; // 'YYYY-MM-DD' -> array of personId(s)
  persons: Person[];
  availabilities: MonthlyAvailability[]; // all recorded availabilities
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
}: ValidationParams): ValidationError[] {
  const errors: ValidationError[] = [];
  const personMap = new Map<string, Person>(persons.map((p) => [p.id, p]));

  // Helper to get person name
  const getPersonName = (id: string) => personMap.get(id)?.name || 'Pessoa desconhecida';

  // Days in current month
  const currentMonthDays = getMonthDaysArray(currentMonth);

  // Set of week start keys (Sundays) evaluated to avoid duplicate weekly errors
  const evaluatedWeeksPerPerson = new Set<string>(); // "personId_sundayDateStr"
  // Set of consecutive day pairs evaluated to avoid duplicate A->B and B->A reporting
  const evaluatedConsecutivePairs = new Set<string>(); // "personId_date1_date2"

  // 1. Audit each day of the current month
  for (const dayNum of currentMonthDays) {
    const dayStr = dayNum.toString().padStart(2, '0');
    const dateStr = `${currentMonth}-${dayStr}`;
    const assignedIds = allAssignments[dateStr] || [];

    // Check: Empty day
    if (assignedIds.length === 0) {
      errors.push({
        id: `empty_${dateStr}`,
        rule: 'empty_day',
        severity: 'warning',
        date: dateStr,
        message: `Dia sem responsável: o dia ${formatDisplayDate(dateStr)} está sem nenhuma pessoa escalada.`,
      });
      continue;
    }

    // Check: Multiple people assigned (unresolved conflict)
    if (assignedIds.length > 1) {
      const names = assignedIds.map(getPersonName).join(', ');
      errors.push({
        id: `multi_${dateStr}`,
        rule: 'multi_assigned',
        severity: 'error',
        date: dateStr,
        message: `Conflito de alocação: o dia ${formatDisplayDate(dateStr)} possui ${assignedIds.length} pessoas atribuídas (${names}). Apenas uma pessoa deve ser designada.`,
      });
    }

    // Check availability for each assigned person
    for (const personId of assignedIds) {
      const pName = getPersonName(personId);
      const userMonthAvail = availabilities.find(
        (a) => a.personId === personId && a.month === currentMonth
      );
      const isAvailable = userMonthAvail ? userMonthAvail.availableDays.includes(dayNum) : false;

      if (!isAvailable) {
        errors.push({
          id: `unavail_${dateStr}_${personId}`,
          rule: 'not_available',
          severity: 'error',
          date: dateStr,
          personId,
          personName: pName,
          message: `Indisponibilidade: ${pName} foi escalado(a) no dia ${formatDisplayDate(dateStr)}, mas não informou disponibilidade para esta data.`,
        });
      }
    }
  }

  // 2. Audit Consecutive Days (Rest rule) & Weekly Limits across the timeline
  // We collect all dates where people are assigned in currentMonth, and check continuous timeline
  for (const dayNum of currentMonthDays) {
    const dayStr = dayNum.toString().padStart(2, '0');
    const dateStr = `${currentMonth}-${dayStr}`;
    const assignedIds = allAssignments[dateStr] || [];

    for (const personId of assignedIds) {
      const pName = getPersonName(personId);

      // Check consecutive days: D and D+1
      const { nextDateStr } = getConsecutiveDates(dateStr);
      const nextDayAssignedIds = allAssignments[nextDateStr] || [];

      if (nextDayAssignedIds.includes(personId)) {
        const pairKey = `${personId}_${dateStr}_${nextDateStr}`;
        if (!evaluatedConsecutivePairs.has(pairKey)) {
          evaluatedConsecutivePairs.add(pairKey);
          errors.push({
            id: `consecutive_${personId}_${dateStr}`,
            rule: 'consecutive_days',
            severity: 'error',
            date: dateStr,
            personId,
            personName: pName,
            message: `Descanso violado: ${pName} foi escalado(a) em dias seguidos (${formatDisplayDate(dateStr)} e ${formatDisplayDate(nextDateStr)}). É obrigatório pelo menos 1 dia de descanso.`,
          });
        }
      }

      // Check weekly limit (Sunday to Saturday block)
      const weekStart = getWeekStartKey(dateStr);
      const weekKey = `${personId}_${weekStart}`;

      if (!evaluatedWeeksPerPerson.has(weekKey)) {
        evaluatedWeeksPerPerson.add(weekKey);

        // Scan all 7 days of this week (Sunday to Saturday)
        const weekSunday = parseISO(weekStart);
        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(weekSunday);
          d.setDate(d.getDate() + i);
          weekDates.push(format(d, 'yyyy-MM-dd'));
        }

        // Count how many days this person is assigned in this Sunday-Saturday block across all stored assignments
        const workedDatesInWeek = weekDates.filter((d) =>
          (allAssignments[d] || []).includes(personId)
        );

        if (workedDatesInWeek.length > 2) {
          const weekEnd = getWeekEndKey(dateStr);
          const formattedDatesList = workedDatesInWeek.map(formatDisplayDate).join(', ');
          errors.push({
            id: `weekly_${personId}_${weekStart}`,
            rule: 'weekly_limit',
            severity: 'error',
            date: dateStr,
            personId,
            personName: pName,
            message: `Limite semanal excedido: ${pName} foi escalado(a) ${workedDatesInWeek.length} vezes na semana de ${formatDisplayDate(weekStart)} a ${formatDisplayDate(weekEnd)} (${formattedDatesList}). O limite máximo é de 2 escalas por semana.`,
          });
        }
      }
    }
  }

  // Sort errors by date, then severity (errors first, then warnings)
  return errors.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    return a.id.localeCompare(b.id);
  });
}
