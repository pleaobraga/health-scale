import { describe, it, expect } from 'vitest';

import { PersonService, canDeletePerson, hasScheduleHistory } from './personService';

import type { Person } from '../types';

describe('PersonService', () => {
  const mockAssignments: Record<string, string[]> = {
    '2026-10-01': ['p1', 'p2'],
    '2026-10-02': ['p2'],
    '2026-11-15': ['p3'],
  };

  describe('hasScheduleHistory & canDeletePerson', () => {
    it('deve identificar que pessoa com alocações possui histórico e NÃO pode ser excluída', () => {
      expect(hasScheduleHistory('p1', mockAssignments)).toBe(true);
      expect(canDeletePerson('p1', mockAssignments)).toBe(false);
      expect(PersonService.canDeletePerson('p2', mockAssignments)).toBe(false);
      expect(PersonService.canDeletePerson('p3', mockAssignments)).toBe(false);
    });

    it('deve identificar que pessoa sem nenhuma alocação (0 vínculos) PODE ser excluída definitivamente', () => {
      expect(hasScheduleHistory('p_sem_escala', mockAssignments)).toBe(false);
      expect(canDeletePerson('p_sem_escala', mockAssignments)).toBe(true);
      expect(PersonService.canDeletePerson('p_sem_escala', mockAssignments)).toBe(true);
    });

    it('deve retornar true em canDeletePerson quando assignments for vazio ou inválido', () => {
      expect(canDeletePerson('p1', {})).toBe(true);
      expect(hasScheduleHistory('p1', {})).toBe(false);
    });
  });

  describe('getActivePersons', () => {
    it('deve filtrar e retornar apenas profissionais com active !== false', () => {
      const persons: Person[] = [
        { id: '1', name: 'Ativo 1', color: '#3b82f6', active: true },
        { id: '2', name: 'Inativo 1', color: '#10b981', active: false },
        { id: '3', name: 'Ativo Default', color: '#8b5cf6', active: true },
      ];

      const active = PersonService.getActivePersons(persons);
      expect(active).toHaveLength(2);
      expect(active.map((p) => p.id)).toEqual(['1', '3']);
    });
  });
});

