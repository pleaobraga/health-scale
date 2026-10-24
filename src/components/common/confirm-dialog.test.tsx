import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './confirm-dialog'

const renderDialog = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog
      isOpen
      title="Clear month"
      description="Clear every shift of the month?"
      confirmLabel="Clear"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('renders a modal alertdialog with an accessible title and description', () => {
    renderDialog()

    const dialog = screen.getByRole('alertdialog', { name: 'Clear month' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Clear every shift of the month?')
    // Class that makes the modal full height on screens <= 640px
    expect(dialog).toHaveClass('modal-overlay')
  })

  it('renders nothing when closed', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm on confirm, and onCancel on cancel, close or Escape', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(3)
  })

  it('disables the actions while busy', () => {
    const { onCancel } = renderDialog({ isBusy: true })

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
