import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { StorageService } from '../services/storageService';

export const Header: React.FC = () => {
  const handleResetData = () => {
    if (confirm('Deseja restaurar os dados de exemplo originais? Todas as alterações salvas serão resetadas.')) {
      StorageService.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Gerenciador de Escalas Mensais
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Local-First
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestão inteligente de plantões com validação contínua de regras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetData}
            title="Restaurar dados de exemplo iniciais"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Restaurar Exemplo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

