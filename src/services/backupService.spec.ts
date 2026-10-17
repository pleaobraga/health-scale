import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  exportAppData,
  validateAndParseBackup,
  restoreAppData,
  hasExistingLocalData,
  getBackupFilename,
} from './backupService';
import { StorageService } from './storageService';
import { useScheduleStore } from '../store/useScheduleStore';
import { AppDataSnapshot } from '../types';

describe('BackupService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getBackupFilename', () => {
    it('deve gerar o nome do arquivo no formato escala_backup_YYYY-MM-DD_HHmm.json', () => {
      const fixedDate = new Date(2026, 9, 17, 18, 45); // 2026-10-17 18:45
      const filename = getBackupFilename(fixedDate);
      expect(filename).toBe('escala_backup_2026-10-17_1845.json');
    });
  });

  describe('hasExistingLocalData', () => {
    it('deve retornar false quando o localStorage estiver completamente vazio', async () => {
      const exists = await hasExistingLocalData();
      expect(exists).toBe(false);
    });

    it('deve retornar false quando as chaves existirem porém estiverem vazias', async () => {
      localStorage.setItem('scale_manager_persons_v1', JSON.stringify([]));
      localStorage.setItem('scale_manager_assignments_v1', JSON.stringify({}));
      localStorage.setItem('scale_manager_month_participants_v1', JSON.stringify({}));

      const exists = await hasExistingLocalData();
      expect(exists).toBe(false);
    });

    it('deve retornar true quando houver profissionais salvos no storage', async () => {
      localStorage.setItem(
        'scale_manager_persons_v1',
        JSON.stringify([{ id: 'p1', name: 'Dr. Lucas', color: '#10b981' }])
      );

      const exists = await hasExistingLocalData();
      expect(exists).toBe(true);
    });

    it('deve retornar true quando houver escalas salvas no storage', async () => {
      localStorage.setItem(
        'scale_manager_assignments_v1',
        JSON.stringify({ '2026-10-01': ['p1'] })
      );

      const exists = await hasExistingLocalData();
      expect(exists).toBe(true);
    });

    it('deve retornar true quando houver participantes mensais cadastrados', async () => {
      localStorage.setItem(
        'scale_manager_month_participants_v1',
        JSON.stringify({ '2026-10': ['p1', 'p2'] })
      );

      const exists = await hasExistingLocalData();
      expect(exists).toBe(true);
    });

    it('deve retornar true quando houver eventos cadastrados', async () => {
      localStorage.setItem(
        'scale_manager_events_v1',
        JSON.stringify([{ id: 'e1', date: '2026-10-05', title: 'Plantão' }])
      );

      const exists = await hasExistingLocalData();
      expect(exists).toBe(true);
    });
  });

  describe('exportAppData', () => {
    it('deve disparar o download com o snapshot completo dos dados da aplicação', async () => {
      StorageService.savePersons([{ id: 'p1', name: 'Dra. Camila', color: '#3b82f6' }]);
      StorageService.saveMonthParticipants({ '2026-10': ['p1'] });
      StorageService.saveAssignments({ '2026-10-01': ['p1'] });

      const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
      const revokeObjectURLMock = vi.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      let clicked = false;
      let downloadFilename = '';
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          el.click = () => {
            clicked = true;
            downloadFilename = (el as HTMLAnchorElement).download;
          };
        }
        return el;
      });

      await exportAppData();

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clicked).toBe(true);
      expect(downloadFilename).toMatch(/^escala_backup_\d{4}-\d{2}-\d{2}_\d{4}\.json$/);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('validateAndParseBackup', () => {
    it('deve rejeitar arquivo nulo ou indefinido', async () => {
      await expect(validateAndParseBackup(null as unknown as File)).rejects.toThrow(
        'Nenhum arquivo foi selecionado.'
      );
    });

    it('deve rejeitar arquivo com JSON corrompido ou inválido', async () => {
      const file = new File(['{ invalid json content '], 'backup.json', { type: 'application/json' });
      await expect(validateAndParseBackup(file)).rejects.toThrow(
        'Arquivo de backup inválido: formato JSON corrompido ou ilegível.'
      );
    });

    it('deve rejeitar JSON que não é um objeto', async () => {
      const file = new File(['["item1", "item2"]'], 'backup.json', { type: 'application/json' });
      await expect(validateAndParseBackup(file)).rejects.toThrow(
        'Estrutura do arquivo inválida: o backup deve ser um objeto JSON.'
      );
    });

    it('deve rejeitar JSON sem lista de pessoas', async () => {
      const file = new File([JSON.stringify({ monthParticipants: {} })], 'backup.json', {
        type: 'application/json',
      });
      await expect(validateAndParseBackup(file)).rejects.toThrow(
        'Estrutura do arquivo inválida: campo "people" ausente ou inválido.'
      );
    });

    it('deve rejeitar pessoas com formato inválido (sem id ou name)', async () => {
      const file = new File(
        [JSON.stringify({ people: [{ id: 'p1' }] })],
        'backup.json',
        { type: 'application/json' }
      );
      await expect(validateAndParseBackup(file)).rejects.toThrow(
        'Estrutura do arquivo inválida: profissional com formato incorreto (id ou name ausente).'
      );
    });

    it('deve validar e retornar snapshot normalizado preservando metadados', async () => {
      const payload = {
        exportedAt: '2026-10-17T12:00:00.000Z',
        people: [{ id: 'p1', name: 'Dr. Roberto', color: '#10b981', specialty: 'Cardiologia' }],
        monthParticipants: { '2026-10': ['p1'] },
        availabilities: [{ personId: 'p1', month: '2026-10', availableDays: [1, 2, 3] }],
        assignments: { '2026-10-01': ['p1'] },
        events: [{ id: 'ev-1', date: '2026-10-01', title: 'Reunião Inicial' }],
        customSetting: 'hospital_central',
      };

      const file = new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });
      const parsed = await validateAndParseBackup(file);

      expect(parsed.people).toHaveLength(1);
      expect(parsed.people[0].name).toBe('Dr. Roberto');
      expect((parsed.people[0] as Record<string, unknown>).specialty).toBe('Cardiologia');
      expect(parsed.monthParticipants['2026-10']).toEqual(['p1']);
      expect(parsed.assignments['2026-10-01']).toEqual(['p1']);
      expect(parsed.events).toHaveLength(1);
      expect((parsed as Record<string, unknown>).customSetting).toBe('hospital_central');
    });

    it('deve aceitar fallback para campo "persons" caso "people" venha com nome alternativo', async () => {
      const payload = {
        persons: [{ id: 'p2', name: 'Dra. Julia', color: '#ec4899' }],
      };

      const file = new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });
      const parsed = await validateAndParseBackup(file);

      expect(parsed.people).toHaveLength(1);
      expect(parsed.people[0].name).toBe('Dra. Julia');
    });
  });

  describe('restoreAppData', () => {
    it('deve persistir dados no StorageService e atualizar o store redirecionando para o calendário', async () => {
      useScheduleStore.setState({ currentView: 'import', isEditMode: true });

      const snapshot: AppDataSnapshot = {
        exportedAt: '2026-10-17T15:00:00.000Z',
        people: [{ id: 'p_restore', name: 'Enf. Mariana', color: '#8b5cf6' }],
        monthParticipants: { '2026-11': ['p_restore'] },
        availabilities: [{ personId: 'p_restore', month: '2026-11', availableDays: [5, 10] }],
        assignments: { '2026-11-05': ['p_restore'] },
        events: [{ id: 'ev_11', date: '2026-11-05', title: 'Abertura Turno' }],
        theme: 'dark',
      };

      await restoreAppData(snapshot);

      // Verify StorageService
      const loadedPersons = StorageService.getPersons();
      expect(loadedPersons.find((p) => p.id === 'p_restore')).toBeDefined();

      const loadedParticipants = StorageService.getMonthParticipants();
      expect(loadedParticipants['2026-11']).toEqual(['p_restore']);

      // Verify store
      const storeState = useScheduleStore.getState();
      expect(storeState.currentView).toBe('calendar');
      expect(storeState.isEditMode).toBe(false);
      expect(storeState.hasUnsavedChanges).toBe(false);
      expect(storeState.persons).toHaveLength(1);
      expect(storeState.persons[0].name).toBe('Enf. Mariana');
      expect(storeState.isDarkMode).toBe(true);
    });
  });
});
