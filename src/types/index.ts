export interface Person {
  id: string;
  name: string;
  color: string; // Tailwind 500/600 hex code
}

export interface MonthlyAvailability {
  personId: string;
  month: string; // 'YYYY-MM'
  availableDays: number[]; // 1 to 31
}

export interface DayAssignment {
  date: string; // 'YYYY-MM-DD'
  personId?: string; // Definitive assigned person
  personIds?: string[]; // In draft/edit mode, can have multiple or empty
}

export interface CalendarEvent {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  time?: string; // 'HH:mm'
  description?: string;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  id: string;
  rule: 'consecutive_days' | 'weekly_limit' | 'multi_assigned' | 'empty_day' | 'not_available';
  severity: ValidationSeverity;
  date: string; // 'YYYY-MM-DD'
  personId?: string;
  personName?: string;
  message: string;
}

export type MonthParticipants = Record<string, string[]>; // 'YYYY-MM' -> personId[]
export type NavigationTab = 'calendar' | 'people';

