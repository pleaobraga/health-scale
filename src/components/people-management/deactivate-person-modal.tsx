import { AlertTriangle, UserX, X, ShieldAlert } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import type { Person } from '../../types'

export interface DeactivatePersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeactivatePersonModal({
  isOpen,
  person,
  onClose,
  onConfirm,
}: DeactivatePersonModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !person) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3
                id="deactivate-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                Histórico em Escala Detectado
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Proteção de integridade referencial ativa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Fechar (ESC)"
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              Este profissional já possui histórico em escalas e não pode ser excluído permanentemente para não quebrar os registros. Você deseja desativá-lo?
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              O que acontece ao desativar {person.name}:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                O histórico nos calendários passados e atuais permanece intacto com o nome e a cor do profissional.
              </li>
              <li>
                O profissional <strong>não aparecerá</strong> na lista de novos candidatos para vinculação a meses futuros.
              </li>
              <li>
                O status pode ser <strong>reativado a qualquer momento</strong> pelo Cadastro Geral.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition shadow-xs"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Sim, Desativar Profissional</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
};

