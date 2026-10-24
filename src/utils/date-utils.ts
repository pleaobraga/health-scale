import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addDays,
  subDays,
  getDate,
  getDaysInMonth,
} from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'

export interface CalendarDayInfo {
  date: Date
  dateStr: string // 'YYYY-MM-DD'
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
}

/**
 * Returns current month in 'YYYY-MM' format based on current date
 */
export function getCurrentMonth(date: Date = new Date()): string {
  return format(date, 'yyyy-MM')
}

/**
 * Returns month formatted in Portuguese or English (e.g., "Outubro de 2026" or "October 2026").
 * `compact` drops the Portuguese "de" for titles (e.g., "Outubro 2026").
 */
export function formatMonthYear(
  yearMonth?: string,
  lang = 'pt-BR',
  { compact = false }: { compact?: boolean } = {},
): string {
  const ym = yearMonth && yearMonth.trim() ? yearMonth : getCurrentMonth()
  const date = parseISO(`${ym}-01`)
  const isEn = typeof lang === 'string' && (lang === 'en-US' || lang.startsWith('en'))
  const pattern = isEn || compact ? 'MMMM yyyy' : "MMMM 'de' yyyy"
  const locale = isEn ? enUS : ptBR
  const formatted = format(date, pattern, { locale })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Returns previous 'YYYY-MM'
 */
export function getPreviousMonth(yearMonth: string): string {
  const date = parseISO(`${yearMonth}-01`)
  return format(subMonths(date, 1), 'yyyy-MM')
}

/**
 * Returns next 'YYYY-MM'
 */
export function getNextMonth(yearMonth: string): string {
  const date = parseISO(`${yearMonth}-01`)
  return format(addMonths(date, 1), 'yyyy-MM')
}

/**
 * Returns total days in a month (e.g. 28, 29, 30, 31)
 */
export function getDaysCountInMonth(yearMonth: string): number {
  const date = parseISO(`${yearMonth}-01`)
  return getDaysInMonth(date)
}

/**
 * Generates array of day numbers [1, 2, ..., N]
 */
export function getMonthDaysArray(yearMonth: string): number[] {
  const count = getDaysCountInMonth(yearMonth)
  return Array.from({ length: count }, (_, i) => i + 1)
}

/**
 * Generates a full calendar grid starting on Sunday and ending on Saturday
 */
export function getMonthCalendarGrid(yearMonth?: string): CalendarDayInfo[] {
  const ym = yearMonth && yearMonth.trim() ? yearMonth : getCurrentMonth()
  const baseDate = parseISO(`${ym}-01`)
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)

  // Sunday = 0
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  // Saturday = 6
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return days.map((day) => ({
    date: day,
    dateStr: format(day, 'yyyy-MM-dd'),
    dayNumber: getDate(day),
    isCurrentMonth: isSameMonth(day, baseDate),
    isToday: isToday(day),
    dayOfWeek: day.getDay(),
  }))
}

/**
 * Returns the Sunday ('YYYY-MM-DD') of the week containing the given date.
 * Weeks are strictly Sunday to Saturday.
 */
export function getWeekStartKey(dateStr: string): string {
  const date = parseISO(dateStr)
  const sunday = startOfWeek(date, { weekStartsOn: 0 })
  return format(sunday, 'yyyy-MM-dd')
}

/**
 * Returns the Saturday ('YYYY-MM-DD') of the week containing the given date.
 */
export function getWeekEndKey(dateStr: string): string {
  const date = parseISO(dateStr)
  const saturday = endOfWeek(date, { weekStartsOn: 0 })
  return format(saturday, 'yyyy-MM-dd')
}

/**
 * Formats a date string 'YYYY-MM-DD' to localized display ('dd/MM/yyyy' or 'MM/dd/yyyy')
 */
export function formatDisplayDate(dateStr: string, lang = 'pt-BR'): string {
  const date = parseISO(dateStr)
  const isEn = typeof lang === 'string' && (lang === 'en-US' || lang.startsWith('en'))
  return format(date, isEn ? 'MM/dd/yyyy' : 'dd/MM/yyyy')
}

/**
 * Returns yesterday and tomorrow in 'YYYY-MM-DD' format
 */
export function getConsecutiveDates(dateStr: string): { prevDateStr: string; nextDateStr: string } {
  const date = parseISO(dateStr)
  return {
    prevDateStr: format(subDays(date, 1), 'yyyy-MM-dd'),
    nextDateStr: format(addDays(date, 1), 'yyyy-MM-dd'),
  }
}

/**
 * Formats a date string 'YYYY-MM-DD' returning localized date and capitalized weekday
 */
export function formatDateWithWeekday(dateStr: string, lang = 'pt-BR'): { formattedDate: string; weekday: string } {
  const date = parseISO(dateStr)
  const isEn = typeof lang === 'string' && (lang === 'en-US' || lang.startsWith('en'))
  const formattedDate = format(date, isEn ? 'MM/dd/yyyy' : 'dd/MM/yyyy')
  const rawWeekday = format(date, 'EEEE', { locale: isEn ? enUS : ptBR })
  const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1)
  return { formattedDate, weekday }
}

/**
 * Checks whether an event at a given date (and optional time) has already occurred in the past.
 * Returns true if date/time is in the past, false if it is in the future.
 */
export function isEventInPast(dateStr: string, timeStr?: string, referenceNow = new Date()): boolean {
  const todayStr = format(referenceNow, 'yyyy-MM-dd')

  if (dateStr < todayStr) return true
  if (dateStr > todayStr) return false

  if (timeStr) {
    const currentTimeStr = format(referenceNow, 'HH:mm')
    return timeStr < currentTimeStr
  }

  return false
}


