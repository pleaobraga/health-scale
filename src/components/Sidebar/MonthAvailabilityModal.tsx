import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Person } from '../../types';
import { formatMonthYear } from '../../utils/dateUtils';
import { AvailabilityMiniCalendar } from './AvailabilityMiniCalendar';
import { Calendar, X } from 'lucide-react';

interface MonthAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  currentMonth: string;
  initialAvailableDays: number[];
  onSave: (personId: string, availableDays: number[]) => void;
}

export const MonthAvailabilityModal: React.FC<MonthAvailabilityModalProps> = ({
  isOpen,
  onClose,
  person,
  currentMonth,
  initialAvailableDays,
  onSave,
}) => {
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  useEffect(() => {
    if (person && isOpen) {
      setAvailableDays(initialAvailableDays);
    }
  }, [person, initialAvailableDays, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !person) return null;

  const handleSave = () => {
    onSave(person.id, availableDays);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="month-avail-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: person.color }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3
                id="month-avail-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[240px]"
              >
                Disponibilidade do Mês
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {person.name} • {formatMonthYear(currentMonth)}
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

        {/* Body with mini-calendar */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Marque os dias em que <strong>{person.name}</strong> está disponível para assumir plantões neste mês.
            </span>
          </div>

          <AvailabilityMiniCalendar
            month={currentMonth}
            selectedDays={availableDays}
            onChange={setAvailableDays}
            accentColor={person.color}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {availableDays.length} {availableDays.length === 1 ? 'dia marcado' : 'dias marcados'}
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
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition"
            >
              Salvar Disponibilidade
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
