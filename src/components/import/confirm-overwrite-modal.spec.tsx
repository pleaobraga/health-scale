import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ConfirmOverwriteModal } from './confirm-overwrite-modal'

describe('ConfirmOverwriteModal Component', () => {
  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <ConfirmOverwriteModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve exibir mensagem de perigo sobre a sobrescrita irreversível de dados', () => {
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

  it('deve chamar onConfirm ao clicar no botão destrutivo', () => {
    const onConfirmMock = vi.fn()
    render(
      <ConfirmOverwriteModal isOpen={true} onConfirm={onConfirmMock} onCancel={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: /sim, sobrescrever dados/i }))
    expect(onConfirmMock).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onCancel ao clicar em Cancelar ou no botão de fechar', () => {
    const onCancelMock = vi.fn()
    render(
      <ConfirmOverwriteModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancelMock} />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancelMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onCancelMock).toHaveBeenCalledTimes(2)
  })

  it('deve desabilitar botões quando estiver restaurando', () => {
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

