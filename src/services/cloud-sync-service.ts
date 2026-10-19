import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

import { auth, db } from './firebase'

import type { MonthlyAvailability, CalendarEvent, Person } from '../types'
import type {
  DocumentData} from 'firebase/firestore'

export const CLOUD_SYNC_STORAGE_KEY = 'scale_manager_cloud_sync_enabled'

export interface MonthScheduleDoc {
  month: string; // 'YYYY-MM'
  assignments?: Record<string, string[]>;
  monthParticipants?: Record<string, string[]>;
  availabilities?: MonthlyAvailability[];
  events?: CalendarEvent[];
  updatedAt?: unknown;
}

export class CloudSyncService {
  /**
   * Retrieves whether cloud synchronization is enabled locally.
   * Defaults to false (offline/local-only).
   */
  static isSyncEnabled(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false
      return localStorage.getItem(CLOUD_SYNC_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  }

  /**
   * Updates the sync toggle state and saves it in localStorage.
   */
  static setSyncEnabled(enabled: boolean): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CLOUD_SYNC_STORAGE_KEY, enabled ? 'true' : 'false')
      }
    } catch (err) {
      console.error('Failed to update sync enabled state:', err)
    }
  }

  /**
   * Checks dynamically in Firestore if the current authenticated user has the 'admin' role.
   * No emails are hardcoded.
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    const uid = auth.currentUser?.uid
    if (!uid) return false
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      return userDoc.exists() && userDoc.data()?.role === 'admin'
    } catch {
      return false
    }
  }

  /**
   * Pulls the active month document from Firestore on-demand.
   * If sync is disabled or user is not admin, does NOT perform any network calls.
   */
  static async fetchMonthFromCloud(
    month: string,
    isAdmin?: boolean,
  ): Promise<MonthScheduleDoc | null> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || !this.isSyncEnabled()) {
      return null
    }

    try {
      const docRef = doc(db, 'schedules', month)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return null
      }

      const data = snapshot.data() as DocumentData
      return {
        month,
        assignments: data.assignments,
        monthParticipants: data.monthParticipants,
        availabilities: data.availabilities,
        events: data.events,
        updatedAt: data.updatedAt,
      }
    } catch (err) {
      console.error(`Failed to fetch schedule for ${month} from Firestore:`, err)
      return null
    }
  }

  /**
   * Pulls master personnel list from Firestore on-demand.
   */
  static async fetchPeopleFromCloud(isAdmin?: boolean): Promise<Person[] | null> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || !this.isSyncEnabled()) {
      return null
    }

    try {
      const docRef = doc(db, 'schedules', '_master_people')
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return null
      }

      const data = snapshot.data() as DocumentData
      return (data.persons as Person[]) || null
    } catch (err) {
      console.error('Failed to fetch people from Firestore:', err)
      return null
    }
  }

  /**
   * Consolidated on-demand pull for both monthly schedule and personnel.
   */
  static async pullAllFromCloud(
    month: string,
    isAdmin?: boolean,
  ): Promise<{
    monthData: MonthScheduleDoc | null;
    persons: Person[] | null;
  }> {
    const [monthData, persons] = await Promise.all([
      this.fetchMonthFromCloud(month, isAdmin),
      this.fetchPeopleFromCloud(isAdmin),
    ])
    return { monthData, persons }
  }

  /**
   * Explicitly pushes the month schedule to Firestore when the user saves changes.
   * Only executes if the user is admin and the sync toggle is enabled.
   */
  static async saveMonthToCloud(
    month: string,
    data: {
      assignments?: Record<string, string[]>;
      monthParticipants?: Record<string, string[]>;
      availabilities?: MonthlyAvailability[];
      events?: CalendarEvent[];
    },
    isAdmin?: boolean,
  ): Promise<boolean> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || !this.isSyncEnabled()) {
      return false
    }

    try {
      const docRef = doc(db, 'schedules', month)
      await setDoc(
        docRef,
        {
          ...data,
          month,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (err) {
      console.error(`Failed to save schedule for ${month} to Firestore:`, err)
      return false
    }
  }

  /**
   * Syncs master personnel to Firestore when saving if sync is active.
   */
  static async savePeopleToCloud(persons: Person[], isAdmin?: boolean): Promise<boolean> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || !this.isSyncEnabled()) {
      return false
    }

    try {
      const docRef = doc(db, 'schedules', '_master_people')
      await setDoc(
        docRef,
        {
          persons,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (err) {
      console.error('Failed to sync people with Firestore:', err)
      return false
    }
  }
}
