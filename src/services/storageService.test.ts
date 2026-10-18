import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storageService';
import { Person, CalendarEvent, MonthlyAvailability } from '../types';

describe('StorageService - Persistência Local-First', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar lista vazia caso o storage esteja vazio', () => {
    const persons = StorageService.getPersons();
    expect(persons).toEqual([]);
  });


  it('deve salvar e recuperar pessoas atualizadas garantindo active padrão true', () => {
    const newPersons: Person[] = [
      { id: 'custom-1', name: 'Dr. Teste Silva', color: '#ef4444', active: true },
    ];
    StorageService.savePersons(newPersons);

    const loaded = StorageService.getPersons();
    expect(loaded).toEqual(newPersons);
    expect(loaded[0].active).toBe(true);
  });

  it('deve persistir e recuperar disponibilidades mensais', () => {
    const sampleAvail: MonthlyAvailability[] = [
      { personId: 'p1', month: '2026-10', availableDays: [5, 10, 15] },
    ];
    StorageService.saveAvailabilities(sampleAvail);

    const loaded = StorageService.getAvailabilities();
    expect(loaded).toEqual(sampleAvail);
  });

  it('deve persistir e recuperar escalas do calendário', () => {
    const sampleAssignments: Record<string, string[]> = {
      '2026-10-01': ['p1'],
      '2026-10-02': ['p2'],
    };
    StorageService.saveAssignments(sampleAssignments);

    const loaded = StorageService.getAssignments();
    expect(loaded).toEqual(sampleAssignments);
  });

  it('deve persistir e recuperar eventos do calendário', () => {
    const sampleEvents: CalendarEvent[] = [
      { id: 'ev-test', date: '2026-10-20', title: 'Reunião de Escala' },
    ];
    StorageService.saveEvents(sampleEvents);

    const loaded = StorageService.getEvents();
    expect(loaded).toEqual(sampleEvents);
  });

  it('deve limpar dados ao chamar resetToDefault', () => {
    // Modify data
    StorageService.savePersons([{ id: 'tmp', name: 'Temporário', color: '#000000' }]);
    expect(StorageService.getPersons()[0].name).toBe('Temporário');

    // Execute reset
    StorageService.resetToDefault();

    // When reloading, should return empty
    const reloaded = StorageService.getPersons();
    expect(reloaded).toEqual([]);
  });


  it('deve persistir e recuperar participantes mensais', () => {
    const participants = { '2026-10': ['p1', 'p2'] };
    StorageService.saveMonthParticipants(participants);

    const loaded = StorageService.getMonthParticipants();
    expect(loaded).toEqual(participants);
  });
});

