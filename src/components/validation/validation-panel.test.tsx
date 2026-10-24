import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { ValidationPanel } from './validation-panel'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('ValidationPanel Component', () => {
  beforeEach(() => {
    localStorage.clear()
    const store = useScheduleStore.getState()
    store.dismissValidation()
  })

  it('deve renderizar os botões principais de Validar Escala e Salvar', () => {
    render(<ValidationPanel />)

    expect(screen.getByRole('button', { name: /Validar Escala/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument()
  })

  it('deve exibir painel de auditoria com estado 100% conforme quando não há erros', () => {
    // Simulates error-free state in store
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [],
    })

    render(<ValidationPanel />)

    expect(screen.getByText('Escala 100% Conforme!')).toBeInTheDocument()
    expect(screen.getByText(/Nenhuma infração de descanso consecutivo/i)).toBeInTheDocument()
  })

  it('deve listar erros e avisos detalhados após a validação', () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [
        {
          id: 'err-1',
          rule: 'consecutive_days',
          severity: 'error',
          date: '2026-10-02',
          message: 'Descanso violado: Dra. Camila foi escalada em dias seguidos.',
        },
        {
          id: 'warn-1',
          rule: 'empty_day',
          severity: 'warning',
          date: '2026-10-20',
          message: 'Dia sem responsável: o dia 20/10/2026 está sem ninguém escalado.',
        },
      ],
    })

    render(<ValidationPanel />)

    expect(screen.getByText(/Descanso Consecutivo/i)).toBeInTheDocument()
    expect(screen.getByText('BLOQUEANTE')).toBeInTheDocument()
    expect(screen.getByText(/Descanso violado: Dra. Camila/i)).toBeInTheDocument()

    expect(screen.getByText(/Dia Vazio/i)).toBeInTheDocument()
    expect(screen.getByText('AVISO')).toBeInTheDocument()
  })

  it('deve acionar saveSchedule ao clicar no botão Salvar', () => {
    render(<ValidationPanel />)

    const saveBtn = screen.getByRole('button', { name: /Salvar/i })
    fireEvent.click(saveBtn)

    // Should display save feedback
    expect(useScheduleStore.getState().hasValidated).toBe(true)
  })

  it('deve recolher e expandir o conteúdo do painel sem limpar a validação da store', () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [],
    })

    render(<ValidationPanel />)

    expect(screen.getByText('Escala 100% Conforme!')).toBeInTheDocument()

    // Click Recolher painel
    const collapseBtn = screen.getByRole('button', { name: /Recolher painel/i })
    fireEvent.click(collapseBtn)

    // Audit content is hidden
    expect(screen.queryByText('Escala 100% Conforme!')).not.toBeInTheDocument()
    // Store validation state remains active!
    expect(useScheduleStore.getState().hasValidated).toBe(true)

    // Click Expandir painel
    const expandBtn = screen.getByRole('button', { name: /Expandir painel/i })
    fireEvent.click(expandBtn)

    // Audit content is visible again
    expect(screen.getByText('Escala 100% Conforme!')).toBeInTheDocument()
  })

  it('deve ocultar a validação e limpar o estado da store ao clicar no botão Ocultar validação', () => {
    useScheduleStore.setState({
      hasValidated: true,
      validationErrors: [],
    })

    render(<ValidationPanel />)

    const hideBtn = screen.getByRole('button', { name: /Ocultar validação/i })
    fireEvent.click(hideBtn)

    // Store validation state is cleared
    expect(useScheduleStore.getState().hasValidated).toBe(false)
    expect(useScheduleStore.getState().validationErrors).toEqual([])
    expect(screen.queryByText('Escala 100% Conforme!')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ocultar validação/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Recolher painel/i })).not.toBeInTheDocument()
  })

  it('deve ficar oculto em telas pequenas (<= 640px)', () => {
    render(<ValidationPanel />)

    expect(screen.getByRole('region', { name: /Operação & Auditoria da Escala/i })).toHaveClass('mobile:hidden')
  })
})
