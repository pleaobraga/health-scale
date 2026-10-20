import { create } from 'zustand'

import { CloudSyncService } from '../services/cloud-sync-service'
import { PersonService } from '../services/person-service'
import { StorageService } from '../services/storage-service'
import { formatAddress } from '../utils/address-utils'
import { getPreviousMonth, getNextMonth, getMonthDaysArray, isEventInPast } from '../utils/date-utils'
import { validateSchedule } from '../utils/validate-schedule'

import type {
  Person,
  MonthlyAvailability,
  CalendarEvent,
  ValidationError,
  NavigationTab,
  Address,
  ShiftDefinition,
  ShiftRule,
} from '../types'

export type SaveFeedbackData =
  | { type: 'cloud' }
  | { type: 'local' }
  | { type: 'errors'; errorsCount: number; warningsCount: number }
  | { type: 'warnings'; warningsCount: number };

export interface CloudPullResult {
  success: boolean;
  code?: 'success' | 'no_data' | 'error';
  message: string;
}

export interface CloudPushResult {
  success: boolean;
  code?: 'success' | 'error';
  message: string;
}

interface ScheduleStore {
  // Navigation & UI state
  currentView: NavigationTab; // 'calendar' | 'people' | 'addresses'
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
  dayShiftAssignments: Record<string, Record<string, string>>;
  savedDayShiftAssignments: Record<string, Record<string, string>>;
  events: CalendarEvent[];
  addresses: Address[];
  shiftDefinitions: ShiftDefinition[];
  shiftRules: ShiftRule[];
  monthActiveShifts: Record<string, string[]>;
  monthActiveRules: Record<string, string[]>;
  monthDailyShifts: Record<string, Record<string, number[]>>;

  // Dynamic Shift & Rule Actions
  getActiveShiftIds: (month?: string) => string[];
  getActiveRuleIds: (month?: string) => string[];
  getDayActiveShifts: (dateStr: string) => ShiftDefinition[];
  setMonthDailyShifts: (month: string, dailyShifts: Record<string, number[]>) => void;
  toggleMonthShift: (shiftId: string, month: string) => void;
  toggleMonthRule: (ruleId: string, month: string) => void;
  addShiftsToMonth: (shiftIds: string[], month: string) => void;
  removeShiftFromMonth: (shiftId: string, month: string) => void;
  addRulesToMonth: (ruleIds: string[], month: string) => void;
  removeRuleFromMonth: (ruleId: string, month: string) => void;
  resetMonthDefaults: (month: string) => void;
  addShiftDefinition: (shift: Omit<ShiftDefinition, 'id' | 'createdAt' | 'updatedAt'>) => ShiftDefinition;
  updateShiftDefinition: (id: string, shift: Partial<ShiftDefinition>) => void;
  deleteShiftDefinition: (id: string) => void;
  duplicateShiftDefinition: (id: string) => void;
  addShiftRule: (rule: Omit<ShiftRule, 'id' | 'createdAt' | 'updatedAt'>) => ShiftRule;
  updateShiftRule: (id: string, rule: Partial<ShiftRule>) => void;
  deleteShiftRule: (id: string) => void;
  duplicateShiftRule: (id: string) => void;

  // Day Shift Allocation Actions
  assignPersonToShift: (dateStr: string, shiftId: string, personId: string) => void;
  removePersonFromShift: (dateStr: string, shiftId: string) => void;

  // Validation & Save state
  validationErrors: ValidationError[];
  hasValidated: boolean;
  isSaving: boolean;
  saveFeedback: SaveFeedbackData | string | null;
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
  deletePerson: (id: string, force?: boolean) => boolean;
  canDeletePerson: (id: string) => boolean;
  deactivatePerson: (id: string) => void;
  reactivatePerson: (id: string) => void;
  setPersonAvailability: (
    personId: string,
    month: string,
    availableDays: number[],
    shiftAvailability?: Record<string, number[]>,
    shiftRates?: Record<string, Record<number, number>>
  ) => void;
  isPersonAvailable: (
    personId: string,
    month: string,
    day: number,
    shiftId?: string
  ) => boolean;
  togglePersonDayAvailability: (personId: string, month: string, day: number) => void;
  setQuickAvailability: (
    personId: string,
    month: string,
    type: 'even' | 'odd' | 'clear' | 'all'
  ) => void;

  // Schedule Assignments
  populateMonthWithAvailableCandidates: (month: string) => void;
  clearMonthAssignments: (month: string) => void;
  insertAllPersonDaysToMonth: (personId: string, month: string, shiftId?: string) => void;
  removePersonFromDay: (dateStr: string, personId: string) => void;
  addPersonToDay: (dateStr: string, personId: string, shiftId?: string) => void;
  setDayAssignments: (dateStr: string, personIds: string[]) => void;

  // Events management
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (eventId: string, event: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (eventId: string) => void;

  // Address management
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, address: Partial<Omit<Address, 'id'>>) => void;
  deleteAddress: (id: string) => void;


  // Audit and Persistence
  validateCurrentSchedule: () => ValidationError[];
  saveSchedule: () => Promise<void>;
  pullCloudData: (month?: string, isAdmin?: boolean) => Promise<CloudPullResult>;
  forcePushCloudData: (isAdmin?: boolean) => Promise<CloudPushResult>;
  dismissValidation: () => void;
  reloadFromStorage: () => void;
  clearAllLocalData: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const getInitialDarkMode = (): boolean => {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
    if (saved) return saved === 'dark'
    return Boolean(
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)')?.matches
    )
  } catch {
    return false
  }
}

const initialDarkMode = getInitialDarkMode()
if (typeof document !== 'undefined' && initialDarkMode) {
  document.documentElement.classList.add('dark')
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
  dayShiftAssignments: StorageService.getDayShiftAssignments(),
  savedDayShiftAssignments: StorageService.getDayShiftAssignments(),
  events: StorageService.getEvents(),
  addresses: StorageService.getAddresses(),
  shiftDefinitions: StorageService.getShiftDefinitions(),
  shiftRules: StorageService.getShiftRules(),
  monthActiveShifts: StorageService.getMonthActiveShiftsMap(),
  monthActiveRules: StorageService.getMonthActiveRulesMap(),
  monthDailyShifts: StorageService.getMonthDailyShiftsMap(),

  validationErrors: [],
  hasValidated: false,
  isSaving: false,
  saveFeedback: null,
  hasUnsavedChanges: false,

  setUnsavedModalOpen: (open) => set({ isUnsavedModalOpen: open }),

  discardChanges: () => {
    const { savedAssignments, savedDayShiftAssignments } = get()
    set({
      assignments: { ...savedAssignments },
      dayShiftAssignments: { ...savedDayShiftAssignments },
      hasUnsavedChanges: false,
      hasValidated: false,
      validationErrors: [],
      isUnsavedModalOpen: false,
    })
  },

  setCurrentMonth: (month) => {
    set({ currentMonth: month, hasValidated: false, validationErrors: [] })
  },

  goToPreviousMonth: () => {
    const prev = getPreviousMonth(get().currentMonth)
    set({ currentMonth: prev, hasValidated: false, validationErrors: [] })
  },

  goToNextMonth: () => {
    const next = getNextMonth(get().currentMonth)
    set({ currentMonth: next, hasValidated: false, validationErrors: [] })
  },

  toggleEditMode: () => {
    const currentMode = get().isEditMode
    if (!currentMode) {
      // Entering edit mode: snapshot current saved assignments
      set({
        isEditMode: true,
        savedAssignments: { ...get().assignments },
        hasUnsavedChanges: false,
      })
    } else {
      // Trying to switch back to visualization: check for unsaved changes
      if (get().hasUnsavedChanges) {
        set({ isUnsavedModalOpen: true })
      } else {
        set({
          isEditMode: false,
          hasValidated: false,
          validationErrors: [],
        })
      }
    }
  },

  setEditMode: (val) => {
    if (val) {
      set({
        isEditMode: true,
        savedAssignments: { ...get().assignments },
        hasUnsavedChanges: false,
      })
    } else {
      if (get().hasUnsavedChanges) {
        set({ isUnsavedModalOpen: true })
      } else {
        set({
          isEditMode: false,
          hasValidated: false,
          validationErrors: [],
        })
      }
    }
  },

  setHighlightedPersonId: (id) => {
    set((state) => ({
      highlightedPersonId: state.highlightedPersonId === id ? null : id,
    }))
  },

  setSelectedDateForEvents: (dateStr) => {
    set({ selectedDateForEvents: dateStr })
  },

  setFullScreenModalOpen: (open) => {
    set({ isFullScreenModalOpen: open })
  },

  addPersonToMonth: (personId, month) => {
    const current = get().monthParticipants[month] || []
    if (current.includes(personId)) return
    const updated = {
      ...get().monthParticipants,
      [month]: [...current, personId],
    }
    StorageService.saveMonthParticipants(updated)
    set({ monthParticipants: updated })
  },

  addPersonsToMonth: (personIds, month) => {
    const current = get().monthParticipants[month] || []
    const newIds = personIds.filter((id) => !current.includes(id))
    if (newIds.length === 0) return
    const updated = {
      ...get().monthParticipants,
      [month]: [...current, ...newIds],
    }
    StorageService.saveMonthParticipants(updated)
    set({ monthParticipants: updated })
  },

  removePersonFromMonth: (personId, month) => {
    const current = get().monthParticipants[month] || []
    const updatedForMonth = current.filter((id) => id !== personId)
    const updatedParticipants = {
      ...get().monthParticipants,
      [month]: updatedForMonth,
    }

    // Also remove from assignments of this month
    const currentAssignments = { ...get().assignments }
    let hasAssignmentChanges = false
    Object.keys(currentAssignments).forEach((dateStr) => {
      if (dateStr.startsWith(month) && currentAssignments[dateStr].includes(personId)) {
        currentAssignments[dateStr] = currentAssignments[dateStr].filter((id) => id !== personId)
        hasAssignmentChanges = true
      }
    })

    StorageService.saveMonthParticipants(updatedParticipants)
    if (hasAssignmentChanges) {
      StorageService.saveAssignments(currentAssignments)
    }

    set({
      monthParticipants: updatedParticipants,
      assignments: currentAssignments,
      hasUnsavedChanges: get().isEditMode && hasAssignmentChanges ? true : get().hasUnsavedChanges,
      highlightedPersonId: get().highlightedPersonId === personId ? null : get().highlightedPersonId,
    })
  },

  addPerson: (name, color, availableDays = []) => {
    const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newPerson: Person = { id, name, color, active: true }
    const updatedPersons = [...get().persons, newPerson]

    let updatedAvails = [...get().availabilities]
    if (availableDays.length > 0) {
      updatedAvails = [
        ...updatedAvails,
        {
          personId: id,
          month: get().currentMonth,
          availableDays,
        },
      ]
    }

    StorageService.savePersons(updatedPersons)
    StorageService.saveAvailabilities(updatedAvails)

    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.savePeopleToCloud(updatedPersons)
    }

    set({
      persons: updatedPersons,
      availabilities: updatedAvails,
    })
  },

  updatePerson: (id, name, color) => {
    const updated = get().persons.map((p) => (p.id === id ? { ...p, name, color } : p))
    StorageService.savePersons(updated)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.savePeopleToCloud(updated)
    }
    set({ persons: updated })
  },

  canDeletePerson: (id) => {
    return PersonService.canDeletePerson(id, get().assignments)
  },

  deactivatePerson: (id) => {
    const updatedPersons = get().persons.map((p) =>
      p.id === id ? { ...p, active: false } : p
    )
    StorageService.savePersons(updatedPersons)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.savePeopleToCloud(updatedPersons)
    }
    set({
      persons: updatedPersons,
      highlightedPersonId: get().highlightedPersonId === id ? null : get().highlightedPersonId,
    })
  },

  reactivatePerson: (id) => {
    const updatedPersons = get().persons.map((p) =>
      p.id === id ? { ...p, active: true } : p
    )
    StorageService.savePersons(updatedPersons)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.savePeopleToCloud(updatedPersons)
    }
    set({ persons: updatedPersons })
  },

  deletePerson: (id, force = false) => {
    if (!force && !get().canDeletePerson(id)) {
      console.warn(`Não é possível excluir o profissional ${id} permanentemente: possui histórico em escalas.`)
      return false
    }

    const updatedPersons = get().persons.filter((p) => p.id !== id)
    const updatedAvails = get().availabilities.filter((a) => a.personId !== id)

    // Also remove from all monthParticipants
    const updatedMonthParticipants = { ...get().monthParticipants }
    Object.keys(updatedMonthParticipants).forEach((m) => {
      updatedMonthParticipants[m] = updatedMonthParticipants[m].filter((pId) => pId !== id)
    })

    // Also remove person from assignments
    const currentAssignments = { ...get().assignments }
    Object.keys(currentAssignments).forEach((dateStr) => {
      currentAssignments[dateStr] = currentAssignments[dateStr].filter((pId) => pId !== id)
    })

    StorageService.savePersons(updatedPersons)
    StorageService.saveAvailabilities(updatedAvails)
    StorageService.saveAssignments(currentAssignments)
    StorageService.saveMonthParticipants(updatedMonthParticipants)

    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.savePeopleToCloud(updatedPersons)
    }

    set({
      persons: updatedPersons,
      availabilities: updatedAvails,
      assignments: currentAssignments,
      savedAssignments: { ...currentAssignments },
      monthParticipants: updatedMonthParticipants,
      highlightedPersonId: get().highlightedPersonId === id ? null : get().highlightedPersonId,
    })
    return true
  },

  setPersonAvailability: (personId, month, availableDays, shiftAvailability, shiftRates) => {
    const existingIndex = get().availabilities.findIndex(
      (a) => a.personId === personId && a.month === month
    )
    const existing = existingIndex >= 0 ? get().availabilities[existingIndex] : undefined
    const finalShiftAvailability =
      shiftAvailability !== undefined
        ? shiftAvailability
        : existing?.shiftAvailability
    const finalShiftRates =
      shiftRates !== undefined
        ? shiftRates
        : existing?.shiftRates

    const newRecord: MonthlyAvailability = {
      personId,
      month,
      availableDays,
      ...(finalShiftAvailability ? { shiftAvailability: finalShiftAvailability } : {}),
      ...(finalShiftRates ? { shiftRates: finalShiftRates } : {}),
    }

    let updated: MonthlyAvailability[]
    if (existingIndex >= 0) {
      updated = [...get().availabilities]
      updated[existingIndex] = newRecord
    } else {
      updated = [...get().availabilities, newRecord]
    }
    StorageService.saveAvailabilities(updated)
    set({ availabilities: updated })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  isPersonAvailable: (personId, month, day, shiftId) => {
    const avail = get().availabilities.find(
      (a) => a.personId === personId && a.month === month
    )
    if (!avail) return false
    if (shiftId && avail.shiftAvailability && Object.keys(avail.shiftAvailability).length > 0) {
      const shiftDays = avail.shiftAvailability[shiftId]
      if (shiftDays) {
        return shiftDays.includes(day)
      }
      return false
    }
    return avail.availableDays.includes(day)
  },

  togglePersonDayAvailability: (personId, month, day) => {
    const existing = get().availabilities.find((a) => a.personId === personId && a.month === month)
    const currentDays = existing ? existing.availableDays : []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b)

    get().setPersonAvailability(personId, month, newDays)
  },

  setQuickAvailability: (personId, month, type) => {
    const totalDays = getMonthDaysArray(month)
    let newDays: number[] = []

    if (type === 'even') {
      newDays = totalDays.filter((d) => d % 2 === 0)
    } else if (type === 'odd') {
      newDays = totalDays.filter((d) => d % 2 !== 0)
    } else if (type === 'all') {
      newDays = [...totalDays]
    } else if (type === 'clear') {
      newDays = []
    }

    get().setPersonAvailability(personId, month, newDays)
  },

  populateMonthWithAvailableCandidates: (month) => {
    const days = getMonthDaysArray(month)
    const currentAssignments = { ...get().assignments }
    const { availabilities } = get()
    let hasChanges = false

    days.forEach((dayNum) => {
      const dayStr = dayNum.toString().padStart(2, '0')
      const dateStr = `${month}-${dayStr}`

      // If the day already has assignments, we do not overwrite them completely unless empty
      if (!currentAssignments[dateStr] || currentAssignments[dateStr].length === 0) {
        // Find everyone registered in this month who has marked availability for this day
        const monthParticipantIds = get().monthParticipants[month] || []
        const candidates = availabilities
          .filter(
            (a) =>
              a.month === month &&
              monthParticipantIds.includes(a.personId) &&
              a.availableDays.includes(dayNum)
          )
          .map((a) => a.personId)

        if (candidates.length > 0) {
          currentAssignments[dateStr] = candidates
          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      set({ assignments: currentAssignments, hasUnsavedChanges: true })
    }
  },

  clearMonthAssignments: (month) => {
    const currentAssignments = { ...get().assignments }
    const currentDayShiftAssignments = { ...get().dayShiftAssignments }
    let hasChanges = false

    Object.keys(currentAssignments).forEach((dateStr) => {
      if (dateStr.startsWith(month)) {
        delete currentAssignments[dateStr]
        hasChanges = true
      }
    })

    Object.keys(currentDayShiftAssignments).forEach((dateStr) => {
      if (dateStr.startsWith(month)) {
        delete currentDayShiftAssignments[dateStr]
        hasChanges = true
      }
    })

    if (hasChanges) {
      set({
        assignments: currentAssignments,
        dayShiftAssignments: currentDayShiftAssignments,
        hasUnsavedChanges: true,
        hasValidated: false,
        validationErrors: [],
      })
    }
  },

  insertAllPersonDaysToMonth: (personId, month, shiftId) => {
    const avail = get().availabilities.find(
      (a) => a.personId === personId && a.month === month
    )
    const totalMonthDays = getMonthDaysArray(month)

    const currentAssignments = { ...get().assignments }
    const currentDayShiftAssignments = { ...get().dayShiftAssignments }
    let hasChanges = false

    if (shiftId) {
      // Specific shift selected: assign those specific shift days and link shift
      const shiftDays = avail?.shiftAvailability?.[shiftId]
      const daysToAssign =
        shiftDays && shiftDays.length > 0
          ? shiftDays
          : avail && avail.availableDays.length > 0
          ? avail.availableDays
          : totalMonthDays

      daysToAssign.forEach((dayNum) => {
        const dayStr = dayNum.toString().padStart(2, '0')
        const dateStr = `${month}-${dayStr}`
        const dayList = currentAssignments[dateStr] || []
        if (!dayList.includes(personId)) {
          currentAssignments[dateStr] = [...dayList, personId]
          hasChanges = true
        }
        const dayShifts = { ...(currentDayShiftAssignments[dateStr] || {}) }
        if (dayShifts[shiftId] !== personId) {
          dayShifts[shiftId] = personId
          currentDayShiftAssignments[dateStr] = dayShifts
          hasChanges = true
        }
      })
    } else {
      // All shifts or generic availability
      if (avail?.shiftAvailability && Object.keys(avail.shiftAvailability).length > 0) {
        for (const [sId, days] of Object.entries(avail.shiftAvailability)) {
          days.forEach((dayNum) => {
            const dayStr = dayNum.toString().padStart(2, '0')
            const dateStr = `${month}-${dayStr}`
            const dayList = currentAssignments[dateStr] || []
            if (!dayList.includes(personId)) {
              currentAssignments[dateStr] = [...dayList, personId]
              hasChanges = true
            }
            const dayShifts = { ...(currentDayShiftAssignments[dateStr] || {}) }
            if (dayShifts[sId] !== personId) {
              dayShifts[sId] = personId
              currentDayShiftAssignments[dateStr] = dayShifts
              hasChanges = true
            }
          })
        }
      } else {
        const daysToAssign =
          avail && avail.availableDays.length > 0 ? avail.availableDays : totalMonthDays

        daysToAssign.forEach((dayNum) => {
          const dayStr = dayNum.toString().padStart(2, '0')
          const dateStr = `${month}-${dayStr}`
          const dayList = currentAssignments[dateStr] || []
          if (!dayList.includes(personId)) {
            currentAssignments[dateStr] = [...dayList, personId]
            hasChanges = true
          }
        })
      }
    }

    if (hasChanges) {
      set({
        assignments: currentAssignments,
        dayShiftAssignments: currentDayShiftAssignments,
        hasUnsavedChanges: true,
        hasValidated: false,
        validationErrors: [],
      })
    }
  },

  assignPersonToShift: (dateStr, shiftId, personId) => {
    const currentDayShifts = { ...(get().dayShiftAssignments[dateStr] || {}) }
    currentDayShifts[shiftId] = personId

    const updatedDayShiftAssignments = {
      ...get().dayShiftAssignments,
      [dateStr]: currentDayShifts,
    }

    const currentAssigned = get().assignments[dateStr] || []
    const updatedAssigned = currentAssigned.includes(personId)
      ? currentAssigned
      : [...currentAssigned, personId]

    set({
      dayShiftAssignments: updatedDayShiftAssignments,
      assignments: {
        ...get().assignments,
        [dateStr]: updatedAssigned,
      },
      hasUnsavedChanges: true,
    })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  removePersonFromShift: (dateStr, shiftId) => {
    const currentDayShifts = { ...(get().dayShiftAssignments[dateStr] || {}) }
    const removedPersonId = currentDayShifts[shiftId]
    delete currentDayShifts[shiftId]

    const updatedDayShiftAssignments = {
      ...get().dayShiftAssignments,
      [dateStr]: currentDayShifts,
    }

    let updatedAssignments = get().assignments
    if (removedPersonId) {
      const isStillAssigned = Object.values(currentDayShifts).includes(removedPersonId)
      if (!isStillAssigned) {
        const currentAssigned = get().assignments[dateStr] || []
        updatedAssignments = {
          ...get().assignments,
          [dateStr]: currentAssigned.filter((id) => id !== removedPersonId),
        }
      }
    }

    set({
      dayShiftAssignments: updatedDayShiftAssignments,
      assignments: updatedAssignments,
      hasUnsavedChanges: true,
    })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  removePersonFromDay: (dateStr, personId) => {
    const current = get().assignments[dateStr] || []
    const updatedForDay = current.filter((id) => id !== personId)
    const updated = {
      ...get().assignments,
      [dateStr]: updatedForDay,
    }

    const currentShifts = get().dayShiftAssignments[dateStr]
    let updatedDayShiftAssignments = get().dayShiftAssignments
    if (currentShifts) {
      const nextDayShifts = { ...currentShifts }
      let changed = false
      Object.entries(nextDayShifts).forEach(([sId, pId]) => {
        if (pId === personId) {
          delete nextDayShifts[sId]
          changed = true
        }
      })
      if (changed) {
        updatedDayShiftAssignments = {
          ...get().dayShiftAssignments,
          [dateStr]: nextDayShifts,
        }
      }
    }

    set({
      assignments: updated,
      dayShiftAssignments: updatedDayShiftAssignments,
      hasUnsavedChanges: true,
    })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  addPersonToDay: (dateStr, personId, shiftId) => {
    if (shiftId) {
      get().assignPersonToShift(dateStr, shiftId, personId)
      return
    }

    const activeShiftsForDay = get().getDayActiveShifts(dateStr)
    const activeShiftIds = activeShiftsForDay.map((s) => s.id)
    if (activeShiftIds.length > 0) {
      const dayShifts = get().dayShiftAssignments[dateStr] || {}
      const vacantShiftId = activeShiftIds.find((sId) => !dayShifts[sId])
      if (vacantShiftId) {
        get().assignPersonToShift(dateStr, vacantShiftId, personId)
        return
      }
    }

    const current = get().assignments[dateStr] || []
    if (current.includes(personId)) return
    const updated = {
      ...get().assignments,
      [dateStr]: [...current, personId],
    }
    set({ assignments: updated, hasUnsavedChanges: true })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  setDayAssignments: (dateStr, personIds) => {
    const updated = {
      ...get().assignments,
      [dateStr]: personIds,
    }
    set({ assignments: updated, hasUnsavedChanges: true })
  },

  addEvent: (eventData) => {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newEvent: CalendarEvent = { ...eventData, id }
    const updated = [...get().events, newEvent]
    StorageService.saveEvents(updated)
    set({ events: updated })

    if (CloudSyncService.isSyncEnabled()) {
      const month = eventData.date.substring(0, 7)
      CloudSyncService.saveMonthToCloud(month, {
        assignments: get().assignments,
        monthParticipants: get().monthParticipants,
        availabilities: get().availabilities,
        events: updated,
      })
    }
  },

  updateEvent: (eventId, updatedData) => {
    const updated = get().events.map((e) =>
      e.id === eventId ? { ...e, ...updatedData } : e
    )
    StorageService.saveEvents(updated)
    set({ events: updated })

    if (CloudSyncService.isSyncEnabled()) {
      const targetEvent = updated.find((e) => e.id === eventId)
      const month = targetEvent ? targetEvent.date.substring(0, 7) : get().currentMonth
      CloudSyncService.saveMonthToCloud(month, {
        assignments: get().assignments,
        monthParticipants: get().monthParticipants,
        availabilities: get().availabilities,
        events: updated,
      })
    }
  },

  deleteEvent: (eventId) => {
    const targetEvent = get().events.find((e) => e.id === eventId)
    const month = targetEvent ? targetEvent.date.substring(0, 7) : get().currentMonth
    const updated = get().events.filter((e) => e.id !== eventId)
    StorageService.saveEvents(updated)
    set({ events: updated })

    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.saveMonthToCloud(month, {
        assignments: get().assignments,
        monthParticipants: get().monthParticipants,
        availabilities: get().availabilities,
        events: updated,
      })
    }
  },

  addAddress: (addressData) => {
    const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newAddress: Address = { id, ...addressData }
    const updated = [...get().addresses, newAddress]
    StorageService.saveAddresses(updated)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.saveAddressesToCloud(updated).catch((err) => {
        console.error('Failed to sync addresses to cloud:', err)
      })
    }
    set({ addresses: updated })
    return newAddress
  },

  updateAddress: (id, addressData) => {
    const oldAddress = get().addresses.find((a) => a.id === id)
    const updated = get().addresses.map((a) => (a.id === id ? { ...a, ...addressData } : a))
    const newAddress = updated.find((a) => a.id === id)
    StorageService.saveAddresses(updated)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.saveAddressesToCloud(updated).catch((err) => {
        console.error('Failed to sync addresses to cloud:', err)
      })
    }

    // Cascade address update to FUTURE events that use this address.
    // Past events remain unchanged to preserve history.
    let hasEventChanges = false
    const affectedMonths = new Set<string>()
    const updatedEvents = get().events.map((ev) => {
      const isMatch =
        ev.addressId === id ||
        (!ev.addressId &&
          oldAddress &&
          (ev.address === formatAddress(oldAddress) ||
            (oldAddress.name && ev.address?.startsWith(oldAddress.name))))

      if (isMatch) {
        if (!isEventInPast(ev.date, ev.time)) {
          hasEventChanges = true
          affectedMonths.add(ev.date.substring(0, 7))
          return {
            ...ev,
            addressId: id,
            address: newAddress ? formatAddress(newAddress) : ev.address,
          }
        }
      }
      return ev
    })

    if (hasEventChanges) {
      StorageService.saveEvents(updatedEvents)
      if (CloudSyncService.isSyncEnabled()) {
        affectedMonths.forEach((month) => {
          CloudSyncService.saveMonthToCloud(month, {
            assignments: get().assignments,
            monthParticipants: get().monthParticipants,
            availabilities: get().availabilities,
            events: updatedEvents,
          }).catch((err) => console.error('Failed to sync updated events to cloud:', err))
        })
      }
      set({ addresses: updated, events: updatedEvents })
    } else {
      set({ addresses: updated })
    }
  },

  deleteAddress: (id) => {
    const targetAddress = get().addresses.find((a) => a.id === id)
    const updated = get().addresses.filter((a) => a.id !== id)
    StorageService.saveAddresses(updated)
    if (CloudSyncService.isSyncEnabled()) {
      CloudSyncService.saveAddressesToCloud(updated).catch((err) => {
        console.error('Failed to sync addresses to cloud:', err)
      })
    }

    // Cascade address deletion to FUTURE events that use this address.
    // Past events remain unchanged to preserve history.
    let hasEventChanges = false
    const affectedMonths = new Set<string>()
    const updatedEvents = get().events.map((ev) => {
      const isMatch =
        ev.addressId === id ||
        (!ev.addressId &&
          targetAddress &&
          (ev.address === formatAddress(targetAddress) ||
            (targetAddress.name && ev.address?.startsWith(targetAddress.name))))

      if (isMatch) {
        if (!isEventInPast(ev.date, ev.time)) {
          hasEventChanges = true
          affectedMonths.add(ev.date.substring(0, 7))
          const { address: _a, addressId: _aid, ...rest } = ev
          return {
            ...rest,
            address: undefined,
            addressId: undefined,
          }
        }
      }
      return ev
    })

    if (hasEventChanges) {
      StorageService.saveEvents(updatedEvents)
      if (CloudSyncService.isSyncEnabled()) {
        affectedMonths.forEach((month) => {
          CloudSyncService.saveMonthToCloud(month, {
            assignments: get().assignments,
            monthParticipants: get().monthParticipants,
            availabilities: get().availabilities,
            events: updatedEvents,
          }).catch((err) => console.error('Failed to sync updated events to cloud:', err))
        })
      }
      set({ addresses: updated, events: updatedEvents })
    } else {
      set({ addresses: updated })
    }
  },

  getActiveShiftIds: (month) => {
    const targetMonth = month || get().currentMonth
    const explicit = get().monthActiveShifts[targetMonth]
    if (explicit) return explicit
    // Default inheritance: all shifts with enabledByDefault: true
    return get()
      .shiftDefinitions.filter((s) => s.enabledByDefault)
      .map((s) => s.id)
  },

  getActiveRuleIds: (month) => {
    const targetMonth = month || get().currentMonth
    const explicit = get().monthActiveRules[targetMonth]
    if (explicit) return explicit
    // Default inheritance: all rules with enabledByDefault: true
    return get()
      .shiftRules.filter((r) => r.enabledByDefault)
      .map((r) => r.id)
  },

  getDayActiveShifts: (dateStr) => {
    const month = dateStr.slice(0, 7)
    const dayNumber = Number.parseInt(dateStr.slice(8, 10), 10)
    const monthDailyConfig = get().monthDailyShifts[month]

    const hasAnyConfigured =
      monthDailyConfig &&
      Object.values(monthDailyConfig).some((days) => Array.isArray(days) && days.length > 0)

    if (hasAnyConfigured) {
      const dayShifts = get().shiftDefinitions.filter((s) =>
        monthDailyConfig[s.id]?.includes(dayNumber)
      )
      return dayShifts
    }

    // When no daily shift is configured for the month, return empty (vazio)
    return []
  },

  setMonthDailyShifts: (month, dailyShifts) => {
    const updated = {
      ...get().monthDailyShifts,
      [month]: dailyShifts,
    }
    StorageService.saveMonthDailyShiftsMap(updated)

    // Also update monthActiveShifts to include any shift that has at least 1 day assigned
    const activeShiftIdsForMonth = Object.entries(dailyShifts)
      .filter(([, days]) => days && days.length > 0)
      .map(([sId]) => sId)

    const updatedActiveShifts = {
      ...get().monthActiveShifts,
      [month]: activeShiftIdsForMonth,
    }
    StorageService.saveMonthActiveShiftsMap(updatedActiveShifts)

    set({
      monthDailyShifts: updated,
      monthActiveShifts: updatedActiveShifts,
    })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  toggleMonthShift: (shiftId, month) => {
    const currentActive = get().getActiveShiftIds(month)
    const nextActive = currentActive.includes(shiftId)
      ? currentActive.filter((id) => id !== shiftId)
      : [...currentActive, shiftId]

    const updatedMap = {
      ...get().monthActiveShifts,
      [month]: nextActive,
    }

    StorageService.saveMonthActiveShiftsMap(updatedMap)
    set({ monthActiveShifts: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  toggleMonthRule: (ruleId, month) => {
    const currentActive = get().getActiveRuleIds(month)
    const nextActive = currentActive.includes(ruleId)
      ? currentActive.filter((id) => id !== ruleId)
      : [...currentActive, ruleId]

    const updatedMap = {
      ...get().monthActiveRules,
      [month]: nextActive,
    }

    StorageService.saveMonthActiveRulesMap(updatedMap)
    set({ monthActiveRules: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  addShiftsToMonth: (shiftIds, month) => {
    const currentActive = get().getActiveShiftIds(month)
    const newIds = shiftIds.filter((id) => !currentActive.includes(id))
    if (newIds.length === 0) return

    const updatedMap = {
      ...get().monthActiveShifts,
      [month]: [...currentActive, ...newIds],
    }

    StorageService.saveMonthActiveShiftsMap(updatedMap)
    set({ monthActiveShifts: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  removeShiftFromMonth: (shiftId, month) => {
    const currentActive = get().getActiveShiftIds(month)
    const updatedMap = {
      ...get().monthActiveShifts,
      [month]: currentActive.filter((id) => id !== shiftId),
    }

    StorageService.saveMonthActiveShiftsMap(updatedMap)
    set({ monthActiveShifts: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  addRulesToMonth: (ruleIds, month) => {
    const currentActive = get().getActiveRuleIds(month)
    const newIds = ruleIds.filter((id) => !currentActive.includes(id))
    if (newIds.length === 0) return

    const updatedMap = {
      ...get().monthActiveRules,
      [month]: [...currentActive, ...newIds],
    }

    StorageService.saveMonthActiveRulesMap(updatedMap)
    set({ monthActiveRules: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  removeRuleFromMonth: (ruleId, month) => {
    const currentActive = get().getActiveRuleIds(month)
    const updatedMap = {
      ...get().monthActiveRules,
      [month]: currentActive.filter((id) => id !== ruleId),
    }

    StorageService.saveMonthActiveRulesMap(updatedMap)
    set({ monthActiveRules: updatedMap })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  resetMonthDefaults: (month) => {
    const defaultShiftIds = get()
      .shiftDefinitions.filter((s) => s.enabledByDefault)
      .map((s) => s.id)
    const defaultRuleIds = get()
      .shiftRules.filter((r) => r.enabledByDefault)
      .map((r) => r.id)

    const updatedShiftsMap = {
      ...get().monthActiveShifts,
      [month]: defaultShiftIds,
    }
    const updatedRulesMap = {
      ...get().monthActiveRules,
      [month]: defaultRuleIds,
    }

    StorageService.saveMonthActiveShiftsMap(updatedShiftsMap)
    StorageService.saveMonthActiveRulesMap(updatedRulesMap)
    set({
      monthActiveShifts: updatedShiftsMap,
      monthActiveRules: updatedRulesMap,
    })

    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  addShiftDefinition: (shiftData) => {
    const now = new Date().toISOString()
    const newShift: ShiftDefinition = {
      ...shiftData,
      id: `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...get().shiftDefinitions, newShift]
    StorageService.saveShiftDefinitions(updated)
    set({ shiftDefinitions: updated })
    return newShift
  },

  updateShiftDefinition: (id, shiftData) => {
    const now = new Date().toISOString()
    const updated = get().shiftDefinitions.map((s) =>
      s.id === id ? { ...s, ...shiftData, updatedAt: now } : s
    )
    StorageService.saveShiftDefinitions(updated)
    set({ shiftDefinitions: updated })
    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  deleteShiftDefinition: (id) => {
    const updated = get().shiftDefinitions.filter((s) => s.id !== id)
    StorageService.saveShiftDefinitions(updated)
    set({ shiftDefinitions: updated })
    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  duplicateShiftDefinition: (id) => {
    const original = get().shiftDefinitions.find((s) => s.id === id)
    if (!original) return
    const now = new Date().toISOString()
    const duplicated: ShiftDefinition = {
      ...original,
      id: `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${original.name} (Cópia)`,
      code: `${original.code}C`,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...get().shiftDefinitions, duplicated]
    StorageService.saveShiftDefinitions(updated)
    set({ shiftDefinitions: updated })
  },

  addShiftRule: (ruleData) => {
    const now = new Date().toISOString()
    const newRule: ShiftRule = {
      ...ruleData,
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...get().shiftRules, newRule]
    StorageService.saveShiftRules(updated)
    set({ shiftRules: updated })
    return newRule
  },

  updateShiftRule: (id, ruleData) => {
    const now = new Date().toISOString()
    const updated = get().shiftRules.map((r) =>
      r.id === id ? { ...r, ...ruleData, updatedAt: now } : r
    )
    StorageService.saveShiftRules(updated)
    set({ shiftRules: updated })
    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  deleteShiftRule: (id) => {
    const updated = get().shiftRules.filter((r) => r.id !== id)
    StorageService.saveShiftRules(updated)
    set({ shiftRules: updated })
    if (get().hasValidated) {
      get().validateCurrentSchedule()
    }
  },

  duplicateShiftRule: (id) => {
    const original = get().shiftRules.find((r) => r.id === id)
    if (!original) return
    const now = new Date().toISOString()
    const duplicated: ShiftRule = {
      ...original,
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${original.name} (Cópia)`,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...get().shiftRules, duplicated]
    StorageService.saveShiftRules(updated)
    set({ shiftRules: updated })
  },

  validateCurrentSchedule: () => {
    const activeRuleIds = get().getActiveRuleIds(get().currentMonth)
    const errors = validateSchedule({
      currentMonth: get().currentMonth,
      allAssignments: get().assignments,
      dayShiftAssignments: get().dayShiftAssignments,
      persons: get().persons,
      availabilities: get().availabilities,
      activeRuleIds,
      allRules: get().shiftRules,
      allShifts: get().shiftDefinitions,
      monthDailyShifts: get().monthDailyShifts,
    })
    set({ validationErrors: errors, hasValidated: true })
    return errors
  },

  saveSchedule: async () => {
    set({ isSaving: true })
    // Save everything in storage
    StorageService.savePersons(get().persons)
    StorageService.saveAvailabilities(get().availabilities)
    StorageService.saveAssignments(get().assignments)
    StorageService.saveDayShiftAssignments(get().dayShiftAssignments)
    StorageService.saveEvents(get().events)
    StorageService.saveMonthParticipants(get().monthParticipants)
    StorageService.saveAddresses(get().addresses)

    // Commit draft into savedAssignments and savedDayShiftAssignments
    set({
      savedAssignments: { ...get().assignments },
      savedDayShiftAssignments: { ...get().dayShiftAssignments },
      hasUnsavedChanges: false,
    })

    // If cloud sync is active, explicitly push to Firestore
    let cloudSaved = false
    if (CloudSyncService.isSyncEnabled()) {
      try {
        const [monthSaved, peopleSaved, addressesSaved] = await Promise.all([
          CloudSyncService.saveMonthToCloud(get().currentMonth, {
            assignments: get().assignments,
            monthParticipants: get().monthParticipants,
            availabilities: get().availabilities,
            events: get().events,
          }),
          CloudSyncService.savePeopleToCloud(get().persons),
          CloudSyncService.saveAddressesToCloud(get().addresses),
        ])
        cloudSaved = monthSaved && peopleSaved && addressesSaved
      } catch (err) {
        console.error('Failed to sync schedule to cloud:', err)
      }
    }

    // Execute audit validation
    const errors = get().validateCurrentSchedule()

    const errorCount = errors.filter((e) => e.severity === 'error').length
    const warningCount = errors.filter((e) => e.severity === 'warning').length

    let feedback: SaveFeedbackData = cloudSaved ? { type: 'cloud' } : { type: 'local' }
    if (errorCount > 0) {
      feedback = { type: 'errors', errorsCount: errorCount, warningsCount: warningCount }
    } else if (warningCount > 0) {
      feedback = { type: 'warnings', warningsCount: warningCount }
    }

    set({
      isSaving: false,
      saveFeedback: feedback,
    })

    setTimeout(() => {
      set({ saveFeedback: null })
    }, 5000)
  },

  pullCloudData: async (month?: string, isAdmin?: boolean) => {
    const targetMonth = month || get().currentMonth

    try {
      const { monthData, persons, addresses } = await CloudSyncService.pullAllFromCloud(
        targetMonth,
        isAdmin,
        true,
      )

      if (!monthData && !persons && !addresses) {
        return {
          success: false,
          code: 'no_data',
          message: 'Nenhum dado encontrado na nuvem para sincronizar.',
        }
      }

      if (Array.isArray(persons)) {
        StorageService.savePersons(persons)
        set({ persons })
      }

      if (Array.isArray(addresses)) {
        StorageService.saveAddresses(addresses)
        set({ addresses })
      }

      if (monthData) {
        if (monthData.assignments) {
          StorageService.saveAssignments(monthData.assignments)
          set({
            assignments: monthData.assignments,
            savedAssignments: { ...monthData.assignments },
          })
        }
        if (monthData.monthParticipants) {
          StorageService.saveMonthParticipants(monthData.monthParticipants)
          set({ monthParticipants: monthData.monthParticipants })
        }
        if (monthData.availabilities) {
          StorageService.saveAvailabilities(monthData.availabilities)
          set({ availabilities: monthData.availabilities })
        }
        if (monthData.events) {
          StorageService.saveEvents(monthData.events)
          set({ events: monthData.events })
        }
      }

      return {
        success: true,
        code: 'success',
        message: 'Dados locais atualizados a partir da nuvem com sucesso!',
      }
    } catch (err) {
      console.error('Failed to pull data from cloud:', err)
      return {
        success: false,
        code: 'error',
        message: 'Erro ao tentar buscar dados na nuvem.',
      }
    }
  },

  forcePushCloudData: async (isAdmin?: boolean) => {
    set({ isSaving: true })
    try {
      const success = await CloudSyncService.pushAllToCloud(
        get().currentMonth,
        {
          monthData: {
            assignments: get().assignments,
            monthParticipants: get().monthParticipants,
            availabilities: get().availabilities,
            events: get().events,
          },
          persons: get().persons,
          addresses: get().addresses,
        },
        isAdmin,
        true,
      )

      set({ isSaving: false })
      return {
        success,
        code: success ? 'success' : 'error',
        message: success
          ? 'Dados locais forçados para a nuvem com sucesso!'
          : 'Falha ao forçar envio de dados para a nuvem. Verifique permissões.',
      }
    } catch (err) {
      console.error('Failed to force push data to cloud:', err)
      set({ isSaving: false })
      return {
        success: false,
        code: 'error',
        message: 'Erro inesperado ao forçar envio de dados para a nuvem.',
      }
    }
  },

  dismissValidation: () => {
    set({ hasValidated: false, validationErrors: [] })
  },

  reloadFromStorage: () => {
    const persons = StorageService.getPersons()
    const monthParticipants = StorageService.getMonthParticipants()
    const availabilities = StorageService.getAvailabilities()
    const assignments = StorageService.getAssignments()
    const dayShiftAssignments = StorageService.getDayShiftAssignments()
    const events = StorageService.getEvents()
    const addresses = StorageService.getAddresses()
    const shiftDefinitions = StorageService.getShiftDefinitions()
    const shiftRules = StorageService.getShiftRules()
    const monthActiveShifts = StorageService.getMonthActiveShiftsMap()
    const monthActiveRules = StorageService.getMonthActiveRulesMap()
    const monthDailyShifts = StorageService.getMonthDailyShiftsMap()

    set({
      persons,
      monthParticipants,
      availabilities,
      assignments,
      savedAssignments: { ...assignments },
      dayShiftAssignments,
      savedDayShiftAssignments: { ...dayShiftAssignments },
      events,
      addresses,
      shiftDefinitions,
      shiftRules,
      monthActiveShifts,
      monthActiveRules,
      monthDailyShifts,
      validationErrors: [],
      hasValidated: false,
      hasUnsavedChanges: false,
    })
  },

  clearAllLocalData: () => {
    StorageService.clearAllLocalData()
    set({
      persons: [],
      monthParticipants: {},
      availabilities: [],
      assignments: {},
      savedAssignments: {},
      dayShiftAssignments: {},
      savedDayShiftAssignments: {},
      events: [],
      addresses: [],
      shiftDefinitions: StorageService.getShiftDefinitions(),
      shiftRules: StorageService.getShiftRules(),
      monthActiveShifts: {},
      monthActiveRules: {},
      monthDailyShifts: {},
      validationErrors: [],
      hasValidated: false,
      hasUnsavedChanges: false,
    })
  },

  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
    set({ isDarkMode: nextDark })
  },
}))

