import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DayCell } from './DayCell';

import type { Person, CalendarEvent } from '../../types';
import type { CalendarDayInfo } from '../../utils/dateUtils';

describe('DayCell Component', () => {
  const mockDayInfo: CalendarDayInfo = {
    date: new Date(2026, 9, 15),
    dateStr: '2026-10-15',
    dayNumber: 15,
    isCurrentMonth: true,
    isToday: false,
    dayOfWeek: 4,
  };

  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
  ];

  it('deve exibir o número do dia com cor padrão quando NÃO houver eventos', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    const dayNumber = screen.getByText('15');
    expect(dayNumber).toBeInTheDocument();
    expect(dayNumber.className).not.toContain('text-red-600 font-extrabold');
  });

  it('deve exibir o número do dia em VERMELHO DE DESTAQUE quando houver 1 ou mais eventos', () => {
    const mockEvents: CalendarEvent[] = [
      { id: 'ev-1', date: '2026-10-15', title: 'Reunião Geral' },
    ];

    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={mockEvents}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    const dayNumber = screen.getByText('15');
    expect(dayNumber).toBeInTheDocument();
    expect(dayNumber.className).toContain('text-red-600 font-extrabold');
  });

  it('deve disparar abertura de eventos ao clicar no botão de calendário', () => {
    const handleOpenEvents = vi.fn();
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={handleOpenEvents}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    const eventBtn = screen.getByTitle(/Ver ou adicionar eventos/i);
    fireEvent.click(eventBtn);
    expect(handleOpenEvents).toHaveBeenCalledTimes(1);
  });

  it('no Modo Leitura, exibe badge com o nome da pessoa alocada', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument();
  });

  it('no Modo Edição, exibe tags com botão ✕ para remoção', () => {
    const handleRemove = vi.fn();
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={['p1', 'p2']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={handleRemove}
        onAddPerson={vi.fn()}
      />
    );

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lucas')).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remover Dra. Camila deste dia');
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith('p1');
  });

  it('exibe badge de disponibilidade quando o profissional está selecionado para destaque', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={[]}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={mockPersons[0]}
        isHighlightedPersonAvailable={true}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    expect(screen.getByText('Disp.')).toBeInTheDocument();
  });

  it('deve destacar o dia atual com background diferenciado na DayCell sem criar círculo ao redor do número do dia', () => {
    const todayInfo: CalendarDayInfo = {
      ...mockDayInfo,
      isToday: true,
    };

    const { container } = render(
      <DayCell
        dayInfo={todayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    );

    const cellElement = container.firstChild as HTMLElement;
    expect(cellElement.className).toContain('bg-indigo-50/70');

    const dayNumber = screen.getByText('15');
    expect(dayNumber.className).not.toContain('bg-indigo-600 text-white');
    expect(dayNumber.className).toContain('text-indigo-600');
  });
});

