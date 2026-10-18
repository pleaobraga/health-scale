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
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CalendarDayInfo {
  date: Date;
  dateStr: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 = Domingo, 6 = Sábado
}

/**
 * Returns month formatted in Portuguese (e.g., "Outubro de 2026")
 */
export function formatMonthYear(yearMonth: string): string {
  const date = parseISO(`${yearMonth}-01`);
  const formatted = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Returns previous 'YYYY-MM'
 */
export function getPreviousMonth(yearMonth: string): string {
  const date = parseISO(`${yearMonth}-01`);
  return format(subMonths(date, 1), 'yyyy-MM');
}

/**
 * Returns next 'YYYY-MM'
 */
export function getNextMonth(yearMonth: string): string {
  const date = parseISO(`${yearMonth}-01`);
  return format(addMonths(date, 1), 'yyyy-MM');
}

/**
 * Returns total days in a month (e.g. 28, 29, 30, 31)
 */
export function getDaysCountInMonth(yearMonth: string): number {
  const date = parseISO(`${yearMonth}-01`);
  return getDaysInMonth(date);
}

/**
 * Generates array of day numbers [1, 2, ..., N]
 */
export function getMonthDaysArray(yearMonth: string): number[] {
  const count = getDaysCountInMonth(yearMonth);
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Generates a full calendar grid starting on Sunday and ending on Saturday
 */
export function getMonthCalendarGrid(yearMonth: string): CalendarDayInfo[] {
  const baseDate = parseISO(`${yearMonth}-01`);
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);

  // Sunday = 0
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  // Saturday = 6
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map((day) => ({
    date: day,
    dateStr: format(day, 'yyyy-MM-dd'),
    dayNumber: getDate(day),
    isCurrentMonth: isSameMonth(day, baseDate),
    isToday: isToday(day),
    dayOfWeek: day.getDay(),
  }));
}

/**
 * Returns the Sunday ('YYYY-MM-DD') of the week containing the given date.
 * Weeks are strictly Sunday to Saturday.
 */
export function getWeekStartKey(dateStr: string): string {
  const date = parseISO(dateStr);
  const sunday = startOfWeek(date, { weekStartsOn: 0 });
  return format(sunday, 'yyyy-MM-dd');
}

/**
 * Returns the Saturday ('YYYY-MM-DD') of the week containing the given date.
 */
export function getWeekEndKey(dateStr: string): string {
  const date = parseISO(dateStr);
  const saturday = endOfWeek(date, { weekStartsOn: 0 });
  return format(saturday, 'yyyy-MM-dd');
}

/**
 * Formats a date string 'YYYY-MM-DD' to PT-BR display 'dd/MM/yyyy'
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'dd/MM/yyyy');
}

/**
 * Returns yesterday and tomorrow in 'YYYY-MM-DD' format
 */
export function getConsecutiveDates(dateStr: string): { prevDateStr: string; nextDateStr: string } {
  const date = parseISO(dateStr);
  return {
    prevDateStr: format(subDays(date, 1), 'yyyy-MM-dd'),
    nextDateStr: format(addDays(date, 1), 'yyyy-MM-dd'),
  };
}

/**
 * Formats a date string 'YYYY-MM-DD' returning 'dd/MM/yyyy' and capitalized weekday
 */
export function formatDateWithWeekday(dateStr: string): { formattedDate: string; weekday: string } {
  const date = parseISO(dateStr);
  const formattedDate = format(date, 'dd/MM/yyyy');
  const rawWeekday = format(date, 'EEEE', { locale: ptBR });
  const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);
  return { formattedDate, weekday };
}


