import { Person } from '../types';

export class PersonService {
  /**
   * Varre o mapeamento de assignments (em todos os meses salvos) para verificar se a pessoa possui histórico de alocações.
   * @param personId ID da pessoa
   * @param assignments Dicionário de assignments {'YYYY-MM-DD': string[]}
   * @returns boolean true se estiver alocado em 1 ou mais dias/turnos
   */
  static hasScheduleHistory(personId: string, assignments: Record<string, string[]>): boolean {
    if (!assignments || typeof assignments !== 'object') return false;
    return Object.values(assignments).some(
      (assignedIds) => Array.isArray(assignedIds) && assignedIds.includes(personId)
    );
  }

  /**
   * Verifica se a pessoa pode ser excluída definitivamente do sistema.
   * A exclusão definitiva NÃO é permitida se a pessoa possuir qualquer histórico na escala.
   * @param personId ID da pessoa
   * @param assignments Dicionário global de assignments
   * @returns boolean true se não possuir histórico (0 alocações)
   */
  static canDeletePerson(personId: string, assignments: Record<string, string[]>): boolean {
    return !this.hasScheduleHistory(personId, assignments);
  }

  /**
   * Retorna apenas os profissionais com active === true
   */
  static getActivePersons(persons: Person[]): Person[] {
    return persons.filter((p) => p.active !== false);
  }
}

// Funções utilitárias exportadas diretamente
export const canDeletePerson = (personId: string, assignments: Record<string, string[]>): boolean =>
  PersonService.canDeletePerson(personId, assignments);

export const hasScheduleHistory = (personId: string, assignments: Record<string, string[]>): boolean =>
  PersonService.hasScheduleHistory(personId, assignments);

