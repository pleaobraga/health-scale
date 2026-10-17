import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonCard } from './PersonCard';
import { Person } from '../../types';

describe('PersonCard Component', () => {
  const mockPerson: Person = {
    id: 'p1',
    name: 'Dra. Camila Santos',
    color: '#3b82f6',
  };

  it('deve renderizar nome, contagem de dias disponíveis e cor do profissional', () => {
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={12}
        isHighlighted={false}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.getByText('12 dias disp.')).toBeInTheDocument();
  });

  it('deve chamar onToggleHighlight ao clicar no botão de visibilidade', () => {
    const handleToggle = vi.fn();
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        onToggleHighlight={handleToggle}
        onEdit={vi.fn()}
      />
    );

    const toggleBtn = screen.getByTitle('Destacar disponibilidade no calendário');
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onEdit ao clicar no botão de edição', () => {
    const handleEdit = vi.fn();
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        onToggleHighlight={vi.fn()}
        onEdit={handleEdit}
      />
    );

    const editBtn = screen.getByTitle(/Editar nome, cor ou disponibilidade/i);
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
});

