import React from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Save,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  const {
    validateCurrentSchedule,
    saveSchedule,
    validationErrors,
    hasValidated,
    isSaving,
    saveFeedback,
    dismissValidation,
  } = useScheduleStore();

  const errorsCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningsCount = validationErrors.filter((e) => e.severity === 'warning').length;

  const handleValidate = () => {
    validateCurrentSchedule();
  };

  const getRuleBadge = (rule: string) => {
    switch (rule) {
      case 'consecutive_days':
        return { label: 'Descanso Consecutivo', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'weekly_limit':
        return { label: 'Limite Semanal', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'multi_assigned':
        return { label: 'Conflito de Alocação', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'empty_day':
        return { label: 'Dia Vazio', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'not_available':
        return { label: 'Indisponibilidade', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return { label: 'Auditoria', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Operational Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Operação & Auditoria da Escala
            </h3>
            <p className="text-xs text-slate-500">
              Valide as regras de descanso e limites semanais antes de publicar.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleValidate}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl transition shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Validar Escala</span>
          </button>

          <button
            type="button"
            onClick={saveSchedule}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-xl transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        </div>
      )}

      {/* Log / Error Panel (Displayed on demand after validation or save) */}
      {hasValidated && (
        <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-xs animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800">
                Resultado da Auditoria de Regras
              </h4>
              <span className="text-xs text-slate-500">
                ({errorsCount} {errorsCount === 1 ? 'erro crítico' : 'erros críticos'}, {warningsCount} {warningsCount === 1 ? 'aviso' : 'avisos'})
              </span>
            </div>

            <button
              type="button"
              onClick={dismissValidation}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recolher painel
            </button>
          </div>

          {/* All Good State */}
          {validationErrors.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">Escala 100% Conforme!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Nenhuma infração de descanso consecutivo, limite semanal ou divergência de disponibilidade foi encontrada.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {validationErrors.map((err) => {
                const badge = getRuleBadge(err.rule);
                const isCritical = err.severity === 'error';

                return (
                  <div
                    key={err.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      isCritical
                        ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                        : 'bg-amber-50/40 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCritical ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isCritical ? 'BLOQUEANTE' : 'AVISO'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800">
                        {err.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

