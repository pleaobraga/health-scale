import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ConfirmOverwriteModal } from './confirm-overwrite-modal'

describe('ConfirmOverwriteModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmOverwriteModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('warns that overwriting the data cannot be undone', () => {
    render(<ConfirmOverwriteModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Atenção: Sobrescrita de Dados/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Esta importação irá/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sim, sobrescrever dados/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('calls onConfirm from the destructive button', () => {
    const onConfirmMock = vi.fn()
    render(
      <ConfirmOverwriteModal isOpen={true} onConfirm={onConfirmMock} onCancel={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: /sim, sobrescrever dados/i }))
    expect(onConfirmMock).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel from Cancelar and from the close button', () => {
    const onCancelMock = vi.fn()
    render(
      <ConfirmOverwriteModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancelMock} />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancelMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onCancelMock).toHaveBeenCalledTimes(2)
  })

  it('disables the buttons while restoring', () => {
    render(
      <ConfirmOverwriteModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isRestoring={true}
      />
    )

    expect(screen.getByRole('button', { name: /restaurando\.\.\./i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
  })
})

