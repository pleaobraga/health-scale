import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'

import { Sidebar } from './sidebar'
import { StorageService } from '../../services/storage-service'
import { useScheduleStore } from '../../store/use-schedule-store'

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  )

describe('Sidebar Component (Pessoas do Mês)', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dra. Camila Santos', color: '#3b82f6' },
        { id: 'p2', name: 'Dr. Lucas Oliveira', color: '#10b981' },
        { id: 'p3', name: 'Enf. Beatriz Lima', color: '#8b5cf6' },
      ],
      monthParticipants: {
        '2026-10': ['p1', 'p2'], // Only p1 and p2 in the month
      },
      availabilities: [
        { personId: 'p1', month: '2026-10', availableDays: [1, 2, 3] },
      ],
      assignments: {},
      currentMonth: '2026-10',
      isEditMode: false,
      monthActiveRules: {},
      validationErrors: [],
    })
  })

  it('deve listar APENAS as pessoas vinculadas ao mês corrente', () => {
    renderSidebar()

    // p1 and p2 are in the month
    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument()
    expect(screen.getByText('Dr. Lucas Oliveira')).toBeInTheDocument()

    // p3 is NOT in month 2026-10 and must not appear in the list
    expect(screen.queryByText('Enf. Beatriz Lima')).not.toBeInTheDocument()
    expect(screen.getByText(/2 vinculadas/i)).toBeInTheDocument()
  })

  it('deve exibir estado vazio e botão "+ Adicionar Pessoas ao Mês" quando não houver participantes no mês', () => {
    useScheduleStore.setState({
      monthParticipants: {
        '2026-10': [],
      },
    })

    renderSidebar()

    expect(screen.getByText('Nenhuma pessoa no mês')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ adicionar pessoas ao mês/i })).toBeInTheDocument()
  })

  it('deve abrir modal de vinculação e adicionar nova pessoa ao mês', () => {
    renderSidebar()

    const vincularBtn = screen.getByRole('button', { name: /vincular funcionários ao mês/i })
    fireEvent.click(vincularBtn)

    expect(screen.getByText('Vincular Pessoas ao Mês')).toBeInTheDocument()
    // Enf. Beatriz Lima is the only eligible person (non-participant)
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument()

    // Select Enf. Beatriz Lima
    const beatrizCard = screen.getByText('Enf. Beatriz Lima')
    fireEvent.click(beatrizCard)

    // Click "Adicionar Selecionados"
    const addSelectedBtn = screen.getByRole('button', { name: /adicionar selecionados/i })
    fireEvent.click(addSelectedBtn)

    // Now Beatriz should be in the month list
    expect(useScheduleStore.getState().monthParticipants['2026-10']).toContain('p3')
    expect(screen.getByText('Enf. Beatriz Lima')).toBeInTheDocument()
  })

  it('deve remover uma pessoa do mês sem excluí-la do cadastro geral de pessoas', () => {
    renderSidebar()

    const removeBtn = screen.getByRole('button', {
      name: /remover dra\. camila santos deste mês/i,
    })
    fireEvent.click(removeBtn)

    // No longer in the month
    expect(useScheduleStore.getState().monthParticipants['2026-10']).not.toContain('p1')
    expect(screen.queryByText('Dra. Camila Santos')).not.toBeInTheDocument()

    // BUT remains in the global people registry!
    expect(useScheduleStore.getState().persons.some((p) => p.id === 'p1')).toBe(true)
  })

  it('deve alternar entre recolhido e expandido ao clicar no botão de alternância e exibir o título Painel do Mês no cabeçalho mobile', () => {
    renderSidebar()

    expect(screen.getByText('Painel do Mês')).toBeInTheDocument()

    const toggleBtn = screen.getByTestId('toggle-sidebar-collapse')
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveTextContent(/recolher/i)

    // Click to collapse/minimize
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveTextContent(/expandir/i)

    // Click again to expand
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveTextContent(/recolher/i)
  })

  it('deve expandir a seção de Regras de Validação e remover uma regra ativa do mês', () => {
    renderSidebar()

    // Regras header is present
    const rulesHeader = screen.getByText('Regras de Validação')
    expect(rulesHeader).toBeInTheDocument()

    // Click to expand rules accordion section
    fireEvent.click(rulesHeader)

    // Should now show rule names that are active in this month
    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()

    // Initial state has 'rule_max_shifts_day'
    const initialRuleState = useScheduleStore.getState().getActiveRuleIds('2026-10')
    const ruleToToggle = 'rule_max_shifts_day'
    expect(initialRuleState).toContain(ruleToToggle)

    // Remove button for that rule
    const removeBtn = screen.getByRole('button', {
      name: /remover máximo 1 turno por dia deste mês/i,
    })
    fireEvent.click(removeBtn)

    // Should now be removed from activeRuleIds for this month
    const updatedRuleState = useScheduleStore.getState().getActiveRuleIds('2026-10')
    expect(updatedRuleState).not.toContain(ruleToToggle)
  })

  it('não deve exibir violações ou diagnósticos na seção de Regras de Validação da Sidebar', () => {
    // Simulates an error present in store for a rule
    useScheduleStore.setState({
      validationErrors: [
        {
          id: 'err-1',
          rule: 'rule_max_shifts_day',
          severity: 'error',
          date: '2026-10-02',
          message: 'Infração de plantões diários',
        },
      ],
    })

    renderSidebar()

    const rulesHeader = screen.getByText('Regras de Validação')
    fireEvent.click(rulesHeader)

    // Rule name is displayed
    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()

    // But no violation details or badges should be in the sidebar rules
    expect(screen.queryByText(/com violação/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ver violações/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Infração de plantões diários/i)).not.toBeInTheDocument()
  })

  it('deve abrir modal de vinculação de regras e adicionar regras ao mês', () => {
    // Start with empty rules for the month
    useScheduleStore.setState({
      monthActiveRules: { '2026-10': [] },
    })

    renderSidebar()

    const linkRulesBtn = screen.getByRole('button', { name: /vincular regras ao mês/i })
    fireEvent.click(linkRulesBtn)

    expect(screen.getByText('Vincular Regras ao Mês')).toBeInTheDocument()

    // Select the first available rule
    const ruleItem = screen.getByText('Máximo 1 turno por dia')
    fireEvent.click(ruleItem)

    // Click confirm button
    const addBtn = screen.getByRole('button', { name: /adicionar selecionadas/i })
    fireEvent.click(addBtn)

    expect(useScheduleStore.getState().getActiveRuleIds('2026-10')).toContain('rule_max_shifts_day')
  })

  it('deve possuir botões de engrenagem para gerenciar pessoas e turnos no sidebar', () => {
    renderSidebar()

    const managePeopleBtn = screen.getByRole('button', { name: /gerenciar pessoas/i })
    expect(managePeopleBtn).toBeInTheDocument()

    const manageShiftsBtn = screen.getByRole('button', { name: /gerenciar turnos/i })
    expect(manageShiftsBtn).toBeInTheDocument()

    fireEvent.click(managePeopleBtn)
    expect(useScheduleStore.getState().currentView).toBe('people')

    fireEvent.click(manageShiftsBtn)
    expect(useScheduleStore.getState().currentView).toBe('settings')
  })

  it('deve exibir os cards na ordem salva localmente e uma alça de arrastar em cada card', () => {
    StorageService.saveListOrder('month-people', ['p2', 'p1'])
    renderSidebar()

    const cards = screen.getAllByTestId(/^sortable-item-/)
    expect(cards.map((c) => c.dataset.testid)).toEqual(['sortable-item-p2', 'sortable-item-p1'])
    expect(screen.getByTestId('drag-handle-p1')).toHaveAccessibleName(
      'Arrastar para reordenar Dra. Camila Santos',
    )
  })
})
