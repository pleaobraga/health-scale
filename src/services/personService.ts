import { Person } from '../types';

export class PersonService {
  /**
   * Scans all assignments across saved months to verify if the person has any schedule history.
   * @param personId Person identifier
   * @param assignments Dictionary of assignments {'YYYY-MM-DD': string[]}
   * @returns boolean true if assigned to 1 or more days/shifts
   */
  static hasScheduleHistory(personId: string, assignments: Record<string, string[]>): boolean {
    if (!assignments || typeof assignments !== 'object') return false;
    return Object.values(assignments).some(
      (assignedIds) => Array.isArray(assignedIds) && assignedIds.includes(personId)
    );
  }

  /**
   * Checks if the person can be permanently deleted from the system.
   * Permanent deletion is NOT allowed if the person has any history in schedules.
   * @param personId Person identifier
   * @param assignments Global assignments dictionary
   * @returns boolean true if has no history (0 allocations)
   */
  static canDeletePerson(personId: string, assignments: Record<string, string[]>): boolean {
    return !this.hasScheduleHistory(personId, assignments);
  }

  /**
   * Returns only professionals where active === true (or not false).
   */
  static getActivePersons(persons: Person[]): Person[] {
    return persons.filter((p) => p.active !== false);
  }
}

// Utility functions exported directly
export const canDeletePerson = (personId: string, assignments: Record<string, string[]>): boolean =>
  PersonService.canDeletePerson(personId, assignments);

export const hasScheduleHistory = (personId: string, assignments: Record<string, string[]>): boolean =>
  PersonService.hasScheduleHistory(personId, assignments);

