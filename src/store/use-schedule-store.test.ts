import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useScheduleStore } from './use-schedule-store';

describe('useScheduleStore - Gerenciamento de Estado Global', () => {
  beforeEach(() => {
    localStorage.clear();
    useScheduleStore.setState({
      currentMonth: '2026-10',
      isEditMode: false,
      highlightedPersonId: null,
      persons: [{ id: 'p1', name: 'Dr. Teste', color: '#1d4ed8' }],
      monthParticipants: { '2026-10': ['p1'] },
      availabilities: [],
      assignments: {},
      savedAssignments: {},
      events: [],
      hasUnsavedChanges: false,
      isUnsavedModalOpen: false,
      hasValidated: false,
      validationErrors: [],
    });
  });


  it('deve navegar entre meses (anterior, próximo e direto)', () => {
    const store = useScheduleStore.getState();
    expect(store.currentMonth).toBe('2026-10');

    store.goToNextMonth();
    expect(useScheduleStore.getState().currentMonth).toBe('2026-11');

    store.goToPreviousMonth();
    expect(useScheduleStore.getState().currentMonth).toBe('2026-10');

    store.setCurrentMonth('2027-05');
    expect(useScheduleStore.getState().currentMonth).toBe('2027-05');
  });

  it('deve alternar modo de edição e visualização', () => {
    const store = useScheduleStore.getState();
    expect(store.isEditMode).toBe(false);

    store.toggleEditMode();
    expect(useScheduleStore.getState().isEditMode).toBe(true);

    store.toggleEditMode();
    expect(useScheduleStore.getState().isEditMode).toBe(false);
  });

  it('deve alternar o destaque de disponibilidade de um membro', () => {
    const store = useScheduleStore.getState();
    expect(store.highlightedPersonId).toBeNull();

    store.setHighlightedPersonId('p1');
    expect(useScheduleStore.getState().highlightedPersonId).toBe('p1');

    // Clicking same member again should deactivate highlight
    store.setHighlightedPersonId('p1');
    expect(useScheduleStore.getState().highlightedPersonId).toBeNull();
  });

  it('deve adicionar, atualizar e excluir uma pessoa', () => {
    const store = useScheduleStore.getState();
    const initialCount = store.persons.length;

    // Add
    store.addPerson('Enfermeiro Teste', '#0ea5e9', [1, 2, 3]);
    const afterAdd = useScheduleStore.getState().persons;
    expect(afterAdd.length).toBe(initialCount + 1);

    const addedPerson = afterAdd.find((p) => p.name === 'Enfermeiro Teste');
    expect(addedPerson).toBeDefined();

    expect(addedPerson?.active).toBe(true);

    // Delete person without assignments
    const deleteResult = store.deletePerson(addedPerson!.id);
    expect(deleteResult).toBe(true);
    const afterDelete = useScheduleStore.getState().persons;
    expect(afterDelete.length).toBe(initialCount);
  });

  it('deve proteger integridade referencial: bloquear exclusão se houver escala vinculada e permitir desativação/reativação', () => {
    const store = useScheduleStore.getState();
    const personId = store.persons[0].id;
    const dateStr = '2026-10-10';

    // Link person to schedule day
    store.addPersonToDay(dateStr, personId);
    expect(store.canDeletePerson(personId)).toBe(false);

    // Attempting to delete must fail and return false (warns about referential integrity)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const deleteSuccess = store.deletePerson(personId);
    expect(deleteSuccess).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Não é possível excluir o profissional')
    );
    warnSpy.mockRestore();
    expect(useScheduleStore.getState().persons.some((p) => p.id === personId)).toBe(true);

    // Deactivate person
    store.deactivatePerson(personId);
    let person = useScheduleStore.getState().persons.find((p) => p.id === personId);
    expect(person?.active).toBe(false);

    // Schedule history remains intact
    expect(useScheduleStore.getState().assignments[dateStr]).toContain(personId);

    // Reactivate person
    store.reactivatePerson(personId);
    person = useScheduleStore.getState().persons.find((p) => p.id === personId);
    expect(person?.active).toBe(true);

    // Remove assignment and verify canDeletePerson is now true
    store.removePersonFromDay(dateStr, personId);
    expect(store.canDeletePerson(personId)).toBe(true);
  });

  it('deve manipular disponibilidades individuais e atalhos rápidos (pares, ímpares, limpar)', () => {
    const store = useScheduleStore.getState();
    const personId = store.persons[0].id;
    const month = '2026-10';

    // Shortcut: even days
    store.setQuickAvailability(personId, month, 'even');
    let avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.every((d) => d % 2 === 0)).toBe(true);

    // Shortcut: odd days
    store.setQuickAvailability(personId, month, 'odd');
    avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.every((d) => d % 2 !== 0)).toBe(true);

    // Shortcut: clear
    store.setQuickAvailability(personId, month, 'clear');
    avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.length).toBe(0);

    // Toggle individual day
    store.togglePersonDayAvailability(personId, month, 15);
    avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays).toContain(15);
  });

  it('deve adicionar e remover pessoa de um dia da escala', () => {
    const store = useScheduleStore.getState();
    const dateStr = '2026-10-25';

    store.addPersonToDay(dateStr, 'p1');
    expect(useScheduleStore.getState().assignments[dateStr]).toContain('p1');

    store.removePersonFromDay(dateStr, 'p1');
    expect(useScheduleStore.getState().assignments[dateStr]).not.toContain('p1');
  });

  it('deve adicionar e remover eventos do calendário', () => {
    const store = useScheduleStore.getState();
    const initialEventsCount = store.events.length;

    store.addEvent({
      date: '2026-10-15',
      title: 'Plantão Extraordinário',
      time: '19:00',
    });

    const updatedEvents = useScheduleStore.getState().events;
    expect(updatedEvents.length).toBe(initialEventsCount + 1);

    const added = updatedEvents.find((e) => e.title === 'Plantão Extraordinário');
    expect(added).toBeDefined();

    // Update event
    store.updateEvent(added!.id, {
      title: 'Plantão Extraordinário Atualizado',
      time: '20:00',
      description: 'Alterado pelo coordenador',
    });
    const modified = useScheduleStore.getState().events.find((e) => e.id === added!.id);
    expect(modified?.title).toBe('Plantão Extraordinário Atualizado');
    expect(modified?.time).toBe('20:00');
    expect(modified?.description).toBe('Alterado pelo coordenador');

    store.deleteEvent(added!.id);
    expect(useScheduleStore.getState().events.length).toBe(initialEventsCount);
  });

  it('deve disparar a validação e atualizar a lista de erros e status', () => {
    const store = useScheduleStore.getState();
    expect(store.hasValidated).toBe(false);

    const errors = store.validateCurrentSchedule();
    const state = useScheduleStore.getState();

    expect(state.hasValidated).toBe(true);
    expect(state.validationErrors).toEqual(errors);
  });

  it('deve limpar todas as escalas de um mês com clearMonthAssignments', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';

    // Ensures assignments exist for the month
    store.addPersonToDay('2026-10-01', 'p1');
    store.addPersonToDay('2026-10-02', 'p2');
    store.addPersonToDay('2026-11-01', 'p1'); // Other month

    expect(useScheduleStore.getState().assignments['2026-10-01']).toBeDefined();
    expect(useScheduleStore.getState().assignments['2026-10-02']).toBeDefined();
    expect(useScheduleStore.getState().assignments['2026-11-01']).toBeDefined();

    store.clearMonthAssignments(month);

    const assignmentsAfter = useScheduleStore.getState().assignments;
    expect(assignmentsAfter['2026-10-01']).toBeUndefined();
    expect(assignmentsAfter['2026-10-02']).toBeUndefined();
    // Following month should be preserved
    expect(assignmentsAfter['2026-11-01']).toBeDefined();
  });

  it('deve inserir todos os dias de uma pessoa no calendário com insertAllPersonDaysToMonth', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';
    const personId = store.persons[0].id;

    // Set specific availability (days 5 and 12)
    store.setPersonAvailability(personId, month, [5, 12]);

    // Clear month first
    store.clearMonthAssignments(month);

    // Insert all person available days into the month
    store.insertAllPersonDaysToMonth(personId, month);

    const assignments = useScheduleStore.getState().assignments;
    expect(assignments['2026-10-05']).toContain(personId);
    expect(assignments['2026-10-12']).toContain(personId);
    expect(assignments['2026-10-06']).toBeUndefined();
  });

  it('deve reverter alterações no calendário ao sair do modo de edição sem salvar', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';

    // Save clean initial state
    store.clearMonthAssignments(month);
    store.saveSchedule();

    const savedState = { ...useScheduleStore.getState().assignments };
    expect(savedState['2026-10-20']).toBeUndefined();

    // Enter edit mode
    store.setEditMode(true);
    expect(useScheduleStore.getState().isEditMode).toBe(true);

    // Make changes to the schedule
    store.addPersonToDay('2026-10-20', 'p1');
    expect(useScheduleStore.getState().assignments['2026-10-20']).toEqual(['p1']);
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(true);

    // Try to exit edit mode WITHOUT saving
    store.setEditMode(false);

    // Should open warning modal and keep edit mode active for user decision
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(true);
    expect(useScheduleStore.getState().isEditMode).toBe(true);

    // When discarding changes via the modal
    store.discardChanges();
    useScheduleStore.setState({ isEditMode: false });

    // Should have reverted to saved state and exited edit mode
    expect(useScheduleStore.getState().isEditMode).toBe(false);
    expect(useScheduleStore.getState().assignments['2026-10-20']).toBeUndefined();
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('deve reverter alterações ao chamar discardChanges', () => {
    const store = useScheduleStore.getState();
    store.setEditMode(true);
    store.addPersonToDay('2026-10-25', 'p1');
    expect(useScheduleStore.getState().assignments['2026-10-25']).toEqual(['p1']);

    store.discardChanges();
    expect(useScheduleStore.getState().assignments['2026-10-25']).toBeUndefined();
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('deve efetivar e persistir alterações quando saveSchedule for acionado', () => {
    const store = useScheduleStore.getState();
    store.setEditMode(true);
    store.addPersonToDay('2026-10-28', 'p1');

    store.saveSchedule();
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(false);
    expect(useScheduleStore.getState().savedAssignments['2026-10-28']).toEqual(['p1']);

    // When exiting edit mode now, changes remain
    store.setEditMode(false);
    expect(useScheduleStore.getState().assignments['2026-10-28']).toEqual(['p1']);
  });
});

