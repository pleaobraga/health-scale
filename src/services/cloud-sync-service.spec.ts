import * as firestoreModule from 'firebase/firestore'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  CloudSyncService,
  CLOUD_SYNC_STORAGE_KEY,
  MONTH_DOC_SCHEMA_VERSION,
  getMonthsInScheduleData,
  mergeMonthDocs,
  sliceMonthScheduleData,
} from './cloud-sync-service'
import { StorageService } from './storage-service'

const mockAuth = vi.hoisted(() => ({ currentUser: null as { uid: string } | null }))

vi.mock('./firebase', () => ({ auth: mockAuth, db: {} }))

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof firestoreModule>()
  return {
    ...actual,
    doc: vi.fn().mockImplementation((_db, collection, id) => ({ path: `${collection}/${id}` })),
    collection: vi.fn().mockImplementation((_db, path) => ({ path })),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    }),
    getDocsFromServer: vi.fn().mockResolvedValue({ docs: [] }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vi.fn().mockReturnValue('mock-server-timestamp'),
  }
})

const mockScheduleDocs = (docs: Record<string, Record<string, unknown>>) => {
  vi.mocked(firestoreModule.getDocsFromServer).mockResolvedValueOnce({
    docs: Object.entries(docs).map(([id, data]) => ({ id, data: () => data })),
  } as unknown as firestoreModule.QuerySnapshot)
}

const timestamp = (millis: number) => ({ toMillis: () => millis })

const fullDataset = {
  assignments: { '2026-10-01': ['p1'], '2026-11-03': ['p2'] },
  dayShiftAssignments: { '2026-10-01': { shift_d12: 'p1' } },
  monthParticipants: { '2026-10': ['p1'], '2026-11': ['p2'] },
  availabilities: [
    { personId: 'p1', month: '2026-10', availableDays: [1] },
    { personId: 'p2', month: '2026-11', availableDays: [3] },
  ],
  events: [
    { id: 'e1', date: '2026-10-09', title: 'Reunião' },
    { id: 'e2', date: '2026-11-20', title: 'Treinamento' },
  ],
  monthDailyShifts: { '2026-11': { shift_d12: [3] } },
  monthActiveShifts: { '2026-10': ['shift_d12'] },
  monthActiveRules: { '2026-10': ['rule_1'] },
}

describe('CloudSyncService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockAuth.currentUser = null
    CloudSyncService.clearCachedAdminStatus()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('toggle de sincronização', () => {
    it('deve gerenciar o toggle no localStorage', () => {
      expect(CloudSyncService.isSyncEnabled()).toBe(false)

      CloudSyncService.setSyncEnabled(true)
      expect(CloudSyncService.isSyncEnabled()).toBe(true)

      CloudSyncService.setSyncEnabled(false)
      expect(CloudSyncService.isSyncEnabled()).toBe(false)
    })

    it('deve guardar o toggle separadamente para cada conta', () => {
      StorageService.setActiveUserId('admin_a')
      CloudSyncService.setSyncEnabled(true)
      expect(localStorage.getItem(`${CLOUD_SYNC_STORAGE_KEY}_admin_a`)).toBe('true')

      StorageService.setActiveUserId('admin_b')
      expect(CloudSyncService.isSyncEnabled()).toBe(false)

      StorageService.setActiveUserId('admin_a')
      expect(CloudSyncService.isSyncEnabled()).toBe(true)
    })

    it('deve migrar o toggle antigo (global do dispositivo) para a primeira conta que o ler', () => {
      localStorage.setItem(CLOUD_SYNC_STORAGE_KEY, 'true')
      StorageService.setActiveUserId('admin_a')

      expect(CloudSyncService.isSyncEnabled()).toBe(true)
      expect(localStorage.getItem(`${CLOUD_SYNC_STORAGE_KEY}_admin_a`)).toBe('true')
      expect(localStorage.getItem(CLOUD_SYNC_STORAGE_KEY)).toBeNull()

      StorageService.setActiveUserId('admin_b')
      expect(CloudSyncService.isSyncEnabled()).toBe(false)
    })
  })

  describe('verificação de administrador', () => {
    it('deve reutilizar o papel em cache em vez de ler o Firestore a cada gravação', async () => {
      mockAuth.currentUser = { uid: 'u1' }
      CloudSyncService.setCachedAdminStatus('u1', true)

      expect(await CloudSyncService.isCurrentUserAdmin()).toBe(true)
      expect(firestoreModule.getDoc).not.toHaveBeenCalled()
    })

    it('deve buscar o papel no Firestore uma única vez quando não houver cache', async () => {
      mockAuth.currentUser = { uid: 'u1' }

      expect(await CloudSyncService.isCurrentUserAdmin()).toBe(true)
      expect(await CloudSyncService.isCurrentUserAdmin()).toBe(true)
      expect(firestoreModule.getDoc).toHaveBeenCalledTimes(1)
    })
  })

  describe('helpers de documentos mensais', () => {
    it('deve listar todos os meses referenciados pelo dataset', () => {
      expect(getMonthsInScheduleData(fullDataset)).toEqual(['2026-10', '2026-11'])
    })

    it('deve extrair apenas os dados do mês informado', () => {
      expect(sliceMonthScheduleData(fullDataset, '2026-11')).toEqual({
        assignments: { '2026-11-03': ['p2'] },
        dayShiftAssignments: {},
        monthParticipants: { '2026-11': ['p2'] },
        monthDailyShifts: { '2026-11': { shift_d12: [3] } },
        monthActiveShifts: {},
        monthActiveRules: {},
        availabilities: [{ personId: 'p2', month: '2026-11', availableDays: [3] }],
        events: [{ id: 'e2', date: '2026-11-20', title: 'Treinamento' }],
      })
    })

    it('deve usar o documento legado mais recente como base e aplicar por cima os meses no formato novo', () => {
      const merged = mergeMonthDocs([
        {
          month: '2026-09',
          updatedAt: timestamp(1),
          assignments: { '2026-09-01': ['velho'] },
        },
        {
          month: '2026-10',
          updatedAt: timestamp(2),
          assignments: { '2026-09-01': ['p1'], '2026-10-01': ['p1'], '2026-10-02': ['p1'] },
          monthParticipants: { '2026-09': ['p1'], '2026-10': ['p1'] },
        },
        {
          month: '2026-10',
          schemaVersion: MONTH_DOC_SCHEMA_VERSION,
          assignments: { '2026-10-01': ['p2'] },
          monthParticipants: { '2026-10': ['p2'] },
        },
      ])

      // 2026-09 vem do legado mais recente; 2026-10 é substituído inteiro (o dia 02 foi removido)
      expect(merged?.assignments).toEqual({ '2026-09-01': ['p1'], '2026-10-01': ['p2'] })
      expect(merged?.monthParticipants).toEqual({ '2026-09': ['p1'], '2026-10': ['p2'] })
    })

    it('deve retornar null quando não houver documentos mensais', () => {
      expect(mergeMonthDocs([])).toBeNull()
    })
  })

  describe('gravação', () => {
    it('NÃO deve salvar dados no Firestore se o toggle estiver DESLIGADO', async () => {
      const result = await CloudSyncService.saveMonthToCloud('2026-10', fullDataset, true)
      expect(result).toBe(false)
      expect(firestoreModule.setDoc).not.toHaveBeenCalled()
    })

    it('NÃO deve salvar dados no Firestore se o usuário for não-admin', async () => {
      CloudSyncService.setSyncEnabled(true)
      const result = await CloudSyncService.saveMonthToCloud('2026-10', fullDataset, false)
      expect(result).toBe(false)
      expect(firestoreModule.setDoc).not.toHaveBeenCalled()
    })

    it('deve substituir o documento do mês (sem merge) contendo apenas os dados daquele mês', async () => {
      CloudSyncService.setSyncEnabled(true)

      const result = await CloudSyncService.saveMonthToCloud('2026-10', fullDataset, true)

      expect(result).toBe(true)
      expect(firestoreModule.setDoc).toHaveBeenCalledTimes(1)
      expect(firestoreModule.setDoc).toHaveBeenCalledWith(
        { path: 'schedules/2026-10' },
        {
          ...sliceMonthScheduleData(fullDataset, '2026-10'),
          month: '2026-10',
          schemaVersion: MONTH_DOC_SCHEMA_VERSION,
          updatedAt: 'mock-server-timestamp',
        },
      )
    })

    it('deve sincronizar listas mestras limpando propriedades undefined', async () => {
      CloudSyncService.setSyncEnabled(true)

      const result = await CloudSyncService.saveAddressesToCloud(
        [{ id: 'a1', label: 'Clínica', street: 'Rua A', number: undefined } as never],
        true,
      )

      expect(result).toBe(true)
      expect(firestoreModule.setDoc).toHaveBeenCalledWith(
        { path: 'schedules/_master_addresses' },
        {
          addresses: [{ id: 'a1', label: 'Clínica', street: 'Rua A' }],
          updatedAt: 'mock-server-timestamp',
        },
      )
    })

    it('deve retornar false quando o Firestore rejeitar a gravação', async () => {
      CloudSyncService.setSyncEnabled(true)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(firestoreModule.setDoc).mockRejectedValueOnce(new Error('permission-denied'))

      expect(await CloudSyncService.savePeopleToCloud([], true)).toBe(false)
    })

    it('não deve aguardar a confirmação do servidor quando estiver offline (gravação fica na fila)', async () => {
      CloudSyncService.setSyncEnabled(true)
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      vi.mocked(firestoreModule.setDoc).mockReturnValueOnce(new Promise<void>(() => {}))

      const result = await CloudSyncService.saveMonthToCloud('2026-10', fullDataset, true)

      expect(result).toBe(true)
      expect(firestoreModule.setDoc).toHaveBeenCalledTimes(1)
    })
  })

  describe('pullAllFromCloud', () => {
    it('deve juntar todos os meses e as listas mestras lidas direto do servidor, mesmo com o toggle DESLIGADO', async () => {
      mockScheduleDocs({
        '2026-10': {
          schemaVersion: MONTH_DOC_SCHEMA_VERSION,
          ...sliceMonthScheduleData(fullDataset, '2026-10'),
        },
        '2026-11': {
          schemaVersion: MONTH_DOC_SCHEMA_VERSION,
          ...sliceMonthScheduleData(fullDataset, '2026-11'),
        },
        _master_people: { persons: [{ id: 'p1', name: 'Dra. Marina', color: '#10b981' }] },
        _master_addresses: { addresses: [] },
        _master_shifts: { shifts: [{ id: 'shift_d12' }] },
      })

      const result = await CloudSyncService.pullAllFromCloud(true)

      expect(result.status).toBe('ok')
      expect(result.monthData?.assignments).toEqual(fullDataset.assignments)
      expect(result.monthData?.events).toEqual(fullDataset.events)
      expect(result.persons).toEqual([{ id: 'p1', name: 'Dra. Marina', color: '#10b981' }])
      expect(result.addresses).toEqual([])
      expect(result.shifts).toEqual([{ id: 'shift_d12' }])
      expect(result.rules).toBeNull()
      expect(firestoreModule.getDoc).not.toHaveBeenCalled()
    })

    it('NÃO deve buscar dados para usuários comuns (não-admin)', async () => {
      const result = await CloudSyncService.pullAllFromCloud(false)
      expect(result.status).toBe('unauthorized')
      expect(firestoreModule.getDocsFromServer).not.toHaveBeenCalled()
    })

    it('deve retornar offline sem usar o cache local quando não houver conexão', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

      const result = await CloudSyncService.pullAllFromCloud(true)

      expect(result.status).toBe('offline')
      expect(result.monthData).toBeNull()
      expect(firestoreModule.getDocsFromServer).not.toHaveBeenCalled()
    })

    it('deve retornar offline quando o servidor estiver indisponível', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(firestoreModule.getDocsFromServer).mockRejectedValueOnce({ code: 'unavailable' })

      const result = await CloudSyncService.pullAllFromCloud(true)
      expect(result.status).toBe('offline')
    })
  })

  describe('pushAllToCloud', () => {
    it('deve gravar cada mês local, limpar meses que só existem na nuvem e enviar as listas mestras sem exigir o toggle', async () => {
      mockScheduleDocs({ '2026-08': { assignments: { '2026-08-01': ['p9'] } }, _master_people: {} })

      const success = await CloudSyncService.pushAllToCloud(
        {
          monthData: fullDataset,
          persons: [{ id: 'p1', name: 'Dra. Marina', color: '#10b981', active: true }],
          addresses: [],
          shifts: [],
          rules: [],
        },
        true,
        true,
        ['2026-12'],
      )

      expect(success).toBe(true)
      const savedPaths = vi
        .mocked(firestoreModule.setDoc)
        .mock.calls.map(([ref]) => (ref as unknown as { path: string }).path)
      expect(savedPaths.sort()).toEqual([
        'schedules/2026-08',
        'schedules/2026-10',
        'schedules/2026-11',
        'schedules/2026-12',
        'schedules/_master_addresses',
        'schedules/_master_people',
        'schedules/_master_rules',
        'schedules/_master_shifts',
      ])
      expect(firestoreModule.setDoc).toHaveBeenCalledWith(
        { path: 'schedules/2026-08' },
        expect.objectContaining({ assignments: {}, schemaVersion: MONTH_DOC_SCHEMA_VERSION }),
      )
      expect(CloudSyncService.isSyncEnabled()).toBe(false)
    })

    it('NÃO deve enviar nada para usuários não-admin', async () => {
      const success = await CloudSyncService.pushAllToCloud(
        { monthData: fullDataset, persons: [], addresses: [] },
        false,
      )
      expect(success).toBe(false)
      expect(firestoreModule.setDoc).not.toHaveBeenCalled()
    })
  })
})
