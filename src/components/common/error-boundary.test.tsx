import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ErrorBoundary } from './error-boundary'

function ProblematicChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Falha simulada no componente filho')
  }
  return <div>Conteúdo renderizado com sucesso</div>
}

describe('ErrorBoundary Component', () => {
  const originalError = console.error

  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('deve renderizar os filhos normalmente quando nenhum erro ocorrer', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Conteúdo renderizado com sucesso')).toBeInTheDocument()
  })

  it('deve renderizar a interface de erro padrão quando um filho lançar exceção', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Algo inesperado aconteceu')).toBeInTheDocument()
    expect(screen.getByText('Falha simulada no componente filho')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })

  it('deve permitir resetar o estado de erro através do botão de retry', () => {
    const handleReset = vi.fn()

    const { rerender } = render(
      <ErrorBoundary onReset={handleReset}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo inesperado aconteceu')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i })

    // Render with fixed child before clicking retry
    rerender(
      <ErrorBoundary onReset={handleReset}>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    fireEvent.click(retryButton)
    expect(handleReset).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Conteúdo renderizado com sucesso')).toBeInTheDocument()
  })

  it('deve suportar uma função customizada de fallback', () => {
    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <span>Custom: {error.message}</span>
            <button type="button" onClick={reset}>
              Recuperar
            </button>
          </div>
        )}
      >
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom: Falha simulada no componente filho')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recuperar' })).toBeInTheDocument()
  })
})
