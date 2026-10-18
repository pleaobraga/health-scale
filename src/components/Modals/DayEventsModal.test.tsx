import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { DayEventsModal } from './DayEventsModal';
import { useScheduleStore } from '../../store/useScheduleStore';

describe('DayEventsModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      selectedDateForEvents: null,
      events: [],
    });
  });

  it('não deve renderizar quando selectedDateForEvents for null', () => {
    render(<DayEventsModal />);
    expect(screen.queryByText('Eventos do Dia')).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de nenhum evento cadastrado quando a lista estiver vazia', () => {
    useScheduleStore.setState({ selectedDateForEvents: '2026-10-15' });
    render(<DayEventsModal />);

    expect(screen.getByText('Eventos do Dia')).toBeInTheDocument();
    expect(screen.getByText(/Nenhum evento registrado para este dia/i)).toBeInTheDocument();
    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument();
  });

  it('deve listar eventos existentes do dia com botão de editar e excluir', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Plantão Noturno',
          time: '19:00',
          description: 'Equipe de UTI',
        },
      ],
    });

    render(<DayEventsModal />);

    expect(screen.getByText('Plantão Noturno')).toBeInTheDocument();
    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.getByText('Equipe de UTI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar evento Plantão Noturno/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excluir evento Plantão Noturno/i })).toBeInTheDocument();
  });

  it('deve permitir adicionar um novo evento com horário e descrição', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    });

    render(<DayEventsModal />);

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica');
    fireEvent.change(titleInput, { target: { value: 'Reunião Geral' } });

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    const descInput = screen.getByPlaceholderText('Detalhes adicionais...');
    fireEvent.change(descInput, { target: { value: 'Sala de reuniões 2' } });

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i });
    fireEvent.click(submitBtn);

    const storeEvents = useScheduleStore.getState().events;
    expect(storeEvents).toHaveLength(1);
    expect(storeEvents[0]).toMatchObject({
      date: '2026-10-15',
      title: 'Reunião Geral',
      time: '14:30',
      description: 'Sala de reuniões 2',
    });
  });

  it('deve preencher o formulário ao clicar no botão de editar e atualizar o evento com sucesso', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Plantão Manhã',
          time: '07:00',
          description: 'Troca de turno',
        },
      ],
    });

    render(<DayEventsModal />);

    // Clica no botão de editar do evento
    const editBtn = screen.getByRole('button', { name: /Editar evento Plantão Manhã/i });
    fireEvent.click(editBtn);

    // O cabeçalho do formulário deve mudar para "Editar Evento"
    expect(screen.getByText('Editar Evento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar Alterações/i })).toBeInTheDocument();
    expect(screen.getByText('Cancelar Edição')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica');
    expect(titleInput).toHaveValue('Plantão Manhã');

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i);
    expect(timeInput).toHaveValue('07:00');

    const descInput = screen.getByPlaceholderText('Detalhes adicionais...');
    expect(descInput).toHaveValue('Troca de turno');

    // Modifica o título e o horário
    fireEvent.change(titleInput, { target: { value: 'Plantão Noturno Extra' } });
    fireEvent.change(timeInput, { target: { value: '22:00' } });
    fireEvent.change(descInput, { target: { value: 'Equipe ampliada' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(saveBtn);

    const storeEvents = useScheduleStore.getState().events;
    expect(storeEvents[0].title).toBe('Plantão Noturno Extra');
    expect(storeEvents[0].time).toBe('22:00');
    expect(storeEvents[0].description).toBe('Equipe ampliada');

    // Formulário deve voltar ao estado inicial de novo evento
    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument();
  });

  it('deve permitir cancelar a edição voltando ao formulário de novo evento', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Plantão Manhã',
          time: '08:00',
        },
      ],
    });

    render(<DayEventsModal />);

    const editBtn = screen.getByRole('button', { name: /Editar evento Plantão Manhã/i });
    fireEvent.click(editBtn);

    expect(screen.getByText('Editar Evento')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancelar Edição');
    fireEvent.click(cancelBtn);

    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')).toHaveValue('');
    expect(screen.getByLabelText(/Horário \(Opcional\)/i)).toHaveValue('');
  });

  it('deve exibir erro caso tente salvar evento sem título', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    });

    render(<DayEventsModal />);

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('O título do evento é obrigatório.')).toBeInTheDocument();
    expect(useScheduleStore.getState().events).toHaveLength(0);
  });

  it('deve permitir excluir um evento cadastrado', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Evento para Excluir',
        },
      ],
    });

    render(<DayEventsModal />);

    const deleteBtn = screen.getByRole('button', { name: /Excluir evento Evento para Excluir/i });
    fireEvent.click(deleteBtn);

    expect(useScheduleStore.getState().events).toHaveLength(0);
  });
});
