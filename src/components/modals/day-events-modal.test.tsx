import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { DayEventsModal } from './day-events-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('DayEventsModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      selectedDateForEvents: null,
      events: [],
    })
  })

  it('não deve renderizar quando selectedDateForEvents for null', () => {
    render(<DayEventsModal />)
    expect(screen.queryByText('Eventos do Dia')).not.toBeInTheDocument()
  })

  it('deve exibir mensagem de nenhum evento cadastrado quando a lista estiver vazia', () => {
    useScheduleStore.setState({ selectedDateForEvents: '2026-10-15' })
    render(<DayEventsModal />)

    expect(screen.getByText('Eventos do Dia')).toBeInTheDocument()
    expect(screen.getByText(/Nenhum evento registrado para este dia/i)).toBeInTheDocument()
    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument()
  })

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
    })

    render(<DayEventsModal />)

    expect(screen.getByText('Plantão Noturno')).toBeInTheDocument()
    expect(screen.getByText('19:00')).toBeInTheDocument()
    expect(screen.getByText('Equipe de UTI')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Editar evento Plantão Noturno/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Excluir evento Plantão Noturno/i })).toBeInTheDocument()
  })

  it('deve permitir adicionar um novo evento com horário e endereço na hora via opção + Novo endereço', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    })

    render(<DayEventsModal />)

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Reunião Geral' } })

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i)
    fireEvent.change(timeInput, { target: { value: '14:30' } })

    // By default, manual address textarea is hidden
    expect(screen.queryByPlaceholderText(/Digite o endereço completo na hora/i)).not.toBeInTheDocument()

    // Select + Novo endereço
    const addressSelect = screen.getByLabelText('Selecionar endereço do evento')
    fireEvent.change(addressSelect, { target: { value: '__new__' } })

    // Textarea now appears
    const addressInput = screen.getByPlaceholderText(/Digite o endereço completo na hora/i)
    fireEvent.change(addressInput, { target: { value: 'Rua das Flores, 123\nBloco B' } })

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i })
    fireEvent.click(submitBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents).toHaveLength(1)
    expect(storeEvents[0]).toMatchObject({
      date: '2026-10-15',
      title: 'Reunião Geral',
      time: '14:30',
      address: 'Rua das Flores, 123\nBloco B',
    })
  })

  it('deve permitir selecionar um endereço pré-cadastrado no dropdown de eventos', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
      addresses: [
        {
          id: 'addr-1',
          name: 'Clínica Paulista',
          street: 'Av Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
        },
      ],
    })

    render(<DayEventsModal />)

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Visita Domiciliar' } })

    const addressSelect = screen.getByLabelText('Selecionar endereço do evento')
    fireEvent.change(addressSelect, { target: { value: 'addr-1' } })

    // Preview should appear with address details
    expect(screen.getByTestId('selected-address-preview')).toBeInTheDocument()
    expect(screen.getByText('Clínica Paulista')).toBeInTheDocument()

    // Manual textarea should not be visible when registered address is selected
    expect(screen.queryByPlaceholderText(/Digite o endereço completo na hora/i)).not.toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i })
    fireEvent.click(submitBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents).toHaveLength(1)
    expect(storeEvents[0].address).toBe('Clínica Paulista\nAv Paulista, 1000\nBela Vista - São Paulo')
  })

  it('deve preencher o formulário ao clicar no botão de editar e atualizar o evento com sucesso', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Plantão Manhã',
          time: '07:00',
          address: 'Rua Antiga, 50',
        },
      ],
    })

    render(<DayEventsModal />)

    // Click edit button for event
    const editBtn = screen.getByRole('button', { name: /Editar evento Plantão Manhã/i })
    fireEvent.click(editBtn)

    // Form title should change to "Editar Evento"
    expect(screen.getByText('Editar Evento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar Alterações/i })).toBeInTheDocument()
    expect(screen.getByText('Cancelar Edição')).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    expect(titleInput).toHaveValue('Plantão Manhã')

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i)
    expect(timeInput).toHaveValue('07:00')

    const addressInput = screen.getByPlaceholderText(/Digite o endereço completo na hora/i)
    expect(addressInput).toHaveValue('Rua Antiga, 50')

    // Modify title and time and address
    fireEvent.change(titleInput, { target: { value: 'Plantão Noturno Extra' } })
    fireEvent.change(timeInput, { target: { value: '22:00' } })
    fireEvent.change(addressInput, { target: { value: 'Rua Nova, 100\nApto 4' } })

    const saveBtn = screen.getByRole('button', { name: /Salvar Alterações/i })
    fireEvent.click(saveBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents[0].title).toBe('Plantão Noturno Extra')
    expect(storeEvents[0].time).toBe('22:00')
    expect(storeEvents[0].address).toBe('Rua Nova, 100\nApto 4')

    // Form should return to initial state for new event
    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument()
  })

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
    })

    render(<DayEventsModal />)

    const editBtn = screen.getByRole('button', { name: /Editar evento Plantão Manhã/i })
    fireEvent.click(editBtn)

    expect(screen.getByText('Editar Evento')).toBeInTheDocument()

    const cancelBtn = screen.getByText('Cancelar Edição')
    fireEvent.click(cancelBtn)

    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')).toHaveValue('')
    expect(screen.getByLabelText(/Horário \(Opcional\)/i)).toHaveValue('')
  })

  it('deve exibir erro caso tente salvar evento sem título', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    })

    render(<DayEventsModal />)

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText('O título do evento é obrigatório.')).toBeInTheDocument()
    expect(useScheduleStore.getState().events).toHaveLength(0)
  })

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
    })

    render(<DayEventsModal />)

    const deleteBtn = screen.getByRole('button', { name: /Excluir evento Evento para Excluir/i })
    fireEvent.click(deleteBtn)

    expect(useScheduleStore.getState().events).toHaveLength(0)
  })

  it('deve renderizar o ícone de relógio com classe para dark theme quando houver horário', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Plantão Noturno',
          time: '19:00',
        },
      ],
    })

    render(<DayEventsModal />)
    const clockIcon = document.body.querySelector('.lucide-clock')
    expect(clockIcon).toBeInTheDocument()
    expect(clockIcon).toHaveClass('dark:text-indigo-400')
  })

  it('deve associar por padrão a cuidadora escalada no dia ao abrir o modal para novo evento', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Maria Silva', color: '#3B82F6', active: true },
        { id: 'p2', name: 'Joana Santos', color: '#10B981', active: true },
      ],
      monthParticipants: { '2026-10': ['p1', 'p2'] },
      assignments: { '2026-10-15': ['p1'] },
      events: [],
    })

    render(<DayEventsModal />)

    const caregiverSelect = screen.getByLabelText(/Cuidadora \/ Profissional Responsável/i) as HTMLSelectElement
    expect(caregiverSelect.value).toBe('p1')

    const colorPreview = screen.getByTestId('selected-caregiver-color-preview')
    expect(colorPreview).toHaveStyle({ backgroundColor: '#3B82F6' })
  })

  it('deve permitir associar outra cuidadora cadastrada no mês e persistir o personId', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Maria Silva', color: '#3B82F6', active: true },
        { id: 'p2', name: 'Joana Santos', color: '#10B981', active: true },
      ],
      monthParticipants: { '2026-10': ['p1', 'p2'] },
      assignments: { '2026-10-15': ['p1'] },
      events: [],
    })

    render(<DayEventsModal />)

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Curativo Especial' } })

    const caregiverSelect = screen.getByLabelText(/Cuidadora \/ Profissional Responsável/i)
    fireEvent.change(caregiverSelect, { target: { value: 'p2' } })

    const submitBtn = screen.getByRole('button', { name: /Adicionar Evento/i })
    fireEvent.click(submitBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents).toHaveLength(1)
    expect(storeEvents[0].personId).toBe('p2')
  })

  it('deve exibir o badge colorido da cuidadora associada na lista de eventos existentes', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      currentMonth: '2026-10',
      persons: [
        { id: 'p2', name: 'Joana Santos', color: '#10B981', active: true },
      ],
      monthParticipants: { '2026-10': ['p2'] },
      assignments: {},
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Fisioterapia Respiratória',
          personId: 'p2',
        },
      ],
    })

    render(<DayEventsModal />)

    const badge = screen.getByTestId('event-caregiver-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Joana Santos')
    expect(badge).toHaveStyle({ backgroundColor: '#10B981' })
  })
})

