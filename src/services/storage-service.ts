import type { Person, MonthlyAvailability, CalendarEvent, GuestProfile, GuestDataset } from '../types';

const STORAGE_KEYS = {
  PERSONS: 'scale_manager_persons_v1',
  AVAILABILITIES: 'scale_manager_availabilities_v1',
  ASSIGNMENTS: 'scale_manager_assignments_v1',
  EVENTS: 'scale_manager_events_v1',
  MONTH_PARTICIPANTS: 'scale_manager_month_participants_v1',
  GUEST_PROFILES: 'scale_manager_guest_profiles_v1',
  ACTIVE_GUEST_ID: 'scale_manager_active_guest_id_v1',
  GUEST_DATA_PREFIX: 'scale_manager_guest_data_v1_',
};

let isRestoringDataset = false;

export class StorageService {
  /**
   * Load persons from storage (returns empty array if storage has no data)
   */
  static getPersons(): Person[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONS);
      if (!data) {
        return [];
      }
      const parsed: Person[] = JSON.parse(data);
      return parsed.map((p) => ({
        ...p,
        active: p.active !== false,
      }));
    } catch (err) {
      console.error('Failed to load persons from localStorage:', err);
      return [];
    }
  }

  static savePersons(persons: Person[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
      if (!isRestoringDataset) {
        StorageService.snapshotActiveGuest();
      }
    } catch (err) {
      console.error('Failed to save persons to localStorage:', err);
    }
  }

  /**
   * Load availabilities (returns empty array if storage has no data)
   */
  static getAvailabilities(): MonthlyAvailability[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AVAILABILITIES);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load availabilities from localStorage:', err);
      return [];
    }
  }

  static saveAvailabilities(availabilities: MonthlyAvailability[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AVAILABILITIES, JSON.stringify(availabilities));
      if (!isRestoringDataset) {
        StorageService.snapshotActiveGuest();
      }
    } catch (err) {
      console.error('Failed to save availabilities to localStorage:', err);
    }
  }

  /**
   * Load assignments ('YYYY-MM-DD' -> string[], returns empty object if storage has no data)
   */
  static getAssignments(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (!data) {
        return {};
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load assignments from localStorage:', err);
      return {};
    }
  }

  static saveAssignments(assignments: Record<string, string[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
      if (!isRestoringDataset) {
        StorageService.snapshotActiveGuest();
      }
    } catch (err) {
      console.error('Failed to save assignments to localStorage:', err);
    }
  }

  /**
   * Load calendar events (returns empty array if storage has no data)
   */
  static getEvents(): CalendarEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load events from localStorage:', err);
      return [];
    }
  }

  static saveEvents(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      if (!isRestoringDataset) {
        StorageService.snapshotActiveGuest();
      }
    } catch (err) {
      console.error('Failed to save events to localStorage:', err);
    }
  }

  /**
   * Load month participants ('YYYY-MM' -> personId[], returns empty object if storage has no data)
   */
  static getMonthParticipants(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONTH_PARTICIPANTS);
      if (!data) {
        return {};
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load month participants from localStorage:', err);
      return {};
    }
  }

  static saveMonthParticipants(data: Record<string, string[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTH_PARTICIPANTS, JSON.stringify(data));
      if (!isRestoringDataset) {
        StorageService.snapshotActiveGuest();
      }
    } catch (err) {
      console.error('Failed to save month participants to localStorage:', err);
    }
  }

  /**
   * Reset all active storage keys
   */
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.PERSONS);
    localStorage.removeItem(STORAGE_KEYS.AVAILABILITIES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTH_PARTICIPANTS);
  }

  /**
   * Guest Profiles & Dataset Management
   */
  static getGuestProfiles(): GuestProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUEST_PROFILES);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load guest profiles from localStorage:', err);
      return [];
    }
  }

  static saveGuestProfiles(profiles: GuestProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GUEST_PROFILES, JSON.stringify(profiles));
    } catch (err) {
      console.error('Failed to save guest profiles to localStorage:', err);
    }
  }

  static getActiveGuestId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_GUEST_ID);
    } catch {
      return null;
    }
  }

  static setActiveGuestId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_GUEST_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_GUEST_ID);
      }
    } catch (err) {
      console.error('Failed to set active guest id in localStorage:', err);
    }
  }

  static getGuestDataset(guestId: string): GuestDataset | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.GUEST_DATA_PREFIX}${guestId}`);
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load guest dataset from localStorage:', err);
      return null;
    }
  }

  static saveGuestDataset(guestId: string, dataset: GuestDataset): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.GUEST_DATA_PREFIX}${guestId}`, JSON.stringify(dataset));
    } catch (err) {
      console.error('Failed to save guest dataset to localStorage:', err);
    }
  }

  static deleteGuestDataset(guestId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.GUEST_DATA_PREFIX}${guestId}`);
    } catch (err) {
      console.error('Failed to delete guest dataset from localStorage:', err);
    }
  }

  static getCurrentDataset(): GuestDataset {
    return {
      persons: StorageService.getPersons(),
      availabilities: StorageService.getAvailabilities(),
      assignments: StorageService.getAssignments(),
      events: StorageService.getEvents(),
      monthParticipants: StorageService.getMonthParticipants(),
    };
  }

  static restoreDataset(dataset: Partial<GuestDataset>): void {
    isRestoringDataset = true;
    try {
      StorageService.savePersons(dataset.persons || []);
      StorageService.saveAvailabilities(dataset.availabilities || []);
      StorageService.saveAssignments(dataset.assignments || {});
      StorageService.saveEvents(dataset.events || []);
      StorageService.saveMonthParticipants(dataset.monthParticipants || {});
    } finally {
      isRestoringDataset = false;
      StorageService.snapshotActiveGuest();
    }
  }

  static snapshotActiveGuest(): void {
    const activeId = StorageService.getActiveGuestId();
    if (activeId) {
      const dataset = StorageService.getCurrentDataset();
      StorageService.saveGuestDataset(activeId, dataset);
    }
  }
}

