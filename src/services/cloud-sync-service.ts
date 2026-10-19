import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

import { auth, db } from './firebase'

import type { MonthlyAvailability, CalendarEvent, Person, Address } from '../types'
import type { DocumentData } from 'firebase/firestore'

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
   * If ignoreSyncEnabled is false (default for background sync) and sync is disabled,
   * does NOT perform network calls.
   */
  static async fetchMonthFromCloud(
    month: string,
    isAdmin?: boolean,
    ignoreSyncEnabled = false,
  ): Promise<MonthScheduleDoc | null> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
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
  static async fetchPeopleFromCloud(
    isAdmin?: boolean,
    ignoreSyncEnabled = false,
  ): Promise<Person[] | null> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
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
   * Pulls master registered addresses from Firestore on-demand.
   */
  static async fetchAddressesFromCloud(
    isAdmin?: boolean,
    ignoreSyncEnabled = false,
  ): Promise<Address[] | null> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
      return null
    }

    try {
      const docRef = doc(db, 'schedules', '_master_addresses')
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return null
      }

      const data = snapshot.data() as DocumentData
      return (data.addresses as Address[]) || null
    } catch (err) {
      console.error('Failed to fetch addresses from Firestore:', err)
      return null
    }
  }

  /**
   * Consolidated on-demand pull for monthly schedule, personnel and addresses.
   * By default, ignores the local sync toggle for on-demand pull requests.
   */
  static async pullAllFromCloud(
    month: string,
    isAdmin?: boolean,
    ignoreSyncEnabled = true,
  ): Promise<{
    monthData: MonthScheduleDoc | null;
    persons: Person[] | null;
    addresses: Address[] | null;
  }> {
    const [monthData, persons, addresses] = await Promise.all([
      this.fetchMonthFromCloud(month, isAdmin, ignoreSyncEnabled),
      this.fetchPeopleFromCloud(isAdmin, ignoreSyncEnabled),
      this.fetchAddressesFromCloud(isAdmin, ignoreSyncEnabled),
    ])
    return { monthData, persons, addresses }
  }

  /**
   * Explicitly pushes the month schedule to Firestore when the user saves changes.
   * If ignoreSyncEnabled is true, bypasses the sync toggle check.
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
    ignoreSyncEnabled = false,
  ): Promise<boolean> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
      return false
    }

    try {
      const docRef = doc(db, 'schedules', month)
      const sanitizedData = JSON.parse(JSON.stringify(data))
      await setDoc(
        docRef,
        {
          ...sanitizedData,
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
  static async savePeopleToCloud(
    persons: Person[],
    isAdmin?: boolean,
    ignoreSyncEnabled = false,
  ): Promise<boolean> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
      return false
    }

    try {
      const docRef = doc(db, 'schedules', '_master_people')
      const sanitizedPersons = JSON.parse(JSON.stringify(persons))
      await setDoc(
        docRef,
        {
          persons: sanitizedPersons,
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

  /**
   * Syncs master registered addresses to Firestore when saving if sync is active.
   */
  static async saveAddressesToCloud(
    addresses: Address[],
    isAdmin?: boolean,
    ignoreSyncEnabled = false,
  ): Promise<boolean> {
    const authorized = isAdmin !== undefined ? isAdmin : await this.isCurrentUserAdmin()
    if (!authorized || (!ignoreSyncEnabled && !this.isSyncEnabled())) {
      return false
    }

    try {
      const docRef = doc(db, 'schedules', '_master_addresses')
      const sanitizedAddresses = JSON.parse(JSON.stringify(addresses))
      await setDoc(
        docRef,
        {
          addresses: sanitizedAddresses,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (err) {
      console.error('Failed to sync addresses with Firestore:', err)
      return false
    }
  }

  /**
   * Directly pushes local schedule, personnel and addresses to Firestore,
   * without requiring or altering the local sync toggle.
   */
  static async pushAllToCloud(
    month: string,
    data: {
      monthData: {
        assignments?: Record<string, string[]>;
        monthParticipants?: Record<string, string[]>;
        availabilities?: MonthlyAvailability[];
        events?: CalendarEvent[];
      };
      persons: Person[];
      addresses: Address[];
    },
    isAdmin?: boolean,
    ignoreSyncEnabled = true,
  ): Promise<boolean> {
    const [monthSaved, peopleSaved, addressesSaved] = await Promise.all([
      this.saveMonthToCloud(month, data.monthData, isAdmin, ignoreSyncEnabled),
      this.savePeopleToCloud(data.persons, isAdmin, ignoreSyncEnabled),
      this.saveAddressesToCloud(data.addresses, isAdmin, ignoreSyncEnabled),
    ])
    return monthSaved && peopleSaved && addressesSaved
  }
}
