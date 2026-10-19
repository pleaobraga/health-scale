import * as firestoreModule from 'firebase/firestore'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { CloudSyncService, CLOUD_SYNC_STORAGE_KEY } from './cloud-sync-service'

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof firestoreModule>()
  return {
    ...actual,
    doc: vi.fn().mockImplementation((_db, collection, id) => ({ path: `${collection}/${id}` })),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({
        assignments: { '2026-10-01': ['p1'] },
        monthParticipants: { '2026-10': ['p1'] },
      }),
    }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vi.fn().mockReturnValue('mock-server-timestamp'),
  }
})

describe('CloudSyncService - On-Demand Refresh and Explicit Save', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    CloudSyncService.setSyncEnabled(false)
  })

  it('deve gerenciar o toggle de sincronização no localStorage corretamente', () => {
    expect(CloudSyncService.isSyncEnabled()).toBe(false)

    CloudSyncService.setSyncEnabled(true)
    expect(localStorage.getItem(CLOUD_SYNC_STORAGE_KEY)).toBe('true')
    expect(CloudSyncService.isSyncEnabled()).toBe(true)

    CloudSyncService.setSyncEnabled(false)
    expect(localStorage.getItem(CLOUD_SYNC_STORAGE_KEY)).toBe('false')
    expect(CloudSyncService.isSyncEnabled()).toBe(false)
  })

  it('NÃO deve buscar dados no Firestore (getDoc) no refresh se o toggle estiver DESLIGADO', async () => {
    CloudSyncService.setSyncEnabled(false)

    const result = await CloudSyncService.fetchMonthFromCloud('2026-10', true)

    expect(firestoreModule.getDoc).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('NÃO deve buscar dados no Firestore (getDoc) para usuários comuns (não-admin)', async () => {
    CloudSyncService.setSyncEnabled(true)

    const result = await CloudSyncService.fetchMonthFromCloud('2026-10', false)

    expect(firestoreModule.getDoc).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('deve buscar dados via getDoc no refresh quando o toggle estiver LIGADO e o usuário for admin', async () => {
    CloudSyncService.setSyncEnabled(true)

    const result = await CloudSyncService.fetchMonthFromCloud('2026-10', true)

    expect(firestoreModule.getDoc).toHaveBeenCalledTimes(1)
    expect(firestoreModule.getDoc).toHaveBeenCalledWith({ path: 'schedules/2026-10' })
    expect(result).toEqual({
      month: '2026-10',
      assignments: { '2026-10-01': ['p1'] },
      monthParticipants: { '2026-10': ['p1'] },
      availabilities: undefined,
      events: undefined,
      updatedAt: undefined,
    })
  })

  it('NÃO deve salvar dados no Firestore se o toggle estiver DESLIGADO', async () => {
    CloudSyncService.setSyncEnabled(false)

    const success = await CloudSyncService.saveMonthToCloud(
      '2026-10',
      { assignments: { '2026-10-01': ['p1'] } },
      true,
    )

    expect(firestoreModule.setDoc).not.toHaveBeenCalled()
    expect(success).toBe(false)
  })

  it('NÃO deve salvar dados no Firestore se o usuário for não-admin', async () => {
    CloudSyncService.setSyncEnabled(true)

    const success = await CloudSyncService.saveMonthToCloud(
      '2026-10',
      { assignments: { '2026-10-01': ['p1'] } },
      false,
    )

    expect(firestoreModule.setDoc).not.toHaveBeenCalled()
    expect(success).toBe(false)
  })

  it('deve salvar dados no Firestore (setDoc) apenas ao salvar explicitamente com o toggle LIGADO e sendo admin', async () => {
    CloudSyncService.setSyncEnabled(true)

    const success = await CloudSyncService.saveMonthToCloud(
      '2026-10',
      { assignments: { '2026-10-05': ['p2'] } },
      true,
    )

    expect(firestoreModule.setDoc).toHaveBeenCalledTimes(1)
    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/2026-10' },
      expect.objectContaining({
        month: '2026-10',
        assignments: { '2026-10-05': ['p2'] },
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(success).toBe(true)
  })

  it('deve realizar a busca consolidada com pullAllFromCloud no clique do botão em configurações', async () => {
    CloudSyncService.setSyncEnabled(true)

    const result = await CloudSyncService.pullAllFromCloud('2026-10', true)

    expect(firestoreModule.getDoc).toHaveBeenCalled()
    expect(result.monthData).toBeDefined()
    expect(result.monthData?.month).toBe('2026-10')
  })

  it('deve sincronizar pessoas no Firestore via savePeopleToCloud quando o toggle estiver ativo', async () => {
    CloudSyncService.setSyncEnabled(true)

    const success = await CloudSyncService.savePeopleToCloud(
      [{ id: 'p1', name: 'Dr. Teste', color: '#6366f1', active: true }],
      true,
    )

    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/_master_people' },
      expect.objectContaining({
        persons: [{ id: 'p1', name: 'Dr. Teste', color: '#6366f1', active: true }],
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(success).toBe(true)
  })

  it('deve sincronizar endereços no Firestore via saveAddressesToCloud limpando propriedades undefined', async () => {
    CloudSyncService.setSyncEnabled(true)

    const success = await CloudSyncService.saveAddressesToCloud(
      [
        {
          id: 'addr-1',
          name: 'Consultório Central',
          street: 'Av. Paulista',
          number: '1000',
          complement: undefined,
          neighborhood: undefined,
          city: 'São Paulo',
        },
      ],
      true,
    )

    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/_master_addresses' },
      expect.objectContaining({
        addresses: [
          {
            id: 'addr-1',
            name: 'Consultório Central',
            street: 'Av. Paulista',
            number: '1000',
            city: 'São Paulo',
          },
        ],
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(success).toBe(true)
  })
})
