import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('Sidebar Component (Pessoas do Mês)', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
        { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
        { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
      ],
      monthParticipants: {
        '2026-10': ['p1', 'p2'], // Somente p1 e p2 no mês
      },
      availabilities: [
        { personId: 'p1', month: '2026-10', availableDays: [1, 2, 3] },
      ],
      assignments: {},
      currentMonth: '2026-10',
      isEditMode: false,
    });
  });

  it('deve listar APENAS as pessoas vinculadas ao mês corrente', () => {
    render(<Sidebar />);

    // p1 e p2 estão no mês
    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lucas Oliveira')).toBeInTheDocument();

    // p3 NÃO está no mês 2026-10 e não deve aparecer na lista
    expect(screen.queryByText('Enf. Beatriz Lima')).not.toBeInTheDocument();
    expect(screen.getByText(/2 vinculadas/i)).toBeInTheDocument();
  });

  it('deve exibir estado vazio e botão "+ Adicionar Pessoas ao Mês" quando não houver participantes no mês', () => {
    useScheduleStore.setState({
      monthParticipants: {
        '2026-10': [],
      },
    });

    render(<Sidebar />);

    expect(screen.getByText('Nenhuma pessoa no mês')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ adicionar pessoas ao mês/i })).toBeInTheDocument();
  });

  it('deve abrir modal de vinculação e adicionar nova pessoa ao mês', () => {
    render(<Sidebar />);

    const vincularBtn = screen.getByRole('button', { name: /vincular/i });
    fireEvent.click(vincularBtn);

    expect(screen.getByText('Vincular Pessoas ao Mês')).toBeInTheDocument();
    // Enf. Beatriz Lima é a única elegível (não participante)
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument();

    // Seleciona Enf. Beatriz Lima
    const beatrizCard = screen.getByText('Enf. Beatriz Lima');
    fireEvent.click(beatrizCard);

    // Clica em Adicionar Selecionados
    const addSelectedBtn = screen.getByRole('button', { name: /adicionar selecionados/i });
    fireEvent.click(addSelectedBtn);

    // Agora Beatriz deve estar na lista do mês
    expect(useScheduleStore.getState().monthParticipants['2026-10']).toContain('p3');
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument();
  });

  it('deve remover uma pessoa do mês sem excluí-la do cadastro geral de pessoas', () => {
    render(<Sidebar />);

    const removeBtn = screen.getByRole('button', {
      name: /remover dra\. camila santos deste mês/i,
    });
    fireEvent.click(removeBtn);

    // Não está mais no mês
    expect(useScheduleStore.getState().monthParticipants['2026-10']).not.toContain('p1');
    expect(screen.queryByText('Dra. Camila Santos')).not.toBeInTheDocument();

    // MAS continua no cadastro geral de persons!
    expect(useScheduleStore.getState().persons.some((p) => p.id === 'p1')).toBe(true);
  });

  it('deve alternar entre recolhido e expandido ao clicar no botão de alternância', () => {
    render(<Sidebar />);

    const toggleBtn = screen.getByTestId('toggle-sidebar-collapse');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveTextContent(/recolher/i);

    // Clica para recolher/minimizar
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/expandir/i);

    // Clica novamente para expandir
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/recolher/i);
  });
});

