import { describe, it, expect, beforeEach } from 'vitest'

import { StorageService } from './storage-service'

import type { Person, CalendarEvent, MonthlyAvailability } from '../types'

describe('StorageService - Persistência Local-First', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('deve retornar lista vazia caso o storage esteja vazio', () => {
    const persons = StorageService.getPersons()
    expect(persons).toEqual([])
  })


  it('deve salvar e recuperar pessoas atualizadas garantindo active padrão true', () => {
    const newPersons: Person[] = [
      { id: 'custom-1', name: 'Dr. Teste Silva', color: '#ef4444', active: true },
    ]
    StorageService.savePersons(newPersons)

    const loaded = StorageService.getPersons()
    expect(loaded).toEqual(newPersons)
    expect(loaded[0].active).toBe(true)
  })

  it('deve persistir e recuperar disponibilidades mensais', () => {
    const sampleAvail: MonthlyAvailability[] = [
      { personId: 'p1', month: '2026-10', availableDays: [5, 10, 15] },
    ]
    StorageService.saveAvailabilities(sampleAvail)

    const loaded = StorageService.getAvailabilities()
    expect(loaded).toEqual(sampleAvail)
  })

  it('deve persistir e recuperar escalas do calendário', () => {
    const sampleAssignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-02': ['p2'],
    }
    StorageService.saveAssignments(sampleAssignments)

    const loaded = StorageService.getAssignments()
    expect(loaded).toEqual(sampleAssignments)
  })

  it('deve persistir e recuperar eventos do calendário', () => {
    const sampleEvents: CalendarEvent[] = [
      { id: 'ev-test', date: '2026-10-20', title: 'Reunião de Escala' },
    ]
    StorageService.saveEvents(sampleEvents)

    const loaded = StorageService.getEvents()
    expect(loaded).toEqual(sampleEvents)
  })

  it('deve limpar dados ao chamar resetToDefault', () => {
    // Modify data
    StorageService.savePersons([{ id: 'tmp', name: 'Temporário', color: '#000000' }])
    expect(StorageService.getPersons()[0].name).toBe('Temporário')

    // Execute reset
    StorageService.resetToDefault()

    // When reloading, should return empty
    const reloaded = StorageService.getPersons()
    expect(reloaded).toEqual([])
  })

  it('deve limpar dados locais e o dataset do convidado ativo ao chamar clearAllLocalData', () => {
    StorageService.setActiveGuestId('guest_999')
    StorageService.savePersons([{ id: 'g_p1', name: 'Dr. Convidado', color: '#ff0000' }])
    StorageService.saveAddresses([{ id: 'g_a1', name: 'Endereço 1', street: 'Rua A', number: '10' }])

    // Should have snapshot in guest dataset
    expect(StorageService.getGuestDataset('guest_999')).toBeDefined()

    // Clear all
    StorageService.clearAllLocalData()

    expect(StorageService.getPersons()).toEqual([])
    expect(StorageService.getAddresses()).toEqual([])
    expect(StorageService.getShiftDefinitions()).toEqual([])
    expect(StorageService.getShiftRules()).toEqual([])
    expect(StorageService.getGuestDataset('guest_999')).toBeNull()
  })


  it('deve persistir e recuperar participantes mensais', () => {
    const participants = { '2026-10': ['p1', 'p2'] }
    StorageService.saveMonthParticipants(participants)

    const loaded = StorageService.getMonthParticipants()
    expect(loaded).toEqual(participants)
  })

  it('deve gerenciar perfis de convidados e datasets isolados', () => {
    const profiles = [
      {
        id: 'guest_1',
        name: 'Dr. Roberto',
        createdAt: '2026-10-18T10:00:00Z',
        lastActiveAt: '2026-10-18T10:00:00Z',
      },
    ]

    StorageService.saveGuestProfiles(profiles)
    expect(StorageService.getGuestProfiles()).toEqual(profiles)

    StorageService.setActiveGuestId('guest_1')
    expect(StorageService.getActiveGuestId()).toBe('guest_1')

    // Save dataset for guest_1
    const dataset = {
      persons: [{ id: 'p1', name: 'Dr. Roberto', color: '#10b981', active: true }],
      availabilities: [],
      assignments: { '2026-10-15': ['p1'] },
      events: [],
      monthParticipants: { '2026-10': ['p1'] },
    }

    StorageService.saveGuestDataset('guest_1', dataset)
    expect(StorageService.getGuestDataset('guest_1')).toEqual(dataset)

    // Test restoring dataset
    StorageService.resetToDefault()
    expect(StorageService.getPersons()).toEqual([])

    StorageService.restoreDataset(dataset)
    expect(StorageService.getPersons()).toHaveLength(1)
    expect(StorageService.getAssignments()['2026-10-15']).toEqual(['p1'])

    // Test deleting dataset
    StorageService.deleteGuestDataset('guest_1')
    expect(StorageService.getGuestDataset('guest_1')).toBeNull()

    StorageService.setActiveGuestId(null)
    expect(StorageService.getActiveGuestId()).toBeNull()
  })

  it('deve gerenciar datasets isolados de usuários autenticados com snapshotActiveSession', () => {
    // 1. Define active user
    StorageService.setActiveUserId('user_admin_123')
    expect(StorageService.getActiveUserId()).toBe('user_admin_123')

    // 2. Save data for active user
    StorageService.savePersons([{ id: 'p_admin', name: 'Dr. Admin', color: '#6366f1', active: true }])
    StorageService.saveAssignments({ '2026-10-15': ['p_admin'] })

    // 3. User dataset snapshot should be automatically populated via snapshotActiveSession
    const userSnapshot = StorageService.getUserDataset('user_admin_123')
    expect(userSnapshot).toBeDefined()
    expect(userSnapshot?.persons).toHaveLength(1)
    expect(userSnapshot?.persons[0].id).toBe('p_admin')
    expect(userSnapshot?.assignments['2026-10-15']).toEqual(['p_admin'])

    // 4. Simulate switching to guest (wipes active working keys)
    StorageService.setActiveUserId(null)
    StorageService.resetToDefault()
    expect(StorageService.getPersons()).toEqual([])
    expect(StorageService.getAssignments()).toEqual({})

    // 5. Restore user dataset when user logs back in
    const reloadedSnapshot = StorageService.getUserDataset('user_admin_123')
    expect(reloadedSnapshot).not.toBeNull()
    StorageService.restoreDataset(reloadedSnapshot!)
    expect(StorageService.getPersons()).toHaveLength(1)
    expect(StorageService.getPersons()[0].name).toBe('Dr. Admin')
    expect(StorageService.getAssignments()['2026-10-15']).toEqual(['p_admin'])

    // 6. Test deleteUserDataset
    StorageService.deleteUserDataset('user_admin_123')
    expect(StorageService.getUserDataset('user_admin_123')).toBeNull()
  })

  it('deve salvar a ordem das pessoas separada por perfil de convidado / usuário', () => {
    StorageService.setActiveGuestId('guest-a')
    StorageService.savePersonOrder(['p2', 'p1'])

    StorageService.setActiveGuestId('guest-b')
    expect(StorageService.getPersonOrder()).toEqual([])
    StorageService.savePersonOrder(['p1'])

    StorageService.setActiveGuestId('guest-a')
    expect(StorageService.getPersonOrder()).toEqual(['p2', 'p1'])
    expect(StorageService.getPersonOrderKey()).toBe('scale_manager_person_order_v1_guest_guest-a')
    StorageService.setActiveGuestId(null)
  })

  it('não deve incluir a ordem das pessoas no dataset (backup / sincronização) e deve limpá-la ao apagar os dados locais', () => {
    StorageService.savePersonOrder(['p1', 'p2'])
    expect(JSON.stringify(StorageService.getCurrentDataset())).not.toContain('person_order')

    StorageService.clearAllLocalData()
    expect(StorageService.getPersonOrder()).toEqual([])
  })

  it('deve ignorar valores inválidos salvos para a ordem das pessoas', () => {
    localStorage.setItem(StorageService.getPersonOrderKey(), '{"not":"an array"}')
    expect(StorageService.getPersonOrder()).toEqual([])
  })
})
