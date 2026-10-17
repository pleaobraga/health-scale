import React, { useState, useRef, useEffect } from 'react';
import { Person } from '../../types';
import { Plus, Check, AlertCircle } from 'lucide-react';

interface CandidatePickerProps {
  dateStr: string;
  dayNumber: number;
  month: string;
  assignedPersonIds: string[];
  allPersons: Person[];
  isPersonAvailable: (personId: string, dayNumber: number) => boolean;
  onSelectPerson: (personId: string) => void;
}

export const CandidatePicker: React.FC<CandidatePickerProps> = ({
  dayNumber,
  assignedPersonIds,
  allPersons,
  isPersonAvailable,
  onSelectPerson,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableCandidates = allPersons.filter(
    (p) => !assignedPersonIds.includes(p.id)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (availableCandidates.length === 0) return null;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Adicionar pessoa a este dia"
        className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
      >
        <Plus className="w-3 h-3 text-slate-600 dark:text-slate-400" />
        <span>Adicionar</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1 z-30 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-fadeIn">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
            Escalar pessoa
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {availableCandidates.map((person) => {
              const available = isPersonAvailable(person.id, dayNumber);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    onSelectPerson(person.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: person.color }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{person.name}</span>
                  </div>
                  {available ? (
                    <span title="Marcou disponibilidade" className="text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span
                      title="Não marcou disponibilidade para esta data"
                      className="text-amber-500 dark:text-amber-400 shrink-0"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
