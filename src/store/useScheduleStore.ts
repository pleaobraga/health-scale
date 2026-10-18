import { create } from 'zustand';
import { Person, MonthlyAvailability, CalendarEvent, ValidationError, NavigationTab } from '../types';
import { StorageService } from '../services/storageService';
import { validateSchedule } from '../utils/validateSchedule';
import { getPreviousMonth, getNextMonth, getMonthDaysArray } from '../utils/dateUtils';

interface ScheduleStore {
  // Navigation & UI state
  currentView: NavigationTab; // 'calendar' | 'people'
  setCurrentView: (view: NavigationTab) => void;
  currentMonth: string; // 'YYYY-MM'
  isEditMode: boolean;
  highlightedPersonId: string | null;
  selectedDateForEvents: string | null;
  isFullScreenModalOpen: boolean;

  // Data entities
  persons: Person[];
  monthParticipants: Record<string, string[]>;
  availabilities: MonthlyAvailability[];
  assignments: Record<string, string[]>;
  savedAssignments: Record<string, string[]>;
  events: CalendarEvent[];

  // Validation & Save state
  validationErrors: ValidationError[];
  hasValidated: boolean;
  isSaving: boolean;
  saveFeedback: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  discardChanges: () => void;
  setCurrentMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  toggleEditMode: () => void;
  setEditMode: (val: boolean) => void;
  setHighlightedPersonId: (id: string | null) => void;
  setSelectedDateForEvents: (dateStr: string | null) => void;
  setFullScreenModalOpen: (open: boolean) => void;
  isUnsavedModalOpen: boolean;
  setUnsavedModalOpen: (open: boolean) => void;

  // Month Participants Management
  addPersonToMonth: (personId: string, month: string) => void;
  addPersonsToMonth: (personIds: string[], month: string) => void;
  removePersonFromMonth: (personId: string, month: string) => void;

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
  clearMonthAssignments: (month: string) => void;
  insertAllPersonDaysToMonth: (personId: string, month: string) => void;
  removePersonFromDay: (dateStr: string, personId: string) => void;
  addPersonToDay: (dateStr: string, personId: string) => void;
  setDayAssignments: (dateStr: string, personIds: string[]) => void;

  // Events management
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (eventId: string, event: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (eventId: string) => void;


  // Audit and Persistence
  validateCurrentSchedule: () => ValidationError[];
  saveSchedule: () => void;
  dismissValidation: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const getInitialDarkMode = (): boolean => {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved) return saved === 'dark';
    return Boolean(
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)')?.matches
    );
  } catch {
    return false;
  }
};

const initialDarkMode = getInitialDarkMode();
if (typeof document !== 'undefined' && initialDarkMode) {
  document.documentElement.classList.add('dark');
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  currentView: 'calendar',
  setCurrentView: (view) => set({ currentView: view }),
  currentMonth: '2026-10',
  isEditMode: false,
  highlightedPersonId: null,
  selectedDateForEvents: null,
  isFullScreenModalOpen: false,
  isUnsavedModalOpen: false,
  isDarkMode: initialDarkMode,

  persons: StorageService.getPersons(),
  monthParticipants: StorageService.getMonthParticipants(),
  availabilities: StorageService.getAvailabilities(),
  assignments: StorageService.getAssignments(),
  savedAssignments: StorageService.getAssignments(),
  events: StorageService.getEvents(),

  validationErrors: [],
  hasValidated: false,
  isSaving: false,
  saveFeedback: null,
  hasUnsavedChanges: false,

  setUnsavedModalOpen: (open) => set({ isUnsavedModalOpen: open }),

  discardChanges: () => {
    const { savedAssignments } = get();
    set({
      assignments: { ...savedAssignments },
      hasUnsavedChanges: false,
      hasValidated: false,
      validationErrors: [],
      isUnsavedModalOpen: false,
    });
  },

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
    const currentMode = get().isEditMode;
    if (!currentMode) {
      // Entering edit mode: snapshot current saved assignments
      set({
        isEditMode: true,
        savedAssignments: { ...get().assignments },
        hasUnsavedChanges: false,
      });
    } else {
      // Trying to switch back to visualization: check for unsaved changes
      if (get().hasUnsavedChanges) {
        set({ isUnsavedModalOpen: true });
      } else {
        set({
          isEditMode: false,
          hasValidated: false,
          validationErrors: [],
        });
      }
    }
  },

  setEditMode: (val) => {
    if (val) {
      set({
        isEditMode: true,
        savedAssignments: { ...get().assignments },
        hasUnsavedChanges: false,
      });
    } else {
      if (get().hasUnsavedChanges) {
        set({ isUnsavedModalOpen: true });
      } else {
        set({
          isEditMode: false,
          hasValidated: false,
          validationErrors: [],
        });
      }
    }
  },

  setHighlightedPersonId: (id) => {
    set((state) => ({
      highlightedPersonId: state.highlightedPersonId === id ? null : id,
    }));
  },

  setSelectedDateForEvents: (dateStr) => {
    set({ selectedDateForEvents: dateStr });
  },

  setFullScreenModalOpen: (open) => {
    set({ isFullScreenModalOpen: open });
  },

  addPersonToMonth: (personId, month) => {
    const current = get().monthParticipants[month] || [];
    if (current.includes(personId)) return;
    const updated = {
      ...get().monthParticipants,
      [month]: [...current, personId],
    };
    StorageService.saveMonthParticipants(updated);
    set({ monthParticipants: updated });
  },

  addPersonsToMonth: (personIds, month) => {
    const current = get().monthParticipants[month] || [];
    const newIds = personIds.filter((id) => !current.includes(id));
    if (newIds.length === 0) return;
    const updated = {
      ...get().monthParticipants,
      [month]: [...current, ...newIds],
    };
    StorageService.saveMonthParticipants(updated);
    set({ monthParticipants: updated });
  },

  removePersonFromMonth: (personId, month) => {
    const current = get().monthParticipants[month] || [];
    const updatedForMonth = current.filter((id) => id !== personId);
    const updatedParticipants = {
      ...get().monthParticipants,
      [month]: updatedForMonth,
    };

    // Also remove from assignments of this month
    const currentAssignments = { ...get().assignments };
    let hasAssignmentChanges = false;
    Object.keys(currentAssignments).forEach((dateStr) => {
      if (dateStr.startsWith(month) && currentAssignments[dateStr].includes(personId)) {
        currentAssignments[dateStr] = currentAssignments[dateStr].filter((id) => id !== personId);
        hasAssignmentChanges = true;
      }
    });

    StorageService.saveMonthParticipants(updatedParticipants);
    if (hasAssignmentChanges) {
      StorageService.saveAssignments(currentAssignments);
    }

    set({
      monthParticipants: updatedParticipants,
      assignments: currentAssignments,
      hasUnsavedChanges: get().isEditMode && hasAssignmentChanges ? true : get().hasUnsavedChanges,
      highlightedPersonId: get().highlightedPersonId === personId ? null : get().highlightedPersonId,
    });
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

    // Also remove from all monthParticipants
    const updatedMonthParticipants = { ...get().monthParticipants };
    Object.keys(updatedMonthParticipants).forEach((m) => {
      updatedMonthParticipants[m] = updatedMonthParticipants[m].filter((pId) => pId !== id);
    });

    // Also remove person from assignments
    const currentAssignments = { ...get().assignments };
    Object.keys(currentAssignments).forEach((dateStr) => {
      currentAssignments[dateStr] = currentAssignments[dateStr].filter((pId) => pId !== id);
    });

    StorageService.savePersons(updatedPersons);
    StorageService.saveAvailabilities(updatedAvails);
    StorageService.saveAssignments(currentAssignments);
    StorageService.saveMonthParticipants(updatedMonthParticipants);

    set({
      persons: updatedPersons,
      availabilities: updatedAvails,
      assignments: currentAssignments,
      savedAssignments: { ...currentAssignments },
      monthParticipants: updatedMonthParticipants,
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
    let hasChanges = false;

    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0');
      const dateStr = `${month}-${dayStr}`;

      // If the day already has assignments, we do not overwrite them completely unless empty
      if (!currentAssignments[dateStr] || currentAssignments[dateStr].length === 0) {
        // Find everyone registered in this month who has marked availability for this day
        const monthParticipantIds = get().monthParticipants[month] || [];
        const candidates = availabilities
          .filter(
            (a) =>
              a.month === month &&
              monthParticipantIds.includes(a.personId) &&
              a.availableDays.includes(dayNum)
          )
          .map((a) => a.personId);

        if (candidates.length > 0) {
          currentAssignments[dateStr] = candidates;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      set({ assignments: currentAssignments, hasUnsavedChanges: true });
    }
  },

  clearMonthAssignments: (month) => {
    const currentAssignments = { ...get().assignments };
    let hasChanges = false;
    Object.keys(currentAssignments).forEach((dateStr) => {
      if (dateStr.startsWith(month)) {
        delete currentAssignments[dateStr];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      set({
        assignments: currentAssignments,
        hasUnsavedChanges: true,
        hasValidated: false,
        validationErrors: [],
      });
    }
  },

  insertAllPersonDaysToMonth: (personId, month) => {
    const avail = get().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    const totalMonthDays = getMonthDaysArray(month);
    const daysToAssign =
      avail && avail.availableDays.length > 0 ? avail.availableDays : totalMonthDays;

    const currentAssignments = { ...get().assignments };
    let hasChanges = false;

    daysToAssign.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0');
      const dateStr = `${month}-${dayStr}`;
      const dayList = currentAssignments[dateStr] || [];
      if (!dayList.includes(personId)) {
        currentAssignments[dateStr] = [...dayList, personId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      set({
        assignments: currentAssignments,
        hasUnsavedChanges: true,
        hasValidated: false,
        validationErrors: [],
      });
    }
  },

  removePersonFromDay: (dateStr, personId) => {
    const current = get().assignments[dateStr] || [];
    const updatedForDay = current.filter((id) => id !== personId);
    const updated = {
      ...get().assignments,
      [dateStr]: updatedForDay,
    };
    set({ assignments: updated, hasUnsavedChanges: true });
  },

  addPersonToDay: (dateStr, personId) => {
    const current = get().assignments[dateStr] || [];
    if (current.includes(personId)) return;
    const updated = {
      ...get().assignments,
      [dateStr]: [...current, personId],
    };
    set({ assignments: updated, hasUnsavedChanges: true });
  },

  setDayAssignments: (dateStr, personIds) => {
    const updated = {
      ...get().assignments,
      [dateStr]: personIds,
    };
    set({ assignments: updated, hasUnsavedChanges: true });
  },

  addEvent: (eventData) => {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: CalendarEvent = { ...eventData, id };
    const updated = [...get().events, newEvent];
    StorageService.saveEvents(updated);
    set({ events: updated });
  },

  updateEvent: (eventId, updatedData) => {
    const updated = get().events.map((e) =>
      e.id === eventId ? { ...e, ...updatedData } : e
    );
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
    StorageService.saveMonthParticipants(get().monthParticipants);

    // Commit draft into savedAssignments
    set({
      savedAssignments: { ...get().assignments },
      hasUnsavedChanges: false,
    });

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

  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode;
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
    set({ isDarkMode: nextDark });
  },
}));

