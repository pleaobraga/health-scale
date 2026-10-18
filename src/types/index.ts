export interface Person {
  id: string;
  name: string;
  color: string; // Tailwind hex code
  active?: boolean; // true por padrão
  [key: string]: unknown;
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
export type NavigationTab = 'calendar' | 'people' | 'import' | 'settings';

export interface AppDataSnapshot {
  exportedAt: string; // ISO timestamp do momento da exportação
  people: Array<Person | (Person & { [key: string]: unknown })>;
  monthParticipants: Record<string, string[]>; // 'YYYY-MM' -> array de personId
  availabilities: Record<string, unknown> | MonthlyAvailability[]; // Mapeamento de disponibilidade mensal de cada pessoa
  assignments: Record<string, unknown>; // Mapeamento das escalas e alocações diárias/turnos
  events: Array<CalendarEvent | (CalendarEvent & { [key: string]: unknown })>;
  [key: string]: unknown; // Aberto para configurações globais, temas ou futuros campos
}
