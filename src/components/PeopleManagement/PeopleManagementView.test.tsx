import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeopleManagementView } from './PeopleManagementView';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('PeopleManagementView Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
        { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
      ],
      monthParticipants: {
        '2026-10': ['p1'],
      },
      currentMonth: '2026-10',
    });
  });

  it('deve listar todos os funcionários cadastrados globalmente', () => {
    render(<PeopleManagementView />);

    expect(screen.getByText('Cadastro Geral de Funcionários')).toBeInTheDocument();
    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lucas Oliveira')).toBeInTheDocument();
    expect(screen.getByText(/2 pessoas/i)).toBeInTheDocument();
  });

  it('deve filtrar funcionários pelo campo de busca', () => {
    render(<PeopleManagementView />);

    const searchInput = screen.getByPlaceholderText(/buscar funcionários por nome/i);
    fireEvent.change(searchInput, { target: { value: 'Camila' } });

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Lucas Oliveira')).not.toBeInTheDocument();
  });

  it('deve abrir o modal e cadastrar um novo funcionário global', () => {
    render(<PeopleManagementView />);

    const newBtn = screen.getByRole('button', { name: /novo funcionário/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: 'Novo Funcionário' })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Ex: Dra\. Mariana Costa/i);
    fireEvent.change(nameInput, { target: { value: 'Enf. Juliana Silva' } });

    const submitBtn = screen.getByRole('button', { name: /cadastrar funcionário/i });
    fireEvent.click(submitBtn);

    expect(useScheduleStore.getState().persons.some((p) => p.name === 'Enf. Juliana Silva')).toBe(
      true
    );
  });

  it('deve permitir editar um funcionário existente', () => {
    render(<PeopleManagementView />);

    const editBtns = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editBtns[0]); // Dra. Camila

    expect(screen.getByText('Editar Funcionário')).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Dra. Camila Santos');
    fireEvent.change(nameInput, { target: { value: 'Dra. Camila S. Ramos' } });

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(saveBtn);

    expect(useScheduleStore.getState().persons.some((p) => p.name === 'Dra. Camila S. Ramos')).toBe(
      true
    );
  });

  it('deve abrir diálogo de confirmação e excluir funcionário definitivamente', () => {
    render(<PeopleManagementView />);

    const deleteBtn = screen.getByRole('button', {
      name: /excluir cadastro de dr\. lucas oliveira/i,
    });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Excluir Funcionário')).toBeInTheDocument();
    expect(
      screen.getByText(/tem certeza que deseja excluir o cadastro de/i)
    ).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /excluir definitivamente/i });
    fireEvent.click(confirmDeleteBtn);

    expect(useScheduleStore.getState().persons.some((p) => p.id === 'p2')).toBe(false);
  });
});
