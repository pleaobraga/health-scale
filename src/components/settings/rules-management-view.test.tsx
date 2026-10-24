import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { RulesManagementView } from './rules-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

const renderRulesView = () => {
  return render(
    <MemoryRouter>
      <RulesManagementView />
    </MemoryRouter>
  )
}

describe('RulesManagementView', () => {
  beforeEach(() => {
    localStorage.clear()
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      shiftRules: [
        {
          id: 'rule_max_1_day',
          name: 'Máximo 1 turno por dia',
          description: 'Evita sobrecarga e duplicação no mesmo dia civil',
          type: 'MAX_SHIFTS_PER_PERIOD',
          enabledByDefault: true,
          severity: 'ERROR',
          parameters: {
            scope: 'DAY',
            maxOccurrences: 1,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('lists the registered rules', () => {
    renderRulesView()

    expect(screen.getByTestId('rules-management-view')).toBeInTheDocument()
    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()
    expect(screen.getByText(/Evita sobrecarga/i)).toBeInTheDocument()
  })

  it('creates a new rule from the modal', () => {
    renderRulesView()

    fireEvent.click(screen.getByRole('button', { name: /nova regra/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Limite Semanal de Plantões/i), {
      target: { value: 'Máximo 2 turnos por semana' },
    })

    fireEvent.click(screen.getByRole('button', { name: /criar regra/i }))

    expect(screen.getByText('Máximo 2 turnos por semana')).toBeInTheDocument()
  })

  it('creates a max people per shift rule', () => {
    renderRulesView()

    fireEvent.click(screen.getByRole('button', { name: /nova regra/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Limite Semanal de Plantões/i), {
      target: { value: 'Máximo 2 pessoas no turno' },
    })

    // Select MAX_PEOPLE_PER_SHIFT
    const comboboxes = screen.getAllByRole('combobox')
    fireEvent.change(comboboxes[0], { target: { value: 'MAX_PEOPLE_PER_SHIFT' } })

    // Set maxPeople to 2
    const maxPeopleInput = screen.getByDisplayValue('1')
    fireEvent.change(maxPeopleInput, { target: { value: '2' } })

    fireEvent.click(screen.getByRole('button', { name: /criar regra/i }))

    expect(screen.getByText('Máximo 2 pessoas no turno')).toBeInTheDocument()
    expect(
      screen.getByText(/Dispara quando houver mais de 2 profissional\(is\) trabalhando simultaneamente no mesmo turno/i)
    ).toBeInTheDocument()
  })

  it('creates a weekend daily shift hours rule', () => {
    renderRulesView()

    fireEvent.click(screen.getByRole('button', { name: /nova regra/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Limite Semanal de Plantões/i), {
      target: { value: 'Plantão fim de semana 12h' },
    })

    const comboboxes = screen.getAllByRole('combobox')
    // Select DAILY_SHIFT_HOURS
    fireEvent.change(comboboxes[0], { target: { value: 'DAILY_SHIFT_HOURS' } })

    // Set targetDailyHours to 12
    const targetHoursInput = screen.getByDisplayValue('24')
    fireEvent.change(targetHoursInput, { target: { value: '12' } })

    // Select comparison: MAX
    const comparisonSelect = screen.getByDisplayValue(/Exatamente X horas/i)
    fireEvent.change(comparisonSelect, { target: { value: 'MAX' } })

    // Select dayFilterType: WEEKENDS
    const filterSelect = screen.getByDisplayValue(/Todos os dias do mês/i)
    fireEvent.change(filterSelect, { target: { value: 'WEEKENDS' } })

    fireEvent.click(screen.getByRole('button', { name: /criar regra/i }))

    expect(screen.getByText('Plantão fim de semana 12h')).toBeInTheDocument()
    expect(
      screen.getByText(/Dispara quando a carga horária de plantão do dia ultrapassar 12h em finais de semana/i)
    ).toBeInTheDocument()
  })

  it('duplicates a rule', () => {
    renderRulesView()

    const duplicateBtn = screen.getByTitle(/duplicar/i)
    fireEvent.click(duplicateBtn)

    expect(screen.getByText(/Máximo 1 turno por dia \(Cópia\)/i)).toBeInTheDocument()
  })

  it('deletes a rule after confirmation', () => {
    renderRulesView()

    const deleteBtn = screen.getByTitle(/excluir/i)
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/deseja realmente excluir esta regra/i)).toBeInTheDocument()

    // Confirm delete in modal
    const confirmButtons = screen.getAllByRole('button', { name: /excluir/i })
    const confirmBtn = confirmButtons[confirmButtons.length - 1]
    fireEvent.click(confirmBtn)

    expect(screen.queryByText('Máximo 1 turno por dia')).not.toBeInTheDocument()
  })

  it('shows the severity banner and the rule trigger criteria', () => {
    renderRulesView()

    // Severity banner
    expect(
      screen.getByText(/Como funcionam os critérios de validação e severidade/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Não representa um defeito ou erro no cadastro da regra/i)
    ).toBeInTheDocument()

    // Trigger criteria
    expect(
      screen.getByText(/Critério de Disparo \(Quando gera erro\):/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Dispara quando o mesmo profissional for escalado em mais de 1 plantão/i)
    ).toBeInTheDocument()

    // The active month impact is not shown
    expect(screen.queryByText(/Impacto na Escala Atual/i)).not.toBeInTheDocument()
  })

  it('filters the rules with the search', () => {
    renderRulesView()

    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/buscar regras/i)
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } })

    expect(screen.queryByText('Máximo 1 turno por dia')).not.toBeInTheDocument()
    expect(screen.getByText(/nenhuma regra encontrada/i)).toBeInTheDocument()
  })

  it('renders a drag handle to reorder the rules', () => {
    renderRulesView()

    expect(screen.getByTestId('drag-handle-rule_max_1_day')).toHaveAccessibleName(
      'Arrastar para reordenar Máximo 1 turno por dia',
    )
  })
})
