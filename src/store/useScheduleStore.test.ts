import { describe, it, expect, beforeEach } from 'vitest';
import { useScheduleStore } from './useScheduleStore';

describe('useScheduleStore - Gerenciamento de Estado Global', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state to initial
    const store = useScheduleStore.getState();
    store.setCurrentMonth('2026-10');
    store.setEditMode(false);
    store.setHighlightedPersonId(null);
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

    // Ao clicar no mesmo membro, deve desativar
    store.setHighlightedPersonId('p1');
    expect(useScheduleStore.getState().highlightedPersonId).toBeNull();
  });

  it('deve adicionar, atualizar e excluir uma pessoa', () => {
    const store = useScheduleStore.getState();
    const initialCount = store.persons.length;

    // Adicionar
    store.addPerson('Enfermeiro Teste', '#0ea5e9', [1, 2, 3]);
    const afterAdd = useScheduleStore.getState().persons;
    expect(afterAdd.length).toBe(initialCount + 1);

    const addedPerson = afterAdd.find((p) => p.name === 'Enfermeiro Teste');
    expect(addedPerson).toBeDefined();

    // Atualizar
    store.updatePerson(addedPerson!.id, 'Enf. Teste Atualizado', '#10b981');
    const updatedPerson = useScheduleStore.getState().persons.find((p) => p.id === addedPerson!.id);
    expect(updatedPerson?.name).toBe('Enf. Teste Atualizado');
    expect(updatedPerson?.color).toBe('#10b981');

    // Excluir
    store.deletePerson(addedPerson!.id);
    const afterDelete = useScheduleStore.getState().persons;
    expect(afterDelete.length).toBe(initialCount);
  });

  it('deve manipular disponibilidades individuais e atalhos rápidos (pares, ímpares, limpar)', () => {
    const store = useScheduleStore.getState();
    const personId = store.persons[0].id;
    const month = '2026-10';

    // Atalho: dias pares
    store.setQuickAvailability(personId, month, 'even');
    let avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.every((d) => d % 2 === 0)).toBe(true);

    // Atalho: dias ímpares
    store.setQuickAvailability(personId, month, 'odd');
    avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.every((d) => d % 2 !== 0)).toBe(true);

    // Atalho: limpar
    store.setQuickAvailability(personId, month, 'clear');
    avail = useScheduleStore.getState().availabilities.find(
      (a) => a.personId === personId && a.month === month
    );
    expect(avail?.availableDays.length).toBe(0);

    // Toggle de dia individual
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
});

