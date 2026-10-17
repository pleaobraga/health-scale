import { create } from 'zustand';
import { Person, MonthlyAvailability, CalendarEvent, ValidationError } from '../types';
import { StorageService } from '../services/storageService';
import { validateSchedule } from '../utils/validateSchedule';
import { getPreviousMonth, getNextMonth, getMonthDaysArray } from '../utils/dateUtils';

interface ScheduleStore {
  // Navigation & UI state
  currentMonth: string; // 'YYYY-MM'
  isEditMode: boolean;
  highlightedPersonId: string | null;
  selectedDateForEvents: string | null;

  // Data entities
  persons: Person[];
  availabilities: MonthlyAvailability[];
  assignments: Record<string, string[]>;
  events: CalendarEvent[];

  // Validation state
  validationErrors: ValidationError[];
  hasValidated: boolean;
  isSaving: boolean;
  saveFeedback: string | null;

  // Actions
  setCurrentMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  toggleEditMode: () => void;
  setEditMode: (val: boolean) => void;
  setHighlightedPersonId: (id: string | null) => void;
  setSelectedDateForEvents: (dateStr: string | null) => void;

  // Person & Availability management
  addPerson: (name: string, color: string, availableDays?: number[]) => void;
  updatePerson: (id: string, name: string, color: string) => void;
  deletePerson: (id: string) => void;
  setPersonAvailability: (personId: string, month: string, availableDays: number[]) => void;
  togglePersonDayAvailability: (personId: string, month: string, day: number) => void;
  setQuickAvailability: (
    personId: string,
    month: string,
    type: 'even' | 'odd' | 'clear' | 'all'
  ) => void;

  // Schedule Assignments
  populateMonthWithAvailableCandidates: (month: string) => void;
  removePersonFromDay: (dateStr: string, personId: string) => void;
  addPersonToDay: (dateStr: string, personId: string) => void;
  setDayAssignments: (dateStr: string, personIds: string[]) => void;

  // Events management
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (eventId: string) => void;

  // Audit and Persistence
  validateCurrentSchedule: () => ValidationError[];
  saveSchedule: () => void;
  dismissValidation: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  currentMonth: '2026-10',
  isEditMode: false,
  highlightedPersonId: null,
  selectedDateForEvents: null,

  persons: StorageService.getPersons(),
  availabilities: StorageService.getAvailabilities(),
  assignments: StorageService.getAssignments(),
  events: StorageService.getEvents(),

  validationErrors: [],
  hasValidated: false,
  isSaving: false,
  saveFeedback: null,

  setCurrentMonth: (month) => {
    set({ currentMonth: month, hasValidated: false, validationErrors: [] });
  },

  goToPreviousMonth: () => {
    const prev = getPreviousMonth(get().currentMonth);
    set({ currentMonth: prev, hasValidated: false, validationErrors: [] });
  },

  goToNextMonth: () => {
    const next = getNextMonth(get().currentMonth);
    set({ currentMonth: next, hasValidated: false, validationErrors: [] });
  },

  toggleEditMode: () => {
    const nextMode = !get().isEditMode;
    // When activating edit mode, if days of the month have no assignments, prefill with candidates
    if (nextMode) {
      get().populateMonthWithAvailableCandidates(get().currentMonth);
    }
    set({ isEditMode: nextMode });
  },

  setEditMode: (val) => {
    if (val) {
      get().populateMonthWithAvailableCandidates(get().currentMonth);
    }
    set({ isEditMode: val });
  },

  setHighlightedPersonId: (id) => {
    set((state) => ({
      highlightedPersonId: state.highlightedPersonId === id ? null : id,
    }));
  },

  setSelectedDateForEvents: (dateStr) => {
    set({ selectedDateForEvents: dateStr });
  },

  addPerson: (name, color, availableDays = []) => {
    const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPerson: Person = { id, name, color };
    const updatedPersons = [...get().persons, newPerson];

    let updatedAvails = [...get().availabilities];
    if (availableDays.length > 0) {
      updatedAvails = [
        ...updatedAvails,
        {
          personId: id,
          month: get().currentMonth,
          availableDays,
        },
      ];
    }

    StorageService.savePersons(updatedPersons);
    StorageService.saveAvailabilities(updatedAvails);

    set({
      persons: updatedPersons,
      availabilities: updatedAvails,
    });
  },

  updatePerson: (id, name, color) => {
    const updated = get().persons.map((p) => (p.id === id ? { ...p, name, color } : p));
    StorageService.savePersons(updated);
    set({ persons: updated });
  },

  deletePerson: (id) => {
    const updatedPersons = get().persons.filter((p) => p.id !== id);
    const updatedAvails = get().availabilities.filter((a) => a.personId !== id);

    // Also remove person from assignments
    const currentAssignments = { ...get().assignments };
    Object.keys(currentAssignments).forEach((dateStr) => {
      currentAssignments[dateStr] = currentAssignments[dateStr].filter((pId) => pId !== id);
    });

    StorageService.savePersons(updatedPersons);
    StorageService.saveAvailabilities(updatedAvails);
    StorageService.saveAssignments(currentAssignments);

    set({
      persons: updatedPersons,
      availabilities: updatedAvails,
      assignments: currentAssignments,
      highlightedPersonId: get().highlightedPersonId === id ? null : get().highlightedPersonId,
    });
  },

  setPersonAvailability: (personId, month, availableDays) => {
    const existingIndex = get().availabilities.findIndex(
      (a) => a.personId === personId && a.month === month
    );
    let updated: MonthlyAvailability[];
    if (existingIndex >= 0) {
      updated = [...get().availabilities];
      updated[existingIndex] = { personId, month, availableDays };
    } else {
      updated = [...get().availabilities, { personId, month, availableDays }];
    }
    StorageService.saveAvailabilities(updated);
    set({ availabilities: updated });
  },

  togglePersonDayAvailability: (personId, month, day) => {
    const existing = get().availabilities.find((a) => a.personId === personId && a.month === month);
    const currentDays = existing ? existing.availableDays : [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);

    get().setPersonAvailability(personId, month, newDays);
  },

  setQuickAvailability: (personId, month, type) => {
    const totalDays = getMonthDaysArray(month);
    let newDays: number[] = [];

    if (type === 'even') {
      newDays = totalDays.filter((d) => d % 2 === 0);
    } else if (type === 'odd') {
      newDays = totalDays.filter((d) => d % 2 !== 0);
    } else if (type === 'all') {
      newDays = [...totalDays];
    } else if (type === 'clear') {
      newDays = [];
    }

    get().setPersonAvailability(personId, month, newDays);
  },

  populateMonthWithAvailableCandidates: (month) => {
    const days = getMonthDaysArray(month);
    const currentAssignments = { ...get().assignments };
    const { availabilities } = get();

    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0');
      const dateStr = `${month}-${dayStr}`;

      // If the day already has assignments, we do not overwrite them completely unless empty
      if (!currentAssignments[dateStr] || currentAssignments[dateStr].length === 0) {
        // Find everyone who has marked availability for this day
        const candidates = availabilities
          .filter((a) => a.month === month && a.availableDays.includes(dayNum))
          .map((a) => a.personId);

        if (candidates.length > 0) {
          currentAssignments[dateStr] = candidates;
        }
      }
    });

    set({ assignments: currentAssignments });
    StorageService.saveAssignments(currentAssignments);
  },

  removePersonFromDay: (dateStr, personId) => {
    const current = get().assignments[dateStr] || [];
    const updatedForDay = current.filter((id) => id !== personId);
    const updated = {
      ...get().assignments,
      [dateStr]: updatedForDay,
    };
    set({ assignments: updated });
    StorageService.saveAssignments(updated);
  },

  addPersonToDay: (dateStr, personId) => {
    const current = get().assignments[dateStr] || [];
    if (current.includes(personId)) return;
    const updated = {
      ...get().assignments,
      [dateStr]: [...current, personId],
    };
    set({ assignments: updated });
    StorageService.saveAssignments(updated);
  },

  setDayAssignments: (dateStr, personIds) => {
    const updated = {
      ...get().assignments,
      [dateStr]: personIds,
    };
    set({ assignments: updated });
    StorageService.saveAssignments(updated);
  },

  addEvent: (eventData) => {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: CalendarEvent = { ...eventData, id };
    const updated = [...get().events, newEvent];
    StorageService.saveEvents(updated);
    set({ events: updated });
  },

  deleteEvent: (eventId) => {
    const updated = get().events.filter((e) => e.id !== eventId);
    StorageService.saveEvents(updated);
    set({ events: updated });
  },

  validateCurrentSchedule: () => {
    const errors = validateSchedule({
      currentMonth: get().currentMonth,
      allAssignments: get().assignments,
      persons: get().persons,
      availabilities: get().availabilities,
    });
    set({ validationErrors: errors, hasValidated: true });
    return errors;
  },

  saveSchedule: () => {
    set({ isSaving: true });
    // Save everything in storage
    StorageService.savePersons(get().persons);
    StorageService.saveAvailabilities(get().availabilities);
    StorageService.saveAssignments(get().assignments);
    StorageService.saveEvents(get().events);

    // Execute audit validation
    const errors = get().validateCurrentSchedule();

    const errorCount = errors.filter((e) => e.severity === 'error').length;
    const warningCount = errors.filter((e) => e.severity === 'warning').length;

    let msg = 'Escala salva com sucesso no armazenamento local!';
    if (errorCount > 0) {
      msg = `Escala salva, porém existem ${errorCount} erro(s) e ${warningCount} aviso(s) que precisam de atenção.`;
    } else if (warningCount > 0) {
      msg = `Escala salva com sucesso! (com ${warningCount} aviso(s) informativo(s)).`;
    }

    set({
      isSaving: false,
      saveFeedback: msg,
    });

    setTimeout(() => {
      set({ saveFeedback: null });
    }, 5000);
  },

  dismissValidation: () => {
    set({ hasValidated: false, validationErrors: [] });
  },
}));

