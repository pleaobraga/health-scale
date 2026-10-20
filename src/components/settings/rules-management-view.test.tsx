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

describe('RulesManagementView Component', () => {
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

  it('deve renderizar a listagem de regras cadastradas', () => {
    renderRulesView()

    expect(screen.getByTestId('rules-management-view')).toBeInTheDocument()
    expect(screen.getByText('Máximo 1 turno por dia')).toBeInTheDocument()
    expect(screen.getByText(/Evita sobrecarga/i)).toBeInTheDocument()
  })

  it('deve abrir o modal para criação de nova regra', () => {
    renderRulesView()

    const newBtn = screen.getByRole('button', { name: /nova regra/i })
    fireEvent.click(newBtn)

    expect(screen.getByRole('heading', { name: /nova regra/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ex: Limite Semanal de Plantões/i)).toBeInTheDocument()
  })

  it('deve permitir cadastrar uma nova regra com sucesso', () => {
    renderRulesView()

    fireEvent.click(screen.getByRole('button', { name: /nova regra/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Limite Semanal de Plantões/i), {
      target: { value: 'Máximo 2 turnos por semana' },
    })

    fireEvent.click(screen.getByRole('button', { name: /criar regra/i }))

    expect(screen.getByText('Máximo 2 turnos por semana')).toBeInTheDocument()
  })

  it('deve permitir duplicar uma regra existente', () => {
    renderRulesView()

    const duplicateBtn = screen.getByTitle(/duplicar/i)
    fireEvent.click(duplicateBtn)

    expect(screen.getByText(/Máximo 1 turno por dia \(Cópia\)/i)).toBeInTheDocument()
  })

  it('deve permitir excluir uma regra após confirmação', () => {
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

  it('deve exibir o banner explicativo de severidade e o critério de disparo da regra', () => {
    renderRulesView()

    // Banner explicativo
    expect(
      screen.getByText(/Como funcionam os critérios de validação e severidade/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Não representa um defeito ou erro no cadastro da regra/i)
    ).toBeInTheDocument()

    // Critério de disparo
    expect(
      screen.getByText(/Critério de Disparo \(Quando gera erro\):/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Dispara quando o mesmo profissional for escalado em mais de 1 plantão/i)
    ).toBeInTheDocument()

    // Impacto no mês ativo
    expect(screen.getByText(/Impacto na Escala Atual/i)).toBeInTheDocument()
  })
})

