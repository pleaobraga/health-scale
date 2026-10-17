import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Person } from '../../types';
import { formatMonthYear } from '../../utils/dateUtils';
import { UserPlus, Check, X, Users, CheckSquare, Square, Search } from 'lucide-react';

interface AddMonthParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  allPersons: Person[];
  currentParticipantIds: string[];
  onAddParticipants: (personIds: string[]) => void;
  onGoToGlobalManagement?: () => void;
}

export const AddMonthParticipantsModal: React.FC<AddMonthParticipantsModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  allPersons,
  currentParticipantIds,
  onAddParticipants,
  onGoToGlobalManagement,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  // Eligible persons are global persons NOT yet in this month
  const eligiblePersons = allPersons.filter(
    (p) => !currentParticipantIds.includes(p.id)
  );

  const filteredEligible = eligiblePersons.filter((p) =>
    p.name.toLowerCase().includes(modalSearch.toLowerCase().trim())
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setModalSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === eligiblePersons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligiblePersons.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onAddParticipants(selectedIds);
      onClose();
    }
  };

  const monthFormatted = formatMonthYear(currentMonth);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-month-participants-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="add-month-participants-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  Vincular Pessoas ao Mês
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                  {eligiblePersons.length} {eligiblePersons.length === 1 ? 'disponível' : 'disponíveis'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                Escala de {monthFormatted}
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
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {eligiblePersons.length === 0 ? (
            <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {allPersons.length === 0
                  ? 'Nenhum funcionário cadastrado globalmente'
                  : 'Todos os funcionários já estão vinculados a este mês!'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {allPersons.length === 0
                  ? 'Cadastre primeiro os profissionais no menu "Gerenciar Pessoas" para poder escalá-los na escala mensal.'
                  : 'Todos os profissionais cadastrados no sistema já participam da escala deste mês.'}
              </p>
              {onGoToGlobalManagement && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToGlobalManagement();
                  }}
                  className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition"
                >
                  Ir para Gerenciar Pessoas
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Toolbar: Search input + Select all toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  {modalSearch && (
                    <button
                      type="button"
                      onClick={() => setModalSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 shrink-0 select-none"
                >
                  {selectedIds.length === eligiblePersons.length ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      <span>Desmarcar Todos</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Selecionar Todos ({eligiblePersons.length})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Employee Selection: 2-column responsive grid */}
              {filteredEligible.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Nenhum funcionário encontrado para &quot;{modalSearch}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredEligible.map((person) => {
                    const isChecked = selectedIds.includes(person.id);
                    return (
                      <div
                        key={person.id}
                        onClick={() => toggleSelect(person.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50/70 dark:hover:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                            style={{ backgroundColor: person.color }}
                          >
                            {person.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {person.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: person.color }}
                              />
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                {person.color.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ml-2 ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            <strong>{selectedIds.length}</strong> de {eligiblePersons.length} selecionados
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition shadow-xs ${
                selectedIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer'
                  : 'bg-indigo-300 dark:bg-indigo-900/60 cursor-not-allowed'
              }`}
            >
              Adicionar Selecionados {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

