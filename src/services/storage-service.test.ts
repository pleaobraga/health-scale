import { describe, it, expect, beforeEach } from 'vitest';

import { StorageService } from './storage-service';

import type { Person, CalendarEvent, MonthlyAvailability } from '../types';

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

  it('deve gerenciar perfis de convidados e datasets isolados', () => {
    const profiles = [
      {
        id: 'guest_1',
        name: 'Dr. Roberto',
        createdAt: '2026-10-18T10:00:00Z',
        lastActiveAt: '2026-10-18T10:00:00Z',
      },
    ];

    StorageService.saveGuestProfiles(profiles);
    expect(StorageService.getGuestProfiles()).toEqual(profiles);

    StorageService.setActiveGuestId('guest_1');
    expect(StorageService.getActiveGuestId()).toBe('guest_1');

    // Save dataset for guest_1
    const dataset = {
      persons: [{ id: 'p1', name: 'Dr. Roberto', color: '#10b981', active: true }],
      availabilities: [],
      assignments: { '2026-10-15': ['p1'] },
      events: [],
      monthParticipants: { '2026-10': ['p1'] },
    };

    StorageService.saveGuestDataset('guest_1', dataset);
    expect(StorageService.getGuestDataset('guest_1')).toEqual(dataset);

    // Test restoring dataset
    StorageService.resetToDefault();
    expect(StorageService.getPersons()).toEqual([]);

    StorageService.restoreDataset(dataset);
    expect(StorageService.getPersons()).toHaveLength(1);
    expect(StorageService.getAssignments()['2026-10-15']).toEqual(['p1']);

    // Test deleting dataset
    StorageService.deleteGuestDataset('guest_1');
    expect(StorageService.getGuestDataset('guest_1')).toBeNull();

    StorageService.setActiveGuestId(null);
    expect(StorageService.getActiveGuestId()).toBeNull();
  });
});


