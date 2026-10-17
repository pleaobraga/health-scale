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

  it('deve limpar todas as escalas de um mês com clearMonthAssignments', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';

    // Garante que existem escalas para o mês
    store.addPersonToDay('2026-10-01', 'p1');
    store.addPersonToDay('2026-10-02', 'p2');
    store.addPersonToDay('2026-11-01', 'p1'); // Outro mês

    expect(useScheduleStore.getState().assignments['2026-10-01']).toBeDefined();
    expect(useScheduleStore.getState().assignments['2026-10-02']).toBeDefined();
    expect(useScheduleStore.getState().assignments['2026-11-01']).toBeDefined();

    store.clearMonthAssignments(month);

    const assignmentsAfter = useScheduleStore.getState().assignments;
    expect(assignmentsAfter['2026-10-01']).toBeUndefined();
    expect(assignmentsAfter['2026-10-02']).toBeUndefined();
    // Mês seguinte deve ser preservado
    expect(assignmentsAfter['2026-11-01']).toBeDefined();
  });

  it('deve inserir todos os dias de uma pessoa no calendário com insertAllPersonDaysToMonth', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';
    const personId = store.persons[0].id;

    // Configura disponibilidade específica (dias 5 e 12)
    store.setPersonAvailability(personId, month, [5, 12]);

    // Limpa o mês antes
    store.clearMonthAssignments(month);

    // Insere todos os dias da pessoa no mês
    store.insertAllPersonDaysToMonth(personId, month);

    const assignments = useScheduleStore.getState().assignments;
    expect(assignments['2026-10-05']).toContain(personId);
    expect(assignments['2026-10-12']).toContain(personId);
    expect(assignments['2026-10-06']).toBeUndefined();
  });

  it('deve reverter alterações no calendário ao sair do modo de edição sem salvar', () => {
    const store = useScheduleStore.getState();
    const month = '2026-10';

    // Salva estado inicial limpo
    store.clearMonthAssignments(month);
    store.saveSchedule();

    const savedState = { ...useScheduleStore.getState().assignments };
    expect(savedState['2026-10-20']).toBeUndefined();

    // Entra no modo de edição
    store.setEditMode(true);
    expect(useScheduleStore.getState().isEditMode).toBe(true);

    // Faz alterações na escala
    store.addPersonToDay('2026-10-20', 'p1');
    expect(useScheduleStore.getState().assignments['2026-10-20']).toEqual(['p1']);
    expect(useScheduleStore.getState().hasUnsavedChanges).toBe(true);

    // Tenta sair do modo de edição SEM salvar
    store.setEditMode(false);

    // Deve abrir o modal de aviso e manter o modo de edição ativo para decisão do usuário
    expect(useScheduleStore.getState().isUnsavedModalOpen).toBe(true);
    expect(useScheduleStore.getState().isEditMode).toBe(true);

    // Ao descartar as alterações pelo modal
    store.discardChanges();
    useScheduleStore.setState({ isEditMode: false });

    // Deve ter revertido ao estado salvo e saído do modo de edição
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

    // Ao sair do modo de edição agora, a alteração permanece
    store.setEditMode(false);
    expect(useScheduleStore.getState().assignments['2026-10-28']).toEqual(['p1']);
  });
});

