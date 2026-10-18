import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddMonthParticipantsModal } from './AddMonthParticipantsModal';
import { Person } from '../../types';

describe('AddMonthParticipantsModal Component', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6', active: true },
    { id: 'p2', name: 'Dr. Lucas Oliveira (Inativo)', color: '#10b981', active: false },
    { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6', active: true },
  ];

  it('deve listar APENAS profissionais ativos (active: true), ocultando profissionais inativos', () => {
    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
        allPersons={mockPersons}
        currentParticipantIds={[]}
        onAddParticipants={vi.fn()}
      />
    );

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument();
    // O profissional inativo não deve aparecer na lista de candidatos do mês
    expect(screen.queryByText('Dr. Lucas Oliveira (Inativo)')).not.toBeInTheDocument();
  });

  it('deve exibir profissional anteriormente inativo após ele ser reativado', () => {
    const reactivatedPersons: Person[] = [
      ...mockPersons.map((p) => (p.id === 'p2' ? { ...p, active: true } : p)),
    ];

    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
        allPersons={reactivatedPersons}
        currentParticipantIds={[]}
        onAddParticipants={vi.fn()}
      />
    );

    expect(screen.getByText('Dr. Lucas Oliveira (Inativo)')).toBeInTheDocument();
  });

  it('deve permitir selecionar e vincular os profissionais ativos ao mês', () => {
    const handleAdd = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddMonthParticipantsModal
        isOpen={true}
        onClose={handleClose}
        currentMonth="2026-10"
        allPersons={mockPersons}
        currentParticipantIds={['p1']} // Camila já está vinculada
        onAddParticipants={handleAdd}
      />
    );

    // Como Camila já está no mês e Lucas é inativo, apenas Beatriz deve estar elegível
    expect(screen.queryByText('Dra. Camila Santos')).not.toBeInTheDocument();
    expect(screen.queryByText('Dr. Lucas Oliveira (Inativo)')).not.toBeInTheDocument();
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument();

    const beatrizCheckbox = screen.getByText('Enf. Beatriz Lima');
    fireEvent.click(beatrizCheckbox);

    const confirmBtn = screen.getByRole('button', { name: /Adicionar Selecionados/i });
    fireEvent.click(confirmBtn);

    expect(handleAdd).toHaveBeenCalledWith(['p3']);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
