import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ToastViewport } from './toast-viewport'
import { TOAST_DURATION_MS, useToastStore } from '../../store/use-toast-store'

describe('ToastViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve exibir toasts de sucesso como status e de erro como alerta', () => {
    render(<ToastViewport />)

    act(() => {
      useToastStore.getState().showToast('success', 'Escala salva.')
      useToastStore.getState().showToast('error', 'Falha na nuvem.')
    })

    expect(screen.getByRole('status')).toHaveTextContent('Escala salva.')
    expect(screen.getByRole('alert')).toHaveTextContent('Falha na nuvem.')
  })

  it('deve fechar o toast ao clicar no botão de fechar', () => {
    render(<ToastViewport />)
    act(() => {
      useToastStore.getState().showToast('success', 'Escala salva.')
    })

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))

    expect(screen.queryByText('Escala salva.')).not.toBeInTheDocument()
  })

  it('deve remover o toast automaticamente após o tempo limite', () => {
    render(<ToastViewport />)
    act(() => {
      useToastStore.getState().showToast('error', 'Falha na nuvem.')
    })

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS)
    })

    expect(screen.queryByText('Falha na nuvem.')).not.toBeInTheDocument()
  })

  it('deve manter no máximo três toasts visíveis', () => {
    render(<ToastViewport />)
    act(() => {
      ;['1', '2', '3', '4'].forEach((n) => useToastStore.getState().showToast('info', `Aviso ${n}`))
    })

    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3)
  })
})
