import { AlertTriangle, RefreshCw } from 'lucide-react'
import React, { Component, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // In React 19, caught errors are reported cleanly to error boundaries
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo)
  }

  private handleReset = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(
          this.state.error ?? new Error('Erro desconhecido'),
          this.handleReset,
        )
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[320px] w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 my-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Algo inesperado aconteceu
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
            Ocorreu um erro inesperado ao renderizar esta seção da aplicação.
            Seus dados locais permanecem salvos em segurança.
          </p>

          {this.state.error && (
            <pre className="text-xs bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 max-w-lg overflow-x-auto mb-6 text-left w-full font-mono">
              {this.state.error.message}
            </pre>
          )}

          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

