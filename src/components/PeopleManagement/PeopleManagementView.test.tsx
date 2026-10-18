import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeopleManagementView } from './PeopleManagementView';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('PeopleManagementView Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6', active: true },
        { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981', active: true },
      ],
      monthParticipants: {
        '2026-10': ['p1'],
      },
      assignments: {
        '2026-10-05': ['p1'], // p1 possui histórico em escalas
      },
      currentMonth: '2026-10',
    });
  });

  it('deve listar todos os funcionários cadastrados globalmente', () => {
    render(<PeopleManagementView />);

    expect(screen.getByText('Cadastro Geral de Funcionários')).toBeInTheDocument();
    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lucas Oliveira')).toBeInTheDocument();
    expect(screen.getByText(/2 ativos/i)).toBeInTheDocument();
  });

  it('deve filtrar funcionários pelo campo de busca', () => {
    render(<PeopleManagementView />);

    const searchInput = screen.getByPlaceholderText(/buscar funcionários por nome/i);
    fireEvent.change(searchInput, { target: { value: 'Camila' } });

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Lucas Oliveira')).not.toBeInTheDocument();
  });

  it('deve abrir o modal e cadastrar um novo funcionário global com active: true', () => {
    render(<PeopleManagementView />);

    const newBtn = screen.getByRole('button', { name: /novo funcionário/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: 'Novo Funcionário' })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Ex: Dra\. Mariana Costa/i);
    fireEvent.change(nameInput, { target: { value: 'Enf. Juliana Silva' } });

    const submitBtn = screen.getByRole('button', { name: /cadastrar funcionário/i });
    fireEvent.click(submitBtn);

    const created = useScheduleStore.getState().persons.find((p) => p.name === 'Enf. Juliana Silva');
    expect(created).toBeDefined();
    expect(created?.active).toBe(true);
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

  it('deve interceptar exclusão de pessoa com histórico em escala e exibir modal de desativação', () => {
    render(<PeopleManagementView />);

    // Dra. Camila (p1) possui histórico em assignments ('2026-10-05')
    const deleteBtn = screen.getByRole('button', {
      name: /excluir cadastro de dra\. camila santos/i,
    });
    fireEvent.click(deleteBtn);

    // Deve abrir o modal de interceptação e aviso de integridade
    expect(screen.getByText('Histórico em Escala Detectado')).toBeInTheDocument();
    expect(
      screen.getByText(/este profissional já possui histórico em escalas e não pode ser excluído/i)
    ).toBeInTheDocument();

    // Confirmar desativação
    const confirmDeactivateBtn = screen.getByRole('button', {
      name: /sim, desativar profissional/i,
    });
    fireEvent.click(confirmDeactivateBtn);

    // O status do profissional deve mudar para active: false
    const camila = useScheduleStore.getState().persons.find((p) => p.id === 'p1');
    expect(camila?.active).toBe(false);

    // O histórico na escala ('2026-10-05') permanece preservado
    expect(useScheduleStore.getState().assignments['2026-10-05']).toContain('p1');
  });

  it('deve exibir badge "Inativo" e permitir reativar um funcionário inativo', () => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6', active: false },
      ],
    });

    render(<PeopleManagementView />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
    const reactivateBtn = screen.getByRole('button', { name: /reativar/i });
    expect(reactivateBtn).toBeInTheDocument();

    fireEvent.click(reactivateBtn);

    const camila = useScheduleStore.getState().persons.find((p) => p.id === 'p1');
    expect(camila?.active).toBe(true);
  });

  it('deve abrir diálogo de confirmação tradicional e excluir funcionário definitivamente quando ele NÃO tiver histórico de escala', () => {
    render(<PeopleManagementView />);

    // Dr. Lucas (p2) não possui nenhuma escala em assignments
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
