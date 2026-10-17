import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOverwriteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring?: boolean;
}

export const ConfirmOverwriteModal: React.FC<ConfirmOverwriteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isRestoring = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="overwrite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={isRestoring}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800/80">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 id="overwrite-modal-title" className="text-lg font-bold leading-snug">
              Atenção: Sobrescrita de Dados
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Atenção: A aplicação já contém dados cadastrados. Esta importação irá{' '}
              <strong className="text-red-600 dark:text-red-400 font-bold">SOBRESCREVER</strong> todos
              os profissionais, escalas e eventos atuais de forma irreversível. Deseja continuar?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRestoring}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRestoring}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRestoring ? 'Restaurando...' : 'Sim, Sobrescrever Dados'}
          </button>
        </div>
      </div>
    </div>
  );
};

