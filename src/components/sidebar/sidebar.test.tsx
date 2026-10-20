import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'

import { Sidebar } from './sidebar'
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

    const vincularBtn = screen.getByRole('button', { name: /vincular/i })
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

  it('deve alternar entre recolhido e expandido ao clicar no botão de alternância', () => {
    renderSidebar()

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

  it('deve expandir a seção de Regras de Validação e alternar uma regra ativa', () => {
    renderSidebar()

    // Regras header is present
    const rulesHeader = screen.getByText('Regras de Validação')
    expect(rulesHeader).toBeInTheDocument()

    // Click to expand rules accordion section
    fireEvent.click(rulesHeader)

    // Should now show rule names
    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()

    // Find switches
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThanOrEqual(1)

    // Toggle the first rule switch
    const initialRuleState = useScheduleStore.getState().getActiveRuleIds('2026-10')
    const ruleToToggle = 'rule_max_shifts_day'
    expect(initialRuleState).toContain(ruleToToggle)

    fireEvent.click(switches[0])

    // Should now be removed from activeRuleIds for this month
    const updatedRuleState = useScheduleStore.getState().getActiveRuleIds('2026-10')
    expect(updatedRuleState).not.toContain(ruleToToggle)
  })

  it('deve expandir a seção de Turnos Vigentes e alternar um turno ativo', () => {
    renderSidebar()

    // Turnos header is present
    const shiftsHeader = screen.getByText('Turnos Vigentes')
    expect(shiftsHeader).toBeInTheDocument()

    // Click to expand shifts accordion section
    fireEvent.click(shiftsHeader)

    // Should show shift codes and names
    expect(screen.getByText('Plantão Diurno 12h')).toBeInTheDocument()
    expect(screen.getByText('D12')).toBeInTheDocument()

    // Find switch for D12
    const initialShiftState = useScheduleStore.getState().getActiveShiftIds('2026-10')
    expect(initialShiftState).toContain('shift_d12')

    const switches = screen.getAllByRole('switch')
    // Click switch
    fireEvent.click(switches[0])

    const updatedShiftState = useScheduleStore.getState().getActiveShiftIds('2026-10')
    expect(updatedShiftState).not.toContain('shift_d12')
  })

  it('deve restaurar os padrões do mês ao clicar no botão "Restaurar Padrões do Mês"', () => {
    // Set custom non-default state for month
    useScheduleStore.setState({
      monthActiveRules: { '2026-10': [] },
      monthActiveShifts: { '2026-10': [] },
    })

    expect(useScheduleStore.getState().getActiveRuleIds('2026-10')).toHaveLength(0)
    expect(useScheduleStore.getState().getActiveShiftIds('2026-10')).toHaveLength(0)

    renderSidebar()

    const restoreBtn = screen.getByRole('button', { name: /restaurar padrões do mês/i })
    fireEvent.click(restoreBtn)

    // Defaults restored
    expect(useScheduleStore.getState().getActiveRuleIds('2026-10').length).toBeGreaterThan(0)
    expect(useScheduleStore.getState().getActiveShiftIds('2026-10').length).toBeGreaterThan(0)
  })
})

