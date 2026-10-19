export interface Person {
  id: string;
  name: string;
  color: string; // Tailwind hex code
  active?: boolean; // Defaults to true
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
  id: string
  date: string // 'YYYY-MM-DD'
  title: string
  time?: string // 'HH:mm'
  description?: string
  personId?: string // Cuidadora / Profissional associada ao evento
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
export type NavigationTab = 'calendar' | 'people' | 'import' | 'settings' | 'users';

export interface AppDataSnapshot {
  exportedAt: string; // ISO timestamp of export time
  people: Array<Person | (Person & { [key: string]: unknown })>;
  monthParticipants: Record<string, string[]>; // 'YYYY-MM' -> array of personId
  availabilities: Record<string, unknown> | MonthlyAvailability[]; // Monthly availability mapping for each person
  assignments: Record<string, unknown>; // Schedule assignments and daily allocations
  events: Array<CalendarEvent | (CalendarEvent & { [key: string]: unknown })>;
  [key: string]: unknown; // Extensible for global settings, themes, or future properties
}

export interface GuestProfile {
  id: string;
  name: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface GuestDataset {
  persons: Person[];
  availabilities: MonthlyAvailability[];
  assignments: Record<string, string[]>;
  events: CalendarEvent[];
  monthParticipants: Record<string, string[]>;
}

