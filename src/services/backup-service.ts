import { StorageService } from './storage-service'
import { useScheduleStore } from '../store/use-schedule-store'

import type { AppDataSnapshot, MonthlyAvailability } from '../types'

/**
 * Generates the standardized filename for exports:
 * escala_backup_YYYY-MM-DD_HHmm.json
 */
export function getBackupFilename(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `escala_backup_${year}-${month}-${day}_${hours}${minutes}.json`
}

/**
 * Checks if the local storage contains any existing user data.
 * Returns false if the storage is completely empty or has no registered people/schedules.
 */
export async function hasExistingLocalData(): Promise<boolean> {
  try {
    const rawPersons = localStorage.getItem('scale_manager_persons_v1')
    const rawAssignments = localStorage.getItem('scale_manager_assignments_v1')
    const rawMonthParticipants = localStorage.getItem('scale_manager_month_participants_v1')
    const rawEvents = localStorage.getItem('scale_manager_events_v1')

    if (!rawPersons && !rawAssignments && !rawMonthParticipants && !rawEvents) {
      return false
    }

    const persons = rawPersons ? JSON.parse(rawPersons) : []
    const assignments = rawAssignments ? JSON.parse(rawAssignments) : {}
    const monthParticipants = rawMonthParticipants ? JSON.parse(rawMonthParticipants) : {}
    const events = rawEvents ? JSON.parse(rawEvents) : []

    const hasPersons = Array.isArray(persons) && persons.length > 0
    const hasAssignments =
      assignments &&
      typeof assignments === 'object' &&
      Object.values(assignments).some((v) => Array.isArray(v) && v.length > 0)
    const hasMonthParticipants =
      monthParticipants &&
      typeof monthParticipants === 'object' &&
      Object.values(monthParticipants).some((v) => Array.isArray(v) && v.length > 0)
    const hasEvents = Array.isArray(events) && events.length > 0

    return Boolean(hasPersons || hasAssignments || hasMonthParticipants || hasEvents)
  } catch {
    return false
  }
}

/**
 * Exports current application state into a downloadable JSON file.
 * Preserves all existing fields, metadata, events, participants and configurations.
 */
export async function exportAppData(): Promise<void> {
  const persons = StorageService.getPersons()
  const monthParticipants = StorageService.getMonthParticipants()
  const availabilities = StorageService.getAvailabilities()
  const assignments = StorageService.getAssignments()
  const events = StorageService.getEvents()
  const addresses = StorageService.getAddresses()
  const theme = localStorage.getItem('theme') || 'light'

  const snapshot: AppDataSnapshot = {
    exportedAt: new Date().toISOString(),
    people: persons,
    monthParticipants,
    availabilities,
    assignments,
    events,
    addresses,
    theme,
  }

  const filename = getBackupFilename()
  const jsonContent = JSON.stringify(snapshot, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validates and parses an uploaded JSON backup file.
 * Returns the normalized AppDataSnapshot or throws a descriptive error.
 */
export async function validateAndParseBackup(file: File): Promise<AppDataSnapshot> {
  if (!file) {
    throw new Error('Nenhum arquivo foi selecionado.')
  }

  const text = await file.text()
  let json: unknown

  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('Arquivo de backup inválido: formato JSON corrompido ou ilegível.')
  }

  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error('Estrutura do arquivo inválida: o backup deve ser um objeto JSON.')
  }

  const raw = json as Record<string, unknown>
  const people = raw.people ?? raw.persons

  if (!Array.isArray(people)) {
    throw new Error('Estrutura do arquivo inválida: campo "people" ausente ou inválido.')
  }

  for (const person of people) {
    if (
      !person ||
      typeof person !== 'object' ||
      typeof (person as { id?: unknown }).id !== 'string' ||
      typeof (person as { name?: unknown }).name !== 'string'
    ) {
      throw new Error('Estrutura do arquivo inválida: profissional com formato incorreto (id ou name ausente).')
    }
  }

  const monthParticipants =
    raw.monthParticipants && typeof raw.monthParticipants === 'object' && !Array.isArray(raw.monthParticipants)
      ? (raw.monthParticipants as Record<string, string[]>)
      : {}

  const assignments =
    raw.assignments && typeof raw.assignments === 'object' && !Array.isArray(raw.assignments)
      ? (raw.assignments as Record<string, unknown>)
      : {}

  const events = Array.isArray(raw.events) ? raw.events : []
  const addresses = Array.isArray(raw.addresses) ? raw.addresses : []
  const availabilities = raw.availabilities ?? []

  return {
    ...raw,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    people: people as AppDataSnapshot['people'],
    monthParticipants,
    availabilities: availabilities as AppDataSnapshot['availabilities'],
    assignments,
    events,
    addresses,
  }
}

/**
 * Restores data from an AppDataSnapshot into localStorage and updates the global store.
 * Redirection to the calendar view is handled automatically.
 */
export async function restoreAppData(data: AppDataSnapshot): Promise<void> {
  const people = (data.people || []).map((p) => ({
    ...p,
    id: p.id,
    name: p.name,
    color: p.color || '#3b82f6',
  }))

  StorageService.savePersons(people)

  const monthParticipants = data.monthParticipants || {}
  StorageService.saveMonthParticipants(monthParticipants)

  let availabilities: MonthlyAvailability[] = []
  if (Array.isArray(data.availabilities)) {
    availabilities = data.availabilities as MonthlyAvailability[]
  } else if (data.availabilities && typeof data.availabilities === 'object') {
    availabilities = Object.values(data.availabilities) as MonthlyAvailability[]
  }
  StorageService.saveAvailabilities(availabilities)

  const assignments = (data.assignments || {}) as Record<string, string[]>
  StorageService.saveAssignments(assignments)

  const events = Array.isArray(data.events) ? data.events : []
  StorageService.saveEvents(events)

  const addresses = Array.isArray(data.addresses) ? data.addresses : []
  StorageService.saveAddresses(addresses)

  if (data.theme === 'dark' || data.theme === 'light') {
    localStorage.setItem('theme', data.theme)
    if (typeof document !== 'undefined') {
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Update zustand store
  useScheduleStore.setState({
    persons: people,
    monthParticipants,
    availabilities,
    assignments,
    savedAssignments: { ...assignments },
    events,
    hasUnsavedChanges: false,
    isEditMode: false,
    validationErrors: [],
    hasValidated: false,
    currentView: 'calendar',
    ...(data.theme === 'dark' || data.theme === 'light' ? { isDarkMode: data.theme === 'dark' } : {}),
  })
}

export const BackupService = {
  exportAppData,
  validateAndParseBackup,
  restoreAppData,
  hasExistingLocalData,
  getBackupFilename,
}
