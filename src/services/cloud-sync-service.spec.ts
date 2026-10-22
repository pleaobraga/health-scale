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
      dayShiftAssignments: undefined,
      monthDailyShifts: undefined,
      monthActiveShifts: undefined,
      monthActiveRules: undefined,
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

  it('deve realizar pullAllFromCloud com sucesso mesmo se o toggle de sync estiver DESLIGADO', async () => {
    CloudSyncService.setSyncEnabled(false)

    const result = await CloudSyncService.pullAllFromCloud('2026-10', true)

    expect(firestoreModule.getDoc).toHaveBeenCalled()
    expect(result.monthData).toBeDefined()
    expect(result.monthData?.month).toBe('2026-10')
    // Verifica que o toggle continua desligado
    expect(CloudSyncService.isSyncEnabled()).toBe(false)
  })

  it('deve executar pushAllToCloud salvando dados locais no Firestore sem alterar nem exigir o toggle de sync', async () => {
    CloudSyncService.setSyncEnabled(false)

    const success = await CloudSyncService.pushAllToCloud(
      '2026-10',
      {
        monthData: { assignments: { '2026-10-01': ['p1'] } },
        persons: [{ id: 'p1', name: 'Dr. Teste', color: '#6366f1', active: true }],
        addresses: [{ id: 'addr-1', name: 'Clínica', street: 'Rua 1', number: '10' }],
      },
      true,
      true,
    )

    expect(success).toBe(true)
    expect(firestoreModule.setDoc).toHaveBeenCalledTimes(3)
    // O toggle de sync não pode ter sido alterado
    expect(CloudSyncService.isSyncEnabled()).toBe(false)
  })

  it('deve sincronizar definições de turnos e regras no Firestore via saveShiftsToCloud e saveRulesToCloud', async () => {
    CloudSyncService.setSyncEnabled(true)

    const shiftsSuccess = await CloudSyncService.saveShiftsToCloud(
      [
        {
          id: 'shift-1',
          name: 'Plantão Diurno',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3b82f6',
          enabledByDefault: true,
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-20T00:00:00.000Z',
        },
      ],
      true,
    )
    expect(shiftsSuccess).toBe(true)
    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/_master_shifts' },
      expect.objectContaining({
        shifts: expect.any(Array),
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )

    const rulesSuccess = await CloudSyncService.saveRulesToCloud(
      [
        {
          id: 'rule-1',
          name: 'Descanso 11h',
          description: 'Regra CLT',
          type: 'MIN_REST_HOURS',
          enabledByDefault: true,
          severity: 'ERROR',
          parameters: { minRestHours: 11 },
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-20T00:00:00.000Z',
        },
      ],
      true,
    )
    expect(rulesSuccess).toBe(true)
    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/_master_rules' },
      expect.objectContaining({
        rules: expect.any(Array),
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
  })

  it('deve incluir turnos e regras no pushAllToCloud quando fornecidos', async () => {
    CloudSyncService.setSyncEnabled(false)

    const success = await CloudSyncService.pushAllToCloud(
      '2026-10',
      {
        monthData: {
          assignments: { '2026-10-01': ['p1'] },
          dayShiftAssignments: { '2026-10-01': { 's1': 'p1' } },
        },
        persons: [{ id: 'p1', name: 'Dr. Teste', color: '#6366f1', active: true }],
        addresses: [],
        shifts: [
          {
            id: 's1',
            name: 'Diurno',
            code: 'D',
            startTime: '07:00',
            durationHours: 12,
            color: '#000',
            enabledByDefault: true,
            createdAt: '2026-10-20T00:00:00.000Z',
            updatedAt: '2026-10-20T00:00:00.000Z',
          },
        ],
        rules: [
          {
            id: 'r1',
            name: 'Regra',
            description: '',
            type: 'CONSECUTIVE_DAYS_LIMIT',
            enabledByDefault: true,
            severity: 'WARNING',
            parameters: { consecutiveDaysLimit: 3 },
            createdAt: '2026-10-20T00:00:00.000Z',
            updatedAt: '2026-10-20T00:00:00.000Z',
          },
        ],
      },
      true,
      true,
    )

    expect(success).toBe(true)
    expect(firestoreModule.setDoc).toHaveBeenCalledTimes(5)
  })

  it('deve salvar documentos na nuvem para todos os meses presentes em monthData (incluindo meses ainda não escalados) durante pushAllToCloud', async () => {
    CloudSyncService.setSyncEnabled(false)

    const success = await CloudSyncService.pushAllToCloud(
      '2026-10',
      {
        monthData: {
          assignments: {},
          monthParticipants: { '2026-11': ['p1'] },
          availabilities: [{ personId: 'p1', month: '2026-11', availableDays: [2, 8] }],
          monthDailyShifts: { '2026-11': { shift_d12: [2, 8] } },
        },
        persons: [{ id: 'p1', name: 'Dra. Marina', color: '#10b981', active: true }],
        addresses: [],
      },
      true,
      true,
    )

    expect(success).toBe(true)
    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/2026-10' },
      expect.objectContaining({
        month: '2026-10',
        monthParticipants: { '2026-11': ['p1'] },
      }),
      { merge: true },
    )
    expect(firestoreModule.setDoc).toHaveBeenCalledWith(
      { path: 'schedules/2026-11' },
      expect.objectContaining({
        month: '2026-11',
        monthParticipants: { '2026-11': ['p1'] },
        monthDailyShifts: { '2026-11': { shift_d12: [2, 8] } },
      }),
      { merge: true },
    )
  })
})
