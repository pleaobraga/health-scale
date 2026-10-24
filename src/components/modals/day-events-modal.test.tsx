import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

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

  it('deve iniciar com formulário fechado e exibir mensagem de nenhum evento quando a lista estiver vazia', () => {
    useScheduleStore.setState({ selectedDateForEvents: '2026-10-15' })
    render(<DayEventsModal />)

    expect(screen.getByText('Eventos do Dia')).toBeInTheDocument()
    expect(screen.getByText(/Nenhum evento registrado para este dia/i)).toBeInTheDocument()
    // Formulário não deve estar aberto inicialmente
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Ex: Auditoria ou Reunião Clínica')).not.toBeInTheDocument()

    // Deve conter botões para abrir o formulário
    const addButtons = screen.getAllByRole('button', { name: /Adicionar Evento/i })
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it('deve abrir o formulário ao clicar em Adicionar Evento e fechar ao cancelar', () => {
    useScheduleStore.setState({ selectedDateForEvents: '2026-10-15' })
    render(<DayEventsModal />)

    // Clica para abrir o formulário
    const addBtn = screen.getAllByRole('button', { name: /Adicionar Evento/i })[0]
    fireEvent.click(addBtn)

    expect(screen.getByText('Novo Evento para este Dia')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')).toBeInTheDocument()

    // Clica em Cancelar
    const cancelBtn = screen.getAllByRole('button', { name: /^Cancelar$/i })[0]
    fireEvent.click(cancelBtn)

    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Ex: Auditoria ou Reunião Clínica')).not.toBeInTheDocument()
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
    // Formulário deve estar fechado por padrão
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
  })

  it('deve permitir adicionar um novo evento com horário e endereço na hora via opção + Novo endereço e fechar o formulário após salvar', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    })

    render(<DayEventsModal />)

    // Abre o formulário
    const addBtn = screen.getAllByRole('button', { name: /Adicionar Evento/i })[0]
    fireEvent.click(addBtn)

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Reunião Geral' } })

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i)
    fireEvent.change(timeInput, { target: { value: '14:30' } })

    // Por padrão textarea de endereço manual não está visível
    expect(screen.queryByPlaceholderText(/Digite o endereço completo na hora/i)).not.toBeInTheDocument()

    // Seleciona + Novo endereço
    const addressSelect = screen.getByLabelText('Selecionar endereço do evento')
    fireEvent.change(addressSelect, { target: { value: '__new__' } })

    // Textarea aparece
    const addressInput = screen.getByPlaceholderText(/Digite o endereço completo na hora/i)
    fireEvent.change(addressInput, { target: { value: 'Rua das Flores, 123\nBloco B' } })

    const submitBtn = screen.getByRole('button', { name: /^Adicionar Evento$/i })
    fireEvent.click(submitBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents).toHaveLength(1)
    expect(storeEvents[0]).toMatchObject({
      date: '2026-10-15',
      title: 'Reunião Geral',
      time: '14:30',
      address: 'Rua das Flores, 123\nBloco B',
    })

    // Formulário deve ter fechado automaticamente após salvar
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
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

    // Abre o formulário
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Evento/i })[0])

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Visita Domiciliar' } })

    const addressSelect = screen.getByLabelText('Selecionar endereço do evento')
    fireEvent.change(addressSelect, { target: { value: 'addr-1' } })

    // Preview do endereço selecionado
    expect(screen.getByTestId('selected-address-preview')).toBeInTheDocument()
    expect(screen.getByText('Clínica Paulista')).toBeInTheDocument()

    // Textarea manual não deve aparecer
    expect(screen.queryByPlaceholderText(/Digite o endereço completo na hora/i)).not.toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /^Adicionar Evento$/i })
    fireEvent.click(submitBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents).toHaveLength(1)
    expect(storeEvents[0].address).toBe('Clínica Paulista\nAv Paulista, 1000\nBela Vista - São Paulo')

    // Formulário fecha após salvar
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
  })

  it('deve preencher o formulário ao clicar no botão de editar, atualizar o evento e fechar o formulário ao salvar', () => {
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

    // Formulário está fechado inicialmente
    expect(screen.queryByText('Editar Evento')).not.toBeInTheDocument()

    // Clica no botão de editar evento existente
    const editBtn = screen.getByRole('button', { name: /Editar evento Plantão Manhã/i })
    fireEvent.click(editBtn)

    // Formulário deve se abrir com título "Editar Evento"
    expect(screen.getByText('Editar Evento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar Alterações/i })).toBeInTheDocument()
    expect(screen.getByText('Cancelar Edição')).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    expect(titleInput).toHaveValue('Plantão Manhã')

    const timeInput = screen.getByLabelText(/Horário \(Opcional\)/i)
    expect(timeInput).toHaveValue('07:00')

    const addressInput = screen.getByPlaceholderText(/Digite o endereço completo na hora/i)
    expect(addressInput).toHaveValue('Rua Antiga, 50')

    // Modifica valores
    fireEvent.change(titleInput, { target: { value: 'Plantão Noturno Extra' } })
    fireEvent.change(timeInput, { target: { value: '22:00' } })
    fireEvent.change(addressInput, { target: { value: 'Rua Nova, 100\nApto 4' } })

    const saveBtn = screen.getByRole('button', { name: /Salvar Alterações/i })
    fireEvent.click(saveBtn)

    const storeEvents = useScheduleStore.getState().events
    expect(storeEvents[0].title).toBe('Plantão Noturno Extra')
    expect(storeEvents[0].time).toBe('22:00')
    expect(storeEvents[0].address).toBe('Rua Nova, 100\nApto 4')

    // Formulário fecha após salvar a edição
    expect(screen.queryByText('Editar Evento')).not.toBeInTheDocument()
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
  })

  it('deve permitir cancelar a edição fechando o formulário', () => {
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

    // Fecha o formulário
    expect(screen.queryByText('Editar Evento')).not.toBeInTheDocument()
    expect(screen.queryByText('Novo Evento para este Dia')).not.toBeInTheDocument()
  })

  it('deve exibir erro caso tente salvar evento sem título', () => {
    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [],
    })

    render(<DayEventsModal />)

    // Abre formulário
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Evento/i })[0])

    const submitBtn = screen.getByRole('button', { name: /^Adicionar Evento$/i })
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

    // Abre formulário
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Evento/i })[0])

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

    // Abre formulário
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Evento/i })[0])

    const titleInput = screen.getByPlaceholderText('Ex: Auditoria ou Reunião Clínica')
    fireEvent.change(titleInput, { target: { value: 'Curativo Especial' } })

    const caregiverSelect = screen.getByLabelText(/Cuidadora \/ Profissional Responsável/i)
    fireEvent.change(caregiverSelect, { target: { value: 'p2' } })

    const submitBtn = screen.getByRole('button', { name: /^Adicionar Evento$/i })
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

  it('deve permitir copiar o endereço do evento cadastrado na lista', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    useScheduleStore.setState({
      selectedDateForEvents: '2026-10-15',
      events: [
        {
          id: 'ev-1',
          date: '2026-10-15',
          title: 'Visita Técnica',
          address: 'Rua das Palmeiras, 250 - Apto 31',
        },
      ],
    })

    render(<DayEventsModal />)

    const copyBtn = screen.getByRole('button', { name: /Copiar endereço do evento/i })
    expect(copyBtn).toBeInTheDocument()
    expect(copyBtn).toHaveTextContent('Copiar')

    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledWith('Rua das Palmeiras, 250 - Apto 31')
    expect(await screen.findByText('Copiado!')).toBeInTheDocument()
  })

  it('deve permitir copiar o endereço a partir do preview no formulário', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

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

    // Abre formulário
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Evento/i })[0])

    const addressSelect = screen.getByLabelText('Selecionar endereço do evento')
    fireEvent.change(addressSelect, { target: { value: 'addr-1' } })

    const copyPreviewBtn = screen.getByRole('button', { name: /Copiar endereço selecionado/i })
    expect(copyPreviewBtn).toBeInTheDocument()

    fireEvent.click(copyPreviewBtn)

    expect(writeTextMock).toHaveBeenCalledWith('Clínica Paulista\nAv Paulista, 1000\nBela Vista - São Paulo')
    expect(await screen.findByText('Copiado!')).toBeInTheDocument()
  })
  it('deve deixar o corpo ocupar o espaço livre em telas pequenas para manter o rodapé no final da tela', () => {
    useScheduleStore.setState({ selectedDateForEvents: '2026-10-15' })
    render(<DayEventsModal />)

    expect(screen.getByTestId('day-events-modal-body')).toHaveClass('mobile:flex-1', 'mobile:min-h-0')
  })
})
