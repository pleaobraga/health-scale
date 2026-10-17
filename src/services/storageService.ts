import { Person, MonthlyAvailability, CalendarEvent } from '../types';

const STORAGE_KEYS = {
  PERSONS: 'scale_manager_persons_v1',
  AVAILABILITIES: 'scale_manager_availabilities_v1',
  ASSIGNMENTS: 'scale_manager_assignments_v1',
  EVENTS: 'scale_manager_events_v1',
  MONTH_PARTICIPANTS: 'scale_manager_month_participants_v1',
};

const INITIAL_MONTH_PARTICIPANTS: Record<string, string[]> = {
  '2026-10': ['p1', 'p2', 'p3', 'p4', 'p5'],
};

// Seed initial realistic data for an immediate great user experience
const INITIAL_PERSONS: Person[] = [
  { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' }, // Blue 500
  { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' }, // Emerald 500
  { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },  // Violet 500
  { id: 'p4', name: 'Dr. Rodrigo Souza', color: '#f97316' },  // Orange 500
  { id: 'p5', name: 'Dra. Juliana Prado', color: '#ec4899' }, // Pink 500
];

// Helper to seed availability for current month (e.g., 2026-10 or dynamic)
function getInitialAvailabilities(): MonthlyAvailability[] {
  // We can seed for 2026-10 and neighboring months
  return [
    {
      personId: 'p1',
      month: '2026-10',
      availableDays: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31], // Odd days
    },
    {
      personId: 'p2',
      month: '2026-10',
      availableDays: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30], // Even days
    },
    {
      personId: 'p3',
      month: '2026-10',
      availableDays: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30],
    },
    {
      personId: 'p4',
      month: '2026-10',
      availableDays: [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31],
    },
    {
      personId: 'p5',
      month: '2026-10',
      availableDays: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29],
    },
  ];
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    date: '2026-10-05',
    title: 'Reunião Geral da Equipe Clínica',
    time: '08:30',
    description: 'Alinhamento de procedimentos e metas do trimestre.',
  },
  {
    id: 'ev-2',
    date: '2026-10-12',
    title: 'Feriado Nacional - Plantão Especial',
    time: '07:00',
    description: 'Protocolo de atendimento reforçado.',
  },
  {
    id: 'ev-3',
    date: '2026-10-18',
    title: 'Auditoria de Qualidade Hospitalar',
    time: '14:00',
    description: 'Inspeção de rotina dos leitos e registros.',
  },
  {
    id: 'ev-4',
    date: '2026-10-28',
    title: 'Treinamento de Suporte Avançado de Vida',
    time: '09:00',
    description: 'Atualização bienal obrigatória.',
  },
];

// Initial assignments compliant with business rules
const INITIAL_ASSIGNMENTS: Record<string, string[]> = {
  '2026-10-01': ['p1'],
  '2026-10-02': ['p2'],
  '2026-10-03': ['p4'],
  '2026-10-04': ['p2'],
  '2026-10-05': ['p3'],
  '2026-10-06': ['p2'],
  '2026-10-07': ['p1'],
  '2026-10-08': ['p4'],
  '2026-10-09': ['p1'],
  '2026-10-10': ['p3'],
  '2026-10-11': ['p4'],
  '2026-10-12': ['p2'],
  '2026-10-13': ['p1'],
  '2026-10-14': ['p3'],
  '2026-10-15': ['p4'],
};

export class StorageService {
  /**
   * Load persons from storage or initial seed
   */
  static getPersons(): Person[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONS);
      if (!data) {
        return INITIAL_PERSONS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load persons from localStorage:', err);
      return INITIAL_PERSONS;
    }
  }

  static savePersons(persons: Person[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
    } catch (err) {
      console.error('Failed to save persons to localStorage:', err);
    }
  }

  /**
   * Load availabilities
   */
  static getAvailabilities(): MonthlyAvailability[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AVAILABILITIES);
      if (!data) {
        return getInitialAvailabilities();
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load availabilities from localStorage:', err);
      return getInitialAvailabilities();
    }
  }

  static saveAvailabilities(availabilities: MonthlyAvailability[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AVAILABILITIES, JSON.stringify(availabilities));
    } catch (err) {
      console.error('Failed to save availabilities to localStorage:', err);
    }
  }

  /**
   * Load assignments ('YYYY-MM-DD' -> string[])
   */
  static getAssignments(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (!data) {
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load assignments from localStorage:', err);
      return INITIAL_ASSIGNMENTS;
    }
  }

  static saveAssignments(assignments: Record<string, string[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch (err) {
      console.error('Failed to save assignments to localStorage:', err);
    }
  }

  /**
   * Load calendar events
   */
  static getEvents(): CalendarEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        return INITIAL_EVENTS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load events from localStorage:', err);
      return INITIAL_EVENTS;
    }
  }

  static saveEvents(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to save events to localStorage:', err);
    }
  }

  /**
   * Load month participants ('YYYY-MM' -> personId[])
   */
  static getMonthParticipants(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONTH_PARTICIPANTS);
      if (!data) {
        return INITIAL_MONTH_PARTICIPANTS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load month participants from localStorage:', err);
      return INITIAL_MONTH_PARTICIPANTS;
    }
  }

  static saveMonthParticipants(data: Record<string, string[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTH_PARTICIPANTS, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save month participants to localStorage:', err);
    }
  }

  /**
   * Reset to initial seed state
   */
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.PERSONS);
    localStorage.removeItem(STORAGE_KEYS.AVAILABILITIES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTH_PARTICIPANTS);
  }
}

