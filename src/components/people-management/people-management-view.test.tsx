import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { PeopleManagementView } from './people-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

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
        '2026-10-05': ['p1'], // p1 has assignment history
      },
      currentMonth: '2026-10',
    })
  })

  it('deve listar todos os funcionários cadastrados globalmente', () => {
    render(<PeopleManagementView />)

    expect(screen.getByText('Cadastro Geral de Funcionários')).toBeInTheDocument()
    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument()
    expect(screen.getByText('Dr. Lucas Oliveira')).toBeInTheDocument()
    expect(screen.getByText('Total Cadastrado: 2')).toBeInTheDocument()
  })

  it('deve filtrar funcionários pelo campo de busca', () => {
    render(<PeopleManagementView />)

    const searchInput = screen.getByPlaceholderText(/buscar funcionários por nome/i)
    fireEvent.change(searchInput, { target: { value: 'Camila' } })

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Lucas Oliveira')).not.toBeInTheDocument()
  })

  it('deve abrir o modal e cadastrar um novo funcionário global com active: true', () => {
    render(<PeopleManagementView />)

    const newBtn = screen.getByRole('button', { name: /novo funcionário/i })
    fireEvent.click(newBtn)

    expect(screen.getByRole('heading', { name: 'Novo Funcionário' })).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText(/Ex: Dra\. Mariana Costa/i)
    fireEvent.change(nameInput, { target: { value: 'Enf. Juliana Silva' } })

    const submitBtn = screen.getByRole('button', { name: /cadastrar funcionário/i })
    fireEvent.click(submitBtn)

    const created = useScheduleStore.getState().persons.find((p) => p.name === 'Enf. Juliana Silva')
    expect(created).toBeDefined()
    expect(created?.active).toBe(true)
  })

  it('deve permitir escolher uma cor customizada via colorpicker no cadastro de funcionário', () => {
    render(<PeopleManagementView />)

    const newBtn = screen.getByRole('button', { name: /novo funcionário/i })
    fireEvent.click(newBtn)

    const nameInput = screen.getByPlaceholderText(/Ex: Dra\. Mariana Costa/i)
    fireEvent.change(nameInput, { target: { value: 'Dr. Custom Color' } })

    const colorPickers = screen.getAllByLabelText(/cor personalizada/i)
    expect(colorPickers.length).toBeGreaterThanOrEqual(1)
    fireEvent.change(colorPickers[0], { target: { value: '#ff00aa' } })

    const submitBtn = screen.getByRole('button', { name: /cadastrar funcionário/i })
    fireEvent.click(submitBtn)

    const created = useScheduleStore.getState().persons.find((p) => p.name === 'Dr. Custom Color')
    expect(created).toBeDefined()
    expect(created?.color.toLowerCase()).toBe('#ff00aa')
  })

  it('deve permitir editar um funcionário existente', () => {
    render(<PeopleManagementView />)

    const editBtns = screen.getAllByRole('button', { name: /editar/i })
    fireEvent.click(editBtns[0]) // Dra. Camila

    expect(screen.getByText('Editar Funcionário')).toBeInTheDocument()

    const nameInput = screen.getByDisplayValue('Dra. Camila Santos')
    fireEvent.change(nameInput, { target: { value: 'Dra. Camila S. Ramos' } })

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i })
    fireEvent.click(saveBtn)

    expect(useScheduleStore.getState().persons.some((p) => p.name === 'Dra. Camila S. Ramos')).toBe(
      true
    )
  })

  it('deve interceptar exclusão de pessoa com histórico em escala e exibir modal de desativação', () => {
    render(<PeopleManagementView />)

    // Dra. Camila (p1) has assignments history ('2026-10-05')
    const deleteBtn = screen.getByRole('button', {
      name: /excluir cadastro de dra\. camila santos/i,
    })
    fireEvent.click(deleteBtn)

    // Should open interception modal with integrity alert
    expect(screen.getByText('Histórico em Escala Detectado')).toBeInTheDocument()
    expect(
      screen.getByText(/este profissional já possui histórico em escalas e não pode ser excluído/i)
    ).toBeInTheDocument()

    // Confirm deactivation
    const confirmDeactivateBtn = screen.getByRole('button', {
      name: /sim, desativar profissional/i,
    })
    fireEvent.click(confirmDeactivateBtn)

    // Person status must change to active: false
    const camila = useScheduleStore.getState().persons.find((p) => p.id === 'p1')
    expect(camila?.active).toBe(false)

    // Schedule history ('2026-10-05') remains preserved
    expect(useScheduleStore.getState().assignments['2026-10-05']).toContain('p1')
  })

  it('deve abrir o modal de desativação ao clicar no botão Desativar do card e desativar o profissional', () => {
    render(<PeopleManagementView />)

    const deactivateBtn = screen.getByRole('button', {
      name: /desativar funcionário dra\. camila santos/i,
    })
    fireEvent.click(deactivateBtn)

    expect(screen.getByText('Histórico em Escala Detectado')).toBeInTheDocument()
    expect(
      screen.getByText(/este profissional já possui histórico em escalas e não pode ser excluído permanentemente/i)
    ).toBeInTheDocument()

    const confirmDeactivateBtn = screen.getByRole('button', {
      name: /sim, desativar profissional/i,
    })
    fireEvent.click(confirmDeactivateBtn)

    const camila = useScheduleStore.getState().persons.find((p) => p.id === 'p1')
    expect(camila?.active).toBe(false)
  })

  it('deve exibir badge "Inativo" e permitir reativar um funcionário inativo', () => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6', active: false },
      ],
    })

    render(<PeopleManagementView />)

    expect(screen.getByText('Inativo')).toBeInTheDocument()
    const reactivateBtn = screen.getByRole('button', { name: /reativar/i })
    expect(reactivateBtn).toBeInTheDocument()

    fireEvent.click(reactivateBtn)

    const camila = useScheduleStore.getState().persons.find((p) => p.id === 'p1')
    expect(camila?.active).toBe(true)
  })

  it('deve abrir diálogo de confirmação tradicional e excluir funcionário definitivamente quando ele NÃO tiver histórico de escala', () => {
    render(<PeopleManagementView />)

    // Dr. Lucas (p2) does not have any assignments
    const deleteBtn = screen.getByRole('button', {
      name: /excluir cadastro de dr\. lucas oliveira/i,
    })
    fireEvent.click(deleteBtn)

    expect(screen.getByText('Excluir Funcionário')).toBeInTheDocument()
    expect(
      screen.getByText(/tem certeza que deseja excluir o cadastro de/i)
    ).toBeInTheDocument()

    const confirmDeleteBtn = screen.getByRole('button', { name: /excluir definitivamente/i })
    fireEvent.click(confirmDeleteBtn)

    expect(useScheduleStore.getState().persons.some((p) => p.id === 'p2')).toBe(false)
  })
})
