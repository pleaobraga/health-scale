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

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Conteúdo renderizado com sucesso')).toBeInTheDocument()
  })

  it('renders the default error screen when a child throws', () => {
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

  it('resets the error state with the retry button', () => {
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

  it('supports a custom fallback render function', () => {
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
