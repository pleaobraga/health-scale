import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './confirm-dialog'

const renderDialog = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog
      isOpen
      title="Limpar Mês"
      description="Deseja realmente limpar todas as escalas?"
      confirmLabel="Limpar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('deve renderizar como alertdialog modal com título e descrição acessíveis', () => {
    renderDialog()

    const dialog = screen.getByRole('alertdialog', { name: 'Limpar Mês' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Deseja realmente limpar todas as escalas?')
    // Classe que aplica 100% de altura em telas <= 640px
    expect(dialog).toHaveClass('modal-overlay')
  })

  it('não deve renderizar nada quando estiver fechado', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('deve chamar onConfirm ao confirmar e onCancel ao cancelar, fechar ou pressionar ESC', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(3)
  })

  it('deve desabilitar as ações enquanto estiver ocupado', () => {
    const { onCancel } = renderDialog({ isBusy: true })

    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
