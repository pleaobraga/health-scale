import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidatePicker } from './CandidatePicker';
import { Person } from '../../types';

describe('CandidatePicker Component', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
    { id: 'p3', name: 'Enf. Beatriz', color: '#8b5cf6' },
  ];

  it('permite selecionar profissional que possui disponibilidade', () => {
    const handleSelect = vi.fn();
    // Apenas p1 tem disponibilidade no dia 15
    const isPersonAvailable = (id: string, day: number) => id === 'p1' && day === 15;

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    );

    // Clica no botão "Adicionar" para abrir o dropdown
    const addBtn = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(addBtn);

    // Dra. Camila está disponível e deve ser clicável
    const camilaBtn = screen.getByRole('button', { name: 'Dra. Camila' });
    expect(camilaBtn).toBeEnabled();

    fireEvent.click(camilaBtn);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('p1');
  });

  it('bloqueia e desabilita profissionais que NÃO possuem disponibilidade no dia', () => {
    const handleSelect = vi.fn();
    // Apenas p1 tem disponibilidade no dia 15; p2 e p3 não possuem
    const isPersonAvailable = (id: string, day: number) => id === 'p1' && day === 15;

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    // Dr. Lucas e Enf. Beatriz devem estar na seção "Sem disponibilidade" e desabilitados
    const lucasBtn = screen.getByTitle(/dr\. lucas não possui disponibilidade no dia 15/i);
    expect(lucasBtn).toBeDisabled();
    expect(lucasBtn).toHaveAttribute('aria-disabled', 'true');

    // Clicar em profissional indisponível não deve chamar onSelectPerson
    fireEvent.click(lucasBtn);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('exibe mensagem quando nenhum profissional possui disponibilidade para o dia', () => {
    const handleSelect = vi.fn();
    // Ninguém disponível
    const isPersonAvailable = () => false;

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(
      screen.getByText(/nenhum profissional com disponibilidade para o dia 15/i)
    ).toBeInTheDocument();
  });

  it('não renderiza o botão Adicionar se todos os profissionais já estiverem alocados no dia', () => {
    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={['p1', 'p2', 'p3']}
        allPersons={mockPersons}
        isPersonAvailable={() => true}
        onSelectPerson={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /adicionar/i })).not.toBeInTheDocument();
  });
});
